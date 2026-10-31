import type {
  NarrationPreparationResult,
  OpenedPublication,
  PreparedNarrationSegment,
} from "@voxleaf/epub";
import { openEpubPublication } from "@voxleaf/epub";
import {
  createIndex,
  decodeLocatorRangeV1,
  decodeOperationalErrorV1,
  decodeReadingLocatorV1,
  type NarrationSegmentV1,
  type ReadingLocatorV1,
  type TtsServiceStateV1,
} from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { describe, expect, it, vi } from "vitest";

import type { NarrationStartPreferenceRepository } from "../persistence/narration-start-preference";
import type { NarrationPlaybackPreferenceRepository } from "../persistence/narration-playback-preference";
import { bindNarrationPositionPersistence } from "../persistence/narration-position-save-bridge";
import { ReaderPositionSaveCoordinator } from "../persistence/reader-position-save-coordinator";
import { ReaderPositionRestoreCoordinator } from "../persistence/reader-position-restore-coordinator";
import { createWebStorageReaderPositionRepository } from "../persistence/reader-position-repository";
import { createNarrationSettingsActions } from "../settings/narration-settings-actions";
import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
} from "./optional-chatterbox-client";

import type { AdaptiveBufferScheduler } from "./adaptive-buffer-scheduler";
import { loadedAudioStatusText } from "./adaptive-preparation-presentation";
import { bindHardwareCompatibilityChecks } from "./hardware-compatibility-check-binding";
import type { HardwareCompatibilitySnapshotV1 } from "./hardware-profile-compatibility";
import {
  AdaptivePcmPlayer,
  type PcmPlaybackBackend,
  type PcmPlaybackCallbacks,
  type PcmPlaybackHandle,
  type PcmPlaybackRequest,
  type TransitionPauseCanceller,
  type TransitionPauseScheduler,
} from "./pcm-playback";
import {
  ProductNarrationCoordinator,
  ProductNarrationRecoveryError,
  type ProductNarrationAudibleProgressObservation,
  type ProductNarrationClock,
  type ProductNarrationCoordinatorDependencies,
  type ProductNarrationNavigationRequest,
  type ProductNarrationProfileCompatibility,
  type ProductNarrationServiceClient,
} from "./product-narration-coordinator";
import type {
  TtsAudioUnit,
  TtsGenerationScope,
  TtsProcessClientObservation,
} from "./process-client";
import { TtsProcessClient, TtsProcessClientError } from "./process-client";

class ManualClock implements ProductNarrationClock {
  public nowMs = 0;

  public advance(milliseconds: number): void {
    this.nowMs += milliseconds;
  }
}

class FakePlaybackBackend implements PcmPlaybackBackend {
  public playedSampleFrames = 0;
  public active:
    | {
        readonly request: PcmPlaybackRequest;
        readonly callbacks: PcmPlaybackCallbacks;
      }
    | undefined;
  public closed = false;
  public ratePrepared = false;
  public readonly preparedRates: number[] = [];

  public start(
    request: PcmPlaybackRequest,
    callbacks: PcmPlaybackCallbacks,
  ): PcmPlaybackHandle {
    this.active = { request, callbacks };
    const playedSampleFrames = () => this.playedSampleFrames;
    this.playedSampleFrames = 0;
    return {
      sequence: request.sequence,
      get playedSampleFrames() {
        return playedSampleFrames();
      },
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      setVolumePercent: vi.fn(),
    };
  }

  public finish(): void {
    const active = this.active;
    this.active = undefined;
    active?.callbacks.ended();
  }

  public preparePlaybackRate(
    playbackRatePercent: 75 | 80 | 85 | 90 | 95 | 100,
  ): Promise<void> {
    this.preparedRates.push(playbackRatePercent);
    this.ratePrepared = true;
    return Promise.resolve();
  }

  public isPlaybackRatePrepared(
    playbackRatePercent: 75 | 80 | 85 | 90 | 95 | 100,
  ): boolean {
    return playbackRatePercent === 100 || this.ratePrepared;
  }

  public releasePlaybackRatePreparation(): void {
    this.ratePrepared = false;
  }

  public close(): void {
    this.closed = true;
    this.active = undefined;
  }
}

interface ManualTransitionTimer {
  readonly callback: () => void;
  readonly delayMs: number;
  cancelled: boolean;
}

class ManualTransitionTimers {
  readonly timers: ManualTransitionTimer[] = [];

  public readonly schedule: TransitionPauseScheduler = (callback, delayMs) => {
    const timer: ManualTransitionTimer = {
      callback,
      delayMs,
      cancelled: false,
    };
    this.timers.push(timer);
    return timer;
  };

  public readonly cancel: TransitionPauseCanceller = (handle) => {
    (handle as ManualTransitionTimer).cancelled = true;
  };

  public run(timer: ManualTransitionTimer): void {
    if (!timer.cancelled) {
      timer.callback();
    }
  }
}

class FakeServiceClient implements ProductNarrationServiceClient {
  public availability: "available" | "unavailable" = "available";
  public configurationAvailability: "available" | "unavailable" = "available";
  public state: TtsServiceStateV1 = "stopped";
  public readonly synthesized: NarrationSegmentV1[] = [];
  public readonly cancelled: TtsGenerationScope[] = [];
  public readonly startedProfiles: Array<string | undefined> = [];
  public readonly startedLanguages: Array<"es" | "en" | undefined> = [];
  public shutdownCount = 0;
  public synthesisSampleFrames = 360_000;
  public synthesisElapsedMs = 1_000;
  public blockSynthesis = false;
  public releaseCount = 0;
  readonly #clock: ManualClock;
  #unit: TtsAudioUnit | undefined;
  #settleBlocked:
    | {
        readonly resolve: () => void;
        readonly reject: () => void;
      }
    | undefined;

  public constructor(clock: ManualClock) {
    this.#clock = clock;
  }

  public async exactDemoAvailability() {
    return this.availability;
  }

  public async profileConfigurationAvailability() {
    return this.configurationAvailability;
  }

  public observe(): TtsProcessClientObservation {
    return Object.freeze({
      serviceInstanceId:
        this.state === "stopped" ? undefined : "service:product-test",
      state: this.state,
      hasActiveGeneration: this.state === "generating",
      retainedAudioUnits: this.#unit === undefined ? 0 : 1,
    });
  }

  public async start(
    profileId?: string,
    language?: "es" | "en",
  ): Promise<TtsProcessClientObservation> {
    this.startedProfiles.push(profileId);
    this.startedLanguages.push(language);
    this.state = "unloaded";
    return this.observe();
  }

  public async prepare(): Promise<TtsProcessClientObservation> {
    this.state = "ready";
    return this.observe();
  }

  public async synthesize(
    input: unknown,
  ): Promise<{ readonly sampleCountSamples: number }> {
    const segment = input as NarrationSegmentV1;
    this.synthesized.push(segment);
    this.state = "generating";
    if (this.blockSynthesis) {
      await new Promise<void>((resolve, reject) => {
        this.#settleBlocked = { resolve, reject };
      });
    }
    this.#clock.advance(this.synthesisElapsedMs);
    this.state = "ready";
    const payload = new Uint8Array(
      this.synthesisSampleFrames * Float32Array.BYTES_PER_ELEMENT,
    );
    let retained = payload;
    const metadata = Object.freeze({
      sessionId: segment.sessionId,
      generationId: segment.generationId,
      segmentId: segment.segmentId,
      sampleRateHz: 24_000 as const,
      channelCount: 1 as const,
      sampleFormat: "float32-le" as const,
      sampleCountSamples: this.synthesisSampleFrames,
      payloadBytes: payload.byteLength,
      endOfSegment: true as const,
    });
    this.#unit = Object.freeze({
      metadata,
      get payload() {
        return retained;
      },
      release: () => {
        retained.fill(0);
        retained = new Uint8Array();
        this.#unit = undefined;
        this.releaseCount += 1;
      },
    });
    return metadata;
  }

  public takeAudioUnit(): TtsAudioUnit | undefined {
    const unit = this.#unit;
    this.#unit = undefined;
    return unit;
  }

  public async cancel(scope: TtsGenerationScope): Promise<void> {
    this.cancelled.push(scope);
    this.state = "stopped";
    this.#unit?.release();
    this.#unit = undefined;
    this.#settleBlocked?.reject();
    this.#settleBlocked = undefined;
  }

  public async shutdown(): Promise<void> {
    this.shutdownCount += 1;
    this.state = "stopped";
    this.#unit?.release();
    this.#unit = undefined;
    this.#settleBlocked?.reject();
    this.#settleBlocked = undefined;
  }

  public completeBlockedSynthesis(): void {
    this.#settleBlocked?.resolve();
    this.#settleBlocked = undefined;
  }
}

const START_LOCATOR = decodeReadingLocatorV1(
  VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator,
);
const END_LOCATOR = decodeReadingLocatorV1({
  ...START_LOCATOR,
  textOffsetCodePoints: START_LOCATOR.textOffsetCodePoints + 12,
});
const SOURCE_RANGE = decodeLocatorRangeV1({
  schemaVersion: 1,
  start: START_LOCATOR,
  end: END_LOCATOR,
});

function sourceRange(startOffset: number, endOffset: number) {
  return decodeLocatorRangeV1({
    schemaVersion: 1,
    start: {
      ...START_LOCATOR,
      textOffsetCodePoints: startOffset,
    },
    end: {
      ...START_LOCATOR,
      textOffsetCodePoints: endOffset,
    },
  });
}

function preparedSegment(
  text: string,
  range = SOURCE_RANGE,
  sentenceCount = 1,
  boundaryReason: PreparedNarrationSegment["boundaryReason"] = "hard-limit",
): PreparedNarrationSegment {
  return Object.freeze({
    text: text as PreparedNarrationSegment["text"],
    sourceRange: range,
    boundaryReason,
    measurements: Object.freeze({
      sourceCodePoints: createIndex(12),
      narrationCodePoints: createIndex(Array.from(text).length),
      narrationUtf8Bytes: createIndex(new TextEncoder().encode(text).length),
      sentenceCount: createIndex(sentenceCount),
    }),
  });
}

function completeSegments(
  segments: readonly PreparedNarrationSegment[],
): NarrationPreparationResult {
  const narrationCodePoints = segments.reduce(
    (total, segment) => total + segment.measurements.narrationCodePoints,
    0,
  );
  const narrationUtf8Bytes = segments.reduce(
    (total, segment) => total + segment.measurements.narrationUtf8Bytes,
    0,
  );
  const sentenceCount = segments.reduce(
    (total, segment) => total + segment.measurements.sentenceCount,
    0,
  );
  return Object.freeze({
    status: "complete",
    start: Object.freeze({
      canonicalLocator: segments[0]?.sourceRange.start ?? START_LOCATOR,
      resolutionStatus: "exact",
      resolutionReason: "exact",
      segmentRelation: "at-segment-start",
    }),
    segments: Object.freeze([...segments]),
    measurements: Object.freeze({
      sourceCodePointsInspected: createIndex(segments.length * 12),
      narrationCodePoints: createIndex(narrationCodePoints),
      narrationUtf8Bytes: createIndex(narrationUtf8Bytes),
      segmentCount: createIndex(segments.length),
      sentenceCount: createIndex(sentenceCount),
      checkpointCount: createIndex(segments.length),
    }),
  });
}

function completeResult(
  text = "Private synthetic narration.",
): NarrationPreparationResult {
  const segment = preparedSegment(text);
  return completeSegments([segment]);
}

function batchSegments(
  segments: readonly PreparedNarrationSegment[],
  continuation = END_LOCATOR,
): NarrationPreparationResult {
  const complete = completeSegments(segments);
  if (complete.status !== "complete") {
    throw new Error("content-free-test-state");
  }
  return Object.freeze({
    ...complete,
    status: "batch",
    continuation,
  });
}

function createPublication(
  prepareNarration: OpenedPublication["prepareNarration"],
): OpenedPublication {
  return {
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
    documents: Object.freeze([]),
    locators: Object.freeze([]),
    defaultStartLocator: undefined,
    navigation: Object.freeze([]),
    resources: Object.freeze([]),
    closed: false,
    readResource: vi.fn(),
    resolveLocator: vi.fn((input: unknown) =>
      Object.freeze({
        status: "exact" as const,
        reason: "exact" as const,
        locator: input as ReadingLocatorV1,
        locatedBlock: Object.freeze({
          startLocator: START_LOCATOR,
        }) as ReturnType<OpenedPublication["resolveLocator"]>["locatedBlock"],
      }),
    ),
    resolveTarget: vi.fn(),
    prepareNarration,
    close: vi.fn(async () => undefined),
  };
}

function createHarness(
  options: {
    readonly result?: NarrationPreparationResult;
    readonly availability?: "available" | "unavailable";
    readonly configurationAvailability?: "available" | "unavailable";
    readonly blockSynthesis?: boolean;
    readonly prepareNarration?: OpenedPublication["prepareNarration"];
    readonly profileCompatibility?: ProductNarrationProfileCompatibility;
    readonly startPreferenceRepository?: NarrationStartPreferenceRepository;
    readonly playbackPreferenceRepository?: NarrationPlaybackPreferenceRepository;
    readonly serviceClient?: ProductNarrationServiceClient;
    readonly publication?: OpenedPublication;
  } = {},
) {
  const clock = new ManualClock();
  const client = new FakeServiceClient(clock);
  client.availability = options.availability ?? "available";
  client.configurationAvailability =
    options.configurationAvailability ?? "available";
  client.blockSynthesis = options.blockSynthesis ?? false;
  const backend = new FakePlaybackBackend();
  const transitionTimers = new ManualTransitionTimers();
  const prepareNarration = vi.fn<OpenedPublication["prepareNarration"]>(
    options.prepareNarration ??
      (async () => options.result ?? completeResult()),
  );
  const publication =
    options.publication ?? createPublication(prepareNarration);
  const intervals: Array<() => void> = [];
  const dependencies: ProductNarrationCoordinatorDependencies = {
    client: options.serviceClient ?? client,
    clock,
    createIdentifier: (kind, sequence) =>
      `${kind}:product-test-${String(sequence)}`,
    createPlayer: (scheduler: AdaptiveBufferScheduler) =>
      new AdaptivePcmPlayer(
        scheduler,
        backend,
        (callback) => callback(),
        transitionTimers.schedule,
        transitionTimers.cancel,
      ),
    setInterval: (callback) => {
      intervals.push(callback);
      return callback;
    },
    clearInterval: (handle) => {
      const index = intervals.indexOf(handle as () => void);
      if (index >= 0) {
        intervals.splice(index, 1);
      }
    },
    startPreferenceRepository:
      options.startPreferenceRepository ??
      Object.freeze({
        read: vi.fn(async () => ({
          status: "missing" as const,
          selection: Object.freeze({ kind: "quick" as const }),
        })),
        write: vi.fn(async () => ({ status: "saved" as const })),
        reset: vi.fn(async () => ({ status: "saved" as const })),
      }),
    playbackPreferenceRepository:
      options.playbackPreferenceRepository ??
      Object.freeze({
        read: vi.fn(async () => ({
          status: "missing" as const,
          playbackRatePercent: 100 as const,
        })),
        write: vi.fn(async () => ({ status: "saved" as const })),
        reset: vi.fn(async () => ({ status: "saved" as const })),
      }),
    ...(options.profileCompatibility === undefined
      ? {}
      : { profileCompatibility: options.profileCompatibility }),
  };
  const coordinator = new ProductNarrationCoordinator(
    publication,
    publication.defaultStartLocator ?? START_LOCATOR,
    dependencies,
  );
  return {
    backend,
    client,
    clock,
    coordinator,
    intervals,
    prepareNarration,
    transitionTimers,
  };
}

async function settleUntil(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await Promise.resolve();
    if (predicate()) {
      return;
    }
  }
  throw new Error("content-free-test-timeout");
}

describe("product narration coordinator", () => {
  it.each([
    ["settled", "select"],
    ["settled", "reset"],
    ["settled", "write-failure"],
    ["pending", "select"],
    ["pending", "reset"],
    ["pending", "write-failure"],
  ] as const)(
    "MPA-03 %s paused navigation keeps selection and loaded label consistent on %s",
    async (timing, action) => {
      const repository: NarrationPlaybackPreferenceRepository = {
        read: async () => ({ status: "missing", playbackRatePercent: 100 }),
        write: async () => ({
          status: action === "write-failure" ? "unavailable" : "saved",
        }),
        reset: async () => ({ status: "saved" }),
      };
      const { coordinator, client, backend } = createHarness({
        playbackPreferenceRepository: repository,
      });
      let release!: () => void;
      try {
        await coordinator.checkAvailability();
        if (action === "reset") await coordinator.setPlaybackRatePercent(75);
        coordinator.start();
        await settleUntil(
          () => coordinator.observe().state?.phase === "playing",
        );
        coordinator.pause();
        const shutdown = client.shutdown.bind(client);
        const barrier = new Promise<void>((resolve) => {
          release = resolve;
        });
        if (timing === "pending")
          vi.spyOn(client, "shutdown").mockImplementation(async () => {
            await barrier;
            return shutdown();
          });
        const navigation =
          coordinator.beginExternalNavigation("chapter-navigation");
        coordinator.settleExternalNavigation(END_LOCATOR);
        if (timing === "settled") {
          await navigation;
          await settleUntil(() => !coordinator.observe().navigation.settling);
        }
        const starts = client.startedProfiles.length;
        expect(
          await (action === "reset"
            ? coordinator.resetPlaybackPreference()
            : coordinator.setPlaybackRatePercent(75)),
        ).toBe(action !== "write-failure");
        const rate = action === "reset" ? 100 : 75;
        const assertPaused = () => {
          expect(coordinator.observe()).toMatchObject({
            playbackRatePercent: rate,
            navigation: { playIntent: "paused" },
            state: {
              phase: "paused",
              readyMs: 0,
              playbackRate: rate / 100,
              selectedPlaybackRatePercent: rate,
              activePlaybackRatePercent: null,
              pendingPlaybackRatePercent: null,
            },
          });
          expect(loadedAudioStatusText(coordinator.observe().state!)).toContain(
            `0 seconds ready at ${(rate / 100).toFixed(2)}×`,
          );
          expect(client.startedProfiles).toHaveLength(starts);
        };
        assertPaused();
        release();
        await navigation;
        await settleUntil(() => !coordinator.observe().navigation.settling);
        assertPaused();
        coordinator.resume();
        await settleUntil(() => backend.active !== undefined);
        expect(backend.active!.request.playbackRate).toBe(rate / 100);
      } finally {
        release?.();
        await coordinator.close();
      }
    },
  );

  it.each(["profile", "language"] as const)(
    "SAF-14 rejects %s changes during native configuration observation",
    async (change) => {
      const profileId = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
      let selected = profileId;
      let language: "en" | "es" = "en";
      let release!: (value: "available") => void;
      const pending = new Promise<"available">((resolve) => {
        release = resolve;
      });
      const compatibility = {
        activeProfileId: () => selected,
        activeLanguage: () => language,
        isProfileCurrentlyAllowed: () => true,
        isProfileStartAllowed: vi.fn(async () => true),
        check: vi.fn(async () => undefined),
      };
      const { coordinator, client, prepareNarration } = createHarness({
        profileCompatibility: compatibility,
      });
      try {
        await coordinator.checkAvailability();
        const configuration = vi
          .spyOn(client, "profileConfigurationAvailability")
          .mockReturnValue(pending);
        coordinator.start();
        await settleUntil(() => configuration.mock.calls.length === 1);
        if (change === "profile")
          selected = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
        else language = "es";
        release("available");
        await settleUntil(
          () => coordinator.observe().availability === "unavailable",
        );
        expect(client.startedProfiles).toEqual([]);
        expect(prepareNarration).not.toHaveBeenCalled();
      } finally {
        release("available");
        await coordinator.close();
      }
    },
  );

  it.each([true, false])(
    "SAF-14 refreshes new-start admission after Stop (capacity=%s)",
    async (capacity) => {
      const profileId = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
      let admitted = true;
      let freshCapacity = true;
      const compatibility = {
        activeProfileId: () => (admitted ? profileId : undefined),
        activeLanguage: () => "en" as const,
        isProfileCurrentlyAllowed: () => admitted,
        isProfileContinuationAllowed: () => true,
        isProfileStartAllowed: vi.fn(async () => admitted),
        check: vi.fn(async () => {
          admitted = freshCapacity;
        }),
      };
      const { coordinator, client, prepareNarration } = createHarness({
        profileCompatibility: compatibility,
      });
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(
          () => coordinator.observe().state?.phase === "playing",
        );
        admitted = false;
        await coordinator.refreshSelectedProfile();
        expect(coordinator.observe().state?.phase).toBe("playing");
        await coordinator.stop();
        const preparedBefore = prepareNarration.mock.calls.length;
        freshCapacity = capacity;
        compatibility.check.mockClear();
        coordinator.start();
        await settleUntil(() =>
          capacity
            ? client.startedProfiles.length === 2
            : coordinator.observe().availability === "unavailable",
        );
        expect(compatibility.check).toHaveBeenCalledExactlyOnceWith(
          "before-profile-start",
        );
        expect(client.startedProfiles).toHaveLength(capacity ? 2 : 1);
        if (!capacity)
          expect(prepareNarration).toHaveBeenCalledTimes(preparedBefore);
      } finally {
        await coordinator.close();
      }
    },
  );

  it.each(["stop", "close", "profile", "language"] as const)(
    "SAF-14 rejects stale fresh admission on %s",
    async (invalidate) => {
      const profileId = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
      let selected = profileId;
      let language: "en" | "es" = "en";
      let release!: () => void;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      const compatibility = {
        activeProfileId: () => selected,
        activeLanguage: () => language,
        isProfileCurrentlyAllowed: () => true,
        isProfileStartAllowed: vi.fn(async () => true),
        check: vi.fn(() => pending),
      };
      const { coordinator, client, prepareNarration } = createHarness({
        profileCompatibility: compatibility,
      });
      let cleanup: Promise<void> | undefined;
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(() => compatibility.check.mock.calls.length === 1);
        if (invalidate === "stop") cleanup = coordinator.stop();
        if (invalidate === "close") cleanup = coordinator.close();
        if (invalidate === "profile")
          selected = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
        if (invalidate === "language") language = "es";
        release();
        await cleanup;
        if (invalidate === "profile" || invalidate === "language")
          await settleUntil(
            () => coordinator.observe().availability === "unavailable",
          );
        expect(client.startedProfiles).toEqual([]);
        expect(prepareNarration).not.toHaveBeenCalled();
      } finally {
        release();
        await coordinator.close();
      }
    },
  );

  it.each([
    "language-success",
    "profile-late-failure",
    "cleanup-failure",
  ] as const)(
    "VCA-01 contains interrupted recovery before explicit restart: %s",
    async (scenario) => {
      const { client, coordinator, backend } = createHarness();
      let settlePreparation!: () => void;
      const prepare = vi
        .spyOn(client, "prepare")
        .mockRejectedValueOnce(
          new TtsProcessClientError("tts-service-internal-failure"),
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve, reject) => {
              settlePreparation = () =>
                scenario === "profile-late-failure"
                  ? reject(
                      new TtsProcessClientError("tts-service-internal-failure"),
                    )
                  : resolve(client.observe());
            }),
        );
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().recovery.canRecover);
      coordinator.recover();
      await settleUntil(() => prepare.mock.calls.length === 2);
      const shutdown =
        scenario === "cleanup-failure"
          ? vi
              .spyOn(client, "shutdown")
              .mockRejectedValue(new Error("synthetic cleanup failure"))
          : undefined;
      const stopping = coordinator.stopForConfigurationChange();
      coordinator.resetRecoveryEpisode();
      expect(coordinator.observe().recovery.phase).toBe("recovering");
      coordinator.start();
      expect(prepare).toHaveBeenCalledTimes(2);
      settlePreparation();
      await stopping;
      try {
        expect(backend.active).toBeUndefined();
        expect(coordinator.observe().metrics.retainedAudioUnitCount).toBe(0);
        if (scenario === "cleanup-failure") {
          expect(coordinator.observe().availability).toBe("unavailable");
          coordinator.start();
          expect(prepare).toHaveBeenCalledTimes(2);
        } else {
          await settleUntil(
            () => coordinator.observe().availability === "available",
          );
          expect(coordinator.observe().recovery.phase).toBe("operational");
          expect(prepare).toHaveBeenCalledTimes(2);
          coordinator.start();
          await settleUntil(
            () => coordinator.observe().state?.phase === "playing",
          );
          expect(prepare).toHaveBeenCalledTimes(3);
        }
      } finally {
        shutdown?.mockRestore();
        await coordinator.close();
      }
    },
  );

  it("VCA-06 paused navigation releases loaded audio and preparation actions until explicit Resume", async () => {
    const { coordinator, client, backend, prepareNarration } = createHarness();
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");
    coordinator.setVolumePercent(35);
    coordinator.pause();
    expect(coordinator.observe().state!.readyMs).toBeGreaterThan(0);
    await coordinator.beginExternalNavigation("chapter-navigation");
    coordinator.settleExternalNavigation(END_LOCATOR);
    await settleUntil(() => !coordinator.observe().navigation.settling);
    try {
      expect(coordinator.observe()).toMatchObject({
        navigation: { playIntent: "paused" },
        metrics: { retainedAudioUnitCount: 0 },
        state: {
          readyMs: 0,
          progressValueMs: 0,
          estimatedWaitMs: undefined,
          allRemainingAudioReady: false,
          resourceCeilingReached: false,
          pauseContinuesPreparation: false,
          canPlayAvailableAudio: false,
          canPause: false,
          canResume: true,
          volumePercent: 35,
          activePlaybackRatePercent: null,
          pendingPlaybackRatePercent: null,
        },
      });
      expect(backend.active).toBeUndefined();
      expect(client.observe().retainedAudioUnits).toBe(0);
      expect(prepareNarration).toHaveBeenCalledTimes(1);
      coordinator.resume();
      await settleUntil(() => prepareNarration.mock.calls.length === 2);
      expect(prepareNarration.mock.calls[1]![0].startLocator).toEqual(
        END_LOCATOR,
      );
    } finally {
      await coordinator.close();
    }
  });

  it.each(["stop", "synthesis-failure"] as const)(
    "CHAT-AUDIT R1 captures final metrics without advancing an expired transition during %s",
    async (action) => {
      const { coordinator, client, backend, clock, intervals } = createHarness({
        result: completeSegments([
          preparedSegment(
            "First synthetic passage.",
            sourceRange(0, 12),
            1,
            "sentence",
          ),
          preparedSegment("Second synthetic passage.", sourceRange(12, 24)),
          preparedSegment("Third synthetic passage.", sourceRange(24, 36)),
        ]),
      });
      const synthesize = client.synthesize.bind(client);
      vi.spyOn(client, "synthesize")
        .mockImplementationOnce(synthesize)
        .mockImplementationOnce(async (input) => {
          const result = await synthesize(input);
          client.blockSynthesis = true;
          return result;
        });
      let start: ReturnType<typeof vi.spyOn> | undefined;
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(() => client.synthesized.length === 3);
        clock.advance(15_000);
        intervals[0]?.();
        backend.finish();
        intervals[0]?.();
        clock.advance(300);
        start = vi.spyOn(backend, "start").mockImplementation(() => {
          throw new Error("synthetic-device-no-longer-available");
        });
        if (action === "stop") await coordinator.stop();
        else {
          await client.shutdown();
          await settleUntil(() => backend.closed);
          await settleUntil(
            () => coordinator.observe().recovery.phase === "recovery-available",
          );
        }
        expect(start).not.toHaveBeenCalled();
        expect(backend.closed).toBe(true);
        expect(client.state).toBe("stopped");
        expect(intervals).toHaveLength(0);
        expect(coordinator.observe().metrics.intentionalWaitMs).toBe(300);
        expect(coordinator.observe().metrics.retainedAudioUnitCount).toBe(0);
      } finally {
        start?.mockRestore();
        await coordinator.close().catch(() => undefined);
      }
    },
  );

  it.each([false, true])(
    "CHAT-AUDIT F12 terminal actions after a playing synthesis failure (paused=%s)",
    async (paused) => {
      const { coordinator, client } = createHarness({
        result: completeSegments([
          preparedSegment("First synthetic passage.", sourceRange(0, 12)),
          preparedSegment("Second synthetic passage.", sourceRange(12, 24)),
        ]),
      });
      const synthesize = client.synthesize.bind(client);
      vi.spyOn(client, "synthesize").mockImplementationOnce(async (input) => {
        const result = await synthesize(input);
        client.blockSynthesis = true;
        return result;
      });
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(() => client.synthesized.length === 2);
        if (paused) coordinator.pause();
        await client.shutdown();
        await settleUntil(
          () => coordinator.observe().recovery.phase === "recovery-available",
        );
        expect(coordinator.observe().state).toMatchObject({
          phase: "failed",
          canPause: false,
          canResume: false,
          canPlayAvailableAudio: false,
        });
        expect(coordinator.observe().recovery.canRecover).toBe(true);
      } finally {
        await coordinator.close();
      }
    },
  );
  it("CHAT-AUDIT R1 metric observation failure cannot skip Stop cleanup", async () => {
    const { coordinator, backend, client, intervals } = createHarness();
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => backend.active !== undefined);
    const read = vi
      .spyOn(AdaptivePcmPlayer.prototype, "observe")
      .mockImplementationOnce(() => {
        throw new Error("synthetic-observation-failure");
      });
    try {
      await coordinator.stop();
      expect(read).toHaveBeenCalled();
      expect(backend.closed).toBe(true);
      expect(client.state).toBe("stopped");
      expect(intervals).toHaveLength(0);
    } finally {
      read.mockRestore();
      await coordinator.close();
    }
  });
  it("CHAT-AUDIT F06 keeps the identical healthy loaded owner after startup headroom is consumed", async () => {
    const profileId = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
    let hasStartupHeadroom = true;
    let canContinue = true;
    const compatibility = {
      activeProfileId: () => (hasStartupHeadroom ? profileId : undefined),
      activeLanguage: () => "en" as const,
      isProfileCurrentlyAllowed: () => hasStartupHeadroom,
      isProfileContinuationAllowed: () => canContinue,
      isProfileStartAllowed: vi.fn(async () => hasStartupHeadroom),
    };
    const { coordinator, client } = createHarness({
      profileCompatibility: compatibility,
    });
    try {
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      const service = client.observe().serviceInstanceId;
      hasStartupHeadroom = false;
      await coordinator.refreshSelectedProfile();
      expect(coordinator.observe().state?.phase).toBe("playing");
      expect(client.shutdownCount).toBe(0);
      expect(client.observe().serviceInstanceId).toBe(service);
      canContinue = false;
      await coordinator.refreshSelectedProfile();
      expect(client.shutdownCount).toBeGreaterThan(0);
      expect(coordinator.observe().availability).toBe("unavailable");
    } finally {
      await coordinator.close();
    }
  });

  it.each([false, true])(
    "CHAT-AUDIT F10/F12 retains episode interruptions and removes dead actions after synthesis fails (paused=%s)",
    async (paused) => {
      const { coordinator, client, backend, clock, intervals } = createHarness({
        result: completeSegments([
          preparedSegment("First synthetic passage.", sourceRange(0, 12)),
          preparedSegment("Second synthetic passage.", sourceRange(12, 24)),
        ]),
      });
      const synthesize = client.synthesize.bind(client);
      vi.spyOn(client, "synthesize").mockImplementationOnce(async (input) => {
        const result = await synthesize(input);
        client.blockSynthesis = true;
        return result;
      });
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(() => client.synthesized.length === 2);
        clock.advance(15_000);
        intervals[0]?.();
        backend.finish();
        intervals[0]?.();
        clock.advance(500);
        intervals[0]?.();
        const before = coordinator.observe().metrics;
        expect(before.underrunCount).toBe(1);
        expect(before.bufferingMs).toBeGreaterThanOrEqual(500);
        if (paused) coordinator.pause();
        await client.shutdown();
        await settleUntil(
          () => coordinator.observe().recovery.phase === "recovery-available",
        );
        expect(coordinator.observe().state).toMatchObject({
          phase: "failed",
          canPause: false,
          canResume: false,
          canPlayAvailableAudio: false,
        });
        expect(coordinator.observe().metrics.underrunCount).toBe(
          before.underrunCount,
        );
        expect(
          coordinator.observe().metrics.bufferingMs,
        ).toBeGreaterThanOrEqual(before.bufferingMs);
        client.blockSynthesis = false;
        coordinator.recover();
        await settleUntil(
          () => coordinator.observe().state?.phase === "playing",
        );
        expect(coordinator.observe().metrics.underrunCount).toBe(1);
        expect(
          coordinator.observe().metrics.bufferingMs,
        ).toBeGreaterThanOrEqual(before.bufferingMs);
        expect(coordinator.observe().metrics.playbackMs).toBeGreaterThanOrEqual(
          before.playbackMs,
        );
        intervals[0]?.();
        intervals[0]?.();
        expect(coordinator.observe().metrics.underrunCount).toBe(1);
        await coordinator.stop();
        coordinator.start();
        await settleUntil(
          () => coordinator.observe().state?.phase === "playing",
        );
        expect(coordinator.observe().metrics.underrunCount).toBe(1);
        coordinator.resetRecoveryEpisode();
        expect(coordinator.observe().metrics.underrunCount).toBe(0);
      } finally {
        await coordinator.close();
      }
    },
  );

  it.each(["changed-playing", "unavailable-paused", "unchanged"] as const)(
    "NCC-02 reconciles automatic %s without restart",
    async (scenario) => {
      const original = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
      let selected: string | undefined = original;
      const { coordinator, client, backend, prepareNarration } = createHarness({
        profileCompatibility: {
          activeProfileId: () => selected,
          activeLanguage: () => "en",
          isProfileCurrentlyAllowed: () => true,
          isProfileStartAllowed: async () => true,
        },
      });
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => backend.active !== undefined);
      if (scenario === "unavailable-paused") coordinator.pause();
      const oldAudio = backend.active;
      const reset = vi.spyOn(coordinator, "resetRecoveryEpisode");
      const refresh = vi.spyOn(coordinator, "refreshSelectedProfile");
      let release!: () => void;
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      const shutdown = client.shutdown.bind(client);
      vi.spyOn(client, "shutdown").mockImplementation(async () => {
        await held;
        await shutdown();
      });
      const source = Object.assign(new EventTarget(), {
        visibilityState: "hidden" as DocumentVisibilityState,
      });
      const target = {
        ensureChecked: async () => ({}) as HardwareCompatibilitySnapshotV1,
        check: vi.fn(async () => {
          selected =
            scenario === "unchanged"
              ? original
              : scenario === "unavailable-paused"
                ? undefined
                : "chatterbox-multilingual-v3-cuda-bf16-default-v4";
          return {} as HardwareCompatibilitySnapshotV1;
        }),
      };
      const disconnect = bindHardwareCompatibilityChecks(target, source, () =>
        coordinator.refreshSelectedProfile(),
      );
      source.visibilityState = "visible";
      source.dispatchEvent(new Event("visibilitychange"));
      await settleUntil(() => refresh.mock.calls.length === 1);
      if (scenario !== "unchanged") {
        await settleUntil(
          () => vi.mocked(client.shutdown).mock.calls.length > 0,
        );
        expect(coordinator.observe().profileId).toBe(original);
        expect(coordinator.observe().navigation.playIntent).toBe("inactive");
      } else {
        await settleUntil(
          () => coordinator.observe().availability === "available",
        );
        expect(client.shutdown).not.toHaveBeenCalled();
        expect(backend.active).toBe(oldAudio);
      }
      release();
      await settleUntil(
        () => coordinator.observe().availability !== "checking",
      );
      expect(client.startedProfiles).toEqual([original]);
      expect(prepareNarration).toHaveBeenCalledTimes(1);
      expect(reset).not.toHaveBeenCalled();
      expect(coordinator.observe().availability).toBe(
        scenario === "unavailable-paused" ? "unavailable" : "available",
      );
      disconnect();
      await coordinator.close();
    },
  );

  it.each(["visible", "leaf"] as const)(
    "LCF-01 restarts completed narration through %s after cleanup",
    async (action) => {
      const { coordinator, client, backend, intervals, prepareNarration } =
        createHarness();
      coordinator.subscribeNavigationRequests((request) =>
        coordinator.settleExternalNavigation(request.locator),
      );
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      const oldGeneration = client.synthesized[0]!.generationId;
      backend.finish();
      for (const tick of [...intervals]) tick();
      expect(coordinator.observe().state?.phase).toBe("complete");
      const target = action === "visible" ? END_LOCATOR : START_LOCATOR;
      coordinator.updateVisibleLocator(target);
      let release = (): void => undefined;
      const cleanup = new Promise<void>((resolve) => {
        release = resolve;
      });
      const shutdown = client.shutdown.bind(client);
      const held = vi
        .spyOn(client, "shutdown")
        .mockImplementationOnce(async () => {
          await cleanup;
          await shutdown();
        });
      try {
        if (action === "visible") coordinator.startAtVisibleLocator();
        else expect(coordinator.startAtLocator(END_LOCATOR)).toBe(true);
        expect(held).toHaveBeenCalledTimes(1);
        expect(prepareNarration).toHaveBeenCalledTimes(1);
      } finally {
        release();
      }
      await settleUntil(
        () => client.synthesized.length === 2 && backend.active !== undefined,
      );
      expect(prepareNarration).toHaveBeenCalledTimes(2);
      expect(prepareNarration.mock.calls[1]?.[0]).toMatchObject({
        startLocator: target,
      });
      expect(client.synthesized[1]!.generationId).not.toBe(oldGeneration);
      expect(coordinator.observe().state?.phase).toBe("playing");
      await coordinator.close();
    },
  );

  it.each(["stop", "close", "supersede"] as const)(
    "LCF-01 suppresses a completed-run restart when %s wins during cleanup",
    async (action) => {
      const { coordinator, client, backend, intervals, prepareNarration } =
        createHarness();
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      backend.finish();
      for (const tick of [...intervals]) tick();
      expect(coordinator.observe().state?.phase).toBe("complete");
      let release = (): void => undefined;
      const cleanup = new Promise<void>((resolve) => {
        release = resolve;
      });
      const shutdown = client.shutdown.bind(client);
      const held = vi
        .spyOn(client, "shutdown")
        .mockImplementationOnce(async () => {
          await cleanup;
          await shutdown();
        });
      coordinator.updateVisibleLocator(END_LOCATOR);
      coordinator.startAtVisibleLocator();
      let stopped: Promise<void> | undefined;
      try {
        expect(held).toHaveBeenCalledTimes(1);
        if (action === "supersede") {
          stopped = coordinator.beginExternalNavigation("chapter-navigation");
          coordinator.settleExternalNavigation(START_LOCATOR);
        } else
          stopped =
            action === "close" ? coordinator.close() : coordinator.stop();
        expect(prepareNarration).toHaveBeenCalledTimes(1);
      } finally {
        release();
      }
      if (action === "supersede") {
        await settleUntil(() => client.synthesized.length === 2);
        expect(prepareNarration).toHaveBeenCalledTimes(2);
        expect(prepareNarration.mock.calls[1]?.[0]).toMatchObject({
          startLocator: START_LOCATOR,
        });
      } else {
        await stopped;
        expect(prepareNarration).toHaveBeenCalledTimes(1);
        expect(client.synthesized).toHaveLength(1);
      }
      await coordinator.close();
    },
  );

  it("NLC-02 returns persistence to manual reading after natural completion", async () => {
    const { coordinator, backend, intervals } = createHarness();
    const storage = new Map<string, string>();
    const repository = createWebStorageReaderPositionRepository({
      storage: () => ({
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => {
          storage.set(key, value);
        },
      }),
    });
    const publication = {
      ...createPublication(async () => completeResult()),
      defaultStartLocator: START_LOCATOR,
    };
    const save = new ReaderPositionSaveCoordinator(publication, repository, {
      initialLocator: START_LOCATOR,
    });
    const finish = vi.spyOn(save, "finishNarration");
    const begin = vi.spyOn(save, "beginNarration");
    const unbind = bindNarrationPositionPersistence(coordinator, save);
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");
    backend.finish();
    for (const tick of [...intervals]) tick();
    await save.flush();
    expect(
      await repository.readPosition(START_LOCATOR.bookIdentity),
    ).toMatchObject({ status: "ready", state: { locator: SOURCE_RANGE.end } });
    const manual = decodeReadingLocatorV1({
      ...START_LOCATOR,
      textOffsetCodePoints: 1,
    });
    expect(save.schedulePassive(manual)).toBe(true);
    await save.flush();
    for (let index = 0; index < 3; index += 1)
      for (const tick of [...intervals]) tick();
    await save.flush();
    expect(
      await repository.readPosition(START_LOCATOR.bookIdentity),
    ).toMatchObject({ status: "ready", state: { locator: manual } });
    expect(begin).toHaveBeenCalledTimes(1);
    expect(finish).toHaveBeenCalledTimes(1);
    const restored = await new ReaderPositionRestoreCoordinator(
      repository,
    ).restore(publication);
    expect(restored).toMatchObject({
      status: "ready",
      position: { mode: "exact", locator: manual },
    });
    expect(coordinator.observe()).toMatchObject({
      state: { phase: "complete" },
      navigation: { playIntent: "inactive" },
    });
    unbind();
    await save.close();
    await coordinator.close();
  });

  it.each([
    [100, 1],
    [100, 23],
    [100, 24],
    [75, 1],
    [75, 17],
    [75, 18],
  ] as const)(
    "VAF H8 plays and releases %i-percent synthetic PCM with %i frames",
    async (rate, frames) => {
      const { coordinator, client, backend, intervals } = createHarness();
      client.synthesisSampleFrames = frames;
      const audible: ProductNarrationAudibleProgressObservation[] = [];
      coordinator.subscribeAudibleProgress((event) => audible.push(event));
      try {
        await coordinator.checkAvailability();
        await coordinator.setPlaybackRatePercent(rate);
        coordinator.start();
        await settleUntil(
          () =>
            backend.active !== undefined ||
            coordinator.observe().failure !== undefined,
        );
        expect(coordinator.observe().failure).toBeUndefined();
        expect(backend.active?.request.sampleCountSamples).toBe(frames);
        backend.playedSampleFrames = frames;
        backend.finish();
        for (const tick of [...intervals]) tick();
        expect(coordinator.observe()).toMatchObject({
          state: { phase: "complete" },
          metrics: {
            retainedAudioUnitCount: 0,
            acceptedAudioSampleFrames: frames,
          },
        });
        expect(client.releaseCount).toBe(1);
        expect(
          audible.filter((event) => event.kind === "segment-completed"),
        ).toHaveLength(1);
      } finally {
        await coordinator.close();
      }
    },
  );

  it.each([100, 75] as const)(
    "NCC-01 saves the heard end before terminal persistence at %s percent",
    async (rate) => {
      const { coordinator, backend, intervals } = createHarness();
      const storage = new Map<string, string>();
      const repository = createWebStorageReaderPositionRepository({
        storage: () => ({
          getItem: (key) => storage.get(key) ?? null,
          setItem: (key, value) => {
            storage.set(key, value);
          },
        }),
      });
      const publication = {
        ...createPublication(async () => completeResult()),
        defaultStartLocator: START_LOCATOR,
      };
      const save = new ReaderPositionSaveCoordinator(publication, repository, {
        initialLocator: START_LOCATOR,
      });
      const finish = vi.spyOn(save, "finishNarration");
      const begin = vi.spyOn(save, "beginNarration");
      const unbind = bindNarrationPositionPersistence(coordinator, save);
      const audible: ProductNarrationAudibleProgressObservation[] = [];
      coordinator.subscribeAudibleProgress((event) => audible.push(event));
      await coordinator.checkAvailability();
      await coordinator.setPlaybackRatePercent(rate);
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      await settleUntil(() => backend.active !== undefined);
      const finalAudio = backend.active!;
      backend.playedSampleFrames = finalAudio.request.sampleCountSamples;
      for (const tick of [...intervals]) tick();
      expect(finish).not.toHaveBeenCalled();
      expect(coordinator.observe().navigation.playIntent).toBe("playing");
      backend.finish();
      finalAudio.callbacks.ended();
      for (const tick of [...intervals]) tick();
      await save.flush();
      expect(
        await repository.readPosition(START_LOCATOR.bookIdentity),
      ).toMatchObject({
        status: "ready",
        state: { locator: SOURCE_RANGE.end },
      });
      const manual = decodeReadingLocatorV1({
        ...START_LOCATOR,
        textOffsetCodePoints: 1,
      });
      expect(save.schedulePassive(manual)).toBe(true);
      await save.flush();
      for (let index = 0; index < 3; index += 1)
        for (const tick of [...intervals]) tick();
      await save.flush();
      expect(
        await repository.readPosition(START_LOCATOR.bookIdentity),
      ).toMatchObject({ status: "ready", state: { locator: manual } });
      expect(begin).toHaveBeenCalledTimes(1);
      expect(finish).toHaveBeenCalledTimes(1);
      expect(
        audible.filter((event) => event.kind === "segment-completed"),
      ).toHaveLength(1);
      const restored = await new ReaderPositionRestoreCoordinator(
        repository,
      ).restore(publication);
      expect(restored).toMatchObject({
        status: "ready",
        position: { mode: "exact", locator: manual },
      });
      expect(coordinator.observe()).toMatchObject({
        state: { phase: "complete" },
        navigation: { playIntent: "inactive" },
      });
      coordinator.subscribeNavigationRequests((request) =>
        coordinator.settleExternalNavigation(request.locator),
      );
      coordinator.updateVisibleLocator(START_LOCATOR);
      coordinator.startAtVisibleLocator();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      expect(begin).toHaveBeenCalledTimes(2);
      unbind();
      await save.close();
      await coordinator.close();
    },
  );

  it.each([
    "changed",
    "unavailable",
    "paused",
    "paused-unavailable",
    "unchanged",
  ] as const)(
    "NLC-03 contains a %s compatibility recheck before applying policy",
    async (scenario) => {
      const original = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
      let selected: string | undefined = original;
      const { coordinator, client, prepareNarration, backend } = createHarness({
        profileCompatibility: {
          activeProfileId: () => selected,
          activeLanguage: () => "en",
          isProfileCurrentlyAllowed: () => true,
          isProfileStartAllowed: async () => true,
        },
      });
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      if (scenario.startsWith("paused")) coordinator.pause();
      const unavailable = scenario.endsWith("unavailable");
      const oldAudio = backend.active;
      let release = (): void => undefined;
      const wait = new Promise<void>((resolve) => {
        release = resolve;
      });
      const shutdown = client.shutdown.bind(client);
      vi.spyOn(client, "shutdown").mockImplementation(async () => {
        await wait;
        await shutdown();
      });
      selected =
        scenario === "unchanged"
          ? original
          : unavailable
            ? undefined
            : "chatterbox-multilingual-v3-cuda-bf16-default-v4";
      coordinator.resetRecoveryEpisode();
      if (scenario === "unchanged") {
        await settleUntil(
          () => coordinator.observe().availability === "available",
        );
        expect(client.shutdown).not.toHaveBeenCalled();
        expect(backend.active).toBe(oldAudio);
        expect(coordinator.observe().navigation.playIntent).toBe("playing");
      } else {
        await settleUntil(
          () =>
            vi.mocked(client.shutdown).mock.calls.length > 0 ||
            coordinator.observe().availability !== "checking",
        );
        expect(client.shutdown).toHaveBeenCalled();
        expect(coordinator.observe().profileId).toBe(original);
        expect(coordinator.observe().navigation.playIntent).toBe("inactive");
      }
      release();
      await settleUntil(
        () => coordinator.observe().availability !== "checking",
      );
      expect(client.startedProfiles).toEqual([original]);
      expect(prepareNarration).toHaveBeenCalledTimes(1);
      if (scenario !== "unchanged") {
        expect(coordinator.observe().metrics.retainedAudioUnitCount).toBe(0);
        expect(coordinator.observe().availability).toBe(
          unavailable ? "unavailable" : "available",
        );
      }
      await coordinator.close();
    },
  );

  it.each([false, true])(
    "NLC-03 settles a recheck interrupted by Stop (profile changed: %s)",
    async (changeProfile) => {
      let selected = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
      const { coordinator, client } = createHarness({
        profileCompatibility: {
          activeProfileId: () => selected,
          activeLanguage: () => "en",
          isProfileCurrentlyAllowed: () => true,
          isProfileStartAllowed: async () => true,
        },
      });
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      let release = (): void => undefined;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      const availability = vi
        .spyOn(client, "profileConfigurationAvailability")
        .mockImplementationOnce(async () => {
          await pending;
          return "available";
        });
      if (changeProfile)
        selected = "chatterbox-multilingual-v3-cuda-bf16-default-v4";
      const recheck = coordinator.refreshSelectedProfile();
      await settleUntil(() => availability.mock.calls.length === 1);
      await coordinator.stop();
      release();
      await recheck;
      expect(coordinator.observe()).toMatchObject({
        availability: "available",
        profileId: selected,
        navigation: { playIntent: "inactive" },
      });
      expect(client.startedProfiles).toHaveLength(1);
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      expect(client.startedProfiles).toHaveLength(2);
      expect(client.startedProfiles[1]).toBe(selected);
      await coordinator.close();
    },
  );

  it("NLC-03 ignores a delayed compatibility result after close", async () => {
    let selected = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
    const { coordinator, client } = createHarness({
      profileCompatibility: {
        activeProfileId: () => selected,
        activeLanguage: () => "en",
        isProfileCurrentlyAllowed: () => true,
        isProfileStartAllowed: async () => true,
      },
    });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");
    let release = (): void => undefined;
    const wait = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.spyOn(client, "profileConfigurationAvailability").mockImplementation(
      async () => {
        await wait;
        return "available";
      },
    );
    selected = "chatterbox-multilingual-v3-cuda-bf16-default-v4";
    coordinator.resetRecoveryEpisode();
    await settleUntil(
      () =>
        vi.mocked(client.profileConfigurationAvailability).mock.calls.length >
        0,
    );
    await coordinator.close();
    const closed = coordinator.observe();
    release();
    for (let index = 0; index < 10; index += 1) await Promise.resolve();
    expect(coordinator.observe()).toBe(closed);
  });

  it.each(["available", "unavailable", "closed"] as const)(
    "waits for initial compatibility before publishing %s availability",
    async (outcome) => {
      let finish!: () => void;
      let profileId: string | undefined;
      const checked = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const compatibility = {
        ensureChecked: vi.fn(() => checked),
        activeProfileId: () => profileId,
        activeLanguage: () => "en" as const,
        isProfileCurrentlyAllowed: () =>
          profileId === undefined ? undefined : true,
        isProfileStartAllowed: vi.fn(async () => true),
      };
      const { coordinator, client } = createHarness({
        profileCompatibility: compatibility,
      });
      const configuration = vi.spyOn(
        client,
        "profileConfigurationAvailability",
      );
      const checking = coordinator.checkAvailability();
      try {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        expect(coordinator.observe().availability).toBe("checking");
        expect(configuration).not.toHaveBeenCalled();
        if (outcome === "closed") await coordinator.close();
        if (outcome !== "unavailable") {
          profileId = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
        }
        finish();
        await checking;
        expect(coordinator.observe().availability).toBe(
          outcome === "closed" ? "checking" : outcome,
        );
        expect(configuration).toHaveBeenCalledTimes(
          outcome === "available" ? 1 : 0,
        );
        expect(client.startedProfiles).toEqual([]);
      } finally {
        finish();
        await checking;
        await coordinator.close();
      }
    },
  );

  it.each([
    [0, "playing"],
    [35, "playing"],
    [0, "paused"],
    [35, "paused"],
  ] as const)(
    "preserves %i percent volume across %s navigation and Stop/Play",
    async (volume, intent) => {
      const { coordinator, backend } = createHarness();
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(
          () => coordinator.observe().state?.phase === "playing",
        );
        coordinator.setVolumePercent(volume);
        if (intent === "paused") coordinator.pause();
        await coordinator.beginExternalNavigation("chapter-navigation");
        coordinator.settleExternalNavigation(END_LOCATOR);
        await settleUntil(() => !coordinator.observe().navigation.settling);
        if (intent === "paused") {
          expect(coordinator.observe().state?.phase).toBe("paused");
          coordinator.setVolumePercent(65);
          expect(coordinator.observe().state?.volumePercent).toBe(65);
          coordinator.setVolumePercent(volume);
          coordinator.resume();
        }
        await settleUntil(
          () => coordinator.observe().state?.phase === "playing",
        );
        expect(coordinator.observe().state?.volumePercent).toBe(volume);
        expect(backend.active?.request.volumePercent).toBe(volume);
        await coordinator.stop();
        coordinator.start();
        await settleUntil(
          () => coordinator.observe().state?.phase === "playing",
        );
        expect(backend.active?.request.volumePercent).toBe(volume);
      } finally {
        await coordinator.close();
      }
      const replacement = createHarness();
      await replacement.coordinator.checkAvailability();
      replacement.coordinator.start();
      await settleUntil(
        () => replacement.coordinator.observe().state?.phase === "playing",
      );
      expect(replacement.backend.active?.request.volumePercent).toBe(100);
      await replacement.coordinator.close();
    },
  );

  it("does not let an obsolete availability result replace the selected profile", async () => {
    let profileId = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
    let language: "en" | "es" = "en";
    let finish!: (allowed: boolean) => void;
    const allowed = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    const { coordinator } = createHarness({
      profileCompatibility: {
        activeProfileId: () => profileId,
        activeLanguage: () => language,
        isProfileCurrentlyAllowed: () => (language === "en" ? undefined : true),
        isProfileStartAllowed: allowed,
      },
    });
    const first = coordinator.checkAvailability();
    try {
      await settleUntil(() => allowed.mock.calls.length === 1);
      profileId = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
      language = "es";
      await coordinator.refreshSelectedProfile();
      finish(false);
      await first;
      await coordinator.setSelection({ kind: "quick" });
      expect(coordinator.observe()).toMatchObject({
        availability: "available",
        profileId,
        language: "es",
      });
    } finally {
      finish(false);
      await first;
      await coordinator.close();
    }
  });

  it("joins concurrent close callers until backend disposal completes once", async () => {
    const { coordinator, backend } = createHarness();
    let finish!: () => void;
    const close = vi.spyOn(backend, "close").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => backend.active !== undefined);
    let completions = 0;
    const first = coordinator.close().then(() => {
      completions += 1;
    });
    const second = coordinator.close().then(() => {
      completions += 1;
    });
    try {
      await Promise.resolve();
      expect(completions).toBe(0);
    } finally {
      finish();
      await Promise.all([first, second]);
    }
    expect(completions).toBe(2);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it.each([5_000, 5_001])(
    "shares the final cleanup deadline across operation and backend settlement at %i ms",
    async (elapsed) => {
      vi.useFakeTimers();
      vi.setSystemTime(0);
      const { coordinator, backend, client, clock } = createHarness();
      Object.defineProperty(clock, "nowMs", { get: () => Date.now() });
      let finishPreparation!: () => void;
      let finishBackend!: () => void;
      vi.spyOn(client, "prepare").mockImplementation(async () => {
        client.state = "loading";
        await new Promise<void>((resolve) => {
          finishPreparation = resolve;
        });
        throw new TtsProcessClientError("tts-service-cancelled");
      });
      vi.spyOn(backend, "close").mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            finishBackend = resolve;
          }),
      );
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(() => client.state === "loading");
        const stopped = coordinator.stop();
        await settleUntil(() => client.state === "stopped");
        await vi.advanceTimersByTimeAsync(4_000);
        finishPreparation();
        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(elapsed - 4_000);
        finishBackend();
        await stopped;
        expect(coordinator.observe().recovery.phase).toBe(
          elapsed === 5_000 ? "operational" : "contained",
        );
      } finally {
        finishPreparation?.();
        finishBackend?.();
        await coordinator.close();
        vi.useRealTimers();
      }
    },
  );

  it.each([5_000, 5_001])(
    "SAC-10 shares one operational containment deadline across cancellation, operation and backend at %i ms",
    async (elapsed) => {
      vi.useFakeTimers();
      vi.setSystemTime(0);
      const { coordinator, backend, client, clock, intervals } = createHarness({
        result: completeSegments([
          preparedSegment("First synthetic sentence.", sourceRange(0, 12)),
          preparedSegment("Second synthetic sentence.", sourceRange(12, 24)),
        ]),
      });
      Object.defineProperty(clock, "nowMs", { get: () => Date.now() });
      vi.spyOn(clock, "advance").mockImplementation(() => undefined);
      let finishOperation!: () => void;
      let finishCancellation!: () => void;
      let finishBackend!: () => void;
      const synthesize = client.synthesize.bind(client);
      vi.spyOn(client, "synthesize")
        .mockImplementationOnce(synthesize)
        .mockImplementationOnce(async () => {
          client.state = "generating";
          await new Promise<void>((resolve) => {
            finishOperation = resolve;
          });
          throw new TtsProcessClientError("tts-service-cancelled");
        });
      vi.spyOn(client, "cancel").mockImplementation(async () => {
        await new Promise<void>((resolve) => {
          finishCancellation = resolve;
        });
        client.state = "stopped";
      });
      vi.spyOn(backend, "close").mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            finishBackend = resolve;
          }),
      );
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(
          () => backend.active !== undefined && finishOperation !== undefined,
        );
        backend.active!.callbacks.failed();
        intervals[0]!();
        await settleUntil(() => finishCancellation !== undefined);
        await vi.advanceTimersByTimeAsync(1_000);
        finishCancellation();
        await vi.advanceTimersByTimeAsync(3_000);
        finishOperation();
        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(elapsed - 4_000);
        finishBackend();
        await settleUntil(() =>
          ["recovery-available", "contained"].includes(
            coordinator.observe().recovery.phase,
          ),
        );
        expect(coordinator.observe().recovery).toMatchObject(
          elapsed === 5_000
            ? { phase: "recovery-available", failureCode: "playback-failed" }
            : { phase: "contained", failureCode: "cleanup-failed" },
        );
      } finally {
        finishCancellation?.();
        finishOperation?.();
        finishBackend?.();
        await coordinator.close();
        vi.useRealTimers();
      }
    },
  );

  it("permits explicit restart after the typed client's completed-synthesis cancellation race", async () => {
    const serviceInstanceId = "service:coordinator-race";
    const state = (value: string) => ({
      schemaVersion: 1,
      protocolVersion: 1,
      kind: "state",
      serviceInstanceId,
      state: value,
    });
    const capabilities = {
      schemaVersion: 1,
      protocolVersion: 1,
      kind: "capabilities",
      serviceInstanceId,
      report: {
        schemaVersion: 1,
        capabilities: {
          localSpeechGeneration: "unknown",
          streamingGeneration: "unsupported",
          generationCancellation: "unsupported",
          hardwareAcceleration: "unknown",
          cpuFallback: "unsupported",
        },
      },
      cancellationContainment: "identity-invalidation-then-worker-termination",
    };
    let finishSynthesis!: (value: ArrayBuffer) => void;
    let starts = 0;
    let syntheses = 0;
    const invoke = vi.fn(async (command: string): Promise<unknown> => {
      if (
        command === "tts_profile_configuration_available" ||
        command === "exact_tts_demo_available"
      )
        return true;
      if (command === "start_tts_service") {
        starts += 1;
        return [
          state("handshaking"),
          {
            schemaVersion: 1,
            protocolVersion: 1,
            kind: "handshakeAccepted",
            serviceInstanceId,
          },
          state("unloaded"),
          capabilities,
        ];
      }
      if (command === "prepare_tts_service")
        return [
          state("loading"),
          state("warming"),
          state("ready"),
          capabilities,
        ];
      if (command === "synthesize_tts_segment") {
        syntheses += 1;
        if (syntheses === 1)
          return new Promise<ArrayBuffer>((resolve) => {
            finishSynthesis = resolve;
          });
        return new Float32Array(360_000).buffer;
      }
      if (command === "cancel_tts_generation")
        throw "tts-service-invalid-state";
      if (command === "shutdown_tts_service")
        return [state("stopping"), state("stopped")];
      throw new Error("unexpected synthetic command");
    });
    const client = new TtsProcessClient(
      async <T>(command: string) => (await invoke(command)) as T,
    );
    const { coordinator, backend } = createHarness({ serviceClient: client });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => syntheses === 1);
    const stopped = coordinator.stop();
    await settleUntil(() => client.observe().state === "stopped");
    const staleAudio = new Float32Array(24_000).fill(0.25);
    finishSynthesis(staleAudio.buffer);
    await stopped;
    expect(staleAudio.every((value) => value === 0)).toBe(true);
    expect(coordinator.observe().recovery.phase).toBe("operational");
    coordinator.start();
    await settleUntil(() => backend.active !== undefined);
    expect(starts).toBe(2);
    await coordinator.close();
  });
  it("interrupts pending preparation before waiting for its completion", async () => {
    const { coordinator, client } = createHarness();
    let rejectPreparation!: (reason: unknown) => void;
    vi.spyOn(client, "prepare").mockImplementation(async () => {
      client.state = "loading";
      await new Promise((_, reject) => {
        rejectPreparation = reject;
      });
      return client.observe();
    });
    const shutdown = client.shutdown.bind(client);
    vi.spyOn(client, "shutdown").mockImplementation(async () => {
      rejectPreparation(new TtsProcessClientError("tts-service-cancelled"));
      await shutdown();
    });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => client.state === "loading");
    const stopped = coordinator.stop();
    try {
      expect(client.shutdownCount).toBe(1);
    } finally {
      rejectPreparation(new TtsProcessClientError("tts-service-cancelled"));
      await stopped;
      await coordinator.close();
    }
  });

  it("closes the discarded playback backend on Stop", async () => {
    const { coordinator, backend } = createHarness();
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => backend.active !== undefined);
    await coordinator.stop();
    expect(backend.closed).toBe(true);
    await coordinator.close();
  });

  it.each(
    [63, 64, 65, 112].flatMap((count) =>
      ["prepared", "quick"].map((mode) => ({ count, mode })),
    ),
  )(
    "keeps the audible successor navigable with $count segments in $mode mode",
    async ({ count, mode }) => {
      const ranges = Array.from({ length: count }, (_, index) =>
        sourceRange(index * 12, (index + 1) * 12),
      );
      const { coordinator, client, backend, intervals } = createHarness({
        prepareNarration: async ({ startLocator }) => {
          const index =
            decodeReadingLocatorV1(startLocator).textOffsetCodePoints / 12;
          const entries = ranges
            .slice(index, index + 8)
            .map((range) => preparedSegment("Synthetic passage.", range));
          return index + entries.length === count
            ? completeSegments(entries)
            : batchSegments(entries, ranges[index + entries.length]!.start);
        },
      });
      client.synthesisSampleFrames = mode === "prepared" ? 144_000 : 14_400;
      await coordinator.checkAvailability();
      if (mode === "prepared")
        await coordinator.setSelection({ kind: "prepared", targetMs: 600_000 });
      coordinator.start();
      // Yield macrotasks as well as microtasks: the pump is deliberately bounded.
      await vi.waitFor(() =>
        expect(
          coordinator.observe().metrics.acceptedAudioUnitCount,
        ).toBeGreaterThanOrEqual(Math.min(count, 100)),
      );
      await settleUntil(() => backend.active !== undefined);
      const requests: ProductNarrationNavigationRequest[] = [];
      coordinator.subscribeNavigationRequests((request) =>
        requests.push(request),
      );
      try {
        const advance = count > 100 ? 70 : 0;
        for (let index = 0; index < advance; index += 1) {
          backend.finish();
          intervals[0]?.();
          await settleUntil(() => backend.active !== undefined);
        }
        if (advance > 0) coordinator.pause();
        expect(coordinator.observe().navigation.canGoNext).toBe(true);
        coordinator.goToNextBoundary();
        await vi.waitFor(() => expect(requests).toHaveLength(1));
        expect(requests[0]!.locator).toEqual(ranges[advance + 1]!.start);
        if (advance > 0) {
          coordinator.settleExternalNavigation(requests[0]!.locator);
          await settleUntil(() => !coordinator.observe().navigation.settling);
          expect(coordinator.observe().navigation.playIntent).toBe("paused");
          coordinator.goToPreviousBoundary();
          await vi.waitFor(() => expect(requests).toHaveLength(2));
          expect(requests[1]!.locator).toEqual(ranges[advance]!.start);
        }
      } finally {
        await coordinator.close();
      }
    },
  );

  it.each(["A.", "Wait..."])(
    "SFA-01 delivers real prepared scene metadata to the player after %s",
    async (firstText) => {
      const { buildMinimalEpubFixture } = await vi.importActual<{
        buildMinimalEpubFixture(options: {
          chapterDocument: string;
        }): Promise<Uint8Array>;
      }>("../../../../packages/epub/test-support/epub-fixture.ts");
      const opened = await openEpubPublication(
        await buildMinimalEpubFixture({
          chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>***</p><p>${firstText}</p><p>***</p><p>B.</p><p>⁂</p></body></html>`,
        }),
      );
      if (!opened.ok) throw new Error("synthetic-scene-open-failed");
      let harness: ReturnType<typeof createHarness> | undefined;
      try {
        const prepared = await opened.publication.prepareNarration({
          startLocator: opened.publication.defaultStartLocator!,
          profile: "narration-v1",
          defaultLanguage: "und",
          maximumSegments: 16,
        });
        if (prepared.status !== "complete")
          throw new Error("synthetic-scene-prepare-failed");
        harness = createHarness({ publication: opened.publication });
        const {
          coordinator,
          client,
          backend,
          intervals,
          transitionTimers,
          clock,
        } = harness;
        await coordinator.checkAvailability();
        coordinator.start();
        await vi.waitFor(() => expect(client.synthesized).toHaveLength(2));
        expect(backend.active?.request.sequence).toBe(0);
        expect(transitionTimers.timers).toHaveLength(0);
        backend.finish();
        intervals[0]?.();
        const delay = firstText === "Wait..." ? 900 : 1_200;
        expect(transitionTimers.timers).toHaveLength(1);
        expect(transitionTimers.timers[0]?.delayMs).toBe(delay);
        clock.advance(delay);
        transitionTimers.run(transitionTimers.timers[0]!);
        intervals[0]?.();
        expect(backend.active?.request.sequence).toBe(1);
        backend.finish();
        intervals[0]?.();
        expect(coordinator.observe()).toMatchObject({
          state: { phase: "complete" },
          metrics: { intentionalWaitMs: delay, underrunCount: 0 },
        });
        expect(transitionTimers.timers).toHaveLength(1);
      } finally {
        await harness?.coordinator.close();
        await opened.publication.close();
      }
    },
  );

  it("separates buffered generated units by semantic boundary and reports only intentional time", async () => {
    const firstRange = sourceRange(0, 12);
    const secondRange = sourceRange(12, 24);
    const first = preparedSegment(
      "Primera oración sintética.",
      firstRange,
      1,
      "sentence",
    );
    const second = preparedSegment("Segunda oración sintética.", secondRange);
    const { backend, client, clock, coordinator, intervals, transitionTimers } =
      createHarness({
        result: completeSegments([first, second]),
      });

    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => client.synthesized.length === 2);
    expect(backend.active?.request.sequence).toBe(0);

    backend.finish();
    intervals[0]?.();
    expect(transitionTimers.timers).toHaveLength(1);
    expect(transitionTimers.timers[0]?.delayMs).toBe(300);
    expect(coordinator.observe()).toMatchObject({
      state: { phase: "intentional-wait" },
      metrics: {
        intentionalWaitMs: 0,
        underrunCount: 0,
      },
    });

    clock.advance(300);
    transitionTimers.run(transitionTimers.timers[0]!);
    intervals[0]?.();
    expect(backend.active?.request.sequence).toBe(1);
    expect(coordinator.observe()).toMatchObject({
      state: { phase: "playing" },
      metrics: {
        intentionalWaitMs: 300,
        underrunCount: 0,
      },
    });
    const serialized = JSON.stringify(coordinator.observe());
    expect(serialized).not.toContain(first.text);
    expect(serialized).not.toContain(second.text);
    await coordinator.close();
  });

  it("does not expose the model-free service as product narration", async () => {
    const { client, coordinator, prepareNarration } = createHarness({
      availability: "unavailable",
    });

    await coordinator.checkAvailability();
    coordinator.start();

    expect(coordinator.observe().availability).toBe("unavailable");
    expect(coordinator.observe().state).toBeUndefined();
    expect(client.state).toBe("stopped");
    expect(prepareNarration).not.toHaveBeenCalled();
    await coordinator.close();
  });

  it("does not enable a hardware-compatible profile without native runtime configuration", async () => {
    const profileId = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => profileId),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => true),
    };
    const { client, coordinator, prepareNarration } = createHarness({
      configurationAvailability: "unavailable",
      profileCompatibility,
    });
    const start = vi.spyOn(client, "start");

    await coordinator.checkAvailability();
    coordinator.start();

    expect(coordinator.observe()).toMatchObject({
      availability: "unavailable",
      profileId,
      state: undefined,
      failure: undefined,
    });
    expect(start).not.toHaveBeenCalled();
    expect(prepareNarration).not.toHaveBeenCalled();
    expect(coordinator.observe().recovery.phase).toBe("operational");
    await coordinator.close();
  });

  it("rechecks compatibility before service start and starts no child after a failed preflight", async () => {
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => "qwen3-tts-1-7b-customvoice-cuda-bf16-v1"),
      activeLanguage: vi.fn(() => "es" as const),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => false),
    };
    const { client, coordinator, prepareNarration } = createHarness({
      profileCompatibility,
    });
    const start = vi.spyOn(client, "start");

    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(
      () => coordinator.observe().failure === "tts-profile-unavailable",
    );

    expect(profileCompatibility.isProfileStartAllowed).toHaveBeenCalledWith(
      "qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
      "before-profile-start",
      "es",
    );
    expect(start).not.toHaveBeenCalled();
    expect(prepareNarration).not.toHaveBeenCalled();
    expect(coordinator.observe()).toMatchObject({
      availability: "unavailable",
      failure: "tts-profile-unavailable",
    });
    await settleUntil(
      () => coordinator.observe().recovery.phase === "recovery-available",
    );
    coordinator.resetRecoveryEpisode();
    await settleUntil(() => coordinator.observe().availability === "available");
    expect(coordinator.observe()).toMatchObject({
      failure: undefined,
      recovery: {
        phase: "operational",
        explicitAttemptUsed: false,
      },
    });
    await coordinator.close();
  });

  it("starts only the active admitted profile selected by compatibility", async () => {
    const profileId = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => profileId),
      activeLanguage: vi.fn(() => "es" as const),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => true),
    };
    const { client, coordinator, prepareNarration } = createHarness({
      profileCompatibility,
    });

    await coordinator.checkAvailability();
    expect(coordinator.observe().profileId).toBe(profileId);
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    expect(profileCompatibility.isProfileStartAllowed).toHaveBeenCalledWith(
      profileId,
      "before-profile-start",
      "es",
    );
    expect(client.startedProfiles).toEqual([profileId]);
    expect(client.startedLanguages).toEqual(["es"]);
    expect(prepareNarration).toHaveBeenCalledWith(
      expect.objectContaining({ profile: "narration-piper-v2" }),
    );
    await coordinator.close();
  });

  it("prepares English through the engine-neutral bilingual profile", async () => {
    const profileId = "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8";
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => profileId),
      activeLanguage: vi.fn(() => "en" as const),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => true),
    };
    const { client, coordinator, prepareNarration } = createHarness({
      profileCompatibility,
    });

    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    expect(coordinator.observe()).toMatchObject({
      profileId,
      language: "en",
    });
    expect(prepareNarration).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: "narration-bilingual-v2",
        defaultLanguage: "en",
      }),
    );
    expect(profileCompatibility.isProfileStartAllowed).toHaveBeenCalledWith(
      profileId,
      "before-profile-start",
      "en",
    );
    expect(client.startedLanguages).toEqual(["en"]);
    await coordinator.close();
  });

  it("prepares Chatterbox through its bounded bilingual waveform profile", async () => {
    const profileId = "chatterbox-multilingual-v3-cuda-bf16-default-v4";
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => profileId),
      activeLanguage: vi.fn(() => "en" as const),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => true),
    };
    const { coordinator, prepareNarration } = createHarness({
      profileCompatibility,
    });

    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    expect(prepareNarration).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: "narration-chatterbox-v1",
        defaultLanguage: "en",
      }),
    );
    await coordinator.close();
  });

  it("rejects a language with no compatible profile before child start", async () => {
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => undefined),
      activeLanguage: vi.fn(() => "en" as const),
      isProfileCurrentlyAllowed: vi.fn(() => false),
      isProfileStartAllowed: vi.fn(async () => false),
    };
    const { client, coordinator, prepareNarration } = createHarness({
      profileCompatibility,
    });
    const start = vi.spyOn(client, "start");

    await coordinator.checkAvailability();
    coordinator.start();
    await Promise.resolve();

    expect(start).not.toHaveBeenCalled();
    expect(prepareNarration).not.toHaveBeenCalled();
    expect(coordinator.observe()).toMatchObject({
      availability: "unavailable",
      language: "en",
      failure: undefined,
    });
    await coordinator.close();
  });

  it("replaces language identity, releases obsolete work, and requires a new explicit start", async () => {
    let profileId = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
    let language: "es" | "en" = "es";
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => profileId),
      activeLanguage: vi.fn(() => language),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => true),
    };
    const { client, coordinator, prepareNarration } = createHarness({
      profileCompatibility,
      blockSynthesis: true,
    });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => client.state === "generating");

    await coordinator.stopForConfigurationChange();
    profileId = "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8";
    language = "en";
    await coordinator.refreshSelectedProfile();

    expect(client.cancelled).toHaveLength(1);
    expect(client.shutdownCount).toBe(1);
    expect(coordinator.observe()).toMatchObject({
      language: "en",
      state: undefined,
      navigation: { playIntent: "inactive" },
      metrics: { retainedAudioUnitCount: 0 },
    });
    expect(prepareNarration).toHaveBeenCalledTimes(1);

    client.blockSynthesis = false;
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");
    expect(client.startedProfiles).toEqual([
      "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1",
      "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8",
    ]);
    expect(prepareNarration).toHaveBeenCalledTimes(2);
    expect(prepareNarration.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        startLocator: START_LOCATOR,
        profile: "narration-bilingual-v2",
        defaultLanguage: "en",
      }),
    );
    expect(client.synthesized[1]?.generationId).not.toBe(
      client.cancelled[0]?.generationId,
    );
    await coordinator.close();
  });

  it("waits for active failure containment before replacing profile identity", async () => {
    let profileId = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => profileId),
      activeLanguage: vi.fn(() => "en" as const),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => true),
    };
    const { client, coordinator } = createHarness({
      profileCompatibility,
    });
    const performShutdown = client.shutdown.bind(client);
    let releaseContainment = (): void => undefined;
    const containmentBlocked = new Promise<void>((resolve) => {
      releaseContainment = resolve;
    });
    vi.spyOn(client, "prepare").mockRejectedValueOnce(
      new ProductNarrationRecoveryError("model-warm-failed"),
    );
    vi.spyOn(client, "shutdown").mockImplementationOnce(async () => {
      await containmentBlocked;
      await performShutdown();
    });
    await coordinator.checkAvailability();

    coordinator.start();
    await settleUntil(
      () => coordinator.observe().recovery.phase === "containing-service",
    );

    const stop = coordinator.stopForConfigurationChange();
    releaseContainment();
    await stop;
    profileId = "chatterbox-multilingual-v3-cuda-bf16-default-v1";
    await coordinator.refreshSelectedProfile();
    coordinator.resetRecoveryEpisode();
    await settleUntil(() => coordinator.observe().availability === "available");

    expect(coordinator.observe()).toMatchObject({
      profileId,
      availability: "available",
      failure: undefined,
      recovery: {
        phase: "operational",
        failureCode: undefined,
      },
      navigation: { playIntent: "inactive" },
      metrics: { retainedAudioUnitCount: 0 },
    });
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");
    expect(client.startedProfiles.at(-1)).toBe(profileId);
    await coordinator.close();
  });

  it("skips punctuation-only Piper ranges without failing or inserting audio", async () => {
    const profileId = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => profileId),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => true),
    };
    const spokenRange = sourceRange(
      END_LOCATOR.textOffsetCodePoints,
      END_LOCATOR.textOffsetCodePoints + 12,
    );
    const prepareNarration = vi
      .fn<OpenedPublication["prepareNarration"]>()
      .mockResolvedValueOnce(
        batchSegments([preparedSegment("—…", sourceRange(0, 2))]),
      )
      .mockResolvedValueOnce(
        completeSegments([
          preparedSegment("Narración sintética.", spokenRange),
        ]),
      );
    const { client, coordinator } = createHarness({
      prepareNarration,
      profileCompatibility,
    });

    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    expect(prepareNarration).toHaveBeenCalledTimes(2);
    expect(prepareNarration.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ profile: "narration-piper-v2" }),
    );
    expect(prepareNarration.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ startLocator: END_LOCATOR }),
    );
    expect(client.synthesized).toHaveLength(1);
    expect(client.synthesized[0]?.sequence).toBe(0);
    expect(client.synthesized[0]?.sourceRange).toEqual(spokenRange);
    expect(coordinator.observe().failure).toBeUndefined();
    expect(coordinator.startAtLocator(START_LOCATOR)).toBe(true);
    await coordinator.close();
  });

  it("synthesizes a spoken Piper fragment with no recognized sentence boundary", async () => {
    const profileId = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => profileId),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => true),
    };
    const fragment = preparedSegment(
      "Fragmento sintético sin cierre",
      SOURCE_RANGE,
      0,
    );
    const { client, coordinator } = createHarness({
      result: completeSegments([fragment]),
      profileCompatibility,
    });

    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    expect(client.synthesized).toHaveLength(1);
    expect(client.synthesized[0]?.text).toBe(fragment.text);
    expect(coordinator.observe().failure).toBeUndefined();
    await coordinator.close();
  });

  it("rechecks native runtime configuration immediately before child start", async () => {
    const profileId = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
    const profileCompatibility: ProductNarrationProfileCompatibility = {
      activeProfileId: vi.fn(() => profileId),
      isProfileCurrentlyAllowed: vi.fn(() => true),
      isProfileStartAllowed: vi.fn(async () => true),
    };
    const { client, coordinator, prepareNarration } = createHarness({
      profileCompatibility,
    });
    vi.spyOn(client, "profileConfigurationAvailability")
      .mockResolvedValueOnce("available")
      .mockResolvedValueOnce("unavailable");
    const start = vi.spyOn(client, "start");

    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(
      () => coordinator.observe().failure === "tts-profile-unavailable",
    );

    expect(start).not.toHaveBeenCalled();
    expect(prepareNarration).not.toHaveBeenCalled();
    expect(coordinator.observe().availability).toBe("unavailable");
    await coordinator.close();
  });

  it.each(["resolve", "reject"] as const)(
    "SAC-04 records audible metrics only after deferred persisted 0.75x preparation %s",
    async (outcome) => {
      const playbackPreferenceRepository: NarrationPlaybackPreferenceRepository =
        {
          read: vi.fn(async () => ({
            status: "ready" as const,
            playbackRatePercent: 75 as const,
          })),
          write: vi.fn(async () => ({ status: "saved" as const })),
          reset: vi.fn(async () => ({ status: "saved" as const })),
        };
      const { coordinator, backend, clock, intervals } = createHarness({
        playbackPreferenceRepository,
      });
      let resolve!: () => void;
      let reject!: () => void;
      vi.spyOn(backend, "preparePlaybackRate").mockImplementation(
        () =>
          new Promise<void>((yes, no) => {
            resolve = () => {
              backend.ratePrepared = true;
              yes();
            };
            reject = () => no(new Error("synthetic preparation failure"));
          }),
      );
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(
          () =>
            resolve !== undefined &&
            coordinator.observe().state?.phase === "playing",
        );
        clock.advance(2_000);
        intervals[0]!();
        expect(backend.active).toBeUndefined();
        expect(coordinator.observe().metrics).toMatchObject({
          commandToAudibleMs: undefined,
          playbackMs: 0,
        });
        if (outcome === "resolve") {
          const startedAt = clock.nowMs;
          resolve();
          await Promise.resolve();
          await Promise.resolve();
          intervals[0]!();
          await settleUntil(() => backend.active !== undefined);
          expect(coordinator.observe().metrics.commandToAudibleMs).toBe(
            startedAt,
          );
          clock.advance(250);
          intervals[0]!();
          expect(coordinator.observe().metrics.playbackMs).toBe(250);
        } else {
          reject();
          await Promise.resolve();
          await Promise.resolve();
          intervals[0]!();
          await settleUntil(
            () => coordinator.observe().failure === "audio-playback-failed",
          );
          expect(coordinator.observe().metrics).toMatchObject({
            commandToAudibleMs: undefined,
            playbackMs: 0,
          });
        }
      } finally {
        resolve?.();
        await coordinator.close();
      }
    },
  );

  it("prepares from the active locator, dispatches one exact request, and transfers sole audio ownership", async () => {
    const sensitiveText = "Private synthetic narration.";
    const { backend, client, coordinator, prepareNarration } = createHarness({
      result: completeResult(sensitiveText),
    });
    const audibleProgress: ProductNarrationAudibleProgressObservation[] = [];
    coordinator.subscribeAudibleProgress((observation) => {
      audibleProgress.push(observation);
    });

    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    expect(prepareNarration).toHaveBeenCalledWith(
      expect.objectContaining({
        startLocator: START_LOCATOR,
        profile: "narration-bilingual-v2",
        defaultLanguage: "en",
        maximumSegments: 8,
        signal: expect.any(AbortSignal),
      }),
    );
    expect(client.synthesized).toHaveLength(1);
    expect(client.synthesized[0]?.text).toBe(sensitiveText);
    expect(backend.active?.request.sampleCountSamples).toBe(360_000);
    expect(client.observe().retainedAudioUnits).toBe(0);
    expect(coordinator.observe().metrics).toMatchObject({
      acceptedAudioUnitCount: 1,
      acceptedAudioSampleFrames: 360_000,
      commandToAudibleMs: 1_000,
      underrunCount: 0,
    });
    expect(audibleProgress).toEqual([
      expect.objectContaining({
        kind: "segment-started",
        sessionId: "session:product-test-1",
        generationId: "generation:product-test-1",
        segmentId: "segment:product-test-0",
        sequence: 0,
        sourceRange: SOURCE_RANGE,
        playedSampleFrames: 0,
        sampleCountSamples: 360_000,
      }),
    ]);
    const serializedSnapshot = JSON.stringify(coordinator.observe());
    expect(serializedSnapshot).not.toContain(sensitiveText);
    expect(serializedSnapshot).not.toContain("session:product-test");
    expect(serializedSnapshot).not.toContain("segment:product-test");
    expect(serializedSnapshot).not.toContain("sourceRange");

    coordinator.updateVisibleLocator(
      decodeReadingLocatorV1({
        ...START_LOCATOR,
        textOffsetCodePoints: START_LOCATOR.textOffsetCodePoints + 6,
      }),
    );
    expect(coordinator.observe().navigation.settling).toBe(false);
    expect(prepareNarration).toHaveBeenCalledTimes(1);

    backend.finish();
    expect(audibleProgress.at(-1)).toMatchObject({
      kind: "segment-completed",
      segmentId: "segment:product-test-0",
      sequence: 0,
      sourceRange: SOURCE_RANGE,
      playedSampleFrames: 360_000,
    });
    expect(JSON.stringify(audibleProgress)).not.toContain(sensitiveText);
    expect(JSON.stringify(audibleProgress)).not.toContain("payload");

    await coordinator.stop();
    expect(client.shutdownCount).toBe(1);
    expect(client.releaseCount).toBe(1);
    expect(coordinator.observe().state).toBeUndefined();
  });

  it("invalidates identity before cancelling an active complete-waveform request", async () => {
    const { client, coordinator } = createHarness({ blockSynthesis: true });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => client.state === "generating");

    const stop = coordinator.stop();
    expect(coordinator.observe().state?.phase).toBe("stopped");
    await stop;

    expect(client.cancelled).toEqual([
      {
        sessionId: "session:product-test-1",
        generationId: "generation:product-test-1",
        segmentId: "segment:product-test-0",
      },
    ]);
    expect(coordinator.observe().state).toBeUndefined();
    expect(coordinator.observe().metrics.acceptedAudioUnitCount).toBe(0);
  });

  it("aborts an active sensitive narration preparation before shutdown", async () => {
    let observedSignal: AbortSignal | undefined;
    const { client, coordinator } = createHarness({
      prepareNarration: async (request) => {
        observedSignal = request.signal;
        await new Promise<void>((resolve) => {
          request.signal?.addEventListener("abort", () => resolve(), {
            once: true,
          });
        });
        return Object.freeze({
          status: "cancelled",
          error: decodeOperationalErrorV1({
            schemaVersion: 1,
            code: "operation-cancelled",
            category: "cancellation",
            severity: "recoverable",
          }),
        });
      },
    });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => observedSignal !== undefined);

    await coordinator.stop();

    expect(observedSignal?.aborted).toBe(true);
    expect(client.shutdownCount).toBe(1);
    expect(coordinator.observe().state).toBeUndefined();
  });

  it("keeps passive viewport movement independent until the visible-passage action is explicit", async () => {
    const { client, coordinator, prepareNarration } = createHarness({
      blockSynthesis: true,
    });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => client.state === "generating");
    const firstReplacement = decodeReadingLocatorV1({
      ...START_LOCATOR,
      textOffsetCodePoints: START_LOCATOR.textOffsetCodePoints + 1,
    });
    const settledReplacement = decodeReadingLocatorV1({
      ...START_LOCATOR,
      textOffsetCodePoints: START_LOCATOR.textOffsetCodePoints + 2,
    });

    coordinator.updateVisibleLocator(firstReplacement);

    expect(coordinator.observe().navigation).toMatchObject({
      playIntent: "playing",
      settling: false,
    });
    coordinator.updateVisibleLocator(settledReplacement);
    await Promise.resolve();
    expect(client.cancelled).toHaveLength(0);
    expect(coordinator.observe().metrics.acceptedAudioUnitCount).toBe(0);
    expect(prepareNarration).toHaveBeenCalledTimes(1);

    coordinator.startAtVisibleLocator();
    await settleUntil(() => client.cancelled.length === 1);
    await settleUntil(() => prepareNarration.mock.calls.length === 2);

    expect(prepareNarration.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        startLocator: settledReplacement,
      }),
    );
    await settleUntil(() => client.synthesized.length === 2);
    expect(client.synthesized[1]).toMatchObject({
      sessionId: "session:product-test-3",
      generationId: "generation:product-test-3",
    });
    await coordinator.close();
  });

  it("keeps paused narration stable across passive movement until an explicit visible-passage start", async () => {
    const { coordinator, prepareNarration } = createHarness();
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");
    coordinator.pause();
    const replacement = decodeReadingLocatorV1({
      ...START_LOCATOR,
      textOffsetCodePoints: START_LOCATOR.textOffsetCodePoints + 1,
    });

    coordinator.updateVisibleLocator(replacement);
    await Promise.resolve();
    expect(coordinator.observe().navigation.playIntent).toBe("paused");
    expect(prepareNarration).toHaveBeenCalledTimes(1);

    coordinator.resume();
    await settleUntil(
      () =>
        coordinator.observe().navigation.playIntent === "playing" &&
        coordinator.observe().state?.phase === "playing",
    );
    expect(prepareNarration).toHaveBeenCalledTimes(1);

    coordinator.startAtVisibleLocator();
    await settleUntil(() => prepareNarration.mock.calls.length === 2);
    expect(prepareNarration.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ startLocator: replacement }),
    );
    await coordinator.close();
  });

  it("B01 starts the capacity-bound FIFO without replacing the generation", async () => {
    let sequence = 0;
    const { coordinator, client, backend, intervals } = createHarness({
      prepareNarration: async () => {
        const offset = sequence++ * 12;
        const range = sourceRange(offset, offset + 12);
        return batchSegments([preparedSegment("Synthetic.", range)], range.end);
      },
    });
    client.synthesisSampleFrames = 48_000;
    await coordinator.checkAvailability();
    await coordinator.setSelection({ kind: "prepared", targetMs: 600_000 });
    coordinator.start();
    try {
      for (
        let turn = 0;
        turn < 100 &&
        coordinator.observe().metrics.acceptedAudioUnitCount < 256;
        turn += 1
      ) {
        for (let tick = 0; tick < 100; tick += 1) await Promise.resolve();
        intervals.forEach((tick) => tick());
      }
      expect(coordinator.observe().state?.canPlayAvailableAudio).toBe(true);
      const generation = client.synthesized[0]?.generationId;
      expect(coordinator.playAvailableAudio()).toBe(true);
      expect(backend.active).toBeDefined();
      expect(client.cancelled).toHaveLength(0);
      expect(
        client.synthesized.every((item) => item.generationId === generation),
      ).toBe(true);
      coordinator.pause();
      expect(coordinator.playAvailableAudio()).toBe(false);
    } finally {
      await coordinator.close();
    }
  });

  it.each(["playing", "paused"] as const)(
    "B04 terminates %s intent after unavailable placement and requires explicit restart after recovery",
    async (intent) => {
      const { coordinator, client } = createHarness();
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      if (intent === "paused") coordinator.pause();
      await coordinator.beginExternalNavigation("chapter-navigation");
      coordinator.settleReaderPlacement({
        status: "unavailable",
        reason: "chapter-too-large",
      });
      coordinator.settleReaderPlacement({
        status: "unavailable",
        reason: "chapter-too-large",
      });
      expect(coordinator.observe().navigation).toMatchObject({
        playIntent: "inactive",
        settling: false,
        canStart: false,
      });
      const calls = client.synthesized.length;
      coordinator.start();
      coordinator.startAtVisibleLocator();
      expect(coordinator.startAtLocator(START_LOCATOR)).toBe(false);
      for (let tick = 0; tick < 30; tick += 1) await Promise.resolve();
      expect(client.synthesized).toHaveLength(calls);
      coordinator.settleReaderPlacement({
        status: "settled",
        locator: END_LOCATOR,
      });
      coordinator.settleExternalNavigation(END_LOCATOR);
      expect(coordinator.observe().navigation).toMatchObject({
        canStart: true,
        playIntent: "inactive",
      });
      expect(client.synthesized).toHaveLength(calls);
      coordinator.start();
      await settleUntil(() => client.synthesized.length > calls);
      await coordinator.close();
    },
  );

  it("B03 discards incompatible overlapping boundaries after profile replacement", async () => {
    let profileId = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
    const { buildMinimalEpubFixture } = await vi.importActual<{
      buildMinimalEpubFixture(options: {
        chapterDocument: string;
      }): Promise<Uint8Array>;
    }>("../../../../packages/epub/test-support/epub-fixture.ts");
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>${"The quiet reader follows the path through the garden and remembers each ordinary detail. ".repeat(12)}</p></body></html>`,
      }),
    );
    if (!opened.ok) throw new Error("synthetic publication failed");
    const ranges = async (
      profile: "narration-piper-v2" | "narration-chatterbox-v1",
    ) => {
      const prepared = await opened.publication.prepareNarration({
        startLocator: opened.publication.locators[0]!.startLocator,
        profile,
        defaultLanguage: "en",
        maximumSegments: 16,
      });
      if (prepared.status !== "batch" && prepared.status !== "complete")
        throw new Error("synthetic preparation failed");
      return prepared.segments.map(({ sourceRange: range }) =>
        sourceRange(
          range.start.textOffsetCodePoints,
          range.end.textOffsetCodePoints,
        ),
      );
    };
    const oldRanges = await ranges("narration-piper-v2");
    const newRanges = await ranges("narration-chatterbox-v1");
    await opened.publication.close();
    expect(oldRanges[0]!.end.textOffsetCodePoints).toBeLessThan(
      newRanges[0]!.end.textOffsetCodePoints,
    );
    const { coordinator } = createHarness({
      profileCompatibility: {
        activeProfileId: () => profileId,
        activeLanguage: () => "en",
        isProfileCurrentlyAllowed: () => true,
        isProfileStartAllowed: async () => true,
      },
      prepareNarration: async () =>
        completeSegments(
          (profileId.startsWith("piper-") ? oldRanges : newRanges).map(
            (range) => preparedSegment("Synthetic ordinary prose.", range),
          ),
        ),
    });
    const requests: ProductNarrationNavigationRequest[] = [];
    coordinator.subscribeNavigationRequests((request) =>
      requests.push(request),
    );
    try {
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      await coordinator.stopForConfigurationChange();
      profileId = "chatterbox-multilingual-v3-cuda-bf16-default-v4";
      await coordinator.refreshSelectedProfile();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      coordinator.goToNextBoundary();
      await settleUntil(() => requests.length > 0);
      expect(requests[0]?.locator).toEqual(newRanges[1]!.start);
    } finally {
      await coordinator.close();
    }
  });

  it("moves by bounded stable prepared-segment boundaries after containment", async () => {
    const ranges = [
      sourceRange(0, 12),
      sourceRange(12, 24),
      sourceRange(24, 36),
    ] as const;
    const result = completeSegments(
      ranges.map((range, index) =>
        preparedSegment(`Synthetic segment ${String(index)}.`, range),
      ),
    );
    const { coordinator, prepareNarration } = createHarness({ result });
    const navigationRequests: Array<{
      readonly event: "next-segment" | "paragraph-leaf" | "previous-segment";
      readonly locator: ReadingLocatorV1;
    }> = [];
    coordinator.subscribeNavigationRequests((request) => {
      navigationRequests.push(request);
    });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    expect(coordinator.observe().navigation).toMatchObject({
      canGoPrevious: false,
      canGoNext: true,
    });
    coordinator.goToNextBoundary();
    await settleUntil(() => navigationRequests.length === 1);

    expect(navigationRequests[0]).toEqual({
      event: "next-segment",
      locator: ranges[1].start,
    });
    expect(coordinator.observe().navigation.settling).toBe(true);

    coordinator.settleExternalNavigation(ranges[1].start);
    await settleUntil(() => prepareNarration.mock.calls.length === 2);
    expect(prepareNarration.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ startLocator: ranges[1].start }),
    );
    await coordinator.close();
  });

  it("places an explicit paragraph leaf target before starting an inactive run", async () => {
    const { coordinator, prepareNarration } = createHarness();
    const requests: ProductNarrationNavigationRequest[] = [];
    coordinator.subscribeNavigationRequests((request) => {
      requests.push(request);
    });
    await coordinator.checkAvailability();

    expect(coordinator.startAtLocator(END_LOCATOR)).toBe(true);
    expect(coordinator.observe().navigation).toMatchObject({
      playIntent: "playing",
      settling: true,
    });
    expect(prepareNarration).not.toHaveBeenCalled();
    await settleUntil(() => requests.length === 1);
    expect(requests[0]).toEqual({
      event: "paragraph-leaf",
      locator: START_LOCATOR,
    });

    coordinator.settleExternalNavigation(START_LOCATOR);
    await settleUntil(() => prepareNarration.mock.calls.length === 1);
    expect(prepareNarration.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ startLocator: START_LOCATOR }),
    );
    await coordinator.close();
  });

  it("invalidates active work before requesting a paragraph leaf replacement", async () => {
    const { client, coordinator, prepareNarration } = createHarness();
    const requests: ProductNarrationNavigationRequest[] = [];
    coordinator.subscribeNavigationRequests((request) => {
      requests.push(request);
      expect(client.shutdownCount).toBe(1);
      expect(coordinator.observe().metrics.retainedAudioUnitCount).toBe(0);
    });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    expect(coordinator.startAtLocator(END_LOCATOR)).toBe(true);
    expect(coordinator.startAtLocator(START_LOCATOR)).toBe(false);
    await settleUntil(() => requests.length === 1);
    expect(coordinator.observe().navigation.settling).toBe(true);
    expect(prepareNarration).toHaveBeenCalledTimes(1);

    coordinator.settleExternalNavigation(requests[0]!.locator);
    await settleUntil(() => prepareNarration.mock.calls.length === 2);
    expect(prepareNarration.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ startLocator: START_LOCATOR }),
    );
    await coordinator.close();
  });

  it("contains the old session on close and cannot publish stale audible progress into a replacement", async () => {
    const first = createHarness({ blockSynthesis: true });
    const second = createHarness();
    const firstProgress: ProductNarrationAudibleProgressObservation[] = [];
    first.coordinator.subscribeAudibleProgress((observation) => {
      firstProgress.push(observation);
    });
    await first.coordinator.checkAvailability();
    first.coordinator.start();
    await settleUntil(() => first.client.state === "generating");

    await first.coordinator.close();
    first.client.completeBlockedSynthesis();
    await Promise.resolve();

    expect(first.client.cancelled).toHaveLength(1);
    expect(firstProgress).toEqual([]);
    expect(first.coordinator.observe().navigation).toMatchObject({
      playIntent: "inactive",
      settling: false,
    });
    expect(first.coordinator.observe().metrics.acceptedAudioUnitCount).toBe(0);

    await second.coordinator.checkAvailability();
    second.coordinator.start();
    await settleUntil(
      () => second.coordinator.observe().state?.phase === "playing",
    );
    expect(second.coordinator.observe().metrics.acceptedAudioUnitCount).toBe(1);
    expect(first.coordinator.observe().metrics.acceptedAudioUnitCount).toBe(0);
    await second.coordinator.close();
  });

  it("freezes quick or prepared selection while a session is active", async () => {
    const { coordinator } = createHarness();
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    await coordinator.setSelection({ kind: "prepared", targetMs: 60_000 });

    expect(coordinator.observe().selection).toEqual({ kind: "quick" });
    await coordinator.close();
  });

  it.each([60_000, 120_000, 300_000, 600_000] as const)(
    "MAF-11 reconciles completed Prepared %s to Quick without losing the heard end or auto-playing",
    async (targetMs) => {
      const { coordinator, client, backend, intervals, prepareNarration } =
        createHarness();
      const heard: ProductNarrationAudibleProgressObservation[] = [];
      coordinator.subscribeAudibleProgress((event) => heard.push(event));
      await coordinator.checkAvailability();
      expect(
        await coordinator.setSelection({ kind: "prepared", targetMs }),
      ).toBe(true);
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      backend.finish();
      for (const tick of [...intervals]) tick();
      expect(coordinator.observe().state?.phase).toBe("complete");
      const finalHeard = heard.at(-1);
      expect(finalHeard).toMatchObject({
        kind: "segment-completed",
        sourceRange: SOURCE_RANGE,
      });
      try {
        const phases: Array<string | undefined> = [];
        const unsubscribe = coordinator.subscribe(() =>
          phases.push(coordinator.observe().state?.phase),
        );
        await expect(coordinator.setSelection({ kind: "quick" })).resolves.toBe(
          true,
        );
        unsubscribe();
        expect(phases.every((phase) => phase === "complete")).toBe(true);
        expect(coordinator.observe().state).toMatchObject({
          phase: "complete",
          mode: { kind: "quick" },
          targetMs: 15_000,
        });
        for (const tick of [...intervals]) tick();
        expect(coordinator.observe().selection).toEqual({ kind: "quick" });
        expect(coordinator.observe().failure).toBeUndefined();
        expect(client.synthesized).toHaveLength(1);
        expect(heard.at(-1)).toBe(finalHeard);
        coordinator.startAtVisibleLocator();
        await settleUntil(
          () => client.synthesized.length === 2 && backend.active !== undefined,
        );
        expect(coordinator.observe().state?.phase).toBe("playing");
        expect(prepareNarration).toHaveBeenCalledTimes(2);
      } finally {
        // Restore a coherent selection before disposing an intentionally red run.
        await coordinator.setSelection({ kind: "prepared", targetMs });
        await coordinator.close();
      }
    },
  );

  it.each(["start", "visible", "locator"] as const)(
    "MAF-04 contains %s throughout pending optional removal and releases after failure",
    async (start) => {
      const { coordinator, client } = createHarness();
      await coordinator.checkAvailability();
      let release!: () => void;
      const removal = new Promise<void>((resolve) => {
        release = resolve;
      });
      const optional = {
        remove: vi.fn(async () => {
          await removal;
          throw new Error("synthetic removal failure");
        }),
      };
      const pending = createNarrationSettingsActions(false).removeChatterbox(
        coordinator,
        optional,
      );
      const rejected = expect(pending).rejects.toThrow(
        "synthetic removal failure",
      );
      try {
        await settleUntil(() => optional.remove.mock.calls.length === 1);
        if (start === "start") coordinator.start();
        else if (start === "visible") coordinator.startAtVisibleLocator();
        else coordinator.startAtLocator(START_LOCATOR);
        await Promise.resolve();
        expect(coordinator.observe().availability).not.toBe("available");
        expect(client.startedProfiles).toHaveLength(0);
      } finally {
        release();
        await rejected;
        await coordinator.close();
      }
    },
  );

  it.each(["healthy", "absent", "failed", "language-changed"] as const)(
    "MAF-10 reselection admits only an existing healthy same-profile owner: %s",
    async (owner) => {
      let freeCapacity = true;
      let language: "en" | "es" = "en";
      const compatibility = {
        activeProfileId: () => CHATTERBOX_OPTIONAL_PROFILE_ID,
        activeLanguage: () => language,
        isProfileCurrentlyAllowed: () => freeCapacity,
        isProfileContinuationAllowed: () => true,
        isProfileStartAllowed: vi.fn(async () => freeCapacity),
      };
      const { coordinator, client } = createHarness({
        profileCompatibility: compatibility,
      });
      const hardware = { selectProfile: vi.fn(async () => true) };
      const optional = {
        select: vi.fn(async () => ({
          ...new OptionalChatterboxClient().observe(),
          state: "failed" as const,
        })),
      };
      try {
        await coordinator.checkAvailability();
        if (owner !== "absent") {
          coordinator.start();
          await settleUntil(
            () => coordinator.observe().state?.phase === "playing",
          );
        }
        if (owner === "failed") client.state = "failed";
        if (owner === "language-changed") language = "es";
        freeCapacity = false;
        const before = client.observe();
        const selected = await createNarrationSettingsActions(
          false,
        ).selectProfile(
          CHATTERBOX_OPTIONAL_PROFILE_ID,
          hardware,
          coordinator,
          optional,
        );
        expect(selected).toBe(owner === "healthy");
        expect(optional.select).toHaveBeenCalledTimes(
          owner === "healthy" ? 0 : 1,
        );
        expect(hardware.selectProfile).not.toHaveBeenCalled();
        expect(client.shutdownCount).toBe(0);
        expect(client.observe()).toEqual(before);
      } finally {
        await coordinator.close();
      }
    },
  );

  it("hydrates a saved start preference before availability becomes actionable", async () => {
    const repository: NarrationStartPreferenceRepository = {
      read: vi.fn(async () => ({
        status: "ready" as const,
        selection: Object.freeze({
          kind: "prepared" as const,
          targetMs: 120_000 as const,
        }),
      })),
      write: vi.fn(async () => ({ status: "saved" as const })),
      reset: vi.fn(async () => ({ status: "saved" as const })),
    };
    const { coordinator } = createHarness({
      startPreferenceRepository: repository,
    });

    expect(coordinator.observe()).toMatchObject({
      availability: "checking",
      startPreferenceStatus: "loading",
      selection: { kind: "quick" },
    });
    await coordinator.checkAvailability();
    expect(coordinator.observe()).toMatchObject({
      availability: "available",
      startPreferenceStatus: "ready",
      selection: { kind: "prepared", targetMs: 120_000 },
    });
    expect(repository.write).not.toHaveBeenCalled();
    await coordinator.close();
  });

  it("persists closed start choices and preserves unsupported future state", async () => {
    const writable: NarrationStartPreferenceRepository = {
      read: vi.fn(async () => ({
        status: "missing" as const,
        selection: Object.freeze({ kind: "quick" as const }),
      })),
      write: vi.fn(async () => ({ status: "saved" as const })),
      reset: vi.fn(async () => ({ status: "saved" as const })),
    };
    const first = createHarness({ startPreferenceRepository: writable });
    await first.coordinator.checkAvailability();
    await expect(
      first.coordinator.setSelection({ kind: "prepared", targetMs: 300_000 }),
    ).resolves.toBe(true);
    expect(writable.write).toHaveBeenCalledWith({
      kind: "prepared",
      targetMs: 300_000,
    });
    await first.coordinator.close();

    const future: NarrationStartPreferenceRepository = {
      read: vi.fn(async () => ({
        status: "unsupported-version" as const,
        selection: Object.freeze({ kind: "quick" as const }),
      })),
      write: vi.fn(async () => ({ status: "unsupported-version" as const })),
      reset: vi.fn(async () => ({ status: "unsupported-version" as const })),
    };
    const second = createHarness({ startPreferenceRepository: future });
    await second.coordinator.checkAvailability();
    expect(second.coordinator.observe().canPersistStartPreference).toBe(false);
    await expect(
      second.coordinator.setSelection({ kind: "prepared", targetMs: 60_000 }),
    ).resolves.toBe(false);
    expect(future.write).not.toHaveBeenCalled();
    await second.coordinator.close();
  });

  it("persists speed immediately while preserving TTS identity and queued source PCM until the boundary", async () => {
    const playbackPreference: NarrationPlaybackPreferenceRepository = {
      read: vi.fn(async () => ({
        status: "missing" as const,
        playbackRatePercent: 100 as const,
      })),
      write: vi.fn(async () => ({ status: "saved" as const })),
      reset: vi.fn(async () => ({ status: "saved" as const })),
    };
    const result = completeSegments([
      preparedSegment("Synthetic first sentence.", sourceRange(0, 12)),
      preparedSegment("Synthetic second sentence.", sourceRange(12, 24)),
    ]);
    const { backend, client, coordinator } = createHarness({
      result,
      playbackPreferenceRepository: playbackPreference,
    });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(
      () =>
        client.synthesized.length === 2 &&
        backend.active !== undefined &&
        coordinator.observe().metrics.retainedAudioUnitCount === 2,
    );
    const initialIdentity = {
      sessionId: client.synthesized[0]!.sessionId,
      generationId: client.synthesized[0]!.generationId,
    };
    const retainedBefore = coordinator.observe().metrics.retainedAudioUnitCount;

    await expect(coordinator.setPlaybackRatePercent(75)).resolves.toBe(true);
    expect(coordinator.observe()).toMatchObject({
      playbackRatePercent: 75,
      state: {
        selectedPlaybackRatePercent: 75,
        activePlaybackRatePercent: 100,
        pendingPlaybackRatePercent: 75,
      },
    });
    expect(playbackPreference.write).toHaveBeenCalledWith(75);
    expect(client.cancelled).toEqual([]);
    expect(client.shutdownCount).toBe(0);
    expect(client.synthesized).toHaveLength(2);
    expect(coordinator.observe().metrics.retainedAudioUnitCount).toBe(
      retainedBefore,
    );
    expect(client.synthesized[1]).toMatchObject(initialIdentity);
    expect(backend.active?.request.playbackRate).toBe(1);

    await Promise.resolve();
    backend.finish();
    expect(backend.active?.request.playbackRate).toBe(0.75);
    expect(coordinator.observe().state).toMatchObject({
      activePlaybackRatePercent: 75,
      pendingPlaybackRatePercent: null,
    });
    await coordinator.close();
  });

  it("publishes only a fixed failure when narration preparation is rejected", async () => {
    const { coordinator, client } = createHarness({
      result: Object.freeze({
        status: "resource-limit-exceeded",
        error: decodeOperationalErrorV1({
          schemaVersion: 1,
          code: "resource-exhausted",
          category: "resource",
          severity: "recoverable",
        }),
      }),
    });
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().failure !== undefined);

    expect(coordinator.observe().failure).toBe("narration-preparation-failed");
    expect(coordinator.observe().preparationFailure).toBe(
      "resource-limit-exceeded",
    );
    expect(coordinator.observe().state?.phase).toBe("failed");
    expect(JSON.stringify(coordinator.observe())).not.toContain(
      "Private synthetic narration",
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(client.observe().state).toBe("stopped");
    expect(coordinator.observe()).toMatchObject({
      failure: "narration-preparation-failed",
      preparationFailure: "resource-limit-exceeded",
      state: { phase: "failed", readyMs: 0 },
      metrics: { retainedAudioUnitCount: 0 },
    });
    await coordinator.stop();
    expect(coordinator.observe().failure).toBeUndefined();
    expect(coordinator.observe().preparationFailure).toBeUndefined();
    expect(coordinator.observe().state).toBeUndefined();
    await coordinator.close();
  });

  it("waits for failed narration-preparation cleanup before rechecking availability", async () => {
    const prepareNarration = vi
      .fn<OpenedPublication["prepareNarration"]>()
      .mockRejectedValueOnce(new Error("content-free-preparation-rejection"))
      .mockResolvedValueOnce(completeResult());
    const { client, coordinator } = createHarness({ prepareNarration });
    const performShutdown = client.shutdown.bind(client);
    let releaseShutdown = (): void => undefined;
    const shutdownBlocked = new Promise<void>((resolve) => {
      releaseShutdown = resolve;
    });
    const shutdown = vi
      .spyOn(client, "shutdown")
      .mockImplementation(async () => {
        await shutdownBlocked;
        await performShutdown();
      });

    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(
      () => coordinator.observe().failure === "narration-preparation-failed",
    );
    await settleUntil(() => shutdown.mock.calls.length === 1);

    coordinator.resetRecoveryEpisode();
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(resolve, 0);
    });
    expect(coordinator.observe().availability).toBe("checking");

    releaseShutdown();
    await settleUntil(() => coordinator.observe().availability === "available");
    expect(coordinator.observe()).toMatchObject({
      failure: undefined,
      metrics: { retainedAudioUnitCount: 0 },
    });
    expect(client.observe()).toEqual({
      serviceInstanceId: undefined,
      state: "stopped",
      hasActiveGeneration: false,
      retainedAudioUnits: 0,
    });

    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");
    expect(prepareNarration).toHaveBeenCalledTimes(2);
    expect(client.synthesized).toHaveLength(1);
    expect(client.synthesized[0]).toMatchObject({
      sessionId: "session:product-test-3",
      generationId: "generation:product-test-3",
    });
    await coordinator.close();
  });

  it("clears a retained preparation failure on a new explicit start", async () => {
    const prepareNarration = vi
      .fn<OpenedPublication["prepareNarration"]>()
      .mockRejectedValueOnce(new Error("content-free-preparation-rejection"))
      .mockResolvedValueOnce(completeResult());
    const { coordinator, client } = createHarness({ prepareNarration });
    try {
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(
        () => coordinator.observe().failure === "narration-preparation-failed",
      );
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(client.observe().state).toBe("stopped");
      expect(coordinator.observe().failure).toBe(
        "narration-preparation-failed",
      );

      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      expect(coordinator.observe().failure).toBeUndefined();
      expect(coordinator.observe().preparationFailure).toBeUndefined();
      expect(prepareNarration).toHaveBeenCalledTimes(2);
      expect(client.synthesized).toHaveLength(1);
    } finally {
      await coordinator.close();
    }
  });

  it.each([false, true])(
    "SAC-06 retries retained Stop owners before same-profile Recheck (persistent failure: %s)",
    async (persistent) => {
      const { coordinator, client } = createHarness();
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      const performShutdown = client.shutdown.bind(client);
      const shutdown = vi
        .spyOn(client, "shutdown")
        .mockRejectedValue(new Error("synthetic shutdown failure"));
      try {
        await coordinator.stop();
        expect(coordinator.observe()).toMatchObject({
          availability: "unavailable",
          recovery: { phase: "contained", failureCode: "cleanup-failed" },
        });
        if (!persistent) shutdown.mockImplementation(performShutdown);

        coordinator.resetRecoveryEpisode();
        await settleUntil(
          () => coordinator.observe().availability !== "checking",
        );
        if (persistent) {
          expect(coordinator.observe()).toMatchObject({
            availability: "unavailable",
            failure: "tts-service-failed",
            recovery: { phase: "contained", failureCode: "cleanup-failed" },
          });
          coordinator.start();
          expect(client.startedProfiles).toHaveLength(1);
        } else {
          expect(coordinator.observe()).toMatchObject({
            availability: "available",
            failure: undefined,
            state: undefined,
            recovery: { phase: "operational" },
          });
          coordinator.start();
          await settleUntil(() => client.startedProfiles.length === 2);
          await settleUntil(
            () => coordinator.observe().state?.phase === "playing",
          );
        }
      } finally {
        shutdown.mockRestore();
        await coordinator.close();
      }
    },
  );

  it.each([false, true])(
    "R7-01 retains failed operational cleanup on explicit recheck (persistent: %s)",
    async (persistent) => {
      const { coordinator, client, backend, intervals } = createHarness();
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      const shutdown = vi
        .spyOn(client, "shutdown")
        .mockRejectedValue(new Error("synthetic cleanup failure"));
      try {
        backend.active!.callbacks.failed();
        intervals[0]?.();
        await settleUntil(
          () => coordinator.observe().recovery.phase === "contained",
        );
        if (!persistent) shutdown.mockRestore();
        coordinator.resetRecoveryEpisode();
        await settleUntil(
          () => coordinator.observe().availability !== "checking",
        );
        expect(client.startedProfiles).toHaveLength(1);
        if (persistent) {
          expect(coordinator.observe().availability).toBe("unavailable");
          coordinator.start();
          await Promise.resolve();
          expect(client.startedProfiles).toHaveLength(1);
        } else {
          expect(client.observe().state).toBe("stopped");
          expect(coordinator.observe().recovery.phase).toBe("operational");
          coordinator.start();
          await settleUntil(() => client.startedProfiles.length === 2);
        }
      } finally {
        shutdown.mockRestore();
        await coordinator.close();
      }
    },
  );

  it("R7-01 failed recovery retains service ownership across recheck", async () => {
    const { coordinator, client, backend, intervals } = createHarness();
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");
    backend.active!.callbacks.failed();
    intervals[0]?.();
    await settleUntil(() => coordinator.observe().recovery.canRecover);
    const prepare = vi
      .spyOn(client, "prepare")
      .mockRejectedValue(new Error("synthetic recovery failure"));
    const shutdown = vi
      .spyOn(client, "shutdown")
      .mockRejectedValue(new Error("synthetic cleanup failure"));
    try {
      coordinator.recover();
      await settleUntil(
        () => coordinator.observe().recovery.phase === "unavailable",
      );
      coordinator.resetRecoveryEpisode();
      await settleUntil(
        () => coordinator.observe().availability !== "checking",
      );
      expect(coordinator.observe().availability).toBe("unavailable");
      expect(client.startedProfiles).toHaveLength(2);
      shutdown.mockRestore();
      coordinator.resetRecoveryEpisode();
      await settleUntil(
        () => coordinator.observe().recovery.phase === "operational",
      );
      expect(client.observe().state).toBe("stopped");
      expect(client.startedProfiles).toHaveLength(2);
    } finally {
      prepare.mockRestore();
      shutdown.mockRestore();
      await coordinator.close();
    }
  });

  it.each(["reject", "delay"] as const)(
    "R7-01 recheck cannot bypass backend cleanup: %s",
    async (mode) => {
      const { coordinator, backend, client, intervals } = createHarness();
      let settle!: () => void;
      const pending = new Promise<void>((resolve) => {
        settle = resolve;
      });
      vi.spyOn(backend, "close").mockImplementation(() =>
        mode === "reject"
          ? Promise.reject(new Error("synthetic backend failure"))
          : pending,
      );
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");
      backend.active!.callbacks.failed();
      intervals[0]?.();
      coordinator.resetRecoveryEpisode();
      if (mode === "reject") {
        await settleUntil(
          () => coordinator.observe().recovery.phase === "contained",
        );
        coordinator.resetRecoveryEpisode();
        await settleUntil(
          () => coordinator.observe().availability !== "checking",
        );
        expect(coordinator.observe().availability).toBe("unavailable");
      } else {
        for (let i = 0; i < 20; i += 1) await Promise.resolve();
        coordinator.start();
        expect(client.startedProfiles).toHaveLength(1);
        settle();
        await settleUntil(
          () => coordinator.observe().recovery.phase === "operational",
        );
      }
      expect(client.startedProfiles).toHaveLength(1);
      settle();
      await coordinator.close();
    },
  );

  it("prioritizes failed cleanup over a preparation diagnostic", async () => {
    const { coordinator, client } = createHarness({
      prepareNarration: vi
        .fn<OpenedPublication["prepareNarration"]>()
        .mockRejectedValue(new Error("content-free-preparation-rejection")),
    });
    const shutdown = vi
      .spyOn(client, "shutdown")
      .mockRejectedValue(new Error("content-free-shutdown-rejection"));
    try {
      await coordinator.checkAvailability();
      coordinator.start();
      await settleUntil(
        () => coordinator.observe().recovery.failureCode === "cleanup-failed",
      );
      expect(coordinator.observe()).toMatchObject({
        failure: "tts-service-failed",
        availability: "unavailable",
        recovery: { canRecover: false, failureCode: "cleanup-failed" },
        metrics: { retainedAudioUnitCount: 0 },
      });
      coordinator.start();
      expect(client.startedProfiles).toHaveLength(1);
    } finally {
      shutdown.mockRestore();
      await coordinator.close();
    }
  });

  it.each(["tts-service-internal-failure", "tts-service-timeout"] as const)(
    "CLB-03 contains %s before exposing one explicit identity-safe restart",
    async (code) => {
      const { client, coordinator, prepareNarration } = createHarness();
      const prepare = vi
        .spyOn(client, "prepare")
        .mockRejectedValueOnce(new TtsProcessClientError(code));
      await coordinator.checkAvailability();

      coordinator.start();
      await settleUntil(
        () => coordinator.observe().recovery.phase === "recovery-available",
      );

      expect(prepare).toHaveBeenCalledTimes(1);
      expect(client.observe()).toEqual({
        serviceInstanceId: undefined,
        state: "stopped",
        hasActiveGeneration: false,
        retainedAudioUnits: 0,
      });
      expect(coordinator.observe()).toMatchObject({
        failure: "tts-service-failed",
        recovery: {
          phase: "recovery-available",
          failureCode: "model-warm-failed",
          canRecover: true,
          explicitAttemptUsed: false,
        },
        metrics: {
          retainedAudioUnitCount: 0,
          discardedAudioUnitCount: 0,
        },
      });
      expect(prepareNarration).not.toHaveBeenCalled();

      coordinator.recover();
      await settleUntil(() => coordinator.observe().state?.phase === "playing");

      expect(prepare).toHaveBeenCalledTimes(2);
      expect(prepareNarration).toHaveBeenCalledWith(
        expect.objectContaining({ startLocator: START_LOCATOR }),
      );
      expect(client.synthesized.at(-1)).toMatchObject({
        sessionId: "session:product-test-3",
        generationId: "generation:product-test-3",
      });
      expect(coordinator.observe().recovery).toMatchObject({
        phase: "operational",
        explicitAttemptUsed: true,
        canRecover: false,
      });
      expect(coordinator.observe().failure).toBeUndefined();
      await coordinator.close();
    },
  );

  it.each([
    ["prepare_tts_service", "tts-service-internal-failure"],
    ["prepare_tts_service", "tts-service-timeout"],
    ["synthesize_tts_segment", "tts-service-internal-failure"],
    ["synthesize_tts_segment", "tts-service-timeout"],
  ] as const)(
    "CLB-03 real client acknowledges contained %s/%s before explicit recovery",
    async (failedCommand, failureCode) => {
      let serviceInstanceId = "";
      let starts = 0;
      let failNext = true;
      let containedId: string | undefined;
      const shutdownIds: unknown[] = [];
      const control = (kind: string, extra = {}) => ({
        schemaVersion: 1,
        protocolVersion: 1,
        kind,
        serviceInstanceId,
        ...extra,
      });
      const state = (value: string) => control("state", { state: value });
      const capabilities = () =>
        control("capabilities", {
          report: {
            schemaVersion: 1,
            capabilities: {
              localSpeechGeneration: "unknown",
              streamingGeneration: "unsupported",
              generationCancellation: "unsupported",
              hardwareAcceleration: "unknown",
              cpuFallback: "unsupported",
            },
          },
          cancellationContainment:
            "identity-invalidation-then-worker-termination",
        });
      // The native real-child diagnostic separately proves this exact error ->
      // identity-bound stopping/stopped response. Keep the actual client here.
      const invoke = async (
        command: string,
        args?: Record<string, unknown>,
      ): Promise<unknown> => {
        if (
          command === "tts_profile_configuration_available" ||
          command === "exact_tts_demo_available"
        )
          return true;
        if (command === "start_tts_service") {
          serviceInstanceId = `service:contained-${++starts}`;
          containedId = undefined;
          return [
            state("handshaking"),
            control("handshakeAccepted"),
            state("unloaded"),
            capabilities(),
          ];
        }
        if (command === failedCommand && failNext) {
          failNext = false;
          containedId = serviceInstanceId;
          throw failureCode;
        }
        if (command === "prepare_tts_service")
          return [
            state("loading"),
            state("warming"),
            state("ready"),
            capabilities(),
          ];
        if (command === "synthesize_tts_segment")
          return new Float32Array(360_000).buffer;
        if (command === "cancel_tts_generation")
          throw "tts-service-invalid-state";
        if (command === "shutdown_tts_service") {
          shutdownIds.push(args?.serviceInstanceId);
          if (args?.serviceInstanceId !== (containedId ?? serviceInstanceId))
            throw "tts-service-cancelled";
          return [state("stopping"), state("stopped")];
        }
        throw new Error("unexpected synthetic command");
      };
      const client = new TtsProcessClient(
        async <T>(command: string, args?: Record<string, unknown>) =>
          (await invoke(command, args)) as T,
      );
      const { coordinator, backend, intervals } = createHarness({
        serviceClient: client,
      });
      try {
        await coordinator.checkAvailability();
        coordinator.start();
        await settleUntil(
          () => coordinator.observe().recovery.phase === "recovery-available",
        );
        expect(starts).toBe(1);
        expect(shutdownIds).toEqual(["service:contained-1"]);
        expect(client.observe()).toMatchObject({
          state: "stopped",
          serviceInstanceId: undefined,
          retainedAudioUnits: 0,
        });
        coordinator.recover();
        await settleUntil(
          () => coordinator.observe().state?.phase === "playing",
        );
        expect(starts).toBe(2);
        expect(client.observe().serviceInstanceId).toBe("service:contained-2");
        expect(coordinator.observe().recovery).toMatchObject({
          explicitAttemptUsed: true,
          canRecover: false,
        });
        backend.active?.callbacks.failed();
        intervals[0]?.();
        await settleUntil(
          () => coordinator.observe().recovery.phase === "unavailable",
        );
        coordinator.recover();
        expect(starts).toBe(2);
        expect(coordinator.observe().recovery.canRecover).toBe(false);
      } finally {
        await coordinator.close();
      }
    },
  );

  it("replays a failed audible segment from its start without stale audio", async () => {
    const { backend, client, coordinator, intervals, prepareNarration } =
      createHarness();
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");

    backend.active?.callbacks.failed();
    intervals[0]?.();
    await settleUntil(
      () => coordinator.observe().recovery.phase === "recovery-available",
    );
    expect(client.releaseCount).toBe(1);
    expect(coordinator.observe().metrics).toMatchObject({
      retainedAudioUnitCount: 0,
      discardedAudioUnitCount: 0,
    });

    coordinator.recover();
    await settleUntil(() => prepareNarration.mock.calls.length === 2);
    await settleUntil(() => client.synthesized.length === 2);
    expect(prepareNarration.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ startLocator: SOURCE_RANGE.start }),
    );
    expect(client.synthesized.at(-1)).toMatchObject({
      sessionId: "session:product-test-3",
      generationId: "generation:product-test-3",
    });
    await coordinator.close();
  });

  it("contains protocol failures with no restart action", async () => {
    const { client, coordinator } = createHarness();
    vi.spyOn(client, "start").mockRejectedValueOnce(
      new TtsProcessClientError("tts-service-invalid-response"),
    );
    await coordinator.checkAvailability();

    coordinator.start();
    await settleUntil(
      () => coordinator.observe().recovery.phase === "unavailable",
    );

    expect(coordinator.observe().recovery).toMatchObject({
      failureCode: "protocol-failed",
      action: "contain-and-stop",
      canRecover: false,
      explicitAttemptUsed: false,
    });
    coordinator.recover();
    await Promise.resolve();
    expect(client.synthesized).toHaveLength(0);
    expect(JSON.stringify(coordinator.observe())).not.toContain(
      "Private synthetic narration",
    );
    await coordinator.close();
  });

  it("contains a cancellation timeout after invalidating the active identity", async () => {
    const { client, coordinator } = createHarness({ blockSynthesis: true });
    vi.spyOn(client, "cancel").mockRejectedValueOnce(
      new TtsProcessClientError("tts-service-timeout"),
    );
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => client.state === "generating");

    client.state = "failed";
    coordinator.setVolumePercent(-1);
    await settleUntil(
      () => coordinator.observe().recovery.phase === "contained",
    );

    expect(coordinator.observe().recovery).toMatchObject({
      failureCode: "cancellation-timeout",
      action: "contain-and-stop",
      canRecover: false,
    });
    expect(coordinator.observe().navigation.playIntent).toBe("inactive");
    expect(client.observe()).toMatchObject({
      state: "stopped",
      serviceInstanceId: undefined,
      retainedAudioUnits: 0,
    });
    await coordinator.close();
  });

  it("NCC-02 keeps a spent recovery budget across automatic recheck until an explicit recheck", async () => {
    const { client, coordinator } = createHarness();
    vi.spyOn(client, "prepare")
      .mockRejectedValueOnce(
        new ProductNarrationRecoveryError("model-warm-failed"),
      )
      .mockRejectedValueOnce(
        new ProductNarrationRecoveryError("model-warm-failed"),
      );
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(
      () => coordinator.observe().recovery.phase === "recovery-available",
    );

    coordinator.recover();
    await settleUntil(
      () => coordinator.observe().recovery.phase === "unavailable",
    );

    expect(coordinator.observe().recovery).toMatchObject({
      failureCode: "repeated-recovery-failed",
      canRecover: false,
      explicitAttemptUsed: true,
    });
    coordinator.recover();
    await Promise.resolve();
    expect(client.synthesized).toHaveLength(0);

    const recovery = coordinator.observe().recovery;
    const source = Object.assign(new EventTarget(), {
      visibilityState: "hidden" as DocumentVisibilityState,
    });
    const target = {
      ensureChecked: async () => ({}) as HardwareCompatibilitySnapshotV1,
      check: async () => ({}) as HardwareCompatibilitySnapshotV1,
    };
    const refresh = vi.spyOn(coordinator, "refreshSelectedProfile");
    const disconnect = bindHardwareCompatibilityChecks(target, source, () =>
      coordinator.refreshSelectedProfile(),
    );
    source.visibilityState = "visible";
    source.dispatchEvent(new Event("visibilitychange"));
    await settleUntil(
      () =>
        refresh.mock.calls.length === 1 &&
        coordinator.observe().availability !== "checking",
    );
    expect(coordinator.observe().recovery).toEqual(recovery);
    expect(client.synthesized).toHaveLength(0);
    disconnect();
    coordinator.resetRecoveryEpisode();
    expect(coordinator.observe().recovery).toMatchObject({
      phase: "operational",
      failureCode: undefined,
      explicitAttemptUsed: false,
    });
    await coordinator.close();
  });
});
