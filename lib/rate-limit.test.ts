import { describe, it, expect } from "vitest";
import { isRateLimited } from "./rate-limit";

describe("isRateLimited", () => {
  it("allows submissions under the limit", () => {
    const submissions = [Date.now() - 1000, Date.now() - 2000];
    expect(isRateLimited(submissions, 3, 60 * 60 * 1000)).toBe(false);
  });
  it("blocks submissions at or over the limit within the window", () => {
    const submissions = [Date.now() - 1000, Date.now() - 2000, Date.now() - 3000];
    expect(isRateLimited(submissions, 3, 60 * 60 * 1000)).toBe(true);
  });
  it("ignores submissions outside the window", () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const submissions = [twoHoursAgo, twoHoursAgo, twoHoursAgo];
    expect(isRateLimited(submissions, 3, 60 * 60 * 1000)).toBe(false);
  });
});
