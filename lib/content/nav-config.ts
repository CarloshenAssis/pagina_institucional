export const NAV_SECTIONS = [
  { label: null, items: [{ label: "Dashboard", href: "/admin" }] },
  {
    label: "Conteúdo",
    items: [
      { label: "Home", href: "/admin/home" },
      { label: "Sobre", href: "/admin/sobre" },
      { label: "Trajetória", href: "/admin/trajetoria" },
      { label: "Projetos", href: "/admin/projetos" },
      { label: "Comunidade", href: "/admin/comunidade" },
      { label: "Ideias", href: "/admin/ideias" },
      { label: "Notícias", href: "/admin/noticias" },
      { label: "Agenda", href: "/admin/agenda" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Mídias", href: "/admin/midias" },
      { label: "Caixa de Entrada", href: "/admin/mensagens" },
      { label: "Configurações", href: "/admin/configuracoes" },
    ],
  },
] as const;
