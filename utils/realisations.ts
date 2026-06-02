import { supabasePublic } from "./supabase/public";

export type GalleryImage = { url: string; w?: number; h?: number };

export type Media = {
  kind: "image" | "video" | "youtube" | "gallery";
  url: string; // image / video / youtube
  w?: number; // dimensions natives (images/vidéos) → next/image sans déformation
  h?: number;
  poster?: string; // image d'overlay d'une vidéo (frame)
  images?: GalleryImage[]; // pour kind === "gallery" (slider)
  pad?: number; // padding autour du média (px) — défaut 0
  bg?: string; // couleur de fond autour du média — défaut aucun
};

export type Realisation = {
  id: string;
  slug: string;
  titre: string;
  description: string | null;
  univers: string;
  exps: string[];
  cover_url: string | null;
  media: Media[];
  position: number;
  published: boolean;
  panel_theme: "dark" | "light";
  website: string | null;
};

const COLS =
  "id, slug, titre, description, univers, exps, cover_url, media, position, published, panel_theme, website";

export async function getRealisations(): Promise<Realisation[]> {
  const { data } = await supabasePublic
    .from("realisations")
    .select(COLS)
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as Realisation[];
}

export async function getRealisation(slug: string): Promise<Realisation | null> {
  const { data } = await supabasePublic
    .from("realisations")
    .select(COLS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as Realisation) ?? null;
}

export async function getRealisationsByMetier(key: string): Promise<Realisation[]> {
  const { data } = await supabasePublic
    .from("realisations")
    .select(COLS)
    .eq("published", true)
    .contains("exps", [key])
    .order("position", { ascending: true });
  return (data ?? []) as Realisation[];
}

// Extrait l'ID d'une URL YouTube (watch, youtu.be, embed, shorts).
export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/,
  );
  return m ? m[1] : null;
}
