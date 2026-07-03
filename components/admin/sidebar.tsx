"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { NAV_SECTIONS } from "@/lib/content/nav-config";
import { cn } from "@/lib/utils";
import { useAdminNav } from "@/lib/admin/nav-context";

function itemClasses(active: boolean) {
  return cn(
    "flex items-center gap-3 px-6 py-2.5 text-sm font-medium border-l-2",
    active
      ? "text-sidebar-foreground bg-sidebar-accent border-secondary"
      : "text-sidebar-foreground/55 border-transparent hover:text-sidebar-foreground/80"
  );
}

export function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const { menuOpen, closeMenu } = useAdminNav();
  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));

  return (
    <>
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col py-6 overflow-y-auto transition-transform duration-200 ease-out",
          "md:static md:z-auto md:w-60 md:shrink-0 md:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-6 pb-5 mb-3 border-b border-sidebar-border">
          <span className="font-display font-semibold text-sidebar-foreground">Painel</span>
        </div>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label ?? "root"}>
            {section.label && (
              <span className="px-6 pt-4 pb-1.5 block text-[10px] font-bold tracking-wide uppercase text-sidebar-foreground/35">
                {section.label}
              </span>
            )}
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={itemClasses(isActive(item.href))}
              >
                {item.label}
                {item.href === "/admin/mensagens" && unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-sidebar-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-sidebar-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
        <div className="mt-auto pt-3 border-t border-sidebar-border">
          <Link href="/admin/perfil" onClick={closeMenu} className={itemClasses(isActive("/admin/perfil"))}>
            Perfil
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className={cn(itemClasses(false), "w-full text-left cursor-pointer")}
            >
              Sair
            </button>
          </form>
        </div>
      </nav>
    </>
  );
}
