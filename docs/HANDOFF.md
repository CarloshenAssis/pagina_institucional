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
| 5 — Módulos de conteúdo (Tasks 25–30: Trajetória, Projetos, Comunidade, Ideias, Notícias, Agenda) | ✅ concluída (verificada no browser em 2026-07-02: criar→publicar→duplicar→excluir→restaurar, categoria inline, toggle da Agenda persistindo) |
| 6 — Páginas singleton (Tasks 31–32: Home config + hero, Sobre) | ✅ concluída (verificada no browser: hero salvo, seções toggle/reorder persistindo, Sobre atualizando o singleton) |
| 7 — Biblioteca de Mídias (Tasks 33–34) | ✅ concluída (verificada no browser: upload de imagem, vídeo por link E por upload direto, limite 50MB rejeitando, busca, excluir) |
| 8–11 | pendentes |

> **Decisão de vídeo (2026-07-02, a pedido do Carlos):** vídeos agora são **híbridos** — link externo (YouTube/Vimeo, recomendado para vídeos longos) OU upload direto ≤50MB no bucket `public-videos` (vídeos curtos). O spec original era só link. Migration 0007 aplicada no Supabase hospedado com os 4 buckets (`public-images`, `public-pdfs`, `public-videos`, `private-assets`) + policies. Atenção à banda do plano free (~5GB/mês) se os vídeos hospedados forem muito acessados.

> **Fix importante (2026-07-02):** campos de texto opcionais nos schemas Zod usam `.nullish()` em vez de `.optional()` — colunas `null` do banco reprovavam no zodResolver e o submit falhava silenciosamente ao editar registros/singletons existentes.

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
- **Storage buckets criados em 2026-07-02** (migration 0007): `public-images`, `public-pdfs`, `public-videos`, `private-assets`.

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

## Desvios adicionais da Fase 5

- **Rotas dos módulos** vivem em `app/admin/(painel)/<módulo>/` (grupo com sidebar + guard), não em `app/admin/<módulo>/` como o plano indicava — a URL não muda.
- **`ModuleList`** (`components/admin/module-list.tsx`): wrapper client das list pages — server components não podem passar callbacks inline (onEdit) a client components; o wrapper resolve com router.push, e as Server Actions passam como props direto.
- **`saveX` retorna o id salvo** (insert e update) e os forms usam esse retorno em `onAction` — sem isso, "Publicar →" num item novo salvava apenas rascunho (o plano previa comportamento publicado). Nota: `handleSubmit()` do react-hook-form resolve com `undefined`; o id é capturado fora do callback.
- **Toggle da Agenda** chama a Server Action no `onCheckedChange` — o `<form action>` com Switch do plano nunca submeteria.
- `categoryNameSchema` em `lib/validations/category.ts` (irmão), consumido por `app/admin/category-actions.ts`.
- Componentes compartilhados novos: `MediaListField` (galerias), `CategoryCombobox`, `SocialShareButtons`.

## Próximo passo

Fase 8 — Caixa de Entrada (Tasks 35–36): verificação Turnstile + rate limit (exige `SUPABASE_SERVICE_ROLE_KEY` e chaves do Cloudflare Turnstile) e a página de mensagens.
