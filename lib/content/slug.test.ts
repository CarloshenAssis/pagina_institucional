import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => expect(slugify("Escola Nova Geração")).toBe("escola-nova-geracao"));
  it("strips accents", () => expect(slugify("Programação e Educação")).toBe("programacao-e-educacao"));
  it("collapses repeated separators", () => expect(slugify("A   B---C")).toBe("a-b-c"));
  it("strips leading/trailing hyphens", () => expect(slugify("-teste-")).toBe("teste"));
  it("strips punctuation", () => expect(slugify("Rede Saúde Já!")).toBe("rede-saude-ja"));
});
