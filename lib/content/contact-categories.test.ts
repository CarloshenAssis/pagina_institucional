import { describe, it, expect } from "vitest";
import { CONTACT_CATEGORIES, CONTACT_CATEGORY_LABELS } from "./contact-categories";

describe("contact-categories", () => {
  it("tem um rótulo em português para cada categoria", () => {
    for (const category of CONTACT_CATEGORIES) {
      expect(CONTACT_CATEGORY_LABELS[category]).toBeTruthy();
    }
  });

  it("não tem categorias duplicadas", () => {
    expect(new Set(CONTACT_CATEGORIES).size).toBe(CONTACT_CATEGORIES.length);
  });
});
