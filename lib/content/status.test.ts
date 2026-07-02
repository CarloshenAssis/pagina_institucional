import { describe, it, expect } from "vitest";
import { nextStatusOnPublish, STATUS_LABELS } from "./status";

describe("nextStatusOnPublish", () => {
  it("publishes immediately when no future date is given", () => {
    expect(nextStatusOnPublish(null)).toEqual({ status: "publicado", scheduled_at: null });
  });
  it("schedules when a future date is given", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(nextStatusOnPublish(future)).toEqual({ status: "agendado", scheduled_at: future });
  });
  it("publishes immediately when the given date is in the past", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(nextStatusOnPublish(past)).toEqual({ status: "publicado", scheduled_at: null });
  });
});

describe("STATUS_LABELS", () => {
  it("has a label for every status", () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual(
      ["agendado", "arquivado", "despublicado", "publicado", "rascunho"].sort()
    );
  });
});
