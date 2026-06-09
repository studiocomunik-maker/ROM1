import { supabasePublic } from "./supabase/public";

export type GalleryImage = { url: string; w?: number; h?: number };

export type Partner = { name: string; url?: string; logo?: string };

export type Media = {
  kind: "image" | "video" | "youtube" | "gallery" | "text";
  url: string; // image / video / youtube
  w?: number; // dimensions natives (images/vidéos) → next/image sans déformation
  h?: number;
  poster?: string; // image d'overlay d'une vidéo (frame capturée)
  posterTime?: number; // seconde de la frame utilisée comme cover
  loop?: boolean; // vidéo : autoplay + boucle + muet (mini-vidéo de scroll)
  images?: GalleryImage[]; // pour kind === "gallery" (slider)
  pad?: number | string; // padding façon CSS : "20" (tous côtés) ou "20 0 40 0" (h d b g), en px
  bg?: string; // couleur de fond autour du média — défaut aucun
  // pour kind === "text" (bandeau de respiration) :
  eyebrow?: string;
  text?: string;
  body?: string; // corps (texte normal) sous le titre
  align?: "left" | "center" | "right";
  size?: "s" | "m" | "l";
  color?: string; // couleur du texte
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
  partners: Partner[];
};

const COLS =
  "id, slug, titre, description, univers, exps, cover_url, media, position, published, panel_theme, website, partners";

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

export async function getRealisationsByUnivers(key: string): Promise<Realisation[]> {
  const { data } = await supabasePublic
    .from("realisations")
    .select(COLS)
    .eq("published", true)
    .eq("univers", key)
    .order("position", { ascending: true });
  return (data ?? []) as Realisation[];
}

// Padding façon CSS : nombres bruts → px. 1 valeur = tous côtés, 4 = h d b g.
// `scale` permet de réduire le padding (ex. 0.25 = ÷4 sur smartphone).
// Les nombres nus deviennent des px ; les valeurs avec unité (rem, %, …)
// sont mises à l'échelle en gardant leur unité.
export function padCss(pad?: number | string, scale = 1): string | undefined {
  const sc = (n: number) => {
    const v = n * scale;
    return Number.isInteger(v) ? v : Math.round(v * 100) / 100;
  };
  if (pad === undefined || pad === null || pad === "") return undefined;
  if (typeof pad === "number") return pad > 0 ? `${sc(pad)}px` : undefined;
  const parts = pad.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return undefined;
  return parts
    .map((p) => {
      if (/^-?\d*\.?\d+$/.test(p)) return `${sc(parseFloat(p))}px`;
      const m = p.match(/^(-?\d*\.?\d+)([a-z%]+)$/i);
      if (m) return `${sc(parseFloat(m[1]))}${m[2]}`;
      return p;
    })
    .join(" ");
}

// Extrait l'ID d'une URL YouTube (watch, youtu.be, embed, shorts).
export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/,
  );
  return m ? m[1] : null;
}
