import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedBySlug } from "@/lib/content/public-queries";
import { itemMetadata } from "@/lib/content/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublishedBySlug("albuns", slug);
  return item ? itemMetadata(item) : {};
}
import { VideoEmbed } from "@/components/portal/video-embed";
import { GalleryCarousel } from "@/components/portal/gallery-carousel";

export default async function AlbumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getPublishedBySlug("albuns", slug);
  if (!album) notFound();

  const gallery: string[] = Array.isArray(album.gallery_urls) ? album.gallery_urls : [];
  const videos: string[] = Array.isArray(album.video_urls) ? album.video_urls : [];

  return (
    <article className="mx-auto max-w-5xl px-5 py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex gap-3 items-center text-[11px] font-bold uppercase tracking-wide">
          {album.category_name && <span className="text-gold">{album.category_name}</span>}
          {album.date && (
            <time className="text-foreground/50 font-normal">
              {new Date(`${album.date}T12:00:00`).toLocaleDateString("pt-BR")}
            </time>
          )}
        </div>
        <h1 className="font-display text-4xl text-primary">{album.title}</h1>
        {album.description && <p className="text-lg text-foreground/70 max-w-2xl">{album.description}</p>}
      </header>

      {gallery.length === 0 && videos.length === 0 ? (
        <p className="text-foreground/60 py-8">Este álbum ainda não tem fotos ou vídeos.</p>
      ) : (
        <>
          <GalleryCarousel urls={gallery} alt={album.title} />
          {videos.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {videos.map((url, i) => (
                <VideoEmbed key={i} url={url} title={`${album.title} — vídeo ${i + 1}`} />
              ))}
            </div>
          )}
        </>
      )}

      <Link href="/comunidade" className="text-sm font-bold underline text-primary">
        ← Todos os álbuns
      </Link>
    </article>
  );
}
