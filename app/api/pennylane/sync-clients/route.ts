import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import {
  pennylaneConfigured,
  findCustomerByRegNo,
  createCompanyCustomer,
  parseAdresse,
} from "../../../../utils/pennylane";

// Pousse les clients compta vers Pennylane (rapprochement par SIRET, sinon
// création), et stocke l'id Pennylane. Protégé : session admin requise.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  if (!pennylaneConfigured()) {
    return NextResponse.json(
      { ok: false, error: "PENNYLANE_API_TOKEN manquant dans .env.local (offre Essentiel requise)." },
      { status: 503 }
    );
  }

  const { data: clients, error } = await supabase
    .from("compta_clients")
    .select("id, intitule, nom_legal, siret, adresse, email, pennylane_id")
    .is("pennylane_id", null);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const synced: string[] = [];
  const skipped: { intitule: string; raison: string }[] = [];

  for (const c of clients ?? []) {
    try {
      let plId: number | null = null;
      if (c.siret) {
        const found = await findCustomerByRegNo(c.siret);
        if (found) plId = found.id;
      }
      if (!plId) {
        const billing = parseAdresse(c.adresse);
        if (!billing) {
          skipped.push({ intitule: c.intitule, raison: "adresse non exploitable (attendu : …, CP Ville)" });
          continue;
        }
        const created = await createCompanyCustomer({
          name: c.nom_legal || c.intitule,
          reg_no: c.siret,
          emails: c.email ? [c.email] : [],
          billing_address: billing,
          external_reference: c.id,
        });
        plId = created.id;
      }
      const { error: upErr } = await supabase
        .from("compta_clients")
        .update({ pennylane_id: String(plId) })
        .eq("id", c.id);
      if (upErr) throw new Error(upErr.message);
      synced.push(c.intitule);
    } catch (e) {
      skipped.push({ intitule: c.intitule, raison: (e as Error).message });
    }
  }

  return NextResponse.json({ ok: true, synced, skipped });
}
