/* Bandeau discret entre L'atelier et Contact — simple lien vers la boutique. */
export default function Boutique() {
  return (
    <section id="boutique" className="grain relative z-10 bg-coal text-paper">
      <a
        href="https://boutique.rom1.fr"
        target="_blank"
        rel="noopener noreferrer"
        className="group mx-auto flex max-w-[1400px] items-baseline justify-between gap-4 px-6 py-8 md:px-12"
      >
        <span className="font-display text-sm uppercase tracking-[0.2em] transition-colors group-hover:text-orange md:text-base">
          <span className="text-orange">★ </span>
          Découvrez la boutique
          <span className="hidden text-paper/45 transition-colors group-hover:text-orange/60 sm:inline">
            {" "}
            — t-shirts &amp; tirages d’art
          </span>
        </span>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-paper/50 transition-colors group-hover:text-orange">
          boutique.rom1.fr ↗
        </span>
      </a>
    </section>
  );
}
