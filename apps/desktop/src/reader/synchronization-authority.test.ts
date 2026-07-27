import { describe, expect, it } from "vitest";

import {
  decideSynchronizationFollow,
  SYNCHRONIZATION_AUTHORITY_V1,
  SYNCHRONIZATION_TRANSITION_TABLE_V1,
  synchronizationTransitionFor,
  type SynchronizationAuthorityEvent,
} from "./synchronization-authority";

const ALL_EVENTS: readonly SynchronizationAuthorityEvent[] = Object.freeze([
  "start",
  "segment-started",
  "segment-completed",
  "pause",
  "resume",
  "buffer-exhausted",
  "buffer-refilled",
  "user-visual-navigation",
  "previous-segment",
  "next-segment",
  "chapter-navigation",
  "reflow",
  "stop",
  "publication-or-settings-replacement",
  "service-failure",
  "application-cleanup",
]);

describe("synchronization authority v1", () => {
  it("freezes segment-level timing, interaction, progress, and persistence policy", () => {
    expect(SYNCHRONIZATION_AUTHORITY_V1).toEqual({
      authorityVersion: 1,
      timing: {
        granularity: "prepared-segment-source-range",
        wordTiming: "unsupported",
        insideSegmentStart: "replay-containing-segment",
        previousNext: "stable-prepared-segment",
      },
      highlighting: {
        mechanism: "css-custom-highlight",
        name: "voxleaf-narration-active",
        mutation: "none",
      },
      following: {
        comfortInsetPx: 24,
        geometryUnavailable: "highlight-without-follow",
        scrollBehavior: "auto",
        focus: "preserve",
        visualSampling: "suspend-until-follow-settled",
      },
      manualNavigation: {
        passiveScroll: "invalidate-on-first-change-restart-after-settlement",
        settlementMs: 500,
        addressablePassage: "active-visual-locator",
        activePlayIntent: "restart-after-settlement",
        pausedIntent: "remain-paused-at-target",
      },
      observation: {
        maximumProgressIntervalMs: 250,
        exactTransitions: ["segment-started", "segment-completed"],
      },
      persistence: {
        segmentStarted: "segment-start",
        segmentCompleted: "segment-end",
        interruption: "latest-heard-checkpoint",
        midSegmentRestore: "segment-start",
        periodicWrites: "prohibited",
      },
      invalidation: {
        ordering: [
          "replace-work-identity",
          "stop-playback",
          "abort-preparation",
          "release-queued-units",
          "contain-active-synthesis",
          "settle-target",
          "restart-if-authorized",
        ],
      },
      boundaries: {
        sharedSchemaChange: false,
        ttsProtocolChange: false,
        narrationSegmentationChange: false,
      },
    });
    expect(Object.isFrozen(SYNCHRONIZATION_AUTHORITY_V1)).toBe(true);
    expect(Object.isFrozen(SYNCHRONIZATION_AUTHORITY_V1.timing)).toBe(true);
    expect(
      Object.isFrozen(SYNCHRONIZATION_AUTHORITY_V1.invalidation.ordering),
    ).toBe(true);
  });

  it("has one deterministic transition row for every closed event", () => {
    expect(SYNCHRONIZATION_TRANSITION_TABLE_V1).toHaveLength(ALL_EVENTS.length);
    expect(
      SYNCHRONIZATION_TRANSITION_TABLE_V1.map((entry) => entry.event),
    ).toEqual(ALL_EVENTS);
    expect(
      new Set(SYNCHRONIZATION_TRANSITION_TABLE_V1.map((entry) => entry.event))
        .size,
    ).toBe(ALL_EVENTS.length);
    for (const event of ALL_EVENTS) {
      const entry = synchronizationTransitionFor(event);
      expect(entry.event).toBe(event);
      expect(entry.from.length).toBeGreaterThan(0);
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.from)).toBe(true);
    }
  });

  it("invalidates before cleanup for every navigation and terminal event", () => {
    for (const event of [
      "user-visual-navigation",
      "previous-segment",
      "next-segment",
      "chapter-navigation",
      "stop",
      "publication-or-settings-replacement",
      "service-failure",
      "application-cleanup",
    ] as const) {
      const entry = synchronizationTransitionFor(event);
      expect(entry.generation).toBe("invalidate-first");
      expect(entry.highlight).toBe("clear");
      expect(entry.persistence).toBe("latest-heard");
    }
    expect(synchronizationTransitionFor("user-visual-navigation").restart).toBe(
      "if-play-intent",
    );
    expect(synchronizationTransitionFor("chapter-navigation").focus).toBe(
      "reader-navigation-policy",
    );
  });

  it("advances persistence only at audible segment boundaries", () => {
    expect(synchronizationTransitionFor("segment-started")).toMatchObject({
      positionAuthority: "active-segment-start",
      highlight: "show-active-segment",
      persistence: "segment-start",
      focus: "preserve",
      visualSampling: "suspend-until-follow-settled",
    });
    expect(synchronizationTransitionFor("segment-completed")).toMatchObject({
      positionAuthority: "completed-segment-end",
      highlight: "retain-last-heard",
      persistence: "segment-end",
      focus: "preserve",
    });
    expect(synchronizationTransitionFor("reflow")).toMatchObject({
      nextPhase: "preserve",
      positionAuthority: "preserve",
      generation: "preserve",
      persistence: "preserve",
      focus: "preserve",
    });
  });

  it("uses one vertical comfort region and fails safe without geometry", () => {
    const viewport = { top: 0, bottom: 720 };
    expect(
      decideSynchronizationFollow(viewport, { top: 24, bottom: 120 }),
    ).toBe("keep-visible");
    expect(
      decideSynchronizationFollow(viewport, { top: -40, bottom: 23 }),
    ).toBe("follow-backward");
    expect(
      decideSynchronizationFollow(viewport, { top: 697, bottom: 710 }),
    ).toBe("follow-forward");
    expect(
      decideSynchronizationFollow(viewport, { top: 80, bottom: 650 }),
    ).toBe("keep-visible");

    expect(
      decideSynchronizationFollow(
        { top: 0, bottom: 100 },
        { top: 49.5, bottom: 50.5 },
      ),
    ).toBe("keep-visible");
    expect(
      decideSynchronizationFollow({ top: 0, bottom: 0 }, { top: 0, bottom: 0 }),
    ).toBe("geometry-unavailable");
    expect(
      decideSynchronizationFollow(
        { top: Number.NaN, bottom: 720 },
        { top: 0, bottom: 1 },
      ),
    ).toBe("geometry-unavailable");
    expect(decideSynchronizationFollow(viewport, { top: 2, bottom: 1 })).toBe(
      "geometry-unavailable",
    );
  });
});
