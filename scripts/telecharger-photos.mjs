// Télécharge toutes les photos dans ./photos-mariage (classées par invité).
// Usage : SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/telecharger-photos.mjs
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const out = path.resolve("photos-mariage");
const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("photos").select("*").order("created_at").range(from, from + 999);
  if (error) throw error;
  rows.push(...data);
  if (data.length < 1000) break;
}
console.log(`${rows.length} photos à télécharger…`);
let i = 0;
for (const r of rows) {
  const who = `${r.first_name} ${r.last_name}`.trim().replace(/[\\/:*?"<>|]/g, "");
  const dir = path.join(out, who || "Anonyme");
  await mkdir(dir, { recursive: true });
  const { data, error } = await sb.storage.from("photos").download(r.path);
  if (error) { console.warn("échec", r.path, error.message); continue; }
  const stamp = r.created_at.replace(/[:T]/g, "-").slice(0, 19);
  await writeFile(path.join(dir, `${stamp}_${r.id.slice(0, 6)}.jpg`), Buffer.from(await data.arrayBuffer()));
  if (++i % 25 === 0) console.log(`${i}/${rows.length}`);
}
console.log(`Terminé : ${out}`);
