import { describe, expect, it } from "vitest";

import {
  calculateAudioFrameDurationMs,
  classifyGenerationWorkEligibility,
  createOperationalErrorV1,
  decodeNarrationSegmentV1,
  decodeReadingSessionV1,
} from "../contracts/index.js";
import {
  createCount,
  createFrameId,
  createHertz,
  createIndex,
  createSampleCount,
} from "../primitives/index.js";
import type { FakeTtsFrameScriptV1 } from "./fake-tts-source.js";
import { FakeTtsSourceError, createFakeTtsSource } from "./fake-tts-source.js";
import { createManualClock } from "./manual-clock.js";

function createSegment(generationId = "generation:synthetic-1") {
  const bookIdentity = {
    scheme: "synthetic-test",
    schemeVersion: 1,
    value: "book-test-001",
  };
  const start = {
    schemaVersion: 1,
    bookIdentity: { ...bookIdentity },
    spineItemId: "spine:chapter-1",
    spineItemIndex: 0,
    anchor: {
      kind: "element-id",
      formatVersion: 1,
      value: "paragraph-1",
      anchorIndex: 0,
    },
    textOffsetCodePoints: 0,
    progression: 0.2,
  };

  return decodeNarrationSegmentV1({
    schemaVersion: 1,
    segmentId: "segment:synthetic-1",
    bookIdentity,
    sessionId: "session:synthetic-1",
    generationId,
    sequence: 0,
    sourceRange: {
      schemaVersion: 1,
      start,
      end: {
        ...start,
        bookIdentity: { ...bookIdentity },
        anchor: { ...start.anchor },
      },
    },
    text: "Synthetic narration text used only by this test.",
  });
}

function createFrameScript(
  sequence: number,
  endOfSegment = false,
): FakeTtsFrameScriptV1 {
  return {
    frameId: createFrameId(`frame:synthetic-${sequence}`),
    sequence: createIndex(sequence),
    sampleRateHz: createHertz(1_000),
    sampleCountSamples: createSampleCount(500),
    channelCount: createCount(1),
    endOfSegment,
  };
}

describe("scripted fake TTS source", () => {
  it("emits identity-preserving frame metadata only when the manual clock reaches the response delay", () => {
    const clock = createManualClock(100);
    const source = createFakeTtsSource(clock, [
      {
        kind: "frames",
        responseDelayMs: 25,
        cancellationBehavior: "acknowledge",
        frames: [createFrameScript(0), createFrameScript(1, true)],
      },
    ]);
    const request = source.generate(createSegment());

    expect(request.getStatus()).toBe("pending");
    expect(request.getResult()).toBeUndefined();
    expect(source.getRequestCount()).toBe(1);
    expect(source.getPendingRequestCount()).toBe(1);

    clock.advanceBy(24);
    expect(request.getResult()).toBeUndefined();

    clock.advanceBy(1);
    const result = request.getResult();

    expect(result).toMatchObject({
      kind: "frames",
      sessionId: "session:synthetic-1",
      generationId: "generation:synthetic-1",
      segmentId: "segment:synthetic-1",
    });
    expect(result?.kind).toBe("frames");
    if (result?.kind !== "frames") {
      throw new Error("Expected scripted frames.");
    }
    expect(result.frames).toHaveLength(2);
    expect(result.frames.map((frame) => frame.sequence)).toEqual([0, 1]);
    expect(calculateAudioFrameDurationMs(result.frames[0]!)).toBe(500);
    expect(result.frames[0]).not.toHaveProperty("payload");
    expect(result.frames[0]).not.toHaveProperty("text");
    expect(request.getStatus()).toBe("completed");
    expect(source.getPendingRequestCount()).toBe(0);
  });

  it("acknowledges cancellation immediately without allowing the delayed response to escape", () => {
    const clock = createManualClock(0);
    const source = createFakeTtsSource(clock, [
      {
        kind: "frames",
        responseDelayMs: 20,
        cancellationBehavior: "acknowledge",
        frames: [createFrameScript(0, true)],
      },
    ]);
    const request = source.generate(createSegment());

    expect(request.cancel()).toBe(true);
    expect(request.cancel()).toBe(false);
    expect(request.getStatus()).toBe("cancelled");
    expect(request.getResult()).toMatchObject({
      kind: "cancelled",
      sessionId: "session:synthetic-1",
      generationId: "generation:synthetic-1",
      segmentId: "segment:synthetic-1",
      error: { code: "operation-cancelled", severity: "recoverable" },
    });

    clock.advanceBy(20);
    expect(request.getStatus()).toBe("cancelled");
    expect(source.getPendingRequestCount()).toBe(0);
  });

  it("emits a late identity-preserving completion for non-interruptible work so stale generations can be rejected", () => {
    const clock = createManualClock(0);
    const source = createFakeTtsSource(clock, [
      {
        kind: "frames",
        responseDelayMs: 10,
        cancellationBehavior: "complete",
        frames: [createFrameScript(0, true)],
      },
    ]);
    const request = source.generate(createSegment());

    expect(request.cancel()).toBe(true);
    expect(request.getStatus()).toBe("cancellation-requested");
    clock.advanceBy(10);

    const result = request.getResult();
    expect(result?.kind).toBe("frames");
    if (result?.kind !== "frames") {
      throw new Error("Expected late scripted frames.");
    }
    const activeSession = decodeReadingSessionV1({
      schemaVersion: 1,
      sessionId: result.sessionId,
      bookIdentity: {
        scheme: "synthetic-test",
        schemeVersion: 1,
        value: "book-test-001",
      },
      generationId: "generation:synthetic-current",
    });

    expect(
      classifyGenerationWorkEligibility(activeSession, {
        sessionId: result.sessionId,
        generationId: result.generationId,
      }),
    ).toBe("stale-generation");
    expect(request.getStatus()).toBe("completed");
  });

  it("emits configured recoverable and fatal errors deterministically", () => {
    const clock = createManualClock(0);
    const source = createFakeTtsSource(clock, [
      {
        kind: "error",
        responseDelayMs: 5,
        cancellationBehavior: "acknowledge",
        error: createOperationalErrorV1("capability-unavailable"),
      },
      {
        kind: "error",
        responseDelayMs: 7,
        cancellationBehavior: "acknowledge",
        error: createOperationalErrorV1("internal-failure"),
      },
    ]);
    const recoverableRequest = source.generate(createSegment());
    const fatalRequest = source.generate(
      createSegment("generation:synthetic-2"),
    );

    clock.advanceBy(5);
    expect(recoverableRequest.getResult()).toMatchObject({
      kind: "error",
      error: { code: "capability-unavailable", severity: "recoverable" },
    });
    expect(fatalRequest.getResult()).toBeUndefined();

    clock.advanceBy(2);
    expect(fatalRequest.getResult()).toMatchObject({
      kind: "error",
      error: { code: "internal-failure", severity: "fatal" },
    });
    expect(source.getRemainingStepCount()).toBe(0);
  });

  it("fails with a stable error when a test consumes more responses than configured", () => {
    const source = createFakeTtsSource(createManualClock(0), []);

    expect(() => source.generate(createSegment())).toThrow(FakeTtsSourceError);
    expect(source.getRequestCount()).toBe(1);
    expect(source.getRemainingStepCount()).toBe(0);
  });
});
