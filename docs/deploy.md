# Deploy — Painel Administrativo

## Env vars (Vercel → Project → Settings → Environment Variables)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, nunca exposta ao client — necessária a partir do formulário de contato)
- `TURNSTILE_SECRET_KEY` (formulário de contato)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (formulário de contato)
- `NEXT_PUBLIC_SITE_URL` (usada pelos SocialShareButtons; em produção, a URL pública do site)

Referência local: `.env.local.example` na raiz.

## Checklist pré-deploy

- [x] Migrations de `supabase/migrations/` aplicadas no projeto Supabase de produção (0001–0007 aplicadas em 2026-07-01/02)
- [ ] `pg_cron` ativo — confirmar com `select jobname from cron.job;`
- [x] Usuário admin criado em produção (`scripts/create-admin-user.ts`, sessão de 2026-07-01)
- [ ] **Plano do Supabase**: o Free pausa após ~7 dias sem uso, o que para os jobs `pg_cron` (publicação agendada e purga da lixeira). Avaliar upgrade antes do go-live.
- [x] Storage buckets criados com policies (Task 33: `public-images`, `public-pdfs`, `public-videos`, `private-assets`)

## Deploy

Conectar o repositório GitHub no dashboard da Vercel (deploy automático a cada push na `main`) ou `vercel --prod`. Framework: Next.js (auto-detectado). Nenhuma configuração extra de build é necessária.

## Pós-deploy

1. Ajustar `NEXT_PUBLIC_SITE_URL` para o domínio final.
2. Supabase → Authentication → URL Configuration: adicionar o domínio da Vercel em *Site URL / Redirect URLs*.
3. Testar login em `/admin/login` e um ciclo criar→publicar em qualquer módulo.
