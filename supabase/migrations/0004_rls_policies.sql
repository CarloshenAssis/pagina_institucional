-- Tabelas de conteúdo: público lê apenas publicado+não-deletado; autenticado faz tudo.
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

-- Singletons de config + categorias: leitura pública sempre, escrita autenticada.
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

-- Tabelas exclusivas do admin: nenhum acesso público.
alter table media_library enable row level security;
create policy "media_library_admin_all" on media_library for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table revision_log enable row level security;
create policy "revision_log_admin_read" on revision_log for select using (auth.role() = 'authenticated');
-- inserts acontecem só via trigger (security definer), então não há policy de insert.

alter table admin_profiles enable row level security;
create policy "admin_profiles_own_row" on admin_profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

alter table contact_messages enable row level security;
create policy "contact_messages_admin_all" on contact_messages for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- Sem policy de insert público: o formulário de contato grava via Server Action com
-- service role, depois das checagens de Turnstile + rate limit.

alter table contact_rate_limit enable row level security;
-- Sem policies: somente o service role (que ignora RLS) toca nesta tabela.
