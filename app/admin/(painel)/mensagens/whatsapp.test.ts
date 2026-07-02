import { describe, it, expect } from "vitest";
import { buildWhatsAppLink } from "./whatsapp";

describe("buildWhatsAppLink", () => {
  it("strips non-digits from the phone number", () => {
    expect(buildWhatsAppLink("(11) 98888-1234")).toBe("https://wa.me/11988881234");
  });
  it("returns null for an empty phone", () => {
    expect(buildWhatsAppLink("")).toBeNull();
    expect(buildWhatsAppLink(null)).toBeNull();
  });
});
