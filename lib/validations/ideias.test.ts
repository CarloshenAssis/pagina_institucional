import { describe, it, expect } from "vitest";
import { ideiaSchema } from "./ideias";

describe("ideiaSchema", () => {
  it("requires a title", () => expect(ideiaSchema.safeParse({ title: "" }).success).toBe(false));
  it("allows author to be omitted", () => {
    expect(ideiaSchema.safeParse({ title: "Por que investir em formação docente" }).success).toBe(true);
  });
});
