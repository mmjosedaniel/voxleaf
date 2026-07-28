import { decodeLocatorRangeV1, decodeReadingLocatorV1 } from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { describe, expect, it, vi } from "vitest";

import type { AdaptivePreparationUiState } from "../tts/adaptive-preparation";
import type {
  ProductNarrationAudibleProgressObservation,
  ProductNarrationSnapshot,
} from "../tts/product-narration-coordinator";
import {
  bindNarrationPositionPersistence,
  type NarrationPositionSaveSink,
  type NarrationPositionSource,
} from "./narration-position-save-bridge";

const BASE_LOCATOR =
  VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator;
const SOURCE_RANGE = decodeLocatorRangeV1({
  schemaVersion: 1,
  start: decodeReadingLocatorV1({
    ...BASE_LOCATOR,
    textOffsetCodePoints: 4,
  }),
  end: decodeReadingLocatorV1({
    ...BASE_LOCATOR,
    textOffsetCodePoints: 18,
  }),
});

function uiState(
  phase: AdaptivePreparationUiState["phase"],
): AdaptivePreparationUiState {
  return Object.freeze({
    mode: Object.freeze({ kind: "quick" }),
    phase,
    readyMs: 0,
    targetMs: 15_000,
    progressValueMs: 0,
    estimatedWaitMs: undefined,
    lowBuffer: false,
    allRemainingAudioReady: false,
    resourceCeilingReached: false,
    pauseContinuesPreparation: phase === "paused",
    canPause: phase === "playing",
    canResume: phase === "paused",
    canStop: true,
    volumePercent: 100,
    playbackRate: 1,
  });
}

function snapshot(
  playIntent: ProductNarrationSnapshot["navigation"]["playIntent"],
  phase?: AdaptivePreparationUiState["phase"],
): ProductNarrationSnapshot {
  return Object.freeze({
    availability: "available",
    selection: Object.freeze({ kind: "quick" }),
    state: phase === undefined ? undefined : uiState(phase),
    failure: phase === "failed" ? "tts-service-failed" : undefined,
    metrics: Object.freeze({
      commandToAudibleMs: undefined,
      bufferingMs: 0,
      intentionalWaitMs: 0,
      playbackMs: 0,
      underrunCount: 0,
      acceptedAudioUnitCount: 0,
      acceptedAudioSampleFrames: 0,
      retainedAudioUnitCount: 0,
      discardedAudioUnitCount: 0,
    }),
    serviceState: phase === "failed" ? "failed" : "ready",
    navigation: Object.freeze({
      playIntent,
      settling: false,
      canGoPrevious: false,
      canGoNext: false,
    }),
  });
}

function observation(
  kind: ProductNarrationAudibleProgressObservation["kind"],
): ProductNarrationAudibleProgressObservation {
  return Object.freeze({
    kind,
    observedAtMs: 1,
    sessionId: "session:synthetic",
    generationId: "generation:synthetic",
    segmentId: "segment:synthetic",
    sequence: 0,
    sourceRange: SOURCE_RANGE,
    playedSampleFrames: kind === "segment-completed" ? 24_000 : 0,
    sampleCountSamples: 24_000,
  });
}

class FakeNarrationSource implements NarrationPositionSource {
  #snapshot = snapshot("inactive");
  readonly #listeners = new Set<() => void>();
  readonly #audibleListeners = new Set<
    (observation: ProductNarrationAudibleProgressObservation) => void
  >();

  public observe(): ProductNarrationSnapshot {
    return this.#snapshot;
  }

  public subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  public subscribeAudibleProgress(
    listener: (observation: ProductNarrationAudibleProgressObservation) => void,
  ): () => void {
    this.#audibleListeners.add(listener);
    return () => this.#audibleListeners.delete(listener);
  }

  public publish(next: ProductNarrationSnapshot): void {
    this.#snapshot = next;
    for (const listener of this.#listeners) {
      listener();
    }
  }

  public publishAudible(
    next: ProductNarrationAudibleProgressObservation,
  ): void {
    for (const listener of this.#audibleListeners) {
      listener(next);
    }
  }
}

function createSink(): NarrationPositionSaveSink & {
  readonly beginNarration: ReturnType<typeof vi.fn>;
  readonly finishNarration: ReturnType<typeof vi.fn>;
  readonly flush: ReturnType<typeof vi.fn>;
  readonly recordHeardCheckpoint: ReturnType<typeof vi.fn>;
} {
  return {
    beginNarration: vi.fn(() => true),
    finishNarration: vi.fn(async () => undefined),
    flush: vi.fn(async () => undefined),
    recordHeardCheckpoint: vi.fn(() => true),
  };
}

describe("narration position save bridge", () => {
  it("persists exact segment boundaries and ignores periodic progress", () => {
    const source = new FakeNarrationSource();
    const sink = createSink();
    const unbind = bindNarrationPositionPersistence(source, sink);

    source.publish(snapshot("playing", "preparing"));
    source.publishAudible(observation("segment-started"));
    source.publishAudible(observation("progress"));
    source.publishAudible(observation("segment-completed"));

    expect(sink.beginNarration).toHaveBeenCalledOnce();
    expect(sink.recordHeardCheckpoint).toHaveBeenCalledTimes(2);
    expect(sink.recordHeardCheckpoint.mock.calls[0]?.[0]).toEqual({
      kind: "segment-started",
      segmentId: "segment:synthetic",
      locator: SOURCE_RANGE.start,
    });
    expect(sink.recordHeardCheckpoint.mock.calls[1]?.[0]).toEqual({
      kind: "segment-completed",
      segmentId: "segment:synthetic",
      locator: SOURCE_RANGE.end,
    });

    unbind();
  });

  it("flushes once per pause or buffering transition and on failure", () => {
    const source = new FakeNarrationSource();
    const sink = createSink();
    bindNarrationPositionPersistence(source, sink);

    source.publish(snapshot("playing", "playing"));
    source.publish(snapshot("paused", "paused"));
    source.publish(snapshot("paused", "paused"));
    source.publish(snapshot("playing", "buffering"));
    source.publish(snapshot("playing", "buffering"));
    source.publish(snapshot("inactive", "failed"));

    expect(sink.flush).toHaveBeenCalledTimes(2);
    expect(sink.finishNarration).toHaveBeenCalledOnce();
  });

  it("finishes an active persistence authority when the binding closes", () => {
    const source = new FakeNarrationSource();
    const sink = createSink();
    const unbind = bindNarrationPositionPersistence(source, sink);

    source.publish(snapshot("playing", "playing"));
    unbind();
    source.publishAudible(observation("segment-started"));

    expect(sink.finishNarration).toHaveBeenCalledOnce();
    expect(sink.recordHeardCheckpoint).not.toHaveBeenCalled();
  });
});
