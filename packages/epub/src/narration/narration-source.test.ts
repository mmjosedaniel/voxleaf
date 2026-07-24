import { createIndex, createSpineItemId, decodeBookV1 } from "@voxleaf/shared";
import { describe, expect, expectTypeOf, it } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  ContentDocumentId,
  RasterImageResourceId,
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
  SensitivePublicationText,
} from "../document/document-model.js";
import type { XhtmlDocumentProjection } from "../document/xhtml-projector.js";
import { createPublicationLocatorIndex } from "../locator/locator-index.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import {
  projectNarrationSource,
  type NarrationSourceEvent,
} from "./narration-source-projector.js";
import {
  createNarrationSourceTokenRange,
  mapNarrationSourceTokens,
  type NarrationSourceToken,
  type NarrationSourceTokenEvent,
  type NarrationSourceTokenLeafEvent,
} from "./narration-source.js";

const IMAGE_ID = "resource:synthetic" as RasterImageResourceId;
const DOCUMENT_ID = "document:0" as ContentDocumentId;
const OBJECT_REPLACEMENT_CHARACTER = "\ufffc";

describe("narration source tokens", () => {
  it("maps every source position to an immutable code-point span", () => {
    const sourceBlocks = Object.freeze([
      paragraph([
        text("A\u{1f642}e\u0301"),
        Object.freeze({
          kind: "emphasis",
          language: "es",
          children: Object.freeze([text("B")]),
        }),
        Object.freeze({ kind: "line-break" }),
        Object.freeze({
          kind: "raster-image",
          resourceId: IMAGE_ID,
          alternativeText:
            "private-canary-visual-only" as SensitivePublicationText,
        }),
      ]),
    ]);
    const before = JSON.stringify(sourceBlocks);
    const index = createIndexFor(sourceBlocks);

    const events = mapNarrationSourceTokens(
      projectNarrationSource(index.blocks),
    );
    const leaf = requiredLeaf(tokenLeaves(events)[0]);

    expect(leaf.sourceTokens.map(({ kind }) => kind)).toEqual([
      "text",
      "text",
      "text",
      "text",
      "text",
      "line-break",
      "raster-placeholder",
    ]);
    expect(
      leaf.sourceTokens.map(({ sourceSpan }) => [
        sourceSpan.startOffsetCodePoints,
        sourceSpan.endOffsetCodePoints,
      ]),
    ).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ]);
    expect(
      leaf.sourceTokens[1]?.kind === "text" &&
        Array.from(leaf.sourceTokens[1].text).length === 1,
    ).toBe(true);
    expect(
      leaf.sourceTokens[3]?.kind === "text" &&
        leaf.sourceTokens[3].text === "\u0301",
    ).toBe(true);
    expect(leaf.sourceTokens[4]?.textContext).toMatchObject({
      language: "es",
      inlineContainers: ["emphasis"],
    });
    expect(
      recombineTokens(leaf.sourceTokens) ===
        sourceRepresentation(sourceBlocks[0]),
    ).toBe(true);
    expect(
      JSON.stringify(leaf.sourceTokens).includes("private-canary-visual-only"),
    ).toBe(false);
    expect(JSON.stringify(sourceBlocks) === before).toBe(true);
    assertMappedFrozen(events);
  });

  it("constructs legal block-local locator endpoints through block end", () => {
    const sourceBlocks = Object.freeze([
      Object.freeze({
        kind: "heading",
        level: 2,
        children: Object.freeze([text("Hi")]),
      } as const satisfies SemanticBlock),
      paragraph([]),
      paragraph([
        Object.freeze({ kind: "line-break" }),
        Object.freeze({
          kind: "raster-image",
          resourceId: IMAGE_ID,
        }),
      ]),
    ]);
    const index = createIndexFor(sourceBlocks);
    const leaves = tokenLeaves(
      mapNarrationSourceTokens(projectNarrationSource(index.blocks)),
    );

    expect(leaves.map(({ sourceTokens }) => sourceTokens.length)).toEqual([
      2, 0, 2,
    ]);
    for (const leaf of leaves) {
      for (const token of leaf.sourceTokens) {
        const range = createNarrationSourceTokenRange(
          leaf.locatedBlock,
          token.sourceSpan,
        );
        expect(range.start.textOffsetCodePoints).toBe(
          token.sourceSpan.startOffsetCodePoints,
        );
        expect(range.end.textOffsetCodePoints).toBe(
          token.sourceSpan.endOffsetCodePoints,
        );
        expect(range.start.bookIdentity).toEqual(range.end.bookIdentity);
        expect(range.start.spineItemId).toBe(range.end.spineItemId);
        expect(range.start.anchor).toEqual(range.end.anchor);
      }
      expect(
        leaf.sourceTokens.at(-1)?.sourceSpan.endOffsetCodePoints ??
          createIndex(0),
      ).toBe(leaf.locatedBlock.textLengthCodePoints);
    }
  });

  it("preserves structural event order while resetting spans per leaf", () => {
    const nested = Object.freeze({
      kind: "block-quote",
      children: Object.freeze([
        Object.freeze({
          kind: "list",
          ordered: true,
          items: Object.freeze([
            Object.freeze({
              children: Object.freeze([paragraph([text("A")])]),
            }),
            Object.freeze({
              children: Object.freeze([paragraph([text("BC")])]),
            }),
          ]),
        }),
      ]),
    } as const satisfies SemanticBlock);
    const index = createIndexFor([nested]);
    const projected = projectNarrationSource(index.blocks);

    const mapped = mapNarrationSourceTokens(projected);

    expect(eventKinds(mapped)).toEqual(eventKinds(projected));
    expect(tokenLeaves(mapped).map(firstStartOffset)).toEqual([0, 0]);
    expect(tokenLeaves(mapped).map(lastEndOffset)).toEqual([1, 2]);
    expect(
      mapped
        .filter((event) => event.kind === "boundary")
        .every((event) => projected.includes(event)),
    ).toBe(true);
  });

  it("fails with fixed content-free errors for invalid token input or spans", async () => {
    const index = createIndexFor([
      paragraph([text("private-canary-source-token")]),
    ]);
    const projected = projectNarrationSource(index.blocks);
    const leaf = requiredProjectedLeaf(projected);
    const unit = leaf.sourceUnits[0];
    if (unit === undefined) {
      throw new Error("expected source unit");
    }
    const invalidUnit = Object.freeze({
      ...unit,
      sourceCodePoints: createIndex(unit.sourceCodePoints + 1),
    });
    const invalidLeaf = Object.freeze({
      ...leaf,
      sourceUnits: Object.freeze([invalidUnit]),
    });

    await expectInternalFailure(() => mapNarrationSourceTokens([invalidLeaf]));
    await expectInternalFailure(() =>
      createNarrationSourceTokenRange(
        leaf.locatedBlock,
        Object.freeze({
          startOffsetCodePoints: createIndex(0),
          endOffsetCodePoints: createIndex(
            leaf.locatedBlock.textLengthCodePoints + 1,
          ),
        }),
      ),
    );
  });

  it("keeps the source-token union closed at compile time", () => {
    expectTypeOf<NarrationSourceToken["kind"]>().toEqualTypeOf<
      "line-break" | "raster-placeholder" | "text"
    >();
  });
});

function text(value: string) {
  return Object.freeze({
    kind: "text" as const,
    text: value as SensitivePublicationText,
  });
}

function paragraph(children: readonly SemanticInline[]) {
  return Object.freeze({
    kind: "paragraph" as const,
    children: Object.freeze([...children]),
  });
}

function flattenBlocks(
  blocks: readonly SemanticBlock[],
  output: SemanticBlock[] = [],
): readonly SemanticBlock[] {
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
  return output;
}

function projection(blocks: readonly SemanticBlock[]): XhtmlDocumentProjection {
  const addressableBlocks = flattenBlocks(blocks);
  const document = Object.freeze({
    id: DOCUMENT_ID,
    location: Object.freeze({
      kind: "spine",
      spineItemId: createSpineItemId("spine:0"),
      spineItemIndex: createIndex(0),
    }),
    blocks: Object.freeze([...blocks]),
  } as const satisfies SemanticDocument);
  return Object.freeze({
    document,
    addressableBlocks: Object.freeze(
      addressableBlocks.map((block) => Object.freeze({ block })),
    ),
  });
}

function createIndexFor(blocks: readonly SemanticBlock[]) {
  return createPublicationLocatorIndex(
    decodeBookV1({
      schemaVersion: 1,
      identity: {
        scheme: "sha256",
        schemeVersion: 1,
        value: "0".repeat(64),
      },
      metadata: { title: "Synthetic source tokens", authors: [] },
      resources: [
        {
          path: "chapter.xhtml",
          mediaType: "application/xhtml+xml",
          role: "content-document",
        },
      ],
      spine: [
        {
          id: "spine:0",
          index: 0,
          resourcePath: "chapter.xhtml",
        },
      ],
      navigation: [],
    }),
    [projection(blocks)],
    createEpubProcessingBudget(),
  );
}

function tokenLeaves(
  events: readonly NarrationSourceTokenEvent[],
): readonly NarrationSourceTokenLeafEvent[] {
  return events.filter(
    (event): event is NarrationSourceTokenLeafEvent => event.kind === "leaf",
  );
}

function requiredLeaf(
  leaf: NarrationSourceTokenLeafEvent | undefined,
): NarrationSourceTokenLeafEvent {
  if (leaf === undefined) {
    throw new Error("expected tokenized leaf");
  }
  return leaf;
}

function requiredProjectedLeaf(events: readonly NarrationSourceEvent[]) {
  const leaf = events.find((event) => event.kind === "leaf");
  if (leaf === undefined) {
    throw new Error("expected projected leaf");
  }
  return leaf;
}

function sourceRepresentation(block: SemanticBlock | undefined): string {
  if (block === undefined) {
    throw new Error("expected source block");
  }
  if (block.kind !== "heading" && block.kind !== "paragraph") {
    throw new Error("expected narratable source block");
  }
  return inlineRepresentation(block.children);
}

function inlineRepresentation(inlines: readonly SemanticInline[]): string {
  let represented = "";
  for (const inline of inlines) {
    switch (inline.kind) {
      case "text":
        represented += inline.text;
        break;
      case "line-break":
        represented += "\n";
        break;
      case "raster-image":
        represented += OBJECT_REPLACEMENT_CHARACTER;
        break;
      case "code":
      case "emphasis":
      case "internal-link":
      case "strong":
        represented += inlineRepresentation(inline.children);
        break;
    }
  }
  return represented;
}

function recombineTokens(tokens: readonly NarrationSourceToken[]): string {
  let represented = "";
  for (const token of tokens) {
    represented +=
      token.kind === "text"
        ? token.text
        : token.kind === "line-break"
          ? "\n"
          : OBJECT_REPLACEMENT_CHARACTER;
  }
  return represented;
}

function eventKinds(
  events: readonly (NarrationSourceEvent | NarrationSourceTokenEvent)[],
): readonly string[] {
  return events.map((event) =>
    event.kind === "leaf" ? `leaf:${event.blockKind}` : event.boundary,
  );
}

function firstStartOffset(leaf: NarrationSourceTokenLeafEvent): number {
  return leaf.sourceTokens[0]?.sourceSpan.startOffsetCodePoints ?? 0;
}

function lastEndOffset(leaf: NarrationSourceTokenLeafEvent): number {
  return leaf.sourceTokens.at(-1)?.sourceSpan.endOffsetCodePoints ?? 0;
}

function assertMappedFrozen(
  events: readonly NarrationSourceTokenEvent[],
): void {
  expect(Object.isFrozen(events)).toBe(true);
  for (const event of events) {
    expect(Object.isFrozen(event)).toBe(true);
    if (event.kind === "leaf") {
      expect(Object.isFrozen(event.sourceTokens)).toBe(true);
      for (const token of event.sourceTokens) {
        expect(Object.isFrozen(token)).toBe(true);
        expect(Object.isFrozen(token.sourceSpan)).toBe(true);
      }
    }
  }
}

async function expectInternalFailure(action: () => unknown): Promise<void> {
  let captured: unknown;
  try {
    await action();
  } catch (error: unknown) {
    captured = error;
  }
  expect(captured).toBeInstanceOf(EpubArchiveError);
  expect(captured).toMatchObject({
    code: "internal-failure",
    message: "internal-failure",
  });
  expect(captured).not.toHaveProperty("cause");
  expect(JSON.stringify(captured).includes("private-canary")).toBe(false);
}
