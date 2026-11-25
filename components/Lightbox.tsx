"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/types";
import { DeleteSheet } from "./DeleteSheet";

/** Plein écran : glisser à gauche/droite, télécharger ou enregistrer dans Photos. */
export function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
  onDelete,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
  /** Lets a guest delete their own photos. */
  onDelete?: (photo: Photo) => Promise<boolean>;
}) {
  const photo = photos[index];
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const go = useCallback((d: number) => {
    const n = index + d;
    if (n >= 0 && n < photos.length) onIndex(n);
  }, [index, photos.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  if (!photo) return null;

  async function save() {
    setSaving(true);
    try {
      const blob = await (await fetch(photo.url)).blob();
      const name = `mariage-samicha-fabrice-${photo.id.slice(0, 8)}.jpg`;
      const file = new File([blob], name, { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] }); // iPhone : « Enregistrer l'image »
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      }
    } catch {
      /* partage annulé */
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#1d140d]/97 text-white"
      role="dialog"
      aria-modal
      aria-label="Photo en plein écran"
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        else if (dy > 90) onClose();
        touch.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
        <button onClick={onClose} className="rounded-full p-2 text-white/90 active:bg-white/10" aria-label="Fermer">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <span className="text-sm text-white/60">{index + 1} / {photos.length}</span>
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm active:bg-white/20 disabled:opacity-50">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" /></svg>
          {saving ? "…" : "Enregistrer"}
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <img key={photo.id} src={photo.url} alt={`Photo de ${photo.author}`} className="max-h-full max-w-full object-contain" />
        {index > 0 && (
          <button onClick={() => go(-1)} className="absolute left-2 hidden rounded-full bg-black/30 p-3 sm:block" aria-label="Photo précédente">‹</button>
        )}
        {index < photos.length - 1 && (
          <button onClick={() => go(1)} className="absolute right-2 hidden rounded-full bg-black/30 p-3 sm:block" aria-label="Photo suivante">›</button>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">
        <p className="font-script text-3xl text-[#e8c9ae]">{photo.author}</p>
        {photo.mine && onDelete && (
          <button onClick={() => setConfirming(true)} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm active:bg-white/20">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13" /></svg>
            Supprimer
          </button>
        )}
      </div>

      {confirming && onDelete && (
        <DeleteSheet
          src={photo.thumbUrl}
          onCancel={() => setConfirming(false)}
          onConfirm={async () => {
            const ok = await onDelete(photo);
            if (ok) setConfirming(false);
            return ok;
          }}
        />
      )}
    </div>
  );
}
