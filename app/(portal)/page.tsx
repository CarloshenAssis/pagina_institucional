import { createClient } from "@/lib/supabase/server";
import { orderedVisibleSections } from "@/lib/content/home-render";
import { settingsToRecord } from "@/app/admin/(painel)/configuracoes/settings-utils";
import {
  HeroSection,
  SobreSection,
  ProjetosSection,
  ComunidadeSection,
  IdeiasSection,
  NoticiasSection,
  AgendaSection,
  ContatoSection,
} from "@/components/portal/home-sections";

const published = <T,>(q: T) => q;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("home_config").select("*").eq("id", 1).maybeSingle();
  const sections = orderedVisibleSections(
    config?.sections_order ?? [],
    config?.sections_visible ?? {}
  );

  const wants = (key: string) => sections.includes(key);
  const empty = { data: [] as Record<string, unknown>[] };

  const [settingsRes, sobreRes, projetosRes, albunsRes, ideiasRes, noticiasRes, eventosRes] =
    await Promise.all([
      supabase.from("global_settings").select("key, value"),
      wants("sobre")
        ? supabase.from("sobre").select("title, subtitle, text_content, photo_url").eq("id", 1).maybeSingle()
        : { data: null },
      wants("projetos")
        ? published(
            supabase
              .from("projects")
              .select("*, categories(name)")
              .eq("status", "publicado")
              .is("deleted_at", null)
              .eq("featured", true)
              .order("published_at", { ascending: false })
              .limit(3)
          )
        : empty,
      wants("comunidade")
        ? supabase
            .from("albuns")
            .select("id, slug, title, cover_url")
            .eq("status", "publicado")
            .is("deleted_at", null)
            .order("published_at", { ascending: false })
            .limit(4)
        : empty,
      wants("ideias")
        ? supabase
            .from("ideas")
            .select("*, categories(name)")
            .eq("status", "publicado")
            .is("deleted_at", null)
            .eq("featured", true)
            .order("published_at", { ascending: false })
            .limit(2)
        : empty,
      wants("noticias")
        ? supabase
            .from("news")
            .select("*, categories(name)")
            .eq("status", "publicado")
            .is("deleted_at", null)
            .order("published_at", { ascending: false })
            .limit(4)
        : empty,
      wants("agenda")
        ? supabase
            .from("events")
            .select("id, title, date, location")
            .eq("status", "publicado")
            .is("deleted_at", null)
            .gte("date", new Date().toISOString())
            .order("date", { ascending: true })
            .limit(3)
        : empty,
    ]);

  const settings = settingsToRecord(settingsRes.data ?? []);
  const withCategory = (rows: Record<string, unknown>[] | null) =>
    (rows ?? []).map((r) => ({
      ...r,
      category_name: (r.categories as { name?: string } | null)?.name ?? null,
    }));

  const agendaEnabled = settings.agenda_page_enabled === "true";

  const renderers: Record<string, () => React.ReactNode> = {
    hero: () => <HeroSection key="hero" config={config ?? {}} />,
    sobre: () => <SobreSection key="sobre" sobre={sobreRes.data} />,
    projetos: () => <ProjetosSection key="projetos" rows={withCategory(projetosRes.data) as never} />,
    comunidade: () => <ComunidadeSection key="comunidade" rows={(albunsRes.data ?? []) as never} />,
    ideias: () => <IdeiasSection key="ideias" rows={withCategory(ideiasRes.data) as never} />,
    noticias: () => <NoticiasSection key="noticias" rows={withCategory(noticiasRes.data) as never} />,
    agenda: () => (agendaEnabled ? <AgendaSection key="agenda" rows={(eventosRes.data ?? []) as never} /> : null),
    contato: () => <ContatoSection key="contato" settings={settings} />,
  };

  return <>{sections.map((key) => renderers[key]?.())}</>;
}
