import type { MetadataRoute } from "next";
import { SITE_URL, metiers } from "./data";
import { getRealisations } from "../utils/realisations";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reals = await getRealisations();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...metiers.map((m) => ({
      url: `${SITE_URL}/metiers/${m.key}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...reals.map((r) => ({
      url: `${SITE_URL}/realisations/${r.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
