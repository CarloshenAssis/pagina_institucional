"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsToRecord } from "./settings-utils";
import { HEX, THEME_COLOR_KEYS, type ThemeRow } from "@/lib/content/theme";

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

export async function getTheme(): Promise<ThemeRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("theme_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function saveTheme(theme: ThemeRow) {
  const colors = Object.fromEntries(THEME_COLOR_KEYS.map((key) => [key, theme[key]]));
  for (const [key, value] of Object.entries(colors)) {
    if (!value || !HEX.test(value)) throw new Error(`Cor inválida em ${key}: ${value}`);
  }
  const supabase = await createClient();
  await supabase
    .from("theme_settings")
    .update({ ...colors, updated_at: new Date().toISOString() })
    .eq("id", 1);
  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}
