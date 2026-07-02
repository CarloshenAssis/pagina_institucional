import { describe, it, expect } from "vitest";
import { NAV_SECTIONS } from "./nav-config";

describe("NAV_SECTIONS", () => {
  it("has Dashboard as the first item", () => {
    expect(NAV_SECTIONS[0].items[0].href).toBe("/admin");
  });
  it("has no separate SEO nav item (folded into Configurações)", () => {
    const allHrefs = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href));
    expect(allHrefs).not.toContain("/admin/seo");
  });
  it("includes all 6 content modules", () => {
    const allHrefs = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href));
    for (const href of ["/admin/trajetoria", "/admin/projetos", "/admin/comunidade",
      "/admin/ideias", "/admin/noticias", "/admin/agenda"]) {
      expect(allHrefs).toContain(href);
    }
  });
});
