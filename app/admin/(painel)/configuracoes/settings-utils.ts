// Helpers puros (arquivo irmão do actions.ts — regra do Next 16).
export function settingsToRecord(
  rows: { key: string; value: string | null }[]
): Record<string, string | null> {
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function metaDescriptionLength(value: string): { count: number; max: number } {
  return { count: value.length, max: 160 };
}
