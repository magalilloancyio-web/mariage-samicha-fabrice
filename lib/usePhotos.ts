"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PhotosResponse } from "./types";

/** Polls the photo list (new photos appear within a few seconds). */
export function usePhotos(guestId: string | null | undefined, intervalMs = 8000) {
  const [data, setData] = useState<PhotosResponse | null>(null);
  const [error, setError] = useState(false);
  const guestRef = useRef(guestId);
  guestRef.current = guestId;

  const refresh = useCallback(async () => {
    try {
      const q = guestRef.current ? `?guest=${guestRef.current}` : "";
      const res = await fetch(`/api/photos${q}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (guestId === undefined) return; // guest not loaded yet
    void refresh();
    const t = setInterval(() => document.visibilityState === "visible" && void refresh(), intervalMs);
    const onVis = () => document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [guestId, intervalMs, refresh]);

  return { data, error, refresh };
}
