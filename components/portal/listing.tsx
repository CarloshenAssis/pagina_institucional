import Link from "next/link";

// Blocos compartilhados das páginas de listagem (server components puros).

export function CategoryFilter({
  basePath,
  categories,
  active,
}: {
  basePath: string;
  categories: { id: string; name: string; slug: string }[];
  active?: string;
}) {
  if (categories.length === 0) return null;
  return (
    <nav className="flex gap-2 flex-wrap mb-8" aria-label="Filtrar por categoria">
      <Link
        href={basePath}
        className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 border ${
          !active ? "bg-primary text-primary-foreground" : "text-primary"
        }`}
      >
        Todas
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`${basePath}?categoria=${c.slug}`}
          className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 border ${
            active === c.slug ? "bg-primary text-primary-foreground" : "text-primary"
          }`}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}

export function PaginationNav({
  basePath,
  page,
  pages,
  categoria,
}: {
  basePath: string;
  page: number;
  pages: number;
  categoria?: string;
}) {
  if (pages <= 1) return null;
  const href = (p: number) =>
    `${basePath}?page=${p}${categoria ? `&categoria=${categoria}` : ""}`;
  return (
    <nav className="flex items-center gap-4 mt-10 justify-center" aria-label="Paginação">
      {page > 1 && (
        <Link href={href(page - 1)} className="text-sm font-bold underline text-primary">
          ← Anterior
        </Link>
      )}
      <span className="text-sm text-foreground/60">
        Página {page} de {pages}
      </span>
      {page < pages && (
        <Link href={href(page + 1)} className="text-sm font-bold underline text-primary">
          Próxima →
        </Link>
      )}
    </nav>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-20 text-center flex flex-col items-center gap-2">
      <span className="text-3xl" aria-hidden>
        🕊️
      </span>
      <p className="text-foreground/60">{label}</p>
    </div>
  );
}
