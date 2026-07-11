import { createClient } from "../../../../../utils/supabase/server";
import ComptaClients, { type Row } from "./ComptaClients";

export default async function AdminComptaClients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compta_clients")
    .select("id, intitule, nom_legal, siret, adresse, email, pennylane_id")
    .order("intitule", { ascending: true });

  // 42P01 = table absente (Postgres) ; PGRST205 = table absente du cache PostgREST
  if (error && (error.code === "42P01" || error.code === "PGRST205")) {
    return (
      <div className="mx-auto max-w-[640px] space-y-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">Clients compta</h1>
        <div className="border border-orange/40 bg-orange/5 p-5 font-mono text-sm leading-relaxed text-paper/70">
          La table <code>compta_clients</code> n&apos;existe pas encore. Exécute la section 8 de{" "}
          <code>supabase/schema.sql</code> puis <code>supabase/seed_compta_2025.sql</code> dans le
          SQL Editor du projet Supabase, puis recharge.
        </div>
      </div>
    );
  }

  return <ComptaClients initial={(data ?? []) as Row[]} />;
}
