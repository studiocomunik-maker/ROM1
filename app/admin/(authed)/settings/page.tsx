import { createClient } from "../../../../utils/supabase/server";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("hero_video_url, hero_video_poster")
    .eq("id", "global")
    .maybeSingle();

  // Table pas encore créée → guide d'installation
  if (error?.code === "42P01") {
    return (
      <div className="max-w-[640px] space-y-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">Réglages</h1>
        <div className="border border-orange/40 bg-orange/5 p-5 font-mono text-sm leading-relaxed text-paper/70">
          La table <code>site_settings</code> n&apos;existe pas encore. Exécute la{" "}
          <strong>section 4</strong> du script <code>supabase/schema.sql</code> dans le SQL
          Editor du projet Supabase, puis recharge.
        </div>
      </div>
    );
  }

  return (
    <SettingsForm
      initialVideoUrl={data?.hero_video_url ?? ""}
      initialPoster={data?.hero_video_poster ?? ""}
    />
  );
}
