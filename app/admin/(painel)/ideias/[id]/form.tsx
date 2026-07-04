"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ideiaSchema, type IdeiaInput } from "@/lib/validations/ideias";
import { saveIdeia, setIdeiaStatus } from "../actions";
import { StatusActionsBar } from "@/components/admin/status-actions-bar";
import { RevisionHistory } from "@/components/admin/revision-history";
import { MediaPicker } from "@/components/admin/media-picker";
import { ImageField } from "@/components/admin/image-field";
import { CategoryCombobox } from "@/components/admin/category-combobox";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Topbar } from "@/components/admin/topbar";

export function IdeiaForm({ id, initial }: { id: string | null; initial?: Partial<IdeiaInput> }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(ideiaSchema),
    defaultValues: {
      title: "",
      featured: false,
      seo: {},
      ...initial,
    },
  });

  // handleSubmit resolve com undefined, então o id salvo é capturado fora.
  const onSave = async (): Promise<string | null> => {
    let savedId: string | null = id;
    await handleSubmit(async (data) => {
      savedId = await saveIdeia(id, data);
    })();
    return savedId;
  };

  const metaDescription = watch("seo.meta_description") ?? "";

  return (
    <>
      <Topbar title={id ? "Editar ideia" : "Nova ideia"} />
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
            module="ideias"
            value={watch("category_id") ?? null}
            onChange={(categoryId) => setValue("category_id", categoryId || null)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="author">Autor</Label>
          <Input id="author" {...register("author")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="excerpt">Resumo</Label>
          <Textarea id="excerpt" {...register("excerpt")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Conteúdo</Label>
          <RichTextEditor value={watch("content") ?? ""} onChange={(html) => setValue("content", html)} />
        </div>
        <ImageField
          label="Capa"
          hint="1200×800px (proporção 3:2)"
          url={watch("cover_url") ?? ""}
          onSelect={(url) => setValue("cover_url", url)}
          onClear={() => setValue("cover_url", "")}
        />
        <MediaPicker
          type="video"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar vídeo</button>}
          onSelect={(m) => setValue("video_url", m.url)}
        />
        <MediaPicker
          type="pdf"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar PDF</button>}
          onSelect={(m) => setValue("pdf_url", m.url)}
        />
        <div className="flex items-center gap-3">
          <Switch checked={watch("featured")} onCheckedChange={(checked) => setValue("featured", checked)} />
          <Label>Destaque na Home</Label>
        </div>
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
        {id && <RevisionHistory table="ideas" recordId={id} />}
        <StatusActionsBar
          scheduledAt={null}
          onAction={async (action, scheduledAt) => {
            const savedId = await onSave();
            if (savedId && action !== "rascunho") await setIdeiaStatus(savedId, action, scheduledAt);
            router.push("/admin/ideias");
          }}
        />
      </div>
    </>
  );
}
