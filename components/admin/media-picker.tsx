"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { filterMedia, type MediaItem } from "@/lib/content/media-actions";

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

  useEffect(() => {
    if (!open) return;
    createClient()
      .from("media_library")
      .select("id, filename, type, url")
      .eq("type", type)
      .is("deleted_at", null)
      .then(({ data }) => setItems(data ?? []));
  }, [open, type]);

  const filtered = filterMedia(items, query);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-3xl">
        <Input placeholder="Buscar arquivo..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhum arquivo encontrado para &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-4 max-h-96 overflow-y-auto">
            {filtered.map((item) => (
              <button
                key={item.id}
                className="border text-left"
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <div className="h-28 bg-background" />
                <div className="p-2.5 text-xs font-semibold truncate">{item.filename}</div>
              </button>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          nativeButton={false}
          render={<a href="/admin/midias" target="_blank" rel="noreferrer" />}
        >
          Enviar novo arquivo na Biblioteca de Mídias →
        </Button>
      </DialogContent>
    </Dialog>
  );
}
