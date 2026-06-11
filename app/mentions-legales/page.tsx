import type { Metadata } from "next";
import PageNav from "../components/PageNav";
import { SITE_URL } from "../data";

const TITLE = "Mentions légales — Romain Renoux";
const DESCRIPTION =
  "Mentions légales du site rom1.fr — Romain Renoux, graphiste et directeur artistique en Beaujolais.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/mentions-legales` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/mentions-legales`,
    title: TITLE,
    description: DESCRIPTION,
  },
};

/* Page légale sobre : typographie du site, sans animation. */
const h2 =
  "mb-4 mt-14 font-display text-lg uppercase tracking-tight text-orange first:mt-0 md:text-xl";
const p = "max-w-[68ch] text-sm leading-relaxed text-paper/75 md:text-base";

export default function MentionsLegales() {
  return (
    <main className="min-h-screen bg-coal text-paper">
      <PageNav />

      <div className="px-6 pb-24 pt-36 md:px-12">
        <h1 className="mb-14 font-display uppercase leading-[0.9] tracking-tight text-[clamp(2rem,6vw,4rem)]">
          Mentions légales<span className="text-orange">.</span>
        </h1>

        <h2 className={h2}>Éditeur du site</h2>
        <p className={p}>
          Le site rom1.fr est édité par <strong>Romain Renoux</strong>,
          graphiste — directeur artistique, artiste-auteur affilié à la Maison
          des Artistes.
        </p>
        <ul className={`${p} mt-3 space-y-1`}>
          <li>N° MDA : R471527</li>
          <li>N° SIRET : 479 449 712 00013</li>
          <li>TVA non applicable, article 293 B du CGI</li>
          <li>Localisation : Beaujolais, France</li>
          <li>
            Contact :{" "}
            <a href="mailto:rom1@rom1.fr" className="underline decoration-orange underline-offset-4 hover:text-paper">
              rom1@rom1.fr
            </a>
          </li>
        </ul>
        <p className={`${p} mt-3`}>
          Directeur de la publication : Romain Renoux.
        </p>

        <h2 className={h2}>Hébergement</h2>
        <p className={p}>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
          Covina, CA 91723, États-Unis —{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-orange underline-offset-4 hover:text-paper"
          >
            vercel.com
          </a>
          .
        </p>

        <h2 className={h2}>Propriété intellectuelle</h2>
        <p className={p}>
          L&apos;ensemble des contenus de ce site — créations graphiques,
          photographies, vidéos, textes et identité visuelle — est la propriété
          de Romain Renoux ou de ses clients respectifs. Toute reproduction,
          représentation ou exploitation, totale ou partielle, sans
          autorisation écrite préalable est interdite.
        </p>

        <h2 className={h2}>Données personnelles &amp; cookies</h2>
        <p className={p}>
          Ce site ne dépose aucun cookie de suivi et ne collecte aucune donnée
          personnelle. Aucun outil de mesure d&apos;audience ni traceur
          publicitaire n&apos;est utilisé. Les vidéos YouTube intégrées ne se
          chargent qu&apos;après un clic volontaire, via le lecteur sans cookie
          de YouTube. Si vous me contactez par email, votre adresse n&apos;est
          utilisée que pour vous répondre et n&apos;est jamais transmise à des
          tiers.
        </p>

        <h2 className={h2}>Crédits</h2>
        <p className={p}>
          Conception, direction artistique et contenus : Romain Renoux.
          Réalisation technique du site : pixelstore.fr.
        </p>
      </div>
    </main>
  );
}
