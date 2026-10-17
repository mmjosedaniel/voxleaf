import { describe, expect, it } from "vitest";

import {
  CHATTERBOX_BILINGUAL_PROFILE_ID,
  EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "./hardware-profile-registry";
import {
  productNarrationAvailabilityMessage,
  productNarrationFailureMessage,
  productNarrationPhaseMessage,
} from "./product-narration-presentation";

type PhaseSnapshot = Parameters<typeof productNarrationPhaseMessage>[0];
type FailureSnapshot = Parameters<typeof productNarrationFailureMessage>[0];

function expectPhaseMessage(
  changes: Partial<PhaseSnapshot>,
  expected: string,
): void {
  expect(
    productNarrationPhaseMessage({
      availability: "unavailable",
      profileId: PIPER_CPU_FALLBACK_PROFILE_ID,
      failure: undefined,
      state: { phase: "preparing" },
      serviceState: "generating",
      recovery: { phase: "operational", action: undefined },
      ...changes,
    }),
  ).toBe(expected);
}

const availablePiper =
  "The selected local Piper CPU narration profile is available.";
const availableQwen =
  "The selected local Qwen development profile is available.";

describe("product narration presentation", () => {
  it.each([
    [PIPER_CPU_FALLBACK_PROFILE_ID, availablePiper],
    [PIPER_ENGLISH_CPU_PROFILE_ID, availablePiper],
    [
      CHATTERBOX_BILINGUAL_PROFILE_ID,
      "The local Chatterbox bilingual narration profile is available.",
    ],
    [EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID, availableQwen],
    [EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID, availableQwen],
    [
      "other-local-profile",
      "The selected local narration profile is available.",
    ],
  ])("reports all availability states for %s", (profileId, expected) => {
    expect(productNarrationAvailabilityMessage("available", profileId)).toBe(
      expected,
    );
    expect(productNarrationAvailabilityMessage("checking", profileId)).toBe(
      profileId === CHATTERBOX_BILINGUAL_PROFILE_ID
        ? "Verifying the installed Chatterbox package."
        : "Checking the selected local narration profile.",
    );
    expect(productNarrationAvailabilityMessage("unavailable", profileId)).toBe(
      "The selected local narration profile is not configured on this device.",
    );
  });

  it.each<[PhaseSnapshot["recovery"]["phase"], string]>([
    ["invalidating", "Containing the local narration failure."],
    ["releasing", "Containing the local narration failure."],
    ["containing-service", "Containing the local narration failure."],
    ["verifying-cleanup", "Containing the local narration failure."],
    ["recovery-available", "Local narration can be restarted once."],
    ["recovering", "Restarting local narration."],
    ["unavailable", "Local narration recovery is unavailable."],
    ["contained", "Local narration is safely contained."],
  ])("recovery %s precedes failure and preparation", (phase, expected) => {
    expectPhaseMessage(
      {
        failure: "tts-profile-unavailable",
        recovery: { phase, action: undefined },
      },
      expected,
    );
  });

  it("reports profile selection instead of restart when recovery requires compatibility", () => {
    expectPhaseMessage(
      {
        recovery: {
          phase: "recovery-available",
          action: "select-compatible-profile",
        },
      },
      "Choose a compatible local narration profile.",
    );
  });

  it.each<[NonNullable<PhaseSnapshot["failure"]>, string]>([
    ["tts-profile-unavailable", "Local narration compatibility changed."],
    ["tts-service-failed", "Local narration failed."],
    ["audio-playback-failed", "Local narration failed."],
    ["narration-preparation-failed", "Local narration failed."],
  ])("failure %s precedes preparation", (failure, expected) => {
    expectPhaseMessage({ failure }, expected);
  });

  it.each<[PhaseSnapshot["serviceState"], string]>([
    ["stopped", "Checking local narration configuration."],
    ["starting", "Starting the local narration service and model."],
    ["handshaking", "Starting the local narration service and model."],
    ["unloaded", "Starting the local narration service and model."],
    ["loading", "Starting the local narration service and model."],
    ["warming", "Starting the local narration service and model."],
    ["ready", "Preparing narration."],
    ["generating", "Generating the first audio."],
    ["cancelling", "Preparing local narration."],
    ["stopping", "Preparing local narration."],
    ["failed", "Preparing local narration."],
  ])("preparing service %s precedes availability", (serviceState, expected) => {
    expectPhaseMessage({ serviceState }, expected);
  });

  it("reports installed Chatterbox verification during stopped-service preparation", () => {
    expectPhaseMessage(
      {
        profileId: CHATTERBOX_BILINGUAL_PROFILE_ID,
        serviceState: "stopped",
      },
      "Verifying the installed Chatterbox package.",
    );
  });

  it.each<[NonNullable<PhaseSnapshot["state"]>["phase"], string]>([
    ["buffering", "Buffering generated narration."],
    ["complete", "Narration complete."],
    ["failed", "Local narration failed."],
    ["intentional-wait", "Narration is briefly waiting."],
    ["paused", "Narration paused."],
    ["playing", "Narration playing."],
    ["stopped", "Narration stopped."],
  ])("playback %s precedes service and availability", (phase, expected) => {
    expectPhaseMessage({ state: { phase } }, expected);
  });

  it.each<[PhaseSnapshot["availability"], string]>([
    ["available", availablePiper],
    ["checking", "Checking the selected local narration profile."],
    [
      "unavailable",
      "The selected local narration profile is not configured on this device.",
    ],
  ])("reports idle availability %s", (availability, expected) => {
    expectPhaseMessage({ availability, state: undefined }, expected);
  });

  it("preserves failure guidance precedence and both permitted restart actions", () => {
    function failureMessage(
      phase: FailureSnapshot["recovery"]["phase"],
      failure: FailureSnapshot["failure"] = "tts-profile-unavailable",
      canRecover = true,
      action: FailureSnapshot["recovery"]["action"] = "select-compatible-profile",
    ): string {
      const recovery = { phase, canRecover, action };
      return productNarrationFailureMessage({ failure, recovery });
    }
    const restartGuidance =
      "Restart resumes from the latest heard passage and does not reuse old audio.";
    expect(failureMessage("contained", "narration-preparation-failed")).toBe(
      "The current EPUB passage could not be prepared. Stop and choose another passage before trying again.",
    );
    expect(failureMessage("contained")).toBe(
      "Restart the application or check compatibility before trying again.",
    );
    expect(failureMessage("unavailable")).toBe(
      "Check compatibility or restart the application before trying again.",
    );
    expect(failureMessage("recovery-available")).toBe(
      "Check compatibility and choose an available profile.",
    );
    expect(
      failureMessage(
        "recovery-available",
        "tts-profile-unavailable",
        true,
        "explicit-service-restart",
      ),
    ).toBe(restartGuidance);
    expect(
      failureMessage(
        "recovery-available",
        "audio-playback-failed",
        true,
        "explicit-playback-reinitialize",
      ),
    ).toBe(restartGuidance);
    expect(
      failureMessage("operational", "tts-profile-unavailable", false),
    ).toBe("Check compatibility before starting narration again.");
    expect(
      productNarrationFailureMessage({
        failure: "tts-service-failed",
        recovery: {
          phase: "verifying-cleanup",
          canRecover: false,
          action: undefined,
        },
      }),
    ).toBe("Local narration cleanup is in progress.");
  });
});
