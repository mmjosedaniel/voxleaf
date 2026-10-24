import type { LocatorRangeV1 } from "@voxleaf/shared";

import { SYNCHRONIZATION_AUTHORITY_V1 } from "../reader/synchronization-authority";
import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "./adaptive-buffer-authority";
import {
  AdaptiveBufferScheduler,
  type AdaptiveBufferPlaybackUnit,
} from "./adaptive-buffer-scheduler";
import {
  isNarrationPlaybackRatePercentV3,
  type NarrationPlaybackRatePercentV3,
} from "./reader-settings-playback-authority-v3";
import {
  PcmPlaybackError,
  type PcmPlaybackBackend,
  type PcmPlaybackHandle,
  type PcmPlaybackRequest,
} from "./pcm-playback-contracts";

export {
  PcmPlaybackError,
  type PcmPlaybackErrorCode,
  type PcmPlaybackRequest,
  type PcmPlaybackHandle,
  type PcmPlaybackCallbacks,
  type PcmPlaybackBackend,
} from "./pcm-playback-contracts";
export { WebAudioPcmPlaybackBackend } from "./playback-backends/web-audio-pcm-playback";

const CLEANUP_UNITS_PER_TURN = 4;

export type AdaptivePcmPlayerState =
  | "preparing"
  | "playing"
  | "paused"
  | "buffering"
  | "complete"
  | "stopped"
  | "failed";

export interface AdaptivePcmPlayerObservation {
  readonly state: AdaptivePcmPlayerState;
  readonly playableSampleFrames: number;
  readonly playableDurationMs: number;
  readonly lowBuffer: boolean;
  readonly underrunCount: number;
  readonly volumePercent: number;
  readonly playbackRate: number;
  readonly selectedPlaybackRatePercent: NarrationPlaybackRatePercentV3;
  readonly activePlaybackRatePercent: NarrationPlaybackRatePercentV3 | null;
  readonly pendingPlaybackRatePercent: NarrationPlaybackRatePercentV3 | null;
  readonly playbackRatePreparationActive: boolean;
  readonly activeSequence: number | undefined;
  readonly intentionalTransitionPauseActive: boolean;
  readonly intentionalTransitionPauseMs: number;
  readonly intentionalTransitionPauseRemainingMs: number;
  readonly completedTransitionPauseCount: number;
  readonly retainedAudioUnitCount: number;
  readonly discardedAudioUnitCount: number;
}

export type AdaptivePcmAudibleProgressKind =
  "segment-started" | "progress" | "segment-completed";

export interface AdaptivePcmAudibleProgressObservation {
  readonly kind: AdaptivePcmAudibleProgressKind;
  readonly observedAtMs: number;
  readonly sessionId: string;
  readonly generationId: string;
  readonly segmentId: string;
  readonly sequence: number;
  readonly sourceRange: LocatorRangeV1;
  readonly playedSampleFrames: number;
  readonly sampleCountSamples: number;
}

interface ActiveAudibleUnit {
  readonly sessionId: string;
  readonly generationId: string;
  readonly segmentId: string;
  readonly sequence: number;
  readonly sourceRange: LocatorRangeV1;
  readonly sampleCountSamples: number;
  readonly transitionPauseMs: number;
}

export type CleanupTurnScheduler = (callback: () => void) => void;
export type TransitionPauseScheduler = (
  callback: () => void,
  delayMs: number,
) => unknown;
export type TransitionPauseCanceller = (handle: unknown) => void;

interface PendingTransitionPause {
  readonly token: number;
  remainingMs: number;
  startedAtMs: number | undefined;
  handle: unknown;
}

function defaultCleanupTurnScheduler(callback: () => void): void {
  globalThis.setTimeout(callback, 0);
}

function defaultTransitionPauseScheduler(
  callback: () => void,
  delayMs: number,
): unknown {
  return globalThis.setTimeout(callback, delayMs);
}

function defaultTransitionPauseCanceller(handle: unknown): void {
  globalThis.clearTimeout(handle as ReturnType<typeof globalThis.setTimeout>);
}

function validVolumePercent(value: number): boolean {
  const playback = ADAPTIVE_BUFFER_AUTHORITY_V1.playback;
  return (
    Number.isInteger(value) &&
    value >= playback.minimumVolumePercent &&
    value <= playback.maximumVolumePercent
  );
}

function requestFrom(
  unit: AdaptiveBufferPlaybackUnit,
  volumePercent: number,
  playbackRatePercent: NarrationPlaybackRatePercentV3,
): PcmPlaybackRequest {
  return Object.freeze({
    sequence: unit.sequence,
    payload: unit.payload,
    sampleRateHz: unit.metadata.sampleRateHz,
    channelCount: unit.metadata.channelCount,
    sampleFormat: unit.metadata.sampleFormat,
    sampleCountSamples: unit.metadata.sampleCountSamples,
    startSampleFrame: unit.consumedSampleFrames,
    volumePercent,
    playbackRate: playbackRatePercent / 100,
  });
}

export class AdaptivePcmPlayer {
  readonly #scheduler: AdaptiveBufferScheduler;
  readonly #backend: PcmPlaybackBackend;
  readonly #scheduleCleanupTurn: CleanupTurnScheduler;
  readonly #scheduleTransitionPause: TransitionPauseScheduler;
  readonly #cancelTransitionPause: TransitionPauseCanceller;
  readonly #audibleProgressListeners = new Set<
    (observation: AdaptivePcmAudibleProgressObservation) => void
  >();
  readonly #cleanupWaiters = new Set<() => void>();
  #backendCleanup: Promise<void> | undefined;
  #handle: PcmPlaybackHandle | undefined;
  #activeUnit: ActiveAudibleUnit | undefined;
  #lastProgressObservationAtMs: number | undefined;
  #playbackStartSampleFrame = 0;
  #reportedSampleFrames = 0;
  #underrunCount = 0;
  #volumePercent: number =
    ADAPTIVE_BUFFER_AUTHORITY_V1.playback.defaultVolumePercent;
  #terminalState: "stopped" | "failed" | undefined;
  #invalidationTransition: "cancel" | "shutdown" | undefined;
  #cleanupScheduled = false;
  #transitionPause: PendingTransitionPause | undefined;
  #transitionPauseToken = 0;
  #completedTransitionPauseCount = 0;
  #completedTransitionPauseMs = 0;
  #playbackRatePreparation: Promise<void> | undefined;
  #playbackRatePreparationToken = 0;
  #pausedBeforeRateStart = false;
  #completedWhilePaused = false;

  public constructor(
    scheduler: AdaptiveBufferScheduler,
    backend: PcmPlaybackBackend,
    scheduleCleanupTurn: CleanupTurnScheduler = defaultCleanupTurnScheduler,
    scheduleTransitionPause: TransitionPauseScheduler = defaultTransitionPauseScheduler,
    cancelTransitionPause: TransitionPauseCanceller = defaultTransitionPauseCanceller,
  ) {
    this.#scheduler = scheduler;
    this.#backend = backend;
    this.#scheduleCleanupTurn = scheduleCleanupTurn;
    this.#scheduleTransitionPause = scheduleTransitionPause;
    this.#cancelTransitionPause = cancelTransitionPause;
  }

  public synchronize(): AdaptivePcmPlayerObservation {
    if (this.#terminalState !== undefined) {
      return this.#observation();
    }
    this.#refreshProgress();
    this.#settleElapsedTransitionPause();
    const observation = this.#scheduler.observe();
    if (
      observation.playbackState === "playing" &&
      this.#handle === undefined &&
      this.#transitionPause === undefined
    ) {
      const nextRate = this.#scheduler.nextPlaybackRatePercent();
      if (this.#isPlaybackRatePrepared(nextRate)) {
        this.#startCurrentUnit();
      } else {
        this.#preparePlaybackRate(nextRate);
      }
    }
    return this.#observation();
  }

  public subscribeAudibleProgress(
    listener: (observation: AdaptivePcmAudibleProgressObservation) => void,
  ): () => void {
    this.#audibleProgressListeners.add(listener);
    return () => {
      this.#audibleProgressListeners.delete(listener);
    };
  }

  public pause(): AdaptivePcmPlayerObservation {
    this.#expectActive();
    this.synchronize();
    const state = this.#scheduler.observe().playbackState;
    if (!["playing", "buffering", "complete"].includes(state)) {
      throw new PcmPlaybackError("invalid-state");
    }
    if (this.#handle !== undefined) {
      this.#handle.pause();
      this.#refreshProgress();
    } else if (this.#transitionPause !== undefined) {
      this.#freezeTransitionPause();
    } else if (
      this.#playbackRatePreparation !== undefined ||
      state === "buffering" ||
      state === "complete"
    ) {
      // No audible unit exists yet. Retain this intent even after preparation
      // resolves, so Resume can start the queued unit exactly once.
      this.#pausedBeforeRateStart = true;
    } else {
      throw new PcmPlaybackError("invalid-state");
    }
    this.#scheduler.pausePlayback();
    return this.#observation();
  }

  public resume(): AdaptivePcmPlayerObservation {
    this.#expectActive();
    if (
      this.#scheduler.observe().playbackState !== "paused" ||
      (this.#handle === undefined &&
        this.#transitionPause === undefined &&
        !this.#pausedBeforeRateStart)
    ) {
      throw new PcmPlaybackError("invalid-state");
    }
    this.#scheduler.resumePlayback();
    if (
      this.#completedWhilePaused &&
      this.#scheduler.observe().playbackState === "buffering"
    ) {
      this.#underrunCount += 1;
    }
    this.#completedWhilePaused = false;
    this.#pausedBeforeRateStart = false;
    if (this.#handle !== undefined) {
      this.#handle.resume();
    } else if (this.#transitionPause !== undefined) {
      this.#startTransitionPauseTimer(this.#transitionPause);
    }
    return this.synchronize();
  }

  public setVolumePercent(volumePercent: number): AdaptivePcmPlayerObservation {
    if (!validVolumePercent(volumePercent)) {
      throw new PcmPlaybackError("invalid-volume");
    }
    this.#volumePercent = volumePercent;
    this.#handle?.setVolumePercent(volumePercent);
    return this.#observation();
  }

  public setPlaybackRate(playbackRate: number): AdaptivePcmPlayerObservation {
    const playbackRatePercent = Math.round(playbackRate * 100);
    if (
      playbackRatePercent / 100 !== playbackRate ||
      !isNarrationPlaybackRatePercentV3(playbackRatePercent)
    ) {
      throw new PcmPlaybackError("unsupported-rate");
    }
    return this.setPlaybackRatePercent(playbackRatePercent);
  }

  public setPlaybackRatePercent(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): AdaptivePcmPlayerObservation {
    this.#expectActive();
    const state =
      this.#scheduler.selectPlaybackRatePercent(playbackRatePercent);
    if (state.pendingRatePercent !== null && playbackRatePercent !== 100) {
      this.#preparePlaybackRate(playbackRatePercent);
    } else if (
      playbackRatePercent === 100 &&
      (state.activeRatePercent === null || state.activeRatePercent === 100)
    ) {
      this.#releasePlaybackRatePreparation();
    }
    return this.#observation();
  }

  public stop(): "cancel" | "shutdown" {
    return this.#invalidate("stopped");
  }

  public invalidateForSeek(): "cancel" | "shutdown" {
    return this.#invalidate("stopped");
  }

  public close(): "cancel" | "shutdown" {
    const transition =
      this.#terminalState === undefined
        ? this.#invalidate("stopped")
        : (this.#invalidationTransition ?? "shutdown");
    if (this.#backendCleanup === undefined) {
      try {
        this.#backendCleanup = Promise.resolve(this.#backend.close());
      } catch (error) {
        this.#backendCleanup = Promise.reject(error);
      }
      // Cleanup is observed by waitForCleanup, including asynchronous failure.
      void this.#backendCleanup.catch(() => undefined);
    }
    this.#audibleProgressListeners.clear();
    return transition;
  }

  /**
   * Resolves only after invalidation has released every retained audio unit.
   * Recovery uses this boundary before it permits a replacement service run.
   */
  public waitForCleanup(): Promise<void> {
    if (this.#terminalState === undefined) {
      throw new PcmPlaybackError("invalid-state");
    }
    const observation = this.#scheduler.observe();
    if (
      observation.retainedAudioUnitCount === 0 &&
      observation.discardedAudioUnitCount === 0 &&
      !this.#cleanupScheduled
    ) {
      return this.#backendCleanup ?? Promise.resolve();
    }
    const released = new Promise<void>((resolve) => {
      this.#cleanupWaiters.add(resolve);
    });
    return this.#backendCleanup === undefined
      ? released
      : Promise.all([released, this.#backendCleanup]).then(() => undefined);
  }

  #startCurrentUnit(): void {
    const unit = this.#scheduler.currentPlaybackUnit();
    if (unit === undefined) {
      return;
    }
    this.#playbackStartSampleFrame = unit.consumedSampleFrames;
    this.#reportedSampleFrames = unit.consumedSampleFrames;
    const sequence = unit.sequence;
    const playbackRatePercent = this.#scheduler.activateCurrentPlaybackRate();
    try {
      this.#handle = this.#backend.start(
        requestFrom(unit, this.#volumePercent, playbackRatePercent),
        Object.freeze({
          ended: () => {
            this.#handleEnded(sequence);
          },
          failed: () => {
            this.#fail();
          },
        }),
      );
      this.#activeUnit = Object.freeze({
        sessionId: unit.metadata.sessionId,
        generationId: unit.metadata.generationId,
        segmentId: unit.metadata.segmentId,
        sequence: unit.sequence,
        sourceRange: unit.sourceRange,
        sampleCountSamples: unit.metadata.sampleCountSamples,
        transitionPauseMs: unit.transitionPauseMs,
      });
      this.#lastProgressObservationAtMs =
        this.#scheduler.observe().observedAtMs;
      this.#publishAudibleProgress(
        "segment-started",
        this.#activeUnit,
        unit.consumedSampleFrames,
      );
    } catch {
      this.#fail();
      throw new PcmPlaybackError("playback-failure");
    }
  }

  #handleEnded(sequence: number): void {
    if (
      this.#terminalState !== undefined ||
      this.#handle?.sequence !== sequence ||
      this.#activeUnit?.sequence !== sequence
    ) {
      return;
    }
    const completedUnit = this.#activeUnit;
    const paused = this.#scheduler.observe().playbackState === "paused";
    this.#publishAudibleProgress(
      "segment-completed",
      completedUnit,
      completedUnit.sampleCountSamples,
    );
    this.#refreshProgress(true);
    this.#handle = undefined;
    this.#activeUnit = undefined;
    this.#lastProgressObservationAtMs = undefined;
    this.#playbackStartSampleFrame = 0;
    this.#reportedSampleFrames = 0;
    if (paused) {
      this.#pausedBeforeRateStart = true;
      this.#completedWhilePaused = true;
    }
    const observation = this.#scheduler.observe();
    if (
      observation.playbackRateState.selectedRatePercent === 100 &&
      observation.playbackRateState.activeRatePercent !== 100
    ) {
      this.#releasePlaybackRatePreparation();
    }
    if (observation.playbackState === "buffering") {
      this.#underrunCount += 1;
    } else if (
      (observation.playbackState === "playing" || paused) &&
      completedUnit.transitionPauseMs > 0 &&
      this.#scheduler.currentPlaybackUnit() !== undefined
    ) {
      this.#beginTransitionPause(completedUnit.transitionPauseMs);
    }
    this.synchronize();
  }

  #refreshProgress(forceComplete = false): void {
    const handle = this.#handle;
    const unit = this.#scheduler.currentPlaybackUnit();
    if (
      handle === undefined ||
      unit === undefined ||
      handle.sequence !== unit.sequence ||
      (this.#scheduler.observe().playbackState !== "playing" &&
        !(
          forceComplete && this.#scheduler.observe().playbackState === "paused"
        ))
    ) {
      return;
    }
    const observed = forceComplete
      ? unit.metadata.sampleCountSamples
      : Math.min(
          unit.metadata.sampleCountSamples,
          this.#playbackStartSampleFrame + handle.playedSampleFrames,
        );
    const delta = observed - this.#reportedSampleFrames;
    if (delta > 0) {
      this.#scheduler.accountRenderedSampleFrames(delta);
      this.#reportedSampleFrames = observed;
      const observedAtMs = this.#scheduler.observe().observedAtMs;
      if (
        !forceComplete &&
        this.#activeUnit !== undefined &&
        (this.#lastProgressObservationAtMs === undefined ||
          observedAtMs - this.#lastProgressObservationAtMs >=
            SYNCHRONIZATION_AUTHORITY_V1.observation.maximumProgressIntervalMs)
      ) {
        this.#lastProgressObservationAtMs = observedAtMs;
        this.#publishAudibleProgress("progress", this.#activeUnit, observed);
      }
    }
  }

  #invalidate(terminalState: "stopped" | "failed"): "cancel" | "shutdown" {
    if (this.#terminalState !== undefined) {
      return this.#invalidationTransition ?? "shutdown";
    }
    this.#terminalState = terminalState;
    this.#pausedBeforeRateStart = false;
    this.#completedWhilePaused = false;
    this.#releasePlaybackRatePreparation();
    this.#cancelPendingTransitionPause();
    const transition = this.#scheduler.invalidate();
    this.#invalidationTransition = transition;
    const handle = this.#handle;
    this.#handle = undefined;
    this.#activeUnit = undefined;
    this.#lastProgressObservationAtMs = undefined;
    handle?.stop();
    this.#scheduleCleanup();
    return transition;
  }

  #fail(): void {
    if (this.#terminalState === undefined) {
      this.#invalidate("failed");
    }
  }

  #beginTransitionPause(durationMs: number): void {
    if (
      this.#transitionPause !== undefined ||
      !Number.isSafeInteger(durationMs) ||
      durationMs <= 0
    ) {
      throw new PcmPlaybackError("invalid-state");
    }
    const pending: PendingTransitionPause = {
      token: ++this.#transitionPauseToken,
      remainingMs: durationMs,
      startedAtMs: undefined,
      handle: undefined,
    };
    this.#transitionPause = pending;
    if (this.#scheduler.observe().playbackState === "playing") {
      this.#startTransitionPauseTimer(pending);
    }
  }

  #startTransitionPauseTimer(pending: PendingTransitionPause): void {
    if (
      this.#transitionPause !== pending ||
      pending.remainingMs <= 0 ||
      pending.startedAtMs !== undefined ||
      this.#scheduler.observe().playbackState !== "playing"
    ) {
      throw new PcmPlaybackError("invalid-state");
    }
    pending.startedAtMs = this.#scheduler.observe().observedAtMs;
    pending.handle = this.#scheduleTransitionPause(() => {
      this.#finishTransitionPauseTimer(pending);
    }, pending.remainingMs);
  }

  #finishTransitionPauseTimer(pending: PendingTransitionPause): void {
    if (
      this.#terminalState !== undefined ||
      this.#transitionPause !== pending ||
      pending.token !== this.#transitionPauseToken
    ) {
      return;
    }
    pending.handle = undefined;
    this.#captureTransitionPauseElapsed(pending);
    if (pending.remainingMs > 0) {
      this.#startTransitionPauseTimer(pending);
      return;
    }
    this.#transitionPause = undefined;
    this.#completedTransitionPauseCount += 1;
    this.synchronize();
  }

  #settleElapsedTransitionPause(): void {
    const pending = this.#transitionPause;
    if (
      pending === undefined ||
      pending.startedAtMs === undefined ||
      this.#scheduler.observe().observedAtMs - pending.startedAtMs <
        pending.remainingMs
    ) {
      return;
    }
    if (pending.handle !== undefined) {
      this.#cancelTransitionPause(pending.handle);
      pending.handle = undefined;
    }
    this.#captureTransitionPauseElapsed(pending);
    if (pending.remainingMs !== 0) {
      throw new PcmPlaybackError("invalid-state");
    }
    this.#transitionPause = undefined;
    this.#completedTransitionPauseCount += 1;
  }

  #freezeTransitionPause(): void {
    const pending = this.#transitionPause;
    if (pending === undefined || pending.startedAtMs === undefined) {
      throw new PcmPlaybackError("invalid-state");
    }
    if (pending.handle !== undefined) {
      this.#cancelTransitionPause(pending.handle);
      pending.handle = undefined;
    }
    this.#captureTransitionPauseElapsed(pending);
  }

  #captureTransitionPauseElapsed(pending: PendingTransitionPause): void {
    const startedAtMs = pending.startedAtMs;
    if (startedAtMs === undefined) {
      return;
    }
    const elapsedMs = Math.min(
      pending.remainingMs,
      Math.max(0, this.#scheduler.observe().observedAtMs - startedAtMs),
    );
    pending.remainingMs -= elapsedMs;
    pending.startedAtMs = undefined;
    this.#completedTransitionPauseMs += elapsedMs;
  }

  #cancelPendingTransitionPause(): void {
    const pending = this.#transitionPause;
    if (pending?.handle !== undefined) {
      this.#cancelTransitionPause(pending.handle);
    }
    this.#transitionPause = undefined;
    this.#transitionPauseToken += 1;
  }

  #transitionPauseRemainingMs(): number {
    const pending = this.#transitionPause;
    if (pending === undefined) {
      return 0;
    }
    if (pending.startedAtMs === undefined) {
      return pending.remainingMs;
    }
    return Math.max(
      0,
      pending.remainingMs -
        (this.#scheduler.observe().observedAtMs - pending.startedAtMs),
    );
  }

  #intentionalTransitionPauseMs(): number {
    const pending = this.#transitionPause;
    if (pending?.startedAtMs === undefined) {
      return this.#completedTransitionPauseMs;
    }
    return (
      this.#completedTransitionPauseMs +
      Math.min(
        pending.remainingMs,
        Math.max(
          0,
          this.#scheduler.observe().observedAtMs - pending.startedAtMs,
        ),
      )
    );
  }

  #scheduleCleanup(): void {
    if (this.#cleanupScheduled) {
      return;
    }
    this.#cleanupScheduled = true;
    this.#scheduleCleanupTurn(() => {
      this.#cleanupScheduled = false;
      const remaining = this.#scheduler.releaseDiscardedAudioUnits(
        CLEANUP_UNITS_PER_TURN,
      );
      if (remaining > 0) {
        this.#scheduleCleanup();
      } else {
        for (const resolve of this.#cleanupWaiters) {
          resolve();
        }
        this.#cleanupWaiters.clear();
      }
    });
  }

  #publishAudibleProgress(
    kind: AdaptivePcmAudibleProgressKind,
    unit: ActiveAudibleUnit,
    playedSampleFrames: number,
  ): void {
    const observation = Object.freeze({
      kind,
      observedAtMs: this.#scheduler.observe().observedAtMs,
      sessionId: unit.sessionId,
      generationId: unit.generationId,
      segmentId: unit.segmentId,
      sequence: unit.sequence,
      sourceRange: unit.sourceRange,
      playedSampleFrames,
      sampleCountSamples: unit.sampleCountSamples,
    });
    for (const listener of this.#audibleProgressListeners) {
      try {
        listener(observation);
      } catch {
        // An observer cannot interrupt playback or resource release.
      }
    }
  }

  #expectActive(): void {
    if (this.#terminalState !== undefined) {
      throw new PcmPlaybackError("invalid-state");
    }
  }

  #isPlaybackRatePrepared(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): boolean {
    return (
      playbackRatePercent === 100 ||
      this.#backend.isPlaybackRatePrepared?.(playbackRatePercent) === true
    );
  }

  #preparePlaybackRate(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): void {
    if (
      playbackRatePercent === 100 ||
      this.#isPlaybackRatePrepared(playbackRatePercent) ||
      this.#playbackRatePreparation !== undefined
    ) {
      return;
    }
    const prepare = this.#backend.preparePlaybackRate;
    if (prepare === undefined) {
      throw new PcmPlaybackError("unsupported-rate");
    }
    const token = ++this.#playbackRatePreparationToken;
    const preparation = prepare.call(this.#backend, playbackRatePercent);
    this.#playbackRatePreparation = preparation;
    void preparation
      .then(() => {
        if (token !== this.#playbackRatePreparationToken) {
          return;
        }
        this.#playbackRatePreparation = undefined;
        const state = this.#scheduler.observe().playbackRateState;
        if (
          state.selectedRatePercent === 100 &&
          (state.activeRatePercent === null || state.activeRatePercent === 100)
        ) {
          this.#releasePlaybackRatePreparation();
        }
      })
      .catch(() => {
        if (token === this.#playbackRatePreparationToken) {
          this.#playbackRatePreparation = undefined;
          this.#fail();
        }
      });
  }

  #releasePlaybackRatePreparation(): void {
    this.#playbackRatePreparationToken += 1;
    this.#playbackRatePreparation = undefined;
    this.#backend.releasePlaybackRatePreparation?.();
  }

  #observation(): AdaptivePcmPlayerObservation {
    const scheduler = this.#scheduler.observe();
    return Object.freeze({
      state: this.#terminalState ?? scheduler.playbackState,
      playableSampleFrames: scheduler.playableSampleFrames,
      playableDurationMs: scheduler.effectiveListeningDurationMs,
      lowBuffer: scheduler.lowBuffer,
      underrunCount: this.#underrunCount,
      volumePercent: this.#volumePercent,
      playbackRate: scheduler.playbackRateState.selectedRatePercent / 100,
      selectedPlaybackRatePercent:
        scheduler.playbackRateState.selectedRatePercent,
      activePlaybackRatePercent: scheduler.playbackRateState.activeRatePercent,
      pendingPlaybackRatePercent:
        scheduler.playbackRateState.pendingRatePercent,
      playbackRatePreparationActive:
        this.#playbackRatePreparation !== undefined,
      activeSequence: this.#handle?.sequence,
      intentionalTransitionPauseActive:
        this.#transitionPause?.startedAtMs !== undefined &&
        scheduler.playbackState === "playing",
      intentionalTransitionPauseMs: this.#intentionalTransitionPauseMs(),
      intentionalTransitionPauseRemainingMs: this.#transitionPauseRemainingMs(),
      completedTransitionPauseCount: this.#completedTransitionPauseCount,
      retainedAudioUnitCount: scheduler.retainedAudioUnitCount,
      discardedAudioUnitCount: scheduler.discardedAudioUnitCount,
    });
  }
}
