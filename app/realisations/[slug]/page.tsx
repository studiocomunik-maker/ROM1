import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageNav from "../../components/PageNav";
import Gallery from "./Gallery";
import { EXPS, UNIVERS, SITE_URL } from "../../data";
import {
  getRealisation,
  getRealisations,
  youtubeId,
  type Media,
} from "../../../utils/realisations";

export const revalidate = 60; // ISR : nouvelles réalisations visibles sous 1 min

export async function generateStaticParams() {
  const list = await getRealisations();
  return list.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/realisations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getRealisation(slug);
  if (!p) return {};
  const description = (p.description ?? "").slice(0, 160);
  const url = `${SITE_URL}/realisations/${p.slug}`;
  return {
    title: `${p.titre} — Romain Renoux`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: p.titre,
      description,
      url,
      images: p.cover_url ? [{ url: p.cover_url }] : undefined,
    },
  };
}

// Scroll plein cadre : chaque visuel occupe toute la largeur de la colonne,
// la hauteur s'adapte au ratio (pas de plafond ni de letterbox).
const SIZES = "(min-width: 1024px) 64vw, 100vw";

function Visual({ m, titre }: { m: Media; titre: string }) {
  if (m.kind === "gallery") {
    return <Gallery images={m.images ?? []} titre={titre} />;
  }
  if (m.kind === "youtube") {
    const id = youtubeId(m.url);
    if (!id) return null;
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${id}`}
          title={titre}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (m.kind === "video") {
    return <video className="block h-auto w-full" src={m.url} controls playsInline preload="metadata" />;
  }
  // Image avec dimensions connues → next/image (optimisé), pleine largeur.
  if (m.w && m.h) {
    return (
      <Image
        src={m.url}
        alt={titre}
        width={m.w}
        height={m.h}
        sizes={SIZES}
        className="block h-auto w-full"
      />
    );
  }
  // Fallback (médias sans dimensions).
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={m.url} alt={titre} loading="lazy" className="block h-auto w-full" />
  );
}

export default async function RealisationPage({
  params,
}: PageProps<"/realisations/[slug]">) {
  const { slug } = await params;
  const p = await getRealisation(slug);
  if (!p) notFound();

  const list = await getRealisations();
  const idx = list.findIndex((x) => x.slug === p.slug);
  const next = list.length > 1 ? list[(idx + 1) % list.length] : null;

  // Colonne gauche = UNIQUEMENT les médias uploadés (la cover sert de vignette
  // dans les listings). Si aucun média, on retombe sur la cover en secours.
  const visuals: Media[] =
    p.media.length > 0
      ? p.media
      : p.cover_url
        ? [{ kind: "image" as const, url: p.cover_url }]
        : [];

  const light = p.panel_theme === "light";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: p.titre,
        description: p.description ?? undefined,
        image: p.cover_url ?? undefined,
        url: `${SITE_URL}/realisations/${p.slug}`,
        creator: { "@type": "Person", name: "Romain Renoux", url: SITE_URL },
        about: UNIVERS[p.univers] ?? p.univers,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Réalisations",
            item: `${SITE_URL}/#portfolio`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: p.titre,
            item: `${SITE_URL}/realisations/${p.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-coal text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageNav back="/" backLabel="Accueil" />

      <div className="lg:grid lg:grid-cols-[1.8fr_1fr]">
        {/* COLONNE GAUCHE — visuels qui scrollent */}
        <div className="order-2 flex flex-col gap-px bg-white/5 lg:order-1">
          {visuals.length > 0 ? (
            visuals.map((m, i) => <Visual key={i} m={m} titre={p.titre} />)
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-night">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
                ▸ Aucun visuel
              </span>
            </div>
          )}
        </div>

        {/* COLONNE DROITE — panneau sticky : titre + descriptif (thème au choix) */}
        <aside className="order-1 lg:order-2">
          <div
            className={`flex min-h-[60vh] flex-col justify-center px-6 py-28 lg:sticky lg:top-0 lg:h-screen lg:min-h-0 lg:px-10 ${
              light ? "bg-paper text-coal" : "bg-coal text-paper"
            }`}
          >
            <p className="mb-5 font-display text-xs uppercase tracking-[0.25em] text-orange">
              {UNIVERS[p.univers] ?? p.univers}
            </p>
            <h1 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2.2rem,5vw,3.8rem)]">
              {p.titre}
            </h1>
            {p.description && (
              <p className={`mt-7 max-w-[44ch] leading-relaxed ${light ? "text-coal/70" : "text-paper/75"}`}>
                {p.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-2">
              {p.exps.map((x) => (
                <Link
                  key={x}
                  href={`/metiers/${x}`}
                  className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors hover:border-orange hover:text-orange ${
                    light ? "border-coal/30 text-coal/80" : "border-paper/30 text-paper/80"
                  }`}
                >
                  {EXPS[x] ?? x}
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="mailto:rom1@rom1.fr"
                className="w-fit bg-orange px-6 py-3 font-display text-sm uppercase tracking-[0.12em] text-coal transition-transform hover:scale-[1.03]"
              >
                Un projet comme ça ?
              </a>
              {next && (
                <Link
                  href={`/realisations/${next.slug}`}
                  className={`font-display text-xs uppercase tracking-[0.15em] transition-colors ${
                    light ? "text-coal/60 hover:text-coal" : "text-paper/60 hover:text-paper"
                  }`}
                >
                  Suivant · {next.titre} →
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
