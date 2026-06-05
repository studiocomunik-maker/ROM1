import { supabasePublic } from "./supabase/public";

export type SiteSettings = {
  heroVideoUrl: string | null;
  heroVideoPoster: string | null;
};

// Lecture publique des réglages du site (ligne unique). Tolérant : si la table
// n'existe pas encore ou en cas d'erreur, on renvoie des valeurs vides → le hero
// retombe sur son fond statique.
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await supabasePublic
    .from("site_settings")
    .select("hero_video_url, hero_video_poster")
    .eq("id", "global")
    .maybeSingle();
  return {
    heroVideoUrl: data?.hero_video_url ?? null,
    heroVideoPoster: data?.hero_video_poster ?? null,
  };
}
