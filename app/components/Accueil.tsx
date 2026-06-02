"use client";

/* Accueil — registre PANGRAMS : noir + type blanche + accent orange.
   Chaque mot se révèle en cascade (gros délai) au chargement. */

import { useEffect, useState, type CSSProperties } from "react";

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

  // style de révélation pour le mot/marque d'index i
  const rev = (i: number): CSSProperties => ({
    display: "inline-block",
    transitionProperty: "transform, opacity",
    transitionDuration: "0.85s",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    transitionDelay: `${i * STEP}s`,
    transform: show ? "translateY(0)" : "translateY(0.5em)",
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
        <h1 className="mx-auto w-full max-w-[1080px] font-display uppercase leading-[0.86] tracking-[-0.015em] text-paper text-[clamp(4rem,12vw,6.2rem)] md:text-[clamp(3rem,8vw,7.6rem)]">
          {/* MOBILE — lignes forcées */}
          <span className="block md:hidden">
            <span className="block">
              <span style={rev(0)}>Je</span> <span style={rev(1)}>donne</span>
            </span>
            <span className="block">
              <span className="mr-[0.18em] align-middle" style={rev(2)}>
                <span className="inline-block h-[0.78em] w-[0.78em] -translate-y-[0.06em]">
                  <Burst className="spin-slow h-full w-full" />
                </span>
              </span>
              <span style={rev(3)}>une</span>
            </span>
            <span className="block">
              <span className="text-orange" style={rev(4)}>image</span>
              <span className="ml-[0.18em] align-middle" style={rev(5)}>
                <span className="inline-block h-[0.62em] w-[1.05em] -translate-y-[0.05em] -rotate-6">
                  <Eye className="eye-blink h-full w-full" />
                </span>
              </span>
            </span>
            <span className="block">
              <span style={rev(6)}>aux</span>
            </span>
            <span className="block">
              <span style={rev(7)}>
                <span className="relative inline-block">
                  marques
                  <span aria-hidden className="absolute inset-x-0 top-[50%] h-[0.055em] -rotate-2 bg-orange" />
                </span>
              </span>
            </span>
            <span className="block">
              <span style={rev(8)}>à</span> <span style={rev(9)}>votre</span>
            </span>
            <span className="block">
              <span style={rev(10)}>
                histoire<span className="text-orange">.</span>
              </span>
              <span className="ml-[0.2em] align-middle" style={rev(11)}>
                <span className="inline-block h-[0.92em] w-[0.5em] -translate-y-[0.02em] rotate-[8deg]">
                  <Bolt className="h-full w-full" />
                </span>
              </span>
            </span>
          </span>

          {/* DESKTOP — flux inline */}
          <span className="hidden md:block">
            <span style={rev(0)}>Je</span> <span style={rev(1)}>donne</span>
            <span className="mx-[0.18em] align-middle" style={rev(2)}>
              <span className="inline-block h-[0.78em] w-[0.78em] -translate-y-[0.06em]">
                <Burst className="spin-slow h-full w-full" />
              </span>
            </span>
            <span style={rev(3)}>une</span> <span className="text-orange" style={rev(4)}>image</span>
            <span className="mx-[0.18em] align-middle" style={rev(5)}>
              <span className="inline-block h-[0.62em] w-[1.05em] -translate-y-[0.05em] -rotate-6">
                <Eye className="eye-blink h-full w-full" />
              </span>
            </span>
            <span style={rev(6)}>aux</span>{" "}
            <span style={rev(7)}>
              <span className="relative inline-block">
                marques
                <span aria-hidden className="absolute inset-x-0 top-[50%] h-[0.055em] -rotate-2 bg-orange" />
              </span>
            </span>{" "}
            <span style={rev(8)}>à</span>{" "}
            {/* votre + histoire restent sur la même ligne */}
            <span className="inline-block whitespace-nowrap">
              <span style={rev(9)}>votre</span>{" "}
              <span style={rev(10)}>
                histoire<span className="text-orange">.</span>
              </span>
              <span className="ml-[0.2em] align-middle" style={rev(11)}>
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
