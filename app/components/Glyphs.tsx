/* Glyphes riso du hero d'accueil (œil, éclair, étoile-éclat), extraits pour
   être réutilisés ailleurs (page à-propos…). L'œil porte un contour foncé →
   lisible sur fond clair ET sombre. Couleurs fixes = identité riso. */

export function Eye({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <path
        d="M4 40 C30 6 90 6 116 40 C90 74 30 74 4 40 Z"
        fill="#f5f4f2"
        stroke="#0c0c0e"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="40" r="18" fill="#ff3d1f" />
      <circle cx="60" cy="40" r="7" fill="#0c0c0e" />
    </svg>
  );
}

export function Bolt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 110" className={className} aria-hidden>
      <path d="M40 2 L8 60 L32 60 L24 108 L64 44 L38 44 Z" fill="#ff3d1f" />
    </svg>
  );
}

export function Burst({ className = "" }: { className?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 16;
    const r = i % 2 === 0 ? 48 : 20;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <polygon points={pts} fill="#ff3d1f" />
      <circle cx="50" cy="50" r="14" fill="#f5f4f2" />
    </svg>
  );
}
