# Portal Institucional — Design Spec
**Data:** 2026-07-01  
**Projeto:** Portal de Mandato / Campanha — Luciana Casimiro "Tia Lu"  
**Propósito:** Portfolio para captação de clientes (produto demonstrativo reutilizável)

---

## Visão Geral

Portal institucional multi-páginas com painel CMS administrativo. O sistema nasce **completamente vazio** — todo conteúdo é publicado pelo administrador via painel. O projeto serve como portfolio para demonstrar a clientes a capacidade de entrega de portais institucionais modernos.

Arquitetura single-tenant, sem multi-tenancy. Duplicação por cliente quando necessário.

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Estilização | Tailwind CSS v4 + shadcn/ui |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth (admin único) |
| Storage | Supabase Storage (imagens, PDFs, vídeos) |
| Deploy | Vercel (gratuito) |
| Fontes | Google Fonts: Fraunces + DM Sans |

---

## Identidade Visual

Paleta de referência (ajustável — ver "Tema de cores editável" abaixo):

| Token | Valor | Uso |
|-------|-------|-----|
| `--navy` | `#1B2D6B` | Cor primária, headers, textos |
| `--beige` | `#F5F0E8` | Background geral |
| `--gold` | `#C9A84C` | Eyebrows, destaques, detalhes |
| `--rose` | `#E8327C` | CTA principal, botões de ação |
| `--white` | `#FDFCFA` | Cards, superfícies |
| Font display | Fraunces (serif) | Títulos H1–H4 |
| Font body | DM Sans (sans) | Corpo de texto |

Referência visual de layout: mockups estáticos (zip "Design references for institutional portal"), desktop-only 1280px — adaptados para mobile-first do zero, já que o export não define breakpoints.

Componentes visuais recorrentes:
- **Eyebrow:** linha dourada + texto uppercase tracking-wide
- **Reveal:** animação de entrada `opacity 0→1 + translateY 28px→0`
- **Shadow image:** sombra azul-marinha profunda em imagens hero
- **Glass card:** `bg-background/85 backdrop-blur` no header ao scroll

### Tema de cores editável

Tipografia, espaçamento, layout e responsividade permanecem fixos no código. **Cor é editável pelo admin** (Configurações → Identidade), nível "paleta de marca": 6 tokens (`primary_color`, `secondary_color`, `accent_color`, `background_color`, `text_primary_color`, `text_secondary_color`) guardados em `theme_settings` (registro único) e aplicados via CSS variables injetadas no `<html>` no server, com fallback para a paleta padrão acima se vazio. Sem validação de contraste na v1 (admin único e de confiança).

---

## Estrutura de Páginas (Público)

### Roteamento

```
/                  → Home (vitrine das demais páginas)
/sobre             → Apresentação pessoal
/trajetoria        → Linha do tempo / história
/projetos          → Listagem de projetos
/projetos/[slug]   → Detalhe do projeto
/comunidade        → Listagem de álbuns
/comunidade/[slug] → Detalhe do álbum
/ideias            → Propostas e ideias
/ideias/[slug]     → Detalhe da ideia
/noticias          → Listagem de notícias
/noticias/[slug]   → Detalhe da notícia
/agenda            → Eventos e compromissos
/contato           → Formulário + informações
/pesquisa          → Busca full-text em todos os módulos
/404               → Página de erro customizada
```

### Estrutura de cada página

Toda página pública contém:
- `<Header>` fixo com navegação principal e CTA de contato
- Conteúdo específico da página
- `<Footer>` com logo, navegação, redes sociais e créditos
- SEO individual (meta title, description, og:image via Next.js Metadata API)
- Responsividade mobile-first

### Home

Funciona como vitrine — cada seção apresenta resumo com link para página completa. **Lista canônica de seções** (única fonte de verdade — igual em ambos os specs), todas toggleáveis e reordenáveis via `home_config.sections_order`/`sections_visible`, exceto Header/Footer que são sempre fixos:

1. Hero (foto + slogan + 2-3 CTAs)
2. Sobre (resumo — vem da página Sobre)
3. Projetos em destaque (últimos/destacados, até 3 cards)
4. Comunidade (últimas fotos — teaser dos álbuns mais recentes)
5. Ideias em destaque (até 2)
6. Notícias recentes (1 destaque + 3 secundárias)
7. Agenda (próximos eventos)
8. Contato (CTA final — dados das Configurações Gerais)

Não há "Contador de stats" como seção própria (removido — não estava no protótipo do admin nem no briefing original; pode voltar como um elemento pequeno dentro do Hero, se desejado, mas não é uma seção toggleável separada).

---

## Painel Administrativo (`/admin`)

- Rota protegida por Supabase Auth (e-mail + senha), sessão via cookie, redirect para `/admin/login` se não autenticado, administrador único.
- Desenho completo (navegação, dashboard, módulos, editor, fluxo de publicação, lixeira, mídias, caixa de entrada, SEO, configurações, perfil): ver `2026-07-01-portal-institucional-admin-design.md`.

---

## Banco de Dados (Supabase)

### Tabelas principais

```sql
-- Configurações globais (key/value; chaves: logo_url, favicon_url, site_name, short_description,
-- footer_privacy_text, footer_terms_text, contact_email, contact_phone, address, map_embed_url,
-- instagram_url, facebook_url, whatsapp_url, seo_meta_title, seo_meta_description, seo_og_image_url,
-- agenda_page_enabled)
global_settings (id, key, value, updated_at)

-- Configurações da Home
home_config (id, hero_photo_url, hero_title, hero_subtitle, hero_slogan,
             hero_btn1_text, hero_btn1_url, hero_btn2_text, hero_btn2_url,
             sections_order jsonb, sections_visible jsonb, updated_at)

-- Sobre
sobre (id, text_content text, photo_url, video_url, pdf_urls jsonb,
       values_list jsonb, updated_at)

-- Tema de cores (registro único)
theme_settings (id, primary_color, secondary_color, accent_color,
                 background_color, text_primary_color, text_secondary_color, updated_at)

-- Trajetória
trajetoria_items (id, year int, title, description, image_url, video_url,
                   document_url, order_index, created_at)

-- Categorias (compartilhada)
categories (id, module text, name, slug, created_at)

-- Projetos
projects (id, title, slug, category_id, status, project_stage, excerpt text, description text,
          cover_url, gallery_urls jsonb, pdf_url, video_url,
          featured bool, seo jsonb, published_at, created_at)
-- `status`: workflow de publicação (rascunho/publicado/despublicado/arquivado/agendado).
-- `project_stage`: fase de negócio do projeto (proposto/em_andamento/concluido) — coluna
-- distinta de `status`, sem relação com publicação. `featured bool` fica independente dos
-- dois, controla apenas o destaque na Home.

-- Comunidade (álbuns)
albuns (id, title, slug, category_id, date, description text,
        cover_url, gallery_urls jsonb, video_urls jsonb,
        seo jsonb, published_at, created_at)

-- Ideias
ideas (id, title, slug, category_id, author text, excerpt text, content text, cover_url,
       video_url, pdf_url, featured bool, seo jsonb, published_at, created_at)

-- Notícias
news (id, title, slug, category_id, author text, excerpt text, content text, cover_url,
      gallery_urls jsonb, video_url, pdf_url,
      featured bool, seo jsonb, published_at, created_at)

-- Agenda
events (id, title, date timestamptz, location, description, external_url,
        map_embed_url, image_url, created_at)
-- `map_embed_url`: mapa incorporado por evento (distinto do mapa global do endereço
-- institucional em global_settings.map_embed_url, usado na página Contato).
-- Sem `agenda_visible`: visibilidade por evento já é coberta por `status` (ver spec do
-- admin) — evita duas colunas com propósito sobreposto. O toggle "Mostrar página Agenda
-- no portal" é global (afeta a rota /agenda inteira, não um evento), então vira a chave
-- `agenda_page_enabled` em `global_settings`, não uma coluna em `events`.

-- Mensagens de contato
contact_messages (id, name, email, phone, subject, message text, status, created_at)
```

`seo jsonb` em cada tabela guarda apenas `{ meta_title, meta_description }` (simplificado — imagem OG reaproveita a capa do item; sem keywords/canonical/Twitter Card na v1, ver spec do admin, seção "Fora de escopo").

Vídeo é **sempre link externo** (YouTube/Vimeo embed) — nunca upload de arquivo de vídeo, para evitar custo/complexidade de streaming no Storage. A aba "Vídeos" da Biblioteca de Mídias (spec do admin) **não armazena arquivo**: cataloga links externos reutilizáveis (URL + título) para os campos de vídeo de qualquer módulo, mesma lógica de reaproveitamento das imagens.

> Nota: o painel administrativo (dashboard, mídias, mensagens, SEO, lixeira, histórico, perfil) tem spec próprio em `2026-07-01-portal-institucional-admin-design.md`, incluindo os campos `status`, `scheduled_at` e `deleted_at` que se somam a estas tabelas, e as tabelas `media_library`, `revision_log`, `admin_profiles`, `contact_rate_limit`.

### Storage Buckets

- `public-images` — imagens de acesso público (covers, galeria, hero)
- `public-pdfs` — documentos PDF públicos
- `private-assets` — uso interno (sem acesso direto)

**Decisão confirmada:** apenas Supabase Storage (sem Cloudflare Images). Um único provedor é suficiente para o volume de um portal institucional (poucas dezenas de arquivos), evita custo e complexidade extra de sincronizar dois sistemas de upload.

### Specs de imagem por campo (exibidas no admin ao lado de cada upload)

| Campo | Formato | Dimensão recomendada | Tamanho máx |
|---|---|---|---|
| Logo | SVG ou PNG transparente | mín. 512×512px | 500 KB |
| Favicon | PNG | 512×512px | 200 KB |
| Hero (Home/Sobre) | JPG/WebP | 1920×1080px (16:9) | 2 MB |
| Retrato pessoal (Sobre) | JPG/WebP | 800×1000px (4:5) | 1 MB |
| Capa de card (Projeto/Notícia/Ideia/Evento/Álbum) | JPG/WebP | 1200×800px (3:2) | 1 MB |
| Galeria/Álbum (cada foto) | JPG/WebP | 1600×1200px | 2 MB, máx. 20 fotos |
| Trajetória (por etapa) | JPG/WebP | 1200×800px | 1 MB |
| PDF (qualquer módulo) | PDF | — | 10 MB |

### Segurança

- Todas as tabelas com RLS ativo
- Leitura pública para conteúdo publicado
- Escrita apenas para usuário autenticado (admin)
- Policies simples: `auth.role() = 'authenticated'` para INSERT/UPDATE/DELETE

---

## Componentes Compartilhados

| Componente | Descrição |
|-----------|-----------|
| `<Header>` | Navegação fixa, scroll-aware, menu mobile |
| `<Footer>` | Logo, links, redes sociais, créditos |
| `<SectionHeading>` | Eyebrow + H2 + subtítulo |
| `<Reveal>` | Wrapper de animação de entrada (IntersectionObserver) |
| `<ProjectCard>` | Card de projeto com categoria, status e imagem |
| `<NewsCard>` | Card de notícia com capa e data |
| `<EventCard>` | Card de evento com data e local |
| `<IdeaCard>` | Card de ideia com categoria |
| `<RichTextRenderer>` | Renderizador de conteúdo texto rico (do Supabase) |
| `<ImageUploader>` | Upload para Supabase Storage (admin) |
| `<AdminTable>` | Tabela reutilizável para listagens do admin |
| `<ConfirmDialog>` | Dialog de confirmação para exclusões |

---

## SEO

- `generateMetadata` por página (Next.js App Router)
- `sitemap.xml` gerado dinamicamente via `app/sitemap.ts`
- `robots.txt` via `app/robots.ts`
- OG images automáticas via `next/og`
- Dados estruturados (JSON-LD) para eventos e notícias

---

## O que NÃO pode ser alterado pelo admin

- Estrutura de layout e componentes
- Tipografia, espaçamento e CSS de base
- Responsividade
- Rotas e arquitetura
- Estrutura do banco de dados

---

## O que é administrável

Mais de 95% do conteúdo visível:
textos, imagens, vídeos, PDFs, projetos, notícias, ideias, trajetória, agenda, álbuns da comunidade, SEO por página, configuração da home, ordem de exibição, redes sociais, informações de contato, e a paleta de cores do site (ver "Tema de cores editável").

---

## Restrições e Decisões

- **Single-tenant:** sem multi-tenancy. Duplicação por cliente.
- **Editor rico:** Tiptap (não markdown simples — decisão revista, ver spec do admin) para todo conteúdo longo.
- **Sem notificações por e-mail:** mensagens de contato ficam no painel (Caixa de Entrada), sem envio automático de e-mail ao admin.
- **Sem paginação infinita:** paginação simples (limit/offset) nas listagens.
- **Sem PWA:** portal web padrão, sem service worker.
- **Imagens:** Next.js Image com `remotePatterns` para Supabase Storage.
- **Ordem de build:** painel admin (`/admin`) é prototipado e implementado primeiro; portal público consome o mesmo banco depois.

---

## Documento relacionado

Painel administrativo (dashboard, módulos, fluxo de publicação, lixeira, mídias, caixa de entrada, SEO, configurações, perfil): `2026-07-01-portal-institucional-admin-design.md`.
