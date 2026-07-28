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
} from "./pcm-playback";
import {
  ProductNarrationCoordinator,
  type ProductNarrationAudibleProgressObservation,
  type ProductNarrationClock,
  type ProductNarrationCoordinatorDependencies,
  type ProductNarrationServiceClient,
} from "./product-narration-coordinator";
import type {
  TtsAudioUnit,
  TtsGenerationScope,
  TtsProcessClientObservation,
} from "./process-client";

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

class FakeServiceClient implements ProductNarrationServiceClient {
  public availability: "available" | "unavailable" = "available";
  public state: TtsServiceStateV1 = "stopped";
  public readonly synthesized: NarrationSegmentV1[] = [];
  public readonly cancelled: TtsGenerationScope[] = [];
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

  public observe(): TtsProcessClientObservation {
    return Object.freeze({
      serviceInstanceId:
        this.state === "stopped" ? undefined : "service:product-test",
      state: this.state,
      hasActiveGeneration: this.state === "generating",
      retainedAudioUnits: this.#unit === undefined ? 0 : 1,
    });
  }

  public async start(): Promise<TtsProcessClientObservation> {
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
): PreparedNarrationSegment {
  return Object.freeze({
    text: text as PreparedNarrationSegment["text"],
    sourceRange: range,
    boundaryReason: "sentence",
    measurements: Object.freeze({
      sourceCodePoints: createIndex(12),
      narrationCodePoints: createIndex(Array.from(text).length),
      narrationUtf8Bytes: createIndex(new TextEncoder().encode(text).length),
      sentenceCount: createIndex(1),
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
      sentenceCount: createIndex(segments.length),
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
    resolveLocator: vi.fn(),
    resolveTarget: vi.fn(),
    prepareNarration,
    close: vi.fn(async () => undefined),
  };
}

function createHarness(
  options: {
    readonly result?: NarrationPreparationResult;
    readonly availability?: "available" | "unavailable";
    readonly blockSynthesis?: boolean;
    readonly prepareNarration?: OpenedPublication["prepareNarration"];
  } = {},
) {
  const clock = new ManualClock();
  const client = new FakeServiceClient(clock);
  client.availability = options.availability ?? "available";
  client.blockSynthesis = options.blockSynthesis ?? false;
  const backend = new FakePlaybackBackend();
  const prepareNarration = vi.fn<OpenedPublication["prepareNarration"]>(
    options.prepareNarration ??
      (async () => options.result ?? completeResult()),
  );
  const publication = createPublication(prepareNarration);
  const intervals: Array<() => void> = [];
  const timeouts: Array<{
    readonly callback: () => void;
    readonly delay: number;
  }> = [];
  const dependencies: ProductNarrationCoordinatorDependencies = {
    client,
    clock,
    createIdentifier: (kind, sequence) =>
      `${kind}:product-test-${String(sequence)}`,
    createPlayer: (scheduler: AdaptiveBufferScheduler) =>
      new AdaptivePcmPlayer(scheduler, backend, (callback) => callback()),
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
    setTimeout: (callback, delay) => {
      const timeout = { callback, delay };
      timeouts.push(timeout);
      return timeout;
    },
    clearTimeout: (handle) => {
      const index = timeouts.indexOf(
        handle as { readonly callback: () => void; readonly delay: number },
      );
      if (index >= 0) {
        timeouts.splice(index, 1);
      }
    },
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
    timeouts,
    prepareNarration,
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

    coordinator.updateActiveLocator(
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

  it("invalidates on the first passive visual change and restarts only after the trailing 500 ms settlement", async () => {
    const { client, coordinator, prepareNarration, timeouts } = createHarness({
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

    coordinator.updateActiveLocator(firstReplacement);

    expect(coordinator.observe().navigation).toMatchObject({
      playIntent: "playing",
      settling: true,
    });
    expect(timeouts).toEqual([
      expect.objectContaining({
        delay: 500,
      }),
    ]);
    coordinator.updateActiveLocator(settledReplacement);
    expect(timeouts).toHaveLength(1);
    await settleUntil(() => client.cancelled.length === 1);
    expect(coordinator.observe().metrics.acceptedAudioUnitCount).toBe(0);

    timeouts[0]?.callback();
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

  it("keeps paused intent at the settled passage and resumes from that locator", async () => {
    const { coordinator, prepareNarration, timeouts } = createHarness();
    await coordinator.checkAvailability();
    coordinator.start();
    await settleUntil(() => coordinator.observe().state?.phase === "playing");
    coordinator.pause();
    const replacement = decodeReadingLocatorV1({
      ...START_LOCATOR,
      textOffsetCodePoints: START_LOCATOR.textOffsetCodePoints + 1,
    });

    coordinator.updateActiveLocator(replacement);
    await settleUntil(() => timeouts.length === 1);
    timeouts[0]?.callback();
    await settleUntil(
      () =>
        coordinator.observe().navigation.settling === false &&
        coordinator.observe().state?.phase === "paused",
    );

    expect(coordinator.observe().navigation.playIntent).toBe("paused");
    expect(prepareNarration).toHaveBeenCalledTimes(1);

    coordinator.resume();
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
      readonly event: "next-segment" | "previous-segment";
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
});
