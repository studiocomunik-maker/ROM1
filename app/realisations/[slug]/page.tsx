import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageNav from "../../components/PageNav";
import { EXPS, UNIVERS, getProjet, projets } from "../../data";

export function generateStaticParams() {
  return projets.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/realisations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProjet(slug);
  if (!p) return {};
  return { title: `${p.t} — Romain Renoux`, description: p.desc };
}

export default async function RealisationPage({
  params,
}: PageProps<"/realisations/[slug]">) {
  const { slug } = await params;
  const p = getProjet(slug);
  if (!p) notFound();

  const idx = projets.findIndex((x) => x.slug === p.slug);
  const next = projets[(idx + 1) % projets.length];

  // Visuels de la colonne qui scrolle : visuel principal + slots à venir.
  const lead = p.img ? { type: "img" as const, src: p.img } : { type: "bg" as const, bg: p.bg! };
  const blocks = [lead, { type: "ph" as const }, { type: "ph" as const }];

  return (
    <main className="min-h-screen bg-coal text-paper">
      <PageNav back="/" backLabel="Accueil" />

      <div className="lg:grid lg:grid-cols-[1.8fr_1fr]">
        {/* COLONNE GAUCHE — visuels qui scrollent */}
        <div className="order-2 flex flex-col gap-px bg-white/5 lg:order-1">
          {blocks.map((b, i) =>
            b.type === "img" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={b.src}
                alt={p.t}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : b.type === "bg" ? (
              <div key={i} className="aspect-[4/3] w-full" style={{ background: b.bg }} />
            ) : (
              <div
                key={i}
                className="flex aspect-[4/3] w-full items-center justify-center"
                style={{ background: p.bg ?? "#15140f" }}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
                  ▸ Visuel à venir
                </span>
              </div>
            )
          )}
        </div>

        {/* COLONNE DROITE — panneau sticky : titre + descriptif */}
        <aside className="order-1 lg:order-2">
          <div className="flex min-h-[60vh] flex-col justify-center px-6 py-28 lg:sticky lg:top-0 lg:h-screen lg:min-h-0 lg:px-10">
            <p className="mb-5 font-display text-xs uppercase tracking-[0.25em] text-orange">
              {UNIVERS[p.univers]} · {p.year}
            </p>
            <h1 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2.2rem,5vw,3.8rem)]">
              {p.t}
            </h1>
            {p.client && (
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-paper/45">
                {p.client}
              </p>
            )}
            <p className="mt-7 max-w-[42ch] leading-relaxed text-paper/75">
              {p.intro ?? p.desc}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {p.exps.map((x) => (
                <Link
                  key={x}
                  href={`/metiers/${x}`}
                  className="border border-paper/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-paper/80 transition-colors hover:border-orange hover:text-orange"
                >
                  {EXPS[x]}
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
              <Link
                href={`/realisations/${next.slug}`}
                className="font-display text-xs uppercase tracking-[0.15em] text-paper/60 transition-colors hover:text-paper"
              >
                Suivant · {next.t} →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
