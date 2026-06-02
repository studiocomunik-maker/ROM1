"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";

/* Transition « rideau » entre les pages :
   1. clic sur un lien interne → l'overlay (logo ROM1, style chargement) monte par le BAS,
   2. une fois couvert, on navigue (la nouvelle page se rend dessous),
   3. au changement de route, l'overlay disparaît vers le HAUT en révélant la page.
   Les clics sont interceptés en phase CAPTURE pour passer avant le <Link> de Next. */

type Phase = "idle" | "covering" | "covered" | "revealing";

const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
const DUR = "0.6s";

const STYLES: Record<Phase, CSSProperties> = {
  idle: { transform: "translateY(100%)", transition: "none", pointerEvents: "none" },
  covering: { transform: "translateY(0%)", transition: `transform ${DUR} ${EASE}`, pointerEvents: "auto" },
  covered: { transform: "translateY(0%)", transition: "none", pointerEvents: "auto" },
  revealing: { transform: "translateY(-100%)", transition: `transform ${DUR} ${EASE}`, pointerEvents: "auto" },
};

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const pending = useRef<string | null>(null);
  const fromPath = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (pending.current) return; // une transition à la fois
      pending.current = href;
      fromPath.current = window.location.pathname;
      setPhase("covering");
    },
    []
  );

  // Interception globale des clics sur liens internes (capture → avant Next Link)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // même page
      e.preventDefault();
      e.stopPropagation();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  // Quand la couverture est terminée → naviguer. Quand la révélation est terminée → idle.
  const onTransitionEnd = () => {
    if (phase === "covering") {
      setPhase("covered");
      if (pending.current) router.push(pending.current);
    } else if (phase === "revealing") {
      pending.current = null;
      fromPath.current = null;
      setPhase("idle");
    }
  };

  // Une fois la nouvelle route montée (pathname changé) et l'écran couvert → révéler.
  useEffect(() => {
    if (phase !== "covered") return;
    if (fromPath.current !== null && pathname === fromPath.current) return; // pas encore navigué
    const id = requestAnimationFrame(() => setPhase("revealing")); // laisse peindre une frame
    const fallback = window.setTimeout(() => setPhase("revealing"), 1500); // sécurité
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(fallback);
    };
  }, [pathname, phase]);

  return (
    <>
      {children}
      <div
        aria-hidden={phase === "idle"}
        onTransitionEnd={onTransitionEnd}
        style={STYLES[phase]}
        className="grain fixed inset-0 z-[100] flex items-center justify-center bg-coal will-change-transform"
      >
        <div className="flex flex-col items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-blanc.png" alt="" className="h-12 w-auto md:h-16" />
          <div className="h-px w-32 overflow-hidden bg-paper/20">
            <div className="loadbar h-full w-full bg-orange" />
          </div>
        </div>
      </div>
    </>
  );
}
