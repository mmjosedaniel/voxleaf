import { describe, expect, it } from "vitest";

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
import { DEFAULT_NARRATION_LANGUAGE_V1 } from "./narration-language";
import {
  effectiveListeningMillisecondsFromSampleFramesV1,
  isNarrationPlaybackRatePercentV1,
  minimumSourceSampleFramesForEffectiveListeningMillisecondsV1,
  narrationPlaybackRateForPercentV1,
  NARRATION_PLAYBACK_RATES_V1,
  readerSettingsLayoutForViewportWidthV1,
  READER_SETTINGS_LAYOUTS_V1,
  READER_SETTINGS_PLAYBACK_AUTHORITY_V1,
  sourceMediaMillisecondsFromSampleFramesV1,
  type NarrationPlaybackRatePercentV1,
} from "./reader-settings-playback-authority";

const RATE_EXPECTATIONS: ReadonlyArray<
  readonly [
    percent: NarrationPlaybackRatePercentV1,
    label: string,
    quickStartSourceFrames: number,
    maximumEffectiveListeningMs: number,
  ]
> = [
  [100, "1.00x", 360_000, 1_800_000],
  [95, "0.95x", 342_000, 1_894_736],
  [90, "0.90x", 324_000, 2_000_000],
  [85, "0.85x", 306_000, 2_117_647],
  [80, "0.80x", 288_000, 2_250_000],
  [75, "0.75x", 270_000, 2_400_000],
  [70, "0.70x", 252_000, 2_571_428],
  [65, "0.65x", 234_000, 2_769_230],
  [60, "0.60x", 216_000, 3_000_000],
  [55, "0.55x", 198_000, 3_272_727],
  [50, "0.50x", 180_000, 3_600_000],
];

describe("reader settings and playback authority v1", () => {
  it("freezes the reader-first shell and exact settings contract", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V1.shell).toEqual({
      readyRegions: [
        "fixed-application-bar",
        "compact-publication-and-narration",
        "publication-reader-viewport",
      ],
      continuousPublicationScrollOwner: "publication-reader-viewport",
      maximumContinuousPublicationScrollOwners: 1,
      nestedPublicationScrollOwners: "prohibited",
      applicationBarContents: [
        "compact-voxleaf-identity",
        "open-or-replace-epub",
        "concise-compatibility-status",
        "settings",
        "close-epub-when-open",
      ],
      passiveViewportEffect: "presentation-only",
    });
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V1.settings.sections).toEqual([
      {
        id: "reading",
        controls: ["text-size", "line-spacing", "content-width"],
      },
      { id: "appearance", controls: ["theme"] },
      {
        id: "narration",
        controls: ["language", "profile", "startup-mode", "prepared-target"],
      },
      {
        id: "device-compatibility",
        controls: [
          "selected-profile-result",
          "check-again",
          "measured-profile-reasons",
        ],
      },
      {
        id: "about",
        controls: [
          "application-identity-and-version",
          "local-processing-and-privacy",
        ],
      },
    ]);
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V1.settings.semantics).toEqual({
      role: "dialog",
      modal: true,
      labelledTitle: true,
      visibleCloseAction: true,
      focusContainment: "required",
      escapeCloses: true,
      focusReturn: "settings-trigger",
      minimumPrimaryTargetCssPx: 44,
      nestedFocusTraps: "prohibited",
    });
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.settings.lifecycleNeutralOpenClose,
    ).toBe(true);
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.settings.forbiddenOpenCloseEffects,
    ).toEqual([
      "hardware-detection",
      "model-load-or-restart",
      "playback-stop",
      "generation-identity-change",
      "preference-mutation",
      "logical-locator-movement",
    ]);
    expect(Object.isFrozen(READER_SETTINGS_PLAYBACK_AUTHORITY_V1)).toBe(true);
    expect(
      Object.isFrozen(READER_SETTINGS_PLAYBACK_AUTHORITY_V1.settings.sections),
    ).toBe(true);
  });

  it("freezes the compact narration bar without a progress bar or duplicate speed control", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V1.compactNarration).toEqual({
      contents: [
        "play-pause-resume",
        "stop",
        "loaded-effective-listening-duration-text",
        "short-lifecycle-state",
        "startup-policy-context",
        "playback-speed",
        "volume",
        "detail-and-recovery-disclosure",
      ],
      progressElement: "prohibited",
      loadedDurationMeaning: "effective-listening-duration",
      bookProgressMeaning: "none",
    });
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.settings.playbackSpeedLocation,
    ).toBe("compact-narration-bar-only");
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.settings.volumePersistence,
    ).toBe("session-only");
  });

  it("selects one exact responsive layout at every boundary", () => {
    expect(READER_SETTINGS_LAYOUTS_V1).toEqual([
      {
        band: "narrow",
        minimumViewportWidthCssPx: 0,
        settingsPresentation: "full-width-sheet",
        settingsWidthCssPx: "viewport",
        contentsPresentation: "overlay",
        contentsWidthCssPx: null,
      },
      {
        band: "compact",
        minimumViewportWidthCssPx: 800,
        settingsPresentation: "right-drawer",
        settingsWidthCssPx: 360,
        contentsPresentation: "overlay",
        contentsWidthCssPx: null,
      },
      {
        band: "wide",
        minimumViewportWidthCssPx: 1_200,
        settingsPresentation: "right-drawer",
        settingsWidthCssPx: 400,
        contentsPresentation: "persistent-optional",
        contentsWidthCssPx: 260,
      },
    ]);
    expect(readerSettingsLayoutForViewportWidthV1(1)).toBe(
      READER_SETTINGS_LAYOUTS_V1[0],
    );
    expect(readerSettingsLayoutForViewportWidthV1(799).band).toBe("narrow");
    expect(readerSettingsLayoutForViewportWidthV1(800).band).toBe("compact");
    expect(readerSettingsLayoutForViewportWidthV1(1_199).band).toBe("compact");
    expect(readerSettingsLayoutForViewportWidthV1(1_200).band).toBe("wide");
    for (const invalid of [
      -1,
      0,
      800.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      expect(() => readerSettingsLayoutForViewportWidthV1(invalid)).toThrow(
        RangeError,
      );
    }
  });

  it("freezes English fallback while preserving every valid saved language", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V1.language).toEqual({
      selectable: ["en", "es"],
      fallback: "en",
      fallbackReasons: [
        "first-run-missing",
        "explicit-narration-reset",
        "malformed",
        "unsupported-version",
        "over-limit",
        "unavailable",
        "invalid-current-version",
      ],
      validSavedPreference: "preserve",
      automaticDetection: false,
      translation: false,
      automaticBookSwitching: false,
      profiles: {
        en: [
          PIPER_ENGLISH_CPU_PROFILE_ID,
          CHATTERBOX_BILINGUAL_PROFILE_ID,
          EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
        ],
        es: [
          PIPER_CPU_FALLBACK_PROFILE_ID,
          CHATTERBOX_BILINGUAL_PROFILE_ID,
          EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
        ],
      },
      developmentProfileVisibility: {
        supportState: "development-only",
        requiredGate: "explicit-native-development-gate",
        visibleLabel: "Development",
        ungatedPresentation: "not-selectable",
      },
    });
    expect(DEFAULT_NARRATION_LANGUAGE_V1).toBe("es");
  });

  it("freezes separate bounded content-free preference families", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V1.preferences).toEqual({
      maximumEnvelopeUtf8Bytes: 256,
      common: {
        versioned: true,
        bounded: true,
        contentFree: true,
        forwardVersion: "reject-and-default",
        unavailableStorage: "safe-default-without-write",
      },
      language: {
        family: "narration-language-preference-v2",
        schemaVersion: 2,
        fields: ["schemaVersion", "language"],
        migrateV1ValidValues: "preserve",
        default: "en",
      },
      narrationStart: {
        family: "narration-start-preference-v1",
        schemaVersion: 1,
        fields: ["schemaVersion", "mode", "preparedTargetMs"],
        modes: ["quick", "prepared"],
        defaultMode: "quick",
        preparedTargetMs: [60_000, 120_000, 300_000, 600_000],
        defaultPreparedTargetMs: 60_000,
      },
      playback: {
        family: "narration-playback-preference-v1",
        schemaVersion: 1,
        fields: ["schemaVersion", "playbackRatePercent"],
        supportedRatePercent: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50],
        defaultRatePercent: 100,
      },
      prohibitedFields: [
        "epub-path",
        "book-identity",
        "book-text",
        "locator-prose",
        "generated-audio",
        "model-path",
        "raw-host-report",
        "failure-detail",
      ],
    });
  });

  it("uses an exact closed playback-rate table", () => {
    expect(NARRATION_PLAYBACK_RATES_V1).toHaveLength(RATE_EXPECTATIONS.length);
    for (const [percent, label] of RATE_EXPECTATIONS) {
      expect(isNarrationPlaybackRatePercentV1(percent)).toBe(true);
      expect(narrationPlaybackRateForPercentV1(percent)).toEqual({
        percent,
        label,
        numerator: percent,
        denominator: 100,
      });
      expect(Object.isFrozen(narrationPlaybackRateForPercentV1(percent))).toBe(
        true,
      );
    }
    for (const invalid of [
      undefined,
      null,
      "95",
      0,
      45,
      95.5,
      105,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      expect(isNarrationPlaybackRatePercentV1(invalid)).toBe(false);
      expect(() => narrationPlaybackRateForPercentV1(invalid)).toThrow(
        RangeError,
      );
    }
  });

  it.each(RATE_EXPECTATIONS)(
    "uses exact source/effective arithmetic at %s percent",
    (percent, _label, quickStartSourceFrames, maximumEffectiveListeningMs) => {
      expect(
        minimumSourceSampleFramesForEffectiveListeningMillisecondsV1(
          15_000,
          percent,
        ),
      ).toBe(quickStartSourceFrames);
      expect(
        effectiveListeningMillisecondsFromSampleFramesV1(
          quickStartSourceFrames - 1,
          percent,
        ),
      ).toBe(14_999);
      expect(
        effectiveListeningMillisecondsFromSampleFramesV1(
          quickStartSourceFrames,
          percent,
        ),
      ).toBe(15_000);
      expect(
        effectiveListeningMillisecondsFromSampleFramesV1(
          ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumSampleFrames,
          percent,
        ),
      ).toBe(maximumEffectiveListeningMs);
    },
  );

  it("keeps source media duration and memory authority unchanged", () => {
    expect(sourceMediaMillisecondsFromSampleFramesV1(43_200_000)).toBe(
      1_800_000,
    );
    expect(sourceMediaMillisecondsFromSampleFramesV1(43_199_999)).toBe(
      playableMillisecondsFromSampleFrames(43_199_999),
    );
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.privacyAndBounds,
    ).toMatchObject({
      maximumSourceSampleFrames: 43_200_000,
      maximumLogicalPcmBytes: 172_800_000,
      maximumCompleteUnits: 256,
      maximumMetadataEntries: 256,
      maximumActiveServiceTrees: 1,
      generatedAudioPersistence: "prohibited",
    });
    for (const invalid of [
      -1,
      0.5,
      43_200_001,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      expect(() => sourceMediaMillisecondsFromSampleFramesV1(invalid)).toThrow(
        RangeError,
      );
    }
    expect(() =>
      minimumSourceSampleFramesForEffectiveListeningMillisecondsV1(0, 100),
    ).toThrow(RangeError);
    expect(() =>
      minimumSourceSampleFramesForEffectiveListeningMillisecondsV1(
        1_800_001,
        100,
      ),
    ).toThrow(RangeError);
  });

  it("freezes old-rate settlement and unchanged wall-clock transitions", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V1.playback).toMatchObject({
      applicationBoundary: "after-synthesis-in-memory-playback",
      pitchPreservation: "required",
      directAudioBufferSourcePlaybackRate: "negative-control-only",
      rateChangeIdentityEffect: "none",
      sourceProgressAuthority: "consumed-source-sample-frames",
      rateChangeOrder: [
        "settle-source-frames-at-old-rate",
        "publish-due-bounded-progress",
        "apply-new-rate-to-remaining-source-frames",
        "preserve-work-and-source-range-identity",
        "continue-without-replay-or-skip",
      ],
      sourceMediaResourceAuthority: true,
      effectiveListeningThresholdAuthority: true,
      transitionPauseClock: "interruptible-wall-clock-unchanged",
    });
    expect(ADAPTIVE_BUFFER_AUTHORITY_V1.playback).toEqual({
      minimumVolumePercent: 0,
      maximumVolumePercent: 100,
      defaultVolumePercent: 100,
      volumeStepPercent: 5,
      supportedPlaybackRates: [1],
      defaultPlaybackRate: 1,
    });
  });

  it("freezes eligible backend inputs and result-blind gates", () => {
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison,
    ).toMatchObject({
      candidates: [
        {
          id: "repository-audio-worklet-wsola-v1",
          eligible: true,
          runtimeDependency: "none",
          activeAudioCopyLimit: "one-service-unit",
        },
        {
          id: "html-media-element-preserves-pitch-wav-v1",
          eligible: true,
          runtimeDependency: "none",
          activeAudioCopyLimit: "one-service-unit-plus-one-wav-copy",
        },
        {
          id: "audio-buffer-source-playback-rate-negative-control-v1",
          eligible: false,
          runtimeDependency: "none",
          rejection: "changes-pitch",
        },
      ],
      syntheticInput: {
        sampleRateHz: 24_000,
        channelCount: 1,
        sampleFormat: "float32",
        toneFrequenciesHz: [220, 440, 880],
        toneDurationMs: 8_000,
        impulseSpacingMs: 250,
      },
      speechInput: {
        corpusPath: "benchmarks/tts/corpus-v7.json",
        caseIds: [
          "es-v7-arrival",
          "es-v7-dialogue",
          "en-v7-arrival",
          "en-v7-dialogue",
        ],
        generatedAudioPersistence: "prohibited",
      },
      criticalRatePercent: [75, 60, 50],
      machineGates: {
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
      },
      listeningGates: {
        evaluatorPolicy: "one-fluent-maintainer-per-language",
        rates: [100, 75, 60, 50],
        minimumIntelligibilityScore: 4,
        minimumNaturalnessScore: 3,
        minimumArtifactScore: 3,
        scoreMaximum: 5,
        omittedOrRepeatedWordsAllowed: 0,
      },
      requiredHosts: ["production-chromium", "packaged-windows-webview2"],
      dependencyAdmission: {
        unlistedProductionDependency: "requires-new-authority",
        licenseAmbiguity: "stop",
        widerNativeCapability: "prohibited",
      },
      noPassingCandidate: "retain-1.00x-only",
    });
  });

  it("freezes every out-of-scope boundary as unchanged", () => {
    expect(
      Object.values(READER_SETTINGS_PLAYBACK_AUTHORITY_V1.boundaries),
    ).toSatisfy((values: boolean[]) => values.every((value) => !value));
  });
});
