import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageNav from "../../components/PageNav";
import Contact from "../../components/Contact";
import { EXPS, UNIVERS, SITE_URL, getMetier, metiers } from "../../data";
import { getRealisationsByMetier } from "../../../utils/realisations";

export const revalidate = 60;

export function generateStaticParams() {
  return metiers.map((m) => ({ slug: m.key }));
}

export async function generateMetadata({
  params,
}: PageProps<"/metiers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMetier(slug);
  if (!m) return {};
  return {
    title: `${m.t} — Romain Renoux`,
    description: m.intro.slice(0, 160),
    alternates: { canonical: `${SITE_URL}/metiers/${m.key}` },
  };
}

export default async function MetierPage({ params }: PageProps<"/metiers/[slug]">) {
  const { slug } = await params;
  const metier = getMetier(slug);
  if (!metier) notFound();

  const refs = await getRealisationsByMetier(metier.key);
  const idx = metiers.findIndex((m) => m.key === metier.key);
  const next = metiers[(idx + 1) % metiers.length];

  return (
    <main className="bg-coal text-paper">
      <PageNav back="/" backLabel="Accueil" />

      {/* HERO métier — explique l'expertise */}
      <section className="grain relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-32 md:px-12">
        <p className="mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange">
          ★ Métier · {metier.sub}
        </p>
        <h1 className="max-w-[14ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.6rem,9vw,7rem)]">
          {metier.t}
          <span className="text-orange">.</span>
        </h1>
        <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
          {metier.intro}
        </p>
        <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
          {refs.length} réalisation{refs.length > 1 ? "s" : ""} ↓
        </p>
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
