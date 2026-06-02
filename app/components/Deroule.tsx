"use client";

import { useEffect, useRef, useState } from "react";

type Item = {
  idx: string;
  kicker: string;
  title: string;
  line: string;
  /** base treatment (holographic / duotone) */
  bg: string;
  /** true => the background is shown as a NEGATIVE (inversion) */
  negative: boolean;
  /** foreground text color */
  ink: string;
};

const items: Item[] = [
  {
    idx: "01",
    kicker: "Vin",
    title: "Domaines & vignerons",
    line: "Photo, vidéo, drone, étiquettes, sites. L’image qui donne soif.",
    bg: "radial-gradient(120% 90% at 25% 35%, #ff3b2f 0%, transparent 45%), radial-gradient(100% 80% at 80% 60%, #36d1ff 0%, transparent 50%), conic-gradient(from 210deg at 55% 50%, #ffd23d, #36d1ff, #6a3dff, #ff3b2f, #ffd23d)",
    negative: false,
    ink: "#111014",
  },
  {
    idx: "02",
    kicker: "Spectacle",
    title: "Écrans de scène",
    line: "Le motion qui habite la scène. Réalisé pour Blackmoon.",
    bg: "radial-gradient(120% 90% at 25% 35%, #ff3b2f 0%, transparent 45%), radial-gradient(100% 80% at 80% 60%, #36d1ff 0%, transparent 50%), conic-gradient(from 210deg at 55% 50%, #ffd23d, #36d1ff, #6a3dff, #ff3b2f, #ffd23d)",
    negative: true,
    ink: "#f4f3ee",
  },
  {
    idx: "03",
    kicker: "Industrie",
    title: "Robots & ateliers",
    line: "Donner une image au monde technique. Robotisation, imprimerie.",
    bg: "radial-gradient(110% 90% at 70% 30%, #00e0c6 0%, transparent 50%), radial-gradient(120% 90% at 20% 75%, #2436bd 0%, transparent 55%), conic-gradient(from 140deg at 45% 55%, #00e0c6, #2436bd, #6a3dff, #00e0c6)",
    negative: false,
    ink: "#0a0a0c",
  },
  {
    idx: "04",
    kicker: "Hôtellerie · Restauration",
    title: "Lieux & tables",
    line: "Identité, photo, print, web. L’art de recevoir, mis en image.",
    bg: "radial-gradient(110% 90% at 70% 30%, #00e0c6 0%, transparent 50%), radial-gradient(120% 90% at 20% 75%, #2436bd 0%, transparent 55%), conic-gradient(from 140deg at 45% 55%, #00e0c6, #2436bd, #6a3dff, #00e0c6)",
    negative: true,
    ink: "#f4f3ee",
  },
];

export default function Deroule() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sectionsRef.current.forEach((s) => s && obs.observe(s));

    // Toggle the fixed background only while the déroulé zone is on screen
    const zoneObs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0 }
    );
    if (zoneRef.current) zoneObs.observe(zoneRef.current);

    return () => {
      obs.disconnect();
      zoneObs.disconnect();
    };
  }, []);

  return (
    <div ref={zoneRef} className="relative">
      {/* Fixed background — crossfading, inverting layers */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-night transition-opacity duration-500"
        style={{ opacity: inView ? 1 : 0 }}
        aria-hidden
      >
        {items.map((it, i) => (
          <div
            key={i}
            className="grain absolute inset-0 transition-opacity duration-700 ease-out"
            style={{
              background: it.bg,
              opacity: active === i ? 1 : 0,
              filter: it.negative
                ? "invert(1) hue-rotate(180deg) saturate(1.1)"
                : "none",
            }}
          />
        ))}
        {/* legibility veil */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Items */}
      {items.map((it, i) => (
        <section
          key={it.idx}
          data-i={i}
          ref={(el) => {
            sectionsRef.current[i] = el;
          }}
          className="relative flex h-screen flex-col justify-center px-6 md:px-12"
          style={{ color: it.ink }}
        >
          {/* index */}
          <div className="absolute left-6 top-8 font-mono text-xs tracking-[0.2em] md:left-12">
            {it.idx} <span className="opacity-50">/ {String(items.length).padStart(2, "0")}</span>
          </div>
          <div className="absolute right-6 top-8 font-mono text-xs uppercase tracking-[0.2em] opacity-70 md:right-12">
            {it.negative ? "◐ négatif" : "◑ positif"}
          </div>

          <p className="mb-3 font-display text-xs uppercase tracking-[0.25em]">
            {it.kicker}
          </p>
          <h2 className="font-condensed uppercase leading-[0.82] tracking-[-0.01em] text-[clamp(3rem,13vw,11rem)]">
            {it.title}
          </h2>
          <p className="mt-6 max-w-md text-base md:text-lg" style={{ opacity: 0.85 }}>
            {it.line}
          </p>

          <a
            href="#contact"
            className="mt-8 inline-flex w-fit items-center gap-2 border-2 px-5 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-transform hover:translate-x-1"
            style={{ borderColor: it.ink }}
          >
            Voir les projets →
          </a>
        </section>
      ))}

      {/* Note placeholder */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-10 font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 md:right-12">
        ▸ fonds = placeholder · vos vrais visuels vin/scène ici
      </div>

      {/* CONTACT — retour au crème */}
      <section
        id="contact"
        className="relative flex min-h-screen flex-col justify-center bg-cream px-6 py-24 text-night md:px-12"
      >
        <p className="mb-5 font-display text-xs uppercase tracking-[0.25em] text-red">
          Beaujolais · Lyon · Rhône
        </p>
        <h2 className="font-display uppercase leading-[0.9] tracking-tight text-blue text-[clamp(2.4rem,8vw,7rem)]">
          On en parle<span className="text-red">?</span>
        </h2>
        <a
          href="mailto:studiocomunik@gmail.com"
          className="mt-8 w-fit bg-blue px-7 py-3 font-display text-sm uppercase tracking-[0.12em] text-cream transition-transform hover:scale-[1.03]"
        >
          Démarrer un projet
        </a>
        <p className="mt-16 font-mono text-xs uppercase tracking-[0.15em] text-night/50">
          © Romain Renoux — rom1.fr · Côté web → pixelstore.fr
        </p>
      </section>
    </div>
  );
}
