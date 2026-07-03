import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPublishedBySlug } from "@/lib/content/public-queries";
import { itemMetadata } from "@/lib/content/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublishedBySlug("ideas", slug);
  return item ? itemMetadata(item) : {};
}
import { RichText } from "@/components/portal/rich-text";
import { VideoEmbed } from "@/components/portal/video-embed";

export default async function IdeiaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ideia = await getPublishedBySlug("ideas", slug);
  if (!ideia) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        {ideia.category_name && (
          <span className="text-[11px] font-bold uppercase tracking-wide text-gold">{ideia.category_name}</span>
        )}
        <h1 className="font-display text-4xl text-primary">{ideia.title}</h1>
        {ideia.author && <span className="text-sm text-foreground/60">Por {ideia.author}</span>}
        {ideia.excerpt && <p className="text-lg text-foreground/70">{ideia.excerpt}</p>}
      </header>

      {ideia.cover_url && (
        <div className="relative aspect-[3/2]">
          <Image src={ideia.cover_url} alt={ideia.title} fill sizes="768px" className="object-cover" priority />
        </div>
      )}

      {ideia.content && <RichText html={ideia.content} />}

      {ideia.video_url && <VideoEmbed url={ideia.video_url} title={ideia.title} />}

      {ideia.pdf_url && (
        <a href={ideia.pdf_url} target="_blank" rel="noreferrer" className="text-sm font-bold underline text-primary w-fit">
          📄 Baixar documento
        </a>
      )}

      <Link href="/ideias" className="text-sm font-bold underline text-primary">
        ← Todas as ideias
      </Link>
    </article>
  );
}
