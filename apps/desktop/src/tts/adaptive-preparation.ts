import {
  ADAPTIVE_BUFFER_AUTHORITY_V1,
  playableMillisecondsFromSampleFrames,
  sampleFramesFromPlayableMilliseconds,
} from "./adaptive-buffer-authority";
import type {
  AdaptiveBufferPlaybackState,
  AdaptiveBufferSchedulerObservation,
  AdaptiveBufferServiceState,
  AdaptiveBufferStartMode,
} from "./adaptive-buffer-scheduler";

const ESTIMATE_OBSERVATION_LIMIT = 8;
const EXACT_HOST_RESTART_PREPARE_ESTIMATE_MS = 16_610;

export type AdaptivePreparationErrorCode =
  "invalid-boundary-wait" | "invalid-estimate-observation" | "invalid-ui-state";

export class AdaptivePreparationError extends Error {
  public readonly code: AdaptivePreparationErrorCode;

  public constructor(code: AdaptivePreparationErrorCode) {
    super("Adaptive preparation operation failed.");
    this.name = "AdaptivePreparationError";
    this.code = code;
  }
}

export interface AdaptivePreparationTimingObservation {
  readonly elapsedMs: number;
  readonly acceptedSampleFrames: number;
}

export interface AdaptivePreparationEstimateInput {
  readonly playableSampleFrames: number;
  readonly targetMs: number;
  readonly serviceState: AdaptiveBufferServiceState;
}

export interface AdaptivePreparationEstimate {
  readonly estimatedWaitMs: number;
  readonly timingObservationCount: number;
}

function isPositiveSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function divideRoundUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator - 1n) / denominator;
}

/**
 * Keeps only content-free completed production timings. No narration text,
 * segment identity, model output, or audio payload enters this owner.
 */
export class AdaptivePreparationEstimator {
  readonly #observations: AdaptivePreparationTimingObservation[] = [];

  public record(observation: AdaptivePreparationTimingObservation): void {
    if (
      !isPositiveSafeInteger(observation.elapsedMs) ||
      !isPositiveSafeInteger(observation.acceptedSampleFrames)
    ) {
      throw new AdaptivePreparationError("invalid-estimate-observation");
    }
    this.#observations.push(Object.freeze({ ...observation }));
    if (this.#observations.length > ESTIMATE_OBSERVATION_LIMIT) {
      this.#observations.shift();
    }
  }

  public estimate(
    input: AdaptivePreparationEstimateInput,
  ): AdaptivePreparationEstimate | undefined {
    if (
      !Number.isSafeInteger(input.playableSampleFrames) ||
      input.playableSampleFrames < 0
    ) {
      throw new AdaptivePreparationError("invalid-estimate-observation");
    }
    let targetSampleFrames: number;
    try {
      targetSampleFrames = sampleFramesFromPlayableMilliseconds(input.targetMs);
    } catch {
      throw new AdaptivePreparationError("invalid-estimate-observation");
    }
    if (
      this.#observations.length === 0 ||
      [
        "cancelling",
        "failed",
        "preparing",
        "starting",
        "stopping",
        "unloaded",
      ].includes(input.serviceState)
    ) {
      return undefined;
    }

    const remainingSampleFrames = Math.max(
      0,
      targetSampleFrames - input.playableSampleFrames,
    );
    const totals = this.#observations.reduce(
      (result, observation) => ({
        elapsedMs: result.elapsedMs + BigInt(observation.elapsedMs),
        sampleFrames:
          result.sampleFrames + BigInt(observation.acceptedSampleFrames),
      }),
      { elapsedMs: 0n, sampleFrames: 0n },
    );
    let estimatedWaitMs = divideRoundUp(
      BigInt(remainingSampleFrames) * totals.elapsedMs,
      totals.sampleFrames,
    );
    if (input.serviceState === "stopped" && remainingSampleFrames > 0) {
      estimatedWaitMs += BigInt(EXACT_HOST_RESTART_PREPARE_ESTIMATE_MS);
    }
    if (estimatedWaitMs > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new AdaptivePreparationError("invalid-estimate-observation");
    }
    return Object.freeze({
      estimatedWaitMs: Number(estimatedWaitMs),
      timingObservationCount: this.#observations.length,
    });
  }

  public reset(): void {
    this.#observations.splice(0);
  }
}

export type AdaptiveBoundaryKind = "chapter" | "paragraph";

export interface AdaptiveBoundaryWaitClock {
  readonly nowMs: number;
}

export interface AdaptiveBoundaryWaitRequest {
  readonly boundary: AdaptiveBoundaryKind;
  readonly playbackState: AdaptiveBufferPlaybackState;
  readonly playableDurationMs: number;
  readonly moreAudioExpected: boolean;
}

export interface AdaptiveBoundaryWaitObservation {
  readonly active: boolean;
  readonly configuredDurationMs: 0 | 1_000 | 2_000 | 3_000;
  readonly remainingMs: number;
  readonly completedWaitCount: number;
  readonly interruptedWaitCount: number;
}

/**
 * Decides whether one optional semantic-boundary wait is eligible. The caller
 * remains responsible for pausing/resuming its playback backend. The default
 * authority value is zero, so production behavior stays disabled until the
 * exact-host integration milestone evaluates a nonzero choice.
 */
export class AdaptiveBoundaryWaitCoordinator {
  readonly #clock: AdaptiveBoundaryWaitClock;
  readonly #durationMs: 0 | 1_000 | 2_000 | 3_000;
  #activeUntilMs: number | undefined;
  #completedWaitCount = 0;
  #interruptedWaitCount = 0;

  public constructor(
    clock: AdaptiveBoundaryWaitClock,
    durationMs: 0 | 1_000 | 2_000 | 3_000 = 0,
  ) {
    if (
      !Number.isSafeInteger(clock.nowMs) ||
      clock.nowMs < 0 ||
      clock.nowMs > Number.MAX_SAFE_INTEGER - durationMs ||
      !ADAPTIVE_BUFFER_AUTHORITY_V1.boundaryWait.supportedMs.includes(
        durationMs,
      )
    ) {
      throw new AdaptivePreparationError("invalid-boundary-wait");
    }
    this.#clock = clock;
    this.#durationMs = durationMs;
  }

  public begin(request: AdaptiveBoundaryWaitRequest): boolean {
    this.#settleElapsedWait();
    if (
      this.#durationMs === 0 ||
      this.#activeUntilMs !== undefined ||
      !["chapter", "paragraph"].includes(request.boundary) ||
      request.playbackState !== "playing" ||
      !Number.isSafeInteger(request.playableDurationMs) ||
      request.playableDurationMs <= 0 ||
      request.playableDurationMs >
        ADAPTIVE_BUFFER_AUTHORITY_V1.thresholds.lowWaterMarkMs ||
      !request.moreAudioExpected
    ) {
      return false;
    }
    this.#activeUntilMs = this.#clock.nowMs + this.#durationMs;
    return true;
  }

  public interrupt(): void {
    this.#settleElapsedWait();
    if (this.#activeUntilMs !== undefined) {
      this.#activeUntilMs = undefined;
      this.#interruptedWaitCount += 1;
    }
  }

  public observe(): AdaptiveBoundaryWaitObservation {
    this.#settleElapsedWait();
    return Object.freeze({
      active: this.#activeUntilMs !== undefined,
      configuredDurationMs: this.#durationMs,
      remainingMs:
        this.#activeUntilMs === undefined
          ? 0
          : this.#activeUntilMs - this.#clock.nowMs,
      completedWaitCount: this.#completedWaitCount,
      interruptedWaitCount: this.#interruptedWaitCount,
    });
  }

  #settleElapsedWait(): void {
    if (!Number.isSafeInteger(this.#clock.nowMs) || this.#clock.nowMs < 0) {
      throw new AdaptivePreparationError("invalid-boundary-wait");
    }
    if (
      this.#activeUntilMs !== undefined &&
      this.#clock.nowMs >= this.#activeUntilMs
    ) {
      this.#activeUntilMs = undefined;
      this.#completedWaitCount += 1;
    }
  }
}

export type AdaptivePreparationUiPhase =
  | "buffering"
  | "complete"
  | "failed"
  | "intentional-wait"
  | "paused"
  | "playing"
  | "preparing"
  | "stopped";

export interface AdaptivePreparationUiState {
  readonly mode: AdaptiveBufferStartMode;
  readonly phase: AdaptivePreparationUiPhase;
  readonly readyMs: number;
  readonly targetMs: number;
  readonly progressValueMs: number;
  readonly estimatedWaitMs: number | undefined;
  readonly lowBuffer: boolean;
  readonly allRemainingAudioReady: boolean;
  readonly resourceCeilingReached: boolean;
  readonly pauseContinuesPreparation: boolean;
  readonly canPause: boolean;
  readonly canResume: boolean;
  readonly canStop: boolean;
  readonly volumePercent: number;
  readonly playbackRate: 1;
}

export interface AdaptivePreparationUiInput {
  readonly mode: AdaptiveBufferStartMode;
  readonly scheduler: AdaptiveBufferSchedulerObservation;
  readonly estimatedWaitMs?: number;
  readonly intentionalBoundaryWait?: boolean;
  readonly volumePercent?: number;
}

function isResourceCeilingReached(
  observation: AdaptiveBufferSchedulerObservation,
): boolean {
  const resources = observation.resourceSnapshot;
  const audio = ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits;
  return (
    resources.audioSampleFrames >= audio.maximumSampleFrames ||
    resources.audioPayloadBytes >= audio.maximumPayloadBytes ||
    resources.completeAudioUnits >= audio.maximumCompleteUnits ||
    resources.audioMetadataEntries >= audio.maximumMetadataEntries
  );
}

function phaseFrom(
  playbackState: AdaptiveBufferPlaybackState,
  intentionalBoundaryWait: boolean,
): AdaptivePreparationUiPhase {
  return intentionalBoundaryWait && playbackState === "playing"
    ? "intentional-wait"
    : playbackState;
}

export function createAdaptivePreparationUiState(
  input: AdaptivePreparationUiInput,
): AdaptivePreparationUiState {
  const readyMs = playableMillisecondsFromSampleFrames(
    input.scheduler.playableSampleFrames,
  );
  const targetMs = input.scheduler.targetBufferMs;
  const volumePercent =
    input.volumePercent ??
    ADAPTIVE_BUFFER_AUTHORITY_V1.playback.defaultVolumePercent;
  if (
    !Number.isInteger(volumePercent) ||
    volumePercent <
      ADAPTIVE_BUFFER_AUTHORITY_V1.playback.minimumVolumePercent ||
    volumePercent >
      ADAPTIVE_BUFFER_AUTHORITY_V1.playback.maximumVolumePercent ||
    readyMs !== input.scheduler.playableDurationMs ||
    (input.mode.kind === "quick" &&
      targetMs !== ADAPTIVE_BUFFER_AUTHORITY_V1.thresholds.quickStartMs &&
      targetMs !== ADAPTIVE_BUFFER_AUTHORITY_V1.thresholds.refillResumeMs) ||
    (input.mode.kind === "prepared" && input.mode.targetMs !== targetMs) ||
    (input.estimatedWaitMs !== undefined &&
      (!Number.isSafeInteger(input.estimatedWaitMs) ||
        input.estimatedWaitMs < 0))
  ) {
    throw new AdaptivePreparationError("invalid-ui-state");
  }
  const phase = phaseFrom(
    input.scheduler.playbackState,
    input.intentionalBoundaryWait ?? false,
  );
  const nextAction = input.scheduler.nextAction;
  const pauseContinuesPreparation =
    phase === "paused" &&
    !(
      nextAction.kind === "none" &&
      ["backpressure", "complete", "failed", "invalidated"].includes(
        nextAction.reason,
      )
    );
  const allRemainingAudioReady =
    input.scheduler.rangeComplete &&
    input.scheduler.pendingSegmentCount === 0 &&
    input.scheduler.resourceSnapshot.activeNarrationPreparations === 0 &&
    input.scheduler.resourceSnapshot.activeSyntheses === 0 &&
    readyMs > 0;

  return Object.freeze({
    mode: Object.freeze({ ...input.mode }),
    phase,
    readyMs,
    targetMs,
    progressValueMs: Math.min(readyMs, targetMs),
    estimatedWaitMs: input.estimatedWaitMs,
    lowBuffer: input.scheduler.lowBuffer,
    allRemainingAudioReady,
    resourceCeilingReached: isResourceCeilingReached(input.scheduler),
    pauseContinuesPreparation,
    canPause: phase === "playing" || phase === "intentional-wait",
    canResume: phase === "paused",
    canStop: !["complete", "failed", "stopped"].includes(phase),
    volumePercent,
    playbackRate: 1,
  });
}
