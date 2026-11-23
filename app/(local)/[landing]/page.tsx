import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageNav from "../../components/PageNav";
import Contact from "../../components/Contact";
import { EXPS, UNIVERS, SITE_URL, getMetier } from "../../data";
import { localPages, getLocalPage, type LocalPage } from "../../local-pages";
import { getRealisations, type Realisation } from "../../../utils/realisations";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return localPages.map((p) => ({ landing: p.slug }));
}

/* Réalisations choisies pour la page, dans l'ordre de `page.realisations`.
   Un slug dépublié ou supprimé est simplement ignoré. */
async function pickRealisations(page: LocalPage): Promise<Realisation[]> {
  const all = await getRealisations();
  const bySlug = new Map(all.map((r) => [r.slug, r]));
  return page.realisations
    .map((s) => bySlug.get(s))
    .filter((r): r is Realisation => Boolean(r));
}

export async function generateMetadata({
  params,
}: PageProps<"/[landing]">): Promise<Metadata> {
  const { landing } = await params;
  const page = getLocalPage(landing);
  if (!page) return {};
  const url = `${SITE_URL}/${page.slug}`;
  const refs = await pickRealisations(page);
  // openGraph défini ici remplace celui du layout (fusion superficielle) :
  // on redonne une image, sinon la page n'a aucun aperçu de partage.
  const cover = refs.find((r) => r.cover_url)?.cover_url;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: page.metaTitle,
      description: page.metaDescription,
      ...(cover ? { images: [{ url: cover, alt: page.h1 }] } : {}),
    },
  };
}

export default async function LocalLanding({ params }: PageProps<"/[landing]">) {
  const { landing } = await params;
  const page = getLocalPage(landing);
  if (!page) notFound();

  const refs = await pickRealisations(page);
  const heroCover = refs.find((r) => r.cover_url)?.cover_url ?? null;

  const url = `${SITE_URL}/${page.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: page.h1, item: url },
        ],
      },
      {
        "@type": "Service",
        serviceType: page.serviceType,
        url,
        provider: { "@id": `${SITE_URL}/#org` },
        areaServed: page.ville
          ? { "@type": "City", name: page.ville }
          : "Beaujolais",
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      ...(refs.length
        ? [
            {
              "@type": "ItemList",
              name: `Réalisations — ${page.h1}`,
              itemListElement: refs.map((r, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_URL}/realisations/${r.slug}`,
                name: r.titre,
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <main className="bg-coal text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageNav />

      {/* HERO — fond = couverture de la première réalisation choisie */}
      <section className="grain relative flex min-h-[80vh] flex-col justify-center overflow-hidden px-6 pb-20 pt-32 md:px-12">
        {heroCover && (
          <div className="absolute inset-0 z-0" aria-hidden>
            <Image
              src={heroCover}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/75 to-coal/45" />
          </div>
        )}
        <div className="relative z-10">
          <p className="mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ {page.eyebrow}
          </p>
          <h1 className="max-w-[16ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.4rem,7.5vw,6rem)]">
            {page.h1}
            <span className="text-orange">.</span>
          </h1>
          <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-paper/80 md:text-xl">
            {page.intro}
          </p>
          {refs.length > 0 && (
            <p className="mt-14 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
              {refs.length} réalisation{refs.length > 1 ? "s" : ""} ↓
            </p>
          )}
        </div>
      </section>

      {/* RÉALISATIONS — le travail avant le texte (cartes identiques aux pages métiers) */}
      {refs.length > 0 && (
        <section className="relative z-10 bg-white text-coal">
          <div className="px-6 py-16 text-center md:px-12">
            <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
              ★ Réalisations
            </p>
            <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
              Quelques projets
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-coal/10 sm:grid-cols-3">
            {refs.map((p) => (
              <Link
                key={p.slug}
                href={`/realisations/${p.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden bg-coal text-paper"
              >
                {p.cover_url ? (
                  <Image
                    src={p.cover_url}
                    alt={p.titre}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
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

          <div className="flex justify-center px-6 py-12 md:px-12">
            <Link
              href="/realisations"
              className="border border-orange bg-orange px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-coal transition-transform hover:scale-[1.03]"
            >
              Toutes les réalisations →
            </Link>
          </div>
        </section>
      )}

      {/* CONTENU */}
      <section className="relative z-10 bg-paper px-6 py-20 text-coal md:px-12">
        <div className="mx-auto max-w-3xl space-y-16">
          {page.sections.map((s) => (
            <div key={s.title}>
              <h2 className="mb-6 font-display uppercase leading-[0.95] tracking-tight text-[clamp(1.5rem,3.5vw,2.4rem)]">
                {s.title}
              </h2>
              {s.body.map((p, i) => (
                <p
                  key={i}
                  className="mt-4 leading-relaxed text-coal/80 md:text-lg"
                >
                  {p}
                </p>
              ))}
            </div>
          ))}

          {/* Métiers liés */}
          <div className="flex flex-wrap gap-2">
            {page.metierLinks.map((key) => {
              const m = getMetier(key);
              if (!m) return null;
              return (
                <Link
                  key={key}
                  href={`/metiers/${key}`}
                  className="border border-coal/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-coal/70 transition-colors hover:border-coal hover:text-coal"
                >
                  {m.t} →
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 bg-white px-6 py-20 text-coal md:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Questions fréquentes
          </p>
          <h2 className="mb-10 font-display uppercase leading-[0.95] tracking-tight text-[clamp(1.6rem,4vw,2.6rem)]">
            On me demande souvent
          </h2>
          <dl className="divide-y divide-coal/15">
            {page.faq.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="font-display text-base uppercase tracking-tight md:text-lg">
                  {f.q}
                </dt>
                <dd className="mt-3 leading-relaxed text-coal/75">{f.a}</dd>
              </div>
            ))}
          </dl>

          {/* Pages voisines */}
          <div className="mt-12 border-t border-coal/15 pt-8">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-coal/50">
              Autour d&apos;ici
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {page.related.map((slug) => {
                const r = getLocalPage(slug);
                if (!r) return null;
                return (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    className="font-mono text-xs uppercase tracking-[0.12em] text-coal/60 underline-offset-4 transition-colors hover:text-coal hover:underline"
                  >
                    {r.h1}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Contact />
    </main>
  );
}
