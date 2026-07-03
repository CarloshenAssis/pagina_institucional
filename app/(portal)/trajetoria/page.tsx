export const metadata = { title: "Trajetória" };

import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/portal/section-heading";
import { VideoEmbed } from "@/components/portal/video-embed";
import { Reveal } from "@/components/portal/reveal";

export default async function TrajetoriaPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("trajetoria_items")
    .select("*")
    .eq("status", "publicado")
    .is("deleted_at", null)
    .order("order_index", { ascending: true })
    .order("year", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <SectionHeading
        eyebrow="Trajetória"
        title="Uma história de trabalho"
        subtitle="Os marcos que construíram este caminho."
      />
      {(items ?? []).length === 0 ? (
        <p className="text-foreground/60 py-12">Nenhuma etapa publicada ainda.</p>
      ) : (
        <ol className="relative border-l-2 border-secondary/60 ml-4 flex flex-col gap-12 py-4">
          {(items ?? []).map((item) => (
            <li key={item.id} className="relative pl-10">
              <span
                className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-secondary border-4 border-background"
                aria-hidden
              />
              <Reveal>
                <span className="font-display text-3xl text-gold">{item.year}</span>
                <h2 className="font-display text-2xl text-primary mt-1">{item.title}</h2>
                {item.description && <p className="text-foreground/80 mt-2 max-w-2xl">{item.description}</p>}
                {item.image_url && (
                  <div className="relative mt-4 w-full max-w-xl aspect-[3/2]">
                    <Image src={item.image_url} alt={item.title} fill sizes="576px" className="object-cover" />
                  </div>
                )}
                {item.video_url && (
                  <div className="mt-4 max-w-xl">
                    <VideoEmbed url={item.video_url} title={item.title} />
                  </div>
                )}
                {item.document_url && (
                  <a
                    href={item.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-sm font-bold underline text-primary"
                  >
                    📄 Ver documento
                  </a>
                )}
              </Reveal>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
