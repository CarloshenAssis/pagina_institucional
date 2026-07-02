import { describe, it, expect } from "vitest";
import { sobreSchema } from "./sobre";

describe("sobreSchema", () => {
  it("allows all fields to be empty (starts blank, ships with no content)", () => {
    expect(sobreSchema.safeParse({}).success).toBe(true);
  });
  it("defaults gallery_urls and pdf_urls to empty arrays", () => {
    const result = sobreSchema.parse({});
    expect(result.gallery_urls).toEqual([]);
    expect(result.pdf_urls).toEqual([]);
  });
});
