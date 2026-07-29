import { decodeLocatorRangeV1, type LocatorRangeV1 } from "@voxleaf/shared";

import {
  ADAPTIVE_BUFFER_AUTHORITY_V1,
  createAdaptiveBufferThresholds,
  evaluateAdaptiveBufferResources,
  playableMillisecondsFromSampleFrames,
  sampleFramesFromPlayableMilliseconds,
  type AdaptiveBufferResourceSnapshot,
} from "./adaptive-buffer-authority";

const BYTES_PER_SAMPLE =
  ADAPTIVE_BUFFER_AUTHORITY_V1.audioFormat.bytesPerSample;

export type AdaptiveBufferSchedulerErrorCode =
  | "invalid-clock"
  | "invalid-prepared-batch"
  | "invalid-state"
  | "resource-limit";

export class AdaptiveBufferSchedulerError extends Error {
  public readonly code: AdaptiveBufferSchedulerErrorCode;

  public constructor(code: AdaptiveBufferSchedulerErrorCode) {
    super("Adaptive buffer scheduler operation failed.");
    this.name = "AdaptiveBufferSchedulerError";
    this.code = code;
  }
}

export interface AdaptiveBufferSchedulerClock {
  readonly nowMs: number;
}

export interface AdaptiveBufferWorkIdentity {
  readonly sessionId: string;
  readonly generationId: string;
}

export type AdaptiveBufferStartMode =
  | Readonly<{ kind: "quick" }>
  | Readonly<{
      kind: "prepared";
      targetMs: 60_000 | 120_000 | 300_000 | 600_000;
    }>;

export interface AdaptiveBufferPreparedSegment {
  readonly segmentId: string;
  readonly sequence: number;
  readonly sourceRange: LocatorRangeV1;
  readonly narrationCodePoints: number;
  readonly narrationUtf8Bytes: number;
  readonly sentenceCount: number;
}

export interface AdaptiveBufferPreparedBatch {
  readonly segments: readonly AdaptiveBufferPreparedSegment[];
  readonly complete: boolean;
}

export interface AdaptiveBufferAudioUnitMetadata {
  readonly sessionId: string;
  readonly generationId: string;
  readonly segmentId: string;
  readonly sampleRateHz: 24_000;
  readonly channelCount: 1;
  readonly sampleFormat: "float32-le";
  readonly sampleCountSamples: number;
  readonly payloadBytes: number;
  readonly endOfSegment: true;
}

export interface AdaptiveBufferAudioUnit {
  readonly metadata: AdaptiveBufferAudioUnitMetadata;
  readonly payload: Uint8Array;
  release(): void;
}

export interface AdaptiveBufferPlaybackUnit {
  readonly sequence: number;
  readonly sourceRange: LocatorRangeV1;
  readonly metadata: AdaptiveBufferAudioUnitMetadata;
  readonly payload: Uint8Array;
  readonly consumedSampleFrames: number;
}

export interface AdaptiveBufferAudioUnitSource {
  takeAudioUnit(): AdaptiveBufferAudioUnit | undefined;
}

export type AdaptiveBufferServiceState =
  | "stopped"
  | "starting"
  | "unloaded"
  | "preparing"
  | "ready"
  | "generating"
  | "cancelling"
  | "stopping"
  | "failed";

export type AdaptiveBufferPlaybackState =
  | "preparing"
  | "playing"
  | "paused"
  | "buffering"
  | "complete"
  | "stopped"
  | "failed";

export type AdaptiveBufferSchedulerAction =
  | Readonly<{ kind: "start-service" }>
  | Readonly<{ kind: "prepare-service" }>
  | Readonly<{ kind: "prepare-narration" }>
  | Readonly<{ kind: "synthesize"; segmentId: string }>
  | Readonly<{ kind: "none"; reason: AdaptiveBufferSchedulerIdleReason }>;

export type AdaptiveBufferSchedulerIdleReason =
  | "active-work"
  | "backpressure"
  | "complete"
  | "failed"
  | "invalidated"
  | "service-transition";

export type AdaptiveBufferCompletionOutcome = "accepted" | "invalid" | "stale";

export interface AdaptiveBufferSchedulerObservation {
  readonly observedAtMs: number;
  readonly serviceState: AdaptiveBufferServiceState;
  readonly playbackState: AdaptiveBufferPlaybackState;
  readonly playableSampleFrames: number;
  readonly playableDurationMs: number;
  readonly targetBufferMs: number;
  readonly lowBuffer: boolean;
  readonly rangeComplete: boolean;
  readonly pendingSegmentCount: number;
  readonly retainedAudioUnitCount: number;
  readonly discardedAudioUnitCount: number;
  readonly resourceSnapshot: AdaptiveBufferResourceSnapshot;
  readonly nextAction: AdaptiveBufferSchedulerAction;
}

interface RetainedAudioUnit {
  readonly sequence: number;
  readonly sourceRange: LocatorRangeV1;
  readonly unit: AdaptiveBufferAudioUnit;
  readonly sampleFrames: number;
  readonly payloadBytes: number;
  consumedSampleFrames: number;
}

interface DiscardedAudioUnit {
  readonly unit: AdaptiveBufferAudioUnit;
  readonly sampleFrames: number;
  readonly payloadBytes: number;
}

interface ActiveSynthesis {
  readonly segment: AdaptiveBufferPreparedSegment;
}

function isCount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function assertClock(clock: AdaptiveBufferSchedulerClock): void {
  if (!isCount(clock.nowMs)) {
    throw new AdaptiveBufferSchedulerError("invalid-clock");
  }
}

function initialTargetMs(mode: AdaptiveBufferStartMode): number {
  return mode.kind === "quick"
    ? ADAPTIVE_BUFFER_AUTHORITY_V1.thresholds.quickStartMs
    : mode.targetMs;
}

function continuingTargetMs(mode: AdaptiveBufferStartMode): number {
  return mode.kind === "quick"
    ? ADAPTIVE_BUFFER_AUTHORITY_V1.thresholds.refillResumeMs
    : mode.targetMs;
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

function freezePreparedSegment(
  segment: AdaptiveBufferPreparedSegment,
): AdaptiveBufferPreparedSegment {
  if (
    segment.segmentId.length === 0 ||
    !isCount(segment.sequence) ||
    !isCount(segment.narrationCodePoints) ||
    segment.narrationCodePoints === 0 ||
    !isCount(segment.narrationUtf8Bytes) ||
    segment.narrationUtf8Bytes === 0 ||
    !isCount(segment.sentenceCount)
  ) {
    throw new AdaptiveBufferSchedulerError("invalid-prepared-batch");
  }
  let sourceRange: LocatorRangeV1;
  try {
    sourceRange = decodeLocatorRangeV1(segment.sourceRange);
  } catch {
    throw new AdaptiveBufferSchedulerError("invalid-prepared-batch");
  }
  return Object.freeze({ ...segment, sourceRange });
}

function sameIdentity(
  metadata: AdaptiveBufferAudioUnitMetadata,
  identity: AdaptiveBufferWorkIdentity | undefined,
  active: ActiveSynthesis | undefined,
): boolean {
  return (
    identity !== undefined &&
    active !== undefined &&
    metadata.sessionId === identity.sessionId &&
    metadata.generationId === identity.generationId &&
    metadata.segmentId === active.segment.segmentId
  );
}

function validAudioUnit(unit: AdaptiveBufferAudioUnit): boolean {
  const { metadata, payload } = unit;
  const limits = ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits;
  if (
    metadata.sampleRateHz ===
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioFormat.sampleRateHz &&
    metadata.channelCount ===
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioFormat.channelCount &&
    metadata.sampleFormat ===
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioFormat.sampleFormat &&
    metadata.endOfSegment === true &&
    isCount(metadata.sampleCountSamples) &&
    metadata.sampleCountSamples > 0 &&
    metadata.sampleCountSamples <= limits.serviceUnitReservationSampleFrames &&
    metadata.payloadBytes === metadata.sampleCountSamples * BYTES_PER_SAMPLE &&
    metadata.payloadBytes <= limits.serviceUnitReservationPayloadBytes &&
    payload.byteLength === metadata.payloadBytes
  ) {
    const view = new DataView(
      payload.buffer,
      payload.byteOffset,
      payload.byteLength,
    );
    for (
      let offset = 0;
      offset < payload.byteLength;
      offset += BYTES_PER_SAMPLE
    ) {
      if (!Number.isFinite(view.getFloat32(offset, true))) {
        return false;
      }
    }
    return true;
  }
  return false;
}

export function canReserveAdaptiveBufferServiceUnit(
  resources: AdaptiveBufferResourceSnapshot,
): boolean {
  const audio = ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits;
  return evaluateAdaptiveBufferResources({
    ...resources,
    audioSampleFrames:
      resources.audioSampleFrames + audio.serviceUnitReservationSampleFrames,
    audioPayloadBytes:
      resources.audioPayloadBytes + audio.serviceUnitReservationPayloadBytes,
    completeAudioUnits: resources.completeAudioUnits + 1,
    audioMetadataEntries: resources.audioMetadataEntries + 1,
    activeSyntheses: resources.activeSyntheses + 1,
  }).accepted;
}

export class AdaptiveBufferScheduler {
  readonly #clock: AdaptiveBufferSchedulerClock;
  readonly #mode: AdaptiveBufferStartMode;
  #identity: AdaptiveBufferWorkIdentity | undefined;
  #serviceState: AdaptiveBufferServiceState = "stopped";
  #playbackState: AdaptiveBufferPlaybackState = "preparing";
  #pendingSegments: AdaptiveBufferPreparedSegment[] = [];
  #activeSynthesis: ActiveSynthesis | undefined;
  #audioUnits: RetainedAudioUnit[] = [];
  #discardedAudioUnits: DiscardedAudioUnit[] = [];
  #lastAcceptedSequence: number | undefined;
  #resources = emptyResources();
  #rangeComplete = false;
  #initialPlaybackStarted = false;

  public constructor(
    clock: AdaptiveBufferSchedulerClock,
    identity: AdaptiveBufferWorkIdentity,
    mode: AdaptiveBufferStartMode,
  ) {
    assertClock(clock);
    if (identity.sessionId.length === 0 || identity.generationId.length === 0) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    if (
      mode.kind === "prepared" &&
      !ADAPTIVE_BUFFER_AUTHORITY_V1.thresholds.preparedTargetMs.includes(
        mode.targetMs,
      )
    ) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#clock = clock;
    this.#identity = Object.freeze({ ...identity });
    this.#mode = Object.freeze({ ...mode });
  }

  public observe(): AdaptiveBufferSchedulerObservation {
    assertClock(this.#clock);
    const playableSampleFrames = this.#playableSampleFrames();
    const targetBufferMs = this.#targetBufferMs();
    return Object.freeze({
      observedAtMs: this.#clock.nowMs,
      serviceState: this.#serviceState,
      playbackState: this.#playbackState,
      playableSampleFrames,
      playableDurationMs:
        playableMillisecondsFromSampleFrames(playableSampleFrames),
      targetBufferMs,
      lowBuffer:
        this.#playbackState === "playing" &&
        playableSampleFrames <=
          sampleFramesFromPlayableMilliseconds(
            Math.min(
              ADAPTIVE_BUFFER_AUTHORITY_V1.thresholds.lowWaterMarkMs,
              targetBufferMs,
            ),
          ),
      rangeComplete: this.#rangeComplete,
      pendingSegmentCount: this.#pendingSegments.length,
      retainedAudioUnitCount:
        this.#audioUnits.length + this.#discardedAudioUnits.length,
      discardedAudioUnitCount: this.#discardedAudioUnits.length,
      resourceSnapshot: Object.freeze({ ...this.#resources }),
      nextAction: this.#nextAction(),
    });
  }

  public beginServiceStart(): void {
    this.#expectAction("start-service");
    this.#serviceState = "starting";
  }

  public markServiceStarted(): void {
    if (this.#serviceState !== "starting") {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#serviceState = "unloaded";
  }

  public beginServicePrepare(): void {
    this.#expectAction("prepare-service");
    this.#serviceState = "preparing";
  }

  public markServiceReady(): void {
    if (this.#serviceState !== "preparing") {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#serviceState = "ready";
  }

  public failServiceTransition(): void {
    if (!["starting", "preparing"].includes(this.#serviceState)) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#serviceState = "failed";
    if (this.#playableSampleFrames() === 0) {
      this.#playbackState = "failed";
    }
  }

  public beginNarrationPreparation(): void {
    this.#expectAction("prepare-narration");
    this.#resources = {
      ...this.#resources,
      activeNarrationPreparations: 1,
    };
    this.#assertResources(this.#resources);
  }

  public acceptPreparedBatch(batch: AdaptiveBufferPreparedBatch): void {
    if (
      this.#resources.activeNarrationPreparations !== 1 ||
      this.#resources.retainedPreparedBatches !== 0 ||
      this.#pendingSegments.length !== 0 ||
      this.#activeSynthesis !== undefined ||
      batch.segments.length === 0
    ) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    const frozenSegments = batch.segments.map(freezePreparedSegment);
    const segmentIds = new Set(
      frozenSegments.map(({ segmentId }) => segmentId),
    );
    let previousSequence = this.#lastAcceptedSequence;
    const invalidSequence = frozenSegments.some(({ sequence }) => {
      const invalid =
        previousSequence !== undefined && sequence <= previousSequence;
      previousSequence = sequence;
      return invalid;
    });
    if (segmentIds.size !== frozenSegments.length || invalidSequence) {
      throw new AdaptiveBufferSchedulerError("invalid-prepared-batch");
    }
    const totals = frozenSegments.reduce(
      (result, segment) => ({
        codePoints: result.codePoints + segment.narrationCodePoints,
        utf8Bytes: result.utf8Bytes + segment.narrationUtf8Bytes,
        sentences: result.sentences + segment.sentenceCount,
      }),
      { codePoints: 0, utf8Bytes: 0, sentences: 0 },
    );
    if (
      !isCount(totals.codePoints) ||
      !isCount(totals.utf8Bytes) ||
      !isCount(totals.sentences)
    ) {
      throw new AdaptiveBufferSchedulerError("invalid-prepared-batch");
    }
    const resources: AdaptiveBufferResourceSnapshot = {
      ...this.#resources,
      retainedPreparedBatches: 1,
      retainedPreparedSegments: frozenSegments.length,
      retainedNarrationCodePoints: totals.codePoints,
      retainedNarrationUtf8Bytes: totals.utf8Bytes,
      retainedNarrationSentences: totals.sentences,
      activeNarrationPreparations: 0,
    };
    this.#assertResources(resources);
    this.#resources = resources;
    this.#pendingSegments = frozenSegments;
    this.#lastAcceptedSequence = frozenSegments.at(-1)!.sequence;
    this.#rangeComplete = batch.complete;
  }

  public acceptEmptyPreparedRange(complete: boolean): void {
    if (
      this.#resources.activeNarrationPreparations !== 1 ||
      this.#resources.retainedPreparedBatches !== 0 ||
      this.#pendingSegments.length !== 0 ||
      this.#activeSynthesis !== undefined
    ) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#resources = {
      ...this.#resources,
      activeNarrationPreparations: 0,
    };
    this.#rangeComplete = complete;
    this.#refreshPlaybackState();
  }

  public failNarrationPreparation(): void {
    if (this.#resources.activeNarrationPreparations !== 1) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#resources = {
      ...this.#resources,
      activeNarrationPreparations: 0,
    };
    this.#serviceState = "failed";
    this.#playbackState =
      this.#playableSampleFrames() === 0 ? "failed" : this.#playbackState;
  }

  public beginSynthesis(): string {
    const action = this.#nextAction();
    if (action.kind !== "synthesize") {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    const segment = this.#pendingSegments.shift();
    if (segment === undefined || segment.segmentId !== action.segmentId) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    const audio = ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits;
    const resources: AdaptiveBufferResourceSnapshot = {
      ...this.#resources,
      audioSampleFrames:
        this.#resources.audioSampleFrames +
        audio.serviceUnitReservationSampleFrames,
      audioPayloadBytes:
        this.#resources.audioPayloadBytes +
        audio.serviceUnitReservationPayloadBytes,
      completeAudioUnits: this.#resources.completeAudioUnits + 1,
      audioMetadataEntries: this.#resources.audioMetadataEntries + 1,
      activeSyntheses: 1,
    };
    this.#assertResources(resources);
    this.#resources = resources;
    this.#activeSynthesis = Object.freeze({ segment });
    this.#serviceState = "generating";
    return segment.segmentId;
  }

  public acceptCompletedUnit(
    unit: AdaptiveBufferAudioUnit,
  ): AdaptiveBufferCompletionOutcome {
    const activeSynthesis = this.#activeSynthesis;
    if (
      activeSynthesis === undefined ||
      !sameIdentity(unit.metadata, this.#identity, activeSynthesis)
    ) {
      unit.release();
      return "stale";
    }
    if (!validAudioUnit(unit)) {
      unit.release();
      this.#settleActiveSynthesis();
      this.#serviceState = "failed";
      if (this.#playableSampleFrames() === 0) {
        this.#playbackState = "failed";
      }
      return "invalid";
    }

    const audio = ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits;
    const completedSegment = activeSynthesis.segment;
    const resources = this.#settleActivePromptResources({
      ...this.#resources,
      audioSampleFrames:
        this.#resources.audioSampleFrames -
        audio.serviceUnitReservationSampleFrames +
        unit.metadata.sampleCountSamples,
      audioPayloadBytes:
        this.#resources.audioPayloadBytes -
        audio.serviceUnitReservationPayloadBytes +
        unit.metadata.payloadBytes,
      activeSyntheses: 0,
    });
    this.#assertResources(resources);
    this.#resources = resources;
    this.#activeSynthesis = undefined;
    this.#audioUnits.push({
      sequence: completedSegment.sequence,
      sourceRange: completedSegment.sourceRange,
      unit,
      sampleFrames: unit.metadata.sampleCountSamples,
      payloadBytes: unit.metadata.payloadBytes,
      consumedSampleFrames: 0,
    });
    this.#serviceState = "ready";
    this.#clearPreparedBatchIfSettled();
    this.#refreshPlaybackState();
    return "accepted";
  }

  public takeCompletedUnitFrom(
    source: AdaptiveBufferAudioUnitSource,
  ): AdaptiveBufferCompletionOutcome | "missing" {
    const unit = source.takeAudioUnit();
    return unit === undefined ? "missing" : this.acceptCompletedUnit(unit);
  }

  public currentPlaybackUnit(): AdaptiveBufferPlaybackUnit | undefined {
    const retained = this.#audioUnits[0];
    if (retained === undefined) {
      return undefined;
    }
    return Object.freeze({
      sequence: retained.sequence,
      sourceRange: retained.sourceRange,
      metadata: retained.unit.metadata,
      payload: retained.unit.payload,
      consumedSampleFrames: retained.consumedSampleFrames,
    });
  }

  public failActiveSynthesis(): void {
    if (
      this.#activeSynthesis === undefined ||
      this.#serviceState !== "generating"
    ) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#settleActiveSynthesis();
    this.#serviceState = "failed";
    if (this.#playableSampleFrames() === 0) {
      this.#playbackState = "failed";
    }
  }

  public consumeSampleFrames(requestedSampleFrames: number): number {
    if (this.#playbackState !== "playing" || !isCount(requestedSampleFrames)) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    let remaining = requestedSampleFrames;
    let consumed = 0;
    while (remaining > 0) {
      const retained = this.#audioUnits[0];
      if (retained === undefined) {
        break;
      }
      const available = retained.sampleFrames - retained.consumedSampleFrames;
      const take = Math.min(available, remaining);
      retained.consumedSampleFrames += take;
      remaining -= take;
      consumed += take;
      if (retained.consumedSampleFrames === retained.sampleFrames) {
        this.#audioUnits.shift();
        retained.unit.release();
        this.#resources = {
          ...this.#resources,
          audioSampleFrames:
            this.#resources.audioSampleFrames - retained.sampleFrames,
          audioPayloadBytes:
            this.#resources.audioPayloadBytes - retained.payloadBytes,
          completeAudioUnits: this.#resources.completeAudioUnits - 1,
          audioMetadataEntries: this.#resources.audioMetadataEntries - 1,
        };
      }
    }
    this.#refreshPlaybackState();
    return consumed;
  }

  public pausePlayback(): void {
    if (this.#playbackState !== "playing") {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#playbackState = "paused";
  }

  public resumePlayback(): void {
    if (this.#playbackState !== "paused") {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#playbackState =
      this.#playableSampleFrames() > 0 ? "playing" : "buffering";
    this.#refreshPlaybackState();
  }

  /**
   * Invalidates eligibility before the caller begins cancellation/shutdown.
   * The returned transition tells the caller which M007 operation to invoke.
   */
  public invalidate(): "cancel" | "shutdown" {
    if (this.#identity === undefined) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    const transition =
      this.#activeSynthesis === undefined ? "shutdown" : "cancel";
    this.#identity = undefined;
    this.#pendingSegments = [];
    this.#discardedAudioUnits.push(
      ...this.#audioUnits
        .splice(0)
        .map(({ unit, sampleFrames, payloadBytes }) => ({
          unit,
          sampleFrames,
          payloadBytes,
        })),
    );
    const audio = ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits;
    const activeReservation = this.#activeSynthesis === undefined ? 0 : 1;
    this.#resources = {
      ...emptyResources(),
      audioSampleFrames:
        this.#resources.audioSampleFrames -
        activeReservation * audio.serviceUnitReservationSampleFrames,
      audioPayloadBytes:
        this.#resources.audioPayloadBytes -
        activeReservation * audio.serviceUnitReservationPayloadBytes,
      completeAudioUnits:
        this.#resources.completeAudioUnits - activeReservation,
      audioMetadataEntries:
        this.#resources.audioMetadataEntries - activeReservation,
    };
    this.#activeSynthesis = undefined;
    this.#rangeComplete = false;
    this.#playbackState = "stopped";
    this.#serviceState = transition === "cancel" ? "cancelling" : "stopping";
    return transition;
  }

  public releaseDiscardedAudioUnits(maximumUnits: number): number {
    if (!Number.isSafeInteger(maximumUnits) || maximumUnits <= 0) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    let released = 0;
    while (released < maximumUnits) {
      const retained = this.#discardedAudioUnits.shift();
      if (retained === undefined) {
        break;
      }
      retained.unit.release();
      this.#resources = {
        ...this.#resources,
        audioSampleFrames:
          this.#resources.audioSampleFrames - retained.sampleFrames,
        audioPayloadBytes:
          this.#resources.audioPayloadBytes - retained.payloadBytes,
        completeAudioUnits: this.#resources.completeAudioUnits - 1,
        audioMetadataEntries: this.#resources.audioMetadataEntries - 1,
      };
      released += 1;
    }
    return this.#discardedAudioUnits.length;
  }

  public settleServiceStop(): void {
    if (!["cancelling", "stopping", "failed"].includes(this.#serviceState)) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    this.#serviceState = "stopped";
  }

  public beginReplacement(
    identity: AdaptiveBufferWorkIdentity,
    mode: AdaptiveBufferStartMode = this.#mode,
  ): AdaptiveBufferScheduler {
    if (
      this.#serviceState !== "stopped" ||
      this.#identity !== undefined ||
      this.#resources.completeAudioUnits !== 0
    ) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    return new AdaptiveBufferScheduler(this.#clock, identity, mode);
  }

  #nextAction(): AdaptiveBufferSchedulerAction {
    if (this.#identity === undefined) {
      return Object.freeze({ kind: "none", reason: "invalidated" });
    }
    if (
      this.#playbackState === "complete" ||
      (this.#rangeComplete &&
        this.#pendingSegments.length === 0 &&
        this.#activeSynthesis === undefined &&
        this.#resources.activeNarrationPreparations === 0 &&
        this.#playableSampleFrames() === 0)
    ) {
      return Object.freeze({ kind: "none", reason: "complete" });
    }
    if (this.#serviceState === "failed") {
      return Object.freeze({ kind: "none", reason: "failed" });
    }
    if (this.#serviceState === "stopped") {
      return Object.freeze({ kind: "start-service" });
    }
    if (this.#serviceState === "unloaded") {
      return Object.freeze({ kind: "prepare-service" });
    }
    if (
      ["starting", "preparing", "cancelling", "stopping"].includes(
        this.#serviceState,
      )
    ) {
      return Object.freeze({ kind: "none", reason: "service-transition" });
    }
    if (
      this.#serviceState === "generating" ||
      this.#resources.activeNarrationPreparations !== 0
    ) {
      return Object.freeze({ kind: "none", reason: "active-work" });
    }
    if (!this.#shouldProduce() || !this.#canReserveServiceUnit()) {
      return Object.freeze({ kind: "none", reason: "backpressure" });
    }
    if (this.#pendingSegments.length === 0) {
      if (this.#rangeComplete) {
        return Object.freeze({ kind: "none", reason: "complete" });
      }
      return Object.freeze({ kind: "prepare-narration" });
    }
    return Object.freeze({
      kind: "synthesize",
      segmentId: this.#pendingSegments[0]!.segmentId,
    });
  }

  #targetBufferMs(): number {
    if (!this.#initialPlaybackStarted) {
      return initialTargetMs(this.#mode);
    }
    return continuingTargetMs(this.#mode);
  }

  #shouldProduce(): boolean {
    return (
      this.#playableSampleFrames() <
      sampleFramesFromPlayableMilliseconds(this.#targetBufferMs())
    );
  }

  #canReserveServiceUnit(): boolean {
    return canReserveAdaptiveBufferServiceUnit(this.#resources);
  }

  #expectAction(kind: AdaptiveBufferSchedulerAction["kind"]): void {
    if (this.#nextAction().kind !== kind) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
  }

  #playableSampleFrames(): number {
    return this.#audioUnits.reduce(
      (total, retained) =>
        total + retained.sampleFrames - retained.consumedSampleFrames,
      0,
    );
  }

  #settleActivePromptResources(
    resources: AdaptiveBufferResourceSnapshot,
  ): AdaptiveBufferResourceSnapshot {
    const segment = this.#activeSynthesis?.segment;
    if (segment === undefined) {
      throw new AdaptiveBufferSchedulerError("invalid-state");
    }
    return {
      ...resources,
      retainedPreparedSegments: resources.retainedPreparedSegments - 1,
      retainedNarrationCodePoints:
        resources.retainedNarrationCodePoints - segment.narrationCodePoints,
      retainedNarrationUtf8Bytes:
        resources.retainedNarrationUtf8Bytes - segment.narrationUtf8Bytes,
      retainedNarrationSentences:
        resources.retainedNarrationSentences - segment.sentenceCount,
    };
  }

  #settleActiveSynthesis(): void {
    const audio = ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits;
    const resources = this.#settleActivePromptResources({
      ...this.#resources,
      audioSampleFrames:
        this.#resources.audioSampleFrames -
        audio.serviceUnitReservationSampleFrames,
      audioPayloadBytes:
        this.#resources.audioPayloadBytes -
        audio.serviceUnitReservationPayloadBytes,
      completeAudioUnits: this.#resources.completeAudioUnits - 1,
      audioMetadataEntries: this.#resources.audioMetadataEntries - 1,
      activeSyntheses: 0,
    });
    this.#resources = resources;
    this.#activeSynthesis = undefined;
    this.#clearPreparedBatchIfSettled();
  }

  #clearPreparedBatchIfSettled(): void {
    if (
      this.#pendingSegments.length === 0 &&
      this.#activeSynthesis === undefined &&
      this.#resources.retainedPreparedSegments === 0
    ) {
      this.#resources = {
        ...this.#resources,
        retainedPreparedBatches: 0,
      };
    }
  }

  #refreshPlaybackState(): void {
    const playableFrames = this.#playableSampleFrames();
    if (this.#playbackState === "stopped" || this.#identity === undefined) {
      return;
    }
    if (this.#playbackState === "paused") {
      return;
    }
    if (playableFrames === 0) {
      if (
        this.#rangeComplete &&
        this.#pendingSegments.length === 0 &&
        this.#activeSynthesis === undefined
      ) {
        this.#playbackState = "complete";
      } else if (this.#serviceState === "failed") {
        this.#playbackState = "failed";
      } else if (this.#initialPlaybackStarted) {
        this.#playbackState = "buffering";
      }
      return;
    }
    if (this.#playbackState === "playing") {
      return;
    }
    const target = createAdaptiveBufferThresholds(
      this.#initialPlaybackStarted
        ? ADAPTIVE_BUFFER_AUTHORITY_V1.thresholds.refillResumeMs
        : initialTargetMs(this.#mode),
      this.#rangeComplete &&
        this.#pendingSegments.length === 0 &&
        this.#activeSynthesis === undefined
        ? playableMillisecondsFromSampleFrames(playableFrames)
        : undefined,
    );
    if (
      playableFrames >=
      sampleFramesFromPlayableMilliseconds(target.targetBufferMs)
    ) {
      this.#playbackState = "playing";
      this.#initialPlaybackStarted = true;
    }
  }

  #assertResources(resources: AdaptiveBufferResourceSnapshot): void {
    if (!evaluateAdaptiveBufferResources(resources).accepted) {
      throw new AdaptiveBufferSchedulerError("resource-limit");
    }
  }
}
