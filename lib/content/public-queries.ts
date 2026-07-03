// Consultas do portal público: sempre conteúdo publicado e não-deletado.
// O RLS do banco já impõe isso para o papel anon — os filtros aqui reforçam
// e mantêm o comportamento igual em dev/testes.
import { createClient } from "@/lib/supabase/server";
import { pageRange } from "./pagination";

export type PublicTable = "projects" | "ideas" | "news" | "albuns";

export async function listPublished(
  table: PublicTable,
  { page = 1, perPage = 12, categorySlug }: { page?: number; perPage?: number; categorySlug?: string } = {}
) {
  const supabase = await createClient();
  const { from, to } = pageRange(page, perPage);
  let query = supabase
    .from(table)
    .select("*, categories(name, slug)", { count: "exact" })
    .eq("status", "publicado")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .range(from, to);
  if (categorySlug) query = query.eq("categories.slug", categorySlug);
  const { data, count, error } = await query;
  if (error) throw error;
  let rows = (data ?? []).map((r) => ({ ...r, category_name: r.categories?.name ?? null }));
  // filtro por categoria via embed: o PostgREST não filtra a linha-pai, só o embed;
  // removemos aqui as linhas cujo embed não casou.
  if (categorySlug) rows = rows.filter((r) => r.categories?.slug === categorySlug);
  return { rows, total: count ?? 0 };
}

export async function listPublicCategories(module: "projetos" | "ideias" | "noticias" | "comunidade") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("module", module)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedBySlug(table: PublicTable, slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("status", "publicado")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, category_name: data.categories?.name ?? null };
}
