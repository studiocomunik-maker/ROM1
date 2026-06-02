"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "../../../utils/realisations";

const SIZES = "(min-width: 1024px) 64vw, 100vw";

export default function Gallery({ images, titre }: { images: GalleryImage[]; titre: string }) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);

  if (!images.length) return null;
  const idx = Math.min(i, images.length - 1);
  const cur = images[idx];
  const go = (d: number) => setI((p) => (((p + d) % images.length) + images.length) % images.length);

  // Cliqué-glissé / swipe : seuil de 40px pour changer de slide.
  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className="relative aspect-[3/2] w-full cursor-grab touch-pan-y select-none overflow-hidden bg-black active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Cadre paysage fixe : recadrage centré (photo verticale croppée au centre). */}
      <Image
        key={cur.url}
        src={cur.url}
        alt={titre}
        fill
        sizes={SIZES}
        draggable={false}
        className="object-cover object-center"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Image précédente"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-coal/60 text-xl text-paper backdrop-blur transition-colors hover:bg-orange hover:text-coal md:left-5"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Image suivante"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-coal/60 text-xl text-paper backdrop-blur transition-colors hover:bg-orange hover:text-coal md:right-5"
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-coal/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-paper backdrop-blur">
            {idx + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
