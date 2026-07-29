import { describe, expect, it } from "vitest";

import {
  calculateProfileAvailableDedicatedVramRequirementMiB,
  calculateProfileCapacityRequirementMiB,
  HARDWARE_PROFILE_AUTHORITY_V1,
  RECOVERY_FAILURE_AUTHORITY_V1,
  RECOVERY_TRANSITION_TABLE_V1,
  type HardwareProfileEvidenceGateV1,
  type HardwareProfileSupportStateV1,
  type RecoveryFailureCodeV1,
  type RecoveryPhaseV1,
} from "./hardware-profile-authority";

const SUPPORT_STATES: readonly HardwareProfileSupportStateV1[] = Object.freeze([
  "supported",
  "development-only",
  "unsupported",
  "unknown",
]);

const EVIDENCE_GATES: readonly HardwareProfileEvidenceGateV1[] = Object.freeze([
  "startup",
  "throughput",
  "cancellation",
  "memory",
  "quality",
  "offline",
  "cleanup",
  "license",
  "packaging",
]);

const FAILURE_CODES: readonly RecoveryFailureCodeV1[] = Object.freeze([
  "provider-unavailable",
  "model-load-failed",
  "model-warm-failed",
  "service-crashed",
  "protocol-failed",
  "resource-exhausted",
  "cancellation-timeout",
  "playback-failed",
  "cleanup-failed",
  "repeated-recovery-failed",
]);

describe("hardware profile and recovery authority v1", () => {
  it("freezes privacy-safe host-contract and registry bounds", () => {
    expect(HARDWARE_PROFILE_AUTHORITY_V1.compatibilityContract).toEqual({
      family: "host-profile-compatibility-report",
      schemaVersion: 1,
      mebibyteBytes: 1_048_576,
      maximumLogicalProcessors: 1_024,
      maximumQuantityMiB: 16_777_216,
      unknownSatisfiesRequirement: false,
      nonCompleteProbeSatisfiesRequirement: false,
      rawReportPersistence: "prohibited",
    });
    expect(HARDWARE_PROFILE_AUTHORITY_V1.registry.supportStates).toEqual(
      SUPPORT_STATES,
    );
    expect(HARDWARE_PROFILE_AUTHORITY_V1.registry.evidenceGates).toEqual(
      EVIDENCE_GATES,
    );
    expect(HARDWARE_PROFILE_AUTHORITY_V1.registry.maximumEntries).toBe(64);
    expect(Object.isFrozen(HARDWARE_PROFILE_AUTHORITY_V1)).toBe(true);
    expect(
      Object.isFrozen(HARDWARE_PROFILE_AUTHORITY_V1.registry.supportStates),
    ).toBe(true);
  });

  it("uses fixed result-blind RAM, VRAM, and storage margins", () => {
    expect(calculateProfileCapacityRequirementMiB("ram", 4_096)).toBe(6_144);
    expect(calculateProfileCapacityRequirementMiB("ram", 16_384)).toBe(20_480);
    expect(calculateProfileCapacityRequirementMiB("vram", 4_096)).toBe(5_120);
    expect(calculateProfileCapacityRequirementMiB("vram", 10_240)).toBe(12_288);
    expect(calculateProfileCapacityRequirementMiB("storage", 10_240)).toBe(
      12_288,
    );
    expect(calculateProfileCapacityRequirementMiB("storage", 40_960)).toBe(
      45_056,
    );
    for (const invalid of [
      -1,
      0.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      16_777_217,
    ]) {
      expect(() =>
        calculateProfileCapacityRequirementMiB("ram", invalid),
      ).toThrow(RangeError);
    }
  });

  it("uses a separate bounded available-VRAM reserve only for development entries", () => {
    expect(HARDWARE_PROFILE_AUTHORITY_V1.developmentOnlyAdmission).toEqual({
      availableDedicatedVramReserveMiB: 512,
      role: "development-demo",
      supportState: "development-only",
    });
    expect(
      calculateProfileAvailableDedicatedVramRequirementMiB(
        "development-demo",
        "development-only",
        5_996,
      ),
    ).toBe(6_508);
    expect(
      calculateProfileAvailableDedicatedVramRequirementMiB(
        "standard",
        "supported",
        5_996,
      ),
    ).toBe(7_196);
    expect(
      calculateProfileAvailableDedicatedVramRequirementMiB(
        "cpu-fallback",
        "supported",
        5_996,
      ),
    ).toBe(7_196);
  });

  it("admits only passing supported profiles for automatic recommendation", () => {
    expect(
      HARDWARE_PROFILE_AUTHORITY_V1.matching.automaticRecommendationStates,
    ).toEqual(["supported"]);
    expect(
      HARDWARE_PROFILE_AUTHORITY_V1.matching.developmentOnlyActivation,
    ).toBe("explicit-native-development-gate");
    expect(HARDWARE_PROFILE_AUTHORITY_V1.matching.equalTopMatch).toBe(
      "no-recommendation",
    );
    expect(HARDWARE_PROFILE_AUTHORITY_V1.matching.hardRequirementOverride).toBe(
      "prohibited",
    );
    expect(HARDWARE_PROFILE_AUTHORITY_V1.preference.storedFields).toEqual([
      "schemaVersion",
      "profileId",
    ]);
    expect(HARDWARE_PROFILE_AUTHORITY_V1.preference.reuse).toBe(
      "reprobe-and-revalidate-before-use",
    );
  });

  it("freezes every failure classification with zero automatic attempts", () => {
    expect(
      RECOVERY_FAILURE_AUTHORITY_V1.map((failure) => failure.code),
    ).toEqual(FAILURE_CODES);
    expect(new Set(FAILURE_CODES).size).toBe(FAILURE_CODES.length);

    for (const failure of RECOVERY_FAILURE_AUTHORITY_V1) {
      expect(failure.automaticAttempts).toBe(0);
      expect(failure.explicitAttempts).toBeLessThanOrEqual(1);
      expect(failure.terminalAfterAttemptFailure).toBe(true);
      expect(Object.isFrozen(failure)).toBe(true);
    }
    expect(
      RECOVERY_FAILURE_AUTHORITY_V1.find(
        (failure) => failure.code === "protocol-failed",
      )?.action,
    ).toBe("contain-and-stop");
    expect(
      RECOVERY_FAILURE_AUTHORITY_V1.find(
        (failure) => failure.code === "playback-failed",
      )?.action,
    ).toBe("explicit-playback-reinitialize");
  });

  it("requires identity invalidation and verified cleanup before recovery", () => {
    expect(HARDWARE_PROFILE_AUTHORITY_V1.recovery.identityOrder).toEqual([
      "replace-session-and-generation-identity",
      "stop-and-release-playback",
      "abort-and-release-preparation",
      "release-queued-units",
      "contain-or-terminate-service-tree",
      "verify-zero-retained-service-and-audio-ownership",
      "preserve-latest-heard-checkpoint",
      "allow-explicit-recovery",
    ]);
    expect(HARDWARE_PROFILE_AUTHORITY_V1.recovery.budgets).toMatchObject({
      automaticSegmentRetries: 0,
      automaticServiceRestarts: 0,
      explicitServiceRestartsPerFailureEpisode: 1,
      maximumActiveServiceTrees: 1,
    });
    expect(HARDWARE_PROFILE_AUTHORITY_V1.recovery.resume).toEqual({
      authority: "latest-valid-heard-checkpoint",
      midSegment: "replay-from-segment-start",
      failureMayAdvanceProgress: false,
    });
  });

  it("has one closed acyclic transition path to recovery or containment", () => {
    const expectedPhases: readonly RecoveryPhaseV1[] = [
      "operational",
      "invalidating",
      "releasing",
      "containing-service",
      "verifying-cleanup",
      "recovery-available",
      "recovering",
      "unavailable",
      "contained",
    ];
    const observedPhases = new Set<RecoveryPhaseV1>();
    for (const transition of RECOVERY_TRANSITION_TABLE_V1) {
      transition.from.forEach((phase) => observedPhases.add(phase));
      observedPhases.add(transition.to);
      expect(Object.isFrozen(transition)).toBe(true);
      expect(Object.isFrozen(transition.from)).toBe(true);
    }
    expect([...observedPhases].sort()).toEqual([...expectedPhases].sort());
    expect(
      RECOVERY_TRANSITION_TABLE_V1.map((transition) => transition.event),
    ).toEqual([
      "failure-detected",
      "identity-invalidated",
      "playback-and-preparation-released",
      "service-contained",
      "cleanup-verified-recoverable",
      "cleanup-verified-terminal",
      "cleanup-failed",
      "explicit-recovery-requested",
      "recovery-succeeded",
      "recovery-failed",
    ]);
  });

  it("retains bounded content-free observations and diagnostics", () => {
    expect(HARDWARE_PROFILE_AUTHORITY_V1.recovery.observations).toMatchObject({
      maximumConcurrentCompatibilityProbes: 1,
      resourceObservationMinimumIntervalMs: 1_000,
      bufferObservationMaximumIntervalMs: 250,
      maximumRetainedResourceObservations: 8,
      maximumRetainedFailureEntries: 8,
      wallClockTimestamps: "prohibited",
    });
    expect(HARDWARE_PROFILE_AUTHORITY_V1.recovery.diagnostics).toEqual({
      fields: [
        "failure-code",
        "recovery-phase",
        "bounded-sequence",
        "profile-id",
      ],
      freeFormText: "prohibited",
      persistence: "prohibited",
    });
    expect(HARDWARE_PROFILE_AUTHORITY_V1.cleanup).toMatchObject({
      generatedAudioPersistence: "prohibited",
      rawFailureLogRetentionBytes: 0,
      standardErrorRetentionBytes: 0,
    });
  });

  it("does not claim support, fallback, retry, or wider process authority", () => {
    expect(Object.values(HARDWARE_PROFILE_AUTHORITY_V1.boundaries)).toSatisfy(
      (values: boolean[]) => values.every((value) => !value),
    );
  });
});
