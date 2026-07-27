import { ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX } from "./active-visual-locator";

export const SYNCHRONIZATION_AUTHORITY_V1 = Object.freeze({
  authorityVersion: 1,
  timing: Object.freeze({
    granularity: "prepared-segment-source-range" as const,
    wordTiming: "unsupported" as const,
    insideSegmentStart: "replay-containing-segment" as const,
    previousNext: "stable-prepared-segment" as const,
  }),
  highlighting: Object.freeze({
    mechanism: "css-custom-highlight" as const,
    name: "voxleaf-narration-active",
    mutation: "none" as const,
  }),
  following: Object.freeze({
    comfortInsetPx: ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX,
    geometryUnavailable: "highlight-without-follow" as const,
    scrollBehavior: "auto" as const,
    focus: "preserve" as const,
    visualSampling: "suspend-until-follow-settled" as const,
  }),
  manualNavigation: Object.freeze({
    passiveScroll:
      "invalidate-on-first-change-restart-after-settlement" as const,
    settlementMs: 500,
    addressablePassage: "active-visual-locator" as const,
    activePlayIntent: "restart-after-settlement" as const,
    pausedIntent: "remain-paused-at-target" as const,
  }),
  observation: Object.freeze({
    maximumProgressIntervalMs: 250,
    exactTransitions: Object.freeze([
      "segment-started",
      "segment-completed",
    ] as const),
  }),
  persistence: Object.freeze({
    segmentStarted: "segment-start" as const,
    segmentCompleted: "segment-end" as const,
    interruption: "latest-heard-checkpoint" as const,
    midSegmentRestore: "segment-start" as const,
    periodicWrites: "prohibited" as const,
  }),
  invalidation: Object.freeze({
    ordering: Object.freeze([
      "replace-work-identity",
      "stop-playback",
      "abort-preparation",
      "release-queued-units",
      "contain-active-synthesis",
      "settle-target",
      "restart-if-authorized",
    ] as const),
  }),
  boundaries: Object.freeze({
    sharedSchemaChange: false,
    ttsProtocolChange: false,
    narrationSegmentationChange: false,
  }),
});

export type SynchronizationAuthorityPhase =
  "inactive" | "preparing" | "playing" | "paused" | "buffering" | "failed";

export type SynchronizationAuthorityEvent =
  | "start"
  | "segment-started"
  | "segment-completed"
  | "pause"
  | "resume"
  | "buffer-exhausted"
  | "buffer-refilled"
  | "user-visual-navigation"
  | "previous-segment"
  | "next-segment"
  | "chapter-navigation"
  | "reflow"
  | "stop"
  | "publication-or-settings-replacement"
  | "service-failure"
  | "application-cleanup";

export type SynchronizationNextPhase =
  SynchronizationAuthorityPhase | "preserve" | "by-play-intent";

export type SynchronizationPositionAuthority =
  | "visual"
  | "active-segment-start"
  | "completed-segment-end"
  | "latest-heard"
  | "target-visual"
  | "preserve";

export type SynchronizationHighlightAction =
  "clear" | "show-active-segment" | "retain-last-heard" | "preserve";

export type SynchronizationFollowAction =
  "none" | "if-outside-comfort-region" | "preserve";

export type SynchronizationGenerationAction =
  "none" | "start-new" | "preserve" | "invalidate-first";

export type SynchronizationRestartAction =
  "none" | "if-play-intent" | "preserve";

export type SynchronizationPersistenceAction =
  "none" | "segment-start" | "segment-end" | "latest-heard" | "preserve";

export type SynchronizationFocusAction =
  "preserve" | "reader-navigation-policy";

export type SynchronizationVisualSamplingAction =
  "active" | "suspend-until-follow-settled" | "preserve";

export interface SynchronizationTransitionAuthority {
  readonly event: SynchronizationAuthorityEvent;
  readonly from: readonly SynchronizationAuthorityPhase[];
  readonly nextPhase: SynchronizationNextPhase;
  readonly positionAuthority: SynchronizationPositionAuthority;
  readonly highlight: SynchronizationHighlightAction;
  readonly follow: SynchronizationFollowAction;
  readonly generation: SynchronizationGenerationAction;
  readonly restart: SynchronizationRestartAction;
  readonly persistence: SynchronizationPersistenceAction;
  readonly focus: SynchronizationFocusAction;
  readonly visualSampling: SynchronizationVisualSamplingAction;
}

function transition(
  value: SynchronizationTransitionAuthority,
): SynchronizationTransitionAuthority {
  return Object.freeze({
    ...value,
    from: Object.freeze([...value.from]),
  });
}

const ACTIVE_PHASES = Object.freeze([
  "preparing",
  "playing",
  "paused",
  "buffering",
] as const);

export const SYNCHRONIZATION_TRANSITION_TABLE_V1 = Object.freeze([
  transition({
    event: "start",
    from: ["inactive", "failed"],
    nextPhase: "preparing",
    positionAuthority: "visual",
    highlight: "clear",
    follow: "none",
    generation: "start-new",
    restart: "none",
    persistence: "none",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "segment-started",
    from: ["preparing", "playing", "buffering"],
    nextPhase: "playing",
    positionAuthority: "active-segment-start",
    highlight: "show-active-segment",
    follow: "if-outside-comfort-region",
    generation: "preserve",
    restart: "none",
    persistence: "segment-start",
    focus: "preserve",
    visualSampling: "suspend-until-follow-settled",
  }),
  transition({
    event: "segment-completed",
    from: ["playing"],
    nextPhase: "playing",
    positionAuthority: "completed-segment-end",
    highlight: "retain-last-heard",
    follow: "none",
    generation: "preserve",
    restart: "none",
    persistence: "segment-end",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "pause",
    from: ["preparing", "playing", "buffering"],
    nextPhase: "paused",
    positionAuthority: "latest-heard",
    highlight: "retain-last-heard",
    follow: "none",
    generation: "preserve",
    restart: "none",
    persistence: "latest-heard",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "resume",
    from: ["paused"],
    nextPhase: "by-play-intent",
    positionAuthority: "latest-heard",
    highlight: "retain-last-heard",
    follow: "if-outside-comfort-region",
    generation: "preserve",
    restart: "if-play-intent",
    persistence: "none",
    focus: "preserve",
    visualSampling: "suspend-until-follow-settled",
  }),
  transition({
    event: "buffer-exhausted",
    from: ["playing"],
    nextPhase: "buffering",
    positionAuthority: "latest-heard",
    highlight: "retain-last-heard",
    follow: "none",
    generation: "preserve",
    restart: "none",
    persistence: "latest-heard",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "buffer-refilled",
    from: ["buffering"],
    nextPhase: "playing",
    positionAuthority: "latest-heard",
    highlight: "retain-last-heard",
    follow: "preserve",
    generation: "preserve",
    restart: "none",
    persistence: "none",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "user-visual-navigation",
    from: ACTIVE_PHASES,
    nextPhase: "by-play-intent",
    positionAuthority: "target-visual",
    highlight: "clear",
    follow: "none",
    generation: "invalidate-first",
    restart: "if-play-intent",
    persistence: "latest-heard",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "previous-segment",
    from: ACTIVE_PHASES,
    nextPhase: "by-play-intent",
    positionAuthority: "target-visual",
    highlight: "clear",
    follow: "none",
    generation: "invalidate-first",
    restart: "if-play-intent",
    persistence: "latest-heard",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "next-segment",
    from: ACTIVE_PHASES,
    nextPhase: "by-play-intent",
    positionAuthority: "target-visual",
    highlight: "clear",
    follow: "none",
    generation: "invalidate-first",
    restart: "if-play-intent",
    persistence: "latest-heard",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "chapter-navigation",
    from: ACTIVE_PHASES,
    nextPhase: "by-play-intent",
    positionAuthority: "target-visual",
    highlight: "clear",
    follow: "none",
    generation: "invalidate-first",
    restart: "if-play-intent",
    persistence: "latest-heard",
    focus: "reader-navigation-policy",
    visualSampling: "active",
  }),
  transition({
    event: "reflow",
    from: ACTIVE_PHASES,
    nextPhase: "preserve",
    positionAuthority: "preserve",
    highlight: "preserve",
    follow: "if-outside-comfort-region",
    generation: "preserve",
    restart: "preserve",
    persistence: "preserve",
    focus: "preserve",
    visualSampling: "suspend-until-follow-settled",
  }),
  transition({
    event: "stop",
    from: ACTIVE_PHASES,
    nextPhase: "inactive",
    positionAuthority: "latest-heard",
    highlight: "clear",
    follow: "none",
    generation: "invalidate-first",
    restart: "none",
    persistence: "latest-heard",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "publication-or-settings-replacement",
    from: ACTIVE_PHASES,
    nextPhase: "inactive",
    positionAuthority: "latest-heard",
    highlight: "clear",
    follow: "none",
    generation: "invalidate-first",
    restart: "none",
    persistence: "latest-heard",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "service-failure",
    from: ACTIVE_PHASES,
    nextPhase: "failed",
    positionAuthority: "latest-heard",
    highlight: "clear",
    follow: "none",
    generation: "invalidate-first",
    restart: "none",
    persistence: "latest-heard",
    focus: "preserve",
    visualSampling: "active",
  }),
  transition({
    event: "application-cleanup",
    from: [...ACTIVE_PHASES, "failed"],
    nextPhase: "inactive",
    positionAuthority: "latest-heard",
    highlight: "clear",
    follow: "none",
    generation: "invalidate-first",
    restart: "none",
    persistence: "latest-heard",
    focus: "preserve",
    visualSampling: "active",
  }),
] as const);

export interface SynchronizationRect {
  readonly top: number;
  readonly bottom: number;
}

export type SynchronizationFollowDecision =
  | "keep-visible"
  | "follow-backward"
  | "follow-forward"
  | "geometry-unavailable";

function finiteRect(rect: SynchronizationRect): boolean {
  return (
    Number.isFinite(rect.top) &&
    Number.isFinite(rect.bottom) &&
    rect.bottom >= rect.top
  );
}

export function decideSynchronizationFollow(
  viewport: SynchronizationRect,
  audibleRange: SynchronizationRect,
): SynchronizationFollowDecision {
  if (!finiteRect(viewport) || !finiteRect(audibleRange)) {
    return "geometry-unavailable";
  }
  const viewportHeight = viewport.bottom - viewport.top;
  if (viewportHeight <= 0) {
    return "geometry-unavailable";
  }
  const inset = Math.min(
    SYNCHRONIZATION_AUTHORITY_V1.following.comfortInsetPx,
    Math.max(0, (viewportHeight - 1) / 2),
  );
  const comfortTop = viewport.top + inset;
  const comfortBottom = viewport.bottom - inset;
  if (audibleRange.bottom < comfortTop) {
    return "follow-backward";
  }
  if (audibleRange.top > comfortBottom) {
    return "follow-forward";
  }
  return "keep-visible";
}

export function synchronizationTransitionFor(
  event: SynchronizationAuthorityEvent,
): SynchronizationTransitionAuthority {
  const transitionValue = SYNCHRONIZATION_TRANSITION_TABLE_V1.find(
    (candidate) => candidate.event === event,
  );
  if (transitionValue === undefined) {
    throw new Error("Unsupported synchronization event.");
  }
  return transitionValue;
}
