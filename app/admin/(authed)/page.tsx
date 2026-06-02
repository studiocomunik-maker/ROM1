import Link from "next/link";
import { createClient } from "../../../utils/supabase/server";
import { EXPS, UNIVERS } from "../../data";

type Row = {
  id: string;
  slug: string;
  titre: string;
  univers: string;
  exps: string[];
  cover_url: string | null;
  published: boolean;
  position: number;
};

export default async function AdminHome() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("realisations")
    .select("id, slug, titre, univers, exps, cover_url, published, position")
    .order("position", { ascending: true });

  // Table pas encore créée → guide d'installation
  if (error?.code === "42P01") {
    return (
      <div className="max-w-[640px] space-y-4">
        <h1 className="font-display text-3xl uppercase tracking-tight">Réalisations</h1>
        <div className="border border-orange/40 bg-orange/5 p-5 font-mono text-xs leading-relaxed text-paper/70">
          La table <code>realisations</code> n&apos;existe pas encore. Exécute le script{" "}
          <code>supabase/schema.sql</code> dans le SQL Editor du projet Supabase, puis recharge.
        </div>
      </div>
    );
  }

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight">Réalisations</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-paper/45">
            {rows.length} projet{rows.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/realisations/new"
          className="bg-orange px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-coal transition-opacity hover:opacity-90"
        >
          + Nouvelle réalisation
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="border border-paper/15 p-6 font-mono text-xs uppercase tracking-[0.15em] text-paper/40">
          Aucune réalisation pour l&apos;instant.
        </p>
      ) : (
        <ul className="divide-y divide-paper/10 border-y border-paper/10">
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/realisations/${p.id}`}
                className="group flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className="h-12 w-16 shrink-0 bg-cover bg-center bg-white/5"
                  style={p.cover_url ? { backgroundImage: `url(${p.cover_url})` } : undefined}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg uppercase tracking-tight">
                    {p.titre}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-paper/45">
                    {UNIVERS[p.univers] ?? p.univers} · {p.exps.map((e) => EXPS[e] ?? e).join(" · ")}
                  </span>
                </span>
                {!p.published && (
                  <span className="border border-paper/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-paper/50">
                    brouillon
                  </span>
                )}
                <span className="font-mono text-xs text-paper/30 transition-colors group-hover:text-orange">
                  éditer →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
