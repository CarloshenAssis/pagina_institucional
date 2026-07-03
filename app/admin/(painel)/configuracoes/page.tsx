import { getSettings, getTheme } from "./actions";
import { Topbar } from "@/components/admin/topbar";
import { SettingsForm } from "./form";

export default async function ConfiguracoesPage() {
  const [settings, theme] = await Promise.all([getSettings(), getTheme()]);
  return (
    <>
      <Topbar title="Configurações" />
      <div className="p-9">
        <SettingsForm initial={settings} initialTheme={theme} />
      </div>
    </>
  );
}
