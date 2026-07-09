import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

// Server-only: nunca importar a partir de um client component (usa as
// chaves VAPID). No-op silencioso se as variáveis não estiverem configuradas
// — mesmo padrão de degradação usada no Turnstile e no rate-limit de login.
export async function notifySubscribers(payload: { title: string; body: string; url: string }) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return;

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const supabase = await createClient();
  const { data: subs } = await supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth");
  if (!subs || subs.length === 0) return;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        // 404/410 = inscrição expirada ou revogada pelo navegador; remove.
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    })
  );
}
