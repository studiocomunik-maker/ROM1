import Accueil from "./components/Accueil";
import Expertises from "./components/Expertises";
import Portfolio from "./components/Portfolio";
import Atelier from "./components/Atelier";
import Contact from "./components/Contact";
import { getRealisations } from "../utils/realisations";
import { getSiteSettings } from "../utils/settings";

export const revalidate = 60;

export default async function Home() {
  const [realisations, settings] = await Promise.all([
    getRealisations(),
    getSiteSettings(),
  ]);
  const items = realisations.map((r) => ({
    slug: r.slug,
    titre: r.titre,
    univers: r.univers,
    exps: r.exps,
    cover_url: r.cover_url,
  }));
  return (
    <main>
      {/* Logo fixe — mix-blend difference => s'inverse en négatif selon le fond */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-blanc-128.png"
        srcSet="/logo-blanc-64.png 1x, /logo-blanc-128.png 2x, /logo-blanc-192.png 3x"
        width={179}
        height={128}
        alt="Romain Renoux"
        className="fixed left-6 top-7 z-50 h-11 w-auto mix-blend-difference md:left-12 md:h-14"
      />
      <Accueil
        heroVideoUrl={settings.heroVideoUrl}
        heroVideoPoster={settings.heroVideoPoster}
      />
      <Expertises />
      <Portfolio items={items} />
      <Atelier />
      <Contact />
    </main>
  );
}
