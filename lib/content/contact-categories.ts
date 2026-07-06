export const CONTACT_CATEGORIES = [
  "saude",
  "educacao",
  "seguranca",
  "assistencia_social",
  "meu_bairro",
  "denuncia",
  "sugestao",
  "outro",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export const CONTACT_CATEGORY_LABELS: Record<ContactCategory, string> = {
  saude: "Saúde",
  educacao: "Educação",
  seguranca: "Segurança Pública",
  assistencia_social: "Assistência Social",
  meu_bairro: "Meu Bairro",
  denuncia: "Denúncia",
  sugestao: "Sugestão ou Proposta",
  outro: "Outro assunto",
};
