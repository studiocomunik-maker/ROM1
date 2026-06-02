"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EXPS, UNIVERS } from "../data";

export type PortfolioItem = {
  slug: string;
  titre: string;
  univers: string;
  exps: string[];
  cover_url: string | null;
};

/* Œil clignotant — version contour foncé pour fond clair */
function Eye({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <path
        d="M4 40 C30 6 90 6 116 40 C90 74 30 74 4 40 Z"
        fill="#ffffff"
        stroke="#0c0c0e"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="40" r="18" fill="#ff3d1f" />
      <circle cx="60" cy="40" r="7" fill="#0c0c0e" />
    </svg>
  );
}

export default function Portfolio({ items }: { items: PortfolioItem[] }) {
  const [u, setU] = useState("all");
  const [e, setE] = useState("all");

  const list = items.filter(
    (p) => (u === "all" || p.univers === u) && (e === "all" || p.exps.includes(e))
  );

  const Select = ({
    value,
    onChange,
    allLabel,
    options,
  }: {
    value: string;
    onChange: (v: string) => void;
    allLabel: string;
    options: Record<string, string>;
  }) => (
    <div className="group relative">
      <select
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        className="cursor-pointer appearance-none border border-coal bg-white py-2.5 pl-4 pr-10 font-mono text-[11px] uppercase tracking-[0.1em] text-coal transition-colors group-hover:bg-coal group-hover:text-white"
      >
        <option value="all">{allLabel}</option>
        {Object.entries(options).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-coal transition-colors group-hover:text-white">
        ▾
      </span>
    </div>
  );

  return (
    <section id="portfolio" className="relative z-10 bg-white text-coal">
      {/* Clignement irrégulier (gaps ~3s / 4s / 1s sur un cycle de 8s) */}
      <style>{`
        @keyframes blinkrand {
          0%, 36%, 39%, 86%, 89%, 97%, 100% { transform: scaleY(1); }
          37.5%, 87.5%, 98.5% { transform: scaleY(0.08); }
        }
        .eye-blink-rand { animation: blinkrand 8s infinite; transform-origin: 50% 50%; }
      `}</style>

      {/* En-tête centré (titre au-dessus des filtres), centré verticalement */}
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 py-20 text-center md:px-12">
        <div>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Portfolio
          </p>
          <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2.4rem,8vw,6rem)]">
            Réalisations
            <span className="relative z-10 -ml-[0.38em] -mt-[20px] inline-block h-[0.46em] w-[0.78em] -translate-y-[0.42em] rotate-[5deg] align-baseline">
              <Eye className="eye-blink-rand h-full w-full" />
            </span>
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Select value={u} onChange={setU} allLabel="Tous les univers" options={UNIVERS} />
          <Select value={e} onChange={setE} allLabel="Toutes les expertises" options={EXPS} />
        </div>
      </div>

      {/* Grille full-wide, angles francs — texte au survol sur calque noir 50% */}
      <div className="grid grid-cols-2 gap-px bg-coal/10 sm:grid-cols-3">
        {list.map((p) => (
          <Link
            key={p.slug}
            href={`/realisations/${p.slug}`}
            className="group relative block aspect-[4/3] overflow-hidden bg-coal"
          >
            {p.cover_url ? (
              <Image
                src={p.cover_url}
                alt={p.titre}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-coal to-night">
                <span className="font-display text-2xl uppercase tracking-tight text-paper/15">
                  rom1
                </span>
              </div>
            )}
            {/* calque noir 50% + texte (titre + expertises), apparaît au survol */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 p-5 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <h3 className="font-display text-xl uppercase leading-none tracking-tight text-paper md:text-2xl">
                {p.titre}
              </h3>
              <div className="flex flex-wrap justify-center gap-1.5">
                {p.exps.map((x) => (
                  <span
                    key={x}
                    className="border border-paper/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-paper"
                  >
                    {EXPS[x] ?? x}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {list.length === 0 && (
        <p className="px-6 py-16 text-center font-mono text-xs uppercase tracking-[0.15em] text-coal/40 md:px-12">
          Aucun projet pour ce filtre.
        </p>
      )}
    </section>
  );
}
