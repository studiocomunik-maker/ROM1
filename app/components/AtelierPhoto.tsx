"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
export default function AtelierPhoto() {
  const root = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = {
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      };
      gsap.fromTo(
        photo.current,
        { yPercent: -7, scale: 1.16 },
        { yPercent: 7, scale: 1.16, ease: "none", scrollTrigger: st }
      );
      gsap.fromTo(
        frame.current,
        { x: 16, y: 16 },
        { x: 6, y: 6, ease: "none", scrollTrigger: st }
      );
    });
    return () => mm.revert();
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
            src="/medias/atelier-duo.jpg"
            alt="Romain Renoux et Céline Kbaier, graphistes en Beaujolais"
            width={1500}
            height={2000}
            sizes="(min-width: 768px) 40vw, 90vw"
            className="block w-full grayscale"
          />
        </div>

        {/* Hotspots hors du calque parallax : posés dedans, dots et étiquettes
           subiraient le scale(1.16). La photo dérive de quelques px sous les
           dots au scroll — invisible à l'usage. */}
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
      </div>
    </div>
  );
}
