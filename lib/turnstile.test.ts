import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyTurnstile } from "./turnstile";

describe("verifyTurnstile", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns true when Cloudflare reports success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ success: true }) }) as unknown as typeof fetch;
    expect(await verifyTurnstile("valid-token")).toBe(true);
  });

  it("returns false when Cloudflare reports failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ success: false }) }) as unknown as typeof fetch;
    expect(await verifyTurnstile("invalid-token")).toBe(false);
  });

  it("returns false when the token is empty (honeypot / missing widget)", async () => {
    expect(await verifyTurnstile("")).toBe(false);
  });
});
