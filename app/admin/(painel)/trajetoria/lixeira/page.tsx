import { listTrajetoria, restoreTrajetoria } from "../actions";
import { TrashView } from "@/components/admin/trash-view";
import { Topbar } from "@/components/admin/topbar";

export default async function TrajetoriaLixeiraPage() {
  const rows = await listTrajetoria(true);
  return (
    <>
      <Topbar title="Lixeira — Trajetória" />
      <div className="p-9">
        <TrashView rows={rows} titleKey="title" onRestore={restoreTrajetoria} />
      </div>
    </>
  );
}
