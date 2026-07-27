import { useEffect, useSyncExternalStore, type ReactElement } from "react";

import { AdaptivePreparationControls } from "./AdaptivePreparationControls";
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

export function ProductNarrationControls({
  coordinator,
}: ProductNarrationControlsProps): ReactElement {
  const snapshot = useSyncExternalStore(
    (listener) => coordinator.subscribe(listener),
    () => coordinator.observe(),
    () => coordinator.observe(),
  );

  useEffect(() => {
    void coordinator.checkAvailability();
  }, [coordinator]);
  const startHint = availabilityMessage(snapshot.availability);

  return (
    <div
      className="product-narration"
      data-narration-availability={snapshot.availability}
      data-narration-phase={snapshot.state?.phase ?? "idle"}
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
    >
      <AdaptivePreparationControls
        selection={snapshot.selection}
        startDisabled={snapshot.availability !== "available"}
        {...(snapshot.state === undefined ? {} : { state: snapshot.state })}
        {...(startHint === undefined ? {} : { startHint })}
        onSelectionChange={(selection) => coordinator.setSelection(selection)}
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
            !snapshot.navigation.canGoPrevious || snapshot.navigation.settling
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
  );
}
