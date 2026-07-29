import type { PreparedNarrationSegment } from "@voxleaf/epub";
import { describe, expect, it } from "vitest";

import {
  isPlaybackTransitionPauseMs,
  playbackTransitionPauseMsForPreparedSegment,
  PLAYBACK_TRANSITION_PAUSE_POLICY_V1,
} from "./playback-transition-policy";

function segment(
  boundaryReason: PreparedNarrationSegment["boundaryReason"],
  text = "Texto sintético",
): Pick<PreparedNarrationSegment, "boundaryReason" | "text"> {
  return Object.freeze({
    boundaryReason,
    text: text as PreparedNarrationSegment["text"],
  });
}

describe("playback transition pause policy v1", () => {
  it("freezes the complete semantic boundary mapping", () => {
    expect(PLAYBACK_TRANSITION_PAUSE_POLICY_V1).toEqual({
      authorityVersion: 1,
      maximumMs: 1_200,
      ellipsisMs: 900,
      boundaryMs: {
        clause: 150,
        "dialogue-turn": 400,
        "hard-limit": 0,
        heading: 750,
        paragraph: 600,
        "scene-break": 1_200,
        sentence: 300,
        token: 0,
      },
    });
    for (const [boundaryReason, expected] of Object.entries(
      PLAYBACK_TRANSITION_PAUSE_POLICY_V1.boundaryMs,
    )) {
      expect(
        playbackTransitionPauseMsForPreparedSegment(
          segment(boundaryReason as PreparedNarrationSegment["boundaryReason"]),
        ),
      ).toBe(expected);
    }
  });

  it("uses the ellipsis override only at a terminal canonical suffix", () => {
    for (const text of [
      "Espera...",
      "Espera…",
      'Espera..."',
      "Espera…»",
      "Espera…’)] ",
    ]) {
      expect(
        playbackTransitionPauseMsForPreparedSegment(segment("sentence", text)),
      ).toBe(900);
    }
    for (const text of ["Espera..", "Espera... después", "Espera… después"]) {
      expect(
        playbackTransitionPauseMsForPreparedSegment(segment("sentence", text)),
      ).toBe(300);
    }
  });

  it("admits only frozen bounded numeric delays", () => {
    for (const value of [0, 150, 300, 400, 600, 750, 900, 1_200]) {
      expect(isPlaybackTransitionPauseMs(value)).toBe(true);
    }
    for (const value of [
      -1,
      1,
      1_201,
      300.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      expect(isPlaybackTransitionPauseMs(value)).toBe(false);
    }
  });
});
