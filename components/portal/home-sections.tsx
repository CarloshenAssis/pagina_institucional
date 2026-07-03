import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { ProjectCard, NewsCard, IdeaCard, EventCard } from "./cards";

type Row = Record<string, unknown> & { id: string };

export function HeroSection({ config }: { config: Record<string, string | null> }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28 grid gap-10 md:grid-cols-2 items-center">
        <div className="flex flex-col gap-5">
          {config.hero_slogan && (
            <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-secondary">
              <span className="inline-block w-8 h-px bg-secondary" aria-hidden />
              {config.hero_slogan}
            </span>
          )}
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            {config.hero_title ?? "Bem-vindo"}
          </h1>
          {config.hero_subtitle && <p className="text-primary-foreground/80 text-lg max-w-md">{config.hero_subtitle}</p>}
          <div className="flex gap-3 flex-wrap">
            {config.hero_btn1_text && config.hero_btn1_url && (
              <Link
                href={config.hero_btn1_url}
                className="px-6 py-3 text-sm font-bold text-white"
                style={{ backgroundColor: "var(--rose, #E8327C)" }}
              >
                {config.hero_btn1_text}
              </Link>
            )}
            {config.hero_btn2_text && config.hero_btn2_url && (
              <Link
                href={config.hero_btn2_url}
                className="px-6 py-3 text-sm font-bold border border-primary-foreground/40 hover:bg-primary-foreground/10"
              >
                {config.hero_btn2_text}
              </Link>
            )}
          </div>
        </div>
        {config.hero_photo_url && (
          <div className="relative aspect-[4/5] shadow-[24px_24px_0_0_rgba(0,0,0,0.25)]">
            <Image
              src={config.hero_photo_url}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function SobreSection({ sobre }: { sobre: { title: string | null; subtitle: string | null; text_content: string | null; photo_url: string | null } | null }) {
  if (!sobre?.text_content && !sobre?.title) return null;
  const excerpt = (sobre.text_content ?? "").replace(/<[^>]+>/g, " ").trim().slice(0, 280);
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[2fr_3fr] items-center">
          {sobre.photo_url && (
            <div className="relative aspect-[4/5]">
              <Image src={sobre.photo_url} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          )}
          <div>
            <SectionHeading eyebrow="Sobre" title={sobre.title ?? "Sobre"} subtitle={sobre.subtitle ?? undefined} />
            {excerpt && <p className="text-foreground/80 mb-6">{excerpt}…</p>}
            <Link href="/sobre" className="text-sm font-bold underline text-primary">
              Conhecer a história completa →
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function ProjetosSection({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <SectionHeading eyebrow="Projetos" title="Projetos em destaque" />
        <div className="grid gap-6 md:grid-cols-3">
          {rows.map((p) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <ProjectCard key={p.id} project={p as any} />
          ))}
        </div>
        <Link href="/projetos" className="inline-block mt-8 text-sm font-bold underline text-primary">
          Ver todos os projetos →
        </Link>
      </Reveal>
    </section>
  );
}

export function ComunidadeSection({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="bg-white border-y">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <SectionHeading eyebrow="Comunidade" title="Momentos com a comunidade" />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {rows.map((a) => (
              <Link key={a.id} href={`/comunidade/${a.slug}`} className="group relative aspect-square bg-primary/10 overflow-hidden">
                {typeof a.cover_url === "string" && a.cover_url && (
                  <Image
                    src={a.cover_url}
                    alt={String(a.title)}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-primary/80 text-primary-foreground text-xs font-bold p-2 truncate">
                  {String(a.title)}
                </span>
              </Link>
            ))}
          </div>
          <Link href="/comunidade" className="inline-block mt-8 text-sm font-bold underline text-primary">
            Ver todos os álbuns →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function IdeiasSection({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <SectionHeading eyebrow="Ideias" title="Ideias em destaque" />
        <div className="grid gap-6 md:grid-cols-2">
          {rows.map((i) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <IdeaCard key={i.id} idea={i as any} />
          ))}
        </div>
        <Link href="/ideias" className="inline-block mt-8 text-sm font-bold underline text-primary">
          Ver todas as ideias →
        </Link>
      </Reveal>
    </section>
  );
}

export function NoticiasSection({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null;
  const [destaque, ...outras] = rows;
  return (
    <section className="bg-white border-y">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <SectionHeading eyebrow="Notícias" title="Últimas notícias" />
          <div className="grid gap-6 md:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <NewsCard news={destaque as any} featured />
            {outras.slice(0, 3).map((n) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <NewsCard key={n.id} news={n as any} />
            ))}
          </div>
          <Link href="/noticias" className="inline-block mt-8 text-sm font-bold underline text-primary">
            Ver todas as notícias →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function AgendaSection({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <SectionHeading eyebrow="Agenda" title="Próximos compromissos" />
        <div className="grid gap-4 md:grid-cols-3">
          {rows.map((e) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <EventCard key={e.id} event={e as any} />
          ))}
        </div>
        <Link href="/agenda" className="inline-block mt-8 text-sm font-bold underline text-primary">
          Ver agenda completa →
        </Link>
      </Reveal>
    </section>
  );
}

export function ContatoSection({ settings }: { settings: Record<string, string | null> }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-16 flex flex-col md:flex-row md:items-center gap-8 justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl">Vamos conversar?</h2>
          <div className="text-primary-foreground/80 text-sm flex flex-col gap-1">
            {settings.contact_email && <span>{settings.contact_email}</span>}
            {settings.contact_phone && <span>{settings.contact_phone}</span>}
            {settings.address && <span>{settings.address}</span>}
          </div>
        </div>
        <Link
          href="/contato"
          className="px-8 py-4 text-sm font-bold text-white shrink-0 w-fit"
          style={{ backgroundColor: "var(--rose, #E8327C)" }}
        >
          Enviar mensagem →
        </Link>
      </div>
    </section>
  );
}
