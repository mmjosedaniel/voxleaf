import { describe, expect, it } from "vitest";

import type { SegmentId } from "../primitives/index.js";
import {
  NarrationSegmentContractError,
  decodeNarrationSegmentV1,
  getNarrationSegmentWorkIdentity,
} from "./narration-segment.js";

function createNarrationSegmentInput() {
  const bookIdentity = {
    scheme: "synthetic-test",
    schemeVersion: 1,
    value: "book-test-001",
  };
  const start = {
    schemaVersion: 1,
    bookIdentity: { ...bookIdentity },
    spineItemId: "spine:chapter-1",
    spineItemIndex: 0,
    anchor: {
      kind: "element-id",
      formatVersion: 1,
      value: "paragraph-1",
      anchorIndex: 0,
    },
    textOffsetCodePoints: 0,
    progression: 0.2,
  };
  const end = {
    ...start,
    bookIdentity: { ...bookIdentity },
    anchor: { ...start.anchor },
    textOffsetCodePoints: 36,
    progression: 0.24,
  };

  return {
    schemaVersion: 1,
    segmentId: "segment:synthetic-1",
    bookIdentity,
    sessionId: "session:synthetic-1",
    generationId: "generation:synthetic-1",
    sequence: 0,
    sourceRange: { schemaVersion: 1, start, end },
    text: "The quiet lamp glowed beside the chair.",
  };
}

describe("narration segment contract", () => {
  it("round-trips a locator-linked synthetic narration segment exactly", () => {
    const input = createNarrationSegmentInput();
    const segment = decodeNarrationSegmentV1(input);

    expect(JSON.parse(JSON.stringify(segment))).toEqual(input);
    expect(getNarrationSegmentWorkIdentity(segment)).toEqual({
      sessionId: "session:synthetic-1",
      generationId: "generation:synthetic-1",
    });
    expect(Object.isFrozen(segment)).toBe(true);
    expect(Object.isFrozen(segment.sourceRange)).toBe(true);
  });

  it("keeps segment and session identities distinct at compile time", () => {
    const segment = decodeNarrationSegmentV1(createNarrationSegmentInput());
    const acceptSegmentId = (value: SegmentId): void => {
      void value;
    };

    // @ts-expect-error A SessionId must not be accepted where a SegmentId is required.
    acceptSegmentId(segment.sessionId);

    expect(segment.segmentId).toBe("segment:synthetic-1");
  });

  it("rejects empty text, invalid sequence values, and undeclared diagnostic fields", () => {
    const emptyText = createNarrationSegmentInput();
    emptyText.text = "";
    const negativeSequence = createNarrationSegmentInput();
    negativeSequence.sequence = -1;
    const fractionalSequence = createNarrationSegmentInput();
    fractionalSequence.sequence = 0.5;
    const withDebugSnapshot = {
      ...createNarrationSegmentInput(),
      debugSnapshot: "private narration text",
    };

    for (const input of [
      emptyText,
      negativeSequence,
      fractionalSequence,
      withDebugSnapshot,
    ]) {
      expect(() => decodeNarrationSegmentV1(input)).toThrow(
        NarrationSegmentContractError,
      );
    }
  });

  it("rejects mismatched segment and locator-range book identities", () => {
    const input = createNarrationSegmentInput();
    input.bookIdentity.value = "book-test-002";

    expect(() => decodeNarrationSegmentV1(input)).toThrowError(
      expect.objectContaining({
        code: "malformed",
        message: "Narration segment contract is malformed.",
      }),
    );
  });

  it("rejects invalid source-range ordering and cross-book ranges", () => {
    const reversedRange = createNarrationSegmentInput();
    reversedRange.sourceRange.start.textOffsetCodePoints = 50;
    const crossBookRange = createNarrationSegmentInput();
    crossBookRange.sourceRange.end.bookIdentity.value = "book-test-002";

    for (const input of [reversedRange, crossBookRange]) {
      expect(() => decodeNarrationSegmentV1(input)).toThrowError(
        expect.objectContaining({ code: "malformed" }),
      );
    }
  });

  it("rejects malformed input without coercion", () => {
    const stringVersion = {
      ...createNarrationSegmentInput(),
      schemaVersion: "1",
    };
    const numericSequence = {
      ...createNarrationSegmentInput(),
      sequence: "0",
    };

    for (const input of [stringVersion, numericSequence]) {
      expect(() => decodeNarrationSegmentV1(input)).toThrowError(
        expect.objectContaining({
          code: "malformed",
          message: "Narration segment contract is malformed.",
        }),
      );
    }
  });

  it("distinguishes unsupported root and nested locator versions", () => {
    const unsupportedSegment = createNarrationSegmentInput();
    unsupportedSegment.schemaVersion = 2;
    const unsupportedRange = createNarrationSegmentInput();
    unsupportedRange.sourceRange.schemaVersion = 2;
    const unsupportedLocator = createNarrationSegmentInput();
    unsupportedLocator.sourceRange.start.schemaVersion = 2;

    for (const input of [
      unsupportedSegment,
      unsupportedRange,
      unsupportedLocator,
    ]) {
      expect(() => decodeNarrationSegmentV1(input)).toThrowError(
        expect.objectContaining({
          code: "unsupported-version",
          message: "Narration segment contract version is unsupported.",
        }),
      );
    }
  });

  it("does not expose sensitive narration text through validation errors", () => {
    const input = {
      ...createNarrationSegmentInput(),
      debugSnapshot: "private narration text",
    };

    expect(() => decodeNarrationSegmentV1(input)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining("private narration text"),
      }),
    );
  });
});
