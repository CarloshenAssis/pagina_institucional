"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { passwordChangeSchema } from "./schema";

export async function saveProfile(input: {
  name: string;
  photo_url: string;
  language: string;
  theme_preference: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  // upsert: a linha em admin_profiles pode ainda não existir para este usuário
  const { error } = await supabase
    .from("admin_profiles")
    .upsert({ id: user.id, ...input, updated_at: new Date().toISOString() });
  if (error) throw error;
  revalidatePath("/admin/perfil");
}

export async function changePassword(newPassword: string) {
  const parsed = passwordChangeSchema.parse({ password: newPassword });
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.password });
  if (error) throw error;
}
