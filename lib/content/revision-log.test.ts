import { describe, it, expect } from "vitest";
import { formatRevisionSummary } from "./revision-log";

describe("formatRevisionSummary", () => {
  it("lists the changed field names, comma-separated", () => {
    const summary = formatRevisionSummary({
      changed_fields: { title: { from: "A", to: "B" }, status: { from: "rascunho", to: "publicado" } },
      changed_at: "2026-07-01T10:00:00Z",
    });
    expect(summary).toBe("title, status — 01/07/2026 10:00");
  });
});
