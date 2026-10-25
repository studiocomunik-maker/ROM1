"use client";

import { useEffect, useRef } from "react";
import type { SceneApi } from "./expertisesScene";

/* Dessin technique filaire du métier dans le hero de /metiers/<key>
   (même scène que la section Métiers de l'accueil, sans la grille de fond).
   Calque entre la photo (z-0) et le texte (z-10) : le titre passe devant.
   Le dessin se cale sur le repère [data-hero-stage] (centré dans le hero). */
export default function MetierHeroScene({ metierKey }: { metierKey: string }) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const hero = layer?.parentElement;
    const stage = hero?.querySelector<HTMLElement>("[data-hero-stage]");
    if (!layer || !hero || !stage) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene: SceneApi | null = null, cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      scene?.setVisible(visible);
    });
    io.observe(layer);
    import("./expertisesScene").then(({ createExpertisesScene }) => {
      if (cancelled) return;
      try {
        scene = createExpertisesScene({ section: layer, stage, keys: [metierKey], readout: null, reduce, grid: false, events: hero, flash: true });
      } catch {
        return; // pas de WebGL : la photo reste seule
      }
      scene.goTo(0); // le dessin se trace à l'arrivée
      scene.setVisible(visible);
    });
    return () => {
      cancelled = true;
      io.disconnect();
      scene?.destroy();
    };
  }, [metierKey]);

  return <div ref={layerRef} aria-hidden className="pointer-events-none absolute inset-0 z-[5]" />;
}
