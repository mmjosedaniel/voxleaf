import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from "react";

import { AdaptivePreparationControls } from "./AdaptivePreparationControls";
import { loadedAudioStatusText } from "./adaptive-preparation-presentation";
import {
  CHATTERBOX_BILINGUAL_PROFILE_ID,
  EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "./hardware-profile-registry";
import type { ProductNarrationCoordinator } from "./product-narration-coordinator";

export interface ProductNarrationControlsProps {
  readonly coordinator: ProductNarrationCoordinator;
}

function availabilityMessage(
  availability: ReturnType<
    ProductNarrationCoordinator["observe"]
  >["availability"],
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
      return "Checking the selected local narration profile.";
    case "unavailable":
      return "The selected local narration profile is not configured on this device.";
  }
}

function phaseMessage(
  snapshot: ReturnType<ProductNarrationCoordinator["observe"]>,
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
  switch (snapshot.state?.phase) {
    case "buffering":
      return "Buffering local narration.";
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
    case "preparing":
      return "Preparing local narration.";
    case "stopped":
      return "Narration stopped.";
    case undefined:
      return (
        availabilityMessage(snapshot.availability, snapshot.profileId) ??
        "Narration ready."
      );
  }
}

export function ProductNarrationControls({
  coordinator,
}: ProductNarrationControlsProps): ReactElement {
  const [detailOpen, setDetailOpen] = useState(false);
  const detailId = useId();
  const snapshot = useSyncExternalStore(
    (listener) => coordinator.subscribe(listener),
    () => coordinator.observe(),
    () => coordinator.observe(),
  );

  useEffect(() => {
    void coordinator.checkAvailability();
  }, [coordinator]);
  const startHint = availabilityMessage(
    snapshot.availability,
    snapshot.profileId,
  );
  const state = snapshot.state;
  const operational = snapshot.recovery.phase === "operational";
  const canRestart =
    snapshot.recovery.canRecover &&
    snapshot.recovery.action !== "select-compatible-profile";
  const showStart = state === undefined && operational;
  const showPause = state?.canPause === true;
  const showResume = state?.canResume === true;
  const showStop =
    operational &&
    state !== undefined &&
    (state.canStop || state.phase === "complete" || state.phase === "failed");

  return (
    <section
      className="product-narration"
      aria-labelledby="product-narration-title"
      data-narration-availability={snapshot.availability}
      data-narration-profile={snapshot.profileId}
      data-narration-phase={snapshot.state?.phase ?? "idle"}
      data-narration-failure={snapshot.failure ?? "none"}
      data-narration-recovery-phase={snapshot.recovery.phase}
      data-narration-recovery-code={snapshot.recovery.failureCode ?? "none"}
      data-narration-playable-ms={snapshot.state?.readyMs ?? 0}
      data-narration-target-ms={snapshot.state?.targetMs ?? 0}
      data-narration-service-state={snapshot.serviceState}
      data-narration-underruns={snapshot.metrics.underrunCount}
      data-narration-buffering-ms={snapshot.metrics.bufferingMs}
      data-narration-intentional-wait-ms={snapshot.metrics.intentionalWaitMs}
      data-narration-playback-ms={snapshot.metrics.playbackMs}
      data-narration-command-to-audible-ms={
        snapshot.metrics.commandToAudibleMs ?? ""
      }
      data-narration-accepted-units={snapshot.metrics.acceptedAudioUnitCount}
      data-narration-accepted-sample-frames={
        snapshot.metrics.acceptedAudioSampleFrames
      }
      data-narration-retained-units={snapshot.metrics.retainedAudioUnitCount}
      data-narration-discarded-units={snapshot.metrics.discardedAudioUnitCount}
      data-narration-play-intent={snapshot.navigation.playIntent}
      data-narration-navigation-settling={String(snapshot.navigation.settling)}
    >
      <div className="product-narration-compact">
        <div className="product-narration-summary">
          <h3 id="product-narration-title">Local narration</h3>
          <p aria-live="polite" aria-atomic="true">
            {phaseMessage(snapshot)}
          </p>
          {state === undefined ? null : (
            <p className="product-narration-loaded">
              {loadedAudioStatusText(state)}
            </p>
          )}
          {state?.lowBuffer === true ? (
            <p className="product-narration-warning">
              Audio is running low and may briefly buffer.
            </p>
          ) : null}
          {snapshot.failure === undefined ? null : (
            <p className="product-narration-error">
              {snapshot.recovery.phase === "contained"
                ? "Restart the application or check compatibility before trying again."
                : snapshot.recovery.phase === "unavailable"
                  ? "Check compatibility or restart the application before trying again."
                  : snapshot.recovery.canRecover
                    ? snapshot.recovery.action === "select-compatible-profile"
                      ? "Check compatibility and choose an available profile."
                      : "Restart resumes from the latest heard passage and does not reuse old audio."
                    : snapshot.failure === "tts-profile-unavailable"
                      ? "Check compatibility before starting narration again."
                      : "Local narration cleanup is in progress."}
            </p>
          )}
        </div>
        <div
          className="product-narration-compact-actions"
          role="group"
          aria-label="Narration playback controls"
        >
          {showStart ? (
            <button
              type="button"
              data-narration-action="play"
              disabled={snapshot.availability !== "available"}
              onClick={() => coordinator.start()}
            >
              Play
            </button>
          ) : null}
          {showPause ? (
            <button
              type="button"
              data-narration-action="pause"
              onClick={() => coordinator.pause()}
            >
              Pause
            </button>
          ) : null}
          {showResume ? (
            <button
              type="button"
              data-narration-action="resume"
              onClick={() => coordinator.resume()}
            >
              Resume
            </button>
          ) : null}
          {showStop ? (
            <button
              type="button"
              data-narration-action="stop"
              onClick={() => void coordinator.stop()}
            >
              Stop
            </button>
          ) : null}
          {canRestart ? (
            <button
              type="button"
              data-narration-action="recover"
              onClick={() => coordinator.recover()}
            >
              Restart local narration
            </button>
          ) : null}
          <button
            type="button"
            data-narration-action="details-toggle"
            aria-expanded={detailOpen}
            aria-controls={detailId}
            onClick={() => setDetailOpen((open) => !open)}
          >
            {detailOpen ? "Hide narration details" : "Show narration details"}
          </button>
        </div>
      </div>
      {detailOpen ? (
        <div id={detailId} className="product-narration-detail">
          <AdaptivePreparationControls
            selection={snapshot.selection}
            startDisabled={
              snapshot.availability !== "available" || !operational
            }
            showPlaybackControls={false}
            {...(state === undefined ? {} : { state })}
            {...(startHint === undefined ? {} : { startHint })}
            onSelectionChange={(selection) =>
              coordinator.setSelection(selection)
            }
            onStart={() => coordinator.start()}
            onPause={() => coordinator.pause()}
            onResume={() => coordinator.resume()}
            onStop={() => void coordinator.stop()}
            onVolumeChange={(volumePercent) =>
              coordinator.setVolumePercent(volumePercent)
            }
          />
          <div
            className="product-narration-navigation"
            role="group"
            aria-label="Narration passage navigation"
          >
            <button
              type="button"
              data-narration-action="previous-passage"
              disabled={
                !snapshot.navigation.canGoPrevious ||
                snapshot.navigation.settling
              }
              onClick={() => coordinator.goToPreviousBoundary()}
            >
              Previous narration passage
            </button>
            <button
              type="button"
              data-narration-action="next-passage"
              disabled={
                !snapshot.navigation.canGoNext || snapshot.navigation.settling
              }
              onClick={() => coordinator.goToNextBoundary()}
            >
              Next narration passage
            </button>
            <button
              type="button"
              data-narration-action="visible-passage"
              disabled={
                snapshot.availability !== "available" ||
                !operational ||
                snapshot.navigation.settling
              }
              onClick={() => coordinator.startAtVisibleLocator()}
            >
              Start narration at visible passage
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
