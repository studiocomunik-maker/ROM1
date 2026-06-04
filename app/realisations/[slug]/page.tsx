import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageNav from "../../components/PageNav";
import Reveal from "../../components/Reveal";
import Gallery from "./Gallery";
import VideoPlayer from "./VideoPlayer";
import YouTubeFacade from "./YouTubeFacade";
import TextBand from "./TextBand";
import { EXPS, UNIVERS, SITE_URL } from "../../data";
import {
  getRealisation,
  getRealisations,
  youtubeId,
  padCss,
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
  if (m.kind === "text") {
    return (
      <TextBand
        eyebrow={m.eyebrow}
        text={m.text}
        body={m.body}
        align={m.align}
        size={m.size}
        color={m.color}
      />
    );
  }
  if (m.kind === "gallery") {
    return <Gallery images={m.images ?? []} titre={titre} />;
  }
  if (m.kind === "youtube") {
    const id = youtubeId(m.url);
    if (!id) return null;
    return <YouTubeFacade id={id} titre={titre} />;
  }
  if (m.kind === "video") {
    return <VideoPlayer url={m.url} poster={m.poster} w={m.w} h={m.h} titre={titre} />;
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
  // Autres réalisations (les suivantes, en cyclique) pour relier les projets
  const related = [...list.slice(idx + 1), ...list.slice(0, idx)]
    .filter((x) => x.slug !== p.slug)
    .slice(0, 3);

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

      <div className="flex flex-col lg:grid lg:grid-cols-[1.8fr_1fr]">
        {/* COLONNE GAUCHE — visuels qui scrollent (0px entre eux) */}
        <div className="order-2 flex flex-col lg:order-1">
          {visuals.length > 0 ? (
            visuals.map((m, i) => (
              <div
                key={i}
                className="media-pad"
                style={
                  {
                    // padding façon CSS : "20" (tous côtés) ou "20 0 40 0" (h d b g)
                    // plein dès 768px (--pad-d), ÷4 sur smartphone (--pad-m)
                    "--pad-d": padCss(m.pad) ?? "0",
                    "--pad-m": padCss(m.pad, 0.25) ?? "0",
                    background: m.bg || undefined,
                  } as React.CSSProperties
                }
              >
                <Visual m={m} titre={p.titre} />
              </div>
            ))
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

            {p.partners.length > 0 && (
              <div className="mt-8">
                <p className={`mb-3 font-mono text-[10px] uppercase tracking-[0.2em] ${light ? "text-coal/45" : "text-paper/45"}`}>
                  Partenaires
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {p.partners.map((pt, i) => {
                    const inner = pt.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pt.logo} alt={pt.name} className="h-7 w-auto max-w-[110px] object-contain" />
                    ) : (
                      <span className="font-display text-sm uppercase tracking-tight">{pt.name}</span>
                    );
                    return pt.url ? (
                      <a
                        key={i}
                        href={pt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-75 transition-opacity hover:opacity-100"
                      >
                        {inner}
                      </a>
                    ) : (
                      <span key={i} className="opacity-75">
                        {inner}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="mailto:rom1@rom1.fr"
                className="w-fit bg-orange px-6 py-3 font-display text-sm uppercase tracking-[0.12em] text-coal transition-transform hover:scale-[1.03]"
              >
                Un projet comme ça ?
              </a>
              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`border px-6 py-3 font-display text-sm uppercase tracking-[0.12em] transition-colors hover:border-orange hover:text-orange ${
                    light ? "border-coal/30 text-coal" : "border-paper/30 text-paper"
                  }`}
                >
                  Voir le site ↗
                </a>
              )}
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

      {/* Autres réalisations — passerelle entre les projets */}
      {related.length > 0 && (
        <section className="bg-coal px-6 py-20 text-paper md:px-12 md:py-24">
          <Reveal>
            <p className="mb-10 text-center font-display text-xs uppercase tracking-[0.3em] text-orange">
              ★ Autres réalisations
            </p>
          </Reveal>
          <div
            className={`mx-auto grid gap-3 ${
              related.length === 1
                ? "max-w-[480px]"
                : related.length === 2
                  ? "max-w-[780px] sm:grid-cols-2"
                  : "sm:grid-cols-3"
            }`}
          >
            {related.map((o) => (
              <Link
                key={o.slug}
                href={`/realisations/${o.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden bg-coal text-paper"
              >
                {/* Image (base, toujours visible) */}
                {o.cover_url ? (
                  <Image
                    src={o.cover_url}
                    alt={o.titre}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-coal to-night">
                    <span className="font-display text-2xl uppercase tracking-tight text-paper/15">rom1</span>
                  </div>
                )}

                {/* Voile sombre : assombrit par défaut → transparent au survol */}
                <div className="absolute inset-0 bg-coal/60 transition-colors duration-300 group-hover:bg-coal/0" />

                {/* Univers + titre : par défaut → s'effacent au survol */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 p-5 text-center transition-opacity duration-300 group-hover:opacity-0">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
                    {UNIVERS[o.univers] ?? o.univers}
                  </span>
                  <h3 className="font-display text-xl uppercase leading-none tracking-tight text-paper md:text-2xl">
                    {o.titre}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA de fin de page projet */}
      <section className="grain relative overflow-hidden bg-orange px-6 py-24 text-center text-coal md:px-12 md:py-32">
        <Reveal>
          <p className="mb-5 font-display text-xs uppercase tracking-[0.25em]">
            Une histoire à raconter ?
          </p>
          <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2.4rem,8vw,5.5rem)]">
            Parlons de la vôtre.
          </h2>
          <a
            href="mailto:rom1@rom1.fr"
            className="mt-8 inline-block bg-coal px-6 py-3 font-display text-sm uppercase tracking-[0.12em] text-paper transition-transform hover:scale-[1.03]"
          >
            rom1@rom1.fr
          </a>
        </Reveal>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.15em]">
          <Link href="/#portfolio" className="text-coal/70 transition-colors hover:text-coal">
            ← Toutes les réalisations
          </Link>
          {next && (
            <Link href={`/realisations/${next.slug}`} className="text-coal/70 transition-colors hover:text-coal">
              Projet suivant · {next.titre} →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
