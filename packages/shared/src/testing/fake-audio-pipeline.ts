import { calculateAudioFrameDurationMs } from "../contracts/index.js";
import type {
  AudioFrameV1,
  GenerationWorkIdentityV1,
} from "../contracts/index.js";
import { createCount, createMilliseconds } from "../primitives/index.js";
import type {
  Count,
  FrameId,
  Index,
  Milliseconds,
  SegmentId,
} from "../primitives/index.js";
import type { ManualClock } from "./manual-clock.js";

export interface FakeAudioSourceStepV1 {
  /** Delay from source construction until this metadata frame becomes available. */
  readonly arrivalDelayMs: number;
  readonly frame: AudioFrameV1;
}

export interface FakeAudioSource {
  takeAvailableFrames(): readonly AudioFrameV1[];
  getAvailableFrameCount(): Count;
  getPendingFrameCount(): Count;
}

export type FakeAudioSinkOutcomeKind =
  | "accepted"
  | "stale-session"
  | "stale-generation"
  | "duplicate-frame-id"
  | "out-of-order"
  | "sequence-gap"
  | "frame-after-end-of-stream"
  | "end-of-stream";

export interface FakeAudioSinkOutcomeV1 {
  readonly kind: FakeAudioSinkOutcomeKind;
  readonly frameId: FrameId;
  readonly sessionId: GenerationWorkIdentityV1["sessionId"];
  readonly generationId: GenerationWorkIdentityV1["generationId"];
  readonly segmentId: SegmentId;
  /** The accepted active-frame duration after this outcome. */
  readonly activePlayableDurationMs: Milliseconds;
}

export type FakeAudioSinkErrorCode = "playable-duration-overflow";

export class FakeAudioSinkError extends Error {
  public readonly code: FakeAudioSinkErrorCode;

  public constructor(code: FakeAudioSinkErrorCode) {
    super("Fake audio sink duration exceeds the supported range.");
    this.name = "FakeAudioSinkError";
    this.code = code;
  }
}

export interface FakeAudioSink {
  /** Consumes frame metadata immediately and records a deterministic outcome. */
  consume(frame: AudioFrameV1): FakeAudioSinkOutcomeV1;
  /** Schedules metadata consumption through the manual clock. */
  scheduleConsume(frame: AudioFrameV1, delayMs: number): void;
  getActivePlayableDurationMs(): Milliseconds;
  getOutcomes(): readonly FakeAudioSinkOutcomeV1[];
}

interface SegmentContinuityState {
  readonly lastSequence: Index;
  readonly ended: boolean;
}

function createOutcome(
  kind: FakeAudioSinkOutcomeKind,
  frame: AudioFrameV1,
  activePlayableDurationMs: Milliseconds,
): FakeAudioSinkOutcomeV1 {
  return Object.freeze({
    kind,
    frameId: frame.frameId,
    sessionId: frame.sessionId,
    generationId: frame.generationId,
    segmentId: frame.segmentId,
    activePlayableDurationMs,
  });
}

class ManuallyTimedFakeAudioSource implements FakeAudioSource {
  #availableFrames: AudioFrameV1[] = [];
  #pendingFrameCount: Count;

  public constructor(
    clock: ManualClock,
    steps: readonly FakeAudioSourceStepV1[],
  ) {
    this.#pendingFrameCount = createCount(steps.length);

    for (const step of steps) {
      clock.schedule(step.arrivalDelayMs, () => {
        this.#availableFrames.push(step.frame);
        this.#pendingFrameCount = createCount(this.#pendingFrameCount - 1);
      });
    }
  }

  public takeAvailableFrames(): readonly AudioFrameV1[] {
    const frames = Object.freeze([...this.#availableFrames]);
    this.#availableFrames = [];
    return frames;
  }

  public getAvailableFrameCount(): Count {
    return createCount(this.#availableFrames.length);
  }

  public getPendingFrameCount(): Count {
    return this.#pendingFrameCount;
  }
}

class ManuallyTimedFakeAudioSink implements FakeAudioSink {
  #activePlayableDurationMs = createMilliseconds(0);
  #outcomes: FakeAudioSinkOutcomeV1[] = [];
  #receivedFrameIds = new Set<FrameId>();
  #segmentStates = new Map<SegmentId, SegmentContinuityState>();

  public constructor(
    private readonly clock: ManualClock,
    private readonly activeWork: GenerationWorkIdentityV1,
  ) {}

  public consume(frame: AudioFrameV1): FakeAudioSinkOutcomeV1 {
    const kind = this.getOutcomeKind(frame);

    if (kind === "accepted" || kind === "end-of-stream") {
      this.recordAcceptedFrame(frame);
    }

    const outcome = createOutcome(kind, frame, this.#activePlayableDurationMs);
    this.#outcomes.push(outcome);
    return outcome;
  }

  public scheduleConsume(frame: AudioFrameV1, delayMs: number): void {
    this.clock.schedule(delayMs, () => {
      this.consume(frame);
    });
  }

  public getActivePlayableDurationMs(): Milliseconds {
    return this.#activePlayableDurationMs;
  }

  public getOutcomes(): readonly FakeAudioSinkOutcomeV1[] {
    return Object.freeze([...this.#outcomes]);
  }

  private getOutcomeKind(frame: AudioFrameV1): FakeAudioSinkOutcomeKind {
    if (frame.sessionId !== this.activeWork.sessionId) {
      return "stale-session";
    }

    if (frame.generationId !== this.activeWork.generationId) {
      return "stale-generation";
    }

    if (this.#receivedFrameIds.has(frame.frameId)) {
      return "duplicate-frame-id";
    }

    const segmentState = this.#segmentStates.get(frame.segmentId);
    if (segmentState === undefined) {
      return frame.endOfSegment ? "end-of-stream" : "accepted";
    }

    if (segmentState.ended) {
      return "frame-after-end-of-stream";
    }

    if (frame.sequence <= segmentState.lastSequence) {
      return "out-of-order";
    }

    if (
      segmentState.lastSequence === Number.MAX_SAFE_INTEGER ||
      frame.sequence !== segmentState.lastSequence + 1
    ) {
      return "sequence-gap";
    }

    return frame.endOfSegment ? "end-of-stream" : "accepted";
  }

  private recordAcceptedFrame(frame: AudioFrameV1): void {
    const frameDurationMs = calculateAudioFrameDurationMs(frame);
    if (
      frameDurationMs >
      Number.MAX_SAFE_INTEGER - this.#activePlayableDurationMs
    ) {
      throw new FakeAudioSinkError("playable-duration-overflow");
    }

    this.#activePlayableDurationMs = createMilliseconds(
      this.#activePlayableDurationMs + frameDurationMs,
    );
    this.#receivedFrameIds.add(frame.frameId);
    this.#segmentStates.set(
      frame.segmentId,
      Object.freeze({
        lastSequence: frame.sequence,
        ended: frame.endOfSegment,
      }),
    );
  }
}

/**
 * Creates a source whose frame metadata becomes available only when the
 * supplied manual clock reaches each scripted arrival time. It never reads or
 * writes audio data, accesses a device, or performs I/O.
 */
export function createFakeAudioSource(
  clock: ManualClock,
  steps: readonly FakeAudioSourceStepV1[],
): FakeAudioSource {
  return new ManuallyTimedFakeAudioSource(clock, steps);
}

/**
 * Creates a metadata-only test sink. It reports frame acceptance and simple
 * continuity outcomes but does not implement a production buffer, startup
 * gate, player, underrun policy, or playback-speed behavior.
 */
export function createFakeAudioSink(
  clock: ManualClock,
  activeWork: GenerationWorkIdentityV1,
): FakeAudioSink {
  return new ManuallyTimedFakeAudioSink(clock, activeWork);
}
