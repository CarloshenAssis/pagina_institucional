export const metadata = { title: "Conquistas" };

import { listPublished, listPublicCategories } from "@/lib/content/public-queries";
import { totalPages } from "@/lib/content/pagination";
import { SectionHeading } from "@/components/portal/section-heading";
import { CategoryFilter, PaginationNav, EmptyState } from "@/components/portal/listing";
import { ProjectCard } from "@/components/portal/cards";

const PER_PAGE = 12;

export default async function ConquistasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}) {
  const { page: pageParam, categoria } = await searchParams;
  const page = Number(pageParam) || 1;
  const [{ rows, total }, categories] = await Promise.all([
    listPublished("projects", { page, perPage: PER_PAGE, categorySlug: categoria, stage: "concluido" }),
    listPublicCategories("projetos"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow="Conquistas" title="Conquistas" subtitle="Resultados concretos já entregues." />
      <CategoryFilter basePath="/conquistas" categories={categories} active={categoria} />
      {rows.length === 0 ? (
        <EmptyState label="Nenhuma conquista publicada ainda." />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {rows.map((p) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <ProjectCard key={p.id} project={p as any} />
          ))}
        </div>
      )}
      <PaginationNav basePath="/conquistas" page={page} pages={totalPages(total, PER_PAGE)} categoria={categoria} />
    </div>
  );
}
