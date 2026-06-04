import Accueil from "./components/Accueil";
import Expertises from "./components/Expertises";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";
import { getRealisations } from "../utils/realisations";

export const revalidate = 60;

export default async function Home() {
  const realisations = await getRealisations();
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
        src="/logo-blanc.png"
        alt="Romain Renoux"
        className="fixed left-6 top-7 z-50 h-11 w-auto mix-blend-difference md:left-12 md:h-14"
      />
      <Accueil />
      <Expertises />
      <Portfolio items={items} />
      <Contact />
    </main>
  );
}
