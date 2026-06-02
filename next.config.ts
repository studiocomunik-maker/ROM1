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
};

export default nextConfig;
