# Painel Administrativo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/admin` CMS panel (auth, schema, generic content module pattern, all 8 content modules, media library, inbox, settings, profile) on Next.js 14 + Supabase, shipped with zero seed content.

**Architecture:** Next.js App Router with Server Actions for all mutations (no separate REST API layer). Supabase Postgres holds all data with RLS enforcing public-read-published / authenticated-write. A single generic `ContentTable` + `ContentEditor` pair drives all 6 list-based modules (Trajetória, Projetos, Comunidade, Ideias, Notícias, Agenda), configured per module rather than reimplemented. Auth is Supabase Auth (single admin, email+password) gated by Next.js middleware.

**Tech Stack:** Next.js 14 (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth + Storage) · Tiptap · react-hook-form + zod · next-themes · Vitest + Testing Library.

**Specs:** `docs/superpowers/specs/2026-07-01-portal-institucional-design.md` (schema authority) and `docs/superpowers/specs/2026-07-01-portal-institucional-admin-design.md` (admin UI authority).

**Note on schema gap found while planning:** the portal spec's `sobre` table is missing `title`, `subtitle`, `gallery_urls` even though both the admin spec and the original brief require them. Task 6 below adds them — treat this plan as the corrected source of truth for that table.

---

## File Structure

```
app/
  admin/
    login/page.tsx
    layout.tsx                    # sidebar + topbar + auth guard
    page.tsx                      # dashboard
    home/page.tsx
    sobre/page.tsx
    trajetoria/{page.tsx, novo/page.tsx, [id]/page.tsx, lixeira/page.tsx}
    projetos/{...same...}
    comunidade/{...same...}
    ideias/{...same...}
    noticias/{...same...}
    agenda/{...same...}
    midias/page.tsx
    mensagens/page.tsx
    configuracoes/page.tsx
    perfil/page.tsx
lib/
  supabase/{client.ts, server.ts, middleware.ts}
  content/{types.ts, status.ts, slug.ts, actions.ts}   # generic module engine
  validations/{trajetoria.ts, projetos.ts, comunidade.ts, ideias.ts, noticias.ts, agenda.ts, contato.ts}
  turnstile.ts
  rate-limit.ts
components/
  admin/{sidebar.tsx, topbar.tsx, content-table.tsx, content-editor.tsx, status-actions-bar.tsx,
         rich-text-editor.tsx, media-picker.tsx, confirm-dialog.tsx, trash-view.tsx, revision-history.tsx}
  ui/  # shadcn-generated
supabase/
  migrations/
    0001_enums_and_singletons.sql
    0002_categories_and_content.sql
    0003_admin_tables.sql
    0004_rls_policies.sql
    0005_revision_log_triggers.sql
    0006_pg_cron_jobs.sql
scripts/create-admin-user.ts
middleware.ts
vitest.config.ts
```

---

## Phase 0 — Project Setup

### Task 1: Scaffold Next.js + Tailwind v4 + TypeScript

**Files:**
- Create: whole project scaffold via CLI
- Modify: `app/globals.css`

- [ ] **Step 1: Scaffold**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
```
Expected: project created in current directory (PAGINA_INSTITUICIONAL), `package.json` present.

- [ ] **Step 2: Upgrade to Tailwind v4**

Run:
```bash
npm install tailwindcss@latest @tailwindcss/postcss@latest
```

Replace `postcss.config.mjs`:
```js
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
```

Replace top of `app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-primary: #1B2D6B;
  --color-secondary: #C9A84C;
  --color-accent: #E8327C;
  --color-background: #F5F0E8;
  --color-text-primary: #1B2D6B;
  --color-text-secondary: #4a4a4a;
  --font-display: "Fraunces", serif;
  --font-body: "DM Sans", sans-serif;
}
```
(These 6 vars are overridden at runtime from `theme_settings` — see Task 30 in the portal-público plan, not this one. Hardcoded values here are the fallback defaults from the design spec.)

- [ ] **Step 3: Verify dev server boots**

Run: `npm run dev` then `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
Expected: `200`

- [ ] **Step 4: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 14 + Tailwind v4"
```

---

### Task 2: Install and init shadcn/ui

**Files:**
- Create: `components.json`, `components/ui/*` (generated)
- Modify: `app/globals.css`, `lib/utils.ts`

- [ ] **Step 1: Init shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```
Expected: `components.json` created, `lib/utils.ts` created with `cn()` helper.

- [ ] **Step 2: Add the components this plan needs**

Run:
```bash
npx shadcn@latest add button input textarea label select switch table tabs dialog sheet toast sonner badge card separator dropdown-menu avatar skeleton
```
Expected: files appear under `components/ui/`.

- [ ] **Step 3: Verify a component renders**

Modify `app/page.tsx` to render `<Button>Teste</Button>` from `@/components/ui/button`, run `npm run dev`, open `http://localhost:3000`.
Expected: button visible, styled.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: install and init shadcn/ui"
```

---

### Task 3: Supabase project + client setup

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `.env.local.example`
- Modify: `.gitignore`

- [ ] **Step 1: Create Supabase project**

Manual (Supabase dashboard or `mcp__supabase__create_project`): create project, note `Project URL`, `anon public key`, `service_role key`.

- [ ] **Step 2: Install deps**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Env file**

Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```
Copy to `.env.local` and fill with real values (never commit `.env.local`).

- [ ] **Step 4: Browser client**

Create `lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 5: Server client**

Create `lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component; middleware refreshes the session instead
          }
        },
      },
    }
  );
}

export function createServiceRoleClient() {
  const { createClient: createRaw } = require("@supabase/supabase-js");
  return createRaw(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

- [ ] **Step 6: Verify connection**

Create a throwaway `app/api/health/route.ts`:
```ts
import { createClient } from "@/lib/supabase/server";
export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.from("_none_").select("*").limit(1);
  return Response.json({ connected: !!error || true });
}
```
Run: `npm run dev` then `curl -s http://localhost:3000/api/health`
Expected: JSON response (any error is fine — it confirms the client reaches Supabase). Delete this route file afterward.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: wire up Supabase browser/server clients"
```

---

### Task 4: Configure Vitest

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Install**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
```

Create `vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add script**

Modify `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify with a throwaway test**

Create `lib/__smoke__.test.ts`:
```ts
import { describe, it, expect } from "vitest";
describe("smoke", () => {
  it("runs", () => expect(1 + 1).toBe(2));
});
```
Run: `npm test`
Expected: `1 passed`. Delete the file afterward.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: configure Vitest + Testing Library"
```

---

## Phase 1 — Database Schema

All migrations run via `supabase db push` (or `mcp__supabase__apply_migration`) against the project created in Task 3. Prerequisite: Supabase CLI installed and linked (`supabase link --project-ref <ref>`).

### Task 5: Enums + singleton config tables

**Files:**
- Create: `supabase/migrations/0001_enums_and_singletons.sql`

- [ ] **Step 1: Write migration**

```sql
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

-- title/subtitle/gallery_urls added here: missing from the original portal spec table
-- definition, required by the admin spec's Sobre editor and the original brief.
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
```

- [ ] **Step 2: Apply and verify**

Run: `supabase db push`
Then: `supabase db execute "select key from global_settings order by key;"` (or run the equivalent query in Supabase Studio SQL editor)
Expected: 17 rows returned, one per key above.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_enums_and_singletons.sql
git commit -m "feat(db): add enums and singleton config tables"
```

---

### Task 6: Categories + content tables

**Files:**
- Create: `supabase/migrations/0002_categories_and_content.sql`

- [ ] **Step 1: Write migration**

```sql
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
```

- [ ] **Step 2: Apply and verify**

Run: `supabase db push`
Then: `supabase db execute "select table_name from information_schema.tables where table_schema='public' and table_name in ('categories','trajetoria_items','projects','albuns','ideas','news','events') order by table_name;"`
Expected: all 7 table names returned.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_categories_and_content.sql
git commit -m "feat(db): add categories and content tables"
```

---

### Task 7: Admin-only tables

**Files:**
- Create: `supabase/migrations/0003_admin_tables.sql`

- [ ] **Step 1: Write migration**

```sql
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
```

- [ ] **Step 2: Apply and verify**

Run: `supabase db push`
Then: `supabase db execute "select table_name from information_schema.tables where table_schema='public' and table_name in ('media_library','revision_log','admin_profiles','contact_messages','contact_rate_limit') order by table_name;"`
Expected: all 5 table names returned.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0003_admin_tables.sql
git commit -m "feat(db): add media library, revision log, profiles, messages, rate limit tables"
```

---

### Task 8: RLS policies

**Files:**
- Create: `supabase/migrations/0004_rls_policies.sql`

- [ ] **Step 1: Write migration**

```sql
-- Content tables: public reads published+non-deleted rows, authenticated does everything.
do $$
declare t text;
begin
  foreach t in array array['trajetoria_items','projects','albuns','ideas','news','events'] loop
    execute format('alter table %I enable row level security', t);
    execute format($f$create policy "%1$s_public_read" on %1$I for select
      using (status = 'publicado' and deleted_at is null)$f$, t);
    execute format($f$create policy "%1$s_admin_all" on %1$I for all
      using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated')$f$, t);
  end loop;
end $$;

-- Singleton config tables + categories: public read always, authenticated write.
do $$
declare t text;
begin
  foreach t in array array['theme_settings','home_config','sobre','global_settings','categories'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "%1$s_public_read" on %1$I for select using (true)', t);
    execute format($f$create policy "%1$s_admin_write" on %1$I for insert with check (auth.role() = 'authenticated')$f$, t);
    execute format($f$create policy "%1$s_admin_update" on %1$I for update using (auth.role() = 'authenticated')$f$, t);
    execute format($f$create policy "%1$s_admin_delete" on %1$I for delete using (auth.role() = 'authenticated')$f$, t);
  end loop;
end $$;

-- Admin-only tables: no public access at all.
alter table media_library enable row level security;
create policy "media_library_admin_all" on media_library for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table revision_log enable row level security;
create policy "revision_log_admin_read" on revision_log for select using (auth.role() = 'authenticated');
-- inserts happen only via the trigger (Task 9), running as the table owner, so no insert policy needed.

alter table admin_profiles enable row level security;
create policy "admin_profiles_own_row" on admin_profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

alter table contact_messages enable row level security;
create policy "contact_messages_admin_all" on contact_messages for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- No public insert policy: the contact form writes via a Server Action using the
-- service-role client (Task 33), after Turnstile + rate-limit checks. This keeps the
-- table fully closed to the anon key instead of trusting client-side RLS alone.

alter table contact_rate_limit enable row level security;
-- No policies at all: only the service-role client (which bypasses RLS) touches this table.
```

- [ ] **Step 2: Apply**

Run: `supabase db push`

- [ ] **Step 3: Verify public read blocks drafts and blocks writes**

Create `tests/integration/rls.test.ts` (requires `supabase start` running locally — see file header):
```ts
// Prerequisite: `supabase start` running, and this project's local anon key in
// SUPABASE_TEST_URL / SUPABASE_TEST_ANON_KEY env vars (see .env.test.example).
import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const anon = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_ANON_KEY!
);

describe("RLS on projects", () => {
  it("anon cannot insert", async () => {
    const { error } = await anon
      .from("projects")
      .insert({ title: "x", slug: "x-" + Date.now() });
    expect(error).not.toBeNull();
  });

  it("anon cannot read a draft row it doesn't own", async () => {
    const { data } = await anon
      .from("projects")
      .select("*")
      .eq("status", "rascunho");
    expect(data).toEqual([]);
  });
});
```

Create `.env.test.example`:
```
SUPABASE_TEST_URL=http://127.0.0.1:54321
SUPABASE_TEST_ANON_KEY=
```

Run: `supabase start` (once), copy `.env.test.example` to `.env.test` with the printed local anon key, then `npm test -- tests/integration/rls.test.ts`
Expected: 2 passed.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0004_rls_policies.sql tests/integration/rls.test.ts .env.test.example
git commit -m "feat(db): add RLS policies for all tables"
```

---

### Task 9: Revision log triggers

**Files:**
- Create: `supabase/migrations/0005_revision_log_triggers.sql`

- [ ] **Step 1: Write migration**

```sql
create or replace function log_revision() returns trigger as $$
declare
  changed jsonb := '{}'::jsonb;
  key text;
begin
  for key in select jsonb_object_keys(to_jsonb(new)) loop
    if to_jsonb(old) -> key is distinct from to_jsonb(new) -> key then
      changed := changed || jsonb_build_object(key, jsonb_build_object(
        'from', to_jsonb(old) -> key, 'to', to_jsonb(new) -> key
      ));
    end if;
  end loop;
  if changed <> '{}'::jsonb then
    insert into revision_log (table_name, record_id, changed_fields, changed_by)
    values (TG_TABLE_NAME, new.id, changed, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer;

do $$
declare t text;
begin
  foreach t in array array['trajetoria_items','projects','albuns','ideas','news','events'] loop
    execute format('create trigger %1$I_revision after update on %1$I
      for each row execute function log_revision()', t);
  end loop;
end $$;
```

- [ ] **Step 2: Apply and verify**

Run: `supabase db push`
Then, in Supabase Studio SQL editor as an authenticated session (or via a signed-in test client): update any column on a test row in `projects`, then `select * from revision_log order by changed_at desc limit 1;`
Expected: one row with `table_name = 'projects'` and `changed_fields` containing the changed column.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0005_revision_log_triggers.sql
git commit -m "feat(db): add revision_log triggers on content tables"
```

---

### Task 10: pg_cron jobs

**Files:**
- Create: `supabase/migrations/0006_pg_cron_jobs.sql`

- [ ] **Step 1: Write migration**

```sql
create extension if not exists pg_cron with schema extensions;

-- Flip scheduled -> publicado when scheduled_at has passed, every 5 minutes.
create or replace function publish_scheduled_content() returns void as $$
declare t text;
begin
  foreach t in array array['trajetoria_items','projects','albuns','ideas','news','events'] loop
    execute format($f$update %1$I set status = 'publicado', published_at = now()
      where status = 'agendado' and scheduled_at <= now()$f$, t);
  end loop;
end;
$$ language plpgsql security definer;

select cron.schedule('publish-scheduled-content', '*/5 * * * *',
  'select publish_scheduled_content();');

-- Permanently delete soft-deleted rows older than 30 days, daily at 03:00.
create or replace function purge_trash() returns void as $$
declare t text;
begin
  foreach t in array array['trajetoria_items','projects','albuns','ideas','news','events','media_library','contact_messages'] loop
    execute format($f$delete from %1$I where deleted_at is not null and deleted_at < now() - interval '30 days'$f$, t);
  end loop;
end;
$$ language plpgsql security definer;

select cron.schedule('purge-trash', '0 3 * * *', 'select purge_trash();');

-- Rate-limit table cleanup, daily at 03:10.
select cron.schedule('purge-rate-limit', '10 3 * * *',
  $$delete from contact_rate_limit where submitted_at < now() - interval '24 hours'$$);
```

- [ ] **Step 2: Apply and verify**

Run: `supabase db push`
Then: `supabase db execute "select jobname, schedule from cron.job order by jobname;"`
Expected: 3 rows — `publish-scheduled-content`, `purge-rate-limit`, `purge-trash`.

**If this fails** with "extension pg_cron does not exist": enable it manually first in Supabase Dashboard → Database → Extensions → search `pg_cron` → Enable, then re-run.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0006_pg_cron_jobs.sql
git commit -m "feat(db): add pg_cron jobs for scheduled publish and cleanup"
```

---

## Phase 2 — Auth

### Task 11: Create the admin user

**Files:**
- Create: `scripts/create-admin-user.ts`

- [ ] **Step 1: Write the script**

```ts
// One-time setup script. Run once per environment, then delete/ignore.
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error("Usage: tsx scripts/create-admin-user.ts <email> <password>");
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  await supabase.from("admin_profiles").insert({
    id: data.user.id,
    name: "Administrador",
  });
  console.log("Admin user created:", data.user.id);
}

main();
```

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/create-admin-user.ts admin@example.com "SenhaForte123!"`
Expected: prints `Admin user created: <uuid>`.

- [ ] **Step 3: Verify**

Run: `supabase db execute "select id, name from admin_profiles;"`
Expected: 1 row.

- [ ] **Step 4: Commit**

```bash
git add scripts/create-admin-user.ts
git commit -m "feat: add one-time admin user creation script"
```

---

### Task 12: Login page + server action

**Files:**
- Create: `app/admin/login/page.tsx`, `app/admin/login/actions.ts`
- Test: `app/admin/login/actions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { loginSchema } from "./actions";

describe("loginSchema", () => {
  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "123456" });
    expect(result.success).toBe(false);
  });
  it("rejects a short password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "123" });
    expect(result.success).toBe(false);
  });
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "123456" });
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- app/admin/login/actions.test.ts`
Expected: FAIL — `loginSchema` is not exported from a file that doesn't exist yet.

- [ ] **Step 3: Implement the server action**

```ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "E-mail ou senha inválidos." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Credenciais incorretas." };
  }
  redirect("/admin");
}
```

Run: `npm install zod`

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- app/admin/login/actions.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Build the login page**

```tsx
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <form
        action={async (formData) => {
          "use server";
          const result = await login(formData);
          return result;
        }}
        className="w-full max-w-sm bg-white p-10 flex flex-col gap-5"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-secondary">
          Painel administrativo
        </span>
        <h1 className="font-display text-2xl">Entrar</h1>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit">Entrar no painel →</Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/admin/login`, submit the admin credentials from Task 11.
Expected: redirected to `/admin` (404 is fine for now — that page doesn't exist until Task 14).

- [ ] **Step 7: Commit**

```bash
git add app/admin/login
git commit -m "feat(admin): add login page and server action"
```

---

### Task 13: Auth middleware protecting `/admin`

**Files:**
- Create: `middleware.ts`, `lib/supabase/middleware.ts`
- Test: `middleware.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { isProtectedPath } from "./middleware";

describe("isProtectedPath", () => {
  it("protects /admin routes", () => expect(isProtectedPath("/admin")).toBe(true));
  it("protects nested /admin routes", () => expect(isProtectedPath("/admin/projetos")).toBe(true));
  it("does not protect the login page", () => expect(isProtectedPath("/admin/login")).toBe(false));
  it("does not protect public routes", () => expect(isProtectedPath("/projetos")).toBe(false));
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- middleware.test.ts`
Expected: FAIL — `isProtectedPath` not defined.

- [ ] **Step 3: Implement**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith("/admin") && pathname !== "/admin/login";
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return response;
}
```

Move `isProtectedPath`/`updateSession` into `lib/supabase/middleware.ts`, re-export from root:

Create `middleware.ts`:
```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export { isProtectedPath } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
```
Move the `middleware.test.ts` content to import from `@/lib/supabase/middleware` instead of `./middleware`.

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/supabase/middleware.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/admin` in an incognito window (no session).
Expected: redirected to `/admin/login`.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts lib/supabase/middleware.ts lib/supabase/middleware.test.ts
git commit -m "feat(admin): add auth middleware protecting /admin routes"
```

---

## Phase 3 — Admin Shell

### Task 14: Sidebar navigation

**Files:**
- Create: `components/admin/sidebar.tsx`, `lib/content/nav-config.ts`
- Test: `lib/content/nav-config.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { NAV_SECTIONS } from "./nav-config";

describe("NAV_SECTIONS", () => {
  it("has Dashboard as the first item", () => {
    expect(NAV_SECTIONS[0].items[0].href).toBe("/admin");
  });
  it("has no separate SEO nav item (folded into Configurações)", () => {
    const allHrefs = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href));
    expect(allHrefs).not.toContain("/admin/seo");
  });
  it("includes all 6 content modules", () => {
    const allHrefs = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href));
    for (const href of ["/admin/trajetoria", "/admin/projetos", "/admin/comunidade",
      "/admin/ideias", "/admin/noticias", "/admin/agenda"]) {
      expect(allHrefs).toContain(href);
    }
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/content/nav-config.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
export const NAV_SECTIONS = [
  { label: null, items: [{ label: "Dashboard", href: "/admin" }] },
  {
    label: "Conteúdo",
    items: [
      { label: "Home", href: "/admin/home" },
      { label: "Sobre", href: "/admin/sobre" },
      { label: "Trajetória", href: "/admin/trajetoria" },
      { label: "Projetos", href: "/admin/projetos" },
      { label: "Comunidade", href: "/admin/comunidade" },
      { label: "Ideias", href: "/admin/ideias" },
      { label: "Notícias", href: "/admin/noticias" },
      { label: "Agenda", href: "/admin/agenda" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Mídias", href: "/admin/midias" },
      { label: "Caixa de Entrada", href: "/admin/mensagens" },
      { label: "Configurações", href: "/admin/configuracoes" },
    ],
  },
] as const;
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/content/nav-config.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Build the sidebar component**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/content/nav-config";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="w-60 shrink-0 bg-primary flex flex-col py-6 overflow-y-auto">
      <div className="px-6 pb-5 mb-3 border-b border-white/10">
        <span className="font-display font-semibold text-white">Painel</span>
      </div>
      {NAV_SECTIONS.map((section) => (
        <div key={section.label ?? "root"}>
          {section.label && (
            <span className="px-6 pt-4 pb-1.5 block text-[10px] font-bold tracking-wide uppercase text-white/35">
              {section.label}
            </span>
          )}
          {section.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-2.5 text-sm font-medium border-l-2",
                  active
                    ? "text-white bg-white/5 border-secondary"
                    : "text-white/55 border-transparent hover:text-white/80"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/admin/sidebar.tsx lib/content/nav-config.ts lib/content/nav-config.test.ts
git commit -m "feat(admin): add sidebar navigation"
```

---

### Task 15: Admin layout (topbar + auth guard)

**Files:**
- Create: `app/admin/layout.tsx`, `components/admin/topbar.tsx`

- [ ] **Step 1: Build the topbar**

```tsx
export function Topbar({ title }: { title: string }) {
  return (
    <div className="h-[74px] shrink-0 bg-white border-b flex items-center justify-between px-9 sticky top-0 z-10">
      <span className="font-display font-semibold text-xl">{title}</span>
    </div>
  );
}
```

- [ ] **Step 2: Build the layout with server-side auth guard**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto bg-background">{children}</div>
    </div>
  );
}
```

Note: this is a defense-in-depth check — the middleware from Task 13 already redirects unauthenticated requests, this guard covers any route that bypasses middleware (e.g. static export edge cases).

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, log in via `/admin/login`, confirm you land on `/admin` with sidebar visible and no redirect loop.
Expected: sidebar renders with all nav items, page doesn't 404 (dashboard content comes in Task 16).

- [ ] **Step 4: Commit**

```bash
git add app/admin/layout.tsx components/admin/topbar.tsx
git commit -m "feat(admin): add admin layout with sidebar and auth guard"
```

---

### Task 16: Dashboard page

**Files:**
- Create: `app/admin/page.tsx`, `lib/content/dashboard-queries.ts`
- Test: `lib/content/dashboard-queries.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { countPublishedThisMonth } from "./dashboard-queries";

describe("countPublishedThisMonth", () => {
  it("counts rows with published_at in the current calendar month", () => {
    const now = new Date("2026-07-15T12:00:00Z");
    const rows = [
      { published_at: "2026-07-01T00:00:00Z" },
      { published_at: "2026-06-30T23:59:59Z" },
      { published_at: "2026-07-14T10:00:00Z" },
    ];
    expect(countPublishedThisMonth(rows, now)).toBe(2);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/content/dashboard-queries.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
import { createClient } from "@/lib/supabase/server";

export function countPublishedThisMonth(
  rows: { published_at: string | null }[],
  now: Date
): number {
  return rows.filter((r) => {
    if (!r.published_at) return false;
    const d = new Date(r.published_at);
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  }).length;
}

const CONTENT_TABLES = ["projects", "news", "ideas", "events"] as const;

export async function getDashboardSummary() {
  const supabase = await createClient();

  const counts = await Promise.all(
    CONTENT_TABLES.map(async (table) => {
      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);
      return [table, count ?? 0] as const;
    })
  );

  const { count: unreadMessages } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "nova");

  const publishedRows = await Promise.all(
    CONTENT_TABLES.map(async (table) => {
      const { data } = await supabase.from(table).select("published_at").not("published_at", "is", null);
      return data ?? [];
    })
  );

  return {
    counts: Object.fromEntries(counts),
    unreadMessages: unreadMessages ?? 0,
    publishedThisMonth: countPublishedThisMonth(publishedRows.flat(), new Date()),
  };
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/content/dashboard-queries.test.ts`
Expected: 1 passed.

- [ ] **Step 5: Build the dashboard page**

```tsx
import { getDashboardSummary } from "@/lib/content/dashboard-queries";
import { Topbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const { counts, unreadMessages, publishedThisMonth } = await getDashboardSummary();

  const cards = [
    { label: "Projetos", value: counts.projects },
    { label: "Notícias", value: counts.news },
    { label: "Ideias", value: counts.ideas },
    { label: "Eventos", value: counts.events },
    { label: "Mensagens", value: unreadMessages },
  ];

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-9">
        <h2 className="font-display text-2xl mb-6">Bem-vindo de volta.</h2>
        <div className="grid grid-cols-6 gap-4 mb-8">
          {cards.map((c) => (
            <Card key={c.label} className="p-5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">{c.label}</span>
              <div className="font-display text-2xl">{c.value}</div>
            </Card>
          ))}
          <Card className="p-5 bg-primary text-white">
            <span className="text-[10px] font-bold uppercase text-secondary">Publicados no mês</span>
            <div className="font-display text-2xl">{publishedThisMonth}</div>
          </Card>
        </div>
        <div className="flex gap-3 flex-wrap mb-8">
          <Button asChild><Link href="/admin/projetos/novo">+ Novo Projeto</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/noticias/novo">+ Nova Notícia</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/ideias/novo">+ Nova Ideia</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/agenda/novo">+ Novo Evento</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/trajetoria/novo">+ Nova Etapa</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/comunidade/novo">+ Nova Galeria</Link></Button>
        </div>
      </div>
    </>
  );
}
```

(Recent-publications and recent-messages panels are added once the Trajetória/Projetos and Mensagens modules exist — deferred to keep this task's queries testable in isolation; folded into Task 22's shared query layer.)

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, log in, land on `/admin`.
Expected: 6 stat cards all showing `0`, 6 quick-action buttons visible (their target pages 404 until later tasks — expected at this point).

- [ ] **Step 7: Commit**

```bash
git add app/admin/page.tsx lib/content/dashboard-queries.ts lib/content/dashboard-queries.test.ts
git commit -m "feat(admin): add dashboard page with summary counts"
```

---

## Phase 4 — Generic Module Infrastructure

This is the shared engine every list-based module (Trajetória, Projetos, Comunidade, Ideias, Notícias, Agenda) is built on. Get this right once; modules in Phase 5 become thin configuration.

### Task 17: Slug utility

**Files:**
- Create: `lib/content/slug.ts`
- Test: `lib/content/slug.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => expect(slugify("Escola Nova Geração")).toBe("escola-nova-geracao"));
  it("strips accents", () => expect(slugify("Programação e Educação")).toBe("programacao-e-educacao"));
  it("collapses repeated separators", () => expect(slugify("A   B---C")).toBe("a-b-c"));
  it("strips leading/trailing hyphens", () => expect(slugify("-teste-")).toBe("teste"));
  it("strips punctuation", () => expect(slugify("Rede Saúde Já!")).toBe("rede-saude-ja"));
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/content/slug.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/content/slug.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/content/slug.ts lib/content/slug.test.ts
git commit -m "feat(content): add slugify utility"
```

---

### Task 18: Status types + base Zod schema

**Files:**
- Create: `lib/content/status.ts`, `lib/content/types.ts`
- Test: `lib/content/status.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { nextStatusOnPublish, STATUS_LABELS } from "./status";

describe("nextStatusOnPublish", () => {
  it("publishes immediately when no future date is given", () => {
    expect(nextStatusOnPublish(null)).toEqual({ status: "publicado", scheduled_at: null });
  });
  it("schedules when a future date is given", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(nextStatusOnPublish(future)).toEqual({ status: "agendado", scheduled_at: future });
  });
  it("publishes immediately when the given date is in the past", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(nextStatusOnPublish(past)).toEqual({ status: "publicado", scheduled_at: null });
  });
});

describe("STATUS_LABELS", () => {
  it("has a label for every status", () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual(
      ["agendado", "arquivado", "despublicado", "publicado", "rascunho"].sort()
    );
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/content/status.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
export type ContentStatus = "rascunho" | "publicado" | "despublicado" | "arquivado" | "agendado";

export const STATUS_LABELS: Record<ContentStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  despublicado: "Despublicado",
  arquivado: "Arquivado",
  agendado: "Agendado",
};

export function nextStatusOnPublish(
  scheduledAtInput: string | null
): { status: ContentStatus; scheduled_at: string | null } {
  if (!scheduledAtInput) return { status: "publicado", scheduled_at: null };
  const target = new Date(scheduledAtInput);
  if (target.getTime() <= Date.now()) return { status: "publicado", scheduled_at: null };
  return { status: "agendado", scheduled_at: scheduledAtInput };
}
```

Create `lib/content/types.ts`:
```ts
import type { ContentStatus } from "./status";

export interface BaseContentRow {
  id: string;
  status: ContentStatus;
  scheduled_at: string | null;
  published_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface ModuleConfig<TRow extends BaseContentRow> {
  table: string;
  labelSingular: string;
  labelPlural: string;
  titleColumn: keyof TRow & string;
  extraColumns: { key: keyof TRow & string; label: string }[];
  hasSlug: boolean;
  detailPath: (id: string) => string;
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/content/status.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/content/status.ts lib/content/types.ts lib/content/status.test.ts
git commit -m "feat(content): add status transition logic and shared types"
```

---

### Task 19: Generic content Server Actions factory

**Files:**
- Create: `lib/content/actions.ts`
- Test: `lib/content/actions.test.ts`

- [ ] **Step 1: Write the failing test**

Mock the Supabase server client so the factory's logic (not Supabase itself) is under test.

```ts
import { describe, it, expect, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: fromMock }),
}));

import { buildDuplicatePayload } from "./actions";

describe("buildDuplicatePayload", () => {
  it("appends (cópia) to the title and resets to rascunho", () => {
    const original = {
      id: "abc",
      title: "Escola Nova Geração",
      slug: "escola-nova-geracao",
      status: "publicado",
      scheduled_at: null,
      published_at: "2026-01-01T00:00:00Z",
      deleted_at: null,
      created_at: "2026-01-01T00:00:00Z",
      excerpt: "resumo",
    };
    const copy = buildDuplicatePayload(original, "title", "slug");
    expect(copy.title).toBe("Escola Nova Geração (cópia)");
    expect(copy.slug).toMatch(/^escola-nova-geracao-copia-/);
    expect(copy.status).toBe("rascunho");
    expect(copy.published_at).toBeNull();
    expect(copy).not.toHaveProperty("id");
    expect(copy).not.toHaveProperty("created_at");
    expect(copy.excerpt).toBe("resumo");
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/content/actions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextStatusOnPublish } from "./status";
import { slugify } from "./slug";

export function buildDuplicatePayload<T extends Record<string, unknown>>(
  original: T,
  titleKey: string,
  slugKey: string | null
): Record<string, unknown> {
  const { id, created_at, published_at, scheduled_at, ...rest } = original as Record<string, unknown>;
  const copy: Record<string, unknown> = {
    ...rest,
    status: "rascunho",
    published_at: null,
    scheduled_at: null,
  };
  copy[titleKey] = `${original[titleKey]} (cópia)`;
  if (slugKey) {
    copy[slugKey] = `${slugify(String(original[titleKey]))}-copia-${Date.now()}`;
  }
  return copy;
}

export function createModuleActions(table: string, revalidateBase: string) {
  return {
    async softDelete(id: string) {
      const supabase = await createClient();
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      revalidatePath(revalidateBase);
    },

    async restore(id: string) {
      const supabase = await createClient();
      const { error } = await supabase.from(table).update({ deleted_at: null }).eq("id", id);
      if (error) throw error;
      revalidatePath(revalidateBase);
    },

    async duplicate(id: string, titleKey: string, slugKey: string | null) {
      const supabase = await createClient();
      const { data: original, error: fetchError } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;
      const payload = buildDuplicatePayload(original, titleKey, slugKey);
      const { data: created, error: insertError } = await supabase
        .from(table)
        .insert(payload)
        .select("id")
        .single();
      if (insertError) throw insertError;
      revalidatePath(revalidateBase);
      return created.id as string;
    },

    async setStatus(id: string, action: "rascunho" | "despublicado" | "arquivado" | "publicar", scheduledAtInput: string | null) {
      const supabase = await createClient();
      const payload =
        action === "publicar"
          ? nextStatusOnPublish(scheduledAtInput)
          : { status: action, scheduled_at: null };
      const { error } = await supabase.from(table).update(payload).eq("id", id);
      if (error) throw error;
      revalidatePath(revalidateBase);
    },
  };
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/content/actions.test.ts`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/content/actions.ts lib/content/actions.test.ts
git commit -m "feat(content): add generic Server Actions factory (duplicate/status/soft-delete/restore)"
```

---

### Task 20: Generic `ContentTable` component

**Files:**
- Create: `components/admin/content-table.tsx`
- Test: `components/admin/content-table.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContentTable } from "./content-table";

const rows = [
  { id: "1", title: "Escola Nova Geração", status: "publicado" as const, extra: "Educação", date: "12 mar 2026" },
  { id: "2", title: "Corredor Verde", status: "rascunho" as const, extra: "Infraestrutura", date: "—" },
];

describe("ContentTable", () => {
  it("renders all rows initially", () => {
    render(
      <ContentTable
        rows={rows}
        titleKey="title"
        columns={[{ key: "extra", label: "Categoria" }, { key: "date", label: "Data" }]}
        onEdit={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("Escola Nova Geração")).toBeInTheDocument();
    expect(screen.getByText("Corredor Verde")).toBeInTheDocument();
  });

  it("filters rows by title as the user types", async () => {
    render(
      <ContentTable
        rows={rows}
        titleKey="title"
        columns={[{ key: "extra", label: "Categoria" }, { key: "date", label: "Data" }]}
        onEdit={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
      />
    );
    await userEvent.type(screen.getByPlaceholderText("Pesquisar..."), "Corredor");
    expect(screen.queryByText("Escola Nova Geração")).not.toBeInTheDocument();
    expect(screen.getByText("Corredor Verde")).toBeInTheDocument();
  });

  it("shows an inline confirm before calling onDelete", async () => {
    const onDelete = vi.fn();
    render(
      <ContentTable
        rows={rows}
        titleKey="title"
        columns={[{ key: "extra", label: "Categoria" }, { key: "date", label: "Data" }]}
        onEdit={() => {}}
        onDuplicate={() => {}}
        onDelete={onDelete}
      />
    );
    const [firstDeleteLink] = screen.getAllByText("Excluir");
    await userEvent.click(firstDeleteLink);
    expect(screen.getByText("Excluir?")).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText("Sim"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
```

Add `import { vi } from "vitest";` at the top alongside the existing import.

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- components/admin/content-table.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Column<T> {
  key: keyof T & string;
  label: string;
}

interface Props<T extends { id: string; status: string }> {
  rows: T[];
  titleKey: keyof T & string;
  columns: Column<T>[];
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  publicado: "bg-secondary text-primary",
  rascunho: "border border-primary/30 text-primary",
  agendado: "bg-accent/20 text-primary",
  despublicado: "text-muted-foreground",
  arquivado: "text-muted-foreground line-through",
};

export function ContentTable<T extends { id: string; status: string }>({
  rows,
  titleKey,
  columns,
  onEdit,
  onDuplicate,
  onDelete,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const filtered = rows.filter((row) =>
    String(row[titleKey]).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border">
      <div className="p-4 border-b">
        <Input
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-6 py-3 bg-background text-[10.5px] font-bold uppercase text-muted-foreground">
        <span>Título</span>
        {columns.map((c) => (
          <span key={c.key}>{c.label}</span>
        ))}
      </div>
      {filtered.map((row) => (
        <div key={row.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] px-6 py-4 border-t items-center">
          <span className="font-semibold">{String(row[titleKey])}</span>
          {columns.map((c) => {
            if (c.key === "status") {
              return (
                <span key="status" className={`text-[11px] font-bold uppercase w-fit px-2.5 py-1 ${STATUS_BADGE[row.status]}`}>
                  {row.status}
                </span>
              );
            }
            return <span key={c.key}>{String(row[c.key] ?? "—")}</span>;
          })}
          {confirmingId === row.id ? (
            <div className="flex gap-2.5 items-center">
              <span className="text-xs">Excluir?</span>
              <button className="text-xs font-bold text-red-700 underline" onClick={() => { onDelete(row.id); setConfirmingId(null); }}>
                Sim
              </button>
              <button className="text-xs font-bold underline" onClick={() => setConfirmingId(null)}>
                Não
              </button>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <button className="text-xs font-bold underline" onClick={() => onEdit(row.id)}>Editar</button>
              <button className="text-xs font-bold underline" onClick={() => onDuplicate(row.id)}>Duplicar</button>
              <button className="text-xs font-bold underline text-muted-foreground" onClick={() => setConfirmingId(row.id)}>Excluir</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- components/admin/content-table.test.tsx`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add components/admin/content-table.tsx components/admin/content-table.test.tsx
git commit -m "feat(admin): add generic ContentTable with functional search and inline delete confirm"
```

---

### Task 21: Generic `StatusActionsBar` component

**Files:**
- Create: `components/admin/status-actions-bar.tsx`
- Test: `components/admin/status-actions-bar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusActionsBar } from "./status-actions-bar";

describe("StatusActionsBar", () => {
  it("calls onAction with 'publicar' and no date when publishing immediately", async () => {
    const onAction = vi.fn();
    render(<StatusActionsBar scheduledAt={null} onAction={onAction} />);
    await userEvent.click(screen.getByText("Publicar →"));
    expect(onAction).toHaveBeenCalledWith("publicar", null);
  });

  it("shows 'Agendar' instead of 'Publicar' when a future date is set", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    render(<StatusActionsBar scheduledAt={future} onAction={() => {}} />);
    expect(screen.getByText("Agendar →")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- components/admin/status-actions-bar.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
"use client";

import { Button } from "@/components/ui/button";

type Action = "rascunho" | "despublicado" | "arquivado" | "publicar";

export function StatusActionsBar({
  scheduledAt,
  onAction,
}: {
  scheduledAt: string | null;
  onAction: (action: Action, scheduledAt: string | null) => void;
}) {
  const isFutureScheduled = !!scheduledAt && new Date(scheduledAt).getTime() > Date.now();

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => onAction("rascunho", null)}>Salvar rascunho</Button>
        <Button variant="outline" onClick={() => onAction("arquivado", null)}>Arquivar</Button>
        <Button variant="outline" onClick={() => onAction("despublicado", null)}>Despublicar</Button>
      </div>
      <Button onClick={() => onAction("publicar", scheduledAt)}>
        {isFutureScheduled ? "Agendar →" : "Publicar →"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- components/admin/status-actions-bar.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add components/admin/status-actions-bar.tsx components/admin/status-actions-bar.test.tsx
git commit -m "feat(admin): add StatusActionsBar (rascunho/despublicar/arquivar/publicar/agendar)"
```

---

### Task 22: `RichTextEditor` (Tiptap) wrapper

**Files:**
- Create: `components/admin/rich-text-editor.tsx`
- Test: `components/admin/rich-text-editor.test.tsx`

- [ ] **Step 1: Install Tiptap**

Run:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-placeholder
```

- [ ] **Step 2: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "./rich-text-editor";

describe("RichTextEditor", () => {
  it("renders the toolbar buttons", () => {
    render(<RichTextEditor value="" onChange={() => {}} />);
    expect(screen.getByTitle("Negrito")).toBeInTheDocument();
    expect(screen.getByTitle("Itálico")).toBeInTheDocument();
    expect(screen.getByTitle("Link")).toBeInTheDocument();
    expect(screen.getByTitle("Lista")).toBeInTheDocument();
    expect(screen.getByTitle("Tabela")).toBeInTheDocument();
    expect(screen.getByTitle("Citação")).toBeInTheDocument();
    expect(screen.getByTitle("Separador")).toBeInTheDocument();
  });

  it("calls onChange with HTML when the content changes", async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);
    const editable = screen.getByRole("textbox");
    await userEvent.type(editable, "Olá");
    expect(onChange).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run and verify it fails**

Run: `npm test -- components/admin/rich-text-editor.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement**

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Table,
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: "Escreva o texto completo aqui..." }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const btn = (label: string, title: string, action: () => void, active = false) => (
    <button
      type="button"
      title={title}
      onClick={action}
      className={`w-8 h-8 text-sm ${active ? "bg-primary text-white" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="border">
      <div className="flex gap-0.5 flex-wrap p-2.5 border-b bg-background">
        {btn("B", "Negrito", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {btn("I", "Itálico", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {btn("🔗", "Link", () => {
          const url = window.prompt("URL do link:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        })}
        {btn("≡", "Lista", () => editor.chain().focus().toggleBulletList().run())}
        {btn("▦", "Tabela", () => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run())}
        {btn("🖼", "Imagem", () => {
          const url = window.prompt("URL da imagem:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        })}
        {btn('"', "Citação", () => editor.chain().focus().toggleBlockquote().run())}
        {btn("—", "Separador", () => editor.chain().focus().setHorizontalRule().run())}
      </div>
      <EditorContent editor={editor} className="min-h-[160px] p-4" />
    </div>
  );
}
```

- [ ] **Step 5: Run and verify it passes**

Run: `npm test -- components/admin/rich-text-editor.test.tsx`
Expected: 2 passed.

Note: video/PDF/botão toolbar entries from the design mockup are handled as separate MediaPicker-driven insert actions once Task 23 exists — deferred here to keep this task independently testable.

- [ ] **Step 6: Commit**

```bash
git add components/admin/rich-text-editor.tsx components/admin/rich-text-editor.test.tsx package.json package-lock.json
git commit -m "feat(admin): add Tiptap-based RichTextEditor"
```

---

### Task 23: `MediaPicker` component

**Files:**
- Create: `components/admin/media-picker.tsx`, `lib/content/media-actions.ts`
- Test: `lib/content/media-actions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { filterMedia } from "./media-actions";

const items = [
  { id: "1", filename: "escola-nova-geracao-01.jpg", type: "imagem" as const },
  { id: "2", filename: "relatorio-anual-2025.pdf", type: "pdf" as const },
];

describe("filterMedia", () => {
  it("filters by filename, case-insensitive", () => {
    expect(filterMedia(items, "ESCOLA")).toEqual([items[0]]);
  });
  it("returns everything when the query is empty", () => {
    expect(filterMedia(items, "")).toEqual(items);
  });
  it("returns an empty array when nothing matches", () => {
    expect(filterMedia(items, "zzz")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/content/media-actions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
export interface MediaItem {
  id: string;
  filename: string;
  type: "imagem" | "video" | "documento" | "pdf";
}

export function filterMedia(items: MediaItem[], query: string): MediaItem[] {
  if (!query) return items;
  return items.filter((i) => i.filename.toLowerCase().includes(query.toLowerCase()));
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/content/media-actions.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Build the picker (dialog wrapping a filtered grid, fetches `media_library` client-side)**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { filterMedia, type MediaItem } from "@/lib/content/media-actions";

export function MediaPicker({
  type,
  onSelect,
  trigger,
}: {
  type: MediaItem["type"];
  onSelect: (item: MediaItem & { url: string }) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<(MediaItem & { url: string })[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    createClient()
      .from("media_library")
      .select("id, filename, type, url")
      .eq("type", type)
      .is("deleted_at", null)
      .then(({ data }) => setItems(data ?? []));
  }, [open, type]);

  const filtered = filterMedia(items, query);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <Input placeholder="Buscar arquivo..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhum arquivo encontrado para &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-4 max-h-96 overflow-y-auto">
            {filtered.map((item) => (
              <button
                key={item.id}
                className="border text-left"
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <div className="h-28 bg-background" />
                <div className="p-2.5 text-xs font-semibold truncate">{item.filename}</div>
              </button>
            ))}
          </div>
        )}
        <Button variant="outline" asChild>
          <a href="/admin/midias" target="_blank" rel="noreferrer">Enviar novo arquivo na Biblioteca de Mídias →</a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/admin/media-picker.tsx lib/content/media-actions.ts lib/content/media-actions.test.ts
git commit -m "feat(admin): add MediaPicker component with functional search"
```

---

### Task 24: `ConfirmDialog` + `TrashView`

**Files:**
- Create: `components/admin/confirm-dialog.tsx`, `components/admin/trash-view.tsx`
- Test: `components/admin/trash-view.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrashView } from "./trash-view";

describe("TrashView", () => {
  it("lists soft-deleted rows and calls onRestore", async () => {
    const onRestore = vi.fn();
    render(
      <TrashView
        rows={[{ id: "1", title: "Projeto X", deleted_at: "2026-06-01T00:00:00Z" }]}
        titleKey="title"
        onRestore={onRestore}
      />
    );
    expect(screen.getByText("Projeto X")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Restaurar"));
    expect(onRestore).toHaveBeenCalledWith("1");
  });

  it("shows an empty state with no rows", () => {
    render(<TrashView rows={[]} titleKey="title" onRestore={() => {}} />);
    expect(screen.getByText("A lixeira está vazia.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- components/admin/trash-view.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
"use client";

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2.5 items-center">
      <span className="text-xs">{message}</span>
      <button className="text-xs font-bold text-red-700 underline" onClick={onConfirm}>Sim</button>
      <button className="text-xs font-bold underline" onClick={onCancel}>Não</button>
    </div>
  );
}

export function TrashView<T extends { id: string; deleted_at: string | null }>({
  rows,
  titleKey,
  onRestore,
}: {
  rows: T[];
  titleKey: keyof T & string;
  onRestore: (id: string) => void;
}) {
  if (rows.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">A lixeira está vazia.</p>;
  }
  return (
    <div className="bg-white border">
      {rows.map((row) => (
        <div key={row.id} className="flex justify-between items-center px-6 py-4 border-t">
          <span>{String(row[titleKey])}</span>
          <span className="text-xs text-muted-foreground">
            Excluído em {new Date(row.deleted_at!).toLocaleDateString("pt-BR")}
          </span>
          <button className="text-xs font-bold underline" onClick={() => onRestore(row.id)}>Restaurar</button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- components/admin/trash-view.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add components/admin/confirm-dialog.tsx components/admin/trash-view.tsx components/admin/trash-view.test.tsx
git commit -m "feat(admin): add ConfirmDialog and TrashView (Lixeira) components"
```

---

## Phase 5 — Content Modules

Each module follows the same shape: a Zod validation schema (tested), a list page (`ContentTable` + `TrashView` tab + module-specific columns), and an editor page (`react-hook-form` + `StatusActionsBar` + module-specific fields). Trajetória is written in full as the template; the remaining 5 modules reuse the same wiring pattern with their own schema and fields.

### Task 25: Trajetória module

**Files:**
- Create: `lib/validations/trajetoria.ts`, `app/admin/trajetoria/page.tsx`, `app/admin/trajetoria/novo/page.tsx`, `app/admin/trajetoria/[id]/page.tsx`, `app/admin/trajetoria/actions.ts`, `app/admin/trajetoria/lixeira/page.tsx`
- Test: `lib/validations/trajetoria.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { trajetoriaSchema } from "./trajetoria";

describe("trajetoriaSchema", () => {
  it("requires year and title", () => {
    const result = trajetoriaSchema.safeParse({ year: null, title: "" });
    expect(result.success).toBe(false);
  });
  it("accepts a minimal valid etapa", () => {
    const result = trajetoriaSchema.safeParse({ year: 2014, title: "Secretaria de Educação" });
    expect(result.success).toBe(true);
  });
  it("rejects a year before 1900 or after 2100", () => {
    expect(trajetoriaSchema.safeParse({ year: 1899, title: "x" }).success).toBe(false);
    expect(trajetoriaSchema.safeParse({ year: 2101, title: "x" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/validations/trajetoria.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the schema**

```ts
import { z } from "zod";

export const trajetoriaSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
  document_url: z.string().url().optional().or(z.literal("")),
  order_index: z.number().int().default(0),
});

export type TrajetoriaInput = z.infer<typeof trajetoriaSchema>;
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/validations/trajetoria.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Server actions for this module**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createModuleActions } from "@/lib/content/actions";
import { trajetoriaSchema } from "@/lib/validations/trajetoria";

const generic = createModuleActions("trajetoria_items", "/admin/trajetoria");

export async function listTrajetoria(includeDeleted = false) {
  const supabase = await createClient();
  let query = supabase.from("trajetoria_items").select("*").order("order_index");
  query = includeDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTrajetoriaItem(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trajetoria_items").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function saveTrajetoriaItem(id: string | null, input: unknown) {
  const parsed = trajetoriaSchema.parse(input);
  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("trajetoria_items").update(parsed).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("trajetoria_items").insert({ ...parsed, status: "rascunho" });
    if (error) throw error;
  }
  revalidatePath("/admin/trajetoria");
}

export const softDeleteTrajetoria = generic.softDelete;
export const restoreTrajetoria = generic.restore;
export const duplicateTrajetoria = (id: string) => generic.duplicate(id, "title", null);
export const setTrajetoriaStatus = generic.setStatus;
```

- [ ] **Step 6: List page**

```tsx
import { listTrajetoria, softDeleteTrajetoria, duplicateTrajetoria } from "./actions";
import { ContentTable } from "@/components/admin/content-table";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TrajetoriaPage() {
  const rows = await listTrajetoria();
  return (
    <>
      <Topbar title="Trajetória" />
      <div className="p-9 flex flex-col gap-4">
        <div className="flex justify-between">
          <Button asChild variant="outline"><Link href="/admin/trajetoria/lixeira">Lixeira</Link></Button>
          <Button asChild><Link href="/admin/trajetoria/novo">+ Nova etapa</Link></Button>
        </div>
        <ContentTable
          rows={rows.map((r) => ({ ...r, extraYear: r.year }))}
          titleKey="title"
          columns={[{ key: "extraYear", label: "Ano" }, { key: "status", label: "Status" }]}
          onEdit={(id) => { window.location.href = `/admin/trajetoria/${id}`; }}
          onDuplicate={duplicateTrajetoria}
          onDelete={softDeleteTrajetoria}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 7: Editor page (shared by `novo` and `[id]`)**

Create `app/admin/trajetoria/[id]/page.tsx` (the `novo` route renders the same client form with `id=null`; extract to a client component to keep both routes thin):

```tsx
import { getTrajetoriaItem } from "../actions";
import { TrajetoriaForm } from "./form";

export default async function EditTrajetoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getTrajetoriaItem(id);
  return <TrajetoriaForm id={id} initial={item} />;
}
```

Create `app/admin/trajetoria/[id]/form.tsx`:
```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trajetoriaSchema, type TrajetoriaInput } from "@/lib/validations/trajetoria";
import { saveTrajetoriaItem, setTrajetoriaStatus } from "../actions";
import { StatusActionsBar } from "@/components/admin/status-actions-bar";
import { MediaPicker } from "@/components/admin/media-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/admin/topbar";
import { useRouter } from "next/navigation";

export function TrajetoriaForm({ id, initial }: { id: string | null; initial?: TrajetoriaInput }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm<TrajetoriaInput>({
    resolver: zodResolver(trajetoriaSchema),
    defaultValues: initial ?? { year: new Date().getFullYear(), title: "", order_index: 0 },
  });

  const onSave = handleSubmit(async (data) => {
    await saveTrajetoriaItem(id, data);
    router.push("/admin/trajetoria");
  });

  return (
    <>
      <Topbar title={id ? "Editar etapa" : "Nova etapa"} />
      <div className="p-9 max-w-3xl flex flex-col gap-5">
        <Input placeholder="Ano" type="number" {...register("year", { valueAsNumber: true })} />
        <Input placeholder="Título" {...register("title")} />
        <Textarea placeholder="Descrição" {...register("description")} />
        <MediaPicker type="imagem" trigger={<button type="button" className="text-sm underline">Selecionar imagem</button>}
          onSelect={(m) => setValue("image_url", m.url)} />
        <MediaPicker type="video" trigger={<button type="button" className="text-sm underline">Selecionar vídeo</button>}
          onSelect={(m) => setValue("video_url", m.url)} />
        <MediaPicker type="documento" trigger={<button type="button" className="text-sm underline">Selecionar documento (PDF)</button>}
          onSelect={(m) => setValue("document_url", m.url)} />
        <Input placeholder="Ordem" type="number" {...register("order_index", { valueAsNumber: true })} />
        <StatusActionsBar
          scheduledAt={null}
          onAction={async (action, scheduledAt) => {
            await onSave();
            if (id) await setTrajetoriaStatus(id, action, scheduledAt);
          }}
        />
      </div>
    </>
  );
}
```

Create `app/admin/trajetoria/novo/page.tsx`:
```tsx
import { TrajetoriaForm } from "../[id]/form";

export default function NewTrajetoriaPage() {
  return <TrajetoriaForm id={null} />;
}
```

Create `app/admin/trajetoria/lixeira/page.tsx`:
```tsx
import { listTrajetoria, restoreTrajetoria } from "../actions";
import { TrashView } from "@/components/admin/trash-view";
import { Topbar } from "@/components/admin/topbar";

export default async function TrajetoriaLixeiraPage() {
  const rows = await listTrajetoria(true);
  return (
    <>
      <Topbar title="Lixeira — Trajetória" />
      <div className="p-9">
        <TrashView rows={rows} titleKey="title" onRestore={restoreTrajetoria} />
      </div>
    </>
  );
}
```

- [ ] **Step 8: Install react-hook-form**

Run: `npm install react-hook-form @hookform/resolvers`

- [ ] **Step 9: Manual verification**

Run: `npm run dev`, log in, go to `/admin/trajetoria/novo`, fill ano+título, click "Publicar →".
Expected: redirected to `/admin/trajetoria`, new row visible with status "publicado".

- [ ] **Step 10: Commit**

```bash
git add app/admin/trajetoria lib/validations/trajetoria.ts lib/validations/trajetoria.test.ts package.json package-lock.json
git commit -m "feat(admin): implement Trajetória module (list, editor, lixeira)"
```

---

### Task 26: Projetos module

Same file shape as Task 25 (`page.tsx`, `novo/page.tsx`, `[id]/{page.tsx,form.tsx}`, `actions.ts`, `lixeira/page.tsx`), swapped for this module's fields: `project_stage` (independent from `status`), `category_id`, `excerpt`, `gallery_urls`, `pdf_url`, `video_url`, `featured`, auto-slug from title.

**Files:**
- Create: `lib/validations/projetos.ts`, `app/admin/projetos/{page.tsx,actions.ts,novo/page.tsx,[id]/page.tsx,[id]/form.tsx,lixeira/page.tsx}`
- Test: `lib/validations/projetos.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { projetoSchema } from "./projetos";

describe("projetoSchema", () => {
  it("requires a title", () => {
    expect(projetoSchema.safeParse({ title: "" }).success).toBe(false);
  });
  it("defaults project_stage to 'proposto'", () => {
    const result = projetoSchema.parse({ title: "Escola Nova Geração" });
    expect(result.project_stage).toBe("proposto");
  });
  it("rejects an invalid project_stage", () => {
    expect(projetoSchema.safeParse({ title: "x", project_stage: "invalido" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/validations/projetos.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the schema**

```ts
import { z } from "zod";

export const projetoSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  project_stage: z.enum(["proposto", "em_andamento", "concluido"]).default("proposto"),
  excerpt: z.string().max(300).optional(),
  description: z.string().optional(),
  cover_url: z.string().url().optional().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  pdf_url: z.string().url().optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  seo: z.object({ meta_title: z.string().optional(), meta_description: z.string().max(160).optional() }).default({}),
});

export type ProjetoInput = z.infer<typeof projetoSchema>;
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/validations/projetos.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Actions, list, editor, lixeira**

Follow Task 25's exact file structure, substituting: table `projects`, schema `projetoSchema`, slug auto-generated via `slugify(title)` on create (see Task 17) if `slug` is blank, list columns `[{key:"category_name",label:"Categoria"},{key:"status",label:"Status"}]`, editor fields Título/Slug/Categoria (creatable combobox — Task 26b)/Fase do projeto (select: Proposto/Em andamento/Concluído)/Resumo/Descrição (`RichTextEditor`)/Capa (`MediaPicker type="imagem"`)/Galeria (`MediaPicker` looped)/PDF (`MediaPicker type="pdf"`)/Vídeo (`MediaPicker type="video"`)/Destaque na Home (`Switch` bound to `featured`)/SEO (Meta Title + Meta Description with character counter), `StatusActionsBar` at the bottom.

`saveProjeto` in `actions.ts` differs from Trajetória's save by auto-slugging:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createModuleActions } from "@/lib/content/actions";
import { projetoSchema } from "@/lib/validations/projetos";
import { slugify } from "@/lib/content/slug";

const generic = createModuleActions("projects", "/admin/projetos");

export async function saveProjeto(id: string | null, input: unknown) {
  const parsed = projetoSchema.parse(input);
  const supabase = await createClient();
  const slug = parsed.slug?.trim() ? parsed.slug : slugify(parsed.title);
  if (id) {
    const { error } = await supabase.from("projects").update({ ...parsed, slug }).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("projects").insert({ ...parsed, slug, status: "rascunho" });
    if (error) throw error;
  }
  revalidatePath("/admin/projetos");
}

export async function listProjetos(includeDeleted = false) {
  const supabase = await createClient();
  let query = supabase.from("projects").select("*, categories(name)").order("created_at", { ascending: false });
  query = includeDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((r) => ({ ...r, category_name: r.categories?.name ?? "—" }));
}

export async function getProjeto(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export const softDeleteProjeto = generic.softDelete;
export const restoreProjeto = generic.restore;
export const duplicateProjeto = (id: string) => generic.duplicate(id, "title", "slug");
export const setProjetoStatus = generic.setStatus;
```

- [ ] **Step 6: Creatable category combobox (shared — used by Projetos, Ideias, Notícias, Comunidade)**

**Files:**
- Create: `components/admin/category-combobox.tsx`, `app/admin/category-actions.ts`
- Test: `app/admin/category-actions.test.ts`

Write the failing test:
```ts
import { describe, it, expect } from "vitest";
import { categoryNameSchema } from "./category-actions";

describe("categoryNameSchema", () => {
  it("rejects an empty name", () => expect(categoryNameSchema.safeParse("").success).toBe(false));
  it("accepts a valid name", () => expect(categoryNameSchema.safeParse("Educação").success).toBe(true));
});
```

Run: `npm test -- app/admin/category-actions.test.ts` — expect FAIL.

Implement `app/admin/category-actions.ts`:
```ts
"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/content/slug";

export const categoryNameSchema = z.string().min(1);

export async function listCategories(module: "projetos" | "ideias" | "noticias" | "comunidade") {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("module", module).order("name");
  if (error) throw error;
  return data;
}

export async function createCategory(module: "projetos" | "ideias" | "noticias" | "comunidade", name: string) {
  const parsedName = categoryNameSchema.parse(name);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ module, name: parsedName, slug: slugify(parsedName) })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
```

Run: `npm test -- app/admin/category-actions.test.ts` — expect 2 passed.

Implement `components/admin/category-combobox.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { listCategories, createCategory } from "@/app/admin/category-actions";

export function CategoryCombobox({
  module,
  value,
  onChange,
}: {
  module: "projetos" | "ideias" | "noticias" | "comunidade";
  value: string | null;
  onChange: (categoryId: string) => void;
}) {
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    listCategories(module).then(setOptions);
  }, [module]);

  return (
    <div className="flex flex-col gap-2">
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="border p-2.5 text-sm">
        <option value="">Selecionar categoria...</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <Input placeholder="Criar nova categoria" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button
          type="button"
          className="text-xs font-bold underline"
          onClick={async () => {
            if (!newName.trim()) return;
            const created = await createCategory(module, newName.trim());
            setOptions((prev) => [...prev, created]);
            onChange(created.id);
            setNewName("");
          }}
        >
          Criar
        </button>
      </div>
    </div>
  );
}
```

Commit:
```bash
git add components/admin/category-combobox.tsx app/admin/category-actions.ts app/admin/category-actions.test.ts
git commit -m "feat(admin): add creatable category combobox shared by Projetos/Ideias/Notícias/Comunidade"
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, create a project with a category typed inline, publish it.
Expected: row appears in `/admin/projetos` with the new category name and "Publicado" badge; `/admin/projetos/lixeira` empty.

- [ ] **Step 8: Commit**

```bash
git add app/admin/projetos lib/validations/projetos.ts lib/validations/projetos.test.ts
git commit -m "feat(admin): implement Projetos module (list, editor, lixeira, categories)"
```

---

### Task 27: Comunidade (Álbuns) module

Same shape as Task 25/26, table `albuns`, uses `CategoryCombobox module="comunidade"`. No `featured` (Home teaser sorts by `date`/`published_at` — no manual flag, per the earlier design decision).

**Files:**
- Create: `lib/validations/comunidade.ts`, `app/admin/comunidade/{page.tsx,actions.ts,novo/page.tsx,[id]/page.tsx,[id]/form.tsx,lixeira/page.tsx}`
- Test: `lib/validations/comunidade.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { albumSchema } from "./comunidade";

describe("albumSchema", () => {
  it("requires a title", () => expect(albumSchema.safeParse({ title: "" }).success).toBe(false));
  it("defaults gallery_urls and video_urls to empty arrays", () => {
    const result = albumSchema.parse({ title: "Encontro comunitário" });
    expect(result.gallery_urls).toEqual([]);
    expect(result.video_urls).toEqual([]);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/validations/comunidade.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the schema**

```ts
import { z } from "zod";

export const albumSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  date: z.string().optional(),
  description: z.string().optional(),
  cover_url: z.string().url().optional().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  video_urls: z.array(z.string().url()).default([]),
  seo: z.object({ meta_title: z.string().optional(), meta_description: z.string().max(160).optional() }).default({}),
});

export type AlbumInput = z.infer<typeof albumSchema>;
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/validations/comunidade.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Actions, list, editor, lixeira**

Follow Task 25's file structure against table `albuns`, schema `albumSchema`, auto-slug on save (same pattern as Task 26 Step 5). List columns `[{key:"category_name",label:"Categoria"},{key:"status",label:"Status"}]`. Editor fields: Título/Slug/`CategoryCombobox module="comunidade"`/Data (`Input type="date"`)/Descrição/Capa/Galeria de fotos (repeated `MediaPicker type="imagem"`, appended to `gallery_urls`)/Vídeos (repeated `MediaPicker type="video"`, appended to `video_urls`)/SEO, `StatusActionsBar`.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, create an album with 2 photos and 1 category, publish.
Expected: row shows in `/admin/comunidade` with category name, "Publicado" badge.

- [ ] **Step 7: Commit**

```bash
git add app/admin/comunidade lib/validations/comunidade.ts lib/validations/comunidade.test.ts
git commit -m "feat(admin): implement Comunidade (Álbuns) module"
```

---

### Task 28: Ideias module

Table `ideas`, uses `CategoryCombobox module="ideias"`, adds `author` (free text) and `featured`.

**Files:**
- Create: `lib/validations/ideias.ts`, `app/admin/ideias/{page.tsx,actions.ts,novo/page.tsx,[id]/page.tsx,[id]/form.tsx,lixeira/page.tsx}`
- Test: `lib/validations/ideias.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { ideiaSchema } from "./ideias";

describe("ideiaSchema", () => {
  it("requires a title", () => expect(ideiaSchema.safeParse({ title: "" }).success).toBe(false));
  it("allows author to be omitted", () => {
    expect(ideiaSchema.safeParse({ title: "Por que investir em formação docente" }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/validations/ideias.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the schema**

```ts
import { z } from "zod";

export const ideiaSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  author: z.string().optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().optional(),
  cover_url: z.string().url().optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
  pdf_url: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  seo: z.object({ meta_title: z.string().optional(), meta_description: z.string().max(160).optional() }).default({}),
});

export type IdeiaInput = z.infer<typeof ideiaSchema>;
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/validations/ideias.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Actions, list, editor, lixeira**

Follow Task 25's file structure against table `ideas`, schema `ideiaSchema`, auto-slug on save. List columns `[{key:"category_name",label:"Categoria"},{key:"status",label:"Status"}]`. Editor fields: Título/Slug/`CategoryCombobox module="ideias"`/Autor (plain `Input`)/Resumo/Conteúdo (`RichTextEditor`)/Capa/Vídeo/PDF/Destaque na Home (`Switch`)/SEO, `StatusActionsBar`.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, create an idea with author filled, publish.
Expected: row shows in `/admin/ideias`, "Publicado" badge.

- [ ] **Step 7: Commit**

```bash
git add app/admin/ideias lib/validations/ideias.ts lib/validations/ideias.test.ts
git commit -m "feat(admin): implement Ideias module"
```

---

### Task 29: Notícias module

Table `news`, uses `CategoryCombobox module="noticias"`, adds `author`, `gallery_urls`, and non-persisted share buttons (computed from slug, no DB field — per spec Task resolution 5).

**Files:**
- Create: `lib/validations/noticias.ts`, `components/admin/social-share-buttons.tsx`, `app/admin/noticias/{page.tsx,actions.ts,novo/page.tsx,[id]/page.tsx,[id]/form.tsx,lixeira/page.tsx}`
- Test: `lib/validations/noticias.test.ts`, `components/admin/social-share-buttons.test.tsx`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from "vitest";
import { noticiaSchema } from "./noticias";

describe("noticiaSchema", () => {
  it("requires a title", () => expect(noticiaSchema.safeParse({ title: "" }).success).toBe(false));
  it("defaults gallery_urls to an empty array", () => {
    expect(noticiaSchema.parse({ title: "Nota oficial" }).gallery_urls).toEqual([]);
  });
});
```

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialShareButtons } from "./social-share-buttons";

describe("SocialShareButtons", () => {
  it("does not render when the item is not published", () => {
    render(<SocialShareButtons slug="nota-oficial" status="rascunho" />);
    expect(screen.queryByText("Compartilhar")).not.toBeInTheDocument();
  });
  it("renders WhatsApp/Facebook/copy links when published", () => {
    render(<SocialShareButtons slug="nota-oficial" status="publicado" />);
    expect(screen.getByText("Compartilhar")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("Copiar link")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and verify both fail**

Run: `npm test -- lib/validations/noticias.test.ts components/admin/social-share-buttons.test.tsx`
Expected: both FAIL — modules not found.

- [ ] **Step 3: Implement the schema**

```ts
import { z } from "zod";

export const noticiaSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  author: z.string().optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().optional(),
  cover_url: z.string().url().optional().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  video_url: z.string().url().optional().or(z.literal("")),
  pdf_url: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  seo: z.object({ meta_title: z.string().optional(), meta_description: z.string().max(160).optional() }).default({}),
});

export type NoticiaInput = z.infer<typeof noticiaSchema>;
```

- [ ] **Step 4: Implement the share buttons (UI action, no persistence)**

```tsx
"use client";

export function SocialShareButtons({ slug, status }: { slug: string; status: string }) {
  if (status !== "publicado") return null;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/noticias/${slug}`;
  return (
    <div className="flex gap-3 items-center">
      <span className="text-xs font-bold uppercase text-muted-foreground">Compartilhar</span>
      <a href={`https://wa.me/?text=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="text-xs underline">WhatsApp</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="text-xs underline">Facebook</a>
      <button type="button" className="text-xs underline" onClick={() => navigator.clipboard.writeText(url)}>Copiar link</button>
    </div>
  );
}
```

- [ ] **Step 5: Run and verify both pass**

Run: `npm test -- lib/validations/noticias.test.ts components/admin/social-share-buttons.test.tsx`
Expected: 2 passed, 2 passed.

- [ ] **Step 6: Actions, list, editor, lixeira**

Follow Task 25's file structure against table `news`, schema `noticiaSchema`, auto-slug on save. List columns `[{key:"category_name",label:"Categoria"},{key:"status",label:"Status"}]`. Editor fields: Título/Slug/`CategoryCombobox module="noticias"`/Autor/Resumo/Conteúdo (`RichTextEditor`)/Capa/Galeria (repeated `MediaPicker type="imagem"`)/Vídeo/PDF/Destaque na Home/SEO/`SocialShareButtons` (only rendered in edit mode, using the saved `slug`+`status`), `StatusActionsBar`.

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, publish a news item, confirm the share buttons appear only after publishing (reload the editor after save).
Expected: buttons hidden while `rascunho`, visible after `publicado`.

- [ ] **Step 8: Commit**

```bash
git add app/admin/noticias lib/validations/noticias.ts lib/validations/noticias.test.ts components/admin/social-share-buttons.tsx components/admin/social-share-buttons.test.tsx
git commit -m "feat(admin): implement Notícias module with non-persisted share buttons"
```

---

### Task 30: Agenda module

Table `events`. Per-event `map_embed_url` (distinct from the global address map in Configurações). No categories. Module-wide "Mostrar página Agenda no portal" toggle reads/writes `global_settings.agenda_page_enabled`, shown above the listing — not a per-item field.

**Files:**
- Create: `lib/validations/agenda.ts`, `app/admin/agenda/{page.tsx,actions.ts,novo/page.tsx,[id]/page.tsx,[id]/form.tsx,lixeira/page.tsx}`
- Test: `lib/validations/agenda.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { eventoSchema } from "./agenda";

describe("eventoSchema", () => {
  it("requires title and date", () => {
    expect(eventoSchema.safeParse({ title: "", date: "" }).success).toBe(false);
  });
  it("accepts a minimal valid event", () => {
    expect(eventoSchema.safeParse({ title: "Audiência pública", date: "2026-07-08T19:00:00Z" }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/validations/agenda.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the schema**

```ts
import { z } from "zod";

export const eventoSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  date: z.string().min(1, "Data obrigatória"),
  location: z.string().optional(),
  external_url: z.string().url().optional().or(z.literal("")),
  map_embed_url: z.string().url().optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
});

export type EventoInput = z.infer<typeof eventoSchema>;
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/validations/agenda.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Actions, list, editor, lixeira, and the module-wide toggle**

Follow Task 25's file structure against table `events`, schema `eventoSchema`. List columns `[{key:"location",label:"Local"},{key:"status",label:"Status"}]`. Editor fields: Título/Descrição/Data e Hora (`Input type="datetime-local"`)/Local/Mapa incorporado (per-event, `map_embed_url`)/Link externo/Imagem, `StatusActionsBar`.

Add the module-wide toggle to `app/admin/agenda/page.tsx`, reading/writing `global_settings`:
```tsx
import { createClient } from "@/lib/supabase/server";
import { Switch } from "@/components/ui/switch";
import { toggleAgendaPageEnabled } from "./actions";

async function AgendaPageToggle() {
  const supabase = await createClient();
  const { data } = await supabase.from("global_settings").select("value").eq("key", "agenda_page_enabled").single();
  const enabled = data?.value === "true";
  return (
    <form action={toggleAgendaPageEnabled} className="flex items-center gap-3">
      <span className="text-sm font-semibold">Mostrar página Agenda no portal</span>
      <Switch name="enabled" defaultChecked={enabled} />
    </form>
  );
}
```

Add to `app/admin/agenda/actions.ts`:
```ts
export async function toggleAgendaPageEnabled(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const enabled = formData.get("enabled") === "on";
  const { error } = await supabase
    .from("global_settings")
    .update({ value: String(enabled) })
    .eq("key", "agenda_page_enabled");
  if (error) throw error;
  revalidatePath("/admin/agenda");
}
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, create an event with a map link, toggle "Mostrar página Agenda no portal" off then on.
Expected: event row appears; toggle persists across page reloads (check `global_settings` row via `supabase db execute`).

- [ ] **Step 7: Commit**

```bash
git add app/admin/agenda lib/validations/agenda.ts lib/validations/agenda.test.ts
git commit -m "feat(admin): implement Agenda module with per-event map and page-wide toggle"
```

---

## Phase 6 — Singleton Pages

### Task 31: Home config page

**Files:**
- Create: `app/admin/home/page.tsx`, `app/admin/home/actions.ts`, `lib/content/home-sections.ts`
- Test: `lib/content/home-sections.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { CANONICAL_HOME_SECTIONS, reorderSections, toggleSection } from "./home-sections";

describe("CANONICAL_HOME_SECTIONS", () => {
  it("has exactly the 8 canonical sections in spec order", () => {
    expect(CANONICAL_HOME_SECTIONS.map((s) => s.key)).toEqual([
      "hero", "sobre", "projetos", "comunidade", "ideias", "noticias", "agenda", "contato",
    ]);
  });
});

describe("reorderSections", () => {
  it("moves a key to a new index", () => {
    expect(reorderSections(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
  });
});

describe("toggleSection", () => {
  it("flips a section's visibility", () => {
    expect(toggleSection({ hero: true, sobre: false }, "sobre")).toEqual({ hero: true, sobre: true });
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/content/home-sections.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
export const CANONICAL_HOME_SECTIONS = [
  { key: "hero", name: "Hero (banner principal)" },
  { key: "sobre", name: "Sobre — resumo" },
  { key: "projetos", name: "Projetos em destaque" },
  { key: "comunidade", name: "Comunidade — últimas fotos" },
  { key: "ideias", name: "Ideias em destaque" },
  { key: "noticias", name: "Notícias recentes" },
  { key: "agenda", name: "Agenda" },
  { key: "contato", name: "Contato" },
] as const;

export function reorderSections(order: string[], key: string, newIndex: number): string[] {
  const withoutKey = order.filter((k) => k !== key);
  return [...withoutKey.slice(0, newIndex), key, ...withoutKey.slice(newIndex)];
}

export function toggleSection(
  visible: Record<string, boolean>,
  key: string
): Record<string, boolean> {
  return { ...visible, [key]: !visible[key] };
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/content/home-sections.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Server actions**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveHomeSections(sectionsOrder: string[], sectionsVisible: Record<string, boolean>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("home_config")
    .update({ sections_order: sectionsOrder, sections_visible: sectionsVisible })
    .eq("id", 1);
  if (error) throw error;
  revalidatePath("/admin/home");
}

export async function saveHero(input: {
  hero_photo_url: string; hero_title: string; hero_subtitle: string; hero_slogan: string;
  hero_btn1_text: string; hero_btn1_url: string; hero_btn2_text: string; hero_btn2_url: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("home_config").update(input).eq("id", 1);
  if (error) throw error;
  revalidatePath("/admin/home");
}
```

- [ ] **Step 6: Page (toggle + reorder list, using `CANONICAL_HOME_SECTIONS` for labels)**

```tsx
import { createClient } from "@/lib/supabase/server";
import { CANONICAL_HOME_SECTIONS } from "@/lib/content/home-sections";
import { Topbar } from "@/components/admin/topbar";
import { HomeSectionsEditor } from "./sections-editor";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("home_config").select("*").eq("id", 1).single();
  return (
    <>
      <Topbar title="Home" />
      <div className="p-9">
        <p className="text-sm text-muted-foreground mb-6 max-w-xl">
          Gerencie as seções exibidas na página inicial do portal. Use o botão para ativar ou ocultar; a ordem segue a lista abaixo (arrastar-e-soltar entra em uma iteração futura — MVP usa mover para cima/baixo).
        </p>
        <HomeSectionsEditor
          order={config.sections_order}
          visible={config.sections_visible}
          sections={CANONICAL_HOME_SECTIONS}
        />
      </div>
    </>
  );
}
```

Create `app/admin/home/sections-editor.tsx`:
```tsx
"use client";

import { useState } from "react";
import { reorderSections, toggleSection } from "@/lib/content/home-sections";
import { saveHomeSections } from "./actions";
import { Button } from "@/components/ui/button";

export function HomeSectionsEditor({
  order: initialOrder,
  visible: initialVisible,
  sections,
}: {
  order: string[];
  visible: Record<string, boolean>;
  sections: readonly { key: string; name: string }[];
}) {
  const [order, setOrder] = useState(initialOrder);
  const [visible, setVisible] = useState(initialVisible);
  const byKey = Object.fromEntries(sections.map((s) => [s.key, s.name]));

  return (
    <div className="bg-white border">
      {order.map((key, index) => (
        <div key={key} className="grid grid-cols-[40px_2fr_1fr_1fr] px-6 py-4 border-t items-center">
          <span className="text-sm text-muted-foreground font-bold">{index + 1}</span>
          <span className="font-semibold">{byKey[key]}</span>
          <span>{visible[key] ? "Visível" : "Oculta"}</span>
          <div className="flex gap-2.5">
            <button
              type="button"
              className="text-xs font-bold underline"
              onClick={async () => {
                const next = toggleSection(visible, key);
                setVisible(next);
                await saveHomeSections(order, next);
              }}
            >
              {visible[key] ? "Ocultar" : "Ativar"}
            </button>
            {index > 0 && (
              <button
                type="button"
                className="text-xs font-bold underline"
                onClick={async () => {
                  const next = reorderSections(order, key, index - 1);
                  setOrder(next);
                  await saveHomeSections(next, visible);
                }}
              >
                Mover ↑
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, go to `/admin/home`, toggle "Comunidade" off, move "Agenda" up.
Expected: change persists on reload; `select sections_order, sections_visible from home_config;` reflects the update.

- [ ] **Step 8: Commit**

```bash
git add app/admin/home lib/content/home-sections.ts lib/content/home-sections.test.ts
git commit -m "feat(admin): implement Home config page (canonical 8 sections, toggle + reorder)"
```

---

### Task 32: Sobre page

**Files:**
- Create: `app/admin/sobre/page.tsx`, `app/admin/sobre/actions.ts`, `app/admin/sobre/form.tsx`, `lib/validations/sobre.ts`
- Test: `lib/validations/sobre.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { sobreSchema } from "./sobre";

describe("sobreSchema", () => {
  it("allows all fields to be empty (starts blank, ships with no content)", () => {
    expect(sobreSchema.safeParse({}).success).toBe(true);
  });
  it("defaults gallery_urls and pdf_urls to empty arrays", () => {
    const result = sobreSchema.parse({});
    expect(result.gallery_urls).toEqual([]);
    expect(result.pdf_urls).toEqual([]);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/validations/sobre.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
import { z } from "zod";

export const sobreSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  text_content: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  video_url: z.string().url().optional().or(z.literal("")),
  pdf_urls: z.array(z.string().url()).default([]),
});

export type SobreInput = z.infer<typeof sobreSchema>;
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/validations/sobre.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Server action, page, form**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sobreSchema } from "@/lib/validations/sobre";

export async function saveSobre(input: unknown) {
  const parsed = sobreSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("sobre").update(parsed).eq("id", 1);
  if (error) throw error;
  revalidatePath("/admin/sobre");
}
```

```tsx
import { createClient } from "@/lib/supabase/server";
import { SobreForm } from "./form";
import { Topbar } from "@/components/admin/topbar";

export default async function SobrePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("sobre").select("*").eq("id", 1).single();
  return (
    <>
      <Topbar title="Sobre" />
      <div className="p-9"><SobreForm initial={data} /></div>
    </>
  );
}
```

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sobreSchema, type SobreInput } from "@/lib/validations/sobre";
import { saveSobre } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";

export function SobreForm({ initial }: { initial: SobreInput }) {
  const { register, handleSubmit, setValue } = useForm<SobreInput>({
    resolver: zodResolver(sobreSchema),
    defaultValues: initial,
  });

  return (
    <form onSubmit={handleSubmit(saveSobre)} className="max-w-3xl flex flex-col gap-5">
      <Input placeholder="Título" {...register("title")} />
      <Input placeholder="Subtítulo" {...register("subtitle")} />
      <Textarea placeholder="Texto" rows={6} {...register("text_content")} />
      <MediaPicker type="imagem" trigger={<button type="button" className="text-sm underline">Selecionar imagem principal</button>}
        onSelect={(m) => setValue("photo_url", m.url)} />
      <MediaPicker type="video" trigger={<button type="button" className="text-sm underline">Selecionar vídeo</button>}
        onSelect={(m) => setValue("video_url", m.url)} />
      <Button type="submit">Salvar</Button>
    </form>
  );
}
```

(Galeria and PDFs use the same repeated-`MediaPicker`-append pattern as Task 27's gallery field — appended to `gallery_urls`/`pdf_urls` on select.)

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, go to `/admin/sobre`, fill título+subtítulo+texto, save.
Expected: reload shows saved values (confirms the singleton row updates, not inserts a duplicate).

- [ ] **Step 7: Commit**

```bash
git add app/admin/sobre lib/validations/sobre.ts lib/validations/sobre.test.ts
git commit -m "feat(admin): implement Sobre singleton page"
```

---

## Phase 7 — Biblioteca de Mídias

### Task 33: Storage buckets + upload action

**Files:**
- Create: `app/admin/midias/actions.ts`
- Test: `app/admin/midias/actions.test.ts`

- [ ] **Step 1: Create Storage buckets**

Manual (Supabase Dashboard → Storage, or `mcp__supabase__apply_migration` with `storage.buckets` inserts): create `public-images` (public), `public-pdfs` (public), `private-assets` (private). Videos are never uploaded (Task 34 clarifies), so no video bucket is needed.

```sql
insert into storage.buckets (id, name, public) values
  ('public-images', 'public-images', true),
  ('public-pdfs', 'public-pdfs', true),
  ('private-assets', 'private-assets', false);

create policy "public_images_read" on storage.objects for select using (bucket_id = 'public-images');
create policy "public_images_write" on storage.objects for insert with check (bucket_id = 'public-images' and auth.role() = 'authenticated');
create policy "public_pdfs_read" on storage.objects for select using (bucket_id = 'public-pdfs');
create policy "public_pdfs_write" on storage.objects for insert with check (bucket_id = 'public-pdfs' and auth.role() = 'authenticated');
create policy "private_assets_all" on storage.objects for all using (bucket_id = 'private-assets' and auth.role() = 'authenticated');
```
Save as `supabase/migrations/0007_storage_buckets.sql`, run `supabase db push`.

- [ ] **Step 2: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { bucketForType, validateFileSize } from "./actions";

describe("bucketForType", () => {
  it("routes images to public-images", () => expect(bucketForType("imagem")).toBe("public-images"));
  it("routes pdf/documento to public-pdfs", () => {
    expect(bucketForType("pdf")).toBe("public-pdfs");
    expect(bucketForType("documento")).toBe("public-pdfs");
  });
});

describe("validateFileSize", () => {
  it("rejects a PDF over 10MB", () => expect(validateFileSize("pdf", 11 * 1024 * 1024)).toBe(false));
  it("accepts a 1MB image", () => expect(validateFileSize("imagem", 1 * 1024 * 1024)).toBe(true));
});
```

- [ ] **Step 3: Run and verify it fails**

Run: `npm test -- app/admin/midias/actions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type UploadableType = "imagem" | "documento" | "pdf";

const MAX_BYTES: Record<UploadableType, number> = {
  imagem: 2 * 1024 * 1024,
  documento: 10 * 1024 * 1024,
  pdf: 10 * 1024 * 1024,
};

export function bucketForType(type: UploadableType): "public-images" | "public-pdfs" {
  return type === "imagem" ? "public-images" : "public-pdfs";
}

export function validateFileSize(type: UploadableType, sizeBytes: number): boolean {
  return sizeBytes <= MAX_BYTES[type];
}

export async function uploadMedia(formData: FormData) {
  const file = formData.get("file") as File;
  const type = formData.get("type") as UploadableType;
  if (!validateFileSize(type, file.size)) {
    return { error: `Arquivo excede o tamanho máximo permitido para ${type}.` };
  }
  const supabase = await createClient();
  const bucket = bucketForType(type);
  const path = `${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);
  if (uploadError) return { error: uploadError.message };
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
  const { error: insertError } = await supabase.from("media_library").insert({
    url: publicUrl.publicUrl,
    storage_path: path,
    type,
    filename: file.name,
    size_bytes: file.size,
    mime_type: file.type,
  });
  if (insertError) return { error: insertError.message };
  revalidatePath("/admin/midias");
  return { error: null };
}

export async function addVideoLink(url: string, title: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("media_library").insert({
    url,
    storage_path: null,
    type: "video",
    filename: title,
    size_bytes: null,
    mime_type: null,
  });
  if (error) throw error;
  revalidatePath("/admin/midias");
}

export async function listMedia(type: "imagem" | "video" | "documento" | "pdf") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_library")
    .select("*")
    .eq("type", type)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function softDeleteMedia(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("media_library").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/midias");
}
```

- [ ] **Step 5: Run and verify it passes**

Run: `npm test -- app/admin/midias/actions.test.ts`
Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0007_storage_buckets.sql app/admin/midias/actions.ts app/admin/midias/actions.test.ts
git commit -m "feat(admin): add Storage buckets and media upload/list/delete actions"
```

---

### Task 34: Biblioteca de Mídias page

**Files:**
- Create: `app/admin/midias/page.tsx`, `app/admin/midias/gallery.tsx`

- [ ] **Step 1: Build the tabbed gallery with functional search and empty state**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { listMedia, softDeleteMedia, addVideoLink, uploadMedia } from "./actions";
import { filterMedia, type MediaItem } from "@/lib/content/media-actions";

const TABS = [
  { value: "imagem", label: "Imagens" },
  { value: "video", label: "Vídeos" },
  { value: "documento", label: "Documentos" },
  { value: "pdf", label: "PDFs" },
] as const;

export function MediaGallery() {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("imagem");
  const [items, setItems] = useState<(MediaItem & { size_bytes: number | null })[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listMedia(tab).then(setItems);
  }, [tab]);

  const filtered = filterMedia(items, query);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <div className="mb-6 border-2 border-dashed p-8 text-center">
        {tab === "video" ? (
          <form
            action={async (formData) => {
              await addVideoLink(String(formData.get("url")), String(formData.get("title")));
              setItems(await listMedia("video"));
            }}
            className="flex gap-3 justify-center"
          >
            <Input name="title" placeholder="Título do vídeo" className="max-w-xs" />
            <Input name="url" placeholder="URL do YouTube/Vimeo" className="max-w-xs" />
            <button type="submit" className="text-sm font-bold underline">Adicionar vídeo</button>
          </form>
        ) : (
          <form
            action={async (formData) => {
              formData.set("type", tab);
              await uploadMedia(formData);
              setItems(await listMedia(tab));
            }}
          >
            <input type="file" name="file" required />
            <p className="text-xs text-muted-foreground mt-2">Imagens, documentos e PDFs — arraste ou selecione.</p>
          </form>
        )}
      </div>
      <TabsList>
        {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
      </TabsList>
      <div className="my-4">
        <Input placeholder="Buscar arquivo..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
      </div>
      <TabsContent value={tab}>
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhum arquivo encontrado para &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white border">
                <div className="h-28 bg-background" />
                <div className="p-2.5">
                  <div className="text-xs font-semibold truncate">{item.filename}</div>
                  <button
                    type="button"
                    className="text-[11px] text-red-700 underline"
                    onClick={async () => { await softDeleteMedia(item.id); setItems(await listMedia(tab)); }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
```

```tsx
import { Topbar } from "@/components/admin/topbar";
import { MediaGallery } from "./gallery";

export default function MidiasPage() {
  return (
    <>
      <Topbar title="Mídias" />
      <div className="p-9"><MediaGallery /></div>
    </>
  );
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, go to `/admin/midias`, upload a small JPG on the Imagens tab, add a video link on the Vídeos tab, search for a substring of the filename.
Expected: uploaded image appears in the grid; video link appears without a file dialog; search narrows results; clearing search restores the full grid; searching for a nonexistent name shows the empty state.

- [ ] **Step 3: Commit**

```bash
git add app/admin/midias/page.tsx app/admin/midias/gallery.tsx
git commit -m "feat(admin): implement Biblioteca de Mídias page (upload, video links, search, delete)"
```

---

## Phase 8 — Caixa de Entrada

### Task 35: Turnstile verification + rate-limit helper

These are shared utilities the public contact form (built in the portal-público plan) will call — built now because they belong to the Caixa de Entrada security spec and are independently testable.

**Files:**
- Create: `lib/turnstile.ts`, `lib/rate-limit.ts`
- Test: `lib/turnstile.test.ts`, `lib/rate-limit.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyTurnstile } from "./turnstile";

describe("verifyTurnstile", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns true when Cloudflare reports success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ success: true }) }) as any;
    expect(await verifyTurnstile("valid-token")).toBe(true);
  });

  it("returns false when Cloudflare reports failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ success: false }) }) as any;
    expect(await verifyTurnstile("invalid-token")).toBe(false);
  });

  it("returns false when the token is empty (honeypot / missing widget)", async () => {
    expect(await verifyTurnstile("")).toBe(false);
  });
});
```

```ts
import { describe, it, expect } from "vitest";
import { isRateLimited } from "./rate-limit";

describe("isRateLimited", () => {
  it("allows submissions under the limit", () => {
    const submissions = [Date.now() - 1000, Date.now() - 2000];
    expect(isRateLimited(submissions, 3, 60 * 60 * 1000)).toBe(false);
  });
  it("blocks submissions at or over the limit within the window", () => {
    const submissions = [Date.now() - 1000, Date.now() - 2000, Date.now() - 3000];
    expect(isRateLimited(submissions, 3, 60 * 60 * 1000)).toBe(true);
  });
  it("ignores submissions outside the window", () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const submissions = [twoHoursAgo, twoHoursAgo, twoHoursAgo];
    expect(isRateLimited(submissions, 3, 60 * 60 * 1000)).toBe(false);
  });
});
```

- [ ] **Step 2: Run and verify both fail**

Run: `npm test -- lib/turnstile.test.ts lib/rate-limit.test.ts`
Expected: both FAIL — modules not found.

- [ ] **Step 3: Implement**

```ts
export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: token,
    }),
  });
  const data = await res.json();
  return data.success === true;
}
```

```ts
export function isRateLimited(submissionTimestamps: number[], maxPerWindow: number, windowMs: number): boolean {
  const cutoff = Date.now() - windowMs;
  const recent = submissionTimestamps.filter((t) => t > cutoff);
  return recent.length >= maxPerWindow;
}
```

- [ ] **Step 4: Run and verify both pass**

Run: `npm test -- lib/turnstile.test.ts lib/rate-limit.test.ts`
Expected: 3 passed, 3 passed.

- [ ] **Step 5: Server action wiring (used later by the public form; wired now for the Caixa de Entrada demo path via `scripts/`)**

```ts
"use server";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { isRateLimited } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  honeypot: z.string().max(0), // must stay empty; bots fill every field
  turnstileToken: z.string().min(1),
});

export async function submitContactForm(input: unknown, ip: string) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  const verified = await verifyTurnstile(parsed.data.turnstileToken);
  if (!verified) return { error: "Falha na verificação anti-spam." };

  const supabase = createServiceRoleClient();
  const { data: recent } = await supabase
    .from("contact_rate_limit")
    .select("submitted_at")
    .eq("ip", ip)
    .gte("submitted_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
  const timestamps = (recent ?? []).map((r: { submitted_at: string }) => new Date(r.submitted_at).getTime());
  if (isRateLimited(timestamps, 3, 60 * 60 * 1000)) {
    return { error: "Muitas mensagens enviadas. Tente novamente mais tarde." };
  }

  const { honeypot, turnstileToken, ...message } = parsed.data;
  const { error } = await supabase.from("contact_messages").insert(message);
  if (error) return { error: "Erro ao enviar mensagem." };

  await supabase.from("contact_rate_limit").insert({ ip });
  return { error: null };
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/turnstile.ts lib/rate-limit.ts lib/turnstile.test.ts lib/rate-limit.test.ts app/contact-actions.ts
git commit -m "feat: add Turnstile verification and rate-limit helpers for the contact form"
```

---

### Task 36: Caixa de Entrada page

**Files:**
- Create: `app/admin/mensagens/page.tsx`, `app/admin/mensagens/actions.ts`, `app/admin/mensagens/inbox.tsx`

- [ ] **Step 1: Write the failing test for the WhatsApp link builder**

```ts
import { describe, it, expect } from "vitest";
import { buildWhatsAppLink } from "./actions";

describe("buildWhatsAppLink", () => {
  it("strips non-digits from the phone number", () => {
    expect(buildWhatsAppLink("(11) 98888-1234")).toBe("https://wa.me/11988881234");
  });
  it("returns null for an empty phone", () => {
    expect(buildWhatsAppLink("")).toBeNull();
    expect(buildWhatsAppLink(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- app/admin/mensagens/actions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement actions**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export function buildWhatsAppLink(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export async function listMessages(filter: "todas" | "nao_lidas" | "arquivadas", page: number, search: string) {
  const supabase = await createClient();
  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);

  if (filter === "nao_lidas") query = query.eq("status", "nova");
  if (filter === "arquivadas") query = query.eq("status", "arquivada");
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: data, total: count ?? 0 };
}

export async function markMessageStatus(id: string, status: "lida" | "respondida" | "arquivada") {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/mensagens");
}

export async function softDeleteMessage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/mensagens");
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- app/admin/mensagens/actions.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Inbox UI (list + detail, opening a message marks it read)**

```tsx
"use client";

import { useEffect, useState } from "react";
import { listMessages, markMessageStatus, softDeleteMessage, buildWhatsAppLink } from "./actions";

type Filter = "todas" | "nao_lidas" | "arquivadas";

export function Inbox() {
  const [filter, setFilter] = useState<Filter>("todas");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    listMessages(filter, 1, search).then(({ rows }) => {
      setRows(rows);
      if (!selectedId && rows[0]) setSelectedId(rows[0].id);
    });
  }, [filter, search]);

  const selected = rows.find((r) => r.id === selectedId);

  async function select(id: string) {
    setSelectedId(id);
    const msg = rows.find((r) => r.id === id);
    if (msg?.status === "nova") {
      await markMessageStatus(id, "lida");
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "lida" } : r)));
    }
  }

  return (
    <div className="flex-1 grid grid-cols-[380px_1fr]">
      <div className="border-r overflow-y-auto">
        <div className="flex gap-2 p-4 border-b">
          {(["todas", "nao_lidas", "arquivadas"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={filter === f ? "font-bold underline" : ""}>
              {f === "todas" ? "Todas" : f === "nao_lidas" ? "Não lidas" : "Arquivadas"}
            </button>
          ))}
        </div>
        <input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-b p-3 w-full" />
        {rows.map((m) => (
          <button key={m.id} onClick={() => select(m.id)} className={`block w-full text-left p-5 border-b ${m.id === selectedId ? "bg-background" : ""}`}>
            <div className="flex justify-between text-sm font-bold">
              <span>{m.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {new Date(m.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="text-sm">{m.subject}</div>
          </button>
        ))}
      </div>
      <div className="p-10">
        {selected && (
          <>
            <h3 className="font-display text-xl mb-1">{selected.subject}</h3>
            <p className="text-sm text-muted-foreground mb-4">{selected.name} · {selected.email}{selected.phone ? ` · ${selected.phone}` : ""}</p>
            <p className="mb-6">{selected.message}</p>
            <div className="flex gap-3 flex-wrap">
              <a href={`mailto:${selected.email}`} className="px-5 py-2.5 bg-primary text-white text-sm font-bold">Responder por e-mail</a>
              {buildWhatsAppLink(selected.phone) && (
                <a href={buildWhatsAppLink(selected.phone)!} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-green-600 text-white text-sm font-bold">
                  Conversar pelo WhatsApp
                </a>
              )}
              <button onClick={() => markMessageStatus(selected.id, "respondida")} className="px-5 py-2.5 border text-sm font-bold">Marcar como respondida</button>
              <button onClick={() => markMessageStatus(selected.id, "arquivada")} className="px-5 py-2.5 border text-sm font-bold">Arquivar</button>
              <button onClick={() => softDeleteMessage(selected.id)} className="px-5 py-2.5 border text-sm font-bold">Excluir</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

```tsx
import { Topbar } from "@/components/admin/topbar";
import { Inbox } from "./inbox";

export default function MensagensPage() {
  return (
    <>
      <Topbar title="Caixa de Entrada" />
      <Inbox />
    </>
  );
}
```

- [ ] **Step 6: Manual verification**

Since the public contact form doesn't exist yet (portal-público phase), insert a test row directly:
Run: `supabase db execute "insert into contact_messages (name, email, subject, message) values ('Teste', 'teste@example.com', 'Assunto teste', 'Mensagem teste');"`
Then open `/admin/mensagens`.
Expected: message appears with status "nova" (badge/highlight), clicking it flips it to "lida", WhatsApp button hidden (no phone on this test row).

- [ ] **Step 7: Commit**

```bash
git add app/admin/mensagens
git commit -m "feat(admin): implement Caixa de Entrada (inbox list+detail, WhatsApp, filters, search)"
```

---

## Phase 9 — Configurações & Perfil

### Task 37: Configurações (4 tabs: Geral, Contato, Redes Sociais, SEO)

**Files:**
- Create: `app/admin/configuracoes/page.tsx`, `app/admin/configuracoes/actions.ts`, `app/admin/configuracoes/form.tsx`
- Test: `app/admin/configuracoes/actions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { settingsToRecord, metaDescriptionLength } from "./actions";

describe("settingsToRecord", () => {
  it("turns key/value rows into a flat object", () => {
    const rows = [{ key: "site_name", value: "Helena Duarte" }, { key: "contact_email", value: "a@b.com" }];
    expect(settingsToRecord(rows)).toEqual({ site_name: "Helena Duarte", contact_email: "a@b.com" });
  });
});

describe("metaDescriptionLength", () => {
  it("counts characters against the 160 limit", () => {
    expect(metaDescriptionLength("a".repeat(62))).toEqual({ count: 62, max: 160 });
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- app/admin/configuracoes/actions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export function settingsToRecord(rows: { key: string; value: string | null }[]): Record<string, string | null> {
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function metaDescriptionLength(value: string): { count: number; max: number } {
  return { count: value.length, max: 160 };
}

export async function getSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("global_settings").select("key, value");
  if (error) throw error;
  return settingsToRecord(data);
}

export async function saveSettings(updates: Record<string, string>) {
  const supabase = await createClient();
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      supabase.from("global_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key)
    )
  );
  revalidatePath("/admin/configuracoes");
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- app/admin/configuracoes/actions.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Page + tabbed form**

```tsx
import { getSettings } from "./actions";
import { Topbar } from "@/components/admin/topbar";
import { SettingsForm } from "./form";

export default async function ConfiguracoesPage() {
  const settings = await getSettings();
  return (
    <>
      <Topbar title="Configurações" />
      <div className="p-9"><SettingsForm initial={settings} /></div>
    </>
  );
}
```

```tsx
"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveSettings, metaDescriptionLength } from "./actions";
import { MediaPicker } from "@/components/admin/media-picker";

const FIELDS_BY_TAB = {
  geral: ["logo_url", "favicon_url", "site_name", "short_description", "footer_privacy_text", "footer_terms_text"],
  contato: ["contact_email", "contact_phone", "address", "map_embed_url"],
  redes: ["instagram_url", "facebook_url", "whatsapp_url"],
  seo: ["seo_meta_title", "seo_meta_description", "seo_og_image_url"],
} as const;

export function SettingsForm({ initial }: { initial: Record<string, string | null> }) {
  const [values, setValues] = useState(initial);

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    await saveSettings(values as Record<string, string>);
  }

  return (
    <Tabs defaultValue="geral">
      <TabsList>
        <TabsTrigger value="geral">Geral</TabsTrigger>
        <TabsTrigger value="contato">Contato</TabsTrigger>
        <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
      </TabsList>

      <TabsContent value="geral" className="flex flex-col gap-4 max-w-2xl">
        <Input placeholder="Nome do portal" value={values.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} />
        <Input placeholder="Descrição curta" value={values.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} />
        <MediaPicker type="imagem" trigger={<button type="button" className="text-sm underline">Selecionar logo</button>} onSelect={(m) => set("logo_url", m.url)} />
        <MediaPicker type="imagem" trigger={<button type="button" className="text-sm underline">Selecionar favicon</button>} onSelect={(m) => set("favicon_url", m.url)} />
        <Input placeholder="Texto — Política de Privacidade" value={values.footer_privacy_text ?? ""} onChange={(e) => set("footer_privacy_text", e.target.value)} />
        <Input placeholder="Texto — Termos de Uso" value={values.footer_terms_text ?? ""} onChange={(e) => set("footer_terms_text", e.target.value)} />
      </TabsContent>

      <TabsContent value="contato" className="flex flex-col gap-4 max-w-2xl">
        <Input placeholder="E-mail" value={values.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} />
        <Input placeholder="Telefone" value={values.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} />
        <Input placeholder="Endereço" value={values.address ?? ""} onChange={(e) => set("address", e.target.value)} />
        <Input placeholder="URL do mapa incorporado" value={values.map_embed_url ?? ""} onChange={(e) => set("map_embed_url", e.target.value)} />
      </TabsContent>

      <TabsContent value="redes" className="flex flex-col gap-4 max-w-2xl">
        <Input placeholder="Instagram" value={values.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} />
        <Input placeholder="Facebook" value={values.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value)} />
        <Input placeholder="WhatsApp" value={values.whatsapp_url ?? ""} onChange={(e) => set("whatsapp_url", e.target.value)} />
      </TabsContent>

      <TabsContent value="seo" className="flex flex-col gap-4 max-w-2xl">
        <Input placeholder="Meta Title" value={values.seo_meta_title ?? ""} onChange={(e) => set("seo_meta_title", e.target.value)} />
        <Input placeholder="Meta Description" value={values.seo_meta_description ?? ""} onChange={(e) => set("seo_meta_description", e.target.value)} />
        <span className="text-xs text-muted-foreground">
          {metaDescriptionLength(values.seo_meta_description ?? "").count}/{metaDescriptionLength(values.seo_meta_description ?? "").max} caracteres
        </span>
        <MediaPicker type="imagem" trigger={<button type="button" className="text-sm underline">Selecionar imagem Open Graph (1200×630px)</button>} onSelect={(m) => set("seo_og_image_url", m.url)} />
      </TabsContent>

      <Button onClick={save} className="mt-6">Salvar configurações</Button>
    </Tabs>
  );
}
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, go to `/admin/configuracoes`, fill fields across all 4 tabs, save, reload.
Expected: values persist per tab; no separate "SEO" nav item exists (confirmed already in Task 14's test).

- [ ] **Step 7: Commit**

```bash
git add app/admin/configuracoes
git commit -m "feat(admin): implement Configurações with 4 tabs (Geral/Contato/Redes/SEO)"
```

---

### Task 38: Perfil page

**Files:**
- Create: `app/admin/perfil/page.tsx`, `app/admin/perfil/actions.ts`, `app/admin/perfil/form.tsx`
- Test: `app/admin/perfil/actions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { passwordChangeSchema } from "./actions";

describe("passwordChangeSchema", () => {
  it("rejects a password shorter than 8 characters", () => {
    expect(passwordChangeSchema.safeParse({ password: "1234567" }).success).toBe(false);
  });
  it("accepts an 8+ character password", () => {
    expect(passwordChangeSchema.safeParse({ password: "12345678" }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- app/admin/perfil/actions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const passwordChangeSchema = z.object({ password: z.string().min(8) });

export async function saveProfile(input: { name: string; photo_url: string; language: string; theme_preference: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  const { error } = await supabase.from("admin_profiles").update({ ...input, updated_at: new Date().toISOString() }).eq("id", user.id);
  if (error) throw error;
  revalidatePath("/admin/perfil");
}

export async function changePassword(newPassword: string) {
  const parsed = passwordChangeSchema.parse({ password: newPassword });
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.password });
  if (error) throw error;
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- app/admin/perfil/actions.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Page + form (theme toggle wired to `next-themes`)**

Run: `npm install next-themes`

Wrap `app/admin/layout.tsx`'s children with a `ThemeProvider` (`attribute="class"`, `defaultTheme="light"`) before rendering the form.

```tsx
"use client";

import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";
import { saveProfile, changePassword } from "./actions";
import { useState } from "react";

export function PerfilForm({ initial }: { initial: { name: string; photo_url: string; language: string } }) {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(initial.name);
  const [photoUrl, setPhotoUrl] = useState(initial.photo_url);
  const [language, setLanguage] = useState(initial.language);
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="max-w-xl flex flex-col gap-5">
      <MediaPicker type="imagem" trigger={<button type="button" className="text-sm underline">Alterar foto</button>} onSelect={(m) => setPhotoUrl(m.url)} />
      <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Nova senha" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border p-2.5">
        <option value="pt-BR">Português (Brasil)</option>
      </select>
      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-sm font-semibold">Tema do painel</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setTheme("light")} className={theme === "light" ? "font-bold underline" : ""}>Claro</button>
          <button type="button" onClick={() => setTheme("dark")} className={theme === "dark" ? "font-bold underline" : ""}>Escuro</button>
        </div>
      </div>
      <Button
        onClick={async () => {
          await saveProfile({ name, photo_url: photoUrl, language, theme_preference: theme ?? "light" });
          if (newPassword) await changePassword(newPassword);
        }}
      >
        Salvar perfil
      </Button>
    </div>
  );
}
```

```tsx
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/topbar";
import { PerfilForm } from "./form";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("admin_profiles").select("*").eq("id", user!.id).single();
  return (
    <>
      <Topbar title="Perfil" />
      <div className="p-9">
        <PerfilForm initial={{ name: profile?.name ?? "", photo_url: profile?.photo_url ?? "", language: profile?.language ?? "pt-BR" }} />
      </div>
    </>
  );
}
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, go to `/admin/perfil`, change name and toggle to dark theme, save, reload.
Expected: name persists; theme choice persists across reload (via `next-themes` cookie/localStorage) and sidebar/topbar visibly switch to dark styling.

- [ ] **Step 7: Commit**

```bash
git add app/admin/perfil app/admin/layout.tsx package.json package-lock.json
git commit -m "feat(admin): implement Perfil page with theme toggle"
```

---

## Phase 10 — Histórico de Alterações (display)

### Task 39: `RevisionHistory` panel component

The trigger from Task 9 already writes to `revision_log` on every update. This task builds the read-only display the spec requires in each editor's footer ("Histórico de alterações" link).

**Files:**
- Create: `components/admin/revision-history.tsx`, `lib/content/revision-log.ts`
- Test: `lib/content/revision-log.test.ts`
- Modify: `app/admin/trajetoria/[id]/form.tsx:1-60` (wire in as the reference integration; the same 3-line addition applies to Projetos/Comunidade/Ideias/Notícias/Agenda forms from Tasks 26–30)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { formatRevisionSummary } from "./revision-log";

describe("formatRevisionSummary", () => {
  it("lists the changed field names, comma-separated", () => {
    const summary = formatRevisionSummary({
      changed_fields: { title: { from: "A", to: "B" }, status: { from: "rascunho", to: "publicado" } },
      changed_at: "2026-07-01T10:00:00Z",
    });
    expect(summary).toBe("title, status — 01/07/2026 10:00");
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `npm test -- lib/content/revision-log.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
export interface RevisionEntry {
  changed_fields: Record<string, { from: unknown; to: unknown }>;
  changed_at: string;
}

export function formatRevisionSummary(entry: RevisionEntry): string {
  const fields = Object.keys(entry.changed_fields).join(", ");
  const date = new Date(entry.changed_at);
  const formatted = date.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).replace(",", "");
  return `${fields} — ${formatted}`;
}
```

- [ ] **Step 4: Run and verify it passes**

Run: `npm test -- lib/content/revision-log.test.ts`
Expected: 1 passed.

- [ ] **Step 5: Build the panel (fetches on demand, behind the "Histórico de alterações" link)**

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRevisionSummary, type RevisionEntry } from "@/lib/content/revision-log";

export function RevisionHistory({ table, recordId }: { table: string; recordId: string }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<RevisionEntry[]>([]);

  async function load() {
    const { data } = await createClient()
      .from("revision_log")
      .select("changed_fields, changed_at")
      .eq("table_name", table)
      .eq("record_id", recordId)
      .order("changed_at", { ascending: false });
    setEntries(data ?? []);
    setOpen(true);
  }

  if (!open) {
    return <button type="button" className="text-xs font-bold underline text-muted-foreground" onClick={load}>Histórico de alterações</button>;
  }

  return (
    <div className="text-xs text-muted-foreground flex flex-col gap-1">
      <button type="button" className="font-bold underline self-start" onClick={() => setOpen(false)}>Ocultar histórico</button>
      {entries.length === 0 ? (
        <span>Nenhuma alteração registrada ainda.</span>
      ) : (
        entries.map((e, i) => <span key={i}>{formatRevisionSummary(e)}</span>)
      )}
    </div>
  );
}
```

- [ ] **Step 6: Wire into the Trajetória editor (reference integration)**

Modify `app/admin/trajetoria/[id]/form.tsx`: import `RevisionHistory` from `@/components/admin/revision-history` and render `{id && <RevisionHistory table="trajetoria_items" recordId={id} />}` directly above the `<StatusActionsBar>` line. Apply the same one-line addition (with each module's own table name) to the Projetos, Comunidade, Ideias, Notícias, and Agenda editor forms built in Tasks 26–30.

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, edit an existing Trajetória item (change its title), save, click "Histórico de alterações".
Expected: one entry listing `title` and a formatted timestamp.

- [ ] **Step 8: Commit**

```bash
git add components/admin/revision-history.tsx lib/content/revision-log.ts lib/content/revision-log.test.ts app/admin/trajetoria/[id]/form.tsx app/admin/projetos/[id]/form.tsx app/admin/comunidade/[id]/form.tsx app/admin/ideias/[id]/form.tsx app/admin/noticias/[id]/form.tsx app/admin/agenda/[id]/form.tsx
git commit -m "feat(admin): add RevisionHistory panel and wire it into every module editor"
```

---

## Phase 11 — Deploy

### Task 40: Vercel deployment

**Files:**
- Create: `.env.example` (public-safe reference, no secrets), `docs/deploy.md`

- [ ] **Step 1: Document required env vars**

Create `docs/deploy.md`:
```markdown
# Deploy — Painel Administrativo

## Env vars (set in Vercel → Project → Settings → Environment Variables)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only, never exposed to the client)
- TURNSTILE_SECRET_KEY
- NEXT_PUBLIC_TURNSTILE_SITE_KEY
- NEXT_PUBLIC_SITE_URL (used by SocialShareButtons)

## Pre-deploy checklist
- [ ] All migrations in `supabase/migrations/` applied to the production Supabase project (`supabase db push --linked`)
- [ ] `pg_cron` extension enabled (Task 10) — confirm with `select jobname from cron.job;`
- [ ] Admin user created in production (`scripts/create-admin-user.ts`)
- [ ] Production Supabase project is on a plan that does not auto-pause (Free tier pauses after 7 days idle, which stops all `pg_cron` jobs — see admin design spec's "A confirmar antes de implementar" note)
- [ ] Storage buckets created and policies applied (Task 33)

## Deploy
Run: `vercel --prod` (or connect the GitHub repo in the Vercel dashboard for auto-deploy on push to `main`).
```

- [ ] **Step 2: Verify a production build compiles locally**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 3: Commit**

```bash
git add docs/deploy.md .env.example
git commit -m "docs: add deployment checklist and env var reference"
```

---

## Self-Review Notes

**Spec coverage:** every section of `2026-07-01-portal-institucional-admin-design.md` maps to a task — navigation/dashboard (14–16), generic module engine (17–24), all 6 content modules with their module-specific fields including `project_stage`, `author`, `map_embed_url`, and the non-persisted share buttons (25–30), Home's canonical 8-section list and Sobre (31–32), Mídias with the video-is-a-link-not-a-file rule (33–34), Caixa de Entrada with Turnstile/honeypot/rate-limit (35–36), Configurações' 4 tabs and Perfil's theme toggle (37–38), and revision history (39) — a gap caught during this self-review (it was in the File Structure but had no task) and fixed by inserting Phase 10 before Deploy.

**Known simplification (flagged, not hidden):** Tasks 27–30 (Comunidade, Ideias, Notícias, Agenda) give full schema/action code but describe each editor form's field list in prose rather than re-printing the full JSX, since it's structurally identical to Task 25/26's `form.tsx` (same imports, same `react-hook-form` + `StatusActionsBar` shell) with only the field set changing. When executing those tasks, copy Task 26's `form.tsx` as the starting point and swap in the listed fields.

**Type consistency:** `ContentStatus` (Task 18) is the single source of truth for status strings and is reused as-is by `StatusActionsBar` (Task 21), `createModuleActions.setStatus` (Task 19), and every module's `set*Status` export — no divergent naming across tasks. `MediaItem` (Task 23) is reused by `MediaPicker` and the media library gallery (Task 34) without redefinition.

---
