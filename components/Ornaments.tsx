/** Filet — point — filet, comme sur le faire-part. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-terra ${className}`} aria-hidden>
      <span className="h-px w-16 bg-terra/70" />
      <span className="size-1.5 rounded-full bg-terra" />
      <span className="h-px w-16 bg-terra/70" />
    </div>
  );
}

/** Petit bouquet de fleurs séchées (dessiné en SVG). */
export function Flowers({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
      fill="none"
    >
      {/* tiges */}
      <g stroke="#8a5a36" strokeWidth="1.4" strokeLinecap="round">
        <path d="M150 158 C120 120 100 90 70 52" />
        <path d="M150 158 C130 110 128 80 122 30" />
        <path d="M150 158 C110 140 70 130 30 118" />
        <path d="M150 158 C140 125 150 95 156 70" />
      </g>
      {/* feuilles */}
      <g fill="#b07a4f" opacity=".85">
        <ellipse cx="96" cy="86" rx="11" ry="4" transform="rotate(-50 96 86)" />
        <ellipse cx="84" cy="68" rx="10" ry="3.5" transform="rotate(30 84 68)" />
        <ellipse cx="126" cy="70" rx="10" ry="3.5" transform="rotate(-80 126 70)" />
        <ellipse cx="118" cy="50" rx="9" ry="3" transform="rotate(-20 118 50)" />
        <ellipse cx="60" cy="126" rx="11" ry="3.5" transform="rotate(10 60 126)" />
        <ellipse cx="80" cy="138" rx="9" ry="3" transform="rotate(-30 80 138)" />
      </g>
      {/* épis / plumes */}
      <g stroke="#c9a27e" strokeWidth="1.2" strokeLinecap="round">
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={i} d={`M${123 - i * 0.4} ${44 - i * 4} l-6 -5 M${123 - i * 0.4} ${44 - i * 4} l6 -5`} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={`b${i}`} d={`M${36 + i * 6} ${120 - i * 1.5} l-3 -6 M${36 + i * 6} ${120 - i * 1.5} l-3 6`} />
        ))}
      </g>
      {/* fleur principale (dahlia) */}
      <g transform="translate(68 50)">
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse key={i} cx="0" cy="-12" rx="5" ry="11" fill="#e3b49a" stroke="#c98b6b" strokeWidth=".8" transform={`rotate(${i * 30})`} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={`i${i}`} cx="0" cy="-7" rx="3.5" ry="7" fill="#d79c7d" transform={`rotate(${i * 45 + 20})`} />
        ))}
        <circle r="4.5" fill="#9a5b2a" />
      </g>
      {/* rose */}
      <g transform="translate(150 66)">
        <circle r="13" fill="#c07a5c" />
        <path d="M-7 -2 a7 7 0 1 1 12 5 a5 5 0 1 1 -8 -5 a3 3 0 1 1 4 3" stroke="#8f4f35" strokeWidth="1.3" />
      </g>
      {/* petites baies */}
      <g fill="#9a5b2a">
        <circle cx="30" cy="117" r="2.6" />
        <circle cx="25" cy="112" r="2" />
        <circle cx="34" cy="111" r="2" />
      </g>
    </svg>
  );
}
