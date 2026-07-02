import { listAlbuns, restoreAlbum } from "../actions";
import { TrashView } from "@/components/admin/trash-view";
import { Topbar } from "@/components/admin/topbar";

export default async function ComunidadeLixeiraPage() {
  const rows = await listAlbuns(true);
  return (
    <>
      <Topbar title="Lixeira — Comunidade" />
      <div className="p-9">
        <TrashView rows={rows} titleKey="title" onRestore={restoreAlbum} />
      </div>
    </>
  );
}
