import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/topbar";
import { PerfilForm } from "./form";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();
  return (
    <>
      <Topbar title="Perfil" />
      <div className="p-9">
        <PerfilForm
          initial={{
            name: profile?.name ?? "",
            photo_url: profile?.photo_url ?? "",
            language: profile?.language ?? "pt-BR",
          }}
        />
      </div>
    </>
  );
}
