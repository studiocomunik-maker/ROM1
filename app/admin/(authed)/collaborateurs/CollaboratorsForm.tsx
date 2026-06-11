"use client";

import { useState } from "react";
import { createClient } from "../../../../utils/supabase/client";

export type Row = {
  id: string;
  name: string;
  role: string | null;
  body: string | null;
  photo_url: string | null;
  position: number;
  published: boolean;
};

const blank = (): Row => ({
  id: crypto.randomUUID(),
  name: "",
  role: "",
  body: "",
  photo_url: null,
  position: 0,
  published: true,
});

export default function CollaboratorsForm({ initial }: { initial: Row[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>(initial.map((r) => ({ ...r, role: r.role ?? "", body: r.body ?? "" })));
  const [removed, setRemoved] = useState<string[]>([]);
  const initialIds = new Set(initial.map((r) => r.id));

  const [uploading, setUploading] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (i: number, p: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  const add = () => setRows((rs) => [...rs, blank()]);
  const remove = (i: number) =>
    setRows((rs) => {
      const r = rs[i];
      if (initialIds.has(r.id)) setRemoved((x) => [...x, r.id]);
      return rs.filter((_, idx) => idx !== i);
    });
  const move = (i: number, dir: -1 | 1) =>
    setRows((rs) => {
      const j = i + dir;
      if (j < 0 || j >= rs.length) return rs;
      const next = [...rs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function upload(file: File): Promise<string> {
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `collaborateurs/${Date.now()}-${safe}`;
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

  async function onPhoto(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(`photo-${i}`);
    setError(null);
    setSaved(false);
    try {
      patch(i, { photo_url: await upload(file) });
    } catch (err) {
      setError(`Upload photo : ${(err as Error).message} — fichier trop lourd ?`);
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);

    if (removed.length) {
      const { error: delErr } = await supabase.from("collaborators").delete().in("id", removed);
      if (delErr) {
        setError(delErr.message);
        setBusy(false);
        return;
      }
    }

    const payload = rows
      .filter((r) => r.name.trim())
      .map((r, idx) => ({
        id: r.id,
        name: r.name.trim(),
        role: r.role?.trim() || null,
        body: r.body?.trim() || null,
        photo_url: r.photo_url || null,
        position: idx,
        published: r.published,
      }));

    if (payload.length) {
      const { error: upErr } = await supabase.from("collaborators").upsert(payload);
      if (upErr) {
        setError(upErr.message);
        setBusy(false);
        return;
      }
    }

    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/a-propos" }),
      });
    } catch {
      /* ISR 60s prendra le relais */
    }
    setRemoved([]);
    setSaved(true);
    setBusy(false);
  }

  const label = "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-paper/55";
  const field =
    "w-full border border-paper/15 bg-white/[0.04] px-4 py-3 text-base text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";
  const btn =
    "cursor-pointer border border-paper/25 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-paper/70 transition-colors hover:border-paper/60";

  return (
    <div className="mx-auto max-w-[760px] space-y-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Collaborateurs</h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-paper/45">
            Section « Les collaborateurs » · page à-propos
          </p>
        </div>
        <a
          href="/a-propos"
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs uppercase tracking-[0.12em] text-paper/55 transition-colors hover:text-orange"
        >
          Voir la page ↗
        </a>
      </div>

      <ul className="space-y-4">
        {rows.map((r, i) => (
          <li key={r.id} className="border border-paper/10 bg-white/[0.02] p-5">
            <div className="flex gap-5">
              {/* Portrait */}
              <div className="w-28 shrink-0">
                <div className="relative aspect-[3/4] overflow-hidden border border-paper/15 bg-white/5">
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo_url} alt="" className="h-full w-full object-cover grayscale" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.12em] text-paper/30">
                      Portrait
                    </span>
                  )}
                </div>
                <label className={`${btn} mt-2 block text-center`}>
                  {uploading === `photo-${i}` ? "Upload…" : r.photo_url ? "Remplacer" : "Photo"}
                  <input type="file" accept="image/*" onChange={(e) => onPhoto(i, e)} className="hidden" />
                </label>
                {r.photo_url && (
                  <button
                    type="button"
                    onClick={() => patch(i, { photo_url: null })}
                    className="mt-1.5 block w-full text-center font-mono text-[11px] uppercase tracking-[0.1em] text-orange hover:underline"
                  >
                    Retirer
                  </button>
                )}
              </div>

              {/* Champs */}
              <div className="min-w-0 flex-1 space-y-3">
                <label className="block">
                  <span className={label}>Nom</span>
                  <input
                    className={field}
                    value={r.name}
                    onChange={(e) => patch(i, { name: e.target.value })}
                    placeholder="Céline Kbaier"
                  />
                </label>
                <label className="block">
                  <span className={label}>Rôle</span>
                  <input
                    className={field}
                    value={r.role ?? ""}
                    onChange={(e) => patch(i, { role: e.target.value })}
                    placeholder="Graphiste — print, étiquettes & contenus"
                  />
                </label>
                <label className="block">
                  <span className={label}>Description</span>
                  <textarea
                    className={`${field} min-h-[90px] resize-y leading-relaxed`}
                    value={r.body ?? ""}
                    onChange={(e) => patch(i, { body: e.target.value })}
                    placeholder="Quelques phrases de présentation…"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <label className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-paper/60">
                    <input
                      type="checkbox"
                      checked={r.published}
                      onChange={(e) => patch(i, { published: e.target.checked })}
                      className="h-4 w-4 accent-orange"
                    />
                    En ligne
                  </label>
                  <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.1em]">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-paper/50 transition-colors hover:text-paper disabled:opacity-30">
                      ↑
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-paper/50 transition-colors hover:text-paper disabled:opacity-30">
                      ↓
                    </button>
                    <button type="button" onClick={() => remove(i)} className="text-orange hover:underline">
                      Suppr.
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="w-full border border-dashed border-paper/25 px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-paper/55 transition-colors hover:border-orange hover:text-orange"
      >
        + Ajouter un collaborateur
      </button>

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
