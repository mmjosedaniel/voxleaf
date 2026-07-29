import type {
  NarrationBoundaryReason,
  PreparedNarrationSegment,
} from "@voxleaf/epub";

export const PLAYBACK_TRANSITION_PAUSE_POLICY_V1 = Object.freeze({
  authorityVersion: 1,
  maximumMs: 1_200,
  ellipsisMs: 900,
  boundaryMs: Object.freeze({
    clause: 150,
    "dialogue-turn": 400,
    "hard-limit": 0,
    heading: 750,
    paragraph: 600,
    "scene-break": 1_200,
    sentence: 300,
    token: 0,
  } satisfies Readonly<Record<NarrationBoundaryReason, number>>),
});

export type PlaybackTransitionPauseMs =
  0 | 150 | 300 | 400 | 600 | 750 | 900 | 1_200;

const TERMINAL_ELLIPSIS =
  /(?:\.{3}|\u2026)(?:["'\u00bb\u201d\u2019)\]}]*)\s*$/u;

export function isPlaybackTransitionPauseMs(
  value: number,
): value is PlaybackTransitionPauseMs {
  return (
    Number.isSafeInteger(value) &&
    [
      ...Object.values(PLAYBACK_TRANSITION_PAUSE_POLICY_V1.boundaryMs),
      PLAYBACK_TRANSITION_PAUSE_POLICY_V1.ellipsisMs,
    ].includes(value)
  );
}

export function playbackTransitionPauseMsForPreparedSegment(
  segment: Pick<PreparedNarrationSegment, "boundaryReason" | "text">,
): PlaybackTransitionPauseMs {
  if (TERMINAL_ELLIPSIS.test(segment.text)) {
    return PLAYBACK_TRANSITION_PAUSE_POLICY_V1.ellipsisMs;
  }
  return PLAYBACK_TRANSITION_PAUSE_POLICY_V1.boundaryMs[
    segment.boundaryReason
  ] as PlaybackTransitionPauseMs;
}
