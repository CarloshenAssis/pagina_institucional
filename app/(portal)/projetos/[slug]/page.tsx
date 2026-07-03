import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getPublishedBySlug } from "@/lib/content/public-queries";
import { itemMetadata } from "@/lib/content/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublishedBySlug("projects", slug);
  return item ? itemMetadata(item) : {};
}
import { RichText } from "@/components/portal/rich-text";
import { VideoEmbed } from "@/components/portal/video-embed";
import { ProjectCard } from "@/components/portal/cards";

const STAGE_LABELS: Record<string, string> = {
  proposto: "Proposto",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

export default async function ProjetoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projeto = await getPublishedBySlug("projects", slug);
  if (!projeto) notFound();

  const supabase = await createClient();
  const { data: relacionados } = projeto.category_id
    ? await supabase
        .from("projects")
        .select("*, categories(name)")
        .eq("status", "publicado")
        .is("deleted_at", null)
        .eq("category_id", projeto.category_id)
        .neq("id", projeto.id)
        .limit(3)
    : { data: [] };

  const gallery: string[] = Array.isArray(projeto.gallery_urls) ? projeto.gallery_urls : [];

  return (
    <article className="mx-auto max-w-4xl px-5 py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex gap-2 items-center text-[11px] font-bold uppercase tracking-wide">
          {projeto.category_name && <span className="text-gold">{projeto.category_name}</span>}
          <span className="px-2 py-0.5 bg-accent text-primary">
            {STAGE_LABELS[projeto.project_stage] ?? projeto.project_stage}
          </span>
        </div>
        <h1 className="font-display text-4xl text-primary">{projeto.title}</h1>
        {projeto.excerpt && <p className="text-lg text-foreground/70">{projeto.excerpt}</p>}
      </header>

      {projeto.cover_url && (
        <div className="relative aspect-[3/2]">
          <Image src={projeto.cover_url} alt={projeto.title} fill sizes="896px" className="object-cover" priority />
        </div>
      )}

      {projeto.description && <RichText html={projeto.description} />}

      {projeto.video_url && <VideoEmbed url={projeto.video_url} title={projeto.title} />}

      {gallery.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {gallery.map((url, i) => (
            <div key={i} className="relative aspect-[4/3]">
              <Image src={url} alt="" fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {projeto.pdf_url && (
        <a href={projeto.pdf_url} target="_blank" rel="noreferrer" className="text-sm font-bold underline text-primary w-fit">
          📄 Baixar documento do projeto
        </a>
      )}

      {(relacionados ?? []).length > 0 && (
        <footer className="border-t pt-8 mt-4">
          <h2 className="font-display text-2xl text-primary mb-6">Projetos relacionados</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {(relacionados ?? []).map((r) => (
              <ProjectCard
                key={r.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                project={{ ...r, category_name: (r.categories as any)?.name ?? null } as any}
              />
            ))}
          </div>
        </footer>
      )}

      <Link href="/projetos" className="text-sm font-bold underline text-primary">
        ← Todos os projetos
      </Link>
    </article>
  );
}
