export interface MediaItem {
  id: string;
  filename: string;
  type: "imagem" | "video" | "documento" | "pdf";
}

export function filterMedia<T extends MediaItem>(items: T[], query: string): T[] {
  if (!query) return items;
  return items.filter((i) => i.filename.toLowerCase().includes(query.toLowerCase()));
}
