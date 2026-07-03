"use client";

import { useEditor, EditorContent } from "@tiptap/react";
// StarterKit do Tiptap v3 já inclui Link — não importar separado.
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      Image,
      Table,
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: "Escreva o texto completo aqui..." }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { role: "textbox", "aria-multiline": "true" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const btn = (label: string, title: string, action: () => void, active = false) => (
    <button
      type="button"
      title={title}
      onClick={action}
      className={`w-8 h-8 text-sm ${active ? "bg-primary text-primary-foreground" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="border">
      <div className="flex gap-0.5 flex-wrap p-2.5 border-b bg-background">
        {btn("B", "Negrito", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {btn("I", "Itálico", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {btn("🔗", "Link", () => {
          const url = window.prompt("URL do link:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        })}
        {btn("≡", "Lista", () => editor.chain().focus().toggleBulletList().run())}
        {btn("▦", "Tabela", () => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run())}
        {btn("🖼", "Imagem", () => {
          const url = window.prompt("URL da imagem:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        })}
        {btn('"', "Citação", () => editor.chain().focus().toggleBlockquote().run())}
        {btn("—", "Separador", () => editor.chain().focus().setHorizontalRule().run())}
      </div>
      <EditorContent editor={editor} className="min-h-[160px] p-4" />
    </div>
  );
}
