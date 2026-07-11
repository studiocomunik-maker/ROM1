import type { SupabaseClient } from "@supabase/supabase-js";
import { findCustomerByRegNo, createCompanyCustomer, parseAdresse } from "../../../utils/pennylane";

export type ComptaClient = {
  id: string;
  intitule: string;
  nom_legal: string | null;
  siret: string | null;
  adresse: string | null;
  email: string | null;
  pennylane_id: string | null;
};

// Garantit que le client compta existe côté Pennylane (rapprochement SIRET,
// sinon création) et renvoie son id Pennylane. Met à jour la ligne locale.
export async function ensurePennylaneCustomer(
  supabase: SupabaseClient,
  client: ComptaClient
): Promise<number> {
  if (client.pennylane_id) return Number(client.pennylane_id);

  let plId: number | null = null;
  if (client.siret) {
    const found = await findCustomerByRegNo(client.siret);
    if (found) plId = found.id;
  }
  if (!plId) {
    const billing = parseAdresse(client.adresse);
    if (!billing) {
      throw new Error(
        `Adresse de ${client.intitule} non exploitable (attendu : …, CP Ville).`
      );
    }
    const created = await createCompanyCustomer({
      name: client.nom_legal || client.intitule,
      reg_no: client.siret,
      emails: client.email ? [client.email] : [],
      billing_address: billing,
      external_reference: client.id,
    });
    plId = created.id;
  }
  await supabase
    .from("compta_clients")
    .update({ pennylane_id: String(plId) })
    .eq("id", client.id);
  return plId;
}
