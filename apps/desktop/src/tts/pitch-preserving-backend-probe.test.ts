import { describe, expect, it } from "vitest";

import {
  createProbeImpulseTrain,
  createProbeTone,
  encodeMonoFloat32Wav,
  estimatePureToneFrequency,
  percentile95,
  pitchDeviationCents,
} from "./pitch-preserving-backend-probe";

describe("pitch-preserving backend probe primitives", () => {
  it.each([220, 440, 880])(
    "generates the frozen eight-second %s Hz tone",
    (frequencyHz) => {
      const tone = createProbeTone(frequencyHz);
      expect(tone).toHaveLength(192_000);
      expect(estimatePureToneFrequency(tone)).toBeCloseTo(frequencyHz, 1);
      expect(
        pitchDeviationCents(frequencyHz, estimatePureToneFrequency(tone)),
      ).toBeLessThan(1);
    },
  );

  it("generates frozen 250 ms impulses without speech or text", () => {
    const impulses = createProbeImpulseTrain();
    const nonzero = [...impulses.entries()]
      .filter(([, value]) => value !== 0)
      .map(([index]) => index);
    expect(nonzero).toHaveLength(32);
    expect(nonzero.slice(0, 4)).toEqual([0, 6_000, 12_000, 18_000]);
  });

  it("encodes exact bounded mono 24 kHz float32 WAV bytes", () => {
    const samples = new Float32Array([0.25, -0.5, 0.75]);
    const wav = encodeMonoFloat32Wav(samples);
    const view = new DataView(wav.buffer);
    expect(new TextDecoder().decode(wav.slice(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(wav.slice(8, 12))).toBe("WAVE");
    expect(view.getUint16(20, true)).toBe(3);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(24_000);
    expect(view.getUint16(34, true)).toBe(32);
    expect(view.getUint32(40, true)).toBe(samples.byteLength);
    expect(view.getFloat32(44, true)).toBe(0.25);
    expect(view.getFloat32(48, true)).toBe(-0.5);
    expect(view.getFloat32(52, true)).toBe(0.75);
  });

  it("uses a deterministic nearest-rank p95", () => {
    expect(percentile95([9, 1, 3, 7, 5])).toBe(9);
    expect(percentile95(Array.from({ length: 20 }, (_, index) => index))).toBe(
      18,
    );
    expect(() => percentile95([])).toThrow();
  });

  it("measures pitch displacement in absolute cents", () => {
    expect(pitchDeviationCents(440, 440)).toBe(0);
    expect(pitchDeviationCents(440, 220)).toBe(1_200);
    expect(pitchDeviationCents(220, 440)).toBe(1_200);
  });

  it("rejects unlisted tones and malformed numeric input", () => {
    expect(() => createProbeTone(330)).toThrow();
    expect(() => createProbeTone(440, 0)).toThrow();
    expect(() => estimatePureToneFrequency(new Float32Array(1))).toThrow();
    expect(() => pitchDeviationCents(0, 440)).toThrow();
  });
});
