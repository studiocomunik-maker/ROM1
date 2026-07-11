import { NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";
import {
  pennylaneConfigured,
  sendQuoteByEmail,
  updateQuoteStatus,
  createDraftInvoice,
  createInvoiceFromQuote,
  finalizeInvoice,
  sendInvoiceByEmail,
} from "../../../../../utils/pennylane";

type Body = {
  quote_id: number;
  action: "send" | "accept" | "deny" | "invoice_deposit" | "invoice_full";
  // pour invoice_deposit / invoice_full :
  client_id?: string; // id local compta_clients
  quote_number?: string;
  total?: number; // total TTC du devis
  pct?: number; // % d'acompte
};

// Actions sur un devis : envoi, statut, facturation d'acompte (facture
// classique « Acompte X % — devis N ») ou facturation de la totalité
// (conversion Pennylane). Protégé : session admin requise.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  if (!pennylaneConfigured()) {
    return NextResponse.json({ ok: false, error: "PENNYLANE_API_TOKEN manquant." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.quote_id || !body.action) {
    return NextResponse.json({ ok: false, error: "quote_id et action requis." }, { status: 400 });
  }

  try {
    if (body.action === "send") {
      const email = await sendQuoteByEmail(body.quote_id);
      return NextResponse.json({ ok: true, email });
    }
    if (body.action === "accept" || body.action === "deny") {
      await updateQuoteStatus(body.quote_id, body.action === "accept" ? "accepted" : "denied");
      return NextResponse.json({ ok: true });
    }

    // Facturation — il faut le client Pennylane du devis côté local
    const { data: client } = body.client_id
      ? await supabase
          .from("compta_clients")
          .select("id, intitule, email, pennylane_id")
          .eq("id", body.client_id)
          .single()
      : { data: null };
    if (!client?.pennylane_id) {
      return NextResponse.json(
        { ok: false, error: "Client local introuvable pour ce devis (synchronise l'annuaire)." },
        { status: 422 }
      );
    }

    const factureId = crypto.randomUUID();
    const today = new Date().toISOString().slice(0, 10);
    let draft;
    let designation: string;
    let montant: number;

    if (body.action === "invoice_deposit") {
      const pct = body.pct ?? 0;
      if (!(pct > 0 && pct < 100) || !body.total) {
        return NextResponse.json({ ok: false, error: "Pourcentage d'acompte invalide." }, { status: 400 });
      }
      montant = Math.round(body.total * pct) / 100;
      designation = `Acompte ${pct} % — devis ${body.quote_number ?? body.quote_id}`;
      draft = await createDraftInvoice({
        customer_id: Number(client.pennylane_id),
        date: today,
        deadline: today,
        lines: [{ label: designation, quantity: 1, price: montant }],
        external_reference: factureId,
      });
    } else {
      // invoice_full : conversion du devis entier par Pennylane
      draft = await createInvoiceFromQuote(body.quote_id, factureId);
      designation = `Devis ${body.quote_number ?? body.quote_id} — facturation totale`;
      montant = body.total ?? 0;
    }

    const finalized = await finalizeInvoice(draft.id);
    let email: "sent" | "pdf_pending" | "no_email" = "no_email";
    if (client.email) email = await sendInvoiceByEmail(draft.id);

    if (body.action === "invoice_full") {
      await updateQuoteStatus(body.quote_id, "invoiced").catch(() => {
        /* statut déjà mis à jour par Pennylane via la conversion */
      });
    }

    const { error: insErr } = await supabase.from("compta_factures").insert({
      id: factureId,
      numero: finalized.invoice_number ?? `PL-${draft.id}`,
      date_emission: today,
      client_id: client.id,
      designation,
      total: montant,
      acompte: 0,
      montant,
      pennylane_id: String(draft.id),
    });

    return NextResponse.json({
      ok: true,
      numero: finalized.invoice_number,
      email,
      warning: insErr ? `Facture émise mais copie locale en échec : ${insErr.message}` : null,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
