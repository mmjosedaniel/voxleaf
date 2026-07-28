import type { ChangeEvent, ReactElement } from "react";

import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "./adaptive-buffer-authority";
import type { AdaptiveBufferStartMode } from "./adaptive-buffer-scheduler";
import type { AdaptivePreparationUiState } from "./adaptive-preparation";
import {
  formatPreparationDuration,
  loadedAudioStatusText,
  preparationTargetLabel,
  PREPARED_TARGET_OPTIONS,
} from "./adaptive-preparation-presentation";

export interface AdaptivePreparationControlsProps {
  readonly selection: AdaptiveBufferStartMode;
  readonly state?: AdaptivePreparationUiState;
  readonly onSelectionChange: (selection: AdaptiveBufferStartMode) => void;
  readonly onStart: () => void;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly onStop: () => void;
  readonly onVolumeChange: (volumePercent: number) => void;
  readonly startDisabled?: boolean;
  readonly startHint?: string;
  readonly showPlaybackControls?: boolean;
}

function estimateText(estimatedWaitMs: number | undefined): string {
  return estimatedWaitMs === undefined
    ? "Calculating preparation time…"
    : `Estimated wait: about ${formatPreparationDuration(estimatedWaitMs)}.`;
}

function primaryStatus(state: AdaptivePreparationUiState): string {
  const ready = formatPreparationDuration(state.readyMs);
  const target = preparationTargetLabel(state.targetMs);
  switch (state.phase) {
    case "buffering":
      return `Playback paused while VoxLeaf generates more audio — ${ready} of 1 minute ready. ${estimateText(state.estimatedWaitMs)}`;
    case "complete":
      return "Playback is complete.";
    case "failed":
      return "Local audio preparation stopped because of a processing failure.";
    case "intentional-wait":
      return "Brief planned pause while local speech catches up.";
    case "paused":
      return state.pauseContinuesPreparation
        ? `Playback paused. Preparing up to ${target} of audio.`
        : `Playback paused. ${ready} of audio is ready.`;
    case "playing":
      return `Playing local audio. ${ready} is ready ahead.`;
    case "preparing":
      return `Preparing audio — ${ready} of ${target} ready. ${estimateText(state.estimatedWaitMs)}`;
    case "stopped":
      return "Local audio preparation is stopped.";
  }
}

export function AdaptivePreparationControls({
  selection,
  state,
  onSelectionChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onVolumeChange,
  startDisabled = false,
  startHint,
  showPlaybackControls = true,
}: AdaptivePreparationControlsProps): ReactElement {
  const active = state !== undefined && state.phase !== "stopped";
  const targetMs = selection.kind === "prepared" ? selection.targetMs : 60_000;
  const handleModeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onSelectionChange(
      event.currentTarget.value === "quick"
        ? Object.freeze({ kind: "quick" })
        : Object.freeze({ kind: "prepared", targetMs }),
    );
  };
  const handleTargetChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const nextTarget = Number(event.currentTarget.value);
    const selected = PREPARED_TARGET_OPTIONS.find(
      (option) => option.targetMs === nextTarget,
    );
    if (selected !== undefined) {
      onSelectionChange(
        Object.freeze({ kind: "prepared", targetMs: selected.targetMs }),
      );
    }
  };
  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onVolumeChange(Number(event.currentTarget.value));
  };

  return (
    <section
      className="adaptive-preparation"
      aria-labelledby="adaptive-preparation-title"
      aria-busy={state?.phase === "preparing" || state?.phase === "buffering"}
    >
      <h3 id="adaptive-preparation-title">Local narration</h3>
      <p>Audio is generated only on this device and kept in bounded memory.</p>

      <fieldset className="adaptive-preparation-mode" disabled={active}>
        <legend>How should playback start?</legend>
        <label>
          <input
            type="radio"
            name="adaptive-preparation-mode"
            value="quick"
            checked={selection.kind === "quick"}
            onChange={handleModeChange}
          />
          <span>
            <strong>Quick start</strong>
            <small>Begin after about 15 seconds of audio is ready.</small>
          </span>
        </label>
        <label>
          <input
            type="radio"
            name="adaptive-preparation-mode"
            value="prepared"
            checked={selection.kind === "prepared"}
            onChange={handleModeChange}
          />
          <span>
            <strong>Prepared playback</strong>
            <small>Wait for a larger selected audio lead.</small>
          </span>
        </label>
        <label className="adaptive-preparation-target">
          <span>Prepared audio target</span>
          <select
            value={targetMs}
            disabled={selection.kind !== "prepared"}
            onChange={handleTargetChange}
          >
            {PREPARED_TARGET_OPTIONS.map((option) => (
              <option key={option.targetMs} value={option.targetMs}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      {state === undefined ? (
        <>
          {startHint === undefined ? null : (
            <p className="adaptive-preparation-availability" aria-live="polite">
              {startHint}
            </p>
          )}
          {showPlaybackControls ? (
            <button
              type="button"
              data-narration-action="start"
              disabled={startDisabled}
              onClick={onStart}
            >
              {selection.kind === "quick"
                ? "Start quick playback"
                : `Prepare ${preparationTargetLabel(selection.targetMs)} of audio`}
            </button>
          ) : null}
        </>
      ) : (
        <>
          <div
            className="adaptive-preparation-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <p>{primaryStatus(state)}</p>
            {state.lowBuffer ? (
              <p>
                Audio is running low. Playback may pause while local speech
                catches up.
              </p>
            ) : null}
            {state.resourceCeilingReached ? (
              <p>Preparation paused at the in-memory limit.</p>
            ) : null}
            {state.allRemainingAudioReady ? (
              <p>All remaining audio is ready.</p>
            ) : null}
          </div>

          <p className="adaptive-preparation-loaded">
            {loadedAudioStatusText(state)}
          </p>

          {showPlaybackControls ? (
            <div
              className="adaptive-preparation-actions"
              aria-label="Narration playback controls"
              role="group"
            >
              <button
                type="button"
                data-narration-action="pause"
                disabled={!state.canPause}
                onClick={onPause}
              >
                Pause
              </button>
              <button
                type="button"
                data-narration-action="resume"
                disabled={!state.canResume}
                onClick={onResume}
              >
                Resume
              </button>
              <button
                type="button"
                data-narration-action="stop"
                disabled={!state.canStop}
                onClick={onStop}
              >
                {state.phase === "paused" && state.pauseContinuesPreparation
                  ? "Stop preparing"
                  : "Stop"}
              </button>
            </div>
          ) : null}

          <div className="adaptive-preparation-settings">
            <label>
              <span>Volume: {state.volumePercent}%</span>
              <input
                type="range"
                min={ADAPTIVE_BUFFER_AUTHORITY_V1.playback.minimumVolumePercent}
                max={ADAPTIVE_BUFFER_AUTHORITY_V1.playback.maximumVolumePercent}
                step={ADAPTIVE_BUFFER_AUTHORITY_V1.playback.volumeStepPercent}
                value={state.volumePercent}
                onChange={handleVolumeChange}
              />
            </label>
            <label>
              <span>Playback speed</span>
              <select value={state.playbackRate} disabled>
                <option value={1}>1.0× — only supported speed</option>
              </select>
            </label>
          </div>
        </>
      )}
    </section>
  );
}
