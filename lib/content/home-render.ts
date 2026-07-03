import { CANONICAL_HOME_SECTIONS } from "./home-sections";

const CANONICAL_KEYS = new Set<string>(CANONICAL_HOME_SECTIONS.map((s) => s.key));

// Ordem final das seções da Home: segue sections_order, remove ocultas
// (sections_visible[key] === false) e ignora chaves fora da lista canônica.
export function orderedVisibleSections(
  order: string[],
  visible: Record<string, boolean | undefined>
): string[] {
  return order.filter((key) => CANONICAL_KEYS.has(key) && visible[key] !== false);
}
