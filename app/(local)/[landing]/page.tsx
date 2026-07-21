import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageNav from "../../components/PageNav";
import Contact from "../../components/Contact";
import { SITE_URL, getMetier } from "../../data";
import { localPages, getLocalPage } from "../../local-pages";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return localPages.map((p) => ({ landing: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[landing]">): Promise<Metadata> {
  const { landing } = await params;
  const page = getLocalPage(landing);
  if (!page) return {};
  const url = `${SITE_URL}/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default async function LocalPage({ params }: PageProps<"/[landing]">) {
  const { landing } = await params;
  const page = getLocalPage(landing);
  if (!page) notFound();

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
    ],
  };

  return (
    <main className="bg-coal text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageNav />

      {/* HERO */}
      <section className="grain relative flex min-h-[70vh] flex-col justify-center px-6 pb-20 pt-32 md:px-12">
        <p className="mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange">
          ★ {page.eyebrow}
        </p>
        <h1 className="max-w-[16ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.4rem,7.5vw,6rem)]">
          {page.h1}
          <span className="text-orange">.</span>
        </h1>
        <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-paper/75 md:text-xl">
          {page.intro}
        </p>
      </section>

      {/* CONTENU */}
      <section className="relative z-10 bg-white px-6 py-20 text-coal md:px-12">
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
            <Link
              href="/realisations"
              className="border border-orange bg-orange px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-coal transition-transform hover:scale-[1.03]"
            >
              Voir les réalisations →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 bg-paper px-6 py-20 text-coal md:px-12">
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
