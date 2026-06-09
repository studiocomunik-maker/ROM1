import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageNav from "../../components/PageNav";
import Contact from "../../components/Contact";
import SectionHeroBg from "../../components/SectionHeroBg";
import { EXPS, SITE_URL, getUnivers, univers } from "../../data";
import { getRealisationsByUnivers } from "../../../utils/realisations";
import { getSectionHero } from "../../../utils/sectionHeroes";

export const revalidate = 60;

export function generateStaticParams() {
  return univers.map((u) => ({ slug: u.key }));
}

// Contenu SEO long-form par univers. Seul « vin » est traité en landing
// complète (services + FAQ) — c'est la requête cible « graphiste vin Beaujolais ».
type Service = { t: string; d: string };
type Faq = { q: string; a: string };
type UniversPage = {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  services?: Service[];
  faq?: Faq[];
};

const PAGES: Record<string, UniversPage> = {
  vin: {
    h1: "Graphiste spécialisé vin, en Beaujolais",
    metaTitle: "Graphiste vin & étiquettes en Beaujolais — Romain Renoux",
    metaDescription:
      "Graphiste spécialisé vin en Beaujolais : étiquettes, identité de domaine, packaging, photo et site web pour vignerons et caves. Parlons de votre projet.",
    services: [
      {
        t: "Étiquettes de vin",
        d: "Le premier contact avec votre vin, c'est l'étiquette. Je la dessine pour la matière — papier, gaufrage, dorure, contre-étiquette — lisible en rayon et juste sur la table.",
      },
      {
        t: "Identité de domaine",
        d: "Logo, noms de cuvées, charte : une identité visuelle de domaine qui tient dans le temps et se décline du portail de la cave jusqu'au site web.",
      },
      {
        t: "Packaging & coffrets",
        d: "Cartons, coffrets, étuis : prolonger l'étiquette jusqu'au déballage. Le packaging du vin pensé comme un objet, pas comme un emballage.",
      },
      {
        t: "Photo & vidéo de domaine",
        d: "Vigne, cave, vendanges, portrait de vigneron : des images qui racontent le lieu et le geste, pour vos réseaux, votre site et vos salons.",
      },
      {
        t: "Site web de domaine",
        d: "Un site clair pour vendre en direct et faire venir au caveau. Direction artistique ici, fabrication technique chez pixelstore.fr.",
      },
      {
        t: "Réseaux sociaux",
        d: "Instagram, posts, stories, reels : une ligne visuelle régulière qui fait vivre le domaine entre deux millésimes. Le bon ton, les bonnes images, sans y passer vos soirées.",
      },
    ],
    faq: [
      {
        q: "Travaillez-vous avec les domaines du Beaujolais ?",
        a: "Oui. Je suis graphiste en Beaujolais et j'accompagne les domaines et vignerons de la région — comme du reste du Rhône, du Mâconnais et de la Bourgogne — sur leurs étiquettes, leur identité et leur communication.",
      },
      {
        q: "Concevez-vous des étiquettes de vin prêtes pour l'impression ?",
        a: "Je dessine l'étiquette et prépare le fichier pour l'imprimeur en intégrant les mentions obligatoires (degré, volume, allergènes, e-mention, logos). La validation réglementaire finale reste celle de votre conseil, mais le fichier est calé pour la production.",
      },
      {
        q: "Combien coûte une identité ou une étiquette de domaine ?",
        a: "Chaque projet est devisé sur-mesure selon le nombre de cuvées, les déclinaisons et les supports. Le mieux est d'en parler : un échange suffit pour cadrer un budget réaliste.",
      },
      {
        q: "Intervenez-vous uniquement sur le vin ?",
        a: "Non — le vin est mon terrain de prédilection, mais je travaille aussi pour la scénographie, la culture, l'industrie et l'hôtellerie, en direction artistique, image et web.",
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/univers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const u = getUnivers(slug);
  if (!u) return {};
  const p = PAGES[slug];
  return {
    title: p?.metaTitle ?? `${u.t} — Romain Renoux`,
    description: p?.metaDescription ?? u.intro.slice(0, 160),
    alternates: { canonical: `${SITE_URL}/univers/${u.key}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/univers/${u.key}`,
      title: p?.metaTitle ?? `${u.t} — Romain Renoux`,
      description: p?.metaDescription ?? u.intro.slice(0, 160),
    },
  };
}

export default async function UniversPage({ params }: PageProps<"/univers/[slug]">) {
  const { slug } = await params;
  const u = getUnivers(slug);
  if (!u) notFound();

  const page = PAGES[slug];
  const [refs, hero] = await Promise.all([
    getRealisationsByUnivers(u.key),
    getSectionHero(`univers:${u.key}`),
  ]);
  const idx = univers.findIndex((x) => x.key === u.key);
  const next = univers[(idx + 1) % univers.length];

  const heroTitle = hero?.title?.trim() || page?.h1 || u.t;
  const heroIntro = hero?.intro?.trim() || u.intro;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: u.t,
        item: `${SITE_URL}/univers/${u.key}`,
      },
    ],
  };
  const faqLd = page?.faq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <main className="bg-coal text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <PageNav back="/" backLabel="Accueil" />

      {/* HERO univers */}
      <section className="grain relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-32 md:px-12">
        <SectionHeroBg hero={hero} />
        <div className="relative z-10">
          <p className="mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Univers · {u.sub}
          </p>
          <h1 className="max-w-[18ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.4rem,8vw,6rem)]">
            {heroTitle}
            <span className="text-orange">.</span>
          </h1>
          <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
            {heroIntro}
          </p>
          <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
            {refs.length} réalisation{refs.length > 1 ? "s" : ""} ↓
          </p>
        </div>
      </section>

      {/* SERVICES (vin uniquement) */}
      {page?.services && (
        <section className="relative z-10 border-t border-paper/10 bg-coal px-6 py-20 md:px-12">
          <p className="mb-3 text-center font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Ce que je fais pour les domaines
          </p>
          <h2 className="mx-auto mb-14 max-w-[20ch] text-center font-display uppercase leading-[0.9] tracking-tight text-[clamp(1.8rem,5vw,3.4rem)]">
            Du cep à l&apos;étiquette
          </h2>
          <div className="mx-auto grid max-w-[1000px] gap-px bg-paper/10 sm:grid-cols-2 lg:grid-cols-3">
            {page.services.map((s) => (
              <div key={s.t} className="bg-coal p-7">
                <h3 className="mb-3 font-display text-lg uppercase tracking-tight text-orange">
                  {s.t}
                </h3>
                <p className="text-sm leading-relaxed text-paper/70">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RÉALISATIONS de cet univers */}
      <section className="relative z-10 bg-white text-coal">
        <div className="px-6 py-16 text-center md:px-12">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Réalisations
          </p>
          <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
            {u.t}
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
                {p.cover_url ? (
                  <Image
                    src={p.cover_url}
                    alt={`${p.titre} — réalisation ${u.t.toLowerCase()} par Romain Renoux, graphiste en Beaujolais`}
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
                <div className="absolute inset-0 bg-coal/60 transition-colors duration-300 group-hover:bg-coal/0" />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 p-5 text-center transition-opacity duration-300 group-hover:opacity-0">
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
            ← Accueil
          </Link>
          <Link
            href={`/univers/${next.key}`}
            className="font-display text-sm uppercase tracking-[0.12em] text-coal transition-opacity hover:opacity-60"
          >
            {next.t} →
          </Link>
        </div>
      </section>

      {/* FAQ (vin uniquement) — visible + repris en JSON-LD pour les rich snippets */}
      {page?.faq && (
        <section className="relative z-10 border-t border-paper/10 bg-coal px-6 py-20 md:px-12">
          <p className="mb-3 text-center font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Questions fréquentes
          </p>
          <h2 className="mx-auto mb-12 max-w-[24ch] text-center font-display uppercase leading-[0.9] tracking-tight text-[clamp(1.8rem,5vw,3.4rem)]">
            Graphiste &amp; vin, en pratique
          </h2>
          <div className="mx-auto max-w-[760px] divide-y divide-paper/10 border-y border-paper/10">
            {page.faq.map((f) => (
              <div key={f.q} className="py-6">
                <h3 className="mb-2 font-display text-base uppercase tracking-tight text-paper md:text-lg">
                  {f.q}
                </h3>
                <p className="text-sm leading-relaxed text-paper/70 md:text-base">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Contact />
    </main>
  );
}
