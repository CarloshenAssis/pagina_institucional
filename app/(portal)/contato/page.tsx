export const metadata = { title: "Contato" };

import { createClient } from "@/lib/supabase/server";
import { settingsToRecord } from "@/app/admin/(painel)/configuracoes/settings-utils";
import { SectionHeading } from "@/components/portal/section-heading";
import { ContactForm } from "./form";

export default async function ContatoPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("global_settings").select("key, value");
  const settings = settingsToRecord(rows ?? []);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
  const enabled = Boolean(
    siteKey && process.env.TURNSTILE_SECRET_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading
        eyebrow="Contato"
        title="Vamos conversar?"
        subtitle="Envie sua mensagem, sugestão ou convite."
      />
      <div className="grid gap-12 md:grid-cols-[3fr_2fr]">
        <ContactForm siteKey={siteKey} enabled={enabled} />
        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-gold">Canais</span>
            {settings.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="underline text-primary">
                {settings.contact_email}
              </a>
            )}
            {settings.contact_phone && <span>{settings.contact_phone}</span>}
            {settings.whatsapp_url && (
              <a href={settings.whatsapp_url} target="_blank" rel="noreferrer" className="underline text-primary">
                WhatsApp
              </a>
            )}
            {settings.address && <span className="text-foreground/70">{settings.address}</span>}
          </div>
          {settings.map_embed_url && (
            <iframe
              src={settings.map_embed_url}
              title="Mapa do endereço institucional"
              className="w-full h-64 border-0"
              loading="lazy"
            />
          )}
        </aside>
      </div>
    </div>
  );
}
