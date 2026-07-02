export interface NavItem {
  label: string;
  href: string;
}

// Itens da navegação pública. Agenda some quando a chave global
// agenda_page_enabled não está em 'true' (toggle do admin).
export function visibleNavItems(settings: Record<string, string | null | undefined>): NavItem[] {
  const items: NavItem[] = [
    { label: "Início", href: "/" },
    { label: "Sobre", href: "/sobre" },
    { label: "Trajetória", href: "/trajetoria" },
    { label: "Projetos", href: "/projetos" },
    { label: "Comunidade", href: "/comunidade" },
    { label: "Ideias", href: "/ideias" },
    { label: "Notícias", href: "/noticias" },
    { label: "Agenda", href: "/agenda" },
    { label: "Contato", href: "/contato" },
  ];
  return items.filter((i) => i.href !== "/agenda" || settings.agenda_page_enabled === "true");
}
