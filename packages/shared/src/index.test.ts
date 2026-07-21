import { describe, expect, it } from "vitest";

import * as sharedPackage from "@voxleaf/shared";
import {
  FIXED_TEST_IDENTIFIERS,
  createManualClock,
  createFakeDocumentSource,
  createFakeTtsSource,
  createFakeAudioSink,
  createFakeAudioSource,
} from "@voxleaf/shared/testing";

describe("@voxleaf/shared", () => {
  it("resolves its production and testing entry points independently", () => {
    expect(sharedPackage.createBookId("book:synthetic-1")).toBe(
      "book:synthetic-1",
    );
    expect(FIXED_TEST_IDENTIFIERS.bookId).toBe("book:test");
    expect(createManualClock(0).nowMs).toBe(0);
    expect(typeof createFakeDocumentSource).toBe("function");
    expect(typeof createFakeTtsSource).toBe("function");
    expect(typeof createFakeAudioSource).toBe("function");
    expect(typeof createFakeAudioSink).toBe("function");
    expect(typeof sharedPackage.decodeAudioFrameV1).toBe("function");
    expect(typeof sharedPackage.calculateAudioFrameDurationMs).toBe("function");
    expect(typeof sharedPackage.decodeBufferStatusV1).toBe("function");
    expect(typeof sharedPackage.decodeBookV1).toBe("function");
    expect(typeof sharedPackage.decodeCapabilityReportV1).toBe("function");
    expect(typeof sharedPackage.decodeReadingLocatorV1).toBe("function");
    expect(typeof sharedPackage.decodeLocatorRangeV1).toBe("function");
    expect(typeof sharedPackage.decodeNarrationSegmentV1).toBe("function");
    expect(typeof sharedPackage.createOperationalErrorV1).toBe("function");
    expect(typeof sharedPackage.decodeOperationalErrorV1).toBe("function");
    expect(typeof sharedPackage.decodePersistedReadingStateV1).toBe("function");
    expect(typeof sharedPackage.decodeReadingSessionV1).toBe("function");
    expect(typeof sharedPackage.isGenerationWorkEligible).toBe("function");
    expect(Object.hasOwn(sharedPackage, "FIXED_TEST_IDENTIFIERS")).toBe(false);
  });
});
