"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { listMedia, softDeleteMedia, addVideoLink, uploadMedia } from "./actions";
import { filterMedia, type MediaItem } from "@/lib/content/media-actions";
import { MAX_BYTES } from "./upload-config";

const TABS = [
  { value: "imagem", label: "Imagens" },
  { value: "video", label: "Vídeos" },
  { value: "documento", label: "Documentos" },
  { value: "pdf", label: "PDFs" },
] as const;

type Item = MediaItem & { url: string; size_bytes: number | null; storage_path: string | null };

export function MediaGallery() {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("imagem");
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listMedia(tab).then(setItems);
  }, [tab]);

  const filtered = filterMedia(items, query);
  const maxMb = Math.round(MAX_BYTES[tab] / 1024 / 1024);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("type", tab);
    const result = await uploadMedia(formData);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setItems(await listMedia(tab));
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <TabsList className="max-w-full overflow-x-auto">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="my-6 border-2 border-dashed p-8 text-center flex flex-col gap-4 items-center">
        {tab === "video" && (
          <form
            action={async (formData) => {
              setError(null);
              await addVideoLink(String(formData.get("url")), String(formData.get("title")));
              setItems(await listMedia("video"));
            }}
            className="flex gap-3 justify-center flex-wrap"
          >
            <Input name="title" placeholder="Título do vídeo" className="max-w-xs" required />
            <Input name="url" placeholder="URL do YouTube/Vimeo" className="max-w-xs" required />
            <button type="submit" className="text-sm font-bold underline">
              Adicionar por link
            </button>
          </form>
        )}
        <div className="flex flex-col gap-2 items-center">
          <input
            ref={fileRef}
            type="file"
            accept={tab === "imagem" ? "image/*" : tab === "video" ? "video/*" : tab === "pdf" ? ".pdf" : undefined}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <p className="text-xs text-muted-foreground">
            {tab === "video"
              ? `Vídeos curtos podem ser enviados direto (máx. ${maxMb}MB); para vídeos longos, prefira o link.`
              : `Selecione o arquivo (máx. ${maxMb}MB).`}
          </p>
          {uploading && <p className="text-xs">Enviando...</p>}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="my-4">
        <Input
          placeholder="Buscar arquivo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <TabsContent value={tab}>
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhum arquivo encontrado para &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="bg-card border">
                <div className="h-28 bg-background overflow-hidden flex items-center justify-center">
                  {item.type === "imagem" ? (
                    <Image src={item.url} alt={item.filename} width={200} height={112} className="object-cover w-full h-full" unoptimized />
                  ) : item.type === "video" && item.storage_path ? (
                    <video src={item.url} className="object-cover w-full h-full" muted />
                  ) : (
                    <span className="text-2xl">{item.type === "video" ? "▶" : "📄"}</span>
                  )}
                </div>
                <div className="p-2.5">
                  <div className="text-xs font-semibold truncate">{item.filename}</div>
                  {item.type === "video" && (
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {item.storage_path ? "arquivo" : "link externo"}
                    </span>
                  )}
                  <button
                    type="button"
                    className="text-[11px] text-red-700 underline block"
                    onClick={async () => {
                      await softDeleteMedia(item.id);
                      setItems(await listMedia(tab));
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
