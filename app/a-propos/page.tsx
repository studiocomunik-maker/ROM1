import type { Metadata } from "next";
import PageNav from "../components/PageNav";
import Atelier from "../components/Atelier";
import Contact from "../components/Contact";
import { SITE_URL } from "../data";

const TITLE = "À propos — Romain Renoux, graphiste en Beaujolais";
const DESCRIPTION =
  "Graphiste et directeur artistique installé au cœur du Beaujolais depuis 2005. Avec Céline Kbaier, deux regards au service du vin, du spectacle et de l'industrie.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/a-propos` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/a-propos`,
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
      name: "À propos",
      item: `${SITE_URL}/a-propos`,
    },
  ],
};

export default function AProposPage() {
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
          ★ À propos
        </p>
        <h1 className="max-w-[14ch] font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.6rem,9vw,7rem)]">
          L&apos;image est un métier<span className="text-orange">.</span>
        </h1>
        <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-paper/75 md:text-2xl">
          Romain Renoux, graphiste et directeur artistique en Beaujolais.
          20 ans de projets pour le vin, le spectacle et l&apos;industrie —
          et toujours la même obsession : raconter juste.
        </p>
        <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
          L&apos;atelier ↓
        </p>
      </section>

      {/* L'ATELIER — Romain & Céline (section partagée avec la home) */}
      <Atelier />

      <Contact />
    </main>
  );
}
