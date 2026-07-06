"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/content/slug";
import { categoryNameSchema, type CategoryModule } from "@/lib/validations/category";

export async function listCategories(module: CategoryModule) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("module", module).order("name");
  if (error) throw error;
  return data;
}

export async function createCategory(module: CategoryModule, name: string) {
  const parsedName = categoryNameSchema.parse(name);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ module, name: parsedName, slug: slugify(parsedName) })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listAllCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("module").order("name");
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, name: string) {
  const parsedName = categoryNameSchema.parse(name);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update({ name: parsedName, slug: slugify(parsedName) })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    // 23503 = violação de chave estrangeira: existe conteúdo usando essa categoria.
    if (error.code === "23503") {
      return { error: "Não é possível excluir: existem conteúdos usando esta categoria." };
    }
    throw error;
  }
  return { error: null };
}
