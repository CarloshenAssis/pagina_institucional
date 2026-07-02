import { listIdeias, restoreIdeia } from "../actions";
import { TrashView } from "@/components/admin/trash-view";
import { Topbar } from "@/components/admin/topbar";

export default async function IdeiasLixeiraPage() {
  const rows = await listIdeias(true);
  return (
    <>
      <Topbar title="Lixeira — Ideias" />
      <div className="p-9">
        <TrashView rows={rows} titleKey="title" onRestore={restoreIdeia} />
      </div>
    </>
  );
}
