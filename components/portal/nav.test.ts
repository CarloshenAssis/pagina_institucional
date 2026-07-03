import { describe, it, expect } from "vitest";
import { visibleNavItems } from "./nav";

describe("visibleNavItems", () => {
  it("includes Agenda when the page is enabled", () => {
    const items = visibleNavItems({ agenda_page_enabled: "true" });
    expect(items.map((i) => i.href)).toContain("/agenda");
  });
  it("hides Agenda when the page is disabled", () => {
    const items = visibleNavItems({ agenda_page_enabled: "false" });
    expect(items.map((i) => i.href)).not.toContain("/agenda");
  });
  it("always starts with Início and ends with Contato", () => {
    const items = visibleNavItems({});
    expect(items[0]).toEqual({ label: "Início", href: "/" });
    expect(items[items.length - 1]).toEqual({ label: "Contato", href: "/contato" });
  });
});
