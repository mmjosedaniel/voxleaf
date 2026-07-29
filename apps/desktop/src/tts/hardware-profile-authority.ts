import type {
  HostArchitectureV1,
  HostDeviceClassV1,
  HostOperatingSystemV1,
  HostProviderNameV1,
} from "@voxleaf/shared";

export type HardwareProfileSupportStateV1 =
  "supported" | "development-only" | "unsupported" | "unknown";

export type HardwareProfileRoleV1 =
  "standard" | "development-demo" | "cpu-fallback";

export type HardwareProfileEvidenceGateV1 =
  | "startup"
  | "throughput"
  | "cancellation"
  | "memory"
  | "quality"
  | "offline"
  | "cleanup"
  | "license"
  | "packaging";

export type HardwareProfileEvidenceGateStateV1 =
  "pass" | "fail" | "unavailable";

export interface HardwareProfileIdentityV1 {
  readonly profileId: string;
  readonly engineId: string;
  readonly engineVersion: string;
  readonly modelId: string;
  readonly modelRevision: string;
  readonly voiceId: string;
  readonly runtimeId: string;
  readonly runtimeVersion: string;
  readonly generationConfigurationSha256: string;
}

export interface HardwareProfileRequirementsV1 {
  readonly operatingSystems: readonly Exclude<
    HostOperatingSystemV1,
    "unknown"
  >[];
  readonly architectures: readonly Exclude<HostArchitectureV1, "unknown">[];
  readonly minimumLogicalProcessors: number;
  readonly provider: HostProviderNameV1;
  readonly precision: "float32" | "float16" | "bfloat16" | "int8";
  readonly deviceClasses: readonly Exclude<HostDeviceClassV1, "unknown">[];
  readonly measuredPeakRamMiB: number;
  readonly measuredPeakDedicatedVramMiB: number;
  readonly measuredArtifactFootprintMiB: number;
}

export interface HardwareProfileEvidenceV1 {
  readonly authorityCommitSha: string;
  readonly authoritySha256: string;
  readonly resultCommitSha: string;
  readonly resultSha256: string;
  readonly decisionSha256: string;
  readonly gates: Readonly<
    Record<HardwareProfileEvidenceGateV1, HardwareProfileEvidenceGateStateV1>
  >;
}

export interface HardwareProfileRegistryEntryV1 {
  readonly registryVersion: 1;
  readonly identity: HardwareProfileIdentityV1;
  readonly role: HardwareProfileRoleV1;
  readonly supportState: HardwareProfileSupportStateV1;
  readonly requirements: HardwareProfileRequirementsV1;
  readonly evidence: HardwareProfileEvidenceV1;
}

export type ProfileResourceKindV1 = "ram" | "vram" | "storage";

export type RecoveryFailureCodeV1 =
  | "provider-unavailable"
  | "model-load-failed"
  | "model-warm-failed"
  | "service-crashed"
  | "protocol-failed"
  | "resource-exhausted"
  | "cancellation-timeout"
  | "playback-failed"
  | "cleanup-failed"
  | "repeated-recovery-failed";

export type RecoveryActionV1 =
  | "select-compatible-profile"
  | "explicit-service-restart"
  | "explicit-playback-reinitialize"
  | "contain-and-stop";

export interface RecoveryFailureAuthorityV1 {
  readonly code: RecoveryFailureCodeV1;
  readonly action: RecoveryActionV1;
  readonly explicitAttempts: 0 | 1;
  readonly automaticAttempts: 0;
  readonly terminalAfterAttemptFailure: true;
}

export type RecoveryPhaseV1 =
  | "operational"
  | "invalidating"
  | "releasing"
  | "containing-service"
  | "verifying-cleanup"
  | "recovery-available"
  | "recovering"
  | "unavailable"
  | "contained";

export type RecoveryEventV1 =
  | "failure-detected"
  | "identity-invalidated"
  | "playback-and-preparation-released"
  | "service-contained"
  | "cleanup-verified-recoverable"
  | "cleanup-verified-terminal"
  | "cleanup-failed"
  | "explicit-recovery-requested"
  | "recovery-succeeded"
  | "recovery-failed";

export interface RecoveryTransitionAuthorityV1 {
  readonly event: RecoveryEventV1;
  readonly from: readonly RecoveryPhaseV1[];
  readonly to: RecoveryPhaseV1;
}

function recoveryFailure(
  value: RecoveryFailureAuthorityV1,
): RecoveryFailureAuthorityV1 {
  return Object.freeze({ ...value });
}

function recoveryTransition(
  value: RecoveryTransitionAuthorityV1,
): RecoveryTransitionAuthorityV1 {
  return Object.freeze({
    ...value,
    from: Object.freeze([...value.from]),
  });
}

export const HARDWARE_PROFILE_AUTHORITY_V1 = Object.freeze({
  authorityVersion: 1,
  compatibilityContract: Object.freeze({
    family: "host-profile-compatibility-report" as const,
    schemaVersion: 1,
    mebibyteBytes: 1_048_576,
    maximumLogicalProcessors: 1_024,
    maximumQuantityMiB: 16_777_216,
    unknownSatisfiesRequirement: false,
    nonCompleteProbeSatisfiesRequirement: false,
    rawReportPersistence: "prohibited" as const,
  }),
  registry: Object.freeze({
    version: 1,
    maximumEntries: 64,
    maximumIdentifierCodePoints: 128,
    maximumIdentifierUtf8Bytes: 512,
    hashFormat: "lowercase-sha256-hex" as const,
    commitFormat: "lowercase-git-sha1-hex" as const,
    supportStates: Object.freeze([
      "supported",
      "development-only",
      "unsupported",
      "unknown",
    ] as const),
    evidenceGates: Object.freeze([
      "startup",
      "throughput",
      "cancellation",
      "memory",
      "quality",
      "offline",
      "cleanup",
      "license",
      "packaging",
    ] as const),
  }),
  safetyMargins: Object.freeze({
    ram: Object.freeze({
      percentageNumerator: 25,
      percentageDenominator: 100,
      minimumMiB: 2_048,
      totalPhysicalReserveMiB: 4_096,
    }),
    vram: Object.freeze({
      percentageNumerator: 20,
      percentageDenominator: 100,
      minimumMiB: 1_024,
    }),
    storage: Object.freeze({
      percentageNumerator: 10,
      percentageDenominator: 100,
      minimumMiB: 2_048,
    }),
  }),
  developmentOnlyAdmission: Object.freeze({
    availableDedicatedVramReserveMiB: 512,
    role: "development-demo" as const,
    supportState: "development-only" as const,
  }),
  matching: Object.freeze({
    order: Object.freeze([
      "contract-version",
      "probe-complete",
      "registry-entry-valid",
      "support-state-admitted",
      "evidence-provenance-and-gates",
      "platform",
      "processor",
      "total-ram",
      "available-ram",
      "application-volume-storage",
      "provider",
      "precision",
      "device-class",
      "dedicated-vram",
      "available-dedicated-vram",
      "validated-user-preference",
      "unique-recommendation",
    ] as const),
    automaticRecommendationStates: Object.freeze(["supported"] as const),
    developmentOnlyActivation: "explicit-native-development-gate" as const,
    unsupportedOrUnknownSelection: "prohibited" as const,
    hardRequirementOverride: "prohibited" as const,
    equalTopMatch: "no-recommendation" as const,
    displayOrder: "profile-id-code-point-order" as const,
  }),
  preference: Object.freeze({
    storageKey: "voxleaf.tts.profile-preference",
    schemaVersion: 1,
    maximumEntries: 1,
    maximumEnvelopeUtf16CodeUnits: 1_024,
    maximumProfileIdCodePoints: 128,
    maximumProfileIdUtf8Bytes: 512,
    storedFields: Object.freeze(["schemaVersion", "profileId"] as const),
    reuse: "reprobe-and-revalidate-before-use" as const,
    futureVersion: "preserve-without-use-or-coercion" as const,
  }),
  recovery: Object.freeze({
    budgets: Object.freeze({
      automaticSegmentRetries: 0,
      automaticServiceRestarts: 0,
      explicitServiceRestartsPerFailureEpisode: 1,
      explicitPlaybackReinitializationsPerFailureEpisode: 1,
      maximumActiveServiceTrees: 1,
    }),
    identityOrder: Object.freeze([
      "replace-session-and-generation-identity",
      "stop-and-release-playback",
      "abort-and-release-preparation",
      "release-queued-units",
      "contain-or-terminate-service-tree",
      "verify-zero-retained-service-and-audio-ownership",
      "preserve-latest-heard-checkpoint",
      "allow-explicit-recovery",
    ] as const),
    resume: Object.freeze({
      authority: "latest-valid-heard-checkpoint" as const,
      midSegment: "replay-from-segment-start" as const,
      failureMayAdvanceProgress: false,
    }),
    observations: Object.freeze({
      compatibility: Object.freeze([
        "application-start",
        "explicit-recheck",
        "before-profile-start",
        "operating-system-resume",
      ] as const),
      maximumConcurrentCompatibilityProbes: 1,
      resourceObservationMinimumIntervalMs: 1_000,
      bufferObservationMaximumIntervalMs: 250,
      maximumRetainedResourceObservations: 8,
      maximumRetainedFailureEntries: 8,
      wallClockTimestamps: "prohibited" as const,
    }),
    diagnostics: Object.freeze({
      fields: Object.freeze([
        "failure-code",
        "recovery-phase",
        "bounded-sequence",
        "profile-id",
      ] as const),
      freeFormText: "prohibited" as const,
      persistence: "prohibited" as const,
    }),
    messages: Object.freeze([
      "checking-compatibility",
      "development-profile",
      "profile-unavailable",
      "fallback-unavailable",
      "provider-unavailable",
      "lead-low",
      "buffering",
      "recovery-available",
      "recovering",
      "recovery-failed",
      "contained",
    ] as const),
  }),
  cleanup: Object.freeze({
    identityInvalidationMaximumMs: 500,
    processTreeTerminationMaximumMs: 2_000,
    finalCleanupMaximumMs: 5_000,
    generatedAudioPersistence: "prohibited" as const,
    rawFailureLogRetentionBytes: 0,
    standardErrorRetentionBytes: 0,
  }),
  boundaries: Object.freeze({
    capabilityReportV1Change: false,
    ttsProtocolV1Change: false,
    narrationSegmentationChange: false,
    adaptiveBufferLimitChange: false,
    readingLocatorChange: false,
    hardwareSupportClaim: false,
    cpuFallbackClaim: false,
    automaticRetry: false,
    dependencyChange: false,
    tauriPluginOrCapabilityChange: false,
  }),
});

export const RECOVERY_FAILURE_AUTHORITY_V1 = Object.freeze([
  recoveryFailure({
    code: "provider-unavailable",
    action: "select-compatible-profile",
    explicitAttempts: 1,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
  recoveryFailure({
    code: "model-load-failed",
    action: "explicit-service-restart",
    explicitAttempts: 1,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
  recoveryFailure({
    code: "model-warm-failed",
    action: "explicit-service-restart",
    explicitAttempts: 1,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
  recoveryFailure({
    code: "service-crashed",
    action: "explicit-service-restart",
    explicitAttempts: 1,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
  recoveryFailure({
    code: "protocol-failed",
    action: "contain-and-stop",
    explicitAttempts: 0,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
  recoveryFailure({
    code: "resource-exhausted",
    action: "explicit-service-restart",
    explicitAttempts: 1,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
  recoveryFailure({
    code: "cancellation-timeout",
    action: "contain-and-stop",
    explicitAttempts: 0,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
  recoveryFailure({
    code: "playback-failed",
    action: "explicit-playback-reinitialize",
    explicitAttempts: 1,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
  recoveryFailure({
    code: "cleanup-failed",
    action: "contain-and-stop",
    explicitAttempts: 0,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
  recoveryFailure({
    code: "repeated-recovery-failed",
    action: "contain-and-stop",
    explicitAttempts: 0,
    automaticAttempts: 0,
    terminalAfterAttemptFailure: true,
  }),
] as const);

export const RECOVERY_TRANSITION_TABLE_V1 = Object.freeze([
  recoveryTransition({
    event: "failure-detected",
    from: ["operational"],
    to: "invalidating",
  }),
  recoveryTransition({
    event: "identity-invalidated",
    from: ["invalidating"],
    to: "releasing",
  }),
  recoveryTransition({
    event: "playback-and-preparation-released",
    from: ["releasing"],
    to: "containing-service",
  }),
  recoveryTransition({
    event: "service-contained",
    from: ["containing-service"],
    to: "verifying-cleanup",
  }),
  recoveryTransition({
    event: "cleanup-verified-recoverable",
    from: ["verifying-cleanup"],
    to: "recovery-available",
  }),
  recoveryTransition({
    event: "cleanup-verified-terminal",
    from: ["verifying-cleanup"],
    to: "unavailable",
  }),
  recoveryTransition({
    event: "cleanup-failed",
    from: ["verifying-cleanup"],
    to: "contained",
  }),
  recoveryTransition({
    event: "explicit-recovery-requested",
    from: ["recovery-available"],
    to: "recovering",
  }),
  recoveryTransition({
    event: "recovery-succeeded",
    from: ["recovering"],
    to: "operational",
  }),
  recoveryTransition({
    event: "recovery-failed",
    from: ["recovering"],
    to: "unavailable",
  }),
] as const);

export function calculateProfileCapacityRequirementMiB(
  kind: ProfileResourceKindV1,
  measuredMiB: number,
): number {
  const maximum =
    HARDWARE_PROFILE_AUTHORITY_V1.compatibilityContract.maximumQuantityMiB;
  if (
    !Number.isSafeInteger(measuredMiB) ||
    measuredMiB < 0 ||
    measuredMiB > maximum
  ) {
    throw new RangeError("Profile resource observation is outside authority.");
  }

  const policy = HARDWARE_PROFILE_AUTHORITY_V1.safetyMargins[kind];
  const percentageMargin = Math.ceil(
    (measuredMiB * policy.percentageNumerator) / policy.percentageDenominator,
  );
  const requirement =
    measuredMiB + Math.max(policy.minimumMiB, percentageMargin);
  if (requirement > maximum) {
    throw new RangeError("Profile resource requirement exceeds authority.");
  }
  return requirement;
}

export function calculateProfileAvailableDedicatedVramRequirementMiB(
  role: HardwareProfileRoleV1,
  supportState: HardwareProfileSupportStateV1,
  measuredMiB: number,
): number {
  const genericRequirement = calculateProfileCapacityRequirementMiB(
    "vram",
    measuredMiB,
  );
  const policy = HARDWARE_PROFILE_AUTHORITY_V1.developmentOnlyAdmission;
  if (role !== policy.role || supportState !== policy.supportState) {
    return genericRequirement;
  }

  const requirement = measuredMiB + policy.availableDedicatedVramReserveMiB;
  if (
    requirement >
    HARDWARE_PROFILE_AUTHORITY_V1.compatibilityContract.maximumQuantityMiB
  ) {
    throw new RangeError("Profile resource requirement exceeds authority.");
  }
  return requirement;
}
