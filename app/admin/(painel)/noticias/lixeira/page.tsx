import { listNoticias, restoreNoticia } from "../actions";
import { TrashView } from "@/components/admin/trash-view";
import { Topbar } from "@/components/admin/topbar";

export default async function NoticiasLixeiraPage() {
  const rows = await listNoticias(true);
  return (
    <>
      <Topbar title="Lixeira — Notícias" />
      <div className="p-9">
        <TrashView rows={rows} titleKey="title" onRestore={restoreNoticia} />
      </div>
    </>
  );
}
