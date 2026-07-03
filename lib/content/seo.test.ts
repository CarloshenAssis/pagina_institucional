import { describe, it, expect } from "vitest";
import { itemMetadata } from "./seo";

describe("itemMetadata", () => {
  it("uses seo overrides when present", () => {
    const meta = itemMetadata({
      title: "Título original",
      excerpt: "resumo",
      seo: { meta_title: "Título SEO", meta_description: "Descrição SEO" },
      cover_url: "https://ex.com/capa.jpg",
    });
    expect(meta.title).toBe("Título SEO");
    expect(meta.description).toBe("Descrição SEO");
    expect(meta.openGraph?.images).toEqual(["https://ex.com/capa.jpg"]);
  });

  it("falls back to title/excerpt and omits images without cover", () => {
    const meta = itemMetadata({ title: "Só título", excerpt: null, seo: null, cover_url: null });
    expect(meta.title).toBe("Só título");
    expect(meta.description).toBeUndefined();
    expect(meta.openGraph?.images).toBeUndefined();
  });
});
