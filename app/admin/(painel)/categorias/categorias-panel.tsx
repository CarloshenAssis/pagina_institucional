"use client";

import { useState } from "react";
import { updateCategory, deleteCategory, createCategory } from "@/app/admin/category-actions";
import type { CategoryModule } from "@/lib/validations/category";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Category = { id: string; module: CategoryModule; name: string; slug: string };

const MODULE_LABELS: Record<CategoryModule, string> = {
  projetos: "Projetos",
  ideias: "Ideias",
  noticias: "Notícias",
  comunidade: "Comunidade",
};

function ModulePanel({
  module,
  categories,
  onChange,
}: {
  module: CategoryModule;
  categories: Category[];
  onChange: (categories: Category[]) => void;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim()) return;
    const created = await createCategory(module, newName.trim());
    onChange([...categories, created].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName("");
  }

  async function handleSaveEdit(id: string) {
    if (!editingName.trim()) return;
    const updated = await updateCategory(id, editingName.trim());
    onChange(categories.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name)));
    setEditingId(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Excluir a categoria "${name}"? Essa ação não pode ser desfeita.`)) return;
    const result = await deleteCategory(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    onChange(categories.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-4 max-w-xl pt-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
      )}
      <ul className="flex flex-col gap-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-2 border p-2.5 bg-card">
            {editingId === c.id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button size="sm" onClick={() => handleSaveEdit(c.id)}>
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{c.name}</span>
                <button
                  type="button"
                  className="text-xs font-bold underline"
                  onClick={() => {
                    setEditingId(c.id);
                    setEditingName(c.name);
                    setError(null);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="text-xs font-bold underline text-destructive"
                  onClick={() => handleDelete(c.id, c.name)}
                >
                  Excluir
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          placeholder="Nova categoria"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button onClick={handleCreate}>Criar</Button>
      </div>
    </div>
  );
}

export function CategoriasPanel({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const modules = Object.keys(MODULE_LABELS) as CategoryModule[];

  return (
    <Tabs defaultValue={modules[0]}>
      <TabsList>
        {modules.map((m) => (
          <TabsTrigger key={m} value={m}>
            {MODULE_LABELS[m]}
          </TabsTrigger>
        ))}
      </TabsList>
      {modules.map((m) => (
        <TabsContent key={m} value={m}>
          <ModulePanel
            module={m}
            categories={categories.filter((c) => c.module === m)}
            onChange={(updated) =>
              setCategories((prev) => [...prev.filter((c) => c.module !== m), ...updated])
            }
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
