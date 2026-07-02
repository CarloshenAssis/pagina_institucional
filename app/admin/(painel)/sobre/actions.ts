"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sobreSchema } from "@/lib/validations/sobre";

export async function saveSobre(input: unknown) {
  const parsed = sobreSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("sobre").update(parsed).eq("id", 1);
  if (error) throw error;
  revalidatePath("/admin/sobre");
}
