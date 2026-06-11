import { createClient } from "../../../../utils/supabase/server";
import CollaboratorsForm, { type Row } from "./CollaboratorsForm";

export default async function AdminCollaborateurs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collaborators")
    .select("id, name, role, body, photo_url, position, published")
    .order("position", { ascending: true });

  if (error?.code === "42P01") {
    return (
      <div className="mx-auto max-w-[640px] space-y-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">Collaborateurs</h1>
        <div className="border border-orange/40 bg-orange/5 p-5 font-mono text-sm leading-relaxed text-paper/70">
          La table <code>collaborators</code> n&apos;existe pas encore. Exécute le script{" "}
          <code>supabase/schema.sql</code> (sections 6 et 7) dans le SQL Editor du projet Supabase,
          puis recharge.
        </div>
      </div>
    );
  }

  return <CollaboratorsForm initial={(data ?? []) as Row[]} />;
}
