import { describe, it, expect } from "vitest";
import { noticiaSchema } from "./noticias";

describe("noticiaSchema", () => {
  it("requires a title", () => expect(noticiaSchema.safeParse({ title: "" }).success).toBe(false));
  it("defaults gallery_urls to an empty array", () => {
    expect(noticiaSchema.parse({ title: "Nota oficial" }).gallery_urls).toEqual([]);
  });
});
