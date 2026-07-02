"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createModuleActions } from "@/lib/content/actions";
import { eventoSchema } from "@/lib/validations/agenda";

const generic = createModuleActions("events", "/admin/agenda");

export async function saveEvento(id: string | null, input: unknown): Promise<string> {
  const parsed = eventoSchema.parse(input);
  const supabase = await createClient();
  let savedId = id;
  if (id) {
    const { error } = await supabase.from("events").update(parsed).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("events")
      .insert({ ...parsed, status: "rascunho" })
      .select("id")
      .single();
    if (error) throw error;
    savedId = data.id;
  }
  revalidatePath("/admin/agenda");
  return savedId!;
}

export async function listEventos(includeDeleted = false) {
  const supabase = await createClient();
  let query = supabase.from("events").select("*").order("date", { ascending: false });
  query = includeDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getEvento(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function softDeleteEvento(id: string) {
  return generic.softDelete(id);
}

export async function restoreEvento(id: string) {
  return generic.restore(id);
}

export async function duplicateEvento(id: string) {
  return generic.duplicate(id, "title", null);
}

export async function setEventoStatus(
  id: string,
  action: "rascunho" | "despublicado" | "arquivado" | "publicar",
  scheduledAtInput: string | null
) {
  return generic.setStatus(id, action, scheduledAtInput);
}

export async function setAgendaPageEnabled(enabled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("global_settings")
    .update({ value: String(enabled), updated_at: new Date().toISOString() })
    .eq("key", "agenda_page_enabled");
  if (error) throw error;
  revalidatePath("/admin/agenda");
}
