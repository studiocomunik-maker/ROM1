import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DevisDocument from "./DevisDocument";
import { getDevisPage, dateFr, eur } from "../../../utils/devisPages";

// Le contenu peut changer à chaque publication : pas de cache, pas de
// pré-génération (les slugs ne doivent apparaître nulle part).
export const dynamic = "force-dynamic";

const STATUTS: Record<string, { label: string; cls: string }> = {
  envoye: { label: "En attente de votre retour", cls: "border-paper/30 text-paper/70" },
  accepte: { label: "Devis accepté", cls: "border-emerald-400/50 text-emerald-300" },
  refuse: { label: "Devis clos", cls: "border-orange/50 text-orange" },
};

export async function generateMetadata({
  params,
}: PageProps<"/devis/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const devis = await getDevisPage(slug);
  return {
    title: devis ? `Devis — ${devis.projet}` : "Devis",
    // Un devis ne s'indexe pas : lien non listé, et on le dit aussi aux robots.
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function DevisPublicPage({ params }: PageProps<"/devis/[slug]">) {
  const { slug } = await params;
  const devis = await getDevisPage(slug);
  if (!devis) notFound();

  const statut = STATUTS[devis.statut] ?? STATUTS.envoye;
  const publiee = devis.versions[0];

  return (
    <main className="min-h-screen bg-ink text-paper">
      {/* ---------------- En-tête : qui, quoi, combien, et le PDF ------------- */}
      <header className="border-b border-paper/10">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-10 md:px-10 md:py-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="font-display text-sm uppercase tracking-[0.25em] transition-colors hover:text-orange"
            >
              ROM<span className="text-orange">1</span>
            </Link>
            <span
              className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${statut.cls}`}
            >
              {statut.label}
            </span>
          </div>

          <p className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-orange">
            Proposition pour {devis.client_nom}
          </p>
          <h1 className="mt-3 max-w-[20ch] font-display text-4xl uppercase leading-[0.95] tracking-tight md:text-6xl">
            {devis.projet}
          </h1>

          <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-paper/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40">
                Devis n°
              </dt>
              <dd className="mt-1 font-mono text-base">{devis.devis_numero ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40">
                Émis le
              </dt>
              <dd className="mt-1 font-mono text-base">{dateFr(devis.date_emission)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40">
                {devis.valide_jusquau ? "Valable jusqu'au" : "Version"}
              </dt>
              <dd className="mt-1 font-mono text-base">
                {devis.valide_jusquau ? dateFr(devis.valide_jusquau) : `v${devis.version}`}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40">
                Montant
              </dt>
              <dd className="mt-1 font-display text-2xl text-orange">{eur(devis.total)}</dd>
            </div>
          </dl>

          {devis.pdf_url && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={devis.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-orange px-6 py-3.5 font-display text-base uppercase tracking-[0.12em] text-coal transition hover:opacity-90"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v12" />
                  <path d="m7 11 5 5 5-5" />
                  <path d="M4 21h16" />
                </svg>
                Télécharger le devis (PDF)
              </a>
              <span className="font-mono text-xs text-paper/40">
                Version {devis.version}
                {publiee ? ` · mise à jour le ${dateFr(publiee.created_at)}` : ""}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ---------------- Le document lui-même -------------------------------- */}
      <div className="mx-auto w-full max-w-[1080px] px-6 py-10 md:px-10 md:py-14">
        <div className="overflow-hidden bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          <DevisDocument html={devis.contenu} />
        </div>
      </div>

      {/* ---------------- Historique + pied de page --------------------------- */}
      <footer className="border-t border-paper/10">
        <div className="mx-auto grid w-full max-w-[1080px] gap-10 px-6 py-12 md:grid-cols-2 md:px-10">
          {devis.versions.length > 1 && (
            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40">
                Historique des versions
              </h2>
              <ul className="mt-4 space-y-3">
                {devis.versions.map((v) => (
                  <li
                    key={v.version}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-paper/10 pb-3 text-sm"
                  >
                    <span className="font-mono text-orange">v{v.version}</span>
                    <span className="font-mono text-xs text-paper/45">{dateFr(v.created_at)}</span>
                    <span className="text-paper/70">
                      {v.note ?? (v.version === 1 ? "Première proposition" : "Mise à jour")}
                    </span>
                    {v.version === devis.version && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-paper/40">
                        version affichée
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={devis.versions.length > 1 ? "" : "md:col-span-2"}>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40">
              Une question sur ce devis&nbsp;?
            </h2>
            <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-paper/70">
              Écrivez-moi ou appelez-moi&nbsp;: on ajuste le périmètre et je republie une version
              à jour sur cette même adresse.
            </p>
            <a
              href="mailto:studiocomunik@gmail.com"
              className="mt-4 inline-block font-display text-lg uppercase tracking-tight text-orange hover:underline"
            >
              studiocomunik@gmail.com
            </a>
            <p className="mt-8 font-mono text-[11px] leading-relaxed text-paper/35">
              Romain Renoux — 877 rue du Robert, 69840 Jullié · SIRET 479 449 712 00013 · Maison des
              artistes R471527 · TVA non applicable, article 293 B du CGI.
            </p>
          </section>
        </div>
      </footer>
    </main>
  );
}
