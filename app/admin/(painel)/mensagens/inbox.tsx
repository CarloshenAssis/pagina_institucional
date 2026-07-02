"use client";

import { useEffect, useRef, useState } from "react";
import { listMessages, markMessageStatus, softDeleteMessage } from "./actions";
import { buildWhatsAppLink } from "./whatsapp";

type Filter = "todas" | "nao_lidas" | "arquivadas";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "nova" | "lida" | "respondida" | "arquivada";
  created_at: string;
}

export function Inbox() {
  const [filter, setFilter] = useState<Filter>("todas");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  // Exibir a mensagem no detalhe conta como leitura — inclusive a
  // auto-selecionada ao carregar a lista, não só a clicada.
  function markReadLocally(id: string, list: Message[]): Message[] {
    const msg = list.find((r) => r.id === id);
    if (msg?.status !== "nova") return list;
    void markMessageStatus(id, "lida");
    return list.map((r) => (r.id === id ? { ...r, status: "lida" as const } : r));
  }

  useEffect(() => {
    listMessages(filter, 1, search).then(({ rows }) => {
      const id = selectedIdRef.current ?? rows[0]?.id ?? null;
      selectedIdRef.current = id;
      setSelectedId(id);
      setRows(id ? markReadLocally(id, rows) : rows);
    });
  }, [filter, search]);

  const selected = rows.find((r) => r.id === selectedId);

  function select(id: string) {
    selectedIdRef.current = id;
    setSelectedId(id);
    setRows(markReadLocally(id, rows));
  }

  return (
    <div className="flex-1 grid grid-cols-[380px_1fr]">
      <div className="border-r overflow-y-auto">
        <div className="flex gap-3 p-4 border-b text-sm">
          {(["todas", "nao_lidas", "arquivadas"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={filter === f ? "font-bold underline" : ""}>
              {f === "todas" ? "Todas" : f === "nao_lidas" ? "Não lidas" : "Arquivadas"}
            </button>
          ))}
        </div>
        <input
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-b p-3 w-full text-sm"
        />
        {rows.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">Nenhuma mensagem.</p>
        )}
        {rows.map((m) => (
          <button
            key={m.id}
            onClick={() => select(m.id)}
            className={`block w-full text-left p-5 border-b ${m.id === selectedId ? "bg-background" : ""}`}
          >
            <div className="flex justify-between text-sm font-bold">
              <span>
                {m.status === "nova" && <span className="inline-block w-2 h-2 rounded-full bg-rose mr-2" aria-label="não lida" />}
                {m.name}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {new Date(m.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="text-sm">{m.subject}</div>
          </button>
        ))}
      </div>
      <div className="p-10">
        {selected && (
          <>
            <h3 className="font-display text-xl mb-1">{selected.subject}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selected.name} · {selected.email}
              {selected.phone ? ` · ${selected.phone}` : ""}
            </p>
            <p className="mb-6 whitespace-pre-wrap">{selected.message}</p>
            <div className="flex gap-3 flex-wrap">
              <a href={`mailto:${selected.email}`} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold">
                Responder por e-mail
              </a>
              {buildWhatsAppLink(selected.phone) && (
                <a
                  href={buildWhatsAppLink(selected.phone)!}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-green-600 text-white text-sm font-bold"
                >
                  Conversar pelo WhatsApp
                </a>
              )}
              <button
                onClick={async () => {
                  await markMessageStatus(selected.id, "respondida");
                  setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, status: "respondida" } : r)));
                }}
                className="px-5 py-2.5 border text-sm font-bold"
              >
                Marcar como respondida
              </button>
              <button
                onClick={async () => {
                  await markMessageStatus(selected.id, "arquivada");
                  setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, status: "arquivada" } : r)));
                }}
                className="px-5 py-2.5 border text-sm font-bold"
              >
                Arquivar
              </button>
              <button
                onClick={async () => {
                  await softDeleteMessage(selected.id);
                  setRows((prev) => prev.filter((r) => r.id !== selected.id));
                  selectedIdRef.current = null;
                  setSelectedId(null);
                }}
                className="px-5 py-2.5 border text-sm font-bold"
              >
                Excluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
