"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createModuleActions } from "@/lib/content/actions";
import { ideiaSchema } from "@/lib/validations/ideias";
import { slugify } from "@/lib/content/slug";

const generic = createModuleActions("ideas", "/admin/ideias");

export async function saveIdeia(id: string | null, input: unknown) {
  const parsed = ideiaSchema.parse(input);
  const supabase = await createClient();
  const slug = parsed.slug?.trim() ? parsed.slug : slugify(parsed.title);
  if (id) {
    const { error } = await supabase.from("ideas").update({ ...parsed, slug }).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("ideas").insert({ ...parsed, slug, status: "rascunho" });
    if (error) throw error;
  }
  revalidatePath("/admin/ideias");
}

export async function listIdeias(includeDeleted = false) {
  const supabase = await createClient();
  let query = supabase
    .from("ideas")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  query = includeDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((r) => ({ ...r, category_name: r.categories?.name ?? "—" }));
}

export async function getIdeia(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("ideas").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function softDeleteIdeia(id: string) {
  return generic.softDelete(id);
}

export async function restoreIdeia(id: string) {
  return generic.restore(id);
}

export async function duplicateIdeia(id: string) {
  return generic.duplicate(id, "title", "slug");
}

export async function setIdeiaStatus(
  id: string,
  action: "rascunho" | "despublicado" | "arquivado" | "publicar",
  scheduledAtInput: string | null
) {
  return generic.setStatus(id, action, scheduledAtInput);
}
