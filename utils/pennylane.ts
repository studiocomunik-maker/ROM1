// Client API Pennylane v2 — SERVEUR UNIQUEMENT (le token ne doit jamais
// atteindre le navigateur). Token : Pennylane → Paramètres → Connectivité →
// Développeurs (offre Essentiel minimum), à mettre dans PENNYLANE_API_TOKEN.
// Doc : https://pennylane.readme.io — rate limit 25 req / 5 s.

const BASE = "https://app.pennylane.com/api/external/v2";

// Mention légale de franchise de TVA. La référence change au 01/09/2026
// (recodification : art. 293 B du CGI → art. L.223-3 du CIBS).
export function mentionTva(dateEmission: string): string {
  return dateEmission >= "2026-09-01"
    ? "TVA non applicable, article L.223-3 du Code des impositions sur les biens et services."
    : "TVA non applicable, article 293 B du Code général des impôts.";
}

export function pennylaneConfigured(): boolean {
  return Boolean(process.env.PENNYLANE_API_TOKEN);
}

async function pl(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PENNYLANE_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export type PLAddress = {
  address: string;
  postal_code: string;
  city: string;
  country_alpha2: string;
};

// "1860 route de Frans, 69400 Villefranche-sur-Saône" → adresse structurée.
export function parseAdresse(adresse: string | null): PLAddress | null {
  if (!adresse) return null;
  const m = adresse.replace(/\s+/g, " ").trim().match(/^(.*?),?\s*(\d{5})\s+(.+)$/);
  if (!m) return null;
  return {
    address: m[1].trim().replace(/,$/, "") || m[3].trim(),
    postal_code: m[2],
    city: m[3].trim(),
    country_alpha2: "FR",
  };
}

export async function findCustomerByRegNo(regNo: string): Promise<{ id: number } | null> {
  const filter = encodeURIComponent(
    JSON.stringify([{ field: "reg_no", operator: "eq", value: regNo }])
  );
  const res = await pl(`/customers?filter=${filter}&limit=5`);
  if (!res.ok) throw new Error(`Pennylane customers ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.items?.[0] ?? null;
}

export async function createCompanyCustomer(input: {
  name: string;
  reg_no?: string | null;
  emails: string[];
  billing_address: PLAddress;
  external_reference?: string;
}): Promise<{ id: number }> {
  const res = await pl("/company_customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      ...(input.reg_no ? { reg_no: input.reg_no } : {}),
      emails: input.emails,
      billing_address: input.billing_address,
      ...(input.external_reference ? { external_reference: input.external_reference } : {}),
      billing_language: "fr_FR",
    }),
  });
  if (!res.ok) throw new Error(`Pennylane company_customers ${res.status}: ${await res.text()}`);
  return res.json();
}

export type PLInvoiceLine = { label: string; quantity: number; price: number }; // price = prix unitaire HT

export type PLInvoice = {
  id: number;
  invoice_number: string | null;
  status: string;
  public_file_url: string | null;
};

export async function createDraftInvoice(input: {
  customer_id: number;
  date: string; // yyyy-mm-dd
  deadline: string;
  lines: PLInvoiceLine[];
  external_reference: string;
}): Promise<PLInvoice> {
  const res = await pl("/customer_invoices", {
    method: "POST",
    body: JSON.stringify({
      customer_id: input.customer_id,
      date: input.date,
      deadline: input.deadline,
      draft: true,
      language: "fr_FR",
      external_reference: input.external_reference,
      special_mention: mentionTva(input.date),
      invoice_lines: input.lines.map((l) => ({
        label: l.label,
        quantity: l.quantity,
        unit: "piece",
        raw_currency_unit_price: l.price.toFixed(2),
        vat_rate: "exempt", // franchise en base, art. 293 B
      })),
    }),
  });
  if (!res.ok) throw new Error(`Pennylane customer_invoices ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function finalizeInvoice(id: number): Promise<PLInvoice> {
  const res = await pl(`/customer_invoices/${id}/finalize`, { method: "PUT" });
  if (!res.ok) throw new Error(`Pennylane finalize ${res.status}: ${await res.text()}`);
  return res.json();
}

// 204 = parti ; 409 = PDF pas encore généré (réessayer dans quelques minutes).
export async function sendInvoiceByEmail(id: number): Promise<"sent" | "pdf_pending"> {
  const res = await pl(`/customer_invoices/${id}/send_by_email`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (res.status === 204) return "sent";
  if (res.status === 409) return "pdf_pending";
  throw new Error(`Pennylane send_by_email ${res.status}: ${await res.text()}`);
}

export async function getInvoice(id: number): Promise<PLInvoice> {
  const res = await pl(`/customer_invoices/${id}`);
  if (!res.ok) throw new Error(`Pennylane get invoice ${res.status}: ${await res.text()}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Liste des factures (import descendant vers le récap local)

export type PLInvoiceItem = {
  id: number;
  invoice_number: string | null;
  label: string | null;
  pdf_invoice_subject: string | null;
  date: string;
  deadline: string;
  amount: string; // total TTC en euros (string)
  status: string;
  draft: boolean;
  credit_note?: boolean;
  customer: { id: number } | null;
};

export async function listCustomerInvoices(cursor?: string | null): Promise<{
  items: PLInvoiceItem[];
  next_cursor: string | null;
  has_more: boolean;
}> {
  const filter = encodeURIComponent(
    JSON.stringify([{ field: "draft", operator: "eq", value: false }])
  );
  const res = await pl(
    `/customer_invoices?limit=100&sort=-id&filter=${filter}` +
      (cursor ? `&cursor=${encodeURIComponent(cursor)}` : "")
  );
  if (!res.ok) throw new Error(`Pennylane list invoices ${res.status}: ${await res.text()}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Devis

export type PLQuote = {
  id: number;
  quote_number: string | null;
  label: string | null;
  pdf_invoice_subject: string | null;
  date: string;
  deadline: string;
  amount: string; // total TTC (string)
  status: "pending" | "accepted" | "denied" | "invoiced" | "expired";
  public_file_url: string | null;
  customer: { id: number } | null;
};

export async function listQuotes(cursor?: string | null): Promise<{
  items: PLQuote[];
  next_cursor: string | null;
  has_more: boolean;
}> {
  const res = await pl(
    `/quotes?limit=100&sort=-id` + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : "")
  );
  if (!res.ok) throw new Error(`Pennylane list quotes ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function createQuote(input: {
  customer_id: number;
  date: string;
  deadline: string; // date de validité du devis
  lines: PLInvoiceLine[];
  external_reference: string;
}): Promise<PLQuote> {
  const res = await pl("/quotes", {
    method: "POST",
    body: JSON.stringify({
      customer_id: input.customer_id,
      date: input.date,
      deadline: input.deadline,
      language: "fr_FR",
      external_reference: input.external_reference,
      special_mention: mentionTva(input.date),
      invoice_lines: input.lines.map((l) => ({
        label: l.label,
        quantity: l.quantity,
        unit: "piece",
        raw_currency_unit_price: l.price.toFixed(2),
        vat_rate: "exempt", // franchise en base
      })),
    }),
  });
  if (!res.ok) throw new Error(`Pennylane quotes ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function sendQuoteByEmail(id: number): Promise<"sent" | "pdf_pending"> {
  const res = await pl(`/quotes/${id}/send_by_email`, { method: "POST", body: JSON.stringify({}) });
  if (res.status === 204) return "sent";
  if (res.status === 409) return "pdf_pending";
  throw new Error(`Pennylane quote send_by_email ${res.status}: ${await res.text()}`);
}

export async function updateQuoteStatus(id: number, status: PLQuote["status"]): Promise<void> {
  const res = await pl(`/quotes/${id}/update_status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Pennylane quote status ${res.status}: ${await res.text()}`);
}

// Convertit le devis ENTIER en facture (l'acompte partiel n'existe pas côté API :
// pour un acompte, on émet une facture classique « Acompte X % — devis N »).
export async function createInvoiceFromQuote(
  quoteId: number,
  externalReference: string
): Promise<PLInvoice> {
  const res = await pl("/customer_invoices/create_from_quote", {
    method: "POST",
    body: JSON.stringify({ quote_id: quoteId, draft: true, external_reference: externalReference }),
  });
  if (!res.ok) throw new Error(`Pennylane create_from_quote ${res.status}: ${await res.text()}`);
  return res.json();
}
