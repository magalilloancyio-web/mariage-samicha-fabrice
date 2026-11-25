"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { forgetGuest, loadGuest, saveGuest, type Guest } from "@/lib/guest";

export function WelcomeForm() {
  const router = useRouter();
  const [known, setKnown] = useState<Guest | null | undefined>(undefined);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setKnown(loadGuest());
    router.prefetch("/photo");
  }, [router]);

  if (known === undefined) return <div className="h-56" />;

  if (known) {
    return (
      <div className="mt-7 space-y-3">
        <p className="font-serif text-3xl text-terra-fonce">Bonjour {known.firstName}&nbsp;!</p>
        <button className="btn-primary" onClick={() => router.push("/photo")}>
          Partager mes photos
        </button>
        <button
          className="text-base text-brun/60 underline underline-offset-4"
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

  const missingFirst = tried && !first.trim();
  const missingLast = tried && !last.trim();
  const message = !tried
    ? ""
    : missingFirst && missingLast
      ? "Oups ! Dites-nous qui vous êtes 😊 Votre prénom et votre nom, et c'est parti !"
      : missingFirst
        ? "Il manque juste votre prénom 😊"
        : missingLast
          ? "Et votre nom ? Que les mariés sachent qui a pris ces jolies photos 😉"
          : "";

  return (
    <form
      noValidate
      className="mt-7 space-y-3 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!first.trim() || !last.trim()) return;
        saveGuest(first.trim(), last.trim());
        router.push("/photo");
      }}
    >
      <label className="block">
        <span className="sr-only">Prénom</span>
        <input
          className={`field ${missingFirst ? "field-error" : ""}`}
          placeholder="Votre prénom"
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="next"
          maxLength={60}
          aria-invalid={missingFirst}
          aria-describedby={message ? "welcome-error" : undefined}
          value={first}
          onChange={(e) => setFirst(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="sr-only">Nom</span>
        <input
          className={`field ${missingLast ? "field-error" : ""}`}
          placeholder="Votre nom"
          autoComplete="family-name"
          autoCapitalize="words"
          enterKeyHint="go"
          maxLength={60}
          aria-invalid={missingLast}
          aria-describedby={message ? "welcome-error" : undefined}
          value={last}
          onChange={(e) => setLast(e.target.value)}
        />
      </label>
      {message && (
        <p
          id="welcome-error"
          role="alert"
          className="fade-up rounded-2xl border border-rose/60 bg-rose/15 px-4 py-3 text-center text-lg text-terra-fonce"
        >
          {message}
        </p>
      )}
      <button type="submit" className="btn-primary !mt-5">
        C&apos;est parti&nbsp;!
      </button>
      <p className="pt-1 text-center text-base text-brun/70">Pas de compte à créer. Votre nom accompagnera vos photos.</p>
    </form>
  );
}
