import Link from "next/link";
import Image from "next/image";

function CardImage({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative aspect-[3/2] bg-primary/10 overflow-hidden">
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
      )}
    </div>
  );
}

const STAGE_LABELS: Record<string, string> = {
  proposto: "Proposto",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

export function ProjectCard({
  project,
}: {
  project: {
    slug: string;
    title: string;
    excerpt: string | null;
    cover_url: string | null;
    project_stage: string;
    category_name?: string | null;
  };
}) {
  return (
    <Link href={`/projetos/${project.slug}`} className="group bg-white border flex flex-col hover:shadow-lg transition-shadow">
      <CardImage src={project.cover_url} alt={project.title} />
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex gap-2 items-center text-[11px] font-bold uppercase tracking-wide">
          {project.category_name && <span className="text-gold">{project.category_name}</span>}
          <span className="px-2 py-0.5 bg-accent text-primary">{STAGE_LABELS[project.project_stage] ?? project.project_stage}</span>
        </div>
        <h3 className="font-display text-lg text-primary group-hover:underline">{project.title}</h3>
        {project.excerpt && <p className="text-sm text-foreground/70 line-clamp-3">{project.excerpt}</p>}
      </div>
    </Link>
  );
}

export function NewsCard({
  news,
  featured = false,
}: {
  news: {
    slug: string;
    title: string;
    excerpt: string | null;
    cover_url: string | null;
    published_at: string | null;
    category_name?: string | null;
  };
  featured?: boolean;
}) {
  return (
    <Link
      href={`/noticias/${news.slug}`}
      className={`group bg-white border flex flex-col hover:shadow-lg transition-shadow ${featured ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <CardImage src={news.cover_url} alt={news.title} />
      <div className="p-5 flex flex-col gap-2">
        <div className="flex gap-3 text-[11px] font-bold uppercase tracking-wide">
          {news.category_name && <span className="text-gold">{news.category_name}</span>}
          {news.published_at && (
            <time dateTime={news.published_at} className="text-foreground/50 font-normal">
              {new Date(news.published_at).toLocaleDateString("pt-BR")}
            </time>
          )}
        </div>
        <h3 className={`font-display text-primary group-hover:underline ${featured ? "text-2xl" : "text-lg"}`}>{news.title}</h3>
        {news.excerpt && <p className="text-sm text-foreground/70 line-clamp-2">{news.excerpt}</p>}
      </div>
    </Link>
  );
}

export function IdeaCard({
  idea,
}: {
  idea: { slug: string; title: string; excerpt: string | null; category_name?: string | null; author: string | null };
}) {
  return (
    <Link href={`/ideias/${idea.slug}`} className="group bg-white border p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow">
      {idea.category_name && (
        <span className="text-[11px] font-bold uppercase tracking-wide text-gold">{idea.category_name}</span>
      )}
      <h3 className="font-display text-xl text-primary group-hover:underline">{idea.title}</h3>
      {idea.excerpt && <p className="text-sm text-foreground/70 line-clamp-3">{idea.excerpt}</p>}
      {idea.author && <span className="text-xs text-foreground/50 mt-auto">Por {idea.author}</span>}
    </Link>
  );
}

export function EventCard({
  event,
}: {
  event: { id: string; title: string; date: string; location: string | null };
}) {
  const d = new Date(event.date);
  return (
    <div className="bg-white border p-5 flex gap-4 items-center">
      <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary text-primary-foreground shrink-0">
        <span className="font-display text-2xl leading-none">{d.getDate()}</span>
        <span className="text-[10px] uppercase">{d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <h3 className="font-display text-lg text-primary truncate">{event.title}</h3>
        <span className="text-sm text-foreground/60">
          {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          {event.location ? ` · ${event.location}` : ""}
        </span>
      </div>
    </div>
  );
}
