import Link from "next/link";
import Reveal from "./Reveal";
import { SITE_URL } from "../data";

/* Bloc SEO « graphiste en Beaujolais » de l'accueil. Reprend le contenu de
   l'ancienne page /graphiste-beaujolais (redirigée 301 vers /) : c'est
   l'accueil qui doit ranker sur la requête tête, pas une page satellite. */

const TEXTE = [
  "Graphiste indépendant installé à Jullié, dans le Beaujolais nord, au-dessus de Juliénas. Vingt ans de métier, un atelier au milieu des vignes, et des clients qui vont du vigneron à l'industriel — parce qu'ici, les deux se croisent au même comptoir.",
  "Le Beaujolais n'est pas une zone de chalandise sur une carte : c'est mon terrain. Je connais les dix crus, les imprimeurs qui tiennent la dorure, les caves où se décident les étiquettes. Une identité se dessine mieux quand on a vu le lieu, serré les mains, goûté ce qu'il y a dans le verre — alors je passe, je regarde, je reviens avec des propositions qui vous ressemblent.",
  "Identité graphique et logos, étiquettes de vin et packaging, print, photo, vidéo et drone, motion design ; côté web, la direction artistique ici et la fabrication chez pixelstore.fr. Un seul interlocuteur du logo au site : pas d'identité en morceaux.",
];

const FAQ = [
  {
    q: "Combien coûte un graphiste en Beaujolais ?",
    a: "Chaque projet est chiffré sur devis, à la mission — pas d'abonnement, pas de forfait opaque. Une identité complète, une étiquette ou un reportage photo n'ont pas le même périmètre : on en parle, je chiffre, vous savez où vous allez avant de commencer.",
  },
  {
    q: "Vous déplacez-vous chez les clients ?",
    a: "Oui, systématiquement au démarrage d'un projet. Je suis basé à Jullié, dans le Beaujolais nord : Belleville, Beaujeu ou Fleurie sont à un quart d'heure, Villefranche-sur-Saône et Mâcon à une demi-heure, Lyon à quarante-cinq minutes.",
  },
  {
    q: "Travaillez-vous uniquement pour le monde du vin ?",
    a: "Non. Le vin est mon univers historique — étiquettes, identités de domaines, photos de cave — mais je travaille aussi pour l'industrie, l'hôtellerie-restauration, la culture et le spectacle vivant.",
  },
  {
    q: "Quels sont vos délais ?",
    a: "Un logo avec sa charte demande généralement quatre à six semaines, une étiquette trois à quatre, un site complet six à dix selon le contenu. Je m'engage sur des dates que je tiens, pas sur des promesses commerciales.",
  },
];

const VILLES = [
  { href: "/graphiste-villefranche-sur-saone", t: "Villefranche-sur-Saône" },
  { href: "/graphiste-belleville-en-beaujolais", t: "Belleville-en-Beaujolais" },
  { href: "/graphiste-macon", t: "Mâcon" },
  { href: "/creation-site-internet-beaujolais", t: "Sites internet" },
  { href: "/univers/vin", t: "Étiquettes de vin" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      serviceType: "Graphisme, identité visuelle et direction artistique",
      url: SITE_URL,
      provider: { "@id": `${SITE_URL}/#org` },
      areaServed: "Beaujolais",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Beaujolais() {
  return (
    <section
      id="beaujolais"
      className="relative z-10 bg-white px-6 py-24 text-coal md:px-12 md:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 md:grid-cols-2 md:gap-20">
        <Reveal>
          <p className="mb-6 font-display text-xs uppercase tracking-[0.25em] text-orange">
            ★ Graphiste · Beaujolais
          </p>
          <h2 className="mb-8 font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(2.2rem,5.5vw,4.2rem)]">
            Graphiste en Beaujolais, de Villefranche à Mâcon
            <span className="text-orange">.</span>
          </h2>
          <div className="max-w-[560px] space-y-4 text-[15px] leading-[1.75] text-coal/80">
            {TEXTE.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <nav
            aria-label="Graphiste autour du Beaujolais"
            className="mt-8 flex flex-wrap gap-2"
          >
            {VILLES.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                className="border border-coal/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-coal/70 transition-colors hover:border-coal hover:text-coal"
              >
                {v.t} →
              </Link>
            ))}
          </nav>
        </Reveal>

        <Reveal delay={120}>
          <h3 className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-coal/50">
            On me demande souvent
          </h3>
          <div className="divide-y divide-coal/15 border-y border-coal/15">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-base uppercase tracking-tight md:text-lg [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-orange transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[60ch] leading-relaxed text-coal/75">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
