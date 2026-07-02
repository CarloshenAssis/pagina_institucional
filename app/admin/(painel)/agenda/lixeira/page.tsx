import { listEventos, restoreEvento } from "../actions";
import { TrashView } from "@/components/admin/trash-view";
import { Topbar } from "@/components/admin/topbar";

export default async function AgendaLixeiraPage() {
  const rows = await listEventos(true);
  return (
    <>
      <Topbar title="Lixeira — Agenda" />
      <div className="p-9">
        <TrashView rows={rows} titleKey="title" onRestore={restoreEvento} />
      </div>
    </>
  );
}
