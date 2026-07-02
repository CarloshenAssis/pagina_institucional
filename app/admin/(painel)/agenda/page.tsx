import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listEventos, softDeleteEvento, duplicateEvento } from "./actions";
import { AgendaPageToggle } from "./toggle";
import { ModuleList } from "@/components/admin/module-list";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";

export default async function AgendaPage() {
  const supabase = await createClient();
  const [rows, { data: setting }] = await Promise.all([
    listEventos(),
    supabase.from("global_settings").select("value").eq("key", "agenda_page_enabled").single(),
  ]);
  return (
    <>
      <Topbar title="Agenda" />
      <div className="p-9 flex flex-col gap-4">
        <AgendaPageToggle initialEnabled={setting?.value === "true"} />
        <div className="flex justify-between">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/agenda/lixeira" />}>
            Lixeira
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/agenda/novo" />}>
            + Novo evento
          </Button>
        </div>
        <ModuleList
          rows={rows}
          titleKey="title"
          columns={[
            { key: "location", label: "Local" },
            { key: "status", label: "Status" },
          ]}
          basePath="/admin/agenda"
          onDuplicate={duplicateEvento}
          onDelete={softDeleteEvento}
        />
      </div>
    </>
  );
}
