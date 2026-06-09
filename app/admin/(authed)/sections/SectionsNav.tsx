"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "./sections";

const GROUPS = ["Métiers", "Univers"] as const;

export default function SectionsNav() {
  const path = usePathname();
  return (
    <nav className="space-y-7 self-start lg:sticky lg:top-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-tight">Hero des sections</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-paper/40">
          Image / vidéo + textes
        </p>
      </div>
      {GROUPS.map((g) => (
        <div key={g}>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-orange">{g}</p>
          <ul className="space-y-1">
            {SECTIONS.filter((s) => s.group === g).map((s) => {
              const active = path === `/admin/sections/${s.routeId}`;
              return (
                <li key={s.routeId}>
                  <Link
                    href={`/admin/sections/${s.routeId}`}
                    className={`block rounded-lg px-3 py-2 font-mono text-sm uppercase tracking-[0.08em] transition-colors ${
                      active
                        ? "bg-orange/15 text-orange"
                        : "text-paper/55 hover:bg-white/[0.04] hover:text-paper"
                    }`}
                  >
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
