"use client";

import { useEffect, useState } from "react";

type NavItem = { id: string; label: string };

export default function SiteChrome({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));

    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <>
      {/* Top bar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled ? "bg-ink/80 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
          <a href="#top" className="group flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-paper">
              rom1
            </span>
            <span className="hidden text-xs uppercase tracking-[0.25em] text-muted sm:inline">
              Romain Renoux
            </span>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {items
              .filter((i) => i.id !== "top" && i.id !== "contact")
              .map((i) => (
                <a
                  key={i.id}
                  href={`#${i.id}`}
                  className={`text-xs uppercase tracking-[0.18em] transition-colors hover:text-paper ${
                    active === i.id ? "text-paper" : "text-muted"
                  }`}
                >
                  {i.label}
                </a>
              ))}
            <a
              href="#contact"
              className="rounded-full border border-paper/25 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-paper transition-colors hover:border-accent hover:text-accent"
            >
              Contact
            </a>
          </nav>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="text-xs uppercase tracking-[0.2em] text-paper md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? "Fermer" : "Menu"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-paper/10 bg-ink/95 px-6 py-4 backdrop-blur-md md:hidden">
            {items.filter((i) => i.id !== "top").map((i) => (
              <a
                key={i.id}
                href={`#${i.id}`}
                onClick={() => setMenuOpen(false)}
                className="py-2 text-sm uppercase tracking-[0.18em] text-muted"
              >
                {i.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Right-side progress dots */}
      <nav className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            aria-label={i.label}
            className="group relative flex h-3 w-3 items-center justify-center"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                active === i.id
                  ? "h-3 w-3 bg-accent"
                  : "h-1.5 w-1.5 bg-paper/30 group-hover:bg-paper/60"
              }`}
            />
            <span className="pointer-events-none absolute right-6 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-muted opacity-0 transition-opacity group-hover:opacity-100">
              {i.label}
            </span>
          </a>
        ))}
      </nav>
    </>
  );
}
