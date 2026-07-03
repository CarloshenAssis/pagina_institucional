"use server";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { isRateLimited } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  honeypot: z.string().max(0), // deve ficar vazio; bots preenchem tudo
  turnstileToken: z.string().min(1),
});

export async function submitContactForm(input: unknown, ip: string) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const failed = parsed.error.issues.map((i) => i.path.join("."));
    if (failed.includes("turnstileToken")) {
      return { error: "Aguarde a verificação de segurança concluir e tente novamente." };
    }
    return { error: "Dados inválidos." };
  }

  const verified = await verifyTurnstile(parsed.data.turnstileToken);
  if (!verified) return { error: "Falha na verificação anti-spam." };

  const supabase = createServiceRoleClient();
  const { data: recent } = await supabase
    .from("contact_rate_limit")
    .select("submitted_at")
    .eq("ip", ip)
    .gte("submitted_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
  const timestamps = (recent ?? []).map((r: { submitted_at: string }) =>
    new Date(r.submitted_at).getTime()
  );
  if (isRateLimited(timestamps, 3, 60 * 60 * 1000)) {
    return { error: "Muitas mensagens enviadas. Tente novamente mais tarde." };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { honeypot, turnstileToken, ...message } = parsed.data;
  const { error } = await supabase.from("contact_messages").insert(message);
  if (error) return { error: "Erro ao enviar mensagem." };

  await supabase.from("contact_rate_limit").insert({ ip });
  return { error: null };
}
