-- Rate limit de tentativas de login por IP (anti brute-force / robô).
-- Só o service role (que ignora RLS) toca nesta tabela — via a Server Action de
-- login. Sem policies = ninguém mais acessa.
create table login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  attempted_at timestamptz not null default now()
);
create index login_attempts_ip_idx on login_attempts (ip, attempted_at);
alter table login_attempts enable row level security;

-- Limpeza: tentativas antigas não importam mais. Diário às 03:20.
select cron.schedule('purge-login-attempts', '20 3 * * *',
  $$delete from login_attempts where attempted_at < now() - interval '1 hour'$$);
