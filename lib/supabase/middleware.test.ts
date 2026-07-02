import { describe, it, expect } from "vitest";
import { isProtectedPath } from "./middleware";

describe("isProtectedPath", () => {
  it("protects /admin routes", () => expect(isProtectedPath("/admin")).toBe(true));
  it("protects nested /admin routes", () => expect(isProtectedPath("/admin/projetos")).toBe(true));
  it("does not protect the login page", () => expect(isProtectedPath("/admin/login")).toBe(false));
  it("does not protect public routes", () => expect(isProtectedPath("/projetos")).toBe(false));
});
