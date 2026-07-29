import type { LocatorRangeV1 } from "@voxleaf/shared";

import { SYNCHRONIZATION_AUTHORITY_V1 } from "../reader/synchronization-authority";
import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "./adaptive-buffer-authority";
import {
  AdaptiveBufferScheduler,
  type AdaptiveBufferPlaybackUnit,
} from "./adaptive-buffer-scheduler";

const CLEANUP_UNITS_PER_TURN = 4;

export type PcmPlaybackErrorCode =
  "invalid-state" | "invalid-volume" | "playback-failure" | "unsupported-rate";

export class PcmPlaybackError extends Error {
  public readonly code: PcmPlaybackErrorCode;

  public constructor(code: PcmPlaybackErrorCode) {
    super("Local audio playback failed.");
    this.name = "PcmPlaybackError";
    this.code = code;
  }
}

export interface PcmPlaybackRequest {
  readonly sequence: number;
  readonly payload: Uint8Array;
  readonly sampleRateHz: 24_000;
  readonly channelCount: 1;
  readonly sampleFormat: "float32-le";
  readonly sampleCountSamples: number;
  readonly startSampleFrame: number;
  readonly volumePercent: number;
  readonly playbackRate: 1;
}

export interface PcmPlaybackHandle {
  readonly sequence: number;
  readonly playedSampleFrames: number;
  pause(): void;
  resume(): void;
  stop(): void;
  setVolumePercent(volumePercent: number): void;
}

export interface PcmPlaybackCallbacks {
  readonly ended: () => void;
  readonly failed: () => void;
}

export interface PcmPlaybackBackend {
  start(
    request: PcmPlaybackRequest,
    callbacks: PcmPlaybackCallbacks,
  ): PcmPlaybackHandle;
  close(): void;
}

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
  readonly playbackRate: 1;
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
    playbackRate: 1,
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
      this.#startCurrentUnit();
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
    if (this.#scheduler.observe().playbackState !== "playing") {
      throw new PcmPlaybackError("invalid-state");
    }
    if (this.#handle !== undefined) {
      this.#handle.pause();
      this.#refreshProgress();
    } else if (this.#transitionPause !== undefined) {
      this.#freezeTransitionPause();
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
      (this.#handle === undefined && this.#transitionPause === undefined)
    ) {
      throw new PcmPlaybackError("invalid-state");
    }
    this.#scheduler.resumePlayback();
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
    if (
      playbackRate !== ADAPTIVE_BUFFER_AUTHORITY_V1.playback.defaultPlaybackRate
    ) {
      throw new PcmPlaybackError("unsupported-rate");
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
    this.#backend.close();
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
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.#cleanupWaiters.add(resolve);
    });
  }

  #startCurrentUnit(): void {
    const unit = this.#scheduler.currentPlaybackUnit();
    if (unit === undefined) {
      return;
    }
    this.#playbackStartSampleFrame = unit.consumedSampleFrames;
    this.#reportedSampleFrames = unit.consumedSampleFrames;
    const sequence = unit.sequence;
    try {
      this.#handle = this.#backend.start(
        requestFrom(unit, this.#volumePercent),
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
    const observation = this.#scheduler.observe();
    if (observation.playbackState === "buffering") {
      this.#underrunCount += 1;
    } else if (
      observation.playbackState === "playing" &&
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
      this.#scheduler.observe().playbackState !== "playing"
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
      this.#scheduler.consumeSampleFrames(delta);
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
    this.#startTransitionPauseTimer(pending);
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

  #observation(): AdaptivePcmPlayerObservation {
    const scheduler = this.#scheduler.observe();
    return Object.freeze({
      state: this.#terminalState ?? scheduler.playbackState,
      playableSampleFrames: scheduler.playableSampleFrames,
      playableDurationMs: scheduler.playableDurationMs,
      lowBuffer: scheduler.lowBuffer,
      underrunCount: this.#underrunCount,
      volumePercent: this.#volumePercent,
      playbackRate: 1,
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

interface WebAudioPlaybackHandle extends PcmPlaybackHandle {
  complete(): void;
}

type AudioContextFactory = () => AudioContext;

export class WebAudioPcmPlaybackBackend implements PcmPlaybackBackend {
  readonly #createAudioContext: AudioContextFactory;
  #context: AudioContext | undefined;
  #gain: GainNode | undefined;
  #active: WebAudioPlaybackHandle | undefined;

  public constructor(
    createAudioContext: AudioContextFactory = () => new AudioContext(),
  ) {
    this.#createAudioContext = createAudioContext;
  }

  public start(
    request: PcmPlaybackRequest,
    callbacks: PcmPlaybackCallbacks,
  ): PcmPlaybackHandle {
    if (this.#active !== undefined) {
      throw new PcmPlaybackError("invalid-state");
    }
    const context = this.#context ?? this.#createAudioContext();
    this.#context = context;
    const gain = this.#gain ?? context.createGain();
    if (this.#gain === undefined) {
      gain.connect(context.destination);
      this.#gain = gain;
    }
    gain.gain.value = request.volumePercent / 100;

    const remaining = request.sampleCountSamples - request.startSampleFrame;
    if (remaining <= 0) {
      throw new PcmPlaybackError("invalid-state");
    }
    const audioBuffer = context.createBuffer(
      request.channelCount,
      remaining,
      request.sampleRateHz,
    );
    const channel = audioBuffer.getChannelData(0);
    const data = new DataView(
      request.payload.buffer,
      request.payload.byteOffset,
      request.payload.byteLength,
    );
    for (let index = 0; index < remaining; index += 1) {
      const value = data.getFloat32(
        (request.startSampleFrame + index) *
          ADAPTIVE_BUFFER_AUTHORITY_V1.audioFormat.bytesPerSample,
        true,
      );
      if (!Number.isFinite(value)) {
        throw new PcmPlaybackError("playback-failure");
      }
      channel[index] = value;
    }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = request.playbackRate;
    source.connect(gain);
    const startedAt = context.currentTime;
    let stopped = false;
    const handle: WebAudioPlaybackHandle = {
      sequence: request.sequence,
      get playedSampleFrames() {
        if (stopped) {
          return remaining;
        }
        return Math.min(
          remaining,
          Math.floor((context.currentTime - startedAt) * request.sampleRateHz),
        );
      },
      pause() {
        void context.suspend().catch(callbacks.failed);
      },
      resume() {
        void context.resume().catch(callbacks.failed);
      },
      stop() {
        if (!stopped) {
          stopped = true;
          source.onended = null;
          source.stop();
        }
      },
      setVolumePercent(volumePercent) {
        gain.gain.value = volumePercent / 100;
      },
      complete() {
        stopped = true;
      },
    };
    source.onended = () => {
      if (!stopped && this.#active === handle) {
        handle.complete();
        this.#active = undefined;
        callbacks.ended();
      }
    };
    this.#active = handle;
    void context.resume().catch(callbacks.failed);
    source.start();
    return handle;
  }

  public close(): void {
    this.#active?.stop();
    this.#active = undefined;
    const context = this.#context;
    this.#context = undefined;
    this.#gain = undefined;
    if (context !== undefined) {
      void context.close();
    }
  }
}
