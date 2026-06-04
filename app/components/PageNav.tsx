import Link from "next/link";

/* En-tête léger des pages internes : logo (retour accueil) + lien de retour.
   mix-blend-difference sur le <header> (l'élément FIXED lui-même) → le logo et
   le lien s'inversent selon le fond derrière eux. Le mettre sur un enfant ne
   marche pas : le header fixe crée son propre contexte d'empilement. */
export default function PageNav({
  back = "/",
  backLabel = "Retour",
}: {
  back?: string;
  backLabel?: string;
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 pt-7 mix-blend-difference md:px-12">
      <Link href="/" className="pointer-events-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-blanc-128.png"
          srcSet="/logo-blanc-64.png 1x, /logo-blanc-128.png 2x, /logo-blanc-192.png 3x"
          width={179}
          height={128}
          alt="Romain Renoux"
          className="h-11 w-auto md:h-14"
        />
      </Link>
      <Link
        href={back}
        className="pointer-events-auto font-display text-[10px] uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-70 sm:text-xs"
      >
        ← {backLabel}
      </Link>
    </header>
  );
}
