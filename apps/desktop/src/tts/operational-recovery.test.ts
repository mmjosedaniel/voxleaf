import { describe, expect, it } from "vitest";

import {
  RECOVERY_FAILURE_AUTHORITY_V1,
  type RecoveryFailureCodeV1,
} from "./hardware-profile-authority";
import {
  OperationalRecoveryController,
  OperationalRecoveryStateError,
} from "./operational-recovery";

const PROFILE_ID = "qwen3-tts-1-7b-customvoice-cuda-bf16-v1";

function contain(
  controller: OperationalRecoveryController,
  code: RecoveryFailureCodeV1,
  recoveryActionAvailable = true,
): void {
  controller.detectFailure(code, PROFILE_ID);
  controller.markIdentityInvalidated();
  controller.markPlaybackAndPreparationReleased();
  controller.markServiceContained();
  controller.markCleanupVerified(recoveryActionAvailable);
}

describe("operational recovery controller", () => {
  it("implements every frozen failure classification without automatic work", () => {
    for (const failure of RECOVERY_FAILURE_AUTHORITY_V1) {
      const controller = new OperationalRecoveryController();
      contain(controller, failure.code);

      expect(controller.observe()).toMatchObject({
        phase:
          failure.explicitAttempts === 1 &&
          failure.action !== "contain-and-stop"
            ? "recovery-available"
            : "unavailable",
        failureCode: failure.code,
        action: failure.action,
        canRecover:
          failure.explicitAttempts === 1 &&
          failure.action !== "contain-and-stop",
        explicitAttemptUsed: false,
      });
    }
  });

  it("requires the exact identity-first cleanup order before recovery", () => {
    const controller = new OperationalRecoveryController();

    controller.detectFailure("service-crashed", PROFILE_ID);
    expect(controller.observe().phase).toBe("invalidating");
    controller.markIdentityInvalidated();
    expect(controller.observe().phase).toBe("releasing");
    controller.markPlaybackAndPreparationReleased();
    expect(controller.observe().phase).toBe("containing-service");
    controller.markServiceContained();
    expect(controller.observe().phase).toBe("verifying-cleanup");
    controller.markCleanupVerified();
    expect(controller.observe().phase).toBe("recovery-available");
  });

  it("permits one explicit attempt and makes a repeated failure terminal", () => {
    const controller = new OperationalRecoveryController();
    contain(controller, "model-load-failed");

    controller.requestRecovery();
    expect(controller.observe()).toMatchObject({
      phase: "recovering",
      canRecover: false,
      explicitAttemptUsed: true,
    });
    controller.markRecoverySucceeded();
    expect(controller.observe()).toMatchObject({
      phase: "operational",
      failureCode: undefined,
      explicitAttemptUsed: true,
    });

    contain(controller, "service-crashed");
    expect(controller.observe()).toMatchObject({
      phase: "unavailable",
      failureCode: "repeated-recovery-failed",
      canRecover: false,
    });
  });

  it("contains cancellation, protocol, and cleanup verification failures", () => {
    for (const code of [
      "cancellation-timeout",
      "protocol-failed",
      "cleanup-failed",
    ] as const) {
      const controller = new OperationalRecoveryController();
      controller.detectFailure("service-crashed", PROFILE_ID);
      controller.markIdentityInvalidated();
      controller.markPlaybackAndPreparationReleased();
      controller.markServiceContained();
      controller.markCleanupFailed(code);

      expect(controller.observe()).toMatchObject({
        phase: "contained",
        failureCode: code,
        action: "contain-and-stop",
        canRecover: false,
      });
    }
  });

  it("keeps only eight frozen content-free diagnostic entries", () => {
    const controller = new OperationalRecoveryController();
    for (let episode = 0; episode < 3; episode += 1) {
      contain(controller, "protocol-failed");
      controller.resetEpisode();
    }

    const { diagnostics } = controller.observe();
    expect(diagnostics).toHaveLength(8);
    expect(diagnostics[0]?.sequence).toBe(8);
    expect(diagnostics.at(-1)?.sequence).toBe(15);
    expect(diagnostics).toSatisfy((entries: typeof diagnostics) =>
      entries.every(
        (entry) =>
          entry.profileId === PROFILE_ID &&
          Object.keys(entry).sort().join(",") ===
            "failureCode,phase,profileId,sequence",
      ),
    );
    expect(Object.isFrozen(diagnostics)).toBe(true);
    expect(diagnostics.every(Object.isFrozen)).toBe(true);
  });

  it("requires an explicit new-episode boundary and rejects invalid input", () => {
    const controller = new OperationalRecoveryController();
    expect(() => controller.requestRecovery()).toThrow(
      OperationalRecoveryStateError,
    );
    expect(() => controller.detectFailure("service-crashed", "")).toThrow(
      OperationalRecoveryStateError,
    );

    contain(controller, "service-crashed", false);
    expect(controller.observe().phase).toBe("unavailable");
    controller.resetEpisode();
    expect(controller.observe()).toMatchObject({
      phase: "operational",
      failureCode: undefined,
      explicitAttemptUsed: false,
    });
  });
});
