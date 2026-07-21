import { describe, expect, it } from "vitest";

import {
  assertSupportedSchemaVersion,
  createSchemaVersion,
} from "./version.js";

describe("schema versions", () => {
  it("constructs positive JSON safe integers", () => {
    expect(createSchemaVersion(1)).toBe(1);
    expect(createSchemaVersion(Number.MAX_SAFE_INTEGER)).toBe(
      Number.MAX_SAFE_INTEGER,
    );

    for (const invalid of [
      -0,
      0,
      -1,
      1.5,
      Number.MAX_SAFE_INTEGER + 1,
      NaN,
      Infinity,
      "1",
    ]) {
      expect(() => createSchemaVersion(invalid)).toThrow();
    }
  });

  it("rejects an unsupported version without including the value", () => {
    const version1 = createSchemaVersion(1);
    const version2 = createSchemaVersion(2);

    expect(() =>
      assertSupportedSchemaVersion(version1, [version1]),
    ).not.toThrow();
    expect(() =>
      assertSupportedSchemaVersion(version2, [version1]),
    ).toThrowError(
      expect.objectContaining({ message: "SchemaVersion is unsupported." }),
    );
  });
});
