export type ContentStatus = "rascunho" | "publicado" | "despublicado" | "arquivado" | "agendado";

export const STATUS_LABELS: Record<ContentStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  despublicado: "Despublicado",
  arquivado: "Arquivado",
  agendado: "Agendado",
};

export function nextStatusOnPublish(
  scheduledAtInput: string | null,
  now: Date = new Date()
): { status: ContentStatus; scheduled_at: string | null; published_at: string | null } {
  if (!scheduledAtInput) return { status: "publicado", scheduled_at: null, published_at: now.toISOString() };
  const target = new Date(scheduledAtInput);
  if (target.getTime() <= now.getTime()) {
    return { status: "publicado", scheduled_at: null, published_at: now.toISOString() };
  }
  return { status: "agendado", scheduled_at: scheduledAtInput, published_at: null };
}
