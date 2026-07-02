// Config pura de upload (arquivo irmão do actions.ts — Next 16 não permite
// exports síncronos em arquivos "use server").
import type { MediaItem } from "@/lib/content/media-actions";

export type UploadableType = MediaItem["type"];

// Vídeo: desvio do spec original (que era só link) — upload direto habilitado
// para vídeos curtos; 50MB é o teto por arquivo do plano free do Supabase.
export const MAX_BYTES: Record<UploadableType, number> = {
  imagem: 2 * 1024 * 1024,
  documento: 10 * 1024 * 1024,
  pdf: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
};

export function bucketForType(type: UploadableType): "public-images" | "public-pdfs" | "public-videos" {
  if (type === "imagem") return "public-images";
  if (type === "video") return "public-videos";
  return "public-pdfs";
}

export function validateFileSize(type: UploadableType, sizeBytes: number): boolean {
  return sizeBytes <= MAX_BYTES[type];
}
