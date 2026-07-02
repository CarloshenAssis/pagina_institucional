import { describe, it, expect, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: fromMock }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { buildDuplicatePayload } from "./actions";

describe("buildDuplicatePayload", () => {
  it("appends (cópia) to the title and resets to rascunho", () => {
    const original = {
      id: "abc",
      title: "Escola Nova Geração",
      slug: "escola-nova-geracao",
      status: "publicado",
      scheduled_at: null,
      published_at: "2026-01-01T00:00:00Z",
      deleted_at: null,
      created_at: "2026-01-01T00:00:00Z",
      excerpt: "resumo",
    };
    const copy = buildDuplicatePayload(original, "title", "slug");
    expect(copy.title).toBe("Escola Nova Geração (cópia)");
    expect(copy.slug).toMatch(/^escola-nova-geracao-copia-/);
    expect(copy.status).toBe("rascunho");
    expect(copy.published_at).toBeNull();
    expect(copy).not.toHaveProperty("id");
    expect(copy).not.toHaveProperty("created_at");
    expect(copy.excerpt).toBe("resumo");
  });
});
