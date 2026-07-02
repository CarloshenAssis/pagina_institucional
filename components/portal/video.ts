// Vídeo híbrido (decisão de 2026-07-02): link externo embedável
// (YouTube/Vimeo) OU arquivo hospedado no bucket public-videos.
export type VideoKind = "youtube" | "vimeo" | "arquivo" | "desconhecido";

const FILE_EXT = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

export function videoKind(url: string): VideoKind {
  if (!url) return "desconhecido";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "youtu.be") return "youtube";
    if (host === "vimeo.com" || host === "player.vimeo.com") return "vimeo";
    if (u.pathname.includes("/public-videos/") || FILE_EXT.test(u.pathname)) return "arquivo";
    return "desconhecido";
  } catch {
    return "desconhecido";
  }
}

export function embedUrl(url: string): string | null {
  const kind = videoKind(url);
  try {
    const u = new URL(url);
    if (kind === "youtube") {
      const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (kind === "vimeo") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
