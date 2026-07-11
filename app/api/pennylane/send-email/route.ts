import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { pennylaneConfigured, sendInvoiceByEmail } from "../../../../utils/pennylane";

// Renvoie l'email d'une facture Pennylane (utile quand l'émission a répondu
// « PDF en cours de génération »). Protégé : session admin requise.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  if (!pennylaneConfigured()) {
    return NextResponse.json({ ok: false, error: "PENNYLANE_API_TOKEN manquant." }, { status: 503 });
  }

  const { pennylane_id } = await request.json().catch(() => ({ pennylane_id: null }));
  if (!pennylane_id) {
    return NextResponse.json({ ok: false, error: "pennylane_id requis." }, { status: 400 });
  }

  try {
    const status = await sendInvoiceByEmail(Number(pennylane_id));
    return NextResponse.json({ ok: true, email: status });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
