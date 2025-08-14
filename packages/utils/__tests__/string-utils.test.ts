import { describe, it, expect } from "vitest";

import { sanitizeFilename } from "@southern-syntax/utils";

describe("sanitizeFilename", () => {
  it("keeps safe characters and lowercases extension", () => {
    const result = sanitizeFilename("My File.JPG");
    expect(result).toBe("my-file.jpg");
  });

  it("falls back to file prefix when name is empty", () => {
    const result = sanitizeFilename("###.txt");
    expect(result.endsWith(".txt")).toBe(true);
    expect(result.startsWith("file-")).toBe(true);
  });
});
