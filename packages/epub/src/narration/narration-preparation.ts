import {
  createIndex,
  createOperationalErrorV1,
  type Index,
  type OperationalErrorCodeV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  NarrationPreparationBatchMeasurements,
  NarrationPreparationFailure,
  NarrationPreparationFailureDetail,
  NarrationPreparationResult,
  NarrationPreparationStart,
  NarrationPreparationStartRelation,
  PreparedNarrationSegment,
} from "../document/narration-model.js";
import {
  createBlockLocatorAtOffset,
  type PublicationLocatorIndex,
} from "../locator/locator-index.js";
import { resolvePublicationLocator } from "../locator/locator-resolver.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import {
  NARRATION_V1_BATCH_POLICY,
  NARRATION_V1_SEGMENT_POLICY,
  NARRATION_V1_SOURCE_WINDOW_POLICY,
} from "./narration-policy.js";
import {
  prepareNarrationSourceLeaf,
  type PreparedNarrationBlock,
} from "./narration-prepared-segment.js";
import {
  prepareNarrationSourceWindow,
  type NarrationSourceWindowFailure,
  type NarrationSourceWindowLeafEvent,
  type NarrationYieldScheduler,
} from "./narration-source-window.js";
import type {
  NarrationSourceToken,
  NarrationSourceTokenLeafEvent,
} from "./narration-source.js";

interface ValidatedNarrationPreparationRequest {
  readonly startLocator: unknown;
  readonly profile: "narration-v1";
  readonly defaultLanguage: "und" | "es";
  readonly maximumSegments: number;
  readonly signal?: AbortSignal;
}

interface MutablePreparationMeasurements {
  checkpointCount: number;
  sourceCodePointsInspected: number;
}

interface MutableCandidateBatch {
  readonly segments: PreparedNarrationSegment[];
  lookahead?: PreparedNarrationSegment;
  narrationCodePoints: number;
  narrationUtf8Bytes: number;
  sentenceCount: number;
}

export interface NarrationPreparationResourceSnapshot {
  readonly activeRequestCount: Index;
  readonly retainedResultCount: Index;
  readonly retainedSourceEventCount: Index;
  readonly retainedSourceTokenCount: Index;
  readonly retainedPreparedSegmentCount: Index;
  readonly retainedNarrationCodePoints: Index;
  readonly retainedNarrationUtf8Bytes: Index;
}

export type NarrationPreparationResourceObserver = (
  snapshot: NarrationPreparationResourceSnapshot,
) => void;

const REQUEST_KEYS = new Set([
  "defaultLanguage",
  "maximumSegments",
  "profile",
  "signal",
  "startLocator",
]);

const FAILURE_CODES = Object.freeze({
  cancelled: "operation-cancelled",
  "internal-failure": "internal-failure",
  "invalid-request": "invalid-input",
  "invalid-start": "invalid-input",
  "operation-active": "resource-exhausted",
  "resource-limit-exceeded": "resource-exhausted",
} satisfies Readonly<
  Record<NarrationPreparationFailureDetail, OperationalErrorCodeV1>
>);

function fail(code: EpubArchiveError["code"] = "internal-failure"): never {
  throw new EpubArchiveError(code);
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

function retainedCandidateMeasurements(batch: MutableCandidateBatch): Readonly<{
  narrationCodePoints: number;
  narrationUtf8Bytes: number;
  segmentCount: number;
}> {
  const lookahead = batch.lookahead;
  return Object.freeze({
    narrationCodePoints: addSafe(
      batch.narrationCodePoints,
      lookahead?.measurements.narrationCodePoints ?? 0,
    ),
    narrationUtf8Bytes: addSafe(
      batch.narrationUtf8Bytes,
      lookahead?.measurements.narrationUtf8Bytes ?? 0,
    ),
    segmentCount: batch.segments.length + (lookahead === undefined ? 0 : 1),
  });
}

function assertRetainedCandidateBounds(
  batch: MutableCandidateBatch,
  pending?: PreparedNarrationBlock,
): void {
  const retained = retainedCandidateMeasurements(batch);
  const segmentCount = addSafe(
    retained.segmentCount,
    pending?.segments.length ?? 0,
  );
  const narrationCodePoints = addSafe(
    retained.narrationCodePoints,
    pending?.measurements.narrationCodePoints ?? 0,
  );
  const narrationUtf8Bytes = addSafe(
    retained.narrationUtf8Bytes,
    pending?.measurements.narrationUtf8Bytes ?? 0,
  );
  if (
    segmentCount >
      NARRATION_V1_SEGMENT_POLICY.retainedSegmentEntriesHardMaximum ||
    narrationCodePoints >
      NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum ||
    narrationUtf8Bytes >
      NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum
  ) {
    return fail("resource-limit-exceeded");
  }
}

function retainCandidate(
  batch: MutableCandidateBatch,
  segment: PreparedNarrationSegment,
  maximumSegments: number,
): "lookahead" | "returned" {
  if (batch.lookahead !== undefined) {
    return fail();
  }
  const narrationCodePoints = addSafe(
    batch.narrationCodePoints,
    segment.measurements.narrationCodePoints,
  );
  const narrationUtf8Bytes = addSafe(
    batch.narrationUtf8Bytes,
    segment.measurements.narrationUtf8Bytes,
  );
  const sentenceCount = addSafe(
    batch.sentenceCount,
    segment.measurements.sentenceCount,
  );
  if (
    batch.segments.length >= maximumSegments ||
    narrationCodePoints >
      NARRATION_V1_BATCH_POLICY.narrationCodePointsHardMaximum ||
    narrationUtf8Bytes >
      NARRATION_V1_BATCH_POLICY.narrationUtf8BytesHardMaximum ||
    sentenceCount > NARRATION_V1_BATCH_POLICY.sentencesHardMaximum
  ) {
    batch.lookahead = segment;
    assertRetainedCandidateBounds(batch);
    return "lookahead";
  }
  batch.segments.push(segment);
  batch.narrationCodePoints = narrationCodePoints;
  batch.narrationUtf8Bytes = narrationUtf8Bytes;
  batch.sentenceCount = sentenceCount;
  assertRetainedCandidateBounds(batch);
  return "returned";
}

function observeResourceSnapshot(
  observer: NarrationPreparationResourceObserver | undefined,
  values: Readonly<{
    activeRequestCount: number;
    retainedResultCount: number;
    retainedSourceEventCount: number;
    retainedSourceTokenCount: number;
    retainedPreparedSegmentCount: number;
    retainedNarrationCodePoints: number;
    retainedNarrationUtf8Bytes: number;
  }>,
): void {
  if (observer === undefined) {
    return;
  }
  observer(
    Object.freeze({
      activeRequestCount: indexFrom(values.activeRequestCount),
      retainedResultCount: indexFrom(values.retainedResultCount),
      retainedSourceEventCount: indexFrom(values.retainedSourceEventCount),
      retainedSourceTokenCount: indexFrom(values.retainedSourceTokenCount),
      retainedPreparedSegmentCount: indexFrom(
        values.retainedPreparedSegmentCount,
      ),
      retainedNarrationCodePoints: indexFrom(
        values.retainedNarrationCodePoints,
      ),
      retainedNarrationUtf8Bytes: indexFrom(values.retainedNarrationUtf8Bytes),
    }),
  );
}

function isAbortSignal(value: unknown): value is AbortSignal {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AbortSignal).aborted === "boolean" &&
    typeof (value as AbortSignal).addEventListener === "function" &&
    typeof (value as AbortSignal).removeEventListener === "function"
  );
}

export function narrationPreparationFailure(
  status: NarrationPreparationFailureDetail,
): NarrationPreparationFailure {
  return Object.freeze({
    status,
    error: createOperationalErrorV1(FAILURE_CODES[status]),
  });
}

export function validateNarrationPreparationRequest(
  input: unknown,
): ValidatedNarrationPreparationRequest | NarrationPreparationFailure {
  try {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return narrationPreparationFailure("invalid-request");
    }
    const request = input as Record<string, unknown>;
    if (
      Object.keys(request).some((key) => !REQUEST_KEYS.has(key)) ||
      !Object.hasOwn(request, "startLocator") ||
      request.profile !== "narration-v1" ||
      (request.defaultLanguage !== "und" && request.defaultLanguage !== "es") ||
      !Number.isSafeInteger(request.maximumSegments) ||
      (request.maximumSegments as number) <= 0 ||
      (request.maximumSegments as number) >
        NARRATION_V1_BATCH_POLICY.segmentsHardMaximum ||
      (request.signal !== undefined && !isAbortSignal(request.signal))
    ) {
      return narrationPreparationFailure("invalid-request");
    }
    const validated: ValidatedNarrationPreparationRequest = Object.freeze({
      startLocator: request.startLocator,
      profile: "narration-v1" as const,
      defaultLanguage: request.defaultLanguage as "und" | "es",
      maximumSegments: request.maximumSegments as number,
      ...(request.signal === undefined
        ? {}
        : { signal: request.signal as AbortSignal }),
    });
    return validated;
  } catch {
    return narrationPreparationFailure("invalid-request");
  }
}

function mapSourceWindowFailure(
  failure: NarrationSourceWindowFailure,
): NarrationPreparationFailure {
  switch (failure.status) {
    case "cancelled":
    case "internal-failure":
    case "invalid-start":
    case "operation-active":
    case "resource-limit-exceeded":
      return narrationPreparationFailure(failure.status);
    default:
      return narrationPreparationFailure("internal-failure");
  }
}

function mapThrownFailure(error: unknown): NarrationPreparationFailure {
  if (error instanceof EpubArchiveError) {
    switch (error.code) {
      case "cancelled":
        return narrationPreparationFailure("cancelled");
      case "locator-unresolved":
        return narrationPreparationFailure("invalid-start");
      case "resource-limit-exceeded":
        return narrationPreparationFailure("resource-limit-exceeded");
      default:
        return narrationPreparationFailure("internal-failure");
    }
  }
  return narrationPreparationFailure("internal-failure");
}

function tokenLeafFromWindow(
  event: NarrationSourceWindowLeafEvent,
  startOffsetCodePoints: number = event.sourceStartOffsetCodePoints,
): NarrationSourceTokenLeafEvent {
  const sourceEndOffsetCodePoints = event.sourceEndOffsetCodePoints;
  const relativeStart =
    startOffsetCodePoints - event.sourceStartOffsetCodePoints;
  if (
    !Number.isSafeInteger(startOffsetCodePoints) ||
    startOffsetCodePoints < event.sourceStartOffsetCodePoints ||
    startOffsetCodePoints >= sourceEndOffsetCodePoints ||
    !Number.isSafeInteger(relativeStart) ||
    relativeStart < 0 ||
    relativeStart >= event.sourceTokens.length
  ) {
    return fail();
  }
  const sourceTokens = Object.freeze(
    event.sourceTokens.slice(relativeStart) as NarrationSourceToken[],
  );
  const sourceCodePoints = sourceEndOffsetCodePoints - startOffsetCodePoints;
  if (sourceTokens.length !== sourceCodePoints) {
    return fail();
  }
  const common = {
    kind: "leaf" as const,
    locatedBlock: event.locatedBlock,
    sourceStartOffsetCodePoints: indexFrom(startOffsetCodePoints),
    sourceEndOffsetCodePoints: indexFrom(sourceEndOffsetCodePoints),
    sourceCodePoints: indexFrom(sourceCodePoints),
    sourceTokens,
    structuralContext: event.structuralContext,
    textContext: event.textContext,
  };
  return event.blockKind === "heading"
    ? Object.freeze({
        ...common,
        blockKind: "heading",
        headingLevel: event.headingLevel,
      })
    : Object.freeze({
        ...common,
        blockKind: "paragraph",
      });
}

function sameLocatorPosition(
  left: ReadingLocatorV1,
  right: ReadingLocatorV1,
): boolean {
  return (
    left.spineItemId === right.spineItemId &&
    left.spineItemIndex === right.spineItemIndex &&
    left.anchor.kind === right.anchor.kind &&
    left.anchor.formatVersion === right.anchor.formatVersion &&
    left.anchor.value === right.anchor.value &&
    left.anchor.anchorIndex === right.anchor.anchorIndex &&
    left.textOffsetCodePoints === right.textOffsetCodePoints
  );
}

function sameLocatorBlock(
  left: ReadingLocatorV1,
  right: ReadingLocatorV1,
): boolean {
  return (
    left.spineItemId === right.spineItemId &&
    left.spineItemIndex === right.spineItemIndex &&
    left.anchor.kind === right.anchor.kind &&
    left.anchor.formatVersion === right.anchor.formatVersion &&
    left.anchor.value === right.anchor.value &&
    left.anchor.anchorIndex === right.anchor.anchorIndex
  );
}

function segmentIsAtOrAfterStart(
  segment: PreparedNarrationSegment,
  canonicalLocator: ReadingLocatorV1,
): boolean {
  if (!sameLocatorBlock(segment.sourceRange.start, canonicalLocator)) {
    return true;
  }
  return (
    segment.sourceRange.end.textOffsetCodePoints >
    canonicalLocator.textOffsetCodePoints
  );
}

function createStart(
  resolution: ReturnType<typeof resolvePublicationLocator>,
  segments: readonly PreparedNarrationSegment[],
): NarrationPreparationStart {
  const canonicalLocator = resolution.locator;
  const first = segments[0];
  let segmentRelation: NarrationPreparationStartRelation = "publication-end";
  if (first !== undefined) {
    if (!sameLocatorBlock(first.sourceRange.start, canonicalLocator)) {
      segmentRelation = "before-next-segment";
    } else if (
      first.sourceRange.start.textOffsetCodePoints ===
      canonicalLocator.textOffsetCodePoints
    ) {
      segmentRelation = "at-segment-start";
    } else if (
      first.sourceRange.start.textOffsetCodePoints <
        canonicalLocator.textOffsetCodePoints &&
      first.sourceRange.end.textOffsetCodePoints >
        canonicalLocator.textOffsetCodePoints
    ) {
      segmentRelation = "inside-segment";
    } else {
      segmentRelation = "before-next-segment";
    }
  }
  return Object.freeze({
    canonicalLocator,
    resolutionStatus: resolution.status,
    resolutionReason: resolution.reason,
    segmentRelation,
  });
}

function batchMeasurements(
  segments: readonly PreparedNarrationSegment[],
  operation: MutablePreparationMeasurements,
): NarrationPreparationBatchMeasurements {
  let narrationCodePoints = 0;
  let narrationUtf8Bytes = 0;
  let sentenceCount = 0;
  for (const segment of segments) {
    narrationCodePoints = addSafe(
      narrationCodePoints,
      segment.measurements.narrationCodePoints,
    );
    narrationUtf8Bytes = addSafe(
      narrationUtf8Bytes,
      segment.measurements.narrationUtf8Bytes,
    );
    sentenceCount = addSafe(sentenceCount, segment.measurements.sentenceCount);
  }
  if (
    segments.length > NARRATION_V1_BATCH_POLICY.segmentsHardMaximum ||
    narrationCodePoints >
      NARRATION_V1_BATCH_POLICY.narrationCodePointsHardMaximum ||
    narrationUtf8Bytes >
      NARRATION_V1_BATCH_POLICY.narrationUtf8BytesHardMaximum ||
    sentenceCount > NARRATION_V1_BATCH_POLICY.sentencesHardMaximum
  ) {
    return fail("resource-limit-exceeded");
  }
  return Object.freeze({
    sourceCodePointsInspected: indexFrom(operation.sourceCodePointsInspected),
    narrationCodePoints: indexFrom(narrationCodePoints),
    narrationUtf8Bytes: indexFrom(narrationUtf8Bytes),
    segmentCount: indexFrom(segments.length),
    sentenceCount: indexFrom(sentenceCount),
    checkpointCount: indexFrom(operation.checkpointCount),
  });
}

function stableSegments(
  leaf: NarrationSourceTokenLeafEvent,
  prepared: PreparedNarrationBlock,
): readonly PreparedNarrationSegment[] {
  const partialSourceWindow =
    leaf.sourceEndOffsetCodePoints < leaf.locatedBlock.textLengthCodePoints;
  if (
    !partialSourceWindow ||
    !prepared.complete ||
    prepared.segments.length === 0
  ) {
    return prepared.segments;
  }
  return Object.freeze(prepared.segments.slice(0, -1));
}

function nextLeafStart(
  leaf: NarrationSourceTokenLeafEvent,
  prepared: PreparedNarrationBlock,
  stable: readonly PreparedNarrationSegment[],
): ReadingLocatorV1 {
  if (
    prepared.complete &&
    leaf.sourceEndOffsetCodePoints < leaf.locatedBlock.textLengthCodePoints
  ) {
    const lastStable = stable[stable.length - 1];
    if (lastStable !== undefined) {
      return lastStable.sourceRange.end;
    }
    if (prepared.disposition !== "spoken") {
      return createBlockLocatorAtOffset(
        leaf.locatedBlock,
        leaf.sourceEndOffsetCodePoints,
      );
    }
    return fail("resource-limit-exceeded");
  }
  return prepared.continuation;
}

function observeSourceWindow(
  operation: MutablePreparationMeasurements,
  sourceCodePointsInspected: number,
  checkpointCount: number,
): void {
  operation.sourceCodePointsInspected = addSafe(
    operation.sourceCodePointsInspected,
    sourceCodePointsInspected,
  );
  operation.checkpointCount = addSafe(
    operation.checkpointCount,
    checkpointCount,
  );
  if (
    operation.sourceCodePointsInspected >
    NARRATION_V1_SOURCE_WINDOW_POLICY.sourceCodePointsInspectedHardMaximum
  ) {
    return fail("resource-limit-exceeded");
  }
}

/**
 * Runs one bounded public preparation request over immutable publication state.
 * Callers own publication-level concurrency and linked-close cancellation.
 */
export async function prepareNarrationBatch(
  locatorIndex: PublicationLocatorIndex,
  request: ValidatedNarrationPreparationRequest,
  scheduler: NarrationYieldScheduler,
  resourceObserver?: NarrationPreparationResourceObserver,
): Promise<NarrationPreparationResult> {
  try {
    const signal = request.signal ?? new AbortController().signal;
    const resolution = resolvePublicationLocator(
      locatorIndex,
      request.startLocator,
      createEpubProcessingBudget({ signal }),
    );
    const targetBlock = resolution.locatedBlock;
    const canonicalLocator = resolution.locator;
    let cursor =
      (targetBlock.block.kind === "heading" ||
        targetBlock.block.kind === "paragraph") &&
      canonicalLocator.textOffsetCodePoints > 0 &&
      canonicalLocator.textOffsetCodePoints < targetBlock.textLengthCodePoints
        ? createBlockLocatorAtOffset(targetBlock, 0)
        : canonicalLocator;
    const candidates: MutableCandidateBatch = {
      segments: [],
      narrationCodePoints: 0,
      narrationUtf8Bytes: 0,
      sentenceCount: 0,
    };
    const operation: MutablePreparationMeasurements = {
      checkpointCount: 0,
      sourceCodePointsInspected: 0,
    };
    let sourceComplete = false;

    while (candidates.lookahead === undefined && !sourceComplete) {
      const window = await prepareNarrationSourceWindow(
        locatorIndex,
        Object.freeze({ startLocator: cursor, signal }),
        scheduler,
      );
      if (window.status !== "window" && window.status !== "complete") {
        return mapSourceWindowFailure(window);
      }
      observeSourceWindow(
        operation,
        window.measurements.sourceCodePointsInspected,
        window.measurements.checkpointCount,
      );
      let retainedSourceTokenCount = 0;
      for (const event of window.events) {
        if (event.kind === "leaf") {
          retainedSourceTokenCount = addSafe(
            retainedSourceTokenCount,
            event.sourceTokens.length,
          );
        }
      }
      observeResourceSnapshot(resourceObserver, {
        activeRequestCount: 1,
        retainedResultCount: 0,
        retainedSourceEventCount: window.events.length,
        retainedSourceTokenCount,
        retainedPreparedSegmentCount:
          candidates.segments.length +
          (candidates.lookahead === undefined ? 0 : 1),
        retainedNarrationCodePoints:
          retainedCandidateMeasurements(candidates).narrationCodePoints,
        retainedNarrationUtf8Bytes:
          retainedCandidateMeasurements(candidates).narrationUtf8Bytes,
      });

      let nextCursor: ReadingLocatorV1 | undefined;
      let requiresAnotherWindow = false;
      for (const event of window.events) {
        if (event.kind === "boundary") {
          continue;
        }
        let leaf = tokenLeafFromWindow(event);
        while (true) {
          const retained = retainedCandidateMeasurements(candidates);
          const remainingSegmentEntries =
            NARRATION_V1_SEGMENT_POLICY.retainedSegmentEntriesHardMaximum -
            retained.segmentCount;
          const remainingNarrationCodePoints =
            NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum -
            retained.narrationCodePoints;
          const remainingNarrationUtf8Bytes =
            NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum -
            retained.narrationUtf8Bytes;
          if (
            remainingSegmentEntries <= 0 ||
            remainingNarrationCodePoints <
              NARRATION_V1_SEGMENT_POLICY.narrationCodePointsHardMaximum ||
            remainingNarrationUtf8Bytes <
              NARRATION_V1_SEGMENT_POLICY.narrationUtf8BytesHardMaximum
          ) {
            return narrationPreparationFailure("resource-limit-exceeded");
          }
          const prepared = await prepareNarrationSourceLeaf(
            leaf,
            request.defaultLanguage,
            Object.freeze({
              maximumSegments: remainingSegmentEntries,
              retainedNarrationCodePointsMaximum: remainingNarrationCodePoints,
              retainedNarrationUtf8BytesMaximum: remainingNarrationUtf8Bytes,
              signal,
              scheduler,
            }),
          );
          operation.checkpointCount = addSafe(
            operation.checkpointCount,
            prepared.measurements.checkpointCount,
          );
          assertRetainedCandidateBounds(candidates, prepared);
          observeResourceSnapshot(resourceObserver, {
            activeRequestCount: 1,
            retainedResultCount: 0,
            retainedSourceEventCount: window.events.length,
            retainedSourceTokenCount,
            retainedPreparedSegmentCount:
              retained.segmentCount + prepared.segments.length,
            retainedNarrationCodePoints: addSafe(
              retained.narrationCodePoints,
              prepared.measurements.narrationCodePoints,
            ),
            retainedNarrationUtf8Bytes: addSafe(
              retained.narrationUtf8Bytes,
              prepared.measurements.narrationUtf8Bytes,
            ),
          });
          const stable = stableSegments(leaf, prepared);
          for (const segment of stable) {
            if (!segmentIsAtOrAfterStart(segment, canonicalLocator)) {
              continue;
            }
            if (
              retainCandidate(candidates, segment, request.maximumSegments) ===
              "lookahead"
            ) {
              break;
            }
          }
          nextCursor = nextLeafStart(leaf, prepared, stable);
          if (candidates.lookahead !== undefined) {
            break;
          }
          if (!prepared.complete) {
            leaf = tokenLeafFromWindow(
              event,
              prepared.continuation.textOffsetCodePoints,
            );
            continue;
          }
          if (
            leaf.sourceEndOffsetCodePoints <
            leaf.locatedBlock.textLengthCodePoints
          ) {
            requiresAnotherWindow = true;
          }
          break;
        }
        if (candidates.lookahead !== undefined || requiresAnotherWindow) {
          break;
        }
      }

      if (candidates.lookahead !== undefined) {
        break;
      }
      if (window.status === "complete" && !requiresAnotherWindow) {
        sourceComplete = true;
        break;
      }
      const continuation =
        nextCursor ??
        (window.status === "window" ? window.continuation : undefined);
      if (
        continuation === undefined ||
        sameLocatorPosition(continuation, cursor)
      ) {
        return narrationPreparationFailure("resource-limit-exceeded");
      }
      cursor = continuation;
    }

    const returned = Object.freeze([...candidates.segments]);
    const start = createStart(resolution, returned);
    const measurements = batchMeasurements(returned, operation);
    if (!sourceComplete || candidates.lookahead !== undefined) {
      const finalSegment = returned[returned.length - 1];
      if (finalSegment === undefined) {
        return narrationPreparationFailure("resource-limit-exceeded");
      }
      const result = Object.freeze({
        status: "batch",
        start,
        segments: returned,
        continuation: finalSegment.sourceRange.end,
        measurements,
      });
      const retained = retainedCandidateMeasurements(candidates);
      observeResourceSnapshot(resourceObserver, {
        activeRequestCount: 1,
        retainedResultCount: 1,
        retainedSourceEventCount: 0,
        retainedSourceTokenCount: 0,
        retainedPreparedSegmentCount: retained.segmentCount,
        retainedNarrationCodePoints: retained.narrationCodePoints,
        retainedNarrationUtf8Bytes: retained.narrationUtf8Bytes,
      });
      return result;
    }
    const result = Object.freeze({
      status: "complete",
      start,
      segments: returned,
      measurements,
    });
    const retained = retainedCandidateMeasurements(candidates);
    observeResourceSnapshot(resourceObserver, {
      activeRequestCount: 1,
      retainedResultCount: 1,
      retainedSourceEventCount: 0,
      retainedSourceTokenCount: 0,
      retainedPreparedSegmentCount: retained.segmentCount,
      retainedNarrationCodePoints: retained.narrationCodePoints,
      retainedNarrationUtf8Bytes: retained.narrationUtf8Bytes,
    });
    return result;
  } catch (error: unknown) {
    return mapThrownFailure(error);
  }
}
