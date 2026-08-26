import { createClient } from "../../../../../utils/supabase/server";
import { pennylaneConfigured, listQuotes, type PLQuote } from "../../../../../utils/pennylane";
import PagesDevisPanel, { type ClientRow, type PageRow } from "./PagesDevisPanel";
import SqlLien from "./SqlLien";

export const dynamic = "force-dynamic"; // devis Pennylane lus en direct

export default async function AdminPagesDevis() {
  const supabase = await createClient();

  const [pagesRes, clientsRes] = await Promise.all([
    supabase
      .from("devis_pages")
      .select(
        "id, slug, client_id, client_nom, projet, devis_numero, pennylane_quote_id, pdf_url, statut, version, date_emission, valide_jusquau, total, contenu, updated_at"
      )
      .order("updated_at", { ascending: false }),
    supabase
      .from("compta_clients")
      .select("id, intitule, email")
      .order("intitule", { ascending: true }),
  ]);

  // 42P01 = table absente (Postgres) ; PGRST205 = table absente du cache PostgREST
  const missing =
    pagesRes.error && (pagesRes.error.code === "42P01" || pagesRes.error.code === "PGRST205");
  if (missing) {
    return (
      <div className="mx-auto max-w-[680px] space-y-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">Pages devis</h1>
        <div className="space-y-4 border border-orange/40 bg-orange/5 p-5 font-mono text-sm leading-relaxed text-paper/70">
          <p>
            La table n&apos;existe pas encore. Copie le script, colle-le dans le SQL Editor de
            Supabase, exécute, puis recharge cette page.
          </p>
          <SqlLien fichier="migration_devis_pages.sql" />
        </div>
      </div>
    );
  }

  let quotes: PLQuote[] = [];
  if (pennylaneConfigured()) {
    try {
      quotes = (await listQuotes()).items;
    } catch {
      // Pennylane indisponible : on peut quand même écrire une page devis à la main.
    }
  }

  return (
    <PagesDevisPanel
      initial={(pagesRes.data ?? []) as PageRow[]}
      clients={(clientsRes.data ?? []) as ClientRow[]}
      quotes={quotes.map((q) => ({
        id: String(q.id),
        numero: q.quote_number ?? `#${q.id}`,
        date: q.date,
        amount: Number(q.amount),
        pdf: q.public_file_url,
        status: q.status,
      }))}
    />
  );
}
