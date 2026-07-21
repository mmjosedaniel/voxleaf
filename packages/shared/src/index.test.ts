import { describe, expect, it } from "vitest";

import * as sharedPackage from "@voxleaf/shared";

describe("@voxleaf/shared", () => {
  it("resolves its public entry without speculative exports", () => {
    expect(Object.keys(sharedPackage)).toEqual([]);
  });
});
