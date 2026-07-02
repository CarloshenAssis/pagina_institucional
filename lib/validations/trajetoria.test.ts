import { describe, it, expect } from "vitest";
import { trajetoriaSchema } from "./trajetoria";

describe("trajetoriaSchema", () => {
  it("requires year and title", () => {
    const result = trajetoriaSchema.safeParse({ year: null, title: "" });
    expect(result.success).toBe(false);
  });
  it("accepts a minimal valid etapa", () => {
    const result = trajetoriaSchema.safeParse({ year: 2014, title: "Secretaria de Educação" });
    expect(result.success).toBe(true);
  });
  it("rejects a year before 1900 or after 2100", () => {
    expect(trajetoriaSchema.safeParse({ year: 1899, title: "x" }).success).toBe(false);
    expect(trajetoriaSchema.safeParse({ year: 2101, title: "x" }).success).toBe(false);
  });
});
