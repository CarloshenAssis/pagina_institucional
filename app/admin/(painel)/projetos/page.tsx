import Link from "next/link";
import { listProjetos, softDeleteProjeto, duplicateProjeto } from "./actions";
import { ModuleList } from "@/components/admin/module-list";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";

export default async function ProjetosPage() {
  const rows = await listProjetos();
  return (
    <>
      <Topbar title="Projetos" />
      <div className="p-9 flex flex-col gap-4">
        <div className="flex justify-between">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/projetos/lixeira" />}>
            Lixeira
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/projetos/novo" />}>
            + Novo projeto
          </Button>
        </div>
        <ModuleList
          rows={rows}
          titleKey="title"
          columns={[
            { key: "category_name", label: "Categoria" },
            { key: "status", label: "Status" },
          ]}
          basePath="/admin/projetos"
          onDuplicate={duplicateProjeto}
          onDelete={softDeleteProjeto}
        />
      </div>
    </>
  );
}
