"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trajetoriaSchema, type TrajetoriaInput } from "@/lib/validations/trajetoria";
import { saveTrajetoriaItem, setTrajetoriaStatus } from "../actions";
import { StatusActionsBar } from "@/components/admin/status-actions-bar";
import { RevisionHistory } from "@/components/admin/revision-history";
import { MediaPicker } from "@/components/admin/media-picker";
import { ImageField } from "@/components/admin/image-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/admin/topbar";

export function TrajetoriaForm({ id, initial }: { id: string | null; initial?: Partial<TrajetoriaInput> }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(trajetoriaSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      title: "",
      order_index: 0,
      ...initial,
    },
  });

  // handleSubmit resolve com undefined, então o id salvo é capturado fora.
  const onSave = async (): Promise<string | null> => {
    let savedId: string | null = id;
    await handleSubmit(async (data) => {
      savedId = await saveTrajetoriaItem(id, data);
    })();
    return savedId;
  };

  return (
    <>
      <Topbar title={id ? "Editar etapa" : "Nova etapa"} />
      <div className="p-9 max-w-3xl flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">Ano</Label>
          <Input id="year" type="number" {...register("year", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Título</Label>
          <Input id="title" {...register("title")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" {...register("description")} />
        </div>
        <ImageField
          label="Imagem"
          hint="1200×800px (proporção 3:2)"
          url={watch("image_url") ?? ""}
          onSelect={(url) => setValue("image_url", url)}
          onClear={() => setValue("image_url", "")}
        />
        <MediaPicker
          type="video"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar vídeo</button>}
          onSelect={(m) => setValue("video_url", m.url)}
        />
        <MediaPicker
          type="documento"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar documento (PDF)</button>}
          onSelect={(m) => setValue("document_url", m.url)}
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order_index">Ordem</Label>
          <Input id="order_index" type="number" {...register("order_index", { valueAsNumber: true })} />
        </div>
        {id && <RevisionHistory table="trajetoria_items" recordId={id} />}
        <StatusActionsBar
          scheduledAt={null}
          onAction={async (action, scheduledAt) => {
            const savedId = await onSave();
            if (savedId && action !== "rascunho") await setTrajetoriaStatus(savedId, action, scheduledAt);
            router.push("/admin/trajetoria");
          }}
        />
      </div>
    </>
  );
}
