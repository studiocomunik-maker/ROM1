"use client";

import { useEffect, useRef, useState } from "react";

export type ClientItem = {
  name: string;
  logo_url: string | null;
  url: string | null;
};

// Grille « Ils nous font confiance » : toujours 2 lignes, nombre de colonnes
// adapté à la largeur d'écran (plus c'est large, plus il y a de colonnes donc
// de logos). La dernière case « & vous ? » est fixe et ne tourne pas ; les
// logos visibles sont tirés au hasard et un logo s'efface régulièrement pour
// être remplacé par un autre de la réserve.
const ROWS = 2;
const SWAP_INTERVAL = 2600; // ms entre deux rotations
const FADE_MS = 500; // doit matcher la durée de transition CSS
const SSR_COLS = 4; // colonnes au 1er rendu (serveur + hydratation) → stable

// Paliers alignés sur les breakpoints Tailwind (sm/md/lg/xl).
function colsForWidth(w: number): number {
  if (w >= 1280) return 6;
  if (w >= 1024) return 5;
  if (w >= 768) return 4;
  if (w >= 640) return 3;
  return 2;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ClientsGrid({ clients }: { clients: ClientItem[] }) {
  // Nombre de logos voulus = (colonnes × lignes) − 1 case « & vous ? »,
  // borné par le nombre de clients disponibles.
  const wanted = (cols: number) =>
    Math.min(cols * ROWS - 1, clients.length);

  const [cols, setCols] = useState(SSR_COLS);
  // état initial déterministe (slice non mélangée) → pas de mismatch d'hydra.
  const [slots, setSlots] = useState<ClientItem[]>(() =>
    clients.slice(0, wanted(SSR_COLS)),
  );
  const [fading, setFading] = useState<number | null>(null);

  // Sources de vérité hors-render (le swap ne passe jamais par un updater de
  // state, que React peut rejouer deux fois en Strict Mode).
  const slotsRef = useRef<ClientItem[]>(slots);
  const poolRef = useRef<ClientItem[]>(clients.slice(wanted(SSR_COLS)));
  const colsRef = useRef(SSR_COLS);

  // Réajuste le nombre de logos affichés quand le nombre de colonnes change :
  // pioche dans la réserve s'il en faut plus, y renvoie le surplus sinon.
  const reconcile = (nextCols: number) => {
    const desired = wanted(nextCols);
    let s = [...slotsRef.current];
    let pool = [...poolRef.current];
    if (desired > s.length) {
      const add = pool.slice(0, desired - s.length);
      pool = pool.slice(add.length);
      s = [...s, ...add];
    } else if (desired < s.length) {
      const removed = s.slice(desired);
      s = s.slice(0, desired);
      pool = [...pool, ...removed];
    }
    slotsRef.current = s;
    poolRef.current = pool;
    setSlots(s);
  };

  useEffect(() => {
    // mélange initial + colonnes réelles
    const shuffled = shuffle(clients);
    const startCols = colsForWidth(window.innerWidth);
    const desired = wanted(startCols);
    slotsRef.current = shuffled.slice(0, desired);
    poolRef.current = shuffled.slice(desired);
    colsRef.current = startCols;
    setSlots(slotsRef.current);
    setCols(startCols);

    const onResize = () => {
      const next = colsForWidth(window.innerWidth);
      if (next !== colsRef.current) {
        colsRef.current = next;
        setCols(next);
        reconcile(next);
      }
    };
    window.addEventListener("resize", onResize);

    let cancelled = false;
    const id = window.setInterval(() => {
      if (cancelled) return;
      const count = slotsRef.current.length;
      if (count === 0 || poolRef.current.length === 0) return;
      const slotIdx = Math.floor(Math.random() * count);
      setFading(slotIdx); // fondu sortant
      window.setTimeout(() => {
        if (cancelled) return;
        const pool = poolRef.current;
        if (pool.length && slotIdx < slotsRef.current.length) {
          const pickIdx = Math.floor(Math.random() * pool.length);
          const incoming = pool[pickIdx];
          const outgoing = slotsRef.current[slotIdx];
          const next = [...slotsRef.current];
          next[slotIdx] = incoming;
          poolRef.current = [
            ...pool.slice(0, pickIdx),
            ...pool.slice(pickIdx + 1),
            outgoing,
          ];
          slotsRef.current = next;
          setSlots(next); // valeur simple → pas de double-exec
        }
        setFading(null); // fondu entrant
      }, FADE_MS);
    }, SWAP_INTERVAL);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ul
      className="mt-12 grid gap-px border border-coal/10 bg-coal/10"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {slots.map((c, i) => {
        const inner = c.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.logo_url}
            alt={c.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="px-4 text-center font-display text-xs uppercase leading-snug tracking-[0.08em] text-coal/70 sm:text-sm">
            {c.name}
          </span>
        );
        // clé = index de slot (pas le nom) : on garde le même nœud DOM lors
        // d'un swap pour que la transition d'opacité joue.
        return (
          <li key={i} className="bg-white">
            <div
              className="flex aspect-[8/5] items-center justify-center transition-opacity duration-500"
              style={{ opacity: fading === i ? 0 : 1 }}
            >
              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full w-full items-center justify-center"
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </div>
          </li>
        );
      })}

      {/* Case fixe — et vous ? (toujours en dernier, ne tourne pas) */}
      <li className="bg-white">
        <a
          href="mailto:rom1@rom1.fr"
          className="flex aspect-[8/5] items-center justify-center p-4"
        >
          <span className="text-center font-display text-xs uppercase leading-snug tracking-[0.08em] text-orange sm:text-sm">
            &amp; vous&nbsp;?
          </span>
        </a>
      </li>
    </ul>
  );
}
