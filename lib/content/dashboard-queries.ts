import { createClient } from "@/lib/supabase/server";

export function countPublishedThisMonth(
  rows: { published_at: string | null }[],
  now: Date
): number {
  return rows.filter((r) => {
    if (!r.published_at) return false;
    const d = new Date(r.published_at);
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  }).length;
}

const CONTENT_TABLES = ["projects", "news", "ideas", "events"] as const;

export async function getDashboardSummary() {
  const supabase = await createClient();

  const counts = await Promise.all(
    CONTENT_TABLES.map(async (table) => {
      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);
      return [table, count ?? 0] as const;
    })
  );

  const { count: unreadMessages } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "nova");

  const publishedRows = await Promise.all(
    CONTENT_TABLES.map(async (table) => {
      const { data } = await supabase.from(table).select("published_at").not("published_at", "is", null);
      return data ?? [];
    })
  );

  return {
    counts: Object.fromEntries(counts) as Record<(typeof CONTENT_TABLES)[number], number>,
    unreadMessages: unreadMessages ?? 0,
    publishedThisMonth: countPublishedThisMonth(publishedRows.flat(), new Date()),
  };
}
