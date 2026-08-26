"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Le document du devis est un HTML complet (celui qu'on envoie aussi en PDF).
 * On l'affiche dans une iframe `srcdoc` : ses styles restent chez lui et ne
 * viennent pas repeindre le site. L'iframe est same-origin, donc on peut lire
 * la hauteur du document et la reporter sur le cadre — pas de barre de défilement
 * interne, le devis se lit d'une traite comme le reste de la page.
 *
 * La mesure est répétée pendant trois secondes après le montage : selon le
 * moment où l'iframe finit de charger, l'événement `load` peut être passé avant
 * qu'on ait pu l'écouter, et les polices Google font encore bouger la hauteur
 * après. Ensuite, un ResizeObserver suffit.
 */
export default function DevisDocument({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(700);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;

    let observer: ResizeObserver | null = null;
    let timer = 0;
    let tries = 0;

    const measure = () => {
      const doc = frame.contentDocument;
      if (!doc?.body) return;
      const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
      if (h > 0) setHeight(h);
    };

    const observe = () => {
      const doc = frame.contentDocument;
      if (!doc?.body || observer) return;
      observer = new ResizeObserver(measure);
      observer.observe(doc.body);
      doc.fonts?.ready.then(measure).catch(() => {});
    };

    const tick = () => {
      measure();
      observe();
      if (++tries < 60) timer = window.setTimeout(tick, 50);
    };

    tick();
    frame.addEventListener("load", tick);

    return () => {
      window.clearTimeout(timer);
      frame.removeEventListener("load", tick);
      observer?.disconnect();
    };
  }, [html]);

  return (
    <iframe
      ref={ref}
      title="Document du devis"
      srcDoc={html}
      className="w-full border-0 bg-white"
      style={{ height }}
      scrolling="no"
    />
  );
}
