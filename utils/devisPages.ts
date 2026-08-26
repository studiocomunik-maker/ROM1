import { supabasePublic } from "./supabase/public";

/**
 * Pages devis : la présentation web qui accompagne un devis Pennylane.
 * Le devis comptable vit dans Pennylane ; ici on sert la page publique
 * (argumentaire + PDF téléchargeable + historique des versions).
 *
 * La lecture publique passe par la fonction Postgres `devis_page_public`
 * (security definer) : sans le slug exact, rien ne sort — et il n'existe
 * aucun moyen de lister les autres devis avec la clé anonyme.
 */

export type DevisPageVersion = {
  version: number;
  note: string | null;
  created_at: string;
};

export type DevisPagePublic = {
  slug: string;
  client_nom: string;
  projet: string;
  devis_numero: string | null;
  pdf_url: string | null;
  statut: "envoye" | "accepte" | "refuse";
  version: number;
  date_emission: string;
  valide_jusquau: string | null;
  total: number | null;
  contenu: string;
  updated_at: string;
  versions: DevisPageVersion[];
};

export async function getDevisPage(slug: string): Promise<DevisPagePublic | null> {
  const { data, error } = await supabasePublic.rpc("devis_page_public", { p_slug: slug });
  if (error || !data) return null;
  return data as DevisPagePublic;
}

/** 2026-08-26 → « 26 août 2026 » */
export function dateFr(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function eur(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—";
  return (
    Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €"
  );
}
