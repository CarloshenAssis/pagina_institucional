// Helpers puros do rate limit de login (arquivo irmão do actions.ts — Next 16
// não permite exports não-async em arquivos "use server"). Testados em
// rate-limit.test.ts.

export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 45_000; // 45s de bloqueio após atingir o limite

// Quanto tempo (ms) ainda falta de bloqueio, dados os timestamps das tentativas
// falhas recentes. Retorna 0 se ainda não atingiu o limite (pode tentar).
// Ao atingir o limite, o bloqueio dura `windowMs` a partir da ÚLTIMA tentativa
// (cooldown consistente de ~45s após a 5ª falha, não importa o ritmo delas).
export function loginLockRemainingMs(
  timestamps: number[],
  now: number,
  max: number = LOGIN_MAX_ATTEMPTS,
  windowMs: number = LOGIN_WINDOW_MS
): number {
  const recent = timestamps.filter((t) => t > now - windowMs);
  if (recent.length < max) return 0;
  const mostRecent = Math.max(...recent);
  return Math.max(0, mostRecent + windowMs - now);
}
