import { createClient } from "../../../../utils/supabase/server";
import ComptaFactures, { type FactureRow, type ClientRow } from "./ComptaFactures";

export default async function AdminCompta() {
  const supabase = await createClient();
  const [factures, clients] = await Promise.all([
    supabase
      .from("compta_factures")
      .select("id, numero, date_emission, client_id, designation, total, acompte, montant, fichier, pennylane_id")
      .order("date_emission", { ascending: true }),
    supabase
      .from("compta_clients")
      .select("id, intitule, nom_legal, siret")
      .order("intitule", { ascending: true }),
  ]);

  // 42P01 = table absente (Postgres) ; PGRST205 = table absente du cache PostgREST
  const missing = [factures.error, clients.error].find(
    (e) => e && (e.code === "42P01" || e.code === "PGRST205")
  );
  if (missing) {
    return (
      <div className="mx-auto max-w-[640px] space-y-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">Compta</h1>
        <div className="border border-orange/40 bg-orange/5 p-5 font-mono text-sm leading-relaxed text-paper/70">
          Les tables compta n&apos;existent pas encore. Exécute la section 8 de{" "}
          <code>supabase/schema.sql</code> puis <code>supabase/seed_compta_2025.sql</code> dans le
          SQL Editor du projet Supabase, puis recharge.
        </div>
      </div>
    );
  }

  return (
    <ComptaFactures
      initial={(factures.data ?? []) as FactureRow[]}
      clients={(clients.data ?? []) as ClientRow[]}
    />
  );
}
