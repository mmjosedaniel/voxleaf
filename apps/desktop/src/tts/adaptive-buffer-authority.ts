const SAMPLE_RATE_HZ = 24_000;
const BYTES_PER_SAMPLE = 4;

function sampleFrames(seconds: number): number {
  return seconds * SAMPLE_RATE_HZ;
}

export const ADAPTIVE_BUFFER_AUTHORITY_V1 = Object.freeze({
  authorityVersion: 1,
  audioFormat: Object.freeze({
    sampleRateHz: SAMPLE_RATE_HZ,
    channelCount: 1,
    sampleFormat: "float32-le" as const,
    bytesPerSample: BYTES_PER_SAMPLE,
  }),
  thresholds: Object.freeze({
    quickStartMs: 15_000,
    lowWaterMarkMs: 10_000,
    refillResumeMs: 60_000,
    preparedTargetMs: Object.freeze([60_000, 120_000, 300_000, 600_000]),
    maximumBufferMs: 1_800_000,
  }),
  audioLimits: Object.freeze({
    maximumSampleFrames: sampleFrames(1_800),
    maximumPayloadBytes: sampleFrames(1_800) * BYTES_PER_SAMPLE,
    maximumCompleteUnits: 256,
    maximumMetadataEntries: 256,
    serviceUnitReservationSampleFrames: sampleFrames(20),
    serviceUnitReservationPayloadBytes: sampleFrames(20) * BYTES_PER_SAMPLE,
  }),
  preparedTextLimits: Object.freeze({
    maximumRetainedBatches: 1,
    maximumRetainedSegments: 16,
    maximumNarrationCodePoints: 8_192,
    maximumNarrationUtf8Bytes: 24_576,
    maximumSentences: 64,
  }),
  workLimits: Object.freeze({
    maximumActiveNarrationPreparations: 1,
    maximumActiveSyntheses: 1,
    maximumServiceQueuedSyntheses: 0,
  }),
  playback: Object.freeze({
    minimumVolumePercent: 0,
    maximumVolumePercent: 100,
    defaultVolumePercent: 100,
    volumeStepPercent: 5,
    supportedPlaybackRates: Object.freeze([1] as const),
    defaultPlaybackRate: 1 as const,
  }),
  boundaryWait: Object.freeze({
    defaultMs: 0,
    supportedMs: Object.freeze([0, 1_000, 2_000, 3_000] as const),
  }),
});

export type AdaptiveBufferResourceLimit =
  | "active-narration-preparations"
  | "active-syntheses"
  | "audio-metadata-entries"
  | "audio-payload-bytes"
  | "audio-sample-frames"
  | "complete-audio-units"
  | "invalid-snapshot"
  | "prepared-batches"
  | "prepared-narration-code-points"
  | "prepared-narration-sentences"
  | "prepared-narration-utf8-bytes"
  | "prepared-segments"
  | "service-queued-syntheses";

export interface AdaptiveBufferResourceSnapshot {
  readonly audioSampleFrames: number;
  readonly audioPayloadBytes: number;
  readonly completeAudioUnits: number;
  readonly audioMetadataEntries: number;
  readonly retainedPreparedBatches: number;
  readonly retainedPreparedSegments: number;
  readonly retainedNarrationCodePoints: number;
  readonly retainedNarrationUtf8Bytes: number;
  readonly retainedNarrationSentences: number;
  readonly activeNarrationPreparations: number;
  readonly activeSyntheses: number;
  readonly serviceQueuedSyntheses: number;
}

export type AdaptiveBufferResourceEvaluation =
  | Readonly<{ accepted: true }>
  | Readonly<{ accepted: false; limit: AdaptiveBufferResourceLimit }>;

export interface AdaptiveBufferThresholds {
  readonly lowWaterMarkMs: number;
  readonly targetBufferMs: number;
  readonly maximumBufferMs: number;
}

const ACCEPTED = Object.freeze({ accepted: true as const });

function rejected(
  limit: AdaptiveBufferResourceLimit,
): AdaptiveBufferResourceEvaluation {
  return Object.freeze({ accepted: false as const, limit });
}

function isCount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export function playableMillisecondsFromSampleFrames(
  sampleFrameCount: number,
): number {
  if (
    !isCount(sampleFrameCount) ||
    sampleFrameCount > Math.floor(Number.MAX_SAFE_INTEGER / 1_000)
  ) {
    throw new RangeError("Invalid sample-frame count.");
  }
  return Math.floor((sampleFrameCount * 1_000) / SAMPLE_RATE_HZ);
}

export function sampleFramesFromPlayableMilliseconds(
  playableMilliseconds: number,
): number {
  if (
    !isCount(playableMilliseconds) ||
    playableMilliseconds > Math.floor(Number.MAX_SAFE_INTEGER / SAMPLE_RATE_HZ)
  ) {
    throw new RangeError("Invalid playable duration.");
  }
  const product = playableMilliseconds * SAMPLE_RATE_HZ;
  if (product % 1_000 !== 0) {
    throw new RangeError("Playable duration does not map to whole samples.");
  }
  return product / 1_000;
}

export function createAdaptiveBufferThresholds(
  requestedTargetMs: number,
  completeRemainingRangeMs?: number,
): AdaptiveBufferThresholds {
  const authority = ADAPTIVE_BUFFER_AUTHORITY_V1.thresholds;
  const allowedTargets = new Set([
    authority.quickStartMs,
    authority.refillResumeMs,
    ...authority.preparedTargetMs,
  ]);
  if (!allowedTargets.has(requestedTargetMs)) {
    throw new RangeError("Unsupported adaptive-buffer target.");
  }
  if (
    completeRemainingRangeMs !== undefined &&
    (!isCount(completeRemainingRangeMs) || completeRemainingRangeMs === 0)
  ) {
    throw new RangeError("Invalid complete remaining range.");
  }

  const targetBufferMs =
    completeRemainingRangeMs === undefined
      ? requestedTargetMs
      : Math.min(requestedTargetMs, completeRemainingRangeMs);
  return Object.freeze({
    lowWaterMarkMs: Math.min(authority.lowWaterMarkMs, targetBufferMs),
    targetBufferMs,
    maximumBufferMs: authority.maximumBufferMs,
  });
}

export function evaluateAdaptiveBufferResources(
  snapshot: AdaptiveBufferResourceSnapshot,
): AdaptiveBufferResourceEvaluation {
  const entries = Object.values(snapshot);
  if (entries.some((value) => !isCount(value))) {
    return rejected("invalid-snapshot");
  }

  const audio = ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits;
  const prepared = ADAPTIVE_BUFFER_AUTHORITY_V1.preparedTextLimits;
  const work = ADAPTIVE_BUFFER_AUTHORITY_V1.workLimits;
  const checks: ReadonlyArray<
    readonly [
      value: number,
      maximum: number,
      limit: AdaptiveBufferResourceLimit,
    ]
  > = [
    [
      snapshot.audioSampleFrames,
      audio.maximumSampleFrames,
      "audio-sample-frames",
    ],
    [
      snapshot.audioPayloadBytes,
      audio.maximumPayloadBytes,
      "audio-payload-bytes",
    ],
    [
      snapshot.completeAudioUnits,
      audio.maximumCompleteUnits,
      "complete-audio-units",
    ],
    [
      snapshot.audioMetadataEntries,
      audio.maximumMetadataEntries,
      "audio-metadata-entries",
    ],
    [
      snapshot.retainedPreparedBatches,
      prepared.maximumRetainedBatches,
      "prepared-batches",
    ],
    [
      snapshot.retainedPreparedSegments,
      prepared.maximumRetainedSegments,
      "prepared-segments",
    ],
    [
      snapshot.retainedNarrationCodePoints,
      prepared.maximumNarrationCodePoints,
      "prepared-narration-code-points",
    ],
    [
      snapshot.retainedNarrationUtf8Bytes,
      prepared.maximumNarrationUtf8Bytes,
      "prepared-narration-utf8-bytes",
    ],
    [
      snapshot.retainedNarrationSentences,
      prepared.maximumSentences,
      "prepared-narration-sentences",
    ],
    [
      snapshot.activeNarrationPreparations,
      work.maximumActiveNarrationPreparations,
      "active-narration-preparations",
    ],
    [snapshot.activeSyntheses, work.maximumActiveSyntheses, "active-syntheses"],
    [
      snapshot.serviceQueuedSyntheses,
      work.maximumServiceQueuedSyntheses,
      "service-queued-syntheses",
    ],
  ];

  for (const [value, maximum, limit] of checks) {
    if (value > maximum) {
      return rejected(limit);
    }
  }
  return ACCEPTED;
}
