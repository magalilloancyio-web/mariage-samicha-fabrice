export type Mode = "live" | "reveal";

export type Settings = {
  mode: Mode;
  /** ISO date. Only used in "reveal" mode. */
  reveal_at: string | null;
};

export type PhotoRow = {
  id: string;
  guest_id: string;
  first_name: string;
  last_name: string;
  path: string;
  thumb_path: string;
  width: number | null;
  height: number | null;
  hidden: boolean;
  created_at: string;
};

/** What the browser receives. */
export type Photo = {
  id: string;
  url: string;
  thumbUrl: string;
  author: string;
  width: number | null;
  height: number | null;
  createdAt: string;
  mine: boolean;
  hidden?: boolean;
};

export type PhotosResponse = {
  mode: Mode;
  revealAt: string | null;
  revealed: boolean;
  /** Number of visible photos shared by everyone (shown as a teaser before the reveal). */
  total: number;
  myCount: number;
  photos: Photo[];
};

export function isRevealed(s: Settings, now = Date.now()): boolean {
  if (s.mode === "live") return true;
  return !!s.reveal_at && now >= new Date(s.reveal_at).getTime();
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
