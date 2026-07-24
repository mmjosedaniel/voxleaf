import { createIndex, createSpineItemId, decodeBookV1 } from "@voxleaf/shared";
import { describe, expect, expectTypeOf, it } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  ContentDocumentId,
  PublicationLocatedBlock,
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
  type NarrationSourceLeafEvent,
} from "./narration-source-projector.js";

const IMAGE_ID = "resource:synthetic" as RasterImageResourceId;
const DOCUMENT_ID = "document:0" as ContentDocumentId;

describe("narration source projection", () => {
  it("walks every semantic variant in locator order with inherited context", () => {
    const heading = Object.freeze({
      kind: "heading",
      level: 2,
      language: "es",
      direction: "ltr",
      children: Object.freeze([
        text("A\u{1f600}"),
        Object.freeze({
          kind: "emphasis",
          children: Object.freeze([
            Object.freeze({
              kind: "strong",
              children: Object.freeze([text("B")]),
            }),
          ]),
        }),
        Object.freeze({
          kind: "internal-link",
          language: "es-MX",
          target: Object.freeze({ documentId: DOCUMENT_ID }),
          children: Object.freeze([
            Object.freeze({
              kind: "code",
              direction: "rtl",
              children: Object.freeze([text(" C ")]),
            }),
          ]),
        }),
        Object.freeze({ kind: "line-break" }),
        Object.freeze({
          kind: "raster-image",
          resourceId: IMAGE_ID,
          alternativeText:
            "private-canary-alternative" as SensitivePublicationText,
        }),
      ]),
    } as const satisfies SemanticBlock);
    const firstItem = paragraph([text("Uno")]);
    const secondItem = Object.freeze({
      kind: "heading",
      level: 3,
      children: Object.freeze([]),
    } as const satisfies SemanticBlock);
    const list = Object.freeze({
      kind: "list",
      ordered: true,
      items: Object.freeze([
        Object.freeze({ children: Object.freeze([firstItem]) }),
        Object.freeze({ children: Object.freeze([secondItem]) }),
      ]),
    } as const satisfies SemanticBlock);
    const quote = Object.freeze({
      kind: "block-quote",
      language: "es",
      children: Object.freeze([list]),
    } as const satisfies SemanticBlock);
    const rasterOnly = paragraph([
      Object.freeze({
        kind: "raster-image",
        resourceId: IMAGE_ID,
        alternativeText:
          "private-canary-visual-only" as SensitivePublicationText,
      }),
    ]);
    const sourceBlocks = Object.freeze([heading, quote, rasterOnly]);
    const index = createIndexFor(sourceBlocks);
    const before = JSON.stringify(sourceBlocks);

    const events = projectNarrationSource(index.blocks);

    expect(eventKinds(events)).toEqual([
      "leaf:heading",
      "block-quote-start",
      "list-start",
      "list-item-start",
      "leaf:paragraph",
      "list-item-end",
      "list-item-start",
      "leaf:heading",
      "list-item-end",
      "list-end",
      "block-quote-end",
      "leaf:paragraph",
    ]);
    const leaves = leafEvents(events);
    expect(leaves).toHaveLength(4);
    expect(leaves[0]?.locatedBlock).toBe(index.blocks[0]);
    expect(leaves[1]?.locatedBlock).toBe(index.blocks[3]);
    expect(leaves[2]?.locatedBlock).toBe(index.blocks[4]);
    expect(leaves[3]?.locatedBlock).toBe(index.blocks[5]);

    const projectedHeading = requiredLeaf(leaves[0]);
    expect(projectedHeading.blockKind).toBe("heading");
    if (projectedHeading.blockKind !== "heading") {
      throw new Error("expected heading projection");
    }
    expect(projectedHeading.headingLevel).toBe(2);
    expect(projectedHeading.sourceUnits.map(({ kind }) => kind)).toEqual([
      "text",
      "text",
      "text",
      "line-break",
      "raster-placeholder",
    ]);
    expect(projectedHeading.sourceUnits[0]?.sourceCodePoints).toBe(2);
    expect(
      projectedHeading.sourceUnits[1]?.textContext.inlineContainers,
    ).toEqual(["emphasis", "strong"]);
    expect(
      projectedHeading.sourceUnits[2]?.textContext.inlineContainers,
    ).toEqual(["internal-link", "code"]);
    expect(projectedHeading.sourceUnits[2]?.textContext).toMatchObject({
      language: "es-MX",
      direction: "rtl",
    });
    expect(projectedHeading.textContext).toMatchObject({
      language: "es",
      direction: "ltr",
    });

    const quotedParagraph = requiredLeaf(leaves[1]);
    expect(quotedParagraph.structuralContext).toEqual({
      quoteDepth: 1,
      listPath: [{ ordered: true, itemIndex: 0 }],
    });
    expect(quotedParagraph.textContext.language).toBe("es");
    expect(requiredLeaf(leaves[2]).structuralContext.listPath).toEqual([
      { ordered: true, itemIndex: 1 },
    ]);
    expect(requiredLeaf(leaves[3]).structuralContext).toEqual({
      quoteDepth: 0,
      listPath: [],
    });

    const rasterUnit = requiredLeaf(leaves[3]).sourceUnits[0];
    expect(rasterUnit).toMatchObject({
      kind: "raster-placeholder",
      sourceCodePoints: 1,
    });
    expect(rasterUnit).not.toHaveProperty("resourceId");
    expect(rasterUnit).not.toHaveProperty("alternativeText");
    expect(JSON.stringify(rasterUnit)).not.toContain("private-canary");

    assertProjectionFrozen(events);
    expect(JSON.stringify(sourceBlocks)).toBe(before);
    expect(index.blocks.map(({ block }) => block)).toEqual(
      flattenBlocks(sourceBlocks),
    );
  });

  it("keeps empty and unspoken leaves while omitting zero-length text units", () => {
    const empty = paragraph([]);
    const unspoken = paragraph([
      text(""),
      Object.freeze({
        kind: "raster-image",
        language: "und",
        direction: "auto",
        resourceId: IMAGE_ID,
        alternativeText:
          "private-canary-must-not-be-spoken" as SensitivePublicationText,
      }),
    ]);
    const lineBreakOnly = paragraph([Object.freeze({ kind: "line-break" })]);
    const index = createIndexFor([empty, unspoken, lineBreakOnly]);

    const leaves = leafEvents(projectNarrationSource(index.blocks));

    expect(leaves.map(({ sourceCodePoints }) => sourceCodePoints)).toEqual([
      0, 1, 1,
    ]);
    expect(leaves[0]?.sourceUnits).toEqual([]);
    expect(leaves[1]?.sourceUnits.map(({ kind }) => kind)).toEqual([
      "raster-placeholder",
    ]);
    expect(leaves[2]?.sourceUnits.map(({ kind }) => kind)).toEqual([
      "line-break",
    ]);
  });

  it("matches locator-index Unicode code-point lengths for every leaf", () => {
    const unicode = paragraph([
      text("A\u{1f642}e\u0301"),
      Object.freeze({
        kind: "emphasis",
        children: Object.freeze([text("\u{1d11e}")]),
      }),
      Object.freeze({ kind: "line-break" }),
      Object.freeze({
        kind: "raster-image",
        resourceId: IMAGE_ID,
      }),
    ]);
    const nested = Object.freeze({
      kind: "block-quote",
      children: Object.freeze([
        Object.freeze({
          kind: "list",
          ordered: false,
          items: Object.freeze([
            Object.freeze({
              children: Object.freeze([paragraph([text("Nested")])]),
            }),
          ]),
        }),
      ]),
    } as const satisfies SemanticBlock);
    const index = createIndexFor([unicode, nested]);

    const leaves = leafEvents(projectNarrationSource(index.blocks));

    expect(leaves.map(({ sourceCodePoints }) => sourceCodePoints)).toEqual([
      7, 6,
    ]);
    for (const leaf of leaves) {
      expect(
        leaf.sourceUnits.reduce(
          (total, unit) => total + unit.sourceCodePoints,
          0,
        ),
      ).toBe(leaf.locatedBlock.textLengthCodePoints);
      expect(leaf.sourceCodePoints).toBe(
        leaf.locatedBlock.textLengthCodePoints,
      );
    }
  });

  it("fails with a fixed content-free error for order or length drift", async () => {
    const child = paragraph([text("private-canary-source")]);
    const quote = Object.freeze({
      kind: "block-quote",
      children: Object.freeze([child]),
    } as const satisfies SemanticBlock);
    const index = createIndexFor([quote]);
    const first = requiredLocated(index.blocks[0]);
    const second = requiredLocated(index.blocks[1]);
    const wrongLength = Object.freeze({
      ...second,
      textLengthCodePoints: createIndex(second.textLengthCodePoints + 1),
    });

    await expectInternalFailure(() =>
      projectNarrationSource([first, wrongLength]),
    );
    await expectInternalFailure(() => projectNarrationSource([second, first]));
    await expectInternalFailure(() =>
      projectNarrationSource([
        Object.freeze({
          ...first,
          textLengthCodePoints: createIndex(1),
        }),
        second,
      ]),
    );
  });

  it("keeps both semantic unions closed at compile time", () => {
    expectTypeOf<SemanticBlock["kind"]>().toEqualTypeOf<
      "block-quote" | "heading" | "list" | "paragraph"
    >();
    expectTypeOf<SemanticInline["kind"]>().toEqualTypeOf<
      | "code"
      | "emphasis"
      | "internal-link"
      | "line-break"
      | "raster-image"
      | "strong"
      | "text"
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
    book(),
    [projection(blocks)],
    createEpubProcessingBudget(),
  );
}

function book() {
  return decodeBookV1({
    schemaVersion: 1,
    identity: {
      scheme: "sha256",
      schemeVersion: 1,
      value: "0".repeat(64),
    },
    metadata: { title: "Synthetic source projection", authors: [] },
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
  });
}

function eventKinds(
  events: readonly NarrationSourceEvent[],
): readonly string[] {
  return events.map((event) =>
    event.kind === "leaf" ? `leaf:${event.blockKind}` : event.boundary,
  );
}

function leafEvents(
  events: readonly NarrationSourceEvent[],
): readonly NarrationSourceLeafEvent[] {
  return events.filter(
    (event): event is NarrationSourceLeafEvent => event.kind === "leaf",
  );
}

function requiredLeaf(
  leaf: NarrationSourceLeafEvent | undefined,
): NarrationSourceLeafEvent {
  if (leaf === undefined) {
    throw new Error("expected narration source leaf");
  }
  return leaf;
}

function requiredLocated(
  located: PublicationLocatedBlock | undefined,
): PublicationLocatedBlock {
  if (located === undefined) {
    throw new Error("expected located block");
  }
  return located;
}

function assertProjectionFrozen(events: readonly NarrationSourceEvent[]): void {
  expect(Object.isFrozen(events)).toBe(true);
  for (const event of events) {
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.locatedBlock)).toBe(true);
    expect(Object.isFrozen(event.locatedBlock.block)).toBe(true);
    expect(Object.isFrozen(event.structuralContext)).toBe(true);
    expect(Object.isFrozen(event.structuralContext.listPath)).toBe(true);
    for (const list of event.structuralContext.listPath) {
      expect(Object.isFrozen(list)).toBe(true);
    }
    if (event.kind === "leaf") {
      expect(Object.isFrozen(event.sourceUnits)).toBe(true);
      expect(Object.isFrozen(event.textContext)).toBe(true);
      expect(Object.isFrozen(event.textContext.inlineContainers)).toBe(true);
      for (const unit of event.sourceUnits) {
        expect(Object.isFrozen(unit)).toBe(true);
        expect(Object.isFrozen(unit.textContext)).toBe(true);
        expect(Object.isFrozen(unit.textContext.inlineContainers)).toBe(true);
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
  expect(JSON.stringify(captured)).not.toContain("private-canary");
}
