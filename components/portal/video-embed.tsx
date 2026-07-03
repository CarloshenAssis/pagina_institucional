import { videoKind, embedUrl } from "./video";

export function VideoEmbed({ url, title }: { url: string; title?: string }) {
  const kind = videoKind(url);

  if (kind === "arquivo") {
    return (
      <video controls preload="metadata" className="w-full aspect-video bg-primary/5">
        <source src={url} />
        Seu navegador não suporta a reprodução deste vídeo.
      </video>
    );
  }

  const src = embedUrl(url);
  if (!src) return null;

  return (
    <div className="relative w-full aspect-video">
      <iframe
        src={src}
        title={title ?? "Vídeo"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
}
