import Link from "next/link";
import { listNoticias, softDeleteNoticia, duplicateNoticia } from "./actions";
import { ModuleList } from "@/components/admin/module-list";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";

export default async function NoticiasPage() {
  const rows = await listNoticias();
  return (
    <>
      <Topbar title="Notícias" />
      <div className="p-9 flex flex-col gap-4">
        <div className="flex justify-between">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/noticias/lixeira" />}>
            Lixeira
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/noticias/novo" />}>
            + Nova notícia
          </Button>
        </div>
        <ModuleList
          rows={rows}
          titleKey="title"
          columns={[
            { key: "category_name", label: "Categoria" },
            { key: "status", label: "Status" },
          ]}
          basePath="/admin/noticias"
          onDuplicate={duplicateNoticia}
          onDelete={softDeleteNoticia}
        />
      </div>
    </>
  );
}
