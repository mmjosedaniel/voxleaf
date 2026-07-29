import { decodeLocatorRangeV1, decodeReadingLocatorV1 } from "@voxleaf/shared";
import {
  createManualClock,
  VALID_SYNTHETIC_DOCUMENT_FIXTURE,
  type ManualClock,
} from "@voxleaf/shared/testing";
import { describe, expect, it } from "vitest";

import {
  ADAPTIVE_BUFFER_AUTHORITY_V1,
  evaluateAdaptiveBufferResources,
  sampleFramesFromPlayableMilliseconds,
  type AdaptiveBufferResourceSnapshot,
} from "./adaptive-buffer-authority";
import {
  AdaptiveBufferScheduler,
  canReserveAdaptiveBufferServiceUnit,
  type AdaptiveBufferAudioUnit,
  type AdaptiveBufferPreparedSegment,
  type AdaptiveBufferSchedulerObservation,
  type AdaptiveBufferStartMode,
} from "./adaptive-buffer-scheduler";
import type { PlaybackTransitionPauseMs } from "./playback-transition-policy";

const IDENTITY = Object.freeze({
  sessionId: "session:synthetic-scheduler-1",
  generationId: "generation:synthetic-scheduler-1",
});
const REFERENCE_QWEN_RTF = 1.467080448861599;
const REFERENCE_RESTART_PREPARE_MS = 16_610;
const TRACE_UNIT_MS = 250;
const SOURCE_START = decodeReadingLocatorV1(
  VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator,
);

interface OwnedUnit extends AdaptiveBufferAudioUnit {
  readonly releaseCount: number;
}

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

function segment(
  index: number,
  transitionPauseMs: PlaybackTransitionPauseMs = 0,
): AdaptiveBufferPreparedSegment {
  return Object.freeze({
    segmentId: `segment:synthetic-${index}`,
    sequence: index - 1,
    sourceRange: decodeLocatorRangeV1({
      schemaVersion: 1,
      start: {
        ...SOURCE_START,
        textOffsetCodePoints: SOURCE_START.textOffsetCodePoints + index,
      },
      end: {
        ...SOURCE_START,
        textOffsetCodePoints: SOURCE_START.textOffsetCodePoints + index + 1,
      },
    }),
    narrationCodePoints: 20,
    narrationUtf8Bytes: 20,
    sentenceCount: 1,
    transitionPauseMs,
  });
}

function ownedUnit(
  segmentId: string,
  playableMs: number,
  identity = IDENTITY,
  payloadByteAdjustment = 0,
): OwnedUnit {
  const sampleCountSamples = sampleFramesFromPlayableMilliseconds(playableMs);
  let releaseCount = 0;
  const payload = new Uint8Array(sampleCountSamples * 4);
  return {
    metadata: Object.freeze({
      ...identity,
      segmentId,
      sampleRateHz: 24_000,
      channelCount: 1,
      sampleFormat: "float32-le",
      sampleCountSamples,
      payloadBytes: sampleCountSamples * 4 + payloadByteAdjustment,
      endOfSegment: true,
    }),
    payload,
    get releaseCount() {
      return releaseCount;
    },
    release() {
      releaseCount += 1;
    },
  };
}

function makeReadyScheduler(
  clock: ManualClock,
  mode: AdaptiveBufferStartMode = { kind: "quick" },
): AdaptiveBufferScheduler {
  const scheduler = new AdaptiveBufferScheduler(clock, IDENTITY, mode);
  expect(scheduler.observe().nextAction).toEqual({ kind: "start-service" });
  scheduler.beginServiceStart();
  scheduler.markServiceStarted();
  expect(scheduler.observe().nextAction).toEqual({ kind: "prepare-service" });
  scheduler.beginServicePrepare();
  scheduler.markServiceReady();
  return scheduler;
}

function prepare(
  scheduler: AdaptiveBufferScheduler,
  segments: readonly AdaptiveBufferPreparedSegment[],
  complete = false,
): void {
  expect(scheduler.observe().nextAction).toEqual({
    kind: "prepare-narration",
  });
  scheduler.beginNarrationPreparation();
  scheduler.acceptPreparedBatch({ segments, complete });
}

function synthesize(scheduler: AdaptiveBufferScheduler, unit: OwnedUnit): void {
  expect(scheduler.beginSynthesis()).toBe(unit.metadata.segmentId);
  expect(scheduler.acceptCompletedUnit(unit)).toBe("accepted");
}

function assertWithinAuthority(
  observation: AdaptiveBufferSchedulerObservation,
): void {
  expect(evaluateAdaptiveBufferResources(observation.resourceSnapshot)).toEqual(
    { accepted: true },
  );
  expect(observation.playableSampleFrames).toBeLessThanOrEqual(
    ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumSampleFrames,
  );
}

describe("adaptive buffer scheduler", () => {
  it("retains only a bounded numeric transition pause with the matching audio unit", () => {
    const clock = createManualClock(0);
    const scheduler = makeReadyScheduler(clock);
    const prepared = segment(1, 900);
    prepare(scheduler, [prepared], true);
    synthesize(scheduler, ownedUnit(prepared.segmentId, 16_000));

    expect(scheduler.currentPlaybackUnit()).toMatchObject({
      sequence: prepared.sequence,
      transitionPauseMs: 900,
    });
    expect(JSON.stringify(scheduler.observe())).not.toContain(
      "transitionPause",
    );
  });

  it("rejects an unfrozen transition pause value", () => {
    const scheduler = makeReadyScheduler(createManualClock(0));
    scheduler.beginNarrationPreparation();

    expect(() =>
      scheduler.acceptPreparedBatch({
        segments: [
          {
            ...segment(1),
            transitionPauseMs: 1 as PlaybackTransitionPauseMs,
          },
        ],
        complete: true,
      }),
    ).toThrow("Adaptive buffer scheduler operation failed.");
  });

  it("accepts a spoken fragment with no recognized sentence boundary", () => {
    const scheduler = makeReadyScheduler(createManualClock(0));
    const fragment = Object.freeze({
      ...segment(1),
      sentenceCount: 0,
    });

    prepare(scheduler, [fragment], true);

    expect(scheduler.observe()).toMatchObject({
      resourceSnapshot: {
        retainedNarrationSentences: 0,
        retainedPreparedSegments: 1,
      },
      nextAction: {
        kind: "synthesize",
        segmentId: fragment.segmentId,
      },
    });
  });

  it("projects immutable source ranges only while their FIFO units are eligible", () => {
    const clock = createManualClock(0);
    const scheduler = makeReadyScheduler(clock);
    const first = segment(1);
    const second = segment(2);
    prepare(scheduler, [first, second], true);
    synthesize(scheduler, ownedUnit(first.segmentId, 16_000));

    expect(scheduler.currentPlaybackUnit()).toMatchObject({
      sequence: first.sequence,
      sourceRange: first.sourceRange,
      metadata: {
        ...IDENTITY,
        segmentId: first.segmentId,
      },
    });
    expect(Object.isFrozen(scheduler.currentPlaybackUnit()?.sourceRange)).toBe(
      true,
    );
    expect(JSON.stringify(scheduler.observe())).not.toContain("sourceRange");

    scheduler.invalidate();

    expect(scheduler.currentPlaybackUnit()).toBeUndefined();
    expect(JSON.stringify(scheduler.observe())).not.toContain("sourceRange");
  });

  it("starts quick playback only from contiguous complete units and fills toward one minute", () => {
    const scheduler = makeReadyScheduler(createManualClock(0));
    prepare(scheduler, [segment(1), segment(2), segment(3)]);

    const first = ownedUnit(segment(1).segmentId, 11_280);
    synthesize(scheduler, first);
    expect(scheduler.observe()).toMatchObject({
      playbackState: "preparing",
      playableDurationMs: 11_280,
      targetBufferMs: 15_000,
    });

    const second = ownedUnit(segment(2).segmentId, 14_880);
    synthesize(scheduler, second);
    expect(scheduler.observe()).toMatchObject({
      playbackState: "playing",
      playableDurationMs: 26_160,
      targetBufferMs: 60_000,
      nextAction: {
        kind: "synthesize",
        segmentId: segment(3).segmentId,
      },
    });
    expect(first.releaseCount).toBe(0);
    expect(second.releaseCount).toBe(0);
    expect(scheduler.currentPlaybackUnit()).toMatchObject({
      sequence: 0,
      metadata: { segmentId: segment(1).segmentId },
      consumedSampleFrames: 0,
    });

    expect(
      scheduler.consumeSampleFrames(first.metadata.sampleCountSamples),
    ).toBe(first.metadata.sampleCountSamples);
    expect(first.releaseCount).toBe(1);
    expect(second.releaseCount).toBe(0);
    expect(scheduler.currentPlaybackUnit()).toMatchObject({
      sequence: 1,
      metadata: { segmentId: segment(2).segmentId },
      consumedSampleFrames: 0,
    });
    assertWithinAuthority(scheduler.observe());
  });

  it("continues bounded quick-mode generation while playback alone is paused", () => {
    const scheduler = makeReadyScheduler(createManualClock(0));
    prepare(scheduler, [segment(1), segment(2), segment(3), segment(4)]);

    synthesize(scheduler, ownedUnit(segment(1).segmentId, 15_000));
    expect(scheduler.observe().playbackState).toBe("playing");
    scheduler.pausePlayback();
    expect(scheduler.observe()).toMatchObject({
      playbackState: "paused",
      targetBufferMs: 60_000,
      nextAction: {
        kind: "synthesize",
        segmentId: segment(2).segmentId,
      },
    });

    synthesize(scheduler, ownedUnit(segment(2).segmentId, 15_000));
    synthesize(scheduler, ownedUnit(segment(3).segmentId, 15_000));
    synthesize(scheduler, ownedUnit(segment(4).segmentId, 15_000));
    expect(scheduler.observe()).toMatchObject({
      playbackState: "paused",
      playableDurationMs: 60_000,
      nextAction: { kind: "none", reason: "backpressure" },
    });

    scheduler.resumePlayback();
    expect(scheduler.observe().playbackState).toBe("playing");
  });

  it("honors prepared targets and starts a shorter complete remaining range", () => {
    const preparedScheduler = makeReadyScheduler(createManualClock(0), {
      kind: "prepared",
      targetMs: 60_000,
    });
    prepare(preparedScheduler, [segment(1), segment(2), segment(3)]);
    synthesize(preparedScheduler, ownedUnit(segment(1).segmentId, 20_000));
    synthesize(preparedScheduler, ownedUnit(segment(2).segmentId, 20_000));
    expect(preparedScheduler.observe().playbackState).toBe("preparing");
    synthesize(preparedScheduler, ownedUnit(segment(3).segmentId, 20_000));
    expect(preparedScheduler.observe()).toMatchObject({
      playbackState: "playing",
      playableDurationMs: 60_000,
    });

    const shortScheduler = makeReadyScheduler(createManualClock(0));
    prepare(shortScheduler, [segment(4), segment(5)], true);
    synthesize(shortScheduler, ownedUnit(segment(4).segmentId, 5_000));
    expect(shortScheduler.observe().playbackState).toBe("preparing");
    synthesize(shortScheduler, ownedUnit(segment(5).segmentId, 5_000));
    expect(shortScheduler.observe()).toMatchObject({
      playbackState: "playing",
      playableDurationMs: 10_000,
      rangeComplete: true,
    });
    shortScheduler.consumeSampleFrames(
      sampleFramesFromPlayableMilliseconds(10_000),
    );
    expect(shortScheduler.observe()).toMatchObject({
      playbackState: "complete",
      playableDurationMs: 0,
    });
  });

  it("applies exact 30-minute reservation backpressure across every audio dimension", () => {
    const oneReservation = ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits;
    const beforeExactSaturation: AdaptiveBufferResourceSnapshot = {
      ...emptyResources(),
      audioSampleFrames:
        oneReservation.maximumSampleFrames -
        oneReservation.serviceUnitReservationSampleFrames,
      audioPayloadBytes:
        oneReservation.maximumPayloadBytes -
        oneReservation.serviceUnitReservationPayloadBytes,
      completeAudioUnits: 89,
      audioMetadataEntries: 89,
    };
    const exactSaturation: AdaptiveBufferResourceSnapshot = {
      ...emptyResources(),
      audioSampleFrames: oneReservation.maximumSampleFrames,
      audioPayloadBytes: oneReservation.maximumPayloadBytes,
      completeAudioUnits: 90,
      audioMetadataEntries: 90,
    };

    expect(canReserveAdaptiveBufferServiceUnit(beforeExactSaturation)).toBe(
      true,
    );
    expect(canReserveAdaptiveBufferServiceUnit(exactSaturation)).toBe(false);
    expect(evaluateAdaptiveBufferResources(exactSaturation)).toEqual({
      accepted: true,
    });
  });

  it("makes queued units stale before cancellation and releases owners in bounded turns", () => {
    const clock = createManualClock(0);
    const scheduler = makeReadyScheduler(clock);
    prepare(scheduler, [segment(1), segment(2), segment(3)]);
    const first = ownedUnit(segment(1).segmentId, 8_000);
    const second = ownedUnit(segment(2).segmentId, 8_000);
    synthesize(scheduler, first);
    synthesize(scheduler, second);
    const activeSegmentId = scheduler.beginSynthesis();
    const late = ownedUnit(activeSegmentId, 8_000);

    expect(scheduler.invalidate()).toBe("cancel");
    expect(scheduler.observe()).toMatchObject({
      serviceState: "cancelling",
      playbackState: "stopped",
      playableDurationMs: 0,
      retainedAudioUnitCount: 2,
      discardedAudioUnitCount: 2,
      nextAction: { kind: "none", reason: "invalidated" },
    });
    expect(first.releaseCount).toBe(0);
    expect(second.releaseCount).toBe(0);
    expect(scheduler.acceptCompletedUnit(late)).toBe("stale");
    expect(late.releaseCount).toBe(1);
    expect(scheduler.releaseDiscardedAudioUnits(1)).toBe(1);
    expect(first.releaseCount).toBe(1);
    expect(second.releaseCount).toBe(0);
    expect(scheduler.releaseDiscardedAudioUnits(1)).toBe(0);
    expect(second.releaseCount).toBe(1);
    expect(scheduler.observe().resourceSnapshot).toEqual(emptyResources());

    scheduler.settleServiceStop();
    expect(scheduler.observe().serviceState).toBe("stopped");
  });

  it("releases an invalid active completion once and removes its reservation", () => {
    const scheduler = makeReadyScheduler(createManualClock(0));
    prepare(scheduler, [segment(1)]);
    const segmentId = scheduler.beginSynthesis();
    const invalid = ownedUnit(segmentId, 1_000, IDENTITY, 4);

    expect(scheduler.acceptCompletedUnit(invalid)).toBe("invalid");
    expect(invalid.releaseCount).toBe(1);
    expect(scheduler.observe()).toMatchObject({
      serviceState: "failed",
      playbackState: "failed",
      playableDurationMs: 0,
      retainedAudioUnitCount: 0,
      resourceSnapshot: {
        audioSampleFrames: 0,
        audioPayloadBytes: 0,
        completeAudioUnits: 0,
        audioMetadataEntries: 0,
        activeSyntheses: 0,
      },
    });
  });

  it("rejects non-finite PCM without making it playable", () => {
    const scheduler = makeReadyScheduler(createManualClock(0));
    prepare(scheduler, [segment(1)]);
    const segmentId = scheduler.beginSynthesis();
    const invalid = ownedUnit(segmentId, 1_000);
    new DataView(invalid.payload.buffer).setFloat32(0, Number.NaN, true);

    expect(scheduler.acceptCompletedUnit(invalid)).toBe("invalid");
    expect(invalid.releaseCount).toBe(1);
    expect(scheduler.observe()).toMatchObject({
      playbackState: "failed",
      playableSampleFrames: 0,
      retainedAudioUnitCount: 0,
    });
  });

  it("requires an explicit stopped-to-started-to-prepared recovery before later synthesis", () => {
    const clock = createManualClock(500);
    const scheduler = makeReadyScheduler(clock);
    prepare(scheduler, [segment(1)]);
    scheduler.beginSynthesis();
    expect(scheduler.invalidate()).toBe("cancel");
    scheduler.settleServiceStop();

    const replacement = scheduler.beginReplacement({
      sessionId: "session:replacement",
      generationId: "generation:replacement",
    });
    expect(replacement.observe()).toMatchObject({
      observedAtMs: 500,
      serviceState: "stopped",
      nextAction: { kind: "start-service" },
    });
    replacement.beginServiceStart();
    expect(replacement.observe().nextAction).toEqual({
      kind: "none",
      reason: "service-transition",
    });
    replacement.markServiceStarted();
    replacement.beginServicePrepare();
    clock.advanceBy(REFERENCE_RESTART_PREPARE_MS);
    replacement.markServiceReady();
    expect(replacement.observe()).toMatchObject({
      observedAtMs: 17_110,
      serviceState: "ready",
      nextAction: { kind: "prepare-narration" },
    });
  });

  it("continues through bursty completions and exposes low-water then failure", () => {
    const clock = createManualClock(0);
    const scheduler = makeReadyScheduler(clock);
    prepare(scheduler, [segment(1), segment(2), segment(3), segment(4)]);
    synthesize(scheduler, ownedUnit(segment(1).segmentId, 8_000));
    synthesize(scheduler, ownedUnit(segment(2).segmentId, 8_000));
    expect(scheduler.observe().playbackState).toBe("playing");

    clock.advanceBy(5_000);
    synthesize(scheduler, ownedUnit(segment(3).segmentId, 1_000));
    scheduler.consumeSampleFrames(sampleFramesFromPlayableMilliseconds(8_000));
    expect(scheduler.observe()).toMatchObject({
      playbackState: "playing",
      playableDurationMs: 9_000,
      lowBuffer: true,
    });

    clock.advanceBy(100);
    scheduler.beginSynthesis();
    scheduler.failActiveSynthesis();
    expect(scheduler.observe()).toMatchObject({
      serviceState: "failed",
      playbackState: "playing",
    });
    scheduler.consumeSampleFrames(sampleFramesFromPlayableMilliseconds(9_000));
    expect(scheduler.observe()).toMatchObject({
      serviceState: "failed",
      playbackState: "failed",
      playableDurationMs: 0,
    });
  });

  it("repeats the reference RTF depletion trace deterministically without a real-time claim", () => {
    const first = runReferenceTrace(REFERENCE_QWEN_RTF);
    const second = runReferenceTrace(REFERENCE_QWEN_RTF);

    expect(second).toEqual(first);
    expect(first.initialPlayableMs).toBe(15_000);
    expect(first.playbackBeforeBufferingMs).toBeGreaterThanOrEqual(45_000);
    expect(first.playbackBeforeBufferingMs).toBeLessThanOrEqual(49_000);
    expect(first.lowWaterObserved).toBe(true);
    expect(first.maximumObservedResourcesAccepted).toBe(true);
  });

  it("keeps a faster-than-real-time trace supplied while bounded by the target", () => {
    const trace = runReferenceTrace(0.5, 120_000);

    expect(trace.playbackBeforeBufferingMs).toBe(120_000);
    expect(trace.finalState).toBe("playing");
    expect(trace.maximumPlayableMs).toBeLessThanOrEqual(60_000);
    expect(trace.maximumObservedResourcesAccepted).toBe(true);
  });
});

interface TraceResult {
  readonly initialPlayableMs: number;
  readonly playbackBeforeBufferingMs: number;
  readonly finalState: string;
  readonly lowWaterObserved: boolean;
  readonly maximumPlayableMs: number;
  readonly maximumObservedResourcesAccepted: boolean;
}

function runReferenceTrace(
  rtf: number,
  maximumPlaybackMs = 120_000,
): TraceResult {
  const clock = createManualClock(0);
  const scheduler = makeReadyScheduler(clock);
  let nextSegment = 1;
  let lowWaterObserved = false;
  let maximumPlayableMs = 0;
  let maximumObservedResourcesAccepted = true;
  let scheduledCompletion = false;

  const observe = () => {
    const observation = scheduler.observe();
    lowWaterObserved ||= observation.lowBuffer;
    maximumPlayableMs = Math.max(
      maximumPlayableMs,
      observation.playableDurationMs,
    );
    maximumObservedResourcesAccepted &&= evaluateAdaptiveBufferResources(
      observation.resourceSnapshot,
    ).accepted;
    return observation;
  };

  const drive = () => {
    let action = observe().nextAction;
    if (action.kind === "prepare-narration") {
      const segments = Array.from({ length: 16 }, () => segment(nextSegment++));
      prepare(scheduler, segments);
      action = observe().nextAction;
    }
    if (action.kind === "synthesize" && !scheduledCompletion) {
      const segmentId = scheduler.beginSynthesis();
      scheduledCompletion = true;
      clock.schedule(Math.round(rtf * TRACE_UNIT_MS), () => {
        scheduledCompletion = false;
        expect(
          scheduler.acceptCompletedUnit(ownedUnit(segmentId, TRACE_UNIT_MS)),
        ).toBe("accepted");
        drive();
      });
    }
  };

  drive();
  while (observe().playbackState !== "playing") {
    clock.advanceBy(1);
  }
  const initialPlayableMs = observe().playableDurationMs;
  let playbackBeforeBufferingMs = 0;
  while (
    playbackBeforeBufferingMs < maximumPlaybackMs &&
    observe().playbackState === "playing"
  ) {
    clock.advanceBy(1_000);
    if (observe().playbackState === "playing") {
      scheduler.consumeSampleFrames(
        sampleFramesFromPlayableMilliseconds(1_000),
      );
      playbackBeforeBufferingMs += 1_000;
      drive();
    }
  }
  const final = observe();
  return Object.freeze({
    initialPlayableMs,
    playbackBeforeBufferingMs,
    finalState: final.playbackState,
    lowWaterObserved,
    maximumPlayableMs,
    maximumObservedResourcesAccepted,
  });
}
