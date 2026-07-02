"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { albumSchema, type AlbumInput } from "@/lib/validations/comunidade";
import { saveAlbum, setAlbumStatus } from "../actions";
import { StatusActionsBar } from "@/components/admin/status-actions-bar";
import { RevisionHistory } from "@/components/admin/revision-history";
import { MediaPicker } from "@/components/admin/media-picker";
import { MediaListField } from "@/components/admin/media-list-field";
import { CategoryCombobox } from "@/components/admin/category-combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/admin/topbar";

export function AlbumForm({ id, initial }: { id: string | null; initial?: Partial<AlbumInput> }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: "",
      gallery_urls: [],
      video_urls: [],
      seo: {},
      ...initial,
    },
  });

  // handleSubmit resolve com undefined, então o id salvo é capturado fora.
  const onSave = async (): Promise<string | null> => {
    let savedId: string | null = id;
    await handleSubmit(async (data) => {
      savedId = await saveAlbum(id, data);
    })();
    return savedId;
  };

  const metaDescription = watch("seo.meta_description") ?? "";

  return (
    <>
      <Topbar title={id ? "Editar galeria" : "Nova galeria"} />
      <div className="p-9 max-w-3xl flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Título</Label>
          <Input id="title" {...register("title")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug (deixe em branco para gerar do título)</Label>
          <Input id="slug" {...register("slug")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Categoria</Label>
          <CategoryCombobox
            module="comunidade"
            value={watch("category_id") ?? null}
            onChange={(categoryId) => setValue("category_id", categoryId || null)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" {...register("description")} />
        </div>
        <MediaPicker
          type="imagem"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar capa</button>}
          onSelect={(m) => setValue("cover_url", m.url)}
        />
        <MediaListField
          label="Galeria de fotos"
          type="imagem"
          urls={watch("gallery_urls") ?? []}
          onChange={(urls) => setValue("gallery_urls", urls)}
        />
        <MediaListField
          label="Vídeos"
          type="video"
          urls={watch("video_urls") ?? []}
          onChange={(urls) => setValue("video_urls", urls)}
        />
        <fieldset className="flex flex-col gap-3 border p-4">
          <legend className="text-xs font-bold uppercase text-muted-foreground px-1">SEO</legend>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input id="meta_title" {...register("seo.meta_title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea id="meta_description" maxLength={160} {...register("seo.meta_description")} />
            <span className="text-xs text-muted-foreground">{metaDescription.length}/160</span>
          </div>
        </fieldset>
        {id && <RevisionHistory table="albuns" recordId={id} />}
        <StatusActionsBar
          scheduledAt={null}
          onAction={async (action, scheduledAt) => {
            const savedId = await onSave();
            if (savedId && action !== "rascunho") await setAlbumStatus(savedId, action, scheduledAt);
            router.push("/admin/comunidade");
          }}
        />
      </div>
    </>
  );
}
