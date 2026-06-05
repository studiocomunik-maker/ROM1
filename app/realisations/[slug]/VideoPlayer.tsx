"use client";

import { useEffect, useRef } from "react";

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
  const ref = useRef<HTMLVideoElement>(null);
  const vertical = !!(w && h && h > w);

  // Vertical : recadré dans un wrapper 600px max + 15px de padding haut/bas.
  // Paysage : pleine largeur.
  const outer = vertical ? "flex justify-center bg-black py-[15px]" : "block";
  const media = vertical ? "max-h-[600px] w-auto" : "block h-auto w-full";

  // Lecture auto quand la vidéo entre à l'écran, pause quand elle en sort.
  // L'autoplay navigateur impose le muet au départ ; pour les films (non-loop)
  // les contrôles permettent d'activer le son et de naviguer.
  useEffect(() => {
    const el = ref.current;
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
  }, []);

  return (
    <div className={outer}>
      <video
        ref={ref}
        className={media}
        src={url}
        poster={loop ? undefined : poster}
        muted
        loop={loop}
        controls={!loop}
        playsInline
        preload="metadata"
        aria-label={titre}
      />
    </div>
  );
}
