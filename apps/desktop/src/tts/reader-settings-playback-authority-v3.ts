import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "./adaptive-buffer-authority";
import {
  READER_SETTINGS_PLAYBACK_AUTHORITY_V1,
  sourceMediaMillisecondsFromSampleFramesV1,
} from "./reader-settings-playback-authority";
import {
  effectiveListeningMillisecondsFromSampleFramesV2,
  minimumSourceSampleFramesForEffectiveListeningMillisecondsV2,
  NARRATION_PLAYBACK_RATES_V2,
  narrationPlaybackRateForPercentV2,
  type NarrationPlaybackRateAuthorityV2,
  type NarrationPlaybackRatePercentV2,
} from "./reader-settings-playback-authority-v2";

export type NarrationPlaybackRatePercentV3 = NarrationPlaybackRatePercentV2;
export type NarrationPlaybackRateAuthorityV3 = NarrationPlaybackRateAuthorityV2;

export type NarrationPlaybackBoundaryV3 =
  "initial-unit-start" | "after-complete-unit-ended-before-successor-start";

export interface NarrationPlaybackRateStateV3 {
  readonly selectedRatePercent: NarrationPlaybackRatePercentV3;
  readonly activeRatePercent: NarrationPlaybackRatePercentV3 | null;
  readonly pendingRatePercent: NarrationPlaybackRatePercentV3 | null;
}

export const NARRATION_PLAYBACK_RATES_V3 = Object.freeze(
  NARRATION_PLAYBACK_RATES_V2.map((rate) => rate),
);

const BASELINE_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src ipc: http://ipc.localhost";
const MEDIA_CSP_DIRECTIVE = "media-src 'self' blob:";

const INVALIDATION_ACTIONS = Object.freeze([
  "stop",
  "seek",
  "chapter-change",
  "profile-change",
  "language-change",
  "book-close",
  "session-replacement",
  "candidate-failure",
  "app-exit",
] as const);

export const READER_SETTINGS_PLAYBACK_AUTHORITY_V3 = Object.freeze({
  authorityVersion: 3,
  status: "frozen-before-v3-candidate-implementation-or-results" as const,
  relationshipToHistory: Object.freeze({
    v1Authority:
      "docs/architecture/reader-settings-playback-authority-v1.md" as const,
    v2Authority:
      "docs/architecture/reader-settings-playback-authority-v2.md" as const,
    v1AndV2Evidence: "immutable" as const,
    supersededFutureTarget:
      "boundary-deferred-playback-comparison-only" as const,
    retainedRuntime: "1.00x-only-until-a-v3-candidate-passes" as const,
  }),
  playback: Object.freeze({
    applicationBoundary: "after-synthesis-in-memory-playback" as const,
    pitchPreservation: "required" as const,
    sourceProgressAuthority: "consumed-source-sample-frames" as const,
    sourceMediaDurationFormula: "floor(sourceFrames*1000/24000)" as const,
    effectiveListeningDurationFormula:
      "floor(sourceFrames*1000*100/(24000*ratePercent))" as const,
    rates: NARRATION_PLAYBACK_RATES_V3,
    defaultRatePercent: 100 as const,
    persistedOrRuntimeValuesOutsideClosedSet: "reject" as const,
    rateState: Object.freeze({
      selectedPresentation: "updates-immediately" as const,
      activePresentation: "reports-current-audible-unit-rate" as const,
      activeRateMutation: "prohibited-while-unit-is-active" as const,
      pendingSelectionPolicy: "latest-valid-value-wins" as const,
      activationBoundaries: Object.freeze([
        "initial-unit-start",
        "after-complete-unit-ended-before-successor-start",
      ] as const),
      midUnitActivation: "prohibited" as const,
      successorRequirement: "next-complete-queued-unit" as const,
    }),
  }),
  candidates: Object.freeze([
    Object.freeze({
      id: "html-media-element-preserves-pitch-wav-boundary-v3" as const,
      sourceIdentity: Object.freeze({
        kind: "host-platform-api" as const,
        APIs: Object.freeze([
          "HTMLMediaElement.playbackRate",
          "HTMLMediaElement.preservesPitch",
          "URL.createObjectURL",
          "URL.revokeObjectURL",
        ] as const),
      }),
      runtimeDependency: "none" as const,
      activeAudioCopyLimit: "one-service-unit-plus-one-wav-copy" as const,
      candidateSpecificCspDirective: MEDIA_CSP_DIRECTIVE,
      eligible: true,
    }),
    Object.freeze({
      id: "repository-incremental-audio-worklet-wsola-boundary-v3" as const,
      sourceIdentity: Object.freeze({
        kind: "repository-owned-new-source" as const,
        version: 3 as const,
        controllerPath:
          "apps/desktop/src/tts/playback-backends/incremental-wsola-v3.ts" as const,
        workletPath:
          "apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts" as const,
        implementationCommit:
          "must-be-a-strict-descendant-of-the-v3-authority-commit" as const,
        prohibitedReuseOrRelabel:
          "repository-incremental-audio-worklet-wsola-v2" as const,
      }),
      runtimeDependency: "none" as const,
      activeAudioCopyLimit: "one-service-unit" as const,
      candidateSpecificCspDirective: null,
      eligible: true,
    }),
  ] as const),
  exclusions: Object.freeze([
    Object.freeze({
      id: "signalsmith-stretch-web-audio-wasm-worklet-1-3-2" as const,
      reason:
        "pre-trial-initialization-failure-reproduced-outside-sandbox-and-not-diagnosed-before-authority-checkpoint" as const,
      eligible: false,
    }),
  ] as const),
  licensePolicy: Object.freeze({
    admittedSources: Object.freeze([
      "host-platform-api",
      "repository-owned-under-root-license",
    ] as const),
    admittedSpdxLicenses: Object.freeze(["MIT"] as const),
    prohibitedTerms: Object.freeze([
      "purchase",
      "subscription",
      "royalty",
      "paid-seat",
      "commercial-exception",
      "copyleft",
      "source-availability",
      "unknown-or-ambiguous-license",
    ] as const),
    ambiguityOutcome: "stop-before-implementation-or-evaluation" as const,
    distributionReviewOwner: "M011" as const,
    manifest: Object.freeze([
      Object.freeze({
        candidateId:
          "html-media-element-preserves-pitch-wav-boundary-v3" as const,
        licenseBasis: "host-platform-api" as const,
        feeRequired: false,
      }),
      Object.freeze({
        candidateId:
          "repository-incremental-audio-worklet-wsola-boundary-v3" as const,
        licenseBasis: "repository-root-MIT-license" as const,
        feeRequired: false,
      }),
    ] as const),
  }),
  contentSecurityPolicy: Object.freeze({
    current: BASELINE_CSP,
    mediaCandidateDelta: MEDIA_CSP_DIRECTIVE,
    mediaCandidateProspective: `${BASELINE_CSP}; ${MEDIA_CSP_DIRECTIVE}`,
    unchangedConnectSrc: "connect-src ipc: http://ipc.localhost" as const,
    prohibitedMediaSources: Object.freeze([
      "data:",
      "http:",
      "https:",
      "*",
    ] as const),
    nativeCapabilityDelta: "none" as const,
    appliesOnlyIfMediaCandidateAdvances: true,
  }),
  lifecycleAndBounds: Object.freeze({
    speedSelectionEffects: Object.freeze({
      cancelOrRestartTts: false,
      replaceSessionOrGenerationIdentity: false,
      changePreparedNarrationText: false,
      regenerateSourcePcm: false,
      releaseOrClearQueuedSourcePcm: false,
    }),
    pauseBehavior:
      "preserve-active-rate-pending-rate-source-offset-and-queued-source-pcm" as const,
    resumeBehavior:
      "resume-active-unit-at-active-rate-before-any-successor-boundary" as const,
    invalidationActions: INVALIDATION_ACTIONS,
    invalidationBehavior:
      "identity-first-cancel-active-and-pending-playback-work" as const,
    maximumActiveObjectUrls: 1,
    maximumActiveTimeStretchers: 1,
    maximumConcurrentCandidateComparisons: 1,
    maximumActiveServiceTrees: 1,
    duplicateTransformedAudioFifosAllowed: 0,
    maximumSourceSampleFrames:
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumSampleFrames,
    maximumLogicalPcmBytes:
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumPayloadBytes,
    maximumCompleteUnits:
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumCompleteUnits,
    maximumMetadataEntries:
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumMetadataEntries,
    sourceAccountingUnit: "sample-frames" as const,
    objectUrlRevocation: "deterministic-before-replacement-or-exit" as const,
    maximumExternalRequests: 0,
    maximumPersistedGeneratedAudioBytes: 0,
    defaultRateOwnership: Object.freeze({
      maximumActiveTimeStretchers: 0,
      maximumActiveObjectUrls: 0,
      maximumTransformedAudioCopies: 0,
      maximumTimeStretchWorkQueues: 0,
      maximumAdditionalTimeStretchWorkBytes: 0,
      releasePoint:
        "after-the-preceding-non-default-unit-and-its-handoff-settle" as const,
    }),
  }),
  evaluation: Object.freeze({
    syntheticInput:
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.syntheticInput,
    speechInput:
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.speechInput,
    deterministicRatePercent: Object.freeze([95, 90, 85, 80, 75] as const),
    listeningRatePercent: Object.freeze([100, 85, 75] as const),
    localInferenceContention: Object.freeze({
      profileId: "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1" as const,
      maximumActiveInferenceProcesses: 1,
      maximumConcurrentCandidateComparisons: 1,
      execution: "sequential" as const,
    }),
    machineGates: Object.freeze({
      maximumPitchDeviationCents: 20,
      maximumRenderedDurationErrorMs: 50,
      maximumSourceFrameDrift: 0,
      maximumFirstNonDefaultActivationP95Ms: 1_000,
      maximumRecurringUnitHandoffP95Ms: 250,
      maximumPauseStopTeardownP95Ms: 250,
      maximumAdditionalWorkBytes: 7_680_000,
      maximumAdditionalProcessRamMiB: 200,
      maximumCpuIncreasePercentagePoints: 20,
      maximumActiveTimeStretchers: 1,
      maximumExternalRequests: 0,
      maximumPersistedGeneratedAudioBytes: 0,
      maximumMidUnitActivationEvents: 0,
      maximumRecurringHandoffsUsingFirstActivationAllowance: 0,
    }),
    listeningGates: Object.freeze({
      ...READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.listeningGates,
      rates: Object.freeze([100, 85, 75] as const),
    }),
    requiredHosts:
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.requiredHosts,
    resultLineage: Object.freeze({
      authorityCommitRequired: true,
      executionCommitMustBeStrictDescendant: true,
      resultArtifactBeforeAuthorityCommit: "prohibited" as const,
      implementationBeforeAuthorityCommit: "prohibited" as const,
      gateTuningAfterResults: "prohibited" as const,
    }),
    noPassingCandidate: "retain-1.00x-only-without-speed-selector" as const,
  }),
  currentRuntime: Object.freeze({
    productionPlaybackRatePercent: 100 as const,
    speedSelectorAvailable: false,
    dependencyChange: false,
    cspChange: false,
    candidateImplementation: false,
  }),
  boundaries: Object.freeze({
    narrationPreparationChange: false,
    ttsRequestChange: false,
    protocolChange: false,
    profileSupportChange: false,
    modelOutputChange: false,
    audioResourceCeilingChange: false,
    transitionPauseDurationChange: false,
    nativeCapabilityChange: false,
    productionDependencyChange: false,
    runtimePlaybackChange: false,
  }),
});

export function isNarrationPlaybackRatePercentV3(
  value: unknown,
): value is NarrationPlaybackRatePercentV3 {
  return (
    typeof value === "number" &&
    NARRATION_PLAYBACK_RATES_V3.some((rate) => rate.percent === value)
  );
}

export function narrationPlaybackRateForPercentV3(
  value: unknown,
): NarrationPlaybackRateAuthorityV3 {
  if (!isNarrationPlaybackRatePercentV3(value)) {
    throw new RangeError("Unsupported v3 narration playback rate.");
  }
  return narrationPlaybackRateForPercentV2(value);
}

export function initialNarrationPlaybackRateStateV3(): NarrationPlaybackRateStateV3 {
  return Object.freeze({
    selectedRatePercent: 100,
    activeRatePercent: null,
    pendingRatePercent: null,
  });
}

export function selectNarrationPlaybackRateV3(
  state: NarrationPlaybackRateStateV3,
  value: unknown,
): NarrationPlaybackRateStateV3 {
  const selectedRate = narrationPlaybackRateForPercentV3(value).percent;
  const pendingRate =
    state.activeRatePercent === selectedRate ? null : selectedRate;
  return Object.freeze({
    selectedRatePercent: selectedRate,
    activeRatePercent: state.activeRatePercent,
    pendingRatePercent: pendingRate,
  });
}

export function activateNarrationPlaybackRateAtBoundaryV3(
  state: NarrationPlaybackRateStateV3,
  boundary: unknown,
): NarrationPlaybackRateStateV3 {
  const initialStart = boundary === "initial-unit-start";
  const successorStart =
    boundary === "after-complete-unit-ended-before-successor-start";
  if (
    (!initialStart && !successorStart) ||
    (initialStart && state.activeRatePercent !== null) ||
    (successorStart && state.activeRatePercent === null)
  ) {
    throw new RangeError("Unsupported v3 playback-rate activation boundary.");
  }

  return Object.freeze({
    selectedRatePercent: state.selectedRatePercent,
    activeRatePercent: state.pendingRatePercent ?? state.selectedRatePercent,
    pendingRatePercent: null,
  });
}

export function sourceMediaMillisecondsFromSampleFramesV3(
  sampleFrames: number,
): number {
  return sourceMediaMillisecondsFromSampleFramesV1(sampleFrames);
}

export function effectiveListeningMillisecondsFromSampleFramesV3(
  sampleFrames: number,
  playbackRatePercent: NarrationPlaybackRatePercentV3,
): number {
  return effectiveListeningMillisecondsFromSampleFramesV2(
    sampleFrames,
    playbackRatePercent,
  );
}

export function minimumSourceSampleFramesForEffectiveListeningMillisecondsV3(
  effectiveListeningMilliseconds: number,
  playbackRatePercent: NarrationPlaybackRatePercentV3,
): number {
  return minimumSourceSampleFramesForEffectiveListeningMillisecondsV2(
    effectiveListeningMilliseconds,
    playbackRatePercent,
  );
}
