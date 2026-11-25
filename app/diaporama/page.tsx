"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Countdown } from "@/components/Countdown";
import { Divider, Flowers } from "@/components/Ornaments";
import { QrCode } from "@/components/QrCode";
import { WEDDING } from "@/lib/config";
import { formatReveal, plural } from "@/lib/format";
import { usePhotos } from "@/lib/usePhotos";
import type { Photo } from "@/lib/types";

const SLIDE_MS = 7000;

type Slide = { photo: Photo; fresh: boolean; n: number };

function preload(url: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = url;
  });
}

/** Diaporama pour écran / vidéoprojecteur : les nouvelles photos passent en priorité. */
export default function DiaporamaPage() {
  const { data, refresh } = usePhotos(null, 6000);
  const [slides, setSlides] = useState<Slide[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const fresh = useRef<Photo[]>([]);
  const cursor = useRef(0);
  const counter = useRef(0);
  const all = useRef<Photo[]>([]);

  // Spot newly uploaded photos.
  useEffect(() => {
    if (!data?.revealed) return;
    const list = data.photos;
    const firstLoad = seen.current.size === 0;
    for (const p of [...list].reverse()) {
      if (!seen.current.has(p.id)) {
        seen.current.add(p.id);
        if (!firstLoad) fresh.current.push(p);
      }
    }
    all.current = list;
  }, [data]);

  const next = useCallback(async () => {
    const list = all.current;
    if (!list.length) return;
    let photo: Photo;
    let isFresh = false;
    if (fresh.current.length) {
      photo = fresh.current.shift()!;
      isFresh = true;
    } else {
      cursor.current = cursor.current % list.length;
      photo = list[cursor.current++];
    }
    await preload(photo.url);
    setSlides((s) => [...s.slice(-1), { photo, fresh: isFresh, n: counter.current++ }]);
  }, []);

  const revealed = !!data?.revealed;
  const hasPhotos = !!data?.photos.length;
  useEffect(() => {
    if (!revealed || !hasPhotos) return;
    void next();
    const t = setInterval(() => void next(), SLIDE_MS);
    return () => clearInterval(t);
  }, [revealed, hasPhotos, next]);

  const current = slides[slides.length - 1];

  return (
    <main
      className="fixed inset-0 flex cursor-pointer overflow-hidden bg-creme"
      onClick={() => document.fullscreenElement ? undefined : document.documentElement.requestFullscreen?.().catch(() => {})}
      title="Cliquer pour passer en plein écran"
    >
      <style>{`@keyframes slide-in{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}`}</style>

      {/* Zone photo */}
      <section className="relative flex-1">
        {revealed && slides.map((s) => (
          <figure key={s.n} className="absolute inset-0 flex flex-col items-center justify-center bg-creme p-[3vh]" style={{ animation: "slide-in 1.2s ease both" }}>
            <img src={s.photo.url} alt="" className="min-h-0 max-w-full flex-1 rounded-md object-contain shadow-[0_20px_50px_-20px_rgba(79,50,27,.6)]" />
            <figcaption className="mt-[2vh] flex items-center gap-4 font-script text-[5vh] leading-none text-terra">
              {s.photo.author}
              {s.fresh && <span className="rounded-full bg-terra px-4 py-1 font-sans text-[2vh] uppercase tracking-widest text-white">Nouvelle</span>}
            </figcaption>
          </figure>
        ))}

        {data && !revealed && (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <p className="font-serif text-[3.2vh] uppercase tracking-[.3em] text-terra-fonce">Révélation des photos</p>
            <p className="mt-2 font-serif text-[3vh] text-brun/80">{data.revealAt ? formatReveal(data.revealAt) : "très bientôt"}</p>
            <div className="mt-[4vh]">{data.revealAt && <Countdown to={data.revealAt} onDone={refresh} large />}</div>
            <p className="mt-[5vh] font-script text-[7vh] text-terra">{plural(data.total, "photo", "photos")} en attente…</p>
          </div>
        )}

        {revealed && !hasPhotos && (
          <div className="flex h-full items-center justify-center font-script text-[7vh] text-terra">Les premières photos arrivent…</div>
        )}
      </section>

      {/* Colonne QR */}
      <aside className="relative flex w-[26vw] min-w-64 flex-col items-center justify-center border-l border-sable/70 bg-papier/60 px-[2vw] text-center">
        <Flowers className="absolute right-0 bottom-0 w-[11vw] min-w-28" />
        <h1 className="font-script text-[6vh] leading-none text-terra">{WEDDING.title}</h1>
        <Divider className="mt-[2vh]" />
        <p className="mt-[3vh] font-serif text-[3.4vh] font-semibold text-terra-fonce">Partagez vos photos&nbsp;!</p>
        <div className="mt-[2.5vh] rounded-2xl border border-sable bg-papier p-[1.6vh]">
          <QrCode className="size-[24vh] [&_svg]:size-full" />
        </div>
        <p className="mt-[2vh] text-[2.2vh] text-brun/70">Scannez avec votre téléphone</p>
        {data && revealed && <p className="mt-[3vh] font-serif text-[2.8vh] text-terra">{plural(data.total, "photo", "photos")}</p>}
      </aside>

      {current === undefined && !data && <span className="sr-only">Chargement</span>}
    </main>
  );
}
