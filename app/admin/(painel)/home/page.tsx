import { createClient } from "@/lib/supabase/server";
import { CANONICAL_HOME_SECTIONS } from "@/lib/content/home-sections";
import { Topbar } from "@/components/admin/topbar";
import { HomeSectionsEditor } from "./sections-editor";
import { HeroForm } from "./hero-form";

export default async function HomeConfigPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("home_config").select("*").eq("id", 1).single();
  return (
    <>
      <Topbar title="Home" />
      <div className="p-9 flex flex-col gap-8">
        <HeroForm initial={config} />
        <div>
          <p className="text-sm text-muted-foreground mb-6 max-w-xl">
            Gerencie as seções exibidas na página inicial do portal. Use o botão para ativar ou
            ocultar; a ordem segue a lista abaixo (arrastar-e-soltar entra em uma iteração futura —
            MVP usa mover para cima).
          </p>
          <HomeSectionsEditor
            order={config.sections_order}
            visible={config.sections_visible}
            sections={CANONICAL_HOME_SECTIONS}
          />
        </div>
      </div>
    </>
  );
}
