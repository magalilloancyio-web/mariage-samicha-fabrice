import { NextResponse } from "next/server";
import { backend, isAdmin } from "@/lib/backend";
import { isRevealed, type Settings } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await backend().getSettings();
  return NextResponse.json({ ...s, revealed: isRevealed(s) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const mode = body?.mode === "live" ? "live" : body?.mode === "reveal" ? "reveal" : null;
  const revealAt = body?.reveal_at ? new Date(body.reveal_at) : null;
  if (!mode || (revealAt && isNaN(revealAt.getTime()))) {
    return NextResponse.json({ error: "Réglages invalides" }, { status: 400 });
  }
  const s: Settings = { mode, reveal_at: revealAt ? revealAt.toISOString() : null };
  await backend().saveSettings(s);
  return NextResponse.json({ ...s, revealed: isRevealed(s) });
}
