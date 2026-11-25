import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { backend, LOCAL_DIR } from "@/lib/backend";

/** File storage for the local demo mode only (disabled when Supabase is configured). */
export const dynamic = "force-dynamic";

const SAFE = /^[0-9a-f-]{36}\/[0-9a-f-]{36}(_thumb)?\.jpg$/i;

function resolve(parts: string[]) {
  const rel = parts.join("/");
  if (backend().kind !== "local" || !SAFE.test(rel)) return null;
  return path.join(LOCAL_DIR, "files", rel);
}

export async function PUT(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const file = resolve((await ctx.params).path);
  if (!file) return NextResponse.json({ error: "Non autorisé" }, { status: 404 });
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(await req.arrayBuffer()));
  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const file = resolve((await ctx.params).path);
  if (!file) return new NextResponse("Not found", { status: 404 });
  try {
    const data = await fs.readFile(file);
    return new NextResponse(data, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
