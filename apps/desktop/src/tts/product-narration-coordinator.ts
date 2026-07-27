import type {
  NarrationPreparationResult,
  OpenedPublication,
  PreparedNarrationSegment,
} from "@voxleaf/epub";
import {
  decodeNarrationSegmentV1,
  type NarrationSegmentV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";

import {
  AdaptiveBufferScheduler,
  type AdaptiveBufferAudioUnitSource,
  type AdaptiveBufferSchedulerAction,
  type AdaptiveBufferStartMode,
  type AdaptiveBufferWorkIdentity,
} from "./adaptive-buffer-scheduler";
import {
  AdaptivePreparationEstimator,
  createAdaptivePreparationUiState,
  type AdaptivePreparationUiState,
} from "./adaptive-preparation";
import {
  AdaptivePcmPlayer,
  WebAudioPcmPlaybackBackend,
  type AdaptivePcmPlayerObservation,
} from "./pcm-playback";
import {
  TtsProcessClient,
  type TtsExactDemoAvailability,
  type TtsGenerationScope,
  type TtsProcessClientObservation,
} from "./process-client";

const TICK_INTERVAL_MS = 250;
const PREPARED_BATCH_SEGMENT_LIMIT = 16;

export type ProductNarrationFailureCode =
  | "audio-playback-failed"
  | "narration-preparation-failed"
  | "tts-service-failed";

export interface ProductNarrationMetrics {
  readonly commandToAudibleMs: number | undefined;
  readonly bufferingMs: number;
  readonly intentionalWaitMs: number;
  readonly playbackMs: number;
  readonly underrunCount: number;
  readonly acceptedAudioUnitCount: number;
  readonly acceptedAudioSampleFrames: number;
}

export interface ProductNarrationSnapshot {
  readonly availability: "checking" | TtsExactDemoAvailability;
  readonly selection: AdaptiveBufferStartMode;
  readonly state: AdaptivePreparationUiState | undefined;
  readonly failure: ProductNarrationFailureCode | undefined;
  readonly metrics: ProductNarrationMetrics;
  readonly serviceState: TtsProcessClientObservation["state"];
}

export interface ProductNarrationServiceClient extends AdaptiveBufferAudioUnitSource {
  exactDemoAvailability(): Promise<TtsExactDemoAvailability>;
  observe(): TtsProcessClientObservation;
  start(): Promise<TtsProcessClientObservation>;
  prepare(): Promise<TtsProcessClientObservation>;
  synthesize(segment: unknown): Promise<{
    readonly sampleCountSamples: number;
  }>;
  cancel(scope: TtsGenerationScope): Promise<void>;
  shutdown(): Promise<void>;
}

export interface ProductNarrationClock {
  readonly nowMs: number;
}

export interface ProductNarrationCoordinatorDependencies {
  readonly client?: ProductNarrationServiceClient;
  readonly clock?: ProductNarrationClock;
  readonly createPlayer?: (
    scheduler: AdaptiveBufferScheduler,
  ) => AdaptivePcmPlayer;
  readonly createIdentifier?: (
    kind: "generation" | "segment" | "session",
    sequence: number,
  ) => string;
  readonly setInterval?: (callback: () => void, intervalMs: number) => unknown;
  readonly clearInterval?: (handle: unknown) => void;
}

type PreparedSegmentEntry = Readonly<{
  contract: NarrationSegmentV1;
  prepared: PreparedNarrationSegment;
}>;

function defaultIdentifier(
  kind: "generation" | "segment" | "session",
  sequence: number,
): string {
  return `${kind}:${globalThis.crypto.randomUUID()}:${String(sequence)}`;
}

function sameLocator(left: ReadingLocatorV1, right: ReadingLocatorV1): boolean {
  return (
    left.bookIdentity.scheme === right.bookIdentity.scheme &&
    left.bookIdentity.schemeVersion === right.bookIdentity.schemeVersion &&
    left.bookIdentity.value === right.bookIdentity.value &&
    left.spineItemId === right.spineItemId &&
    left.spineItemIndex === right.spineItemIndex &&
    left.anchor.kind === right.anchor.kind &&
    left.anchor.formatVersion === right.anchor.formatVersion &&
    left.anchor.value === right.anchor.value &&
    left.anchor.anchorIndex === right.anchor.anchorIndex &&
    left.textOffsetCodePoints === right.textOffsetCodePoints
  );
}

function isPreparationSuccess(
  result: NarrationPreparationResult,
): result is Extract<
  NarrationPreparationResult,
  { status: "batch" | "complete" }
> {
  return result.status === "batch" || result.status === "complete";
}

function isActivePhase(state: AdaptivePreparationUiState | undefined): boolean {
  return (
    state !== undefined &&
    !["complete", "failed", "stopped"].includes(state.phase)
  );
}

export class ProductNarrationCoordinator {
  readonly #publication: OpenedPublication;
  readonly #client: ProductNarrationServiceClient;
  readonly #clock: ProductNarrationClock;
  readonly #createPlayer: (
    scheduler: AdaptiveBufferScheduler,
  ) => AdaptivePcmPlayer;
  readonly #createIdentifier: ProductNarrationCoordinatorDependencies["createIdentifier"];
  readonly #setInterval: NonNullable<
    ProductNarrationCoordinatorDependencies["setInterval"]
  >;
  readonly #clearInterval: NonNullable<
    ProductNarrationCoordinatorDependencies["clearInterval"]
  >;
  readonly #listeners = new Set<() => void>();
  readonly #estimator = new AdaptivePreparationEstimator();
  readonly #prepared = new Map<string, PreparedSegmentEntry>();
  #availability: ProductNarrationSnapshot["availability"] = "checking";
  #selection: AdaptiveBufferStartMode = Object.freeze({ kind: "quick" });
  #activeLocator: ReadingLocatorV1;
  #narrationStartLocator: ReadingLocatorV1 | undefined;
  #continuation: ReadingLocatorV1 | undefined;
  #identity: AdaptiveBufferWorkIdentity | undefined;
  #scheduler: AdaptiveBufferScheduler | undefined;
  #player: AdaptivePcmPlayer | undefined;
  #operation: Promise<void> | undefined;
  #tickHandle: unknown;
  #closed = false;
  #runToken = 0;
  #nextSequence = 0;
  #activeScope: TtsGenerationScope | undefined;
  #preparationAbort: AbortController | undefined;
  #failure: ProductNarrationFailureCode | undefined;
  #terminalState: AdaptivePreparationUiState | undefined;
  #snapshot: ProductNarrationSnapshot;
  #commandStartedAtMs: number | undefined;
  #commandToAudibleMs: number | undefined;
  #bufferingMs = 0;
  #playbackMs = 0;
  #lastMetricsAtMs: number | undefined;
  #lastPlayerPhase: AdaptivePcmPlayerObservation["state"] | undefined;
  #acceptedAudioUnitCount = 0;
  #acceptedAudioSampleFrames = 0;

  public constructor(
    publication: OpenedPublication,
    initialLocator: ReadingLocatorV1,
    dependencies: ProductNarrationCoordinatorDependencies = {},
  ) {
    this.#publication = publication;
    this.#activeLocator = initialLocator;
    this.#client = dependencies.client ?? new TtsProcessClient();
    this.#clock =
      dependencies.clock ??
      Object.freeze({
        get nowMs() {
          return Date.now();
        },
      });
    this.#createPlayer =
      dependencies.createPlayer ??
      ((scheduler) =>
        new AdaptivePcmPlayer(scheduler, new WebAudioPcmPlaybackBackend()));
    this.#createIdentifier = dependencies.createIdentifier ?? defaultIdentifier;
    this.#setInterval =
      dependencies.setInterval ??
      ((callback, intervalMs) => globalThis.setInterval(callback, intervalMs));
    this.#clearInterval =
      dependencies.clearInterval ??
      ((handle) => globalThis.clearInterval(handle as number));
    this.#snapshot = this.#createSnapshot();
  }

  public subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  public observe(): ProductNarrationSnapshot {
    return this.#snapshot;
  }

  public async checkAvailability(): Promise<void> {
    if (this.#closed || this.#availability !== "checking") {
      return;
    }
    const availability = await this.#client.exactDemoAvailability();
    if (this.#closed) {
      return;
    }
    this.#availability = availability;
    this.#publish();
  }

  public setSelection(selection: AdaptiveBufferStartMode): void {
    if (this.#closed || isActivePhase(this.#snapshot.state)) {
      return;
    }
    this.#selection = Object.freeze({ ...selection });
    this.#failure = undefined;
    this.#terminalState = undefined;
    this.#publish();
  }

  public updateActiveLocator(locator: ReadingLocatorV1): void {
    if (this.#closed || sameLocator(locator, this.#activeLocator)) {
      return;
    }
    this.#activeLocator = locator;
    if (
      this.#narrationStartLocator !== undefined &&
      isActivePhase(this.#snapshot.state)
    ) {
      void this.stop();
    }
  }

  public start(): void {
    if (
      this.#closed ||
      this.#availability !== "available" ||
      this.#scheduler !== undefined
    ) {
      return;
    }
    this.#failure = undefined;
    this.#terminalState = undefined;
    this.#estimator.reset();
    this.#prepared.clear();
    this.#continuation = this.#activeLocator;
    this.#narrationStartLocator = this.#activeLocator;
    this.#nextSequence = 0;
    this.#acceptedAudioUnitCount = 0;
    this.#acceptedAudioSampleFrames = 0;
    this.#bufferingMs = 0;
    this.#playbackMs = 0;
    this.#commandToAudibleMs = undefined;
    this.#commandStartedAtMs = this.#clock.nowMs;
    this.#lastMetricsAtMs = this.#clock.nowMs;
    this.#lastPlayerPhase = "preparing";
    const runToken = ++this.#runToken;
    const identity = Object.freeze({
      sessionId: this.#createIdentifier!("session", runToken),
      generationId: this.#createIdentifier!("generation", runToken),
    });
    this.#identity = identity;
    this.#scheduler = new AdaptiveBufferScheduler(
      this.#clock,
      identity,
      this.#selection,
    );
    this.#player = this.#createPlayer(this.#scheduler);
    this.#tickHandle = this.#setInterval(() => {
      this.#tick(runToken);
    }, TICK_INTERVAL_MS);
    this.#publish();
    this.#requestPump(runToken);
  }

  public pause(): void {
    try {
      this.#player?.pause();
      this.#tick(this.#runToken);
    } catch {
      this.#fail("audio-playback-failed", this.#runToken);
    }
  }

  public resume(): void {
    try {
      this.#player?.resume();
      this.#tick(this.#runToken);
    } catch {
      this.#fail("audio-playback-failed", this.#runToken);
    }
  }

  public setVolumePercent(volumePercent: number): void {
    try {
      this.#player?.setVolumePercent(volumePercent);
      this.#publish();
    } catch {
      this.#fail("audio-playback-failed", this.#runToken);
    }
  }

  public async stop(): Promise<void> {
    if (this.#scheduler === undefined || this.#player === undefined) {
      return;
    }
    const operation = this.#operation;
    const scope = this.#activeScope;
    this.#preparationAbort?.abort();
    this.#preparationAbort = undefined;
    const transition = this.#player.stop();
    const stopToken = ++this.#runToken;
    this.#stopTicker();
    this.#prepared.clear();
    this.#continuation = undefined;
    this.#identity = undefined;
    this.#activeScope = undefined;
    this.#publish();
    try {
      if (transition === "cancel" && scope !== undefined) {
        await this.#client.cancel(scope);
      } else {
        await operation?.catch(() => undefined);
        await this.#client.shutdown();
      }
    } catch {
      // Eligibility was invalidated before native containment was attempted.
    }
    if (this.#runToken !== stopToken) {
      return;
    }
    try {
      this.#scheduler.settleServiceStop();
    } catch {
      // A failed operation may already have settled the service boundary.
    }
    this.#scheduler = undefined;
    this.#player = undefined;
    this.#narrationStartLocator = undefined;
    this.#terminalState = undefined;
    this.#failure = undefined;
    this.#publish();
  }

  public async close(): Promise<void> {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    await this.stop();
    this.#listeners.clear();
  }

  #requestPump(runToken: number): void {
    if (
      this.#operation !== undefined ||
      this.#closed ||
      runToken !== this.#runToken
    ) {
      return;
    }
    queueMicrotask(() => {
      if (
        this.#operation !== undefined ||
        this.#closed ||
        runToken !== this.#runToken
      ) {
        return;
      }
      const action = this.#scheduler?.observe().nextAction;
      if (action === undefined || action.kind === "none") {
        return;
      }
      const operation = this.#execute(action, runToken);
      this.#operation = operation;
      void operation.finally(() => {
        if (this.#operation === operation) {
          this.#operation = undefined;
        }
        if (runToken === this.#runToken) {
          this.#tick(runToken);
          this.#requestPump(runToken);
        }
      });
    });
  }

  async #execute(
    action: Exclude<AdaptiveBufferSchedulerAction, { kind: "none" }>,
    runToken: number,
  ): Promise<void> {
    const scheduler = this.#scheduler;
    if (scheduler === undefined) {
      return;
    }
    try {
      switch (action.kind) {
        case "start-service":
          scheduler.beginServiceStart();
          this.#publish();
          await this.#client.start();
          if (runToken === this.#runToken) {
            scheduler.markServiceStarted();
          }
          break;
        case "prepare-service":
          scheduler.beginServicePrepare();
          this.#publish();
          await this.#client.prepare();
          if (runToken === this.#runToken) {
            scheduler.markServiceReady();
          }
          break;
        case "prepare-narration":
          await this.#prepareNarration(scheduler, runToken);
          break;
        case "synthesize":
          await this.#synthesize(scheduler, action.segmentId, runToken);
          break;
      }
      if (runToken === this.#runToken) {
        this.#publish();
      }
    } catch {
      if (runToken !== this.#runToken) {
        return;
      }
      if (action.kind === "prepare-narration") {
        scheduler.failNarrationPreparation();
        this.#fail("narration-preparation-failed", runToken);
      } else if (action.kind === "synthesize") {
        scheduler.failActiveSynthesis();
        this.#fail("tts-service-failed", runToken);
      } else {
        scheduler.failServiceTransition();
        this.#fail("tts-service-failed", runToken);
      }
    }
  }

  async #prepareNarration(
    scheduler: AdaptiveBufferScheduler,
    runToken: number,
  ): Promise<void> {
    const startLocator = this.#continuation;
    if (startLocator === undefined) {
      throw new Error("content-free-preparation-state");
    }
    scheduler.beginNarrationPreparation();
    this.#publish();
    const controller = new AbortController();
    this.#preparationAbort = controller;
    let result: NarrationPreparationResult;
    try {
      result = await this.#publication.prepareNarration({
        startLocator,
        profile: "narration-v1",
        defaultLanguage: "es",
        maximumSegments: PREPARED_BATCH_SEGMENT_LIMIT,
        signal: controller.signal,
      });
    } finally {
      if (this.#preparationAbort === controller) {
        this.#preparationAbort = undefined;
      }
    }
    if (runToken !== this.#runToken) {
      return;
    }
    if (!isPreparationSuccess(result)) {
      throw new Error("content-free-preparation-failure");
    }
    if (result.segments.length === 0) {
      if (result.status !== "complete") {
        throw new Error("content-free-empty-batch");
      }
      scheduler.acceptEmptyCompleteRange();
      this.#continuation = undefined;
      return;
    }
    if (this.#identity === undefined || this.#prepared.size !== 0) {
      throw new Error("content-free-preparation-state");
    }
    const entries = result.segments.map((prepared) => {
      const sequence = this.#nextSequence;
      this.#nextSequence += 1;
      const segmentId = this.#createIdentifier!("segment", sequence);
      const contract = decodeNarrationSegmentV1({
        schemaVersion: 1,
        segmentId,
        bookIdentity: this.#publication.book.identity,
        sessionId: this.#identity!.sessionId,
        generationId: this.#identity!.generationId,
        sequence,
        sourceRange: prepared.sourceRange,
        text: prepared.text,
      });
      return Object.freeze({ contract, prepared });
    });
    for (const entry of entries) {
      this.#prepared.set(entry.contract.segmentId, entry);
    }
    scheduler.acceptPreparedBatch({
      complete: result.status === "complete",
      segments: entries.map(({ contract, prepared }) =>
        Object.freeze({
          segmentId: contract.segmentId,
          narrationCodePoints: prepared.measurements.narrationCodePoints,
          narrationUtf8Bytes: prepared.measurements.narrationUtf8Bytes,
          sentenceCount: prepared.measurements.sentenceCount,
        }),
      ),
    });
    this.#continuation =
      result.status === "batch" ? result.continuation : undefined;
  }

  async #synthesize(
    scheduler: AdaptiveBufferScheduler,
    segmentId: string,
    runToken: number,
  ): Promise<void> {
    const begunSegmentId = scheduler.beginSynthesis();
    const entry = this.#prepared.get(begunSegmentId);
    if (entry === undefined || begunSegmentId !== segmentId) {
      throw new Error("content-free-synthesis-state");
    }
    const scope = Object.freeze({
      sessionId: entry.contract.sessionId,
      generationId: entry.contract.generationId,
      segmentId: entry.contract.segmentId,
    });
    this.#activeScope = scope;
    const startedAtMs = this.#clock.nowMs;
    this.#publish();
    const metadata = await this.#client.synthesize(entry.contract);
    this.#prepared.delete(begunSegmentId);
    if (runToken !== this.#runToken) {
      return;
    }
    this.#activeScope = undefined;
    const outcome = scheduler.takeCompletedUnitFrom(this.#client);
    if (outcome !== "accepted") {
      throw new Error("content-free-audio-rejection");
    }
    const elapsedMs = Math.max(1, this.#clock.nowMs - startedAtMs);
    this.#estimator.record({
      elapsedMs,
      acceptedSampleFrames: metadata.sampleCountSamples,
    });
    this.#acceptedAudioUnitCount += 1;
    this.#acceptedAudioSampleFrames += metadata.sampleCountSamples;
  }

  #tick(runToken: number): void {
    if (
      this.#closed ||
      runToken !== this.#runToken ||
      this.#player === undefined
    ) {
      return;
    }
    try {
      const player = this.#player.synchronize();
      this.#updateMetrics(player);
      this.#publish();
      this.#requestPump(runToken);
    } catch {
      this.#fail("audio-playback-failed", runToken);
    }
  }

  #updateMetrics(player: AdaptivePcmPlayerObservation): void {
    const nowMs = this.#clock.nowMs;
    if (this.#lastMetricsAtMs !== undefined && nowMs >= this.#lastMetricsAtMs) {
      const elapsed = nowMs - this.#lastMetricsAtMs;
      if (this.#lastPlayerPhase === "buffering") {
        this.#bufferingMs += elapsed;
      } else if (this.#lastPlayerPhase === "playing") {
        this.#playbackMs += elapsed;
      }
    }
    if (
      player.state === "playing" &&
      this.#commandToAudibleMs === undefined &&
      this.#commandStartedAtMs !== undefined
    ) {
      this.#commandToAudibleMs = Math.max(0, nowMs - this.#commandStartedAtMs);
    }
    this.#lastMetricsAtMs = nowMs;
    this.#lastPlayerPhase = player.state;
  }

  #fail(code: ProductNarrationFailureCode, runToken: number): void {
    if (runToken !== this.#runToken || this.#failure !== undefined) {
      return;
    }
    this.#failure = code;
    this.#terminalState = this.#stateFromActiveOwners();
    const scope = this.#activeScope;
    const transition = this.#player?.close();
    this.#stopTicker();
    this.#prepared.clear();
    this.#preparationAbort?.abort();
    this.#preparationAbort = undefined;
    this.#identity = undefined;
    this.#continuation = undefined;
    this.#activeScope = undefined;
    this.#runToken += 1;
    this.#publish();
    void (async () => {
      try {
        if (transition === "cancel" && scope !== undefined) {
          await this.#client.cancel(scope);
        } else {
          await this.#client.shutdown();
        }
      } catch {
        // The fixed product failure is already published content-free.
      }
    })();
  }

  #stateFromActiveOwners(): AdaptivePreparationUiState | undefined {
    const scheduler = this.#scheduler;
    if (scheduler === undefined) {
      return undefined;
    }
    try {
      const player = this.#player?.synchronize();
      const projected = createAdaptivePreparationUiState({
        mode: this.#selection,
        scheduler: scheduler.observe(),
        ...(player === undefined
          ? {}
          : { volumePercent: player.volumePercent }),
      });
      return Object.freeze({ ...projected, phase: "failed" });
    } catch {
      return undefined;
    }
  }

  #stopTicker(): void {
    if (this.#tickHandle !== undefined) {
      this.#clearInterval(this.#tickHandle);
      this.#tickHandle = undefined;
    }
  }

  #createSnapshot(): ProductNarrationSnapshot {
    const scheduler = this.#scheduler?.observe();
    const player = this.#player;
    let state = this.#terminalState;
    if (
      state === undefined &&
      scheduler !== undefined &&
      player !== undefined
    ) {
      let estimatedWaitMs: number | undefined;
      try {
        estimatedWaitMs = this.#estimator.estimate({
          playableSampleFrames: scheduler.playableSampleFrames,
          targetMs: scheduler.targetBufferMs,
          serviceState: scheduler.serviceState,
        })?.estimatedWaitMs;
      } catch {
        estimatedWaitMs = undefined;
      }
      state = createAdaptivePreparationUiState({
        mode: this.#selection,
        scheduler,
        ...(estimatedWaitMs === undefined ? {} : { estimatedWaitMs }),
        volumePercent: player.synchronize().volumePercent,
      });
    }
    return Object.freeze({
      availability: this.#availability,
      selection: this.#selection,
      state,
      failure: this.#failure,
      serviceState: this.#client.observe().state,
      metrics: Object.freeze({
        commandToAudibleMs: this.#commandToAudibleMs,
        bufferingMs: this.#bufferingMs,
        intentionalWaitMs: 0,
        playbackMs: this.#playbackMs,
        underrunCount: this.#player?.synchronize().underrunCount ?? 0,
        acceptedAudioUnitCount: this.#acceptedAudioUnitCount,
        acceptedAudioSampleFrames: this.#acceptedAudioSampleFrames,
      }),
    });
  }

  #publish(): void {
    this.#snapshot = this.#createSnapshot();
    for (const listener of this.#listeners) {
      listener();
    }
  }
}
