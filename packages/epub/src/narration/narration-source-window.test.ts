import {
  createIndex,
  decodeBookV1,
  decodeReadingLocatorV1,
} from "@voxleaf/shared";
import { describe, expect, it, vi } from "vitest";

import { NARRATION_PREPARATION_PROFILE_V1 } from "../../test-support/narration-preparation-limits.js";
import type {
  ContentDocumentId,
  PublicationLocatedBlock,
  SemanticBlock,
  SemanticInline,
  SensitivePublicationText,
} from "../document/document-model.js";
import {
  createBlockLocatorAtOffset,
  type LocatedSpineItem,
  type PublicationLocatorIndex,
} from "../locator/locator-index.js";
import { NARRATION_V1_SOURCE_WINDOW_POLICY } from "./narration-policy.js";
import {
  prepareNarrationSourceWindow,
  type NarrationSourceWindowLeafEvent,
} from "./narration-source-window.js";

describe("bounded narration source windows", () => {
  it("uses the accepted narration-v1 source and work limits", () => {
    const accepted = NARRATION_PREPARATION_PROFILE_V1.limits;
    expect(NARRATION_V1_SOURCE_WINDOW_POLICY).toMatchObject({
      sourceCodePointsInspectedTarget:
        accepted.sourceCodePointsInspectedPerRequest.target,
      sourceCodePointsInspectedHardMaximum:
        accepted.sourceCodePointsInspectedPerRequest.hardMaximum,
      workUnitsBetweenCheckpointsTarget:
        accepted.workUnitsBetweenCheckpoints.target,
      workUnitsBetweenCheckpointsHardMaximum:
        accepted.workUnitsBetweenCheckpoints.hardMaximum,
      workUnitsBetweenYieldsTarget: accepted.workUnitsBetweenYields.target,
      workUnitsBetweenYieldsHardMaximum:
        accepted.workUnitsBetweenYields.hardMaximum,
      traversalDepthHardMaximum: accepted.traversalDepth.hardMaximum,
      retainedTokenEntriesHardMaximum: accepted.retainedTokens.hardMaximum,
    });
  });

  it("normalizes exact and recovered starts without searching source text", async () => {
    const fixture = createFixture();
    const heading = requiredBlock(fixture.index.blocks[0]);
    const quote = requiredBlock(fixture.index.blocks[1]);
    const quotedParagraph = requiredBlock(fixture.index.blocks[2]);
    const followingParagraph = requiredBlock(fixture.index.blocks[3]);
    const finalParagraph = requiredBlock(fixture.index.blocks[4]);

    const exactStart = await prepareNarrationSourceWindow(fixture.index, {
      startLocator: heading.startLocator,
    });
    expect(exactStart.status).toBe("complete");
    if (exactStart.status !== "complete") {
      throw new Error("expected complete source window");
    }
    expect(exactStart.start).toMatchObject({
      canonicalLocator: heading.startLocator,
      resolutionStatus: "exact",
      resolutionReason: "exact",
      sourceRelation: "at-source-start",
    });

    const recoveredInput = decodeReadingLocatorV1({
      ...quotedParagraph.startLocator,
      textOffsetCodePoints: 99,
    });
    const recovered = await prepareNarrationSourceWindow(fixture.index, {
      startLocator: recoveredInput,
    });
    expect(recovered.status).toBe("complete");
    if (recovered.status !== "complete") {
      throw new Error("expected recovered source window");
    }
    expect(recovered.start).toMatchObject({
      resolutionStatus: "recovered",
      resolutionReason: "nearest-offset",
      sourceRelation: "before-next-source",
    });
    expect(recovered.start.canonicalLocator).toEqual(
      createBlockLocatorAtOffset(
        quotedParagraph,
        quotedParagraph.textLengthCodePoints,
      ),
    );
    expect(firstLeaf(recovered.events).locatedBlock).toBe(followingParagraph);

    const structural = await prepareNarrationSourceWindow(fixture.index, {
      startLocator: quote.startLocator,
    });
    expect(structural.status).toBe("complete");
    if (structural.status !== "complete") {
      throw new Error("expected structural source window");
    }
    expect(structural.start.sourceRelation).toBe("before-next-source");
    expect(firstLeaf(structural.events).locatedBlock).toBe(quotedParagraph);

    const spineEnd = await prepareNarrationSourceWindow(fixture.index, {
      startLocator: createBlockLocatorAtOffset(
        followingParagraph,
        followingParagraph.textLengthCodePoints,
      ),
    });
    expect(spineEnd.status).toBe("complete");
    if (spineEnd.status !== "complete") {
      throw new Error("expected cross-spine source window");
    }
    expect(firstLeaf(spineEnd.events).locatedBlock).toBe(finalParagraph);

    const publicationEnd = await prepareNarrationSourceWindow(fixture.index, {
      startLocator: createBlockLocatorAtOffset(
        finalParagraph,
        finalParagraph.textLengthCodePoints,
      ),
    });
    expect(publicationEnd).toMatchObject({
      status: "complete",
      start: { sourceRelation: "publication-end" },
      events: [],
      measurements: {
        sourceCodePointsInspected: 0,
        retainedTokenCount: 0,
      },
    });
  });

  it("starts at a Unicode code-point offset and preserves inherited context", async () => {
    const fixture = createFixture();
    const quotedParagraph = requiredBlock(fixture.index.blocks[2]);
    const start = createBlockLocatorAtOffset(quotedParagraph, 1);

    const result = await prepareNarrationSourceWindow(fixture.index, {
      startLocator: start,
    });

    expect(result.status).toBe("complete");
    if (result.status !== "complete") {
      throw new Error("expected complete source window");
    }
    expect(result.start).toMatchObject({
      canonicalLocator: start,
      sourceRelation: "inside-source",
    });
    const leaf = firstLeaf(result.events);
    expect(leaf).toMatchObject({
      locatedBlock: quotedParagraph,
      sourceStartOffsetCodePoints: 1,
      sourceEndOffsetCodePoints: 3,
      structuralContext: { quoteDepth: 1 },
      textContext: { language: "es" },
    });
    expect(
      leaf.sourceTokens.map((token) =>
        token.kind === "text" ? String(token.text) : token.kind,
      ),
    ).toEqual(["🙂", "B"]);
    expect(leaf.sourceTokens.map((token) => token.sourceSpan)).toEqual([
      { startOffsetCodePoints: 1, endOffsetCodePoints: 2 },
      { startOffsetCodePoints: 2, endOffsetCodePoints: 3 },
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.events)).toBe(true);
    expect(Object.isFrozen(leaf)).toBe(true);
    expect(Object.isFrozen(leaf.sourceTokens)).toBe(true);
  });

  it("publishes a monotonic continuation without repeating the final token", async () => {
    const maximum =
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum;
    const fixture = createFlatFixture([
      paragraph(repeatCodePoint("a", maximum + 1)),
    ]);
    const block = requiredBlock(fixture.index.blocks[0]);

    const first = await prepareNarrationSourceWindow(fixture.index, {
      startLocator: block.startLocator,
    });
    expect(first.status).toBe("window");
    if (first.status !== "window") {
      throw new Error("expected bounded source window");
    }
    expect(first.measurements).toMatchObject({
      sourceCodePointsInspected: maximum,
      retainedTokenCount: maximum,
    });
    expect(first.continuation).toEqual(
      createBlockLocatorAtOffset(block, maximum),
    );
    const firstLeafEvent = firstLeaf(first.events);
    expect(firstLeafEvent.sourceStartOffsetCodePoints).toBe(0);
    expect(firstLeafEvent.sourceEndOffsetCodePoints).toBe(maximum);

    const second = await prepareNarrationSourceWindow(fixture.index, {
      startLocator: first.continuation,
    });
    expect(second.status).toBe("complete");
    if (second.status !== "complete") {
      throw new Error("expected terminal source window");
    }
    const secondLeafEvent = firstLeaf(second.events);
    expect(secondLeafEvent.sourceStartOffsetCodePoints).toBe(maximum);
    expect(secondLeafEvent.sourceEndOffsetCodePoints).toBe(maximum + 1);
    expect(second.measurements.retainedTokenCount).toBe(1);
  });

  it("returns content-free failures and discards partial work", async () => {
    const fixture = createFixture();
    const wrongBook = decodeReadingLocatorV1({
      ...requiredBlock(fixture.index.blocks[0]).startLocator,
      bookIdentity: {
        ...fixture.index.bookIdentity,
        value: "1".repeat(64),
      },
    });

    await expect(
      prepareNarrationSourceWindow(fixture.index, { startLocator: {} }),
    ).resolves.toEqual({ status: "invalid-start" });
    await expect(
      prepareNarrationSourceWindow(fixture.index, {
        startLocator: wrongBook,
      }),
    ).resolves.toEqual({ status: "invalid-start" });

    const controller = new AbortController();
    controller.abort("private-canary");
    const preAborted = await prepareNarrationSourceWindow(fixture.index, {
      startLocator: requiredBlock(fixture.index.blocks[0]).startLocator,
      signal: controller.signal,
    });
    expect(preAborted).toEqual({ status: "cancelled" });
    expect(JSON.stringify(preAborted)).not.toContain("private-canary");

    const large = createFlatFixture([paragraph(repeatCodePoint("x", 5_000))]);
    const midWorkController = new AbortController();
    const scheduler = vi.fn(async () => {
      midWorkController.abort("private-canary");
    });
    const midWork = await prepareNarrationSourceWindow(
      large.index,
      {
        startLocator: requiredBlock(large.index.blocks[0]).startLocator,
        signal: midWorkController.signal,
      },
      scheduler,
    );
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(midWork).toEqual({ status: "cancelled" });
    expect(JSON.stringify(midWork)).not.toContain("private-canary");

    const structuralPressure = createFlatFixture(
      Array.from(
        {
          length:
            NARRATION_V1_SOURCE_WINDOW_POLICY.retainedEventEntriesHardMaximum +
            1,
        },
        () => list([]),
      ),
    );
    const limited = await prepareNarrationSourceWindow(
      structuralPressure.index,
      {
        startLocator: requiredBlock(structuralPressure.index.blocks[0])
          .startLocator,
      },
      async () => undefined,
    );
    expect(limited).toEqual({ status: "resource-limit-exceeded" });
  });

  it("allows the exact traversal depth and rejects max-plus-one", async () => {
    const maximum = NARRATION_V1_SOURCE_WINDOW_POLICY.traversalDepthHardMaximum;
    const exact = createFlatFixture([nestedQuotes(maximum, paragraph("x"))]);
    await expect(
      prepareNarrationSourceWindow(
        exact.index,
        {
          startLocator: requiredBlock(exact.index.blocks[0]).startLocator,
        },
        async () => undefined,
      ),
    ).resolves.toMatchObject({ status: "complete" });

    const exceeded = createFlatFixture([
      nestedQuotes(maximum + 1, paragraph("x")),
    ]);
    await expect(
      prepareNarrationSourceWindow(
        exceeded.index,
        {
          startLocator: requiredBlock(exceeded.index.blocks[0]).startLocator,
        },
        async () => undefined,
      ),
    ).resolves.toEqual({ status: "resource-limit-exceeded" });
  });

  it("counts skipped source positions at the exact request maximum", async () => {
    const maximum =
      NARRATION_V1_SOURCE_WINDOW_POLICY.sourceCodePointsInspectedHardMaximum;
    const exact = createFlatFixture([paragraph(repeatCodePoint("x", maximum))]);
    const exactBlock = requiredBlock(exact.index.blocks[0]);
    const exactResult = await prepareNarrationSourceWindow(
      exact.index,
      {
        startLocator: createBlockLocatorAtOffset(exactBlock, maximum - 1),
      },
      async () => undefined,
    );
    expect(exactResult).toMatchObject({
      status: "complete",
      measurements: {
        sourceCodePointsInspected: maximum,
        retainedTokenCount: 1,
      },
    });

    const exceeded = createFlatFixture([
      paragraph(repeatCodePoint("x", maximum + 1)),
    ]);
    const exceededBlock = requiredBlock(exceeded.index.blocks[0]);
    await expect(
      prepareNarrationSourceWindow(
        exceeded.index,
        {
          startLocator: createBlockLocatorAtOffset(exceededBlock, maximum),
        },
        async () => undefined,
      ),
    ).resolves.toEqual({ status: "resource-limit-exceeded" });
  });
});

function firstLeaf(
  events: readonly {
    readonly kind: "boundary" | "leaf";
  }[],
): NarrationSourceWindowLeafEvent {
  const leaf = events.find(
    (event): event is NarrationSourceWindowLeafEvent => event.kind === "leaf",
  );
  if (leaf === undefined) {
    throw new Error("expected source leaf");
  }
  return leaf;
}

function repeatCodePoint(value: string, count: number): string {
  return Array.from({ length: count }, () => value).join("");
}

function text(value: string): SemanticInline {
  return Object.freeze({
    kind: "text",
    text: value as SensitivePublicationText,
  });
}

function paragraph(value: string): SemanticBlock {
  return Object.freeze({
    kind: "paragraph",
    children: Object.freeze([text(value)]),
  });
}

function list(children: readonly SemanticBlock[]): SemanticBlock {
  return Object.freeze({
    kind: "list",
    ordered: false,
    items: Object.freeze(
      children.length === 0
        ? []
        : [Object.freeze({ children: Object.freeze([...children]) })],
    ),
  });
}

function nestedQuotes(depth: number, leaf: SemanticBlock): SemanticBlock {
  let block = leaf;
  for (let index = 0; index < depth; index += 1) {
    block = Object.freeze({
      kind: "block-quote",
      children: Object.freeze([block]),
    });
  }
  return block;
}

function createFixture(): Readonly<{ index: PublicationLocatorIndex }> {
  const quotedParagraph = Object.freeze({
    ...paragraph("A🙂B"),
    language: "es",
  }) as SemanticBlock;
  const quote = Object.freeze({
    kind: "block-quote",
    language: "es",
    children: Object.freeze([quotedParagraph]),
  }) as SemanticBlock;
  return createFixtureFromSpines([
    Object.freeze([
      Object.freeze({
        kind: "heading",
        level: 1,
        children: Object.freeze([text("Intro")]),
      }) as SemanticBlock,
      quote,
      paragraph("Next"),
    ]),
    Object.freeze([paragraph("Final")]),
  ]);
}

function createFlatFixture(
  blocks: readonly SemanticBlock[],
): Readonly<{ index: PublicationLocatorIndex }> {
  return createFixtureFromSpines([Object.freeze([...blocks])]);
}

function createFixtureFromSpines(
  rootsBySpine: readonly (readonly SemanticBlock[])[],
): Readonly<{ index: PublicationLocatorIndex }> {
  const resources = rootsBySpine.map((_, index) => ({
    path: `EPUB/chapter-${String(index)}.xhtml`,
    mediaType: "application/xhtml+xml",
    role: "content-document" as const,
  }));
  const book = decodeBookV1({
    schemaVersion: 1,
    identity: {
      scheme: "sha-256",
      schemeVersion: 1,
      value: "0".repeat(64),
    },
    metadata: { title: "Synthetic", authors: [] },
    resources,
    spine: resources.map((resource, index) => ({
      id: `spine:${String(index)}`,
      index,
      resourcePath: resource.path,
    })),
    navigation: [],
  });

  const spines: LocatedSpineItem[] = [];
  const allBlocks: PublicationLocatedBlock[] = [];
  for (const [spineIndex, roots] of rootsBySpine.entries()) {
    const spine = book.spine[spineIndex];
    if (spine === undefined) {
      throw new Error("expected synthetic spine");
    }
    const flat = flattenBlocks(roots);
    const located = flat.map((block, anchorIndex) => {
      const startLocator = decodeReadingLocatorV1({
        schemaVersion: 1,
        bookIdentity: book.identity,
        spineItemId: spine.id,
        spineItemIndex: spine.index,
        anchor: {
          kind: "element-id",
          formatVersion: 1,
          value: `voxleaf-s${String(spineIndex)}-a${String(anchorIndex)}`,
          anchorIndex,
        },
        textOffsetCodePoints: 0,
      });
      return Object.freeze({
        documentId: `document:${String(spineIndex)}` as ContentDocumentId,
        block,
        startLocator,
        textLengthCodePoints: createIndex(blockLength(block)),
      });
    });
    const frozenLocated = Object.freeze(located);
    spines.push(
      Object.freeze({
        spineItemId: spine.id,
        spineItemIndex: spine.index,
        blocks: frozenLocated,
      }),
    );
    allBlocks.push(...frozenLocated);
  }

  return Object.freeze({
    index: Object.freeze({
      bookIdentity: book.identity,
      spines: Object.freeze(spines),
      blocks: Object.freeze(allBlocks),
    }),
  });
}

function flattenBlocks(roots: readonly SemanticBlock[]): SemanticBlock[] {
  const result: SemanticBlock[] = [];
  const tasks = [...roots].reverse();
  while (tasks.length > 0) {
    const block = tasks.pop();
    if (block === undefined) {
      throw new Error("expected semantic block");
    }
    result.push(block);
    if (block.kind === "block-quote") {
      tasks.push(...[...block.children].reverse());
    } else if (block.kind === "list") {
      for (let index = block.items.length - 1; index >= 0; index -= 1) {
        const item = block.items[index];
        if (item === undefined) {
          throw new Error("expected list item");
        }
        tasks.push(...[...item.children].reverse());
      }
    }
  }
  return result;
}

function blockLength(block: SemanticBlock): number {
  if (block.kind !== "heading" && block.kind !== "paragraph") {
    return 0;
  }
  return inlineLength(block.children);
}

function inlineLength(children: readonly SemanticInline[]): number {
  let length = 0;
  const tasks = [...children].reverse();
  while (tasks.length > 0) {
    const inline = tasks.pop();
    if (inline === undefined) {
      throw new Error("expected semantic inline");
    }
    switch (inline.kind) {
      case "code":
      case "emphasis":
      case "internal-link":
      case "strong":
        tasks.push(...[...inline.children].reverse());
        break;
      case "line-break":
      case "raster-image":
        length += 1;
        break;
      case "text":
        for (const codePoint of String(inline.text)) {
          void codePoint;
          length += 1;
        }
        break;
    }
  }
  return length;
}

function requiredBlock(
  block: PublicationLocatedBlock | undefined,
): PublicationLocatedBlock {
  if (block === undefined) {
    throw new Error("expected located block");
  }
  return block;
}
