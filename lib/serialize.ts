import "server-only";
import type { Backend } from "./backend";
import type { Photo, PhotoRow } from "./types";

export function toPhoto(b: Backend, r: PhotoRow, guestId?: string | null): Photo {
  return {
    id: r.id,
    url: b.publicUrl(r.path),
    thumbUrl: b.publicUrl(r.thumb_path),
    author: `${r.first_name} ${r.last_name}`.trim(),
    width: r.width,
    height: r.height,
    createdAt: r.created_at,
    mine: !!guestId && r.guest_id === guestId,
  };
}
