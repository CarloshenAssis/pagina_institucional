create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

-- Qualquer visitante do portal público pode se inscrever (anônimo).
create policy "push_subscriptions_public_insert" on push_subscriptions for insert
  with check (true);

-- Só o admin autenticado (ou service role, que ignora RLS) pode ler/remover
-- inscrições — usado para enviar notificações e fazer limpeza.
create policy "push_subscriptions_admin_read" on push_subscriptions for select
  using (auth.role() = 'authenticated');
create policy "push_subscriptions_admin_delete" on push_subscriptions for delete
  using (auth.role() = 'authenticated');
