"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createModuleActions } from "@/lib/content/actions";
import { albumSchema } from "@/lib/validations/comunidade";
import { slugify } from "@/lib/content/slug";

const generic = createModuleActions("albuns", "/admin/comunidade");

export async function saveAlbum(id: string | null, input: unknown): Promise<string> {
  const parsed = albumSchema.parse(input);
  const supabase = await createClient();
  const slug = parsed.slug?.trim() ? parsed.slug : slugify(parsed.title);
  const payload = { ...parsed, slug, date: parsed.date || null };
  let savedId = id;
  if (id) {
    const { error } = await supabase.from("albuns").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("albuns")
      .insert({ ...payload, status: "rascunho" })
      .select("id")
      .single();
    if (error) throw error;
    savedId = data.id;
  }
  revalidatePath("/admin/comunidade");
  return savedId!;
}

export async function listAlbuns(includeDeleted = false) {
  const supabase = await createClient();
  let query = supabase
    .from("albuns")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  query = includeDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((r) => ({ ...r, category_name: r.categories?.name ?? "—" }));
}

export async function getAlbum(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("albuns").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function softDeleteAlbum(id: string) {
  return generic.softDelete(id);
}

export async function restoreAlbum(id: string) {
  return generic.restore(id);
}

export async function duplicateAlbum(id: string) {
  return generic.duplicate(id, "title", "slug");
}

export async function setAlbumStatus(
  id: string,
  action: "rascunho" | "despublicado" | "arquivado" | "publicar",
  scheduledAtInput: string | null
) {
  return generic.setStatus(id, action, scheduledAtInput);
}
