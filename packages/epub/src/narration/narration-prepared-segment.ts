import {
  createIndex,
  decodeReadingLocatorV1,
  type Index,
  type LocatorRangeV1,
  type ReadingLocatorV1,
  type SensitiveNarrationTextV1,
} from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { PublicationLocatedBlock } from "../document/document-model.js";
import type {
  NarrationBoundaryReason,
  PreparedNarrationMeasurements,
  PreparedNarrationSegment,
} from "../document/narration-model.js";
export type {
  NarrationBoundaryReason,
  PreparedNarrationMeasurements,
  PreparedNarrationSegment,
} from "../document/narration-model.js";
import { createBlockLocatorAtOffset } from "../locator/locator-index.js";
import {
  packNarrationBoundaryScan,
  type NarrationPackedBlock,
  type NarrationPackedBlockDisposition,
  type NarrationPackedBlockMeasurements,
  type NarrationPackedSegment,
  type NarrationPackingOptions,
} from "./narration-segment-packer.js";
import {
  normalizeNarrationSourceTokens,
  type NarrationNormalizationLanguage,
} from "./narration-normalizer.js";
import { scanNarrationBoundaries } from "./narration-boundary-scanner.js";
import {
  createNarrationSourceTokenRange,
  type NarrationSourceTokenLeafEvent,
} from "./narration-source.js";

export interface PreparedNarrationBlock {
  readonly complete: boolean;
  readonly disposition: NarrationPackedBlockDisposition;
  readonly segments: readonly PreparedNarrationSegment[];
  readonly continuation: ReadingLocatorV1;
  readonly measurements: NarrationPackedBlockMeasurements;
}

interface StagedPreparedNarrationSegment {
  readonly text: SensitiveNarrationTextV1;
  readonly sourceRange: LocatorRangeV1;
  readonly boundaryReason: NarrationBoundaryReason;
  readonly measurements: PreparedNarrationMeasurements;
}

const UTF8_ENCODER = new TextEncoder();

function fail(): never {
  throw new EpubArchiveError("internal-failure");
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

function validateLocatedBlock(
  locatedBlock: PublicationLocatedBlock,
  packed: NarrationPackedBlock,
): void {
  if (
    locatedBlock === null ||
    typeof locatedBlock !== "object" ||
    packed === null ||
    typeof packed !== "object" ||
    !Array.isArray(packed.segments) ||
    typeof packed.complete !== "boolean" ||
    packed.block.sourceStartOffsetCodePoints < 0 ||
    packed.block.sourceEndOffsetCodePoints >
      locatedBlock.textLengthCodePoints ||
    packed.block.sourceEndOffsetCodePoints <
      packed.block.sourceStartOffsetCodePoints ||
    packed.block.sourceCodePoints !==
      packed.block.sourceEndOffsetCodePoints -
        packed.block.sourceStartOffsetCodePoints ||
    packed.block.blockKind !== locatedBlock.block.kind ||
    (packed.block.blockKind === "heading" &&
      locatedBlock.block.kind === "heading" &&
      packed.block.headingLevel !== locatedBlock.block.level)
  ) {
    return fail();
  }
}

function copyMeasurements(
  measurements: NarrationPackedSegment["measurements"],
  sourceCodePoints: number,
  text: string,
): PreparedNarrationMeasurements {
  const narrationCodePoints = codePointLength(text);
  const narrationUtf8Bytes = UTF8_ENCODER.encode(text).byteLength;
  if (
    measurements.sourceCodePoints !== sourceCodePoints ||
    measurements.narrationCodePoints !== narrationCodePoints ||
    measurements.narrationUtf8Bytes !== narrationUtf8Bytes ||
    measurements.sourceCodePoints <= 0 ||
    measurements.narrationCodePoints <= 0 ||
    measurements.narrationUtf8Bytes <= 0
  ) {
    return fail();
  }
  return Object.freeze({
    sourceCodePoints: indexFrom(sourceCodePoints),
    narrationCodePoints: indexFrom(narrationCodePoints),
    narrationUtf8Bytes: indexFrom(narrationUtf8Bytes),
    sentenceCount: indexFrom(measurements.sentenceCount),
  });
}

function copyBlockMeasurements(
  measurements: NarrationPackedBlockMeasurements,
): NarrationPackedBlockMeasurements {
  return Object.freeze({
    sourceCodePointsConsumed: indexFrom(measurements.sourceCodePointsConsumed),
    narrationCodePoints: indexFrom(measurements.narrationCodePoints),
    narrationUtf8Bytes: indexFrom(measurements.narrationUtf8Bytes),
    sentenceCount: indexFrom(measurements.sentenceCount),
    segmentCount: indexFrom(measurements.segmentCount),
    workUnitCount: indexFrom(measurements.workUnitCount),
    checkpointCount: indexFrom(measurements.checkpointCount),
    yieldCount: indexFrom(measurements.yieldCount),
  });
}

function stageSegment(
  locatedBlock: PublicationLocatedBlock,
  packedSegment: NarrationPackedSegment,
): StagedPreparedNarrationSegment {
  const startOffsetCodePoints = packedSegment.sourceSpan.startOffsetCodePoints;
  const endOffsetCodePoints = packedSegment.sourceSpan.endOffsetCodePoints;
  const sourceCodePoints = endOffsetCodePoints - startOffsetCodePoints;
  const text = String(packedSegment.text);
  if (
    !Number.isSafeInteger(sourceCodePoints) ||
    sourceCodePoints <= 0 ||
    text.length === 0
  ) {
    return fail();
  }
  return {
    text: packedSegment.text as unknown as SensitiveNarrationTextV1,
    sourceRange: createNarrationSourceTokenRange(
      locatedBlock,
      packedSegment.sourceSpan,
    ),
    boundaryReason: packedSegment.boundaryReason,
    measurements: copyMeasurements(
      packedSegment.measurements,
      sourceCodePoints,
      text,
    ),
  };
}

function canonicalContinuation(
  locatedBlock: PublicationLocatedBlock,
  offsetCodePoints: number,
): ReadingLocatorV1 {
  try {
    return decodeReadingLocatorV1(
      createBlockLocatorAtOffset(locatedBlock, offsetCodePoints),
    );
  } catch {
    return fail();
  }
}

function emitPreparedNarrationBlockInternal(
  locatedBlock: PublicationLocatedBlock,
  packed: NarrationPackedBlock,
): PreparedNarrationBlock {
  validateLocatedBlock(locatedBlock, packed);

  const stagedSegments: StagedPreparedNarrationSegment[] = [];
  const sourceStartOffsetCodePoints = packed.block.sourceStartOffsetCodePoints;
  let previousEndOffset = sourceStartOffsetCodePoints;
  let totalNarrationCodePoints = 0;
  let totalNarrationUtf8Bytes = 0;
  let totalSentenceCount = 0;

  for (const packedSegment of packed.segments) {
    const staged = stageSegment(locatedBlock, packedSegment);
    const startOffset = staged.sourceRange.start.textOffsetCodePoints;
    const endOffset = staged.sourceRange.end.textOffsetCodePoints;
    if (
      startOffset < previousEndOffset ||
      endOffset <= startOffset ||
      endOffset > locatedBlock.textLengthCodePoints
    ) {
      return fail();
    }
    previousEndOffset = endOffset;
    totalNarrationCodePoints = addSafe(
      totalNarrationCodePoints,
      staged.measurements.narrationCodePoints,
    );
    totalNarrationUtf8Bytes = addSafe(
      totalNarrationUtf8Bytes,
      staged.measurements.narrationUtf8Bytes,
    );
    totalSentenceCount = addSafe(
      totalSentenceCount,
      staged.measurements.sentenceCount,
    );
    stagedSegments.push(staged);
  }

  const sourceCodePointsConsumed = packed.measurements.sourceCodePointsConsumed;
  const continuationOffsetCodePoints = addSafe(
    sourceStartOffsetCodePoints,
    sourceCodePointsConsumed,
  );
  if (
    packed.measurements.segmentCount !== stagedSegments.length ||
    packed.measurements.narrationCodePoints !== totalNarrationCodePoints ||
    packed.measurements.narrationUtf8Bytes !== totalNarrationUtf8Bytes ||
    packed.measurements.sentenceCount !== totalSentenceCount ||
    sourceCodePointsConsumed < 0 ||
    sourceCodePointsConsumed > packed.block.sourceCodePoints ||
    (packed.complete &&
      sourceCodePointsConsumed !== packed.block.sourceCodePoints) ||
    (!packed.complete &&
      (sourceCodePointsConsumed >= packed.block.sourceCodePoints ||
        stagedSegments.length === 0)) ||
    (stagedSegments.length > 0 &&
      previousEndOffset !== continuationOffsetCodePoints) ||
    (packed.disposition === "spoken" && stagedSegments.length === 0) ||
    (packed.disposition !== "spoken" &&
      (!packed.complete || stagedSegments.length !== 0))
  ) {
    return fail();
  }

  const continuation = canonicalContinuation(
    locatedBlock,
    continuationOffsetCodePoints,
  );
  const segments = Object.freeze(
    stagedSegments.map((segment) =>
      Object.freeze({
        text: segment.text,
        sourceRange: segment.sourceRange,
        boundaryReason: segment.boundaryReason,
        measurements: segment.measurements,
      }),
    ),
  );
  const measurements = copyBlockMeasurements(packed.measurements);

  return Object.freeze({
    complete: packed.complete,
    disposition: packed.disposition,
    segments,
    continuation,
    measurements,
  });
}

/**
 * Converts one completely packed block into canonical locator-linked prepared
 * segments. All ranges and aggregate invariants are validated before any
 * sensitive prepared output is published.
 */
function emitPreparedNarrationBlock(
  locatedBlock: PublicationLocatedBlock,
  packed: NarrationPackedBlock,
): PreparedNarrationBlock {
  try {
    return emitPreparedNarrationBlockInternal(locatedBlock, packed);
  } catch (error: unknown) {
    if (error instanceof EpubArchiveError) {
      throw error;
    }
    throw new EpubArchiveError("internal-failure");
  }
}

/**
 * Runs the deterministic block-local narration stages and publishes canonical
 * prepared segments only after packing and every range invariant succeed.
 */
export async function prepareNarrationSourceLeaf(
  source: NarrationSourceTokenLeafEvent,
  defaultLanguage: NarrationNormalizationLanguage,
  options: NarrationPackingOptions = {},
): Promise<PreparedNarrationBlock> {
  try {
    const normalized = normalizeNarrationSourceTokens(
      source.sourceTokens,
      defaultLanguage,
    );
    const scan = scanNarrationBoundaries(source, normalized);
    const packed = await packNarrationBoundaryScan(scan, options);
    if (options.signal?.aborted === true) {
      throw new EpubArchiveError("cancelled");
    }
    return emitPreparedNarrationBlock(source.locatedBlock, packed);
  } catch (error: unknown) {
    if (error instanceof EpubArchiveError) {
      throw error;
    }
    throw new EpubArchiveError("internal-failure");
  }
}
