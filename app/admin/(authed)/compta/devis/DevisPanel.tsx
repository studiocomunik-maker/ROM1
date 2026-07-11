"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PLQuote } from "../../../../../utils/pennylane";

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
const today = () => new Date().toISOString().slice(0, 10);
const plus30j = () => new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const eur = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €";

const STATUTS: Record<PLQuote["status"], { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "text-paper/60 border-paper/25" },
  accepted: { label: "Accepté", cls: "text-emerald-400 border-emerald-400/40" },
  denied: { label: "Refusé", cls: "text-orange border-orange/40" },
  invoiced: { label: "Facturé", cls: "text-paper/40 border-paper/15" },
  expired: { label: "Expiré", cls: "text-paper/40 border-paper/15" },
};

export default function DevisPanel({
  clients,
  quotes,
  configured,
  quotesError,
}: {
  clients: ClientRow[];
  quotes: PLQuote[];
  configured: boolean;
  quotesError: string | null;
}) {
  const router = useRouter();
  const clientByPl = new Map(
    clients.filter((c) => c.pennylane_id).map((c) => [c.pennylane_id as string, c])
  );

  // --- formulaire nouveau devis ---
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(today());
  const [deadline, setDeadline] = useState(plus30j());
  const [send, setSend] = useState(true);
  const [lignes, setLignes] = useState<Ligne[]>([
    { key: crypto.randomUUID(), label: "", qty: "1", price: "" },
  ]);
  const totalNum = lignes.reduce((s, l) => s + ligneTotal(l), 0);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pctByQuote, setPctByQuote] = useState<Record<number, string>>({});

  const patch = (key: string, p: Partial<Ligne>) =>
    setLignes((ls) => ls.map((l) => (l.key === key ? { ...l, ...p } : l)));

  async function creerDevis() {
    setBusy("create");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/pennylane/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          date,
          deadline,
          send,
          lines: lignes
            .filter((l) => l.label.trim() && ligneTotal(l) !== 0)
            .map((l) => ({ label: l.label.trim(), quantity: Number(l.qty) || 1, price: Number(l.price) })),
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || `Erreur ${res.status}`);
      setMessage(
        `Devis ${json.quote_number} créé` +
          (json.email === "sent"
            ? ", envoyé au client ✓"
            : json.email === "pdf_pending"
              ? " — PDF en cours de génération, renvoie l'email dans une minute"
              : json.email === "no_email"
                ? " — client sans email, non envoyé"
                : "")
      );
      setLignes([{ key: crypto.randomUUID(), label: "", qty: "1", price: "" }]);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(null);
  }

  async function action(q: PLQuote, act: string, extra: Record<string, unknown> = {}) {
    setBusy(`${act}-${q.id}`);
    setError(null);
    setMessage(null);
    try {
      const local = q.customer ? clientByPl.get(String(q.customer.id)) : undefined;
      const res = await fetch("/api/pennylane/quotes/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: q.id,
          action: act,
          client_id: local?.id,
          quote_number: q.quote_number,
          total: Number(q.amount),
          ...extra,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || `Erreur ${res.status}`);
      if (act === "invoice_deposit" || act === "invoice_full") {
        setMessage(
          `Facture ${json.numero} émise` +
            (json.email === "sent" ? ", envoyée au client ✓" : json.email === "pdf_pending" ? " — email à renvoyer dans une minute depuis le récap" : " (client sans email)") +
            (json.warning ? ` — ${json.warning}` : "")
        );
      } else {
        setMessage("Fait ✓");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(null);
  }

  const field =
    "w-full border border-paper/15 bg-white/[0.04] px-3 py-2 text-sm text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";
  const btn =
    "cursor-pointer border border-paper/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-paper/70 transition-colors hover:border-paper/60 disabled:opacity-40";

  return (
    <div className="mx-auto max-w-[1100px] space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Devis</h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-paper/45">
            Créés et suivis dans Pennylane · acompte / solde
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
          Pennylane n&apos;est pas branché : ajoute <code>PENNYLANE_API_TOKEN</code> dans{" "}
          <code>.env.local</code> puis redémarre le serveur.
        </div>
      )}

      {/* ------- Nouveau devis ------- */}
      <section className="space-y-4 border border-paper/10 bg-white/[0.02] p-5">
        <h2 className="font-display text-xl uppercase tracking-tight">Nouveau devis</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className={`${field} cursor-pointer`}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="" className="bg-coal">
              — client —
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-coal">
                {c.intitule}
                {c.email ? "" : " (⚠ pas d'email)"}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase text-paper/40">Date</span>
            <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap font-mono text-[10px] uppercase text-paper/40">
              Valide jusqu&apos;au
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

        {lignes.map((l) => (
          <div key={l.key} className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[1fr_80px_110px_100px_30px]">
            <input
              className={`${field} col-span-2 sm:col-span-1`}
              placeholder="Poste — ex. Création site internet"
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
              className={`${field} text-right`}
              placeholder="€ / unité"
              value={l.price}
              onChange={(e) => patch(l.key, { price: e.target.value })}
            />
            <span className="text-right font-mono text-sm text-paper/70">
              {ligneTotal(l) > 0 ? eur(ligneTotal(l)) : "—"}
            </span>
            <button
              type="button"
              onClick={() => setLignes((ls) => ls.filter((x) => x.key !== l.key))}
              disabled={lignes.length === 1}
              className="justify-self-end font-mono text-xs text-orange hover:underline disabled:opacity-30"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLignes((ls) => [...ls, { key: crypto.randomUUID(), label: "", qty: "1", price: "" }])}
          className="w-full border border-dashed border-paper/25 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-paper/55 transition-colors hover:border-orange hover:text-orange"
        >
          + Ajouter un poste
        </button>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={creerDevis}
            disabled={busy !== null || !configured || !clientId || totalNum <= 0}
            className="bg-orange px-5 py-2.5 font-display text-base uppercase tracking-[0.12em] text-coal transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "create" ? "Création…" : `Créer le devis — ${eur(totalNum)}`}
          </button>
          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-paper/55">
            <input
              type="checkbox"
              checked={send}
              onChange={(e) => setSend(e.target.checked)}
              className="h-4 w-4 accent-orange"
            />
            Envoyer par email au client
          </label>
        </div>
      </section>

      {error && (
        <p className="border border-orange/40 bg-orange/5 p-4 font-mono text-sm leading-relaxed text-orange">
          {error}
        </p>
      )}
      {message && (
        <p className="border border-emerald-400/40 bg-emerald-400/5 p-4 font-mono text-sm leading-relaxed text-paper/80">
          {message}
        </p>
      )}

      {/* ------- Liste des devis ------- */}
      <section className="space-y-2">
        <h2 className="font-display text-xl uppercase tracking-tight">
          Devis Pennylane <span className="text-paper/40">({quotes.length})</span>
        </h2>
        {quotesError && (
          <p className="border border-orange/40 bg-orange/5 p-4 font-mono text-sm text-orange">
            Lecture Pennylane impossible : {quotesError}
          </p>
        )}
        {!quotes.length && !quotesError && (
          <p className="font-mono text-sm text-paper/45">Aucun devis pour l&apos;instant.</p>
        )}
        <ul className="space-y-2">
          {quotes.map((q) => {
            const local = q.customer ? clientByPl.get(String(q.customer.id)) : undefined;
            const st = STATUTS[q.status] ?? STATUTS.pending;
            return (
              <li
                key={q.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-paper/10 bg-white/[0.02] p-3"
              >
                <span className="font-mono text-sm text-paper/80">{q.quote_number}</span>
                <span className="font-mono text-xs text-paper/45">
                  {q.date.split("-").reverse().join("/")}
                </span>
                <span className="min-w-[140px] flex-1 text-sm">
                  {local?.intitule ?? <span className="text-orange">client inconnu localement</span>}
                </span>
                <span className="font-mono text-sm font-semibold">{eur(Number(q.amount))}</span>
                <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${st.cls}`}>
                  {st.label}
                </span>

                <span className="flex items-center gap-2">
                  {q.public_file_url && (
                    <a href={q.public_file_url} target="_blank" rel="noreferrer" className={btn}>
                      PDF ↗
                    </a>
                  )}
                  {q.status === "pending" && (
                    <>
                      <button type="button" className={btn} disabled={busy !== null} onClick={() => action(q, "send")}>
                        Envoyer
                      </button>
                      <button type="button" className={btn} disabled={busy !== null} onClick={() => action(q, "accept")}>
                        Accepté ✓
                      </button>
                      <button type="button" className={btn} disabled={busy !== null} onClick={() => action(q, "deny")}>
                        Refusé
                      </button>
                    </>
                  )}
                  {q.status === "accepted" && (
                    <>
                      <span className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          placeholder="30"
                          value={pctByQuote[q.id] ?? ""}
                          onChange={(e) => setPctByQuote((m) => ({ ...m, [q.id]: e.target.value }))}
                          className={`${field} w-16 px-2 py-1.5 text-right text-xs`}
                        />
                        <button
                          type="button"
                          className={btn}
                          disabled={busy !== null || !Number(pctByQuote[q.id])}
                          onClick={() => action(q, "invoice_deposit", { pct: Number(pctByQuote[q.id]) })}
                        >
                          {busy === `invoice_deposit-${q.id}` ? "…" : "% Facturer acompte"}
                        </button>
                      </span>
                      <button
                        type="button"
                        className={btn}
                        disabled={busy !== null}
                        onClick={() => action(q, "invoice_full")}
                      >
                        {busy === `invoice_full-${q.id}` ? "…" : "Facturer la totalité"}
                      </button>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="pt-2 font-mono text-xs leading-relaxed text-paper/40">
          Acompte : émet une facture classique « Acompte X % — devis N ». Pour le solde final,
          passe par Nouvelle facture avec les postes du projet et une ligne négative « Acompte déjà
          facturé », ou convertis le devis en facture de solde directement dans Pennylane (qui
          déduit les acomptes automatiquement).
        </p>
      </section>
    </div>
  );
}
