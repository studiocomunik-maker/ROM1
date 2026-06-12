/* Accueil — registre PANGRAMS. Chaque mot se révèle EN MASQUE (rise from mask)
   au chargement, en cascade (gros délai). Animations 100% CSS (jouent au montage). */

import type { ReactNode } from "react";

function Eye({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <path d="M4 40 C30 6 90 6 116 40 C90 74 30 74 4 40 Z" fill="#f4f3ee" />
      <circle cx="60" cy="40" r="20" fill="#ff3d1f" />
      <circle cx="60" cy="40" r="8" fill="#0c0c0e" />
      <path d="M2 40 C28 8 92 8 118 40" fill="none" stroke="#0c0c0e" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Bolt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 110" className={className} aria-hidden>
      <path d="M40 2 L8 60 L32 60 L24 108 L64 44 L38 44 Z" fill="#ff3d1f" />
    </svg>
  );
}

function Burst({ className = "" }: { className?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 16;
    const r = i % 2 === 0 ? 48 : 20;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <polygon points={pts} fill="#ff3d1f" />
      <circle cx="50" cy="50" r="14" fill="#f4f3ee" />
    </svg>
  );
}

const STEP = 0.16; // gros délai entre chaque mot (s)
const d = (i: number) => ({ animationDelay: `${i * STEP}s` });
const STRIKE_DELAY = "1.7s"; // le trait se dessine une fois « aux marques » montés

// Mot en MASQUE : le bord clippe, la lettre monte depuis le bas (CSS heroRise).
// pt/-mt + lineHeight : marge haute pour ne pas rogner les accents (À, É, le point).
function Mask({ i, children }: { i: number; children: ReactNode }) {
  return (
    <span
      className="inline-block overflow-hidden align-bottom"
      style={{ lineHeight: 1, paddingTop: "0.14em", marginTop: "-0.14em" }}
    >
      <span className="hero-rise inline-block will-change-transform" style={d(i)}>
        {children}
      </span>
    </span>
  );
}

export default function Accueil({
  heroVideoUrl,
  heroVideoPoster,
}: {
  heroVideoUrl?: string | null;
  heroVideoPoster?: string | null;
} = {}) {
  return (
    <section className="grain sticky top-0 z-0 flex h-screen w-full flex-col overflow-hidden bg-coal text-paper">
      {/* Vidéo de fond (optionnelle) : monochrome + voile sombre pour la
          lisibilité de la punchline. Réglée depuis le back-office. */}
      {heroVideoUrl && (
        <>
          <video
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover grayscale"
            src={heroVideoUrl}
            poster={heroVideoPoster ?? undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 z-0 bg-coal/80" />
        </>
      )}

      <header className="relative z-10 flex items-start justify-end px-6 pt-7 md:px-12">
        {/* mt mobile : passe sous la ligne logo/Menu ; md : même ligne, mr
           laisse la place au bouton Menu fixe (MenuOverlay) à droite */}
        <p className="mt-14 text-right font-display text-[10px] uppercase leading-[1.1] tracking-[0.04em] text-paper/60 sm:text-xs md:mr-24 md:mt-0 md:text-sm">
          Graphiste indépendant · direction artistique
          <br />
          Vin, image &amp; web · Beaujolais
        </p>
      </header>

      <div className="relative z-10 flex flex-1 items-center px-6 py-8 md:px-12">
        <h1 className="mx-auto w-full max-w-[1000px] font-display uppercase leading-[0.94] tracking-[-0.015em] text-paper text-[clamp(3.4rem,11vw,5.4rem)] md:text-[clamp(2.6rem,6.4vw,6rem)]">
          {/* MOBILE — lignes forcées */}
          <span className="block md:hidden">
            <span className="block">
              <Mask i={0}>Je</Mask> <Mask i={1}>donne</Mask>
            </span>
            <span className="block">
              <span className="hero-fade mr-[0.18em] inline-block align-middle" style={d(2)}>
                <span className="inline-block h-[0.78em] w-[0.78em] -translate-y-[0.06em]">
                  <Burst className="spin-slow h-full w-full" />
                </span>
              </span>
              <Mask i={3}>une</Mask>
            </span>
            <span className="block">
              <Mask i={4}>
                <span className="text-orange">image</span>
              </Mask>
              <span className="hero-fade ml-[0.18em] inline-block align-middle" style={d(5)}>
                <span className="inline-block h-[0.62em] w-[1.05em] -translate-y-[0.05em] -rotate-6">
                  <Eye className="eye-blink h-full w-full" />
                </span>
              </span>
            </span>
            <span className="block">
              <Mask i={6}>
              <span className="relative inline-block">
                aux
                <span aria-hidden className="hero-strike absolute inset-x-0 top-[50%] h-[0.055em] bg-orange" style={{ animationDelay: STRIKE_DELAY }} />
              </span>
            </Mask>
            </span>
            <span className="block">
              <Mask i={7}>
                <span className="relative inline-block">
                  marques
                  <span aria-hidden className="hero-strike absolute inset-x-0 top-[50%] h-[0.055em] bg-orange" style={{ animationDelay: STRIKE_DELAY }} />
                </span>
              </Mask>{" "}
              <Mask i={8}>à</Mask>
            </span>
            <span className="block">
              <Mask i={9}>votre</Mask>
            </span>
            <span className="block">
              <Mask i={10}>
                histoire<span className="text-orange">.</span>
              </Mask>
              <span className="hero-fade ml-[0.2em] inline-block align-middle" style={d(11)}>
                <span className="inline-block h-[0.92em] w-[0.5em] -translate-y-[0.02em] rotate-[8deg]">
                  <Bolt className="h-full w-full" />
                </span>
              </span>
            </span>
          </span>

          {/* DESKTOP — flux inline */}
          <span className="hidden md:block">
            <Mask i={0}>Je</Mask> <Mask i={1}>donne</Mask>
            <span className="hero-fade mx-[0.18em] inline-block align-middle" style={d(2)}>
              <span className="inline-block h-[0.78em] w-[0.78em] -translate-y-[0.06em]">
                <Burst className="spin-slow h-full w-full" />
              </span>
            </span>
            <Mask i={3}>une</Mask>{" "}
            <Mask i={4}>
              <span className="text-orange">image</span>
            </Mask>
            <span className="hero-fade mx-[0.18em] inline-block align-middle" style={d(5)}>
              <span className="inline-block h-[0.62em] w-[1.05em] -translate-y-[0.05em] -rotate-6">
                <Eye className="eye-blink h-full w-full" />
              </span>
            </span>
            <Mask i={6}>
              <span className="relative inline-block">
                aux
                <span aria-hidden className="hero-strike absolute inset-x-0 top-[50%] h-[0.055em] bg-orange" style={{ animationDelay: STRIKE_DELAY }} />
              </span>
            </Mask>{" "}
            {/* « marques » + « à » restent collés */}
            <span className="inline-block whitespace-nowrap">
              <Mask i={7}>
                <span className="relative inline-block">
                  marques
                  <span aria-hidden className="hero-strike absolute inset-x-0 top-[50%] h-[0.055em] bg-orange" style={{ animationDelay: STRIKE_DELAY }} />
                </span>
              </Mask>{" "}
              <Mask i={8}>à</Mask>
            </span>{" "}
            {/* « votre histoire » sur la même ligne */}
            <span className="inline-block whitespace-nowrap">
              <Mask i={9}>votre</Mask>{" "}
              <Mask i={10}>
                histoire<span className="text-orange">.</span>
              </Mask>
              <span className="hero-fade ml-[0.2em] inline-block align-middle" style={d(11)}>
                <span className="inline-block h-[0.92em] w-[0.5em] -translate-y-[0.02em] rotate-[8deg]">
                  <Bolt className="h-full w-full" />
                </span>
              </span>
            </span>
          </span>
        </h1>
      </div>

      <footer className="relative z-10 flex items-center justify-between px-6 pb-7 font-display text-[10px] uppercase tracking-[0.08em] text-paper/60 sm:text-xs md:px-12">
        <span>20 ans de métier</span>
        <span className="animate-pulse text-orange">↓ Faites défiler</span>
        <span className="hidden sm:inline">Vin · Spectacle · Industrie</span>
      </footer>
    </section>
  );
}
