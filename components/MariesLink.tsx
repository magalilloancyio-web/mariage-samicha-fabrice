import Link from "next/link";

/** Lien discret vers l'espace des mariés (protégé par code). */
export function MariesLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/maries" className={`inline-flex items-center gap-1.5 text-sm text-brun/55 underline-offset-4 hover:underline ${className}`}>
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <rect x="5" y="10.5" width="14" height="10" rx="2" />
        <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      </svg>
      Espace des mariés
    </Link>
  );
}
