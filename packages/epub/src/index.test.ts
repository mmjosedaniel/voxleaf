import { describe, expect, it } from "vitest";

import * as epubPackage from "@voxleaf/epub";
import { decodeBookV1, decodeReadingLocatorV1 } from "@voxleaf/shared";

describe("@voxleaf/epub", () => {
  it("resolves as an isolated package without speculative exports", () => {
    expect(Object.keys(epubPackage)).toEqual([]);
  });

  it("consumes synthetic book and locator contracts through the public shared boundary", () => {
    const book = decodeBookV1({
      schemaVersion: 1,
      identity: {
        scheme: "synthetic-test",
        schemeVersion: 1,
        value: "book-test-001",
      },
      metadata: {
        title: "Synthetic EPUB Boundary Book",
        authors: ["VoxLeaf Test Suite"],
      },
      resources: [
        {
          path: "text/chapter-1.xhtml",
          mediaType: "application/xhtml+xml",
          role: "content-document",
        },
      ],
      spine: [
        {
          id: "spine:chapter-1",
          index: 0,
          resourcePath: "text/chapter-1.xhtml",
        },
      ],
      navigation: [
        {
          label: "Chapter One",
          targetSpineItemId: "spine:chapter-1",
        },
      ],
    });
    const locator = decodeReadingLocatorV1({
      schemaVersion: 1,
      bookIdentity: book.identity,
      spineItemId: "spine:chapter-1",
      spineItemIndex: 0,
      anchor: {
        kind: "element-id",
        formatVersion: 1,
        value: "paragraph-1",
        anchorIndex: 0,
      },
      textOffsetCodePoints: 0,
    });

    expect(locator.bookIdentity).toEqual(book.identity);
    expect(locator).not.toHaveProperty("pageNumber");
  });
});
