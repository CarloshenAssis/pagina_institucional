import Link from "next/link";
import type { NavItem } from "./nav";

export function Footer({
  siteName,
  settings,
  items,
}: {
  siteName: string;
  settings: Record<string, string | null>;
  items: NavItem[];
}) {
  const socials = [
    { label: "Instagram", url: settings.instagram_url },
    { label: "Facebook", url: settings.facebook_url },
    { label: "WhatsApp", url: settings.whatsapp_url },
  ].filter((s) => s.url);

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="mx-auto max-w-6xl px-5 py-12 grid gap-10 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="font-display font-semibold text-xl">{siteName}</span>
          {settings.short_description && (
            <p className="text-sm text-primary-foreground/70 max-w-xs">{settings.short_description}</p>
          )}
        </div>
        <nav className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-secondary">Navegação</span>
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-secondary">Redes sociais</span>
          {socials.length === 0 && <span className="text-sm text-primary-foreground/60">—</span>}
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url!}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-6xl px-5 py-4 text-xs text-primary-foreground/60 flex flex-wrap gap-x-6 gap-y-1">
          <span>© {new Date().getFullYear()} {siteName}. Todos os direitos reservados.</span>
          {settings.footer_privacy_text && <span>{settings.footer_privacy_text}</span>}
          {settings.footer_terms_text && <span>{settings.footer_terms_text}</span>}
        </div>
      </div>
    </footer>
  );
}
