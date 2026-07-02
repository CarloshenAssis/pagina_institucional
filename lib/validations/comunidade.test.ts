import { describe, it, expect } from "vitest";
import { albumSchema } from "./comunidade";

describe("albumSchema", () => {
  it("requires a title", () => expect(albumSchema.safeParse({ title: "" }).success).toBe(false));
  it("defaults gallery_urls and video_urls to empty arrays", () => {
    const result = albumSchema.parse({ title: "Encontro comunitário" });
    expect(result.gallery_urls).toEqual([]);
    expect(result.video_urls).toEqual([]);
  });
});
