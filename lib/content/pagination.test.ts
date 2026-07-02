import { describe, it, expect } from "vitest";
import { pageRange, totalPages } from "./pagination";

describe("pageRange", () => {
  it("returns the inclusive from/to offsets for a page", () => {
    expect(pageRange(1, 12)).toEqual({ from: 0, to: 11 });
    expect(pageRange(3, 12)).toEqual({ from: 24, to: 35 });
  });
  it("clamps page below 1", () => {
    expect(pageRange(0, 12)).toEqual({ from: 0, to: 11 });
    expect(pageRange(-2, 12)).toEqual({ from: 0, to: 11 });
  });
});

describe("totalPages", () => {
  it("rounds up", () => {
    expect(totalPages(25, 12)).toBe(3);
    expect(totalPages(24, 12)).toBe(2);
  });
  it("is at least 1 even with zero items", () => {
    expect(totalPages(0, 12)).toBe(1);
  });
});
