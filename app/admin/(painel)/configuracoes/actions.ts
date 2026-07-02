"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsToRecord } from "./settings-utils";

export async function getSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("global_settings").select("key, value");
  if (error) throw error;
  return settingsToRecord(data);
}

export async function saveSettings(updates: Record<string, string>) {
  const supabase = await createClient();
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      supabase
        .from("global_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
    )
  );
  revalidatePath("/admin/configuracoes");
}
