"use client";

import { useState } from "react";

export default function YouTubeFacade({
  id,
  titre,
}: {
  id: string;
  titre: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [hqFallback, setHqFallback] = useState(false);

  const thumb = hqFallback
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  if (playing) {
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white`}
          title={titre}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Lire la vidéo — ${titre}`}
      className="group relative block aspect-video w-full overflow-hidden bg-ink"
    >
      {/* Vignette */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt={titre}
        draggable={false}
        onError={() => setHqFallback(true)}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />

      {/* Voile dégradé pour lisibilité */}
      <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/20 transition-colors duration-300 group-hover:from-ink/55" />

      {/* Bouton play brutaliste */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-20 w-20 items-center justify-center border-[3px] border-ink bg-accent text-ink shadow-[6px_6px_0_0_#0b0b0d] transition-all duration-150 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[10px_10px_0_0_#0b0b0d] md:h-24 md:w-24">
          <svg viewBox="0 0 24 24" className="ml-1 h-9 w-9 md:h-10 md:w-10" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>

      {/* Pastille label coin bas-gauche */}
      <span className="absolute bottom-3 left-3 flex items-center gap-2 border-2 border-ink bg-white px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-ink">
        <span className="h-2 w-2 bg-red" />
        Vidéo
      </span>
    </button>
  );
}
