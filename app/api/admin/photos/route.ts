import { NextResponse } from "next/server";
import { backend, isAdmin } from "@/lib/backend";
import { toPhoto } from "@/lib/serialize";

export const dynamic = "force-dynamic";

const denied = () => NextResponse.json({ error: "Code incorrect" }, { status: 401 });

/** All photos, hidden ones included. Also used to check the PIN. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return denied();
  const b = backend();
  const rows = await b.listPhotos({ includeHidden: true });
  return NextResponse.json({
    backend: b.kind,
    photos: rows.map((r) => ({ ...toPhoto(b, r), hidden: r.hidden })),
  });
}

export async function PATCH(req: Request) {
  if (!isAdmin(req)) return denied();
  const body = await req.json().catch(() => null);
  if (typeof body?.id !== "string" || typeof body?.hidden !== "boolean") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  await backend().setHidden(body.id, body.hidden);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return denied();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  await backend().deletePhoto(id);
  return NextResponse.json({ ok: true });
}
