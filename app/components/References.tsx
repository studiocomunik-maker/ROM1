"use client";

import { useState } from "react";

type Secteur = "Vin" | "Spectacle" | "Industrie" | "Hôtellerie-Restauration";

type Projet = {
  nom: string;
  secteur: Secteur;
  metiers: string[];
  bg: string;
};

const projets: Projet[] = [
  {
    nom: "Domaine en biodynamie",
    secteur: "Vin",
    metiers: ["DA", "PHOTO", "WEB"],
    bg: "linear-gradient(135deg, #1c2a1e 0%, #3c5a32 60%, #14160f 100%)",
  },
  {
    nom: "Château — Rhône Nord",
    secteur: "Vin",
    metiers: ["PHOTO", "VIDÉO", "WEB"],
    bg: "linear-gradient(135deg, #2a2620 0%, #4a3f2e 60%, #1a1814 100%)",
  },
  {
    nom: "Blackmoon — écrans de scène",
    secteur: "Spectacle",
    metiers: ["MOTION", "VIDÉO"],
    bg: "linear-gradient(135deg, #241630 0%, #5a2a6b 60%, #160e20 100%)",
  },
  {
    nom: "Festival — habillage live",
    secteur: "Spectacle",
    metiers: ["MOTION", "DA"],
    bg: "linear-gradient(135deg, #1a1430 0%, #3b2a6b 60%, #100e20 100%)",
  },
  {
    nom: "Guignard — robotisation",
    secteur: "Industrie",
    metiers: ["DA", "WEB", "PHOTO"],
    bg: "linear-gradient(135deg, #16222e 0%, #234a63 60%, #0e1620 100%)",
  },
  {
    nom: "Imprimerie — refonte marque",
    secteur: "Industrie",
    metiers: ["PRINT", "DA"],
    bg: "linear-gradient(135deg, #1a2228 0%, #2f4654 60%, #0e1418 100%)",
  },
  {
    nom: "Hôtel — image de marque",
    secteur: "Hôtellerie-Restauration",
    metiers: ["PHOTO", "WEB"],
    bg: "linear-gradient(135deg, #2b2823 0%, #6b6051 60%, #1a1813 100%)",
  },
  {
    nom: "Restaurant — identité & carte",
    secteur: "Hôtellerie-Restauration",
    metiers: ["DA", "PHOTO", "PRINT"],
    bg: "linear-gradient(135deg, #2c241c 0%, #6b4f30 60%, #1a130d 100%)",
  },
];

const filtres: ("Tout" | Secteur)[] = [
  "Tout",
  "Vin",
  "Spectacle",
  "Industrie",
  "Hôtellerie-Restauration",
];

const marqueeWords = [
  "VIN",
  "SPECTACLE",
  "INDUSTRIE",
  "HÔTELLERIE",
  "RESTAURATION",
  "DA",
  "PHOTO",
  "VIDÉO",
  "DRONE",
  "MOTION",
  "PRINT",
  "WEB",
];

export default function References() {
  const [actif, setActif] = useState<"Tout" | Secteur>("Tout");
  const liste =
    actif === "Tout" ? projets : projets.filter((p) => p.secteur === actif);

  return (
    <section
      id="references"
      className="relative border-y-4 border-ink bg-white px-5 py-20 text-ink md:px-8 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        {/* Eyebrow row */}
        <div className="flex items-end justify-between border-b-4 border-ink pb-4 font-mono text-xs uppercase tracking-[0.2em]">
          <span>★ Références</span>
          <span>[ {String(liste.length).padStart(2, "0")} projets ]</span>
        </div>

        {/* Big brutalist title */}
        <h2 className="mt-8 font-black uppercase leading-[0.84] tracking-tight">
          <span className="block text-[15vw] sm:text-[11vw] lg:text-[8.5rem]">
            Le travail
          </span>
          <span className="block text-[15vw] sm:text-[11vw] lg:text-[8.5rem]">
            parle{" "}
            <span className="inline-block -rotate-2 bg-accent px-3 pb-2 pt-3 leading-[0.9] text-white shadow-[6px_6px_0_0_#0b0b0d]">
              de lui-même
            </span>
          </span>
        </h2>

        {/* Marquee strip */}
        <div className="mt-10 overflow-hidden border-y-4 border-ink bg-ink">
          <div className="marquee-track flex w-max gap-8 py-3 font-mono text-sm font-bold uppercase tracking-[0.15em] text-white">
            {[...marqueeWords, ...marqueeWords].map((w, i) => (
              <span key={i} className="flex items-center gap-8">
                {w}
                <span className="text-accent">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-wrap gap-3">
          {filtres.map((f) => (
            <button
              key={f}
              onClick={() => setActif(f)}
              className={`border-[3px] border-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] transition-all duration-100 ${
                actif === f
                  ? "bg-ink text-white shadow-[4px_4px_0_0_#d9a441]"
                  : "bg-white text-ink hover:-translate-y-0.5 hover:bg-accent hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {liste.map((p, i) => (
            <a
              key={p.nom}
              href="#contact"
              className="group relative border-[3px] border-ink bg-white transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#0b0b0d]"
            >
              {/* Image area */}
              <div
                className="relative aspect-[5/3] overflow-hidden"
                style={{ background: p.bg }}
              >
                {/* Index badge */}
                <span className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center border-b-[3px] border-r-[3px] border-ink bg-white font-mono text-xl font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Secteur sticker */}
                <span className="absolute right-3 top-3 rotate-3 border-2 border-ink bg-accent px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                  {p.secteur}
                </span>
              </div>

              {/* Info bar */}
              <div className="border-t-[3px] border-ink bg-white p-4 transition-colors duration-150 group-hover:bg-accent">
                <h3 className="text-lg font-black uppercase leading-tight tracking-tight group-hover:text-white">
                  {p.nom}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs font-bold">
                  {p.metiers.map((m) => (
                    <span key={m} className="group-hover:text-white">
                      [{m}]
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-10 font-mono text-xs uppercase tracking-[0.15em] text-ink/50">
          ▸ Visuels temporaires — emplacements pour vos vraies réalisations
        </p>
      </div>
    </section>
  );
}
