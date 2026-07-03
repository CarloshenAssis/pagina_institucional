import { describe, it, expect } from "vitest";
import { videoKind, embedUrl } from "./video";

describe("videoKind", () => {
  it("detects youtube (watch e youtu.be)", () => {
    expect(videoKind("https://www.youtube.com/watch?v=abc123")).toBe("youtube");
    expect(videoKind("https://youtu.be/abc123")).toBe("youtube");
  });
  it("detects vimeo", () => {
    expect(videoKind("https://vimeo.com/123456789")).toBe("vimeo");
  });
  it("detects arquivo hospedado (bucket public-videos ou extensão de vídeo)", () => {
    expect(
      videoKind("https://wbbq.supabase.co/storage/v1/object/public/public-videos/1-clipe.mp4")
    ).toBe("arquivo");
    expect(videoKind("https://exemplo.com/media/video.webm")).toBe("arquivo");
  });
  it("returns desconhecido for anything else", () => {
    expect(videoKind("https://exemplo.com/pagina")).toBe("desconhecido");
    expect(videoKind("")).toBe("desconhecido");
  });
});

describe("embedUrl", () => {
  it("builds youtube embed URL", () => {
    expect(embedUrl("https://www.youtube.com/watch?v=abc123")).toBe("https://www.youtube.com/embed/abc123");
    expect(embedUrl("https://youtu.be/xyz789")).toBe("https://www.youtube.com/embed/xyz789");
  });
  it("builds vimeo embed URL", () => {
    expect(embedUrl("https://vimeo.com/123456789")).toBe("https://player.vimeo.com/video/123456789");
  });
  it("returns null when not embeddable", () => {
    expect(embedUrl("https://exemplo.com/video.mp4")).toBeNull();
  });
});
