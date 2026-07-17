"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bucketForType, validateFileSize, type UploadableType } from "./upload-config";

export async function uploadMedia(formData: FormData) {
  const file = formData.get("file") as File;
  const type = formData.get("type") as UploadableType;
  if (!validateFileSize(type, file.size)) {
    return { error: `Arquivo excede o tamanho máximo permitido para ${type}.` };
  }
  const supabase = await createClient();
  const bucket = bucketForType(type);
  const path = `${Date.now()}-${file.name}`;
  // Path é único por upload (timestamp + nome) e nunca é sobrescrito, então
  // cache longo é seguro — evita re-baixar do Storage a cada visita/crawler
  // de preview (WhatsApp, Facebook) batendo no mesmo arquivo repetidamente.
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "31536000" });
  if (uploadError) return { error: uploadError.message };
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
  const { error: insertError } = await supabase.from("media_library").insert({
    url: publicUrl.publicUrl,
    storage_path: path,
    type,
    filename: file.name,
    size_bytes: file.size,
    mime_type: file.type,
  });
  if (insertError) return { error: insertError.message };
  revalidatePath("/admin/midias");
  return { error: null };
}

export async function addVideoLink(url: string, title: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("media_library").insert({
    url,
    storage_path: null,
    type: "video",
    filename: title,
    size_bytes: null,
    mime_type: null,
  });
  if (error) throw error;
  revalidatePath("/admin/midias");
}

export async function listMedia(type: UploadableType) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_library")
    .select("*")
    .eq("type", type)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function softDeleteMedia(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("media_library")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/midias");
}
