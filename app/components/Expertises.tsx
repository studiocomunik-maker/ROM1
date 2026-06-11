"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { metiers, univers, type Metier, type Univers } from "../data";
import Picto from "./Picto";

type Item = Metier | Univers;

function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 120" className={className} fill="none" aria-hidden>
      <path
        d="M6 70 C30 10 70 8 78 48 C84 78 50 96 40 70 C32 48 70 30 120 40 C170 50 200 30 214 14"
        stroke="#ff3d1f"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Courbe de liaison métiers → univers (simple, sans flèche) */
function Curve({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 110" className={className} fill="none" aria-hidden>
      <path
        d="M52 4 C92 34 14 66 52 106"
        stroke="#ff3d1f"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Expertises() {
  const [hov, setHov] = useState<string | null>(null);
  const dim = (k: string) => hov !== null && hov !== k;

  // Révélation en cascade des lignes quand la section entre dans l'écran
  const [shown, setShown] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Parallax HORIZONTAL léger & un peu aléatoire sur chaque ligne.
  // Les positions sont mesurées au montage + resize (jamais pendant le scroll :
  // lire le layout entre deux écritures de transform force un reflow à chaque frame).
  const rowsRef = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const rows = rowsRef.current.filter(Boolean) as HTMLLIElement[];
    // amplitude (30–70px) et sens aléatoires par ligne
    const factors = rows.map(() => (Math.random() * 2 - 1) * (30 + Math.random() * 40));
    // centre de chaque ligne en coordonnées document (translateX n'y change rien)
    let centers: number[] = [];
    const measure = () => {
      const sy = window.scrollY;
      centers = rows.map((el) => {
        const r = el.getBoundingClientRect();
        return sy + r.top + r.height / 2;
      });
    };
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      const sy = window.scrollY;
      rows.forEach((el, i) => {
        let prog = (centers[i] - sy - vh / 2) / vh;
        prog = Math.max(-1, Math.min(1, prog));
        el.style.transform = `translateX(${(prog * factors[i]).toFixed(1)}px)`;
      });
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

  const cursorRef = useRef<HTMLDivElement>(null);
  const onMove = (ev: React.MouseEvent) => {
    if (cursorRef.current)
      cursorRef.current.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px)`;
  };

  const row = (e: Item, big: boolean, gi: number, href?: string) => {
    const titleCls = `flex items-center whitespace-nowrap font-display uppercase leading-[0.9] tracking-[-0.02em] transition-opacity duration-300 ${
      big ? "text-[clamp(1.5rem,5vw,3.6rem)]" : "text-[clamp(1.1rem,3.8vw,2.8rem)] gap-3"
    }`;
    const titleStyle = { opacity: dim(e.key) ? 0.18 : 1, color: e.featured ? "#ff3d1f" : undefined };
    const inner = (
      <>
        {e.featured && <span className="inline-block h-2 w-2 rounded-full bg-orange" />}
        {e.t}
      </>
    );
    return (
    <li
      key={e.key}
      ref={(el) => {
        rowsRef.current[gi] = el;
      }}
      onMouseEnter={() => setHov(e.key)}
      onMouseLeave={() => setHov(null)}
      style={{ "--off": e.off, willChange: "transform" } as React.CSSProperties}
      className="group flex cursor-none items-center py-1 ml-[calc(var(--off)/3)] md:ml-[var(--off)]"
    >
      {/* MASQUE : la ligne monte depuis un bord clippé (le li garde sa parallaxe translateX).
         pt/-mt + lineHeight : marge pour ne pas rogner les accents (É, À). */}
      <span className="block overflow-hidden" style={{ lineHeight: 1, paddingTop: "0.14em", marginTop: "-0.14em" }}>
        <span
          className="flex items-center gap-4 will-change-transform"
          style={{
            transitionProperty: "transform",
            transitionDuration: "0.8s",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: `${gi * 0.15}s`,
            transform: shown ? "translateY(0)" : "translateY(110%)",
          }}
        >
          {href ? (
            <Link href={href} className={titleCls} style={titleStyle}>
              {inner}
            </Link>
          ) : (
            <span className={titleCls} style={titleStyle}>
              {inner}
            </span>
          )}
          {/* description sur le côté */}
          <span
            className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/70 transition-opacity duration-300 sm:block"
            style={{ opacity: dim(e.key) ? 0.25 : hov === e.key ? 1 : 0.8 }}
          >
            {e.sub}
          </span>
        </span>
      </span>
    </li>
    );
  };

  return (
    <>
      <section
        onMouseMove={onMove}
        className="relative z-10 overflow-hidden bg-coal px-6 py-16 text-paper md:min-h-screen md:px-12 md:py-28"
      >
        {/* Wrapper centré sur grand écran — décalages internes conservés */}
        <div ref={listRef} className="relative z-10 mx-auto w-full max-w-[1100px]">
          {/* Ordre : mot MÉTIERS → spirale → liste */}
          <p className="mb-3 text-center font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Métiers
          </p>
          <Squiggle className="mx-auto mb-4 w-[120px] -translate-x-6 -rotate-3 opacity-90 md:mb-6 md:w-[240px] md:-translate-x-12" />

          <ul>{metiers.map((e, i) => row(e, true, i, `/metiers/${e.key}`))}</ul>

          {/* courbe de liaison métiers → univers — respiration */}
          <Curve className="mx-auto my-3 w-[52px] md:my-6 md:w-[100px]" />

          {/* UNIVERS */}
          <p className="mb-5 text-center font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Univers
          </p>
          <ul>{univers.map((e, i) => row(e, false, metiers.length + i, `/univers/${e.key}`))}</ul>
        </div>

        <p className="pointer-events-none absolute bottom-6 right-6 z-10 text-right font-mono text-[10px] uppercase leading-[1.4] tracking-[0.1em] text-paper/60 md:right-12">
          rom1.fr
          <br />
          est. 2005
          <br />
          beaujolais
        </p>
      </section>

      {/* Picto = curseur, au survol d'un titre */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[60]"
        style={{ transform: "translate(-200px,-200px)" }}
        aria-hidden
      >
        {hov && (
          <Picto
            k={hov}
            className="h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-orange drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          />
        )}
      </div>
    </>
  );
}
