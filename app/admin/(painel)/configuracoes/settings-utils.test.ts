import { describe, it, expect } from "vitest";
import { settingsToRecord, metaDescriptionLength } from "./settings-utils";

describe("settingsToRecord", () => {
  it("turns key/value rows into a flat object", () => {
    const rows = [
      { key: "site_name", value: "Helena Duarte" },
      { key: "contact_email", value: "a@b.com" },
    ];
    expect(settingsToRecord(rows)).toEqual({ site_name: "Helena Duarte", contact_email: "a@b.com" });
  });
});

describe("metaDescriptionLength", () => {
  it("counts characters against the 160 limit", () => {
    expect(metaDescriptionLength("a".repeat(62))).toEqual({ count: 62, max: 160 });
  });
});
