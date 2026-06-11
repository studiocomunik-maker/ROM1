import type { Metadata } from "next";
import PageNav from "../components/PageNav";
import Contact from "../components/Contact";
import Reveal from "../components/Reveal";
import AtelierPhoto from "../components/AtelierPhoto";
import { SITE_URL } from "../data";

const TITLE = "À propos — Romain Renoux, graphiste en Beaujolais";
const DESCRIPTION =
  "Graphiste et directeur artistique installé au cœur du Beaujolais depuis 2005. Avec Céline Kbaier, deux regards au service du vin, du spectacle et de l'industrie.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/a-propos` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/a-propos`,
    title: TITLE,
    description: DESCRIPTION,
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "À propos",
      item: `${SITE_URL}/a-propos`,
    },
  ],
};

/* Clients (réalisations publiées + scéno). En attendant les fichiers logos
   de Romain, chaque case affiche le nom en typo — remplacer le <span> par
   un <Image> quand les logos arrivent. */
const CLIENTS = [
  "Christophe Pacalet",
  "Julien Sunier",
  "Bonne Tonne",
  "Yann Bertrand",
  "Bonnet Cotton",
  "Souchon & Fils",
  "BMV Transport",
  "Blackmoon",
  "Rohff — Bercy",
];

/* Les collaborateurs autour de Romain — liste extensible (ajouter une
   entrée suffit, la section suit). */
const COLLABS: { name: string; role: string; text: string; url?: string }[] = [
  {
    name: "Céline Kbaier",
    role: "Graphiste — print, étiquettes & contenus",
    text: "Graphiste elle aussi, Céline intervient sur le print, la création d'étiquettes, les contenus et les réseaux sociaux. Deux regards valent mieux qu'un : chaque projet qui sort de l'atelier est passé entre quatre yeux.",
  },
  {
    name: "pixelstore.fr",
    role: "Studio web — fabrication des sites sur-mesure",
    text: "La structure dédiée aux projets digitaux : les sites pensés ici sont fabriqués là-bas. La direction artistique reste à l'atelier, la technique vit chez pixelstore — le pont entre les deux, c'est Romain.",
    url: "https://pixelstore.fr",
  },
];

export default function AProposPage() {
  return (
    <main className="bg-coal text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <PageNav />

      {/* HERO */}
      <section className="grain relative flex min-h-[80vh] flex-col justify-center overflow-hidden px-6 py-32 md:px-12">
        <p className="mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange">
          ★ À propos
        </p>
        <h1 className="max-w-[14ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.6rem,9vw,7rem)]">
          L&apos;image est un métier<span className="text-orange">.</span>
        </h1>
        <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
          Romain Renoux, graphiste et directeur artistique en Beaujolais.
          20 ans de projets pour le vin, le spectacle et l&apos;industrie —
          et toujours la même obsession : raconter juste.
        </p>
        <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
          Clients · Romain · Collaborateurs ↓
        </p>
      </section>

      {/* NOS CLIENTS — grille de logos (typo en attendant les fichiers),
         révélation en cascade + survol inversé */}
      <section className="relative z-10 bg-white px-6 py-20 text-coal md:px-12 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="mb-3 text-center font-display text-xs uppercase tracking-[0.3em] text-orange">
              ★ Nos clients
            </p>
            <h2 className="text-center font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
              Ils nous font confiance
            </h2>
          </Reveal>

          <ul className="mt-12 grid grid-cols-2 gap-px border border-coal/10 bg-coal/10 sm:grid-cols-3 lg:grid-cols-5">
            {CLIENTS.map((c, i) => (
              <li key={c} className="bg-white">
                <Reveal delay={i * 60}>
                  <div className="group flex aspect-[8/5] items-center justify-center p-4 transition-colors duration-300 hover:bg-coal">
                    <span className="text-center font-display text-xs uppercase leading-snug tracking-[0.08em] text-coal/70 transition-all duration-300 group-hover:scale-105 group-hover:text-paper sm:text-sm">
                      {c}
                    </span>
                  </div>
                </Reveal>
              </li>
            ))}
            {/* 10e case : et vous ? */}
            <li className="bg-white">
              <Reveal delay={CLIENTS.length * 60}>
                <a
                  href="mailto:rom1@rom1.fr"
                  className="group flex aspect-[8/5] items-center justify-center p-4 transition-colors duration-300 hover:bg-orange"
                >
                  <span className="text-center font-display text-xs uppercase leading-snug tracking-[0.08em] text-orange transition-all duration-300 group-hover:scale-105 group-hover:text-coal sm:text-sm">
                    &amp; vous&nbsp;?
                  </span>
                </a>
              </Reveal>
            </li>
          </ul>
        </div>
      </section>

      {/* ROMAIN — LE FOCUS : direction artistique + parcours (le déroulé
         détaillé du parcours sera fourni par Romain et viendra enrichir
         cette section) */}
      <section className="relative z-10 bg-coal px-6 py-20 text-paper md:px-12 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
              ★ Romain Renoux · Direction artistique
            </p>
            <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
              Le parcours
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[40%_1fr] md:gap-16 xl:grid-cols-[34%_1fr]">
            <Reveal delay={120}>
              <div>
                <AtelierPhoto />
                <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/50">
                  ( Qui fait quoi&nbsp;? — survolez les points )
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="max-w-[600px] space-y-4 text-[15px] leading-[1.75] text-paper/80">
                <p>
                  Depuis 2005, j&apos;accompagne des domaines viticoles, des
                  vignerons, des artistes et des entreprises dans la
                  construction de leur image : identité graphique, étiquettes
                  de vin, packaging, photo, vidéo et sites web.
                </p>
                <p>
                  Mon terrain de jeu, c&apos;est d&apos;abord le vin. Installé
                  au cœur du Beaujolais, je travaille avec celles et ceux qui
                  font le vin — pour traduire en images ce qu&apos;il y a dans
                  leurs bouteilles : un terroir, un geste, une histoire.
                </p>
                <p>
                  20 ans de métier m&apos;ont aussi mené ailleurs : sur les
                  écrans géants de Bercy pour la scénographie de concerts, dans
                  les ateliers de l&apos;industrie, les galeries d&apos;art,
                  les hôtels et les belles tables.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {["20 ans de métier", "Vin · Spectacle · Industrie", "Lyon — Beaujolais"].map(
                  (t) => (
                    <span
                      key={t}
                      className="border border-paper/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/80"
                    >
                      {t}
                    </span>
                  )
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* LES COLLABORATEURS — lignes éditoriales, liste extensible */}
      <section className="grain relative z-10 overflow-hidden bg-paper px-6 py-20 text-coal md:px-12 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
              ★ Les collaborateurs
            </p>
            <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
              Deux regards valent mieux qu&apos;un
            </h2>
          </Reveal>

          <ul className="mt-12 border-t border-coal/15">
            {COLLABS.map((c, i) => (
              <li key={c.name} className="border-b border-coal/15">
                <Reveal delay={i * 100}>
                  <div className="grid grid-cols-1 gap-x-10 gap-y-3 py-10 md:grid-cols-[minmax(260px,38%)_1fr] md:py-12">
                    <div>
                      <h3 className="font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(1.5rem,3.5vw,2.4rem)]">
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-orange"
                          >
                            {c.name}&nbsp;↗
                          </a>
                        ) : (
                          c.name
                        )}
                      </h3>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-orange">
                        {c.role}
                      </p>
                    </div>
                    <p className="max-w-[600px] text-[15px] leading-[1.75] text-coal/80">
                      {c.text}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Contact />
    </main>
  );
}
