"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "../../../utils/realisations";

const SIZES = "(min-width: 1024px) 64vw, 100vw";

export default function Gallery({ images, titre }: { images: GalleryImage[]; titre: string }) {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const n = images.length;

  if (!n) return null;
  const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));

  const onDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    setDrag(e.clientX - startX.current);
  };
  const onUp = () => {
    if (startX.current === null) return;
    const w = containerRef.current?.offsetWidth ?? 1;
    const d = drag;
    startX.current = null;
    setDragging(false);
    setDrag(0);
    if (Math.abs(d) > w * 0.18) setI((p) => clamp(p + (d < 0 ? 1 : -1)));
  };

  return (
    <div ref={containerRef} className="relative aspect-[3/2] w-full select-none overflow-hidden bg-black">
      {/* piste horizontale : les photos suivent le doigt, snap au relâcher */}
      <div
        className="flex h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
        style={{
          transform: `translateX(calc(${-i * 100}% + ${drag}px))`,
          transition: dragging ? "none" : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {images.map((img, k) => (
          <div key={k} className="relative h-full w-full shrink-0">
            <Image
              src={img.url}
              alt={titre}
              fill
              sizes={SIZES}
              draggable={false}
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="Image précédente"
            onClick={() => setI((p) => clamp(p - 1))}
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-coal/60 text-xl text-paper backdrop-blur transition-colors hover:bg-orange hover:text-coal disabled:opacity-30 md:left-5"
            disabled={i === 0}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Image suivante"
            onClick={() => setI((p) => clamp(p + 1))}
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-coal/60 text-xl text-paper backdrop-blur transition-colors hover:bg-orange hover:text-coal disabled:opacity-30 md:right-5"
            disabled={i === n - 1}
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-coal/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-paper backdrop-blur">
            {i + 1} / {n}
          </div>
        </>
      )}
    </div>
  );
}
