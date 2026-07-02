// Sem "use server" aqui de propósito: no Next 16 esses arquivos só podem
// exportar funções async, e este módulo exporta um factory síncrono e um
// helper puro. A fronteira "use server" fica nos actions.ts de cada módulo
// (app/admin/*/actions.ts), que exportam wrappers async destas funções.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextStatusOnPublish } from "./status";
import { slugify } from "./slug";

export function buildDuplicatePayload<T extends Record<string, unknown>>(
  original: T,
  titleKey: string,
  slugKey: string | null
): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, created_at, published_at, scheduled_at, ...rest } = original as Record<string, unknown>;
  const copy: Record<string, unknown> = {
    ...rest,
    status: "rascunho",
    published_at: null,
    scheduled_at: null,
  };
  copy[titleKey] = `${original[titleKey]} (cópia)`;
  if (slugKey) {
    copy[slugKey] = `${slugify(String(original[titleKey]))}-copia-${Date.now()}`;
  }
  return copy;
}

export function createModuleActions(table: string, revalidateBase: string) {
  return {
    async softDelete(id: string) {
      const supabase = await createClient();
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      revalidatePath(revalidateBase);
    },

    async restore(id: string) {
      const supabase = await createClient();
      const { error } = await supabase.from(table).update({ deleted_at: null }).eq("id", id);
      if (error) throw error;
      revalidatePath(revalidateBase);
    },

    async duplicate(id: string, titleKey: string, slugKey: string | null) {
      const supabase = await createClient();
      const { data: original, error: fetchError } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;
      const payload = buildDuplicatePayload(original, titleKey, slugKey);
      const { data: created, error: insertError } = await supabase
        .from(table)
        .insert(payload)
        .select("id")
        .single();
      if (insertError) throw insertError;
      revalidatePath(revalidateBase);
      return created.id as string;
    },

    async setStatus(
      id: string,
      action: "rascunho" | "despublicado" | "arquivado" | "publicar",
      scheduledAtInput: string | null
    ) {
      const supabase = await createClient();
      const payload =
        action === "publicar"
          ? nextStatusOnPublish(scheduledAtInput)
          : { status: action, scheduled_at: null };
      const { error } = await supabase.from(table).update(payload).eq("id", id);
      if (error) throw error;
      revalidatePath(revalidateBase);
    },
  };
}
