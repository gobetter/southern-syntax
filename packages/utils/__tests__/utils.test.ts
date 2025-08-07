import { describe, it, expect } from "vitest";

import { cn } from "../utils";

describe("cn utility", () => {
  it("merges class names", () => {
    const result = cn("flex", "p-2");
    expect(result).toBe("flex p-2");
  });

  it("deduplicates tailwind classes", () => {
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", { bar: true, baz: false })).toBe("foo bar");
  });
});
