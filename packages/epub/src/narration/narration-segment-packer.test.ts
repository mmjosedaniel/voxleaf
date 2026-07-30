import { createIndex, createSpineItemId, decodeBookV1 } from "@voxleaf/shared";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  NARRATION_NORMALIZATION_CORPUS,
  type NarrationCorpusSourceUnit,
  type NarrationNormalizationCorpusCase,
} from "../../test-support/narration-normalization-corpus.js";
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
  scanNarrationBoundaries,
  type NarrationBoundaryScan,
} from "./narration-boundary-scanner.js";
import { normalizeNarrationSourceTokens } from "./narration-normalizer.js";
import { NARRATION_CHATTERBOX_V1_SEGMENT_POLICY } from "./narration-chatterbox-policy.js";
import {
  NARRATION_PIPER_V1_SEGMENT_POLICY,
  NARRATION_PIPER_V2_SEGMENT_POLICY,
  piperSpeechExpansionCodePointUnits,
  type NarrationSegmentPolicy,
} from "./narration-piper-policy.js";
import {
  NARRATION_V1_SEGMENT_POLICY,
  NARRATION_V1_SOURCE_WINDOW_POLICY,
} from "./narration-policy.js";
import {
  packNarrationBoundaryScan,
  type NarrationPackedBlock,
  type NarrationPackingBoundaryReason,
} from "./narration-segment-packer.js";
import { projectNarrationSource } from "./narration-source-projector.js";
import {
  mapNarrationSourceTokens,
  type NarrationSourceTokenLeafEvent,
} from "./narration-source.js";

const DOCUMENT_ID = "document:segment-packer" as ContentDocumentId;
const IMAGE_ID = "resource:packing-image" as RasterImageResourceId;

describe("narration segment packer", () => {
  it("keeps short headings and paragraphs in separate block-local segments", async () => {
    const leaves = tokenLeavesFor([
      heading([text("Synthetic heading")]),
      paragraph([text("Synthetic paragraph.")]),
    ]);
    const headingLeaf = leaves[0];
    const paragraphLeaf = leaves[1];
    if (headingLeaf === undefined || paragraphLeaf === undefined) {
      throw new Error("expected synthetic packing leaves");
    }

    const packedHeading = await packLeaf(headingLeaf, "und");
    const packedParagraph = await packLeaf(paragraphLeaf, "und");

    expect(packedHeading.segments).toHaveLength(1);
    expect(packedHeading.segments[0]?.boundaryReason).toBe("heading");
    expect(packedParagraph.segments).toHaveLength(1);
    expect(packedParagraph.segments[0]?.boundaryReason).toBe("paragraph");
    expect(packedHeading.segments[0]?.sourceSpan).toEqual({
      startOffsetCodePoints: 0,
      endOffsetCodePoints: codePointLength("Synthetic heading"),
    });
    expect(packedParagraph.segments[0]?.sourceSpan).toEqual({
      startOffsetCodePoints: 0,
      endOffsetCodePoints: codePointLength("Synthetic paragraph."),
    });
  });

  it("consumes only accepted top-level scene-break paragraphs without speech", async () => {
    const accepted = await packBlock(paragraph([text("* * *")]), "und");
    const asterism = await packBlock(paragraph([text("\u2042")]), "und");
    const rasterBearing = await packBlock(
      paragraph([
        text("* * *"),
        Object.freeze({
          kind: "raster-image" as const,
          resourceId: IMAGE_ID,
        }),
      ]),
      "und",
    );
    const nestedLeaf = tokenLeavesFor([
      Object.freeze({
        kind: "list" as const,
        ordered: false,
        items: Object.freeze([
          Object.freeze({
            children: Object.freeze([paragraph([text("* * *")])]),
          }),
        ]),
      }),
    ])[0];
    if (nestedLeaf === undefined) {
      throw new Error("expected synthetic nested packing leaf");
    }
    const nested = await packLeaf(nestedLeaf, "und");

    for (const packed of [accepted, asterism]) {
      expect(packed.disposition).toBe("scene-break");
      expect(packed.complete).toBe(true);
      expect(packed.segments).toEqual([]);
      expect(packed.measurements.narrationCodePoints).toBe(0);
      expect(packed.measurements.narrationUtf8Bytes).toBe(0);
      expect(packed.measurements.sentenceCount).toBe(0);
    }
    expect(nested.disposition).toBe("spoken");
    expect(nested.segments).toHaveLength(1);
    expect(rasterBearing.disposition).toBe("spoken");
    expect(rasterBearing.segments).toHaveLength(1);
  });

  it("prefers the latest complete sentence within every target dimension", async () => {
    const sentences = Array.from(
      { length: 4 },
      (_, index) => `${String.fromCharCode(97 + index).repeat(99)}.`,
    );
    const source = sentences.join(" ");
    const packed = await packBlock(paragraph([text(source)]), "und");

    expect(packed.segments).toHaveLength(2);
    expect(packed.segments[0]?.boundaryReason).toBe("sentence");
    expect(packed.segments[0]?.measurements.sentenceCount).toBe(3);
    expect(
      packed.segments[0]?.measurements.narrationCodePoints,
    ).toBeLessThanOrEqual(
      NARRATION_V1_SEGMENT_POLICY.narrationCodePointsTarget,
    );
    expect(joinedText(packed)).toBe(source);
  });

  it("keeps one over-target sentence intact when every hard maximum admits it", async () => {
    const source = `${"x".repeat(499)}.`;
    const packed = await packBlock(paragraph([text(source)]), "und");
    const segment = packed.segments[0];

    expect(packed.segments).toHaveLength(1);
    expect(segment?.measurements.narrationCodePoints).toBe(500);
    expect(segment?.measurements.sentenceCount).toBe(1);
    expect(segment?.boundaryReason).toBe("paragraph");
  });

  it("falls back from an oversized sentence to clause then whitespace boundaries", async () => {
    const clauseSource = `${"a".repeat(250)}, ${"b".repeat(250)}, ${"c".repeat(250)}.`;
    const whitespaceSource = Array.from({ length: 180 }, () => "word").join(
      " ",
    );
    const clausePacked = await packBlock(
      paragraph([text(clauseSource)]),
      "und",
    );
    const whitespacePacked = await packBlock(
      paragraph([text(whitespaceSource)]),
      "und",
    );

    expect(clausePacked.segments.length).toBeGreaterThan(1);
    expect(clausePacked.segments[0]?.boundaryReason).toBe("clause");
    expect(whitespacePacked.segments.length).toBeGreaterThan(1);
    expect(whitespacePacked.segments[0]?.boundaryReason).toBe("token");
    expect(joinedText(clausePacked)).toBe(clauseSource);
    expect(joinedText(whitespacePacked)).toBe(whitespaceSource);
  });

  it("uses a Unicode-safe hard split without separating a combining sequence", async () => {
    const source = `${"x".repeat(639)}e\u0301${"z".repeat(100)}`;
    const packed = await packBlock(paragraph([text(source)]), "und");
    const first = packed.segments[0];
    const second = packed.segments[1];

    expect(first?.boundaryReason).toBe("hard-limit");
    expect(first?.sourceSpan.endOffsetCodePoints).toBe(639);
    expect(String(second?.text).startsWith("e\u0301")).toBe(true);
    expect(joinedText(packed)).toBe(source);
  });

  it("splits one unprotected max-plus-one token at the latest legal hard boundary", async () => {
    const maximum = NARRATION_V1_SEGMENT_POLICY.narrationCodePointsHardMaximum;
    const exactSource = "x".repeat(maximum);
    const oversizedSource = "x".repeat(maximum + 1);
    const exact = await packBlock(paragraph([text(exactSource)]), "und");
    const oversized = await packBlock(
      paragraph([text(oversizedSource)]),
      "und",
    );

    expect(exact.segments).toHaveLength(1);
    expect(exact.segments[0]?.measurements.narrationCodePoints).toBe(maximum);
    expect(oversized.segments).toHaveLength(2);
    expect(oversized.segments[0]?.boundaryReason).toBe("hard-limit");
    expect(oversized.segments[0]?.sourceSpan).toEqual({
      startOffsetCodePoints: 0,
      endOffsetCodePoints: maximum,
    });
    expect(oversized.segments[1]?.sourceSpan).toEqual({
      startOffsetCodePoints: maximum,
      endOffsetCodePoints: maximum + 1,
    });
    expect(joinedText(oversized)).toBe(oversizedSource);
  });

  it("returns a fixed limit when one combining sequence cannot fit legally", async () => {
    const maximum = NARRATION_V1_SEGMENT_POLICY.narrationCodePointsHardMaximum;
    const exactSource = `e${"\u0301".repeat(maximum - 1)}`;
    const canary = `e${"\u0301".repeat(maximum)}`;
    const exact = await packBlock(paragraph([text(exactSource)]), "und");

    expect(exact.segments).toHaveLength(1);
    expect(exact.segments[0]?.measurements.narrationCodePoints).toBe(maximum);
    await expectContentFreeFailure(
      () => packBlock(paragraph([text(canary)]), "und"),
      "resource-limit-exceeded",
      canary,
    );
  });

  it("enforces independent code-point, UTF-8-byte, source-span, and sentence ceilings", async () => {
    const exactSourceSpan = `${"\u200b".repeat(128)}${"x".repeat(639)}.`;
    const exactUtf8Bytes = "\u{1f642}".repeat(512);
    const sourcePacked = await packBlock(
      paragraph([text(exactSourceSpan)]),
      "und",
    );
    const bytePacked = await packBlock(
      paragraph([text(exactUtf8Bytes)]),
      "und",
    );

    expect(sourcePacked.segments).toHaveLength(1);
    expect(sourcePacked.segments[0]?.measurements).toEqual({
      sourceCodePoints: NARRATION_V1_SEGMENT_POLICY.sourceCodePointsHardMaximum,
      narrationCodePoints:
        NARRATION_V1_SEGMENT_POLICY.narrationCodePointsHardMaximum,
      narrationUtf8Bytes:
        NARRATION_V1_SEGMENT_POLICY.narrationCodePointsHardMaximum,
      sentenceCount: 1,
    });
    expect(bytePacked.segments).toHaveLength(1);
    expect(bytePacked.segments[0]?.measurements.narrationCodePoints).toBe(512);
    expect(bytePacked.segments[0]?.measurements.narrationUtf8Bytes).toBe(
      NARRATION_V1_SEGMENT_POLICY.narrationUtf8BytesHardMaximum,
    );
    assertSegmentBounds(sourcePacked);
    assertSegmentBounds(bytePacked);
  });

  it("keeps historical profiles unchanged and bounds Piper spoken expansion in v2", async () => {
    expect(NARRATION_PIPER_V1_SEGMENT_POLICY).toEqual({
      sourceCodePointsTarget: 240,
      sourceCodePointsHardMaximum: 320,
      narrationCodePointsTarget: 200,
      narrationCodePointsHardMaximum: 256,
      narrationUtf8BytesTarget: 800,
      narrationUtf8BytesHardMaximum: 1_024,
      sentencesTarget: 2,
      sentencesHardMaximum: 6,
    });
    expect(NARRATION_PIPER_V2_SEGMENT_POLICY).toEqual({
      ...NARRATION_PIPER_V1_SEGMENT_POLICY,
      piperSpeechExpansionUnitsTarget: 120,
      piperSpeechExpansionUnitsHardMaximum: 160,
    });
    expect(
      [
        "7",
        "$",
        "%",
        "\u2030",
        "\u00ba",
        "\u00aa",
        "\u00b0",
        "A",
        "\u00d1",
        "a",
        ".",
      ].map(piperSpeechExpansionCodePointUnits),
    ).toEqual([4, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1]);

    const source = Array.from(
      { length: 20 },
      (_, index) => `${String(index + 1).padStart(4, "0")} USD`,
    ).join(" ");
    const scan = scanLeaf(leafFor(paragraph([text(source)])), "es");
    const generic = await packNarrationBoundaryScan(scan);
    const piperV1 = await packNarrationBoundaryScan(scan, {
      segmentPolicy: NARRATION_PIPER_V1_SEGMENT_POLICY,
    });
    const piperV2 = await packNarrationBoundaryScan(scan, {
      segmentPolicy: NARRATION_PIPER_V2_SEGMENT_POLICY,
    });

    expect(joinedText(generic)).toBe(source);
    expect(joinedText(piperV1)).toBe(source);
    expect(joinedText(piperV2)).toBe(source);
    expect(piperV2.segments.length).toBeGreaterThan(piperV1.segments.length);
    assertOrderedSourceSpans(piperV2);
    assertPiperExpansionBounds(piperV2);
  });

  it("bounds complete-waveform Chatterbox units without changing bilingual text", async () => {
    expect(NARRATION_CHATTERBOX_V1_SEGMENT_POLICY).toEqual({
      sourceCodePointsTarget: 240,
      sourceCodePointsHardMaximum: 320,
      narrationCodePointsTarget: 200,
      narrationCodePointsHardMaximum: 256,
      narrationUtf8BytesTarget: 800,
      narrationUtf8BytesHardMaximum: 1_024,
      sentencesTarget: 2,
      sentencesHardMaximum: 6,
    });

    const source = Array.from(
      { length: 8 },
      () => "A bounded bilingual sentence keeps the waveform safely sized",
    ).join(", ");
    const scan = scanLeaf(leafFor(paragraph([text(source)])), "es");
    const packed = await packNarrationBoundaryScan(scan, {
      segmentPolicy: NARRATION_CHATTERBOX_V1_SEGMENT_POLICY,
    });

    expect(joinedText(packed)).toBe(source);
    expect(packed.segments.length).toBeGreaterThan(1);
    expect(
      packed.segments.every(
        (segment) =>
          segment.measurements.sourceCodePoints <= 320 &&
          segment.measurements.narrationCodePoints <= 256 &&
          segment.measurements.narrationUtf8Bytes <= 1_024 &&
          segment.measurements.sentenceCount <= 6,
      ),
    ).toBe(true);
    assertOrderedSourceSpans(packed);
  });

  it("bounds representative spoken-expansion categories without changing text", async () => {
    const sources = [
      Array.from({ length: 36 }, (_, index) =>
        String(index + 1).padStart(4, "0"),
      ).join(" "),
      Array.from({ length: 30 }, () => "CPU GPU TTS").join(" "),
      Array.from({ length: 30 }, () => "XIV XVI XVIII").join(" "),
      Array.from({ length: 24 }, (_, index) => `$${index + 10}.50 25%`).join(
        " ",
      ),
      Array.from({ length: 30 }, (_, index) => `${index + 1}\u00ba`).join(" "),
      Array.from({ length: 40 }, () => "A B C").join(" "),
      Array.from(
        { length: 12 },
        () => "Una frase sintetica normal conserva su texto.",
      ).join(" "),
    ];

    for (const source of sources) {
      const packed = await packNarrationBoundaryScan(
        scanLeaf(leafFor(paragraph([text(source)])), "es"),
        { segmentPolicy: NARRATION_PIPER_V2_SEGMENT_POLICY },
      );

      expect(joinedText(packed)).toBe(source);
      assertOrderedSourceSpans(packed);
      assertPiperExpansionBounds(packed);
    }
  });

  it("enforces exact and max-plus-one retained narration limits", async () => {
    const codePointUnitCount =
      NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum /
      NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum;
    const exactCodePoints = expandedScan("x".repeat(codePointUnitCount), () =>
      "a".repeat(
        NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum,
      ),
    );
    const maxPlusOneCodePoints = expandedScan(
      "x".repeat(codePointUnitCount + 1),
      () =>
        "a".repeat(
          NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum,
        ),
    );
    const utf8Unit = "\u{1f642}".repeat(
      NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum,
    );
    const utf8UnitBytes = new TextEncoder().encode(utf8Unit).byteLength;
    const byteUnitCount =
      NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum /
      utf8UnitBytes;
    const exactBytes = expandedScan("x".repeat(byteUnitCount), () => utf8Unit);
    const maxPlusOneBytes = expandedScan(
      "x".repeat(byteUnitCount + 1),
      (index) => (index < byteUnitCount ? utf8Unit : "\u{1f642}"),
    );

    const codePointPacked = await packNarrationBoundaryScan(exactCodePoints);
    const bytePacked = await packNarrationBoundaryScan(exactBytes);

    expect(codePointPacked.complete).toBe(true);
    expect(bytePacked.complete).toBe(true);
    expect(codePointPacked.measurements.narrationCodePoints).toBe(
      NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum,
    );
    expect(bytePacked.measurements.narrationUtf8Bytes).toBe(
      NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum,
    );
    await expectContentFreeFailure(
      () => packNarrationBoundaryScan(maxPlusOneCodePoints),
      "resource-limit-exceeded",
      String(maxPlusOneCodePoints.normalized.text),
    );
    await expectContentFreeFailure(
      () => packNarrationBoundaryScan(maxPlusOneBytes),
      "resource-limit-exceeded",
      String(maxPlusOneBytes.normalized.text),
    );
  });

  it("rejects max-plus-one retained source units before temporary indexing", async () => {
    const canary = "private-retained-unit-canary";
    const scan = scanLeaf(leafFor(paragraph([text("x")])), "und");
    const unit = scan.normalized.units[0];
    if (unit === undefined) {
      throw new Error("expected synthetic normalized unit");
    }
    const malformed = Object.freeze({
      ...scan,
      normalized: Object.freeze({
        ...scan.normalized,
        text: canary,
        units: Object.freeze(
          Array.from(
            {
              length:
                NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum +
                1,
            },
            () => unit,
          ),
        ),
      }),
    }) as NarrationBoundaryScan;

    await expectContentFreeFailure(
      () => packNarrationBoundaryScan(malformed),
      "resource-limit-exceeded",
      canary,
    );
  });

  it("observes cancellation during worst-case bounded packing and allows retry", async () => {
    const canaryPrefix = "privatecancellationcanary";
    const source = `${canaryPrefix}${"x".repeat(
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum -
        codePointLength(canaryPrefix),
    )}`;
    const scan = scanLeaf(leafFor(paragraph([text(source)])), "und");
    const controller = new AbortController();
    let cancellationYieldCount = 0;

    await expectContentFreeFailure(
      () =>
        packNarrationBoundaryScan(scan, {
          signal: controller.signal,
          scheduler: async () => {
            cancellationYieldCount += 1;
            controller.abort();
          },
        }),
      "cancelled",
      canaryPrefix,
    );
    expect(cancellationYieldCount).toBe(1);

    const retry = await packNarrationBoundaryScan(scan, {
      scheduler: async () => Promise.resolve(),
    });
    expect(retry.complete).toBe(true);
    expect(retry.measurements.checkpointCount).toBeGreaterThan(0);
    expect(retry.measurements.yieldCount).toBeGreaterThan(0);
    expect(retry.measurements.workUnitCount).toBeGreaterThan(
      retry.measurements.yieldCount,
    );
    expect(joinedText(retry)).toBe(source);
    assertSegmentBounds(retry);
  });

  it("never splits a protected token and keeps source-mapped output stable", async () => {
    const protectedLength =
      NARRATION_V1_SOURCE_WINDOW_POLICY.protectedTokenCodePointsHardMaximum;
    const block = paragraph([
      code("c".repeat(protectedLength)),
      text("x".repeat(500)),
    ]);
    const scan = scanLeaf(leafFor(block), "und");
    const packed = await packNarrationBoundaryScan(scan);

    for (const segment of packed.segments) {
      for (const token of scan.protectedTokens) {
        expect(
          segment.sourceSpan.endOffsetCodePoints >
            token.sourceSpan.startOffsetCodePoints &&
            segment.sourceSpan.endOffsetCodePoints <
              token.sourceSpan.endOffsetCodePoints,
        ).toBe(false);
      }
    }
    expect(joinedText(packed)).toBe(scan.normalized.text);
  });

  it("caps retained output at one lookahead beyond the batch maximum", async () => {
    const source = Array.from({ length: 60 }, () => "a.").join(" ");
    const packed = await packBlock(paragraph([text(source)]), "und");

    expect(packed.segments).toHaveLength(
      NARRATION_V1_SEGMENT_POLICY.retainedSegmentEntriesHardMaximum,
    );
    expect(packed.complete).toBe(false);
    expect(packed.measurements.sourceCodePointsConsumed).toBeLessThan(
      codePointLength(source),
    );
  });

  it("makes stable segmentation independent of later batch slicing", async () => {
    const source = Array.from(
      { length: 10 },
      (_, index) => `${String.fromCharCode(97 + index).repeat(99)}.`,
    ).join(" ");
    const packed = await packBlock(paragraph([text(source)]), "und");
    const oneAtATime = groupSegments(packed, 1).flat();
    const threeAtATime = groupSegments(packed, 3).flat();

    expect(oneAtATime).toEqual(packed.segments);
    expect(threeAtATime).toEqual(packed.segments);
    expect(oneAtATime).toEqual(threeAtATime);
  });

  it("packs the accepted corpus deterministically with frozen bounded output", async () => {
    for (const corpusCase of NARRATION_NORMALIZATION_CORPUS) {
      const fixture = corpusFixture(corpusCase);
      const scan = scanLeaf(fixture.leaf, corpusCase.defaultLanguage);
      const first = await packNarrationBoundaryScan(scan);
      const repeated = await packNarrationBoundaryScan(scan);

      expect(repeated).toEqual(first);
      expect(first.complete).toBe(true);
      expect(first.disposition).not.toBe("scene-break");
      if (first.disposition === "spoken") {
        expect(joinedText(first)).toBe(scan.normalized.text);
      }
      assertSegmentBounds(first);
      assertDeepFrozen(first);
    }
  });

  it("consumes empty and omission-only blocks without spoken output", async () => {
    const empty = await packBlock(paragraph([]), "und");
    const lineBreak = await packBlock(
      paragraph([Object.freeze({ kind: "line-break" as const })]),
      "und",
    );

    for (const packed of [empty, lineBreak]) {
      expect(packed.disposition).toBe("unspoken");
      expect(packed.complete).toBe(true);
      expect(packed.segments).toEqual([]);
    }
  });

  it("maps malformed scans to a fixed content-free failure", async () => {
    const canary = "private-segment-packer-canary";
    const scan = scanLeaf(
      leafFor(paragraph([text("Synthetic sentence.")])),
      "und",
    );
    const malformed = Object.freeze({
      ...scan,
      normalized: Object.freeze({
        ...scan.normalized,
        text: canary,
      }),
    }) as NarrationBoundaryScan;

    await expectContentFreeFailure(
      () => packNarrationBoundaryScan(malformed),
      "internal-failure",
      canary,
    );
  });

  it("keeps the boundary-reason union closed", () => {
    expectTypeOf<NarrationPackingBoundaryReason>().toEqualTypeOf<
      | "clause"
      | "dialogue-turn"
      | "hard-limit"
      | "heading"
      | "paragraph"
      | "sentence"
      | "token"
    >();
  });
});

function sensitive(value: string): SensitivePublicationText {
  return value as SensitivePublicationText;
}

function text(value: string, language?: string): SemanticInline {
  return Object.freeze({
    kind: "text" as const,
    text: sensitive(value),
    ...(language === undefined ? {} : { language }),
  });
}

function code(value: string, language?: string): SemanticInline {
  return Object.freeze({
    kind: "code" as const,
    children: Object.freeze([text(value)]),
    ...(language === undefined ? {} : { language }),
  });
}

function heading(children: readonly SemanticInline[]): SemanticBlock {
  return Object.freeze({
    kind: "heading" as const,
    level: 2 as const,
    children: Object.freeze([...children]),
  });
}

function paragraph(
  children: readonly SemanticInline[],
  language?: string,
): SemanticBlock {
  return Object.freeze({
    kind: "paragraph" as const,
    children: Object.freeze([...children]),
    ...(language === undefined ? {} : { language }),
  });
}

function semanticInline(unit: NarrationCorpusSourceUnit): SemanticInline {
  switch (unit.kind) {
    case "code":
      return code(String(unit.text), unit.semanticLanguage);
    case "line-break":
      return unit.semanticLanguage === undefined
        ? Object.freeze({ kind: "line-break" as const })
        : Object.freeze({
            kind: "emphasis" as const,
            language: unit.semanticLanguage,
            children: Object.freeze([
              Object.freeze({ kind: "line-break" as const }),
            ]),
          });
    case "text":
      return text(String(unit.text), unit.semanticLanguage);
  }
}

function corpusFixture(corpusCase: NarrationNormalizationCorpusCase) {
  const children = corpusCase.source.map(semanticInline);
  const block: SemanticBlock =
    corpusCase.blockKind === "heading"
      ? Object.freeze({
          kind: "heading",
          level: 2,
          children: Object.freeze(children),
        })
      : paragraph(children);
  return Object.freeze({ block, leaf: leafFor(block) });
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
      addressableBlocks(blocks).map((block) => Object.freeze({ block })),
    ),
  });
}

function addressableBlocks(
  blocks: readonly SemanticBlock[],
): readonly SemanticBlock[] {
  const result: SemanticBlock[] = [];
  const pending = [...blocks].reverse();
  while (pending.length > 0) {
    const block = pending.pop();
    if (block === undefined) {
      throw new Error("expected synthetic semantic block");
    }
    switch (block.kind) {
      case "heading":
      case "paragraph":
        result.push(block);
        break;
      case "block-quote":
        result.push(block);
        pending.push(...[...block.children].reverse());
        break;
      case "list":
        result.push(block);
        for (
          let itemIndex = block.items.length - 1;
          itemIndex >= 0;
          itemIndex -= 1
        ) {
          const item = block.items[itemIndex];
          if (item !== undefined) {
            pending.push(...[...item.children].reverse());
          }
        }
        break;
    }
  }
  return Object.freeze(result);
}

function tokenLeavesFor(
  blocks: readonly SemanticBlock[],
): readonly NarrationSourceTokenLeafEvent[] {
  const index = createPublicationLocatorIndex(
    decodeBookV1({
      schemaVersion: 1,
      identity: {
        scheme: "sha256",
        schemeVersion: 1,
        value: "0".repeat(64),
      },
      metadata: { title: "Synthetic packing", authors: [] },
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
  return mapNarrationSourceTokens(projectNarrationSource(index.blocks)).filter(
    (event): event is NarrationSourceTokenLeafEvent => event.kind === "leaf",
  );
}

function leafFor(block: SemanticBlock): NarrationSourceTokenLeafEvent {
  const leaf = tokenLeavesFor([block])[0];
  if (leaf === undefined) {
    throw new Error("expected narration packing source leaf");
  }
  return leaf;
}

function scanLeaf(
  leaf: NarrationSourceTokenLeafEvent,
  defaultLanguage: "es" | "und",
): NarrationBoundaryScan {
  return scanNarrationBoundaries(
    leaf,
    normalizeNarrationSourceTokens(leaf.sourceTokens, defaultLanguage),
  );
}

function expandedScan(
  source: string,
  expansion: (unitIndex: number) => string,
): NarrationBoundaryScan {
  const scan = scanLeaf(leafFor(paragraph([text(source)])), "und");
  const units = Object.freeze(
    scan.normalized.units.map((unit, unitIndex) =>
      unit.kind === "text"
        ? Object.freeze({
            ...unit,
            text: expansion(unitIndex),
          })
        : unit,
    ),
  );
  return Object.freeze({
    ...scan,
    normalized: Object.freeze({
      ...scan.normalized,
      units,
      text: units
        .map((unit) => (unit.kind === "text" ? String(unit.text) : ""))
        .join(""),
    }),
  }) as NarrationBoundaryScan;
}

async function packLeaf(
  leaf: NarrationSourceTokenLeafEvent,
  defaultLanguage: "es" | "und",
  segmentPolicy?: NarrationSegmentPolicy,
): Promise<NarrationPackedBlock> {
  return await packNarrationBoundaryScan(scanLeaf(leaf, defaultLanguage), {
    ...(segmentPolicy === undefined ? {} : { segmentPolicy }),
  });
}

async function packBlock(
  block: SemanticBlock,
  defaultLanguage: "es" | "und",
  segmentPolicy?: NarrationSegmentPolicy,
): Promise<NarrationPackedBlock> {
  return await packLeaf(leafFor(block), defaultLanguage, segmentPolicy);
}

function joinedText(packed: NarrationPackedBlock): string {
  return packed.segments.map(({ text: value }) => String(value)).join("");
}

function codePointLength(value: string): number {
  return Array.from(value).length;
}

function piperSpeechExpansionUnits(value: string): number {
  return Array.from(value).reduce(
    (total, codePoint) => total + piperSpeechExpansionCodePointUnits(codePoint),
    0,
  );
}

function assertPiperExpansionBounds(packed: NarrationPackedBlock): void {
  for (const segment of packed.segments) {
    expect(piperSpeechExpansionUnits(String(segment.text))).toBeLessThanOrEqual(
      NARRATION_PIPER_V2_SEGMENT_POLICY.piperSpeechExpansionUnitsHardMaximum,
    );
  }
}

function assertOrderedSourceSpans(packed: NarrationPackedBlock): void {
  let previousEnd = packed.block.sourceStartOffsetCodePoints;
  for (const segment of packed.segments) {
    expect(segment.sourceSpan.startOffsetCodePoints).toBe(previousEnd);
    previousEnd = segment.sourceSpan.endOffsetCodePoints;
  }
  expect(previousEnd).toBe(packed.block.sourceEndOffsetCodePoints);
}

function groupSegments(
  packed: NarrationPackedBlock,
  size: number,
): readonly (readonly NarrationPackedBlock["segments"][number][])[] {
  const groups: NarrationPackedBlock["segments"][number][][] = [];
  for (let index = 0; index < packed.segments.length; index += size) {
    groups.push([...packed.segments.slice(index, index + size)]);
  }
  return groups;
}

function assertSegmentBounds(packed: NarrationPackedBlock): void {
  let previousEnd = 0;
  for (const segment of packed.segments) {
    expect(segment.measurements.sourceCodePoints).toBeLessThanOrEqual(
      NARRATION_V1_SEGMENT_POLICY.sourceCodePointsHardMaximum,
    );
    expect(segment.measurements.narrationCodePoints).toBeLessThanOrEqual(
      NARRATION_V1_SEGMENT_POLICY.narrationCodePointsHardMaximum,
    );
    expect(segment.measurements.narrationUtf8Bytes).toBeLessThanOrEqual(
      NARRATION_V1_SEGMENT_POLICY.narrationUtf8BytesHardMaximum,
    );
    expect(segment.measurements.sentenceCount).toBeLessThanOrEqual(
      NARRATION_V1_SEGMENT_POLICY.sentencesHardMaximum,
    );
    expect(segment.sourceSpan.endOffsetCodePoints).toBeGreaterThan(
      segment.sourceSpan.startOffsetCodePoints,
    );
    expect(segment.sourceSpan.startOffsetCodePoints).toBeGreaterThanOrEqual(
      previousEnd,
    );
    previousEnd = segment.sourceSpan.endOffsetCodePoints;
  }
  expect(packed.segments.length).toBeLessThanOrEqual(
    NARRATION_V1_SEGMENT_POLICY.retainedSegmentEntriesHardMaximum,
  );
}

function assertDeepFrozen(packed: NarrationPackedBlock): void {
  expect(Object.isFrozen(packed)).toBe(true);
  expect(Object.isFrozen(packed.block)).toBe(true);
  expect(Object.isFrozen(packed.segments)).toBe(true);
  expect(Object.isFrozen(packed.measurements)).toBe(true);
  for (const segment of packed.segments) {
    expect(Object.isFrozen(segment)).toBe(true);
    expect(Object.isFrozen(segment.sourceSpan)).toBe(true);
    expect(Object.isFrozen(segment.measurements)).toBe(true);
  }
}

async function expectContentFreeFailure(
  action: () => Promise<unknown>,
  code: "cancelled" | "internal-failure" | "resource-limit-exceeded",
  canary: string,
): Promise<void> {
  try {
    await action();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    expect((error as EpubArchiveError).code).toBe(code);
    expect((error as Error).message).toBe(code);
    expect(JSON.stringify(error)).not.toContain(canary);
    expect((error as Error).stack ?? "").not.toContain(canary);
    return;
  }
  throw new Error("expected fixed narration packing failure");
}
