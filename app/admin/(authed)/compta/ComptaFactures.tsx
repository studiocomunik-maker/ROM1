"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../../utils/supabase/client";

export type FactureRow = {
  id: string;
  numero: string;
  date_emission: string; // ISO yyyy-mm-dd
  client_id: string | null;
  designation: string | null;
  total: number | null;
  acompte: number;
  montant: number;
  fichier: string | null;
  pennylane_id: string | null;
};

export type ClientRow = {
  id: string;
  intitule: string;
  nom_legal: string | null;
  siret: string | null;
};

const blank = (year: number): FactureRow => ({
  id: crypto.randomUUID(),
  numero: "",
  date_emission: new Date().getFullYear() === year
    ? new Date().toISOString().slice(0, 10)
    : `${year}-01-01`,
  client_id: null,
  designation: "",
  total: null,
  acompte: 0,
  montant: 0,
  fichier: null,
  pennylane_id: null,
});

const eur = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €";

export default function ComptaFactures({
  initial,
  clients,
}: {
  initial: FactureRow[];
  clients: ClientRow[];
}) {
  const supabase = createClient();
  const [rows, setRows] = useState<FactureRow[]>(initial);
  const [removed, setRemoved] = useState<string[]>([]);
  const initialIds = new Set(initial.map((r) => r.id));

  const years = useMemo(() => {
    const ys = new Set(rows.map((r) => Number(r.date_emission.slice(0, 4))));
    ys.add(new Date().getFullYear());
    return [...ys].sort((a, b) => b - a);
  }, [rows]);
  const [year, setYear] = useState<number>(years[0]);

  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const visible = rows
    .map((r, idx) => [r, idx] as const)
    .filter(([r]) => r.date_emission.startsWith(String(year)));

  const totalAnnee = visible.reduce((s, [r]) => s + (r.montant || 0), 0);
  const clientsActifs = new Set(visible.map(([r]) => r.client_id).filter(Boolean)).size;

  const patch = (i: number, p: Partial<FactureRow>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  const add = () => setRows((rs) => [...rs, blank(year)]);
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
      const { error: delErr } = await supabase.from("compta_factures").delete().in("id", removed);
      if (delErr) {
        setError(delErr.message);
        setBusy(false);
        return;
      }
    }

    const payload = rows
      .filter((r) => r.numero.trim() && r.date_emission)
      .map((r) => ({
        id: r.id,
        numero: r.numero.trim(),
        date_emission: r.date_emission,
        client_id: r.client_id,
        designation: r.designation?.trim() || null,
        total: r.total,
        acompte: r.acompte || 0,
        montant: r.montant || 0,
        fichier: r.fichier?.trim() || null,
        pennylane_id: r.pennylane_id,
      }));

    if (payload.length) {
      const { error: upErr } = await supabase.from("compta_factures").upsert(payload);
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

  // Rapatrie les factures émises côté Pennylane absentes du récap local.
  async function importPennylane() {
    setBusy(true);
    setError(null);
    setImportMsg(null);
    try {
      const res = await fetch("/api/pennylane/import-invoices", { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || `Erreur ${res.status}`);
      let msg = `${json.importes} facture(s) importée(s)`;
      if (json.sans_client?.length) {
        msg += ` — client local inconnu pour : ${json.sans_client.join(", ")} (à réaffecter dans le tableau)`;
      }
      setImportMsg(json.importes ? msg + ". Recharge la page pour les voir." : "Rien de nouveau à importer.");
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  }

  // Export CSV (séparateur ; pour Excel FR) — colonnes prêtes pour l'import Pennylane.
  // TVA 0 % : franchise en base, article 293 B du CGI.
  function exportCsv() {
    const head = "numero;date;client;nom_legal;siret;designation;montant_ttc;tva;devise";
    const lines = visible.map(([r]) => {
      const c = r.client_id ? clientById.get(r.client_id) : undefined;
      const d = r.date_emission.split("-").reverse().join("/");
      const cell = (s: string | null | undefined) => `"${(s ?? "").replace(/"/g, '""')}"`;
      return [
        cell(r.numero), d, cell(c?.intitule), cell(c?.nom_legal), cell(c?.siret),
        cell(r.designation), String(r.montant).replace(".", ","), "0%", "EUR",
      ].join(";");
    });
    const blob = new Blob(["﻿" + [head, ...lines].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pennylane-factures-${year}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const field =
    "w-full border border-paper/15 bg-white/[0.04] px-3 py-2 text-sm text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";
  const btn =
    "cursor-pointer border border-paper/25 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-paper/70 transition-colors hover:border-paper/60";

  return (
    <div className="mx-auto max-w-[1200px] space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Compta</h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-paper/45">
            Récap factures · montant = reste à payer
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/compta/clients"
            className="font-mono text-xs uppercase tracking-[0.12em] text-paper/55 transition-colors hover:text-orange"
          >
            Annuaire clients →
          </Link>
          <Link
            href="/admin/compta/devis"
            className="font-mono text-xs uppercase tracking-[0.12em] text-paper/55 transition-colors hover:text-orange"
          >
            Devis →
          </Link>
          <button type="button" onClick={exportCsv} className={btn}>
            Export CSV
          </button>
          <button type="button" onClick={importPennylane} disabled={busy} className={btn}>
            {busy ? "…" : "Importer depuis Pennylane"}
          </button>
          <Link
            href="/admin/compta/nouvelle"
            className="bg-orange px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-coal transition hover:opacity-90"
          >
            + Nouvelle facture
          </Link>
        </div>
      </div>

      {/* Sélecteur d'année + stats */}
      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center gap-1 border border-paper/10 bg-white/[0.02] p-1.5">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`px-3.5 py-2 font-mono text-sm tracking-[0.08em] transition-colors ${
                y === year ? "bg-orange text-coal" : "text-paper/55 hover:text-paper"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="flex min-w-[130px] flex-col justify-center border border-paper/10 bg-white/[0.02] px-5">
          <span className="font-display text-2xl">{visible.length}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/45">
            Factures
          </span>
        </div>
        <div className="flex min-w-[170px] flex-col justify-center border border-paper/10 bg-white/[0.02] px-5">
          <span className="font-display text-2xl text-orange">{eur(totalAnnee)}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/45">
            CA facturé {year}
          </span>
        </div>
        <div className="flex min-w-[130px] flex-col justify-center border border-paper/10 bg-white/[0.02] px-5">
          <span className="font-display text-2xl">{clientsActifs}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/45">
            Clients actifs
          </span>
        </div>
      </div>

      {/* En-têtes de colonnes */}
      <div className="hidden grid-cols-[130px_130px_190px_1fr_90px_90px_100px_50px] gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/40 lg:grid">
        <span>Numéro</span>
        <span>Date</span>
        <span>Client</span>
        <span>Désignation</span>
        <span className="text-right">Total</span>
        <span className="text-right">Acompte</span>
        <span className="text-right">Montant</span>
        <span />
      </div>

      <ul className="space-y-2">
        {visible.map(([r, i]) => (
          <li
            key={r.id}
            className="grid grid-cols-2 items-center gap-2 border border-paper/10 bg-white/[0.02] p-3 lg:grid-cols-[130px_130px_190px_1fr_90px_90px_100px_50px]"
          >
            <input
              className={field}
              placeholder="Numéro"
              value={r.numero}
              onChange={(e) => patch(i, { numero: e.target.value })}
            />
            <input
              type="date"
              className={field}
              value={r.date_emission}
              onChange={(e) => e.target.value && patch(i, { date_emission: e.target.value })}
            />
            <select
              className={`${field} cursor-pointer`}
              value={r.client_id ?? ""}
              onChange={(e) => patch(i, { client_id: e.target.value || null })}
            >
              <option value="" className="bg-coal">
                — client —
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-coal">
                  {c.intitule}
                </option>
              ))}
            </select>
            <input
              className={`${field} col-span-2 lg:col-span-1`}
              placeholder="Désignation"
              title={r.designation ?? ""}
              value={r.designation ?? ""}
              onChange={(e) => patch(i, { designation: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              className={`${field} text-right`}
              placeholder="Total"
              value={r.total ?? ""}
              onChange={(e) =>
                patch(i, { total: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
            <input
              type="number"
              step="0.01"
              className={`${field} text-right`}
              placeholder="Acompte"
              value={r.acompte || ""}
              onChange={(e) => patch(i, { acompte: Number(e.target.value) || 0 })}
            />
            <input
              type="number"
              step="0.01"
              className={`${field} text-right font-semibold`}
              placeholder="Montant"
              value={r.montant || ""}
              onChange={(e) => patch(i, { montant: Number(e.target.value) || 0 })}
            />
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
        + Ajouter une facture
      </button>

      {error && (
        <p className="border border-orange/40 bg-orange/5 p-4 font-mono text-sm leading-relaxed text-orange">
          {error}
        </p>
      )}
      {importMsg && (
        <p className="border border-emerald-400/40 bg-emerald-400/5 p-4 font-mono text-sm leading-relaxed text-paper/80">
          {importMsg}
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
        <span className="ml-auto font-mono text-xs uppercase tracking-[0.1em] text-paper/35">
          {rows.length} factures au total · données privées (admin)
        </span>
      </div>
    </div>
  );
}
