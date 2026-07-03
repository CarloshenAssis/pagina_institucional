// Busca pública em todos os módulos (ilike simples — sem full-text na v1).
import { createClient } from "@/lib/supabase/server";
import { groupResults, type SearchRow } from "./search";

const CONTENT: { table: string; module: SearchRow["module"]; fields: string[]; hasSlug: boolean }[] = [
  { table: "projects", module: "projetos", fields: ["title", "excerpt", "description"], hasSlug: true },
  { table: "ideas", module: "ideias", fields: ["title", "excerpt", "content"], hasSlug: true },
  { table: "news", module: "noticias", fields: ["title", "excerpt", "content"], hasSlug: true },
  { table: "albuns", module: "comunidade", fields: ["title", "description"], hasSlug: true },
  { table: "events", module: "agenda", fields: ["title", "description", "location"], hasSlug: false },
];

export async function searchAll(q: string) {
  const term = q.trim();
  if (!term) return [];
  const supabase = await createClient();
  const results = await Promise.all(
    CONTENT.map(async ({ table, module, fields, hasSlug }) => {
      const { data: rows } = await supabase
        .from(table)
        .select(hasSlug ? "title,slug" : "title")
        .eq("status", "publicado")
        .is("deleted_at", null)
        .or(fields.map((f) => `${f}.ilike.%${term}%`).join(","))
        .limit(10);
      return ((rows ?? []) as unknown as { title: string; slug?: string }[]).map(
        (r): SearchRow => ({ module, title: r.title, slug: r.slug ?? null })
      );
    })
  );
  return groupResults(results.flat());
}
