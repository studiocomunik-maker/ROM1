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
  // (/graphiste-beaujolais n'est plus redirigée vers / depuis le 24/11/2026 :
  // c'est de nouveau une page locale, cf. app/local-pages.ts.)
  outputFileTracingIncludes: {
    "/admin/compta/pages-devis/sql": ["./supabase/*.sql"],
  },
};

export default nextConfig;
