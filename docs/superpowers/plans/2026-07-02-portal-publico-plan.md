# Plano de Implementação — Portal Público

**Data:** 2026-07-02
**Spec de origem:** `docs/superpowers/specs/2026-07-01-portal-institucional-design.md`
**Pré-requisito:** painel admin completo (plano de 2026-07-01, 40 tasks — concluído) e banco Supabase com migrations 0001–0007 aplicadas.

Método: o mesmo do plano do admin — cada task em TDD (teste falhando → implementação → verde → commit), verificação no browser por fase (nas sessões cloud, via mock local da API — ver HANDOFF).

---

## Desvios herdados (aplicar em TODO o plano)

O plano do admin assumia Next 14 + Radix; este plano já nasce no mundo real do repo:

1. **Next 16:** arquivos `"use server"` só exportam funções async → helpers puros e schemas vivem em arquivo irmão; testes importam do irmão.
2. **Base UI (não Radix):** sem `asChild` → `render={<Link .../>}` e `nativeButton={false}`.
3. **Server → client:** callbacks inline não serializam; passar Server Actions ou dados (strings/paths), nunca funções ad-hoc.
4. **Zod:** campos de texto opcionais são `.nullish()` (colunas `null` do banco reprovam `.optional()`).
5. **Lint Next 16:** sem `Date.now()` no render; sem `setState` síncrono em `useEffect`.
6. **Vídeo é HÍBRIDO** (decisão de 2026-07-02, difere do spec): link externo (YouTube/Vimeo) OU arquivo hospedado no bucket `public-videos` (≤50MB). Componente público precisa detectar e renderizar os dois casos.
7. Rotas públicas ficam em `app/(portal)/...` (route group com layout público próprio: Header/Footer/tema), separadas do grupo `(painel)` do admin. `app/page.tsx` atual (boilerplate) é substituído pela Home real dentro do grupo.

---

## Fase P0 — Fundações do portal

### Task 1: Tema dinâmico (CSS vars do `theme_settings`)
- Criar `lib/content/theme.ts` com `themeToCssVars(row)` (puro, testável): converte o registro de `theme_settings` em string de CSS custom properties, com fallback para a paleta padrão (navy/beige/gold/rose) quando campos vazios.
- Teste: `lib/content/theme.test.ts` (fallback + override).
- Layout público injeta `<style>:root{...}</style>` no server a partir do banco.

### Task 2: Layout público + Header + Footer
- `app/(portal)/layout.tsx` (server): busca `global_settings` + `theme_settings` uma vez; injeta tema; renderiza `<Header>` e `<Footer>`.
- `components/portal/header.tsx` (client): navegação fixa, glass ao scroll (`bg-background/85 backdrop-blur`), menu mobile, CTA Contato (rose). Esconde item "Agenda" quando `agenda_page_enabled != 'true'` (recebe por prop).
- `components/portal/footer.tsx`: logo, navegação, redes sociais (só as preenchidas), créditos, textos de privacidade/termos.
- Teste: helper puro `visibleNavItems(settings)` em arquivo irmão (esconde Agenda; testável).

### Task 3: Componentes de marca
- `components/portal/section-heading.tsx` (Eyebrow dourado + H2 + subtítulo).
- `components/portal/reveal.tsx` (IntersectionObserver, opacity/translateY; client).
- `components/portal/rich-text.tsx` — renderiza HTML do Tiptap com sanitização (`isomorphic-dompurify` ou lista branca de tags) e classes de prosa.
- `components/portal/video-embed.tsx` — **híbrido**: URL do YouTube/Vimeo → iframe embed responsivo; URL do bucket `public-videos` → `<video controls>`. Helper puro `videoKind(url)` testado (youtube/vimeo/arquivo/desconhecido).

### Task 4: 404 customizada
- `app/(portal)/not-found.tsx` com a identidade visual e link para a Home.

## Fase P1 — Camada de consulta pública

### Task 5: Queries públicas compartilhadas
- `lib/content/public-queries.ts`: `listPublished(table, {page, perPage, categorySlug?})` (filtra `status = 'publicado'`, `deleted_at is null`, ordena por `published_at desc`, paginação limit/offset simples) e `getPublishedBySlug(table, slug)` (retorna null se não publicado → página chama `notFound()`).
- Helpers puros testáveis em irmão: `pageRange(page, perPage)`, `totalPages(count, perPage)`.
- Nota RLS: o client anon já só enxerga publicado+não-deletado nas tabelas de conteúdo — a query reforça, não substitui.

## Fase P2 — Home

### Task 6: Registry de seções + página
- `lib/content/home-render.ts`: `orderedVisibleSections(order, visible)` (puro, testado) → lista final respeitando `sections_order`/`sections_visible`.
- `app/(portal)/page.tsx` (server): carrega `home_config` + dados de cada seção visível em paralelo e renderiza na ordem.

### Tasks 7–14: As 8 seções canônicas (uma task cada, mesma ordem do spec)
1. **Hero** — foto com shadow navy, título/subtítulo/slogan, até 2 CTAs dos campos `hero_btn*`.
2. **Sobre resumo** — primeiros parágrafos de `sobre.text_content` + link /sobre.
3. **Projetos em destaque** — até 3 `featured` publicados; `<ProjectCard>` (categoria, fase, capa).
4. **Comunidade teaser** — fotos dos álbuns mais recentes (por `date`/`published_at`).
5. **Ideias em destaque** — até 2 `featured`; `<IdeaCard>`.
6. **Notícias recentes** — 1 destaque + 3 secundárias; `<NewsCard>` (capa, data, categoria).
7. **Agenda** — próximos eventos publicados (`date >= now`), some se `agenda_page_enabled` off; `<EventCard>`.
8. **Contato CTA** — e-mail/telefone/endereço das Configurações + botão para /contato.

Cada card component ganha teste de render (Testing Library). Verificação da fase no browser: seções na ordem do admin, seção ocultada some.

## Fase P3 — Páginas institucionais

### Task 15: /sobre
Conteúdo completo de `sobre`: retrato (4:5), texto rico, galeria, vídeo (VideoEmbed), PDFs para download, `values_list`.

### Task 16: /trajetoria
Linha do tempo vertical por `order_index`/`year` (apenas publicados): ano em display, título, descrição, imagem/vídeo/documento opcionais.

## Fase P4 — Módulos com listagem + detalhe

### Task 17: /projetos + /projetos/[slug]
Listagem paginada com filtro por categoria (querystring), badge de fase (proposto/em andamento/concluído). Detalhe: capa, texto rico, galeria (lightbox simples), PDF, vídeo, projetos relacionados (mesma categoria, até 3).

### Task 18: /ideias + /ideias/[slug] — mesmo shape (autor no detalhe).

### Task 19: /noticias + /noticias/[slug] — mesmo shape + botões de compartilhar (reusar `SocialShareButtons`) e galeria.

### Task 20: /comunidade + /comunidade/[slug] — grid de álbuns; detalhe com galeria de fotos + vídeos (híbrido).

### Task 21: /agenda
Gate global: `agenda_page_enabled != 'true'` → `notFound()`. Próximos eventos e passados separados; mapa incorporado por evento; link externo "Participar".

## Fase P5 — Contato

### Task 22: /contato
- Formulário client com honeypot + widget Turnstile (`@marsidev/react-turnstile` ou script direto) → chama `submitContactForm` (já pronto desde a Task 35 do admin) com IP via header.
- Infos institucionais + mapa global (`global_settings.map_embed_url`).
- **Pendências de ambiente:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Vercel + .env.local). Sem elas: renderizar formulário desabilitado com aviso (não quebrar a página).
- Teste: schema/estados do form; verificação manual do fluxo com as chaves reais.

## Fase P6 — Pesquisa

### Task 23: /pesquisa
- Server action/RSC `searchAll(q)`: `ilike` em title/excerpt/content de projects, ideas, news, albuns, events (publicados), resultados agrupados por módulo com link. Helper puro `groupResults(rows)` testado.
- Input de busca no Header (submit → /pesquisa?q=).

## Fase P7 — SEO

### Task 24: Metadata por página
`generateMetadata` em todas as rotas: título/descrição das Configurações (padrão) e do `seo jsonb` do item (detalhes); OG image = capa do item ou `seo_og_image_url` global.

### Task 25: sitemap.ts + robots.ts
Sitemap dinâmico com todas as rotas estáticas + slugs publicados dos 4 módulos; robots liberando tudo exceto /admin.

### Task 26: JSON-LD
`NewsArticle` no detalhe de notícia e `Event` no detalhe de evento (componente `<JsonLd>` com dados tipados; teste do builder puro).

## Fase P8 — Qualidade final e deploy

### Task 27: next/image remotePatterns
`next.config.ts`: permitir `wbbqnbrhulasdttgapqw.supabase.co/storage/v1/object/public/**`; trocar `<img>`/unoptimized por `next/image` nos componentes públicos.

### Task 28: Verificação E2E completa no browser
Fluxo admin→portal: publicar item no admin → aparece na listagem e Home; despublicar → some; tema alterado no admin muda as cores do portal; mobile viewport (375px) sem overflow.

### Task 29: Deploy + smoke test em produção
Push (deploy automático da Vercel), conferir rotas principais, sitemap e formulário de contato no ar.

---

## Fora de escopo (v1 — igual ao spec)
Multi-tenancy, notificações por e-mail, paginação infinita, PWA, validação de contraste do tema, Twitter Cards/canonical/keywords.
