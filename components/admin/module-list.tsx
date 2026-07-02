"use client";

import { useRouter } from "next/navigation";
import { ContentTable } from "./content-table";

// Ponte client entre as list pages (server components) e a ContentTable:
// server components não podem passar callbacks inline (onEdit) para client
// components no Next 16 — só Server Actions serializam. Aqui o onEdit vira
// navegação client-side a partir de basePath, e as actions passam direto.
export function ModuleList<T extends { id: string; status: string }>({
  rows,
  titleKey,
  columns,
  basePath,
  onDuplicate,
  onDelete,
}: {
  rows: T[];
  titleKey: keyof T & string;
  columns: { key: keyof T & string; label: string }[];
  basePath: string;
  onDuplicate: (id: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const router = useRouter();
  return (
    <ContentTable
      rows={rows}
      titleKey={titleKey}
      columns={columns}
      onEdit={(id) => router.push(`${basePath}/${id}`)}
      onDuplicate={(id) => void onDuplicate(id)}
      onDelete={(id) => void onDelete(id)}
    />
  );
}
