import { describe, it, expect } from "vitest";
import { loginSchema } from "./schema";

describe("loginSchema", () => {
  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "123456" });
    expect(result.success).toBe(false);
  });
  it("rejects a short password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "123" });
    expect(result.success).toBe(false);
  });
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "123456" });
    expect(result.success).toBe(true);
  });
});
