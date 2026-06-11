import { supabasePublic } from "./supabase/public";

export type Client = {
  id: string;
  name: string;
  logo_url: string | null;
  url: string | null;
};

// Lecture publique des clients publiés (grille « Ils nous font confiance »).
// Tolérant : table absente / erreur → [] → la page retombe sur sa liste par
// défaut. Pas de cookies → SSG/ISR.
export async function getClients(): Promise<Client[]> {
  const { data } = await supabasePublic
    .from("clients")
    .select("id, name, logo_url, url")
    .eq("published", true)
    .order("position", { ascending: true });
  return (data ?? []) as Client[];
}
