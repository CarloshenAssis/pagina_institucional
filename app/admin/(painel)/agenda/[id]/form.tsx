"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventoSchema, type EventoInput } from "@/lib/validations/agenda";
import { saveEvento, setEventoStatus } from "../actions";
import { StatusActionsBar } from "@/components/admin/status-actions-bar";
import { MediaPicker } from "@/components/admin/media-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/admin/topbar";

export function EventoForm({ id, initial }: { id: string | null; initial?: Partial<EventoInput> }) {
  const router = useRouter();
  const { register, handleSubmit, setValue } = useForm({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      title: "",
      date: "",
      ...initial,
      // datetime-local não aceita timestamps com timezone do banco
      ...(initial?.date ? { date: initial.date.slice(0, 16) } : {}),
    },
  });

  const onSave = handleSubmit(async (data) => {
    await saveEvento(id, { ...data, date: new Date(data.date).toISOString() });
  });

  return (
    <>
      <Topbar title={id ? "Editar evento" : "Novo evento"} />
      <div className="p-9 max-w-3xl flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Título</Label>
          <Input id="title" {...register("title")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" {...register("description")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Data e Hora</Label>
          <Input id="date" type="datetime-local" {...register("date")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Local</Label>
          <Input id="location" {...register("location")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="map_embed_url">Mapa incorporado (URL)</Label>
          <Input id="map_embed_url" {...register("map_embed_url")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="external_url">Link externo</Label>
          <Input id="external_url" {...register("external_url")} />
        </div>
        <MediaPicker
          type="imagem"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar imagem</button>}
          onSelect={(m) => setValue("image_url", m.url)}
        />
        <StatusActionsBar
          scheduledAt={null}
          onAction={async (action, scheduledAt) => {
            await onSave();
            if (id) await setEventoStatus(id, action, scheduledAt);
            router.push("/admin/agenda");
          }}
        />
      </div>
    </>
  );
}
