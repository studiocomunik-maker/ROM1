import { notFound } from "next/navigation";
import { createClient } from "../../../../../utils/supabase/server";
import RealisationForm, { type MediaItem } from "../RealisationForm";

export default async function EditRealisation({
  params,
}: PageProps<"/admin/realisations/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("realisations").select("*").eq("id", id).single();

  if (error || !data) notFound();

  return (
    <RealisationForm
      initial={{
        id: data.id,
        titre: data.titre ?? "",
        slug: data.slug ?? "",
        description: data.description ?? "",
        univers: data.univers ?? "",
        exps: data.exps ?? [],
        cover_url: data.cover_url ?? null,
        media: (data.media ?? []) as MediaItem[],
        published: data.published ?? true,
        position: data.position ?? 0,
        panel_theme: data.panel_theme === "light" ? "light" : "dark",
      }}
    />
  );
}
