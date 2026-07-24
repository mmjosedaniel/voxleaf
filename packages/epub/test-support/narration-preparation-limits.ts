/**
 * Repository-authored Task 1.3 narration-preparation limit evidence.
 *
 * This module is test-only. It accepts the content-free `narration-v1`
 * resource policy before production source projection, normalization,
 * segmentation, or `OpenedPublication.prepareNarration` exists. Synthetic
 * strings used to derive measurements are never returned by the evidence
 * collector and must not appear in snapshots, diagnostics, or test names.
 */

export const NARRATION_PREPARATION_LIMIT_NAMES = Object.freeze([
  "sourceCodePointsInspectedPerRequest",
  "segmentsPerBatch",
  "sourceCodePointsPerSegment",
  "narrationCodePointsPerSegment",
  "narrationUtf8BytesPerSegment",
  "sentencesPerSegment",
  "narrationCodePointsPerBatch",
  "narrationUtf8BytesPerBatch",
  "sentencesPerBatch",
  "protectedTokenCodePoints",
  "parserLookaheadCodePoints",
  "traversalDepth",
  "normalizationExpansionCodePointsPerSourceCodePoint",
  "workUnitsBetweenCheckpoints",
  "workUnitsBetweenYields",
  "retainedSegments",
  "retainedSourceCodePoints",
  "retainedNarrationCodePoints",
  "retainedNarrationUtf8Bytes",
  "retainedTokens",
] as const);

export type NarrationPreparationLimitName =
  (typeof NARRATION_PREPARATION_LIMIT_NAMES)[number];

export type NarrationPreparationLimitUnit =
  | "code-points"
  | "levels"
  | "ratio"
  | "segments"
  | "sentences"
  | "tokens"
  | "utf8-bytes"
  | "work-units";

export interface NarrationPreparationLimit {
  readonly target: number;
  readonly hardMaximum: number;
  readonly unit: NarrationPreparationLimitUnit;
}

export interface NarrationPreparationProfileV1 {
  readonly profileId: "narration-v1";
  readonly status: "test-only-policy";
  readonly limits: Readonly<
    Record<NarrationPreparationLimitName, NarrationPreparationLimit>
  >;
}

export type NarrationPreparationLimitStatus =
  "within-hard-limits" | "within-target";

export type NarrationPreparationLimitResult =
  | Readonly<{ ok: true; status: NarrationPreparationLimitStatus }>
  | Readonly<{
      ok: false;
      code: "invalid-measurement" | "resource-limit-exceeded";
    }>;

export type NarrationPreparationProfileValidationResult =
  | Readonly<{ ok: true }>
  | Readonly<{
      ok: false;
      code: "profile-inconsistent" | "profile-invalid" | "profile-not-frozen";
    }>;

export const NARRATION_PREPARATION_EVIDENCE_SHAPES = Object.freeze([
  "representative-heading",
  "short-paragraph",
  "long-paragraph",
  "dialogue",
  "punctuation-heavy-spanish",
  "unusually-long-sentence",
  "oversized-token",
  "exact-batch",
  "max-plus-one-batch",
  "unicode-byte-pressure",
] as const);

export type NarrationPreparationEvidenceShape =
  (typeof NARRATION_PREPARATION_EVIDENCE_SHAPES)[number];

export interface NarrationPreparationEvidenceCase {
  readonly id: string;
  readonly shape: NarrationPreparationEvidenceShape;
  readonly measurements: Readonly<
    Record<NarrationPreparationLimitName, number>
  >;
  readonly expected:
    "resource-limit-exceeded" | NarrationPreparationLimitStatus;
}

const VALID_PROFILE: NarrationPreparationProfileValidationResult =
  Object.freeze({ ok: true });
const WITHIN_TARGET: NarrationPreparationLimitResult = Object.freeze({
  ok: true,
  status: "within-target",
});
const WITHIN_HARD_LIMITS: NarrationPreparationLimitResult = Object.freeze({
  ok: true,
  status: "within-hard-limits",
});
const INVALID_MEASUREMENT: NarrationPreparationLimitResult = Object.freeze({
  ok: false,
  code: "invalid-measurement",
});
const RESOURCE_LIMIT_EXCEEDED: NarrationPreparationLimitResult = Object.freeze({
  ok: false,
  code: "resource-limit-exceeded",
});

const LIMIT_NAME_SET = new Set<string>(NARRATION_PREPARATION_LIMIT_NAMES);
const LIMIT_UNIT_SET = new Set<string>([
  "code-points",
  "levels",
  "ratio",
  "segments",
  "sentences",
  "tokens",
  "utf8-bytes",
  "work-units",
]);

function limit(
  target: number,
  hardMaximum: number,
  unit: NarrationPreparationLimitUnit,
): NarrationPreparationLimit {
  return Object.freeze({ target, hardMaximum, unit });
}

/**
 * The accepted model-independent `narration-v1` target and hard ceilings.
 *
 * Targets guide stable packing and scheduling. Hard maxima are admission and
 * publication ceilings: an exact maximum is allowed and max-plus-one produces
 * the fixed content-free resource-limit result.
 */
export const NARRATION_PREPARATION_PROFILE_V1: NarrationPreparationProfileV1 =
  Object.freeze({
    profileId: "narration-v1",
    status: "test-only-policy",
    limits: Object.freeze({
      sourceCodePointsInspectedPerRequest: limit(8_192, 16_384, "code-points"),
      segmentsPerBatch: limit(8, 16, "segments"),
      sourceCodePointsPerSegment: limit(384, 768, "code-points"),
      narrationCodePointsPerSegment: limit(320, 640, "code-points"),
      narrationUtf8BytesPerSegment: limit(1_024, 2_048, "utf8-bytes"),
      sentencesPerSegment: limit(3, 8, "sentences"),
      narrationCodePointsPerBatch: limit(2_560, 8_192, "code-points"),
      narrationUtf8BytesPerBatch: limit(8_192, 24_576, "utf8-bytes"),
      sentencesPerBatch: limit(24, 64, "sentences"),
      protectedTokenCodePoints: limit(64, 256, "code-points"),
      parserLookaheadCodePoints: limit(32, 128, "code-points"),
      traversalDepth: limit(32, 128, "levels"),
      normalizationExpansionCodePointsPerSourceCodePoint: limit(8, 16, "ratio"),
      workUnitsBetweenCheckpoints: limit(512, 1_024, "work-units"),
      workUnitsBetweenYields: limit(4_096, 8_192, "work-units"),
      retainedSegments: limit(9, 17, "segments"),
      retainedSourceCodePoints: limit(8_192, 16_384, "code-points"),
      retainedNarrationCodePoints: limit(2_880, 8_832, "code-points"),
      retainedNarrationUtf8Bytes: limit(9_216, 26_624, "utf8-bytes"),
      retainedTokens: limit(1_024, 4_096, "tokens"),
    }),
  });

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidProfile(
  code: "profile-inconsistent" | "profile-invalid" | "profile-not-frozen",
): NarrationPreparationProfileValidationResult {
  return Object.freeze({ ok: false, code });
}

/**
 * Validates only content-free policy structure and relationships.
 */
export function validateNarrationPreparationProfile(
  value: unknown,
): NarrationPreparationProfileValidationResult {
  if (
    !isRecord(value) ||
    value.profileId !== "narration-v1" ||
    value.status !== "test-only-policy" ||
    !isRecord(value.limits)
  ) {
    return invalidProfile("profile-invalid");
  }
  if (!Object.isFrozen(value) || !Object.isFrozen(value.limits)) {
    return invalidProfile("profile-not-frozen");
  }

  const keys = Object.keys(value.limits);
  if (
    keys.length !== NARRATION_PREPARATION_LIMIT_NAMES.length ||
    keys.some((key) => !LIMIT_NAME_SET.has(key))
  ) {
    return invalidProfile("profile-invalid");
  }

  for (const name of NARRATION_PREPARATION_LIMIT_NAMES) {
    const candidate = value.limits[name];
    if (
      !isRecord(candidate) ||
      !Object.isFrozen(candidate) ||
      !Number.isSafeInteger(candidate.target) ||
      !Number.isSafeInteger(candidate.hardMaximum) ||
      Number(candidate.target) <= 0 ||
      Number(candidate.hardMaximum) <= Number(candidate.target) ||
      typeof candidate.unit !== "string" ||
      !LIMIT_UNIT_SET.has(candidate.unit)
    ) {
      return invalidProfile("profile-invalid");
    }
  }

  const profile = value as unknown as NarrationPreparationProfileV1;
  const { limits } = profile;
  const consistent =
    limits.narrationCodePointsPerBatch.target <=
      limits.segmentsPerBatch.target *
        limits.narrationCodePointsPerSegment.target &&
    limits.narrationCodePointsPerBatch.hardMaximum <=
      limits.segmentsPerBatch.hardMaximum *
        limits.narrationCodePointsPerSegment.hardMaximum &&
    limits.narrationUtf8BytesPerBatch.target <=
      limits.segmentsPerBatch.target *
        limits.narrationUtf8BytesPerSegment.target &&
    limits.narrationUtf8BytesPerBatch.hardMaximum <=
      limits.segmentsPerBatch.hardMaximum *
        limits.narrationUtf8BytesPerSegment.hardMaximum &&
    limits.sentencesPerBatch.target <=
      limits.segmentsPerBatch.target * limits.sentencesPerSegment.target &&
    limits.sentencesPerBatch.hardMaximum <=
      limits.segmentsPerBatch.hardMaximum *
        limits.sentencesPerSegment.hardMaximum &&
    limits.retainedSegments.target >= limits.segmentsPerBatch.target + 1 &&
    limits.retainedSegments.hardMaximum >=
      limits.segmentsPerBatch.hardMaximum + 1 &&
    limits.retainedSourceCodePoints.target >=
      limits.sourceCodePointsInspectedPerRequest.target &&
    limits.retainedSourceCodePoints.hardMaximum >=
      limits.sourceCodePointsInspectedPerRequest.hardMaximum &&
    limits.retainedNarrationCodePoints.target >=
      limits.narrationCodePointsPerBatch.target +
        limits.narrationCodePointsPerSegment.target &&
    limits.retainedNarrationCodePoints.hardMaximum >=
      limits.narrationCodePointsPerBatch.hardMaximum +
        limits.narrationCodePointsPerSegment.hardMaximum &&
    limits.retainedNarrationUtf8Bytes.target >=
      limits.narrationUtf8BytesPerBatch.target +
        limits.narrationUtf8BytesPerSegment.target &&
    limits.retainedNarrationUtf8Bytes.hardMaximum >=
      limits.narrationUtf8BytesPerBatch.hardMaximum +
        limits.narrationUtf8BytesPerSegment.hardMaximum &&
    limits.workUnitsBetweenCheckpoints.target <
      limits.workUnitsBetweenYields.target &&
    limits.workUnitsBetweenCheckpoints.hardMaximum <
      limits.workUnitsBetweenYields.hardMaximum;

  return consistent ? VALID_PROFILE : invalidProfile("profile-inconsistent");
}

/**
 * Evaluates one content-free observation against the accepted profile.
 */
export function evaluateNarrationPreparationLimit(
  name: unknown,
  observed: unknown,
): NarrationPreparationLimitResult {
  if (
    typeof name !== "string" ||
    !LIMIT_NAME_SET.has(name) ||
    !Number.isSafeInteger(observed) ||
    Number(observed) < 0
  ) {
    return INVALID_MEASUREMENT;
  }

  const selected =
    NARRATION_PREPARATION_PROFILE_V1.limits[
      name as NarrationPreparationLimitName
    ];
  if (Number(observed) <= selected.target) {
    return WITHIN_TARGET;
  }
  if (Number(observed) <= selected.hardMaximum) {
    return WITHIN_HARD_LIMITS;
  }
  return RESOURCE_LIMIT_EXCEEDED;
}

function codePointCount(value: string): number {
  let count = 0;
  for (const codePoint of value) {
    void codePoint;
    count += 1;
  }
  return count;
}

function utf8ByteCount(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

interface SyntheticSegment {
  readonly source: string;
  readonly narration: string;
  readonly sentenceCount: number;
  readonly protectedTokenCodePoints: number;
}

interface SyntheticEvidenceInput {
  readonly id: string;
  readonly shape: NarrationPreparationEvidenceShape;
  readonly segments: readonly SyntheticSegment[];
  readonly parserLookaheadCodePoints?: number;
  readonly traversalDepth?: number;
  readonly normalizationExpansionCodePointsPerSourceCodePoint?: number;
  readonly workUnitsBetweenCheckpoints?: number;
  readonly workUnitsBetweenYields?: number;
  readonly retainedTokens?: number;
}

function segment(
  source: string,
  narration: string,
  sentenceCount: number,
  protectedTokenCodePoints: number,
): SyntheticSegment {
  return { source, narration, sentenceCount, protectedTokenCodePoints };
}

function repeatToCodePoints(seed: string, codePoints: number): string {
  const seedCodePoints = [...seed];
  if (seedCodePoints.length === 0) {
    throw new Error("synthetic-evidence-seed-empty");
  }
  const result: string[] = [];
  for (let index = 0; index < codePoints; index += 1) {
    result.push(seedCodePoints[index % seedCodePoints.length] ?? "");
  }
  return result.join("");
}

function classifyMeasurements(
  measurements: Readonly<Record<NarrationPreparationLimitName, number>>,
): "resource-limit-exceeded" | NarrationPreparationLimitStatus {
  let status: NarrationPreparationLimitStatus = "within-target";
  for (const name of NARRATION_PREPARATION_LIMIT_NAMES) {
    const result = evaluateNarrationPreparationLimit(name, measurements[name]);
    if (!result.ok) {
      return "resource-limit-exceeded";
    }
    if (result.status === "within-hard-limits") {
      status = "within-hard-limits";
    }
  }
  return status;
}

function evidenceCase(
  input: SyntheticEvidenceInput,
): NarrationPreparationEvidenceCase {
  const sourceCounts = input.segments.map(({ source }) =>
    codePointCount(source),
  );
  const narrationCounts = input.segments.map(({ narration }) =>
    codePointCount(narration),
  );
  const byteCounts = input.segments.map(({ narration }) =>
    utf8ByteCount(narration),
  );
  const sentenceCounts = input.segments.map(
    ({ sentenceCount }) => sentenceCount,
  );
  const sourceCodePoints = sourceCounts.reduce((sum, value) => sum + value, 0);
  const narrationCodePoints = narrationCounts.reduce(
    (sum, value) => sum + value,
    0,
  );
  const narrationUtf8Bytes = byteCounts.reduce((sum, value) => sum + value, 0);
  const measurements = Object.freeze({
    sourceCodePointsInspectedPerRequest: sourceCodePoints,
    segmentsPerBatch: input.segments.length,
    sourceCodePointsPerSegment: Math.max(0, ...sourceCounts),
    narrationCodePointsPerSegment: Math.max(0, ...narrationCounts),
    narrationUtf8BytesPerSegment: Math.max(0, ...byteCounts),
    sentencesPerSegment: Math.max(0, ...sentenceCounts),
    narrationCodePointsPerBatch: narrationCodePoints,
    narrationUtf8BytesPerBatch: narrationUtf8Bytes,
    sentencesPerBatch: sentenceCounts.reduce((sum, value) => sum + value, 0),
    protectedTokenCodePoints: Math.max(
      0,
      ...input.segments.map(({ protectedTokenCodePoints }) =>
        Number(protectedTokenCodePoints),
      ),
    ),
    parserLookaheadCodePoints: input.parserLookaheadCodePoints ?? 16,
    traversalDepth: input.traversalDepth ?? 4,
    normalizationExpansionCodePointsPerSourceCodePoint:
      input.normalizationExpansionCodePointsPerSourceCodePoint ??
      Math.max(
        1,
        ...sourceCounts.map((sourceCount, index) =>
          Math.ceil((narrationCounts[index] ?? 0) / Math.max(1, sourceCount)),
        ),
      ),
    workUnitsBetweenCheckpoints: input.workUnitsBetweenCheckpoints ?? 256,
    workUnitsBetweenYields: input.workUnitsBetweenYields ?? 2_048,
    retainedSegments: input.segments.length + 1,
    retainedSourceCodePoints: sourceCodePoints,
    retainedNarrationCodePoints:
      narrationCodePoints + Math.max(0, ...narrationCounts),
    retainedNarrationUtf8Bytes: narrationUtf8Bytes + Math.max(0, ...byteCounts),
    retainedTokens:
      input.retainedTokens ?? Math.max(1, Math.ceil(sourceCodePoints / 4)),
  });

  return Object.freeze({
    id: input.id,
    shape: input.shape,
    measurements,
    expected: classifyMeasurements(measurements),
  });
}

function makeEvidenceInputs(): readonly SyntheticEvidenceInput[] {
  const longParagraphSentence = "Luz serena avanza. ";
  const dialogueLine = "—Sí, paso breve.";
  const punctuationLine = "¿Lista? ¡Sí! —Bien…";
  const exactBatchSegment = repeatToCodePoints("voz ", 400);

  return [
    {
      id: "representative-heading",
      shape: "representative-heading",
      segments: [segment("Capítulo Ω", "Capítulo omega", 1, 8)],
      normalizationExpansionCodePointsPerSourceCodePoint: 5,
    },
    {
      id: "short-paragraph",
      shape: "short-paragraph",
      segments: [segment("Luz breve.", "Luz breve.", 1, 5)],
    },
    {
      id: "long-paragraph",
      shape: "long-paragraph",
      segments: [
        segment(
          longParagraphSentence.repeat(6).trim(),
          longParagraphSentence.repeat(6).trim(),
          6,
          6,
        ),
      ],
    },
    {
      id: "dialogue",
      shape: "dialogue",
      segments: [
        segment(dialogueLine, dialogueLine, 1, 5),
        segment("—No, espera.", "—No, espera.", 1, 6),
      ],
    },
    {
      id: "punctuation-heavy-spanish",
      shape: "punctuation-heavy-spanish",
      segments: [
        segment(punctuationLine.repeat(2), punctuationLine.repeat(2), 6, 5),
        segment(punctuationLine.repeat(2), punctuationLine.repeat(2), 6, 5),
      ],
    },
    {
      id: "unusually-long-sentence",
      shape: "unusually-long-sentence",
      segments: [
        segment(
          `${repeatToCodePoints("luz serena avanza ", 499)}.`,
          `${repeatToCodePoints("luz serena avanza ", 499)}.`,
          1,
          6,
        ),
      ],
    },
    {
      id: "oversized-token",
      shape: "oversized-token",
      segments: [segment(`${"t".repeat(257)}.`, `${"t".repeat(257)}.`, 1, 257)],
    },
    {
      id: "exact-batch",
      shape: "exact-batch",
      segments: Array.from({ length: 16 }, () =>
        segment(exactBatchSegment, exactBatchSegment, 1, 8),
      ),
      retainedTokens: 1_600,
    },
    {
      id: "max-plus-one-batch",
      shape: "max-plus-one-batch",
      segments: Array.from({ length: 17 }, () => segment("Voz.", "Voz.", 1, 3)),
    },
    {
      id: "unicode-byte-pressure",
      shape: "unicode-byte-pressure",
      segments: [segment("😀".repeat(300), "😀".repeat(300), 1, 1)],
    },
  ];
}

/**
 * Rebuilds a deeply frozen, content-free evidence report. Synthetic source and
 * narration strings are scoped to the collector and released after numeric
 * measurements are derived.
 */
export function collectNarrationPreparationEvidence(): readonly NarrationPreparationEvidenceCase[] {
  return Object.freeze(makeEvidenceInputs().map(evidenceCase));
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

/**
 * Compares two independently rebuilt synthetic runs internally and returns
 * only a content-free boolean. No source, narration, bytes, or ranges escape.
 */
export function verifyNarrationPreparationEvidenceDeterminism(): boolean {
  const first = makeEvidenceInputs();
  const second = makeEvidenceInputs();
  if (first.length !== second.length) {
    return false;
  }

  const encoder = new TextEncoder();
  return first.every((firstCase, caseIndex) => {
    const secondCase = second[caseIndex];
    if (
      secondCase === undefined ||
      firstCase.id !== secondCase.id ||
      firstCase.shape !== secondCase.shape ||
      firstCase.segments.length !== secondCase.segments.length
    ) {
      return false;
    }

    return firstCase.segments.every((firstSegment, segmentIndex) => {
      const secondSegment = secondCase.segments[segmentIndex];
      return (
        secondSegment !== undefined &&
        equalBytes(
          encoder.encode(firstSegment.narration),
          encoder.encode(secondSegment.narration),
        ) &&
        codePointCount(firstSegment.source) ===
          codePointCount(secondSegment.source)
      );
    });
  });
}

export const NARRATION_PREPARATION_SYNTHETIC_EVIDENCE =
  collectNarrationPreparationEvidence();
