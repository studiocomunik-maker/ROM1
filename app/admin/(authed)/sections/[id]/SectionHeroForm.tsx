"use client";

import { useState } from "react";
import { createClient } from "../../../../../utils/supabase/client";
import type { SectionMeta } from "../sections";

export type HeroRow = {
  media_url: string | null;
  media_kind: "image" | "video" | null;
  poster_url: string | null;
  title: string | null;
  intro: string | null;
};

export default function SectionHeroForm({
  meta,
  initial,
}: {
  meta: SectionMeta;
  initial: HeroRow | null;
}) {
  const supabase = createClient();
  const [mediaUrl, setMediaUrl] = useState(initial?.media_url ?? "");
  const [mediaKind, setMediaKind] = useState<"image" | "video" | "">(initial?.media_kind ?? "");
  const [poster, setPoster] = useState(initial?.poster_url ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [intro, setIntro] = useState(initial?.intro ?? "");

  const [uploading, setUploading] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<string> {
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `sections/${meta.routeId}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage
      .from("realisations")
      .upload(path, file, {
        upsert: true,
        cacheControl: "31536000",
        contentType: file.type || "application/octet-stream",
      });
    if (upErr) throw upErr;
    return supabase.storage.from("realisations").getPublicUrl(path).data.publicUrl;
  }

  async function onMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading("media");
    setError(null);
    setSaved(false);
    try {
      const url = await upload(file);
      setMediaUrl(url);
      setMediaKind(file.type.startsWith("video") ? "video" : "image");
    } catch (err) {
      setError(`Upload média : ${(err as Error).message} — fichier trop lourd ?`);
    } finally {
      setUploading(null);
    }
  }

  async function onPoster(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading("poster");
    setError(null);
    try {
      setPoster(await upload(file));
    } catch (err) {
      setError(`Upload poster : ${(err as Error).message}`);
    } finally {
      setUploading(null);
    }
  }

  function clearMedia() {
    setMediaUrl("");
    setMediaKind("");
    setPoster("");
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    const { error: dbErr } = await supabase.from("section_heroes").upsert({
      id: meta.dbId,
      media_url: mediaUrl || null,
      media_kind: mediaUrl ? mediaKind || "image" : null,
      poster_url: poster || null,
      title: title.trim() || null,
      intro: intro.trim() || null,
    });
    if (dbErr) {
      setError(dbErr.message);
      setBusy(false);
      return;
    }
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: meta.publicPath }),
      });
    } catch {
      /* ISR 60s prendra le relais */
    }
    setSaved(true);
    setBusy(false);
  }

  const label = "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-paper/55";
  const field =
    "w-full border border-paper/15 bg-white/[0.04] px-4 py-3 text-base text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";
  const btn =
    "cursor-pointer border border-paper/25 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-paper/70 transition-colors hover:border-paper/60";

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-orange">
            {meta.group} · {meta.sub}
          </p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-tight">{meta.label}</h2>
        </div>
        <a
          href={meta.publicPath}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs uppercase tracking-[0.12em] text-paper/55 transition-colors hover:text-orange"
        >
          Voir la page ↗
        </a>
      </div>

      {/* Aperçu live du hero */}
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-paper/10 bg-coal">
        {mediaUrl ? (
          mediaKind === "video" ? (
            <video
              key={mediaUrl}
              className="absolute inset-0 h-full w-full object-cover"
              src={mediaUrl}
              poster={poster || undefined}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-[0.15em] text-paper/25">
            Fond noir uni (aucun média)
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/75 to-coal/45" />
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 md:p-8">
          <p className="mb-2 font-display text-[10px] uppercase tracking-[0.3em] text-orange md:text-xs">
            ★ {meta.group} · {meta.sub}
          </p>
          <h3 className="font-display uppercase leading-[0.9] tracking-tight text-paper text-2xl md:text-4xl">
            {title.trim() || meta.defaultTitle}
            <span className="text-orange">.</span>
          </h3>
          <p className="mt-2 max-w-[55ch] text-sm leading-relaxed text-paper/75 md:text-base">
            {(intro.trim() || meta.defaultIntro).slice(0, 160)}
            {(intro.trim() || meta.defaultIntro).length > 160 ? "…" : ""}
          </p>
        </div>
      </div>

      {/* Média de fond */}
      <div className="space-y-3 border border-paper/10 bg-white/[0.02] p-5">
        <p className={label}>Média de fond (image ou vidéo)</p>
        <p className="-mt-1 font-mono text-xs normal-case leading-relaxed tracking-normal text-paper/45">
          Affiché en plein cadre derrière le texte, avec un voile sombre. Vidéo : lecture
          auto, en boucle, sans son. Vide = fond noir uni.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className={btn}>
            {uploading === "media" ? "Upload…" : mediaUrl ? "Remplacer le média" : "Choisir un média"}
            <input type="file" accept="image/*,video/*" onChange={onMedia} className="hidden" />
          </label>
          {mediaUrl && (
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-paper/45">
              {mediaKind === "video" ? "Vidéo" : "Image"}
            </span>
          )}
          {mediaKind === "video" && (
            <label className={btn}>
              {uploading === "poster" ? "Upload…" : poster ? "Poster ✓" : "Poster (option.)"}
              <input type="file" accept="image/*" onChange={onPoster} className="hidden" />
            </label>
          )}
          {mediaUrl && (
            <button
              type="button"
              onClick={clearMedia}
              className="font-mono text-xs uppercase tracking-[0.1em] text-orange hover:underline"
            >
              Retirer
            </button>
          )}
        </div>
      </div>

      {/* Textes */}
      <div className="space-y-5 border border-paper/10 bg-white/[0.02] p-5">
        <label className="block">
          <span className={label}>Titre du hero</span>
          <input
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={meta.defaultTitle}
          />
          <span className="mt-1 block font-mono text-[11px] text-paper/35">
            Vide = titre par défaut « {meta.defaultTitle} ».
          </span>
        </label>
        <label className="block">
          <span className={label}>Accroche</span>
          <textarea
            className={`${field} min-h-[120px] resize-y leading-relaxed`}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder={meta.defaultIntro}
          />
          <span className="mt-1 block font-mono text-[11px] text-paper/35">
            Vide = accroche par défaut.
          </span>
        </label>
      </div>

      {error && (
        <p className="border border-orange/40 bg-orange/5 p-4 font-mono text-sm leading-relaxed text-orange">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 z-10 flex items-center gap-4 border-t border-paper/10 bg-coal/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={busy || uploading !== null}
          className="bg-orange px-6 py-3 font-display text-base uppercase tracking-[0.12em] text-coal transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && (
          <span className="font-mono text-sm uppercase tracking-[0.12em] text-emerald-400">
            Enregistré ✓
          </span>
        )}
      </div>
    </div>
  );
}
