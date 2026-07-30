import {
  ADAPTIVE_BUFFER_AUTHORITY_V1,
  playableMillisecondsFromSampleFrames,
} from "./adaptive-buffer-authority";
import {
  CHATTERBOX_BILINGUAL_PROFILE_ID,
  EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "./hardware-profile-registry";

export type ReaderSettingsViewportBandV1 = "narrow" | "compact" | "wide";
export type ReaderSettingsPresentationV1 = "full-width-sheet" | "right-drawer";
export type ReaderContentsPresentationV1 = "overlay" | "persistent-optional";
export type ReaderSettingsWidthV1 = number | "viewport";

export type NarrationPlaybackRatePercentV1 =
  100 | 95 | 90 | 85 | 80 | 75 | 70 | 65 | 60 | 55 | 50;

export interface NarrationPlaybackRateAuthorityV1 {
  readonly percent: NarrationPlaybackRatePercentV1;
  readonly label: string;
  readonly numerator: NarrationPlaybackRatePercentV1;
  readonly denominator: 100;
}

export interface ReaderSettingsLayoutAuthorityV1 {
  readonly band: ReaderSettingsViewportBandV1;
  readonly minimumViewportWidthCssPx: number;
  readonly settingsPresentation: ReaderSettingsPresentationV1;
  readonly settingsWidthCssPx: ReaderSettingsWidthV1;
  readonly contentsPresentation: ReaderContentsPresentationV1;
  readonly contentsWidthCssPx: number | null;
}

function playbackRate(
  percent: NarrationPlaybackRatePercentV1,
  label: string,
): NarrationPlaybackRateAuthorityV1 {
  return Object.freeze({
    percent,
    label,
    numerator: percent,
    denominator: 100,
  });
}

export const NARRATION_PLAYBACK_RATES_V1 = Object.freeze([
  playbackRate(100, "1.00x"),
  playbackRate(95, "0.95x"),
  playbackRate(90, "0.90x"),
  playbackRate(85, "0.85x"),
  playbackRate(80, "0.80x"),
  playbackRate(75, "0.75x"),
  playbackRate(70, "0.70x"),
  playbackRate(65, "0.65x"),
  playbackRate(60, "0.60x"),
  playbackRate(55, "0.55x"),
  playbackRate(50, "0.50x"),
] as const);

const NARROW_LAYOUT = Object.freeze({
  band: "narrow" as const,
  minimumViewportWidthCssPx: 0,
  settingsPresentation: "full-width-sheet" as const,
  settingsWidthCssPx: "viewport" as const,
  contentsPresentation: "overlay" as const,
  contentsWidthCssPx: null,
});

const COMPACT_LAYOUT = Object.freeze({
  band: "compact" as const,
  minimumViewportWidthCssPx: 800,
  settingsPresentation: "right-drawer" as const,
  settingsWidthCssPx: 360,
  contentsPresentation: "overlay" as const,
  contentsWidthCssPx: null,
});

const WIDE_LAYOUT = Object.freeze({
  band: "wide" as const,
  minimumViewportWidthCssPx: 1_200,
  settingsPresentation: "right-drawer" as const,
  settingsWidthCssPx: 400,
  contentsPresentation: "persistent-optional" as const,
  contentsWidthCssPx: 260,
});

export const READER_SETTINGS_LAYOUTS_V1 = Object.freeze([
  NARROW_LAYOUT,
  COMPACT_LAYOUT,
  WIDE_LAYOUT,
] as const);

export const READER_SETTINGS_PLAYBACK_AUTHORITY_V1 = Object.freeze({
  authorityVersion: 1,
  status: "frozen-before-production-implementation" as const,
  shell: Object.freeze({
    readyRegions: Object.freeze([
      "fixed-application-bar",
      "compact-publication-and-narration",
      "publication-reader-viewport",
    ] as const),
    continuousPublicationScrollOwner: "publication-reader-viewport" as const,
    maximumContinuousPublicationScrollOwners: 1,
    nestedPublicationScrollOwners: "prohibited" as const,
    applicationBarContents: Object.freeze([
      "compact-voxleaf-identity",
      "open-or-replace-epub",
      "concise-compatibility-status",
      "settings",
      "close-epub-when-open",
    ] as const),
    passiveViewportEffect: "presentation-only" as const,
  }),
  settings: Object.freeze({
    availablePublicationStates: Object.freeze(["empty", "ready"] as const),
    sections: Object.freeze([
      Object.freeze({
        id: "reading" as const,
        controls: Object.freeze([
          "text-size",
          "line-spacing",
          "content-width",
        ] as const),
      }),
      Object.freeze({
        id: "appearance" as const,
        controls: Object.freeze(["theme"] as const),
      }),
      Object.freeze({
        id: "narration" as const,
        controls: Object.freeze([
          "language",
          "profile",
          "startup-mode",
          "prepared-target",
        ] as const),
      }),
      Object.freeze({
        id: "device-compatibility" as const,
        controls: Object.freeze([
          "selected-profile-result",
          "check-again",
          "measured-profile-reasons",
        ] as const),
      }),
      Object.freeze({
        id: "about" as const,
        controls: Object.freeze([
          "application-identity-and-version",
          "local-processing-and-privacy",
        ] as const),
      }),
    ]),
    playbackSpeedLocation: "compact-narration-bar-only" as const,
    volumePersistence: "session-only" as const,
    semantics: Object.freeze({
      role: "dialog" as const,
      modal: true,
      labelledTitle: true,
      visibleCloseAction: true,
      focusContainment: "required" as const,
      escapeCloses: true,
      focusReturn: "settings-trigger" as const,
      minimumPrimaryTargetCssPx: 44,
      nestedFocusTraps: "prohibited" as const,
    }),
    lifecycleNeutralOpenClose: true,
    forbiddenOpenCloseEffects: Object.freeze([
      "hardware-detection",
      "model-load-or-restart",
      "playback-stop",
      "generation-identity-change",
      "preference-mutation",
      "logical-locator-movement",
    ] as const),
    layouts: READER_SETTINGS_LAYOUTS_V1,
  }),
  compactNarration: Object.freeze({
    contents: Object.freeze([
      "play-pause-resume",
      "stop",
      "loaded-effective-listening-duration-text",
      "short-lifecycle-state",
      "startup-policy-context",
      "playback-speed",
      "volume",
      "detail-and-recovery-disclosure",
    ] as const),
    progressElement: "prohibited" as const,
    loadedDurationMeaning: "effective-listening-duration" as const,
    bookProgressMeaning: "none" as const,
  }),
  language: Object.freeze({
    selectable: Object.freeze(["en", "es"] as const),
    fallback: "en" as const,
    fallbackReasons: Object.freeze([
      "first-run-missing",
      "explicit-narration-reset",
      "malformed",
      "unsupported-version",
      "over-limit",
      "unavailable",
      "invalid-current-version",
    ] as const),
    validSavedPreference: "preserve" as const,
    automaticDetection: false,
    translation: false,
    automaticBookSwitching: false,
    profiles: Object.freeze({
      en: Object.freeze([
        PIPER_ENGLISH_CPU_PROFILE_ID,
        CHATTERBOX_BILINGUAL_PROFILE_ID,
        EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
      ] as const),
      es: Object.freeze([
        PIPER_CPU_FALLBACK_PROFILE_ID,
        CHATTERBOX_BILINGUAL_PROFILE_ID,
        EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
      ] as const),
    }),
    developmentProfileVisibility: Object.freeze({
      supportState: "development-only" as const,
      requiredGate: "explicit-native-development-gate" as const,
      visibleLabel: "Development" as const,
      ungatedPresentation: "not-selectable" as const,
    }),
  }),
  preferences: Object.freeze({
    maximumEnvelopeUtf8Bytes: 256,
    common: Object.freeze({
      versioned: true,
      bounded: true,
      contentFree: true,
      forwardVersion: "reject-and-default" as const,
      unavailableStorage: "safe-default-without-write" as const,
    }),
    language: Object.freeze({
      family: "narration-language-preference-v2" as const,
      schemaVersion: 2,
      fields: Object.freeze(["schemaVersion", "language"] as const),
      migrateV1ValidValues: "preserve" as const,
      default: "en" as const,
    }),
    narrationStart: Object.freeze({
      family: "narration-start-preference-v1" as const,
      schemaVersion: 1,
      fields: Object.freeze([
        "schemaVersion",
        "mode",
        "preparedTargetMs",
      ] as const),
      modes: Object.freeze(["quick", "prepared"] as const),
      defaultMode: "quick" as const,
      preparedTargetMs: Object.freeze([
        60_000, 120_000, 300_000, 600_000,
      ] as const),
      defaultPreparedTargetMs: 60_000,
    }),
    playback: Object.freeze({
      family: "narration-playback-preference-v1" as const,
      schemaVersion: 1,
      fields: Object.freeze(["schemaVersion", "playbackRatePercent"] as const),
      supportedRatePercent: Object.freeze(
        NARRATION_PLAYBACK_RATES_V1.map((rate) => rate.percent),
      ),
      defaultRatePercent: 100 as const,
    }),
    prohibitedFields: Object.freeze([
      "epub-path",
      "book-identity",
      "book-text",
      "locator-prose",
      "generated-audio",
      "model-path",
      "raw-host-report",
      "failure-detail",
    ] as const),
  }),
  playback: Object.freeze({
    applicationBoundary: "after-synthesis-in-memory-playback" as const,
    pitchPreservation: "required" as const,
    directAudioBufferSourcePlaybackRate: "negative-control-only" as const,
    rateChangeIdentityEffect: "none" as const,
    sourceProgressAuthority: "consumed-source-sample-frames" as const,
    rateChangeOrder: Object.freeze([
      "settle-source-frames-at-old-rate",
      "publish-due-bounded-progress",
      "apply-new-rate-to-remaining-source-frames",
      "preserve-work-and-source-range-identity",
      "continue-without-replay-or-skip",
    ] as const),
    sourceMediaDurationFormula: "floor(sourceFrames*1000/24000)" as const,
    effectiveListeningDurationFormula:
      "floor(sourceFrames*1000*100/(24000*ratePercent))" as const,
    sourceMediaResourceAuthority: true,
    effectiveListeningThresholdAuthority: true,
    transitionPauseClock: "interruptible-wall-clock-unchanged" as const,
    rates: NARRATION_PLAYBACK_RATES_V1,
  }),
  backendComparison: Object.freeze({
    candidates: Object.freeze([
      Object.freeze({
        id: "repository-audio-worklet-wsola-v1" as const,
        eligible: true,
        runtimeDependency: "none" as const,
        activeAudioCopyLimit: "one-service-unit" as const,
      }),
      Object.freeze({
        id: "html-media-element-preserves-pitch-wav-v1" as const,
        eligible: true,
        runtimeDependency: "none" as const,
        activeAudioCopyLimit: "one-service-unit-plus-one-wav-copy" as const,
      }),
      Object.freeze({
        id: "audio-buffer-source-playback-rate-negative-control-v1" as const,
        eligible: false,
        runtimeDependency: "none" as const,
        rejection: "changes-pitch" as const,
      }),
    ]),
    syntheticInput: Object.freeze({
      sampleRateHz: 24_000,
      channelCount: 1,
      sampleFormat: "float32" as const,
      toneFrequenciesHz: Object.freeze([220, 440, 880] as const),
      toneDurationMs: 8_000,
      impulseSpacingMs: 250,
    }),
    speechInput: Object.freeze({
      corpusPath: "benchmarks/tts/corpus-v7.json" as const,
      caseIds: Object.freeze([
        "es-v7-arrival",
        "es-v7-dialogue",
        "en-v7-arrival",
        "en-v7-dialogue",
      ] as const),
      generatedAudioPersistence: "prohibited" as const,
    }),
    criticalRatePercent: Object.freeze([75, 60, 50] as const),
    machineGates: Object.freeze({
      maximumPitchDeviationCents: 20,
      maximumRenderedDurationErrorMs: 50,
      maximumSourceFrameDrift: 0,
      maximumBackendStartP95Ms: 250,
      maximumRateChangeSettlementP95Ms: 250,
      maximumPauseStopTeardownP95Ms: 250,
      maximumAdditionalWorkBytes: 7_680_000,
      maximumAdditionalProcessRamMiB: 128,
      maximumCpuIncreasePercentagePoints: 20,
      maximumActiveTimeStretchers: 1,
      maximumExternalRequests: 0,
      maximumPersistedGeneratedAudioBytes: 0,
    }),
    listeningGates: Object.freeze({
      evaluatorPolicy: "one-fluent-maintainer-per-language" as const,
      rates: Object.freeze([100, 75, 60, 50] as const),
      minimumIntelligibilityScore: 4,
      minimumNaturalnessScore: 3,
      minimumArtifactScore: 3,
      scoreMaximum: 5,
      omittedOrRepeatedWordsAllowed: 0,
    }),
    requiredHosts: Object.freeze([
      "production-chromium",
      "packaged-windows-webview2",
    ] as const),
    dependencyAdmission: Object.freeze({
      unlistedProductionDependency: "requires-new-authority" as const,
      licenseAmbiguity: "stop" as const,
      widerNativeCapability: "prohibited" as const,
    }),
    noPassingCandidate: "retain-1.00x-only" as const,
  }),
  privacyAndBounds: Object.freeze({
    maximumSourceSampleFrames:
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumSampleFrames,
    maximumLogicalPcmBytes:
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumPayloadBytes,
    maximumCompleteUnits:
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumCompleteUnits,
    maximumMetadataEntries:
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumMetadataEntries,
    maximumActiveServiceTrees: 1,
    generatedAudioPersistence: "prohibited" as const,
    narrationTextInReactState: "prohibited" as const,
    freeFormDiagnostics: "prohibited" as const,
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
  }),
});

export function isNarrationPlaybackRatePercentV1(
  value: unknown,
): value is NarrationPlaybackRatePercentV1 {
  return (
    typeof value === "number" &&
    NARRATION_PLAYBACK_RATES_V1.some((rate) => rate.percent === value)
  );
}

export function narrationPlaybackRateForPercentV1(
  value: unknown,
): NarrationPlaybackRateAuthorityV1 {
  const rate = NARRATION_PLAYBACK_RATES_V1.find(
    (candidate) => candidate.percent === value,
  );
  if (rate === undefined) {
    throw new RangeError("Unsupported narration playback rate.");
  }
  return rate;
}

export function readerSettingsLayoutForViewportWidthV1(
  viewportWidthCssPx: number,
): ReaderSettingsLayoutAuthorityV1 {
  if (!Number.isSafeInteger(viewportWidthCssPx) || viewportWidthCssPx <= 0) {
    throw new RangeError("Invalid reader-settings viewport width.");
  }
  if (viewportWidthCssPx >= WIDE_LAYOUT.minimumViewportWidthCssPx) {
    return WIDE_LAYOUT;
  }
  if (viewportWidthCssPx >= COMPACT_LAYOUT.minimumViewportWidthCssPx) {
    return COMPACT_LAYOUT;
  }
  return NARROW_LAYOUT;
}

function assertBoundedSourceSampleFrames(sampleFrames: number): void {
  if (
    !Number.isSafeInteger(sampleFrames) ||
    sampleFrames < 0 ||
    sampleFrames > ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumSampleFrames
  ) {
    throw new RangeError("Invalid bounded source sample-frame count.");
  }
}

export function sourceMediaMillisecondsFromSampleFramesV1(
  sampleFrames: number,
): number {
  assertBoundedSourceSampleFrames(sampleFrames);
  return playableMillisecondsFromSampleFrames(sampleFrames);
}

export function effectiveListeningMillisecondsFromSampleFramesV1(
  sampleFrames: number,
  playbackRatePercent: NarrationPlaybackRatePercentV1,
): number {
  assertBoundedSourceSampleFrames(sampleFrames);
  const rate = narrationPlaybackRateForPercentV1(playbackRatePercent);
  const sampleRateHz = ADAPTIVE_BUFFER_AUTHORITY_V1.audioFormat.sampleRateHz;
  return Math.floor(
    (sampleFrames * 1_000 * rate.denominator) / (sampleRateHz * rate.numerator),
  );
}

export function minimumSourceSampleFramesForEffectiveListeningMillisecondsV1(
  effectiveListeningMilliseconds: number,
  playbackRatePercent: NarrationPlaybackRatePercentV1,
): number {
  const rate = narrationPlaybackRateForPercentV1(playbackRatePercent);
  const maximumEffectiveListeningMilliseconds =
    effectiveListeningMillisecondsFromSampleFramesV1(
      ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumSampleFrames,
      playbackRatePercent,
    );
  if (
    !Number.isSafeInteger(effectiveListeningMilliseconds) ||
    effectiveListeningMilliseconds <= 0 ||
    effectiveListeningMilliseconds > maximumEffectiveListeningMilliseconds
  ) {
    throw new RangeError("Invalid effective listening duration.");
  }
  const sampleRateHz = ADAPTIVE_BUFFER_AUTHORITY_V1.audioFormat.sampleRateHz;
  return Math.ceil(
    (effectiveListeningMilliseconds * sampleRateHz * rate.numerator) /
      (1_000 * rate.denominator),
  );
}
