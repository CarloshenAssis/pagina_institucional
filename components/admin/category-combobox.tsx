"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { listCategories, createCategory } from "@/app/admin/category-actions";
import type { CategoryModule } from "@/lib/validations/category";

export function CategoryCombobox({
  module,
  value,
  onChange,
}: {
  module: CategoryModule;
  value: string | null;
  onChange: (categoryId: string) => void;
}) {
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    listCategories(module).then(setOptions);
  }, [module]);

  return (
    <div className="flex flex-col gap-2">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2.5 text-sm bg-card"
      >
        <option value="">Selecionar categoria...</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Input placeholder="Criar nova categoria" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button
          type="button"
          className="text-xs font-bold underline shrink-0"
          onClick={async () => {
            if (!newName.trim()) return;
            const created = await createCategory(module, newName.trim());
            setOptions((prev) => [...prev, created]);
            onChange(created.id);
            setNewName("");
          }}
        >
          Criar
        </button>
      </div>
    </div>
  );
}
