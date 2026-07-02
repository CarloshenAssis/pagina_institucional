"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createModuleActions } from "@/lib/content/actions";
import { projetoSchema } from "@/lib/validations/projetos";
import { slugify } from "@/lib/content/slug";

const generic = createModuleActions("projects", "/admin/projetos");

export async function saveProjeto(id: string | null, input: unknown): Promise<string> {
  const parsed = projetoSchema.parse(input);
  const supabase = await createClient();
  const slug = parsed.slug?.trim() ? parsed.slug : slugify(parsed.title);
  let savedId = id;
  if (id) {
    const { error } = await supabase.from("projects").update({ ...parsed, slug }).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...parsed, slug, status: "rascunho" })
      .select("id")
      .single();
    if (error) throw error;
    savedId = data.id;
  }
  revalidatePath("/admin/projetos");
  return savedId!;
}

export async function listProjetos(includeDeleted = false) {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  query = includeDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((r) => ({ ...r, category_name: r.categories?.name ?? "—" }));
}

export async function getProjeto(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function softDeleteProjeto(id: string) {
  return generic.softDelete(id);
}

export async function restoreProjeto(id: string) {
  return generic.restore(id);
}

export async function duplicateProjeto(id: string) {
  return generic.duplicate(id, "title", "slug");
}

export async function setProjetoStatus(
  id: string,
  action: "rascunho" | "despublicado" | "arquivado" | "publicar",
  scheduledAtInput: string | null
) {
  return generic.setStatus(id, action, scheduledAtInput);
}
