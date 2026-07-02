"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { setAgendaPageEnabled } from "./actions";

// O plano previa Switch dentro de <form action=...>, mas o Switch não
// dispara submit ao alternar — aqui a action é chamada direto no onChange.
export function AgendaPageToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={enabled}
        onCheckedChange={async (checked) => {
          setEnabled(checked);
          await setAgendaPageEnabled(checked);
        }}
      />
      <span className="text-sm font-semibold">Mostrar página Agenda no portal</span>
    </div>
  );
}
