import type { Metadata } from "next";

export interface SeoItem {
  title: string;
  excerpt?: string | null;
  seo?: { meta_title?: string | null; meta_description?: string | null } | null;
  cover_url?: string | null;
}

// Metadata de páginas de detalhe: seo jsonb do item > campos do próprio item.
// A imagem OG reaproveita a capa (decisão do spec — sem campo separado).
export function itemMetadata(item: SeoItem): Metadata {
  const title = item.seo?.meta_title || item.title;
  const description = item.seo?.meta_description || item.excerpt || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: item.cover_url ? [item.cover_url] : undefined,
    },
  };
}
