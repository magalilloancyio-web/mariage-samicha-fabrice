"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { BottomNav, CameraIcon, ImagesIcon } from "@/components/BottomNav";
import { DeleteSheet } from "@/components/DeleteSheet";
import { Divider } from "@/components/Ornaments";
import { WEDDING } from "@/lib/config";
import { formatReveal, plural } from "@/lib/format";
import { useGuest } from "@/lib/useGuest";
import { usePhotos } from "@/lib/usePhotos";
import { useUploader, type UploadItem } from "@/lib/useUploader";

export default function PhotoPage() {
  const guest = useGuest();
  const { data, refresh } = usePhotos(guest === undefined ? undefined : guest?.id ?? null, 15000);
  const { items, add, retry, remove, pending } = useUploader(guest ?? null, refresh);
  const [toDelete, setToDelete] = useState<UploadItem | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  const sentNow = items.filter((i) => i.status === "done").length;
  const myCount = Math.max(data?.myCount ?? 0, sentNow);

  return (
    <main className="relative mx-auto min-h-dvh max-w-md overflow-hidden px-6 pt-[max(env(safe-area-inset-top),20px)] pb-28 text-center">
      <Link href="/" className="font-script text-4xl text-terra">
        {WEDDING.title}
      </Link>
      <Divider className="mt-2" />
      <p className="mt-4 font-serif text-2xl text-terra-fonce">{guest ? `À vous, ${guest.firstName} !` : " "}</p>
      <p className="mt-1 text-brun/75">Chaque photo compte, partagez sans modération.</p>

      {/* Bouton principal : ouvre directement l'appareil photo du téléphone */}
      <button
        onClick={() => cameraRef.current?.click()}
        className="group mx-auto mt-8 flex size-52 flex-col items-center justify-center gap-2 rounded-full border-[6px] border-papier bg-terra text-white shadow-[0_18px_40px_-14px_rgba(122,68,32,.8)] ring-2 ring-terra/40 transition active:scale-95 active:bg-terra-fonce"
      >
        <CameraIcon className="size-16" />
        <span className="text-lg font-medium">Prendre une photo</span>
      </button>

      <button onClick={() => libraryRef.current?.click()} className="btn-secondary mt-8">
        <ImagesIcon className="size-6" />
        Choisir dans ma galerie
      </button>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) add(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) add(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mt-8 rounded-3xl border border-sable/80 bg-papier/70 px-5 py-4">
        <p className="font-serif text-xl text-terra-fonce">
          {myCount ? `Vous avez partagé ${plural(myCount, "photo", "photos")} 🤎` : "Vos photos apparaîtront ici"}
        </p>
        {data && !data.revealed && (
          <p className="mt-1 text-sm text-brun/70">
            {data.revealAt
              ? `Surprise ! Toutes les photos seront révélées ${formatReveal(data.revealAt)}.`
              : "Surprise ! Les photos seront révélées bientôt."}
          </p>
        )}
        {pending > 0 && <p className="mt-1 text-sm font-medium text-terra">Envoi en cours… gardez cette page ouverte.</p>}

        {items.some((i) => i.status === "done") && (
          <p className="mt-1 text-sm text-brun/60">Une photo ne vous plaît pas&nbsp;? Touchez-la pour la supprimer.</p>
        )}
        {items.length > 0 && (
          <ul className="mt-4 grid grid-cols-4 gap-2">
            {items.slice(0, 24).map((it) => (
              <UploadThumb key={it.key} item={it} onRetry={() => retry(it.key)} onDelete={() => setToDelete(it)} />
            ))}
          </ul>
        )}
      </div>

      {toDelete && (
        <DeleteSheet
          src={toDelete.preview}
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            const ok = await remove(toDelete.key);
            if (ok) setToDelete(null);
            return ok;
          }}
        />
      )}

      <BottomNav />
    </main>
  );
}

function UploadThumb({ item, onRetry, onDelete }: { item: UploadItem; onRetry: () => void; onDelete: () => void }) {
  const failed = item.status === "error" && item.fatal;
  return (
    <li className="relative aspect-square overflow-hidden rounded-xl bg-sable/60">
      {item.preview && <img src={item.preview} alt="" className="size-full object-cover" />}
      {item.status !== "done" && !failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-brun/35">
          <Ring value={item.status === "uploading" ? item.progress : 0} spinning={item.status !== "uploading"} />
        </div>
      )}
      {item.status === "done" && (
        <button onClick={onDelete} className="absolute inset-0" aria-label="Supprimer cette photo">
          <span className="absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full bg-terra text-xs text-white" aria-hidden>
            ✓
          </span>
          <span className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-brun/70 text-sm leading-none text-white" aria-hidden>
            ×
          </span>
        </button>
      )}
      {failed && (
        <button onClick={onRetry} className="absolute inset-0 flex flex-col items-center justify-center bg-brun/70 p-1 text-[11px] leading-tight text-white">
          <span className="text-base">↻</span>
          {item.error}
        </button>
      )}
    </li>
  );
}

function Ring({ value, spinning }: { value: number; spinning: boolean }) {
  const c = 2 * Math.PI * 12;
  return (
    <svg viewBox="0 0 32 32" className={`size-9 ${spinning ? "animate-spin" : ""}`} aria-hidden>
      <circle cx="16" cy="16" r="12" fill="none" stroke="white" strokeOpacity=".35" strokeWidth="3" />
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={spinning ? c * 0.7 : c * (1 - value)}
        transform="rotate(-90 16 16)"
        style={{ transition: "stroke-dashoffset .3s" }}
      />
    </svg>
  );
}
