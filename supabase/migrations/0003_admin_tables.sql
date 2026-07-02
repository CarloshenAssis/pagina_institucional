create table media_library (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text,
  type media_type not null,
  filename text not null,
  size_bytes bigint,
  mime_type text,
  alt_text text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table revision_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  changed_fields jsonb not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create table admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  photo_url text,
  language text not null default 'pt-BR',
  theme_preference text not null default 'light',
  updated_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status message_status not null default 'nova',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table contact_rate_limit (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  submitted_at timestamptz not null default now()
);
create index contact_rate_limit_ip_idx on contact_rate_limit (ip, submitted_at);
