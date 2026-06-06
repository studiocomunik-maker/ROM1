"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoPlayer({
  url,
  poster,
  w,
  h,
  titre,
  loop,
}: {
  url: string;
  poster?: string;
  w?: number;
  h?: number;
  titre: string;
  loop?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const loopRef = useRef<HTMLVideoElement>(null);
  const vertical = !!(w && h && h > w);

  // Mode loop : lecture auto muette quand la vidéo entre à l'écran, pause à la
  // sortie (économise CPU/batterie). Pas de son.
  useEffect(() => {
    if (!loop) return;
    const el = loopRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loop]);

  // Vertical : recadré dans un wrapper 600px max + 15px de padding haut/bas.
  // Paysage : pleine largeur.
  const outer = vertical ? "flex justify-center bg-black py-[15px]" : "block";
  const media = vertical ? "max-h-[600px] w-auto" : "block h-auto w-full";

  // Mini-vidéo de scroll : lecture auto + boucle + muet, sans contrôles ni cover.
  if (loop) {
    return (
      <div className={outer}>
        <video
          ref={loopRef}
          className={media}
          src={url}
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={titre}
        />
      </div>
    );
  }

  // Film : poster + bouton play, lecture au clic (avec son et contrôles).
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
