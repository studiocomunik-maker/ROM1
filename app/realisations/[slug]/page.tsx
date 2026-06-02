import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageNav from "../../components/PageNav";
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

// Chaque visuel est centré sur fond noir et plafonné en hauteur (max-h-[88vh]) :
// le paysage remplit la largeur, le portrait (ex. vidéo 1080×1920) reste dans
// une taille raisonnable avec letterbox latéral, sans déformation.
function Visual({ m, titre }: { m: Media; titre: string }) {
  if (m.kind === "youtube") {
    const id = youtubeId(m.url);
    if (!id) return null;
    return (
      <div className="flex justify-center bg-black">
        <div className="aspect-video w-full">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${id}`}
            title={titre}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }
  if (m.kind === "video") {
    return (
      <div className="flex justify-center bg-black">
        <video
          className="max-h-[88vh] w-auto max-w-full object-contain"
          src={m.url}
          controls
          playsInline
          preload="metadata"
        />
      </div>
    );
  }
  return (
    <div className="flex justify-center bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={m.url}
        alt={titre}
        loading="lazy"
        className="max-h-[88vh] w-auto max-w-full object-contain"
      />
    </div>
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

  // Colonne gauche : image de mise en avant en tête, puis les médias.
  const visuals: Media[] = [
    ...(p.cover_url ? [{ kind: "image" as const, url: p.cover_url }] : []),
    ...p.media,
  ];

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

        {/* COLONNE DROITE — panneau sticky : titre + descriptif */}
        <aside className="order-1 lg:order-2">
          <div className="flex min-h-[60vh] flex-col justify-center px-6 py-28 lg:sticky lg:top-0 lg:h-screen lg:min-h-0 lg:px-10">
            <p className="mb-5 font-display text-xs uppercase tracking-[0.25em] text-orange">
              {UNIVERS[p.univers] ?? p.univers}
            </p>
            <h1 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2.2rem,5vw,3.8rem)]">
              {p.titre}
            </h1>
            {p.description && (
              <p className="mt-7 max-w-[44ch] leading-relaxed text-paper/75">{p.description}</p>
            )}

            <div className="mt-7 flex flex-wrap gap-2">
              {p.exps.map((x) => (
                <Link
                  key={x}
                  href={`/metiers/${x}`}
                  className="border border-paper/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-paper/80 transition-colors hover:border-orange hover:text-orange"
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
                  className="font-display text-xs uppercase tracking-[0.15em] text-paper/60 transition-colors hover:text-paper"
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
