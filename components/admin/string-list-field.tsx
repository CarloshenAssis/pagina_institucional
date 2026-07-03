"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Campo de lista de textos curtos (ex.: Valores institucionais): digita e
// adiciona um item por vez, cada um removível. Sem picker — é texto livre.
export function StringListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {values.length > 0 && (
        <ul className="flex flex-col gap-1">
          {values.map((v, i) => (
            <li key={`${v}-${i}`} className="flex items-center gap-2 text-sm">
              <span className="flex-1">{v}</span>
              <button
                type="button"
                className="text-xs font-bold underline text-muted-foreground shrink-0"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add}>
          + Adicionar
        </Button>
      </div>
    </div>
  );
}
