export const metadata = { title: "Notícias" };

import { listPublished, listPublicCategories } from "@/lib/content/public-queries";
import { totalPages } from "@/lib/content/pagination";
import { SectionHeading } from "@/components/portal/section-heading";
import { CategoryFilter, PaginationNav, EmptyState } from "@/components/portal/listing";
import { NewsCard } from "@/components/portal/cards";

const PER_PAGE = 12;

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}) {
  const { page: pageParam, categoria } = await searchParams;
  const page = Number(pageParam) || 1;
  const [{ rows, total }, categories] = await Promise.all([
    listPublished("news", { page, perPage: PER_PAGE, categorySlug: categoria }),
    listPublicCategories("noticias"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow="Notícias" title="Notícias" subtitle="Acompanhe as novidades do mandato e da comunidade." />
      <CategoryFilter basePath="/noticias" categories={categories} active={categoria} />
      {rows.length === 0 ? (
        <EmptyState label="Nenhuma notícia publicada ainda." />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {rows.map((n) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <NewsCard key={n.id} news={n as any} />
          ))}
        </div>
      )}
      <PaginationNav basePath="/noticias" page={page} pages={totalPages(total, PER_PAGE)} categoria={categoria} />
    </div>
  );
}
