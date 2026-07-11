"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../../../../utils/supabase/client";

export type Row = {
  id: string;
  intitule: string;
  nom_legal: string | null;
  siret: string | null;
  adresse: string | null;
  email: string | null;
  pennylane_id: string | null;
};

const blank = (): Row => ({
  id: crypto.randomUUID(),
  intitule: "",
  nom_legal: "",
  siret: "",
  adresse: "",
  email: "",
  pennylane_id: null,
});

export default function ComptaClients({ initial }: { initial: Row[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>(initial);
  const [removed, setRemoved] = useState<string[]>([]);
  const initialIds = new Set(initial.map((r) => r.id));

  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const patch = (i: number, p: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  const add = () => setRows((rs) => [...rs, blank()]);
  const remove = (i: number) =>
    setRows((rs) => {
      const r = rs[i];
      if (initialIds.has(r.id)) setRemoved((x) => [...x, r.id]);
      return rs.filter((_, idx) => idx !== i);
    });

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);

    if (removed.length) {
      const { error: delErr } = await supabase.from("compta_clients").delete().in("id", removed);
      if (delErr) {
        setError(delErr.message);
        setBusy(false);
        return;
      }
    }

    const payload = rows
      .filter((r) => r.intitule.trim())
      .map((r) => ({
        id: r.id,
        intitule: r.intitule.trim(),
        nom_legal: r.nom_legal?.trim() || null,
        siret: r.siret?.replace(/\s/g, "") || null,
        adresse: r.adresse?.trim() || null,
        email: r.email?.trim() || null,
        pennylane_id: r.pennylane_id,
      }));

    if (payload.length) {
      const { error: upErr } = await supabase.from("compta_clients").upsert(payload);
      if (upErr) {
        setError(upErr.message);
        setBusy(false);
        return;
      }
    }

    setRemoved([]);
    setSaved(true);
    setBusy(false);
  }

  // Pousse les clients sans pennylane_id vers Pennylane (match SIRET ou création).
  async function syncPennylane() {
    setBusy(true);
    setError(null);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/pennylane/sync-clients", { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || `Erreur ${res.status}`);
      const parts = [`${json.synced.length} synchronisé(s)`];
      if (json.skipped.length) {
        parts.push(
          `${json.skipped.length} ignoré(s) : ` +
            json.skipped
              .map((s: { intitule: string; raison: string }) => `${s.intitule} (${s.raison})`)
              .join(" · ")
        );
      }
      setSyncMsg(parts.join(" — ") + ". Recharge la page pour voir les ids.");
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  }

  const field =
    "w-full border border-paper/15 bg-white/[0.04] px-3 py-2 text-sm text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";

  return (
    <div className="mx-auto max-w-[1100px] space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Clients compta</h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-paper/45">
            Annuaire facturation · intitulé facture → entité légale (SIRENE)
          </p>
        </div>
        <Link
          href="/admin/compta"
          className="font-mono text-xs uppercase tracking-[0.12em] text-paper/55 transition-colors hover:text-orange"
        >
          ← Retour aux factures
        </Link>
      </div>

      <p className="-mt-2 font-mono text-xs normal-case leading-relaxed tracking-normal text-paper/45">
        L&apos;intitulé est le nom tel qu&apos;écrit sur tes factures ; le nom légal et le SIRET
        viennent du registre SIRENE (annuaire-entreprises.data.gouv.fr). Le champ Pennylane sera
        rempli automatiquement lors de la synchro.
      </p>

      {/* En-têtes de colonnes */}
      <div className="hidden grid-cols-[1fr_1fr_140px_1fr_1fr_90px_50px] gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/40 lg:grid">
        <span>Intitulé facture</span>
        <span>Nom légal</span>
        <span>SIRET</span>
        <span>Adresse</span>
        <span>Email factures</span>
        <span>Pennylane</span>
        <span />
      </div>

      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className="grid grid-cols-2 items-center gap-2 border border-paper/10 bg-white/[0.02] p-3 lg:grid-cols-[1fr_1fr_140px_1fr_1fr_90px_50px]"
          >
            <input
              className={field}
              placeholder="Intitulé facture"
              value={r.intitule}
              onChange={(e) => patch(i, { intitule: e.target.value })}
            />
            <input
              className={field}
              placeholder="Nom légal (SIRENE)"
              value={r.nom_legal ?? ""}
              onChange={(e) => patch(i, { nom_legal: e.target.value })}
            />
            <input
              className={`${field} font-mono`}
              placeholder="SIRET"
              value={r.siret ?? ""}
              onChange={(e) => patch(i, { siret: e.target.value })}
            />
            <input
              className={field}
              placeholder="Adresse"
              value={r.adresse ?? ""}
              onChange={(e) => patch(i, { adresse: e.target.value })}
            />
            <input
              type="email"
              className={field}
              placeholder="Email (envoi factures)"
              value={r.email ?? ""}
              onChange={(e) => patch(i, { email: e.target.value })}
            />
            <span
              className="truncate font-mono text-xs text-paper/40"
              title={r.pennylane_id ?? "Pas encore synchronisé"}
            >
              {r.pennylane_id ?? "—"}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="justify-self-end font-mono text-xs uppercase tracking-[0.1em] text-orange hover:underline lg:justify-self-center"
            >
              ×
            </button>
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
      {syncMsg && (
        <p className="border border-emerald-400/40 bg-emerald-400/5 p-4 font-mono text-sm leading-relaxed text-paper/80">
          {syncMsg}
        </p>
      )}

      <div className="sticky bottom-0 z-10 flex items-center gap-4 border-t border-paper/10 bg-coal/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="bg-orange px-6 py-3 font-display text-base uppercase tracking-[0.12em] text-coal transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && (
          <span className="font-mono text-sm uppercase tracking-[0.12em] text-emerald-400">
            Enregistré ✓
          </span>
        )}
        <button
          type="button"
          onClick={syncPennylane}
          disabled={busy}
          className="ml-auto cursor-pointer border border-paper/25 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-paper/70 transition-colors hover:border-paper/60 disabled:opacity-50"
        >
          Synchroniser avec Pennylane
        </button>
      </div>
    </div>
  );
}
