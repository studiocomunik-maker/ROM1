"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import References from "./References";

gsap.registerPlugin(ScrollTrigger);

type Scene = {
  id: string;
  num: string;
  kicker: string;
  title: string;
  line: string;
  tags: string[];
  cta: { label: string; href: string };
  bg: string;
};

const scenes: Scene[] = [
  {
    id: "identite",
    num: "01",
    kicker: "Direction artistique",
    title: "Identité",
    line: "Une marque, c’est d’abord un regard.",
    tags: ["DA", "Logo", "Charte"],
    cta: { label: "Voir les identités", href: "#contact" },
    bg: "linear-gradient(135deg, #2a2620 0%, #4a3f2e 55%, #1a1814 100%)",
  },
  {
    id: "photo",
    num: "02",
    kicker: "Photographie",
    title: "Photo",
    line: "L’image qui donne envie.",
    tags: ["Vin", "Produit", "Corporate"],
    cta: { label: "Voir les photos", href: "#contact" },
    bg: "linear-gradient(135deg, #1c2a1e 0%, #3c5a32 55%, #14160f 100%)",
  },
  {
    id: "video",
    num: "03",
    kicker: "Vidéo & Drone",
    title: "Vidéo & Drone",
    line: "Raconter en mouvement, au sol comme dans les airs.",
    tags: ["Film de marque", "Drone", "Montage"],
    cta: { label: "Voir le showreel", href: "#contact" },
    bg: "linear-gradient(135deg, #16222e 0%, #234a63 55%, #0e1620 100%)",
  },
  {
    id: "motion",
    num: "04",
    kicker: "Motion design",
    title: "Motion",
    line: "Le motion qui habite la scène.",
    tags: ["Écrans de scène", "Spectacle", "Animation"],
    cta: { label: "Voir le motion", href: "#contact" },
    bg: "linear-gradient(135deg, #241630 0%, #5a2a6b 55%, #160e20 100%)",
  },
  {
    id: "print",
    num: "05",
    kicker: "Print",
    title: "Print",
    line: "Du fichier à l’objet, sans mauvaise surprise.",
    tags: ["Édition", "Packaging", "Étiquettes"],
    cta: { label: "Voir les imprimés", href: "#contact" },
    bg: "linear-gradient(135deg, #2b2823 0%, #6b6051 55%, #1a1813 100%)",
  },
  {
    id: "web",
    num: "06",
    kicker: "Web",
    title: "Web",
    line: "Votre identité mérite un site à sa hauteur.",
    tags: ["Sites sur-mesure"],
    cta: {
      label: "Comment je fabrique vos sites → pixelstore.fr",
      href: "https://pixelstore.fr",
    },
    bg: "linear-gradient(135deg, #15262a 0%, #1f5a5a 55%, #0e1819 100%)",
  },
];

const WIN = 2.2; // scroll-time window per scene
const HERO = 2.6; // scroll-time before the first métier

export default function StoryStage() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: track.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          pin: stage.current,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (progress.current)
              gsap.set(progress.current, { scaleX: self.progress });
          },
        },
      });

      // Hero slides out to the left
      tl.to(
        "[data-hero]",
        { xPercent: -70, opacity: 0, ease: "power2.in", duration: 1 },
        HERO - 1.4
      );

      scenes.forEach((s, k) => {
        const start = HERO + k * WIN;

        // Background scene fades in and stays (newest on top)
        tl.fromTo(
          `[data-plate="${k}"]`,
          { opacity: 0 },
          { opacity: 1, duration: 0.7 },
          start - 0.2
        );

        if (s.id === "web") {
          // Web beat: the laptop opens and rotates on itself
          tl.fromTo(
            `[data-scene="${k}"]`,
            { xPercent: 70, opacity: 0 },
            { xPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
            start
          );
          tl.fromTo(
            "[data-lid]",
            { rotateX: -92 },
            { rotateX: 0, duration: 0.9, ease: "power2.out" },
            start + 0.2
          );
          tl.fromTo(
            "[data-laptop]",
            { rotateY: -28 },
            { rotateY: 332, duration: 1.7, ease: "none" },
            start + 0.9
          );
        } else {
          // Métier beat: title enters from the right, exits to the left
          tl.fromTo(
            `[data-scene="${k}"]`,
            { xPercent: 80, opacity: 0 },
            { xPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
            start
          );
          tl.to(
            `[data-scene="${k}"]`,
            { xPercent: -80, opacity: 0, duration: 0.8, ease: "power3.in" },
            start + WIN - 0.8
          );
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const trackHeight = scenes.length * 120 + 220; // vh

  return (
    <div ref={root}>
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="flex items-center justify-between px-6 py-5 md:px-10">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">rom1</span>
            <span className="hidden text-xs uppercase tracking-[0.25em] text-muted sm:inline">
              Romain Renoux
            </span>
          </a>
          <a
            href="#contact"
            className="rounded-full border border-paper/25 px-4 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
          >
            Contact
          </a>
        </div>
        {/* Scroll progress bar */}
        <div
          ref={progress}
          className="h-px origin-left scale-x-0 bg-accent"
          style={{ transformOrigin: "left" }}
        />
      </header>

      {/* SCROLL TRACK — drives the pinned timeline */}
      <section
        id="top"
        ref={track}
        style={{ height: `${trackHeight}vh` }}
        className="relative"
      >
        <div
          ref={stage}
          className="grain relative h-screen w-full overflow-hidden"
          style={{
            background:
              "radial-gradient(120% 120% at 70% 20%, #1a1a20 0%, #0b0b0d 60%)",
          }}
        >
          {/* Background scene plates */}
          {scenes.map((s, k) => (
            <div
              key={s.id}
              data-plate={k}
              className="absolute inset-0 opacity-0"
              style={{ background: s.bg }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(11,11,13,0.85) 0%, rgba(11,11,13,0.1) 45%, rgba(11,11,13,0.3) 100%)",
                }}
              />
            </div>
          ))}

          {/* Media-slot hint */}
          <span className="absolute right-6 top-20 z-30 rounded-full border border-paper/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted md:right-10">
            ▸ Emplacement vidéo scrubbée au scroll
          </span>

          {/* HERO */}
          <div
            data-hero
            className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-10"
          >
            <div className="mx-auto w-full max-w-[1600px]">
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">
                Romain Renoux · Beaujolais
              </p>
              <h1 className="max-w-5xl text-[2.7rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-8xl">
                Donner une image
                <br />
                aux marques.
                <br />
                <span className="text-muted">De l’idée à l’écran.</span>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg">
                Une histoire en six temps — direction artistique, photo, vidéo,
                motion, print et web.
              </p>
              <p className="mt-10 text-[10px] uppercase tracking-[0.3em] text-muted">
                ↓ Faites défiler
              </p>
            </div>
          </div>

          {/* MÉTIER SCENES */}
          {scenes.map((s, k) => (
            <div
              key={s.id}
              data-scene={k}
              className="absolute inset-0 z-20 flex items-end px-6 pb-20 opacity-0 md:px-10 md:pb-24"
            >
              <div className="mx-auto w-full max-w-[1600px]">
                {s.id === "web" ? (
                  <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
                    <Laptop />
                    <div className="lg:pb-4 lg:text-right">
                      <p className="mb-3 text-xs uppercase tracking-[0.28em] text-accent">
                        {s.num} — {s.kicker}
                      </p>
                      <h2 className="text-5xl font-semibold tracking-tight sm:text-7xl">
                        {s.title}
                      </h2>
                      <p className="mt-4 max-w-md text-lg text-paper/80">
                        {s.line}
                      </p>
                      <a
                        href={s.cta.href}
                        className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] transition-colors hover:text-accent"
                      >
                        {s.cta.label}
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="pointer-events-none absolute right-4 top-1/4 -z-0 select-none text-[26vw] font-bold leading-none text-paper/[0.05] md:right-10 md:text-[18vw]">
                      {s.num}
                    </span>
                    <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-accent">
                      <span className="font-mono">{s.num}</span>
                      <span className="h-px w-8 bg-accent/50" />
                      {s.kicker}
                    </p>
                    <h2 className="text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl">
                      {s.title}
                    </h2>
                    <p className="mt-5 max-w-lg text-lg text-paper/80 md:text-xl">
                      {s.line}
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-paper/20 px-3 py-1 text-xs uppercase tracking-[0.14em] text-paper/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RÉFÉRENCES — sur l'accueil, avant le CTA */}
      <References />

      {/* CONTACT — normal flow after the story */}
      <section
        id="contact"
        className="relative flex min-h-screen flex-col justify-center px-6 py-24 md:px-10"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 80%, #16161b 0%, #0b0b0d 60%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1600px]">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">
            Beaujolais · Lyon · Rhône — et partout ailleurs
          </p>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Parlons de votre projet.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Une identité, une série photo, un film, un site ? Dites-moi en deux
            mots ce que vous avez en tête.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <a
              href="mailto:studiocomunik@gmail.com"
              className="rounded-full bg-accent px-7 py-3 text-sm font-medium uppercase tracking-[0.16em] text-ink transition-transform hover:scale-[1.03]"
            >
              Démarrer un projet
            </a>
            <a
              href="https://pixelstore.fr"
              className="text-sm uppercase tracking-[0.16em] text-muted transition-colors hover:text-paper"
            >
              Côté web → pixelstore.fr
            </a>
          </div>
          <footer className="mt-20 flex flex-col gap-2 border-t border-paper/10 pt-8 text-xs uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>© Romain Renoux — rom1.fr</span>
            <span>Avec Céline Kbaier · Direction artistique, image &amp; web</span>
          </footer>
        </div>
      </section>
    </div>
  );
}

/* CSS-3D laptop that opens (lid) and spins (rotateY) — driven by GSAP */
function Laptop() {
  return (
    <div style={{ perspective: "1200px" }} className="shrink-0">
      <div
        data-laptop
        className="relative"
        style={{ transformStyle: "preserve-3d", width: 340 }}
      >
        {/* Screen / lid */}
        <div
          data-lid
          className="relative h-[210px] w-[340px]"
          style={{
            transformOrigin: "bottom center",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front face — the screen */}
          <div
            className="absolute inset-0 overflow-hidden rounded-md border border-white/10"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, #0e2a2a 0%, #1f5a5a 55%, #0c1a1a 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-white/30" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="ml-3 rounded bg-white/10 px-2 py-0.5 text-[9px] tracking-widest text-paper/60">
                pixelstore.fr
              </span>
            </div>
            <div className="flex h-[160px] flex-col items-center justify-center gap-3">
              <span className="text-2xl font-semibold tracking-tight text-paper">
                pixelstore
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-paper/50">
                La division web de rom1
              </span>
            </div>
          </div>
          {/* Back face — lid shell */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-md border border-white/5"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #2a2a30 0%, #141418 100%)",
            }}
          >
            <span className="text-sm font-semibold tracking-[0.2em] text-paper/40">
              rom1
            </span>
          </div>
        </div>
        {/* Base */}
        <div
          className="mx-auto h-3 w-[360px] -translate-x-[10px] rounded-b-lg"
          style={{
            background: "linear-gradient(#3a3a40, #17171b)",
            boxShadow: "0 14px 30px rgba(0,0,0,0.55)",
          }}
        />
      </div>
    </div>
  );
}
