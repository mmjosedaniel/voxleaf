import { describe, expect, it } from "vitest";

import * as sharedPackage from "@voxleaf/shared";
import { FIXED_TEST_IDENTIFIERS } from "@voxleaf/shared/testing";

describe("@voxleaf/shared", () => {
  it("resolves its production and testing entry points independently", () => {
    expect(sharedPackage.createBookId("book:synthetic-1")).toBe(
      "book:synthetic-1",
    );
    expect(FIXED_TEST_IDENTIFIERS.bookId).toBe("book:test");
    expect(Object.hasOwn(sharedPackage, "FIXED_TEST_IDENTIFIERS")).toBe(false);
  });
});
