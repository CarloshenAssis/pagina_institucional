import Link from "next/link";
import { listTrajetoria, softDeleteTrajetoria, duplicateTrajetoria } from "./actions";
import { ModuleList } from "@/components/admin/module-list";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";

export default async function TrajetoriaPage() {
  const rows = await listTrajetoria();
  return (
    <>
      <Topbar title="Trajetória" />
      <div className="p-9 flex flex-col gap-4">
        <div className="flex justify-between">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/trajetoria/lixeira" />}>
            Lixeira
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/trajetoria/novo" />}>
            + Nova etapa
          </Button>
        </div>
        <ModuleList
          rows={rows}
          titleKey="title"
          columns={[
            { key: "year", label: "Ano" },
            { key: "status", label: "Status" },
          ]}
          basePath="/admin/trajetoria"
          onDuplicate={duplicateTrajetoria}
          onDelete={softDeleteTrajetoria}
        />
      </div>
    </>
  );
}
