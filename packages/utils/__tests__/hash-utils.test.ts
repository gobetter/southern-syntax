import { describe, it, expect } from "vitest";
import { createHash } from "crypto";

import { calculateFileHash } from "../hash-utils";

describe("calculateFileHash", () => {
  it("returns sha256 hash of buffer", () => {
    const data = Buffer.from("hello");
    const expected = createHash("sha256").update(data).digest("hex");
    expect(calculateFileHash(data)).toBe(expected);
  });
});
