"use client";

import { useState } from "react";
import Link from "next/link";

export type ClientRow = {
  id: string;
  intitule: string;
  nom_legal: string | null;
  siret: string | null;
  email: string | null;
  pennylane_id: string | null;
};

type Ligne = { key: string; label: string; qty: string; price: string };

const ligneTotal = (l: Ligne) => (Number(l.qty) || 0) * (Number(l.price) || 0);

type Resultat = {
  numero: string | null;
  pennylane_id: number;
  email: "sent" | "pdf_pending" | "no_email";
  pdf_url: string | null;
  warning: string | null;
};

const today = () => new Date().toISOString().slice(0, 10);

export default function NouvelleFacture({
  clients,
  configured,
}: {
  clients: ClientRow[];
  configured: boolean;
}) {
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(today());
  const [deadline, setDeadline] = useState(today()); // « à payer dès réception »
  const [lignes, setLignes] = useState<Ligne[]>([
    { key: crypto.randomUUID(), label: "", qty: "1", price: "" },
  ]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultat, setResultat] = useState<Resultat | null>(null);

  const client = clients.find((c) => c.id === clientId);
  const totalNum = lignes.reduce((s, l) => s + ligneTotal(l), 0);

  const patch = (key: string, p: Partial<Ligne>) =>
    setLignes((ls) => ls.map((l) => (l.key === key ? { ...l, ...p } : l)));

  async function emettre() {
    setBusy(true);
    setError(null);
    setResultat(null);
    try {
      const res = await fetch("/api/pennylane/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          date,
          deadline,
          lines: lignes
            .filter((l) => l.label.trim() && ligneTotal(l) > 0)
            .map((l) => ({
              label: l.label.trim(),
              quantity: Number(l.qty) || 1,
              price: Number(l.price),
            })),
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || `Erreur ${res.status}`);
      setResultat(json);
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  }

  async function renvoyerEmail() {
    if (!resultat) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pennylane/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pennylane_id: resultat.pennylane_id }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || `Erreur ${res.status}`);
      setResultat({ ...resultat, email: json.email });
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  }

  const field =
    "w-full border border-paper/15 bg-white/[0.04] px-4 py-2.5 text-base text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";

  return (
    <div className="mx-auto max-w-[760px] space-y-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Nouvelle facture</h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-paper/45">
            Émission via Pennylane · TVA non applicable, art. 293 B
          </p>
        </div>
        <Link
          href="/admin/compta"
          className="font-mono text-xs uppercase tracking-[0.12em] text-paper/55 transition-colors hover:text-orange"
        >
          ← Récap factures
        </Link>
      </div>

      {!configured && (
        <div className="border border-orange/40 bg-orange/5 p-5 font-mono text-sm leading-relaxed text-paper/70">
          Pennylane n&apos;est pas encore branché : ajoute{" "}
          <code>PENNYLANE_API_TOKEN=…</code> dans <code>.env.local</code> (token à générer dans
          Pennylane → Paramètres → Connectivité → Développeurs, offre Essentiel), puis redémarre
          le serveur.
        </div>
      )}

      <label className="block space-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/45">
          Client
        </span>
        <select
          className={`${field} cursor-pointer`}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="" className="bg-coal">
            — choisir un client —
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="bg-coal">
              {c.intitule}
              {c.email ? "" : " (⚠ pas d'email)"}
            </option>
          ))}
        </select>
      </label>

      {client && !client.email && (
        <p className="border border-orange/40 bg-orange/5 p-4 font-mono text-xs leading-relaxed text-orange">
          {client.intitule} n&apos;a pas d&apos;adresse email : la facture sera émise mais pas
          envoyée. Ajoute l&apos;email dans{" "}
          <Link href="/admin/compta/clients" className="underline">
            l&apos;annuaire clients
          </Link>{" "}
          d&apos;abord.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/45">
            Date d&apos;émission
          </span>
          <input
            type="date"
            className={field}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (deadline < e.target.value) setDeadline(e.target.value);
            }}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/45">
            Échéance (dès réception = même jour)
          </span>
          <input
            type="date"
            className={field}
            value={deadline}
            min={date}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/45">
          Postes de facturation (montants HT = TTC, franchise de TVA)
        </span>
        <div className="hidden grid-cols-[1fr_80px_110px_100px_30px] gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-paper/35 sm:grid">
          <span>Désignation</span>
          <span className="text-right">Qté</span>
          <span className="text-right">Prix unit. €</span>
          <span className="text-right">Total</span>
          <span />
        </div>
        {lignes.map((l) => (
          <div
            key={l.key}
            className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[1fr_80px_110px_100px_30px]"
          >
            <input
              className={`${field} col-span-2 sm:col-span-1`}
              placeholder="Désignation — ex. Création graphique, acompte 50 % devis 21020293"
              value={l.label}
              onChange={(e) => patch(l.key, { label: e.target.value })}
            />
            <input
              type="number"
              step="1"
              min="1"
              className={`${field} text-right`}
              placeholder="Qté"
              value={l.qty}
              onChange={(e) => patch(l.key, { qty: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              className={`${field} text-right`}
              placeholder="€ / unité"
              value={l.price}
              onChange={(e) => patch(l.key, { price: e.target.value })}
            />
            <span className="text-right font-mono text-sm text-paper/70">
              {ligneTotal(l) > 0 ? `${ligneTotal(l).toLocaleString("fr-FR")} €` : "—"}
            </span>
            <button
              type="button"
              onClick={() => setLignes((ls) => ls.filter((x) => x.key !== l.key))}
              disabled={lignes.length === 1}
              className="justify-self-end font-mono text-xs uppercase text-orange hover:underline disabled:opacity-30"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setLignes((ls) => [
              ...ls,
              { key: crypto.randomUUID(), label: "", qty: "1", price: "" },
            ])
          }
          className="w-full border border-dashed border-paper/25 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-paper/55 transition-colors hover:border-orange hover:text-orange"
        >
          + Ajouter un poste
        </button>
      </div>

      {error && (
        <p className="border border-orange/40 bg-orange/5 p-4 font-mono text-sm leading-relaxed text-orange">
          {error}
        </p>
      )}

      {resultat && (
        <div className="space-y-2 border border-emerald-400/40 bg-emerald-400/5 p-5 font-mono text-sm leading-relaxed text-paper/80">
          <p>
            Facture <strong className="text-emerald-400">{resultat.numero}</strong> émise ✓
          </p>
          <p>
            Email :{" "}
            {resultat.email === "sent" ? (
              <span className="text-emerald-400">envoyé au client ✓</span>
            ) : resultat.email === "pdf_pending" ? (
              <>
                PDF en cours de génération côté Pennylane —{" "}
                <button
                  type="button"
                  onClick={renvoyerEmail}
                  disabled={busy}
                  className="text-orange underline disabled:opacity-50"
                >
                  renvoyer dans une minute
                </button>
              </>
            ) : (
              "non envoyé (client sans email)"
            )}
          </p>
          {resultat.pdf_url && (
            <p>
              <a
                href={resultat.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="text-orange underline"
              >
                Voir le PDF ↗
              </a>{" "}
              <span className="text-paper/40">(lien valable 30 min)</span>
            </p>
          )}
          {resultat.warning && <p className="text-orange">{resultat.warning}</p>}
        </div>
      )}

      <div className="sticky bottom-0 z-10 flex items-center gap-4 border-t border-paper/10 bg-coal/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={emettre}
          disabled={busy || !configured || !clientId || totalNum <= 0}
          className="bg-orange px-6 py-3 font-display text-base uppercase tracking-[0.12em] text-coal transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Émission…" : `Émettre — ${totalNum.toLocaleString("fr-FR")} €`}
        </button>
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-paper/35">
          Numéro attribué par Pennylane à l&apos;émission
        </span>
      </div>
    </div>
  );
}
