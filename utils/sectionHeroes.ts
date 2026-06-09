import { supabasePublic } from "./supabase/public";

export type SectionHero = {
  media_url: string | null;
  media_kind: "image" | "video" | null;
  poster_url: string | null;
  title: string | null;
  intro: string | null;
};

// Lecture publique du hero d'une section (id = "metier:<key>" | "univers:<key>").
// Tolérant : table absente / erreur → null → la page retombe sur ses valeurs
// par défaut (data.ts). Pas de cookies → SSG/ISR.
export async function getSectionHero(id: string): Promise<SectionHero | null> {
  const { data } = await supabasePublic
    .from("section_heroes")
    .select("media_url, media_kind, poster_url, title, intro")
    .eq("id", id)
    .maybeSingle();
  return (data as SectionHero) ?? null;
}
