create type contact_category as enum (
  'saude',
  'educacao',
  'seguranca',
  'assistencia_social',
  'meu_bairro',
  'denuncia',
  'sugestao',
  'outro'
);

alter table contact_messages add column category contact_category not null default 'outro';
