import Reveal from "./Reveal";
import AtelierPhoto from "./AtelierPhoto";

/* Œil clignotant — version contour pour fond papier (même dessin que le hero) */
function Eye({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <path
        d="M4 40 C30 6 90 6 116 40 C90 74 30 74 4 40 Z"
        fill="#f5f4f2"
        stroke="#0c0c0e"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="40" r="18" fill="#ff3d1f" />
      <circle cx="60" cy="40" r="7" fill="#0c0c0e" />
    </svg>
  );
}

const MARQUEE = "Romain & Céline — l’œil et la technique";

export default function Atelier() {
  return (
    <section id="atelier" className="grain relative z-10 overflow-hidden bg-paper text-coal">
      <div className="mx-auto max-w-[1400px] px-6 pt-20 md:px-12 md:pt-28">
        {/* Eyebrow */}
        <Reveal>
          <div className="mb-8 flex items-baseline justify-between font-display text-xs uppercase tracking-[0.25em] md:mb-10">
            <span className="text-orange">L’atelier</span>
            <span className="text-right text-coal/50">Beaujolais — depuis 2005</span>
          </div>
        </Reveal>

        {/* Titre — « têtes » barré, corrigé en « regards » comme le hero barre « aux marques » */}
        <Reveal delay={80}>
          <h2 className="mb-12 max-w-[900px] font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(2.6rem,8vw,5.5rem)] md:mb-16">
            Deux{" "}
            <span className="relative inline-block">
              têtes
              <span
                aria-hidden
                className="absolute inset-x-[-2%] top-[50%] h-[0.06em] -rotate-2 bg-orange"
              />
            </span>{" "}
            regards,
            <br />
            une <span className="text-orange">image</span>
            <span className="ml-[0.18em] inline-block h-[0.62em] w-[1.05em] -translate-y-[0.05em] -rotate-6 align-middle">
              <Eye className="eye-blink h-full w-full" />
            </span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 pb-20 md:grid-cols-[44%_1fr] md:gap-16 md:pb-28 xl:grid-cols-[35%_1fr]">
          {/* Photo — cadre orange décalé façon riso, photo droite */}
          <Reveal delay={120}>
            <div>
              <AtelierPhoto />
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-coal/50">
                ( Qui fait quoi&nbsp;? — survolez les points )
              </p>
            </div>
          </Reveal>

          {/* Texte de présentation */}
          <Reveal delay={200}>
            <div className="max-w-[560px] space-y-4 text-[15px] leading-[1.75] text-coal/80">
              <p>
                Depuis 2005, j’accompagne des domaines viticoles, des vignerons,
                des artistes et des entreprises dans la construction de leur
                image : identité graphique, étiquettes de vin, packaging, photo,
                vidéo et sites web. Je travaille avec l’appui de Céline Kbaier,
                graphiste elle aussi, qui intervient sur le print, la création
                d’étiquettes, les contenus et les réseaux sociaux — deux regards
                valent mieux qu’un.
              </p>
              <p>
                Mon terrain de jeu, c’est d’abord le vin. Installé au cœur du
                Beaujolais, je travaille avec celles et ceux qui font le vin —
                pour traduire en images ce qu’il y a dans leurs bouteilles : un
                terroir, un geste, une histoire. Une étiquette n’est pas un
                décor, c’est la première gorgée.
              </p>
              <p>
                La vidéo est au cœur de mes projets : film de domaine, images
                drone, portraits de vignerons, contenus pour les réseaux ou
                écrans de scène. Parce qu’aujourd’hui, une marque qui ne bouge
                pas est une marque qu’on ne voit pas.
              </p>
              <p>
                20 ans de métier m’ont aussi mené ailleurs : sur les écrans
                géants de Bercy pour la scénographie de concerts, dans les
                ateliers de l’industrie, les galeries d’art, les hôtels et les
                belles tables. Côté web, les sites sur-mesure sont conçus au
                sein de{" "}
                <a
                  href="https://pixelstore.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-orange decoration-2 underline-offset-4 transition-colors hover:text-orange"
                >
                  pixelstore.fr
                </a>
                , la structure dédiée aux projets digitaux.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {["20 ans de métier", "Vin · Spectacle · Industrie", "Lyon — Beaujolais"].map(
                (t) => (
                  <span
                    key={t}
                    className="border border-coal px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em]"
                  >
                    {t}
                  </span>
                )
              )}
            </div>

          </Reveal>
        </div>
      </div>

      {/* Marquee orange pleine largeur */}
      <div className="bg-orange py-2.5">
        <div className="marquee-track flex w-max whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-coal">
          {[0, 1].map((i) => (
            <span key={i} aria-hidden={i === 1} className="flex">
              {Array.from({ length: 4 }, (_, j) => (
                <span key={j} className="mx-4">
                  ★ {MARQUEE}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
