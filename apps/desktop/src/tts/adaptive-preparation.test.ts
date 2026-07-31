import { createManualClock } from "@voxleaf/shared/testing";
import { describe, expect, it } from "vitest";

import {
  ADAPTIVE_BUFFER_AUTHORITY_V1,
  sampleFramesFromPlayableMilliseconds,
  type AdaptiveBufferResourceSnapshot,
} from "./adaptive-buffer-authority";
import type { AdaptiveBufferSchedulerObservation } from "./adaptive-buffer-scheduler";
import {
  AdaptiveBoundaryWaitCoordinator,
  AdaptivePreparationError,
  AdaptivePreparationEstimator,
  createAdaptivePreparationUiState,
} from "./adaptive-preparation";

function emptyResources(): AdaptiveBufferResourceSnapshot {
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

function schedulerObservation(
  changes: Partial<AdaptiveBufferSchedulerObservation> = {},
): AdaptiveBufferSchedulerObservation {
  return Object.freeze({
    observedAtMs: 0,
    serviceState: "ready",
    playbackState: "preparing",
    playableSampleFrames: sampleFramesFromPlayableMilliseconds(5_000),
    playableDurationMs: 5_000,
    effectiveListeningDurationMs: 5_000,
    playbackRateState: Object.freeze({
      selectedRatePercent: 100,
      activeRatePercent: null,
      pendingRatePercent: null,
    }),
    targetBufferMs: 15_000,
    lowBuffer: false,
    rangeComplete: false,
    pendingSegmentCount: 1,
    retainedAudioUnitCount: 1,
    discardedAudioUnitCount: 0,
    resourceSnapshot: Object.freeze(emptyResources()),
    nextAction: Object.freeze({
      kind: "synthesize",
      segmentId: "segment:synthetic-ui",
    }),
    ...changes,
  });
}

describe("adaptive preparation estimate", () => {
  it("uses bounded content-free completed timings and includes stopped-service recovery", () => {
    const estimator = new AdaptivePreparationEstimator();
    estimator.record({
      elapsedMs: 10_000,
      acceptedSampleFrames: sampleFramesFromPlayableMilliseconds(5_000),
    });

    expect(
      estimator.estimate({
        playableSampleFrames: sampleFramesFromPlayableMilliseconds(5_000),
        targetMs: 15_000,
        serviceState: "ready",
      }),
    ).toEqual({
      estimatedWaitMs: 20_000,
      timingObservationCount: 1,
    });
    expect(
      estimator.estimate({
        playableSampleFrames: sampleFramesFromPlayableMilliseconds(5_000),
        targetMs: 15_000,
        serviceState: "stopped",
      }),
    ).toEqual({
      estimatedWaitMs: 36_610,
      timingObservationCount: 1,
    });
    expect(
      estimator.estimate({
        playableSampleFrames: sampleFramesFromPlayableMilliseconds(5_000),
        targetMs: 15_000,
        serviceState: "preparing",
      }),
    ).toBeUndefined();
    expect(
      estimator.estimate({
        playableSampleFrames: sampleFramesFromPlayableMilliseconds(15_000),
        targetMs: 15_000,
        serviceState: "stopped",
      }),
    ).toEqual({
      estimatedWaitMs: 0,
      timingObservationCount: 1,
    });
    expect(
      estimator.estimate({
        playableSampleFrames: sampleFramesFromPlayableMilliseconds(5_000),
        targetMs: 15_000,
        serviceState: "failed",
      }),
    ).toBeUndefined();
  });

  it("keeps only eight observations and clears estimates on identity replacement", () => {
    const estimator = new AdaptivePreparationEstimator();
    for (let index = 1; index <= 9; index += 1) {
      estimator.record({
        elapsedMs: index * 1_000,
        acceptedSampleFrames: sampleFramesFromPlayableMilliseconds(1_000),
      });
    }
    expect(
      estimator.estimate({
        playableSampleFrames: 0,
        targetMs: 15_000,
        serviceState: "ready",
      }),
    ).toMatchObject({ timingObservationCount: 8 });

    estimator.reset();
    expect(
      estimator.estimate({
        playableSampleFrames: 0,
        targetMs: 15_000,
        serviceState: "ready",
      }),
    ).toBeUndefined();
  });

  it("rejects invalid timing without content-bearing diagnostics", () => {
    const estimator = new AdaptivePreparationEstimator();
    expect(() =>
      estimator.record({ elapsedMs: 0, acceptedSampleFrames: 24_000 }),
    ).toThrowError(AdaptivePreparationError);
    try {
      estimator.record({ elapsedMs: 0, acceptedSampleFrames: 24_000 });
    } catch (error) {
      expect(error).toMatchObject({
        code: "invalid-estimate-observation",
        message: "Adaptive preparation operation failed.",
      });
    }
  });
});

describe("adaptive semantic-boundary waits", () => {
  it("stays disabled by default and admits only low positive playable lead", () => {
    const clock = createManualClock(0);
    const disabled = new AdaptiveBoundaryWaitCoordinator(clock);
    expect(
      disabled.begin({
        boundary: "paragraph",
        playbackState: "playing",
        playableDurationMs: 10_000,
        moreAudioExpected: true,
      }),
    ).toBe(false);

    const enabled = new AdaptiveBoundaryWaitCoordinator(clock, 2_000);
    expect(
      enabled.begin({
        boundary: "paragraph",
        playbackState: "playing",
        playableDurationMs: 0,
        moreAudioExpected: true,
      }),
    ).toBe(false);
    expect(
      enabled.begin({
        boundary: "chapter",
        playbackState: "playing",
        playableDurationMs: 10_001,
        moreAudioExpected: true,
      }),
    ).toBe(false);
    expect(
      enabled.begin({
        boundary: "paragraph",
        playbackState: "playing",
        playableDurationMs: 8_000,
        moreAudioExpected: true,
      }),
    ).toBe(true);
    expect(enabled.observe()).toMatchObject({
      active: true,
      remainingMs: 2_000,
      completedWaitCount: 0,
      interruptedWaitCount: 0,
    });

    clock.advanceBy(2_000);
    expect(enabled.observe()).toMatchObject({
      active: false,
      remainingMs: 0,
      completedWaitCount: 1,
    });
  });

  it("interrupts an active wait immediately for pause, stop, or invalidation", () => {
    const clock = createManualClock(0);
    const coordinator = new AdaptiveBoundaryWaitCoordinator(clock, 3_000);
    expect(
      coordinator.begin({
        boundary: "chapter",
        playbackState: "playing",
        playableDurationMs: 1,
        moreAudioExpected: true,
      }),
    ).toBe(true);

    coordinator.interrupt();
    expect(coordinator.observe()).toMatchObject({
      active: false,
      remainingMs: 0,
      completedWaitCount: 0,
      interruptedWaitCount: 1,
    });
  });
});

describe("adaptive preparation UI state", () => {
  it("keeps an intentional wait distinct from involuntary buffering", () => {
    const waiting = createAdaptivePreparationUiState({
      mode: { kind: "quick" },
      scheduler: schedulerObservation({
        playbackState: "playing",
        lowBuffer: true,
      }),
      intentionalBoundaryWait: true,
    });
    const buffering = createAdaptivePreparationUiState({
      mode: { kind: "quick" },
      scheduler: schedulerObservation({
        playbackState: "buffering",
        playableSampleFrames: 0,
        playableDurationMs: 0,
        effectiveListeningDurationMs: 0,
      }),
    });

    expect(waiting.phase).toBe("intentional-wait");
    expect(waiting.canPause).toBe(true);
    expect(buffering.phase).toBe("buffering");
    expect(buffering.canPause).toBe(false);
  });

  it("reports bounded pause continuation, completion, and ceiling state", () => {
    const paused = createAdaptivePreparationUiState({
      mode: { kind: "prepared", targetMs: 120_000 },
      scheduler: schedulerObservation({
        playbackState: "paused",
        targetBufferMs: 120_000,
      }),
      estimatedWaitMs: 50_000,
      volumePercent: 65,
    });
    expect(paused).toMatchObject({
      phase: "paused",
      pauseContinuesPreparation: true,
      canResume: true,
      canStop: true,
      targetMs: 120_000,
      volumePercent: 65,
      playbackRate: 1,
      selectedPlaybackRatePercent: 100,
      activePlaybackRatePercent: null,
      pendingPlaybackRatePercent: null,
    });

    const resources = {
      ...emptyResources(),
      audioSampleFrames:
        ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumSampleFrames,
    };
    const complete = createAdaptivePreparationUiState({
      mode: { kind: "prepared", targetMs: 600_000 },
      scheduler: schedulerObservation({
        rangeComplete: true,
        pendingSegmentCount: 0,
        targetBufferMs: 600_000,
        resourceSnapshot: Object.freeze(resources),
        nextAction: Object.freeze({ kind: "none", reason: "complete" }),
      }),
    });
    expect(complete).toMatchObject({
      allRemainingAudioReady: true,
      resourceCeilingReached: true,
      progressValueMs: 5_000,
    });
  });

  it("rejects contradictory content-free scheduler presentation state", () => {
    expect(() =>
      createAdaptivePreparationUiState({
        mode: { kind: "prepared", targetMs: 120_000 },
        scheduler: schedulerObservation({ targetBufferMs: 60_000 }),
      }),
    ).toThrowError(AdaptivePreparationError);
    expect(() =>
      createAdaptivePreparationUiState({
        mode: { kind: "quick" },
        scheduler: schedulerObservation({ playableDurationMs: 4_999 }),
      }),
    ).toThrowError(AdaptivePreparationError);
  });
});
