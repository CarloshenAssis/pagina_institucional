# Guia de Conteúdo — Portal Tia Lu

**Documento de referência.** Serve pra qualquer conversa (com Claude ou outra IA) saber exatamente quais campos existem no painel, o que colocar em cada um, e como pensar o SEO — sem precisar reler o código do sistema toda vez. Cole este arquivo inteiro no início de uma conversa nova junto com o pedido (ex.: "usando o guia abaixo, escreva uma notícia sobre X") pra receber o conteúdo já no formato certo pra copiar e colar no admin.

---

## 1. Regras gerais (valem pra tudo)

- **Tom:** neutro, sem atacar ninguém, sem citar nomes de terceiros de forma negativa, sem pedir voto de forma explícita (período de pré-campanha tem restrição legal pra isso). Sabedoria simples, linguagem clara, frases curtas.
- **Texto corrido (campos "Conteúdo"/"Descrição"/"Texto"):** escrever em parágrafos curtos (3-6 linhas cada), separados por linha em branco. O editor do admin é de texto rico — ao colar, cada parágrafo separado por linha em branco vira um parágrafo de verdade na página pública.
- **Resumo (excerpt):** até 300 caracteres — é o texto que aparece nos cards de listagem. Curto, direto, dá vontade de clicar.
- **Categoria:** existe em Notícias, Projetos, Ideias e Comunidade (não existe em Trajetória e Agenda). Não vem nenhuma pronta — você digita o nome e cria na hora, no próprio formulário. Reaproveite as mesmas categorias entre publicações (ex.: sempre "Cidadania e Sociedade", não uma categoria nova por post).
- **Status de publicação:** todo item nasce como rascunho. Só aparece no site público depois de clicar em **Publicar**. Dá pra Despublicar (tira do ar sem apagar), Arquivar, ou Agendar (escolhe data/hora futura).
- **Autor:** só existe em Notícias e Ideias. Pode deixar "Redação" ou o nome dela (Luciana Casimiro / Tia Lu), dependendo se é uma fala pessoal ou uma nota mais jornalística.

---

## 2. SEO — o que é e como pensar

SEO é o que faz o Google entender do que a página trata, e o que aparece quando alguém compartilha o link no WhatsApp/redes sociais.

**Como funciona neste sistema (importante entender a hierarquia):**
- Cada item (notícia, projeto, ideia, comunidade) tem um campo opcional de SEO próprio (**Meta Title** e **Meta Description**).
- Se você **não preencher**, o sistema usa automaticamente o **Título** do item como Meta Title, e o **Resumo (excerpt)** como Meta Description. Ou seja: **preencher SEO por item é opcional** — só vale a pena quando o título "de leitura" é diferente do título "ideal pro Google" (raramente precisa).
- A **imagem de compartilhamento (Open Graph)** de cada item **reaproveita a capa automaticamente** — não existe um campo de imagem OG separado por item.
- Existe também um SEO **padrão do site inteiro**, em Configurações → aba SEO — esse é o que vale pra Home, Sobre, Contato e as páginas de listagem (que não tem SEO próprio por item).

**Meta Description — regra de ouro:** até 160 caracteres, resumindo do que trata a página, sem enrolação, incluindo se possível uma palavra-chave natural (ex.: nome da cidade, tema).

---

## 3. Notícias (`/admin/noticias`)

| Campo | O que é | Como preencher |
|---|---|---|
| Título | Manchete da notícia | Direto, claro, sem clickbait |
| Slug | URL da página (ex.: `/noticias/meu-titulo`) | Deixe em branco — gera sozinho a partir do título |
| Categoria | Agrupamento temático | Reaproveitar categorias existentes |
| Autor | Quem assina | "Redação" (tom jornalístico) ou nome próprio (tom pessoal) |
| Resumo | Chamada nos cards | Até 300 caracteres |
| Conteúdo | Corpo da notícia | Texto rico, parágrafos curtos |
| Capa | Imagem principal | **1200×800px (proporção 3:2)** |
| Galeria | Fotos extras | **1200×900px (proporção 4:3)**, quantas quiser |
| Vídeo | Link ou upload | Opcional |
| PDF | Documento anexo | Opcional |
| Destaque na Home | Aparece na seção "Últimas notícias" da Home mesmo sem ser a mais recente | Marcar só o que for realmente importante |
| SEO (Meta Title/Description) | Ver seção 2 | Opcional |

**Modelo pronto pra copiar:**
```
TÍTULO:
[manchete]

RESUMO:
[até 300 caracteres]

AUTOR:
[Redação / nome]

CONTEÚDO:
[parágrafo 1]

[parágrafo 2]

[parágrafo 3]
```

---

## 4. Projetos (`/admin/projetos`)

| Campo | O que é | Como preencher |
|---|---|---|
| Título | Nome do projeto/proposta | Claro e específico (ex.: "Reforma da Praça Central") |
| Categoria | Agrupamento | Reaproveitar |
| Etapa | Status do projeto | Proposto / Em andamento / Concluído |
| Resumo | Chamada nos cards | Até 300 caracteres |
| Descrição | Detalhamento completo | Texto rico — o quê, por quê, pra quem |
| Capa | Imagem principal | **1200×800px (3:2)** |
| Galeria | Fotos do projeto/obra | **1200×900px (4:3)** |
| PDF | Documento técnico, se houver | Opcional |
| Vídeo | Link ou upload | Opcional |
| Destaque na Home | — | Marcar os projetos-bandeira |

**Modelo pronto pra copiar:**
```
TÍTULO:
[nome do projeto]

ETAPA:
[Proposto / Em andamento / Concluído]

RESUMO:
[até 300 caracteres]

DESCRIÇÃO:
[parágrafo explicando o problema que resolve]

[parágrafo explicando a proposta/ação]

[parágrafo explicando o benefício pra comunidade]
```

---

## 5. Ideias (`/admin/ideias`)

Espaço de reflexão/opinião — textos mais pessoais e diretos, tipo crônica curta.

| Campo | O que é | Como preencher |
|---|---|---|
| Título | Frase de efeito ou pergunta | Curto, que já entrega a ideia central |
| Categoria | Agrupamento | Ex.: "Cidadania e Sociedade", "Reflexões" |
| Autor | Quem assina | Geralmente nome próprio (é opinião pessoal) |
| Resumo | Chamada | Até 300 caracteres |
| Conteúdo | O texto da reflexão | 3-4 parágrafos curtos, tom de sabedoria simples |
| Capa | Imagem | **1200×800px (3:2)** |
| Vídeo/PDF | Opcional | — |

**Modelo pronto pra copiar:**
```
TÍTULO:
[frase de efeito]

RESUMO:
[1-2 frases resumindo a reflexão]

CONTEÚDO:
[parágrafo de abertura — o problema/situação comum]

[parágrafo de desenvolvimento — a reflexão]

[parágrafo de fechamento — o aprendizado/convite à reflexão]
```

---

## 6. Comunidade (`/admin/comunidade`)

Álbuns de eventos/atividades com a comunidade (fotos e vídeos de ações, encontros, mutirões etc.).

| Campo | O que é | Como preencher |
|---|---|---|
| Título | Nome do evento/ação | Ex.: "Mutirão de Natal 2026" |
| Categoria | Agrupamento | Reaproveitar |
| Data | Quando aconteceu | — |
| Descrição | Relato do que foi a ação | Texto rico, 2-3 parágrafos |
| Capa | Imagem principal do álbum | **1200×800px (3:2)** |
| Galeria de fotos | Fotos do evento | **1200×900px (4:3)** |
| Vídeos | Links ou uploads | Vários, se quiser |

---

## 7. Trajetória (`/admin/trajetoria`)

Linha do tempo da biografia — **não tem categoria nem título/resumo separados**, é sempre um "marco" com ano.

| Campo | O que é | Como preencher |
|---|---|---|
| Ano | Ano do marco | Número |
| Título | Nome do marco | Curto (ex.: "Início do ministério infantil") |
| Descrição | O que aconteceu | 1 parágrafo, direto |
| Imagem | Foto do momento | **1200×800px (3:2)** |
| Vídeo/Documento | Opcional | — |
| Ordem | Posição na timeline | Ajustável pelos botões ↑/↓ na lista |

---

## 8. Agenda (`/admin/agenda`)

Eventos futuros/compromissos públicos.

| Campo | O que é | Como preencher |
|---|---|---|
| Título | Nome do evento | Direto |
| Descrição | Detalhes | Curto |
| Data | Data e hora | Obrigatório |
| Local | Endereço/nome do local | — |
| Link externo | Inscrição, transmissão etc. | Opcional |
| Mapa | URL de embed do Google Maps | Opcional |
| Imagem | Banner do evento | **1200×800px (3:2)** |

> A página `/agenda` inteira pode ser desativada em Configurações → Geral se um dia não fizer sentido mostrá-la.

---

## 9. Sobre (`/admin/sobre`) — página única

| Campo | O que é | Como preencher |
|---|---|---|
| Título | Nome de exibição | Ex.: "Tia Lu" |
| Subtítulo | Uma linha de identidade | Ex.: "Pregadora infantil, pedagoga..." |
| Texto | Biografia completa | Texto rico, vários parágrafos |
| Missão | Propósito, em poucas frases | 1 parágrafo curto |
| Visão | Onde quer chegar | 1 parágrafo curto |
| Valores | Lista de palavras/frases curtas | Adicionar um de cada vez (ex.: "Fé", "Educação") |
| Imagem principal | Retrato | **1000×1250px (retrato, proporção 4:5)** |
| Galeria | Fotos extras | **1200×900px (4:3)** |
| Vídeo | Vídeo de apresentação | Opcional |
| PDFs | Documentos (currículo, propostas) | Opcional |

---

## 10. Home (`/admin/home`)

**Hero (banner principal):**

| Campo | Como preencher |
|---|---|
| Foto do hero | **1000×1250px (retrato 4:5)** |
| Título | Frase de impacto |
| Subtítulo | Complemento |
| Slogan | Frase curta de marca (ex.: "Cuidar de pessoas, transformar vidas!") |
| Botão 1 (texto + URL) | Ex.: "Conheça a trajetória" → `/trajetoria` |
| Botão 2 (texto + URL) | Ex.: "Fale comigo" → `/contato` |

**Seções da Home:** dá pra **ativar/ocultar** e **reordenar** cada seção (Sobre, Projetos, Comunidade, Ideias, Notícias, Agenda, Contato) direto na lista — sem precisar de código. Últimas notícias/projetos/etc. aparecem sozinhos ali, puxando o que estiver publicado.

---

## 11. Configurações (`/admin/configuracoes`)

**Aba Geral:**
| Campo | Como preencher |
|---|---|
| Nome do portal | Ex.: "Tia Lu" |
| Descrição curta | 1-2 frases sobre quem ela é (usada como SEO padrão também) |
| Logo | **400×120px, PNG transparente** |
| Favicon | **512×512px, quadrada** |
| Textos de Privacidade/Termos | Se for usar, texto jurídico simples |

**Aba Aparência:** 6 cores da marca (primária, secundária, destaque, fundo, texto principal, texto secundário) — muda o site inteiro na hora, sem mexer em código.

**Aba Contato:** e-mail, telefone, endereço, link do mapa — aparecem na página `/contato` e no rodapé.

**Aba Redes Sociais:** Instagram, Facebook, WhatsApp.

**Aba SEO:** Meta Title, Meta Description (até 160 caracteres) e imagem Open Graph (**1200×630px**) padrão do site — usado nas páginas que não têm SEO próprio (Home, Sobre, Contato, listagens).

---

## 12. Perfil (`/admin/perfil`)

Foto (**400×400px, quadrada**), nome de exibição no painel, idioma, tema claro/escuro do painel (não afeta o site público), e troca de senha.

---

## Tabela rápida — tamanho de imagem por campo

| Uso | Tamanho ideal | Proporção |
|---|---|---|
| Logo | 400×120px | livre (larga) |
| Favicon | 512×512px | quadrada |
| Imagem Open Graph (SEO) | 1200×630px | ~1.9:1 |
| Retrato (Sobre / Hero da Home) | 1000×1250px | 4:5 |
| Capa (Notícias/Projetos/Ideias/Comunidade/Trajetória/Agenda) | 1200×800px | 3:2 |
| Galeria (qualquer módulo) | 1200×900px | 4:3 |
| Foto de perfil (admin) | 400×400px | quadrada |
