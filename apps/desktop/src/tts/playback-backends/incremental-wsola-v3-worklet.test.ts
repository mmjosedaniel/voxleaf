import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface Processor {
  port: {
    onmessage: ((event: { data: unknown }) => void) | null;
    postMessage: ReturnType<typeof vi.fn>;
  };
  process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean;
}

let createProcessor: () => Processor;

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal("currentFrame", 0);
  vi.stubGlobal(
    "AudioWorkletProcessor",
    class {
      port = { onmessage: null, postMessage: vi.fn(), close: vi.fn() };
    },
  );
  vi.stubGlobal(
    "registerProcessor",
    (name: string, ProcessorType: new () => Processor) => {
      expect(name).toBe("voxleaf-incremental-wsola-boundary-v3");
      createProcessor = () => new ProcessorType();
    },
  );
  await import("./incremental-wsola-v3-worklet");
});

afterEach(() => vi.unstubAllGlobals());

function send(processor: Processor, data: unknown): void {
  processor.port.onmessage!({ data });
}

function quantum(processor: Processor): Float32Array {
  const output = new Float32Array(128);
  expect(processor.process([], [[output]])).toBe(true);
  return output;
}

function render(input: Float32Array, ratePercent: number): Float32Array {
  const processor = createProcessor();
  const targetFrames = Math.ceil((input.length * 100) / ratePercent);
  send(processor, { type: "arm", input, ratePercent, unitSequence: 1 });
  expect(processor.port.postMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "armed",
      targetFrames,
      additionalWorkBytes: input.byteLength + 38_528,
    }),
  );
  send(processor, { type: "start" });
  const output = new Float32Array(Math.ceil(targetFrames / 128) * 128);
  for (let offset = 0; offset < output.length; offset += 128) {
    output.set(quantum(processor), offset);
  }
  expect([...output].every(Number.isFinite)).toBe(true);
  expect(
    processor.port.postMessage.mock.calls.filter(
      ([message]) => message.type === "ended",
    ),
  ).toEqual([
    [
      {
        type: "ended",
        currentFrame: 0,
        renderedFrames: targetFrames,
        sourceFrames: input.length,
        unitSequence: 1,
      },
    ],
  ]);
  expect(quantum(processor).every((sample) => sample === 0)).toBe(true);
  return output.subarray(0, targetFrames);
}

describe("real incremental WSOLA processor", () => {
  it.each([75, 80, 85, 90, 95])(
    "retains late content after silence at %i percent",
    (rate) => {
      const input = new Float32Array(48_000);
      input.fill(0.25, 12_000, 16_000);
      input.fill(-0.75, 42_000, 47_000);
      const output = render(input, rate);
      expect(output.some((sample) => sample > 0.2)).toBe(true);
      expect(
        output
          .subarray(Math.floor(output.length * 0.8))
          .some((sample) => sample < -0.6),
      ).toBe(true);
    },
  );

  it.each([75, 80, 85, 90, 95])(
    "preserves periodic pitch at %i percent",
    (rate) => {
      const input = Float32Array.from({ length: 24_000 }, (_, index) =>
        Math.sin((2 * Math.PI * 400 * index) / 24_000),
      );
      const output = render(input, rate);
      const middle = output.subarray(2_400, output.length - 2_400);
      let crossings = 0;
      for (let index = 1; index < middle.length; index += 1) {
        if (middle[index - 1]! <= 0 && middle[index]! > 0) crossings += 1;
      }
      expect((crossings * 24_000) / middle.length).toBeCloseTo(400, -1);
    },
  );

  it("completes short and silent units", () => {
    expect(
      render(new Float32Array(120).fill(0.5), 75).some(
        (sample) => sample > 0.4,
      ),
    ).toBe(true);
    expect(
      render(new Float32Array(2_400), 95).every((sample) => sample === 0),
    ).toBe(true);
  });

  it("pauses, resumes and releases on Stop without later audio", () => {
    const processor = createProcessor();
    send(processor, {
      type: "arm",
      input: new Float32Array(4_800).fill(0.5),
      ratePercent: 75,
      unitSequence: 1,
    });
    send(processor, { type: "start" });
    expect(quantum(processor).some((sample) => sample > 0)).toBe(true);
    send(processor, { type: "pause" });
    expect(quantum(processor).every((sample) => sample === 0)).toBe(true);
    send(processor, { type: "resume" });
    expect(quantum(processor).some((sample) => sample > 0)).toBe(true);
    send(processor, { type: "stop" });
    for (let index = 0; index < 60; index += 1)
      expect(quantum(processor).every((sample) => sample === 0)).toBe(true);
    expect(
      processor.port.postMessage.mock.calls.some(
        ([message]) => message.type === "ended",
      ),
    ).toBe(false);
  });
});
