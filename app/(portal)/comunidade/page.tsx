export const metadata = { title: "Comunidade" };

import Link from "next/link";
import Image from "next/image";
import { listPublished, listPublicCategories } from "@/lib/content/public-queries";
import { totalPages } from "@/lib/content/pagination";
import { SectionHeading } from "@/components/portal/section-heading";
import { CategoryFilter, PaginationNav, EmptyState } from "@/components/portal/listing";

const PER_PAGE = 12;

export default async function ComunidadePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}) {
  const { page: pageParam, categoria } = await searchParams;
  const page = Number(pageParam) || 1;
  const [{ rows, total }, categories] = await Promise.all([
    listPublished("albuns", { page, perPage: PER_PAGE, categorySlug: categoria }),
    listPublicCategories("comunidade"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow="Comunidade" title="Comunidade" subtitle="Álbuns de encontros, eventos e momentos." />
      <CategoryFilter basePath="/comunidade" categories={categories} active={categoria} />
      {rows.length === 0 ? (
        <EmptyState label="Nenhum álbum publicado ainda." />
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
          {rows.map((a) => (
            <Link key={a.id} href={`/comunidade/${a.slug}`} className="group flex flex-col bg-white border hover:shadow-lg transition-shadow">
              <div className="relative aspect-square bg-primary/10 overflow-hidden">
                {a.cover_url && (
                  <Image
                    src={a.cover_url}
                    alt={a.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
              <div className="p-4 flex flex-col gap-1">
                <h3 className="font-display text-lg text-primary group-hover:underline">{a.title}</h3>
                <div className="flex gap-3 text-[11px] font-bold uppercase tracking-wide">
                  {a.category_name && <span className="text-gold">{a.category_name}</span>}
                  {a.date && (
                    <time className="text-foreground/50 font-normal">
                      {new Date(`${a.date}T12:00:00`).toLocaleDateString("pt-BR")}
                    </time>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <PaginationNav basePath="/comunidade" page={page} pages={totalPages(total, PER_PAGE)} categoria={categoria} />
    </div>
  );
}
