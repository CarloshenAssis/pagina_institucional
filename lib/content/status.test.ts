import { describe, it, expect } from "vitest";
import { nextStatusOnPublish, STATUS_LABELS } from "./status";

describe("nextStatusOnPublish", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");

  it("publishes immediately when no future date is given, stamping published_at with now", () => {
    expect(nextStatusOnPublish(null, now)).toEqual({
      status: "publicado",
      scheduled_at: null,
      published_at: now.toISOString(),
    });
  });
  it("schedules when a future date is given, leaving published_at unset", () => {
    const future = new Date(now.getTime() + 86_400_000).toISOString();
    expect(nextStatusOnPublish(future, now)).toEqual({
      status: "agendado",
      scheduled_at: future,
      published_at: null,
    });
  });
  it("publishes immediately when the given date is in the past, stamping published_at with now", () => {
    const past = new Date(now.getTime() - 86_400_000).toISOString();
    expect(nextStatusOnPublish(past, now)).toEqual({
      status: "publicado",
      scheduled_at: null,
      published_at: now.toISOString(),
    });
  });
});

describe("STATUS_LABELS", () => {
  it("has a label for every status", () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual(
      ["agendado", "arquivado", "despublicado", "publicado", "rascunho"].sort()
    );
  });
});
