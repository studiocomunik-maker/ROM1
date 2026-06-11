import Link from "next/link";
import type { Metadata } from "next";
import PageNav from "../components/PageNav";
import Contact from "../components/Contact";
import { SITE_URL, metiers, univers } from "../data";

const TITLE = "Savoir-faire — identité, print, photo, web & motion · Romain Renoux";
const DESCRIPTION =
  "Cinq métiers — identité graphique, print & étiquettes, photo/vidéo, webdesign, motion — au service du vin, du spectacle et de l'industrie. 20 ans de métier en Beaujolais.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/savoir-faire` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/savoir-faire`,
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
      name: "Savoir-faire",
      item: `${SITE_URL}/savoir-faire`,
    },
  ],
};

export default function SavoirFairePage() {
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
          ★ Savoir-faire
        </p>
        <h1 className="max-w-[14ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.6rem,9vw,7rem)]">
          Cinq métiers, un seul œil<span className="text-orange">.</span>
        </h1>
        <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
          De l&apos;identité au motion, je pratique des métiers qui
          s&apos;additionnent — et des univers où je les exerce depuis 20 ans :
          le vin d&apos;abord, le spectacle, l&apos;industrie, l&apos;art et les
          belles tables.
        </p>
        <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
          {metiers.length} métiers · {univers.length} univers ↓
        </p>
      </section>

      {/* MÉTIERS */}
      <section className="relative z-10 bg-white text-coal">
        <div className="px-6 py-16 text-center md:px-12">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Métiers
          </p>
          <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
            Ce que je fais
          </h2>
        </div>

        <ul className="border-b border-coal/10">
          {metiers.map((m, i) => (
            <li key={m.key} className="border-t border-coal/10">
              <Link
                href={`/metiers/${m.key}`}
                className="group grid gap-x-10 gap-y-2 px-6 py-10 transition-colors duration-300 hover:bg-coal hover:text-paper md:grid-cols-[3rem_1fr_auto] md:items-center md:px-12 md:py-12"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-orange">
                  0{i + 1}
                </span>
                <span className="block">
                  <span className="block font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(1.6rem,4.5vw,3rem)]">
                    {m.t}
                  </span>
                  <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-coal/50 group-hover:text-paper/60">
                    {m.sub}
                  </span>
                  <span className="mt-3 block max-w-[65ch] text-sm leading-relaxed text-coal/70 group-hover:text-paper/75 md:text-base">
                    {m.intro}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="hidden font-display text-2xl text-orange transition-transform duration-300 group-hover:translate-x-2 md:block"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* UNIVERS */}
      <section className="relative z-10 bg-coal text-paper">
        <div className="px-6 py-16 text-center md:px-12">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-orange">
            ★ Univers
          </p>
          <h2 className="font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4.5rem)]">
            Pour qui je le fais
          </h2>
        </div>

        <ul className="border-b border-paper/10">
          {univers.map((u, i) => (
            <li key={u.key} className="border-t border-paper/10">
              <Link
                href={`/univers/${u.key}`}
                className="group grid gap-x-10 gap-y-2 px-6 py-10 transition-colors duration-300 hover:bg-orange hover:text-coal md:grid-cols-[3rem_1fr_auto] md:items-center md:px-12 md:py-12"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-orange group-hover:text-coal">
                  0{i + 1}
                </span>
                <span className="block">
                  <span
                    className={`flex items-center gap-3 font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(1.6rem,4.5vw,3rem)] ${
                      u.featured ? "text-orange group-hover:text-paper" : ""
                    }`}
                  >
                    {u.featured && (
                      <span className="inline-block h-2 w-2 rounded-full bg-orange group-hover:bg-paper" />
                    )}
                    {u.t}
                  </span>
                  <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-paper/50 group-hover:text-coal/60">
                    {u.sub}
                  </span>
                  <span className="mt-3 block max-w-[65ch] text-sm leading-relaxed text-paper/70 group-hover:text-coal/80 md:text-base">
                    {u.intro}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="hidden font-display text-2xl text-orange transition-transform duration-300 group-hover:translate-x-2 group-hover:text-coal md:block"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Contact />
    </main>
  );
}
