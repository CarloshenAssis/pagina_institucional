import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { count: unreadMessages } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "nova");

  return (
    <div className="flex h-screen">
      <Sidebar unreadCount={unreadMessages ?? 0} />
      <div className="flex-1 flex flex-col overflow-y-auto bg-background">{children}</div>
    </div>
  );
}
