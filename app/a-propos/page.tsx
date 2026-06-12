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
   entrée suffit, la frise suit. `g` = picto thématique (voir JalonGlyph). */
type JalonGlyphKey = "crayon" | "ecran" | "code" | "camera";
const JALONS: { k: string; t: string; d: string; g: JalonGlyphKey }[] = [
  {
    k: "Origines",
    t: "Une famille d'artistes",
    d: "Fils d'Allain Renoux, peintre, et frère de Christophe Renoux. Chez les Renoux, on dessine — et j'ai dessiné depuis mon plus jeune âge, bien avant d'en faire un métier.",
    g: "crayon",
  },
  {
    k: "Bascule",
    t: "Du réseau au pixel",
    d: "Vient ensuite la passion de l'informatique : une formation en administration réseaux, avant de bifurquer vers les joies de Photoshop et de la suite Adobe. Geek et artiste, les deux à la fois.",
    g: "ecran",
  },
  {
    k: "Le web, d'avant",
    t: "Quand le CSS n'existait pas",
    d: "Je vois Internet apparaître. Le CSS n'existe pas encore, le moteur de recherche à la mode s'appelle Altavista. J'évolue au fil de cette technologie — pour en arriver, vingt ans plus tard, à travailler avec des outils comme Claude ou Nano Banana Pro.",
    g: "code",
  },
  {
    k: "Image & son",
    t: "Photo, vidéo et musique",
    d: "La photo, puis la vidéo, ont pris une place centrale dans mon métier : reportage, film de domaine, images par drone — fabriquer du mouvement est devenu un réflexe. La musique, elle, reste à côté : une passion qui nourrit l'œil sans jamais en être le cœur.",
    g: "camera",
  },
];

/* Picto thématique d'un jalon — STYLE RISO PLEIN comme l'œil et l'étoile
   du hero : silhouettes pleines orange (#ff3d1f) + accents crème (#f5f4f2)
   et noir (#0c0c0e). Flottement doux continu pour garder un peu de vie. */
const O = "#ff3d1f";
const C = "#f5f4f2";
const K = "#0c0c0e";

// Lamelles de focus au centre de l'œil : la pupille devient un mini-diaphragme.
// Géométrie calculée autour du centre de l'iris (60,40 dans le viewBox 120×80).
const EYE_CX = 60;
const EYE_CY = 40;
const AP_RH = 7; // rayon de l'ouverture (pupille)
const AP_RIM = 18; // longueur des entailles (restent dans l'iris)
const AP_TWIST = 30; // décalage en hélice (deg) → aspect lamelles
const apVerts = Array.from({ length: 6 }, (_, i) => {
  const a = (i * 60 * Math.PI) / 180;
  return [EYE_CX + AP_RH * Math.cos(a), EYE_CY + AP_RH * Math.sin(a)] as const;
});
const apSeams = apVerts.map((_, i) => {
  const a = ((i * 60 + AP_TWIST) * Math.PI) / 180;
  return [EYE_CX + AP_RIM * Math.cos(a), EYE_CY + AP_RIM * Math.sin(a)] as const;
});
const apHex =
  apVerts.map((v, i) => `${i ? "L" : "M"}${v[0].toFixed(1)} ${v[1].toFixed(1)}`).join(" ") + "Z";

// Pictos SVG « pleins » (viewBox 64). code + camera sont rendus à part.
const JALON_GLYPHS: Record<"crayon" | "ecran", React.ReactNode> = {
  // crayon — le dessin, l'héritage artistique
  crayon: (
    <>
      <polygon points="44,8 56,20 26,50 14,38" fill={O} />
      <polygon points="14,38 26,50 9,55" fill={C} />
      <polygon points="14,46 18,50 9,55" fill={K} />
    </>
  ),
  // écran — l'informatique, du réseau au pixel
  ecran: (
    <>
      <rect x="7" y="12" width="50" height="34" rx="4" fill={O} />
      <rect x="15" y="19" width="34" height="20" rx="1.5" fill={C} />
      <rect x="28" y="46" width="8" height="7" fill={O} />
      <rect x="19" y="52" width="26" height="5" rx="2.5" fill={O} />
    </>
  ),
};

// Animation propre à chaque picto, en lien avec son thème.
const JALON_ANIM: Record<JalonGlyphKey, string> = {
  crayon: "glyph-sketch", // croque comme un trait de crayon
  ecran: "glyph-pulse", // respire / s'allume
  code: "", // rendu à part (CodeGlyph, effet typewriter)
  camera: "", // corps fixe : c'est l'iris de focus qui s'anime (cf .iris-focus)
};

/* code — balise <rom1/> où « rom1 » se tape et s'efface (typewriter). Rendu
   en HTML (texte), pas en SVG comme les autres pictos. */
function CodeGlyph() {
  return (
    <span
      aria-hidden
      className="inline-flex items-baseline font-mono text-[17px] font-bold leading-none text-orange md:text-xl"
    >
      <span className="text-[1.15em]">&lt;</span>
      <span className="code-type mx-[0.1em] text-paper">rom1</span>
      <span className="text-[1.15em]">/&gt;</span>
    </span>
  );
}

/* camera — l'œil du site (sclère crème + contour noir) dont la pupille est un
   mini-diaphragme à lamelles. Anime le clignement de l'œil (.eye-blink). */
function EyeApertureGlyph() {
  return (
    <span className="inline-block h-8 w-12 md:h-9 md:w-14">
      <svg viewBox="0 0 120 80" className="eye-blink h-full w-full" aria-hidden>
        <path
          d="M4 40 C30 6 90 6 116 40 C90 74 30 74 4 40 Z"
          fill={C}
          stroke={K}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <circle cx={EYE_CX} cy={EYE_CY} r="20" fill={O} />
        {apSeams.map((s, i) => (
          <line
            key={i}
            x1={apVerts[i][0]}
            y1={apVerts[i][1]}
            x2={s[0]}
            y2={s[1]}
            stroke={K}
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
        <path d={apHex} fill={K} />
      </svg>
    </span>
  );
}

function JalonGlyph({ g }: { g: JalonGlyphKey }) {
  if (g === "code") return <CodeGlyph />;
  if (g === "camera") return <EyeApertureGlyph />;
  return (
    <span className={`inline-block ${JALON_ANIM[g]}`}>
      <svg viewBox="0 0 64 64" className="h-10 w-10 md:h-11 md:w-11" aria-hidden>
        {JALON_GLYPHS[g as "crayon" | "ecran"]}
      </svg>
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

  // Données structurées : fil d'Ariane + AboutPage → Person (Romain) enrichi
  // (métier, rattaché à l'org, collègues = collaborateurs).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "À propos", item: `${SITE_URL}/a-propos` },
        ],
      },
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/a-propos#page`,
        url: `${SITE_URL}/a-propos`,
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Romain Renoux",
        jobTitle: "Graphiste — Directeur artistique",
        worksFor: { "@id": `${SITE_URL}/#org` },
        colleague: collabs.map((c) => ({
          "@type": "Person",
          name: c.name,
          ...(c.role ? { jobTitle: c.role } : {}),
        })),
      },
    ],
  };

  // Titre éditable (back-office) ; vide = composition par défaut « Geek & artiste »
  const heroTitleOverride = hero?.title?.trim();
  const heroIntro =
    hero?.intro?.trim() ||
    "Le dessin reçu en héritage, la technologie attrapée par passion — 20 ans que les deux se tressent pour fabriquer des images.";

  return (
    <main className="bg-coal text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageNav />

      {/* HERO — « Geek & artiste » : le fil du parcours en accroche. Fond
         éditable depuis le back-office (sinon grain coal). */}
      <section className="grain relative flex min-h-[80vh] flex-col justify-center overflow-hidden px-6 py-32 md:px-12">
        <SectionHeroBg hero={hero} />
        {/* Étoile-éclat qui tourne, débordant du bord droit (registre hero) */}
        <Burst className="spin-slow pointer-events-none absolute -right-16 top-24 z-[1] h-44 w-44 opacity-90 md:-right-20 md:top-32 md:h-64 md:w-64" />
        <p className="relative z-10 mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange">
          ★ À propos
        </p>
        <h1 className="relative z-10 font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.8rem,10vw,7.5rem)]">
          {heroTitleOverride ? (
            <>
              {heroTitleOverride}
              <span className="text-orange">.</span>
            </>
          ) : (
            <>
              Geek <span className="text-orange">&amp;</span> artiste
              {/* œil qui cligne + éclair, en bout d'accroche */}
              <span className="ml-[0.18em] inline-block h-[0.5em] w-[0.82em] -translate-y-[0.06em] align-baseline">
                <Eye className="eye-blink h-full w-full" />
              </span>
              <span className="ml-[0.1em] inline-block h-[0.62em] w-[0.42em] -translate-y-[0.02em] rotate-[8deg] align-baseline">
                <Bolt className="float-slow h-full w-full" />
              </span>
              <br />
              depuis 2005<span className="text-orange">.</span>
            </>
          )}
        </h1>
        <p className="relative z-10 mt-8 max-w-[58ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
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
              <AtelierPhoto
                hotspots={false}
                src="/medias/romain-portrait.jpg"
                alt="Romain Renoux dans son atelier, entouré de photos, d'appareils et de pellicules"
                width={1062}
                height={1600}
              />
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
                  <div className="group flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-12">
                    {/* Portrait — cadre orange décalé façon riso ; au survol
                       le cadre glisse davantage. Initiales en attendant le
                       vrai fichier (remplacer par <Image>) */}
                    <div className="relative w-full max-w-[280px] shrink-0 sm:w-56 md:w-72">
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

                    <div className="max-w-[640px] pt-1 sm:pt-2">
                      <h3 className="font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(1.9rem,4.5vw,3rem)]">
                        {c.name}
                      </h3>
                      {c.role && (
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-orange">
                          {c.role}
                        </p>
                      )}
                      {c.body && (
                        <p className="mt-5 text-base leading-[1.75] text-coal/80 md:text-lg">
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
