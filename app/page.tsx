import Accueil from "./components/Accueil";
import Expertises from "./components/Expertises";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";

export default function Home() {
  return (
    <>
      {/* Logo fixe — mix-blend difference => s'inverse en négatif selon le fond */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-blanc.png"
        alt="Romain Renoux"
        className="fixed left-6 top-7 z-50 h-9 w-auto mix-blend-difference md:left-12 md:h-12"
      />
      <Accueil />
      <Expertises />
      <Portfolio />
      <Contact />
    </>
  );
}
