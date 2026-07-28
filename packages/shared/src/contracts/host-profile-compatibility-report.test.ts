import { describe, expect, it } from "vitest";

import { decodeCapabilityReportV1 } from "./capability-report.js";
import {
  decodeHostProfileCompatibilityReportV1,
  HostProfileCompatibilityReportContractError,
} from "./host-profile-compatibility-report.js";

function unknownQuantity() {
  return { status: "unknown" as const };
}

function unknownProvider() {
  return {
    availability: "unknown" as const,
    deviceClass: "unknown" as const,
    dedicatedMemoryMiB: unknownQuantity(),
    availableDedicatedMemoryMiB: unknownQuantity(),
    precisions: {
      float32: "unknown" as const,
      float16: "unknown" as const,
      bfloat16: "unknown" as const,
      int8: "unknown" as const,
    },
  };
}

function createUnknownReport() {
  return {
    schemaVersion: 1,
    probeStatus: "unavailable" as const,
    platform: {
      operatingSystem: "unknown" as const,
      architecture: "unknown" as const,
    },
    processor: {
      logicalProcessorCount: unknownQuantity(),
    },
    memory: {
      totalPhysicalMiB: unknownQuantity(),
      availablePhysicalMiB: unknownQuantity(),
    },
    storage: {
      applicationVolumeAvailableMiB: unknownQuantity(),
    },
    providers: {
      cpu: unknownProvider(),
      cuda: unknownProvider(),
      directml: unknownProvider(),
      rocm: unknownProvider(),
      metal: unknownProvider(),
    },
  };
}

function createSyntheticKnownReport() {
  const report = createUnknownReport();
  return {
    ...report,
    probeStatus: "complete" as const,
    platform: {
      operatingSystem: "windows" as const,
      architecture: "x86_64" as const,
    },
    processor: {
      logicalProcessorCount: { status: "known" as const, value: 12 },
    },
    memory: {
      totalPhysicalMiB: { status: "known" as const, value: 24_576 },
      availablePhysicalMiB: { status: "known" as const, value: 16_384 },
    },
    storage: {
      applicationVolumeAvailableMiB: {
        status: "known" as const,
        value: 40_960,
      },
    },
    providers: {
      ...report.providers,
      cpu: {
        availability: "available" as const,
        deviceClass: "cpu" as const,
        dedicatedMemoryMiB: { status: "known" as const, value: 0 },
        availableDedicatedMemoryMiB: {
          status: "known" as const,
          value: 0,
        },
        precisions: {
          float32: "available" as const,
          float16: "unknown" as const,
          bfloat16: "unknown" as const,
          int8: "unknown" as const,
        },
      },
      cuda: {
        availability: "available" as const,
        deviceClass: "discrete-gpu" as const,
        dedicatedMemoryMiB: { status: "known" as const, value: 12_288 },
        availableDedicatedMemoryMiB: {
          status: "known" as const,
          value: 9_216,
        },
        precisions: {
          float32: "available" as const,
          float16: "available" as const,
          bfloat16: "available" as const,
          int8: "unknown" as const,
        },
      },
    },
  };
}

describe("host profile compatibility report v1", () => {
  it("round-trips a synthetic known report and deeply freezes it", () => {
    const input = createSyntheticKnownReport();
    const report = decodeHostProfileCompatibilityReportV1(input);

    expect(JSON.parse(JSON.stringify(report))).toEqual(input);
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.memory.totalPhysicalMiB)).toBe(true);
    expect(Object.isFrozen(report.providers.cuda)).toBe(true);
    expect(Object.isFrozen(report.providers.cuda.precisions)).toBe(true);
  });

  it("admits explicit unknown facts without turning them into support", () => {
    expect(
      decodeHostProfileCompatibilityReportV1(createUnknownReport()),
    ).toEqual(createUnknownReport());
  });

  it("rejects impossible memory relationships and inconsistent providers", () => {
    const availableRamAboveTotal = createSyntheticKnownReport();
    availableRamAboveTotal.memory.availablePhysicalMiB.value = 24_577;

    const availableVramAboveTotal = createSyntheticKnownReport();
    availableVramAboveTotal.providers.cuda.availableDedicatedMemoryMiB.value = 12_289;

    const unknownReport = createUnknownReport();
    const unavailableWithAvailablePrecision = {
      ...unknownReport,
      providers: {
        ...unknownReport.providers,
        cuda: {
          ...unknownReport.providers.cuda,
          availability: "unavailable" as const,
          precisions: {
            ...unknownReport.providers.cuda.precisions,
            float32: "available" as const,
          },
        },
      },
    };

    for (const input of [
      availableRamAboveTotal,
      availableVramAboveTotal,
      unavailableWithAvailablePrecision,
    ]) {
      expect(() => decodeHostProfileCompatibilityReportV1(input)).toThrowError(
        expect.objectContaining({ code: "malformed" }),
      );
    }
  });

  it("enforces exact numeric maxima without coercion", () => {
    const exact = createSyntheticKnownReport();
    exact.memory.totalPhysicalMiB.value = 16_777_216;
    exact.memory.availablePhysicalMiB.value = 16_777_216;
    expect(() => decodeHostProfileCompatibilityReportV1(exact)).not.toThrow();

    const oneOver = createSyntheticKnownReport();
    oneOver.memory.totalPhysicalMiB.value = 16_777_217;
    expect(() => decodeHostProfileCompatibilityReportV1(oneOver)).toThrowError(
      expect.objectContaining({
        code: "malformed",
        message: "Host profile compatibility report is malformed.",
      }),
    );
  });

  it.each([
    ["hostname", "private-host"],
    ["username", "private-user"],
    ["deviceName", "private-device"],
    ["serialNumber", "private-serial"],
    ["path", "C:/private/models"],
    ["bookText", "private book text"],
    ["commandLine", "private command line"],
  ])("rejects forbidden private field %s", (field, value) => {
    const input = { ...createSyntheticKnownReport(), [field]: value };

    expect(() => decodeHostProfileCompatibilityReportV1(input)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining(value),
      }),
    );
  });

  it("distinguishes unsupported versions from malformed reports", () => {
    expect(() =>
      decodeHostProfileCompatibilityReportV1({
        ...createUnknownReport(),
        schemaVersion: 2,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "unsupported-version",
        message: "Host profile compatibility report version is unsupported.",
      }),
    );
    expect(() =>
      decodeHostProfileCompatibilityReportV1({
        ...createUnknownReport(),
        schemaVersion: "1",
      }),
    ).toThrow(HostProfileCompatibilityReportContractError);
  });

  it("leaves the model-independent capability report v1 closed", () => {
    expect(() =>
      decodeCapabilityReportV1({
        schemaVersion: 1,
        capabilities: {
          localSpeechGeneration: "unknown",
          streamingGeneration: "unknown",
          generationCancellation: "unknown",
          hardwareAcceleration: "unknown",
          cpuFallback: "unknown",
        },
        hostProfileCompatibility: createUnknownReport(),
      }),
    ).toThrowError(expect.objectContaining({ code: "malformed" }));
  });
});
