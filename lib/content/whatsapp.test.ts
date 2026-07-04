import { describe, it, expect } from "vitest";
import { whatsappLink } from "./whatsapp";

describe("whatsappLink", () => {
  it("normaliza um número em formato local para o link wa.me com DDI 55", () => {
    expect(whatsappLink("(12) 99184-1312")).toBe("https://wa.me/5512991841312");
  });
  it("não duplica o DDI se já vier com 55", () => {
    expect(whatsappLink("55 12 99184-1312")).toBe("https://wa.me/5512991841312");
  });
  it("mantém um link já pronto sem alterar", () => {
    expect(whatsappLink("https://wa.me/5512991841312")).toBe("https://wa.me/5512991841312");
  });
  it("retorna vazio para entrada vazia", () => {
    expect(whatsappLink("")).toBe("");
    expect(whatsappLink("   ")).toBe("");
  });
});
