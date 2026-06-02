"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import { EXPS, UNIVERS } from "../../../data";

export type GalleryImage = { url: string; w?: number; h?: number };

export type MediaItem = {
  kind: "image" | "video" | "youtube" | "gallery";
  url: string;
  w?: number;
  h?: number;
  poster?: string; // image d'overlay pour une vidéo
  images?: GalleryImage[]; // pour kind === "gallery"
  pad?: number; // padding autour du média (px)
  bg?: string; // couleur de fond
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
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents combinants
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
  const [published, setPublished] = useState(initial.published);
  const [position, setPosition] = useState(initial.position);
  const [panelTheme, setPanelTheme] = useState<"dark" | "light">(initial.panel_theme);
  const [website, setWebsite] = useState(initial.website ?? "");

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

  async function uploadFile(file: File): Promise<string> {
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${slug || "tmp"}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage
      .from("realisations")
      .upload(path, file, { upsert: true, cacheControl: "31536000" });
    if (error) throw error;
    return supabase.storage.from("realisations").getPublicUrl(path).data.publicUrl;
  }

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
    setMedia((m) => [...m, kind === "gallery" ? { kind, url: "", images: [] } : { kind, url: "" }]);
  const removeMedia = (i: number) => setMedia((m) => m.filter((_, idx) => idx !== i));
  const moveMedia = (i: number, dir: -1 | 1) =>
    setMedia((m) => {
      const j = i + dir;
      if (j < 0 || j >= m.length) return m;
      const copy = [...m];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  const setMediaUrl = (i: number, url: string) =>
    setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, url } : it)));
  const setPad = (i: number, v: number) =>
    setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, pad: v > 0 ? v : undefined } : it)));
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
    } catch (err) {
      setError(`Upload média : ${(err as Error).message}`);
    } finally {
      setUploading(null);
    }
  }

  async function onPosterFile(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(`poster-${i}`);
    setError(null);
    try {
      const url = await uploadFile(file);
      setMedia((m) => m.map((it, idx) => (idx === i ? { ...it, poster: url } : it)));
    } catch (err) {
      setError(`Upload overlay : ${(err as Error).message}`);
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
      m.kind === "gallery" ? (m.images?.length ?? 0) === 0 : m.url.trim() === "";
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
    };

    if (initial.id) {
      // Mise à jour : on RESTE sur la fiche (pas de retour au listing).
      const { error } = await supabase.from("realisations").update(payload).eq("id", initial.id);
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
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
    router.push("/admin");
    router.refresh();
  }

  const label = "font-mono text-[10px] uppercase tracking-[0.15em] text-paper/50";
  const field =
    "mt-1 w-full border border-paper/20 bg-transparent px-4 py-3 font-mono text-sm text-paper outline-none focus:border-orange";

  return (
    <form onSubmit={onSubmit} className="max-w-[760px] space-y-8">
      <div className="flex justify-end">
        <Link
          href="/admin"
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-paper/55 transition-colors hover:text-paper"
        >
          ← Réalisations
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">
          {editing ? "Éditer" : "Nouvelle réalisation"}
        </h1>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-paper/45">
              Descriptif
            </span>
            {(["dark", "light"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setPanelTheme(t)}
                className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  panelTheme === t
                    ? "border-orange bg-orange text-coal"
                    : "border-paper/25 text-paper/70 hover:border-paper/60"
                }`}
              >
                {t === "dark" ? "Sombre" : "Clair"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/60">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publiée
          </label>
        </div>
      </div>

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

      {/* Image de mise en avant */}
      <div>
        <span className={label}>Image de mise en avant</span>
        <div className="mt-2 flex items-center gap-4">
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
      </div>

      {/* Médias (scroll de gauche) */}
      <div>
        <div className="flex items-center justify-between">
          <span className={label}>Médias — colonne qui scrolle (ordre = ordre d&apos;affichage)</span>
        </div>
        <div className="mt-3 space-y-3">
          {media.map((m, i) => (
            <div key={i} className="border border-paper/15 p-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button type="button" onClick={() => moveMedia(i, -1)} className="px-1 text-paper/40 hover:text-paper">▲</button>
                  <button type="button" onClick={() => moveMedia(i, 1)} className="px-1 text-paper/40 hover:text-paper">▼</button>
                </div>
                <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-orange">
                  {m.kind}
                </span>
                <MediaThumb m={m} />
                {m.kind === "youtube" ? (
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
                    {/* Overlay / poster (frame) */}
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/40">Overlay</span>
                    {m.poster && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.poster} alt="" className="h-8 w-12 shrink-0 object-cover" />
                    )}
                    <label className="cursor-pointer border border-paper/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/70 hover:border-paper/60">
                      {uploading === `poster-${i}` ? "Upload…" : m.poster ? "Remplacer" : "Ajouter image"}
                      <input type="file" accept="image/*" onChange={(e) => onPosterFile(i, e)} className="hidden" />
                    </label>
                    {m.poster && (
                      <button
                        type="button"
                        onClick={() => setMedia((mm) => mm.map((it, idx) => (idx === i ? { ...it, poster: undefined } : it)))}
                        className="font-mono text-[11px] text-orange"
                      >
                        ×
                      </button>
                    )}
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
                <label className="flex items-center gap-2">
                  Padding
                  <input
                    type="number"
                    min={0}
                    value={m.pad ?? 0}
                    onChange={(e) => setPad(i, Number(e.target.value))}
                    className="w-16 border border-paper/20 bg-transparent px-2 py-1 text-paper"
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
          {(["image", "video", "youtube", "gallery"] as const).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => addMedia(k)}
              className="border border-dashed border-paper/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/60 hover:border-orange hover:text-orange"
            >
              + {k}
            </button>
          ))}
        </div>
      </div>

      {/* Position */}
      <label className="block w-40">
        <span className={label}>Ordre (position)</span>
        <input
          type="number"
          className={field}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
        />
      </label>

      {error && <p className="font-mono text-xs text-orange">{error}</p>}

      <div className="flex items-center gap-4 border-t border-paper/10 pt-6">
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
