import {
  createOperationalErrorV1,
  decodeAudioFrameV1,
} from "../contracts/index.js";
import type {
  AudioFrameV1,
  NarrationSegmentV1,
  OperationalErrorV1,
} from "../contracts/index.js";
import { createCount } from "../primitives/index.js";
import type {
  Count,
  FrameId,
  Hertz,
  Index,
  SampleCount,
} from "../primitives/index.js";
import type { ManualClock } from "./manual-clock.js";

/** Metadata used to construct a synthetic audio frame for a fake response. */
export interface FakeTtsFrameScriptV1 {
  readonly frameId: FrameId;
  readonly sequence: Index;
  readonly sampleRateHz: Hertz;
  readonly sampleCountSamples: SampleCount;
  readonly channelCount: Count;
  readonly endOfSegment: boolean;
}

/**
 * `acknowledge` resolves cancellation immediately. `complete` models a
 * provider that cannot stop already-started work and emits its normal result
 * later, making stale-result handling testable.
 */
export type FakeTtsCancellationBehavior = "acknowledge" | "complete";

export type FakeTtsSourceStep =
  | {
      readonly kind: "frames";
      readonly responseDelayMs: number;
      readonly cancellationBehavior: FakeTtsCancellationBehavior;
      readonly frames: readonly FakeTtsFrameScriptV1[];
    }
  | {
      readonly kind: "error";
      readonly responseDelayMs: number;
      readonly cancellationBehavior: FakeTtsCancellationBehavior;
      readonly error: OperationalErrorV1;
    };

export type FakeTtsRequestStatus =
  "pending" | "cancellation-requested" | "cancelled" | "completed";

interface FakeTtsResultIdentityV1 {
  readonly sessionId: NarrationSegmentV1["sessionId"];
  readonly generationId: NarrationSegmentV1["generationId"];
  readonly segmentId: NarrationSegmentV1["segmentId"];
}

export interface FakeTtsFramesResultV1 extends FakeTtsResultIdentityV1 {
  readonly kind: "frames";
  readonly frames: readonly AudioFrameV1[];
}

export interface FakeTtsErrorResultV1 extends FakeTtsResultIdentityV1 {
  readonly kind: "error";
  readonly error: OperationalErrorV1;
}

export interface FakeTtsCancelledResultV1 extends FakeTtsResultIdentityV1 {
  readonly kind: "cancelled";
  readonly error: OperationalErrorV1;
}

export type FakeTtsResultV1 =
  FakeTtsFramesResultV1 | FakeTtsErrorResultV1 | FakeTtsCancelledResultV1;

export type FakeTtsSourceErrorCode = "script-exhausted";

export class FakeTtsSourceError extends Error {
  public readonly code: FakeTtsSourceErrorCode;

  public constructor(code: FakeTtsSourceErrorCode) {
    super("Fake TTS source could not provide a scripted response.");
    this.name = "FakeTtsSourceError";
    this.code = code;
  }
}

export interface FakeTtsRequest {
  cancel(): boolean;
  getResult(): FakeTtsResultV1 | undefined;
  getStatus(): FakeTtsRequestStatus;
}

export interface FakeTtsSource {
  generate(segment: NarrationSegmentV1): FakeTtsRequest;
  getRequestCount(): Count;
  getRemainingStepCount(): Count;
  getPendingRequestCount(): Count;
}

function getResultIdentity(
  segment: NarrationSegmentV1,
): FakeTtsResultIdentityV1 {
  return Object.freeze({
    sessionId: segment.sessionId,
    generationId: segment.generationId,
    segmentId: segment.segmentId,
  });
}

function createFramesResult(
  segment: NarrationSegmentV1,
  frameScripts: readonly FakeTtsFrameScriptV1[],
): FakeTtsFramesResultV1 {
  const frames = Object.freeze(
    frameScripts.map((frame) =>
      decodeAudioFrameV1({
        schemaVersion: 1,
        frameId: frame.frameId,
        sessionId: segment.sessionId,
        generationId: segment.generationId,
        segmentId: segment.segmentId,
        sequence: frame.sequence,
        sampleRateHz: frame.sampleRateHz,
        sampleCountSamples: frame.sampleCountSamples,
        channelCount: frame.channelCount,
        endOfSegment: frame.endOfSegment,
      }),
    ),
  );

  return Object.freeze({
    kind: "frames",
    ...getResultIdentity(segment),
    frames,
  });
}

class ScriptedFakeTtsRequest implements FakeTtsRequest {
  #result: FakeTtsResultV1 | undefined;
  #status: FakeTtsRequestStatus = "pending";

  public constructor(
    private readonly segment: NarrationSegmentV1,
    private readonly step: FakeTtsSourceStep,
  ) {}

  public cancel(): boolean {
    if (this.#status !== "pending") {
      return false;
    }

    if (this.step.cancellationBehavior === "complete") {
      this.#status = "cancellation-requested";
      return true;
    }

    this.#result = Object.freeze({
      kind: "cancelled",
      ...getResultIdentity(this.segment),
      error: createOperationalErrorV1("operation-cancelled"),
    });
    this.#status = "cancelled";
    return true;
  }

  public getResult(): FakeTtsResultV1 | undefined {
    return this.#result;
  }

  public getStatus(): FakeTtsRequestStatus {
    return this.#status;
  }

  public complete(): void {
    if (this.#status === "cancelled" || this.#status === "completed") {
      return;
    }

    this.#result =
      this.step.kind === "frames"
        ? createFramesResult(this.segment, this.step.frames)
        : Object.freeze({
            kind: "error",
            ...getResultIdentity(this.segment),
            error: this.step.error,
          });
    this.#status = "completed";
  }
}

class ScriptedFakeTtsSource implements FakeTtsSource {
  #requestCount = 0;
  #requests: ScriptedFakeTtsRequest[] = [];
  #steps: readonly FakeTtsSourceStep[];

  public constructor(
    private readonly clock: ManualClock,
    steps: readonly FakeTtsSourceStep[],
  ) {
    this.#steps = Object.freeze([...steps]);
  }

  public generate(segment: NarrationSegmentV1): FakeTtsRequest {
    const step = this.#steps[this.#requestCount];
    this.#requestCount += 1;

    if (step === undefined) {
      throw new FakeTtsSourceError("script-exhausted");
    }

    const request = new ScriptedFakeTtsRequest(segment, step);
    this.#requests.push(request);
    this.clock.schedule(step.responseDelayMs, () => request.complete());
    return request;
  }

  public getRequestCount(): Count {
    return createCount(this.#requestCount);
  }

  public getRemainingStepCount(): Count {
    return createCount(Math.max(0, this.#steps.length - this.#requestCount));
  }

  public getPendingRequestCount(): Count {
    return createCount(
      this.#requests.filter((request) => {
        const status = request.getStatus();
        return status === "pending" || status === "cancellation-requested";
      }).length,
    );
  }
}

/**
 * Creates a deterministic, metadata-only TTS test double. Every completion is
 * driven by the supplied manual clock; it never loads a model, emits audio
 * payloads, starts a process, contacts a service, or uses hardware.
 */
export function createFakeTtsSource(
  clock: ManualClock,
  steps: readonly FakeTtsSourceStep[],
): FakeTtsSource {
  return new ScriptedFakeTtsSource(clock, steps);
}
