"use client";

import { useState } from "react";

export default function VideoPlayer({
  url,
  poster,
  w,
  h,
  titre,
}: {
  url: string;
  poster?: string;
  w?: number;
  h?: number;
  titre: string;
}) {
  const [playing, setPlaying] = useState(false);
  const vertical = !!(w && h && h > w);

  // Vertical : recadré dans un wrapper 600px max + 15px de padding haut/bas.
  // Paysage : pleine largeur.
  const outer = vertical ? "flex justify-center bg-black py-[15px]" : "block";
  const media = vertical ? "max-h-[600px] w-auto" : "block h-auto w-full";

  return (
    <div className={outer}>
      {playing || !poster ? (
        <video
          className={media}
          src={url}
          poster={poster}
          controls
          autoPlay={playing}
          playsInline
          preload="metadata"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Lire la vidéo"
          className="group relative block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt={titre} draggable={false} className={media} />
          <span className="absolute inset-0 flex items-center justify-center bg-coal/15 transition-colors group-hover:bg-coal/35">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-coal/70 text-paper backdrop-blur transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
