export const CANONICAL_HOME_SECTIONS = [
  { key: "hero", name: "Hero (banner principal)" },
  { key: "sobre", name: "Sobre — resumo" },
  { key: "projetos", name: "Projetos em destaque" },
  { key: "comunidade", name: "Comunidade — últimas fotos" },
  { key: "ideias", name: "Ideias em destaque" },
  { key: "noticias", name: "Notícias recentes" },
  { key: "agenda", name: "Agenda" },
  { key: "contato", name: "Contato" },
] as const;

export function reorderSections(order: string[], key: string, newIndex: number): string[] {
  const withoutKey = order.filter((k) => k !== key);
  return [...withoutKey.slice(0, newIndex), key, ...withoutKey.slice(newIndex)];
}

export function toggleSection(
  visible: Record<string, boolean>,
  key: string
): Record<string, boolean> {
  return { ...visible, [key]: !visible[key] };
}
