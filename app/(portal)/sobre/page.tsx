export const metadata = { title: "Sobre" };

import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/portal/section-heading";
import { RichText } from "@/components/portal/rich-text";
import { VideoEmbed } from "@/components/portal/video-embed";
import { GalleryCarousel } from "@/components/portal/gallery-carousel";
import { Reveal } from "@/components/portal/reveal";

export default async function SobrePage() {
  const supabase = await createClient();
  const { data: sobre } = await supabase.from("sobre").select("*").eq("id", 1).maybeSingle();

  const values: string[] = Array.isArray(sobre?.values_list) ? sobre.values_list : [];
  const gallery: string[] = Array.isArray(sobre?.gallery_urls) ? sobre.gallery_urls : [];
  const pdfs: string[] = Array.isArray(sobre?.pdf_urls) ? sobre.pdf_urls : [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 flex flex-col gap-16">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[2fr_3fr] items-start">
          {sobre?.photo_url && (
            <div className="relative aspect-[4/5] shadow-[16px_16px_0_0_rgba(27,45,107,0.2)]">
              <Image
                src={sobre.photo_url}
                alt={sobre?.title ?? "Retrato"}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}
          <div>
            <SectionHeading
              eyebrow="Sobre"
              title={sobre?.title ?? "Sobre"}
              subtitle={sobre?.subtitle ?? undefined}
            />
            {sobre?.text_content && <RichText html={sobre.text_content} />}
          </div>
        </div>
      </Reveal>

      {(sobre?.mission_text || sobre?.vision_text) && (
        <Reveal>
          <div className="grid gap-8 md:grid-cols-2">
            {sobre?.mission_text && (
              <div>
                <SectionHeading eyebrow="Propósito" title="Missão" />
                <p className="text-foreground/80 whitespace-pre-line">{sobre.mission_text}</p>
              </div>
            )}
            {sobre?.vision_text && (
              <div>
                <SectionHeading eyebrow="Horizonte" title="Visão" />
                <p className="text-foreground/80 whitespace-pre-line">{sobre.vision_text}</p>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {values.length > 0 && (
        <Reveal>
          <SectionHeading eyebrow="Princípios" title="Valores" />
          <ul className="grid gap-4 md:grid-cols-3">
            {values.map((v, i) => (
              <li key={i} className="bg-card border p-5 font-display text-lg text-primary">
                {v}
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {sobre?.video_url && (
        <Reveal>
          <SectionHeading eyebrow="Vídeo" title="Assista" />
          <VideoEmbed url={sobre.video_url} title="Vídeo de apresentação" />
        </Reveal>
      )}

      {gallery.length > 0 && (
        <Reveal>
          <SectionHeading eyebrow="Galeria" title="Registros" />
          <GalleryCarousel urls={gallery} alt="Registro" />
        </Reveal>
      )}

      {pdfs.length > 0 && (
        <Reveal>
          <SectionHeading eyebrow="Documentos" title="Para baixar" />
          <ul className="flex flex-col gap-2">
            {pdfs.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noreferrer" className="text-sm font-bold underline text-primary">
                  📄 {decodeURIComponent(url.split("/").pop() ?? `Documento ${i + 1}`)}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  );
}
