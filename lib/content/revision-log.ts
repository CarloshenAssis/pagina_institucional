export interface RevisionEntry {
  changed_fields: Record<string, { from: unknown; to: unknown }>;
  changed_at: string;
}

export function formatRevisionSummary(entry: RevisionEntry): string {
  const fields = Object.keys(entry.changed_fields).join(", ");
  const date = new Date(entry.changed_at);
  const formatted = date
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
  return `${fields} — ${formatted}`;
}
