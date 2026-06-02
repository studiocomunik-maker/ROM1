import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../utils/supabase/server";

// Rafraîchit immédiatement les pages publiques après une modif admin.
// Protégé : nécessite une session authentifiée (cookies).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { slug } = await request.json().catch(() => ({ slug: undefined }));

  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/metiers/[slug]", "page");
  revalidatePath("/realisations/[slug]", "page");
  if (slug) revalidatePath(`/realisations/${slug}`);

  return NextResponse.json({ ok: true });
}
