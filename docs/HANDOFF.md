# Handoff — continuar em outra máquina

**Última atualização:** 2026-07-02

## Estado do projeto

Plano de implementação: `docs/superpowers/plans/2026-07-01-portal-institucional-admin-plan.md` (40 tasks, 11 fases).

| Fase | Status |
|---|---|
| 0 — Setup (Next 16 + Tailwind v4 + shadcn/Base UI + Supabase + Vitest) | ✅ concluída |
| 1 — Schema do banco (6 migrations aplicadas no Supabase hospedado) | ✅ concluída |
| 2 — Auth (login + proxy.ts protegendo /admin) | ✅ concluída |
| 3 — Shell do admin | ⚠️ Tasks 14–15 prontas; **Task 16 (dashboard) em WIP** — testes passam, falta verificação manual |
| 4–11 | pendentes |

## Setup na nova máquina

1. `git clone https://github.com/CarloshenAssis/pagina_institucional.git && npm install`
2. Criar `.env.local` (copiar de `.env.local.example`) com:
   - `NEXT_PUBLIC_SUPABASE_URL=https://wbbqnbrhulasdttgapqw.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=` → pegar em supabase.com/dashboard → projeto **portal-institucional** (org OGESTOREFICIENTE) → Settings → API Keys (chave `anon` legacy)
   - `SUPABASE_SERVICE_ROLE_KEY=` → mesma tela (só será necessária na Fase 8 — formulário de contato)
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
3. `npm run dev` e login em `/admin/login` (usuário admin já existe no banco; senha definida na sessão de 2026-07-01 — trocar depois na tela Perfil).

## Infra

- **Supabase:** projeto `portal-institucional`, ref `wbbqnbrhulasdttgapqw`, região sa-east-1, plano free. Schema completo aplicado (16 tabelas, RLS, triggers de revision_log, 3 jobs pg_cron). Migrations espelhadas em `supabase/migrations/`.
- **Atenção plano free:** projeto pausa após ~7 dias sem uso → jobs pg_cron param. Ver nota no spec do admin.
- **Storage buckets ainda NÃO criados** (Fase 7 / migration 0007).

## Desvios do plano já estabelecidos (o plano assumia Next 14 + Radix)

1. **Next 16:** arquivos `"use server"` só podem exportar funções async → schemas Zod e helpers puros vivem em arquivo irmão (ex.: `schema.ts`, `nav-config.ts`) importado pelas actions; os testes importam do arquivo irmão.
2. **shadcn/Base UI:** não existe `asChild` → usar `render={<Link .../>}` e `nativeButton={false}` em Button quando renderizar `<a>`.
3. **`proxy.ts`** na raiz substitui `middleware.ts` (convenção nova do Next 16).
4. **Vitest sem `@vitejs/plugin-react`** (conflito de peer deps com o pacote shadcn); `esbuild.jsx = "automatic"` no vitest.config.ts resolve JSX.
5. Paleta da marca já mapeada nos tokens shadcn em `app/globals.css` (bg-primary = navy, bg-secondary = dourado, bg-background = bege, tokens de sidebar em navy). Utilitários extras: `text-gold`, `text-rose`, `font-display` (Fraunces), `font-sans` (DM Sans).

## Próximo passo

Terminar a Task 16 (dashboard: cards de resumo, atalhos rápidos, publicações recentes, mensagens recentes — ver plano), verificar no browser logado, commitar, e seguir para a Fase 4 (engine genérico de módulo, Tasks 17–24).
