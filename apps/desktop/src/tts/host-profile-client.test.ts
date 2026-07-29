import { describe, expect, it, vi } from "vitest";

import {
  HostProfileDetectionClient,
  HostProfileDetectionClientError,
} from "./host-profile-client";

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

function createCompleteReport() {
  return {
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
      availablePhysicalMiB: knownQuantity(16_384),
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
        dedicatedMemoryMiB: knownQuantity(8_192),
        availableDedicatedMemoryMiB: knownQuantity(6_144),
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
  };
}

describe("host profile detection client", () => {
  it("invokes the bounded native probe and decodes a frozen report", async () => {
    const invokePort = vi.fn().mockResolvedValue(createCompleteReport());
    const client = new HostProfileDetectionClient(invokePort);

    const report = await client.detect();

    expect(invokePort).toHaveBeenCalledOnce();
    expect(invokePort).toHaveBeenCalledWith(
      "detect_host_profile_compatibility",
    );
    expect(report.probeStatus).toBe("complete");
    expect(report.providers.cuda.deviceClass).toBe("discrete-gpu");
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.providers.cuda.precisions)).toBe(true);
  });

  it("preserves an identity-free partial report without selecting a profile", async () => {
    const input = createCompleteReport() as {
      probeStatus: string;
      memory: { availablePhysicalMiB: unknown };
    };
    input.probeStatus = "partial";
    input.memory.availablePhysicalMiB = unknownQuantity();
    const client = new HostProfileDetectionClient(
      vi.fn().mockResolvedValue(input),
    );

    const report = await client.detect();

    expect(report.probeStatus).toBe("partial");
    expect(report.memory.availablePhysicalMiB).toEqual({
      status: "unknown",
    });
    expect(report).not.toHaveProperty("recommendation");
    expect(report).not.toHaveProperty("hostName");
  });

  it.each([
    ["malformed", { schemaVersion: 1 }],
    ["unsupported version", { ...createCompleteReport(), schemaVersion: 2 }],
    [
      "unexpected identity",
      { ...createCompleteReport(), hostName: "private-host" },
    ],
  ])(
    "rejects a %s native response with one fixed error",
    async (_name, value) => {
      const client = new HostProfileDetectionClient(
        vi.fn().mockResolvedValue(value),
      );

      await expect(client.detect()).rejects.toEqual(
        expect.objectContaining({
          code: "host-profile-probe-invalid-response",
          message: "The local host compatibility probe failed.",
        }),
      );
    },
  );

  it("does not expose native failure detail to the desktop", async () => {
    const client = new HostProfileDetectionClient(
      vi.fn().mockRejectedValue("private runtime detail"),
    );

    await expect(client.detect()).rejects.toBeInstanceOf(
      HostProfileDetectionClientError,
    );
    await expect(client.detect()).rejects.toEqual(
      expect.objectContaining({
        code: "host-profile-probe-unavailable",
        message: "The local host compatibility probe failed.",
      }),
    );
  });
});
