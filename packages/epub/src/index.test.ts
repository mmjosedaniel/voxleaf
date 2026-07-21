import { describe, expect, it } from "vitest";

import * as epubPackage from "@voxleaf/epub";

describe("@voxleaf/epub", () => {
  it("resolves as an isolated package without speculative exports", () => {
    expect(Object.keys(epubPackage)).toEqual([]);
  });
});
