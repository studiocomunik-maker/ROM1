import type { Metadata } from "next";
import { Inter, Archivo_Black, Anton } from "next/font/google";
import "./globals.css";
import TransitionProvider from "./components/TransitionProvider";
import { SITE_URL } from "./data";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const TITLE = "Graphiste en Beaujolais — vin, image & web · Romain Renoux";
const DESCRIPTION =
  "Romain Renoux, graphiste indépendant en Beaujolais : identité visuelle, étiquettes de vin, packaging, photo et web pour domaines et vignerons. 20 ans de métier.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  keywords: [
    "graphiste Beaujolais",
    "graphiste indépendant",
    "graphiste vin",
    "graphiste vigneron",
    "étiquette de vin",
    "identité domaine viticole",
    "direction artistique Beaujolais",
    "directeur artistique indépendant",
    "graphiste Lyon",
  ],
  openGraph: {
    type: "website",
    siteName: "rom1 — Romain Renoux",
    locale: "fr_FR",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

// Données structurées site (knowledge graph). Les réseaux sociaux (sameAs)
// seront ajoutés dès que Romain les fournit.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "rom1 — Romain Renoux",
      inLanguage: "fr-FR",
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${SITE_URL}/#org`,
      name: "rom1 — Romain Renoux, graphiste en Beaujolais",
      alternateName: ["Romain Renoux", "rom1"],
      url: SITE_URL,
      email: "rom1@rom1.fr",
      logo: `${SITE_URL}/icon.png`,
      image: `${SITE_URL}/opengraph-image.png`,
      description: DESCRIPTION,
      slogan: "Graphiste spécialisé vin & domaines viticoles en Beaujolais.",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Beaujolais",
        addressCountry: "FR",
      },
      areaServed: ["Beaujolais", "Lyon", "Rhône", "Mâconnais", "France"],
      sameAs: [
        "https://www.instagram.com/rom1unik/",
        "https://www.youtube.com/@rom1unik",
      ],
      knowsAbout: [
        "Graphisme",
        "Direction artistique",
        "Étiquette de vin",
        "Identité visuelle de domaine viticole",
        "Packaging vin",
        "Photographie",
        "Vidéo",
        "Drone",
        "Motion design",
        "Print",
        "Web design",
      ],
      founder: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Romain Renoux",
      alternateName: "rom1",
      jobTitle: "Graphiste indépendant — Directeur artistique",
      url: SITE_URL,
      email: "rom1@rom1.fr",
      worksFor: { "@id": `${SITE_URL}/#org` },
      sameAs: [
        "https://www.instagram.com/rom1unik/",
        "https://www.youtube.com/@rom1unik",
      ],
      knowsAbout: [
        "Graphisme",
        "Direction artistique",
        "Étiquette de vin",
        "Identité visuelle",
        "Packaging",
        "Photographie",
        "Vidéo",
        "Motion design",
        "Web design",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${archivoBlack.variable} ${anton.variable} antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}
