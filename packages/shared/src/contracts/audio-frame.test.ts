import { describe, expect, it } from "vitest";

import type { SegmentId } from "../primitives/index.js";
import {
  AudioFrameContractError,
  calculateAudioFrameDurationMs,
  calculateContiguousAudioDurationMs,
  decodeAudioFrameV1,
  getAudioFrameWorkIdentity,
} from "./audio-frame.js";

function createAudioFrameInput() {
  return {
    schemaVersion: 1,
    frameId: "frame:synthetic-1",
    sessionId: "session:synthetic-1",
    generationId: "generation:synthetic-1",
    segmentId: "segment:synthetic-1",
    sequence: 0,
    sampleRateHz: 48_000,
    sampleCountSamples: 24_000,
    channelCount: 1,
    endOfSegment: false,
  };
}

describe("audio frame contract", () => {
  it("round-trips privacy-safe frame metadata exactly", () => {
    const input = createAudioFrameInput();
    const frame = decodeAudioFrameV1(input);

    expect(JSON.parse(JSON.stringify(frame))).toEqual(input);
    expect(Object.isFrozen(frame)).toBe(true);
    expect(frame).not.toHaveProperty("payload");
    expect(frame).not.toHaveProperty("codec");
    expect(frame).not.toHaveProperty("text");
  });

  it("keeps frame and segment identities distinct at compile time", () => {
    const frame = decodeAudioFrameV1(createAudioFrameInput());
    const acceptSegmentId = (value: SegmentId): void => {
      void value;
    };

    // @ts-expect-error A FrameId must not be accepted where a SegmentId is required.
    acceptSegmentId(frame.frameId);

    expect(frame.segmentId).toBe("segment:synthetic-1");
  });

  it("projects session and generation ownership for stale-work checks", () => {
    const frame = decodeAudioFrameV1(createAudioFrameInput());
    const workIdentity = getAudioFrameWorkIdentity(frame);

    expect(workIdentity).toEqual({
      sessionId: "session:synthetic-1",
      generationId: "generation:synthetic-1",
    });
    expect(Object.isFrozen(workIdentity)).toBe(true);
  });

  it("derives conservative whole milliseconds without using channel count", () => {
    const exactHalfSecond = decodeAudioFrameV1(createAudioFrameInput());
    const fractionalInput = createAudioFrameInput();
    fractionalInput.sampleRateHz = 44_100;
    fractionalInput.sampleCountSamples = 1_024;
    fractionalInput.channelCount = 2;
    const fractional = decodeAudioFrameV1(fractionalInput);

    expect(calculateAudioFrameDurationMs(exactHalfSecond)).toBe(500);
    expect(calculateAudioFrameDurationMs(fractional)).toBe(23);
  });

  it("rejects zero, negative, non-finite, and non-integer numeric metadata", () => {
    const invalidInputs = [
      ["sampleRateHz", 0],
      ["sampleRateHz", -1],
      ["sampleRateHz", Number.NaN],
      ["sampleRateHz", Number.POSITIVE_INFINITY],
      ["sampleCountSamples", 0],
      ["sampleCountSamples", -1],
      ["sampleCountSamples", 0.5],
      ["sampleCountSamples", Number.NaN],
      ["channelCount", 0],
      ["channelCount", -1],
      ["channelCount", 1.5],
      ["sequence", -1],
      ["sequence", Number.NaN],
    ] as const;

    for (const [field, value] of invalidInputs) {
      const input = { ...createAudioFrameInput(), [field]: value };
      expect(() => decodeAudioFrameV1(input)).toThrow(AudioFrameContractError);
    }
  });

  it("rejects payload, encoding, text, and derived-duration fields", () => {
    for (const input of [
      { ...createAudioFrameInput(), payload: "synthetic-audio-payload" },
      { ...createAudioFrameInput(), codec: "synthetic-codec" },
      { ...createAudioFrameInput(), text: "private narration text" },
      { ...createAudioFrameInput(), durationMs: 500 },
    ]) {
      expect(() => decodeAudioFrameV1(input)).toThrowError(
        expect.objectContaining({
          code: "malformed",
          message: "Audio frame contract is malformed.",
        }),
      );
    }
  });

  it("rejects malformed input without coercion", () => {
    const stringVersion = { ...createAudioFrameInput(), schemaVersion: "1" };
    const stringSequence = { ...createAudioFrameInput(), sequence: "0" };
    const numericEndMarker = {
      ...createAudioFrameInput(),
      endOfSegment: 0,
    };

    for (const input of [stringVersion, stringSequence, numericEndMarker]) {
      expect(() => decodeAudioFrameV1(input)).toThrowError(
        expect.objectContaining({ code: "malformed" }),
      );
    }
  });

  it("distinguishes an unsupported version", () => {
    const input = createAudioFrameInput();
    input.schemaVersion = 2;

    expect(() => decodeAudioFrameV1(input)).toThrowError(
      expect.objectContaining({
        code: "unsupported-version",
        message: "Audio frame contract version is unsupported.",
      }),
    );
  });

  it("does not expose private input through validation errors", () => {
    const input = {
      ...createAudioFrameInput(),
      text: "private narration text",
    };

    expect(() => decodeAudioFrameV1(input)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining("private narration text"),
      }),
    );
  });
});

describe("contiguous audio duration", () => {
  function createFrame(sequence: number, sampleCountSamples = 20) {
    const input = createAudioFrameInput();
    input.frameId = `frame:synthetic-${sequence}`;
    input.sequence = sequence;
    input.sampleRateHz = 3_000;
    input.sampleCountSamples = sampleCountSamples;
    return decodeAudioFrameV1(input);
  }

  it("sums samples before one conservative sub-millisecond truncation", () => {
    const frames = [createFrame(7), createFrame(8)];

    expect(calculateAudioFrameDurationMs(frames[0]!)).toBe(6);
    expect(calculateAudioFrameDurationMs(frames[1]!)).toBe(6);
    expect(calculateContiguousAudioDurationMs(frames)).toBe(13);
    expect(calculateContiguousAudioDurationMs([])).toBe(0);
  });

  it("accepts a final end-of-segment marker", () => {
    const first = createFrame(3);
    const finalInput = createAudioFrameInput();
    finalInput.frameId = "frame:synthetic-final";
    finalInput.sequence = 4;
    finalInput.sampleRateHz = 3_000;
    finalInput.sampleCountSamples = 20;
    finalInput.endOfSegment = true;

    expect(
      calculateContiguousAudioDurationMs([
        first,
        decodeAudioFrameV1(finalInput),
      ]),
    ).toBe(13);
  });

  it("rejects frame sequence gaps and reversals", () => {
    for (const frames of [
      [createFrame(0), createFrame(2)],
      [createFrame(2), createFrame(1)],
    ]) {
      expect(() => calculateContiguousAudioDurationMs(frames)).toThrowError(
        expect.objectContaining({ code: "sequence-gap" }),
      );
    }
  });

  it("rejects duplicate frame identifiers", () => {
    const first = createFrame(0);
    const secondInput = createAudioFrameInput();
    secondInput.frameId = "frame:synthetic-0";
    secondInput.sequence = 1;
    secondInput.sampleRateHz = 3_000;
    secondInput.sampleCountSamples = 20;

    expect(() =>
      calculateContiguousAudioDurationMs([
        first,
        decodeAudioFrameV1(secondInput),
      ]),
    ).toThrowError(expect.objectContaining({ code: "duplicate-frame-id" }));
  });

  it.each(["sessionId", "generationId", "segmentId"] as const)(
    "rejects mismatched %s ownership",
    (field) => {
      const first = createFrame(0);
      const secondInput = createAudioFrameInput();
      secondInput.frameId = "frame:synthetic-2";
      secondInput.sequence = 1;
      secondInput.sampleRateHz = 3_000;
      secondInput.sampleCountSamples = 20;
      secondInput[field] = `${field}:synthetic-other`;

      expect(() =>
        calculateContiguousAudioDurationMs([
          first,
          decodeAudioFrameV1(secondInput),
        ]),
      ).toThrowError(expect.objectContaining({ code: "identity-mismatch" }));
    },
  );

  it("rejects sample-rate and channel-count changes", () => {
    const first = createFrame(0);
    const changedRateInput = createAudioFrameInput();
    changedRateInput.sequence = 1;
    changedRateInput.sampleRateHz = 6_000;
    changedRateInput.sampleCountSamples = 20;
    const changedChannelsInput = createAudioFrameInput();
    changedChannelsInput.sequence = 1;
    changedChannelsInput.sampleRateHz = 3_000;
    changedChannelsInput.sampleCountSamples = 20;
    changedChannelsInput.channelCount = 2;

    for (const second of [
      decodeAudioFrameV1(changedRateInput),
      decodeAudioFrameV1(changedChannelsInput),
    ]) {
      expect(() =>
        calculateContiguousAudioDurationMs([first, second]),
      ).toThrowError(expect.objectContaining({ code: "format-mismatch" }));
    }
  });

  it("rejects frames after an end-of-segment marker", () => {
    const finalInput = createAudioFrameInput();
    finalInput.frameId = "frame:synthetic-final";
    finalInput.sampleRateHz = 3_000;
    finalInput.sampleCountSamples = 20;
    finalInput.endOfSegment = true;

    expect(() =>
      calculateContiguousAudioDurationMs([
        decodeAudioFrameV1(finalInput),
        createFrame(1),
      ]),
    ).toThrowError(
      expect.objectContaining({ code: "frame-after-segment-end" }),
    );
  });

  it("rejects whole-millisecond duration overflow", () => {
    const input = createAudioFrameInput();
    input.sampleRateHz = 1;
    input.sampleCountSamples = Number.MAX_SAFE_INTEGER;
    const frame = decodeAudioFrameV1(input);

    expect(() => calculateAudioFrameDurationMs(frame)).toThrowError(
      expect.objectContaining({ code: "duration-overflow" }),
    );
  });

  it("keeps continuity errors content-free", () => {
    const first = createFrame(0);
    const secondInput = createAudioFrameInput();
    secondInput.frameId = "frame:private-value";
    secondInput.sequence = 2;
    secondInput.sampleRateHz = 3_000;
    secondInput.sampleCountSamples = 20;

    expect(() =>
      calculateContiguousAudioDurationMs([
        first,
        decodeAudioFrameV1(secondInput),
      ]),
    ).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining("private-value"),
      }),
    );
  });
});
