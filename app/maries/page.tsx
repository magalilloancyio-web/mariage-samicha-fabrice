"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Divider } from "@/components/Ornaments";
import { Lightbox } from "@/components/Lightbox";
import { WEDDING } from "@/lib/config";
import { formatReveal, plural } from "@/lib/format";
import type { Mode, Photo } from "@/lib/types";

const PIN_KEY = "mariage-sf-pin";

/** ISO -> valeur pour <input type="datetime-local"> (heure locale du navigateur). */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MariesPage() {
  const [pin, setPin] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [backendKind, setBackendKind] = useState("");
  const [mode, setMode] = useState<Mode>("reveal");
  const [revealAt, setRevealAt] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const api = useCallback(
    (url: string, init: RequestInit = {}, p = pin) =>
      fetch(url, { ...init, headers: { "Content-Type": "application/json", "x-admin-pin": p ?? "", ...init.headers } }),
    [pin],
  );

  const load = useCallback(
    async (p: string) => {
      const res = await api("/api/admin/photos", {}, p);
      if (res.status === 401) return false;
      const data = await res.json();
      setPhotos(data.photos);
      setBackendKind(data.backend);
      return true;
    },
    [api],
  );

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => {
        setMode(s.mode);
        setRevealAt(toLocalInput(s.reveal_at));
      });
    const saved = sessionStorage.getItem(PIN_KEY);
    if (saved) load(saved).then((ok) => ok && setPin(saved));
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (await load(pinInput)) {
      sessionStorage.setItem(PIN_KEY, pinInput);
      setPin(pinInput);
    } else setPinError("Code incorrect");
  }

  async function saveSettings(nextMode = mode, nextReveal = revealAt) {
    const res = await api("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ mode: nextMode, reveal_at: nextReveal ? new Date(nextReveal).toISOString() : null }),
    });
    const s = await res.json();
    if (!res.ok) return setSavedMsg(s.error ?? "Erreur");
    setMode(s.mode);
    setRevealAt(toLocalInput(s.reveal_at));
    setSavedMsg(
      s.mode === "live"
        ? "Enregistré : les photos sont visibles en direct."
        : s.revealed
          ? "Enregistré : les photos sont révélées !"
          : `Enregistré : révélation ${s.reveal_at ? formatReveal(s.reveal_at) : "à définir"}.`,
    );
  }

  async function toggleHidden(p: Photo) {
    await api("/api/admin/photos", { method: "PATCH", body: JSON.stringify({ id: p.id, hidden: !p.hidden }) });
    setPhotos((list) => list?.map((x) => (x.id === p.id ? { ...x, hidden: !p.hidden } : x)) ?? null);
  }

  async function remove(p: Photo) {
    if (!confirm(`Supprimer définitivement cette photo de ${p.author} ?`)) return;
    await api(`/api/admin/photos?id=${p.id}`, { method: "DELETE" });
    setPhotos((list) => list?.filter((x) => x.id !== p.id) ?? null);
  }

  if (!pin) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 text-center">
        <h1 className="font-script text-5xl text-terra">Espace des mariés</h1>
        <Divider className="mt-3" />
        <form onSubmit={login} className="mt-8 space-y-3">
          <input
            className="field text-center tracking-[.4em]"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            placeholder="Code secret"
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError("");
            }}
          />
          {pinError && <p className="text-sm text-red-700">{pinError}</p>}
          <button className="btn-primary">Entrer</button>
        </form>
      </main>
    );
  }

  const guests = new Set(photos?.map((p) => p.author)).size;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="text-center">
        <h1 className="font-script text-5xl text-terra">Espace des mariés</h1>
        <p className="mt-1 font-serif text-lg text-brun/80">{WEDDING.title}</p>
        <Divider className="mt-3" />
        {backendKind === "local" && (
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-rose/20 px-4 py-2 text-sm">
            Mode démo : les photos sont stockées sur cet ordinateur (Supabase pas encore branché).
          </p>
        )}
      </header>

      {/* Statistiques */}
      <section className="mt-6 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl border border-sable bg-papier/70 p-4">
          <p className="font-serif text-4xl font-semibold text-terra">{photos?.length ?? "…"}</p>
          <p className="text-sm text-brun/70">photos</p>
        </div>
        <div className="rounded-2xl border border-sable bg-papier/70 p-4">
          <p className="font-serif text-4xl font-semibold text-terra">{photos ? guests : "…"}</p>
          <p className="text-sm text-brun/70">invités photographes</p>
        </div>
      </section>

      {/* Visibilité */}
      <section className="mt-6 rounded-3xl border border-sable bg-papier/70 p-5">
        <h2 className="font-serif text-2xl font-semibold text-terra-fonce">Quand les invités voient-ils les photos&nbsp;?</h2>
        <div className="mt-4 space-y-3">
          {(
            [
              ["live", "En direct", "Chaque photo apparaît aussitôt dans la galerie de tous."],
              ["reveal", "Révélation surprise", "Comme un appareil jetable : tout est dévoilé au moment choisi. Avant, chacun ne voit que ses propres photos."],
            ] as const
          ).map(([value, title, desc]) => (
            <label
              key={value}
              className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${mode === value ? "border-terra bg-creme" : "border-sable"}`}
            >
              <input type="radio" name="mode" className="mt-1 size-5 accent-terra" checked={mode === value} onChange={() => setMode(value)} />
              <span>
                <span className="block font-medium">{title}</span>
                <span className="text-sm text-brun/70">{desc}</span>
              </span>
            </label>
          ))}
        </div>
        {mode === "reveal" && (
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium">Date et heure de la révélation</span>
            <input type="datetime-local" className="field" value={revealAt} onChange={(e) => setRevealAt(e.target.value)} />
          </label>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button className="btn-primary" onClick={() => saveSettings()}>
            Enregistrer
          </button>
          {mode === "reveal" && (
            <button
              className="btn-secondary"
              onClick={() => confirm("Révéler toutes les photos maintenant ?") && saveSettings("reveal", toLocalInput(new Date().toISOString()))}
            >
              Révéler maintenant ✨
            </button>
          )}
        </div>
        {savedMsg && <p className="mt-3 text-sm font-medium text-terra">{savedMsg}</p>}
      </section>

      {/* Liens utiles */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/qr" target="_blank" className="btn-secondary">
          QR code à imprimer
        </Link>
        <Link href="/diaporama" target="_blank" className="btn-secondary">
          Lancer le diaporama
        </Link>
      </section>

      {/* Modération */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold text-terra-fonce">Toutes les photos</h2>
        <p className="text-sm text-brun/70">Masquez une photo pour la retirer de la galerie et du diaporama (réversible), ou supprimez-la.</p>
        {photos && photos.length === 0 && <p className="mt-6 text-center text-brun/60">Aucune photo pour l&apos;instant.</p>}
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos?.map((p, i) => (
            <li key={p.id} className={`overflow-hidden rounded-2xl border border-sable bg-papier ${p.hidden ? "opacity-50" : ""}`}>
              <button onClick={() => setOpen(i)} className="block aspect-square w-full bg-sable/40">
                <img src={p.thumbUrl} alt="" loading="lazy" className="size-full object-cover" />
              </button>
              <div className="p-2 text-sm">
                <p className="truncate font-medium">{p.author}</p>
                <p className="text-xs text-brun/60">
                  {new Date(p.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: WEDDING.timeZone })}
                </p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => toggleHidden(p)} className="flex-1 rounded-full border border-sable py-1.5 text-xs">
                    {p.hidden ? "Afficher" : "Masquer"}
                  </button>
                  <button onClick={() => remove(p)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-700">
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {photos && photos.length > 0 && (
          <p className="mt-4 text-center text-sm text-brun/60">{plural(photos.length, "photo", "photos")} au total</p>
        )}
      </section>

      {open !== null && photos && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </main>
  );
}
