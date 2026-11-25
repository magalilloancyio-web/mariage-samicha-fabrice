"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { j: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ to, onDone, large = false }: { to: string; onDone?: () => void; large?: boolean }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (now !== null && now >= target) onDone?.();
  }, [now, target, onDone]);

  if (now === null) return <div className={large ? "h-32" : "h-20"} />;
  const p = parts(target - now);
  const cells: [number, string][] = p.j > 0 ? [[p.j, "jours"], [p.h, "heures"], [p.m, "min"]] : [[p.h, "heures"], [p.m, "min"], [p.s, "sec"]];

  return (
    <div className="flex justify-center gap-3" role="timer">
      {cells.map(([v, label]) => (
        <div
          key={label}
          className={`flex flex-col items-center rounded-2xl border border-sable bg-papier/80 ${large ? "min-w-36 px-6 py-5" : "min-w-20 px-3 py-3"}`}
        >
          <span className={`font-serif font-semibold lining-nums tabular-nums text-terra ${large ? "text-7xl" : "text-4xl"}`}>
            {String(v).padStart(2, "0")}
          </span>
          <span className={`uppercase tracking-widest text-brun/70 ${large ? "text-lg" : "text-xs"}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}
