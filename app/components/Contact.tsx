/* Étoile-éclat du hero, recolorée pour ressortir sur le fond orange (coal + cœur orange). */
function Burst({ className = "" }: { className?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 16;
    const r = i % 2 === 0 ? 48 : 20;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <polygon points={pts} fill="#0c0c0e" />
      <circle cx="50" cy="50" r="14" fill="#f5f4f2" />
    </svg>
  );
}

export default function Contact() {
  return (
    <section
      id="contact"
      className="grain relative z-10 flex flex-col items-center justify-center overflow-hidden bg-orange px-6 py-16 text-center text-coal md:px-12 md:py-20"
    >
      <p className="mb-5 font-display text-xs uppercase tracking-[0.25em]">
        Lyon · Rhône · Beaujolais
      </p>
      <h2 className="font-display uppercase leading-[0.85] tracking-tight text-[clamp(2.4rem,8vw,6.5rem)]">
        <span className="text-paper">Parlons</span>
        <span className="mx-[0.12em] inline-block h-[0.7em] w-[0.7em] -translate-y-[0.04em] align-middle">
          <Burst className="spin-slow h-full w-full" />
        </span>
        de votre histoire
      </h2>
      <a
        href="mailto:rom1@rom1.fr"
        className="mt-8 inline-block whitespace-nowrap bg-coal px-5 py-2.5 font-display text-xs uppercase tracking-[0.12em] text-paper transition-transform hover:scale-[1.03]"
      >
        rom1@rom1.fr
      </a>
      <p className="mt-10 font-mono text-xs uppercase leading-[1.6] tracking-[0.15em] text-coal/60">
        © Romain Renoux — rom1.fr
        <br />
        Côté web → pixelstore.fr
      </p>
    </section>
  );
}
