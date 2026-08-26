"use client";

import { useState } from "react";

/**
 * Trois façons de récupérer un script SQL sans ouvrir le dépôt : le copier
 * directement dans le presse-papier (le cas courant : on le colle dans le SQL
 * Editor), l'ouvrir dans un onglet, ou le télécharger.
 */
export default function SqlLien({
  fichier = "migration_devis_pages.sql",
}: {
  fichier?: string;
}) {
  const base = `/admin/compta/pages-devis/sql?f=${encodeURIComponent(fichier)}`;
  const [etat, setEtat] = useState<"idle" | "busy" | "ok" | "ko">("idle");

  async function copier() {
    setEtat("busy");
    try {
      const res = await fetch(base);
      if (!res.ok) throw new Error(String(res.status));
      await navigator.clipboard.writeText(await res.text());
      setEtat("ok");
      setTimeout(() => setEtat("idle"), 4000);
    } catch {
      setEtat("ko");
    }
  }

  const btn =
    "cursor-pointer border border-paper/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-paper/70 transition-colors hover:border-paper/60 disabled:opacity-40";

  return (
    <span className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={copier} disabled={etat === "busy"} className={btn}>
        {etat === "busy"
          ? "…"
          : etat === "ok"
            ? "Copié ✓ colle dans le SQL Editor"
            : etat === "ko"
              ? "Échec — ouvre le fichier"
              : "Copier le SQL"}
      </button>
      <a href={base} target="_blank" rel="noreferrer" className={btn}>
        Ouvrir ↗
      </a>
      <a href={`${base}&download=1`} className={btn}>
        Télécharger
      </a>
    </span>
  );
}
