import {
  createIndex,
  createSpineItemId,
  decodeBookV1,
  decodeNarrationSegmentV1,
} from "@voxleaf/shared";
import { describe, expect, expectTypeOf, it } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  ContentDocumentId,
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
  SensitivePublicationText,
} from "../document/document-model.js";
import type { XhtmlDocumentProjection } from "../document/xhtml-projector.js";
import {
  createPublicationLocatorIndex,
  type PublicationLocatorIndex,
} from "../locator/locator-index.js";
import { resolvePublicationLocator } from "../locator/locator-resolver.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import {
  prepareNarrationSourceLeaf,
  type NarrationBoundaryReason,
  type PreparedNarrationBlock,
  type PreparedNarrationSegment,
} from "./narration-prepared-segment.js";
import { projectNarrationSource } from "./narration-source-projector.js";
import {
  mapNarrationSourceTokens,
  type NarrationSourceTokenLeafEvent,
} from "./narration-source.js";

const DOCUMENT_ID = "document:prepared-segment" as ContentDocumentId;

describe("canonical prepared narration segments", () => {
  it("emits deeply frozen sensitive text, exact half-open ranges, metadata, and continuation", async () => {
    const fixture = narrationFixture([
      heading("Apertura"),
      paragraph("Hola, mundo."),
    ]);
    const leaf = requiredLeaf(fixture.leaves[1]);
    const prepared = await prepareNarrationSourceLeaf(leaf, "es");
    const segment = requiredSegment(prepared.segments[0]);

    expect(prepared.complete).toBe(true);
    expect(prepared.disposition).toBe("spoken");
    expect(segment).toEqual({
      text: "Hola, mundo.",
      sourceRange: {
        schemaVersion: 1,
        start: leaf.locatedBlock.startLocator,
        end: {
          ...leaf.locatedBlock.startLocator,
          textOffsetCodePoints: 12,
        },
      },
      boundaryReason: "paragraph",
      measurements: {
        sourceCodePoints: 12,
        narrationCodePoints: 12,
        narrationUtf8Bytes: 12,
        sentenceCount: 1,
      },
    });
    expect(prepared.continuation).toEqual(segment.sourceRange.end);
    assertExactEndpoint(fixture.index, leaf, segment.sourceRange.start);
    assertExactEndpoint(fixture.index, leaf, segment.sourceRange.end);
    assertDeepFrozen(prepared);
  });

  it("keeps canonical ranges monotonic, non-overlapping, block-local, and repeat-stable", async () => {
    const source = Array.from(
      { length: 10 },
      (_, index) => `${String.fromCharCode(97 + index).repeat(99)}.`,
    ).join(" ");
    const fixture = narrationFixture([paragraph(source)]);
    const leaf = requiredLeaf(fixture.leaves[0]);

    const first = await prepareNarrationSourceLeaf(leaf, "und");
    const repeated = await prepareNarrationSourceLeaf(leaf, "und");

    expect(first).toEqual(repeated);
    expect(first.segments.length).toBeGreaterThan(1);
    let previousEnd = 0;
    for (const segment of first.segments) {
      const { start, end } = segment.sourceRange;
      expect(start.textOffsetCodePoints).toBeGreaterThanOrEqual(previousEnd);
      expect(end.textOffsetCodePoints).toBeGreaterThan(
        start.textOffsetCodePoints,
      );
      expect(start.bookIdentity).toEqual(
        leaf.locatedBlock.startLocator.bookIdentity,
      );
      expect(start.spineItemId).toBe(
        leaf.locatedBlock.startLocator.spineItemId,
      );
      expect(start.anchor).toEqual(leaf.locatedBlock.startLocator.anchor);
      expect(end.bookIdentity).toEqual(start.bookIdentity);
      expect(end.spineItemId).toBe(start.spineItemId);
      expect(end.anchor).toEqual(start.anchor);
      assertExactEndpoint(fixture.index, leaf, start);
      assertExactEndpoint(fixture.index, leaf, end);
      previousEnd = end.textOffsetCodePoints;
    }
    expect(first.continuation.textOffsetCodePoints).toBe(previousEnd);
  });

  it("returns canonical continuation and completion state for partial and unspoken blocks", async () => {
    const partialFixture = narrationFixture([
      paragraph(Array.from({ length: 60 }, () => "a.").join(" ")),
    ]);
    const partialLeaf = requiredLeaf(partialFixture.leaves[0]);
    const partial = await prepareNarrationSourceLeaf(partialLeaf, "und");
    const finalPartialSegment = requiredSegment(
      partial.segments[partial.segments.length - 1],
    );

    expect(partial.complete).toBe(false);
    expect(partial.segments).toHaveLength(17);
    expect(partial.continuation).toEqual(finalPartialSegment.sourceRange.end);
    expect(partial.continuation.textOffsetCodePoints).toBeLessThan(
      partialLeaf.locatedBlock.textLengthCodePoints,
    );
    assertExactEndpoint(
      partialFixture.index,
      partialLeaf,
      partial.continuation,
    );

    const sceneFixture = narrationFixture([paragraph("* * *")]);
    const sceneLeaf = requiredLeaf(sceneFixture.leaves[0]);
    const scene = await prepareNarrationSourceLeaf(sceneLeaf, "und");

    expect(scene.complete).toBe(true);
    expect(scene.disposition).toBe("scene-break");
    expect(scene.segments).toEqual([]);
    expect(scene.continuation.textOffsetCodePoints).toBe(
      sceneLeaf.locatedBlock.textLengthCodePoints,
    );
    assertExactEndpoint(sceneFixture.index, sceneLeaf, scene.continuation);
  });

  it("wraps prepared output in NarrationSegmentV1 using only test-owned work identities", async () => {
    const fixture = narrationFixture([paragraph("Una frase. Otra frase.")]);
    const leaf = requiredLeaf(fixture.leaves[0]);
    const prepared = await prepareNarrationSourceLeaf(leaf, "es");

    for (const [sequence, segment] of prepared.segments.entries()) {
      expect(Object.keys(segment).sort()).toEqual(
        ["boundaryReason", "measurements", "sourceRange", "text"].sort(),
      );
      for (const forbidden of [
        "segmentId",
        "sessionId",
        "generationId",
        "sequence",
      ]) {
        expect(segment).not.toHaveProperty(forbidden);
      }

      const wrapped = decodeNarrationSegmentV1({
        schemaVersion: 1,
        segmentId: `segment:prepared-test-${String(sequence)}`,
        bookIdentity: segment.sourceRange.start.bookIdentity,
        sessionId: "session:prepared-test",
        generationId: "generation:prepared-test",
        sequence,
        sourceRange: segment.sourceRange,
        text: segment.text,
      });

      expect(wrapped.sourceRange).toEqual(segment.sourceRange);
      expect(wrapped.text).toBe(segment.text);
      expect(wrapped.sequence).toBe(sequence);
    }
  });

  it("fails content-free without publishing a partial result when source identity is inconsistent", async () => {
    const canary = "private-prepared-segment-canary";
    const fixture = narrationFixture([
      paragraph(canary),
      paragraph("different length"),
    ]);
    const source = requiredLeaf(fixture.leaves[0]);
    const other = requiredLeaf(fixture.leaves[1]);
    const malformed = Object.freeze({
      ...source,
      locatedBlock: other.locatedBlock,
    });

    await expectContentFreeFailure(
      () => prepareNarrationSourceLeaf(malformed, "und"),
      canary,
    );
  });

  it("keeps the accepted prepared boundary-reason union closed", () => {
    expectTypeOf<NarrationBoundaryReason>().toEqualTypeOf<
      | "clause"
      | "dialogue-turn"
      | "hard-limit"
      | "heading"
      | "paragraph"
      | "scene-break"
      | "sentence"
      | "token"
    >();
  });
});

function narrationFixture(blocks: readonly SemanticBlock[]): Readonly<{
  index: PublicationLocatorIndex;
  leaves: readonly NarrationSourceTokenLeafEvent[];
}> {
  const index = createPublicationLocatorIndex(
    decodeBookV1({
      schemaVersion: 1,
      identity: {
        scheme: "sha256",
        schemeVersion: 1,
        value: "0".repeat(64),
      },
      metadata: { title: "Synthetic prepared narration", authors: [] },
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
  const leaves = mapNarrationSourceTokens(
    projectNarrationSource(index.blocks),
  ).filter(
    (event): event is NarrationSourceTokenLeafEvent => event.kind === "leaf",
  );
  return Object.freeze({ index, leaves });
}

function projection(blocks: readonly SemanticBlock[]): XhtmlDocumentProjection {
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
      blocks.map((block) => Object.freeze({ block })),
    ),
  });
}

function sensitive(value: string): SensitivePublicationText {
  return value as SensitivePublicationText;
}

function text(value: string): SemanticInline {
  return Object.freeze({
    kind: "text",
    text: sensitive(value),
  });
}

function paragraph(value: string): SemanticBlock {
  return Object.freeze({
    kind: "paragraph",
    children: Object.freeze([text(value)]),
  });
}

function heading(value: string): SemanticBlock {
  return Object.freeze({
    kind: "heading",
    level: 2,
    children: Object.freeze([text(value)]),
  });
}

function requiredLeaf(
  leaf: NarrationSourceTokenLeafEvent | undefined,
): NarrationSourceTokenLeafEvent {
  if (leaf === undefined) {
    throw new Error("expected prepared narration source leaf");
  }
  return leaf;
}

function requiredSegment(
  segment: PreparedNarrationSegment | undefined,
): PreparedNarrationSegment {
  if (segment === undefined) {
    throw new Error("expected prepared narration segment");
  }
  return segment;
}

function assertExactEndpoint(
  index: PublicationLocatorIndex,
  leaf: NarrationSourceTokenLeafEvent,
  locator: PreparedNarrationSegment["sourceRange"]["start"],
): void {
  const resolution = resolvePublicationLocator(
    index,
    locator,
    createEpubProcessingBudget(),
  );
  expect(resolution.status).toBe("exact");
  expect(resolution.reason).toBe("exact");
  expect(resolution.locator).toEqual(locator);
  expect(resolution.locatedBlock).toBe(leaf.locatedBlock);
}

function assertDeepFrozen(prepared: PreparedNarrationBlock): void {
  expect(Object.isFrozen(prepared)).toBe(true);
  expect(Object.isFrozen(prepared.segments)).toBe(true);
  expect(Object.isFrozen(prepared.continuation)).toBe(true);
  expect(Object.isFrozen(prepared.measurements)).toBe(true);
  for (const segment of prepared.segments) {
    expect(Object.isFrozen(segment)).toBe(true);
    expect(Object.isFrozen(segment.sourceRange)).toBe(true);
    expect(Object.isFrozen(segment.sourceRange.start)).toBe(true);
    expect(Object.isFrozen(segment.sourceRange.end)).toBe(true);
    expect(Object.isFrozen(segment.measurements)).toBe(true);
  }
}

async function expectContentFreeFailure(
  action: () => Promise<unknown>,
  canary: string,
): Promise<void> {
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
  expect(JSON.stringify(captured)).not.toContain(canary);
}
