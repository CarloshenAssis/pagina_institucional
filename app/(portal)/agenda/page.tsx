export const metadata = { title: "Agenda" };

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { eventJsonLd } from "@/lib/content/jsonld";
import { JsonLd } from "@/components/portal/json-ld";
import { SectionHeading } from "@/components/portal/section-heading";
import { EmptyState } from "@/components/portal/listing";
import { Reveal } from "@/components/portal/reveal";

function EventBlock({
  event,
}: {
  event: {
    id: string;
    title: string;
    date: string;
    location: string | null;
    description: string | null;
    external_url: string | null;
    map_embed_url: string | null;
    image_url: string | null;
  };
}) {
  const d = new Date(event.date);
  return (
    <Reveal>
      <div className="bg-white border p-6 flex flex-col gap-4">
        <div className="flex gap-5 items-start">
          <div className="flex flex-col items-center justify-center w-20 h-20 bg-primary text-primary-foreground shrink-0">
            <span className="font-display text-3xl leading-none">{d.getDate()}</span>
            <span className="text-[11px] uppercase">
              {d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")} {d.getFullYear()}
            </span>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="font-display text-2xl text-primary">{event.title}</h2>
            <span className="text-sm text-foreground/60">
              {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              {event.location ? ` · ${event.location}` : ""}
            </span>
            {event.description && <p className="text-foreground/80 mt-2">{event.description}</p>}
            {event.external_url && (
              <a
                href={event.external_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-sm font-bold underline text-primary w-fit"
              >
                Participar / saber mais →
              </a>
            )}
          </div>
        </div>
        {event.map_embed_url && (
          <iframe
            src={event.map_embed_url}
            title={`Mapa — ${event.title}`}
            className="w-full h-64 border-0"
            loading="lazy"
          />
        )}
      </div>
    </Reveal>
  );
}

export default async function AgendaPage() {
  const supabase = await createClient();

  const { data: setting } = await supabase
    .from("global_settings")
    .select("value")
    .eq("key", "agenda_page_enabled")
    .maybeSingle();
  if (setting?.value !== "true") notFound();

  const nowIso = new Date().toISOString();
  const [{ data: proximos }, { data: passados }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("status", "publicado")
      .is("deleted_at", null)
      .gte("date", nowIso)
      .order("date", { ascending: true }),
    supabase
      .from("events")
      .select("*")
      .eq("status", "publicado")
      .is("deleted_at", null)
      .lt("date", nowIso)
      .order("date", { ascending: false })
      .limit(6),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 flex flex-col gap-12">
      <div>
        <SectionHeading eyebrow="Agenda" title="Próximos compromissos" />
        {(proximos ?? []).length === 0 ? (
          <EmptyState label="Nenhum evento agendado no momento." />
        ) : (
          <div className="flex flex-col gap-6">
            {(proximos ?? []).map((e) => (
              <div key={e.id}>
                <JsonLd data={eventJsonLd(e)} />
                <EventBlock event={e} />
              </div>
            ))}
          </div>
        )}
      </div>

      {(passados ?? []).length > 0 && (
        <div>
          <SectionHeading eyebrow="Histórico" title="Eventos recentes" />
          <div className="flex flex-col gap-6 opacity-80">
            {(passados ?? []).map((e) => (
              <EventBlock key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
