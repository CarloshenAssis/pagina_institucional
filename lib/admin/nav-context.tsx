"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AdminNavContextValue {
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const AdminNavContext = createContext<AdminNavContextValue | null>(null);

export function AdminNavProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AdminNavContext.Provider
      value={{
        menuOpen,
        toggleMenu: () => setMenuOpen((v) => !v),
        closeMenu: () => setMenuOpen(false),
      }}
    >
      {children}
    </AdminNavContext.Provider>
  );
}

export function useAdminNav() {
  const ctx = useContext(AdminNavContext);
  if (!ctx) throw new Error("useAdminNav must be used within AdminNavProvider");
  return ctx;
}
