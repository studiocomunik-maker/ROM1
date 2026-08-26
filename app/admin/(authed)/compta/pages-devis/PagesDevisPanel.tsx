"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../../../utils/supabase/client";
import SqlLien from "./SqlLien";

export type ClientRow = { id: string; intitule: string; email: string | null };

export type PageRow = {
  id: string;
  slug: string;
  client_id: string | null;
  client_nom: string;
  projet: string;
  devis_numero: string | null;
  pennylane_quote_id: string | null;
  pdf_url: string | null;
  statut: string;
  version: number;
  date_emission: string;
  valide_jusquau: string | null;
  total: number | null;
  contenu: string;
  updated_at: string;
};

export type QuoteRow = {
  id: string;
  numero: string;
  date: string;
  amount: number;
  pdf: string | null;
  status: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const plus90j = () => new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

/** « Site internet — Résidence Les Castalies » → « site-internet-residence-les-castalies » */
const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const blank = (): PageRow => ({
  id: "",
  slug: "",
  client_id: null,
  client_nom: "",
  projet: "",
  devis_numero: null,
  pennylane_quote_id: null,
  pdf_url: null,
  statut: "brouillon",
  version: 0,
  date_emission: today(),
  valide_jusquau: plus90j(),
  total: null,
  contenu: "",
  updated_at: "",
});

const STATUTS = [
  { value: "brouillon", label: "Brouillon (page inaccessible)" },
  { value: "envoye", label: "Envoyé au client" },
  { value: "accepte", label: "Accepté" },
  { value: "refuse", label: "Clos / refusé" },
];

const eur = (n: number | null) =>
  n === null ? "—" : n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €";

export default function PagesDevisPanel({
  initial,
  clients,
  quotes,
}: {
  initial: PageRow[];
  clients: ClientRow[];
  quotes: QuoteRow[];
}) {
  const supabase = createClient();
  const [rows, setRows] = useState<PageRow[]>(initial);
  const [draft, setDraft] = useState<PageRow | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const patch = (p: Partial<PageRow>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const slugPris = useMemo(() => {
    if (!draft?.slug) return false;
    return rows.some((r) => r.slug === draft.slug && r.id !== draft.id);
  }, [draft, rows]);

  function edit(row: PageRow) {
    setDraft({ ...row });
    setNote("");
    setError(null);
    setMessage(null);
  }

  function nouveau() {
    setDraft(blank());
    setNote("");
    setError(null);
    setMessage(null);
  }

  /** Champs communs à l'enregistrement (brouillon comme publication). */
  function payload(d: PageRow) {
    return {
      slug: d.slug || slugify(d.projet),
      client_id: d.client_id,
      client_nom: d.client_nom.trim(),
      projet: d.projet.trim(),
      devis_numero: d.devis_numero,
      pennylane_quote_id: d.pennylane_quote_id,
      pdf_url: d.pdf_url,
      statut: d.statut,
      date_emission: d.date_emission,
      valide_jusquau: d.valide_jusquau,
      total: d.total,
      contenu: d.contenu,
    };
  }

  async function save(publier: boolean) {
    if (!draft) return;
    if (!draft.client_nom.trim() || !draft.projet.trim()) {
      setError("Il faut au moins un client et un intitulé de projet.");
      return;
    }
    if (slugPris) {
      setError("Cette adresse est déjà prise par un autre devis.");
      return;
    }
    if (publier && !draft.contenu.trim()) {
      setError("Le document est vide : rien à publier.");
      return;
    }

    setBusy(publier ? "publish" : "save");
    setError(null);
    setMessage(null);

    const version = publier ? draft.version + 1 : draft.version;
    const body = {
      ...payload(draft),
      version,
      // Publier depuis un brouillon le rend accessible : on le passe en « envoyé ».
      statut: publier && draft.statut === "brouillon" ? "envoye" : draft.statut,
    };

    const { data, error: err } = draft.id
      ? await supabase.from("devis_pages").update(body).eq("id", draft.id).select().single()
      : await supabase.from("devis_pages").insert(body).select().single();

    if (err || !data) {
      setError(err?.message ?? "Enregistrement impossible.");
      setBusy(null);
      return;
    }

    const saved = data as PageRow;

    if (publier) {
      const { error: vErr } = await supabase.from("devis_page_versions").insert({
        page_id: saved.id,
        version,
        contenu: saved.contenu,
        note: note.trim() || null,
        pdf_url: saved.pdf_url,
        total: saved.total,
      });
      if (vErr) {
        setError(`Page enregistrée, mais l'historique a échoué : ${vErr.message}`);
        setBusy(null);
        return;
      }
    }

    setRows((rs) => {
      const others = rs.filter((r) => r.id !== saved.id);
      return [saved, ...others];
    });
    setDraft(saved);
    setNote("");
    setMessage(
      publier
        ? `Version ${version} publiée — ${origin}/devis/${saved.slug}`
        : "Brouillon enregistré."
    );
    setBusy(null);
  }

  async function supprimer(row: PageRow) {
    setBusy(`del-${row.id}`);
    const { error: err } = await supabase.from("devis_pages").delete().eq("id", row.id);
    if (err) setError(err.message);
    else {
      setRows((rs) => rs.filter((r) => r.id !== row.id));
      if (draft?.id === row.id) setDraft(null);
    }
    setBusy(null);
  }

  async function copier(slug: string) {
    await navigator.clipboard.writeText(`${origin}/devis/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  const field =
    "w-full border border-paper/15 bg-white/[0.04] px-3 py-2 text-sm text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";
  const lbl = "font-mono text-[10px] uppercase tracking-[0.15em] text-paper/40";
  const btn =
    "cursor-pointer border border-paper/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-paper/70 transition-colors hover:border-paper/60 disabled:opacity-40";

  return (
    <div className="mx-auto max-w-[1100px] space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Pages devis</h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-paper/45">
            La présentation web qui accompagne le PDF · lien non listé
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/compta/devis"
            className="font-mono text-xs uppercase tracking-[0.12em] text-paper/55 transition-colors hover:text-orange"
          >
            ← Devis Pennylane
          </Link>
          <button type="button" onClick={nouveau} className={btn}>
            + Nouvelle page
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border border-paper/10 bg-white/[0.02] p-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/40">
          Script SQL des tables
        </span>
        <SqlLien fichier="migration_devis_pages.sql" />
      </div>

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

      {/* ---------------------------- Liste ---------------------------- */}
      <section className="space-y-2">
        {!rows.length && (
          <p className="font-mono text-sm text-paper/45">
            Aucune page pour l&apos;instant. « Nouvelle page » pour en créer une.
          </p>
        )}
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`flex flex-wrap items-center gap-x-4 gap-y-2 border p-3 ${
                draft?.id === r.id ? "border-orange/50 bg-orange/5" : "border-paper/10 bg-white/[0.02]"
              }`}
            >
              <span className="min-w-[150px] flex-1 text-sm">
                <b className="font-semibold">{r.client_nom}</b>
                <span className="text-paper/50"> — {r.projet}</span>
              </span>
              <span className="font-mono text-xs text-paper/45">/devis/{r.slug}</span>
              <span className="font-mono text-xs text-paper/60">
                {r.version > 0 ? `v${r.version}` : "jamais publié"}
              </span>
              <span className="font-mono text-sm">{eur(r.total)}</span>
              <span
                className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                  r.statut === "accepte"
                    ? "border-emerald-400/40 text-emerald-400"
                    : r.statut === "brouillon"
                      ? "border-paper/15 text-paper/40"
                      : "border-paper/25 text-paper/70"
                }`}
              >
                {r.statut}
              </span>
              <span className="flex items-center gap-2">
                <button type="button" className={btn} onClick={() => edit(r)}>
                  Éditer
                </button>
                {r.version > 0 && r.statut !== "brouillon" && (
                  <>
                    <a href={`/devis/${r.slug}`} target="_blank" rel="noreferrer" className={btn}>
                      Voir ↗
                    </a>
                    <button type="button" className={btn} onClick={() => copier(r.slug)}>
                      {copied === r.slug ? "Copié ✓" : "Copier le lien"}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className={`${btn} hover:border-orange hover:text-orange`}
                  disabled={busy !== null}
                  onClick={() => supprimer(r)}
                >
                  {busy === `del-${r.id}` ? "…" : "Suppr."}
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------- Éditeur ---------------------------- */}
      {draft && (
        <section className="space-y-5 border border-paper/10 bg-white/[0.02] p-5">
          <h2 className="font-display text-xl uppercase tracking-tight">
            {draft.id ? "Modifier la page" : "Nouvelle page devis"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className={lbl}>Client (annuaire)</span>
              <select
                className={`${field} cursor-pointer`}
                value={draft.client_id ?? ""}
                onChange={(e) => {
                  const c = clients.find((x) => x.id === e.target.value);
                  patch({ client_id: c?.id ?? null, client_nom: c?.intitule ?? draft.client_nom });
                }}
              >
                <option value="" className="bg-coal">
                  — hors annuaire —
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-coal">
                    {c.intitule}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className={lbl}>Nom affiché en tête</span>
              <input
                className={field}
                value={draft.client_nom}
                placeholder="Résidence Les Castalies"
                onChange={(e) => patch({ client_nom: e.target.value })}
              />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className={lbl}>Intitulé du projet</span>
              <input
                className={field}
                value={draft.projet}
                placeholder="Site internet sur-mesure"
                onChange={(e) =>
                  patch({
                    projet: e.target.value,
                    // Tant que le devis n'est pas publié, l'adresse suit l'intitulé.
                    slug: draft.version === 0 && !draft.id ? slugify(e.target.value) : draft.slug,
                  })
                }
              />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className={lbl}>Adresse publique</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-paper/40">{origin}/devis/</span>
                <input
                  className={field}
                  value={draft.slug}
                  placeholder="castalies-site-internet"
                  onChange={(e) => patch({ slug: slugify(e.target.value) })}
                />
              </div>
              {slugPris && (
                <span className="font-mono text-xs text-orange">Cette adresse est déjà utilisée.</span>
              )}
              <span className="font-mono text-[11px] text-paper/35">
                Le lien n&apos;est listé nulle part et n&apos;est pas indexé : c&apos;est lui qui
                protège le devis. Évite un slug devinable pour les gros montants.
              </span>
            </label>

            <label className="space-y-1.5">
              <span className={lbl}>Rattacher un devis Pennylane</span>
              <select
                className={`${field} cursor-pointer`}
                value={draft.pennylane_quote_id ?? ""}
                onChange={(e) => {
                  const q = quotes.find((x) => x.id === e.target.value);
                  patch(
                    q
                      ? {
                          pennylane_quote_id: q.id,
                          devis_numero: q.numero,
                          total: q.amount,
                          pdf_url: q.pdf ?? draft.pdf_url,
                        }
                      : { pennylane_quote_id: null }
                  );
                }}
              >
                <option value="" className="bg-coal">
                  — aucun —
                </option>
                {quotes.map((q) => (
                  <option key={q.id} value={q.id} className="bg-coal">
                    {q.numero} · {eur(q.amount)} · {q.date}
                  </option>
                ))}
              </select>
              <span className="font-mono text-[11px] text-paper/35">
                Remplit le numéro, le montant et le PDF téléchargeable.
              </span>
            </label>

            <label className="space-y-1.5">
              <span className={lbl}>Lien du PDF</span>
              <input
                className={field}
                value={draft.pdf_url ?? ""}
                placeholder="https://…/devis.pdf"
                onChange={(e) => patch({ pdf_url: e.target.value || null })}
              />
            </label>

            <label className="space-y-1.5">
              <span className={lbl}>Devis n°</span>
              <input
                className={field}
                value={draft.devis_numero ?? ""}
                onChange={(e) => patch({ devis_numero: e.target.value || null })}
              />
            </label>

            <label className="space-y-1.5">
              <span className={lbl}>Montant affiché (€)</span>
              <input
                type="number"
                step="0.01"
                className={field}
                value={draft.total ?? ""}
                onChange={(e) => patch({ total: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </label>

            <label className="space-y-1.5">
              <span className={lbl}>Date d&apos;émission</span>
              <input
                type="date"
                className={field}
                value={draft.date_emission}
                onChange={(e) => patch({ date_emission: e.target.value })}
              />
            </label>

            <label className="space-y-1.5">
              <span className={lbl}>Valable jusqu&apos;au</span>
              <input
                type="date"
                className={field}
                value={draft.valide_jusquau ?? ""}
                onChange={(e) => patch({ valide_jusquau: e.target.value || null })}
              />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className={lbl}>Statut</span>
              <select
                className={`${field} cursor-pointer`}
                value={draft.statut}
                onChange={(e) => patch({ statut: e.target.value })}
              >
                {STATUTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-coal">
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Pas un <label> : il contient un input file, qui deviendrait la
              cible du clic à la place de la zone de texte. */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className={lbl}>Document HTML de la présentation</span>
              {/* Un devis fait facilement 40 000 caractères : on charge le
                  fichier plutôt que de le coller. */}
              <label className={`${btn} inline-flex`}>
                Charger un fichier .html
                <input
                  type="file"
                  accept=".html,.htm,text/html"
                  className="hidden"
                  onChange={async (e) => {
                    const fichier = e.target.files?.[0];
                    e.target.value = "";
                    if (!fichier) return;
                    patch({ contenu: await fichier.text() });
                  }}
                />
              </label>
            </div>
            <textarea
              className={`${field} min-h-[320px] font-mono text-xs leading-relaxed`}
              value={draft.contenu}
              placeholder="<!doctype html>…  — le document complet, styles compris."
              onChange={(e) => patch({ contenu: e.target.value })}
            />
            <p className="font-mono text-[11px] text-paper/35">
              Charge le fichier ou colle le document tel quel : il s&apos;affiche dans un cadre
              isolé, ses styles ne touchent pas le reste de la page.{" "}
              {draft.contenu.length.toLocaleString("fr-FR")} caractères.
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className={lbl}>Note de version (visible par le client)</span>
            <input
              className={field}
              value={note}
              placeholder="Ajout de l'option agenda des animations"
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => save(true)}
              disabled={busy !== null}
              className="bg-orange px-5 py-2.5 font-display text-base uppercase tracking-[0.12em] text-coal transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "publish" ? "Publication…" : `Publier la version ${draft.version + 1}`}
            </button>
            <button type="button" onClick={() => save(false)} disabled={busy !== null} className={btn}>
              {busy === "save" ? "…" : "Enregistrer sans publier"}
            </button>
            <button type="button" onClick={() => setDraft(null)} className={btn}>
              Fermer
            </button>
            {draft.version > 0 && draft.statut !== "brouillon" && (
              <a href={`/devis/${draft.slug}`} target="_blank" rel="noreferrer" className={btn}>
                Voir la page ↗
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
