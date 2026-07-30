import type {
  Index,
  LocatorRangeV1,
  OperationalErrorV1,
  ReadingLocatorV1,
  SensitiveNarrationTextV1,
} from "@voxleaf/shared";

export type NarrationPreparationProfileId =
  | "narration-v1"
  | "narration-bilingual-v2"
  | "narration-chatterbox-v1"
  | "narration-piper-v1"
  | "narration-piper-v2";
export type NarrationPreparationLanguage = "und" | "es" | "en";

export interface NarrationPreparationRequest {
  readonly startLocator: unknown;
  readonly profile: NarrationPreparationProfileId;
  readonly defaultLanguage: NarrationPreparationLanguage;
  readonly maximumSegments: number;
  readonly signal?: AbortSignal;
}

export type NarrationBoundaryReason =
  | "clause"
  | "dialogue-turn"
  | "hard-limit"
  | "heading"
  | "paragraph"
  | "scene-break"
  | "sentence"
  | "token";

export interface PreparedNarrationMeasurements {
  readonly sourceCodePoints: Index;
  readonly narrationCodePoints: Index;
  readonly narrationUtf8Bytes: Index;
  readonly sentenceCount: Index;
}

export interface PreparedNarrationSegment {
  readonly text: SensitiveNarrationTextV1;
  readonly sourceRange: LocatorRangeV1;
  readonly boundaryReason: NarrationBoundaryReason;
  readonly measurements: PreparedNarrationMeasurements;
}

export type NarrationPreparationStartRelation =
  | "at-segment-start"
  | "before-next-segment"
  | "inside-segment"
  | "publication-end";

export interface NarrationPreparationStart {
  readonly canonicalLocator: ReadingLocatorV1;
  readonly resolutionStatus: "exact" | "recovered";
  readonly resolutionReason:
    | "book-start"
    | "exact"
    | "nearest-anchor"
    | "nearest-offset"
    | "nearest-spine";
  readonly segmentRelation: NarrationPreparationStartRelation;
}

export interface NarrationPreparationBatchMeasurements {
  readonly sourceCodePointsInspected: Index;
  readonly narrationCodePoints: Index;
  readonly narrationUtf8Bytes: Index;
  readonly segmentCount: Index;
  readonly sentenceCount: Index;
  readonly checkpointCount: Index;
}

export interface NarrationPreparationBatch {
  readonly status: "batch";
  readonly start: NarrationPreparationStart;
  readonly segments: readonly PreparedNarrationSegment[];
  readonly continuation: ReadingLocatorV1;
  readonly measurements: NarrationPreparationBatchMeasurements;
}

export interface NarrationPreparationComplete {
  readonly status: "complete";
  readonly start: NarrationPreparationStart;
  readonly segments: readonly PreparedNarrationSegment[];
  readonly measurements: NarrationPreparationBatchMeasurements;
}

export type NarrationPreparationFailureDetail =
  | "cancelled"
  | "internal-failure"
  | "invalid-request"
  | "invalid-start"
  | "operation-active"
  | "resource-limit-exceeded";

export interface NarrationPreparationFailure {
  readonly status: NarrationPreparationFailureDetail;
  readonly error: OperationalErrorV1;
}

export type NarrationPreparationResult =
  | NarrationPreparationBatch
  | NarrationPreparationComplete
  | NarrationPreparationFailure;
