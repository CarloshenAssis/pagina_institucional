import { describe, it, expect } from "vitest";
import { projetoSchema } from "./projetos";

describe("projetoSchema", () => {
  it("requires a title", () => {
    expect(projetoSchema.safeParse({ title: "" }).success).toBe(false);
  });
  it("defaults project_stage to 'proposto'", () => {
    const result = projetoSchema.parse({ title: "Escola Nova Geração" });
    expect(result.project_stage).toBe("proposto");
  });
  it("rejects an invalid project_stage", () => {
    expect(projetoSchema.safeParse({ title: "x", project_stage: "invalido" }).success).toBe(false);
  });
});
