import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { themeToCssVars, type ThemeRow } from "@/lib/content/theme";
import { settingsToRecord } from "@/app/admin/(painel)/configuracoes/settings-utils";
import { visibleNavItems } from "@/components/portal/nav";
import { Header } from "@/components/portal/header";
import { Footer } from "@/components/portal/footer";
import { WhatsAppFloat } from "@/components/portal/whatsapp-float";
import { whatsappLink } from "@/lib/content/whatsapp";
import { ServiceWorkerRegister } from "@/components/portal/service-worker-register";
import { PushNotifications } from "@/components/portal/push-notifications";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("global_settings").select("key, value");
  const s = settingsToRecord(rows ?? []);
  const siteName = s.site_name || "Portal Institucional";
  const title = s.seo_meta_title || siteName;
  const description = s.seo_meta_description || s.short_description || undefined;
  return {
    // Sem isso, URLs relativas em metadata (ex.: imagens) resolvem errado —
    // aqui as imagens já são absolutas, mas é a base correta pra qualquer
    // metadata futura que use caminho relativo.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: title, template: `%s · ${siteName}` },
    description,
    openGraph: {
      siteName,
      title,
      description,
      images: s.seo_og_image_url ? [s.seo_og_image_url] : undefined,
    },
    icons: s.favicon_url ? { icon: s.favicon_url } : undefined,
    verification: s.google_site_verification ? { google: s.google_site_verification } : undefined,
  };
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [{ data: settingRows }, { data: theme }] = await Promise.all([
    supabase.from("global_settings").select("key, value"),
    supabase.from("theme_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  const settings = settingsToRecord(settingRows ?? []);
  const items = visibleNavItems(settings);
  const siteName = settings.site_name || "Portal Institucional";
  const cssVars = theme ? themeToCssVars(theme as ThemeRow) : "";

  return (
    <>
      {cssVars && <style>{`:root { ${cssVars} }`}</style>}
      <Header siteName={siteName} logoUrl={settings.logo_url ?? null} items={items} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer siteName={siteName} settings={settings} items={items} />
      <WhatsAppFloat url={settings.whatsapp_url ? whatsappLink(settings.whatsapp_url) : null} />
      <ServiceWorkerRegister />
      <PushNotifications vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} />
    </>
  );
}
