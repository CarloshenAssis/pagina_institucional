export type SearchModule = "projetos" | "ideias" | "noticias" | "comunidade" | "agenda";

export interface SearchRow {
  module: SearchModule;
  title: string;
  slug: string | null;
}

export interface SearchGroup {
  module: SearchModule;
  label: string;
  items: { title: string; href: string }[];
}

const MODULE_LABELS: Record<SearchModule, string> = {
  projetos: "Projetos",
  ideias: "Ideias",
  noticias: "Notícias",
  comunidade: "Comunidade",
  agenda: "Agenda",
};

export function groupResults(rows: SearchRow[]): SearchGroup[] {
  const groups: SearchGroup[] = [];
  for (const row of rows) {
    let group = groups.find((g) => g.module === row.module);
    if (!group) {
      group = { module: row.module, label: MODULE_LABELS[row.module], items: [] };
      groups.push(group);
    }
    group.items.push({
      title: row.title,
      href: row.module === "agenda" ? "/agenda" : `/${row.module}/${row.slug}`,
    });
  }
  return groups;
}
