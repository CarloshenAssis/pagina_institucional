import { describe, it, expect } from "vitest";
import { filterMedia } from "./media-actions";

const items = [
  { id: "1", filename: "escola-nova-geracao-01.jpg", type: "imagem" as const },
  { id: "2", filename: "relatorio-anual-2025.pdf", type: "pdf" as const },
];

describe("filterMedia", () => {
  it("filters by filename, case-insensitive", () => {
    expect(filterMedia(items, "ESCOLA")).toEqual([items[0]]);
  });
  it("returns everything when the query is empty", () => {
    expect(filterMedia(items, "")).toEqual(items);
  });
  it("returns an empty array when nothing matches", () => {
    expect(filterMedia(items, "zzz")).toEqual([]);
  });
});
