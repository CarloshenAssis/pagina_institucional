import { getSettings } from "./actions";
import { Topbar } from "@/components/admin/topbar";
import { SettingsForm } from "./form";

export default async function ConfiguracoesPage() {
  const settings = await getSettings();
  return (
    <>
      <Topbar title="Configurações" />
      <div className="p-9">
        <SettingsForm initial={settings} />
      </div>
    </>
  );
}
