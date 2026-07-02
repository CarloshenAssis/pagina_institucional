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
