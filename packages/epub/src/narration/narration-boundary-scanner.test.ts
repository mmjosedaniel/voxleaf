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
  type NarrationScannedBoundaryKind,
} from "./narration-boundary-scanner.js";
import {
  normalizeNarrationSourceTokens,
  type NarrationNormalizedStream,
} from "./narration-normalizer.js";
import { NARRATION_V1_SOURCE_WINDOW_POLICY } from "./narration-policy.js";
import { projectNarrationSource } from "./narration-source-projector.js";
import {
  mapNarrationSourceTokens,
  type NarrationSourceTokenLeafEvent,
} from "./narration-source.js";

const DOCUMENT_ID = "document:boundaries" as ContentDocumentId;

describe("narration boundary scanner", () => {
  it("finds Spanish sentence clusters and carries endings through closing quotations", () => {
    const source = "¿Listo? “Sí.” Después.";
    const scan = scanText(source);

    expect(boundaryShape(scan)).toEqual([
      ["sentence", codePointLength("¿Listo?")],
      ["sentence", codePointLength("¿Listo? “Sí.”")],
      ["sentence", codePointLength(source)],
    ]);
    expect(scan.measurements.sentenceCount).toBe(3);
  });

  it("collapses repeated terminal marks into one sentence boundary", () => {
    const scan = scanText("¿Qué?!");

    expect(boundaryShape(scan)).toEqual([
      ["sentence", codePointLength("¿Qué?!")],
    ]);
    expect(scan.measurements.sentenceCount).toBe(1);
  });

  it("records clause punctuation and a block-final sentence deterministically", () => {
    const source = "Uno, dos; tres: cuatro.";
    const first = scanText(source);
    const repeated = scanText(source);

    expect(boundaryShape(first)).toEqual([
      ["clause", codePointLength("Uno,")],
      ["clause", codePointLength("Uno, dos;")],
      ["clause", codePointLength("Uno, dos; tres:")],
      ["sentence", codePointLength(source)],
    ]);
    expect(repeated).toEqual(first);
  });

  it("marks a leading dialogue dash without splitting its sentence", () => {
    const source = "—Habla la primera voz.";
    const scan = scanText(source);

    expect(boundaryShape(scan)).toEqual([
      ["dialogue-turn", 0],
      ["sentence", codePointLength(source)],
    ]);
  });

  it("keeps ellipses atomic and closes unterminated text at the block boundary", () => {
    const source = "Quizá…";
    const scan = scanText(source);

    expect(boundaryShape(scan)).toEqual([
      ["sentence", codePointLength(source)],
    ]);
    expect(scan.protectedTokens).toEqual([
      expect.objectContaining({
        narrationCodePoints: 1,
        protections: ["ellipsis"],
      }),
    ]);
  });

  it("uses a deterministic fallback for malformed quotation input", () => {
    const source = "“Texto sin cierre. Continúa";
    const scan = scanText(source);

    expect(boundaryShape(scan)).toEqual([
      ["sentence", codePointLength("“Texto sin cierre.")],
      ["sentence", codePointLength(source)],
    ]);
    expect(
      scan.protectedTokens.some(({ protections }) =>
        protections.includes("malformed-punctuation"),
      ),
    ).toBe(true);
  });

  it("uses semantic line breaks and language changes as clause boundaries", () => {
    const lineBreakLeaf = leafFor(
      paragraph([
        text("Primera"),
        Object.freeze({ kind: "line-break" as const }),
        text("segunda"),
      ]),
    );
    const lineBreakScan = scanLeaf(lineBreakLeaf, "es");
    const languageLeaf = leafFor(
      paragraph([text("Texto", "es"), text(" "), text("foreign", "en")]),
    );
    const languageScan = scanLeaf(languageLeaf, "es");

    expect(boundaryShape(lineBreakScan)).toEqual([
      ["clause", codePointLength("Primera\n")],
      ["sentence", codePointLength("Primera\nsegunda")],
    ]);
    expect(boundaryShape(languageScan)).toContainEqual([
      "clause",
      codePointLength("Texto "),
    ]);
  });

  it("protects every accepted lexical form from interior splitting", () => {
    const expectedSentenceCounts = new Map<string, number>([
      ["punctuation-spanish-opening-marks", 2],
      ["punctuation-ellipsis-character", 1],
      ["abbreviation-spanish-honorific", 1],
      ["abbreviation-spanish-common", 1],
      ["abbreviation-spanish-multi-period", 1],
      ["abbreviation-initials", 1],
      ["number-spanish-decimal", 1],
      ["number-spanish-thousands", 1],
      ["date-spanish-slash", 1],
      ["time-spanish-twenty-four-hour", 1],
      ["currency-spanish-euro-symbol", 1],
    ]);

    for (const [id, expectedSentenceCount] of expectedSentenceCounts) {
      const corpusCase = requiredCorpusCase(id);
      const scan = scanCorpusCase(corpusCase);

      expect(scan.measurements.sentenceCount).toBe(expectedSentenceCount);
      assertNoInteriorProtectedBoundary(scan);
    }
  });

  it("keeps all accepted corpus scans source-mapped, immutable, and repeatable", () => {
    for (const corpusCase of NARRATION_NORMALIZATION_CORPUS) {
      const fixture = corpusFixture(corpusCase);
      const sourceBefore = JSON.stringify(fixture.block);
      const normalized = normalizeNarrationSourceTokens(
        fixture.leaf.sourceTokens,
        corpusCase.defaultLanguage,
      );
      const first = scanNarrationBoundaries(fixture.leaf, normalized);
      const repeated = scanNarrationBoundaries(fixture.leaf, normalized);

      expect(repeated).toEqual(first);
      expect(JSON.stringify(fixture.block)).toBe(sourceBefore);
      expect(first.measurements.unitCount).toBe(normalized.units.length);
      expect(first.measurements.unitVisitCount).toBe(
        normalized.units.length * 2,
      );
      expect(first.measurements.boundaryCount).toBe(first.boundaries.length);
      expect(first.measurements.protectedTokenCount).toBe(
        first.protectedTokens.length,
      );
      expect(first.measurements.sentenceCount).toBe(
        first.boundaries.filter(({ kind }) => kind === "sentence").length,
      );
      assertOrderedSourceMappedBoundaries(first);
      assertNoInteriorProtectedBoundary(first);
      assertDeepFrozen(first);
    }
  });

  it("preserves heading, quotation, list, and dialogue metadata", () => {
    const heading = Object.freeze({
      kind: "heading" as const,
      level: 2 as const,
      children: Object.freeze([text("Capítulo")]),
    });
    const nested = Object.freeze({
      kind: "block-quote" as const,
      children: Object.freeze([
        Object.freeze({
          kind: "list" as const,
          ordered: true,
          items: Object.freeze([
            Object.freeze({
              children: Object.freeze([
                paragraph([text("—Respuesta sintética.")]),
              ]),
            }),
          ]),
        }),
      ]),
    });
    const [headingLeaf, nestedLeaf] = tokenLeavesFor([heading, nested]);
    if (headingLeaf === undefined || nestedLeaf === undefined) {
      throw new Error("expected synthetic metadata leaves");
    }

    const headingScan = scanLeaf(headingLeaf, "es");
    const nestedScan = scanLeaf(nestedLeaf, "es");

    expect(headingScan.block).toEqual({
      blockKind: "heading",
      headingLevel: 2,
      blockSourceCodePoints: codePointLength("Capítulo"),
      sourceCodePoints: codePointLength("Capítulo"),
      sourceEndOffsetCodePoints: codePointLength("Capítulo"),
      sourceStartOffsetCodePoints: 0,
      structuralContext: { quoteDepth: 0, listPath: [] },
      textContext: { inlineContainers: [] },
    });
    expect(nestedScan.block).toEqual({
      blockKind: "paragraph",
      blockSourceCodePoints: codePointLength("—Respuesta sintética."),
      sourceCodePoints: codePointLength("—Respuesta sintética."),
      sourceEndOffsetCodePoints: codePointLength("—Respuesta sintética."),
      sourceStartOffsetCodePoints: 0,
      structuralContext: {
        quoteDepth: 1,
        listPath: [{ ordered: true, itemIndex: 0 }],
      },
      textContext: { inlineContainers: [] },
    });
    expect(nestedScan.boundaries[0]?.kind).toBe("dialogue-turn");
  });

  it("returns no lexical boundaries for an unspoken structural leaf", () => {
    const leaf = leafFor(
      paragraph([Object.freeze({ kind: "line-break" as const })]),
    );
    const scan = scanLeaf(leaf, "und");

    expect(scan.normalized.text).toBe("");
    expect(scan.boundaries).toEqual([]);
    expect(scan.measurements.sentenceCount).toBe(0);
  });

  it("accepts the protected-token maximum and rejects max plus one", () => {
    const maximum =
      NARRATION_V1_SOURCE_WINDOW_POLICY.protectedTokenCodePointsHardMaximum;
    const exact = leafFor(paragraph([code("x".repeat(maximum))]));
    const oversized = leafFor(paragraph([code("x".repeat(maximum + 1))]));
    const exactScan = scanLeaf(exact, "und");

    expect(exactScan.protectedTokens).toHaveLength(1);
    expect(exactScan.protectedTokens[0]?.narrationCodePoints).toBe(maximum);
    expectContentFreeFailure(
      () => scanLeaf(oversized, "und"),
      "resource-limit-exceeded",
      "private-boundary-canary",
    );
  });

  it("maps malformed streams to a content-free internal failure", () => {
    const canary = "private-boundary-canary";
    const leaf = leafFor(paragraph([text("Texto sintético.")]));
    const normalized = normalizeNarrationSourceTokens(leaf.sourceTokens, "es");
    const malformed = Object.freeze({
      ...normalized,
      text: canary,
    }) as unknown as NarrationNormalizedStream;

    expectContentFreeFailure(
      () => scanNarrationBoundaries(leaf, malformed),
      "internal-failure",
      canary,
    );
  });

  it("keeps boundary and protected-token unions closed", () => {
    expectTypeOf<NarrationScannedBoundaryKind>().toEqualTypeOf<
      "clause" | "dialogue-turn" | "sentence"
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
      case "block-quote": {
        result.push(block);
        pending.push(...[...block.children].reverse());
        break;
      }
      case "list": {
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
      metadata: { title: "Synthetic boundaries", authors: [] },
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

function leafFor(
  blockOrBlocks: SemanticBlock | readonly SemanticBlock[],
): NarrationSourceTokenLeafEvent {
  const leaves = tokenLeavesFor(
    Array.isArray(blockOrBlocks) ? blockOrBlocks : [blockOrBlocks],
  );
  const leaf = leaves[0];
  if (leaf === undefined) {
    throw new Error("expected narration boundary source leaf");
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

function scanText(
  value: string,
  defaultLanguage: "es" | "und" = "es",
): NarrationBoundaryScan {
  return scanLeaf(leafFor(paragraph([text(value)])), defaultLanguage);
}

function scanCorpusCase(
  corpusCase: NarrationNormalizationCorpusCase,
): NarrationBoundaryScan {
  const fixture = corpusFixture(corpusCase);
  return scanLeaf(fixture.leaf, corpusCase.defaultLanguage);
}

function requiredCorpusCase(id: string): NarrationNormalizationCorpusCase {
  const corpusCase = NARRATION_NORMALIZATION_CORPUS.find(
    (entry) => entry.id === id,
  );
  if (corpusCase === undefined) {
    throw new Error("expected narration boundary corpus case");
  }
  return corpusCase;
}

function boundaryShape(
  scan: NarrationBoundaryScan,
): readonly (readonly [NarrationScannedBoundaryKind, number])[] {
  return scan.boundaries.map(({ kind, sourceOffsetCodePoints }) =>
    Object.freeze([kind, Number(sourceOffsetCodePoints)] as const),
  );
}

function codePointLength(value: string): number {
  return Array.from(value).length;
}

function assertOrderedSourceMappedBoundaries(
  scan: NarrationBoundaryScan,
): void {
  let previousUnitIndex = -1;
  let previousSourceOffset = -1;
  for (const boundary of scan.boundaries) {
    expect(boundary.unitIndexExclusive).toBeGreaterThanOrEqual(0);
    expect(boundary.unitIndexExclusive).toBeLessThanOrEqual(
      scan.normalized.units.length,
    );
    expect(boundary.sourceOffsetCodePoints).toBeGreaterThanOrEqual(0);
    expect(boundary.sourceOffsetCodePoints).toBeLessThanOrEqual(
      scan.block.sourceCodePoints,
    );
    expect(boundary.unitIndexExclusive).toBeGreaterThan(previousUnitIndex);
    expect(boundary.sourceOffsetCodePoints).toBeGreaterThanOrEqual(
      previousSourceOffset,
    );
    previousUnitIndex = boundary.unitIndexExclusive;
    previousSourceOffset = boundary.sourceOffsetCodePoints;
  }
}

function assertNoInteriorProtectedBoundary(scan: NarrationBoundaryScan): void {
  for (const protectedToken of scan.protectedTokens) {
    expect(protectedToken.narrationCodePoints).toBeGreaterThan(0);
    expect(protectedToken.narrationCodePoints).toBeLessThanOrEqual(
      NARRATION_V1_SOURCE_WINDOW_POLICY.protectedTokenCodePointsHardMaximum,
    );
    for (const boundary of scan.boundaries) {
      expect(
        boundary.unitIndexExclusive > protectedToken.startUnitIndex &&
          boundary.unitIndexExclusive < protectedToken.endUnitIndexExclusive,
      ).toBe(false);
    }
  }
}

function assertDeepFrozen(scan: NarrationBoundaryScan): void {
  expect(Object.isFrozen(scan)).toBe(true);
  expect(Object.isFrozen(scan.block)).toBe(true);
  expect(Object.isFrozen(scan.block.structuralContext)).toBe(true);
  expect(Object.isFrozen(scan.block.structuralContext.listPath)).toBe(true);
  expect(Object.isFrozen(scan.block.textContext)).toBe(true);
  expect(Object.isFrozen(scan.block.textContext.inlineContainers)).toBe(true);
  expect(Object.isFrozen(scan.boundaries)).toBe(true);
  expect(Object.isFrozen(scan.protectedTokens)).toBe(true);
  expect(Object.isFrozen(scan.measurements)).toBe(true);
  for (const boundary of scan.boundaries) {
    expect(Object.isFrozen(boundary)).toBe(true);
  }
  for (const protectedToken of scan.protectedTokens) {
    expect(Object.isFrozen(protectedToken)).toBe(true);
    expect(Object.isFrozen(protectedToken.sourceSpan)).toBe(true);
    expect(Object.isFrozen(protectedToken.protections)).toBe(true);
  }
}

function expectContentFreeFailure(
  action: () => unknown,
  code: "internal-failure" | "resource-limit-exceeded",
  canary: string,
): void {
  try {
    action();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    expect((error as EpubArchiveError).code).toBe(code);
    expect((error as Error).message).toBe(code);
    expect(JSON.stringify(error)).not.toContain(canary);
    expect((error as Error).stack ?? "").not.toContain(canary);
    return;
  }
  throw new Error("expected fixed narration boundary failure");
}
