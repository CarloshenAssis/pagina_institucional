"use client";

import { Button } from "@/components/ui/button";

type Action = "rascunho" | "despublicado" | "arquivado" | "publicar";

export function StatusActionsBar({
  scheduledAt,
  onAction,
}: {
  scheduledAt: string | null;
  onAction: (action: Action, scheduledAt: string | null) => void;
}) {
  const isFutureScheduled = !!scheduledAt && new Date(scheduledAt).getTime() > Date.now();

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => onAction("rascunho", null)}>
          Salvar rascunho
        </Button>
        <Button variant="outline" onClick={() => onAction("arquivado", null)}>
          Arquivar
        </Button>
        <Button variant="outline" onClick={() => onAction("despublicado", null)}>
          Despublicar
        </Button>
      </div>
      <Button onClick={() => onAction("publicar", scheduledAt)}>
        {isFutureScheduled ? "Agendar →" : "Publicar →"}
      </Button>
    </div>
  );
}
