import type { MetadataRoute } from "next";
import { createClient as createRawClient } from "@supabase/supabase-js";

// Sitemap dinâmico: rotas fixas + slugs publicados. Usa client anon puro
// (sem cookies — este arquivo roda fora do contexto de request de página).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const supabase = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/sobre",
    "/trajetoria",
    "/projetos",
    "/comunidade",
    "/ideias",
    "/noticias",
    "/agenda",
    "/contato",
  ].map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const }));

  const tables: { table: string; path: string }[] = [
    { table: "projects", path: "/projetos" },
    { table: "albuns", path: "/comunidade" },
    { table: "ideas", path: "/ideias" },
    { table: "news", path: "/noticias" },
  ];

  const dynamicRoutes = await Promise.all(
    tables.map(async ({ table, path }) => {
      const { data } = await supabase
        .from(table)
        .select("slug, published_at")
        .eq("status", "publicado")
        .is("deleted_at", null);
      return (data ?? []).map((r) => ({
        url: `${base}${path}/${r.slug}`,
        lastModified: r.published_at ?? undefined,
      }));
    })
  );

  return [...staticRoutes, ...dynamicRoutes.flat()];
}
