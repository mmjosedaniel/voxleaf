import { describe, expect, it } from "vitest";

import type { BufferStatusV1Wire } from "../generated/contracts/buffer-status-v1.js";
import {
  decodeBufferStatusV1,
  getBufferStatusWorkIdentity,
} from "./buffer-status.js";

function createBufferStatusInput(): BufferStatusV1Wire {
  return {
    schemaVersion: 1,
    sessionId: "session:synthetic-1",
    generationId: "generation:synthetic-1",
    contiguousPlayableDurationMs: 15_000,
    thresholds: {
      lowWaterMarkMs: 8_000,
      targetBufferMs: 15_000,
      maximumBufferMs: 60_000,
    },
    underrunCount: 0,
    state: "ready",
  };
}

describe("buffer status contract", () => {
  it("round-trips a privacy-safe bounded buffer snapshot", () => {
    const input = createBufferStatusInput();
    const status = decodeBufferStatusV1(input);

    expect(JSON.parse(JSON.stringify(status))).toEqual(input);
    expect(Object.isFrozen(status)).toBe(true);
    expect(Object.isFrozen(status.thresholds)).toBe(true);
    expect(status).not.toHaveProperty("audio");
    expect(status).not.toHaveProperty("frames");
    expect(status).not.toHaveProperty("text");
    expect(status).not.toHaveProperty("elapsedWaitMs");
  });

  it("projects session and generation ownership for stale-work checks", () => {
    const status = decodeBufferStatusV1(createBufferStatusInput());

    expect(getBufferStatusWorkIdentity(status)).toEqual({
      sessionId: "session:synthetic-1",
      generationId: "generation:synthetic-1",
    });
  });

  it.each([
    [0, "empty"],
    [7_999, "buffering"],
    [15_000, "ready"],
    [15_001, "ready"],
  ] as const)(
    "accepts a deterministic status at %i ms",
    (contiguousPlayableDurationMs, state) => {
      const input = createBufferStatusInput();
      input.contiguousPlayableDurationMs = contiguousPlayableDurationMs;
      input.state = state;

      expect(decodeBufferStatusV1(input).state).toBe(state);
    },
  );

  it("allows active playback below the target and paused status at zero depth", () => {
    const playing = createBufferStatusInput();
    playing.contiguousPlayableDurationMs = 1;
    playing.state = "playing";
    const paused = createBufferStatusInput();
    paused.contiguousPlayableDurationMs = 0;
    paused.state = "paused";

    expect(decodeBufferStatusV1(playing).state).toBe("playing");
    expect(decodeBufferStatusV1(paused).state).toBe("paused");
  });

  it.each([
    {
      thresholds: {
        lowWaterMarkMs: 15_001,
        targetBufferMs: 15_000,
        maximumBufferMs: 60_000,
      },
      expectedCode: "invalid-threshold-order",
    },
    {
      thresholds: {
        lowWaterMarkMs: 8_000,
        targetBufferMs: 60_001,
        maximumBufferMs: 60_000,
      },
      expectedCode: "invalid-threshold-order",
    },
    {
      contiguousPlayableDurationMs: 60_001,
      expectedCode: "duration-exceeds-maximum",
    },
    {
      contiguousPlayableDurationMs: 1,
      state: "empty",
      expectedCode: "invalid-state-duration",
    },
    {
      contiguousPlayableDurationMs: 15_000,
      state: "buffering",
      expectedCode: "invalid-state-duration",
    },
    {
      contiguousPlayableDurationMs: 14_999,
      state: "ready",
      expectedCode: "invalid-state-duration",
    },
    {
      contiguousPlayableDurationMs: 0,
      state: "playing",
      expectedCode: "invalid-state-duration",
    },
  ])("rejects impossible status combinations", (change) => {
    const input = {
      ...createBufferStatusInput(),
      ...change,
      thresholds: change.thresholds ?? createBufferStatusInput().thresholds,
    };
    delete (input as Record<string, unknown>).expectedCode;

    expect(() => decodeBufferStatusV1(input)).toThrowError(
      expect.objectContaining({ code: change.expectedCode }),
    );
  });

  it.each([
    ["contiguousPlayableDurationMs", -1],
    ["contiguousPlayableDurationMs", Number.NaN],
    ["underrunCount", -1],
    ["underrunCount", Number.POSITIVE_INFINITY],
    [
      "thresholds",
      { lowWaterMarkMs: 0, targetBufferMs: 0, maximumBufferMs: -1 },
    ],
  ] as const)("rejects invalid numeric field %s", (field, value) => {
    const input = { ...createBufferStatusInput(), [field]: value };

    expect(() => decodeBufferStatusV1(input)).toThrowError(
      expect.objectContaining({ code: "malformed" }),
    );
  });

  it("rejects unsupported states, payload fields, fixed waits, and coercion", () => {
    const invalidInputs = [
      { ...createBufferStatusInput(), state: "complete" },
      { ...createBufferStatusInput(), audio: "synthetic payload" },
      { ...createBufferStatusInput(), elapsedWaitMs: 15_000 },
      { ...createBufferStatusInput(), contiguousPlayableDurationMs: "15000" },
    ];

    for (const input of invalidInputs) {
      expect(() => decodeBufferStatusV1(input)).toThrowError(
        expect.objectContaining({ code: "malformed" }),
      );
    }
  });

  it("distinguishes an unsupported version and keeps validation errors content-free", () => {
    const unsupported = { ...createBufferStatusInput(), schemaVersion: 2 };
    const privateInput = {
      ...createBufferStatusInput(),
      text: "private narration text",
    };

    expect(() => decodeBufferStatusV1(unsupported)).toThrowError(
      expect.objectContaining({ code: "unsupported-version" }),
    );
    expect(() => decodeBufferStatusV1(privateInput)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining("private narration text"),
      }),
    );
  });
});
