"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* Hotspots ancrés sur la photo (en % de l'image). side = côté d'ouverture
   de l'étiquette pour ne pas sortir du cadre. */
const SPOTS = [
  {
    id: "celine",
    x: "13%",
    y: "45%",
    name: "Céline Kbaier",
    role: "Print, étiquettes & contenus",
    side: "left" as const,
  },
  {
    id: "romain",
    x: "63%",
    y: "58%",
    name: "Romain Renoux",
    role: "Direction artistique, image & web",
    side: "right" as const,
  },
];

/* Photo du duo : parallax au scroll (l'image glisse dans son cadre pendant
   que le cadre orange dérive en sens inverse — la « riso » se décale) +
   hotspots interactifs qui remplacent la légende. */
/* hotspots : affiche (ou non) les points interactifs « qui fait quoi »
   (désactivés sur la page à-propos). src/alt/width/height : image affichée —
   défaut = duo de l'atelier (home), surchargée par le portrait solo ailleurs. */
export default function AtelierPhoto({
  hotspots = true,
  src = "/medias/atelier-duo.jpg",
  alt = "Romain Renoux et Céline Kbaier, graphistes en Beaujolais",
  width = 1500,
  height = 2000,
}: {
  hotspots?: boolean;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  // Scrub au scroll sans lib : progression 0→1 pendant que la section traverse
  // l'écran (équivalent gsap start "top bottom" / end "bottom top"). Position
  // mesurée au montage + resize seulement — aucune lecture layout au scroll.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rootEl = root.current;
    const photoEl = photo.current;
    const frameEl = frame.current;
    if (!rootEl || !photoEl || !frameEl) return;
    let top = 0;
    let height = 0;
    const measure = () => {
      const r = rootEl.getBoundingClientRect();
      top = window.scrollY + r.top;
      height = r.height;
    };
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (window.scrollY + vh - top) / (vh + height)));
      // photo : yPercent -7 → 7 (scale fixe) ; cadre : 16px → 6px
      photoEl.style.transform = `translateY(${(-7 + 14 * p).toFixed(2)}%) scale(1.16)`;
      const o = 16 - 10 * p;
      frameEl.style.transform = `translate(${o.toFixed(1)}px, ${o.toFixed(1)}px)`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={root} className="relative">
      {/* Offset de base (fallback sans animation) — gsap le remplace au scroll */}
      <div
        ref={frame}
        aria-hidden
        className="absolute inset-0 bg-orange"
        style={{ transform: "translate(10px, 10px)" }}
      />
      <div className="relative overflow-hidden">
        <div ref={photo} className="will-change-transform">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="(min-width: 768px) 40vw, 90vw"
            className="block w-full grayscale"
          />
        </div>

        {/* Hotspots hors du calque parallax : posés dedans, dots et étiquettes
           subiraient le scale(1.16). La photo dérive de quelques px sous les
           dots au scroll — invisible à l'usage. */}
        {hotspots && (
        <div className="absolute inset-0">
          {SPOTS.map((s) => {
            const open = active === s.id;
            return (
              <div
                key={s.id}
                className="group absolute"
                style={{ left: s.x, top: s.y }}
              >
                <button
                  type="button"
                  aria-label={`${s.name} — ${s.role}`}
                  aria-expanded={open}
                  onClick={() => setActive(open ? null : s.id)}
                  className="relative block h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-orange/50" />
                  <span className="absolute inset-1 rounded-full border-2 border-paper bg-orange" />
                </button>
                <div
                  className={`pointer-events-none absolute bottom-[18px] w-max bg-paper px-3 py-2 transition-all duration-300 ${
                    s.side === "left" ? "left-0" : "right-0"
                  } ${
                    open
                      ? "translate-y-0 opacity-100"
                      : "translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
                  }`}
                >
                  <p className="font-display text-[11px] uppercase tracking-[0.06em] text-coal">
                    {s.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-coal/60">
                    {s.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
