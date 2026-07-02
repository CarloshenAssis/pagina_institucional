create table categories (
  id uuid primary key default gen_random_uuid(),
  module text not null check (module in ('projetos','ideias','noticias','comunidade')),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (module, slug)
);

create table trajetoria_items (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  title text not null,
  description text,
  image_url text,
  video_url text,
  document_url text,
  order_index int not null default 0,
  status content_status not null default 'rascunho',
  scheduled_at timestamptz,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid references categories(id),
  status content_status not null default 'rascunho',
  project_stage project_stage not null default 'proposto',
  excerpt text,
  description text,
  cover_url text,
  gallery_urls jsonb not null default '[]',
  pdf_url text,
  video_url text,
  featured bool not null default false,
  seo jsonb not null default '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table albuns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid references categories(id),
  date date,
  description text,
  cover_url text,
  gallery_urls jsonb not null default '[]',
  video_urls jsonb not null default '[]',
  seo jsonb not null default '{}',
  status content_status not null default 'rascunho',
  scheduled_at timestamptz,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid references categories(id),
  author text,
  excerpt text,
  content text,
  cover_url text,
  video_url text,
  pdf_url text,
  featured bool not null default false,
  seo jsonb not null default '{}',
  status content_status not null default 'rascunho',
  scheduled_at timestamptz,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid references categories(id),
  author text,
  excerpt text,
  content text,
  cover_url text,
  gallery_urls jsonb not null default '[]',
  video_url text,
  pdf_url text,
  featured bool not null default false,
  seo jsonb not null default '{}',
  status content_status not null default 'rascunho',
  scheduled_at timestamptz,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date timestamptz not null,
  location text,
  external_url text,
  map_embed_url text,
  image_url text,
  status content_status not null default 'rascunho',
  scheduled_at timestamptz,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
