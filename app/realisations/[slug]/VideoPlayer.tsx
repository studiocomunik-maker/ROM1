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
  const userMuted = useRef(false); // l'utilisateur a coupé le son volontairement
  const raf = useRef(0);
  const vertical = !!(w && h && h > w);

  // Vertical : recadré dans un wrapper 600px max + 15px de padding haut/bas.
  // Paysage : pleine largeur.
  const outer = vertical ? "flex justify-center bg-black py-[15px]" : "block";
  const media = vertical ? "max-h-[600px] w-auto" : "block h-auto w-full";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // LOOP : mini-vidéo de scroll, lecture auto muette à l'entrée, pause à la sortie.
    if (loop) {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) el.play().catch(() => {});
          else el.pause();
        },
        { threshold: 0.25 },
      );
      io.observe(el);
      return () => io.disconnect();
    }

    // FILM : à l'entrée → lecture + fondu entrant du son (si le navigateur
    // l'autorise et si l'utilisateur n'a pas coupé). À la sortie → fondu sortant
    // puis pause. L'utilisateur garde la main via les contrôles (bouton muet).
    const fade = (to: number, after?: () => void) => {
      cancelAnimationFrame(raf.current);
      const from = el.volume;
      const t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / 1100); // ~1,1 s, discret
        el.volume = from + (to - from) * k;
        if (k < 1) raf.current = requestAnimationFrame(tick);
        else after?.();
      };
      raf.current = requestAnimationFrame(tick);
    };

    // On ne mute jamais nous-mêmes → muted=true ne peut venir que de l'utilisateur.
    const onVol = () => {
      userMuted.current = el.muted;
    };
    el.addEventListener("volumechange", onVol);

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.play().catch(() => {});
          const active = (
            navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }
          ).userActivation?.hasBeenActive;
          if (!userMuted.current && active) {
            el.muted = false;
            el.volume = 0;
            fade(1); // le son monte doucement
          }
        } else if (!el.muted) {
          fade(0, () => el.pause()); // le son redescend puis pause
        } else {
          el.pause();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
      el.removeEventListener("volumechange", onVol);
    };
  }, [loop]);

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
