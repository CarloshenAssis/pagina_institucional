// Normaliza o campo "WhatsApp" das Configurações: aceita tanto um link pronto
// (https://wa.me/... ou api.whatsapp.com) quanto um número de telefone digitado
// em qualquer formato — ex.: "(12) 99184-1312" — e sempre devolve um link
// clicável de verdade. Sem isso, um número puro vira um <a href> quebrado.
export function whatsappLink(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}`;
}
