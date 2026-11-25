"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Guest } from "./guest";
import { preparePhoto, type Prepared } from "./image";
import { LIMITS } from "./config";

export type ItemStatus = "preparing" | "waiting" | "uploading" | "done" | "error";
export type UploadItem = {
  key: string;
  status: ItemStatus;
  progress: number; // 0..1
  preview?: string;
  error?: string;
  /** Will not be retried automatically. */
  fatal?: boolean;
  attempts: number;
  file: File;
  prepared?: Prepared;
};

const MAX_ATTEMPTS = 8;

function put(url: string, blob: Blob, headers: Record<string, string>, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "image/jpeg");
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Envoi refusé (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Connexion perdue"));
    xhr.ontimeout = () => reject(new Error("Connexion trop lente"));
    xhr.timeout = 120_000;
    xhr.send(blob);
  });
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? "Erreur serveur"), { fatal: res.status === 429 || res.status === 400 });
  return data;
}

/**
 * Upload queue: photos are prepared and sent one by one, with automatic retries
 * when the network drops (common in reception venues).
 */
export function useUploader(guest: Guest | null, onUploaded: () => void) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const itemsRef = useRef<UploadItem[]>([]);
  const running = useRef(false);
  const guestRef = useRef(guest);
  const onUploadedRef = useRef(onUploaded);
  guestRef.current = guest;
  onUploadedRef.current = onUploaded;

  const update = useCallback((key: string, patch: Partial<UploadItem>) => {
    itemsRef.current = itemsRef.current.map((it) => (it.key === key ? { ...it, ...patch } : it));
    setItems(itemsRef.current);
  }, []);

  const process = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      for (;;) {
        const g = guestRef.current;
        const next = itemsRef.current.find((it) => it.status === "waiting" || it.status === "preparing");
        if (!g || !next) break;
        const key = next.key;
        try {
          let prepared = next.prepared;
          if (!prepared) {
            update(key, { status: "preparing" });
            prepared = await preparePhoto(next.file);
            if (prepared.full.size > LIMITS.maxUploadBytes) throw Object.assign(new Error("Photo trop lourde"), { fatal: true });
            update(key, { prepared, preview: prepared.preview });
          }
          update(key, { status: "uploading", progress: 0.02 });
          const target = await postJson("/api/upload-url", { guestId: g.id });
          const total = prepared.full.size + prepared.thumb.size;
          await put(target.thumb.url, prepared.thumb, target.thumb.headers, (p) =>
            update(key, { progress: 0.02 + (0.9 * p * prepared!.thumb.size) / total }),
          );
          await put(target.full.url, prepared.full, target.full.headers, (p) =>
            update(key, { progress: 0.02 + (0.9 * (prepared!.thumb.size + p * prepared!.full.size)) / total }),
          );
          await postJson("/api/photos", {
            guestId: g.id,
            photoId: target.photoId,
            firstName: g.firstName,
            lastName: g.lastName,
            width: prepared.width,
            height: prepared.height,
          });
          update(key, { status: "done", progress: 1, prepared: undefined });
          onUploadedRef.current();
        } catch (e) {
          const err = e as Error & { fatal?: boolean };
          const attempts = next.attempts + 1;
          const giveUp = !!err.fatal || attempts >= MAX_ATTEMPTS || (!next.prepared && err.message.includes("Format"));
          update(key, { status: "error", error: err.message, attempts, fatal: giveUp });
          if (!giveUp) {
            // Retry later with a growing delay (2s, 4s, 8s… max 30s).
            const delay = Math.min(30_000, 2000 * 2 ** (attempts - 1));
            setTimeout(() => {
              update(key, { status: "waiting" });
              void process();
            }, delay);
          }
        }
      }
    } finally {
      running.current = false;
    }
  }, [update]);

  const add = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name));
      if (!list.length) return;
      const newItems: UploadItem[] = list.map((file) => ({
        key: crypto.randomUUID(),
        status: "waiting",
        progress: 0,
        attempts: 0,
        file,
      }));
      itemsRef.current = [...newItems.reverse(), ...itemsRef.current];
      setItems(itemsRef.current);
      void process();
    },
    [process],
  );

  const retry = useCallback(
    (key: string) => {
      update(key, { status: "waiting", attempts: 0, error: undefined, fatal: false });
      void process();
    },
    [process, update],
  );

  const pending = items.filter((it) => it.status !== "done" && !it.fatal).length;

  // Resume as soon as the network comes back.
  useEffect(() => {
    const onOnline = () => {
      itemsRef.current.filter((it) => it.status === "error" && !it.fatal).forEach((it) => update(it.key, { status: "waiting" }));
      void process();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [process, update]);

  // Warn before leaving the page while photos are still being sent.
  useEffect(() => {
    if (!pending) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [pending]);

  return { items, add, retry, pending };
}
