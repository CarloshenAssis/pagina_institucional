// Helper puro (arquivo irmão do actions.ts — Next 16 não permite exports
// síncronos em arquivos "use server").
export function buildWhatsAppLink(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}
