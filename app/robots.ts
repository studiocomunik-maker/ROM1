import type { MetadataRoute } from "next";

export const SITE_URL = "https://rom-1.vercel.app"; // ← remplacer par rom1.fr le moment venu

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
