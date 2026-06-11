import { supabasePublic } from "./supabase/public";

export type Collaborator = {
  id: string;
  name: string;
  role: string | null;
  body: string | null;
  photo_url: string | null;
};

// Lecture publique des collaborateurs publiés (section « Les collaborateurs »).
// Tolérant : table absente / erreur → [] → la page retombe sur sa liste par
// défaut. Pas de cookies → SSG/ISR.
export async function getCollaborators(): Promise<Collaborator[]> {
  const { data } = await supabasePublic
    .from("collaborators")
    .select("id, name, role, body, photo_url")
    .eq("published", true)
    .order("position", { ascending: true });
  return (data ?? []) as Collaborator[];
}
