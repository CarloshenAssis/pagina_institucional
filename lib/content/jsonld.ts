// Builders de dados estruturados (JSON-LD) — puros e testáveis.

export function newsArticleJsonLd(
  item: {
    title: string;
    slug: string;
    excerpt: string | null;
    author: string | null;
    published_at: string | null;
    cover_url: string | null;
  },
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.excerpt ?? undefined,
    datePublished: item.published_at ?? undefined,
    image: item.cover_url ? [item.cover_url] : undefined,
    author: item.author ? { "@type": "Person", name: item.author } : undefined,
    mainEntityOfPage: `${siteUrl}/noticias/${item.slug}`,
  } as const;
}

export function eventJsonLd(event: {
  title: string;
  date: string;
  location: string | null;
  description: string | null;
  external_url: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.date,
    description: event.description ?? undefined,
    location: event.location ? { "@type": "Place", name: event.location } : undefined,
    url: event.external_url ?? undefined,
  } as const;
}
