import type { ChangeEvent, ReactElement } from "react";

import type { AdaptiveBufferStartMode } from "./adaptive-buffer-scheduler";
import { PREPARED_TARGET_OPTIONS } from "./adaptive-preparation-presentation";

export interface NarrationStartPreferenceControlsProps {
  readonly selection: AdaptiveBufferStartMode;
  readonly disabled?: boolean;
  readonly active?: boolean;
  readonly onSelectionChange: (selection: AdaptiveBufferStartMode) => void;
}

export function NarrationStartPreferenceControls({
  selection,
  disabled = false,
  active = false,
  onSelectionChange,
}: NarrationStartPreferenceControlsProps): ReactElement {
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

  return (
    <fieldset
      className="adaptive-preparation-mode narration-start-settings"
      disabled={active || disabled}
    >
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
  );
}
