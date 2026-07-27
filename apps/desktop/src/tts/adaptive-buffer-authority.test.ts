import { describe, expect, it } from "vitest";

import {
  ADAPTIVE_BUFFER_AUTHORITY_V1,
  createAdaptiveBufferThresholds,
  evaluateAdaptiveBufferResources,
  playableMillisecondsFromSampleFrames,
  sampleFramesFromPlayableMilliseconds,
  type AdaptiveBufferResourceLimit,
  type AdaptiveBufferResourceSnapshot,
} from "./adaptive-buffer-authority";

function emptySnapshot(): AdaptiveBufferResourceSnapshot {
  return {
    audioSampleFrames: 0,
    audioPayloadBytes: 0,
    completeAudioUnits: 0,
    audioMetadataEntries: 0,
    retainedPreparedBatches: 0,
    retainedPreparedSegments: 0,
    retainedNarrationCodePoints: 0,
    retainedNarrationUtf8Bytes: 0,
    retainedNarrationSentences: 0,
    activeNarrationPreparations: 0,
    activeSyntheses: 0,
    serviceQueuedSyntheses: 0,
  };
}

describe("adaptive buffer v1 authority", () => {
  it("freezes exact media thresholds and sample-frame arithmetic", () => {
    const authority = ADAPTIVE_BUFFER_AUTHORITY_V1;

    expect(authority.thresholds).toEqual({
      quickStartMs: 15_000,
      lowWaterMarkMs: 10_000,
      refillResumeMs: 60_000,
      preparedTargetMs: [60_000, 120_000, 300_000, 600_000],
      maximumBufferMs: 1_800_000,
    });
    expect(authority.audioLimits.maximumSampleFrames).toBe(43_200_000);
    expect(authority.audioLimits.maximumPayloadBytes).toBe(172_800_000);
    expect(authority.audioLimits.maximumCompleteUnits).toBe(256);
    expect(authority.audioLimits.maximumMetadataEntries).toBe(256);
    expect(authority.audioLimits.serviceUnitReservationSampleFrames).toBe(
      480_000,
    );
    expect(authority.audioLimits.serviceUnitReservationPayloadBytes).toBe(
      1_920_000,
    );
    expect(sampleFramesFromPlayableMilliseconds(15_000)).toBe(360_000);
    expect(playableMillisecondsFromSampleFrames(359_999)).toBe(14_999);
    expect(playableMillisecondsFromSampleFrames(360_000)).toBe(15_000);
    expect(playableMillisecondsFromSampleFrames(43_200_000)).toBe(1_800_000);
  });

  it("uses a shorter complete remaining range without adding a timer", () => {
    expect(createAdaptiveBufferThresholds(15_000)).toEqual({
      lowWaterMarkMs: 10_000,
      targetBufferMs: 15_000,
      maximumBufferMs: 1_800_000,
    });
    expect(createAdaptiveBufferThresholds(600_000, 7_000)).toEqual({
      lowWaterMarkMs: 7_000,
      targetBufferMs: 7_000,
      maximumBufferMs: 1_800_000,
    });
    expect(() => createAdaptiveBufferThresholds(30_000)).toThrow(RangeError);
    expect(() => createAdaptiveBufferThresholds(15_000, 0)).toThrow(RangeError);
  });

  it("freezes volume, speed, and optional boundary-wait choices", () => {
    expect(ADAPTIVE_BUFFER_AUTHORITY_V1.playback).toEqual({
      minimumVolumePercent: 0,
      maximumVolumePercent: 100,
      defaultVolumePercent: 100,
      volumeStepPercent: 5,
      supportedPlaybackRates: [1],
      defaultPlaybackRate: 1,
    });
    expect(ADAPTIVE_BUFFER_AUTHORITY_V1.boundaryWait).toEqual({
      defaultMs: 0,
      supportedMs: [0, 1_000, 2_000, 3_000],
    });
  });

  const exactAndOneOver: ReadonlyArray<
    readonly [
      keyof AdaptiveBufferResourceSnapshot,
      number,
      AdaptiveBufferResourceLimit,
    ]
  > = [
    ["audioSampleFrames", 43_200_000, "audio-sample-frames"],
    ["audioPayloadBytes", 172_800_000, "audio-payload-bytes"],
    ["completeAudioUnits", 256, "complete-audio-units"],
    ["audioMetadataEntries", 256, "audio-metadata-entries"],
    ["retainedPreparedBatches", 1, "prepared-batches"],
    ["retainedPreparedSegments", 16, "prepared-segments"],
    ["retainedNarrationCodePoints", 8_192, "prepared-narration-code-points"],
    ["retainedNarrationUtf8Bytes", 24_576, "prepared-narration-utf8-bytes"],
    ["retainedNarrationSentences", 64, "prepared-narration-sentences"],
    ["activeNarrationPreparations", 1, "active-narration-preparations"],
    ["activeSyntheses", 1, "active-syntheses"],
    ["serviceQueuedSyntheses", 0, "service-queued-syntheses"],
  ];

  it.each(exactAndOneOver)(
    "accepts exact %s and rejects one over",
    (field, maximum, limit) => {
      const exact = { ...emptySnapshot(), [field]: maximum };
      const oneOver = { ...emptySnapshot(), [field]: maximum + 1 };

      expect(evaluateAdaptiveBufferResources(exact)).toEqual({
        accepted: true,
      });
      expect(evaluateAdaptiveBufferResources(oneOver)).toEqual({
        accepted: false,
        limit,
      });
    },
  );

  it("accepts every simultaneous maximum in one snapshot", () => {
    expect(
      evaluateAdaptiveBufferResources({
        audioSampleFrames: 43_200_000,
        audioPayloadBytes: 172_800_000,
        completeAudioUnits: 256,
        audioMetadataEntries: 256,
        retainedPreparedBatches: 1,
        retainedPreparedSegments: 16,
        retainedNarrationCodePoints: 8_192,
        retainedNarrationUtf8Bytes: 24_576,
        retainedNarrationSentences: 64,
        activeNarrationPreparations: 1,
        activeSyntheses: 1,
        serviceQueuedSyntheses: 0,
      }),
    ).toEqual({ accepted: true });
  });

  it("rejects malformed counters without retaining their values", () => {
    for (const value of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(
        evaluateAdaptiveBufferResources({
          ...emptySnapshot(),
          audioSampleFrames: value,
        }),
      ).toEqual({ accepted: false, limit: "invalid-snapshot" });
    }
  });
});
