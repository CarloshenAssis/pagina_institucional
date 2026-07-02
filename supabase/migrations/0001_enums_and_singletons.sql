create type content_status as enum ('rascunho', 'publicado', 'despublicado', 'arquivado', 'agendado');
create type project_stage as enum ('proposto', 'em_andamento', 'concluido');
create type message_status as enum ('nova', 'lida', 'respondida', 'arquivada');
create type media_type as enum ('imagem', 'video', 'documento', 'pdf');

create table theme_settings (
  id smallint primary key default 1 check (id = 1),
  primary_color text not null default '#1B2D6B',
  secondary_color text not null default '#C9A84C',
  accent_color text not null default '#E8327C',
  background_color text not null default '#F5F0E8',
  text_primary_color text not null default '#1B2D6B',
  text_secondary_color text not null default '#4A4A4A',
  updated_at timestamptz not null default now()
);
insert into theme_settings (id) values (1);

create table home_config (
  id smallint primary key default 1 check (id = 1),
  hero_photo_url text,
  hero_title text,
  hero_subtitle text,
  hero_slogan text,
  hero_btn1_text text,
  hero_btn1_url text,
  hero_btn2_text text,
  hero_btn2_url text,
  sections_order jsonb not null default '["hero","sobre","projetos","comunidade","ideias","noticias","agenda","contato"]',
  sections_visible jsonb not null default '{"hero":true,"sobre":true,"projetos":true,"comunidade":true,"ideias":true,"noticias":true,"agenda":true,"contato":true}',
  updated_at timestamptz not null default now()
);
insert into home_config (id) values (1);

-- title/subtitle/gallery_urls adicionados aqui: faltavam na definição original da
-- tabela no spec do portal, mas são exigidos pelo editor Sobre do spec do admin.
create table sobre (
  id smallint primary key default 1 check (id = 1),
  title text,
  subtitle text,
  text_content text,
  photo_url text,
  gallery_urls jsonb not null default '[]',
  video_url text,
  pdf_urls jsonb not null default '[]',
  values_list jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
insert into sobre (id) values (1);

create table global_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);
insert into global_settings (key, value) values
  ('logo_url', null), ('favicon_url', null), ('site_name', null), ('short_description', null),
  ('footer_privacy_text', null), ('footer_terms_text', null),
  ('contact_email', null), ('contact_phone', null), ('address', null), ('map_embed_url', null),
  ('instagram_url', null), ('facebook_url', null), ('whatsapp_url', null),
  ('seo_meta_title', null), ('seo_meta_description', null), ('seo_og_image_url', null),
  ('agenda_page_enabled', 'true');
