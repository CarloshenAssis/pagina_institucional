export type ContentStatus = "rascunho" | "publicado" | "despublicado" | "arquivado" | "agendado";

export const STATUS_LABELS: Record<ContentStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  despublicado: "Despublicado",
  arquivado: "Arquivado",
  agendado: "Agendado",
};

export function nextStatusOnPublish(
  scheduledAtInput: string | null
): { status: ContentStatus; scheduled_at: string | null } {
  if (!scheduledAtInput) return { status: "publicado", scheduled_at: null };
  const target = new Date(scheduledAtInput);
  if (target.getTime() <= Date.now()) return { status: "publicado", scheduled_at: null };
  return { status: "agendado", scheduled_at: scheduledAtInput };
}
