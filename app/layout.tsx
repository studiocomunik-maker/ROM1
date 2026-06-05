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

const DESCRIPTION =
  "20 ans à donner une image aux marques. Direction artistique, photo, vidéo & drone, motion design, print et web. Beaujolais · Lyon · Rhône.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Romain Renoux — Direction artistique, image & web · Beaujolais",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "rom1 — Romain Renoux",
    locale: "fr_FR",
    url: SITE_URL,
    title: "Romain Renoux — Direction artistique, image & web · Beaujolais",
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
      name: "rom1",
      alternateName: "Romain Renoux",
      url: SITE_URL,
      email: "rom1@rom1.fr",
      logo: `${SITE_URL}/icon.png`,
      image: `${SITE_URL}/opengraph-image.png`,
      description: DESCRIPTION,
      areaServed: ["Beaujolais", "Lyon", "Rhône", "France"],
      knowsAbout: [
        "Direction artistique",
        "Photographie",
        "Vidéo",
        "Drone",
        "Motion design",
        "Print",
        "Web design",
      ],
      founder: { "@type": "Person", name: "Romain Renoux" },
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
