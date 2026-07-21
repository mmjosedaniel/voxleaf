import { describe, expect, it } from "vitest";

import { decodeAudioFrameV1 } from "../contracts/index.js";
import { createGenerationId, createSessionId } from "../primitives/index.js";
import { createManualClock } from "./manual-clock.js";
import {
  createFakeAudioSink,
  createFakeAudioSource,
} from "./fake-audio-pipeline.js";

function createFrame(
  overrides: Partial<{
    frameId: string;
    sessionId: string;
    generationId: string;
    segmentId: string;
    sequence: number;
    endOfSegment: boolean;
  }> = {},
) {
  return decodeAudioFrameV1({
    schemaVersion: 1,
    frameId: "frame:synthetic-0",
    sessionId: "session:synthetic-1",
    generationId: "generation:synthetic-1",
    segmentId: "segment:synthetic-1",
    sequence: 0,
    sampleRateHz: 1_000,
    sampleCountSamples: 500,
    channelCount: 1,
    endOfSegment: false,
    ...overrides,
  });
}

const ACTIVE_WORK = Object.freeze({
  sessionId: createSessionId("session:synthetic-1"),
  generationId: createGenerationId("generation:synthetic-1"),
});

describe("manually timed fake audio source and sink", () => {
  it("releases and consumes frame metadata only when the manual clock advances", () => {
    const clock = createManualClock(0);
    const first = createFrame();
    const final = createFrame({
      frameId: "frame:synthetic-1",
      sequence: 1,
      endOfSegment: true,
    });
    const source = createFakeAudioSource(clock, [
      { arrivalDelayMs: 5, frame: first },
      { arrivalDelayMs: 8, frame: final },
    ]);
    const sink = createFakeAudioSink(clock, ACTIVE_WORK);

    expect(source.getPendingFrameCount()).toBe(2);
    expect(source.takeAvailableFrames()).toEqual([]);

    clock.advanceBy(5);
    const firstArrivals = source.takeAvailableFrames();
    expect(firstArrivals).toEqual([first]);
    expect(source.getPendingFrameCount()).toBe(1);

    sink.scheduleConsume(firstArrivals[0]!, 3);
    clock.advanceBy(2);
    expect(sink.getOutcomes()).toEqual([]);

    clock.advanceBy(1);
    expect(source.takeAvailableFrames()).toEqual([final]);
    expect(sink.getOutcomes()).toMatchObject([
      {
        kind: "accepted",
        frameId: "frame:synthetic-0",
        activePlayableDurationMs: 500,
      },
    ]);

    sink.scheduleConsume(final, 0);
    clock.advanceBy(0);
    expect(sink.getOutcomes()).toMatchObject([
      { kind: "accepted", activePlayableDurationMs: 500 },
      { kind: "end-of-stream", activePlayableDurationMs: 1_000 },
    ]);
    expect(sink.getActivePlayableDurationMs()).toBe(1_000);
    expect(final).not.toHaveProperty("payload");
    expect(final).not.toHaveProperty("text");
  });

  it("rejects stale session and generation frames without adding playable duration", () => {
    const sink = createFakeAudioSink(createManualClock(0), ACTIVE_WORK);
    const staleSession = createFrame({
      frameId: "frame:stale-session",
      sessionId: "session:stale",
    });
    const staleGeneration = createFrame({
      frameId: "frame:stale-generation",
      generationId: "generation:stale",
    });

    expect(sink.consume(staleSession).kind).toBe("stale-session");
    expect(sink.consume(staleGeneration).kind).toBe("stale-generation");
    expect(sink.getActivePlayableDurationMs()).toBe(0);
    expect(sink.getOutcomes()).toMatchObject([
      { kind: "stale-session", activePlayableDurationMs: 0 },
      { kind: "stale-generation", activePlayableDurationMs: 0 },
    ]);
  });

  it("reports duplicate, out-of-order, gap, and post-end frame metadata without treating it as playable", () => {
    const sink = createFakeAudioSink(createManualClock(0), ACTIVE_WORK);
    const first = createFrame();
    const duplicate = createFrame({ sequence: 1 });
    const outOfOrder = createFrame({
      frameId: "frame:out-of-order",
      sequence: 0,
    });
    const gap = createFrame({ frameId: "frame:gap", sequence: 2 });
    const final = createFrame({
      frameId: "frame:final",
      sequence: 1,
      endOfSegment: true,
    });
    const afterEnd = createFrame({ frameId: "frame:after-end", sequence: 2 });

    expect(sink.consume(first).kind).toBe("accepted");
    expect(sink.consume(duplicate).kind).toBe("duplicate-frame-id");
    expect(sink.consume(outOfOrder).kind).toBe("out-of-order");
    expect(sink.consume(gap).kind).toBe("sequence-gap");
    expect(sink.consume(final).kind).toBe("end-of-stream");
    expect(sink.consume(afterEnd).kind).toBe("frame-after-end-of-stream");
    expect(sink.getActivePlayableDurationMs()).toBe(1_000);
    expect(sink.getOutcomes().map((outcome) => outcome.kind)).toEqual([
      "accepted",
      "duplicate-frame-id",
      "out-of-order",
      "sequence-gap",
      "end-of-stream",
      "frame-after-end-of-stream",
    ]);
  });

  it("returns immutable source and sink observations without an audio device", () => {
    const clock = createManualClock(0);
    const source = createFakeAudioSource(clock, [
      { arrivalDelayMs: 0, frame: createFrame() },
    ]);
    const sink = createFakeAudioSink(clock, ACTIVE_WORK);

    clock.advanceBy(0);
    const arrivals = source.takeAvailableFrames();
    const outcome = sink.consume(arrivals[0]!);

    expect(Object.isFrozen(arrivals)).toBe(true);
    expect(Object.isFrozen(sink.getOutcomes())).toBe(true);
    expect(outcome).not.toHaveProperty("device");
    expect(outcome).not.toHaveProperty("payload");
  });
});
