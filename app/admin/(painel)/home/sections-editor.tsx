"use client";

import { useState } from "react";
import { reorderSections, toggleSection } from "@/lib/content/home-sections";
import { saveHomeSections } from "./actions";

export function HomeSectionsEditor({
  order: initialOrder,
  visible: initialVisible,
  sections,
}: {
  order: string[];
  visible: Record<string, boolean>;
  sections: readonly { key: string; name: string }[];
}) {
  const [order, setOrder] = useState(initialOrder);
  const [visible, setVisible] = useState(initialVisible);
  const byKey = Object.fromEntries(sections.map((s) => [s.key, s.name]));

  return (
    <div className="bg-card border">
      {order.map((key, index) => (
        <div key={key} className="grid grid-cols-[40px_2fr_1fr_1fr] px-6 py-4 border-t items-center">
          <span className="text-sm text-muted-foreground font-bold">{index + 1}</span>
          <span className="font-semibold">{byKey[key]}</span>
          <span>{visible[key] ? "Visível" : "Oculta"}</span>
          <div className="flex gap-2.5">
            <button
              type="button"
              className="text-xs font-bold underline"
              onClick={async () => {
                const next = toggleSection(visible, key);
                setVisible(next);
                await saveHomeSections(order, next);
              }}
            >
              {visible[key] ? "Ocultar" : "Ativar"}
            </button>
            {index > 0 && (
              <button
                type="button"
                className="text-xs font-bold underline"
                onClick={async () => {
                  const next = reorderSections(order, key, index - 1);
                  setOrder(next);
                  await saveHomeSections(next, visible);
                }}
              >
                Mover ↑
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
