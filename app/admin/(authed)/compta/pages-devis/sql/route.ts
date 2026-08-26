import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../../../../utils/supabase/server";

/**
 * Sert un script SQL du dossier `supabase/` pour qu'on puisse l'ouvrir d'un clic
 * depuis le back-office et le coller dans le SQL Editor, sans aller le chercher
 * dans le dépôt.
 *
 * Route sous /admin : le proxy exige déjà une session, et on revérifie ici
 * (une route ne doit jamais dépendre du seul garde-fou de navigation).
 *
 * `?f=` est comparé à la liste réelle des fichiers du dossier : pas de
 * traversée de chemin possible, et un nouveau script est servi sans rien coder.
 * `?download=1` force le téléchargement au lieu de l'affichage.
 */

const DIR = path.join(process.cwd(), "supabase");

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Non autorisé", { status: 401 });

  const asked = request.nextUrl.searchParams.get("f") ?? "migration_devis_pages.sql";
  const download = request.nextUrl.searchParams.get("download") === "1";

  let fichiers: string[];
  try {
    fichiers = (await readdir(DIR)).filter((f) => f.endsWith(".sql"));
  } catch {
    return new NextResponse(
      "Le dossier supabase/ n'est pas accessible depuis le serveur.",
      { status: 500 }
    );
  }

  // Seul un nom présent dans le dossier est accepté — pas de "../".
  const nom = fichiers.find((f) => f === path.basename(asked));
  if (!nom) {
    return new NextResponse(
      `Script introuvable. Disponibles :\n${fichiers.map((f) => `  · ${f}`).join("\n")}`,
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const sql = await readFile(path.join(DIR, nom), "utf-8");

  return new NextResponse(sql, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${nom}"`,
      "Cache-Control": "no-store",
    },
  });
}
