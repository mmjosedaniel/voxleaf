import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from "react";

import { AdaptivePreparationControls } from "./AdaptivePreparationControls";
import { loadedAudioStatusText } from "./adaptive-preparation-presentation";
import type { ProductNarrationCoordinator } from "./product-narration-coordinator";

export interface ProductNarrationControlsProps {
  readonly coordinator: ProductNarrationCoordinator;
}

function availabilityMessage(
  availability: ReturnType<
    ProductNarrationCoordinator["observe"]
  >["availability"],
): string | undefined {
  switch (availability) {
    case "available":
      return "The exact local Qwen/Serena development demo is available.";
    case "checking":
      return "Checking the exact local narration demo configuration.";
    case "unavailable":
      return "The exact local narration demo is not configured on this device.";
  }
}

function phaseMessage(
  snapshot: ReturnType<ProductNarrationCoordinator["observe"]>,
): string {
  if (snapshot.failure !== undefined) {
    return "Local narration failed.";
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
      return availabilityMessage(snapshot.availability) ?? "Narration ready.";
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
  const startHint = availabilityMessage(snapshot.availability);
  const state = snapshot.state;
  const showStart = state === undefined;
  const showPause = state?.canPause === true;
  const showResume = state?.canResume === true;
  const showStop =
    state !== undefined &&
    (state.canStop || state.phase === "complete" || state.phase === "failed");

  return (
    <section
      className="product-narration"
      aria-labelledby="product-narration-title"
      data-narration-availability={snapshot.availability}
      data-narration-phase={snapshot.state?.phase ?? "idle"}
      data-narration-failure={snapshot.failure ?? "none"}
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
              Stop narration to reset it, then try again.
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
              disabled={snapshot.availability !== "available"}
              onClick={() => coordinator.start()}
            >
              Play
            </button>
          ) : null}
          {showPause ? (
            <button type="button" onClick={() => coordinator.pause()}>
              Pause
            </button>
          ) : null}
          {showResume ? (
            <button type="button" onClick={() => coordinator.resume()}>
              Resume
            </button>
          ) : null}
          {showStop ? (
            <button type="button" onClick={() => void coordinator.stop()}>
              Stop
            </button>
          ) : null}
          <button
            type="button"
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
            startDisabled={snapshot.availability !== "available"}
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
              disabled={
                !snapshot.navigation.canGoNext || snapshot.navigation.settling
              }
              onClick={() => coordinator.goToNextBoundary()}
            >
              Next narration passage
            </button>
            <button
              type="button"
              disabled={
                snapshot.availability !== "available" ||
                snapshot.navigation.settling
              }
              onClick={() => coordinator.startAtActiveLocator()}
            >
              Start narration at visible passage
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
