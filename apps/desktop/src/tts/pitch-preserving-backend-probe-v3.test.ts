// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  applyPitchProbeResourceMetricsV3,
  createProbeToneV3,
  encodeMonoFloat32WavV3,
  estimatePureToneFrequencyV3,
  percentile95V3,
  pitchDeviationCentsV3,
  type PitchProbeCandidateResultV3,
} from "./pitch-preserving-backend-probe-v3";

function machinePendingCandidate(): PitchProbeCandidateResultV3 {
  return Object.freeze({
    candidateId: "repository-incremental-audio-worklet-wsola-boundary-v3",
    capability: "available",
    trials: Object.freeze([]),
    lifecycle: null,
    maximumPitchDeviationCents: 0,
    maximumRenderedDurationErrorMs: 0,
    maximumSourceFrameDrift: 0,
    firstActivationP95Ms: 0,
    recurringUnitHandoffP95Ms: 0,
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

describe("boundary-deferred pitch-preserving backend probe v3", () => {
  it.each([220, 440, 880])(
    "creates and identifies the frozen %s Hz tone",
    (frequencyHz) => {
      const tone = createProbeToneV3(frequencyHz, 24_000);

      expect(tone).toHaveLength(24_000);
      expect(estimatePureToneFrequencyV3(tone)).toBeCloseTo(frequencyHz, 1);
      expect(
        pitchDeviationCentsV3(frequencyHz, estimatePureToneFrequencyV3(tone)),
      ).toBeLessThan(1);
    },
  );

  it("encodes bounded mono float PCM only in memory", () => {
    const tone = createProbeToneV3(220, 240);
    const wav = encodeMonoFloat32WavV3(tone);
    const view = new DataView(wav.buffer);

    expect(new TextDecoder().decode(wav.subarray(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(wav.subarray(8, 12))).toBe("WAVE");
    expect(view.getUint32(24, true)).toBe(24_000);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint16(34, true)).toBe(32);
    expect(wav.byteLength).toBe(44 + tone.byteLength);
  });

  it("uses the frozen nearest-rank p95 calculation", () => {
    expect(percentile95V3([1, 8, 3, 2, 5])).toBe(8);
    expect(() => percentile95V3([])).toThrow();
    expect(() => percentile95V3([1, Number.NaN])).toThrow();
  });

  it("applies the v3 contention limits without changing signal evidence", () => {
    const admitted = applyPitchProbeResourceMetricsV3(
      machinePendingCandidate(),
      {
        additionalProcessRamMiB: 200,
        cpuIncreasePercentagePoints: 20,
        maximumActiveTimeStretchers: 1,
      },
    );
    const rejected = applyPitchProbeResourceMetricsV3(
      machinePendingCandidate(),
      {
        additionalProcessRamMiB: 200.01,
        cpuIncreasePercentagePoints: 20,
        maximumActiveTimeStretchers: 1,
      },
    );

    expect(admitted.machineGate).toBe("pass");
    expect(admitted.failureCode).toBeNull();
    expect(rejected.machineGate).toBe("fail");
    expect(rejected.failureCode).toBe("machine-gate-failed");
  });
});
