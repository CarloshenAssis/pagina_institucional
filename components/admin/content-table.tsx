"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface Column<T> {
  key: keyof T & string;
  label: string;
}

interface Props<T extends { id: string; status: string }> {
  rows: T[];
  titleKey: keyof T & string;
  columns: Column<T>[];
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  publicado: "bg-secondary text-secondary-foreground",
  rascunho: "border border-primary/30 text-primary",
  agendado: "bg-accent/20 text-primary",
  despublicado: "text-muted-foreground",
  arquivado: "text-muted-foreground line-through",
};

export function ContentTable<T extends { id: string; status: string }>({
  rows,
  titleKey,
  columns,
  onEdit,
  onDuplicate,
  onDelete,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const filtered = rows.filter((row) =>
    String(row[titleKey]).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card border">
      <div className="p-4 border-b">
        <Input
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr] px-6 py-3 bg-background text-[10.5px] font-bold uppercase text-muted-foreground">
        <span>Título</span>
        {columns.map((c) => (
          <span key={c.key}>{c.label}</span>
        ))}
      </div>
      {filtered.map((row) => (
        <div
          key={row.id}
          className="flex flex-col gap-2.5 px-4 py-4 border-t md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center md:gap-0 md:px-6"
        >
          <span className="font-semibold">{String(row[titleKey])}</span>
          {columns.map((c) => {
            if (c.key === "status") {
              return (
                <span key="status" className="flex items-center gap-2 md:block">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground md:hidden">
                    {c.label}
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase w-fit px-2.5 py-1 ${STATUS_BADGE[row.status]}`}
                  >
                    {row.status}
                  </span>
                </span>
              );
            }
            return (
              <span key={c.key} className="flex items-center gap-2 md:block">
                <span className="text-[10px] font-bold uppercase text-muted-foreground md:hidden">
                  {c.label}
                </span>
                <span>{String(row[c.key] ?? "—")}</span>
              </span>
            );
          })}
          {confirmingId === row.id ? (
            <div className="flex gap-2.5 items-center">
              <span className="text-xs">Excluir?</span>
              <button
                className="text-xs font-bold text-red-700 underline"
                onClick={() => {
                  onDelete(row.id);
                  setConfirmingId(null);
                }}
              >
                Sim
              </button>
              <button className="text-xs font-bold underline" onClick={() => setConfirmingId(null)}>
                Não
              </button>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <button className="text-xs font-bold underline" onClick={() => onEdit(row.id)}>
                Editar
              </button>
              <button className="text-xs font-bold underline" onClick={() => onDuplicate(row.id)}>
                Duplicar
              </button>
              <button
                className="text-xs font-bold underline text-muted-foreground"
                onClick={() => setConfirmingId(row.id)}
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
