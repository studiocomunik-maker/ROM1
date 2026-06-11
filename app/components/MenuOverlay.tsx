"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* Menu overlay plein écran. Le bouton « Menu » est un élément FIXED à part
   entière en mix-blend-difference (comme le logo) → il s'inverse selon le fond,
   y compris au-dessus de l'overlay coal une fois ouvert (z au-dessus).
   La navigation elle-même est gérée par TransitionProvider (rideau). */

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/savoir-faire", label: "Savoir-faire" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/a-propos", label: "À propos" },
];

/* Burger — vecteur NET comme les autres icônes (œil/éclair/étoile),
   bicolore ORANGE / blanc / ORANGE. Rendu en 2 COUCHES superposées :
   - layer "paper" (dans le bouton blend-difference) → trait du milieu,
     s'inverse selon le fond comme le logo ;
   - layer "orange" (couche fixe SANS blend) → traits haut/bas, l'orange
     reste orange partout (en difference il virerait au cyan sur clair).
   Les traits ondulent GAUCHE-DROITE en continu (.burger-line, durées/
   délais désynchronisés). Ouvert = MORPH animé vers une croix BICOLORE :
   trait orange du haut → diagonale 45°, trait blanc du milieu →
   diagonale -45°, trait orange du bas s'efface — wrapper <g>
   .burger-morph (transition transform) distinct du <path> .burger-line
   (animation), sinon l'un écrase l'autre. */
const MORPH_EASE = "0.35s cubic-bezier(0.16, 1, 0.3, 1)";

function BurgerIcon({ open, layer }: { open: boolean; layer: "paper" | "orange" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3.2,
    strokeLinecap: "round" as const,
    "aria-hidden": true,
  };
  const morph = (transform: string): React.CSSProperties => ({
    transform: open ? transform : "none",
    transition: `transform ${MORPH_EASE}, opacity ${MORPH_EASE}`,
  });
  return (
    <svg viewBox="0 0 44 32" className="h-7 w-9" {...common}>
      {layer === "orange" ? (
        <>
          <g className="burger-morph" style={morph("translateY(8px) rotate(45deg)")}>
            <path d="M5 8 H39" className="burger-line" style={{ animationDuration: "2.4s" }} />
          </g>
          <g
            className="burger-morph"
            style={{ ...morph("scaleX(0.2)"), opacity: open ? 0 : 1 }}
          >
            <path d="M5 24 H39" className="burger-line" style={{ animationDuration: "2.7s", animationDelay: "0.8s" }} />
          </g>
        </>
      ) : (
        <g className="burger-morph" style={morph("rotate(-45deg)")}>
          <path d="M5 16 H39" className="burger-line" style={{ animationDuration: "3s", animationDelay: "0.4s" }} />
        </g>
      )}
    </svg>
  );
}

/* Étoile-éclat du hero (orange, cœur papier) — décor de l'overlay */
function Burst({ className = "" }: { className?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 16;
    const r = i % 2 === 0 ? 48 : 20;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <polygon points={pts} fill="#ff3d1f" />
      <circle cx="50" cy="50" r="14" fill="#f5f4f2" />
    </svg>
  );
}

export default function MenuOverlay() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Échap ferme + scroll verrouillé tant que le menu est ouvert
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="fixed right-6 top-7 z-[95] -m-2 flex min-h-11 min-w-11 items-center justify-center p-2 text-paper mix-blend-difference md:right-12"
      >
        <BurgerIcon open={open} layer="paper" />
      </button>
      {/* Couche orange du burger — mêmes classes de position que le bouton
         (le -m-2/p-2 décale l'élément fixe, il faut le répliquer à l'identique) */}
      <span
        aria-hidden
        className="pointer-events-none fixed right-6 top-7 z-[95] -m-2 flex min-h-11 min-w-11 items-center justify-center p-2 text-orange md:right-12"
      >
        <BurgerIcon open={open} layer="orange" />
      </span>

      {open && (
        <div
          className="menu-in grain fixed inset-0 z-[90] overflow-hidden bg-coal text-paper"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          {/* Étoile décorative qui déborde du bord droit, à mi-hauteur
             (pas dans le coin : le bouton Fermer en blend-difference y
             deviendrait illisible) */}
          <Burst className="spin-slow absolute -right-14 top-[14%] h-40 w-40 opacity-90 md:-right-24 md:top-1/2 md:h-80 md:w-80 md:-translate-y-1/2" />

          <nav className="relative z-10 flex h-full flex-col justify-center px-6 md:px-12">
            <p className="mb-6 font-display text-xs uppercase tracking-[0.3em] text-orange md:mb-8">
              ★ Menu
            </p>
            <ul className="space-y-1 md:space-y-2">
              {LINKS.map((l, i) => {
                const active = pathname === l.href;
                return (
                  <li
                    key={l.href}
                    className="overflow-hidden"
                    style={{ lineHeight: 1, paddingTop: "0.14em", marginTop: "-0.14em" }}
                  >
                    <span
                      className="hero-rise block will-change-transform"
                      style={{ animationDelay: `${0.25 + i * 0.09}s` }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`group inline-flex items-baseline gap-4 whitespace-nowrap font-display uppercase leading-[0.94] tracking-[-0.015em] text-[clamp(2.2rem,9.5vw,5.5rem)] transition-colors duration-300 hover:text-orange md:gap-6 ${
                          active ? "text-orange" : ""
                        }`}
                      >
                        <span className="hidden font-mono text-xs tracking-[0.2em] text-paper/40 transition-colors duration-300 group-hover:text-orange sm:inline">
                          0{i + 1}
                        </span>
                        {l.label}
                        {active && (
                          <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange md:h-3 md:w-3" />
                        )}
                      </Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Pied de l'overlay : contact + réseaux */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-6 pb-7 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/60 md:px-12">
            <a href="mailto:rom1@rom1.fr" className="transition-colors hover:text-orange">
              rom1@rom1.fr
            </a>
            <span className="flex gap-4">
              <a
                href="https://www.instagram.com/rom1unik/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-orange"
              >
                Instagram ↗
              </a>
              <a
                href="https://www.youtube.com/@rom1unik"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden transition-colors hover:text-orange sm:inline"
              >
                YouTube ↗
              </a>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
