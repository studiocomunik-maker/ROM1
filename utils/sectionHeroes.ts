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

// Lecture groupée : renvoie, pour chaque id demandé, l'URL de l'image à montrer
// (image directe, ou poster d'une vidéo). Sert au survol des cartes savoir-faire.
// Tolérant : table absente / erreur → map vide.
export async function getSectionHeroImages(ids: string[]): Promise<Record<string, string>> {
  const { data } = await supabasePublic
    .from("section_heroes")
    .select("id, media_url, media_kind, poster_url")
    .in("id", ids);
  const map: Record<string, string> = {};
  for (const row of (data ?? []) as Array<{
    id: string;
    media_url: string | null;
    media_kind: string | null;
    poster_url: string | null;
  }>) {
    const img = row.media_kind === "video" ? row.poster_url : row.media_url;
    if (img) map[row.id] = img;
  }
  return map;
}
