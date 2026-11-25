import { NextResponse } from "next/server";
import { backend } from "@/lib/backend";
import { LIMITS } from "@/lib/config";
import { UUID_RE } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Returns two upload targets (full photo + thumbnail) for a new photo. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const guestId = String(body?.guestId ?? "");
  if (!UUID_RE.test(guestId)) return NextResponse.json({ error: "Invité inconnu" }, { status: 400 });

  const b = backend();
  if ((await b.countPhotos({ guestId })) >= LIMITS.maxPhotosPerGuest) {
    return NextResponse.json({ error: "Nombre maximum de photos atteint 🙈" }, { status: 429 });
  }

  const photoId = crypto.randomUUID();
  const [full, thumb] = await Promise.all([
    b.uploadTarget(`${guestId}/${photoId}.jpg`),
    b.uploadTarget(`${guestId}/${photoId}_thumb.jpg`),
  ]);
  return NextResponse.json({ photoId, full, thumb });
}
