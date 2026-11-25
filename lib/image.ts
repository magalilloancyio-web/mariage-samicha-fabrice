"use client";

import { LIMITS } from "./config";

export type Prepared = { full: Blob; thumb: Blob; width: number; height: number; preview: string };

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Format d'image non pris en charge"));
    img.src = URL.createObjectURL(file);
  });
}

function toJpeg(img: HTMLImageElement, max: number, quality: number) {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  // Browsers apply the EXIF orientation when drawing an <img>, so photos stay upright.
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<{ blob: Blob; w: number; h: number }>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve({ blob: b, w, h }) : reject(new Error("Compression impossible"))), "image/jpeg", quality),
  );
}

/** Resizes the photo (fast uploads on a weak network) and creates a thumbnail. */
export async function preparePhoto(file: File): Promise<Prepared> {
  const img = await loadImage(file);
  try {
    const full = await toJpeg(img, LIMITS.fullSize, 0.86);
    const thumb = await toJpeg(img, LIMITS.thumbSize, 0.78);
    return { full: full.blob, thumb: thumb.blob, width: full.w, height: full.h, preview: URL.createObjectURL(thumb.blob) };
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
