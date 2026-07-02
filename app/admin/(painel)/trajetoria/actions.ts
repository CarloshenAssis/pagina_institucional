"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createModuleActions } from "@/lib/content/actions";
import { trajetoriaSchema } from "@/lib/validations/trajetoria";

const generic = createModuleActions("trajetoria_items", "/admin/trajetoria");

export async function listTrajetoria(includeDeleted = false) {
  const supabase = await createClient();
  let query = supabase.from("trajetoria_items").select("*").order("order_index");
  query = includeDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTrajetoriaItem(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trajetoria_items").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function saveTrajetoriaItem(id: string | null, input: unknown): Promise<string> {
  const parsed = trajetoriaSchema.parse(input);
  const supabase = await createClient();
  let savedId = id;
  if (id) {
    const { error } = await supabase.from("trajetoria_items").update(parsed).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("trajetoria_items")
      .insert({ ...parsed, status: "rascunho" })
      .select("id")
      .single();
    if (error) throw error;
    savedId = data.id;
  }
  revalidatePath("/admin/trajetoria");
  return savedId!;
}

export async function softDeleteTrajetoria(id: string) {
  return generic.softDelete(id);
}

export async function restoreTrajetoria(id: string) {
  return generic.restore(id);
}

export async function duplicateTrajetoria(id: string) {
  return generic.duplicate(id, "title", null);
}

export async function setTrajetoriaStatus(
  id: string,
  action: "rascunho" | "despublicado" | "arquivado" | "publicar",
  scheduledAtInput: string | null
) {
  return generic.setStatus(id, action, scheduledAtInput);
}
