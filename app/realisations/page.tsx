import Link from "next/link";
import type { Metadata } from "next";
import PageNav from "../components/PageNav";
import Contact from "../components/Contact";
import Portfolio from "../components/Portfolio";
import { SITE_URL } from "../data";
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

/* Page = la section Portfolio de l'accueil (titre + œil + double filtre
   univers/expertise + grille), en pleine page avec son h1. */
export default async function RealisationsPage() {
  const reals = await getRealisations();
  const items = reals.map((r) => ({
    slug: r.slug,
    titre: r.titre,
    univers: r.univers,
    exps: r.exps,
    cover_url: r.cover_url,
  }));

  return (
    <main className="bg-white text-coal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <PageNav />

      {/* pt : dégage le logo fixe (~90px de haut) avant l'en-tête Portfolio */}
      <div className="pt-16 md:pt-20">
        <Portfolio items={items} as="h1" />
      </div>

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

      <Contact />
    </main>
  );
}
