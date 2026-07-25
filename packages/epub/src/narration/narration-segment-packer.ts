import { createIndex } from "@voxleaf/shared";
import type { Index } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  NarrationBoundaryBlockMetadata,
  NarrationBoundaryScan,
  NarrationScannedBoundaryKind,
} from "./narration-boundary-scanner.js";
import type {
  NarrationNormalizedUnit,
  SensitiveNormalizedNarrationText,
} from "./narration-normalizer.js";
import {
  NARRATION_V1_SEGMENT_POLICY,
  NARRATION_V1_SOURCE_WINDOW_POLICY,
} from "./narration-policy.js";
import type { NarrationSourceSpan } from "./narration-source.js";
import {
  DEFAULT_NARRATION_YIELD_SCHEDULER,
  NarrationWorkController,
  type NarrationYieldScheduler,
} from "./narration-work-controller.js";

export type NarrationPackingBoundaryReason =
  | "clause"
  | "dialogue-turn"
  | "hard-limit"
  | "heading"
  | "paragraph"
  | "sentence"
  | "token";

export type NarrationPackedBlockDisposition =
  "scene-break" | "spoken" | "unspoken";

export interface NarrationPackedSegmentMeasurements {
  readonly sourceCodePoints: Index;
  readonly narrationCodePoints: Index;
  readonly narrationUtf8Bytes: Index;
  readonly sentenceCount: Index;
}

export interface NarrationPackedSegment {
  readonly text: SensitiveNormalizedNarrationText;
  readonly sourceSpan: NarrationSourceSpan;
  readonly boundaryReason: NarrationPackingBoundaryReason;
  readonly measurements: NarrationPackedSegmentMeasurements;
}

export interface NarrationPackedBlockMeasurements {
  readonly sourceCodePointsConsumed: Index;
  readonly narrationCodePoints: Index;
  readonly narrationUtf8Bytes: Index;
  readonly sentenceCount: Index;
  readonly segmentCount: Index;
  readonly workUnitCount: Index;
  readonly checkpointCount: Index;
  readonly yieldCount: Index;
}

export interface NarrationPackedBlock {
  readonly block: NarrationBoundaryBlockMetadata;
  readonly complete: boolean;
  readonly disposition: NarrationPackedBlockDisposition;
  readonly segments: readonly NarrationPackedSegment[];
  readonly measurements: NarrationPackedBlockMeasurements;
}

export interface NarrationPackingOptions {
  readonly maximumSegments?: number;
  readonly retainedNarrationCodePointsMaximum?: number;
  readonly retainedNarrationUtf8BytesMaximum?: number;
  readonly signal?: AbortSignal;
  readonly scheduler?: NarrationYieldScheduler;
}

interface ResolvedNarrationPackingLimits {
  readonly maximumSegments: number;
  readonly retainedNarrationCodePointsMaximum: number;
  readonly retainedNarrationUtf8BytesMaximum: number;
}

interface PrefixMeasurements {
  readonly narrationCodePoints: readonly number[];
  readonly narrationUtf8Bytes: readonly number[];
  readonly sentenceCount: readonly number[];
  readonly substantiveUnitCount: readonly number[];
}

interface ValidatedScanMeasurements {
  readonly unitNarrationCodePoints: readonly number[];
  readonly unitNarrationUtf8Bytes: readonly number[];
}

interface PackingContext {
  readonly prefix: PrefixMeasurements;
  readonly recordedBoundaryKinds: readonly (
    NarrationScannedBoundaryKind | undefined
  )[];
  readonly safeBoundaries: readonly boolean[];
}

interface SegmentMeasurements {
  readonly sourceCodePoints: number;
  readonly narrationCodePoints: number;
  readonly narrationUtf8Bytes: number;
  readonly sentenceCount: number;
}

interface CandidateBoundary {
  readonly unitIndexExclusive: number;
  readonly reason: NarrationPackingBoundaryReason;
}

const UTF8_ENCODER = new TextEncoder();
const SCENE_BREAK_ASTERISM = "\u2042";
const COMBINING_MARK_RANGES = Object.freeze([
  Object.freeze([0x0300, 0x036f] as const),
  Object.freeze([0x1ab0, 0x1aff] as const),
  Object.freeze([0x1dc0, 0x1dff] as const),
  Object.freeze([0x20d0, 0x20ff] as const),
  Object.freeze([0xfe20, 0xfe2f] as const),
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

function resolvePackingLimits(
  options: NarrationPackingOptions,
): ResolvedNarrationPackingLimits {
  const maximumSegments =
    options.maximumSegments ??
    NARRATION_V1_SEGMENT_POLICY.retainedSegmentEntriesHardMaximum;
  const retainedNarrationCodePointsMaximum =
    options.retainedNarrationCodePointsMaximum ??
    NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum;
  const retainedNarrationUtf8BytesMaximum =
    options.retainedNarrationUtf8BytesMaximum ??
    NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum;
  if (
    !Number.isSafeInteger(maximumSegments) ||
    maximumSegments <= 0 ||
    maximumSegments >
      NARRATION_V1_SEGMENT_POLICY.retainedSegmentEntriesHardMaximum ||
    !Number.isSafeInteger(retainedNarrationCodePointsMaximum) ||
    retainedNarrationCodePointsMaximum <
      NARRATION_V1_SEGMENT_POLICY.narrationCodePointsHardMaximum ||
    retainedNarrationCodePointsMaximum >
      NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum ||
    !Number.isSafeInteger(retainedNarrationUtf8BytesMaximum) ||
    retainedNarrationUtf8BytesMaximum <
      NARRATION_V1_SEGMENT_POLICY.narrationUtf8BytesHardMaximum ||
    retainedNarrationUtf8BytesMaximum >
      NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum
  ) {
    return fail();
  }
  return Object.freeze({
    maximumSegments,
    retainedNarrationCodePointsMaximum,
    retainedNarrationUtf8BytesMaximum,
  });
}

async function measureTextCodePoints(
  value: string,
  work: NarrationWorkController,
): Promise<number> {
  let count = 0;
  for (const codePoint of value) {
    void codePoint;
    count = addSafe(count, 1);
    await work.observe();
    if (
      count >
      NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum
    ) {
      return fail();
    }
  }
  return count;
}

function utf8ByteLength(value: string): number {
  return UTF8_ENCODER.encode(value).byteLength;
}

function sourceOffsetAt(
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

function isSubstantive(unit: NarrationNormalizedUnit): boolean {
  return (
    unit.kind === "text" &&
    unit.role !== "semantic-line-break" &&
    unit.role !== "whitespace"
  );
}

async function prefixMeasurements(
  scan: NarrationBoundaryScan,
  validated: ValidatedScanMeasurements,
  work: NarrationWorkController,
): Promise<PrefixMeasurements> {
  const { units } = scan.normalized;
  const narrationCodePoints = [0];
  const narrationUtf8Bytes = [0];
  const sentenceBoundaryCounts = Array.from(
    { length: units.length + 1 },
    () => 0,
  );
  const sentenceCount = [0];
  const substantiveUnitCount = [0];

  for (const boundary of scan.boundaries) {
    await work.observe();
    if (boundary.kind === "sentence") {
      const position = Number(boundary.unitIndexExclusive);
      const current = sentenceBoundaryCounts[position];
      if (current === undefined) {
        return fail();
      }
      sentenceBoundaryCounts[position] = addSafe(current, 1);
    }
  }

  for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
    await work.observe();
    const unit = units[unitIndex];
    if (unit === undefined) {
      return fail();
    }
    const unitIndexExclusive = narrationCodePoints.length;
    narrationCodePoints.push(
      addSafe(
        narrationCodePoints[narrationCodePoints.length - 1] ?? fail(),
        validated.unitNarrationCodePoints[unitIndex] ?? fail(),
      ),
    );
    narrationUtf8Bytes.push(
      addSafe(
        narrationUtf8Bytes[narrationUtf8Bytes.length - 1] ?? fail(),
        validated.unitNarrationUtf8Bytes[unitIndex] ?? fail(),
      ),
    );
    sentenceCount.push(
      addSafe(
        sentenceCount[sentenceCount.length - 1] ?? fail(),
        sentenceBoundaryCounts[unitIndexExclusive] ?? fail(),
      ),
    );
    substantiveUnitCount.push(
      addSafe(
        substantiveUnitCount[substantiveUnitCount.length - 1] ?? fail(),
        isSubstantive(unit) ? 1 : 0,
      ),
    );
  }

  return Object.freeze({
    narrationCodePoints: Object.freeze(narrationCodePoints),
    narrationUtf8Bytes: Object.freeze(narrationUtf8Bytes),
    sentenceCount: Object.freeze(sentenceCount),
    substantiveUnitCount: Object.freeze(substantiveUnitCount),
  });
}

function difference(
  values: readonly number[],
  start: number,
  end: number,
): number {
  const startValue = values[start];
  const endValue = values[end];
  if (startValue === undefined || endValue === undefined) {
    return fail();
  }
  const result = endValue - startValue;
  return Number.isSafeInteger(result) && result >= 0 ? result : fail();
}

function measurementsBetween(
  scan: NarrationBoundaryScan,
  prefix: PrefixMeasurements,
  startUnitIndex: number,
  endUnitIndexExclusive: number,
): SegmentMeasurements {
  return Object.freeze({
    sourceCodePoints:
      sourceOffsetAt(scan.normalized.units, endUnitIndexExclusive) -
      sourceOffsetAt(scan.normalized.units, startUnitIndex),
    narrationCodePoints: difference(
      prefix.narrationCodePoints,
      startUnitIndex,
      endUnitIndexExclusive,
    ),
    narrationUtf8Bytes: difference(
      prefix.narrationUtf8Bytes,
      startUnitIndex,
      endUnitIndexExclusive,
    ),
    sentenceCount: difference(
      prefix.sentenceCount,
      startUnitIndex,
      endUnitIndexExclusive,
    ),
  });
}

function withinTarget(measurements: SegmentMeasurements): boolean {
  return (
    measurements.sourceCodePoints <=
      NARRATION_V1_SEGMENT_POLICY.sourceCodePointsTarget &&
    measurements.narrationCodePoints <=
      NARRATION_V1_SEGMENT_POLICY.narrationCodePointsTarget &&
    measurements.narrationUtf8Bytes <=
      NARRATION_V1_SEGMENT_POLICY.narrationUtf8BytesTarget &&
    measurements.sentenceCount <= NARRATION_V1_SEGMENT_POLICY.sentencesTarget
  );
}

function withinHardMaximum(measurements: SegmentMeasurements): boolean {
  return (
    measurements.sourceCodePoints <=
      NARRATION_V1_SEGMENT_POLICY.sourceCodePointsHardMaximum &&
    measurements.narrationCodePoints <=
      NARRATION_V1_SEGMENT_POLICY.narrationCodePointsHardMaximum &&
    measurements.narrationUtf8Bytes <=
      NARRATION_V1_SEGMENT_POLICY.narrationUtf8BytesHardMaximum &&
    measurements.sentenceCount <=
      NARRATION_V1_SEGMENT_POLICY.sentencesHardMaximum
  );
}

function firstCodePoint(value: string): number | undefined {
  for (const codePoint of value) {
    return codePoint.codePointAt(0);
  }
  return undefined;
}

function isCombiningMarkCodePoint(codePoint: number): boolean {
  return COMBINING_MARK_RANGES.some(
    ([start, end]) => codePoint >= start && codePoint <= end,
  );
}

function startsWithCombiningMark(
  unit: NarrationNormalizedUnit | undefined,
): boolean {
  if (unit === undefined || unit.kind !== "text") {
    return false;
  }
  const codePoint = firstCodePoint(String(unit.text));
  return codePoint !== undefined && isCombiningMarkCodePoint(codePoint);
}

function boundaryReason(
  kind: NarrationScannedBoundaryKind,
): NarrationPackingBoundaryReason {
  switch (kind) {
    case "clause":
      return "clause";
    case "dialogue-turn":
      return "dialogue-turn";
    case "sentence":
      return "sentence";
  }
  const unreachable: never = kind;
  void unreachable;
  return fail();
}

async function packingContext(
  scan: NarrationBoundaryScan,
  validated: ValidatedScanMeasurements,
  work: NarrationWorkController,
): Promise<PackingContext> {
  const unitCount = scan.normalized.units.length;
  const recordedBoundaryKinds: (NarrationScannedBoundaryKind | undefined)[] =
    Array.from({ length: unitCount + 1 }, () => undefined);
  const protectedInteriors = Array.from({ length: unitCount + 1 }, () => false);

  let previousBoundaryPosition = -1;
  for (const boundary of scan.boundaries) {
    await work.observe();
    const position = Number(boundary.unitIndexExclusive);
    if (
      position < 0 ||
      position > unitCount ||
      position <= previousBoundaryPosition ||
      boundary.sourceOffsetCodePoints !==
        sourceOffsetAt(scan.normalized.units, position) ||
      recordedBoundaryKinds[position] !== undefined
    ) {
      return fail();
    }
    recordedBoundaryKinds[position] = boundary.kind;
    previousBoundaryPosition = position;
  }
  let previousProtectedEnd = 0;
  for (const token of scan.protectedTokens) {
    await work.observe();
    const start = Number(token.startUnitIndex);
    const end = Number(token.endUnitIndexExclusive);
    if (
      start < previousProtectedEnd ||
      start < 0 ||
      end <= start ||
      end > unitCount ||
      token.sourceSpan.startOffsetCodePoints !==
        sourceOffsetAt(scan.normalized.units, start) ||
      token.sourceSpan.endOffsetCodePoints !==
        sourceOffsetAt(scan.normalized.units, end) ||
      token.narrationCodePoints <= 0 ||
      token.narrationCodePoints >
        NARRATION_V1_SOURCE_WINDOW_POLICY.protectedTokenCodePointsHardMaximum
    ) {
      return fail();
    }
    for (let position = start + 1; position < end; position += 1) {
      await work.observe();
      protectedInteriors[position] = true;
    }
    previousProtectedEnd = end;
  }

  const safeBoundaries: boolean[] = [];
  for (let position = 0; position <= unitCount; position += 1) {
    await work.observe();
    safeBoundaries.push(
      position > 0 &&
        !protectedInteriors[position] &&
        !startsWithCombiningMark(scan.normalized.units[position]),
    );
  }
  return Object.freeze({
    prefix: await prefixMeasurements(scan, validated, work),
    recordedBoundaryKinds: Object.freeze(recordedBoundaryKinds),
    safeBoundaries: Object.freeze(safeBoundaries),
  });
}

function preferLatestTarget(
  current: CandidateBoundary | undefined,
  candidate: CandidateBoundary,
  measurements: SegmentMeasurements,
): CandidateBoundary | undefined {
  return withinTarget(measurements) ? candidate : current;
}

function preferFirstHard(
  current: CandidateBoundary | undefined,
  candidate: CandidateBoundary,
): CandidateBoundary {
  return current ?? candidate;
}

async function selectCandidate(
  scan: NarrationBoundaryScan,
  context: PackingContext,
  startUnitIndex: number,
  work: NarrationWorkController,
): Promise<CandidateBoundary> {
  const { prefix, recordedBoundaryKinds, safeBoundaries } = context;
  const blockEnd = scan.normalized.units.length;
  let targetSentence: CandidateBoundary | undefined;
  let firstHardSentence: CandidateBoundary | undefined;
  let targetClause: CandidateBoundary | undefined;
  let firstHardClause: CandidateBoundary | undefined;
  let targetWhitespace: CandidateBoundary | undefined;
  let firstHardWhitespace: CandidateBoundary | undefined;
  let targetToken: CandidateBoundary | undefined;
  let firstHardToken: CandidateBoundary | undefined;
  let latestHard: CandidateBoundary | undefined;

  for (
    let unitIndexExclusive = startUnitIndex + 1;
    unitIndexExclusive <= blockEnd;
    unitIndexExclusive += 1
  ) {
    await work.observe();
    const measurements = measurementsBetween(
      scan,
      prefix,
      startUnitIndex,
      unitIndexExclusive,
    );
    if (!withinHardMaximum(measurements)) {
      break;
    }
    if (
      difference(
        prefix.substantiveUnitCount,
        startUnitIndex,
        unitIndexExclusive,
      ) === 0 ||
      safeBoundaries[unitIndexExclusive] !== true
    ) {
      continue;
    }

    latestHard = Object.freeze({
      unitIndexExclusive,
      reason: "hard-limit" as const,
    });
    if (unitIndexExclusive === blockEnd && withinTarget(measurements)) {
      return Object.freeze({
        unitIndexExclusive: blockEnd,
        reason:
          scan.block.blockKind === "heading"
            ? ("heading" as const)
            : ("paragraph" as const),
      });
    }

    const recordedKind = recordedBoundaryKinds[unitIndexExclusive];
    if (recordedKind !== undefined) {
      const candidate = Object.freeze({
        unitIndexExclusive,
        reason: boundaryReason(recordedKind),
      });
      if (candidate.reason === "dialogue-turn") {
        return candidate;
      }
      if (candidate.reason === "sentence") {
        targetSentence = preferLatestTarget(
          targetSentence,
          candidate,
          measurements,
        );
        firstHardSentence = preferFirstHard(firstHardSentence, candidate);
      } else if (candidate.reason === "clause") {
        targetClause = preferLatestTarget(
          targetClause,
          candidate,
          measurements,
        );
        firstHardClause = preferFirstHard(firstHardClause, candidate);
      }
    }

    const previous = scan.normalized.units[unitIndexExclusive - 1];
    if (previous?.kind === "text" && previous.role === "whitespace") {
      const candidate = Object.freeze({
        unitIndexExclusive,
        reason: "token" as const,
      });
      targetWhitespace = preferLatestTarget(
        targetWhitespace,
        candidate,
        measurements,
      );
      firstHardWhitespace = preferFirstHard(firstHardWhitespace, candidate);
    } else if (
      previous?.kind === "text" &&
      (previous.role === "punctuation" ||
        previous.role === "quotation" ||
        previous.role === "symbol")
    ) {
      const candidate = Object.freeze({
        unitIndexExclusive,
        reason: "token" as const,
      });
      targetToken = preferLatestTarget(targetToken, candidate, measurements);
      firstHardToken = preferFirstHard(firstHardToken, candidate);
    }
  }

  const candidate =
    targetSentence ??
    firstHardSentence ??
    targetClause ??
    firstHardClause ??
    targetWhitespace ??
    firstHardWhitespace ??
    targetToken ??
    firstHardToken ??
    latestHard;
  if (candidate === undefined) {
    return resourceLimitExceeded();
  }
  let extendedUnitIndexExclusive = candidate.unitIndexExclusive;
  while (extendedUnitIndexExclusive < blockEnd) {
    await work.observe();
    const next = scan.normalized.units[extendedUnitIndexExclusive];
    const nextPosition = extendedUnitIndexExclusive + 1;
    if (
      next === undefined ||
      isSubstantive(next) ||
      safeBoundaries[nextPosition] !== true ||
      !withinHardMaximum(
        measurementsBetween(scan, prefix, startUnitIndex, nextPosition),
      )
    ) {
      break;
    }
    extendedUnitIndexExclusive = nextPosition;
  }
  if (extendedUnitIndexExclusive === blockEnd) {
    return Object.freeze({
      unitIndexExclusive: blockEnd,
      reason:
        scan.block.blockKind === "heading"
          ? ("heading" as const)
          : ("paragraph" as const),
    });
  }
  return extendedUnitIndexExclusive === candidate.unitIndexExclusive
    ? candidate
    : Object.freeze({
        ...candidate,
        unitIndexExclusive: extendedUnitIndexExclusive,
      });
}

async function segmentText(
  units: readonly NarrationNormalizedUnit[],
  startUnitIndex: number,
  endUnitIndexExclusive: number,
  work: NarrationWorkController,
): Promise<SensitiveNormalizedNarrationText> {
  const parts: string[] = [];
  for (
    let unitIndex = startUnitIndex;
    unitIndex < endUnitIndexExclusive;
    unitIndex += 1
  ) {
    const unit = units[unitIndex];
    if (unit === undefined) {
      return fail();
    }
    if (unit.kind === "text") {
      const text = String(unit.text);
      for (const codePoint of text) {
        void codePoint;
        await work.observe();
      }
      parts.push(text);
    }
  }
  return parts.join("") as SensitiveNormalizedNarrationText;
}

async function isRecognizedSceneBreak(
  scan: NarrationBoundaryScan,
  work: NarrationWorkController,
): Promise<boolean> {
  if (
    scan.block.blockKind !== "paragraph" ||
    scan.block.sourceStartOffsetCodePoints !== 0 ||
    scan.block.sourceEndOffsetCodePoints !== scan.block.blockSourceCodePoints ||
    scan.block.structuralContext.quoteDepth !== 0 ||
    scan.block.structuralContext.listPath.length !== 0
  ) {
    return false;
  }
  const parts: string[] = [];
  let nonWhitespaceCodePoints = 0;
  for (const unit of scan.normalized.units) {
    await work.observe();
    if (unit.kind === "omission" && unit.reason === "raster-placeholder") {
      return false;
    }
    if (
      unit.kind !== "text" ||
      unit.role === "whitespace" ||
      unit.role === "semantic-line-break"
    ) {
      continue;
    }
    const text = String(unit.text);
    nonWhitespaceCodePoints = addSafe(
      nonWhitespaceCodePoints,
      await measureTextCodePoints(text, work),
    );
    if (nonWhitespaceCodePoints > 3) {
      return false;
    }
    parts.push(text);
  }
  const nonWhitespace = parts.join("");
  return nonWhitespace === "***" || nonWhitespace === SCENE_BREAK_ASTERISM;
}

async function validateScan(
  scan: NarrationBoundaryScan,
  work: NarrationWorkController,
): Promise<ValidatedScanMeasurements> {
  if (
    scan === null ||
    typeof scan !== "object" ||
    scan.block === null ||
    typeof scan.block !== "object" ||
    !Number.isSafeInteger(scan.block.blockSourceCodePoints) ||
    !Number.isSafeInteger(scan.block.sourceStartOffsetCodePoints) ||
    !Number.isSafeInteger(scan.block.sourceEndOffsetCodePoints) ||
    !Number.isSafeInteger(scan.block.sourceCodePoints) ||
    scan.block.sourceStartOffsetCodePoints < 0 ||
    scan.block.sourceEndOffsetCodePoints <
      scan.block.sourceStartOffsetCodePoints ||
    scan.block.sourceEndOffsetCodePoints > scan.block.blockSourceCodePoints ||
    scan.block.sourceCodePoints !==
      scan.block.sourceEndOffsetCodePoints -
        scan.block.sourceStartOffsetCodePoints ||
    !Array.isArray(scan.normalized?.units) ||
    typeof scan.normalized.text !== "string" ||
    !Array.isArray(scan.boundaries) ||
    !Array.isArray(scan.protectedTokens)
  ) {
    return fail();
  }
  if (
    scan.normalized.units.length >
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum ||
    scan.boundaries.length >
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedEventEntriesHardMaximum ||
    scan.protectedTokens.length >
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedEventEntriesHardMaximum
  ) {
    return resourceLimitExceeded();
  }
  let expectedSourceOffset = scan.block.sourceStartOffsetCodePoints;
  let retainedNarrationCodePoints = 0;
  let retainedNarrationUtf8Bytes = 0;
  const textParts: string[] = [];
  const unitNarrationCodePoints: number[] = [];
  const unitNarrationUtf8Bytes: number[] = [];
  for (const unit of scan.normalized.units) {
    await work.observe();
    if (unit === undefined) {
      return fail();
    }
    if (
      unit.sourceSpan.startOffsetCodePoints !== expectedSourceOffset ||
      unit.sourceSpan.endOffsetCodePoints !== expectedSourceOffset + 1
    ) {
      return fail();
    }
    expectedSourceOffset = unit.sourceSpan.endOffsetCodePoints;
    if (unit.kind === "text") {
      const text = String(unit.text);
      const narrationCodePoints = await measureTextCodePoints(text, work);
      const narrationUtf8Bytes = utf8ByteLength(text);
      retainedNarrationCodePoints = addSafe(
        retainedNarrationCodePoints,
        narrationCodePoints,
      );
      retainedNarrationUtf8Bytes = addSafe(
        retainedNarrationUtf8Bytes,
        narrationUtf8Bytes,
      );
      if (
        retainedNarrationCodePoints >
          NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum ||
        retainedNarrationUtf8Bytes >
          NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum
      ) {
        return resourceLimitExceeded();
      }
      textParts.push(text);
      unitNarrationCodePoints.push(narrationCodePoints);
      unitNarrationUtf8Bytes.push(narrationUtf8Bytes);
    } else {
      unitNarrationCodePoints.push(0);
      unitNarrationUtf8Bytes.push(0);
    }
  }
  if (
    expectedSourceOffset !== scan.block.sourceEndOffsetCodePoints ||
    textParts.join("") !== scan.normalized.text
  ) {
    return fail();
  }
  return Object.freeze({
    unitNarrationCodePoints: Object.freeze(unitNarrationCodePoints),
    unitNarrationUtf8Bytes: Object.freeze(unitNarrationUtf8Bytes),
  });
}

function emptyPackedBlock(
  scan: NarrationBoundaryScan,
  disposition: "scene-break" | "unspoken",
  work: NarrationWorkController,
): NarrationPackedBlock {
  return Object.freeze({
    block: scan.block,
    complete: true,
    disposition,
    segments: Object.freeze([]),
    measurements: Object.freeze({
      sourceCodePointsConsumed: indexFrom(scan.block.sourceCodePoints),
      narrationCodePoints: indexFrom(0),
      narrationUtf8Bytes: indexFrom(0),
      sentenceCount: indexFrom(0),
      segmentCount: indexFrom(0),
      workUnitCount: indexFrom(work.workUnitCount),
      checkpointCount: indexFrom(work.checkpointCount),
      yieldCount: indexFrom(work.yieldCount),
    }),
  });
}

async function packNarrationBoundaryScanInternal(
  scan: NarrationBoundaryScan,
  options: NarrationPackingOptions,
): Promise<NarrationPackedBlock> {
  const signal = options.signal ?? new AbortController().signal;
  const scheduler = options.scheduler ?? DEFAULT_NARRATION_YIELD_SCHEDULER;
  const limits = resolvePackingLimits(options);
  const work = new NarrationWorkController(signal, scheduler);
  const validated = await validateScan(scan, work);
  const context = await packingContext(scan, validated, work);
  const { prefix } = context;
  const substantiveUnitCount =
    prefix.substantiveUnitCount[prefix.substantiveUnitCount.length - 1] ??
    fail();
  if (await isRecognizedSceneBreak(scan, work)) {
    work.beforePublication();
    return emptyPackedBlock(scan, "scene-break", work);
  }
  if (substantiveUnitCount === 0) {
    work.beforePublication();
    return emptyPackedBlock(scan, "unspoken", work);
  }

  const segments: NarrationPackedSegment[] = [];
  let startUnitIndex = 0;
  let totalNarrationCodePoints = 0;
  let totalNarrationUtf8Bytes = 0;
  let totalSentenceCount = 0;

  while (startUnitIndex < scan.normalized.units.length) {
    await work.observe();
    if (segments.length >= limits.maximumSegments) {
      break;
    }
    const remainingSubstantive = difference(
      prefix.substantiveUnitCount,
      startUnitIndex,
      scan.normalized.units.length,
    );
    if (remainingSubstantive === 0) {
      break;
    }
    const candidate = await selectCandidate(
      scan,
      context,
      startUnitIndex,
      work,
    );
    if (candidate.unitIndexExclusive <= startUnitIndex) {
      return fail();
    }
    const measurements = measurementsBetween(
      scan,
      prefix,
      startUnitIndex,
      candidate.unitIndexExclusive,
    );
    if (
      !withinHardMaximum(measurements) ||
      measurements.narrationCodePoints === 0
    ) {
      return resourceLimitExceeded();
    }
    const nextNarrationCodePoints = addSafe(
      totalNarrationCodePoints,
      measurements.narrationCodePoints,
    );
    const nextNarrationUtf8Bytes = addSafe(
      totalNarrationUtf8Bytes,
      measurements.narrationUtf8Bytes,
    );
    if (
      nextNarrationCodePoints > limits.retainedNarrationCodePointsMaximum ||
      nextNarrationUtf8Bytes > limits.retainedNarrationUtf8BytesMaximum
    ) {
      break;
    }
    const text = await segmentText(
      scan.normalized.units,
      startUnitIndex,
      candidate.unitIndexExclusive,
      work,
    );
    if (text.length === 0) {
      return fail();
    }
    await work.observe();
    segments.push(
      Object.freeze({
        text,
        sourceSpan: copySourceSpan(
          sourceOffsetAt(scan.normalized.units, startUnitIndex),
          sourceOffsetAt(scan.normalized.units, candidate.unitIndexExclusive),
        ),
        boundaryReason: candidate.reason,
        measurements: Object.freeze({
          sourceCodePoints: indexFrom(measurements.sourceCodePoints),
          narrationCodePoints: indexFrom(measurements.narrationCodePoints),
          narrationUtf8Bytes: indexFrom(measurements.narrationUtf8Bytes),
          sentenceCount: indexFrom(measurements.sentenceCount),
        }),
      }),
    );
    totalNarrationCodePoints = nextNarrationCodePoints;
    totalNarrationUtf8Bytes = nextNarrationUtf8Bytes;
    totalSentenceCount = addSafe(
      totalSentenceCount,
      measurements.sentenceCount,
    );
    startUnitIndex = candidate.unitIndexExclusive;
  }

  const complete =
    difference(
      prefix.substantiveUnitCount,
      startUnitIndex,
      scan.normalized.units.length,
    ) === 0;
  work.beforePublication();
  return Object.freeze({
    block: scan.block,
    complete,
    disposition: "spoken",
    segments: Object.freeze(segments),
    measurements: Object.freeze({
      sourceCodePointsConsumed: indexFrom(
        complete
          ? scan.block.sourceCodePoints
          : sourceOffsetAt(scan.normalized.units, startUnitIndex) -
              scan.block.sourceStartOffsetCodePoints,
      ),
      narrationCodePoints: indexFrom(totalNarrationCodePoints),
      narrationUtf8Bytes: indexFrom(totalNarrationUtf8Bytes),
      sentenceCount: indexFrom(totalSentenceCount),
      segmentCount: indexFrom(segments.length),
      workUnitCount: indexFrom(work.workUnitCount),
      checkpointCount: indexFrom(work.checkpointCount),
      yieldCount: indexFrom(work.yieldCount),
    }),
  });
}

/**
 * Packs one source-mapped block into stable segments. The block-local input
 * makes cross-addressable-block joins impossible, and no requested batch size
 * participates in segmentation.
 */
export async function packNarrationBoundaryScan(
  scan: NarrationBoundaryScan,
  options: NarrationPackingOptions = {},
): Promise<NarrationPackedBlock> {
  try {
    return await packNarrationBoundaryScanInternal(scan, options);
  } catch (error: unknown) {
    if (error instanceof EpubArchiveError) {
      throw error;
    }
    throw new EpubArchiveError("internal-failure");
  }
}
