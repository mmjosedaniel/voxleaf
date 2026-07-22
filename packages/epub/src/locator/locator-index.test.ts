import {
  createIndex,
  createSpineItemId,
  decodeBookV1,
  decodeReadingLocatorV1,
} from "@voxleaf/shared";
import { describe, expect, it } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  ContentDocumentId,
  RasterImageResourceId,
  SemanticBlock,
  SemanticDocument,
  SensitivePublicationText,
} from "../document/document-model.js";
import type { XhtmlDocumentProjection } from "../document/xhtml-projector.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import {
  createBlockLocatorAtOffset,
  createPublicationLocatorIndex,
} from "./locator-index.js";

const imageId = "resource:synthetic" as RasterImageResourceId;

describe("deterministic publication locators", () => {
  it("preserves valid source anchors and assigns immutable start locators in final source order", () => {
    const firstDocument = projection(
      0,
      [
        paragraph([
          text("A😀e\u0301"),
          Object.freeze({ kind: "line-break" }),
          Object.freeze({ kind: "raster-image", resourceId: imageId }),
          Object.freeze({
            kind: "emphasis",
            children: Object.freeze([text("Z")]),
          }),
        ]),
        Object.freeze({
          kind: "block-quote",
          children: Object.freeze([paragraph([text("Nested")])]),
        }),
        Object.freeze({
          kind: "list",
          ordered: false,
          items: Object.freeze([
            Object.freeze({
              children: Object.freeze([paragraph([text("Item")])]),
            }),
          ]),
        }),
      ],
      [
        "opening.anchor",
        "quote.anchor",
        "nested.anchor",
        "list.anchor",
        "item.anchor",
      ],
    );
    const secondDocument = projection(
      1,
      [paragraph([text("Second")])],
      ["second.anchor"],
    );
    const book = bookWithSpines(2);
    const budget = createEpubProcessingBudget();

    const index = createPublicationLocatorIndex(
      book,
      [secondDocument, firstDocument],
      budget,
    );

    expect(
      index.blocks.map(({ startLocator }) => ({
        spineItemIndex: startLocator.spineItemIndex,
        anchorIndex: startLocator.anchor.anchorIndex,
        value: startLocator.anchor.value,
      })),
    ).toEqual([
      { spineItemIndex: 0, anchorIndex: 0, value: "opening.anchor" },
      { spineItemIndex: 0, anchorIndex: 1, value: "quote.anchor" },
      { spineItemIndex: 0, anchorIndex: 2, value: "nested.anchor" },
      { spineItemIndex: 0, anchorIndex: 3, value: "list.anchor" },
      { spineItemIndex: 0, anchorIndex: 4, value: "item.anchor" },
      { spineItemIndex: 1, anchorIndex: 0, value: "second.anchor" },
    ]);
    expect(index.blocks.map((entry) => entry.textLengthCodePoints)).toEqual([
      7, 0, 6, 0, 4, 6,
    ]);
    for (const entry of index.blocks) {
      expect(decodeReadingLocatorV1(entry.startLocator)).toEqual(
        entry.startLocator,
      );
      expect(entry.startLocator.bookIdentity).toEqual(book.identity);
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.startLocator)).toBe(true);
    }
    expect(Object.isFrozen(index)).toBe(true);
    expect(Object.isFrozen(index.blocks)).toBe(true);
    expect(index.bookIdentity).toBe(book.identity);
    expect(Object.isFrozen(index.spines)).toBe(true);
    expect(index.spines).toHaveLength(2);
    for (const spine of index.spines) {
      expect(Object.isFrozen(spine)).toBe(true);
      expect(Object.isFrozen(spine.blocks)).toBe(true);
    }

    const repeated = createPublicationLocatorIndex(
      book,
      [firstDocument, secondDocument],
      createEpubProcessingBudget(),
    );
    expect(repeated).toEqual(index);
  });

  it("generates text-free deterministic anchors for missing, invalid, duplicate, and colliding candidates", () => {
    const sourceIds = [
      undefined,
      "voxleaf-s0-a0",
      "duplicate.anchor",
      "duplicate.anchor",
      "private canary invalid",
      "a".repeat(128),
      "b".repeat(129),
    ];
    const document = projection(
      0,
      sourceIds.map((_, index) =>
        paragraph([text(`Synthetic ${String(index)}`)]),
      ),
      sourceIds,
    );

    const index = createPublicationLocatorIndex(
      bookWithSpines(1),
      [document],
      createEpubProcessingBudget(),
    );

    expect(
      index.blocks.map((entry) => String(entry.startLocator.anchor.value)),
    ).toEqual([
      "voxleaf-s0-a0-1",
      "voxleaf-s0-a0",
      "voxleaf-s0-a2",
      "voxleaf-s0-a3",
      "voxleaf-s0-a4",
      "a".repeat(128),
      "voxleaf-s0-a6",
    ]);
    expect(JSON.stringify(index)).not.toContain("private canary invalid");
    expect(JSON.stringify(index)).not.toContain("b".repeat(129));
  });

  it("constructs legal Unicode code-point offsets and rejects invalid offsets safely", async () => {
    const index = createPublicationLocatorIndex(
      bookWithSpines(1),
      [projection(0, [paragraph([text("A😀e\u0301")])], ["unicode.anchor"])],
      createEpubProcessingBudget(),
    );
    const entry = index.blocks[0];
    if (entry === undefined) {
      throw new Error("expected located block");
    }

    expect(entry.textLengthCodePoints).toBe(4);
    expect(createBlockLocatorAtOffset(entry, 0)).toBe(entry.startLocator);
    expect(createBlockLocatorAtOffset(entry, 1).textOffsetCodePoints).toBe(1);
    expect(createBlockLocatorAtOffset(entry, 4).textOffsetCodePoints).toBe(4);
    await expectLocatorError(() => createBlockLocatorAtOffset(entry, 5));
    await expectLocatorError(() => createBlockLocatorAtOffset(entry, -1));
    await expectLocatorError(() => createBlockLocatorAtOffset(entry, 1.5));
  });

  it("fails closed when spine projections are missing, duplicated, or inconsistent", async () => {
    const book = bookWithSpines(2);
    const first = projection(
      0,
      [paragraph([text("private-canary")])],
      ["first.anchor"],
    );

    await expectInternalError(() =>
      createPublicationLocatorIndex(
        book,
        [first],
        createEpubProcessingBudget(),
      ),
    );
    await expectInternalError(() =>
      createPublicationLocatorIndex(
        bookWithSpines(1),
        [first, first],
        createEpubProcessingBudget(),
      ),
    );

    const inconsistent = Object.freeze({
      ...first,
      document: Object.freeze({
        ...first.document,
        location: Object.freeze({
          kind: "spine" as const,
          spineItemId: createSpineItemId("wrong-spine"),
          spineItemIndex: createIndex(0),
        }),
      }),
    });
    await expectInternalError(() =>
      createPublicationLocatorIndex(
        bookWithSpines(1),
        [inconsistent],
        createEpubProcessingBudget(),
      ),
    );
  });

  it("honors the shared ingestion cancellation budget without a partial index", async () => {
    const controller = new AbortController();
    controller.abort("private-canary");

    await expectFixedError(
      () =>
        createPublicationLocatorIndex(
          bookWithSpines(1),
          [projection(0, [paragraph([text("private-canary")])], [undefined])],
          createEpubProcessingBudget({ signal: controller.signal }),
        ),
      "cancelled",
    );
  });
});

function paragraph(
  children: Extract<SemanticBlock, { readonly kind: "paragraph" }>["children"],
): SemanticBlock {
  return Object.freeze({
    kind: "paragraph",
    children: Object.freeze(children),
  });
}

function text(value: string) {
  return Object.freeze({
    kind: "text" as const,
    text: value as SensitivePublicationText,
  });
}

function flattenBlocks(
  blocks: readonly SemanticBlock[],
  output: SemanticBlock[],
): void {
  for (const block of blocks) {
    output.push(block);
    if (block.kind === "block-quote") {
      flattenBlocks(block.children, output);
    } else if (block.kind === "list") {
      for (const item of block.items) {
        flattenBlocks(item.children, output);
      }
    }
  }
}

function projection(
  spineIndex: number,
  blocks: readonly SemanticBlock[],
  sourceElementIds: readonly (string | undefined)[],
): XhtmlDocumentProjection {
  const addressable: SemanticBlock[] = [];
  flattenBlocks(blocks, addressable);
  if (addressable.length !== sourceElementIds.length) {
    throw new Error("test projection source IDs must match block count");
  }
  const document = Object.freeze({
    id: `document:${String(spineIndex)}` as ContentDocumentId,
    location: Object.freeze({
      kind: "spine" as const,
      spineItemId: createSpineItemId(`spine:${String(spineIndex)}`),
      spineItemIndex: createIndex(spineIndex),
    }),
    blocks: Object.freeze([...blocks]),
  } satisfies SemanticDocument);
  return Object.freeze({
    document,
    addressableBlocks: Object.freeze(
      addressable.map((block, index) =>
        Object.freeze({
          block,
          ...(sourceElementIds[index] === undefined
            ? {}
            : { sourceElementId: sourceElementIds[index] }),
        }),
      ),
    ),
  });
}

function bookWithSpines(spineCount: number) {
  const resources = Array.from({ length: spineCount }, (_, index) => ({
    path: `chapter-${String(index)}.xhtml`,
    mediaType: "application/xhtml+xml",
    role: "content-document",
  }));
  return decodeBookV1({
    schemaVersion: 1,
    identity: {
      scheme: "sha256",
      schemeVersion: 1,
      value: "0".repeat(64),
    },
    metadata: { title: "Synthetic locator book", authors: [] },
    resources,
    spine: resources.map((resource, index) => ({
      id: `spine:${String(index)}`,
      index,
      resourcePath: resource.path,
    })),
    navigation: [],
  });
}

async function expectLocatorError(action: () => unknown): Promise<void> {
  await expectFixedError(action, "locator-unresolved");
}

async function expectInternalError(action: () => unknown): Promise<void> {
  await expectFixedError(action, "internal-failure");
}

async function expectFixedError(
  action: () => unknown,
  code: EpubArchiveError["code"],
): Promise<void> {
  let captured: unknown;
  try {
    await action();
  } catch (error: unknown) {
    captured = error;
  }
  expect(captured).toBeInstanceOf(EpubArchiveError);
  expect(captured).toMatchObject({ code, message: code });
  expect(captured).not.toHaveProperty("cause");
  expect(JSON.stringify(captured)).not.toContain("private-canary");
}
