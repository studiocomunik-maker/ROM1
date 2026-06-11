import Link from "next/link";
import MenuOverlay from "./MenuOverlay";

/* En-tête léger des pages internes : logo (retour accueil) + menu overlay.
   mix-blend-difference sur le <header> (l'élément FIXED lui-même) → le logo
   s'inverse selon le fond derrière lui. Le mettre sur un enfant ne marche
   pas : le header fixe crée son propre contexte d'empilement. Le bouton
   Menu vit dans MenuOverlay (élément fixe à part, même technique). */
export default function PageNav() {
  return (
    <>
      {/* z-[95] : le logo reste visible au-dessus du menu overlay (z-90) */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[95] flex items-center justify-between px-6 pt-7 mix-blend-difference md:px-12">
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
      </header>
      <MenuOverlay />
    </>
  );
}
