import { listProjetos, restoreProjeto } from "../actions";
import { TrashView } from "@/components/admin/trash-view";
import { Topbar } from "@/components/admin/topbar";

export default async function ProjetosLixeiraPage() {
  const rows = await listProjetos(true);
  return (
    <>
      <Topbar title="Lixeira — Projetos" />
      <div className="p-9">
        <TrashView rows={rows} titleKey="title" onRestore={restoreProjeto} />
      </div>
    </>
  );
}
