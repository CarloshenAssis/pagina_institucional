export const metadata = { title: "Ideias" };

import { listPublished, listPublicCategories } from "@/lib/content/public-queries";
import { totalPages } from "@/lib/content/pagination";
import { SectionHeading } from "@/components/portal/section-heading";
import { CategoryFilter, PaginationNav, EmptyState } from "@/components/portal/listing";
import { IdeaCard } from "@/components/portal/cards";

const PER_PAGE = 12;

export default async function IdeiasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}) {
  const { page: pageParam, categoria } = await searchParams;
  const page = Number(pageParam) || 1;
  const [{ rows, total }, categories] = await Promise.all([
    listPublished("ideas", { page, perPage: PER_PAGE, categorySlug: categoria }),
    listPublicCategories("ideias"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow="Ideias" title="Ideias e propostas" subtitle="Reflexões e planos para o futuro." />
      <CategoryFilter basePath="/ideias" categories={categories} active={categoria} />
      {rows.length === 0 ? (
        <EmptyState label="Nenhuma ideia publicada ainda." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {rows.map((i) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <IdeaCard key={i.id} idea={i as any} />
          ))}
        </div>
      )}
      <PaginationNav basePath="/ideias" page={page} pages={totalPages(total, PER_PAGE)} categoria={categoria} />
    </div>
  );
}
