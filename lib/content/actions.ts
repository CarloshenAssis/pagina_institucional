// Sem "use server" aqui de propósito: no Next 16 esses arquivos só podem
// exportar funções async, e este módulo exporta um factory síncrono e um
// helper puro. A fronteira "use server" fica nos actions.ts de cada módulo
// (app/admin/*/actions.ts), que exportam wrappers async destas funções.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextStatusOnPublish } from "./status";
import { slugify } from "./slug";
import { notifySubscribers } from "@/lib/push/send";

// Só os módulos com página pública própria disparam notificação ao
// publicar. Trajetória e Agenda não têm rota individual — levam à
// listagem. A cron de publicação agendada (SQL puro) não passa por aqui,
// então conteúdo agendado não dispara push no momento em que fica público.
const PUBLIC_ROUTE: Record<string, (row: Record<string, unknown>) => string> = {
  trajetoria_items: () => "/trajetoria",
  projects: (row) => `/projetos/${row.slug}`,
  albuns: (row) => `/comunidade/${row.slug}`,
  ideas: (row) => `/ideias/${row.slug}`,
  news: (row) => `/noticias/${row.slug}`,
  events: () => "/agenda",
};

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
      const { data, error } = await supabase.from(table).update(payload).eq("id", id).select("*").maybeSingle();
      if (error) throw error;
      revalidatePath(revalidateBase);

      if (payload.status === "publicado" && data) {
        const routeFor = PUBLIC_ROUTE[table];
        if (routeFor) {
          void notifySubscribers({
            title: "Nova atualização",
            body: String(data.title ?? ""),
            url: routeFor(data),
          }).catch(() => {});
        }
      }
    },
  };
}
