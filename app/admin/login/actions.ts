"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { loginSchema } from "./schema";
import { loginLockRemainingMs, LOGIN_WINDOW_MS } from "./rate-limit";

// Cliente service role para a tabela login_attempts (RLS sem policies — só o
// service role fura). Se a chave não estiver no ambiente, o rate limit é
// pulado (degrada em vez de travar todos os logins).
function rateLimiter() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceRoleClient() : null;
}

export async function login(_prevState: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "E-mail ou senha inválidos." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limiter = rateLimiter();

  // Bloqueio anti brute-force: 5 tentativas erradas no mesmo IP travam por 45s.
  if (limiter) {
    const since = new Date(Date.now() - LOGIN_WINDOW_MS).toISOString();
    const { data } = await limiter
      .from("login_attempts")
      .select("attempted_at")
      .eq("ip", ip)
      .gte("attempted_at", since);
    const timestamps = (data ?? []).map((r: { attempted_at: string }) =>
      new Date(r.attempted_at).getTime()
    );
    const remainingMs = loginLockRemainingMs(timestamps, Date.now());
    if (remainingMs > 0) {
      return {
        error: `Muitas tentativas de login. Aguarde ${Math.ceil(remainingMs / 1000)} segundos e tente novamente.`,
      };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (limiter) await limiter.from("login_attempts").insert({ ip });
    return { error: "Credenciais incorretas." };
  }

  // Login ok: zera as tentativas do IP.
  if (limiter) await limiter.from("login_attempts").delete().eq("ip", ip);
  redirect("/admin");
}
