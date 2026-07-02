"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveHomeSections(
  sectionsOrder: string[],
  sectionsVisible: Record<string, boolean>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("home_config")
    .update({ sections_order: sectionsOrder, sections_visible: sectionsVisible })
    .eq("id", 1);
  if (error) throw error;
  revalidatePath("/admin/home");
}

export async function saveHero(input: {
  hero_photo_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_slogan: string;
  hero_btn1_text: string;
  hero_btn1_url: string;
  hero_btn2_text: string;
  hero_btn2_url: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("home_config").update(input).eq("id", 1);
  if (error) throw error;
  revalidatePath("/admin/home");
}
