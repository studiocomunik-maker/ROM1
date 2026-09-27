import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autorise l'optimisation Vercel des médias hébergés sur le Storage Supabase.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zcznwdearijfxfxnpsbz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Les scripts SQL sont lus à l'exécution par /admin/compta/pages-devis/sql
  // (bouton « Copier le SQL »). Sans ça, le dossier n'est pas embarqué dans la
  // fonction déployée sur Vercel et la route répond 500 en production.
  // L'ancienne landing « graphiste beaujolais » concurrençait l'accueil sur la
  // requête tête : son contenu vit maintenant sur / (bloc Beaujolais).
  async redirects() {
    return [
      { source: "/graphiste-beaujolais", destination: "/", permanent: true },
    ];
  },
  outputFileTracingIncludes: {
    "/admin/compta/pages-devis/sql": ["./supabase/*.sql"],
  },
};

export default nextConfig;
