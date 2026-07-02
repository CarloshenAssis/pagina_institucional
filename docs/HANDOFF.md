# Handoff — continuar em outra máquina

**Última atualização:** 2026-07-02

## Estado do projeto

Plano de implementação: `docs/superpowers/plans/2026-07-01-portal-institucional-admin-plan.md` (40 tasks, 11 fases).

| Fase | Status |
|---|---|
| 0 — Setup (Next 16 + Tailwind v4 + shadcn/Base UI + Supabase + Vitest) | ✅ concluída |
| 1 — Schema do banco (6 migrations aplicadas no Supabase hospedado) | ✅ concluída |
| 2 — Auth (login + proxy.ts protegendo /admin) | ✅ concluída |
| 3 — Shell do admin (Tasks 14–16, dashboard incluso) | ✅ concluída |
| 4 — Engine genérico de módulo (Tasks 17–24) | ✅ concluída |
| 5–11 | pendentes |

> Task 16 verificada em 2026-07-02 no browser (guard de auth, login, 6 cards, 6 ações rápidas, badge de não lidas na sidebar). A verificação numa sessão cloud usou um mock local da API Supabase — ver "Sessões Claude Code na nuvem" abaixo. Os painéis de publicações/mensagens recentes ficaram para a Task 22, conforme o plano.

## Setup na nova máquina

1. `git clone https://github.com/CarloshenAssis/pagina_institucional.git && npm install`
2. Criar `.env.local` (copiar de `.env.local.example`, agora versionado no repo) com:
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
4. **Vitest sem `@vitejs/plugin-react`** (conflito de peer deps com o pacote shadcn); o transform padrão do Vitest 4 (oxc) já compila TSX — o workaround antigo de `esbuild.jsx` foi removido do vitest.config.ts em 2026-07-02 (a opção era ignorada e quebrava o `tsc --noEmit`).
5. **Factory de actions (Task 19):** `lib/content/actions.ts` NÃO leva `"use server"` (exporta factory síncrono e helper puro, proibidos como export nesses arquivos no Next 16). A fronteira `"use server"` fica nos `actions.ts` de cada módulo (Fase 5), que exportam wrappers async.
6. **Tiptap v3** (o plano assumia v2): `Link` já vem no StarterKit (configurar via `StarterKit.configure({ link: ... })`); `Table/TableRow/TableCell/TableHeader` são exports nomeados de `@tiptap/extension-table`. Polyfills de geometria (getClientRects etc.) adicionados ao `vitest.setup.ts` para o ProseMirror rodar em jsdom.
7. **Regra `react-hooks/purity` (Next 16):** proíbe `Date.now()` no render — capturar via `useState(() => Date.now())` (ver StatusActionsBar).
8. Paleta da marca já mapeada nos tokens shadcn em `app/globals.css` (bg-primary = navy, bg-secondary = dourado, bg-background = bege, tokens de sidebar em navy). Utilitários extras: `text-gold`, `text-rose`, `font-display` (Fraunces), `font-sans` (DM Sans).

## Sessões Claude Code na nuvem (claude.ai/code)

- A URL e a anon key do Supabase são recuperáveis pelo MCP do Supabase conectado à sessão (`get_project_url` / `get_publishable_keys`) — não é preciso copiar do dashboard.
- A política de rede padrão do ambiente **bloqueia `*.supabase.co`**, então o app rodando no container não alcança o banco real (login retorna "Credenciais incorretas" por erro de rede). Para E2E real na nuvem, adicionar `supabase.co` à allowlist de rede do ambiente em claude.ai/code → Environments. Alternativa usada na Task 16: mock local da API (GoTrue + PostgREST) apontado via `NEXT_PUBLIC_SUPABASE_URL`.
- O MCP (SQL/logs/keys) funciona normalmente mesmo com a rede bloqueada, pois passa pela Management API.

## Próximo passo

Fase 5 — módulos de conteúdo (Tasks 25–30), começando pela Task 25 (módulo Trajetória). Atenção: a Fase 5 usa `react-hook-form` + `@hookform/resolvers`, que ainda não estão instalados.
