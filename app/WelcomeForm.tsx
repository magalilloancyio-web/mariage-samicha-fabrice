"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { forgetGuest, loadGuest, saveGuest, type Guest } from "@/lib/guest";

export function WelcomeForm() {
  const router = useRouter();
  const [known, setKnown] = useState<Guest | null | undefined>(undefined);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  useEffect(() => {
    setKnown(loadGuest());
    router.prefetch("/photo");
  }, [router]);

  if (known === undefined) return <div className="h-56" />;

  if (known) {
    return (
      <div className="mt-7 space-y-3">
        <p className="font-serif text-2xl text-terra-fonce">Bonjour {known.firstName}&nbsp;!</p>
        <button className="btn-primary" onClick={() => router.push("/photo")}>
          Partager mes photos
        </button>
        <button
          className="text-sm text-brun/60 underline underline-offset-4"
          onClick={() => {
            forgetGuest();
            setKnown(null);
          }}
        >
          Ce n&apos;est pas moi
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-7 space-y-3 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        if (!first.trim()) return;
        saveGuest(first.trim(), last.trim());
        router.push("/photo");
      }}
    >
      <label className="block">
        <span className="sr-only">Prénom</span>
        <input
          className="field"
          placeholder="Votre prénom"
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="next"
          required
          maxLength={60}
          value={first}
          onChange={(e) => setFirst(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="sr-only">Nom</span>
        <input
          className="field"
          placeholder="Votre nom"
          autoComplete="family-name"
          autoCapitalize="words"
          enterKeyHint="go"
          maxLength={60}
          value={last}
          onChange={(e) => setLast(e.target.value)}
        />
      </label>
      <button type="submit" className="btn-primary !mt-5" disabled={!first.trim()}>
        C&apos;est parti&nbsp;!
      </button>
      <p className="pt-1 text-center text-sm text-brun/60">Pas de compte à créer. Votre nom accompagnera vos photos.</p>
    </form>
  );
}
