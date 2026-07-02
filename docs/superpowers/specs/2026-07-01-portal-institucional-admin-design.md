# Painel Administrativo — Design Spec
**Data:** 2026-07-01
**Projeto:** Portal Institucional (produto portfolio, single-tenant)
**Relação com outros specs:** complementa `2026-07-01-portal-institucional-design.md` (spec do portal público). Este documento cobre **apenas o painel `/admin`**, que será prototipado e construído primeiro.

---

## Visão Geral

Painel administrativo estilo CMS premium (referência: Payload CMS, Sanity, Strapi, Shopify Admin) — limpo, rápido, organizado, sem necessidade de treinamento. Deve parecer um produto SaaS comercial. Cobre 100% do gerenciamento de conteúdo do portal público; nenhuma informação é escrita diretamente em código.

Referência visual: protótipo interativo (`Admin.dc.html`, zips "Design references for institutional portal (3)" e "(4)" — a versão (4) é a mais atual e prevalece em caso de conflito), usando a mesma paleta e tipografia do portal público (cores viram tokens editáveis via Configurações — ver spec do portal, seção "Tema de cores editável").

Uso principal em **desktop**; responsivo até **tablet** (sidebar colapsa para ícones/drawer). Não é mobile-first como o portal público.

---

## Stack Específica do Admin

| Item | Escolha |
|---|---|
| Editor de texto rico | Tiptap (headless, extensível — negrito, itálico, links, listas, tabelas, imagem, vídeo embutido, PDF embutido, citação, separador, botão customizado) |
| Componentes UI | shadcn/ui: Table, Sidebar, Dialog, Sheet, Tabs, Switch, Toast (sonner) |
| Tema claro/escuro do painel | `next-themes` |
| Publicação agendada | `pg_cron` (Supabase) rodando a cada 5 min |
| Limpeza de lixeira | `pg_cron` diário (remove definitivamente após 30 dias) |
| Limpeza de rate limit | `pg_cron` diário (remove registros de `contact_rate_limit` com mais de 24h) |
| Anti-spam do formulário de contato | Cloudflare Turnstile + honeypot + rate limiting via função Postgres |

> **A confirmar antes de implementar:** a extensão `pg_cron` precisa estar habilitada no projeto Supabase (extensão gratuita, disponível em qualquer plano, mas requer ativação manual em Database → Extensions). Atenção também ao **auto-pause de projetos no plano Free** por inatividade — se o projeto pausar, os jobs de `pg_cron` (agendamento, lixeira, rate limit) param de rodar até alguém acessar o projeto novamente. Não bloqueia o MVP, mas deve ser considerado ao decidir o plano de produção.

---

## Estrutura de Navegação

```
Dashboard

Conteúdo
    Home
    Sobre
    Trajetória
    Projetos
    Comunidade
    Ideias
    Notícias
    Agenda

Sistema
    Mídias
    Caixa de Entrada
    Configurações (abas: Geral · Contato · Redes Sociais · SEO)

Perfil
Sair
```

Shell: sidebar fixa à esquerda + topbar (título da página + campo de busca do contexto atual) + área de conteúdo. Badge de não lidos na Caixa de Entrada. **Sem busca global estilo Spotlight/cmdk** (fora do MVP) — cada listagem tem seu próprio campo de busca (ver "Padrão Genérico").

---

## Dashboard

- Saudação personalizada + data/hora da última atualização.
- Cards de resumo: Total de Projetos, Notícias, Ideias, Eventos, Mensagens, Publicados no mês. **Sem métricas de visitas do site por padrão.**
- Atalhos rápidos: Novo Projeto, Nova Notícia, Nova Ideia, Novo Evento, Nova Etapa, Nova Galeria.
- Tabela de publicações recentes (título, módulo, status, data, ações).
- Lista de mensagens recentes com link para Caixa de Entrada completa.

---

## Padrão Genérico de Módulo de Conteúdo

Aplica-se a: Trajetória, Projetos, Comunidade (Álbuns), Ideias, Notícias, Agenda.

**Listagem (tabela):**
- Busca **funcional** por título (filtra as linhas em tempo real conforme digita, client-side sobre os dados carregados — não é decorativa), filtros por status (Todos/Publicado/Rascunho/Agendado/Arquivado), colunas específicas por módulo (categoria, ano, local etc.), paginação.
- Ações por linha: Editar, **Duplicar** (cria uma cópia em rascunho com "(cópia)" no título, pronta para editar), Excluir (confirmação inline "Excluir? Sim/Não" antes de mover para a lixeira).

**Editor (formulário), único componente reaproveitado em todos os módulos:**
- Stepper indicando progresso (ex.: Conteúdo → Mídia → SEO → Revisão).
- Campos padrão: título, slug editável (gerado automaticamente, sobrescrevível), categoria (quando aplicável — combobox "selecionar ou criar categoria", sem tela própria de gerenciamento; ver "Fora de escopo"), data de publicação/agendamento, resumo.
- Campo de mídia principal (capa) com drag-and-drop, abrindo a Biblioteca de Mídias para reutilizar arquivo existente.
- Editor de texto rico Tiptap para conteúdo longo.
- Bloco de SEO simplificado: meta título e meta descrição, com contador de caracteres (60/160). Sem palavras-chave, canonical ou Twitter Card por item — usa a capa do item como imagem OG.
- Autosave silencioso durante a edição (indicador "Salvo às HH:MM" na topbar do editor).
- Link para "Histórico de alterações" e "Pré-visualizar".
- Barra de ações: **Salvar rascunho · Despublicar · Arquivar · Publicar →**. Quando uma data futura é definida, o botão de publicar vira **Agendar**.

### Campos específicos por módulo

| Módulo | Campos além do padrão |
|---|---|
| Trajetória | Ano, Imagem, Vídeo, Documento (PDF), Ordem manual — `video_url`/`document_url` já previstos no schema do portal |
| Projetos | Galeria, PDF, Vídeo, Categoria, **Fase do projeto** (Proposto/Em andamento/Concluído) — campo `project_stage`, independente do `status` de publicação (ver "Fluxo de Publicação") |
| Comunidade (Álbuns) | Galeria de fotos, Vídeos, Categoria, Data |
| Ideias | Vídeo, PDF, Autor (`author`, texto livre — ex.: nome ou "Equipe de Comunicação") |
| Notícias | Galeria, Vídeo, PDF, Autor (`author`, mesmo padrão de Ideias), Compartilhamento social (**sem coluna no banco** — botões de compartilhar o link publicado via WhatsApp/Facebook/Twitter/copiar link, calculados a partir do slug; só aparecem quando o item está publicado) |
| Agenda | Data, Hora, Local, Mapa (`map_embed_url` por evento, distinto do mapa global de Configurações→Contato) |

O toggle "Mostrar página Agenda no portal (Sim/Não)" **não é campo de item** — é uma configuração de módulo inteiro, exibida como switch no topo da listagem de Agenda, mas persistida em `global_settings.agenda_page_enabled` (não em `events`, para não colidir com a visibilidade por evento, que já é resolvida pelo `status` de publicação de cada evento).

### Home e Sobre (páginas únicas, sem listagem)
- **Home:** lista das 8 seções canônicas — Hero, Sobre (resumo), Projetos em destaque, Comunidade (últimas fotos), Ideias em destaque, Notícias recentes, Agenda, Contato (ver spec do portal público, seção "Home", para a lista completa e definitiva) — com toggle de visibilidade e reordenação por drag-and-drop; edição do Hero (título, subtítulo, imagem, vídeo, texto, botões) em formulário dedicado.
- **Sobre:** formulário único (sem listagem): título, subtítulo, texto, imagem principal, galeria, vídeos, documentos.

---

## Fluxo de Publicação e Status

```
Criar → Salvar rascunho → Pré-visualizar → Editar → Publicar → Despublicar → Arquivar
```

Status possíveis: `rascunho`, `publicado`, `despublicado`, `arquivado`, `agendado`.
- `agendado`: registro tem `scheduled_at` no futuro; job `pg_cron` (a cada 5 min) muda para `publicado` automaticamente quando a data chega.
- Portal público só exibe conteúdo com `status = 'publicado'` e `deleted_at IS NULL`.

---

## Lixeira (Soft Delete)

Excluir um registro marca `deleted_at = now()` em vez de apagar. Cada módulo tem acesso a uma view de Lixeira com opção **Restaurar**. Um job `pg_cron` diário apaga definitivamente registros com `deleted_at` há mais de 30 dias. Aplica-se a todos os módulos de conteúdo e à Biblioteca de Mídias.

---

## Histórico de Alterações

Tabela genérica `revision_log` (não uma tabela por módulo): `id, table_name, record_id, changed_fields jsonb, changed_by, changed_at`. Alimentada por trigger Postgres em cada tabela de conteúdo. Exibida como lista simples (quem, quando, quais campos) no rodapé do editor. **v1 não inclui diff de conteúdo nem rollback** — apenas rastreabilidade.

---

## Biblioteca de Mídias

Central única de arquivos, separada por abas: Imagens, Vídeos, Documentos, PDFs.
- **Imagens/Documentos/PDFs:** upload real de arquivo (Supabase Storage).
- **Vídeos:** não é upload — é um catálogo de links externos (YouTube/Vimeo) reutilizáveis. "Adicionar vídeo" abre um formulário simples (URL + título), sem envio de arquivo, consistente com a decisão de vídeo-sempre-link do spec do portal.
- Upload por arrastar-e-soltar (múltiplos arquivos, exceto vídeos).
- Busca **funcional** por nome de arquivo (filtra em tempo real); estado vazio ("Nenhum arquivo encontrado para '...'") quando a busca não retorna resultados.
- Grade de cards com nome e tamanho do arquivo.
- **Modo de seleção:** ao abrir a biblioteca a partir de um campo de mídia em outro módulo, clicar num arquivo marca com ✓ e o reutiliza — **evita reenviar o mesmo arquivo**.
- Excluir aqui também usa o padrão de lixeira (30 dias).
- Sem tags/metadados avançados nem categorização de arquivos na v1 (ver "Fora de escopo").

Tabela: `media_library (id, url, storage_path, type enum('imagem','video','documento','pdf'), filename, size_bytes, mime_type, alt_text, uploaded_by, created_at, deleted_at)`. Para `type = 'video'`: `url` guarda o link externo, `storage_path`/`size_bytes`/`mime_type` ficam `null` (não há arquivo no Storage).

---

## Caixa de Entrada

Substitui e-mail como canal de gestão das mensagens do formulário de Contato do portal.

**Layout:** lista (esquerda) + detalhe (direita), como no protótipo.
- Lista: filtros (Todas/Não lidas/Arquivadas), busca por nome/e-mail/assunto, ordenação (mais recentes/antigas), paginação (20/página), destaque visual para mensagens novas.
- Detalhe: nome, e-mail, telefone, assunto, data/hora, corpo completo. Ações: Responder por e-mail (`mailto:`), **Conversar pelo WhatsApp** (`wa.me/<telefone>`, só aparece se telefone informado), Marcar como respondida, Arquivar, Excluir (com confirmação → lixeira).
- Status: `nova → lida → respondida → arquivada` (mudança automática de `nova` para `lida` ao abrir).
- Resumo no Dashboard: contador de não lidas + horário da última mensagem, com link direto.

**Formulário público (página Contato):** Nome, E-mail, Telefone (opcional), Assunto, Mensagem.

**Segurança:**
- Cloudflare Turnstile (verificado server-side na rota de envio).
- Honeypot (campo oculto; preenchido = descarta silenciosamente).
- Rate limiting: tabela `contact_rate_limit (ip, submitted_at)`, função Postgres bloqueia acima de 3 envios/hora por IP — sem depender de serviço externo (Redis), consistente com a decisão de manter tudo em Supabase. Job `pg_cron` diário apaga registros com mais de 24h (mesmo padrão de limpeza da Lixeira) — sem isso a tabela cresce indefinidamente.
- Validação e sanitização de todos os campos no servidor antes de gravar.

Tabela: `contact_messages (id, name, email, phone, subject, message text, status enum('nova','lida','respondida','arquivada'), created_at, updated_at, deleted_at)`.

---

## Configurações

Sem nav item próprio para SEO — vive como 4ª aba dentro de Configurações. Layout em abas (Geral · Contato · Redes Sociais · SEO):

- **Geral:** logo, favicon, nome do portal, descrição curta, rodapé (links institucionais — Política de Privacidade, Termos de Uso — com editor de texto simples).
- **Contato:** e-mail, telefone, endereço, mapa incorporado.
- **Redes Sociais:** Instagram, Facebook, WhatsApp.
- **SEO (global, simplificado):** Meta Title, Meta Description (com contador de caracteres, 160 máx.), Imagem Open Graph (1200×630px). **Sem** Analytics/Pixel/Search Console/robots/sitemap/SEO-por-página na v1 (removido do escopo — ver "Fora de escopo").

Conteúdo com registro próprio (Projetos/Notícias/Ideias/Álbuns) continua com seu próprio bloco de SEO (meta título, meta descrição, imagem OG) embutido no editor do item — ver seção "Padrão Genérico". Páginas sem CRUD (Home, Sobre, Agenda, Contato etc.) usam o SEO global das Configurações como fallback; não têm SEO individual na v1.

---

## Perfil

Nome, foto, e-mail, nova senha, idioma, tema do painel (claro/escuro). Sem gestão de múltiplos usuários — administrador único (Supabase Auth, e-mail/senha).

Tabela: `admin_profiles (id uuid references auth.users, name, photo_url, language, theme_preference, updated_at)`.

---

## Alterações no Banco (em relação ao spec do portal público)

Novas tabelas: `media_library`, `revision_log`, `admin_profiles`, `contact_rate_limit`.
Colunas adicionadas em todas as tabelas de conteúdo (`trajetoria_items`, `projects`, `comunidade`→`albuns`, `ideas`, `news`, `events`): `status` (enum de publicação), `scheduled_at`, `deleted_at`. **`published_at` é mantido** (não é substituído) — passa a ser preenchido/atualizado automaticamente quando `status` vira `publicado` (na hora, ou pelo job de agendamento), e continua servindo só para ordenação e exibição de data ("publicado há 2 dias"); quem controla visibilidade e ações é `status`. **`featured bool` permanece como coluna independente** (não é absorvido pelo `status`) — é o que alimenta "Projetos em destaque", "Ideias em destaque" e a notícia destacada na Home. Em `projects`, `project_stage` (fase de negócio: proposto/em_andamento/concluido) também é independente de `status`.
`events` ganha `map_embed_url`; perde `agenda_visible` (redundante com `status`). `ideas` e `news` ganham `author text`. `global_settings` ganha a chave `agenda_page_enabled`.
`contact_messages` ganha `subject`, `status` (enum ampliado), `updated_at`, `deleted_at`.

RLS: leitura pública restrita a `status = 'publicado' AND deleted_at IS NULL`; toda escrita (incluindo mudança de status e soft delete) exige `auth.role() = 'authenticated'`.

---

## Fora de escopo (v1)

- Múltiplos usuários/permissões (admin único).
- Diff visual e rollback no histórico de alterações (só log simples de rastreabilidade — não um viewer de logs do sistema).
- Notificações por e-mail/push de novas mensagens (contador no painel é suficiente).
- Editor de tema por seção (só paleta global — ver spec do portal público).
- Busca global estilo Spotlight/cmdk (cada listagem tem busca própria).
- Reordenação de menu/navegação por drag-and-drop (estrutura de sidebar é fixa).
- Tela dedicada de gerenciamento de categorias (categoria é combobox "selecionar ou criar" dentro do editor de cada item, sem CRUD/nav item próprio).
- Configurações avançadas por módulo (ex.: templates por tipo de conteúdo).
- Preview de compartilhamento em redes sociais (card de preview do link do Facebook/WhatsApp/Twitter).
- SEO avançado: palavras-chave, canonical URL, Twitter Card, Google Analytics, Meta Pixel, Search Console, toggle de robots/sitemap, SEO individual por página estática. SEO fica só com Meta Title + Meta Description + imagem OG (global em Configurações, e por item nos módulos com CRUD próprio).
- Biblioteca de mídias com tags/metadados avançados (só nome, tamanho e tipo).
