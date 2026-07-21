import { describe, expect, it } from "vitest";

import { BookContractError, decodeBookV1 } from "../contracts/book.js";
import { decodeReadingLocatorV1 } from "../contracts/locator.js";
import {
  FakeDocumentSourceError,
  INVALID_SYNTHETIC_DOCUMENT_FIXTURES,
  VALID_SYNTHETIC_DOCUMENT_FIXTURE,
  createFakeDocumentSource,
  findSyntheticDocumentBlock,
} from "./synthetic-document.js";

describe("synthetic document fixtures", () => {
  it("provides a clearly synthetic multi-spine book with structural content", () => {
    const fixture = VALID_SYNTHETIC_DOCUMENT_FIXTURE;

    expect(fixture.provenance).toBe("synthetic");
    expect(fixture.book.spine).toHaveLength(2);
    expect(fixture.book.navigation).toEqual([
      { label: "Arrival", targetSpineItemId: "spine:arrival" },
      { label: "Departure", targetSpineItemId: "spine:departure" },
    ]);
    expect(
      fixture.spineDocuments.flatMap((document) => document.blocks),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "heading" }),
        expect.objectContaining({ kind: "paragraph" }),
        expect.objectContaining({ kind: "dialogue" }),
        expect.objectContaining({ kind: "scene-boundary" }),
      ]),
    );
    expect(fixture.images).toEqual([
      {
        id: "lantern-image",
        resourcePath: "images/lantern.svg",
        altText: "Synthetic lantern illustration",
      },
    ]);
  });

  it("keeps valid fixture data immutable", () => {
    expect(Object.isFrozen(VALID_SYNTHETIC_DOCUMENT_FIXTURE)).toBe(true);
    expect(
      Object.isFrozen(VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments),
    ).toBe(true);
    expect(Object.isFrozen(VALID_SYNTHETIC_DOCUMENT_FIXTURE.images)).toBe(true);
  });

  it("contains named invalid inputs for all required structural categories", () => {
    expect(
      INVALID_SYNTHETIC_DOCUMENT_FIXTURES.map((fixture) => fixture.name),
    ).toEqual([
      "duplicate-spine-id",
      "broken-navigation",
      "invalid-locator-reference",
      "remote-resource",
      "malformed-book-structure",
    ]);

    for (const fixture of INVALID_SYNTHETIC_DOCUMENT_FIXTURES) {
      expect(fixture.provenance).toBe("synthetic");

      if (fixture.bookInput !== undefined) {
        expect(() => decodeBookV1(fixture.bookInput)).toThrow(
          BookContractError,
        );
      }

      if (fixture.locatorInput !== undefined) {
        const locator = decodeReadingLocatorV1(fixture.locatorInput);

        expect(
          findSyntheticDocumentBlock(VALID_SYNTHETIC_DOCUMENT_FIXTURE, locator),
        ).toBeUndefined();
      }
    }
  });

  it("resolves a valid fixture locator without parsing a document", () => {
    const locator =
      VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[1]!.locator;

    expect(
      findSyntheticDocumentBlock(VALID_SYNTHETIC_DOCUMENT_FIXTURE, locator),
    ).toMatchObject({ kind: "paragraph", id: "arrival-paragraph" });
  });
});

describe("scripted fake document source", () => {
  it("returns scripted successes and failures in order with observable counts", () => {
    const source = createFakeDocumentSource([
      { kind: "success", fixture: VALID_SYNTHETIC_DOCUMENT_FIXTURE },
      { kind: "failure", code: "scripted-failure" },
    ]);

    expect(source.getLoadCount()).toBe(0);
    expect(source.getRemainingStepCount()).toBe(2);
    expect(source.load()).toBe(VALID_SYNTHETIC_DOCUMENT_FIXTURE);
    expect(source.getLoadCount()).toBe(1);
    expect(source.getRemainingStepCount()).toBe(1);
    expect(() => source.load()).toThrowError(
      expect.objectContaining({ code: "scripted-failure" }),
    );
    expect(source.getLoadCount()).toBe(2);
    expect(source.getRemainingStepCount()).toBe(0);
  });

  it("fails deterministically when its script is exhausted", () => {
    const source = createFakeDocumentSource([]);

    expect(() => source.load()).toThrowError(
      expect.objectContaining({ code: "script-exhausted" }),
    );
    expect(source.getLoadCount()).toBe(1);
    expect(source.getRemainingStepCount()).toBe(0);
    expect(() => source.load()).toThrow(FakeDocumentSourceError);
  });
});
