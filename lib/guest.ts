"use client";

export type Guest = { id: string; firstName: string; lastName: string };

const KEY = "mariage-sf-guest";

export function loadGuest(): Guest | null {
  try {
    const g = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return g?.id && g?.firstName ? (g as Guest) : null;
  } catch {
    return null;
  }
}

export function saveGuest(firstName: string, lastName: string): Guest {
  const existing = loadGuest();
  const g: Guest = { id: existing?.id ?? crypto.randomUUID(), firstName, lastName };
  try {
    localStorage.setItem(KEY, JSON.stringify(g));
  } catch {
    /* private mode: works for this visit only */
  }
  return g;
}

export function forgetGuest() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
