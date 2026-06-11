import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PageNav from "../components/PageNav";
import Contact from "../components/Contact";
import { EXPS, UNIVERS, SITE_URL, univers } from "../data";
import { getRealisations } from "../../utils/realisations";

export const revalidate = 60;

const TITLE = "Réalisations — étiquettes, identités, films & scénographies · Romain Renoux";
const DESCRIPTION =
  "Le portfolio de Romain Renoux, graphiste en Beaujolais : étiquettes de vin, identités visuelles, packaging, films, sites web et scénographies de concert.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/realisations` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/realisations`,
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
      name: "Réalisations",
      item: `${SITE_URL}/realisations`,
    },
  ],
};

export default async function RealisationsPage() {
  const reals = await getRealisations();

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
          ★ Réalisations
        </p>
        <h1 className="max-w-[14ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.6rem,9vw,7rem)]">
          Des images qui racontent<span className="text-orange">.</span>
        </h1>
        <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
          Étiquettes, identités, films, sites et écrans de scène : chaque projet
          raconte un terroir, un geste, une histoire. En voici quelques-unes.
        </p>

        {/* Entrées par univers — les pages /univers/* font le tri */}
        <div className="mt-10 flex flex-wrap gap-2.5">
          {univers.map((u) => (
            <Link
              key={u.key}
              href={`/univers/${u.key}`}
              className="border border-paper/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/80 transition-colors hover:border-orange hover:text-orange"
            >
              {u.t}
            </Link>
          ))}
        </div>

        <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
          {reals.length} projet{reals.length > 1 ? "s" : ""} ↓
        </p>
      </section>

      {/* GRILLE — même vocabulaire que les pages métier/univers */}
      <section className="relative z-10 bg-white text-coal">
        {reals.length === 0 ? (
          <p className="px-6 py-20 text-center font-mono text-xs uppercase tracking-[0.15em] text-coal/40">
            Bientôt des réalisations ici.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-coal/10 sm:grid-cols-3">
            {reals.map((p) => (
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
                  <h2 className="font-display text-xl uppercase leading-none tracking-tight text-paper md:text-2xl">
                    {p.titre}
                  </h2>
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
            href="/savoir-faire"
            className="font-mono text-xs uppercase tracking-[0.15em] text-coal/60 transition-colors hover:text-coal"
          >
            ← Le savoir-faire
          </Link>
          <Link
            href="/a-propos"
            className="font-display text-sm uppercase tracking-[0.12em] text-coal transition-opacity hover:opacity-60"
          >
            À propos →
          </Link>
        </div>
      </section>

      <Contact />
    </main>
  );
}
