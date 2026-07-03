"use client";

import { useAdminNav } from "@/lib/admin/nav-context";

export function Topbar({ title }: { title: string }) {
  const { toggleMenu } = useAdminNav();

  return (
    <div className="h-[74px] shrink-0 bg-card border-b flex items-center gap-3 px-4 md:px-9 sticky top-0 z-10">
      <button
        type="button"
        onClick={toggleMenu}
        aria-label="Abrir menu"
        className="md:hidden flex flex-col gap-1.5 w-6 shrink-0 p-1 cursor-pointer"
      >
        <span className="block h-0.5 w-full bg-primary" />
        <span className="block h-0.5 w-full bg-primary" />
        <span className="block h-0.5 w-full bg-primary" />
      </button>
      <span className="font-display font-semibold text-lg md:text-xl">{title}</span>
    </div>
  );
}
