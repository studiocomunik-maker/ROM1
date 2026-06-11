import type { Metadata } from "next";
import PageNav from "../components/PageNav";
import Contact from "../components/Contact";
import Reveal from "../components/Reveal";
import AtelierPhoto from "../components/AtelierPhoto";
import SectionHeroBg from "../components/SectionHeroBg";
import { Eye, Bolt, Burst } from "../components/Glyphs";
import { SITE_URL } from "../data";
import { getClients } from "../../utils/clients";
import { getCollaborators } from "../../utils/collaborators";
import { getSectionHero } from "../../utils/sectionHeroes";

export const revalidate = 60;

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

/* Clients — gérés depuis le back-office (table `clients`). FALLBACK affiché
   tant que la base est vide : noms en typo, sans logo. */
type ClientItem = { name: string; logo_url: string | null; url: string | null };
const FALLBACK_CLIENTS: ClientItem[] = [
  "Christophe Pacalet",
  "Julien Sunier",
  "Bonne Tonne",
  "Yann Bertrand",
  "Bonnet Cotton",
  "Souchon & Fils",
  "BMV Transport",
  "Blackmoon",
  "Rohff — Bercy",
].map((name) => ({ name, logo_url: null, url: null }));

/* Frise du parcours de Romain — repères chrono-thématiques. Ajouter une
   entrée suffit, la frise suit. */
const JALONS: { k: string; t: string; d: string; g: "burst" | "bolt" | "eye" }[] = [
  {
    k: "Origines",
    t: "Une famille d'artistes",
    d: "Fils d'Allain Renoux, peintre, et frère de Christophe Renoux. Chez les Renoux, on dessine — et j'ai dessiné depuis mon plus jeune âge, bien avant d'en faire un métier.",
    g: "burst",
  },
  {
    k: "Bascule",
    t: "Du réseau au pixel",
    d: "Vient ensuite la passion de l'informatique : une formation en administration réseaux, avant de bifurquer vers les joies de Photoshop et de la suite Adobe. Geek et artiste, les deux à la fois.",
    g: "bolt",
  },
  {
    k: "Le web, d'avant",
    t: "Quand le CSS n'existait pas",
    d: "Je vois Internet apparaître. Le CSS n'existe pas encore, le moteur de recherche à la mode s'appelle Altavista. J'évolue au fil de cette technologie — pour en arriver, vingt ans plus tard, à travailler avec des outils comme Claude ou Nano Banana Pro.",
    g: "eye",
  },
  {
    k: "Image & son",
    t: "La musique, la photo, le film",
    d: "En parallèle, je développe mon appétence pour la musique, la vidéo, la photo. J'investis dans un drone qui m'emmène vers le film, j'apprends Ableton et Logic — et je continue d'avancer dans ce monde toujours en évolution.",
    g: "burst",
  },
];

/* Glyphe riso animé d'un jalon — même registre que le hero d'accueil. */
function JalonGlyph({ g }: { g: "burst" | "bolt" | "eye" }) {
  if (g === "bolt")
    return (
      <span className="float-slow inline-block h-10 w-7">
        <Bolt className="h-full w-full" />
      </span>
    );
  if (g === "eye")
    return (
      <span className="inline-block h-7 w-11">
        <Eye className="eye-blink h-full w-full" />
      </span>
    );
  return (
    <span className="inline-block h-10 w-10">
      <Burst className="spin-slow h-full w-full" />
    </span>
  );
}

/* Collaborateurs — gérés depuis le back-office (table `collaborators`).
   FALLBACK affiché tant que la base est vide. */
type CollabItem = { name: string; role: string | null; body: string | null; photo_url: string | null };
const FALLBACK_COLLABS: CollabItem[] = [
  {
    name: "Céline Kbaier",
    role: "Graphiste — print, étiquettes & contenus",
    body: "Graphiste elle aussi, Céline intervient sur le print, la création d'étiquettes, les contenus et les réseaux sociaux. Deux regards valent mieux qu'un : chaque projet qui sort de l'atelier est passé entre quatre yeux.",
    photo_url: null,
  },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default async function AProposPage() {
  const [clientsDb, collabsDb, hero] = await Promise.all([
    getClients(),
    getCollaborators(),
    getSectionHero("page:a-propos"),
  ]);
  const clients: ClientItem[] = clientsDb.length ? clientsDb : FALLBACK_CLIENTS;
  const collabs: CollabItem[] = collabsDb.length ? collabsDb : FALLBACK_COLLABS;

  const heroTitle = hero?.title?.trim() || "L'image est un métier";
  const heroIntro =
    hero?.intro?.trim() ||
    "Romain Renoux, graphiste et directeur artistique en Beaujolais. 20 ans de projets pour le vin, le spectacle et l'industrie — et toujours la même obsession : raconter juste.";

  return (
    <main className="bg-coal text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <PageNav />

      {/* HERO — fond éditable depuis le back-office (sinon grain coal) */}
      <section className="grain relative flex min-h-[80vh] flex-col justify-center overflow-hidden px-6 py-32 md:px-12">
        <SectionHeroBg hero={hero} />
        {/* Étoile-éclat qui tourne, débordant du bord droit (registre hero) */}
        <Burst className="spin-slow pointer-events-none absolute -right-16 top-24 z-[1] h-44 w-44 opacity-90 md:-right-20 md:top-32 md:h-64 md:w-64" />
        <p className="relative z-10 mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange">
          ★ À propos
        </p>
        <h1 className="relative z-10 max-w-[14ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.6rem,9vw,7rem)]">
          {heroTitle}
          <span className="text-orange">.</span>
          <span className="ml-[0.18em] inline-block h-[0.7em] w-[0.5em] -translate-y-[0.04em] rotate-[8deg] align-baseline">
            <Bolt className="float-slow h-full w-full" />
          </span>
        </h1>
        <p className="relative z-10 mt-8 max-w-[60ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
          {heroIntro}
        </p>
        <p className="relative z-10 mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
          Clients · Romain · L&apos;équipe ↓
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
              <span className="ml-[0.2em] inline-block h-[0.46em] w-[0.78em] -translate-y-[0.42em] rotate-[5deg] align-baseline">
                <Eye className="eye-blink h-full w-full" />
              </span>
            </h2>
          </Reveal>

          <ul className="mt-12 grid grid-cols-2 gap-px border border-coal/10 bg-coal/10 sm:grid-cols-3 lg:grid-cols-5">
            {clients.map((c, i) => {
              const inner = c.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.logo_url}
                  alt={c.name}
                  className="max-h-[58px] w-auto max-w-[80%] object-contain opacity-80 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
                />
              ) : (
                <span className="text-center font-display text-xs uppercase leading-snug tracking-[0.08em] text-coal/70 transition-all duration-300 group-hover:scale-105 group-hover:text-paper sm:text-sm">
                  {c.name}
                </span>
              );
              return (
                <li key={c.name + i} className="bg-white">
                  <Reveal delay={i * 60}>
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex aspect-[8/5] items-center justify-center p-4 transition-colors duration-300 hover:bg-coal"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="group flex aspect-[8/5] items-center justify-center p-4 transition-colors duration-300 hover:bg-coal">
                        {inner}
                      </div>
                    )}
                  </Reveal>
                </li>
              );
            })}
            {/* dernière case : et vous ? */}
            <li className="bg-white">
              <Reveal delay={clients.length * 60}>
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
              <AtelierPhoto hotspots={false} />
            </Reveal>

            <Reveal delay={200}>
              <div className="max-w-[600px] space-y-4 text-[15px] leading-[1.75] text-paper/80">
                <p>
                  <span className="text-paper">Geek et artiste.</span>{" "}
                  Mon histoire tient en deux fils qui n&apos;ont jamais cessé de se
                  tresser : le dessin, reçu en héritage, et la technologie,
                  attrapée par passion. Vingt ans plus tard, c&apos;est toujours
                  ce dialogue-là qui fabrique mes images.
                </p>
                <p>
                  Depuis 2005, j&apos;accompagne des domaines viticoles, des
                  vignerons, des artistes et des entreprises dans la
                  construction de leur image : identité graphique, étiquettes
                  de vin, packaging, photo, vidéo et sites web. Mon terrain de
                  jeu, c&apos;est d&apos;abord le vin — mais le métier m&apos;a
                  aussi mené sur les écrans géants de Bercy, dans les ateliers
                  de l&apos;industrie et les galeries d&apos;art.
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

          {/* Frise du parcours — repères numérotés */}
          <ol className="mt-16 grid gap-px border border-paper/10 bg-paper/10 sm:grid-cols-2 md:mt-20">
            {JALONS.map((j, i) => (
              <li key={j.k} className="bg-coal transition-colors duration-300 hover:bg-white/[0.03]">
                <Reveal delay={i * 80}>
                  <div className="flex h-full flex-col p-8 md:p-10">
                    <span className="flex items-start justify-between">
                      <JalonGlyph g={j.g} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/30">
                        0{i + 1}
                      </span>
                    </span>
                    <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
                      {j.k}
                    </span>
                    <h3 className="mt-2 font-display uppercase leading-[0.96] tracking-[-0.015em] text-[clamp(1.3rem,3vw,1.9rem)]">
                      {j.t}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-paper/70 md:text-[15px]">
                      {j.d}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* LES COLLABORATEURS — cartes avec portrait + description, extensible */}
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

          <ul className="mt-12 space-y-10 md:space-y-12">
            {collabs.map((c, i) => (
              <li key={c.name + i}>
                <Reveal delay={i * 100}>
                  <div className="group flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
                    {/* Portrait — cadre orange décalé façon riso ; au survol
                       le cadre glisse davantage. Initiales en attendant le
                       vrai fichier (remplacer par <Image>) */}
                    <div className="relative w-32 shrink-0 sm:w-40">
                      <div
                        aria-hidden
                        className="absolute inset-0 translate-x-2 translate-y-2 bg-orange transition-transform duration-300 ease-out group-hover:translate-x-3 group-hover:translate-y-3"
                      />
                      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-white">
                        {c.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.photo_url}
                            alt={c.name}
                            className="h-full w-full object-cover grayscale transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <span className="font-display text-4xl uppercase tracking-tight text-coal/25 transition-transform duration-300 group-hover:scale-110">
                            {initials(c.name)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="max-w-[620px] pt-1">
                      <h3 className="font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(1.5rem,3.5vw,2.4rem)]">
                        {c.name}
                      </h3>
                      {c.role && (
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-orange">
                          {c.role}
                        </p>
                      )}
                      {c.body && (
                        <p className="mt-4 text-[15px] leading-[1.75] text-coal/80">
                          {c.body}
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ACCROCHE PIXELSTORE — distinguer les structures (image/DA vs web) */}
      <section className="relative z-10 bg-coal px-6 py-20 text-paper md:px-12 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
              ★ Côté web
            </p>
            <h2 className="max-w-[18ch] font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
              Distinguons les choses<span className="text-orange">.</span>
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 grid grid-cols-1 gap-px border border-paper/10 bg-paper/10 md:grid-cols-2">
              <div className="flex flex-col bg-coal p-8 md:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
                  rom1.fr · l&apos;atelier
                </span>
                <p className="mt-4 text-[15px] leading-[1.75] text-paper/80">
                  Ici, c&apos;est la direction artistique et l&apos;image :
                  identité, étiquettes, print, photo et vidéo. Le regard, le
                  parti pris, la fabrique des images.
                </p>
              </div>
              <div className="flex flex-col bg-coal p-8 md:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
                  pixelstore.fr · le studio web
                </span>
                <p className="mt-4 text-[15px] leading-[1.75] text-paper/80">
                  La fabrication technique des sites sur-mesure vit là-bas,
                  dans la structure dédiée aux projets digitaux. Deux maisons,
                  deux métiers — le pont entre les deux, c&apos;est moi.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <a
              href="https://pixelstore.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-block bg-orange px-7 py-3.5 font-display text-sm uppercase tracking-[0.12em] text-coal transition-transform hover:scale-[1.03]"
            >
              Découvrir pixelstore.fr ↗
            </a>
          </Reveal>
        </div>
      </section>

      <Contact />
    </main>
  );
}
