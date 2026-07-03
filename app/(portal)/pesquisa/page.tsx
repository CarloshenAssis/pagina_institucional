export const metadata = { title: "Pesquisa" };

import Link from "next/link";
import { searchAll } from "@/lib/content/search-server";
import { SectionHeading } from "@/components/portal/section-heading";
import { EmptyState } from "@/components/portal/listing";

export default async function PesquisaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const groups = q ? await searchAll(q) : [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <SectionHeading eyebrow="Pesquisa" title="Buscar no portal" />
      <form action="/pesquisa" className="flex gap-3 mb-10">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="O que você procura?"
          className="flex-1 border bg-white px-4 py-3 text-sm"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
        <button type="submit" className="px-6 py-3 text-sm font-bold bg-primary text-primary-foreground">
          Buscar
        </button>
      </form>

      {q && groups.length === 0 && <EmptyState label={`Nada encontrado para "${q}".`} />}

      <div className="flex flex-col gap-10">
        {groups.map((g) => (
          <section key={g.module}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gold mb-3">{g.label}</h2>
            <ul className="flex flex-col gap-2">
              {g.items.map((item, i) => (
                <li key={`${item.href}-${i}`}>
                  <Link href={item.href} className="font-display text-xl text-primary hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
