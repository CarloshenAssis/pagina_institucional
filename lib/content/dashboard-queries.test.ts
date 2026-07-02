import { describe, it, expect } from "vitest";
import { countPublishedThisMonth } from "./dashboard-queries";

describe("countPublishedThisMonth", () => {
  it("counts rows with published_at in the current calendar month", () => {
    const now = new Date("2026-07-15T12:00:00Z");
    const rows = [
      { published_at: "2026-07-01T00:00:00Z" },
      { published_at: "2026-06-30T23:59:59Z" },
      { published_at: "2026-07-14T10:00:00Z" },
    ];
    expect(countPublishedThisMonth(rows, now)).toBe(2);
  });
});
