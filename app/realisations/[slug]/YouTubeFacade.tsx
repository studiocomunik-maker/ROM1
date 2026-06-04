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
      className="group relative block aspect-video w-full overflow-hidden bg-black"
    >
      {/* Vignette */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt={titre}
        draggable={false}
        onError={() => setHqFallback(true)}
        className="h-full w-full object-cover"
      />

      {/* Bouton play rond — identique aux players MP4 du site */}
      <span className="absolute inset-0 flex items-center justify-center bg-coal/15 transition-colors group-hover:bg-coal/35">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-coal/70 text-paper backdrop-blur transition-transform group-hover:scale-110">
          <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
