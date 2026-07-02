"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sobreSchema, type SobreInput } from "@/lib/validations/sobre";
import { saveSobre } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";
import { MediaListField } from "@/components/admin/media-list-field";

export function SobreForm({ initial }: { initial: Partial<SobreInput> }) {
  const { register, handleSubmit, setValue, watch, formState } = useForm({
    resolver: zodResolver(sobreSchema),
    defaultValues: { gallery_urls: [], pdf_urls: [], ...initial },
  });

  return (
    <form onSubmit={handleSubmit(async (data) => saveSobre(data))} className="max-w-3xl flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...register("title")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subtitle">Subtítulo</Label>
        <Input id="subtitle" {...register("subtitle")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="text_content">Texto</Label>
        <Textarea id="text_content" rows={6} {...register("text_content")} />
      </div>
      <MediaPicker
        type="imagem"
        trigger={<button type="button" className="text-sm underline w-fit">Selecionar imagem principal</button>}
        onSelect={(m) => setValue("photo_url", m.url)}
      />
      <MediaListField
        label="Galeria"
        type="imagem"
        urls={watch("gallery_urls") ?? []}
        onChange={(urls) => setValue("gallery_urls", urls)}
      />
      <MediaPicker
        type="video"
        trigger={<button type="button" className="text-sm underline w-fit">Selecionar vídeo</button>}
        onSelect={(m) => setValue("video_url", m.url)}
      />
      <MediaListField
        label="PDFs"
        type="pdf"
        urls={watch("pdf_urls") ?? []}
        onChange={(urls) => setValue("pdf_urls", urls)}
      />
      <Button type="submit" className="w-fit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
