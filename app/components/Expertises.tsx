"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { metiers } from "../data";
import type { SceneApi } from "./expertisesScene";

/* Section Métiers de l'accueil : les 5 métiers en index à gauche, et à droite le
   dessin technique filaire du métier survolé (scène three.js chargée à la demande,
   qui occupe tout le fond de la section avec sa grille). Les univers passent au
   second plan : une phrase sous la liste. */

const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";
const UNIV = "border-b transition-colors duration-300 hover:border-orange focus-visible:border-orange focus-visible:outline-none";

// Texte brouillé qui se recompose (légende, détail du métier actif)
const GLYPHS = "#%&*+=/<>_01";
const runs = new WeakMap<HTMLElement, number>();
function scramble(el: HTMLElement | null, text: string, dur = 320) {
  if (!el) return;
  const id = (runs.get(el) ?? 0) + 1;
  runs.set(el, id);
  const start = performance.now();
  const tick = () => {
    if (runs.get(el) !== id) return;
    const p = (performance.now() - start) / dur;
    if (p >= 1) { el.textContent = text; return; }
    el.textContent = [...text].map((ch, i) => (ch === " " || i < p * text.length ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
    requestAnimationFrame(tick);
  };
  tick();
}

export default function Expertises() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const subRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scene = useRef<SceneApi | null>(null);
  const activeRef = useRef(0);
  const lastSwitch = useRef(0);
  const hovering = useRef(false);
  const visible = useRef(false);

  const select = (i: number) => {
    lastSwitch.current = performance.now();
    setActive(i);
  };

  // Scène 3D : three.js n'est chargé que quand la section approche de l'écran.
  // Sans WebGL, la liste reste seule (le cadre de droite garde sa place).
  useEffect(() => {
    const section = sectionRef.current, stage = stageRef.current;
    if (!section || !stage) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false, loading = false;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        scene.current?.setVisible(e.isIntersecting);
        if (!e.isIntersecting || loading) return;
        loading = true;
        import("./expertisesScene").then(({ createExpertisesScene }) => {
          if (cancelled) return;
          try {
            scene.current = createExpertisesScene({ section, stage, keys: metiers.map((m) => m.key), readout: readRef.current, reduce });
          } catch {
            return;
          }
          scene.current.goTo(activeRef.current); // premier dessin tracé à l'arrivée
          scene.current.setVisible(visible.current);
          lastSwitch.current = performance.now();
        });
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);
    return () => {
      cancelled = true;
      io.disconnect();
      scene.current?.destroy();
      scene.current = null;
    };
  }, []);

  // Changement de métier : le dessin se transforme, la légende et le détail se brouillent
  const first = useRef(true);
  useEffect(() => {
    activeRef.current = active;
    scene.current?.goTo(active);
    if (first.current) { first.current = false; return; }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    scramble(labelRef.current, metiers[active].t);
    scramble(subRefs.current[active], metiers[active].sub);
  }, [active]);

  // Défilement automatique tant que personne ne survole la section (utile sur mobile)
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!visible.current || hovering.current || !scene.current) return;
      if (performance.now() - lastSwitch.current < 4800) return;
      lastSwitch.current = performance.now();
      setActive((a) => (a + 1) % metiers.length);
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  const cur = metiers[active];

  return (
    <section
      ref={sectionRef}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") hovering.current = true; }}
      onPointerLeave={() => { hovering.current = false; lastSwitch.current = performance.now(); }}
      className="relative isolate z-10 overflow-hidden bg-coal px-6 py-16 text-paper md:px-12 md:py-28"
    >
      <div className="relative z-[1] mx-auto max-w-[1240px]">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-orange">★ Métiers</p>

        <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <ul className="@container border-b border-paper/15">
              {metiers.map((m, i) => {
                const on = i === active;
                return (
                  <li key={m.key}>
                    <Link
                      href={`/metiers/${m.key}`}
                      onMouseEnter={() => select(i)}
                      onFocus={() => select(i)}
                      className="relative isolate flex flex-col items-start gap-1.5 border-t border-paper/15 pb-3.5 pt-4 focus-visible:outline-none lg:gap-2"
                    >
                      {/* bande noire sous le métier actif : elle se déploie depuis la gauche et masque la grille */}
                      <span
                        aria-hidden
                        className={`absolute inset-0 -z-10 origin-left bg-[#050506] transition-transform duration-500 motion-reduce:transition-none ${EASE} ${on ? "scale-x-100" : "scale-x-0"}`}
                      />
                      {/* titre calé sur la colonne : « IDENTITÉ GRAPHIQUE » (≈11,4 em) tient sur une ligne */}
                      <span
                        className={`whitespace-nowrap font-display uppercase leading-[0.95] tracking-[-0.02em] text-[clamp(1.5rem,7.4vw,2.4rem)] transition-[color,translate] duration-500 lg:text-[clamp(1.5rem,calc(100cqi/12),2.9rem)] ${EASE} ${on ? "text-paper lg:translate-x-3.5" : "text-paper/30"}`}
                      >
                        {m.t}
                      </span>
                      <span
                        ref={(el) => { subRefs.current[i] = el; }}
                        className={`whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] transition-[color,translate] duration-500 ${EASE} ${on ? "text-orange lg:translate-x-3.5" : "text-paper/40"}`}
                      >
                        {m.sub}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Univers : une phrase, au second plan */}
            <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-paper/50 [text-wrap:pretty]">
              Le plus souvent pour le{" "}
              <Link href="/univers/vin" className={`${UNIV} border-orange/50 text-orange`}>vin</Link>, mais aussi pour la{" "}
              <Link href="/univers/sceno" className={`${UNIV} border-paper/25 text-paper/85 hover:text-paper`}>scène</Link>, la{" "}
              <Link href="/univers/art" className={`${UNIV} border-paper/25 text-paper/85 hover:text-paper`}>culture</Link>, l’
              <Link href="/univers/corporate" className={`${UNIV} border-paper/25 text-paper/85 hover:text-paper`}>industrie</Link> et l’
              <Link href="/univers/hotel" className={`${UNIV} border-paper/25 text-paper/85 hover:text-paper`}>hôtellerie</Link>.
            </p>
          </div>

          <aside className="order-first mb-6 lg:order-none lg:mb-0">
            {/* cadre vide : repère de la scène pour placer le dessin */}
            <div ref={stageRef} className="relative mx-auto aspect-[4/3] max-w-[560px] lg:aspect-[5/4] lg:max-w-none">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -bottom-1 flex justify-between whitespace-pre font-mono text-[10px] uppercase tracking-[0.14em] text-paper/40"
              >
                <span>
                  fig. 0{active + 1} <span className="text-orange">/</span> <span ref={labelRef}>{cur.t}</span>
                </span>
                <span ref={readRef} className="hidden lg:inline" />
              </div>
            </div>
            <p className="mt-5 hidden min-h-[6.4em] max-w-[46ch] text-[15px] leading-relaxed text-paper/70 lg:block">{cur.intro}</p>
            <Link
              href={`/metiers/${cur.key}`}
              className="mt-3.5 hidden border-b border-current pb-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-orange lg:inline-block"
            >
              Voir le métier →
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
