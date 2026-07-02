"use client";

export function SocialShareButtons({ slug, status }: { slug: string; status: string }) {
  if (status !== "publicado") return null;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/noticias/${slug}`;
  return (
    <div className="flex gap-3 items-center">
      <span className="text-xs font-bold uppercase text-muted-foreground">Compartilhar</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs underline"
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs underline"
      >
        Facebook
      </a>
      <button type="button" className="text-xs underline" onClick={() => navigator.clipboard.writeText(url)}>
        Copiar link
      </button>
    </div>
  );
}
