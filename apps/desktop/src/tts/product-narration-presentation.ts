import {
  CHATTERBOX_BILINGUAL_PROFILE_ID,
  EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "./hardware-profile-registry";
import type { ProductNarrationSnapshot } from "./product-narration-coordinator";

export function productNarrationAvailabilityMessage(
  availability: ProductNarrationSnapshot["availability"],
  profileId: string,
): string | undefined {
  switch (availability) {
    case "available":
      if (
        profileId === PIPER_CPU_FALLBACK_PROFILE_ID ||
        profileId === PIPER_ENGLISH_CPU_PROFILE_ID
      ) {
        return "The selected local Piper CPU narration profile is available.";
      }
      if (profileId === CHATTERBOX_BILINGUAL_PROFILE_ID) {
        return "The local Chatterbox bilingual narration profile is available.";
      }
      if (
        profileId === EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID ||
        profileId === EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID
      ) {
        return "The selected local Qwen development profile is available.";
      }
      return "The selected local narration profile is available.";
    case "checking":
      if (profileId === CHATTERBOX_BILINGUAL_PROFILE_ID) {
        return "Verifying the installed Chatterbox package.";
      }
      return "Checking the selected local narration profile.";
    case "unavailable":
      return "The selected local narration profile is not configured on this device.";
  }
}

export function productNarrationPhaseMessage(
  snapshot: Pick<
    ProductNarrationSnapshot,
    "availability" | "profileId" | "failure" | "serviceState"
  > & {
    readonly state:
      Pick<NonNullable<ProductNarrationSnapshot["state"]>, "phase"> | undefined;
    readonly recovery: Pick<
      ProductNarrationSnapshot["recovery"],
      "phase" | "action"
    >;
  },
): string {
  switch (snapshot.recovery.phase) {
    case "invalidating":
    case "releasing":
    case "containing-service":
    case "verifying-cleanup":
      return "Containing the local narration failure.";
    case "recovery-available":
      return snapshot.recovery.action === "select-compatible-profile"
        ? "Choose a compatible local narration profile."
        : "Local narration can be restarted once.";
    case "recovering":
      return "Restarting local narration.";
    case "unavailable":
      return "Local narration recovery is unavailable.";
    case "contained":
      return "Local narration is safely contained.";
    case "operational":
      break;
  }
  if (snapshot.failure !== undefined) {
    return snapshot.failure === "tts-profile-unavailable"
      ? "Local narration compatibility changed."
      : "Local narration failed.";
  }
  if (snapshot.state?.phase === "preparing") {
    switch (snapshot.serviceState) {
      case "stopped":
        return snapshot.profileId === CHATTERBOX_BILINGUAL_PROFILE_ID
          ? "Verifying the installed Chatterbox package."
          : "Checking local narration configuration.";
      case "starting":
      case "handshaking":
      case "unloaded":
      case "loading":
      case "warming":
        return "Starting the local narration service and model.";
      case "ready":
        return "Preparing narration.";
      case "generating":
        return "Generating the first audio.";
      default:
        return "Preparing local narration.";
    }
  }
  switch (snapshot.state?.phase) {
    case "buffering":
      return "Buffering generated narration.";
    case "complete":
      return "Narration complete.";
    case "failed":
      return "Local narration failed.";
    case "intentional-wait":
      return "Narration is briefly waiting.";
    case "paused":
      return "Narration paused.";
    case "playing":
      return "Narration playing.";
    case "stopped":
      return "Narration stopped.";
    case undefined:
      return (
        productNarrationAvailabilityMessage(
          snapshot.availability,
          snapshot.profileId,
        ) ?? "Narration ready."
      );
  }
}

export function productNarrationFailureMessage(
  snapshot: Pick<ProductNarrationSnapshot, "failure"> & {
    readonly recovery: Pick<
      ProductNarrationSnapshot["recovery"],
      "phase" | "action" | "canRecover"
    >;
  },
): string {
  if (snapshot.failure === "narration-preparation-failed") {
    return "The current EPUB passage could not be prepared. Stop and choose another passage before trying again.";
  }
  if (snapshot.recovery.phase === "contained") {
    return "Restart the application or check compatibility before trying again.";
  }
  if (snapshot.recovery.phase === "unavailable") {
    return "Check compatibility or restart the application before trying again.";
  }
  if (snapshot.recovery.canRecover) {
    if (snapshot.recovery.action === "select-compatible-profile") {
      return "Check compatibility and choose an available profile.";
    }
    return "Restart resumes from the latest heard passage and does not reuse old audio.";
  }
  if (snapshot.failure === "tts-profile-unavailable") {
    return "Check compatibility before starting narration again.";
  }
  return "Local narration cleanup is in progress.";
}
