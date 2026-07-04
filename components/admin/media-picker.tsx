"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { filterMedia, type MediaItem } from "@/lib/content/media-actions";
import { uploadMedia } from "@/app/admin/(painel)/midias/actions";
import { MAX_BYTES } from "@/app/admin/(painel)/midias/upload-config";

const ACCEPT: Partial<Record<MediaItem["type"], string>> = {
  imagem: "image/*",
  video: "video/*",
  pdf: ".pdf",
};

export function MediaPicker({
  type,
  onSelect,
  trigger,
}: {
  type: MediaItem["type"];
  onSelect: (item: MediaItem & { url: string }) => void;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<(MediaItem & { url: string })[]>([]);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reload() {
    createClient()
      .from("media_library")
      .select("id, filename, type, url")
      .eq("type", type)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }

  useEffect(() => {
    if (open) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]);

  const filtered = filterMedia(items, query);
  const maxMb = Math.round(MAX_BYTES[type] / 1024 / 1024);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("type", type);
    const result = await uploadMedia(formData);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (result.error) {
      setError(result.error);
      return;
    }
    reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl">
        <div className="border-2 border-dashed p-5 flex flex-col gap-2 items-center text-center">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT[type]}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <p className="text-xs text-muted-foreground">Selecione o arquivo (máx. {maxMb}MB).</p>
          {uploading && <p className="text-xs">Enviando...</p>}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        <Input placeholder="Buscar arquivo..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhum arquivo encontrado para &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className="border text-left hover:ring-2 hover:ring-ring rounded overflow-hidden"
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                {/* aspect fixo + object-contain: a imagem inteira aparece,
                    sem distorcer nem cortar (evita miniatura "quebrada"). */}
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {item.type === "imagem" ? (
                    <Image
                      src={item.url}
                      alt={item.filename}
                      width={200}
                      height={200}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <span className="text-2xl">{item.type === "video" ? "▶" : "📄"}</span>
                  )}
                </div>
                <div className="p-2 text-xs font-semibold truncate">{item.filename}</div>
              </button>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          nativeButton={false}
          render={<a href="/admin/midias" target="_blank" rel="noreferrer" />}
        >
          Gerenciar toda a Biblioteca de Mídias →
        </Button>
      </DialogContent>
    </Dialog>
  );
}
