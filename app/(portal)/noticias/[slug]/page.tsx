import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedBySlug } from "@/lib/content/public-queries";
import { RichText } from "@/components/portal/rich-text";
import { VideoEmbed } from "@/components/portal/video-embed";
import { SocialShareButtons } from "@/components/admin/social-share-buttons";

export default async function NoticiaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const noticia = await getPublishedBySlug("news", slug);
  if (!noticia) notFound();

  const gallery: string[] = Array.isArray(noticia.gallery_urls) ? noticia.gallery_urls : [];

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex gap-3 items-center text-[11px] font-bold uppercase tracking-wide">
          {noticia.category_name && <span className="text-gold">{noticia.category_name}</span>}
          {noticia.published_at && (
            <time dateTime={noticia.published_at} className="text-foreground/50 font-normal">
              {new Date(noticia.published_at).toLocaleDateString("pt-BR")}
            </time>
          )}
        </div>
        <h1 className="font-display text-4xl text-primary">{noticia.title}</h1>
        {noticia.author && <span className="text-sm text-foreground/60">Por {noticia.author}</span>}
        {noticia.excerpt && <p className="text-lg text-foreground/70">{noticia.excerpt}</p>}
      </header>

      {noticia.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={noticia.cover_url} alt={noticia.title} className="w-full aspect-[3/2] object-cover" />
      )}

      {noticia.content && <RichText html={noticia.content} />}

      {noticia.video_url && <VideoEmbed url={noticia.video_url} title={noticia.title} />}

      {gallery.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {gallery.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="w-full aspect-[4/3] object-cover" loading="lazy" />
          ))}
        </div>
      )}

      {noticia.pdf_url && (
        <a href={noticia.pdf_url} target="_blank" rel="noreferrer" className="text-sm font-bold underline text-primary w-fit">
          📄 Baixar documento
        </a>
      )}

      <SocialShareButtons slug={noticia.slug} status={noticia.status} />

      <Link href="/noticias" className="text-sm font-bold underline text-primary">
        ← Todas as notícias
      </Link>
    </article>
  );
}
