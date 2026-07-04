import { describe, it, expect } from "vitest";
import { loginLockRemainingMs } from "./rate-limit";

describe("loginLockRemainingMs", () => {
  const now = 1_000_000_000_000;

  it("não bloqueia abaixo de 5 tentativas", () => {
    const attempts = [now - 1000, now - 2000, now - 3000, now - 4000];
    expect(loginLockRemainingMs(attempts, now)).toBe(0);
  });

  it("bloqueia ao atingir 5 tentativas na janela de 45s", () => {
    const attempts = [now - 1000, now - 2000, now - 3000, now - 4000, now - 5000];
    const remaining = loginLockRemainingMs(attempts, now);
    expect(remaining).toBeGreaterThan(0);
    // conta a partir da tentativa MAIS RECENTE (há 1s); faltam ~44s de 45s
    expect(remaining).toBe(44_000);
  });

  it("ignora tentativas fora da janela de 45s", () => {
    const attempts = [now - 50_000, now - 60_000, now - 70_000, now - 80_000, now - 90_000];
    expect(loginLockRemainingMs(attempts, now)).toBe(0);
  });

  it("libera assim que a tentativa mais antiga expira da janela", () => {
    // 5 tentativas, a mais antiga há exatamente 45s -> já saiu da janela
    const attempts = [now - 45_001, now - 1000, now - 2000, now - 3000, now - 4000];
    expect(loginLockRemainingMs(attempts, now)).toBe(0);
  });
});
