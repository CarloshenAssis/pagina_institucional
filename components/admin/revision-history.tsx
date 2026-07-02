"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRevisionSummary, type RevisionEntry } from "@/lib/content/revision-log";

export function RevisionHistory({ table, recordId }: { table: string; recordId: string }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<RevisionEntry[]>([]);

  async function load() {
    const { data } = await createClient()
      .from("revision_log")
      .select("changed_fields, changed_at")
      .eq("table_name", table)
      .eq("record_id", recordId)
      .order("changed_at", { ascending: false });
    setEntries(data ?? []);
    setOpen(true);
  }

  if (!open) {
    return (
      <button type="button" className="text-xs font-bold underline text-muted-foreground self-start" onClick={load}>
        Histórico de alterações
      </button>
    );
  }

  return (
    <div className="text-xs text-muted-foreground flex flex-col gap-1">
      <button type="button" className="font-bold underline self-start" onClick={() => setOpen(false)}>
        Ocultar histórico
      </button>
      {entries.length === 0 ? (
        <span>Nenhuma alteração registrada ainda.</span>
      ) : (
        entries.map((e, i) => <span key={i}>{formatRevisionSummary(e)}</span>)
      )}
    </div>
  );
}
