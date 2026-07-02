import { describe, it, expect } from "vitest";
import { CANONICAL_HOME_SECTIONS, reorderSections, toggleSection } from "./home-sections";

describe("CANONICAL_HOME_SECTIONS", () => {
  it("has exactly the 8 canonical sections in spec order", () => {
    expect(CANONICAL_HOME_SECTIONS.map((s) => s.key)).toEqual([
      "hero", "sobre", "projetos", "comunidade", "ideias", "noticias", "agenda", "contato",
    ]);
  });
});

describe("reorderSections", () => {
  it("moves a key to a new index", () => {
    expect(reorderSections(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
  });
});

describe("toggleSection", () => {
  it("flips a section's visibility", () => {
    expect(toggleSection({ hero: true, sobre: false }, "sobre")).toEqual({ hero: true, sobre: true });
  });
});
