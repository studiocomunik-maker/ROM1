import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import {
  pennylaneConfigured,
  createDraftInvoice,
  finalizeInvoice,
  sendInvoiceByEmail,
  getInvoice,
} from "../../../../utils/pennylane";
import { ensurePennylaneCustomer } from "../_lib";

type Body = {
  client_id: string;
  date: string; // yyyy-mm-dd
  deadline: string;
  lines: { label: string; quantity: number; price: number }[]; // price = prix unitaire
};

// Émet une facture : brouillon Pennylane → finalisation (numéro attribué par
// Pennylane) → envoi email au client → copie dans compta_factures.
// Protégé : session admin requise.
export async function POST(request: Request) {
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

  const body = (await request.json().catch(() => null)) as Body | null;
  // prix négatif autorisé : ligne de déduction d'acompte sur une facture de solde
  const lines = (body?.lines ?? [])
    .map((l) => ({ ...l, quantity: l.quantity || 1 }))
    .filter((l) => l.label?.trim() && l.price !== 0 && l.quantity > 0);
  const totalFacture = lines.reduce((s, l) => s + l.quantity * l.price, 0);
  if (!body?.client_id || !body.date || !body.deadline || !lines.length || totalFacture <= 0) {
    return NextResponse.json(
      { ok: false, error: "client, date, échéance et un total positif sont requis." },
      { status: 400 }
    );
  }

  const { data: client, error: cliErr } = await supabase
    .from("compta_clients")
    .select("id, intitule, nom_legal, siret, adresse, email, pennylane_id")
    .eq("id", body.client_id)
    .single();
  if (cliErr || !client) {
    return NextResponse.json({ ok: false, error: "Client introuvable." }, { status: 404 });
  }

  try {
    // 1) Client Pennylane (rapprochement SIRET, sinon création)
    const plCustomerId = await ensurePennylaneCustomer(supabase, client);

    // 2) Brouillon → finalisation (Pennylane attribue le numéro)
    const factureId = crypto.randomUUID();
    const draft = await createDraftInvoice({
      customer_id: plCustomerId,
      date: body.date,
      deadline: body.deadline,
      lines,
      external_reference: factureId,
    });
    const finalized = await finalizeInvoice(draft.id);

    // 3) Envoi email (409 = PDF pas encore prêt → renvoyer plus tard)
    let emailStatus: "sent" | "pdf_pending" | "no_email" = "no_email";
    if (client.email) {
      emailStatus = await sendInvoiceByEmail(draft.id);
    }

    // 4) Copie locale dans le récap compta (détail des postes dans `lignes`)
    const montant = lines.reduce((s, l) => s + l.quantity * l.price, 0);
    const { error: insErr } = await supabase.from("compta_factures").insert({
      id: factureId,
      numero: finalized.invoice_number ?? `PL-${draft.id}`,
      date_emission: body.date,
      client_id: client.id,
      designation: lines.map((l) => l.label).join(" / "),
      lignes: lines,
      total: montant,
      acompte: 0,
      montant,
      pennylane_id: String(draft.id),
    });

    const pdf = (await getInvoice(draft.id).catch(() => null))?.public_file_url ?? null;

    return NextResponse.json({
      ok: true,
      numero: finalized.invoice_number,
      pennylane_id: draft.id,
      email: emailStatus,
      pdf_url: pdf,
      warning: insErr ? `Facture émise mais copie locale en échec : ${insErr.message}` : null,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
