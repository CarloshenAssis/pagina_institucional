import { describe, it, expect } from "vitest";
import { groupResults } from "./search";

describe("groupResults", () => {
  it("groups rows by module keeping order and hrefs", () => {
    const grouped = groupResults([
      { module: "projetos", title: "Escola", slug: "escola" },
      { module: "noticias", title: "Nota", slug: "nota" },
      { module: "projetos", title: "Creche", slug: "creche" },
    ]);
    expect(grouped).toEqual([
      {
        module: "projetos",
        label: "Projetos",
        items: [
          { title: "Escola", href: "/projetos/escola" },
          { title: "Creche", href: "/projetos/creche" },
        ],
      },
      { module: "noticias", label: "Notícias", items: [{ title: "Nota", href: "/noticias/nota" }] },
    ]);
  });

  it("agenda items link to /agenda (sem slug)", () => {
    const grouped = groupResults([{ module: "agenda", title: "Audiência", slug: null }]);
    expect(grouped[0].items[0].href).toBe("/agenda");
  });

  it("returns empty array for no results", () => {
    expect(groupResults([])).toEqual([]);
  });
});
