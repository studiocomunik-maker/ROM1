import { notFound } from "next/navigation";
import { createClient } from "../../../../../utils/supabase/server";
import { getSection } from "../sections";
import SectionHeroForm, { type HeroRow } from "./SectionHeroForm";

export default async function SectionEditPage({ params }: PageProps<"/admin/sections/[id]">) {
  const { id } = await params;
  const meta = getSection(id);
  if (!meta) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("section_heroes")
    .select("media_url, media_kind, poster_url, title, intro")
    .eq("id", meta.dbId)
    .maybeSingle();

  return <SectionHeroForm meta={meta} initial={(data as HeroRow) ?? null} />;
}
