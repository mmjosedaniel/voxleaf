import { decodeHostProfileCompatibilityReportV1 } from "@voxleaf/shared";
import { describe, expect, it, vi } from "vitest";

import type { HardwareProfilePreferenceRepository } from "../persistence/hardware-profile-preference";
import {
  HardwareProfileCompatibilityCoordinator,
  type HardwareDevelopmentGatePort,
  type HardwareProfileDetectionPort,
} from "./hardware-profile-compatibility";
import { EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID } from "./hardware-profile-registry";

function unknownQuantity() {
  return { status: "unknown" as const };
}

function knownQuantity(value: number) {
  return { status: "known" as const, value };
}

function unavailableProvider() {
  return {
    availability: "unavailable" as const,
    deviceClass: "unknown" as const,
    dedicatedMemoryMiB: unknownQuantity(),
    availableDedicatedMemoryMiB: unknownQuantity(),
    precisions: {
      float32: "unavailable" as const,
      float16: "unavailable" as const,
      bfloat16: "unavailable" as const,
      int8: "unavailable" as const,
    },
  };
}

function completeReport(availableRamMiB = 16_384) {
  return decodeHostProfileCompatibilityReportV1({
    schemaVersion: 1,
    probeStatus: "complete",
    platform: {
      operatingSystem: "windows",
      architecture: "x86_64",
    },
    processor: {
      logicalProcessorCount: knownQuantity(12),
    },
    memory: {
      totalPhysicalMiB: knownQuantity(24_576),
      availablePhysicalMiB: knownQuantity(availableRamMiB),
    },
    storage: {
      applicationVolumeAvailableMiB: knownQuantity(40_960),
    },
    providers: {
      cpu: {
        availability: "available",
        deviceClass: "cpu",
        dedicatedMemoryMiB: knownQuantity(0),
        availableDedicatedMemoryMiB: knownQuantity(0),
        precisions: {
          float32: "available",
          float16: "unknown",
          bfloat16: "unknown",
          int8: "unknown",
        },
      },
      cuda: {
        availability: "available",
        deviceClass: "discrete-gpu",
        dedicatedMemoryMiB: knownQuantity(12_288),
        availableDedicatedMemoryMiB: knownQuantity(9_216),
        precisions: {
          float32: "available",
          float16: "available",
          bfloat16: "available",
          int8: "unknown",
        },
      },
      directml: {
        availability: "unknown",
        deviceClass: "unknown",
        dedicatedMemoryMiB: unknownQuantity(),
        availableDedicatedMemoryMiB: unknownQuantity(),
        precisions: {
          float32: "unknown",
          float16: "unknown",
          bfloat16: "unknown",
          int8: "unknown",
        },
      },
      rocm: unavailableProvider(),
      metal: unavailableProvider(),
    },
  });
}

function partialReport() {
  const value = {
    ...completeReport(),
    probeStatus: "partial",
    memory: {
      ...completeReport().memory,
      availablePhysicalMiB: unknownQuantity(),
    },
  };
  return decodeHostProfileCompatibilityReportV1(value);
}

function preference(
  readResult: Awaited<
    ReturnType<HardwareProfilePreferenceRepository["read"]>
  > = {
    status: "missing",
  },
): HardwareProfilePreferenceRepository {
  return {
    read: vi.fn(async () => readResult),
    write: vi.fn(async () => ({ status: "saved" as const })),
  };
}

function dependencies(
  options: {
    report?: ReturnType<typeof completeReport>;
    detector?: HardwareProfileDetectionPort;
    gate?: "available" | "unavailable";
    preference?: HardwareProfilePreferenceRepository;
  } = {},
) {
  const detector =
    options.detector ??
    ({
      detect: vi.fn(async () => options.report ?? completeReport()),
    } satisfies HardwareProfileDetectionPort);
  const developmentGate = {
    exactDemoAvailability: vi.fn(
      async () => options.gate ?? ("available" as const),
    ),
  } satisfies HardwareDevelopmentGatePort;
  const preferenceRepository = options.preference ?? preference();
  return { detector, developmentGate, preferenceRepository };
}

describe("hardware profile compatibility coordinator", () => {
  it("reports the exact configured profile as development-only without inventing fallback", async () => {
    const subject = new HardwareProfileCompatibilityCoordinator(dependencies());

    const snapshot = await subject.check("application-start");

    expect(snapshot.status).toBe("development-only");
    expect(snapshot.activeProfileId).toBe(
      EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
    );
    expect(snapshot.selectionSource).toBe("native-development-gate");
    expect(snapshot.fallbackAvailable).toBe(false);
    expect(snapshot.profiles).toHaveLength(3);
  });

  it.each([
    [
      "native gate unavailable",
      dependencies({ gate: "unavailable" }),
      "unavailable",
    ],
    [
      "partial facts",
      dependencies({
        detector: { detect: vi.fn(async () => partialReport()) },
      }),
      "unknown",
    ],
    [
      "probe failure",
      dependencies({
        detector: {
          detect: vi.fn(async () => {
            throw new Error("private native detail");
          }),
        },
      }),
      "failed",
    ],
  ] as const)("maps %s to the closed %s state", async (_name, deps, status) => {
    const snapshot = await new HardwareProfileCompatibilityCoordinator(
      deps,
    ).check("application-start");

    expect(snapshot.status).toBe(status);
    expect(JSON.stringify(snapshot)).not.toContain("private native detail");
  });

  it("permits one concurrent probe and reuses the same in-flight result", async () => {
    let resolveReport:
      ((value: ReturnType<typeof completeReport>) => void) | undefined;
    const detect = vi.fn(
      () =>
        new Promise<ReturnType<typeof completeReport>>((resolve) => {
          resolveReport = resolve;
        }),
    );
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ detector: { detect } }),
    );

    const first = subject.check("application-start");
    const second = subject.check("explicit-recheck");
    expect(first).toBe(second);
    expect(detect).toHaveBeenCalledOnce();
    resolveReport!(completeReport());
    await expect(first).resolves.toMatchObject({
      status: "development-only",
    });
  });

  it("reprobes immediately before profile start and fails closed when capacity changed", async () => {
    const detect = vi
      .fn()
      .mockResolvedValueOnce(completeReport())
      .mockResolvedValueOnce(completeReport(1_024));
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ detector: { detect } }),
    );

    await expect(
      subject.isProfileStartAllowed(
        EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
        "application-start",
      ),
    ).resolves.toBe(true);
    await expect(
      subject.isProfileStartAllowed(
        EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
        "before-profile-start",
      ),
    ).resolves.toBe(false);
    expect(detect).toHaveBeenCalledTimes(2);
    expect(subject.observe()).toMatchObject({
      status: "unavailable",
      reason: "available-ram",
    });
  });

  it("persists only an admitted compatible explicit selection", async () => {
    const preferenceRepository = preference();
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ preference: preferenceRepository }),
    );
    await subject.check("application-start");

    await expect(
      subject.selectProfile(EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID),
    ).resolves.toBe(true);
    expect(preferenceRepository.write).toHaveBeenCalledWith(
      EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
    );
    expect(subject.observe()).toMatchObject({
      selectionSource: "preference",
      preferenceStatus: "used",
    });
    await expect(
      subject.selectProfile("supertonic-3-onnx-cpu-f1-es-v1"),
    ).resolves.toBe(false);
    expect(preferenceRepository.write).toHaveBeenCalledOnce();
  });

  it("does not use a stale or future-version preference", async () => {
    const stale = new HardwareProfileCompatibilityCoordinator(
      dependencies({
        preference: preference({
          status: "ready",
          profileId: "removed-profile",
        }),
      }),
    );
    await stale.check("application-start");
    expect(stale.observe()).toMatchObject({
      status: "development-only",
      preferenceStatus: "stale",
      selectionSource: "native-development-gate",
    });

    const futurePreference = preference({ status: "unsupported-version" });
    const future = new HardwareProfileCompatibilityCoordinator(
      dependencies({ preference: futurePreference }),
    );
    await future.check("application-start");
    expect(future.observe().canPersistSelection).toBe(false);
    await expect(
      future.selectProfile(EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID),
    ).resolves.toBe(false);
    expect(futurePreference.write).not.toHaveBeenCalled();
  });
});
