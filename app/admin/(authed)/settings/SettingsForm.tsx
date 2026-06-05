"use client";

import { useState } from "react";
import { createClient } from "../../../../utils/supabase/client";

export default function SettingsForm({
  initialVideoUrl,
  initialPoster,
}: {
  initialVideoUrl: string;
  initialPoster: string;
}) {
  const supabase = createClient();
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [poster, setPoster] = useState(initialPoster);
  const [uploading, setUploading] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function uploadFile(file: File): Promise<string> {
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `hero/${Date.now()}-${safe}`;
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

  async function onPick(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "video" | "poster",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(kind);
    setError(null);
    setSaved(false);
    try {
      const url = await uploadFile(file);
      if (kind === "video") setVideoUrl(url);
      else setPoster(url);
    } catch (err) {
      setError(
        `Upload ${kind} : ${(err as Error).message} — fichier trop lourd ? Vérifie la limite Storage.`,
      );
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    const { error: dbErr } = await supabase
      .from("site_settings")
      .update({
        hero_video_url: videoUrl || null,
        hero_video_poster: poster || null,
      })
      .eq("id", "global");
    if (dbErr) {
      setError(dbErr.message);
      setBusy(false);
      return;
    }
    // Rafraîchit la home immédiatement
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
    } catch {
      /* ISR 60s prendra le relais */
    }
    setSaved(true);
    setBusy(false);
  }

  const btn =
    "cursor-pointer border border-paper/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/70 transition-colors hover:border-paper/60";

  return (
    <div className="mx-auto max-w-[760px] space-y-10">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-tight">Réglages</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-paper/45">
          Vidéo de fond du hero
        </p>
      </div>

      <section className="space-y-5 border border-paper/10 bg-white/[0.02] p-6">
        <p className="font-mono text-[11px] leading-relaxed text-paper/55">
          Vidéo de fond de la grande accroche. Affichée automatiquement en{" "}
          <strong className="text-paper/80">noir &amp; blanc</strong> avec un{" "}
          <strong className="text-paper/80">voile sombre</strong> pour garder la
          punchline lisible. Lecture auto, en boucle, sans son. Laisse vide pour
          revenir au fond noir uni. Format conseillé : MP4 (H.264), paysage 16:9.
        </p>

        {/* Aperçu monochrome */}
        {videoUrl ? (
          <div className="relative overflow-hidden border border-paper/10 bg-coal">
            <video
              src={videoUrl}
              poster={poster || undefined}
              autoPlay
              loop
              muted
              playsInline
              className="aspect-video w-full grayscale"
            />
            <div className="pointer-events-none absolute inset-0 bg-coal/80" />
            <span className="absolute bottom-2 left-2 bg-coal/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-paper/70">
              Aperçu (N&amp;B + voile)
            </span>
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center border border-dashed border-paper/15 bg-coal font-mono text-[11px] uppercase tracking-[0.15em] text-paper/35">
            Aucune vidéo — fond noir uni
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className={btn}>
            {uploading === "video"
              ? "Upload…"
              : videoUrl
                ? "Remplacer la vidéo"
                : "Choisir une vidéo"}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => onPick(e, "video")}
              className="hidden"
            />
          </label>

          <label className={btn}>
            {uploading === "poster" ? "Upload…" : "Poster (image, option.)"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPick(e, "poster")}
              className="hidden"
            />
          </label>

          {videoUrl && (
            <button
              type="button"
              onClick={() => {
                setVideoUrl("");
                setPoster("");
                setSaved(false);
              }}
              className="border border-paper/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/45 transition-colors hover:border-orange hover:text-orange"
            >
              Retirer
            </button>
          )}
        </div>
      </section>

      {error && (
        <p className="border border-orange/40 bg-orange/5 p-4 font-mono text-[11px] leading-relaxed text-orange">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={busy || uploading !== null}
          className="bg-orange px-6 py-3 font-display text-sm uppercase tracking-[0.12em] text-coal transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && (
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#3ddc84]">
            ✓ Enregistré
          </span>
        )}
      </div>
    </div>
  );
}
