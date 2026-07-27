import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductNarrationControls } from "./ProductNarrationControls";
import type {
  ProductNarrationCoordinator,
  ProductNarrationSnapshot,
} from "./product-narration-coordinator";

function snapshot(): ProductNarrationSnapshot {
  return Object.freeze({
    availability: "available",
    selection: Object.freeze({ kind: "quick" }),
    state: undefined,
    failure: undefined,
    metrics: Object.freeze({
      commandToAudibleMs: undefined,
      bufferingMs: 0,
      intentionalWaitMs: 0,
      playbackMs: 0,
      underrunCount: 0,
      acceptedAudioUnitCount: 0,
      acceptedAudioSampleFrames: 0,
    }),
    serviceState: "stopped",
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
      startAtActiveLocator: vi.fn(),
    } as unknown as ProductNarrationCoordinator;

    render(<ProductNarrationControls coordinator={coordinator} />);

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
    expect(previous).toBeEnabled();
    expect(next).toBeEnabled();
    expect(startHere).toBeEnabled();

    fireEvent.click(previous);
    fireEvent.click(next);
    fireEvent.click(startHere);

    expect(coordinator.goToPreviousBoundary).toHaveBeenCalledOnce();
    expect(coordinator.goToNextBoundary).toHaveBeenCalledOnce();
    expect(coordinator.startAtActiveLocator).toHaveBeenCalledOnce();
    expect(group.textContent).not.toContain("Private");
  });
});
