"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import { EXPS, UNIVERS } from "../../../data";

export type GalleryImage = { url: string; w?: number; h?: number };

export type MediaItem = {
  kind: "image" | "video" | "youtube" | "gallery" | "text";
  url: string;
  w?: number;
  h?: number;
  poster?: string; // image d'overlay pour une vidéo (frame capturée)
  posterTime?: number; // seconde de la frame
  images?: GalleryImage[]; // pour kind === "gallery"
  pad?: number | string; // padding façon CSS : "20" ou "20 0 40 0" (h d b g), px
  bg?: string; // couleur de fond
  // pour kind === "text" :
  eyebrow?: string;
  text?: string;
  body?: string;
  align?: "left" | "center" | "right";
  size?: "s" | "m" | "l";
  color?: string;
};

const KIND_LABEL: Record<MediaItem["kind"], string> = {
  image: "image",
  video: "vidéo",
  youtube: "youtube",
  gallery: "galerie",
  text: "bandeau",
};

// Lit les dimensions natives d'un fichier (pour next/image, sans déformation).
function readDims(file: File, kind: MediaItem["kind"]): Promise<{ w?: number; h?: number }> {
  return new Promise((resolve) => {
    const src = URL.createObjectURL(file);
    if (kind === "video") {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        resolve({ w: v.videoWidth || undefined, h: v.videoHeight || undefined });
        URL.revokeObjectURL(src);
      };
      v.onerror = () => resolve({});
      v.src = src;
    } else {
      const img = new window.Image();
      img.onload = () => {
        resolve({ w: img.naturalWidth || undefined, h: img.naturalHeight || undefined });
        URL.revokeObjectURL(src);
      };
      img.onerror = () => resolve({});
      img.src = src;
    }
  });
}

// Compression navigateur avant upload : downscale au grand côté + ré-encodage
// WebP. On ne touche que le JPEG/PNG/WebP raster (SVG, GIF animé, vidéos passent
// intacts). On garde l'original tel quel si : déjà léger, version compressée pas
// meilleure, OU si l'image a de la transparence (logos PNG → on préserve l'alpha
// sans risque d'artefact de bord du WebP lossy).
const COMPRESS_MAX_EDGE = 2560;
const COMPRESS_QUALITY = 0.82;
const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Détecte un canal alpha réellement utilisé (échantillonnage 1 px sur 16).
function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  try {
    const { data } = ctx.getImageData(0, 0, w, h);
    for (let i = 3; i < data.length; i += 4 * 16) {
      if (data[i] < 255) return true;
    }
    return false;
  } catch {
    return true; // lecture impossible → on suppose alpha et on garde l'original (sûr)
  }
}

function compressImageFile(file: File): Promise<{ blob: Blob; name: string }> {
  return new Promise((resolve) => {
    const keep = () => resolve({ blob: file, name: file.name });
    if (!COMPRESSIBLE_TYPES.includes(file.type)) return keep();

    const src = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(src);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, COMPRESS_MAX_EDGE / Math.max(w, h));
      // Déjà petit et pas de redimensionnement → rien à gagner.
      if (scale === 1 && file.size < 500_000) return keep();

      const cw = Math.max(1, Math.round(w * scale));
      const ch = Math.max(1, Math.round(h * scale));
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) return keep();
      ctx.drawImage(img, 0, 0, cw, ch);

      // Transparence → on garde l'original intact (le JPEG n'a jamais d'alpha).
      if (file.type !== "image/jpeg" && hasTransparency(ctx, cw, ch)) return keep();

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.type !== "image/webp" || blob.size >= file.size) {
            return keep();
          }
          const base = file.name.replace(/\.[^.]+$/, "");
          resolve({ blob, name: `${base}.webp` });
        },
        "image/webp",
        COMPRESS_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(src);
      keep();
    };
    img.src = src;
  });
}

export type Partner = { name: string; url?: string; logo?: string };

export type RealisationData = {
  id?: string;
  titre: string;
  slug: string;
  description: string;
  univers: string;
  exps: string[];
  cover_url: string | null;
  media: MediaItem[];
  published: boolean;
  position: number;
  panel_theme: "dark" | "light";
  website: string | null;
  partners: Partner[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents combinants
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Capture une frame d'une vidéo (src = object/blob URL, donc canvas non taché) → JPEG Blob.
// Attend que la frame soit RÉELLEMENT décodée/présentée (sinon image noire).
function captureVideoFrame(src: string, time: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    let done = false;

    const draw = () => {
      if (done) return;
      done = true;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas indisponible"));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("export image échoué"))),
          "image/jpeg",
          0.88,
        );
      } catch (e) {
        reject(e as Error);
      }
    };

    type RVFC = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };

    video.onseeked = () => {
      const v = video as RVFC;
      // rVFC fire quand la frame est présentée ; mais sur vidéo en pause il ne
      // se déclenche pas toujours → on ajoute un fallback temporisé (la frame
      // seekée est décodée passivement par le navigateur en ~quelques centaines de ms).
      if (typeof v.requestVideoFrameCallback === "function") {
        v.requestVideoFrameCallback(() => draw());
      }
      setTimeout(draw, 600);
    };
    video.onloadeddata = () => {
      const dur = video.duration || 1;
      video.currentTime = Math.min(Math.max(time, 0), Math.max(0, dur - 0.1));
    };
    video.onerror = () => reject(new Error("lecture vidéo impossible"));
    video.src = src;
    video.load();
  });
}

const UNIVERS_KEYS = Object.keys(UNIVERS);
const EXPS_KEYS = Object.keys(EXPS);

const ytId = (url: string): string | null => {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/,
  );
  return m ? m[1] : null;
};

function MediaThumb({ m }: { m: MediaItem }) {
  const box = "h-14 w-20 shrink-0 bg-white/5 object-cover";
  if (m.kind === "text") {
    return (
      <div
        className="flex h-14 w-20 shrink-0 items-center justify-center text-center font-display text-[9px] uppercase leading-tight text-paper/70"
        style={{ background: m.bg || "rgba(255,255,255,0.05)", color: m.color || undefined }}
      >
        {m.text ? m.text.slice(0, 18) : "Aa"}
      </div>
    );
  }
  if (m.kind === "gallery") {
    const first = m.images?.[0];
    return (
      <div className={`relative ${box}`}>
        {first && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={first.url} alt="" className="h-full w-full object-cover" />
        )}
        <span className="absolute bottom-0 right-0 bg-orange px-1 font-mono text-[9px] text-coal">
          {m.images?.length ?? 0}
        </span>
      </div>
    );
  }
  if (m.kind === "youtube") {
    const id = ytId(m.url);
    // eslint-disable-next-line @next/next/no-img-element
    return id ? <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" className={box} /> : <div className={box} />;
  }
  if (m.kind === "video") {
    return m.url ? <video src={m.url} muted playsInline preload="metadata" className={box} /> : <div className={box} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return m.url ? <img src={m.url} alt="" className={box} /> : <div className={box} />;
}

export default function RealisationForm({ initial }: { initial: RealisationData }) {
  const router = useRouter();
  const supabase = createClient();
  const editing = Boolean(initial.id);

  const [titre, setTitre] = useState(initial.titre);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(editing);
  const [description, setDescription] = useState(initial.description);
  const [univers, setUnivers] = useState(initial.univers || UNIVERS_KEYS[0]);
  const [exps, setExps] = useState<string[]>(initial.exps);
  const [coverUrl, setCoverUrl] = useState<string | null>(initial.cover_url);
  const [media, setMedia] = useState<MediaItem[]>(initial.media);
  // Drag-to-order des médias
  const [dragI, setDragI] = useState<number | null>(null);
  const [overI, setOverI] = useState<number | null>(null);
  const moveTo = (from: number | null, to: number | null) =>
    setMedia((m) => {
      if (from === null || to === null || from === to) return m;
      const copy = [...m];
      const [it] = copy.splice(from, 1);
      copy.splice(to, 0, it);
      return copy;
    });
  const [published, setPublished] = useState(initial.published);
  const [position, setPosition] = useState(initial.position);
  const [panelTheme, setPanelTheme] = useState<"dark" | "light">(initial.panel_theme);
  const [website, setWebsite] = useState(initial.website ?? "");
  const [partners, setPartners] = useState<Partner[]>(initial.partners ?? []);

  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const onTitre = (v: string) => {
    setTitre(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const toggleExp = (k: string) =>
    setExps((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  async function uploadBlob(blob: Blob, name: string): Promise<string> {
    const safe = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${slug || "tmp"}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage
      .from("realisations")
      .upload(path, blob, {
        upsert: true,
        cacheControl: "31536000",
        contentType: blob.type || "application/octet-stream",
      });
    if (error) throw error;
    return supabase.storage.from("realisations").getPublicUrl(path).data.publicUrl;
  }
  const uploadFile = async (file: File) => {
    const { blob, name } = await compressImageFile(file);
    return uploadBlob(blob, name);
  };

  // Capture + upload la cover d'une vidéo (depuis une source blob/objet, sans CORS).
  async function makeCoverFromVideoSrc(i: number, src: string, time: number) {
    const blob = await captureVideoFrame(src, time);
    const posterUrl = await uploadBlob(blob, "cover.jpg");
    setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, poster: posterUrl, posterTime: time } : it)));
  }

  // Régénère la cover en relisant la vidéo déjà uploadée (fetch→blob = pas de taint canvas).
  async function regenPoster(i: number) {
    const it = media[i];
    if (!it.url) return;
    setUploading(`poster-${i}`);
    setError(null);
    try {
      const res = await fetch(it.url);
      const objUrl = URL.createObjectURL(await res.blob());
      try {
        await makeCoverFromVideoSrc(i, objUrl, it.posterTime ?? 1);
      } finally {
        URL.revokeObjectURL(objUrl);
      }
    } catch (err) {
      setError(`Régénération cover : ${(err as Error).message} — ré-uploade la vidéo si ça bloque.`);
    } finally {
      setUploading(null);
    }
  }

  const setPosterTime = (i: number, v: number) =>
    setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, posterTime: v } : it)));

  async function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("cover");
    setError(null);
    try {
      setCoverUrl(await uploadFile(file));
    } catch (err) {
      setError(`Upload cover : ${(err as Error).message}`);
    } finally {
      setUploading(null);
    }
  }

  // ----- builder médias -----
  const addMedia = (kind: MediaItem["kind"]) =>
    setMedia((m) => [
      ...m,
      kind === "gallery"
        ? { kind, url: "", images: [] }
        : kind === "text"
          ? { kind, url: "", text: "", align: "left" as const, size: "m" as const }
          : { kind, url: "" },
    ]);
  const patchMedia = (i: number, patch: Partial<MediaItem>) =>
    setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  // ----- partenaires -----
  const addPartner = () => setPartners((p) => [...p, { name: "" }]);
  const removePartner = (i: number) => setPartners((p) => p.filter((_, idx) => idx !== i));
  const patchPartner = (i: number, patch: Partial<Partner>) =>
    setPartners((p) => p.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  async function onPartnerLogo(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(`partner-${i}`);
    setError(null);
    try {
      patchPartner(i, { logo: await uploadFile(file) });
    } catch (err) {
      setError(`Upload logo partenaire : ${(err as Error).message}`);
    } finally {
      setUploading(null);
    }
  }

  // Rafraîchit immédiatement le front (ISR on-demand) après une modif.
  const revalidateFront = async (s?: string) => {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: s }),
      });
    } catch {
      /* non bloquant */
    }
  };
  const removeMedia = (i: number) => setMedia((m) => m.filter((_, idx) => idx !== i));
  const setMediaUrl = (i: number, url: string) =>
    setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, url } : it)));
  const setPad = (i: number, v: string) =>
    setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, pad: v.trim() || undefined } : it)));
  const setBg = (i: number, v: string | undefined) =>
    setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, bg: v || undefined } : it)));

  async function onMediaFile(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(`media-${i}`);
    setError(null);
    try {
      const kind = media[i].kind;
      const dims = await readDims(file, kind);
      const url = await uploadFile(file);
      setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, url, ...dims } : it)));
      // Vidéo : génère automatiquement la cover depuis une frame (fichier local).
      if (kind === "video") {
        if (file.type === "video/quicktime" || /\.mov$/i.test(file.name)) {
          setError(
            "⚠ Format .mov (QuickTime) : souvent illisible dans les navigateurs (Chrome/Firefox, reels HEVC). Exporte en MP4 (H.264) pour une lecture universelle — la cover, elle, est bien générée.",
          );
        }
        const t = media[i].posterTime ?? 1;
        const objUrl = URL.createObjectURL(file);
        try {
          await makeCoverFromVideoSrc(i, objUrl, t);
        } catch {
          /* capture facultative */
        } finally {
          URL.revokeObjectURL(objUrl);
        }
      }
    } catch (err) {
      setError(`Upload média : ${(err as Error).message}`);
    } finally {
      setUploading(null);
    }
  }

  // ----- sous-builder galerie (plusieurs images dans un même bloc) -----
  async function onGalleryAdd(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    setUploading(`media-${i}`);
    setError(null);
    try {
      const added: GalleryImage[] = [];
      for (const file of files) {
        const dims = await readDims(file, "image");
        const url = await uploadFile(file);
        added.push({ url, ...dims });
      }
      setMedia((m) =>
        m.map((it, idx) =>
          idx === i ? { ...it, images: [...(it.images ?? []), ...added] } : it,
        ),
      );
    } catch (err) {
      setError(`Upload galerie : ${(err as Error).message}`);
    } finally {
      setUploading(null);
    }
  }
  const removeGalleryImage = (i: number, j: number) =>
    setMedia((m) =>
      m.map((it, idx) =>
        idx === i ? { ...it, images: (it.images ?? []).filter((_, k) => k !== j) } : it,
      ),
    );
  const moveGalleryImage = (i: number, j: number, dir: -1 | 1) =>
    setMedia((m) =>
      m.map((it, idx) => {
        if (idx !== i) return it;
        const imgs = [...(it.images ?? [])];
        const k = j + dir;
        if (k < 0 || k >= imgs.length) return it;
        [imgs[j], imgs[k]] = [imgs[k], imgs[j]];
        return { ...it, images: imgs };
      }),
    );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!titre.trim() || !slug.trim()) {
      setError("Titre et slug obligatoires.");
      return;
    }
    if (exps.length === 0) {
      setError("Choisis au moins une expertise.");
      return;
    }
    const isEmpty = (m: MediaItem) =>
      m.kind === "gallery"
        ? (m.images?.length ?? 0) === 0
        : m.kind === "text"
          ? !m.text?.trim()
          : m.url.trim() === "";
    const emptyIdx = media.findIndex(isEmpty);
    if (emptyIdx !== -1) {
      setError(
        `Le média n°${emptyIdx + 1} (${media[emptyIdx].kind}) est vide — upload échoué (fichier trop lourd ? limite 50 Mo), URL manquante, ou galerie sans image. Retire-le ou corrige-le avant d'enregistrer.`,
      );
      return;
    }
    setBusy(true);
    const site = website.trim();
    const payload = {
      slug: slug.trim(),
      titre: titre.trim(),
      description: description.trim() || null,
      univers,
      exps,
      cover_url: coverUrl,
      media: media.filter((m) => !isEmpty(m)),
      published,
      position,
      panel_theme: panelTheme,
      website: site ? (/^https?:\/\//.test(site) ? site : `https://${site}`) : null,
      partners: partners
        .filter((pt) => pt.name.trim())
        .map((pt) => ({
          name: pt.name.trim(),
          url: pt.url?.trim()
            ? /^https?:\/\//.test(pt.url.trim())
              ? pt.url.trim()
              : `https://${pt.url.trim()}`
            : undefined,
          logo: pt.logo || undefined,
        })),
    };

    if (initial.id) {
      // Mise à jour : on RESTE sur la fiche (pas de retour au listing).
      const { error } = await supabase.from("realisations").update(payload).eq("id", initial.id);
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      await revalidateFront(payload.slug);
      setSaved(true);
      router.refresh();
    } else {
      // Création : on bascule sur la fiche d'édition du nouvel élément.
      const { data, error } = await supabase
        .from("realisations")
        .insert(payload)
        .select("id")
        .single();
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      await revalidateFront(payload.slug);
      router.replace(`/admin/realisations/${data.id}`);
      router.refresh();
    }
  }

  async function onDelete() {
    if (!initial.id || !confirm("Supprimer définitivement cette réalisation ?")) return;
    setBusy(true);
    const { error } = await supabase.from("realisations").delete().eq("id", initial.id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await revalidateFront(initial.slug);
    router.push("/admin");
    router.refresh();
  }

  const label = "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-paper/55";
  const field =
    "mt-1 w-full border border-paper/15 bg-white/[0.04] px-4 py-3 text-[15px] text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";
  const card = "border border-paper/10 bg-white/[0.02] p-5 md:p-7";
  const sectionTitle = "mb-6 font-display text-base uppercase tracking-[0.18em] text-orange";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-[820px] space-y-6 pb-10">
      <div className="flex justify-end">
        <Link
          href="/admin"
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-paper/55 transition-colors hover:text-paper"
        >
          ← Réalisations
        </Link>
      </div>

      <h1 className="font-display text-4xl uppercase tracking-tight">
        {editing ? "Éditer la réalisation" : "Nouvelle réalisation"}
      </h1>

      <section className={card}>
        <h2 className={sectionTitle}>Informations</h2>
        <div className="space-y-5">
      {/* Titre + slug */}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Titre</span>
          <input className={field} value={titre} onChange={(e) => onTitre(e.target.value)} required />
        </label>
        <label className="block">
          <span className={label}>Slug (URL)</span>
          <input
            className={field}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            required
          />
        </label>
      </div>

      {/* Description */}
      <label className="block">
        <span className={label}>Description</span>
        <textarea
          className={`${field} min-h-[120px] resize-y leading-relaxed`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      {/* Site internet (optionnel) */}
      <label className="block">
        <span className={label}>Site internet (optionnel)</span>
        <input
          className={field}
          type="url"
          placeholder="https://exemple.fr"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <span className="mt-1 block font-mono text-[10px] text-paper/35">
          Affiche un bouton « Voir le site » sur la fiche. Vide = pas de bouton.
        </span>
      </label>

      {/* Univers (unique) + Expertises (multiple) */}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Univers (un seul)</span>
          <select className={`${field} appearance-none`} value={univers} onChange={(e) => setUnivers(e.target.value)}>
            {UNIVERS_KEYS.map((k) => (
              <option key={k} value={k} className="bg-coal">
                {UNIVERS[k]}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className={label}>Expertises (plusieurs)</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXPS_KEYS.map((k) => {
              const on = exps.includes(k);
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => toggleExp(k)}
                  className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
                    on ? "border-orange bg-orange text-coal" : "border-paper/25 text-paper/70 hover:border-paper/60"
                  }`}
                >
                  {EXPS[k]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
        </div>
      </section>

      {/* Image de mise en avant */}
      <section className={card}>
        <h2 className={sectionTitle}>Image de mise en avant</h2>
        <div className="flex items-center gap-4">
          <div
            className="h-20 w-28 shrink-0 bg-cover bg-center bg-white/5"
            style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
          />
          <div className="space-y-2">
            <input ref={coverInput} type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              className="border border-paper/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/70 hover:border-paper/60"
            >
              {uploading === "cover" ? "Upload…" : coverUrl ? "Remplacer" : "Choisir une image"}
            </button>
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
                className="ml-2 font-mono text-[11px] uppercase tracking-[0.1em] text-orange"
              >
                Retirer
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Médias (scroll de gauche) */}
      <section className={card}>
        <h2 className={sectionTitle}>Médias</h2>
        <p className="-mt-4 mb-5 font-mono text-[11px] normal-case tracking-normal text-paper/40">
          Colonne qui scrolle — l&apos;ordre ci-dessous = l&apos;ordre d&apos;affichage.
        </p>
        <div className="space-y-3">
          {media.map((m, i) => (
            <div
              key={i}
              onDragOver={(e) => {
                e.preventDefault();
                if (overI !== i) setOverI(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                moveTo(dragI, i);
                setDragI(null);
                setOverI(null);
              }}
              className={`border bg-[#161619] p-3 transition-colors ${
                overI === i && dragI !== null ? "border-orange" : "border-paper/10"
              } ${dragI === i ? "opacity-40" : ""}`}
            >
              <div className="flex items-center gap-3">
                {/* Poignée : glisser pour réordonner */}
                <span
                  draggable
                  onDragStart={(e) => {
                    setDragI(i);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDragI(null);
                    setOverI(null);
                  }}
                  title="Glisser pour réordonner"
                  aria-label="Glisser pour réordonner"
                  className="shrink-0 cursor-grab select-none px-1 text-base leading-none text-paper/35 hover:text-paper active:cursor-grabbing"
                >
                  ⠿
                </span>
                <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-orange">
                  {KIND_LABEL[m.kind]}
                </span>
                <MediaThumb m={m} />
                {m.kind === "text" ? (
                  <input
                    className={`${field} mt-0 flex-1`}
                    placeholder="Texte du bandeau…"
                    value={m.text ?? ""}
                    onChange={(e) => patchMedia(i, { text: e.target.value })}
                  />
                ) : m.kind === "youtube" ? (
                  <input
                    className={`${field} mt-0 flex-1`}
                    placeholder="https://youtube.com/watch?v=…"
                    value={m.url}
                    onChange={(e) => setMediaUrl(i, e.target.value)}
                  />
                ) : m.kind === "gallery" ? (
                  <span className="flex-1 font-mono text-[11px] text-paper/50">
                    {m.images?.length ?? 0} image(s) — slider à flèches
                  </span>
                ) : m.kind === "video" ? (
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    {m.url ? (
                      <span className="max-w-[130px] truncate font-mono text-[11px] text-paper/50">{m.url.split("/").pop()}</span>
                    ) : (
                      <span className="font-mono text-[11px] text-paper/30">— aucune vidéo —</span>
                    )}
                    <label className="cursor-pointer border border-paper/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/70 hover:border-paper/60">
                      {uploading === `media-${i}` ? "Upload…" : m.url ? "Remplacer vidéo" : "Choisir vidéo"}
                      <input type="file" accept="video/*" onChange={(e) => onMediaFile(i, e)} className="hidden" />
                    </label>
                    {/* Cover auto = frame de la vidéo */}
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/40">Cover</span>
                    {m.poster && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.poster} alt="" className="h-8 w-12 shrink-0 object-cover" />
                    )}
                    <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/45">
                      à
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={m.posterTime ?? 1}
                        onChange={(e) => setPosterTime(i, Number(e.target.value))}
                        className="w-14 border border-paper/20 bg-transparent px-2 py-1 text-paper"
                      />
                      s
                    </label>
                    <button
                      type="button"
                      onClick={() => regenPoster(i)}
                      disabled={!m.url}
                      className="border border-paper/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/70 hover:border-orange hover:text-orange disabled:opacity-40"
                    >
                      {uploading === `poster-${i}` ? "…" : "Régénérer"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center gap-3">
                    {m.url ? (
                      <span className="truncate font-mono text-[11px] text-paper/50">{m.url.split("/").pop()}</span>
                    ) : (
                      <span className="font-mono text-[11px] text-paper/30">— aucun fichier —</span>
                    )}
                    <label className="cursor-pointer border border-paper/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/70 hover:border-paper/60">
                      {uploading === `media-${i}` ? "Upload…" : m.url ? "Remplacer" : "Choisir"}
                      <input type="file" accept="image/*" onChange={(e) => onMediaFile(i, e)} className="hidden" />
                    </label>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="shrink-0 font-mono text-[11px] uppercase tracking-[0.1em] text-orange"
                >
                  Suppr.
                </button>
              </div>

              {/* Options communes : padding + couleur de fond */}
              <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-paper/10 pt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/45">
                <label className="flex items-center gap-2" title="1 valeur = tous les côtés · 4 = haut droite bas gauche (en px)">
                  Padding
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0  ou  20 0 40 0"
                    value={m.pad == null ? "" : String(m.pad)}
                    onChange={(e) => setPad(i, e.target.value)}
                    className="w-32 border border-paper/20 bg-transparent px-2 py-1 normal-case tracking-normal text-paper"
                  />
                  px
                </label>
                <label className="flex items-center gap-2">
                  Fond
                  <input
                    type="color"
                    value={m.bg ?? "#0c0c0e"}
                    onChange={(e) => setBg(i, e.target.value)}
                    className="h-6 w-8 cursor-pointer border border-paper/20 bg-transparent"
                  />
                </label>
                {m.bg && (
                  <button type="button" onClick={() => setBg(i, undefined)} className="text-orange">
                    aucun fond
                  </button>
                )}
              </div>

              {/* Options du bandeau texte */}
              {m.kind === "text" && (
                <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-paper/10 pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/45">
                  <label className="flex items-center gap-2">
                    Eyebrow
                    <input
                      value={m.eyebrow ?? ""}
                      onChange={(e) => patchMedia(i, { eyebrow: e.target.value })}
                      placeholder="01 · Identité"
                      className="w-44 border border-paper/20 bg-transparent px-2 py-1 normal-case tracking-normal text-paper"
                    />
                  </label>
                  <div className="flex items-center gap-1">
                    Align
                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        type="button"
                        key={a}
                        onClick={() => patchMedia(i, { align: a })}
                        className={`border px-2 py-1 ${(m.align ?? "left") === a ? "border-orange bg-orange text-coal" : "border-paper/25 text-paper/60"}`}
                      >
                        {a === "left" ? "Gauche" : a === "center" ? "Centre" : "Droite"}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    Taille
                    {(["s", "m", "l"] as const).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => patchMedia(i, { size: s })}
                        className={`border px-2 py-1 ${(m.size ?? "m") === s ? "border-orange bg-orange text-coal" : "border-paper/25 text-paper/60"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2">
                    Texte
                    <input
                      type="color"
                      value={m.color ?? "#f5f4f2"}
                      onChange={(e) => patchMedia(i, { color: e.target.value })}
                      className="h-6 w-8 cursor-pointer border border-paper/20 bg-transparent"
                    />
                  </label>
                  <label className="flex w-full flex-col gap-1">
                    Corps (texte normal, optionnel)
                    <textarea
                      value={m.body ?? ""}
                      onChange={(e) => patchMedia(i, { body: e.target.value })}
                      placeholder="Paragraphe sous le titre…"
                      className="min-h-[70px] w-full resize-y border border-paper/20 bg-transparent px-2 py-2 normal-case tracking-normal text-paper"
                    />
                  </label>
                </div>
              )}

              {/* Sous-builder galerie : grille d'images réordonnables */}
              {m.kind === "gallery" && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-paper/10 pt-3">
                  {(m.images ?? []).map((img, j) => (
                    <div key={j} className="relative h-16 w-24 overflow-hidden bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-coal/70 px-1 text-[11px] leading-none text-paper">
                        <button type="button" onClick={() => moveGalleryImage(i, j, -1)} className="px-1 hover:text-orange">◀</button>
                        <button type="button" onClick={() => removeGalleryImage(i, j)} className="px-1 text-orange">×</button>
                        <button type="button" onClick={() => moveGalleryImage(i, j, 1)} className="px-1 hover:text-orange">▶</button>
                      </div>
                    </div>
                  ))}
                  <label className="flex h-16 w-24 cursor-pointer items-center justify-center border border-dashed border-paper/30 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/60 hover:border-orange hover:text-orange">
                    {uploading === `media-${i}` ? "Upload…" : "+ images"}
                    <input type="file" accept="image/*" multiple onChange={(e) => onGalleryAdd(i, e)} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["image", "video", "youtube", "gallery", "text"] as const).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => addMedia(k)}
              className="border border-dashed border-paper/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/60 hover:border-orange hover:text-orange"
            >
              + {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </section>

      {/* Partenaires */}
      <section className={card}>
        <h2 className={sectionTitle}>Partenaires</h2>
        <div className="space-y-3">
          {partners.map((pt, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 border border-paper/10 bg-[#161619] p-3">
              {pt.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pt.logo} alt="" className="h-8 w-auto max-w-[90px] object-contain" />
              )}
              <input
                className={`${field} mt-0 min-w-[140px] flex-1`}
                placeholder="Nom du partenaire"
                value={pt.name}
                onChange={(e) => patchPartner(i, { name: e.target.value })}
              />
              <input
                className={`${field} mt-0 min-w-[160px] flex-1`}
                placeholder="https://… (lien, optionnel)"
                value={pt.url ?? ""}
                onChange={(e) => patchPartner(i, { url: e.target.value })}
              />
              <label className="cursor-pointer border border-paper/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/70 hover:border-paper/60">
                {uploading === `partner-${i}` ? "Upload…" : pt.logo ? "Logo ✓" : "Logo"}
                <input type="file" accept="image/*" onChange={(e) => onPartnerLogo(i, e)} className="hidden" />
              </label>
              {pt.logo && (
                <button
                  type="button"
                  onClick={() => patchPartner(i, { logo: undefined })}
                  className="font-mono text-[11px] text-orange"
                >
                  ×
                </button>
              )}
              <button
                type="button"
                onClick={() => removePartner(i)}
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-orange"
              >
                Suppr.
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPartner}
          className="mt-3 border border-dashed border-paper/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/60 hover:border-orange hover:text-orange"
        >
          + partenaire
        </button>
      </section>

      {/* Réglages */}
      <section className={card}>
        <h2 className={sectionTitle}>Réglages</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <span className={label}>Statut</span>
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`flex items-center gap-2 border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
                published
                  ? "border-[#3ddc84]/50 text-[#3ddc84]"
                  : "border-paper/25 text-paper/60 hover:border-paper/50"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${published ? "bg-[#3ddc84]" : "bg-paper/40"}`} />
              {published ? "Publiée" : "Brouillon"}
            </button>
          </div>

          <div>
            <span className={label}>Fond du descriptif</span>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setPanelTheme(t)}
                  className={`border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
                    panelTheme === t
                      ? "border-orange bg-orange text-coal"
                      : "border-paper/25 text-paper/70 hover:border-paper/60"
                  }`}
                >
                  {t === "dark" ? "Sombre" : "Clair"}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className={label}>Ordre (position)</span>
            <input
              type="number"
              className={field}
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      {error && (
        <p className="border border-orange/40 bg-orange/10 p-4 font-mono text-xs leading-relaxed text-orange">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 z-10 flex items-center gap-4 border-t border-paper/10 bg-coal/95 py-5 backdrop-blur">
        <button
          type="submit"
          disabled={busy || uploading !== null}
          className="bg-orange px-6 py-3 font-display text-sm uppercase tracking-[0.12em] text-coal transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="font-mono text-xs uppercase tracking-[0.12em] text-paper/50 hover:text-paper"
        >
          Annuler
        </button>
        {saved && (
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#3ddc84]">
            Enregistré ✓
          </span>
        )}
        {editing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="ml-auto font-mono text-xs uppercase tracking-[0.12em] text-orange hover:underline"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}
