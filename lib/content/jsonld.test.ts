import { describe, it, expect } from "vitest";
import { newsArticleJsonLd, eventJsonLd } from "./jsonld";

describe("newsArticleJsonLd", () => {
  it("builds a NewsArticle with headline, date and author", () => {
    const ld = newsArticleJsonLd(
      {
        title: "Nota oficial",
        slug: "nota",
        excerpt: "resumo",
        author: "Tia Lu",
        published_at: "2026-07-01T10:00:00Z",
        cover_url: "https://ex.com/c.jpg",
      },
      "https://site.com"
    );
    expect(ld["@type"]).toBe("NewsArticle");
    expect(ld.headline).toBe("Nota oficial");
    expect(ld.datePublished).toBe("2026-07-01T10:00:00Z");
    expect(ld.author).toEqual({ "@type": "Person", name: "Tia Lu" });
    expect(ld.mainEntityOfPage).toBe("https://site.com/noticias/nota");
  });
});

describe("eventJsonLd", () => {
  it("builds an Event with location and date", () => {
    const ld = eventJsonLd({
      title: "Audiência pública",
      date: "2026-07-08T19:00:00Z",
      location: "Câmara Municipal",
      description: null,
      external_url: null,
    });
    expect(ld["@type"]).toBe("Event");
    expect(ld.startDate).toBe("2026-07-08T19:00:00Z");
    expect(ld.location).toEqual({ "@type": "Place", name: "Câmara Municipal" });
  });
});
