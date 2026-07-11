import { createClient } from "../../../../../utils/supabase/server";
import { pennylaneConfigured, listQuotes, type PLQuote } from "../../../../../utils/pennylane";
import DevisPanel, { type ClientRow } from "./DevisPanel";

export const dynamic = "force-dynamic"; // liste live depuis Pennylane

export default async function AdminDevis() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compta_clients")
    .select("id, intitule, nom_legal, siret, email, pennylane_id")
    .order("intitule", { ascending: true });

  // 42P01 = table absente (Postgres) ; PGRST205 = table absente du cache PostgREST
  if (error && (error.code === "42P01" || error.code === "PGRST205")) {
    return (
      <div className="mx-auto max-w-[640px] space-y-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">Devis</h1>
        <div className="border border-orange/40 bg-orange/5 p-5 font-mono text-sm leading-relaxed text-paper/70">
          Les tables compta n&apos;existent pas encore. Exécute{" "}
          <code>supabase/migration_compta.sql</code> puis les seeds dans le SQL Editor, puis
          recharge.
        </div>
      </div>
    );
  }

  const configured = pennylaneConfigured();
  let quotes: PLQuote[] = [];
  let quotesError: string | null = null;
  if (configured) {
    try {
      const page = await listQuotes();
      quotes = page.items;
    } catch (e) {
      quotesError = (e as Error).message;
    }
  }

  return (
    <DevisPanel
      clients={(data ?? []) as ClientRow[]}
      quotes={quotes}
      configured={configured}
      quotesError={quotesError}
    />
  );
}
