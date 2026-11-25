"use client";

import { useState } from "react";

/** Fenêtre de confirmation avec aperçu : « Supprimer cette photo ? » */
export function DeleteSheet({ src, onConfirm, onCancel }: { src?: string; onConfirm: () => Promise<boolean>; onCancel: () => void }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-brun/50 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal
        aria-labelledby="delete-title"
        className="fade-up w-full max-w-md rounded-t-3xl bg-creme px-6 pt-6 pb-[max(env(safe-area-inset-bottom),24px)] text-center shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {src && <img src={src} alt="" className="mx-auto max-h-[38dvh] rounded-2xl object-contain shadow-md" />}
        <h2 id="delete-title" className="mt-5 font-serif text-2xl font-semibold text-terra-fonce">
          Supprimer cette photo&nbsp;?
        </h2>
        <p className="mt-1 text-brun/75">Elle sera retirée définitivement, personne ne la verra.</p>
        {failed && <p className="mt-2 text-sm text-red-700">Impossible de la supprimer pour l&apos;instant, réessayez.</p>}
        <div className="mt-5 space-y-3">
          <button
            className="btn-primary !bg-[#a3402c]"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setFailed(false);
              const ok = await onConfirm().catch(() => false);
              setBusy(false);
              if (!ok) setFailed(true);
            }}
          >
            {busy ? "Suppression…" : "Oui, supprimer"}
          </button>
          <button className="btn-secondary" onClick={onCancel} disabled={busy}>
            Non, je la garde
          </button>
        </div>
      </div>
    </div>
  );
}
