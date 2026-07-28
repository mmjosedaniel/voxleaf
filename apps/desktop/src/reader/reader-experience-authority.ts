export type ReaderExperiencePhase =
  "inactive" | "preparing" | "playing" | "paused" | "buffering" | "failed";

export type ReaderExperienceDetailState = "closed" | "open";

export type ReaderExperienceLeafState =
  "preview" | "preparing" | "audible" | "checkpoint";

export type ReaderExperienceHighlightState =
  "absent" | "active-segment" | "retain-last-heard";

export interface ReaderExperienceStateAuthority {
  readonly phase: ReaderExperiencePhase;
  readonly allowedDetailStates: readonly ReaderExperienceDetailState[];
  readonly defaultDetailState: ReaderExperienceDetailState;
  readonly retainedLeafStates: readonly ReaderExperienceLeafState[];
  readonly highlight: ReaderExperienceHighlightState;
}

function stateAuthority(
  value: ReaderExperienceStateAuthority,
): ReaderExperienceStateAuthority {
  return Object.freeze({
    ...value,
    allowedDetailStates: Object.freeze([...value.allowedDetailStates]),
    retainedLeafStates: Object.freeze([...value.retainedLeafStates]),
  });
}

const BOTH_DETAIL_STATES = Object.freeze(["closed", "open"] as const);

export const READER_EXPERIENCE_AUTHORITY_V1 = Object.freeze({
  authorityVersion: 1,
  scroll: Object.freeze({
    readyPublicationOwner: "reader-viewport" as const,
    nonReadyOwner: "application-page" as const,
    maximumContinuousReaderScrollOwners: 1,
    nestedReaderScrollOwners: "prohibited" as const,
  }),
  narrationDetail: Object.freeze({
    states: BOTH_DETAIL_STATES,
    readyPublicationDefault: "closed" as const,
    collapseEffect: "presentation-only" as const,
    compactSurface: Object.freeze([
      "play-pause",
      "stop",
      "current-phase",
      "loaded-playable-duration",
      "buffering-or-low-water-warning",
      "active-error-and-required-recovery",
      "detail-expansion",
    ] as const),
  }),
  loadedDuration: Object.freeze({
    presentation: "text-only" as const,
    progressElement: "prohibited" as const,
    readyLabel: "Playable audio loaded" as const,
    targetLabel: "Starts at" as const,
    bookProgressMeaning: "none" as const,
  }),
  leaf: Object.freeze({
    presentation: "single-retargeted-contextual-control" as const,
    target: "canonical-addressable-block-start" as const,
    ordinaryParagraphActivation: "none" as const,
    activation: "explicit-replace-and-start" as const,
    maximumRetainedPerState: Object.freeze({
      preview: 1,
      preparing: 1,
      audible: 1,
      checkpoint: 1,
    }),
    states: Object.freeze({
      preview: Object.freeze({
        visual: "translucent" as const,
        nonColorCue: "accessible-name" as const,
      }),
      preparing: Object.freeze({
        visual: "distinct-pending" as const,
        nonColorCue: "preparing-label" as const,
      }),
      audible: Object.freeze({
        visual: "solid" as const,
        nonColorCue: "aria-current" as const,
      }),
      checkpoint: Object.freeze({
        visual: "outlined-non-solid" as const,
        nonColorCue: "checkpoint-label" as const,
      }),
    }),
    focus: "independently-visible" as const,
    keyboardAndTouchParity: "required" as const,
  }),
  highlightProof: Object.freeze({
    acceptedEvidence: Object.freeze([
      "registry-contains-named-highlight",
      "highlight-contains-exact-range",
      "range-connected",
      "range-not-collapsed",
    ] as const),
    perceivableEvidence: Object.freeze([
      "accepted",
      "registered-across-rendering-opportunity",
      "nonzero-client-geometry",
      "inside-reader-viewport",
      "explicit-foreground-and-background",
      "minimum-text-contrast",
      "non-color-underline",
    ] as const),
    minimumAnimationFrames: 2,
    minimumTextContrastRatio: 4.5,
    nonColorCue: "underline" as const,
    focus: "preserve" as const,
    selection: "preserve" as const,
    publicationDomMutation: "prohibited" as const,
  }),
  boundaries: Object.freeze({
    narrationSegmentationChange: false,
    ttsProtocolChange: false,
    adaptiveBufferThresholdChange: false,
    sharedContractChange: false,
    storageMigration: false,
    nativeCapabilityChange: false,
    dependencyChange: false,
  }),
});

export const READER_EXPERIENCE_STATE_TABLE_V1 = Object.freeze([
  stateAuthority({
    phase: "inactive",
    allowedDetailStates: BOTH_DETAIL_STATES,
    defaultDetailState: "closed",
    retainedLeafStates: ["preview", "checkpoint"],
    highlight: "absent",
  }),
  stateAuthority({
    phase: "preparing",
    allowedDetailStates: BOTH_DETAIL_STATES,
    defaultDetailState: "closed",
    retainedLeafStates: ["preview", "preparing", "checkpoint"],
    highlight: "absent",
  }),
  stateAuthority({
    phase: "playing",
    allowedDetailStates: BOTH_DETAIL_STATES,
    defaultDetailState: "closed",
    retainedLeafStates: ["preview", "audible", "checkpoint"],
    highlight: "active-segment",
  }),
  stateAuthority({
    phase: "paused",
    allowedDetailStates: BOTH_DETAIL_STATES,
    defaultDetailState: "closed",
    retainedLeafStates: ["preview", "checkpoint"],
    highlight: "retain-last-heard",
  }),
  stateAuthority({
    phase: "buffering",
    allowedDetailStates: BOTH_DETAIL_STATES,
    defaultDetailState: "closed",
    retainedLeafStates: ["preview", "checkpoint"],
    highlight: "retain-last-heard",
  }),
  stateAuthority({
    phase: "failed",
    allowedDetailStates: BOTH_DETAIL_STATES,
    defaultDetailState: "closed",
    retainedLeafStates: ["preview", "checkpoint"],
    highlight: "absent",
  }),
] as const);

export interface ReaderHighlightProofObservation {
  readonly registryContainsNamedHighlight: boolean;
  readonly highlightContainsExactRange: boolean;
  readonly rangeConnected: boolean;
  readonly rangeCollapsed: boolean;
  readonly registeredAnimationFrames: number;
  readonly hasNonzeroClientGeometry: boolean;
  readonly insideReaderViewport: boolean;
  readonly hasExplicitForegroundAndBackground: boolean;
  readonly textContrastRatio: number;
  readonly hasNonColorUnderline: boolean;
}

export interface ReaderHighlightProofResult {
  readonly rangeAccepted: boolean;
  readonly highlightVisiblyPerceivable: boolean;
}

export function evaluateReaderHighlightProof(
  observation: ReaderHighlightProofObservation,
): ReaderHighlightProofResult {
  const rangeAccepted =
    observation.registryContainsNamedHighlight &&
    observation.highlightContainsExactRange &&
    observation.rangeConnected &&
    !observation.rangeCollapsed;
  const authority = READER_EXPERIENCE_AUTHORITY_V1.highlightProof;
  return Object.freeze({
    rangeAccepted,
    highlightVisiblyPerceivable:
      rangeAccepted &&
      observation.registeredAnimationFrames >=
        authority.minimumAnimationFrames &&
      observation.hasNonzeroClientGeometry &&
      observation.insideReaderViewport &&
      observation.hasExplicitForegroundAndBackground &&
      Number.isFinite(observation.textContrastRatio) &&
      observation.textContrastRatio >= authority.minimumTextContrastRatio &&
      observation.hasNonColorUnderline,
  });
}

export function readerExperienceStateFor(
  phase: ReaderExperiencePhase,
): ReaderExperienceStateAuthority {
  const authority = READER_EXPERIENCE_STATE_TABLE_V1.find(
    (candidate) => candidate.phase === phase,
  );
  if (authority === undefined) {
    throw new Error("Unsupported reader-experience phase.");
  }
  return authority;
}
