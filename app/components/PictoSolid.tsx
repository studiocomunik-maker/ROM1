import { Burst } from "./Glyphs";

/* Pictos métiers/univers en STYLE RISO PLEIN (cohérents avec l'œil/l'étoile
   et les pictos de la page à-propos). `accent` = couleur des détails :
   « coal » sur fond clair (cartes métiers), « paper » sur fond sombre (univers).
   Animations déclenchées UNIQUEMENT au survol de la carte (.group:hover, cf
   globals.css .pic-spin / .pic-blink / .pic-code) — sinon tout bougerait. */
const O = "#ff3d1f";
const C = "#f5f4f2";
const K = "#0c0c0e";

// Pupille-diaphragme de l'œil (centre de l'iris à 60,40 dans le viewBox 120×80)
const EYE_CX = 60;
const EYE_CY = 40;
const AP_RH = 7;
const AP_RIM = 18;
const AP_TWIST = 30;
const apVerts = Array.from({ length: 6 }, (_, i) => {
  const a = (i * 60 * Math.PI) / 180;
  return [EYE_CX + AP_RH * Math.cos(a), EYE_CY + AP_RH * Math.sin(a)] as const;
});
const apSeams = apVerts.map((_, i) => {
  const a = ((i * 60 + AP_TWIST) * Math.PI) / 180;
  return [EYE_CX + AP_RIM * Math.cos(a), EYE_CY + AP_RIM * Math.sin(a)] as const;
});
const apHex =
  apVerts.map((v, i) => `${i ? "L" : "M"}${v[0].toFixed(1)} ${v[1].toFixed(1)}`).join(" ") + "Z";

// Engrenage (corporate) : couronne dentée calculée
const TEETH = 8;
const gearPts = (() => {
  const p: string[] = [];
  for (let i = 0; i < TEETH; i++) {
    const a = (i / TEETH) * Math.PI * 2;
    const aN = ((i + 1) / TEETH) * Math.PI * 2;
    const aT = a + (aN - a) * 0.5;
    const pt = (r: number, ang: number) =>
      `${(32 + r * Math.cos(ang)).toFixed(1)},${(32 + r * Math.sin(ang)).toFixed(1)}`;
    p.push(pt(30, a), pt(30, aT), pt(23.5, aT), pt(23.5, aN));
  }
  return p.join(" ");
})();

export default function PictoSolid({
  k,
  className = "",
  accent = "paper",
}: {
  k: string;
  className?: string;
  accent?: "paper" | "coal";
}) {
  const A = accent === "coal" ? K : C;

  // Picto SVG plein « générique » + petit pop au survol
  const svg = (children: React.ReactNode) => (
    <span className={`inline-block transition-transform duration-300 group-hover:scale-110 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
        {children}
      </svg>
    </span>
  );

  switch (k) {
    // ───────── MÉTIERS ─────────
    case "identite": // étoile-éclat qui tourne au survol
      return (
        <span className={`pic-spin inline-block ${className}`}>
          <Burst className="h-full w-full" />
        </span>
      );
    case "print": // page imprimée — coin plié sombre (accent), traits en blanc
      return svg(
        <>
          <path d="M14 6 H40 L52 18 V58 H14 Z" fill={O} />
          <path d="M40 6 V18 H52 Z" fill={A} />
          <rect x="21" y="26" width="22" height="4.5" rx="2.25" fill={C} />
          <rect x="21" y="35" width="22" height="4.5" rx="2.25" fill={C} />
          <rect x="21" y="44" width="13" height="4.5" rx="2.25" fill={C} />
        </>,
      );
    case "photo": // œil + pupille-diaphragme, cligne au survol
      return (
        <span className={`inline-block ${className}`}>
          <svg viewBox="0 0 120 80" className="pic-blink h-full w-full" aria-hidden>
            <path
              d="M4 40 C30 6 90 6 116 40 C90 74 30 74 4 40 Z"
              fill={C}
              stroke={K}
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <circle cx={EYE_CX} cy={EYE_CY} r="20" fill={O} />
            {apSeams.map((s, i) => (
              <line
                key={i}
                x1={apVerts[i][0]}
                y1={apVerts[i][1]}
                x2={s[0]}
                y2={s[1]}
                stroke={K}
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
            <path d={apHex} fill={K} />
          </svg>
        </span>
      );
    case "web": // balise <rom2/>, typewriter au survol
      return (
        <span
          aria-hidden
          className="inline-flex items-baseline font-mono text-base font-bold leading-none text-orange md:text-lg"
        >
          <span className="text-[1.15em]">&lt;</span>
          <span className="pic-code mx-[0.1em] text-orange transition-colors group-hover:text-paper">
            rom1
          </span>
          <span className="text-[1.15em]">/&gt;</span>
        </span>
      );
    case "motion": // lecture / mouvement
      return svg(
        <>
          <circle cx="32" cy="32" r="26" fill={O} />
          <path d="M26 21 L45 32 L26 43 Z" fill={A} />
        </>,
      );

    // ───────── UNIVERS ─────────
    case "vin": // bouteille
      return svg(
        <>
          <path
            d="M27 6 H37 V15 C37 20 41 23 41 31 V55 A3 3 0 0 1 38 58 H26 A3 3 0 0 1 23 55 V31 C23 23 27 20 27 15 Z"
            fill={O}
          />
          <rect x="24" y="35" width="16" height="13" fill={A} />
        </>,
      );
    case "sceno": // projecteur / scène
      return svg(
        <>
          <circle cx="32" cy="13" r="8" fill={O} />
          <path d="M32 19 L13 56 H51 Z" fill={O} />
          <path d="M32 27 L22 52 H42 Z" fill={A} />
        </>,
      );
    case "art": // palette
      return svg(
        <>
          <path
            d="M32 8 C17 8 7 17 7 29 C7 39 15 45 23 45 C27 45 28 41 32 41 C37 41 37 47 43 47 C53 47 57 37 57 27 C57 16 46 8 32 8 Z"
            fill={O}
          />
          <circle cx="19" cy="27" r="3.4" fill={A} />
          <circle cx="28" cy="18" r="3.4" fill={A} />
          <circle cx="40" cy="19" r="3.4" fill={A} />
          <circle cx="47" cy="29" r="3.4" fill={A} />
        </>,
      );
    case "corporate": // engrenage (industrie / robotisation)
      return svg(
        <>
          <polygon points={gearPts} fill={O} />
          <circle cx="32" cy="32" r="10" fill={A} />
          <circle cx="32" cy="32" r="4.5" fill={O} />
        </>,
      );
    case "hotel": // verre à pied
      return svg(
        <>
          <path
            d="M19 8 H45 C45 21 38 27 34 29 V50 H43 V56 H21 V50 H30 V29 C26 27 19 21 19 8 Z"
            fill={O}
          />
          <path d="M24 13 H40 C39 19 36 23 32 25 C28 23 25 19 24 13 Z" fill={A} />
        </>,
      );
    default:
      return null;
  }
}
