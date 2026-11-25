import { NextResponse } from "next/server";
import { backend } from "@/lib/backend";
import { toPhoto } from "@/lib/serialize";
import { isRevealed, UUID_RE, type PhotosResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Lists photos. Before the reveal, a guest only gets their own photos:
 * the others are never sent to the browser.
 */
export async function GET(req: Request) {
  const guest = new URL(req.url).searchParams.get("guest");
  const guestId = guest && UUID_RE.test(guest) ? guest : null;

  const b = backend();
  const settings = await b.getSettings();
  const revealed = isRevealed(settings);

  const [rows, total] = await Promise.all([
    revealed ? b.listPhotos({}) : guestId ? b.listPhotos({ guestId }) : Promise.resolve([]),
    b.countPhotos({}),
  ]);
  const myCount = guestId ? rows.filter((r) => r.guest_id === guestId).length : 0;

  const res: PhotosResponse = {
    mode: settings.mode,
    revealAt: settings.reveal_at,
    revealed,
    total,
    myCount,
    photos: rows.map((r) => toPhoto(b, r, guestId)),
  };
  return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
}

/** Registers a photo once both files are uploaded. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const guestId = String(body?.guestId ?? "");
  const photoId = String(body?.photoId ?? "");
  const firstName = String(body?.firstName ?? "").trim().slice(0, 60);
  const lastName = String(body?.lastName ?? "").trim().slice(0, 60);
  const width = Number.isFinite(body?.width) ? Math.round(body.width) : null;
  const height = Number.isFinite(body?.height) ? Math.round(body.height) : null;

  if (!UUID_RE.test(guestId) || !UUID_RE.test(photoId) || !firstName) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  await backend().insertPhoto({
    id: photoId,
    guest_id: guestId,
    first_name: firstName,
    last_name: lastName,
    path: `${guestId}/${photoId}.jpg`,
    thumb_path: `${guestId}/${photoId}_thumb.jpg`,
    width,
    height,
  });
  return NextResponse.json({ ok: true });
}
