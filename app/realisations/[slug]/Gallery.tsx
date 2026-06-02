"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "../../../utils/realisations";

const SIZES = "(min-width: 1024px) 64vw, 100vw";

export default function Gallery({ images, titre }: { images: GalleryImage[]; titre: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return null;
  const cur = images[Math.min(i, images.length - 1)];
  const go = (d: number) => setI((p) => (p + d + images.length) % images.length);

  return (
    <div className="relative w-full select-none bg-black">
      {cur.w && cur.h ? (
        <Image
          src={cur.url}
          alt={titre}
          width={cur.w}
          height={cur.h}
          sizes={SIZES}
          className="block h-auto w-full"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cur.url} alt={titre} loading="lazy" className="block h-auto w-full" />
      )}

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
            {(i % images.length) + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
