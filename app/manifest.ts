import type { MetadataRoute } from "next";
import { createClient as createRawClient } from "@supabase/supabase-js";

// Dinâmico como sitemap.ts: client anon puro, sem cookies (roda fora do
// contexto de request de página). Ícone e cor vêm das configurações do
// mandato, então cada cliente tem o "app" com a própria identidade.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const supabase = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const [{ data: settingsRows }, { data: theme }] = await Promise.all([
    supabase.from("global_settings").select("key, value"),
    supabase.from("theme_settings").select("primary_color").eq("id", 1).maybeSingle(),
  ]);

  const settings = Object.fromEntries((settingsRows ?? []).map((r) => [r.key, r.value]));
  const name = settings.site_name || "Portal Institucional";
  const icon = settings.favicon_url;

  return {
    name,
    short_name: name,
    description: settings.short_description || undefined,
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: theme?.primary_color || "#1B2D6B",
    icons: icon
      ? [
          { src: icon, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: icon, sizes: "512x512", type: "image/png", purpose: "any" },
        ]
      : [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
