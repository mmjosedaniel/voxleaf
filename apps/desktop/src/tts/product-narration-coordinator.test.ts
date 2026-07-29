import type {
  NarrationPreparationResult,
  OpenedPublication,
  PreparedNarrationSegment,
} from "@voxleaf/epub";
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

import type { AdaptiveBufferScheduler } from "./adaptive-buffer-scheduler";
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
import { TtsProcessClientError } from "./process-client";

class ManualClock implements ProductNarrationClock {
  public nowMs = 0;

  public advance(milliseconds: number): void {
    this.nowMs += milliseconds;
  }
}

class FakePlaybackBackend implements PcmPlaybackBackend {
  public active:
    | {
        readonly request: PcmPlaybackRequest;
        readonly callbacks: PcmPlaybackCallbacks;
      }
    | undefined;
  public closed = false;

  public start(
    request: PcmPlaybackRequest,
    callbacks: PcmPlaybackCallbacks,
  ): PcmPlaybackHandle {
    this.active = { request, callbacks };
    return {
      sequence: request.sequence,
      playedSampleFrames: 0,
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

  public async start(profileId?: string): Promise<TtsProcessClientObservation> {
    this.startedProfiles.push(profileId);
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
  const publication = createPublication(prepareNarration);
  const intervals: Array<() => void> = [];
  const dependencies: ProductNarrationCoordinatorDependencies = {
    client,
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
    ...(options.profileCompatibility === undefined
      ? {}
      : { profileCompatibility: options.profileCompatibility }),
  };
  const coordinator = new ProductNarrationCoordinator(
    publication,
    START_LOCATOR,
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
    );
    expect(client.startedProfiles).toEqual([profileId]);
    expect(prepareNarration).toHaveBeenCalledWith(
      expect.objectContaining({ profile: "narration-piper-v2" }),
    );
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
        profile: "narration-v1",
        defaultLanguage: "es",
        maximumSegments: 16,
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

    coordinator.setSelection({ kind: "prepared", targetMs: 60_000 });

    expect(coordinator.observe().selection).toEqual({ kind: "quick" });
    await coordinator.close();
  });

  it("publishes only a fixed failure when narration preparation is rejected", async () => {
    const { coordinator } = createHarness({
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
    expect(coordinator.observe().state?.phase).toBe("failed");
    expect(JSON.stringify(coordinator.observe())).not.toContain(
      "Private synthetic narration",
    );
    await coordinator.close();
  });

  it("contains a warm failure before exposing one explicit identity-safe restart", async () => {
    const { client, coordinator, prepareNarration } = createHarness();
    const prepare = vi
      .spyOn(client, "prepare")
      .mockRejectedValueOnce(
        new ProductNarrationRecoveryError("model-warm-failed"),
      );
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
  });

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

  it("makes a failed explicit restart terminal until an explicit recheck", async () => {
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

    coordinator.resetRecoveryEpisode();
    expect(coordinator.observe().recovery).toMatchObject({
      phase: "operational",
      failureCode: undefined,
      explicitAttemptUsed: false,
    });
    await coordinator.close();
  });
});
