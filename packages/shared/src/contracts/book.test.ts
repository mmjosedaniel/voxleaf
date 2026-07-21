import { describe, expect, it } from "vitest";

import { BookContractError, decodeBookV1 } from "./book.js";

function createValidBookInput() {
  return {
    schemaVersion: 1,
    identity: {
      scheme: "synthetic-test",
      schemeVersion: 1,
      value: "book-test-001",
    },
    metadata: {
      title: "Synthetic Test Book",
      authors: ["Test Author"],
    },
    resources: [
      {
        path: "text/chapter-1.xhtml",
        mediaType: "application/xhtml+xml",
        role: "content-document",
      },
      {
        path: "text/chapter-2.xhtml",
        mediaType: "application/xhtml+xml",
        role: "content-document",
      },
      {
        path: "images/cover.png",
        mediaType: "image/png",
        role: "image",
      },
    ],
    spine: [
      {
        id: "spine:chapter-1",
        index: 0,
        resourcePath: "text/chapter-1.xhtml",
      },
      {
        id: "spine:chapter-2",
        index: 1,
        resourcePath: "text/chapter-2.xhtml",
      },
    ],
    navigation: [
      {
        label: "Chapter One",
        targetSpineItemId: "spine:chapter-1",
      },
      {
        label: "Chapter Two",
        targetSpineItemId: "spine:chapter-2",
      },
    ],
  };
}

describe("book and spine contract", () => {
  it("decodes versioned privacy-safe metadata and ordered spine items", () => {
    const book = decodeBookV1(createValidBookInput());

    expect(book.schemaVersion).toBe(1);
    expect(book.identity).toEqual({
      scheme: "synthetic-test",
      schemeVersion: 1,
      value: "book-test-001",
    });
    expect(book.spine.map(({ id, index }) => ({ id, index }))).toEqual([
      { id: "spine:chapter-1", index: 0 },
      { id: "spine:chapter-2", index: 1 },
    ]);
    expect(book.resources.at(-1)).toEqual({
      path: "images/cover.png",
      mediaType: "image/png",
      role: "image",
    });
    expect(JSON.parse(JSON.stringify(book))).toEqual(createValidBookInput());
  });

  it("rejects duplicate spine identifiers and invalid ordering", () => {
    const duplicateId = createValidBookInput();
    duplicateId.spine[1]!.id = duplicateId.spine[0]!.id;

    const duplicateIndex = createValidBookInput();
    duplicateIndex.spine[1]!.index = 0;

    const nonContiguousIndex = createValidBookInput();
    nonContiguousIndex.spine[1]!.index = 2;

    expect(() => decodeBookV1(duplicateId)).toThrow(BookContractError);
    expect(() => decodeBookV1(duplicateIndex)).toThrow(BookContractError);
    expect(() => decodeBookV1(nonContiguousIndex)).toThrow(BookContractError);
  });

  it("rejects invalid resource relationships", () => {
    const duplicatePath = createValidBookInput();
    duplicatePath.resources[1]!.path = duplicatePath.resources[0]!.path;

    const missingSpineResource = createValidBookInput();
    missingSpineResource.spine[0]!.resourcePath = "text/missing.xhtml";

    const imageAsSpineResource = createValidBookInput();
    imageAsSpineResource.spine[0]!.resourcePath = "images/cover.png";

    expect(() => decodeBookV1(duplicatePath)).toThrow(BookContractError);
    expect(() => decodeBookV1(missingSpineResource)).toThrow(BookContractError);
    expect(() => decodeBookV1(imageAsSpineResource)).toThrow(BookContractError);
  });

  it.each([
    "https://example.invalid/cover.png",
    "file:///private/book/cover.png",
    "/private/book/cover.png",
    "C:/private/book/cover.png",
    "images/../private.png",
    "images\\cover.png",
  ])("rejects non-local or unsafe resource path %s", (path) => {
    const input = createValidBookInput();
    input.resources[2]!.path = path;

    expect(() => decodeBookV1(input)).toThrow(BookContractError);
  });

  it("rejects navigation outside the declared spine", () => {
    const input = createValidBookInput();
    input.navigation[0]!.targetSpineItemId = "spine:missing";

    expect(() => decodeBookV1(input)).toThrow(BookContractError);
  });

  it("keeps identity opaque and separate from publication metadata", () => {
    const absolutePathIdentity = createValidBookInput();
    absolutePathIdentity.identity.value = "C:/private/books/test.epub";

    const identityWithMetadata = createValidBookInput() as ReturnType<
      typeof createValidBookInput
    > & {
      identity: ReturnType<typeof createValidBookInput>["identity"] & {
        title: string;
      };
    };
    identityWithMetadata.identity.title = "Private title";

    expect(() => decodeBookV1(absolutePathIdentity)).toThrow(BookContractError);
    expect(() => decodeBookV1(identityWithMetadata)).toThrow(BookContractError);
  });

  it("distinguishes unsupported versions from malformed input", () => {
    const unsupported = createValidBookInput();
    unsupported.schemaVersion = 2;

    expect(() => decodeBookV1(unsupported)).toThrowError(
      expect.objectContaining({
        code: "unsupported-version",
        message: "Book contract version is unsupported.",
      }),
    );
    expect(() => decodeBookV1({ schemaVersion: "1" })).toThrowError(
      expect.objectContaining({
        code: "malformed",
        message: "Book contract is malformed.",
      }),
    );
  });

  it("does not expose private input through validation errors", () => {
    const input = createValidBookInput();
    input.navigation[0]!.targetSpineItemId = "private-navigation-target";

    expect(() => decodeBookV1(input)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining("private-navigation-target"),
      }),
    );
  });
});
