"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function listMessages(
  filter: "todas" | "nao_lidas" | "arquivadas",
  page: number,
  search: string
) {
  const supabase = await createClient();
  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);

  if (filter === "nao_lidas") query = query.eq("status", "nova");
  if (filter === "arquivadas") query = query.eq("status", "arquivada");
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: data, total: count ?? 0 };
}

export async function markMessageStatus(id: string, status: "lida" | "respondida" | "arquivada") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/mensagens");
}

export async function softDeleteMessage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/mensagens");
}
