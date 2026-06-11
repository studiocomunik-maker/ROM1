"use client";

import { useState } from "react";
import { createClient } from "../../../../utils/supabase/client";

export type Row = {
  id: string;
  name: string;
  logo_url: string | null;
  url: string | null;
  position: number;
  published: boolean;
};

const blank = (): Row => ({
  id: crypto.randomUUID(),
  name: "",
  logo_url: null,
  url: "",
  position: 0,
  published: true,
});

export default function ClientsForm({ initial }: { initial: Row[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>(initial.map((r) => ({ ...r, url: r.url ?? "" })));
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

  // Logos : upload BRUT (pas de compression → préserve la transparence PNG/SVG).
  async function upload(file: File): Promise<string> {
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `clients/${Date.now()}-${safe}`;
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

  async function onLogo(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(`logo-${i}`);
    setError(null);
    setSaved(false);
    try {
      patch(i, { logo_url: await upload(file) });
    } catch (err) {
      setError(`Upload logo : ${(err as Error).message} — fichier trop lourd ?`);
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);

    if (removed.length) {
      const { error: delErr } = await supabase.from("clients").delete().in("id", removed);
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
        logo_url: r.logo_url || null,
        url: r.url?.trim() || null,
        position: idx,
        published: r.published,
      }));

    if (payload.length) {
      const { error: upErr } = await supabase.from("clients").upsert(payload);
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

  const field =
    "w-full border border-paper/15 bg-white/[0.04] px-4 py-2.5 text-base text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";
  const btn =
    "cursor-pointer border border-paper/25 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-paper/70 transition-colors hover:border-paper/60";

  return (
    <div className="mx-auto max-w-[760px] space-y-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Clients</h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-paper/45">
            Grille « Ils nous font confiance » · page à-propos
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

      <p className="-mt-2 font-mono text-xs normal-case leading-relaxed tracking-normal text-paper/45">
        Logo de préférence en PNG transparent (fond clair). Sans logo, le nom s&apos;affiche en
        toutes lettres.
      </p>

      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center gap-3 border border-paper/10 bg-white/[0.02] p-3"
          >
            {/* Aperçu logo */}
            <div className="flex h-14 w-24 shrink-0 items-center justify-center border border-paper/10 bg-white">
              {r.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.logo_url} alt="" className="max-h-12 max-w-[80px] object-contain" />
              ) : (
                <span className="font-display text-xs uppercase tracking-tight text-coal/40">
                  {r.name.slice(0, 14) || "—"}
                </span>
              )}
            </div>

            <input
              className={`${field} min-w-[140px] flex-1`}
              placeholder="Nom du client"
              value={r.name}
              onChange={(e) => patch(i, { name: e.target.value })}
            />
            <input
              className={`${field} min-w-[160px] flex-1`}
              placeholder="https://… (lien, option.)"
              value={r.url ?? ""}
              onChange={(e) => patch(i, { url: e.target.value })}
            />

            <label className={btn}>
              {uploading === `logo-${i}` ? "Upload…" : r.logo_url ? "Logo ✓" : "Logo"}
              <input type="file" accept="image/*" onChange={(e) => onLogo(i, e)} className="hidden" />
            </label>
            {r.logo_url && (
              <button
                type="button"
                onClick={() => patch(i, { logo_url: null })}
                className="font-mono text-sm text-orange"
                aria-label="Retirer le logo"
              >
                ×
              </button>
            )}

            <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/55">
              <input
                type="checkbox"
                checked={r.published}
                onChange={(e) => patch(i, { published: e.target.checked })}
                className="h-4 w-4 accent-orange"
              />
              En ligne
            </label>

            <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.1em]">
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
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="w-full border border-dashed border-paper/25 px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-paper/55 transition-colors hover:border-orange hover:text-orange"
      >
        + Ajouter un client
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
