"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { NavItem } from "./nav";

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

export function Header({ siteName, logoUrl, items }: { siteName: string; logoUrl: string | null; items: NavItem[] }) {
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 8, () => false);
  const pathname = usePathname();
  // O menu guarda a rota em que foi aberto: navegar para outra rota o
  // fecha por derivação, sem useEffect (regra react-hooks do Next 16).
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);
  const menuOpen = openMenuPath === pathname;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled || menuOpen ? "bg-background/85 backdrop-blur border-b border-primary/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-display font-semibold text-lg text-primary">
          {logoUrl ? (
            <Image src={logoUrl} alt={siteName} width={140} height={32} className="h-8 w-auto object-contain" />
          ) : (
            siteName
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <form action="/pesquisa" role="search">
            <input
              type="search"
              name="q"
              placeholder="Buscar…"
              aria-label="Buscar no portal"
              className="w-32 focus:w-48 transition-all border-b border-primary/30 bg-transparent px-1 py-1 text-sm outline-none"
            />
          </form>
          {items
            .filter((i) => i.href !== "/contato")
            .map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  pathname === i.href ? "text-primary font-bold" : "text-foreground/80"
                }`}
              >
                {i.label}
              </Link>
            ))}
          <Link
            href="/contato"
            className="text-sm font-bold px-4 py-2 bg-rose text-white rounded-sm hover:opacity-90"
            style={{ backgroundColor: "var(--rose, #E8327C)" }}
          >
            Contato
          </Link>
        </nav>

        <button
          type="button"
          className="lg:hidden text-primary p-2"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setOpenMenuPath(menuOpen ? null : pathname)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-primary/10 bg-background/95 backdrop-blur px-5 py-4 flex flex-col gap-3">
          <form action="/pesquisa" role="search" className="mb-1">
            <input
              type="search"
              name="q"
              placeholder="Buscar…"
              aria-label="Buscar no portal"
              className="w-full border border-primary/20 bg-transparent px-3 py-2 text-sm outline-none rounded-sm"
            />
          </form>
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`text-base ${pathname === i.href ? "font-bold text-primary" : "text-foreground/90"}`}
            >
              {i.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
