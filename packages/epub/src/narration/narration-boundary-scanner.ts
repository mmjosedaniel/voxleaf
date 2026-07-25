import { createIndex } from "@voxleaf/shared";
import type { Index } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  NarrationNormalizedStream,
  NarrationNormalizedTextUnit,
  NarrationNormalizedUnit,
  NarrationNormalizationBoundaryProtection,
} from "./narration-normalizer.js";
import { NARRATION_V1_SOURCE_WINDOW_POLICY } from "./narration-policy.js";
import type {
  NarrationSourceListContext,
  NarrationSourceStructuralContext,
  NarrationSourceTextContext,
} from "./narration-source-projector.js";
import type {
  NarrationSourceSpan,
  NarrationSourceTokenLeafEvent,
} from "./narration-source.js";

export const NARRATION_PROTECTED_TOKEN_PROTECTIONS = Object.freeze([
  "abbreviation-period",
  "code-span",
  "currency-token",
  "date-token",
  "decimal-token",
  "ellipsis",
  "genuine-compound",
  "initial-period",
  "line-end-hyphen",
  "malformed-punctuation",
  "percentage-token",
  "symbol-token",
  "thousands-token",
  "time-token",
] as const satisfies readonly NarrationNormalizationBoundaryProtection[]);

export type NarrationProtectedTokenProtection =
  (typeof NARRATION_PROTECTED_TOKEN_PROTECTIONS)[number];

export type NarrationScannedBoundaryKind =
  "clause" | "dialogue-turn" | "sentence";

/**
 * A split point between normalized units. `unitIndexExclusive` is the first
 * unit after the boundary and may equal zero or the stream length.
 */
export interface NarrationScannedBoundary {
  readonly kind: NarrationScannedBoundaryKind;
  readonly unitIndexExclusive: Index;
  readonly sourceOffsetCodePoints: Index;
}

/**
 * One contiguous normalized token that later packing may not split.
 */
export interface NarrationProtectedToken {
  readonly startUnitIndex: Index;
  readonly endUnitIndexExclusive: Index;
  readonly sourceSpan: NarrationSourceSpan;
  readonly narrationCodePoints: Index;
  readonly protections: readonly NarrationProtectedTokenProtection[];
}

export interface NarrationBoundaryBlockMetadata {
  readonly blockKind: "heading" | "paragraph";
  readonly headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  readonly blockSourceCodePoints: Index;
  readonly sourceStartOffsetCodePoints: Index;
  readonly sourceEndOffsetCodePoints: Index;
  readonly sourceCodePoints: Index;
  readonly structuralContext: NarrationSourceStructuralContext;
  readonly textContext: NarrationSourceTextContext;
}

export interface NarrationBoundaryScanMeasurements {
  readonly unitCount: Index;
  readonly unitVisitCount: Index;
  readonly boundaryCount: Index;
  readonly protectedTokenCount: Index;
  readonly sentenceCount: Index;
}

export interface NarrationBoundaryScan {
  readonly block: NarrationBoundaryBlockMetadata;
  readonly normalized: NarrationNormalizedStream;
  readonly boundaries: readonly NarrationScannedBoundary[];
  readonly protectedTokens: readonly NarrationProtectedToken[];
  readonly measurements: NarrationBoundaryScanMeasurements;
}

interface MutableProtectedToken {
  readonly startUnitIndex: number;
  endUnitIndexExclusive: number;
  readonly sourceStartOffsetCodePoints: number;
  sourceEndOffsetCodePoints: number;
  narrationCodePoints: number;
  readonly protections: readonly NarrationProtectedTokenProtection[];
}

interface PendingSentenceBoundary {
  readonly unitIndexExclusive: number;
  readonly sourceOffsetCodePoints: number;
}

const BOUNDARY_PRIORITY: Readonly<
  Record<NarrationScannedBoundaryKind, number>
> = Object.freeze({
  clause: 0,
  "dialogue-turn": 1,
  sentence: 2,
});

const CLOSING_SENTENCE_SUFFIXES = new Set([
  '"',
  ")",
  "]",
  "}",
  "\u00bb",
  "\u2019",
  "\u201d",
  "\u203a",
]);

function fail(): never {
  throw new EpubArchiveError("internal-failure");
}

function resourceLimitExceeded(): never {
  throw new EpubArchiveError("resource-limit-exceeded");
}

function indexFrom(value: number): Index {
  try {
    return createIndex(value);
  } catch {
    return fail();
  }
}

function addSafe(left: number, right: number): number {
  const result = left + right;
  return Number.isSafeInteger(result) ? result : fail();
}

function codePointLength(value: string): number {
  let count = 0;
  for (const codePoint of value) {
    void codePoint;
    count = addSafe(count, 1);
  }
  return count;
}

function copySourceSpan(
  startOffsetCodePoints: number,
  endOffsetCodePoints: number,
): NarrationSourceSpan {
  if (
    !Number.isSafeInteger(startOffsetCodePoints) ||
    !Number.isSafeInteger(endOffsetCodePoints) ||
    startOffsetCodePoints < 0 ||
    endOffsetCodePoints <= startOffsetCodePoints
  ) {
    return fail();
  }
  return Object.freeze({
    startOffsetCodePoints: indexFrom(startOffsetCodePoints),
    endOffsetCodePoints: indexFrom(endOffsetCodePoints),
  });
}

function copyTextContext(
  context: NarrationSourceTextContext,
): NarrationSourceTextContext {
  if (
    context === null ||
    typeof context !== "object" ||
    !Array.isArray(context.inlineContainers)
  ) {
    return fail();
  }
  return Object.freeze({
    ...(context.language === undefined ? {} : { language: context.language }),
    ...(context.direction === undefined
      ? {}
      : { direction: context.direction }),
    inlineContainers: Object.freeze([...context.inlineContainers]),
  });
}

function copyListContext(
  context: NarrationSourceListContext,
): NarrationSourceListContext {
  if (
    typeof context.ordered !== "boolean" ||
    !Number.isSafeInteger(context.itemIndex) ||
    context.itemIndex < 0
  ) {
    return fail();
  }
  return Object.freeze({
    ordered: context.ordered,
    itemIndex: context.itemIndex,
  });
}

function copyStructuralContext(
  context: NarrationSourceStructuralContext,
): NarrationSourceStructuralContext {
  if (
    context === null ||
    typeof context !== "object" ||
    !Number.isSafeInteger(context.quoteDepth) ||
    context.quoteDepth < 0 ||
    !Array.isArray(context.listPath)
  ) {
    return fail();
  }
  return Object.freeze({
    quoteDepth: context.quoteDepth,
    listPath: Object.freeze(context.listPath.map(copyListContext)),
  });
}

function copyBlockMetadata(
  source: NarrationSourceTokenLeafEvent,
): NarrationBoundaryBlockMetadata {
  const sourceStartOffsetCodePoints = source.sourceStartOffsetCodePoints;
  const sourceEndOffsetCodePoints = source.sourceEndOffsetCodePoints;
  const sourceCodePoints = source.sourceCodePoints;
  if (
    !Number.isSafeInteger(sourceStartOffsetCodePoints) ||
    !Number.isSafeInteger(sourceEndOffsetCodePoints) ||
    !Number.isSafeInteger(sourceCodePoints) ||
    sourceStartOffsetCodePoints < 0 ||
    sourceEndOffsetCodePoints < sourceStartOffsetCodePoints ||
    sourceCodePoints !==
      sourceEndOffsetCodePoints - sourceStartOffsetCodePoints ||
    sourceEndOffsetCodePoints > source.locatedBlock.textLengthCodePoints
  ) {
    return fail();
  }
  const common = {
    blockSourceCodePoints: indexFrom(source.locatedBlock.textLengthCodePoints),
    sourceStartOffsetCodePoints: indexFrom(sourceStartOffsetCodePoints),
    sourceEndOffsetCodePoints: indexFrom(sourceEndOffsetCodePoints),
    sourceCodePoints: indexFrom(sourceCodePoints),
    structuralContext: copyStructuralContext(source.structuralContext),
    textContext: copyTextContext(source.textContext),
  };
  return source.blockKind === "heading"
    ? Object.freeze({
        ...common,
        blockKind: "heading" as const,
        headingLevel: source.headingLevel,
      })
    : Object.freeze({
        ...common,
        blockKind: "paragraph" as const,
      });
}

function protectedTokenProtections(
  unit: NarrationNormalizedUnit,
): readonly NarrationProtectedTokenProtection[] {
  return Object.freeze(
    NARRATION_PROTECTED_TOKEN_PROTECTIONS.filter((protection) =>
      unit.boundaryProtections.includes(protection),
    ),
  );
}

function sameProtections(
  left: readonly NarrationProtectedTokenProtection[],
  right: readonly NarrationProtectedTokenProtection[],
): boolean {
  return (
    left.length === right.length &&
    left.every((protection, index) => protection === right[index])
  );
}

function narrationCodePoints(unit: NarrationNormalizedUnit): number {
  return unit.kind === "text" ? codePointLength(String(unit.text)) : 0;
}

function finishProtectedToken(
  mutable: MutableProtectedToken | undefined,
  protectedTokens: NarrationProtectedToken[],
): void {
  if (mutable === undefined || mutable.narrationCodePoints === 0) {
    return;
  }
  protectedTokens.push(
    Object.freeze({
      startUnitIndex: indexFrom(mutable.startUnitIndex),
      endUnitIndexExclusive: indexFrom(mutable.endUnitIndexExclusive),
      sourceSpan: copySourceSpan(
        mutable.sourceStartOffsetCodePoints,
        mutable.sourceEndOffsetCodePoints,
      ),
      narrationCodePoints: indexFrom(mutable.narrationCodePoints),
      protections: mutable.protections,
    }),
  );
}

function collectProtectedTokens(
  source: NarrationSourceTokenLeafEvent,
  normalized: NarrationNormalizedStream,
): readonly NarrationProtectedToken[] {
  const { units } = normalized;
  if (
    !Array.isArray(source.sourceTokens) ||
    !Array.isArray(units) ||
    units.length !== source.sourceTokens.length ||
    units.length >
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum
  ) {
    return fail();
  }

  const protectedTokens: NarrationProtectedToken[] = [];
  const textParts: string[] = [];
  let current: MutableProtectedToken | undefined;
  let expectedSourceOffset = source.sourceStartOffsetCodePoints;

  for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
    const sourceToken = source.sourceTokens[unitIndex];
    const unit = units[unitIndex];
    if (
      sourceToken === undefined ||
      unit === undefined ||
      unit.sourceSpan.startOffsetCodePoints !== expectedSourceOffset ||
      unit.sourceSpan.endOffsetCodePoints !== expectedSourceOffset + 1 ||
      sourceToken.sourceSpan.startOffsetCodePoints !==
        unit.sourceSpan.startOffsetCodePoints ||
      sourceToken.sourceSpan.endOffsetCodePoints !==
        unit.sourceSpan.endOffsetCodePoints
    ) {
      return fail();
    }
    expectedSourceOffset = unit.sourceSpan.endOffsetCodePoints;
    if (unit.kind === "text") {
      textParts.push(String(unit.text));
    }

    const protections = protectedTokenProtections(unit);
    if (protections.length === 0) {
      finishProtectedToken(current, protectedTokens);
      current = undefined;
      continue;
    }

    const unitNarrationCodePoints = narrationCodePoints(unit);
    if (
      current !== undefined &&
      sameProtections(current.protections, protections) &&
      current.sourceEndOffsetCodePoints ===
        unit.sourceSpan.startOffsetCodePoints
    ) {
      current.endUnitIndexExclusive = unitIndex + 1;
      current.sourceEndOffsetCodePoints = unit.sourceSpan.endOffsetCodePoints;
      current.narrationCodePoints = addSafe(
        current.narrationCodePoints,
        unitNarrationCodePoints,
      );
    } else {
      finishProtectedToken(current, protectedTokens);
      current = {
        startUnitIndex: unitIndex,
        endUnitIndexExclusive: unitIndex + 1,
        sourceStartOffsetCodePoints: unit.sourceSpan.startOffsetCodePoints,
        sourceEndOffsetCodePoints: unit.sourceSpan.endOffsetCodePoints,
        narrationCodePoints: unitNarrationCodePoints,
        protections,
      };
    }

    if (
      current.narrationCodePoints >
      NARRATION_V1_SOURCE_WINDOW_POLICY.protectedTokenCodePointsHardMaximum
    ) {
      return resourceLimitExceeded();
    }
  }

  finishProtectedToken(current, protectedTokens);
  if (
    expectedSourceOffset !== source.sourceEndOffsetCodePoints ||
    textParts.join("") !== normalized.text
  ) {
    return fail();
  }
  return Object.freeze(protectedTokens);
}

function sourceOffsetAtUnitPosition(
  units: readonly NarrationNormalizedUnit[],
  unitIndexExclusive: number,
): number {
  if (
    !Number.isSafeInteger(unitIndexExclusive) ||
    unitIndexExclusive < 0 ||
    unitIndexExclusive > units.length
  ) {
    return fail();
  }
  if (units.length === 0) {
    return 0;
  }
  if (unitIndexExclusive === 0) {
    const first = units[0];
    return first === undefined
      ? fail()
      : first.sourceSpan.startOffsetCodePoints;
  }
  const previous = units[unitIndexExclusive - 1];
  return previous === undefined
    ? fail()
    : previous.sourceSpan.endOffsetCodePoints;
}

function isSentenceEnd(unit: NarrationNormalizedUnit): boolean {
  return unit.boundaryProtections.includes("sentence-end");
}

function isClosingSentenceSuffix(unit: NarrationNormalizedUnit): boolean {
  return (
    unit.kind === "text" &&
    !unit.boundaryProtections.includes("malformed-punctuation") &&
    CLOSING_SENTENCE_SUFFIXES.has(String(unit.text))
  );
}

function isClauseBoundary(unit: NarrationNormalizedTextUnit): boolean {
  if (
    unit.role === "semantic-line-break" ||
    (unit.role === "dialogue-dash" &&
      !unit.boundaryProtections.includes("dialogue-turn"))
  ) {
    return true;
  }
  return (
    unit.role === "punctuation" &&
    (unit.text === "," || unit.text === ";" || unit.text === ":")
  );
}

function isSpokenContent(unit: NarrationNormalizedTextUnit): boolean {
  return unit.role !== "semantic-line-break" && unit.role !== "whitespace";
}

function protectedTokenAt(
  protectedTokens: readonly NarrationProtectedToken[],
  cursor: number,
  unitIndex: number,
): Readonly<{
  token: NarrationProtectedToken | undefined;
  cursor: number;
}> {
  let nextCursor = cursor;
  while (
    nextCursor < protectedTokens.length &&
    Number(
      protectedTokens[nextCursor]?.endUnitIndexExclusive ?? unitIndex + 1,
    ) <= unitIndex
  ) {
    nextCursor += 1;
  }
  const token = protectedTokens[nextCursor];
  return Object.freeze({
    token:
      token !== undefined &&
      token.startUnitIndex <= unitIndex &&
      token.endUnitIndexExclusive > unitIndex
        ? token
        : undefined,
    cursor: nextCursor,
  });
}

function scanBoundaryPoints(
  units: readonly NarrationNormalizedUnit[],
  protectedTokens: readonly NarrationProtectedToken[],
): readonly NarrationScannedBoundary[] {
  const boundaryByPosition = new Map<
    number,
    Readonly<{
      kind: NarrationScannedBoundaryKind;
      sourceOffsetCodePoints: number;
    }>
  >();
  let protectedCursor = 0;
  let pendingSentence: PendingSentenceBoundary | undefined;
  let sentenceHasText = false;
  let lastSpokenUnitIndexExclusive = 0;
  let previousSpokenLanguage: "es" | "und" | undefined;

  const recordBoundary = (
    kind: NarrationScannedBoundaryKind,
    unitIndexExclusive: number,
    sourceOffsetCodePoints: number,
  ): void => {
    const existing = boundaryByPosition.get(unitIndexExclusive);
    if (
      existing === undefined ||
      BOUNDARY_PRIORITY[kind] > BOUNDARY_PRIORITY[existing.kind]
    ) {
      boundaryByPosition.set(
        unitIndexExclusive,
        Object.freeze({ kind, sourceOffsetCodePoints }),
      );
    }
  };
  const publishPendingSentence = (): void => {
    if (pendingSentence === undefined) {
      return;
    }
    recordBoundary(
      "sentence",
      pendingSentence.unitIndexExclusive,
      pendingSentence.sourceOffsetCodePoints,
    );
    pendingSentence = undefined;
    sentenceHasText = false;
    previousSpokenLanguage = undefined;
  };

  for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
    const unit = units[unitIndex];
    if (unit === undefined) {
      return fail();
    }
    const protectedAt = protectedTokenAt(
      protectedTokens,
      protectedCursor,
      unitIndex,
    );
    protectedCursor = protectedAt.cursor;
    const protectedToken = protectedAt.token;

    if (pendingSentence !== undefined) {
      if (unitIndex < pendingSentence.unitIndexExclusive) {
        continue;
      }
      if (isSentenceEnd(unit)) {
        const unitIndexExclusive =
          protectedToken?.endUnitIndexExclusive ?? indexFrom(unitIndex + 1);
        pendingSentence = Object.freeze({
          unitIndexExclusive,
          sourceOffsetCodePoints: sourceOffsetAtUnitPosition(
            units,
            unitIndexExclusive,
          ),
        });
        continue;
      }
      if (isClosingSentenceSuffix(unit)) {
        pendingSentence = Object.freeze({
          unitIndexExclusive: unitIndex + 1,
          sourceOffsetCodePoints: unit.sourceSpan.endOffsetCodePoints,
        });
        continue;
      }
      if (unit.kind === "omission") {
        continue;
      }
      publishPendingSentence();
    }

    if (unit.kind === "omission") {
      continue;
    }

    if (unit.boundaryProtections.includes("dialogue-turn")) {
      recordBoundary(
        "dialogue-turn",
        unitIndex,
        unit.sourceSpan.startOffsetCodePoints,
      );
    }

    if (isSpokenContent(unit)) {
      if (
        previousSpokenLanguage !== undefined &&
        previousSpokenLanguage !== unit.effectiveLanguage &&
        protectedToken === undefined
      ) {
        recordBoundary(
          "clause",
          unitIndex,
          unit.sourceSpan.startOffsetCodePoints,
        );
      }
      previousSpokenLanguage = unit.effectiveLanguage;
      sentenceHasText = true;
      lastSpokenUnitIndexExclusive = unitIndex + 1;
    }

    if (isSentenceEnd(unit)) {
      const unitIndexExclusive =
        protectedToken?.endUnitIndexExclusive ?? indexFrom(unitIndex + 1);
      pendingSentence = Object.freeze({
        unitIndexExclusive,
        sourceOffsetCodePoints: sourceOffsetAtUnitPosition(
          units,
          unitIndexExclusive,
        ),
      });
      continue;
    }

    if (protectedToken === undefined && isClauseBoundary(unit)) {
      recordBoundary(
        "clause",
        unitIndex + 1,
        unit.sourceSpan.endOffsetCodePoints,
      );
    }
  }

  publishPendingSentence();
  if (sentenceHasText) {
    recordBoundary(
      "sentence",
      lastSpokenUnitIndexExclusive,
      sourceOffsetAtUnitPosition(units, lastSpokenUnitIndexExclusive),
    );
  }

  return Object.freeze(
    [...boundaryByPosition.entries()]
      .sort(([left], [right]) => left - right)
      .map(([unitIndexExclusive, boundary]) =>
        Object.freeze({
          kind: boundary.kind,
          unitIndexExclusive: indexFrom(unitIndexExclusive),
          sourceOffsetCodePoints: indexFrom(boundary.sourceOffsetCodePoints),
        }),
      ),
  );
}

function scanNarrationBoundariesInternal(
  source: NarrationSourceTokenLeafEvent,
  normalized: NarrationNormalizedStream,
): NarrationBoundaryScan {
  const protectedTokens = collectProtectedTokens(source, normalized);
  const boundaries = scanBoundaryPoints(normalized.units, protectedTokens);
  const sentenceCount = boundaries.filter(
    ({ kind }) => kind === "sentence",
  ).length;
  const unitCount = normalized.units.length;

  return Object.freeze({
    block: copyBlockMetadata(source),
    normalized,
    boundaries,
    protectedTokens,
    measurements: Object.freeze({
      unitCount: indexFrom(unitCount),
      unitVisitCount: indexFrom(addSafe(unitCount, unitCount)),
      boundaryCount: indexFrom(boundaries.length),
      protectedTokenCount: indexFrom(protectedTokens.length),
      sentenceCount: indexFrom(sentenceCount),
    }),
  });
}

/**
 * Scans one normalized, block-local, source-mapped stream without locale or
 * runtime-data segmentation. Failures remain fixed and content-free.
 */
export function scanNarrationBoundaries(
  source: NarrationSourceTokenLeafEvent,
  normalized: NarrationNormalizedStream,
): NarrationBoundaryScan {
  try {
    return scanNarrationBoundariesInternal(source, normalized);
  } catch (error: unknown) {
    if (error instanceof EpubArchiveError) {
      throw error;
    }
    throw new EpubArchiveError("internal-failure");
  }
}
