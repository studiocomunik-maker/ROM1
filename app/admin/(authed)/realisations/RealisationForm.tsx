"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import { EXPS, UNIVERS } from "../../../data";

export type MediaItem = { kind: "image" | "video" | "youtube"; url: string };

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
    setMedia((m) => [...m, { kind, url: "" }]);
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

  async function onMediaFile(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(`media-${i}`);
    setError(null);
    try {
      setMediaUrl(i, await uploadFile(file));
    } catch (err) {
      setError(`Upload média : ${(err as Error).message}`);
    } finally {
      setUploading(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!titre.trim() || !slug.trim()) {
      setError("Titre et slug obligatoires.");
      return;
    }
    if (exps.length === 0) {
      setError("Choisis au moins une expertise.");
      return;
    }
    const emptyIdx = media.findIndex((m) => m.url.trim() === "");
    if (emptyIdx !== -1) {
      setError(
        `Le média n°${emptyIdx + 1} (${media[emptyIdx].kind}) n'a pas de contenu — upload échoué (fichier trop lourd ? limite 50 Mo) ou URL manquante. Retire-le ou corrige-le avant d'enregistrer.`,
      );
      return;
    }
    setBusy(true);
    const payload = {
      slug: slug.trim(),
      titre: titre.trim(),
      description: description.trim() || null,
      univers,
      exps,
      cover_url: coverUrl,
      media: media.filter((m) => m.url.trim() !== ""),
      published,
      position,
    };
    const res = initial.id
      ? await supabase.from("realisations").update(payload).eq("id", initial.id)
      : await supabase.from("realisations").insert(payload);
    setBusy(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    router.push("/admin");
    router.refresh();
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">
          {editing ? "Éditer" : "Nouvelle réalisation"}
        </h1>
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/60">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publiée
        </label>
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
            <div key={i} className="flex items-center gap-3 border border-paper/15 p-3">
              <div className="flex flex-col">
                <button type="button" onClick={() => moveMedia(i, -1)} className="px-1 text-paper/40 hover:text-paper">▲</button>
                <button type="button" onClick={() => moveMedia(i, 1)} className="px-1 text-paper/40 hover:text-paper">▼</button>
              </div>
              <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-orange">
                {m.kind}
              </span>
              {m.kind === "youtube" ? (
                <input
                  className={`${field} mt-0 flex-1`}
                  placeholder="https://youtube.com/watch?v=…"
                  value={m.url}
                  onChange={(e) => setMediaUrl(i, e.target.value)}
                />
              ) : (
                <div className="flex flex-1 items-center gap-3">
                  {m.url ? (
                    <span className="truncate font-mono text-[11px] text-paper/50">{m.url.split("/").pop()}</span>
                  ) : (
                    <span className="font-mono text-[11px] text-paper/30">— aucun fichier —</span>
                  )}
                  <label className="cursor-pointer border border-paper/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/70 hover:border-paper/60">
                    {uploading === `media-${i}` ? "Upload…" : m.url ? "Remplacer" : "Choisir"}
                    <input
                      type="file"
                      accept={m.kind === "video" ? "video/*" : "image/*"}
                      onChange={(e) => onMediaFile(i, e)}
                      className="hidden"
                    />
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
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["image", "video", "youtube"] as const).map((k) => (
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
