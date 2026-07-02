import { describe, it, expect } from "vitest";
import { bucketForType, validateFileSize } from "./upload-config";

describe("bucketForType", () => {
  it("routes images to public-images", () => expect(bucketForType("imagem")).toBe("public-images"));
  it("routes pdf/documento to public-pdfs", () => {
    expect(bucketForType("pdf")).toBe("public-pdfs");
    expect(bucketForType("documento")).toBe("public-pdfs");
  });
  it("routes videos to public-videos", () => expect(bucketForType("video")).toBe("public-videos"));
});

describe("validateFileSize", () => {
  it("rejects a PDF over 10MB", () => expect(validateFileSize("pdf", 11 * 1024 * 1024)).toBe(false));
  it("accepts a 1MB image", () => expect(validateFileSize("imagem", 1 * 1024 * 1024)).toBe(true));
  it("accepts a 40MB video and rejects 60MB", () => {
    expect(validateFileSize("video", 40 * 1024 * 1024)).toBe(true);
    expect(validateFileSize("video", 60 * 1024 * 1024)).toBe(false);
  });
});
