"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { Countdown } from "@/components/Countdown";
import { Lightbox } from "@/components/Lightbox";
import { Divider } from "@/components/Ornaments";
import { WEDDING } from "@/lib/config";
import { formatReveal, plural } from "@/lib/format";
import { useGuest } from "@/lib/useGuest";
import { usePhotos } from "@/lib/usePhotos";
import type { Photo } from "@/lib/types";

export default function GaleriePage() {
  const guest = useGuest();
  const { data, error, refresh } = usePhotos(guest === undefined ? undefined : guest?.id ?? null);
  const [open, setOpen] = useState<number | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);

  const photos: Photo[] = data ? (onlyMine ? data.photos.filter((p) => p.mine) : data.photos) : [];

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 pt-[max(env(safe-area-inset-top),20px)] pb-28">
      <header className="text-center">
        <Link href="/" className="font-script text-4xl text-terra">
          {WEDDING.title}
        </Link>
        <Divider className="mt-2" />
      </header>

      {!data && !error && <p className="mt-16 text-center text-brun/60">Chargement…</p>}
      {error && !data && (
        <p className="mt-16 text-center text-brun/70">
          Connexion impossible pour l&apos;instant.{" "}
          <button className="underline" onClick={refresh}>
            Réessayer
          </button>
        </p>
      )}

      {data && !data.revealed && (
        <section className="mt-6 text-center">
          <h1 className="font-serif text-3xl font-semibold text-terra-fonce">Patience…</h1>
          <p className="mx-auto mt-2 max-w-sm text-brun/80">
            Comme avec un appareil jetable, toutes les photos seront dévoilées ensemble
            {data.revealAt ? ` ${formatReveal(data.revealAt)}` : " très bientôt"}.
          </p>
          {data.revealAt && (
            <div className="mt-5">
              <Countdown to={data.revealAt} onDone={refresh} />
            </div>
          )}
          <p className="mt-5 font-serif text-xl text-terra">
            {plural(data.total, "photo déjà partagée", "photos déjà partagées")} par les invités
          </p>
          <h2 className="mt-8 text-left font-serif text-2xl font-semibold text-terra-fonce">Vos photos ({data.myCount})</h2>
          {data.myCount === 0 && (
            <p className="mt-2 text-left text-brun/70">
              Vous n&apos;avez encore rien partagé.{" "}
              <Link href="/photo" className="font-medium text-terra underline underline-offset-4">
                Prendre une photo
              </Link>
            </p>
          )}
        </section>
      )}

      {data?.revealed && (
        <section className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-serif text-2xl font-semibold text-terra-fonce">
              {plural(data.total, "photo", "photos")}
            </h1>
            <div className="flex rounded-full border border-sable bg-papier p-1 text-sm">
              {[
                [false, "Toutes"],
                [true, "Les miennes"],
              ].map(([v, label]) => (
                <button
                  key={String(v)}
                  onClick={() => setOnlyMine(v as boolean)}
                  className={`rounded-full px-3 py-1.5 ${onlyMine === v ? "bg-terra text-white" : "text-brun/70"}`}
                >
                  {label as string}
                </button>
              ))}
            </div>
          </div>
          {photos.length === 0 && (
            <p className="mt-10 text-center text-brun/70">
              Aucune photo pour l&apos;instant.{" "}
              <Link href="/photo" className="font-medium text-terra underline underline-offset-4">
                Soyez le premier !
              </Link>
            </p>
          )}
        </section>
      )}

      {photos.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {photos.map((p, i) => (
            <li key={p.id}>
              <button onClick={() => setOpen(i)} className="block aspect-square w-full overflow-hidden rounded-lg bg-sable/50">
                <img src={p.thumbUrl} alt={`Photo de ${p.author}`} loading="lazy" className="size-full object-cover transition-opacity" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
      <BottomNav />
    </main>
  );
}
