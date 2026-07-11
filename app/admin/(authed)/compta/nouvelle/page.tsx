import { createClient } from "../../../../../utils/supabase/server";
import { pennylaneConfigured } from "../../../../../utils/pennylane";
import NouvelleFacture, { type ClientRow } from "./NouvelleFacture";

export default async function AdminNouvelleFacture() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compta_clients")
    .select("id, intitule, nom_legal, siret, email, pennylane_id")
    .order("intitule", { ascending: true });

  // 42P01 = table absente (Postgres) ; PGRST205 = table absente du cache PostgREST
  if (error && (error.code === "42P01" || error.code === "PGRST205")) {
    return (
      <div className="mx-auto max-w-[640px] space-y-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">Nouvelle facture</h1>
        <div className="border border-orange/40 bg-orange/5 p-5 font-mono text-sm leading-relaxed text-paper/70">
          Les tables compta n&apos;existent pas encore. Exécute la section 8 de{" "}
          <code>supabase/schema.sql</code> puis <code>supabase/seed_compta_2025.sql</code> dans le
          SQL Editor du projet Supabase, puis recharge.
        </div>
      </div>
    );
  }

  return (
    <NouvelleFacture clients={(data ?? []) as ClientRow[]} configured={pennylaneConfigured()} />
  );
}
