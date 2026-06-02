"use client";

/* Accueil — registre PANGRAMS. Chaque mot se révèle EN MASQUE (rise from mask)
   au chargement, en cascade (gros délai). */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

function Eye({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <path d="M4 40 C30 6 90 6 116 40 C90 74 30 74 4 40 Z" fill="#f4f3ee" />
      <circle cx="60" cy="40" r="20" fill="#ff3d1f" />
      <circle cx="60" cy="40" r="8" fill="#0c0c0e" />
      <path d="M2 40 C28 8 92 8 118 40" fill="none" stroke="#0c0c0e" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Bolt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 110" className={className} aria-hidden>
      <path d="M40 2 L8 60 L32 60 L24 108 L64 44 L38 44 Z" fill="#ff3d1f" />
    </svg>
  );
}

function Burst({ className = "" }: { className?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 16;
    const r = i % 2 === 0 ? 48 : 20;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <polygon points={pts} fill="#ff3d1f" />
      <circle cx="50" cy="50" r="14" fill="#f4f3ee" />
    </svg>
  );
}

const STEP = 0.16; // gros délai entre chaque mot (s)

export default function Accueil() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Mot en MASQUE : le bord clippe, la lettre monte depuis le bas.
  // pt/-mt : marge haute pour ne pas rogner les accents (À, É, le point).
  const Mask = ({ i, children }: { i: number; children: ReactNode }) => (
    <span
      className="inline-block overflow-hidden align-bottom"
      style={{ lineHeight: 1, paddingTop: "0.12em", marginTop: "-0.12em" }}
    >
      <span
        className="inline-block will-change-transform"
        style={{
          transitionProperty: "transform",
          transitionDuration: "0.9s",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: `${i * STEP}s`,
          transform: show ? "translateY(0)" : "translateY(115%)",
        }}
      >
        {children}
      </span>
    </span>
  );

  // Marque (étoile/œil/éclair) : simple fade-in (pas de masque).
  const markStyle = (i: number): CSSProperties => ({
    transitionProperty: "transform, opacity",
    transitionDuration: "0.9s",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    transitionDelay: `${i * STEP}s`,
    transform: show ? "translateY(0)" : "translateY(0.4em)",
    opacity: show ? 1 : 0,
  });

  return (
    <section className="grain sticky top-0 z-0 flex h-screen w-full flex-col overflow-hidden bg-coal text-paper">
      <header className="flex items-start justify-end px-6 pt-7 md:px-12">
        <p className="text-right font-display text-[10px] uppercase leading-[1.1] tracking-[0.04em] text-paper/60 sm:text-xs md:text-sm">
          Direction artistique
          <br />
          Image &amp; web · Beaujolais
        </p>
      </header>

      <div className="relative flex flex-1 items-center px-6 py-8 md:px-12">
        <h1 className="mx-auto w-full max-w-[1000px] font-display uppercase leading-[0.94] tracking-[-0.015em] text-paper text-[clamp(3.4rem,11vw,5.4rem)] md:text-[clamp(2.6rem,6.4vw,6rem)]">
          {/* MOBILE — lignes forcées */}
          <span className="block md:hidden">
            <span className="block">
              <Mask i={0}>Je</Mask> <Mask i={1}>donne</Mask>
            </span>
            <span className="block">
              <span className="mr-[0.18em] align-middle" style={markStyle(2)}>
                <span className="inline-block h-[0.78em] w-[0.78em] -translate-y-[0.06em]">
                  <Burst className="spin-slow h-full w-full" />
                </span>
              </span>
              <Mask i={3}>une</Mask>
            </span>
            <span className="block">
              <Mask i={4}>
                <span className="text-orange">image</span>
              </Mask>
              <span className="ml-[0.18em] align-middle" style={markStyle(5)}>
                <span className="inline-block h-[0.62em] w-[1.05em] -translate-y-[0.05em] -rotate-6">
                  <Eye className="eye-blink h-full w-full" />
                </span>
              </span>
            </span>
            <span className="block">
              <Mask i={6}>aux</Mask>
            </span>
            <span className="block">
              <Mask i={7}>
                <span className="relative inline-block">
                  marques
                  <span aria-hidden className="absolute inset-x-0 top-[50%] h-[0.055em] -rotate-2 bg-orange" />
                </span>
              </Mask>{" "}
              <Mask i={8}>à</Mask>
            </span>
            <span className="block">
              <Mask i={9}>votre</Mask>
            </span>
            <span className="block">
              <Mask i={10}>
                histoire<span className="text-orange">.</span>
              </Mask>
              <span className="ml-[0.2em] align-middle" style={markStyle(11)}>
                <span className="inline-block h-[0.92em] w-[0.5em] -translate-y-[0.02em] rotate-[8deg]">
                  <Bolt className="h-full w-full" />
                </span>
              </span>
            </span>
          </span>

          {/* DESKTOP — flux inline */}
          <span className="hidden md:block">
            <Mask i={0}>Je</Mask> <Mask i={1}>donne</Mask>
            <span className="mx-[0.18em] align-middle" style={markStyle(2)}>
              <span className="inline-block h-[0.78em] w-[0.78em] -translate-y-[0.06em]">
                <Burst className="spin-slow h-full w-full" />
              </span>
            </span>
            <Mask i={3}>une</Mask>{" "}
            <Mask i={4}>
              <span className="text-orange">image</span>
            </Mask>
            <span className="mx-[0.18em] align-middle" style={markStyle(5)}>
              <span className="inline-block h-[0.62em] w-[1.05em] -translate-y-[0.05em] -rotate-6">
                <Eye className="eye-blink h-full w-full" />
              </span>
            </span>
            <Mask i={6}>aux</Mask>{" "}
            {/* « marques » + « à » restent collés */}
            <span className="inline-block whitespace-nowrap">
              <Mask i={7}>
                <span className="relative inline-block">
                  marques
                  <span aria-hidden className="absolute inset-x-0 top-[50%] h-[0.055em] -rotate-2 bg-orange" />
                </span>
              </Mask>{" "}
              <Mask i={8}>à</Mask>
            </span>{" "}
            {/* « votre histoire » sur la même ligne */}
            <span className="inline-block whitespace-nowrap">
              <Mask i={9}>votre</Mask>{" "}
              <Mask i={10}>
                histoire<span className="text-orange">.</span>
              </Mask>
              <span className="ml-[0.2em] align-middle" style={markStyle(11)}>
                <span className="inline-block h-[0.92em] w-[0.5em] -translate-y-[0.02em] rotate-[8deg]">
                  <Bolt className="h-full w-full" />
                </span>
              </span>
            </span>
          </span>
        </h1>
      </div>

      <footer className="flex items-center justify-between px-6 pb-7 font-display text-[10px] uppercase tracking-[0.08em] text-paper/60 sm:text-xs md:px-12">
        <span>20 ans de métier</span>
        <span className="animate-pulse text-orange">↓ Faites défiler</span>
        <span className="hidden sm:inline">Vin · Spectacle · Industrie</span>
      </footer>
    </section>
  );
}
