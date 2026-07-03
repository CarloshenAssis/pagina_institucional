import sanitizeHtml from "sanitize-html";

// Renderiza o HTML produzido pelo Tiptap no admin. O conteúdo vem do banco
// (autor confiável), mas sanitizamos mesmo assim — defesa em profundidade.
// sanitize-html (sem DOM/jsdom) no lugar de isomorphic-dompurify: jsdom
// quebrava o bundle serverless da Vercel (500 em produção, funcionava local).
const ALLOWED_TAGS = [
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
];

export function RichText({ html, className = "" }: { html: string; className?: string }) {
  const clean = sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
  return (
    <div
      className={`prose-portal flex flex-col gap-4 [&_a]:underline [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-secondary [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:font-display [&_h2]:text-2xl [&_h3]:font-display [&_h3]:text-xl [&_hr]:border-primary/20 [&_img]:max-w-full [&_li]:ml-5 [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_ul]:list-disc ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
