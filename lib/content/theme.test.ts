import { describe, it, expect } from "vitest";
import { themeToCssVars } from "./theme";

describe("themeToCssVars", () => {
  it("emits one CSS var per filled color", () => {
    const css = themeToCssVars({
      primary_color: "#112233",
      secondary_color: "#445566",
      accent_color: null,
      background_color: null,
      text_primary_color: null,
      text_secondary_color: null,
    });
    expect(css).toBe("--primary: #112233; --secondary: #445566;");
  });

  it("returns empty string when everything is null (CSS defaults win)", () => {
    expect(
      themeToCssVars({
        primary_color: null,
        secondary_color: null,
        accent_color: null,
        background_color: null,
        text_primary_color: null,
        text_secondary_color: null,
      })
    ).toBe("");
  });

  it("ignores values that are not hex colors (defesa contra injeção via banco)", () => {
    expect(
      themeToCssVars({
        primary_color: "red; } body { display:none",
        secondary_color: "#AABBCC",
        accent_color: null,
        background_color: null,
        text_primary_color: null,
        text_secondary_color: null,
      })
    ).toBe("--secondary: #AABBCC;");
  });

  it("maps all six tokens to the shadcn vars", () => {
    const css = themeToCssVars({
      primary_color: "#111111",
      secondary_color: "#222222",
      accent_color: "#333333",
      background_color: "#444444",
      text_primary_color: "#555555",
      text_secondary_color: "#666666",
    });
    expect(css).toContain("--primary: #111111;");
    expect(css).toContain("--secondary: #222222;");
    expect(css).toContain("--accent: #333333;");
    expect(css).toContain("--background: #444444;");
    expect(css).toContain("--foreground: #555555;");
    expect(css).toContain("--muted-foreground: #666666;");
  });
});
