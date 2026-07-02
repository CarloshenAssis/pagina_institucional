"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ideiaSchema, type IdeiaInput } from "@/lib/validations/ideias";
import { saveIdeia, setIdeiaStatus } from "../actions";
import { StatusActionsBar } from "@/components/admin/status-actions-bar";
import { MediaPicker } from "@/components/admin/media-picker";
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

  const onSave = handleSubmit(async (data) => {
    await saveIdeia(id, data);
  });

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
        <MediaPicker
          type="imagem"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar capa</button>}
          onSelect={(m) => setValue("cover_url", m.url)}
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
        <StatusActionsBar
          scheduledAt={null}
          onAction={async (action, scheduledAt) => {
            await onSave();
            if (id) await setIdeiaStatus(id, action, scheduledAt);
            router.push("/admin/ideias");
          }}
        />
      </div>
    </>
  );
}
