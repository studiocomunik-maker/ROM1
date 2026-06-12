import Link from "next/link";
import type { Metadata } from "next";
import PageNav from "../components/PageNav";
import Contact from "../components/Contact";
import Picto from "../components/Picto";
import SectionHeroBg from "../components/SectionHeroBg";
import { SITE_URL, metiers, univers } from "../data";
import { getSectionHero } from "../../utils/sectionHeroes";

export const revalidate = 60;

const TITLE = "Savoir-faire — identité, print, photo, web & motion · Romain Renoux";
const DESCRIPTION =
  "Cinq métiers — identité graphique, print & étiquettes, photo/vidéo, webdesign, motion — au service du vin, du spectacle et de l'industrie. 20 ans de métier en Beaujolais.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/savoir-faire` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/savoir-faire`,
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Données structurées : fil d'Ariane + page-collection listant les métiers
// et univers (chacun pointant vers sa page dédiée).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Savoir-faire", item: `${SITE_URL}/savoir-faire` },
      ],
    },
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/savoir-faire#page`,
      url: `${SITE_URL}/savoir-faire`,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#org` },
      mainEntity: {
        "@type": "ItemList",
        name: "Métiers & univers",
        itemListElement: [
          ...metiers.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/metiers/${m.key}`,
            name: m.t,
          })),
          ...univers.map((u, i) => ({
            "@type": "ListItem",
            position: metiers.length + i + 1,
            url: `${SITE_URL}/univers/${u.key}`,
            name: u.t,
          })),
        ],
      },
    },
  ],
};

export default async function SavoirFairePage() {
  const hero = await getSectionHero("page:savoir-faire");
  const heroTitle = hero?.title?.trim() || "Cinq métiers, un seul œil";
  const heroIntro =
    hero?.intro?.trim() ||
    "De l'identité au motion, je pratique des métiers qui s'additionnent — et des univers où je les exerce depuis 20 ans : le vin d'abord, le spectacle, l'industrie, l'art et les belles tables.";

  return (
    <main className="bg-coal text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageNav />

      {/* HERO — fond éditable depuis le back-office (sinon grain coal) */}
      <section className="grain relative flex min-h-[80vh] flex-col justify-center overflow-hidden px-6 py-32 md:px-12">
        <SectionHeroBg hero={hero} />
        <p className="relative z-10 mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange">
          ★ Savoir-faire
        </p>
        <h1 className="relative z-10 max-w-[14ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.6rem,9vw,7rem)]">
          {heroTitle}
          <span className="text-orange">.</span>
        </h1>
        <p className="relative z-10 mt-8 max-w-[60ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
          {heroIntro}
        </p>
        <p className="relative z-10 mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
          {metiers.length} métiers · {univers.length} univers ↓
        </p>
      </section>

      {/* MÉTIERS — cartes en grille (2 col dès sm, 3 col en xl : 6 cases
         avec la tuile CTA → grille toujours pleine) */}
      <section className="relative z-10 bg-white text-coal">
        <div className="px-6 py-16 text-center md:px-12">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Métiers
          </p>
          <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
            Ce que je fais
          </h2>
        </div>

        <ul className="grid gap-px border-y border-coal/10 bg-coal/10 sm:grid-cols-2 xl:grid-cols-3">
          {metiers.map((m, i) => (
            <li key={m.key} className="bg-white">
              <Link
                href={`/metiers/${m.key}`}
                className="group flex h-full flex-col p-8 transition-colors duration-300 hover:bg-coal hover:text-paper md:p-10"
              >
                <span className="flex items-start justify-between">
                  <Picto k={m.key} className="h-9 w-9 text-orange md:h-10 md:w-10" />
                  <span className="font-mono text-xs tracking-[0.2em] text-orange">
                    0{i + 1}
                  </span>
                </span>
                <span className="mt-6 block font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(1.5rem,4.5vw,2.1rem)]">
                  {m.t}
                </span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-coal/50 group-hover:text-paper/60">
                  {m.sub}
                </span>
                <span className="mt-4 block text-sm leading-relaxed text-coal/70 group-hover:text-paper/75 md:text-[15px]">
                  {m.intro}
                </span>
                <span className="mt-auto block pt-6 font-display text-sm uppercase tracking-[0.12em] text-orange transition-transform duration-300 group-hover:translate-x-1.5">
                  Voir le métier →
                </span>
              </Link>
            </li>
          ))}
          {/* 6e case : CTA réalisations */}
          <li className="bg-white">
            <Link
              href="/realisations"
              className="group flex h-full min-h-[220px] flex-col items-center justify-center gap-4 p-8 text-center transition-colors duration-300 hover:bg-orange md:p-10"
            >
              <span className="font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(1.5rem,4.5vw,2.1rem)]">
                Tout ça, en vrai&nbsp;?
              </span>
              <span className="font-display text-sm uppercase tracking-[0.12em] text-orange transition-colors group-hover:text-coal">
                Voir les réalisations →
              </span>
            </Link>
          </li>
        </ul>
      </section>

      {/* UNIVERS — même grille, inversée sur coal */}
      <section className="relative z-10 bg-coal text-paper">
        <div className="px-6 py-16 text-center md:px-12">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Univers
          </p>
          <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
            Pour qui je le fais
          </h2>
        </div>

        <ul className="grid gap-px border-y border-paper/10 bg-paper/10 sm:grid-cols-2 xl:grid-cols-3">
          {univers.map((u, i) => (
            <li key={u.key} className="bg-coal">
              <Link
                href={`/univers/${u.key}`}
                className="group flex h-full flex-col p-8 transition-colors duration-300 hover:bg-orange hover:text-coal md:p-10"
              >
                <span className="flex items-start justify-between">
                  <Picto
                    k={u.key}
                    className="h-9 w-9 text-orange transition-colors group-hover:text-coal md:h-10 md:w-10"
                  />
                  <span className="font-mono text-xs tracking-[0.2em] text-orange group-hover:text-coal">
                    0{i + 1}
                  </span>
                </span>
                <span
                  className={`mt-6 flex items-center gap-3 font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(1.5rem,4.5vw,2.1rem)] ${
                    u.featured ? "text-orange group-hover:text-paper" : ""
                  }`}
                >
                  {u.featured && (
                    <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-orange group-hover:bg-paper" />
                  )}
                  {u.t}
                </span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-paper/50 group-hover:text-coal/60">
                  {u.sub}
                </span>
                <span className="mt-4 block text-sm leading-relaxed text-paper/70 group-hover:text-coal/80 md:text-[15px]">
                  {u.intro}
                </span>
                <span className="mt-auto block pt-6 font-display text-sm uppercase tracking-[0.12em] text-orange transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-coal">
                  Voir l&apos;univers →
                </span>
              </Link>
            </li>
          ))}
          {/* 6e case : CTA contact */}
          <li className="bg-coal">
            <a
              href="mailto:rom1@rom1.fr"
              className="group flex h-full min-h-[220px] flex-col items-center justify-center gap-4 p-8 text-center transition-colors duration-300 hover:bg-orange hover:text-coal md:p-10"
            >
              <span className="font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(1.5rem,4.5vw,2.1rem)]">
                Votre univers&nbsp;?
              </span>
              <span className="font-display text-sm uppercase tracking-[0.12em] text-orange transition-colors group-hover:text-coal">
                Parlons-en →
              </span>
            </a>
          </li>
        </ul>
      </section>

      <Contact />
    </main>
  );
}
