"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "../LogoutButton";

type Item = { href: string; label: string; match?: (path: string) => boolean };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Site",
    items: [
      {
        href: "/admin",
        label: "Réalisations",
        match: (p) => p === "/admin" || p.startsWith("/admin/realisations"),
      },
      { href: "/admin/sections", label: "Héros" },
      { href: "/admin/clients", label: "Clients" },
      { href: "/admin/collaborateurs", label: "Collaborateurs" },
    ],
  },
  {
    title: "Compta",
    items: [
      { href: "/admin/compta", label: "Récap factures" },
      { href: "/admin/compta/nouvelle", label: "Nouvelle facture" },
      { href: "/admin/compta/devis", label: "Devis" },
      { href: "/admin/compta/pages-devis", label: "Pages devis" },
      { href: "/admin/compta/clients", label: "Annuaire clients" },
    ],
  },
  {
    title: "Système",
    items: [{ href: "/admin/settings", label: "Réglages" }],
  },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const isActive = (item: Item) =>
    item.match ? item.match(pathname) : pathname === item.href;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-paper/10 bg-coal md:sticky md:top-0 md:h-screen md:w-[220px] md:border-b-0 md:border-r">
      <Link
        href="/admin"
        className="block border-b border-paper/10 px-6 py-5 font-display text-base uppercase tracking-[0.2em]"
      >
        ROM<span className="text-orange">1</span> · Admin
      </Link>

      <nav className="flex-1 overflow-y-auto py-2">
        {SECTIONS.map((section, i) => (
          <div key={section.title} className={i > 0 ? "mt-2 border-t border-paper/10 pt-2" : ""}>
            <p className="px-6 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-paper/30">
              {section.title}
            </p>
            <ul>
              {section.items.map((item) => {
                const active = isActive(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`relative block px-6 py-2 font-mono text-[13px] uppercase tracking-[0.1em] transition-colors ${
                        active
                          ? "bg-white/[0.04] text-orange"
                          : "text-paper/55 hover:bg-white/[0.03] hover:text-paper"
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-y-0 left-0 w-[3px] bg-orange" aria-hidden />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-paper/10 px-6 py-4 font-mono text-[12px]">
        <Link
          href="/"
          className="block font-mono text-[12px] uppercase tracking-[0.1em] text-paper/55 transition-colors hover:text-paper"
        >
          Voir le site ↗
        </Link>
        <p className="truncate font-mono text-[11px] text-paper/35" title={email}>
          {email}
        </p>
        <LogoutButton />
      </div>
    </aside>
  );
}
