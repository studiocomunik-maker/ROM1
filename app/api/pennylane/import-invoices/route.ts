import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { pennylaneConfigured, listCustomerInvoices } from "../../../../utils/pennylane";

// Rapatrie dans le récap local les factures émises côté Pennylane (interface
// ou API) qui n'y sont pas encore. Protégé : session admin requise.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  if (!pennylaneConfigured()) {
    return NextResponse.json({ ok: false, error: "PENNYLANE_API_TOKEN manquant." }, { status: 503 });
  }

  try {
    // ids Pennylane déjà présents localement
    const { data: existing, error: exErr } = await supabase
      .from("compta_factures")
      .select("pennylane_id")
      .not("pennylane_id", "is", null);
    if (exErr) throw new Error(exErr.message);
    const known = new Set((existing ?? []).map((r) => r.pennylane_id));

    // correspondance client Pennylane → client local
    const { data: clients, error: clErr } = await supabase
      .from("compta_clients")
      .select("id, intitule, pennylane_id")
      .not("pennylane_id", "is", null);
    if (clErr) throw new Error(clErr.message);
    const clientByPl = new Map((clients ?? []).map((c) => [c.pennylane_id, c]));

    let importes = 0;
    const sansClient: string[] = [];
    let cursor: string | null = null;
    do {
      const page = await listCustomerInvoices(cursor);
      for (const inv of page.items) {
        if (inv.credit_note) continue; // avoirs : hors périmètre du récap pour l'instant
        if (known.has(String(inv.id))) continue;
        const local = inv.customer ? clientByPl.get(String(inv.customer.id)) : undefined;
        if (!local) sansClient.push(inv.invoice_number ?? String(inv.id));
        const montant = Number(inv.amount);
        const { error: insErr } = await supabase.from("compta_factures").insert({
          numero: inv.invoice_number ?? `PL-${inv.id}`,
          date_emission: inv.date,
          client_id: local?.id ?? null,
          designation: inv.label || inv.pdf_invoice_subject || null,
          total: montant,
          acompte: 0,
          montant,
          pennylane_id: String(inv.id),
        });
        if (insErr) throw new Error(insErr.message);
        importes++;
      }
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);

    return NextResponse.json({ ok: true, importes, sans_client: sansClient });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
