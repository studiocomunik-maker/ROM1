import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { pennylaneConfigured, createQuote, sendQuoteByEmail } from "../../../../utils/pennylane";
import { ensurePennylaneCustomer } from "../_lib";

type Body = {
  client_id: string;
  date: string;
  deadline: string; // validité du devis
  lines: { label: string; quantity: number; price: number }[];
  send: boolean;
};

// Crée un devis Pennylane (et l'envoie par email si demandé).
// Protégé : session admin requise.
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
  const lines = (body?.lines ?? [])
    .map((l) => ({ ...l, quantity: l.quantity || 1 }))
    .filter((l) => l.label?.trim() && l.price !== 0 && l.quantity > 0);
  if (!body?.client_id || !body.date || !body.deadline || !lines.length) {
    return NextResponse.json(
      { ok: false, error: "client, date, validité et au moins un poste sont requis." },
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
    const plCustomerId = await ensurePennylaneCustomer(supabase, client);
    const quote = await createQuote({
      customer_id: plCustomerId,
      date: body.date,
      deadline: body.deadline,
      lines,
      external_reference: crypto.randomUUID(),
    });

    let emailStatus: "sent" | "pdf_pending" | "no_email" | "not_requested" = "not_requested";
    if (body.send) {
      emailStatus = client.email ? await sendQuoteByEmail(quote.id) : "no_email";
    }

    return NextResponse.json({
      ok: true,
      quote_number: quote.quote_number,
      pennylane_id: quote.id,
      email: emailStatus,
      pdf_url: quote.public_file_url,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
