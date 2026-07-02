import { createClient } from "@/lib/supabase/server";
import { SobreForm } from "./form";
import { Topbar } from "@/components/admin/topbar";

export default async function SobrePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("sobre").select("*").eq("id", 1).single();
  return (
    <>
      <Topbar title="Sobre" />
      <div className="p-9">
        <SobreForm initial={data} />
      </div>
    </>
  );
}
