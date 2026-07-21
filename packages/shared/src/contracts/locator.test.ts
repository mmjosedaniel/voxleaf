import { describe, expect, it } from "vitest";

import {
  LocatorContractError,
  decodeLocatorRangeV1,
  decodeReadingLocatorV1,
} from "./locator.js";

function createLocatorInput() {
  return {
    schemaVersion: 1,
    bookIdentity: {
      scheme: "synthetic-test",
      schemeVersion: 1,
      value: "book-test-001",
    },
    spineItemId: "spine:chapter-1",
    spineItemIndex: 0,
    anchor: {
      kind: "element-id",
      formatVersion: 1,
      value: "paragraph-1",
      anchorIndex: 0,
    },
    textOffsetCodePoints: 4,
    progression: 0.25,
  };
}

function createRangeInput() {
  const start = createLocatorInput();
  const end = createLocatorInput();
  end.textOffsetCodePoints = 12;
  end.progression = 0.3;

  return { schemaVersion: 1, start, end };
}

describe("reading locator contract", () => {
  it("round-trips a content-free logical position exactly", () => {
    const input = createLocatorInput();
    const locator = decodeReadingLocatorV1(input);

    expect(JSON.parse(JSON.stringify(locator))).toEqual(input);
    expect(locator).not.toHaveProperty("pageNumber");
    expect(locator).not.toHaveProperty("textQuote");
  });

  it("preserves an omitted recovery progression", () => {
    const input = createLocatorInput();
    const { progression: _progression, ...withoutProgression } = input;
    void _progression;

    const locator = decodeReadingLocatorV1(withoutProgression);

    expect(locator.progression).toBeUndefined();
    expect(JSON.parse(JSON.stringify(locator))).toEqual(withoutProgression);
  });

  it("rejects rendered pages, quotations, and malformed anchors", () => {
    const withPage = {
      ...createLocatorInput(),
      pageNumber: 31,
    };
    const withQuote = {
      ...createLocatorInput(),
      textQuote: "private quotation",
    };
    const invalidAnchor = createLocatorInput();
    invalidAnchor.anchor.value = "private quotation";
    const unsupportedAnchorKind = createLocatorInput();
    unsupportedAnchorKind.anchor.kind = "epub-cfi";
    const invalidAnchorIndex = createLocatorInput();
    invalidAnchorIndex.anchor.anchorIndex = -1;
    const invalidTextOffset = createLocatorInput();
    invalidTextOffset.textOffsetCodePoints = -1;

    expect(() => decodeReadingLocatorV1(withPage)).toThrow(
      LocatorContractError,
    );
    expect(() => decodeReadingLocatorV1(withQuote)).toThrow(
      LocatorContractError,
    );
    expect(() => decodeReadingLocatorV1(invalidAnchor)).toThrow(
      LocatorContractError,
    );
    expect(() => decodeReadingLocatorV1(unsupportedAnchorKind)).toThrow(
      LocatorContractError,
    );
    expect(() => decodeReadingLocatorV1(invalidAnchorIndex)).toThrow(
      LocatorContractError,
    );
    expect(() => decodeReadingLocatorV1(invalidTextOffset)).toThrow(
      LocatorContractError,
    );
  });

  it.each([-0.1, 1.1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid progression %s",
    (progression) => {
      const input = createLocatorInput();
      input.progression = progression;

      expect(() => decodeReadingLocatorV1(input)).toThrow(LocatorContractError);
    },
  );

  it("distinguishes unsupported locator and anchor versions", () => {
    const unsupportedLocator = createLocatorInput();
    unsupportedLocator.schemaVersion = 2;

    const unsupportedAnchor = createLocatorInput();
    unsupportedAnchor.anchor.formatVersion = 2;

    for (const input of [unsupportedLocator, unsupportedAnchor]) {
      expect(() => decodeReadingLocatorV1(input)).toThrowError(
        expect.objectContaining({
          code: "unsupported-version",
          message: "Locator contract version is unsupported.",
        }),
      );
    }
  });
});

describe("locator range contract", () => {
  it("round-trips an ordered range within one anchor", () => {
    const input = createRangeInput();
    const range = decodeLocatorRangeV1(input);

    expect(JSON.parse(JSON.stringify(range))).toEqual(input);
  });

  it("accepts ordered ranges across anchors and spine items", () => {
    const acrossAnchors = createRangeInput();
    acrossAnchors.end.anchor.value = "paragraph-2";
    acrossAnchors.end.anchor.anchorIndex = 1;
    acrossAnchors.end.textOffsetCodePoints = 0;

    const acrossSpineItems = createRangeInput();
    acrossSpineItems.end.spineItemId = "spine:chapter-2";
    acrossSpineItems.end.spineItemIndex = 1;
    acrossSpineItems.end.anchor.value = "paragraph-1";
    acrossSpineItems.end.anchor.anchorIndex = 0;
    acrossSpineItems.end.textOffsetCodePoints = 0;

    expect(() => decodeLocatorRangeV1(acrossAnchors)).not.toThrow();
    expect(() => decodeLocatorRangeV1(acrossSpineItems)).not.toThrow();
  });

  it("rejects ranges ordered backwards", () => {
    const reversedOffset = createRangeInput();
    reversedOffset.start.textOffsetCodePoints = 20;

    const reversedAnchor = createRangeInput();
    reversedAnchor.start.anchor.value = "paragraph-2";
    reversedAnchor.start.anchor.anchorIndex = 2;
    reversedAnchor.end.anchor.value = "paragraph-1";
    reversedAnchor.end.anchor.anchorIndex = 1;

    const reversedSpine = createRangeInput();
    reversedSpine.start.spineItemId = "spine:chapter-2";
    reversedSpine.start.spineItemIndex = 2;
    reversedSpine.end.spineItemId = "spine:chapter-1";
    reversedSpine.end.spineItemIndex = 1;

    for (const range of [reversedOffset, reversedAnchor, reversedSpine]) {
      expect(() => decodeLocatorRangeV1(range)).toThrow(LocatorContractError);
    }
  });

  it("rejects ranges that cross book identities", () => {
    const input = createRangeInput();
    input.end.bookIdentity.value = "book-test-002";

    expect(() => decodeLocatorRangeV1(input)).toThrow(LocatorContractError);
  });

  it("distinguishes unsupported range and nested locator versions", () => {
    const unsupportedRange = createRangeInput();
    unsupportedRange.schemaVersion = 2;

    const unsupportedNestedLocator = createRangeInput();
    unsupportedNestedLocator.end.schemaVersion = 2;

    for (const input of [unsupportedRange, unsupportedNestedLocator]) {
      expect(() => decodeLocatorRangeV1(input)).toThrowError(
        expect.objectContaining({
          code: "unsupported-version",
          message: "Locator contract version is unsupported.",
        }),
      );
    }
  });

  it("rejects inconsistent structural identities and indexes", () => {
    const inconsistentSpine = createRangeInput();
    inconsistentSpine.end.spineItemId = "spine:chapter-2";

    const inconsistentAnchor = createRangeInput();
    inconsistentAnchor.end.anchor.value = "paragraph-2";

    expect(() => decodeLocatorRangeV1(inconsistentSpine)).toThrow(
      LocatorContractError,
    );
    expect(() => decodeLocatorRangeV1(inconsistentAnchor)).toThrow(
      LocatorContractError,
    );
  });

  it("rejects decreasing recovery progression", () => {
    const input = createRangeInput();
    input.start.progression = 0.5;
    input.end.progression = 0.4;

    expect(() => decodeLocatorRangeV1(input)).toThrow(LocatorContractError);
  });

  it("does not expose locator input through validation errors", () => {
    const input = createRangeInput();
    input.end.bookIdentity.value = "private-locator-value";

    expect(() => decodeLocatorRangeV1(input)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining("private-locator-value"),
      }),
    );
  });
});
