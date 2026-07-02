"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createModuleActions } from "@/lib/content/actions";
import { noticiaSchema } from "@/lib/validations/noticias";
import { slugify } from "@/lib/content/slug";

const generic = createModuleActions("news", "/admin/noticias");

export async function saveNoticia(id: string | null, input: unknown): Promise<string> {
  const parsed = noticiaSchema.parse(input);
  const supabase = await createClient();
  const slug = parsed.slug?.trim() ? parsed.slug : slugify(parsed.title);
  let savedId = id;
  if (id) {
    const { error } = await supabase.from("news").update({ ...parsed, slug }).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("news")
      .insert({ ...parsed, slug, status: "rascunho" })
      .select("id")
      .single();
    if (error) throw error;
    savedId = data.id;
  }
  revalidatePath("/admin/noticias");
  return savedId!;
}

export async function listNoticias(includeDeleted = false) {
  const supabase = await createClient();
  let query = supabase
    .from("news")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  query = includeDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((r) => ({ ...r, category_name: r.categories?.name ?? "—" }));
}

export async function getNoticia(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function softDeleteNoticia(id: string) {
  return generic.softDelete(id);
}

export async function restoreNoticia(id: string) {
  return generic.restore(id);
}

export async function duplicateNoticia(id: string) {
  return generic.duplicate(id, "title", "slug");
}

export async function setNoticiaStatus(
  id: string,
  action: "rascunho" | "despublicado" | "arquivado" | "publicar",
  scheduledAtInput: string | null
) {
  return generic.setStatus(id, action, scheduledAtInput);
}
