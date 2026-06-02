import Link from "next/link";

/* En-tête léger des pages internes : logo (retour accueil) + lien de retour.
   mix-blend-difference => le logo reste lisible sur fond clair comme sombre. */
export default function PageNav({
  back = "/",
  backLabel = "Retour",
}: {
  back?: string;
  backLabel?: string;
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 pt-7 md:px-12">
      <Link href="/" className="pointer-events-auto mix-blend-difference">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-blanc.png" alt="Romain Renoux" className="h-9 w-auto md:h-12" />
      </Link>
      <Link
        href={back}
        className="pointer-events-auto font-display text-[10px] uppercase tracking-[0.18em] text-paper mix-blend-difference transition-opacity hover:opacity-70 sm:text-xs"
      >
        ← {backLabel}
      </Link>
    </header>
  );
}
