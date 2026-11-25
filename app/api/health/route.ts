import { NextResponse } from "next/server";
import { backend } from "@/lib/backend";

export const dynamic = "force-dynamic";

/** Says which kind of Supabase key is configured (never the key itself). */
function keyKind(key: string | undefined) {
  if (!key) return "absente";
  if (key.startsWith("sb_secret_")) return "secrète (ok)";
  if (key.startsWith("sb_publishable_")) return "publique (incorrecte)";
  try {
    const role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role;
    return role === "service_role" ? "service_role (ok)" : `${role} (incorrecte)`;
  } catch {
    return "illisible";
  }
}

export async function GET() {
  let database = "ok";
  try {
    await backend().countPhotos({});
  } catch {
    database = "erreur";
  }
  return NextResponse.json(
    { stockage: backend().kind, cle: keyKind(process.env.SUPABASE_SERVICE_ROLE_KEY), database, codeMaries: !!process.env.ADMIN_PIN },
    { headers: { "Cache-Control": "no-store" } },
  );
}
