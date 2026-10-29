import type {
  NarrationPreparationFailureDetail,
  NarrationPreparationResult,
  OpenedPublication,
  PreparedNarrationSegment,
} from "@voxleaf/epub";
import {
  decodeNarrationSegmentV1,
  type LocatorRangeV1,
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
import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "./adaptive-buffer-authority";
import {
  AdaptivePreparationEstimator,
  createAdaptivePreparationUiState,
  type AdaptivePreparationUiState,
} from "./adaptive-preparation";
import {
  AdaptivePcmPlayer,
  WebAudioPcmPlaybackBackend,
  type AdaptivePcmAudibleProgressObservation,
  type AdaptivePcmPlayerObservation,
} from "./pcm-playback";
import {
  TtsProcessClient,
  TtsProcessClientError,
  type TtsExactDemoAvailability,
  type TtsGenerationScope,
  type TtsProcessClientObservation,
} from "./process-client";
import {
  CHATTERBOX_BILINGUAL_PROFILE_ID,
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "./hardware-profile-registry";
import {
  DEFAULT_NARRATION_LANGUAGE_V2,
  type NarrationLanguageV1,
} from "./narration-language";
import {
  createWebStorageNarrationStartPreferenceRepository,
  DEFAULT_NARRATION_START_PREFERENCE_V1,
  type NarrationStartPreferenceReadResult,
  type NarrationStartPreferenceRepository,
} from "../persistence/narration-start-preference";
import {
  createWebStorageNarrationPlaybackPreferenceRepository,
  DEFAULT_NARRATION_PLAYBACK_RATE_PERCENT_V1,
  type NarrationPlaybackPreferenceReadResult,
  type NarrationPlaybackPreferenceRepository,
} from "../persistence/narration-playback-preference";
import type { NarrationPlaybackRatePercentV3 } from "./reader-settings-playback-authority-v3";
import { minimumSourceSampleFramesForEffectiveListeningMillisecondsV3 } from "./reader-settings-playback-authority-v3";
import {
  HARDWARE_PROFILE_AUTHORITY_V1,
  type RecoveryFailureCodeV1,
} from "./hardware-profile-authority";
import {
  OperationalRecoveryController,
  type OperationalRecoverySnapshotV1,
} from "./operational-recovery";
import { playbackTransitionPauseMsForPreparedSegment } from "./playback-transition-policy";

const TICK_INTERVAL_MS = 250;
const PREPARED_BATCH_SEGMENT_LIMIT = 8;
const NAVIGATION_BOUNDARY_LIMIT = 64;
const PIPER_SPEAKABLE_CONTENT = /[\p{L}\p{N}\p{Sc}%‰ºª°]/u;

function isPiperSpeakableSegment(segment: PreparedNarrationSegment): boolean {
  return PIPER_SPEAKABLE_CONTENT.test(segment.text);
}

function isPiperProfile(profileId: string): boolean {
  return (
    profileId === PIPER_CPU_FALLBACK_PROFILE_ID ||
    profileId === PIPER_ENGLISH_CPU_PROFILE_ID
  );
}

function isChatterboxProfile(profileId: string): boolean {
  return profileId === CHATTERBOX_BILINGUAL_PROFILE_ID;
}

export type ProductNarrationFailureCode =
  | "audio-playback-failed"
  | "narration-preparation-failed"
  | "tts-profile-unavailable"
  | "tts-service-failed";

export interface ProductNarrationMetrics {
  readonly commandToAudibleMs: number | undefined;
  readonly bufferingMs: number;
  readonly intentionalWaitMs: number;
  readonly playbackMs: number;
  readonly underrunCount: number;
  readonly acceptedAudioUnitCount: number;
  readonly acceptedAudioSampleFrames: number;
  readonly retainedAudioUnitCount: number;
  readonly discardedAudioUnitCount: number;
}

export interface ProductNarrationSnapshot {
  readonly availability: "checking" | TtsExactDemoAvailability;
  readonly profileId: string;
  readonly language: NarrationLanguageV1;
  readonly selection: AdaptiveBufferStartMode;
  readonly startPreferenceStatus:
    "loading" | NarrationStartPreferenceReadResult["status"];
  readonly canPersistStartPreference: boolean;
  readonly playbackRatePercent: NarrationPlaybackRatePercentV3;
  readonly playbackPreferenceStatus:
    "loading" | NarrationPlaybackPreferenceReadResult["status"];
  readonly canPersistPlaybackPreference: boolean;
  readonly state: AdaptivePreparationUiState | undefined;
  readonly failure: ProductNarrationFailureCode | undefined;
  readonly preparationFailure: NarrationPreparationFailureDetail | undefined;
  readonly metrics: ProductNarrationMetrics;
  readonly serviceState: TtsProcessClientObservation["state"];
  readonly navigation: ProductNarrationNavigationSnapshot;
  readonly recovery: OperationalRecoverySnapshotV1;
}

export type ProductNarrationAudibleProgressObservation =
  AdaptivePcmAudibleProgressObservation;

export type ProductNarrationPlayIntent = "inactive" | "paused" | "playing";

export interface ProductNarrationNavigationSnapshot {
  readonly canStart?: boolean;
  readonly playIntent: ProductNarrationPlayIntent;
  readonly settling: boolean;
  readonly canGoPrevious: boolean;
  readonly canGoNext: boolean;
}

export type ProductNarrationNavigationEvent =
  | "chapter-navigation"
  | "explicit-visual-navigation"
  | "next-segment"
  | "previous-segment";

export interface ProductNarrationNavigationRequest {
  readonly event: "next-segment" | "paragraph-leaf" | "previous-segment";
  readonly locator: ReadingLocatorV1;
}

export interface ProductNarrationServiceClient extends AdaptiveBufferAudioUnitSource {
  exactDemoAvailability(): Promise<TtsExactDemoAvailability>;
  profileConfigurationAvailability(
    profileId: string,
  ): Promise<TtsExactDemoAvailability>;
  observe(): TtsProcessClientObservation;
  start(
    profileId?: string,
    language?: NarrationLanguageV1,
  ): Promise<TtsProcessClientObservation>;
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

export interface ProductNarrationProfileCompatibility {
  /** Settle the initial host/preference probe without starting a model. */
  ensureChecked?(): Promise<unknown>;
  check?(trigger: "before-profile-start"): Promise<unknown>;
  activeProfileId?(): string | undefined;
  activeLanguage?(): NarrationLanguageV1;
  isProfileCurrentlyAllowed(profileId: string): boolean | undefined;
  isProfileContinuationAllowed?(profileId: string): boolean;
  isProfileStartAllowed(
    profileId: string,
    trigger: "application-start" | "before-profile-start",
    language?: NarrationLanguageV1,
  ): Promise<boolean>;
}

export interface ProductNarrationCoordinatorDependencies {
  readonly client?: ProductNarrationServiceClient;
  readonly clock?: ProductNarrationClock;
  readonly profileCompatibility?: ProductNarrationProfileCompatibility;
  readonly startPreferenceRepository?: NarrationStartPreferenceRepository;
  readonly playbackPreferenceRepository?: NarrationPlaybackPreferenceRepository;
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

export class ProductNarrationRecoveryError extends Error {
  public readonly recoveryCode: RecoveryFailureCodeV1;

  public constructor(recoveryCode: RecoveryFailureCodeV1) {
    super("Local narration recovery failed.");
    this.name = "ProductNarrationRecoveryError";
    this.recoveryCode = recoveryCode;
  }
}

type PreparedSegmentEntry = Readonly<{
  contract: NarrationSegmentV1;
  prepared: PreparedNarrationSegment;
}>;

interface PendingNavigation {
  readonly revision: number;
  readonly event: ProductNarrationNavigationEvent;
  readonly priorIntent: Exclude<ProductNarrationPlayIntent, "inactive">;
  readonly stop: Promise<void>;
  restart: boolean;
  target: ReadingLocatorV1 | undefined;
}

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

function sameBookIdentity(
  left: ReadingLocatorV1["bookIdentity"],
  right: ReadingLocatorV1["bookIdentity"],
): boolean {
  return (
    left.scheme === right.scheme &&
    left.schemeVersion === right.schemeVersion &&
    left.value === right.value
  );
}

function compareLocatorPosition(
  left: ReadingLocatorV1,
  right: ReadingLocatorV1,
): number {
  if (left.spineItemIndex !== right.spineItemIndex) {
    return left.spineItemIndex - right.spineItemIndex;
  }
  if (left.anchor.anchorIndex !== right.anchor.anchorIndex) {
    return left.anchor.anchorIndex - right.anchor.anchorIndex;
  }
  return left.textOffsetCodePoints - right.textOffsetCodePoints;
}

function sameRange(left: LocatorRangeV1, right: LocatorRangeV1): boolean {
  return (
    sameLocator(left.start, right.start) && sameLocator(left.end, right.end)
  );
}

function containsLocator(
  range: LocatorRangeV1,
  locator: ReadingLocatorV1,
): boolean {
  return (
    compareLocatorPosition(range.start, locator) <= 0 &&
    compareLocatorPosition(locator, range.end) < 0
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

function classifyOperationalFailure(
  productCode: ProductNarrationFailureCode,
  action: "playback" | "prepare-service" | "start-service" | "synthesize",
  error: unknown,
): RecoveryFailureCodeV1 {
  if (error instanceof ProductNarrationRecoveryError) {
    return error.recoveryCode;
  }
  if (productCode === "audio-playback-failed" || action === "playback") {
    return "playback-failed";
  }
  if (productCode === "tts-profile-unavailable") {
    return "provider-unavailable";
  }
  if (error instanceof TtsProcessClientError) {
    if (error.code === "tts-service-resource-limit") {
      return "resource-exhausted";
    }
    if (
      error.code === "tts-service-invalid-input" ||
      error.code === "tts-service-invalid-response" ||
      error.code === "tts-service-invalid-state" ||
      error.code === "tts-service-protocol-rejected"
    ) {
      return "protocol-failed";
    }
  }
  if (action === "start-service") {
    return "model-load-failed";
  }
  if (action === "prepare-service") {
    return "model-warm-failed";
  }
  return "service-crashed";
}

export class ProductNarrationCoordinator {
  readonly #publication: OpenedPublication;
  readonly #client: ProductNarrationServiceClient;
  readonly #clock: ProductNarrationClock;
  readonly #profileCompatibility:
    ProductNarrationProfileCompatibility | undefined;
  readonly #startPreferenceRepository: NarrationStartPreferenceRepository;
  readonly #playbackPreferenceRepository: NarrationPlaybackPreferenceRepository;
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
  readonly #audibleProgressListeners = new Set<
    (observation: ProductNarrationAudibleProgressObservation) => void
  >();
  readonly #navigationListeners = new Set<
    (request: ProductNarrationNavigationRequest) => void
  >();
  readonly #estimator = new AdaptivePreparationEstimator();
  readonly #recovery = new OperationalRecoveryController();
  readonly #prepared = new Map<string, PreparedSegmentEntry>();
  readonly #knownBoundaries: LocatorRangeV1[] = [];
  #segmentationContext: string | undefined;
  #availability: ProductNarrationSnapshot["availability"] = "checking";
  #availabilityRevision = 0;
  #profileId = EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID;
  #language = DEFAULT_NARRATION_LANGUAGE_V2;
  #selection: AdaptiveBufferStartMode = DEFAULT_NARRATION_START_PREFERENCE_V1;
  #startPreferenceStatus: ProductNarrationSnapshot["startPreferenceStatus"] =
    "loading";
  #canPersistStartPreference = true;
  #startPreferenceHydration: Promise<void> | undefined;
  #playbackRatePercent: NarrationPlaybackRatePercentV3 =
    DEFAULT_NARRATION_PLAYBACK_RATE_PERCENT_V1;
  #playbackPreferenceStatus: ProductNarrationSnapshot["playbackPreferenceStatus"] =
    "loading";
  #canPersistPlaybackPreference = true;
  #playbackPreferenceHydration: Promise<void> | undefined;
  #activeLocator: ReadingLocatorV1;
  #visibleLocator: ReadingLocatorV1;
  #latestHeardLocator: ReadingLocatorV1;
  #audibleRange: LocatorRangeV1 | undefined;
  #playIntent: ProductNarrationPlayIntent = "inactive";
  #readerPlacementAvailable = true;
  #pendingNavigation: PendingNavigation | undefined;
  #navigationRevision = 0;
  #pausedNavigationState: AdaptivePreparationUiState | undefined;
  #continuation: ReadingLocatorV1 | undefined;
  #identity: AdaptiveBufferWorkIdentity | undefined;
  #scheduler: AdaptiveBufferScheduler | undefined;
  #player: AdaptivePcmPlayer | undefined;
  #volumePercent: number =
    ADAPTIVE_BUFFER_AUTHORITY_V1.playback.defaultVolumePercent;
  #playerAudibleUnsubscribe: (() => void) | undefined;
  #operation: Promise<void> | undefined;
  #stopOperation: Promise<void> | undefined;
  #recoveryResetPending = false;
  #recoveryOperation: Promise<void> | undefined;
  #tickHandle: unknown;
  #closed = false;
  #closeOperation: Promise<void> | undefined;
  #runToken = 0;
  #nextSequence = 0;
  #activeScope: TtsGenerationScope | undefined;
  #preparationAbort: AbortController | undefined;
  #failure: ProductNarrationFailureCode | undefined;
  #preparationFailure: NarrationPreparationFailureDetail | undefined;
  #terminalState: AdaptivePreparationUiState | undefined;
  #snapshot: ProductNarrationSnapshot;
  #commandStartedAtMs: number | undefined;
  #commandToAudibleMs: number | undefined;
  #bufferingMs = 0;
  #intentionalWaitMs = 0;
  #playbackMs = 0;
  #underrunCount = 0;
  #lastPlayerUnderrunCount = 0;
  #lastMetricsAtMs: number | undefined;
  #lastPlayerPhase: AdaptivePcmPlayerObservation["state"] | undefined;
  #lastPlayerAudible = false;
  #lastPlayerIntentionalWaitMs = 0;
  #acceptedAudioUnitCount = 0;
  #acceptedAudioSampleFrames = 0;

  public constructor(
    publication: OpenedPublication,
    initialLocator: ReadingLocatorV1,
    dependencies: ProductNarrationCoordinatorDependencies = {},
  ) {
    this.#publication = publication;
    this.#activeLocator = initialLocator;
    this.#visibleLocator = initialLocator;
    this.#latestHeardLocator = initialLocator;
    this.#client = dependencies.client ?? new TtsProcessClient();
    this.#profileCompatibility = dependencies.profileCompatibility;
    this.#startPreferenceRepository =
      dependencies.startPreferenceRepository ??
      createWebStorageNarrationStartPreferenceRepository();
    this.#playbackPreferenceRepository =
      dependencies.playbackPreferenceRepository ??
      createWebStorageNarrationPlaybackPreferenceRepository();
    this.#clock =
      dependencies.clock ??
      Object.freeze({
        get nowMs() {
          return Math.floor(performance.now());
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

  public subscribeAudibleProgress(
    listener: (observation: ProductNarrationAudibleProgressObservation) => void,
  ): () => void {
    this.#audibleProgressListeners.add(listener);
    return () => {
      this.#audibleProgressListeners.delete(listener);
    };
  }

  public subscribeNavigationRequests(
    listener: (request: ProductNarrationNavigationRequest) => void,
  ): () => void {
    this.#navigationListeners.add(listener);
    return () => {
      this.#navigationListeners.delete(listener);
    };
  }

  public async checkAvailability(): Promise<void> {
    if (this.#closed || this.#availability !== "checking") {
      return;
    }
    const revision = ++this.#availabilityRevision;
    const runToken = this.#runToken;
    await Promise.all([
      this.#hydrateStartPreference(),
      this.#hydratePlaybackPreference(),
      this.#profileCompatibility?.ensureChecked?.(),
    ]);
    if (this.#closed || revision !== this.#availabilityRevision) {
      return;
    }
    if (runToken !== this.#runToken) {
      await this.checkAvailability();
      return;
    }
    let availability: TtsExactDemoAvailability;
    let profileId = this.#profileId;
    let language = this.#language;
    if (this.#profileCompatibility === undefined) {
      availability = await this.#client.exactDemoAvailability();
    } else {
      language =
        this.#profileCompatibility.activeLanguage?.() ??
        DEFAULT_NARRATION_LANGUAGE_V2;
      const continuing =
        this.#scheduler !== undefined &&
        this.#recovery.observe().phase === "operational" &&
        ["ready", "generating"].includes(this.#client.observe().state) &&
        language === this.#language &&
        this.#profileCompatibility.isProfileContinuationAllowed?.(
          this.#profileId,
        ) === true;
      const selectedProfileId = continuing
        ? this.#profileId
        : this.#profileCompatibility.activeProfileId?.();
      if (selectedProfileId === undefined) {
        availability = "unavailable";
      } else {
        profileId = selectedProfileId;
        const current =
          this.#profileCompatibility.isProfileCurrentlyAllowed(profileId);
        const allowed =
          continuing ||
          (current ??
            (await this.#profileCompatibility.isProfileStartAllowed(
              profileId,
              "application-start",
              language,
            )));
        availability =
          allowed &&
          (await this.#client.profileConfigurationAvailability(profileId)) ===
            "available"
            ? "available"
            : "unavailable";
      }
    }
    if (this.#closed || revision !== this.#availabilityRevision) {
      return;
    }
    if (runToken !== this.#runToken) {
      // Stop/navigation invalidated this observation, not the surviving owner.
      // Renew the explicit availability request without restarting narration.
      await this.checkAvailability();
      return;
    }
    if (
      this.#scheduler !== undefined &&
      (profileId !== this.#profileId ||
        language !== this.#language ||
        availability !== "available")
    ) {
      const stop = this.stopForConfigurationChange();
      const containmentToken = this.#runToken;
      await stop;
      if (
        this.#closed ||
        revision !== this.#availabilityRevision ||
        containmentToken !== this.#runToken ||
        this.#recovery.observe().phase !== "operational"
      )
        return;
    }
    this.#profileId = profileId;
    this.#language = language;
    this.#selectSegmentationContext(profileId, language);
    this.#availability = availability;
    this.#publish();
  }

  public async refreshSelectedProfile(): Promise<void> {
    if (this.#closed) {
      return;
    }
    this.#availability = "checking";
    this.#publish();
    await this.checkAvailability();
  }

  public async setSelection(
    selection: AdaptiveBufferStartMode,
  ): Promise<boolean> {
    await this.#hydrateStartPreference();
    if (
      this.#closed ||
      isActivePhase(this.#snapshot.state) ||
      this.#recovery.observe().phase !== "operational" ||
      !this.#canPersistStartPreference
    ) {
      return false;
    }
    const result = await this.#startPreferenceRepository.write(selection);
    if (this.#closed || result.status !== "saved") {
      return false;
    }
    this.#selection = Object.freeze({ ...selection });
    this.#startPreferenceStatus = "ready";
    this.#failure = undefined;
    this.#preparationFailure = undefined;
    this.#terminalState = undefined;
    this.#publish();
    return true;
  }

  public async resetStartPreference(): Promise<boolean> {
    await this.#hydrateStartPreference();
    if (
      this.#closed ||
      isActivePhase(this.#snapshot.state) ||
      !this.#canPersistStartPreference
    ) {
      return false;
    }
    const result = await this.#startPreferenceRepository.reset();
    if (this.#closed || result.status !== "saved") {
      return false;
    }
    this.#selection = DEFAULT_NARRATION_START_PREFERENCE_V1;
    this.#startPreferenceStatus = "ready";
    this.#failure = undefined;
    this.#preparationFailure = undefined;
    this.#terminalState = undefined;
    this.#publish();
    return true;
  }

  public async setPlaybackRatePercent(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): Promise<boolean> {
    await this.#hydratePlaybackPreference();
    if (this.#closed || !this.#canPersistPlaybackPreference) {
      return false;
    }
    try {
      this.#player?.setPlaybackRatePercent(playbackRatePercent);
    } catch {
      return false;
    }
    this.#playbackRatePercent = playbackRatePercent;
    this.#publish();
    const result =
      await this.#playbackPreferenceRepository.write(playbackRatePercent);
    if (this.#closed) {
      return false;
    }
    if (result.status === "saved") {
      this.#playbackPreferenceStatus = "ready";
      this.#publish();
      return true;
    }
    this.#playbackPreferenceStatus =
      result.status === "invalid-selection" ? "malformed" : result.status;
    this.#canPersistPlaybackPreference =
      result.status !== "unsupported-version";
    this.#publish();
    return false;
  }

  public async resetPlaybackPreference(): Promise<boolean> {
    await this.#hydratePlaybackPreference();
    if (this.#closed || !this.#canPersistPlaybackPreference) {
      return false;
    }
    const result = await this.#playbackPreferenceRepository.reset();
    if (this.#closed || result.status !== "saved") {
      return false;
    }
    try {
      this.#player?.setPlaybackRatePercent(
        DEFAULT_NARRATION_PLAYBACK_RATE_PERCENT_V1,
      );
    } catch {
      return false;
    }
    this.#playbackRatePercent = DEFAULT_NARRATION_PLAYBACK_RATE_PERCENT_V1;
    this.#playbackPreferenceStatus = "ready";
    this.#publish();
    return true;
  }

  async #hydrateStartPreference(): Promise<void> {
    if (this.#startPreferenceStatus !== "loading") {
      return;
    }
    if (this.#startPreferenceHydration !== undefined) {
      return this.#startPreferenceHydration;
    }
    const hydration = this.#startPreferenceRepository
      .read()
      .then((result) => {
        if (this.#closed) {
          return;
        }
        this.#selection = result.selection;
        this.#startPreferenceStatus = result.status;
        this.#canPersistStartPreference =
          result.status !== "unsupported-version";
        this.#publish();
      })
      .catch(() => {
        if (this.#closed) {
          return;
        }
        this.#selection = DEFAULT_NARRATION_START_PREFERENCE_V1;
        this.#startPreferenceStatus = "unavailable";
        this.#canPersistStartPreference = true;
        this.#publish();
      });
    this.#startPreferenceHydration = hydration;
    await hydration;
  }

  async #hydratePlaybackPreference(): Promise<void> {
    if (this.#playbackPreferenceStatus !== "loading") {
      return;
    }
    if (this.#playbackPreferenceHydration !== undefined) {
      return this.#playbackPreferenceHydration;
    }
    const hydration = this.#playbackPreferenceRepository
      .read()
      .then((result) => {
        if (this.#closed) {
          return;
        }
        this.#playbackRatePercent = result.playbackRatePercent;
        this.#playbackPreferenceStatus = result.status;
        this.#canPersistPlaybackPreference =
          result.status !== "unsupported-version";
        this.#publish();
      })
      .catch(() => {
        if (this.#closed) {
          return;
        }
        this.#playbackRatePercent = DEFAULT_NARRATION_PLAYBACK_RATE_PERCENT_V1;
        this.#playbackPreferenceStatus = "unavailable";
        this.#canPersistPlaybackPreference = true;
        this.#publish();
      });
    this.#playbackPreferenceHydration = hydration;
    await hydration;
  }

  public updateVisibleLocator(locator: ReadingLocatorV1): void {
    if (
      this.#closed ||
      this.#pendingNavigation !== undefined ||
      sameLocator(locator, this.#visibleLocator)
    ) {
      return;
    }
    this.#visibleLocator = locator;
    if (this.#playIntent === "inactive") {
      this.#activeLocator = locator;
    }
  }

  public async beginExternalNavigation(
    event: "chapter-navigation",
  ): Promise<void> {
    if (this.#closed || this.#playIntent === "inactive") {
      return;
    }
    const pending = this.#beginNavigation(event);
    await pending.stop;
  }

  public settleReaderPlacement(
    settlement: import("../reader/reader-navigation").ReaderNavigationSettlement,
  ): void {
    if (this.#closed) return;
    this.#readerPlacementAvailable = settlement.status === "settled";
    if (!this.#readerPlacementAvailable) {
      this.#navigationRevision += 1;
      this.#pendingNavigation = undefined;
      this.#pausedNavigationState = undefined;
      this.#audibleRange = undefined;
      this.#playIntent = "inactive";
      if (this.#scheduler !== undefined) void this.stop();
    }
    this.#publish();
  }

  public settleExternalNavigation(locator: ReadingLocatorV1): void {
    if (this.#closed) {
      return;
    }
    const pending = this.#pendingNavigation;
    if (pending === undefined) {
      this.#activeLocator = locator;
      this.#visibleLocator = locator;
      return;
    }
    pending.target = locator;
    void this.#finishNavigation(pending.revision);
  }

  public preserveActiveLocator(locator: ReadingLocatorV1): void {
    if (this.#closed || this.#pendingNavigation !== undefined) {
      return;
    }
    this.#activeLocator = locator;
    this.#visibleLocator = locator;
  }

  public startAtVisibleLocator(): void {
    if (
      this.#closed ||
      !this.#readerPlacementAvailable ||
      this.#availability !== "available" ||
      this.#recovery.observe().phase !== "operational"
    ) {
      return;
    }
    if (this.#playIntent === "inactive" && this.#scheduler === undefined) {
      this.#activeLocator = this.#visibleLocator;
      this.start();
      return;
    }
    const pending = this.#beginNavigation("explicit-visual-navigation", true);
    pending.target = this.#visibleLocator;
    void this.#finishNavigation(pending.revision);
  }

  public startAtLocator(locator: ReadingLocatorV1): boolean {
    if (
      this.#closed ||
      !this.#readerPlacementAvailable ||
      this.#availability !== "available" ||
      this.#recovery.observe().phase !== "operational" ||
      this.#pendingNavigation !== undefined ||
      !sameBookIdentity(locator.bookIdentity, this.#publication.book.identity)
    ) {
      return false;
    }
    let target: ReadingLocatorV1;
    try {
      target =
        this.#publication.resolveLocator(locator).locatedBlock.startLocator;
    } catch {
      return false;
    }

    let pending: PendingNavigation;
    if (this.#playIntent === "inactive" && this.#scheduler === undefined) {
      this.#navigationRevision += 1;
      pending = {
        revision: this.#navigationRevision,
        event: "explicit-visual-navigation",
        priorIntent: "playing",
        restart: true,
        stop: Promise.resolve(),
        target,
      };
      this.#playIntent = "playing";
      this.#pendingNavigation = pending;
      this.#publish();
    } else {
      pending = this.#beginNavigation("explicit-visual-navigation", true);
      pending.target = target;
    }
    void pending.stop.then(() => {
      if (this.#closed || this.#pendingNavigation !== pending) {
        return;
      }
      const request = Object.freeze({
        event: "paragraph-leaf" as const,
        locator: target,
      });
      for (const listener of this.#navigationListeners) {
        try {
          listener(request);
        } catch {
          // Reader placement failure leaves the invalidated run contained.
        }
      }
    });
    return true;
  }

  public goToPreviousBoundary(): void {
    this.#requestBoundaryNavigation("previous-segment");
  }

  public goToNextBoundary(): void {
    this.#requestBoundaryNavigation("next-segment");
  }

  public start(): void {
    if (
      this.#closed ||
      !this.#readerPlacementAvailable ||
      this.#availability !== "available" ||
      this.#scheduler !== undefined ||
      this.#recovery.observe().phase !== "operational"
    ) {
      return;
    }
    this.#startRun();
  }

  public recover(): void {
    if (
      this.#closed ||
      !this.#readerPlacementAvailable ||
      this.#availability !== "available" ||
      this.#scheduler !== undefined ||
      !this.#recovery.observe().canRecover ||
      this.#recovery.observe().action === "select-compatible-profile"
    ) {
      return;
    }
    this.#recovery.requestRecovery();
    this.#activeLocator = this.#latestHeardLocator;
    this.#visibleLocator = this.#latestHeardLocator;
    this.#publish();
    this.#startRun();
  }

  /**
   * Explicit compatibility work starts a new bounded failure episode. It
   * never starts narration and is ignored while containment is still active.
   */
  public resetRecoveryEpisode(): void {
    if (this.#closed || this.#recoveryResetPending) {
      return;
    }
    if (
      this.#stopOperation !== undefined ||
      (this.#recovery.observe().phase === "contained" &&
        (this.#player !== undefined || this.#scheduler !== undefined))
    ) {
      this.#recoveryResetPending = true;
      this.#availability = "checking";
      this.#publish();
      const stop = this.#stopOperation ?? this.#stopActiveRun();
      void stop.finally(() => {
        if (
          !this.#closed &&
          this.#stopOperation === undefined &&
          this.#recoveryResetPending
        ) {
          this.#recoveryResetPending = false;
          if (this.#player !== undefined || this.#scheduler !== undefined) {
            this.#availability = "unavailable";
            this.#publish();
            return;
          }
          this.resetRecoveryEpisode();
        }
      });
      return;
    }
    try {
      this.#recovery.resetEpisode();
      this.#bufferingMs = 0;
      this.#playbackMs = 0;
      this.#intentionalWaitMs = 0;
      this.#underrunCount = 0;
      const player = this.#player?.synchronize();
      this.#lastPlayerUnderrunCount = player?.underrunCount ?? 0;
      this.#lastPlayerIntentionalWaitMs =
        player?.intentionalTransitionPauseMs ?? 0;
      this.#lastMetricsAtMs = this.#clock.nowMs;
      this.#failure = undefined;
      this.#preparationFailure = undefined;
      this.#terminalState = undefined;
      this.#availability = "checking";
      this.#publish();
      void this.checkAvailability();
    } catch {
      // Compatibility UI cannot bypass active cleanup or recovery.
    }
  }

  #startRun(): void {
    this.#pendingNavigation = undefined;
    this.#pausedNavigationState = undefined;
    this.#playIntent = "playing";
    if (this.#recovery.observe().phase === "operational") {
      this.#failure = undefined;
    }
    this.#terminalState = undefined;
    this.#preparationFailure = undefined;
    this.#estimator.reset();
    this.#prepared.clear();
    this.#continuation = this.#activeLocator;
    this.#nextSequence = 0;
    this.#acceptedAudioUnitCount = 0;
    this.#acceptedAudioSampleFrames = 0;
    // Interruption totals belong to the recovery episode, not to this player.
    // Only resetRecoveryEpisode clears them; Stop/Play and recovery replace owners.
    this.#lastPlayerUnderrunCount = 0;
    this.#lastPlayerIntentionalWaitMs = 0;
    this.#commandToAudibleMs = undefined;
    this.#commandStartedAtMs = this.#clock.nowMs;
    this.#lastMetricsAtMs = this.#clock.nowMs;
    this.#lastPlayerPhase = "preparing";
    this.#lastPlayerAudible = false;
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
      this.#playbackRatePercent,
    );
    this.#player = this.#createPlayer(this.#scheduler);
    this.#player.setVolumePercent(this.#volumePercent);
    this.#playerAudibleUnsubscribe = this.#player.subscribeAudibleProgress(
      (observation) => {
        if (
          observation.sessionId === this.#identity?.sessionId &&
          observation.generationId === this.#identity.generationId
        ) {
          if (observation.kind === "segment-started") {
            try {
              if (this.#player !== undefined) {
                this.#updateMetrics(this.#player.observe());
              }
            } catch {
              // Metrics cannot suppress the authoritative audible boundary.
            }
            this.#audibleRange = observation.sourceRange;
            this.#activeLocator = observation.sourceRange.start;
            this.#rememberBoundary(observation.sourceRange);
            this.#scheduler?.forEachBufferedSourceRange((range) =>
              this.#rememberBoundary(range),
            );
            for (const entry of this.#prepared.values())
              this.#rememberBoundary(entry.contract.sourceRange);
            this.#visibleLocator = observation.sourceRange.start;
            this.#latestHeardLocator = observation.sourceRange.start;
            this.#publish();
          } else if (observation.kind === "segment-completed") {
            this.#latestHeardLocator = observation.sourceRange.end;
          }
          for (const listener of this.#audibleProgressListeners) {
            try {
              listener(observation);
            } catch {
              // A synchronization observer cannot interrupt narration.
            }
          }
        }
      },
    );
    this.#tickHandle = this.#setInterval(() => {
      this.#tick(runToken);
    }, TICK_INTERVAL_MS);
    this.#publish();
    this.#requestPump(runToken);
  }

  public playAvailableAudio(): boolean {
    if (
      this.#closed ||
      this.#playIntent !== "playing" ||
      this.#pendingNavigation !== undefined ||
      this.#player === undefined ||
      this.#scheduler?.playAvailableAudio() !== true
    ) {
      return false;
    }
    this.#tick(this.#runToken);
    return true;
  }

  public pause(): void {
    try {
      if (this.#scheduler === undefined || this.#player === undefined) {
        return;
      }
      this.#player?.pause();
      this.#playIntent = "paused";
      this.#tick(this.#runToken);
    } catch {
      this.#fail(
        "audio-playback-failed",
        this.#runToken,
        "playback",
        undefined,
      );
    }
  }

  public resume(): void {
    try {
      if (
        this.#scheduler === undefined &&
        this.#playIntent === "paused" &&
        this.#pendingNavigation === undefined
      ) {
        this.#playIntent = "playing";
        this.start();
        return;
      }
      this.#player?.resume();
      if (this.#scheduler !== undefined) {
        this.#playIntent = "playing";
      }
      this.#tick(this.#runToken);
    } catch {
      this.#fail(
        "audio-playback-failed",
        this.#runToken,
        "playback",
        undefined,
      );
    }
  }

  public setVolumePercent(volumePercent: number): void {
    if (this.#closed) {
      return;
    }
    try {
      if (this.#player === undefined) {
        const bounds = ADAPTIVE_BUFFER_AUTHORITY_V1.playback;
        if (
          !Number.isInteger(volumePercent) ||
          volumePercent < bounds.minimumVolumePercent ||
          volumePercent > bounds.maximumVolumePercent
        ) {
          return;
        }
      }
      this.#player?.setVolumePercent(volumePercent);
      this.#volumePercent = volumePercent;
      if (this.#terminalState !== undefined) {
        this.#terminalState = Object.freeze({
          ...this.#terminalState,
          volumePercent,
        });
      }
      if (this.#pausedNavigationState !== undefined) {
        this.#pausedNavigationState = Object.freeze({
          ...this.#pausedNavigationState,
          volumePercent,
        });
      }
      this.#publish();
    } catch {
      this.#fail(
        "audio-playback-failed",
        this.#runToken,
        "playback",
        undefined,
      );
    }
  }

  public async stop(): Promise<void> {
    this.#playIntent = "inactive";
    this.#pendingNavigation = undefined;
    this.#pausedNavigationState = undefined;
    if (this.#failure === "narration-preparation-failed") {
      this.#failure = undefined;
      this.#preparationFailure = undefined;
      this.#terminalState = undefined;
    }
    await this.#stopActiveRun();
  }

  public async stopForConfigurationChange(): Promise<void> {
    await this.stop();
    try {
      await this.#client.shutdown();
    } catch {
      // Identity and retained audio were invalidated before containment.
    }
    this.#publish();
  }

  #stopActiveRun(): Promise<void> {
    if (this.#recoveryOperation !== undefined) {
      return this.#recoveryOperation;
    }
    if (this.#stopOperation !== undefined) {
      return this.#stopOperation;
    }
    const stop = this.#performStopActiveRun();
    this.#stopOperation = stop;
    void stop.finally(() => {
      if (this.#stopOperation === stop) {
        this.#stopOperation = undefined;
      }
    });
    return stop;
  }

  async #performStopActiveRun(): Promise<void> {
    if (this.#scheduler === undefined || this.#player === undefined) {
      this.#terminalState = undefined;
      this.#failure = undefined;
      this.#preparationFailure = undefined;
      this.#publish();
      return;
    }
    const operation = this.#operation;
    const scope = this.#activeScope;
    const cleanupDeadline =
      this.#clock.nowMs +
      HARDWARE_PROFILE_AUTHORITY_V1.cleanup.finalCleanupMaximumMs;
    const stopToken = ++this.#runToken;
    this.#identity = undefined;
    this.#preparationAbort?.abort();
    this.#preparationAbort = undefined;
    const player = this.#player;
    this.#captureFinalMetrics(player);
    const transition = player.close();
    this.#playerAudibleUnsubscribe?.();
    this.#playerAudibleUnsubscribe = undefined;
    this.#stopTicker();
    this.#prepared.clear();
    this.#continuation = undefined;
    this.#activeScope = undefined;
    this.#audibleRange = undefined;
    this.#publish();
    let cleanupFailed = false;
    try {
      if (transition === "cancel" && scope !== undefined) {
        await this.#withinCleanupDeadline(
          this.#client.cancel(scope),
          Math.min(
            cleanupDeadline,
            this.#clock.nowMs +
              HARDWARE_PROFILE_AUTHORITY_V1.cleanup
                .processTreeTerminationMaximumMs,
          ),
        );
      } else {
        await this.#withinCleanupDeadline(
          this.#client.shutdown(),
          cleanupDeadline,
        );
      }
    } catch (error) {
      // The typed client deliberately preserves this cancellation error after
      // validated shutdown when native synthesis completed first.
      const completionRace =
        error instanceof TtsProcessClientError &&
        error.code === "tts-service-invalid-state";
      cleanupFailed = !completionRace;
      try {
        await this.#withinCleanupDeadline(
          this.#client.shutdown(),
          cleanupDeadline,
        );
      } catch {
        cleanupFailed = true;
      }
    }
    try {
      await this.#withinCleanupDeadline(
        Promise.all([
          operation?.catch(() => undefined) ?? Promise.resolve(),
          player.waitForCleanup(),
        ]),
        cleanupDeadline,
      );
      const service = this.#client.observe();
      if (
        service.state !== "stopped" ||
        service.serviceInstanceId !== undefined ||
        service.hasActiveGeneration ||
        service.retainedAudioUnits !== 0
      ) {
        cleanupFailed = true;
      }
    } catch {
      cleanupFailed = true;
    }
    if (this.#operation === operation) {
      this.#operation = undefined;
    }
    if (this.#runToken !== stopToken) {
      return;
    }
    try {
      this.#scheduler.settleServiceStop();
    } catch {
      // A failed operation may already have settled the service boundary.
    }
    if (cleanupFailed) {
      this.#failure = "tts-service-failed";
      this.#availability = "unavailable";
      this.#terminalState = this.#stateFromActiveOwners();
      if (this.#recovery.observe().phase === "operational") {
        this.#recovery.detectFailure("cleanup-failed", this.#profileId);
        this.#recovery.markIdentityInvalidated();
        this.#recovery.markPlaybackAndPreparationReleased();
        this.#recovery.markServiceContained();
        this.#recovery.markCleanupFailed("cleanup-failed");
      } else if (this.#recovery.observe().phase === "recovering") {
        this.#recovery.markRecoveryFailed();
      }
      this.#publish();
      return;
    }
    // Successful teardown releases ownership, not the explanation of why it
    // happened. Explicit Stop/reset or a new start dismisses preparation errors.
    this.#terminalState =
      this.#failure === "narration-preparation-failed"
        ? this.#stateFromActiveOwners()
        : undefined;
    if (this.#failure !== "narration-preparation-failed") {
      this.#failure = undefined;
      this.#preparationFailure = undefined;
    }
    this.#scheduler = undefined;
    this.#player = undefined;
    if (this.#recovery.observe().phase === "recovering") {
      // Explicit interruption completed the same verified containment boundary.
      // Keep the spent attempt; only an explicit Settings action resets it.
      this.#recovery.markRecoverySucceeded();
    }
    this.#publish();
  }

  public close(): Promise<void> {
    if (this.#closeOperation !== undefined) return this.#closeOperation;
    this.#closed = true;
    this.#playIntent = "inactive";
    this.#pendingNavigation = undefined;
    this.#closeOperation = this.stop().then(() => {
      this.#listeners.clear();
      this.#audibleProgressListeners.clear();
      this.#navigationListeners.clear();
    });
    return this.#closeOperation;
  }

  #beginNavigation(
    event: ProductNarrationNavigationEvent,
    forceRestart = false,
  ): PendingNavigation {
    const existing = this.#pendingNavigation;
    if (existing !== undefined) {
      if (forceRestart) {
        existing.restart = true;
      }
      return existing;
    }
    if (this.#playIntent === "inactive" && !forceRestart) {
      throw new Error("content-free-navigation-state");
    }
    this.#navigationRevision += 1;
    // Explicit restart must contain the retained completed run before replacement.
    const priorIntent =
      this.#playIntent === "inactive" ? "playing" : this.#playIntent;
    this.#playIntent = priorIntent;
    this.#pausedNavigationState =
      priorIntent === "paused"
        ? this.#pausedStateFrom(this.#snapshot.state)
        : undefined;
    const pending: PendingNavigation = {
      revision: this.#navigationRevision,
      event,
      priorIntent,
      restart: forceRestart || priorIntent === "playing",
      stop: Promise.resolve(),
      target: undefined,
    };
    const stop = this.#stopActiveRun();
    const active = Object.assign(pending, { stop });
    this.#pendingNavigation = active;
    this.#publish();
    return active;
  }

  async #finishNavigation(revision: number): Promise<void> {
    const pending = this.#pendingNavigation;
    if (pending === undefined || pending.revision !== revision) {
      return;
    }
    await pending.stop;
    if (
      this.#closed ||
      this.#pendingNavigation !== pending ||
      pending.target === undefined
    ) {
      return;
    }
    this.#activeLocator = pending.target;
    this.#visibleLocator = pending.target;
    this.#pendingNavigation = undefined;
    if (pending.restart) {
      this.#playIntent = "playing";
      this.start();
      return;
    }
    this.#playIntent = "paused";
    this.#terminalState = this.#pausedNavigationState;
    this.#pausedNavigationState = undefined;
    this.#publish();
  }

  #pausedStateFrom(
    state: AdaptivePreparationUiState | undefined,
  ): AdaptivePreparationUiState | undefined {
    if (state === undefined) {
      return undefined;
    }
    return Object.freeze({
      mode: this.#selection,
      phase: "paused",
      readyMs: 0,
      targetMs: state.targetMs,
      progressValueMs: 0,
      estimatedWaitMs: undefined,
      lowBuffer: false,
      allRemainingAudioReady: false,
      resourceCeilingReached: false,
      pauseContinuesPreparation: false,
      canPlayAvailableAudio: false,
      canPause: false,
      canResume: true,
      canStop: true,
      volumePercent: this.#volumePercent,
      playbackRate: this.#playbackRatePercent / 100,
      selectedPlaybackRatePercent: this.#playbackRatePercent,
      activePlaybackRatePercent: null,
      pendingPlaybackRatePercent: null,
    });
  }

  #requestBoundaryNavigation(event: "next-segment" | "previous-segment"): void {
    if (this.#closed || this.#playIntent === "inactive") {
      return;
    }
    const currentIndex = this.#currentBoundaryIndex();
    const targetIndex =
      currentIndex === undefined
        ? undefined
        : currentIndex + (event === "previous-segment" ? -1 : 1);
    const target =
      targetIndex === undefined
        ? undefined
        : this.#knownBoundaries[targetIndex];
    if (target === undefined) {
      return;
    }
    const pending = this.#beginNavigation(event);
    pending.target = target.start;
    void pending.stop.then(() => {
      if (this.#closed || this.#pendingNavigation !== pending) {
        return;
      }
      const request = Object.freeze({ event, locator: target.start });
      for (const listener of this.#navigationListeners) {
        try {
          listener(request);
        } catch {
          // Reader placement failure leaves the invalidated run contained.
        }
      }
    });
  }

  #preparationContext(profileId: string, language: string): string {
    const profile = isPiperProfile(profileId)
      ? "narration-piper-v2"
      : isChatterboxProfile(profileId)
        ? "narration-chatterbox-v1"
        : "narration-bilingual-v2";
    return `${profile}:${language}`;
  }

  #selectSegmentationContext(profileId: string, language: string): void {
    const context = this.#preparationContext(profileId, language);
    if (this.#segmentationContext === context) return;
    this.#segmentationContext = context;
    this.#knownBoundaries.length = 0;
    this.#audibleRange = undefined;
  }

  #currentBoundaryIndex(): number | undefined {
    if (this.#audibleRange !== undefined) {
      const exact = this.#knownBoundaries.findIndex((candidate) =>
        sameRange(candidate, this.#audibleRange!),
      );
      if (exact >= 0) {
        return exact;
      }
    }
    const containing = this.#knownBoundaries.findIndex((candidate) =>
      containsLocator(candidate, this.#activeLocator),
    );
    return containing >= 0 ? containing : undefined;
  }

  #rememberBoundary(range: LocatorRangeV1): void {
    if (
      this.#knownBoundaries.some((candidate) => sameRange(candidate, range))
    ) {
      return;
    }
    this.#knownBoundaries.push(range);
    this.#knownBoundaries.sort((left, right) =>
      compareLocatorPosition(left.start, right.start),
    );
    if (this.#knownBoundaries.length > NAVIGATION_BOUNDARY_LIMIT) {
      const current = this.#currentBoundaryIndex();
      // Keep current/next and a bounded recent past. Distant preparation can
      // be borrowed again from the FIFO when the audible range advances.
      if (current !== undefined && current > NAVIGATION_BOUNDARY_LIMIT / 2) {
        this.#knownBoundaries.shift();
      } else {
        this.#knownBoundaries.pop();
      }
    }
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
        case "start-service": {
          const expectedProfileId =
            this.#profileCompatibility?.activeProfileId?.() ?? this.#profileId;
          const expectedLanguage =
            this.#profileCompatibility?.activeLanguage?.() ?? this.#language;
          const freshObservation = this.#profileCompatibility?.check;
          if (freshObservation !== undefined) {
            await this.#profileCompatibility!.check!("before-profile-start");
            if (
              this.#closed ||
              runToken !== this.#runToken ||
              scheduler !== this.#scheduler
            )
              return;
          }
          const selectedProfileId =
            this.#profileCompatibility?.activeProfileId?.();
          const profileId =
            this.#profileCompatibility === undefined
              ? this.#profileId
              : selectedProfileId;
          const language =
            this.#profileCompatibility?.activeLanguage?.() ?? this.#language;
          if (profileId === undefined) {
            if (runToken === this.#runToken) {
              this.#availability = "unavailable";
              this.#fail(
                "tts-profile-unavailable",
                runToken,
                "start-service",
                undefined,
              );
            }
            return;
          }
          const hardwareAllowed =
            this.#profileCompatibility === undefined ||
            (freshObservation !== undefined
              ? this.#profileCompatibility.isProfileCurrentlyAllowed(
                  profileId,
                ) === true &&
                profileId === expectedProfileId &&
                language === expectedLanguage
              : await this.#profileCompatibility.isProfileStartAllowed(
                  profileId,
                  "before-profile-start",
                  language,
                ));
          const selectionMatches = () =>
            (this.#profileCompatibility?.activeProfileId === undefined ||
              this.#profileCompatibility.activeProfileId() === profileId) &&
            (this.#profileCompatibility?.activeLanguage === undefined ||
              this.#profileCompatibility.activeLanguage() === language);
          if (
            this.#closed ||
            runToken !== this.#runToken ||
            scheduler !== this.#scheduler
          )
            return;
          const configurationAvailable =
            hardwareAllowed &&
            selectionMatches() &&
            (await this.#client.profileConfigurationAvailability(profileId)) ===
              "available";
          if (
            this.#closed ||
            runToken !== this.#runToken ||
            scheduler !== this.#scheduler
          )
            return;
          if (!configurationAvailable || !selectionMatches()) {
            if (runToken === this.#runToken) {
              this.#availability = "unavailable";
              this.#fail(
                "tts-profile-unavailable",
                runToken,
                "start-service",
                undefined,
              );
            }
            return;
          }
          scheduler.beginServiceStart();
          this.#publish();
          this.#profileId = profileId;
          this.#language = language;
          this.#selectSegmentationContext(profileId, language);
          await this.#client.start(profileId, language);
          if (runToken === this.#runToken) {
            scheduler.markServiceStarted();
          }
          break;
        }
        case "prepare-service":
          scheduler.beginServicePrepare();
          this.#publish();
          await this.#client.prepare();
          if (runToken === this.#runToken) {
            scheduler.markServiceReady();
            if (this.#recovery.observe().phase === "recovering") {
              this.#recovery.markRecoverySucceeded();
              this.#failure = undefined;
              this.#preparationFailure = undefined;
            }
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
    } catch (error) {
      if (runToken !== this.#runToken) {
        return;
      }
      if (action.kind === "prepare-narration") {
        scheduler.failNarrationPreparation();
        this.#failPreparation(runToken);
      } else if (action.kind === "synthesize") {
        scheduler.failActiveSynthesis();
        this.#fail("tts-service-failed", runToken, "synthesize", error);
      } else {
        scheduler.failServiceTransition();
        this.#fail("tts-service-failed", runToken, action.kind, error);
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
        profile: isPiperProfile(this.#profileId)
          ? "narration-piper-v2"
          : isChatterboxProfile(this.#profileId)
            ? "narration-chatterbox-v1"
            : "narration-bilingual-v2",
        defaultLanguage: this.#language,
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
      this.#preparationFailure = result.status;
      throw new Error("content-free-preparation-failure");
    }
    this.#preparationFailure = undefined;
    const preparedSegments = isPiperProfile(this.#profileId)
      ? result.segments.filter(isPiperSpeakableSegment)
      : result.segments;
    if (preparedSegments.length === 0) {
      scheduler.acceptEmptyPreparedRange(result.status === "complete");
      this.#continuation =
        result.status === "batch" ? result.continuation : undefined;
      return;
    }
    if (this.#identity === undefined || this.#prepared.size !== 0) {
      throw new Error("content-free-preparation-state");
    }
    const entries = preparedSegments.map((prepared) => {
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
      this.#rememberBoundary(entry.contract.sourceRange);
    }
    scheduler.acceptPreparedBatch({
      complete: result.status === "complete",
      segments: entries.map(({ contract, prepared }) =>
        Object.freeze({
          segmentId: contract.segmentId,
          sequence: contract.sequence,
          sourceRange: contract.sourceRange,
          narrationCodePoints: prepared.measurements.narrationCodePoints,
          narrationUtf8Bytes: prepared.measurements.narrationUtf8Bytes,
          sentenceCount: prepared.measurements.sentenceCount,
          transitionPauseMs:
            playbackTransitionPauseMsForPreparedSegment(prepared),
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
      if (player.state === "failed") {
        this.#fail("audio-playback-failed", runToken, "playback", undefined);
        return;
      }
      this.#updateMetrics(player);
      if (player.state === "complete") {
        this.#playIntent = "inactive";
      }
      this.#publish();
      this.#requestPump(runToken);
    } catch (error) {
      this.#fail("audio-playback-failed", runToken, "playback", error);
    }
  }

  #updateMetrics(player: AdaptivePcmPlayerObservation): void {
    const nowMs = this.#clock.nowMs;
    const intentionalWaitDelta = Math.max(
      0,
      player.intentionalTransitionPauseMs - this.#lastPlayerIntentionalWaitMs,
    );
    if (this.#lastMetricsAtMs !== undefined && nowMs >= this.#lastMetricsAtMs) {
      const elapsed = nowMs - this.#lastMetricsAtMs;
      if (this.#lastPlayerPhase === "buffering") {
        this.#bufferingMs += elapsed;
      } else if (this.#lastPlayerAudible) {
        this.#playbackMs += Math.max(0, elapsed - intentionalWaitDelta);
      }
    }
    this.#intentionalWaitMs += intentionalWaitDelta;
    this.#underrunCount += Math.max(
      0,
      player.underrunCount - this.#lastPlayerUnderrunCount,
    );
    this.#lastPlayerUnderrunCount = player.underrunCount;
    const audible =
      player.state === "playing" && player.activeSequence !== undefined;
    if (
      audible &&
      this.#commandToAudibleMs === undefined &&
      this.#commandStartedAtMs !== undefined
    ) {
      this.#commandToAudibleMs = Math.max(0, nowMs - this.#commandStartedAtMs);
    }
    this.#lastMetricsAtMs = nowMs;
    this.#lastPlayerPhase = player.state;
    this.#lastPlayerAudible = audible;
    this.#lastPlayerIntentionalWaitMs = player.intentionalTransitionPauseMs;
  }

  #captureFinalMetrics(player: AdaptivePcmPlayer | undefined): void {
    try {
      if (player !== undefined) this.#updateMetrics(player.observe());
    } catch {
      // Diagnostic observation must never prevent owner invalidation/cleanup.
    } finally {
      this.#lastMetricsAtMs = undefined;
    }
  }

  #fail(
    code: ProductNarrationFailureCode,
    runToken: number,
    action: "playback" | "prepare-service" | "start-service" | "synthesize",
    error: unknown,
  ): void {
    if (runToken !== this.#runToken || this.#recoveryOperation !== undefined) {
      return;
    }
    this.#failure = code;
    this.#terminalState = this.#stateFromActiveOwners();
    const recoveryCode = classifyOperationalFailure(code, action, error);
    const wasRecovering = this.#recovery.observe().phase === "recovering";
    if (!wasRecovering) {
      if (this.#recovery.observe().phase !== "operational") {
        return;
      }
      this.#recovery.detectFailure(recoveryCode, this.#profileId);
    }
    const operation = this.#containOperationalFailure(wasRecovering);
    this.#recoveryOperation = operation;
    void operation.finally(() => {
      if (this.#recoveryOperation === operation) {
        this.#recoveryOperation = undefined;
      }
    });
  }

  async #containOperationalFailure(wasRecovering: boolean): Promise<void> {
    const cleanupDeadline =
      this.#clock.nowMs +
      HARDWARE_PROFILE_AUTHORITY_V1.cleanup.finalCleanupMaximumMs;
    const operation = this.#operation;
    const scope = this.#activeScope;
    const scheduler = this.#scheduler;
    const player = this.#player;
    const containmentToken = ++this.#runToken;
    this.#captureFinalMetrics(player);
    this.#identity = undefined;
    if (!wasRecovering) {
      this.#recovery.markIdentityInvalidated();
    }
    this.#playIntent = "inactive";
    this.#pendingNavigation = undefined;
    const transition = player?.close();
    this.#playerAudibleUnsubscribe?.();
    this.#playerAudibleUnsubscribe = undefined;
    this.#stopTicker();
    this.#prepared.clear();
    this.#preparationAbort?.abort();
    this.#preparationAbort = undefined;
    this.#continuation = undefined;
    this.#activeScope = undefined;
    this.#audibleRange = undefined;
    if (!wasRecovering) {
      this.#recovery.markPlaybackAndPreparationReleased();
    }
    this.#publish();

    let cleanupFailure: "cancellation-timeout" | "cleanup-failed" | undefined;
    const terminationMaximumMs =
      HARDWARE_PROFILE_AUTHORITY_V1.cleanup.processTreeTerminationMaximumMs;
    try {
      if (transition === "cancel" && scope !== undefined) {
        await this.#withinCleanupDeadline(
          this.#client.cancel(scope),
          Math.min(cleanupDeadline, this.#clock.nowMs + terminationMaximumMs),
          "cancellation-timeout",
        );
      }
      if (operation !== undefined) {
        await this.#withinCleanupDeadline(
          operation.catch(() => undefined),
          cleanupDeadline,
        );
      }
      await this.#withinCleanupDeadline(
        this.#client.shutdown(),
        Math.min(cleanupDeadline, this.#clock.nowMs + terminationMaximumMs),
      );
    } catch (error) {
      cleanupFailure =
        (error instanceof ProductNarrationRecoveryError &&
          error.recoveryCode === "cancellation-timeout") ||
        (transition === "cancel" &&
          error instanceof TtsProcessClientError &&
          error.code === "tts-service-timeout")
          ? "cancellation-timeout"
          : "cleanup-failed";
      try {
        await this.#withinCleanupDeadline(
          this.#client.shutdown(),
          Math.min(cleanupDeadline, this.#clock.nowMs + terminationMaximumMs),
        );
      } catch {
        cleanupFailure ??= "cleanup-failed";
      }
    }
    if (containmentToken !== this.#runToken) {
      return;
    }
    if (!wasRecovering) {
      this.#recovery.markServiceContained();
      this.#publish();
    }

    try {
      if (player !== undefined) {
        await this.#withinCleanupDeadline(
          player.waitForCleanup(),
          cleanupDeadline,
        );
      }
      try {
        scheduler?.settleServiceStop();
      } catch {
        // A rejected scheduler operation may already be in stopped state.
      }
      const service = this.#client.observe();
      const scheduled = scheduler?.observe();
      const playback = player?.synchronize();
      const verified =
        cleanupFailure === undefined &&
        service.state === "stopped" &&
        service.serviceInstanceId === undefined &&
        !service.hasActiveGeneration &&
        service.retainedAudioUnits === 0 &&
        (scheduled === undefined ||
          (scheduled.retainedAudioUnitCount === 0 &&
            scheduled.discardedAudioUnitCount === 0 &&
            Object.values(scheduled.resourceSnapshot).every(
              (value) => value === 0,
            ))) &&
        (playback === undefined ||
          (playback.retainedAudioUnitCount === 0 &&
            playback.discardedAudioUnitCount === 0));
      if (!verified) {
        cleanupFailure ??= "cleanup-failed";
      }
    } catch {
      cleanupFailure ??= "cleanup-failed";
    }

    this.#scheduler = undefined;
    this.#player = undefined;
    if (this.#operation === operation) {
      this.#operation = undefined;
    }
    if (wasRecovering) {
      this.#recovery.markRecoveryFailed();
      this.#failure = "tts-service-failed";
    } else if (cleanupFailure !== undefined) {
      this.#recovery.markCleanupFailed(cleanupFailure);
    } else {
      this.#recovery.markCleanupVerified();
    }
    this.#publish();
  }

  async #within<T>(
    operation: Promise<T>,
    maximumMs: number,
    failureCode: "cancellation-timeout" | "cleanup-failed",
  ): Promise<T> {
    let timeout: ReturnType<typeof globalThis.setTimeout> | undefined;
    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timeout = globalThis.setTimeout(() => {
            reject(new ProductNarrationRecoveryError(failureCode));
          }, maximumMs);
        }),
      ]);
    } finally {
      if (timeout !== undefined) {
        globalThis.clearTimeout(timeout);
      }
    }
  }

  async #withinCleanupDeadline<T>(
    operation: Promise<T>,
    deadline: number,
    failureCode: "cancellation-timeout" | "cleanup-failed" = "cleanup-failed",
  ): Promise<T> {
    const remaining = deadline - this.#clock.nowMs;
    // Inclusive authority: exact deadline is admitted, maximum plus one fails.
    const result = await this.#within(
      operation,
      Math.max(0, remaining) + 1,
      failureCode,
    );
    if (this.#clock.nowMs > deadline)
      throw new ProductNarrationRecoveryError(failureCode);
    return result;
  }

  #failPreparation(runToken: number): void {
    if (runToken !== this.#runToken || this.#failure !== undefined) {
      return;
    }
    this.#failure = "narration-preparation-failed";
    this.#terminalState = this.#stateFromActiveOwners();
    this.#playIntent = "inactive";
    this.#pendingNavigation = undefined;
    this.#publish();
    void this.#stopActiveRun();
  }

  #stateFromActiveOwners(): AdaptivePreparationUiState | undefined {
    const scheduler = this.#scheduler;
    if (scheduler === undefined) {
      return undefined;
    }
    try {
      const player = this.#player?.observe();
      const projected = createAdaptivePreparationUiState({
        mode: this.#selection,
        scheduler: scheduler.observe(),
        ...(player === undefined
          ? {}
          : {
              intentionalBoundaryWait: player.intentionalTransitionPauseActive,
              volumePercent: player.volumePercent,
            }),
      });
      return Object.freeze({
        ...projected,
        phase: "failed",
        canPause: false,
        canResume: false,
        canPlayAvailableAudio: false,
        pauseContinuesPreparation: false,
      });
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
    const playerObservation =
      this.#failure === undefined ? player?.synchronize() : player?.observe();
    let state = this.#terminalState;
    if (
      state === undefined &&
      scheduler !== undefined &&
      playerObservation !== undefined
    ) {
      let estimatedWaitMs: number | undefined;
      try {
        estimatedWaitMs = this.#estimator.estimate({
          playableSampleFrames: scheduler.playableSampleFrames,
          targetMs: scheduler.targetBufferMs,
          targetSampleFrames:
            scheduler.effectiveListeningDurationMs >= scheduler.targetBufferMs
              ? scheduler.playableSampleFrames
              : scheduler.playableSampleFrames +
                minimumSourceSampleFramesForEffectiveListeningMillisecondsV3(
                  scheduler.targetBufferMs -
                    scheduler.effectiveListeningDurationMs,
                  scheduler.playbackRateState.selectedRatePercent,
                ),
          serviceState: scheduler.serviceState,
        })?.estimatedWaitMs;
      } catch {
        estimatedWaitMs = undefined;
      }
      state = createAdaptivePreparationUiState({
        mode: this.#selection,
        scheduler,
        ...(estimatedWaitMs === undefined ? {} : { estimatedWaitMs }),
        intentionalBoundaryWait:
          playerObservation.intentionalTransitionPauseActive,
        volumePercent: playerObservation.volumePercent,
      });
    }
    const currentBoundaryIndex = this.#currentBoundaryIndex();
    const navigationActive =
      this.#playIntent !== "inactive" &&
      this.#pendingNavigation === undefined &&
      currentBoundaryIndex !== undefined;
    return Object.freeze({
      availability: this.#availability,
      profileId: this.#profileId,
      language: this.#language,
      selection: this.#selection,
      startPreferenceStatus: this.#startPreferenceStatus,
      canPersistStartPreference: this.#canPersistStartPreference,
      playbackRatePercent: this.#playbackRatePercent,
      playbackPreferenceStatus: this.#playbackPreferenceStatus,
      canPersistPlaybackPreference: this.#canPersistPlaybackPreference,
      state,
      failure: this.#failure,
      preparationFailure: this.#preparationFailure,
      serviceState: this.#client.observe().state,
      metrics: Object.freeze({
        commandToAudibleMs: this.#commandToAudibleMs,
        bufferingMs: this.#bufferingMs,
        intentionalWaitMs:
          this.#intentionalWaitMs +
          Math.max(
            0,
            (playerObservation?.intentionalTransitionPauseMs ??
              this.#lastPlayerIntentionalWaitMs) -
              this.#lastPlayerIntentionalWaitMs,
          ),
        playbackMs: this.#playbackMs,
        underrunCount:
          this.#underrunCount +
          Math.max(
            0,
            (playerObservation?.underrunCount ??
              this.#lastPlayerUnderrunCount) - this.#lastPlayerUnderrunCount,
          ),
        acceptedAudioUnitCount: this.#acceptedAudioUnitCount,
        acceptedAudioSampleFrames: this.#acceptedAudioSampleFrames,
        retainedAudioUnitCount: scheduler?.retainedAudioUnitCount ?? 0,
        discardedAudioUnitCount: scheduler?.discardedAudioUnitCount ?? 0,
      }),
      navigation: Object.freeze({
        canStart: this.#readerPlacementAvailable,
        playIntent: this.#playIntent,
        settling: this.#pendingNavigation !== undefined,
        canGoPrevious: navigationActive && currentBoundaryIndex > 0,
        canGoNext:
          navigationActive &&
          currentBoundaryIndex < this.#knownBoundaries.length - 1,
      }),
      recovery: this.#recovery.observe(),
    });
  }

  #publish(): void {
    this.#snapshot = this.#createSnapshot();
    for (const listener of this.#listeners) {
      listener();
    }
  }
}
