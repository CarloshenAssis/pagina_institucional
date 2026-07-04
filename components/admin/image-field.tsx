"use client";

import Image from "next/image";
import { MediaPicker } from "./media-picker";

// Campo de imagem única: mostra a imagem atual (preview), tamanho ideal
// recomendado, e botões Trocar/Remover. Usado em todos os lugares que sobem
// uma imagem (logo, favicon, capa, foto etc.) para o comportamento ser igual.
export function ImageField({
  label,
  hint,
  url,
  onSelect,
  onClear,
}: {
  label: string;
  hint?: string;
  url: string;
  onSelect: (url: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">Tamanho ideal: {hint}</span>}
      <div className="flex items-center gap-3">
        {url ? (
          <Image
            src={url}
            alt={label}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 object-contain border bg-muted shrink-0 rounded"
          />
        ) : (
          <span className="text-xs text-muted-foreground">Nenhuma imagem selecionada</span>
        )}
        <MediaPicker
          type="imagem"
          trigger={
            <button type="button" className="text-sm underline w-fit">
              {url ? "Trocar" : "Selecionar"}
            </button>
          }
          onSelect={(m) => onSelect(m.url)}
        />
        {url && (
          <button
            type="button"
            className="text-sm underline text-destructive w-fit"
            onClick={onClear}
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
