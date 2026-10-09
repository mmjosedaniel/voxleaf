import type {
  NarrationPreparationRequest,
  NarrationPreparationResult,
  OpenedPublication,
} from "@voxleaf/epub";
import { describe, expect, expectTypeOf, it } from "vitest";

import * as epubPackage from "@voxleaf/epub";

describe("@voxleaf/epub", () => {
  it("exports only the validated public runtime opener", () => {
    expect(Object.keys(epubPackage)).toEqual(["openEpubPublication"]);
    expect(typeof epubPackage.openEpubPublication).toBe("function");
  });

  it("exposes narration preparation only as a typed opened-handle operation", () => {
    expectTypeOf<OpenedPublication["prepareNarration"]>().toBeFunction();
    expectTypeOf<
      Parameters<OpenedPublication["prepareNarration"]>[0]
    >().toEqualTypeOf<NarrationPreparationRequest>();
    expectTypeOf<
      Awaited<ReturnType<OpenedPublication["prepareNarration"]>>
    >().toEqualTypeOf<NarrationPreparationResult>();
  });
});
