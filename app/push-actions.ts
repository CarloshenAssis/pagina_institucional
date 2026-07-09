"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function subscribeToPush(input: unknown): Promise<{ error: string | null }> {
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) return { error: "Inscrição inválida." };

  const supabase = await createClient();
  // ignoreDuplicates: a policy de RLS só permite INSERT para anônimos (não
  // UPDATE) — se o endpoint já existir, a inscrição já está ativa.
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    },
    { onConflict: "endpoint", ignoreDuplicates: true }
  );
  if (error) return { error: "Não foi possível ativar as notificações." };
  return { error: null };
}
