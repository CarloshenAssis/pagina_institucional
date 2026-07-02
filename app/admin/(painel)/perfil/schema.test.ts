import { describe, it, expect } from "vitest";
import { passwordChangeSchema } from "./schema";

describe("passwordChangeSchema", () => {
  it("rejects a password shorter than 8 characters", () => {
    expect(passwordChangeSchema.safeParse({ password: "1234567" }).success).toBe(false);
  });
  it("accepts an 8+ character password", () => {
    expect(passwordChangeSchema.safeParse({ password: "12345678" }).success).toBe(true);
  });
});
