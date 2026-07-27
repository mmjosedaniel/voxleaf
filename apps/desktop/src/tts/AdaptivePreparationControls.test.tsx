import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AdaptiveBufferResourceSnapshot } from "./adaptive-buffer-authority";
import type { AdaptiveBufferSchedulerObservation } from "./adaptive-buffer-scheduler";
import { createAdaptivePreparationUiState } from "./adaptive-preparation";
import { AdaptivePreparationControls } from "./AdaptivePreparationControls";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function emptyResources(): AdaptiveBufferResourceSnapshot {
  return {
    audioSampleFrames: 0,
    audioPayloadBytes: 0,
    completeAudioUnits: 0,
    audioMetadataEntries: 0,
    retainedPreparedBatches: 0,
    retainedPreparedSegments: 0,
    retainedNarrationCodePoints: 0,
    retainedNarrationUtf8Bytes: 0,
    retainedNarrationSentences: 0,
    activeNarrationPreparations: 0,
    activeSyntheses: 0,
    serviceQueuedSyntheses: 0,
  };
}

function observation(
  changes: Partial<AdaptiveBufferSchedulerObservation> = {},
): AdaptiveBufferSchedulerObservation {
  return Object.freeze({
    observedAtMs: 0,
    serviceState: "ready",
    playbackState: "preparing",
    playableSampleFrames: 120_000,
    playableDurationMs: 5_000,
    targetBufferMs: 60_000,
    lowBuffer: false,
    rangeComplete: false,
    pendingSegmentCount: 1,
    retainedAudioUnitCount: 1,
    discardedAudioUnitCount: 0,
    resourceSnapshot: Object.freeze(emptyResources()),
    nextAction: Object.freeze({
      kind: "synthesize",
      segmentId: "segment:synthetic-controls",
    }),
    ...changes,
  });
}

function handlers() {
  return {
    onSelectionChange: vi.fn(),
    onStart: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
    onStop: vi.fn(),
    onVolumeChange: vi.fn(),
  };
}

describe("adaptive preparation controls", () => {
  it("offers native keyboard-operable quick and explicit prepared choices", () => {
    const callbacks = handlers();
    const { rerender } = render(
      <AdaptivePreparationControls
        selection={{ kind: "quick" }}
        {...callbacks}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Local narration" }),
    ).toBeInTheDocument();
    const quick = screen.getByRole("radio", { name: /Quick start/ });
    const prepared = screen.getByRole("radio", {
      name: /Prepared playback/,
    });
    expect(quick).toBeChecked();
    expect(quick).not.toHaveAttribute("tabindex", "-1");
    expect(prepared).not.toHaveAttribute("tabindex", "-1");
    expect(screen.getByLabelText("Prepared audio target")).toBeDisabled();

    fireEvent.click(prepared);
    expect(callbacks.onSelectionChange).toHaveBeenCalledWith({
      kind: "prepared",
      targetMs: 60_000,
    });

    rerender(
      <AdaptivePreparationControls
        selection={{ kind: "prepared", targetMs: 300_000 }}
        {...callbacks}
      />,
    );
    const target = screen.getByLabelText("Prepared audio target");
    expect(target).toBeEnabled();
    expect(target).toHaveValue("300000");
    fireEvent.change(target, { target: { value: "600000" } });
    expect(callbacks.onSelectionChange).toHaveBeenLastCalledWith({
      kind: "prepared",
      targetMs: 600_000,
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Prepare 5 minutes of audio",
      }),
    );
    expect(callbacks.onStart).toHaveBeenCalledOnce();
  });

  it("announces truthful preparation progress and exposes the frozen controls", () => {
    const callbacks = handlers();
    const state = createAdaptivePreparationUiState({
      mode: { kind: "prepared", targetMs: 60_000 },
      scheduler: observation(),
      volumePercent: 75,
    });
    render(
      <AdaptivePreparationControls
        selection={{ kind: "prepared", targetMs: 60_000 }}
        state={state}
        {...callbacks}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Preparing audio — 5 seconds of 1 minute ready. Calculating preparation time…",
    );
    expect(
      screen.getByRole("progressbar", {
        name: "Playable audio: 5 seconds of 1 minute",
      }),
    ).toHaveAttribute("value", "5000");
    expect(screen.getByRole("radio", { name: /Quick start/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Pause" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Resume" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Stop" })).toBeEnabled();

    const volume = screen.getByRole("slider", { name: "Volume: 75%" });
    expect(volume).toHaveAttribute("step", "5");
    fireEvent.change(volume, { target: { value: "60" } });
    expect(callbacks.onVolumeChange).toHaveBeenCalledWith(60);

    const speed = screen.getByRole("combobox", { name: "Playback speed" });
    expect(speed).toBeDisabled();
    expect(speed).toHaveValue("1");
    expect(screen.getByText("1.0× — only supported speed")).toBeInTheDocument();
  });

  it("distinguishes low audio, planned waits, buffering, and paused preparation", () => {
    const callbacks = handlers();
    const { rerender } = render(
      <AdaptivePreparationControls
        selection={{ kind: "quick" }}
        state={createAdaptivePreparationUiState({
          mode: { kind: "quick" },
          scheduler: observation({
            playbackState: "playing",
            lowBuffer: true,
          }),
          intentionalBoundaryWait: true,
          estimatedWaitMs: 9_000,
        })}
        {...callbacks}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Brief planned pause while local speech catches up.",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Audio is running low.",
    );
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();

    rerender(
      <AdaptivePreparationControls
        selection={{ kind: "quick" }}
        state={createAdaptivePreparationUiState({
          mode: { kind: "quick" },
          scheduler: observation({
            playbackState: "buffering",
            playableSampleFrames: 0,
            playableDurationMs: 0,
          }),
          estimatedWaitMs: 21_000,
        })}
        {...callbacks}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Playback paused while VoxLeaf generates more audio",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Estimated wait: about 21 seconds.",
    );

    rerender(
      <AdaptivePreparationControls
        selection={{ kind: "prepared", targetMs: 120_000 }}
        state={createAdaptivePreparationUiState({
          mode: { kind: "prepared", targetMs: 120_000 },
          scheduler: observation({
            playbackState: "paused",
            targetBufferMs: 120_000,
          }),
        })}
        {...callbacks}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Playback paused. Preparing up to 2 minutes of audio.",
    );
    const stop = screen.getByRole("button", { name: "Stop preparing" });
    fireEvent.click(stop);
    expect(callbacks.onStop).toHaveBeenCalledOnce();
    const resume = screen.getByRole("button", { name: "Resume" });
    fireEvent.click(resume);
    expect(callbacks.onResume).toHaveBeenCalledOnce();
  });
});
