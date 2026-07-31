// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  applyPitchProbeResourceMetricsV2,
  createProbeToneV2,
  encodeMonoFloat32WavV2,
  estimatePureToneFrequencyV2,
  percentile95V2,
  pitchDeviationCentsV2,
  type PitchProbeCandidateResultV2,
} from "./pitch-preserving-backend-probe-v2";

function passingCandidate(): PitchProbeCandidateResultV2 {
  return Object.freeze({
    candidateId: "repository-incremental-audio-worklet-wsola-v2",
    capability: "available",
    trials: Object.freeze([]),
    lifecycle: null,
    maximumPitchDeviationCents: 0,
    maximumRenderedDurationErrorMs: 0,
    maximumSourceFrameDrift: 0,
    backendStartP95Ms: 0,
    rateSettlementP95Ms: 0,
    pauseStopTeardownP95Ms: 0,
    maximumAdditionalWorkBytes: 0,
    maximumActiveObjectUrls: 0,
    activeObjectUrlsAfterCleanup: 0,
    signalAndLifecycleGate: "pass",
    resourceMetrics: null,
    machineGate: "resource-measurement-required",
    listeningGate: "pending",
    failureCode: null,
  });
}

describe("pitch-preserving backend probe v2", () => {
  it.each([220, 440, 880])(
    "creates and identifies the frozen %s Hz tone",
    (frequencyHz) => {
      const tone = createProbeToneV2(frequencyHz, 24_000);

      expect(tone).toHaveLength(24_000);
      expect(estimatePureToneFrequencyV2(tone)).toBeCloseTo(frequencyHz, 1);
      expect(
        pitchDeviationCentsV2(frequencyHz, estimatePureToneFrequencyV2(tone)),
      ).toBeLessThan(1);
    },
  );

  it("encodes bounded mono float PCM without writing a file", () => {
    const tone = createProbeToneV2(220, 240);
    const wav = encodeMonoFloat32WavV2(tone);
    const view = new DataView(wav.buffer);

    expect(new TextDecoder().decode(wav.subarray(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(wav.subarray(8, 12))).toBe("WAVE");
    expect(view.getUint32(24, true)).toBe(24_000);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint16(34, true)).toBe(32);
    expect(wav.byteLength).toBe(44 + tone.byteLength);
  });

  it("uses the frozen nearest-rank p95 calculation", () => {
    expect(percentile95V2([1, 8, 3, 2, 5])).toBe(8);
    expect(() => percentile95V2([])).toThrow();
    expect(() => percentile95V2([1, Number.NaN])).toThrow();
  });

  it("applies the retained resource gates without changing signal results", () => {
    const admitted = applyPitchProbeResourceMetricsV2(passingCandidate(), {
      additionalProcessRamMiB: 128,
      cpuIncreasePercentagePoints: 20,
      maximumActiveTimeStretchers: 1,
    });
    const rejected = applyPitchProbeResourceMetricsV2(passingCandidate(), {
      additionalProcessRamMiB: 128.01,
      cpuIncreasePercentagePoints: 20,
      maximumActiveTimeStretchers: 1,
    });

    expect(admitted.machineGate).toBe("pass");
    expect(admitted.failureCode).toBeNull();
    expect(rejected.machineGate).toBe("fail");
    expect(rejected.failureCode).toBe("machine-gate-failed");
  });
});
