"use client";

import { MediaPicker } from "./media-picker";
import type { MediaItem } from "@/lib/content/media-actions";

// Campo de lista de mídias (galeria de fotos, vídeos): acumula URLs
// escolhidas no MediaPicker e permite remover itens.
export function MediaListField({
  label,
  type,
  urls,
  onChange,
}: {
  label: string;
  type: MediaItem["type"];
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {urls.length > 0 && (
        <ul className="flex flex-col gap-1">
          {urls.map((url, i) => (
            <li key={`${url}-${i}`} className="flex items-center gap-2 text-xs">
              <span className="truncate flex-1">{url}</span>
              <button
                type="button"
                className="font-bold underline text-muted-foreground shrink-0"
                onClick={() => onChange(urls.filter((_, j) => j !== i))}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
      <MediaPicker
        type={type}
        trigger={<button type="button" className="text-sm underline w-fit">+ Adicionar</button>}
        onSelect={(m) => onChange([...urls, m.url])}
      />
    </div>
  );
}
