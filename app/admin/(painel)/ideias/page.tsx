import Link from "next/link";
import { listIdeias, softDeleteIdeia, duplicateIdeia } from "./actions";
import { ModuleList } from "@/components/admin/module-list";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";

export default async function IdeiasPage() {
  const rows = await listIdeias();
  return (
    <>
      <Topbar title="Ideias" />
      <div className="p-9 flex flex-col gap-4">
        <div className="flex justify-between">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/ideias/lixeira" />}>
            Lixeira
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/ideias/novo" />}>
            + Nova ideia
          </Button>
        </div>
        <ModuleList
          rows={rows}
          titleKey="title"
          columns={[
            { key: "category_name", label: "Categoria" },
            { key: "status", label: "Status" },
          ]}
          basePath="/admin/ideias"
          onDuplicate={duplicateIdeia}
          onDelete={softDeleteIdeia}
        />
      </div>
    </>
  );
}
