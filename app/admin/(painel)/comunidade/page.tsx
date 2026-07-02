import Link from "next/link";
import { listAlbuns, softDeleteAlbum, duplicateAlbum } from "./actions";
import { ModuleList } from "@/components/admin/module-list";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";

export default async function ComunidadePage() {
  const rows = await listAlbuns();
  return (
    <>
      <Topbar title="Comunidade" />
      <div className="p-9 flex flex-col gap-4">
        <div className="flex justify-between">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/comunidade/lixeira" />}>
            Lixeira
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/comunidade/novo" />}>
            + Nova galeria
          </Button>
        </div>
        <ModuleList
          rows={rows}
          titleKey="title"
          columns={[
            { key: "category_name", label: "Categoria" },
            { key: "status", label: "Status" },
          ]}
          basePath="/admin/comunidade"
          onDuplicate={duplicateAlbum}
          onDelete={softDeleteAlbum}
        />
      </div>
    </>
  );
}
