import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-coal px-6 py-20 text-center text-paper">
      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-blanc-128.png"
        srcSet="/logo-blanc-64.png 1x, /logo-blanc-128.png 2x, /logo-blanc-192.png 3x"
        width={179}
        height={128}
        alt="rom1"
        className="mb-12 h-14 w-auto md:h-16"
      />

      <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange">
        Erreur 404
      </p>

      <h1 className="mt-4 font-display uppercase leading-[0.88] tracking-tight text-[clamp(3rem,12vw,7rem)]">
        Que fais-tu
        <br />
        là <span className="text-orange">?</span>
      </h1>

      <p className="mt-7 max-w-[460px] font-mono text-sm leading-relaxed tracking-[0.04em] text-paper/55">
        Cette page n&apos;existe pas… ou elle est partie en vendanges. On a
        cherché partout, même au fond des cuves. Rien.
      </p>

      <Link
        href="/"
        className="mt-11 inline-block bg-orange px-7 py-3.5 font-display text-sm uppercase tracking-[0.12em] text-coal transition-transform hover:scale-[1.03]"
      >
        ← Retour à l&apos;accueil
      </Link>
    </main>
  );
}
