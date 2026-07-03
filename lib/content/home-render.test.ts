import { describe, it, expect } from "vitest";
import { orderedVisibleSections } from "./home-render";

describe("orderedVisibleSections", () => {
  it("respects order and drops hidden sections", () => {
    expect(
      orderedVisibleSections(["hero", "agenda", "sobre"], { hero: true, agenda: false, sobre: true })
    ).toEqual(["hero", "sobre"]);
  });
  it("ignores unknown keys not in the canonical list", () => {
    expect(orderedVisibleSections(["hero", "inexistente"], { hero: true, inexistente: true })).toEqual(["hero"]);
  });
  it("treats missing visibility as visible", () => {
    expect(orderedVisibleSections(["hero", "contato"], {})).toEqual(["hero", "contato"]);
  });
});
