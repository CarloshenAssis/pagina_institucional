export interface ThemeRow {
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  text_primary_color: string | null;
  text_secondary_color: string | null;
}

const TOKEN_TO_VAR: [keyof ThemeRow, string][] = [
  ["primary_color", "--primary"],
  ["secondary_color", "--secondary"],
  ["accent_color", "--accent"],
  ["background_color", "--background"],
  ["text_primary_color", "--foreground"],
  ["text_secondary_color", "--muted-foreground"],
];

export const THEME_COLOR_KEYS: (keyof ThemeRow)[] = TOKEN_TO_VAR.map(([key]) => key);

export const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Converte o registro de theme_settings em CSS custom properties.
// Só emite cores hex válidas (o valor vem do banco e vai para um <style>
// inline — o filtro impede injeção de CSS); vazios mantêm o default do CSS.
export function themeToCssVars(row: ThemeRow): string {
  return TOKEN_TO_VAR.filter(([key]) => row[key] && HEX.test(row[key]!))
    .map(([key, cssVar]) => `${cssVar}: ${row[key]};`)
    .join(" ");
}
