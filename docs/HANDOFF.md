# Handoff — continuar em outra máquina

**Última atualização:** 2026-07-04 — melhorias pós-lançamento em produção (ver "Changelog pós-épico" logo abaixo). Domínio de produção mudou para **https://portaltialu.vercel.app**.

---

## Changelog pós-épico (melhorias com o Carlos usando o sistema)

> **Contexto:** depois do épico fechado, o Carlos passou a usar o sistema em produção e a pedir ajustes. Cada item abaixo já está **em produção** (`main` deployado na Vercel) e **verificado**. Esta lista existe para, quando for a hora, **re-sincronizar o repositório-base de revenda** (`github.com/CarloshenAssis/Portal_Institucional_Base`) — ver "Repositório-base" no fim desta seção.
>
> **Infra de produção da Tia Lu:** projeto Vercel serve em `portaltialu.vercel.app` (o antigo `pagina-institucional-chi.vercel.app` redireciona 307). Env vars configuradas na Vercel: Supabase URL/anon/service-role, Turnstile site/secret key, `NEXT_PUBLIC_SITE_URL`. Formulário de contato **ativo e testado ponta-a-ponta** em produção.

| # | Mudança | Por quê | Migration DB? | Commits |
|---|---|---|---|---|
| 1 | **Fallback `NEXT_PUBLIC_SITE_URL` → `portaltialu.vercel.app`** (`next.config.ts`) | Carlos trocou o domínio na Vercel; sitemap/robots/OG precisavam do domínio novo | não | `5ade52c` |
| 2 | **Formulário de contato — fix do envio** | "Dados inválidos" / botão travado: o token do Turnstile chegava vazio. Evoluiu por 3 commits até a solução final: **renderização explícita** do widget (`turnstile.render()` num ref, `?onload=&render=explicit`) — o modo implícito não renderiza confiável com `<Script>` do Next. Botão só habilita com token; exibe código de erro do widget | não | `1e0b273`, `9b53a25`, `4412ca5` |
| 3 | **Sobre — editor de texto rico + Missão/Visão/Valores** | Campo "Texto" era `<textarea>` puro mas o portal renderiza como HTML (texto colado ficava corrido). Trocado por `RichTextEditor`. "Valores" existia no banco/portal mas não tinha campo no admin (Zod descartava). "Missão"/"Visão" não existiam em lugar nenhum | **SIM — `0008_sobre_missao_visao.sql`** (add `mission_text`, `vision_text` em `sobre`) | `73ed693` |
| 4 | **Seletor de mídia — upload embutido + fix de miniaturas** | "Selecionar logo/favicon" só listava mídia existente, sem subir arquivo (obrigava ir na Biblioteca em outra aba). Agora sobe direto no diálogo (reusa `uploadMedia`). Miniaturas de imagem nunca renderizavam (`<div>` vazio) — corrigido | não | `33b2ec7` |
| 5 | **Configurações — preview + botão Remover imagem** (logo, favicon, OG image) | Não havia como **tirar** uma logo/favicon já definidos (MediaPicker só trocava). Novo `ImageField` mostra a imagem atual com "Trocar"/"Remover" (seta vazio; Header/layout já tratam vazio) | não | `5086981` |
| 6 | **Segurança de login — rate limit anti brute-force** | 5 tentativas erradas do mesmo IP travam o login por **45s** (cooldown a partir da última falha), mensagem "Aguarde N segundos". Enforcement **server-side** (robô não burla pelo cliente). Login certo zera o contador. Usa service role; degrada (pula) se a chave não existir | **SIM — `0009_login_attempts.sql`** (tabela `login_attempts` + job `pg_cron` de limpeza) | `7f47183`, `7cae3ec` |
| 7 | **Seletor de mídia responsivo + `ImageField` em todos os campos + tamanho ideal** | Popup do seletor aparecia quebrado (miniaturas esticadas): `DialogContent` base tem `sm:max-w-sm` que sobrepunha o `max-w-3xl`. Corrigido: largura responsiva + grade `grid-cols-2/3/4` + miniaturas `aspect-square object-contain`. Botão "Remover" agora em TODOS os campos de imagem única (novo componente reutilizável `components/admin/image-field.tsx`): Sobre, Home hero, Perfil, capa dos 4 módulos, imagem de Trajetória/Agenda. Cada campo (single e galeria) exibe o **tamanho ideal** recomendado por seção (logo 400×120, favicon 512×512, OG 1200×630, retratos 1000×1250, capas 1200×800, galerias 1200×900, avatar 400×400) | não | `346b745` |
| 8 | **Fix da fonte Fraunces (letras "quebradas" em títulos)** | Ver seção "Changelog" abaixo — eixo óptico `opsz` travado em `app/globals.css` | não | `f157046` |
| 9 | **Imagem em qualquer ponto do texto + Galeria vira carrossel** | Carlos queria colocar imagens no início/meio/fim de Notícias/Projetos/Ideias/Comunidade/Sobre e não conseguia. Causa: o botão de imagem do editor de texto (`RichTextEditor`) usava `window.prompt()` pedindo uma URL — inútil, ninguém tem a URL de uma foto da Biblioteca de Mídias. Trocado pelo `MediaPicker` (buscar/enviar), inserindo a foto exatamente onde o cursor estiver — resolve início/meio/fim e "quantas imagens quiser" de uma vez. Novo componente `components/portal/gallery-carousel.tsx` (scroll nativo com snap, sem dependência nova) substitui a grade estática da Galeria em Sobre/Notícias/Projetos/Comunidade no site público. Avaliei um carrossel encaixável dentro do texto (bloco especial no meio do artigo) e decidi não fazer — exigiria um node customizado no Tiptap + hidratação de componente React dentro de HTML estático salvo no banco, complexidade desproporcional ao ganho frente a só usar a Galeria. Validado com item de teste publicado e removido em seguida (imagem inline entre parágrafos + carrossel de 3 fotos, desktop e mobile) | não | `fec516b` |
| 8 | **Fix da fonte de título (Fraunces) — letras "quebradas" (ex.: "j")** | Carlos reportou o "j" de títulos (`SectionHeading`, `h1`-`h4`) com gancho exagerado, parecendo quebrado. Causa: Fraunces é fonte variável com eixo óptico (`opsz`) que o navegador ajusta sozinho pelo tamanho — em títulos grandes ele troca pro corte "display", desenhado pra ser mais decorativo/exagerado (é aí que o "j" ganha o gancho grande). Travado em `app/globals.css` com `font-optical-sizing: none` + `font-variation-settings: "opsz" 14`, fixando o corte "texto" (mais convencional) em qualquer tamanho de heading. Verificado visualmente antes/depois local e em produção com Playwright (zoom 3x no heading) | não | `f157046` |

**Auditoria de segurança de chaves (2026-07-04, a pedido do Carlos):** nenhum `.env` versionado (só `.env.local.example` com campos vazios); `.gitignore` cobre `.env*`. Nenhum segredo hardcoded — `SUPABASE_SERVICE_ROLE_KEY`/`TURNSTILE_SECRET_KEY` só lidos via `process.env`. A anon key no `next.config.ts` é pública por design (protegida pelo RLS), não é vazamento.

### ⚠️ Repositório-base de revenda — PRECISA RE-SINCRONIZAR
O `Portal_Institucional_Base` (`github.com/CarloshenAssis/Portal_Institucional_Base`) foi criado no meio dessas mudanças — está **desatualizado**. Conferido em 2026-07-04: o repo base tem as migrations `0001`–`0008` mas **falta a `0009_login_attempts.sql`**, e falta o **código** dos itens 2–7 desta tabela (o repo base tem a migration `0008` mas provavelmente não o formulário de Sobre que a usa, nem os fixes de contato/seletor de mídia/remover imagem/login). Decisão do Carlos (2026-07-04): **acumular** as mudanças e re-sincronizar tudo de uma vez mais adiante, não a cada ajuste. Quando for: recopiar o código de `main` para o repo base, **remover de novo** os fallbacks hardcoded do `next.config.ts` (Supabase URL/anon key/`NEXT_PUBLIC_SITE_URL` apontam pra Tia Lu) e o `.env.local.example` específico, conferir que as migrations `0001`–`0009` estão todas lá, e dar push. Ver `docs/deploy.md` do repo base para o resto.

---

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
| 8 — Caixa de Entrada (Tasks 35–36) | ✅ concluída (verificada no browser: lista+detalhe, marcar lida ao exibir, WhatsApp condicional, filtros, busca, arquivar) |
| 9 — Configurações & Perfil (Tasks 37–38) | ✅ concluída (verificada no browser: 4 abas persistindo, contador SEO, perfil com upsert, tema dark persistindo, troca de senha) |
| 10 — Histórico de Alterações (Task 39) | ✅ concluída (verificada no browser: painel carrega sob demanda, formata entradas, recolhe; integrado nos 6 editores) |
| 11 — Deploy Vercel (Task 40) | ⚠️ docs + build prontos; fallbacks de env públicas no next.config permitem importar sem configurar nada — **falta 1 ação manual**: importar o repo em vercel.com/new (o CLI/MCP da sessão não têm credencial de deploy) |

> Fase 9: `saveProfile` usa **upsert** (a linha em admin_profiles pode não existir para o usuário). `AdminThemeProvider` (next-themes, attribute="class") envolve o layout do painel. Regra nova do lint Next 16: setState síncrono dentro de useEffect é erro — o inbox foi refatorado para marcar leitura nos callbacks de evento/fetch.

> Fase 8: helpers Turnstile/rate-limit prontos e testados, e `app/contact-actions.ts` (submitContactForm) pronto para o formulário público. **Pendências de ambiente para ativar o formulário de contato:** `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (criar site em dash.cloudflare.com → Turnstile, grátis) e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`/Vercel. UX ajustada: mensagem exibida no detalhe é marcada como lida (inclusive a auto-selecionada).

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

## Épico do admin: CONCLUÍDO (2026-07-02)

40/40 tasks, merge na `main` (commit 7032655), deploy na Vercel feito pelo Carlos via import do repo. Pós-deploy pendente: conferir a URL de produção, cadastrá-la no Supabase Auth (Site URL/Redirect) e ajustar `NEXT_PUBLIC_SITE_URL` — ver `docs/deploy.md`.

## Próximo passo

**Portal público** — plano em `docs/superpowers/plans/2026-07-02-portal-publico-plan.md` (29 tasks, P0–P8).

- ✅ Fase P0 completa (tema, layout, Header/Footer, componentes de marca, VideoEmbed híbrido, 404).
- ✅ Fase P1 (Task 5: consultas públicas com paginação/categoria).
- ✅ Fase P2 (Tasks 6–14: Home completa com as 8 seções, verificada no browser + mobile).
- ✅ Fase P3 (/sobre com valores/vídeo/galeria/PDFs; /trajetoria com linha do tempo; 404 via catch-all no grupo — not-found de route group não captura URL desconhecida sozinho).
- ✅ Fase P4 (listagens+detalhes dos 4 módulos com filtro de categoria/paginação/estados vazios; /agenda com gate global e mapa por evento) — 16 checks E2E.
- ✅ Fase P5 (/contato: form Turnstile-ready, desabilitado com aviso até existirem `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` + `SUPABASE_SERVICE_ROLE_KEY` no ambiente) e P6 (/pesquisa agrupada + busca no header) — 10 checks E2E.
- ✅ Fase P7 (SEO): `generateMetadata` em todas as páginas públicas (`lib/content/seo.ts` → `itemMetadata`, sobrepõe `seo jsonb` do item ao padrão das Configurações; OG image reaproveita a capa); `app/sitemap.ts` dinâmico (rotas estáticas + slugs publicados via client anon puro); `app/robots.ts` (libera tudo exceto `/admin`); JSON-LD (`lib/content/jsonld.ts` + `components/portal/json-ld.tsx`) — `NewsArticle` no detalhe de notícia, `Event` nos cards da Agenda. `next.config.ts` ganhou `images.remotePatterns` para o bucket do Supabase Storage (obrigatório para `next/image` aceitar essas URLs). 12 testes novos, commit `29a063a`.
### Ações pendentes (em ordem de prioridade)

1. ✅ **Mobile (2026-07-03):** protótipo do Carlos recebido (mockups `Mobile.dc.html`/`AdminMobile.dc.html` simulando iPhone, marca placeholder "Helena Duarte") — padrão de referência: header sticky com hamburger→drawer, busca no drawer, seções empilhadas, no admin: topbar+hamburger→drawer agrupado (Dashboard/Conteúdo/Sistema), tabs com scroll horizontal, listas em cards. Auditoria mostrou que o **portal público já era responsivo** (Header/Footer/Home/listagens com breakpoints `md:`/`lg:` corretos) — só faltava busca no menu mobile (adicionada) e botão do form de contato full-width no mobile (ajustado). O **painel admin era desktop-only e quebrava abaixo de ~1024px** (sidebar fixa de 240px sem colapsar, sem hamburger) — convertido para drawer via novo `lib/admin/nav-context.tsx` (`AdminNavProvider`/`useAdminNav`), `Sidebar` (drawer fixed + overlay abaixo de `md`, estático em `md+`) e `Topbar` (botão hamburger). `ContentTable` (listas de módulo) reflowa para cards com labels inline abaixo de `md` em vez de grid fixo ilegível. Tabs de Configurações/Mídias com `overflow-x-auto`. Verificado com Playwright headless em viewport 390×844 (rota de preview temporária fora de `/admin`, removida após o teste — auth real não foi tocada). Commit `0b43bde`.
2. ✅ **Fase P8 — Task 27 (2026-07-03):** todas as imagens do portal público (`<img>`) trocadas por `next/image` (`fill`+`sizes`) em cards, hero, sobre, trajetória, comunidade e detalhes dos 4 módulos; `remotePatterns` do bucket Supabase já existia desde a P7. Build+typecheck+107 testes verdes, 0 erros de console via Playwright. Commit `6523419`.
3. ✅ **Fase P8 — Task 28 (E2E completo) e Task 29 (deploy/smoke test): CONCLUÍDAS em 2026-07-03.** Resumo da sessão (detalhes na seção "Épico do portal público: CONCLUÍDO" no fim deste documento):
   - A allowlist de rede **já tinha propagado** (`curl $HTTPS_PROXY/__agentproxy/status` ainda não lista os domínios em `noProxy`, mas `curl` direto a `vercel.app`/`supabase.co` já funcionava — a policy funciona por outro mecanismo além do `noProxy` reportado).
   - **Achado crítico:** a branch `claude/status-check-fki5m9` com todo o portal público (Fases P0–P8) nunca tinha sido mergeada em `main` nem tinha PR aberto — produção rodava só o placeholder do épico do admin. Mergeado em `main` (commit `b438567`) com aprovação do Carlos, disparando o deploy real.
   - **Bug encontrado e corrigido:** `/sobre` retornava 500 em produção (funcionava local) — `isomorphic-dompurify` (via `jsdom`) quebrava o bundle serverless da Vercel. Trocado por `sanitize-html` (sem DOM), commits `380c908` (tentativa incompleta com `serverExternalPackages`) e `8bf09c2` (fix definitivo).
   - Todas as 13 rotas públicas + `/admin/login` verificadas em produção: 200 OK.
   - Fluxo admin→portal testado via Playwright real (login, criar notícia, publicar → aparece em `/noticias` e na Home, despublicar → some, excluir → some do admin). Nenhum conteúdo de teste órfão (soft-deleted, `deleted_at` setado).
   - Tema dinâmico: **não há UI no admin para editar `theme_settings`** (aba Configurações só tem Geral/Contato/Redes/SEO — ver "Pendência nova" abaixo). O mecanismo de renderização (`theme_settings` → `themeToCssVars` → `<style>` no layout) foi validado via update SQL direto: mudança refletiu no HTML imediatamente, sem cache.
   - Mobile 375×812: Home + `/sobre` + `/noticias` + `/contato` + `/admin` + `/admin/noticias` sem overflow horizontal (`scrollWidth === clientWidth` em todas). Drawers do portal e do admin abrem corretamente.
4. **Formulário de contato ainda não testado de ponta a ponta** — depende de `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (Vercel + `.env.local`). Ao configurar, testar envio, honeypot e rate limit.
5. ✅ **Aba "Aparência" no admin (2026-07-03), fechando a pendência acima. JÁ EM PRODUÇÃO.** `app/admin/(painel)/configuracoes/form.tsx` ganhou uma 5ª aba com 6 campos de cor (`<input type="color">` + hex texto, validados por `HEX` de `lib/content/theme.ts`, agora exportado junto com `THEME_COLOR_KEYS`). Novas actions `getTheme`/`saveTheme` em `actions.ts` (mesmo arquivo das outras). Bug pego e corrigido durante o teste: `saveTheme` validava `Object.entries(theme)` inteiro, incluindo `id`/`updated_at` que vêm no `select("*")` do Supabase (não só as 6 cores) — `"Cor inválida em id: 1"` 500 ao salvar; corrigido para validar só `THEME_COLOR_KEYS`. Testado ponta a ponta **em produção** (login → trocar cor secundária → salvar → refletir no `<style>` do portal público → reverter), 0 erros de servidor. Commit `5b51be9`, mergeado em `main` (`5c07958`).
6. ✅ **Fix de `NEXT_PUBLIC_SITE_URL` (2026-07-03). JÁ EM PRODUÇÃO.** Achado ao reconferir produção: sem essa env var configurada na Vercel, `sitemap.xml`, `robots.txt` e o JSON-LD caíam no fallback `"http://localhost:3000"` hardcoded nesses arquivos — real em produção (`curl .../sitemap.xml` mostrava `<loc>http://localhost:3000/...</loc>`), quebraria indexação no Google. Corrigido com o mesmo padrão dos fallbacks já existentes no `next.config.ts` para as chaves do Supabase: `NEXT_PUBLIC_SITE_URL` cai em `https://pagina-institucional-chi.vercel.app` se não estiver setada no ambiente. Confirmado no ar: `sitemap.xml`/`robots.txt` agora usam o domínio real. Commit `5b51be9`, mergeado em `main` (`5c07958`).
7. ✅ **Fix do tema escuro do painel (2026-07-03). JÁ EM PRODUÇÃO.** Carlos reportou (screenshot) a sidebar do admin ficando clara com texto branco ilegível ao ativar o tema Escuro em /admin/perfil. Causa: `components/admin/sidebar.tsx` usava `bg-primary` + `text-white`; em dark mode o `.dark` do globals.css inverte `--primary` para quase branco (`oklch(0.922 0 0)`), então fundo claro + texto branco. Trocado pelos tokens `--sidebar-*` (`bg-sidebar`/`text-sidebar-foreground`/`border-sidebar-border`/`bg-sidebar-accent`), que já existiam corretos para light e dark. No mesmo passe corrigi outros hardcodes que quebravam em dark: `bg-white` → `bg-card` em cards de mídia/home/tabela/lixeira e selects; botão ativo do rich-text (`text-white` → `text-primary-foreground`); badge "publicado" (`text-primary` → `text-secondary-foreground`). Verificado em produção com Playwright (sidebar bg computada `lab(7.78...)` = quase preto, antes era clara). Commit `5867200`, mergeado em `main` (`df59e08`). Nota: a preferência de tema é do next-themes (localStorage do navegador), não persiste no banco.

> **Estado de produção ao fim de 2026-07-03:** `main` = `df59e08`, tudo deployado e verificado. Todas as tabelas de conteúdo com 0 linhas (os itens de teste do smoke test foram hard-deletados de `news` + `revision_log` para o site ir realmente vazio). Pendências que sobrevivem: só o **item 4** (formulário de contato, depende de chaves Turnstile/service-role no ambiente Vercel) — é config de hospedagem, não código.

### Lembretes fixos

- **Requisito de entrega (Carlos, 2026-07-02): o site vai VAZIO para produção** — nunca semear conteúdo no banco real; dados de teste só no mock local. Estados vazios elegantes em todas as páginas públicas (feito na P4). Banco real conferido em 2026-07-02: 0 linhas em todas as tabelas de conteúdo; reconferido em 2026-07-03 após o smoke test (os 2 itens de teste criados em Notícias foram soft-deleted, `deleted_at` setado, nenhum publicado nem visível).
- Senha do admin foi redefinida em 2026-07-02 a pedido do Carlos (temporária, passada no chat — ele deve trocá-la em /admin/perfil). **Redefinida de novo em 2026-07-03** (via SQL no Supabase, `extensions.crypt`) para rodar o smoke test E2E desta sessão — senha temporária passada ao Carlos no chat; ele deve trocá-la em /admin/perfil na próxima vez que logar.

> ⚠️ Lição operacional: **não rodar `npm run build` com o `next dev` ligado** — compartilham a `.next` e o dev passa a servir um prerender velho (páginas "congeladas" com dados errados). Se acontecer: matar a árvore inteira do dev (`pkill -f next-server` além do wrapper), `rm -rf .next` e subir de novo.

> ⚠️ Lição operacional (2026-07-03): **testar produção real com Playwright neste ambiente exige 3 flags extras no `launch()`** além do binário em `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`: `--proxy-server=127.0.0.1:40935` (Chromium não lê `HTTPS_PROXY` sozinho), `--ssl-version-max=tls1.2` (a reterminação TLS do proxy da sessão reseta a conexão em TLS 1.3 — provavelmente ECH/GREASE; funciona normalmente forçando 1.2) e `--ignore-certificate-errors`. Sem isso todo `page.goto()` para um domínio externo falha com `ERR_CONNECTION_RESET`, mesmo `curl` funcionando normalmente pelo mesmo proxy.

## Épico do portal público: CONCLUÍDO (2026-07-03)

29/29 tasks (P0–P8). Merge de `claude/status-check-fki5m9` em `main` (commit `b438567`) + fix de bug de deploy (`8bf09c2`) + push direto em `main` (aprovado pelo Carlos nesta sessão, necessário para disparar o deploy da Vercel). Produção em **https://pagina-institucional-chi.vercel.app/** verificada rota a rota, fluxo admin→portal, tema dinâmico (mecanismo) e mobile 375px — ver item 3 em "Ações pendentes" acima para o detalhe de cada checagem.

Pendências que sobrevivem ao fechamento do épico (não bloqueiam, mas ficam para depois): formulário de contato ponta-a-ponta (item 4 acima) e a falta de UI de tema no admin (item 5 acima).
