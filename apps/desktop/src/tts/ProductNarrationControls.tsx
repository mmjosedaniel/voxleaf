import { useEffect, useId, useState, type ReactElement } from "react";

import { AdaptivePreparationControls } from "./AdaptivePreparationControls";
import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "./adaptive-buffer-authority";
import { loadedAudioStatusText } from "./adaptive-preparation-presentation";
import { CHATTERBOX_BILINGUAL_PROFILE_ID } from "./hardware-profile-registry";
import type { ProductNarrationCoordinator } from "./product-narration-coordinator";
import {
  productNarrationAvailabilityMessage,
  productNarrationFailureMessage,
  productNarrationPhaseMessage,
} from "./product-narration-presentation";
import {
  isNarrationPlaybackRatePercentV3,
  NARRATION_PLAYBACK_RATES_V3,
} from "./reader-settings-playback-authority-v3";
import { useProductNarrationSnapshot } from "./use-product-narration-snapshot";

export interface ProductNarrationControlsProps {
  readonly coordinator: ProductNarrationCoordinator;
}

export function ProductNarrationControls({
  coordinator,
}: ProductNarrationControlsProps): ReactElement {
  const [detailOpen, setDetailOpen] = useState(false);
  const detailId = useId();
  const snapshot = useProductNarrationSnapshot(coordinator);

  useEffect(() => {
    void coordinator.checkAvailability();
  }, [coordinator]);
  const startHint = productNarrationAvailabilityMessage(
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
  const startupCanBeCancelled =
    snapshot.metrics.commandToAudibleMs === undefined &&
    (state?.phase === "preparing" || state?.phase === "buffering");
  const stopLabel = startupCanBeCancelled ? "Cancel start" : "Stop";
  const startupPolicy =
    snapshot.selection.kind === "quick"
      ? "Quick start"
      : `Prepared: ${snapshot.selection.targetMs / 60_000} minute${snapshot.selection.targetMs === 60_000 ? "" : "s"}`;

  return (
    <section
      className="product-narration"
      aria-labelledby="product-narration-title"
      data-narration-availability={snapshot.availability}
      data-narration-profile={snapshot.profileId}
      data-narration-phase={snapshot.state?.phase ?? "idle"}
      data-narration-failure={snapshot.failure ?? "none"}
      data-narration-preparation-failure={snapshot.preparationFailure ?? "none"}
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
      data-narration-selected-rate-percent={snapshot.playbackRatePercent}
      data-narration-active-rate-percent={
        snapshot.state?.activePlaybackRatePercent ?? "none"
      }
      data-narration-pending-rate-percent={
        snapshot.state?.pendingPlaybackRatePercent ?? "none"
      }
    >
      <div className="product-narration-compact">
        <div className="product-narration-summary">
          <h3 id="product-narration-title">Local narration</h3>
          <p aria-live="polite" aria-atomic="true">
            {productNarrationPhaseMessage(snapshot)}
          </p>
          {state === undefined ? null : (
            <p className="product-narration-loaded">
              {loadedAudioStatusText(state)}
            </p>
          )}
          <p className="product-narration-policy">{startupPolicy}</p>
          {snapshot.profileId === CHATTERBOX_BILINGUAL_PROFILE_ID &&
          snapshot.metrics.commandToAudibleMs === undefined ? (
            <p className="product-narration-policy">
              Chatterbox may take more than one minute to load. Narration and
              model controls can be temporarily unavailable and the computer may
              be less responsive, while visual reading remains available. Cancel
              start stops this work without keeping stale audio.
            </p>
          ) : null}
          {state !== undefined &&
          state.pendingPlaybackRatePercent !== null &&
          state.activePlaybackRatePercent !== null ? (
            <p className="product-narration-rate-pending" role="status">
              {(state.selectedPlaybackRatePercent / 100).toFixed(2)}× will apply
              after the current audio section.
            </p>
          ) : null}
          {state?.lowBuffer === true ? (
            <p className="product-narration-warning">
              Audio is running low and may briefly buffer.
            </p>
          ) : null}
          {snapshot.failure === undefined ? null : (
            <p className="product-narration-error">
              {productNarrationFailureMessage(snapshot)}
            </p>
          )}
        </div>
        <div
          className="product-narration-compact-actions"
          role="group"
          aria-label="Narration playback controls"
        >
          {state === undefined ? null : (
            <label className="product-narration-volume">
              <span className="visually-hidden">Narration volume</span>
              <span aria-hidden="true">Volume</span>
              <input
                type="range"
                min={ADAPTIVE_BUFFER_AUTHORITY_V1.playback.minimumVolumePercent}
                max={ADAPTIVE_BUFFER_AUTHORITY_V1.playback.maximumVolumePercent}
                step={ADAPTIVE_BUFFER_AUTHORITY_V1.playback.volumeStepPercent}
                value={state.volumePercent}
                aria-valuetext={`${state.volumePercent}%`}
                onChange={(event) =>
                  coordinator.setVolumePercent(
                    Number(event.currentTarget.value),
                  )
                }
              />
            </label>
          )}
          <label className="product-narration-speed">
            <span className="visually-hidden">Playback speed</span>
            <select
              value={snapshot.playbackRatePercent}
              disabled={
                snapshot.playbackPreferenceStatus === "loading" ||
                !snapshot.canPersistPlaybackPreference
              }
              aria-label="Playback speed"
              onChange={(event) => {
                const playbackRatePercent = Number(event.currentTarget.value);
                if (isNarrationPlaybackRatePercentV3(playbackRatePercent)) {
                  void coordinator.setPlaybackRatePercent(playbackRatePercent);
                }
              }}
            >
              {NARRATION_PLAYBACK_RATES_V3.map((rate) => (
                <option key={rate.percent} value={rate.percent}>
                  {(rate.percent / 100).toFixed(2)}×
                </option>
              ))}
            </select>
          </label>
          {showStart ? (
            <button
              type="button"
              data-narration-action="play"
              disabled={
                snapshot.availability !== "available" ||
                snapshot.navigation.canStart === false
              }
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
          {operational && state?.canPlayAvailableAudio ? (
            <button
              type="button"
              data-narration-action="play-available"
              onClick={() => coordinator.playAvailableAudio()}
            >
              Play available audio
            </button>
          ) : null}
          {showStop ? (
            <button
              type="button"
              data-narration-action="stop"
              onClick={() => void coordinator.stop()}
            >
              {stopLabel}
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
            selectionDisabled={
              snapshot.startPreferenceStatus === "loading" ||
              !snapshot.canPersistStartPreference
            }
            startDisabled={
              snapshot.availability !== "available" ||
              snapshot.navigation.canStart === false ||
              !operational
            }
            showPlaybackControls={false}
            showSelectionControls={false}
            showPlayerSettings={false}
            {...(state === undefined ? {} : { state })}
            {...(startHint === undefined ? {} : { startHint })}
            onSelectionChange={(selection) =>
              void coordinator.setSelection(selection)
            }
            onStart={() => coordinator.start()}
            onPause={() => coordinator.pause()}
            onResume={() => coordinator.resume()}
            onPlayAvailableAudio={() => coordinator.playAvailableAudio()}
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
                snapshot.navigation.canStart === false ||
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
