import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductNarrationControls } from "./ProductNarrationControls";
import type {
  ProductNarrationCoordinator,
  ProductNarrationSnapshot,
} from "./product-narration-coordinator";
import { INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1 } from "./operational-recovery";

afterEach(() => {
  cleanup();
});

function snapshot(): ProductNarrationSnapshot {
  return Object.freeze({
    availability: "available",
    profileId: "qwen3-tts-12hz-1-7b-customvoice-serena-cuda-bf16-v1",
    language: "es",
    selection: Object.freeze({ kind: "quick" }),
    startPreferenceStatus: "ready",
    canPersistStartPreference: true,
    state: undefined,
    failure: undefined,
    preparationFailure: undefined,
    metrics: Object.freeze({
      commandToAudibleMs: undefined,
      bufferingMs: 0,
      intentionalWaitMs: 0,
      playbackMs: 0,
      underrunCount: 0,
      acceptedAudioUnitCount: 0,
      acceptedAudioSampleFrames: 0,
      retainedAudioUnitCount: 2,
      discardedAudioUnitCount: 1,
    }),
    serviceState: "stopped",
    recovery: INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1,
    navigation: Object.freeze({
      playIntent: "playing",
      settling: false,
      canGoPrevious: true,
      canGoNext: true,
    }),
  });
}

describe("product narration controls", () => {
  it("exposes keyboard-operable, content-free passage actions", () => {
    const current = snapshot();
    const coordinator = {
      subscribe: vi.fn(() => () => undefined),
      observe: vi.fn(() => current),
      checkAvailability: vi.fn(async () => undefined),
      setSelection: vi.fn(),
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(async () => undefined),
      setVolumePercent: vi.fn(),
      goToPreviousBoundary: vi.fn(),
      goToNextBoundary: vi.fn(),
      startAtVisibleLocator: vi.fn(),
    } as unknown as ProductNarrationCoordinator;

    render(<ProductNarrationControls coordinator={coordinator} />);

    const narration = screen.getByRole("region", {
      name: "Local narration",
    });
    const detailToggle = screen.getByRole("button", {
      name: "Show narration details",
    });
    expect(detailToggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("group", {
        name: "Narration passage navigation",
      }),
    ).not.toBeInTheDocument();

    const play = screen.getByRole("button", { name: "Play" });
    expect(play).toHaveAttribute("data-narration-action", "play");
    expect(detailToggle).toHaveAttribute(
      "data-narration-action",
      "details-toggle",
    );
    fireEvent.click(play);
    expect(coordinator.start).toHaveBeenCalledOnce();
    fireEvent.click(detailToggle);
    expect(
      screen.getByRole("button", { name: "Hide narration details" }),
    ).toHaveAttribute("aria-expanded", "true");

    const group = screen.getByRole("group", {
      name: "Narration passage navigation",
    });
    const previous = screen.getByRole("button", {
      name: "Previous narration passage",
    });
    const next = screen.getByRole("button", {
      name: "Next narration passage",
    });
    const startHere = screen.getByRole("button", {
      name: "Start narration at visible passage",
    });

    expect(group).toContainElement(previous);
    expect(group).toContainElement(next);
    expect(group).toContainElement(startHere);
    expect(previous).toHaveAttribute(
      "data-narration-action",
      "previous-passage",
    );
    expect(next).toHaveAttribute("data-narration-action", "next-passage");
    expect(startHere).toHaveAttribute(
      "data-narration-action",
      "visible-passage",
    );
    expect(previous).toBeEnabled();
    expect(next).toBeEnabled();
    expect(startHere).toBeEnabled();
    expect(narration).toHaveAttribute("data-narration-retained-units", "2");
    expect(narration).toHaveAttribute("data-narration-discarded-units", "1");
    expect(narration).toHaveAttribute("data-narration-play-intent", "playing");
    expect(narration).toHaveAttribute(
      "data-narration-navigation-settling",
      "false",
    );
    expect(narration).toHaveAttribute("data-narration-failure", "none");

    fireEvent.click(previous);
    fireEvent.click(next);
    fireEvent.click(startHere);

    expect(coordinator.goToPreviousBoundary).toHaveBeenCalledOnce();
    expect(coordinator.goToNextBoundary).toHaveBeenCalledOnce();
    expect(coordinator.startAtVisibleLocator).toHaveBeenCalledOnce();
    expect(group.textContent).not.toContain("Private");
  });

  it("keeps active failure recovery and exact loaded duration on the compact surface", () => {
    const current: ProductNarrationSnapshot = Object.freeze({
      ...snapshot(),
      state: Object.freeze({
        mode: Object.freeze({ kind: "quick" }),
        phase: "failed",
        readyMs: 12_000,
        targetMs: 15_000,
        progressValueMs: 12_000,
        estimatedWaitMs: undefined,
        lowBuffer: true,
        allRemainingAudioReady: false,
        resourceCeilingReached: false,
        pauseContinuesPreparation: false,
        canPause: false,
        canResume: false,
        canStop: false,
        volumePercent: 100,
        playbackRate: 1,
      }),
      failure: "tts-service-failed",
      recovery: Object.freeze({
        ...INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1,
        phase: "recovery-available",
        failureCode: "service-crashed",
        action: "explicit-service-restart",
        canRecover: true,
      }),
    });
    const coordinator = {
      subscribe: vi.fn(() => () => undefined),
      observe: vi.fn(() => current),
      checkAvailability: vi.fn(async () => undefined),
      setSelection: vi.fn(),
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(async () => undefined),
      recover: vi.fn(),
      setVolumePercent: vi.fn(),
      goToPreviousBoundary: vi.fn(),
      goToNextBoundary: vi.fn(),
      startAtVisibleLocator: vi.fn(),
    } as unknown as ProductNarrationCoordinator;

    render(<ProductNarrationControls coordinator={coordinator} />);

    expect(
      screen.getByText("Local narration can be restarted once."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Restart resumes from the latest heard passage and does not reuse old audio.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Playable audio loaded: 12 seconds. Active target: 15 seconds.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Audio is running low and may briefly buffer."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Restart local narration" }),
    ).toHaveAttribute("data-narration-action", "recover");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", {
      name: "Show narration details",
    });
    fireEvent.click(toggle);
    fireEvent.click(
      screen.getByRole("button", { name: "Hide narration details" }),
    );
    expect(coordinator.start).not.toHaveBeenCalled();
    expect(coordinator.stop).not.toHaveBeenCalled();

    expect(screen.queryByRole("button", { name: "Stop" })).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Restart local narration" }),
    );
    expect(coordinator.recover).toHaveBeenCalledOnce();
  });

  it("reports preparation failure without calling it active cleanup", () => {
    const current: ProductNarrationSnapshot = Object.freeze({
      ...snapshot(),
      failure: "narration-preparation-failed",
      preparationFailure: "operation-active",
    });
    const coordinator = {
      subscribe: vi.fn(() => () => undefined),
      observe: vi.fn(() => current),
      checkAvailability: vi.fn(async () => undefined),
      setSelection: vi.fn(),
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(async () => undefined),
      recover: vi.fn(),
      setVolumePercent: vi.fn(),
      goToPreviousBoundary: vi.fn(),
      goToNextBoundary: vi.fn(),
      startAtVisibleLocator: vi.fn(),
    } as unknown as ProductNarrationCoordinator;

    render(<ProductNarrationControls coordinator={coordinator} />);

    expect(
      screen.getByText(
        "The current EPUB passage could not be prepared. Stop and choose another passage before trying again.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Local narration cleanup is in progress."),
    ).not.toBeInTheDocument();
    expect(document.querySelector(".product-narration")).toHaveAttribute(
      "data-narration-preparation-failure",
      "operation-active",
    );
  });
});
