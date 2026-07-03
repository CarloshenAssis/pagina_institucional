export const metadata = { title: "Projetos" };

import { listPublished, listPublicCategories } from "@/lib/content/public-queries";
import { totalPages } from "@/lib/content/pagination";
import { SectionHeading } from "@/components/portal/section-heading";
import { CategoryFilter, PaginationNav, EmptyState } from "@/components/portal/listing";
import { ProjectCard } from "@/components/portal/cards";

const PER_PAGE = 12;

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}) {
  const { page: pageParam, categoria } = await searchParams;
  const page = Number(pageParam) || 1;
  const [{ rows, total }, categories] = await Promise.all([
    listPublished("projects", { page, perPage: PER_PAGE, categorySlug: categoria }),
    listPublicCategories("projetos"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow="Projetos" title="Projetos" subtitle="Iniciativas propostas, em andamento e concluídas." />
      <CategoryFilter basePath="/projetos" categories={categories} active={categoria} />
      {rows.length === 0 ? (
        <EmptyState label="Nenhum projeto publicado ainda." />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {rows.map((p) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <ProjectCard key={p.id} project={p as any} />
          ))}
        </div>
      )}
      <PaginationNav basePath="/projetos" page={page} pages={totalPages(total, PER_PAGE)} categoria={categoria} />
    </div>
  );
}
