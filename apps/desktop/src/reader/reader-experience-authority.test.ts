import { describe, expect, it } from "vitest";

import {
  evaluateReaderHighlightProof,
  READER_EXPERIENCE_AUTHORITY_V1,
  READER_EXPERIENCE_STATE_TABLE_V1,
  readerExperienceStateFor,
  type ReaderExperiencePhase,
  type ReaderHighlightProofObservation,
} from "./reader-experience-authority";

const ALL_PHASES: readonly ReaderExperiencePhase[] = Object.freeze([
  "inactive",
  "preparing",
  "playing",
  "paused",
  "buffering",
  "failed",
]);

const PERCEIVABLE_OBSERVATION: ReaderHighlightProofObservation = Object.freeze({
  registryContainsNamedHighlight: true,
  highlightContainsExactRange: true,
  rangeConnected: true,
  rangeCollapsed: false,
  registeredAnimationFrames: 2,
  hasNonzeroClientGeometry: true,
  insideReaderViewport: true,
  hasExplicitForegroundAndBackground: true,
  textContrastRatio: 4.5,
  hasNonColorUnderline: true,
});

describe("reader experience authority v1", () => {
  it("freezes one scroll owner, compact narration, text-only duration, and bounded leaves", () => {
    expect(READER_EXPERIENCE_AUTHORITY_V1).toEqual({
      authorityVersion: 1,
      scroll: {
        readyPublicationOwner: "reader-viewport",
        nonReadyOwner: "application-page",
        maximumContinuousReaderScrollOwners: 1,
        nestedReaderScrollOwners: "prohibited",
      },
      narrationDetail: {
        states: ["closed", "open"],
        readyPublicationDefault: "closed",
        collapseEffect: "presentation-only",
        compactSurface: [
          "play-pause",
          "stop",
          "current-phase",
          "loaded-playable-duration",
          "buffering-or-low-water-warning",
          "active-error-and-required-recovery",
          "detail-expansion",
        ],
      },
      loadedDuration: {
        presentation: "text-only",
        progressElement: "prohibited",
        readyLabel: "Playable audio loaded",
        targetLabel: "Starts at",
        bookProgressMeaning: "none",
      },
      leaf: {
        presentation: "single-retargeted-contextual-control",
        target: "canonical-addressable-block-start",
        ordinaryParagraphActivation: "none",
        activation: "explicit-replace-and-start",
        maximumRetainedPerState: {
          preview: 1,
          preparing: 1,
          audible: 1,
          checkpoint: 1,
        },
        states: {
          preview: {
            visual: "translucent",
            nonColorCue: "accessible-name",
          },
          preparing: {
            visual: "distinct-pending",
            nonColorCue: "preparing-label",
          },
          audible: {
            visual: "solid",
            nonColorCue: "aria-current",
          },
          checkpoint: {
            visual: "outlined-non-solid",
            nonColorCue: "checkpoint-label",
          },
        },
        focus: "independently-visible",
        keyboardAndTouchParity: "required",
      },
      highlightProof: {
        acceptedEvidence: [
          "registry-contains-named-highlight",
          "highlight-contains-exact-range",
          "range-connected",
          "range-not-collapsed",
        ],
        perceivableEvidence: [
          "accepted",
          "registered-across-rendering-opportunity",
          "nonzero-client-geometry",
          "inside-reader-viewport",
          "explicit-foreground-and-background",
          "minimum-text-contrast",
          "non-color-underline",
        ],
        minimumAnimationFrames: 2,
        minimumTextContrastRatio: 4.5,
        nonColorCue: "underline",
        focus: "preserve",
        selection: "preserve",
        publicationDomMutation: "prohibited",
      },
      boundaries: {
        narrationSegmentationChange: false,
        ttsProtocolChange: false,
        adaptiveBufferThresholdChange: false,
        sharedContractChange: false,
        storageMigration: false,
        nativeCapabilityChange: false,
        dependencyChange: false,
      },
    });
    expect(Object.isFrozen(READER_EXPERIENCE_AUTHORITY_V1)).toBe(true);
    expect(
      Object.isFrozen(
        READER_EXPERIENCE_AUTHORITY_V1.leaf.maximumRetainedPerState,
      ),
    ).toBe(true);
    expect(
      Object.isFrozen(
        READER_EXPERIENCE_AUTHORITY_V1.highlightProof.perceivableEvidence,
      ),
    ).toBe(true);
  });

  it("has one deterministic UI row for every closed phase", () => {
    expect(READER_EXPERIENCE_STATE_TABLE_V1).toHaveLength(ALL_PHASES.length);
    expect(
      READER_EXPERIENCE_STATE_TABLE_V1.map((entry) => entry.phase),
    ).toEqual(ALL_PHASES);
    for (const phase of ALL_PHASES) {
      const entry = readerExperienceStateFor(phase);
      expect(entry.allowedDetailStates).toEqual(["closed", "open"]);
      expect(entry.defaultDetailState).toBe("closed");
      expect(entry.retainedLeafStates).toContain("preview");
      expect(entry.retainedLeafStates.length).toBeLessThanOrEqual(3);
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.retainedLeafStates)).toBe(true);
    }
    expect(readerExperienceStateFor("playing")).toMatchObject({
      retainedLeafStates: ["preview", "audible", "checkpoint"],
      highlight: "active-segment",
    });
    expect(readerExperienceStateFor("paused").highlight).toBe(
      "retain-last-heard",
    );
    expect(readerExperienceStateFor("buffering").highlight).toBe(
      "retain-last-heard",
    );
    expect(readerExperienceStateFor("failed").highlight).toBe("absent");
  });

  it("does not confuse accepted range registration with visible perception", () => {
    expect(
      evaluateReaderHighlightProof({
        ...PERCEIVABLE_OBSERVATION,
        registeredAnimationFrames: 0,
      }),
    ).toEqual({
      rangeAccepted: true,
      highlightVisiblyPerceivable: false,
    });
    expect(evaluateReaderHighlightProof(PERCEIVABLE_OBSERVATION)).toEqual({
      rangeAccepted: true,
      highlightVisiblyPerceivable: true,
    });
  });

  it.each([
    ["geometry", { hasNonzeroClientGeometry: false }],
    ["viewport", { insideReaderViewport: false }],
    ["foreground/background", { hasExplicitForegroundAndBackground: false }],
    ["contrast", { textContrastRatio: 4.49 }],
    ["non-colour cue", { hasNonColorUnderline: false }],
  ])("rejects perception without %s evidence", (_name, override) => {
    expect(
      evaluateReaderHighlightProof({
        ...PERCEIVABLE_OBSERVATION,
        ...override,
      }).highlightVisiblyPerceivable,
    ).toBe(false);
  });

  it("freezes all cross-boundary changes out of Milestone 1", () => {
    expect(Object.values(READER_EXPERIENCE_AUTHORITY_V1.boundaries)).toSatisfy(
      (values: boolean[]) => values.every((value) => !value),
    );
  });
});
