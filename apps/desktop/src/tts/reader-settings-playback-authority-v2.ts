import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "./adaptive-buffer-authority";
import {
  effectiveListeningMillisecondsFromSampleFramesV1,
  minimumSourceSampleFramesForEffectiveListeningMillisecondsV1,
  READER_SETTINGS_PLAYBACK_AUTHORITY_V1,
  sourceMediaMillisecondsFromSampleFramesV1,
} from "./reader-settings-playback-authority";

export type NarrationPlaybackRatePercentV2 = 100 | 95 | 90 | 85 | 80 | 75;

export interface NarrationPlaybackRateAuthorityV2 {
  readonly percent: NarrationPlaybackRatePercentV2;
  readonly label: string;
  readonly numerator: NarrationPlaybackRatePercentV2;
  readonly denominator: 100;
}

function playbackRate(
  percent: NarrationPlaybackRatePercentV2,
  label: string,
): NarrationPlaybackRateAuthorityV2 {
  return Object.freeze({
    percent,
    label,
    numerator: percent,
    denominator: 100,
  });
}

export const NARRATION_PLAYBACK_RATES_V2 = Object.freeze([
  playbackRate(100, "1.00x"),
  playbackRate(95, "0.95x"),
  playbackRate(90, "0.90x"),
  playbackRate(85, "0.85x"),
  playbackRate(80, "0.80x"),
  playbackRate(75, "0.75x"),
] as const);

export const SIGNALSMITH_STRETCH_PACKAGE_V2 = Object.freeze({
  name: "signalsmith-stretch" as const,
  version: "1.3.2" as const,
  license: "MIT" as const,
  integrity:
    "sha512-tJqRbwPCoWLSHXwO29UQ75u72IwPsHns3RG+TKzuOAp7OduJiJMzEtz32JEFbPFQcTR7aiKCIVc+/Kzw8bMZUw==" as const,
  tarball:
    "https://registry.npmjs.org/signalsmith-stretch/-/signalsmith-stretch-1.3.2.tgz" as const,
  repository: "https://signalsmith-audio.co.uk/code/stretch.git" as const,
  gitHead: "222093b4cc13ddb4d07c826bc3c1559326091731" as const,
  importEntry: "./SignalsmithStretch.mjs" as const,
  requireEntry: "./SignalsmithStretch.js" as const,
  declaredDependencies: Object.freeze([] as const),
  declaredOptionalDependencies: Object.freeze([] as const),
  declaredPeerDependencies: Object.freeze([] as const),
  unpackedSizeBytes: 232_286,
  fileCount: 4,
  auditState:
    "metadata-frozen-package-source-transitive-and-shipped-artifact-audit-required-before-installation" as const,
});

const BASELINE_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src ipc: http://ipc.localhost";
const MEDIA_CSP_DIRECTIVE = "media-src 'self' blob:";

export const READER_SETTINGS_PLAYBACK_AUTHORITY_V2 = Object.freeze({
  authorityVersion: 2,
  status: "frozen-before-v2-candidate-implementation-or-results" as const,
  relationshipToV1: Object.freeze({
    v1Authority:
      "docs/architecture/reader-settings-playback-authority-v1.md" as const,
    v1Executable:
      "apps/desktop/src/tts/reader-settings-playback-authority.ts" as const,
    v1Evidence: "immutable" as const,
    supersededFutureProductTarget:
      "playback-rate-range-and-backend-comparison-only" as const,
    retainedV1Runtime: "1.00x-only-until-a-v2-candidate-passes" as const,
  }),
  playback: Object.freeze({
    applicationBoundary: "after-synthesis-in-memory-playback" as const,
    pitchPreservation: "required" as const,
    sourceProgressAuthority: "consumed-source-sample-frames" as const,
    sourceMediaDurationFormula: "floor(sourceFrames*1000/24000)" as const,
    effectiveListeningDurationFormula:
      "floor(sourceFrames*1000*100/(24000*ratePercent))" as const,
    rates: NARRATION_PLAYBACK_RATES_V2,
    defaultRatePercent: 100 as const,
    persistedOrRuntimeValuesOutsideClosedSet: "reject" as const,
  }),
  candidates: Object.freeze([
    Object.freeze({
      id: "html-media-element-preserves-pitch-wav-v2" as const,
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
      id: "signalsmith-stretch-web-audio-wasm-worklet-1-3-2" as const,
      sourceIdentity: Object.freeze({
        kind: "exact-published-package" as const,
        package: SIGNALSMITH_STRETCH_PACKAGE_V2,
      }),
      runtimeDependency: "candidate-only-after-milestone-2b-audit" as const,
      activeAudioCopyLimit: "one-service-unit" as const,
      candidateSpecificCspDirective: null,
      eligible:
        "pending-milestone-2b-package-source-transitive-and-shipped-artifact-audit" as const,
    }),
    Object.freeze({
      id: "repository-incremental-audio-worklet-wsola-v2" as const,
      sourceIdentity: Object.freeze({
        kind: "repository-owned-new-source" as const,
        version: 2 as const,
        controllerPath:
          "apps/desktop/src/tts/playback-backends/incremental-wsola-v2.ts" as const,
        workletPath:
          "apps/desktop/src/tts/playback-backends/incremental-wsola-v2-worklet.ts" as const,
        implementationCommit:
          "must-be-a-strict-descendant-of-the-v2-authority-commit" as const,
        prohibitedReuseOrRelabel: "repository-audio-worklet-wsola-v1" as const,
      }),
      runtimeDependency: "none" as const,
      activeAudioCopyLimit: "one-service-unit" as const,
      candidateSpecificCspDirective: null,
      eligible: true,
    }),
  ] as const),
  licensePolicy: Object.freeze({
    admittedSources: Object.freeze([
      "host-platform-api",
      "repository-owned-under-root-license",
      "exact-reviewed-fee-free-permissive-package",
    ] as const),
    admittedSpdxLicenses: Object.freeze([
      "0BSD",
      "Apache-2.0",
      "BSD-2-Clause",
      "BSD-3-Clause",
      "ISC",
      "MIT",
    ] as const),
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
    ambiguityOutcome: "stop-before-installation-or-evaluation" as const,
    distributionReviewOwner: "M011" as const,
    manifest: Object.freeze([
      Object.freeze({
        candidateId: "html-media-element-preserves-pitch-wav-v2" as const,
        licenseBasis: "host-platform-api" as const,
        feeRequired: false,
      }),
      Object.freeze({
        candidateId:
          "signalsmith-stretch-web-audio-wasm-worklet-1-3-2" as const,
        licenseBasis: "MIT-published-package-metadata" as const,
        feeRequired: false,
        fullAuditRequiredBeforeInstallation: true,
      }),
      Object.freeze({
        candidateId: "repository-incremental-audio-worklet-wsola-v2" as const,
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
    maximumActiveObjectUrls: 1,
    maximumActiveTimeStretchers: 1,
    maximumConcurrentCandidateComparisons: 1,
    maximumActiveServiceTrees: 1,
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
    promptLifecycleActions: Object.freeze([
      "pause",
      "stop",
      "seek",
      "chapter-change",
      "profile-change",
      "language-change",
      "book-close",
      "session-replacement",
      "candidate-failure",
      "app-exit",
    ] as const),
    maximumExternalRequests: 0,
    maximumPersistedGeneratedAudioBytes: 0,
  }),
  evaluation: Object.freeze({
    syntheticInput:
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.syntheticInput,
    speechInput:
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.speechInput,
    deterministicRatePercent: Object.freeze([95, 90, 85, 80, 75] as const),
    listeningRatePercent: Object.freeze([100, 85, 75] as const),
    machineGates:
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.machineGates,
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

export function isNarrationPlaybackRatePercentV2(
  value: unknown,
): value is NarrationPlaybackRatePercentV2 {
  return (
    typeof value === "number" &&
    NARRATION_PLAYBACK_RATES_V2.some((rate) => rate.percent === value)
  );
}

export function narrationPlaybackRateForPercentV2(
  value: unknown,
): NarrationPlaybackRateAuthorityV2 {
  const rate = NARRATION_PLAYBACK_RATES_V2.find(
    (candidate) => candidate.percent === value,
  );
  if (rate === undefined) {
    throw new RangeError("Unsupported v2 narration playback rate.");
  }
  return rate;
}

export function sourceMediaMillisecondsFromSampleFramesV2(
  sampleFrames: number,
): number {
  return sourceMediaMillisecondsFromSampleFramesV1(sampleFrames);
}

export function effectiveListeningMillisecondsFromSampleFramesV2(
  sampleFrames: number,
  playbackRatePercent: NarrationPlaybackRatePercentV2,
): number {
  narrationPlaybackRateForPercentV2(playbackRatePercent);
  return effectiveListeningMillisecondsFromSampleFramesV1(
    sampleFrames,
    playbackRatePercent,
  );
}

export function minimumSourceSampleFramesForEffectiveListeningMillisecondsV2(
  effectiveListeningMilliseconds: number,
  playbackRatePercent: NarrationPlaybackRatePercentV2,
): number {
  narrationPlaybackRateForPercentV2(playbackRatePercent);
  return minimumSourceSampleFramesForEffectiveListeningMillisecondsV1(
    effectiveListeningMilliseconds,
    playbackRatePercent,
  );
}
