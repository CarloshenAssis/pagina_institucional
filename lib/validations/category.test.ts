import { describe, it, expect } from "vitest";
import { categoryNameSchema } from "./category";

describe("categoryNameSchema", () => {
  it("rejects an empty name", () => expect(categoryNameSchema.safeParse("").success).toBe(false));
  it("accepts a valid name", () => expect(categoryNameSchema.safeParse("Educação").success).toBe(true));
});
