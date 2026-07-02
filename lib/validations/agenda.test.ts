import { describe, it, expect } from "vitest";
import { eventoSchema } from "./agenda";

describe("eventoSchema", () => {
  it("requires title and date", () => {
    expect(eventoSchema.safeParse({ title: "", date: "" }).success).toBe(false);
  });
  it("accepts a minimal valid event", () => {
    expect(eventoSchema.safeParse({ title: "Audiência pública", date: "2026-07-08T19:00:00Z" }).success).toBe(true);
  });
});
