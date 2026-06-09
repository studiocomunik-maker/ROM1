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
        <div className="border border-orange/40 bg-orange/5 p-5 font-mono text-sm leading-relaxed text-paper/70">
          La table <code>realisations</code> n&apos;existe pas encore. Exécute le script{" "}
          <code>supabase/schema.sql</code> dans le SQL Editor du projet Supabase, puis recharge.
        </div>
      </div>
    );
  }

  const rows = (data ?? []) as Row[];

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Réalisations</h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-paper/45">
            {rows.length} projet{rows.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/realisations/new"
          className="bg-orange px-5 py-3 font-display text-base uppercase tracking-[0.12em] text-coal transition hover:opacity-90 active:scale-[0.99]"
        >
          + Nouvelle réalisation
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="border border-paper/15 bg-white/[0.02] p-8 text-center font-mono text-sm uppercase tracking-[0.15em] text-paper/40">
          Aucune réalisation pour l&apos;instant.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/realisations/${p.id}`}
                className="group flex items-center gap-5 border border-paper/10 bg-white/[0.02] p-3 transition-colors hover:border-paper/25 hover:bg-white/[0.05]"
              >
                <span
                  className="h-16 w-24 shrink-0 bg-cover bg-center bg-white/5"
                  style={p.cover_url ? { backgroundImage: `url(${p.cover_url})` } : undefined}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-xl uppercase tracking-tight">
                    {p.titre}
                  </span>
                  <span className="mt-1 block font-mono text-xs uppercase tracking-[0.12em] text-paper/45">
                    {UNIVERS[p.univers] ?? p.univers} · {p.exps.map((e) => EXPS[e] ?? e).join(" · ")}
                  </span>
                </span>
                <span
                  className={`flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] ${
                    p.published ? "text-[#3ddc84]" : "text-paper/45"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${p.published ? "bg-[#3ddc84]" : "bg-paper/40"}`} />
                  {p.published ? "En ligne" : "Brouillon"}
                </span>
                <span className="ml-2 shrink-0 font-mono text-sm text-paper/30 transition-colors group-hover:text-orange">
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
