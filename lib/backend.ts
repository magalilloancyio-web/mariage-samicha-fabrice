import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { WEDDING } from "./config";
import type { PhotoRow, Settings } from "./types";

/**
 * Storage backend.
 * - Production: Supabase (Postgres table `photos` + `settings`, public bucket `photos`).
 * - Local demo: when Supabase env vars are missing, everything is stored in ./.data
 *   so the site can be tried without any account. Never used on Vercel.
 */

export type UploadTarget = { url: string; headers: Record<string, string> };

export interface Backend {
  kind: "supabase" | "local";
  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;
  listPhotos(opts: { includeHidden?: boolean; guestId?: string }): Promise<PhotoRow[]>;
  countPhotos(opts: { guestId?: string }): Promise<number>;
  insertPhoto(row: Omit<PhotoRow, "created_at" | "hidden">): Promise<void>;
  setHidden(id: string, hidden: boolean): Promise<void>;
  deletePhoto(id: string): Promise<void>;
  uploadTarget(objectPath: string): Promise<UploadTarget>;
  publicUrl(objectPath: string): string;
}

const BUCKET = "photos";
const DEFAULT_SETTINGS: Settings = { mode: "reveal", reveal_at: WEDDING.defaultRevealAt };

/* ----------------------------------------------------------------------------
 * Supabase
 * ------------------------------------------------------------------------- */

function supabaseBackend(url: string, serviceKey: string): Backend {
  const sb: SupabaseClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    kind: "supabase",
    async getSettings() {
      const { data, error } = await sb.from("settings").select("mode, reveal_at").eq("id", 1).maybeSingle();
      if (error) throw error;
      return (data as Settings) ?? DEFAULT_SETTINGS;
    },
    async saveSettings(s) {
      const { error } = await sb.from("settings").upsert({ id: 1, mode: s.mode, reveal_at: s.reveal_at });
      if (error) throw error;
    },
    async listPhotos({ includeHidden, guestId }) {
      // PostgREST returns at most 1000 rows per request: page through them.
      const PAGE = 1000;
      const out: PhotoRow[] = [];
      for (let from = 0; ; from += PAGE) {
        let q = sb.from("photos").select("*").order("created_at", { ascending: false });
        if (!includeHidden) q = q.eq("hidden", false);
        if (guestId) q = q.eq("guest_id", guestId);
        const { data, error } = await q.range(from, from + PAGE - 1);
        if (error) throw error;
        out.push(...(data as PhotoRow[]));
        if (data.length < PAGE) return out;
      }
    },
    async countPhotos({ guestId }) {
      let q = sb.from("photos").select("id", { count: "exact", head: true }).eq("hidden", false);
      if (guestId) q = q.eq("guest_id", guestId);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
    async insertPhoto(row) {
      const { error } = await sb.from("photos").insert(row);
      if (error) throw error;
    },
    async setHidden(id, hidden) {
      const { error } = await sb.from("photos").update({ hidden }).eq("id", id);
      if (error) throw error;
    },
    async deletePhoto(id) {
      const { data, error } = await sb.from("photos").select("path, thumb_path").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return;
      await sb.storage.from(BUCKET).remove([data.path, data.thumb_path]);
      const del = await sb.from("photos").delete().eq("id", id);
      if (del.error) throw del.error;
    },
    async uploadTarget(objectPath) {
      const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(objectPath);
      if (error) throw error;
      return { url: data.signedUrl, headers: { "x-upsert": "false" } };
    },
    publicUrl(objectPath) {
      return sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
    },
  };
}

/* ----------------------------------------------------------------------------
 * Local demo (files in ./.data)
 * ------------------------------------------------------------------------- */

export const LOCAL_DIR = path.join(process.cwd(), ".data");
const PHOTOS_JSON = path.join(LOCAL_DIR, "photos.json");
const SETTINGS_JSON = path.join(LOCAL_DIR, "settings.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2));
}

let localLock: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = localLock.then(fn, fn);
  localLock = run.catch(() => undefined);
  return run;
}

function localBackend(): Backend {
  const all = () => readJson<PhotoRow[]>(PHOTOS_JSON, []);
  return {
    kind: "local",
    getSettings: () => readJson<Settings>(SETTINGS_JSON, DEFAULT_SETTINGS),
    saveSettings: (s) => writeJson(SETTINGS_JSON, s),
    async listPhotos({ includeHidden, guestId }) {
      return (await all())
        .filter((p) => (includeHidden || !p.hidden) && (!guestId || p.guest_id === guestId))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async countPhotos({ guestId }) {
      return (await all()).filter((p) => !p.hidden && (!guestId || p.guest_id === guestId)).length;
    },
    insertPhoto: (row) =>
      withLock(async () => {
        const rows = await all();
        rows.push({ ...row, hidden: false, created_at: new Date().toISOString() });
        await writeJson(PHOTOS_JSON, rows);
      }),
    setHidden: (id, hidden) =>
      withLock(async () => {
        const rows = await all();
        await writeJson(PHOTOS_JSON, rows.map((p) => (p.id === id ? { ...p, hidden } : p)));
      }),
    deletePhoto: (id) =>
      withLock(async () => {
        const rows = await all();
        const row = rows.find((p) => p.id === id);
        if (!row) return;
        for (const f of [row.path, row.thumb_path]) {
          await fs.rm(path.join(LOCAL_DIR, "files", f), { force: true });
        }
        await writeJson(PHOTOS_JSON, rows.filter((p) => p.id !== id));
      }),
    async uploadTarget(objectPath) {
      return { url: `/api/local/${objectPath}`, headers: {} };
    },
    publicUrl(objectPath) {
      return `/api/local/${objectPath}`;
    },
  };
}

/* ------------------------------------------------------------------------- */

let cached: Backend | null = null;

export function backend(): Backend {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    cached = supabaseBackend(url, key);
  } else {
    if (process.env.VERCEL) {
      throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis sur Vercel.");
    }
    console.warn("[mariage] Supabase non configuré : mode démo local (.data/)");
    cached = localBackend();
  }
  return cached;
}

/** Admin PIN check. In local demo mode the PIN defaults to 0000. */
export function isAdmin(req: Request): boolean {
  const expected = process.env.ADMIN_PIN || (backend().kind === "local" ? "0000" : "");
  const given = req.headers.get("x-admin-pin") ?? "";
  if (!expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
