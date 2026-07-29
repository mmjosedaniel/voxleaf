import {
  decodeHostProfileCompatibilityReportV1,
  type HostProfileCompatibilityReportV1,
} from "@voxleaf/shared";
import { describe, expect, it } from "vitest";

import {
  HARDWARE_PROFILE_AUTHORITY_V1,
  calculateProfileCapacityRequirementMiB,
  type HardwareProfileRegistryEntryV1,
} from "./hardware-profile-authority";
import {
  matchHardwareProfilesV1,
  type HardwareProfileRejectionReasonV1,
} from "./hardware-profile-matcher";
import {
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  HARDWARE_PROFILE_REGISTRY_V1,
} from "./hardware-profile-registry";

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

function report(
  update: (value: ReturnType<typeof reportValue>) => unknown = (value) => value,
): HostProfileCompatibilityReportV1 {
  return decodeHostProfileCompatibilityReportV1(update(reportValue()));
}

function reportValue() {
  return {
    schemaVersion: 1,
    probeStatus: "complete" as const,
    platform: {
      operatingSystem: "windows" as const,
      architecture: "x86_64" as const,
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
        availability: "available" as const,
        deviceClass: "cpu" as const,
        dedicatedMemoryMiB: knownQuantity(0),
        availableDedicatedMemoryMiB: knownQuantity(0),
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
        dedicatedMemoryMiB: knownQuantity(12_288),
        availableDedicatedMemoryMiB: knownQuantity(9_216),
        precisions: {
          float32: "available" as const,
          float16: "available" as const,
          bfloat16: "available" as const,
          int8: "unknown" as const,
        },
      },
      directml: {
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
      },
      rocm: unavailableProvider(),
      metal: unavailableProvider(),
    },
  };
}

function supportedProfile(
  profileId = "synthetic-supported-profile",
): HardwareProfileRegistryEntryV1 {
  const source = HARDWARE_PROFILE_REGISTRY_V1[0];
  return {
    ...source,
    identity: { ...source.identity, profileId },
    role: "standard",
    supportState: "supported",
    requirements: {
      ...source.requirements,
      minimumLogicalProcessors: 12,
    },
    evidence: {
      ...source.evidence,
      gates: {
        startup: "pass",
        throughput: "pass",
        cancellation: "pass",
        memory: "pass",
        quality: "pass",
        offline: "pass",
        cleanup: "pass",
        license: "pass",
        packaging: "pass",
      },
    },
  };
}

function firstReason(
  host: HostProfileCompatibilityReportV1,
  profile: HardwareProfileRegistryEntryV1,
): HardwareProfileRejectionReasonV1 | undefined {
  return matchHardwareProfilesV1({
    report: host,
    registry: [profile],
    nativeDevelopmentGate: true,
  }).profiles[0]?.reason;
}

describe("hardware profile matcher v1", () => {
  it("admits only the exact native-gated development profile in the frozen registry", () => {
    const result = matchHardwareProfilesV1({
      report: report(),
      registry: HARDWARE_PROFILE_REGISTRY_V1,
      nativeDevelopmentGate: true,
    });

    expect(result.compatibleProfileIds).toEqual([
      EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
    ]);
    expect(result.recommendedProfileId).toBeUndefined();
    expect(result.selectedProfileId).toBeUndefined();
    expect(result.fallbackAvailable).toBe(false);
    expect(
      result.profiles.filter((profile) => profile.state === "incompatible"),
    ).toHaveLength(2);
  });

  it("does not admit development-only or rejected profiles without their authority", () => {
    const result = matchHardwareProfilesV1({
      report: report(),
      registry: HARDWARE_PROFILE_REGISTRY_V1,
      nativeDevelopmentGate: false,
    });

    expect(result.compatibleProfileIds).toEqual([]);
    expect(
      result.profiles.every(
        (profile) => profile.reason === "support-state-not-admitted",
      ),
    ).toBe(true);
  });

  it("fails in the frozen order for contract, probe, registry, support, and evidence", () => {
    const profile = supportedProfile();
    expect(
      firstReason(
        { ...report(), schemaVersion: 2 } as HostProfileCompatibilityReportV1,
        profile,
      ),
    ).toBe("contract-version");
    expect(
      firstReason(
        report((value) => ({ ...value, probeStatus: "partial" })),
        profile,
      ),
    ).toBe("probe-incomplete");
    expect(
      firstReason(report(), {
        ...profile,
        registryVersion: 2,
      } as unknown as HardwareProfileRegistryEntryV1),
    ).toBe("registry-entry-invalid");
    expect(
      firstReason(report(), {
        ...profile,
        supportState: "unsupported",
        evidence: {
          ...profile.evidence,
          gates: { ...profile.evidence.gates, startup: "fail" },
        },
      }),
    ).toBe("support-state-not-admitted");
    expect(
      firstReason(report(), {
        ...profile,
        evidence: {
          ...profile.evidence,
          gates: { ...profile.evidence.gates, startup: "fail" },
        },
      }),
    ).toBe("evidence-invalid");
  });

  it.each([
    [
      "operating-system",
      (value: ReturnType<typeof reportValue>) => ({
        ...value,
        platform: { ...value.platform, operatingSystem: "linux" as const },
      }),
    ],
    [
      "architecture",
      (value: ReturnType<typeof reportValue>) => ({
        ...value,
        platform: { ...value.platform, architecture: "aarch64" as const },
      }),
    ],
    [
      "logical-processors",
      (value: ReturnType<typeof reportValue>) => ({
        ...value,
        processor: { logicalProcessorCount: knownQuantity(11) },
      }),
    ],
    [
      "provider",
      (value: ReturnType<typeof reportValue>) => ({
        ...value,
        providers: { ...value.providers, cuda: unavailableProvider() },
      }),
    ],
    [
      "precision",
      (value: ReturnType<typeof reportValue>) => ({
        ...value,
        providers: {
          ...value.providers,
          cuda: {
            ...value.providers.cuda,
            precisions: {
              ...value.providers.cuda.precisions,
              bfloat16: "unavailable" as const,
            },
          },
        },
      }),
    ],
    [
      "device-class",
      (value: ReturnType<typeof reportValue>) => ({
        ...value,
        providers: {
          ...value.providers,
          cuda: {
            ...value.providers.cuda,
            deviceClass: "integrated-gpu" as const,
          },
        },
      }),
    ],
  ] satisfies readonly [
    HardwareProfileRejectionReasonV1,
    (value: ReturnType<typeof reportValue>) => unknown,
  ][])("rejects the %s requirement", (reason, update) => {
    expect(firstReason(report(update), supportedProfile())).toBe(reason);
  });

  it("passes exact capacity boundaries and rejects one MiB below each boundary", () => {
    const profile = supportedProfile();
    const availableRam = calculateProfileCapacityRequirementMiB(
      "ram",
      profile.requirements.measuredPeakRamMiB,
    );
    const totalRam =
      availableRam +
      HARDWARE_PROFILE_AUTHORITY_V1.safetyMargins.ram.totalPhysicalReserveMiB;
    const storage = calculateProfileCapacityRequirementMiB(
      "storage",
      profile.requirements.measuredArtifactFootprintMiB,
    );
    const vram = calculateProfileCapacityRequirementMiB(
      "vram",
      profile.requirements.measuredPeakDedicatedVramMiB,
    );
    const exact = report((value) => ({
      ...value,
      memory: {
        totalPhysicalMiB: knownQuantity(totalRam),
        availablePhysicalMiB: knownQuantity(availableRam),
      },
      storage: {
        applicationVolumeAvailableMiB: knownQuantity(storage),
      },
      providers: {
        ...value.providers,
        cuda: {
          ...value.providers.cuda,
          dedicatedMemoryMiB: knownQuantity(vram),
          availableDedicatedMemoryMiB: knownQuantity(vram),
        },
      },
    }));
    expect(firstReason(exact, profile)).toBeUndefined();

    const cases: Array<
      readonly [
        HardwareProfileRejectionReasonV1,
        (value: ReturnType<typeof reportValue>) => unknown,
      ]
    > = [
      [
        "total-ram",
        (value) => ({
          ...value,
          memory: {
            totalPhysicalMiB: knownQuantity(totalRam - 1),
            availablePhysicalMiB: knownQuantity(availableRam),
          },
        }),
      ],
      [
        "available-ram",
        (value) => ({
          ...value,
          memory: {
            totalPhysicalMiB: knownQuantity(totalRam),
            availablePhysicalMiB: knownQuantity(availableRam - 1),
          },
        }),
      ],
      [
        "application-volume-storage",
        (value) => ({
          ...value,
          storage: {
            applicationVolumeAvailableMiB: knownQuantity(storage - 1),
          },
        }),
      ],
      [
        "dedicated-vram",
        (value) => ({
          ...value,
          providers: {
            ...value.providers,
            cuda: {
              ...value.providers.cuda,
              dedicatedMemoryMiB: knownQuantity(vram - 1),
              availableDedicatedMemoryMiB: knownQuantity(vram - 1),
            },
          },
        }),
      ],
      [
        "available-dedicated-vram",
        (value) => ({
          ...value,
          providers: {
            ...value.providers,
            cuda: {
              ...value.providers.cuda,
              dedicatedMemoryMiB: knownQuantity(vram),
              availableDedicatedMemoryMiB: knownQuantity(vram - 1),
            },
          },
        }),
      ],
    ];
    for (const [reason, update] of cases) {
      expect(firstReason(report(update), profile)).toBe(reason);
    }
  });

  it("fails closed on unknown facts and over-limit registry requirements", () => {
    expect(
      firstReason(
        report((value) => ({
          ...value,
          memory: {
            ...value.memory,
            availablePhysicalMiB: unknownQuantity(),
          },
        })),
        supportedProfile(),
      ),
    ).toBe("available-ram");

    expect(
      firstReason(report(), {
        ...supportedProfile(),
        requirements: {
          ...supportedProfile().requirements,
          measuredPeakRamMiB:
            HARDWARE_PROFILE_AUTHORITY_V1.compatibilityContract
              .maximumQuantityMiB,
        },
      }),
    ).toBe("registry-entry-invalid");

    const oversized = Array.from(
      {
        length: HARDWARE_PROFILE_AUTHORITY_V1.registry.maximumEntries + 1,
      },
      (_value, index) => supportedProfile(`synthetic-profile-${String(index)}`),
    );
    expect(
      matchHardwareProfilesV1({
        report: report(),
        registry: oversized,
        nativeDevelopmentGate: true,
      }).profiles.every(
        (profile) => profile.reason === "registry-entry-invalid",
      ),
    ).toBe(true);
  });

  it("reuses only a compatible preference and otherwise recommends one unique supported profile", () => {
    const profile = supportedProfile();
    const preferred = matchHardwareProfilesV1({
      report: report(),
      registry: [profile],
      nativeDevelopmentGate: true,
      preferredProfileId: profile.identity.profileId,
    });
    expect(preferred.preferenceState).toBe("used");
    expect(preferred.selectedProfileId).toBe(profile.identity.profileId);
    expect(preferred.recommendedProfileId).toBeUndefined();

    const stale = matchHardwareProfilesV1({
      report: report(),
      registry: [profile],
      nativeDevelopmentGate: true,
      preferredProfileId: "removed-profile",
    });
    expect(stale.preferenceState).toBe("stale");
    expect(stale.selectedProfileId).toBeUndefined();
    expect(stale.recommendedProfileId).toBe(profile.identity.profileId);
  });

  it("returns no recommendation for an ambiguity and never uses profile ID as a tie breaker", () => {
    const result = matchHardwareProfilesV1({
      report: report(),
      registry: [supportedProfile("z-profile"), supportedProfile("a-profile")],
      nativeDevelopmentGate: true,
    });

    expect(result.compatibleProfileIds).toEqual(["a-profile", "z-profile"]);
    expect(result.recommendedProfileId).toBeUndefined();
    expect(result.selectedProfileId).toBeUndefined();
  });
});
