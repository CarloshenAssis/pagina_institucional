"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { NAV_SECTIONS } from "@/lib/content/nav-config";
import { cn } from "@/lib/utils";

function itemClasses(active: boolean) {
  return cn(
    "flex items-center gap-3 px-6 py-2.5 text-sm font-medium border-l-2",
    active
      ? "text-white bg-white/5 border-secondary"
      : "text-white/55 border-transparent hover:text-white/80"
  );
}

export function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));

  return (
    <nav className="w-60 shrink-0 bg-primary flex flex-col py-6 overflow-y-auto">
      <div className="px-6 pb-5 mb-3 border-b border-white/10">
        <span className="font-display font-semibold text-white">Painel</span>
      </div>
      {NAV_SECTIONS.map((section) => (
        <div key={section.label ?? "root"}>
          {section.label && (
            <span className="px-6 pt-4 pb-1.5 block text-[10px] font-bold tracking-wide uppercase text-white/35">
              {section.label}
            </span>
          )}
          {section.items.map((item) => (
            <Link key={item.href} href={item.href} className={itemClasses(isActive(item.href))}>
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
      <div className="mt-auto pt-3 border-t border-white/10">
        <Link href="/admin/perfil" className={itemClasses(isActive("/admin/perfil"))}>
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
  );
}
