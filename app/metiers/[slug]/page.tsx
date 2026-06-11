import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageNav from "../../components/PageNav";
import Contact from "../../components/Contact";
import SectionHeroBg from "../../components/SectionHeroBg";
import { EXPS, UNIVERS, SITE_URL, getMetier, metiers } from "../../data";
import { getRealisationsByMetier } from "../../../utils/realisations";
import { getSectionHero } from "../../../utils/sectionHeroes";

export const revalidate = 60;

export function generateStaticParams() {
  return metiers.map((m) => ({ slug: m.key }));
}

// Meta dédiées par métier : titres ciblés sur les requêtes (plutôt que le
// libellé interne) et descriptions complètes (pas de coupe mi-phrase).
const SEO: Record<string, { metaTitle: string; metaDescription: string }> = {
  identite: {
    metaTitle: "Identité graphique & logo en Beaujolais — Romain Renoux",
    metaDescription:
      "Création d'identité visuelle en Beaujolais : logo, charte graphique, système typographique et règles d'usage. Des identités qui tiennent dans le temps.",
  },
  print: {
    metaTitle: "Print, packaging & étiquettes — Romain Renoux, graphiste",
    metaDescription:
      "Graphiste print en Beaujolais : édition, packaging, étiquettes et brochures. Des fichiers dessinés pour la matière, le pli et la dorure, prêts à imprimer.",
  },
  photo: {
    metaTitle: "Photo & vidéo en Beaujolais — Romain Renoux",
    metaDescription:
      "Photographe et vidéaste en Beaujolais : reportage de domaine, nature morte, film de marque, captation drone. Des images qui racontent un lieu et un geste.",
  },
  web: {
    metaTitle: "Webdesign & direction artistique — Romain Renoux",
    metaDescription:
      "Webdesign en Beaujolais : direction artistique de sites sur-mesure pour domaines, entreprises et lieux. Fabrication technique assurée par pixelstore.fr.",
  },
  motion: {
    metaTitle: "Motion design & habillage — Romain Renoux",
    metaDescription:
      "Motion design en Beaujolais : habillages, écrans de scène, génériques, teasers. Faire bouger une marque sans la trahir, du réseau social à l'écran géant.",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/metiers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMetier(slug);
  if (!m) return {};
  const seo = SEO[slug];
  const title = seo?.metaTitle ?? `${m.t} — Romain Renoux`;
  const description = seo?.metaDescription ?? m.intro.slice(0, 160);
  const url = `${SITE_URL}/metiers/${m.key}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description },
  };
}

export default async function MetierPage({ params }: PageProps<"/metiers/[slug]">) {
  const { slug } = await params;
  const metier = getMetier(slug);
  if (!metier) notFound();

  const [refs, hero] = await Promise.all([
    getRealisationsByMetier(metier.key),
    getSectionHero(`metier:${metier.key}`),
  ]);
  const idx = metiers.findIndex((m) => m.key === metier.key);
  const next = metiers[(idx + 1) % metiers.length];

  const heroTitle = hero?.title?.trim() || metier.t;
  const heroIntro = hero?.intro?.trim() || metier.intro;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: metier.t,
        item: `${SITE_URL}/metiers/${metier.key}`,
      },
    ],
  };

  return (
    <main className="bg-coal text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <PageNav back="/" backLabel="Accueil" />

      {/* HERO métier — explique l'expertise */}
      <section className="grain relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-32 md:px-12">
        <SectionHeroBg hero={hero} />
        <div className="relative z-10">
          <p className="mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Métier · {metier.sub}
          </p>
          <h1 className="max-w-[14ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.6rem,9vw,7rem)]">
            {heroTitle}
            <span className="text-orange">.</span>
          </h1>
          <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
            {heroIntro}
          </p>
          <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
            {refs.length} réalisation{refs.length > 1 ? "s" : ""} ↓
          </p>
        </div>
      </section>

      {/* RÉALISATIONS liées à ce métier */}
      <section className="relative z-10 bg-white text-coal">
        <div className="px-6 py-16 text-center md:px-12">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Réalisations
          </p>
          <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
            En {metier.t.toLowerCase()}
          </h2>
        </div>

        {refs.length === 0 ? (
          <p className="px-6 pb-20 text-center font-mono text-xs uppercase tracking-[0.15em] text-coal/40">
            Bientôt des réalisations ici.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-coal/10 sm:grid-cols-3">
            {refs.map((p) => (
              <Link
                key={p.slug}
                href={`/realisations/${p.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden bg-coal text-paper"
              >
                {/* Image (base, toujours visible) */}
                {p.cover_url ? (
                  <Image
                    src={p.cover_url}
                    alt={p.titre}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-coal to-night">
                    <span className="font-display text-2xl uppercase tracking-tight text-paper/15">
                      rom1
                    </span>
                  </div>
                )}

                {/* Voile sombre : assombrit par défaut → transparent au survol */}
                <div className="absolute inset-0 bg-coal/60 transition-colors duration-300 group-hover:bg-coal/0" />

                {/* Univers + titre + métiers : par défaut → s'effacent au survol */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 p-5 text-center transition-opacity duration-300 group-hover:opacity-0">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
                    {UNIVERS[p.univers] ?? p.univers}
                  </span>
                  <h3 className="font-display text-xl uppercase leading-none tracking-tight text-paper md:text-2xl">
                    {p.titre}
                  </h3>
                  <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                    {p.exps.map((x) => (
                      <span
                        key={x}
                        className="border border-paper/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-paper"
                      >
                        {EXPS[x] ?? x}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-12 md:px-12">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.15em] text-coal/60 transition-colors hover:text-coal"
          >
            ← Tous les métiers
          </Link>
          <Link
            href={`/metiers/${next.key}`}
            className="font-display text-sm uppercase tracking-[0.12em] text-coal transition-opacity hover:opacity-60"
          >
            {next.t} →
          </Link>
        </div>
      </section>

      {/* CTA de fin de page métier — identique à la home */}
      <Contact />
    </main>
  );
}
