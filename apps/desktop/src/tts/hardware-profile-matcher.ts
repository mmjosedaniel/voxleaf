import type {
  HostProfileCompatibilityReportV1,
  HostProviderCapabilityV1,
} from "@voxleaf/shared";

import {
  HARDWARE_PROFILE_AUTHORITY_V1,
  calculateProfileAvailableDedicatedVramRequirementMiB,
  calculateProfileCapacityRequirementMiB,
  type HardwareProfileEvidenceGateStateV1,
  type HardwareProfileRegistryEntryV1,
} from "./hardware-profile-authority";

export type HardwareProfileRejectionReasonV1 =
  | "contract-version"
  | "probe-incomplete"
  | "registry-entry-invalid"
  | "support-state-not-admitted"
  | "evidence-invalid"
  | "operating-system"
  | "architecture"
  | "logical-processors"
  | "total-ram"
  | "available-ram"
  | "application-volume-storage"
  | "provider"
  | "precision"
  | "device-class"
  | "dedicated-vram"
  | "available-dedicated-vram";

export type HardwareProfileMatchStateV1 =
  "compatible" | "incompatible" | "unknown";

export interface HardwareProfileMatchV1 {
  readonly profileId: string;
  readonly role: HardwareProfileRegistryEntryV1["role"];
  readonly supportState: HardwareProfileRegistryEntryV1["supportState"];
  readonly state: HardwareProfileMatchStateV1;
  readonly reason: HardwareProfileRejectionReasonV1 | undefined;
}

export type HardwareProfilePreferenceMatchStateV1 =
  "missing" | "stale" | "used";

export interface HardwareProfileMatchResultV1 {
  readonly profiles: readonly HardwareProfileMatchV1[];
  readonly compatibleProfileIds: readonly string[];
  readonly selectedProfileId: string | undefined;
  readonly recommendedProfileId: string | undefined;
  readonly preferenceState: HardwareProfilePreferenceMatchStateV1;
  readonly fallbackAvailable: boolean;
}

export interface MatchHardwareProfilesInputV1 {
  readonly report: HostProfileCompatibilityReportV1;
  readonly registry: readonly HardwareProfileRegistryEntryV1[];
  readonly nativeDevelopmentGate: boolean;
  readonly preferredProfileId?: string;
}

const SHA256_PATTERN = /^[0-9a-f]{64}$/u;
const GIT_SHA1_PATTERN = /^[0-9a-f]{40}$/u;
const TEXT_ENCODER = new TextEncoder();

function compareCodePoints(left: string, right: string): number {
  const leftCodePoints = Array.from(left, (value) => value.codePointAt(0)!);
  const rightCodePoints = Array.from(right, (value) => value.codePointAt(0)!);
  const maximum = Math.max(leftCodePoints.length, rightCodePoints.length);
  for (let index = 0; index < maximum; index += 1) {
    const leftValue = leftCodePoints[index];
    const rightValue = rightCodePoints[index];
    if (leftValue === undefined) {
      return -1;
    }
    if (rightValue === undefined) {
      return 1;
    }
    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }
  return 0;
}

function isBoundedIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    Array.from(value).length <=
      HARDWARE_PROFILE_AUTHORITY_V1.registry.maximumIdentifierCodePoints &&
    TEXT_ENCODER.encode(value).byteLength <=
      HARDWARE_PROFILE_AUTHORITY_V1.registry.maximumIdentifierUtf8Bytes
  );
}

function isQuantity(value: unknown): value is number {
  return (
    Number.isSafeInteger(value) &&
    (value as number) >= 0 &&
    (value as number) <=
      HARDWARE_PROFILE_AUTHORITY_V1.compatibilityContract.maximumQuantityMiB
  );
}

function hasUniqueValues(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function hasValidEntryShape(entry: HardwareProfileRegistryEntryV1): boolean {
  const { identity, requirements, evidence } = entry;
  const identifiers = [
    identity.profileId,
    identity.engineId,
    identity.engineVersion,
    identity.modelId,
    identity.modelRevision,
    identity.voiceId,
    identity.runtimeId,
    identity.runtimeVersion,
  ];
  const validOperatingSystems = new Set(["windows", "linux", "macos", "other"]);
  const validArchitectures = new Set(["x86_64", "aarch64", "other"]);
  const validProviders = new Set(["cpu", "cuda", "directml", "rocm", "metal"]);
  const validPrecisions = new Set(["float32", "float16", "bfloat16", "int8"]);
  const validDeviceClasses = new Set([
    "cpu",
    "discrete-gpu",
    "integrated-gpu",
    "software",
  ]);
  const validRoles = new Set(["standard", "development-demo", "cpu-fallback"]);
  const validSupportStates = new Set(
    HARDWARE_PROFILE_AUTHORITY_V1.registry.supportStates,
  );
  const gateKeys = Object.keys(evidence.gates);

  if (
    entry.registryVersion !== HARDWARE_PROFILE_AUTHORITY_V1.registry.version ||
    !identifiers.every(isBoundedIdentifier) ||
    !SHA256_PATTERN.test(identity.generationConfigurationSha256) ||
    !validRoles.has(entry.role) ||
    !validSupportStates.has(entry.supportState) ||
    requirements.operatingSystems.length === 0 ||
    !hasUniqueValues(requirements.operatingSystems) ||
    !requirements.operatingSystems.every((value) =>
      validOperatingSystems.has(value),
    ) ||
    requirements.architectures.length === 0 ||
    !hasUniqueValues(requirements.architectures) ||
    !requirements.architectures.every((value) =>
      validArchitectures.has(value),
    ) ||
    !Number.isSafeInteger(requirements.minimumLogicalProcessors) ||
    requirements.minimumLogicalProcessors < 1 ||
    requirements.minimumLogicalProcessors >
      HARDWARE_PROFILE_AUTHORITY_V1.compatibilityContract
        .maximumLogicalProcessors ||
    !validProviders.has(requirements.provider) ||
    !validPrecisions.has(requirements.precision) ||
    requirements.deviceClasses.length === 0 ||
    !hasUniqueValues(requirements.deviceClasses) ||
    !requirements.deviceClasses.every((value) =>
      validDeviceClasses.has(value),
    ) ||
    !isQuantity(requirements.measuredPeakRamMiB) ||
    !isQuantity(requirements.measuredPeakDedicatedVramMiB) ||
    !isQuantity(requirements.measuredArtifactFootprintMiB) ||
    !GIT_SHA1_PATTERN.test(evidence.authorityCommitSha) ||
    !GIT_SHA1_PATTERN.test(evidence.resultCommitSha) ||
    evidence.authorityCommitSha === evidence.resultCommitSha ||
    !SHA256_PATTERN.test(evidence.authoritySha256) ||
    !SHA256_PATTERN.test(evidence.resultSha256) ||
    !SHA256_PATTERN.test(evidence.decisionSha256) ||
    gateKeys.length !==
      HARDWARE_PROFILE_AUTHORITY_V1.registry.evidenceGates.length ||
    !HARDWARE_PROFILE_AUTHORITY_V1.registry.evidenceGates.every((gate) =>
      Object.hasOwn(evidence.gates, gate),
    )
  ) {
    return false;
  }

  try {
    const availableRam = calculateProfileCapacityRequirementMiB(
      "ram",
      requirements.measuredPeakRamMiB,
    );
    calculateProfileCapacityRequirementMiB(
      "storage",
      requirements.measuredArtifactFootprintMiB,
    );
    if (requirements.measuredPeakDedicatedVramMiB > 0) {
      calculateProfileCapacityRequirementMiB(
        "vram",
        requirements.measuredPeakDedicatedVramMiB,
      );
      calculateProfileAvailableDedicatedVramRequirementMiB(
        entry.role,
        entry.supportState,
        requirements.measuredPeakDedicatedVramMiB,
      );
    }
    return (
      availableRam +
        HARDWARE_PROFILE_AUTHORITY_V1.safetyMargins.ram
          .totalPhysicalReserveMiB <=
      HARDWARE_PROFILE_AUTHORITY_V1.compatibilityContract.maximumQuantityMiB
    );
  } catch {
    return false;
  }
}

function evidenceSemanticsAreValid(
  entry: HardwareProfileRegistryEntryV1,
): boolean {
  const states = Object.values(
    entry.evidence.gates,
  ) as HardwareProfileEvidenceGateStateV1[];
  if (
    states.some(
      (state) =>
        state !== "pass" && state !== "fail" && state !== "unavailable",
    )
  ) {
    return false;
  }

  switch (entry.supportState) {
    case "supported":
      return states.every((state) => state === "pass");
    case "development-only":
      return (
        entry.role === "development-demo" &&
        states.some((state) => state === "fail") &&
        !states.includes("unavailable")
      );
    case "unsupported":
      return states.some((state) => state === "fail");
    case "unknown":
      return states.includes("unavailable");
  }
}

function match(
  state: HardwareProfileMatchStateV1,
  entry: HardwareProfileRegistryEntryV1,
  reason?: HardwareProfileRejectionReasonV1,
): HardwareProfileMatchV1 {
  return Object.freeze({
    profileId: entry.identity.profileId,
    role: entry.role,
    supportState: entry.supportState,
    state,
    reason,
  });
}

function knownQuantity(
  value: Readonly<{ readonly status: string; readonly value?: number }>,
): number | undefined {
  return value.status === "known" ? value.value : undefined;
}

function insufficientQuantity(
  value: Readonly<{ readonly status: string; readonly value?: number }>,
  required: number,
  entry: HardwareProfileRegistryEntryV1,
  reason: HardwareProfileRejectionReasonV1,
): HardwareProfileMatchV1 | undefined {
  const known = knownQuantity(value);
  if (known === undefined) {
    return match("unknown", entry, reason);
  }
  return known < required ? match("incompatible", entry, reason) : undefined;
}

function providerFailure(
  provider: HostProviderCapabilityV1,
  entry: HardwareProfileRegistryEntryV1,
): HardwareProfileMatchV1 | undefined {
  if (provider.availability !== "available") {
    return match(
      provider.availability === "unknown" ? "unknown" : "incompatible",
      entry,
      "provider",
    );
  }

  const precision = provider.precisions[entry.requirements.precision];
  if (precision !== "available") {
    return match(
      precision === "unknown" ? "unknown" : "incompatible",
      entry,
      "precision",
    );
  }

  if (
    provider.deviceClass === "unknown" ||
    !entry.requirements.deviceClasses.includes(provider.deviceClass)
  ) {
    return match(
      provider.deviceClass === "unknown" ? "unknown" : "incompatible",
      entry,
      "device-class",
    );
  }

  // CPU profiles have exact zero dedicated memory. The dedicated-memory
  // margin applies only when the measured profile consumed dedicated VRAM.
  if (entry.requirements.measuredPeakDedicatedVramMiB === 0) {
    return undefined;
  }

  const requiredTotalVram = calculateProfileCapacityRequirementMiB(
    "vram",
    entry.requirements.measuredPeakDedicatedVramMiB,
  );
  const requiredAvailableVram =
    calculateProfileAvailableDedicatedVramRequirementMiB(
      entry.role,
      entry.supportState,
      entry.requirements.measuredPeakDedicatedVramMiB,
    );
  return (
    insufficientQuantity(
      provider.dedicatedMemoryMiB,
      requiredTotalVram,
      entry,
      "dedicated-vram",
    ) ??
    insufficientQuantity(
      provider.availableDedicatedMemoryMiB,
      requiredAvailableVram,
      entry,
      "available-dedicated-vram",
    )
  );
}

function matchEntry(
  report: HostProfileCompatibilityReportV1,
  entry: HardwareProfileRegistryEntryV1,
  nativeDevelopmentGate: boolean,
  registryValid: boolean,
): HardwareProfileMatchV1 {
  if (Number(report.schemaVersion) !== 1) {
    return match("unknown", entry, "contract-version");
  }
  if (report.probeStatus !== "complete") {
    return match("unknown", entry, "probe-incomplete");
  }
  if (!registryValid || !hasValidEntryShape(entry)) {
    return match("unknown", entry, "registry-entry-invalid");
  }
  if (
    entry.supportState === "unsupported" ||
    entry.supportState === "unknown" ||
    (entry.supportState === "development-only" && !nativeDevelopmentGate)
  ) {
    return match("incompatible", entry, "support-state-not-admitted");
  }
  if (!evidenceSemanticsAreValid(entry)) {
    return match("unknown", entry, "evidence-invalid");
  }
  if (
    report.platform.operatingSystem === "unknown" ||
    !entry.requirements.operatingSystems.includes(
      report.platform.operatingSystem,
    )
  ) {
    return match(
      report.platform.operatingSystem === "unknown"
        ? "unknown"
        : "incompatible",
      entry,
      "operating-system",
    );
  }
  if (
    report.platform.architecture === "unknown" ||
    !entry.requirements.architectures.includes(report.platform.architecture)
  ) {
    return match(
      report.platform.architecture === "unknown" ? "unknown" : "incompatible",
      entry,
      "architecture",
    );
  }

  const processorFailure = insufficientQuantity(
    report.processor.logicalProcessorCount,
    entry.requirements.minimumLogicalProcessors,
    entry,
    "logical-processors",
  );
  if (processorFailure !== undefined) {
    return processorFailure;
  }

  const availableRamRequirement = calculateProfileCapacityRequirementMiB(
    "ram",
    entry.requirements.measuredPeakRamMiB,
  );
  const totalRamRequirement =
    availableRamRequirement +
    HARDWARE_PROFILE_AUTHORITY_V1.safetyMargins.ram.totalPhysicalReserveMiB;
  const memoryFailure =
    insufficientQuantity(
      report.memory.totalPhysicalMiB,
      totalRamRequirement,
      entry,
      "total-ram",
    ) ??
    insufficientQuantity(
      report.memory.availablePhysicalMiB,
      availableRamRequirement,
      entry,
      "available-ram",
    );
  if (memoryFailure !== undefined) {
    return memoryFailure;
  }

  const storageFailure = insufficientQuantity(
    report.storage.applicationVolumeAvailableMiB,
    calculateProfileCapacityRequirementMiB(
      "storage",
      entry.requirements.measuredArtifactFootprintMiB,
    ),
    entry,
    "application-volume-storage",
  );
  if (storageFailure !== undefined) {
    return storageFailure;
  }

  const provider = report.providers[entry.requirements.provider];
  return (
    providerFailure(provider, entry) ?? match("compatible", entry, undefined)
  );
}

export function matchHardwareProfilesV1({
  report,
  registry,
  nativeDevelopmentGate,
  preferredProfileId,
}: MatchHardwareProfilesInputV1): HardwareProfileMatchResultV1 {
  const registryValid =
    registry.length <= HARDWARE_PROFILE_AUTHORITY_V1.registry.maximumEntries &&
    new Set(registry.map((entry) => entry.identity.profileId)).size ===
      registry.length;
  const entries = [...registry].sort((left, right) =>
    compareCodePoints(left.identity.profileId, right.identity.profileId),
  );
  const profiles = Object.freeze(
    entries.map((entry) =>
      matchEntry(report, entry, nativeDevelopmentGate, registryValid),
    ),
  );
  const compatibleProfileIds = Object.freeze(
    profiles
      .filter((profile) => profile.state === "compatible")
      .map((profile) => profile.profileId),
  );
  const preferredMatch =
    preferredProfileId === undefined
      ? undefined
      : profiles.find((profile) => profile.profileId === preferredProfileId);
  const preferenceState =
    preferredProfileId === undefined
      ? "missing"
      : preferredMatch?.state === "compatible"
        ? "used"
        : "stale";
  const supportedMatches = profiles.filter(
    (profile) =>
      profile.state === "compatible" && profile.supportState === "supported",
  );
  const recommendedProfileId =
    preferredMatch?.state === "compatible"
      ? undefined
      : supportedMatches.length === 1
        ? supportedMatches[0]!.profileId
        : undefined;
  const fallbackAvailable = profiles.some(
    (profile) =>
      profile.state === "compatible" &&
      profile.supportState === "supported" &&
      profile.role === "cpu-fallback",
  );

  return Object.freeze({
    profiles,
    compatibleProfileIds,
    selectedProfileId:
      preferredMatch?.state === "compatible"
        ? preferredMatch.profileId
        : undefined,
    recommendedProfileId,
    preferenceState,
    fallbackAvailable,
  });
}
