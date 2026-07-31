// @vitest-environment node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "./adaptive-buffer-authority";
import { READER_SETTINGS_PLAYBACK_AUTHORITY_V1 } from "./reader-settings-playback-authority";
import { READER_SETTINGS_PLAYBACK_AUTHORITY_V2 } from "./reader-settings-playback-authority-v2";
import {
  activateNarrationPlaybackRateAtBoundaryV3,
  effectiveListeningMillisecondsFromSampleFramesV3,
  initialNarrationPlaybackRateStateV3,
  isNarrationPlaybackRatePercentV3,
  minimumSourceSampleFramesForEffectiveListeningMillisecondsV3,
  narrationPlaybackRateForPercentV3,
  NARRATION_PLAYBACK_RATES_V3,
  READER_SETTINGS_PLAYBACK_AUTHORITY_V3,
  selectNarrationPlaybackRateV3,
  sourceMediaMillisecondsFromSampleFramesV3,
  type NarrationPlaybackRatePercentV3,
} from "./reader-settings-playback-authority-v3";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../../../..");

const RATE_EXPECTATIONS: ReadonlyArray<
  readonly [
    percent: NarrationPlaybackRatePercentV3,
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
];

describe("reader settings and playback authority v3", () => {
  it("freezes the six existing exact rates and arithmetic", () => {
    expect(NARRATION_PLAYBACK_RATES_V3.map((rate) => rate.percent)).toEqual([
      100, 95, 90, 85, 80, 75,
    ]);
    expect(NARRATION_PLAYBACK_RATES_V3).not.toBe(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V2.playback.rates,
    );

    for (const [
      percent,
      label,
      quickStartSourceFrames,
      maximumEffectiveListeningMs,
    ] of RATE_EXPECTATIONS) {
      expect(isNarrationPlaybackRatePercentV3(percent)).toBe(true);
      expect(narrationPlaybackRateForPercentV3(percent)).toEqual({
        percent,
        label,
        numerator: percent,
        denominator: 100,
      });
      expect(
        minimumSourceSampleFramesForEffectiveListeningMillisecondsV3(
          15_000,
          percent,
        ),
      ).toBe(quickStartSourceFrames);
      expect(
        effectiveListeningMillisecondsFromSampleFramesV3(
          ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumSampleFrames,
          percent,
        ),
      ).toBe(maximumEffectiveListeningMs);
    }

    for (const invalid of [undefined, null, "95", 50, 74, 75.5, 105]) {
      expect(isNarrationPlaybackRatePercentV3(invalid)).toBe(false);
      expect(() => narrationPlaybackRateForPercentV3(invalid)).toThrow(
        RangeError,
      );
    }
    expect(sourceMediaMillisecondsFromSampleFramesV3(43_200_000)).toBe(
      1_800_000,
    );
  });

  it("keeps the active unit immutable and applies only the latest pending value", () => {
    const initial = initialNarrationPlaybackRateStateV3();
    const selected85 = selectNarrationPlaybackRateV3(initial, 85);
    const firstActive = activateNarrationPlaybackRateAtBoundaryV3(
      selected85,
      "initial-unit-start",
    );
    const selected80 = selectNarrationPlaybackRateV3(firstActive, 80);
    const selected75 = selectNarrationPlaybackRateV3(selected80, 75);

    expect(selected75).toEqual({
      selectedRatePercent: 75,
      activeRatePercent: 85,
      pendingRatePercent: 75,
    });

    const successor = activateNarrationPlaybackRateAtBoundaryV3(
      selected75,
      "after-complete-unit-ended-before-successor-start",
    );
    expect(successor).toEqual({
      selectedRatePercent: 75,
      activeRatePercent: 75,
      pendingRatePercent: null,
    });
  });

  it("rejects mid-unit activation and impossible boundary order", () => {
    const state = activateNarrationPlaybackRateAtBoundaryV3(
      selectNarrationPlaybackRateV3(initialNarrationPlaybackRateStateV3(), 90),
      "initial-unit-start",
    );
    const pending = selectNarrationPlaybackRateV3(state, 80);

    expect(() =>
      activateNarrationPlaybackRateAtBoundaryV3(pending, "mid-unit"),
    ).toThrow(RangeError);
    expect(() =>
      activateNarrationPlaybackRateAtBoundaryV3(pending, "initial-unit-start"),
    ).toThrow(RangeError);
    expect(pending.activeRatePercent).toBe(90);
  });

  it("cancels a pending change when the latest selection returns to the active rate", () => {
    const active = activateNarrationPlaybackRateAtBoundaryV3(
      initialNarrationPlaybackRateStateV3(),
      "initial-unit-start",
    );
    const pending = selectNarrationPlaybackRateV3(active, 75);
    const restored = selectNarrationPlaybackRateV3(pending, 100);

    expect(restored).toEqual({
      selectedRatePercent: 100,
      activeRatePercent: 100,
      pendingRatePercent: null,
    });
  });

  it("freezes exactly media and repository WSOLA while excluding Signalsmith", () => {
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.candidates.map(
        (candidate) => candidate.id,
      ),
    ).toEqual([
      "html-media-element-preserves-pitch-wav-boundary-v3",
      "repository-incremental-audio-worklet-wsola-boundary-v3",
    ]);
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V3.exclusions).toEqual([
      {
        id: "signalsmith-stretch-web-audio-wasm-worklet-1-3-2",
        reason:
          "pre-trial-initialization-failure-reproduced-outside-sandbox-and-not-diagnosed-before-authority-checkpoint",
        eligible: false,
      },
    ]);
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.candidates[1].sourceIdentity,
    ).toMatchObject({
      version: 3,
      implementationCommit:
        "must-be-a-strict-descendant-of-the-v3-authority-commit",
    });
  });

  it("makes a speed-only selection lifecycle-neutral", () => {
    expect(
      Object.values(
        READER_SETTINGS_PLAYBACK_AUTHORITY_V3.lifecycleAndBounds
          .speedSelectionEffects,
      ),
    ).toSatisfy((values: boolean[]) => values.every((value) => !value));
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.lifecycleAndBounds
        .duplicateTransformedAudioFifosAllowed,
    ).toBe(0);
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.playback.sourceProgressAuthority,
    ).toBe("consumed-source-sample-frames");
  });

  it("freezes first activation separately from the smaller recurring handoff", () => {
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.machineGates,
    ).toMatchObject({
      maximumFirstNonDefaultActivationP95Ms: 1_000,
      maximumRecurringUnitHandoffP95Ms: 250,
      maximumAdditionalProcessRamMiB: 200,
      maximumMidUnitActivationEvents: 0,
      maximumRecurringHandoffsUsingFirstActivationAllowance: 0,
    });
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.machineGates
        .maximumRecurringUnitHandoffP95Ms,
    ).toBeLessThan(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.machineGates
        .maximumFirstNonDefaultActivationP95Ms,
    );
  });

  it("requires zero material time-stretch ownership after returning to 1.00x", () => {
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.lifecycleAndBounds
        .defaultRateOwnership,
    ).toEqual({
      maximumActiveTimeStretchers: 0,
      maximumActiveObjectUrls: 0,
      maximumTransformedAudioCopies: 0,
      maximumTimeStretchWorkQueues: 0,
      maximumAdditionalTimeStretchWorkBytes: 0,
      releasePoint:
        "after-the-preceding-non-default-unit-and-its-handoff-settle",
    });
  });

  it("freezes fee-free source, CSP, distribution, and strict lineage rules", () => {
    const config = JSON.parse(
      readFileSync(
        resolve(REPOSITORY_ROOT, "apps/desktop/src-tauri/tauri.conf.json"),
        "utf8",
      ),
    ) as { app: { security: { csp: string } } };
    const authority =
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.contentSecurityPolicy;

    expect(config.app.security.csp).toBe(authority.current);
    expect(config.app.security.csp).not.toContain("media-src");
    expect(authority.mediaCandidateDelta).toBe("media-src 'self' blob:");
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V3.licensePolicy).toMatchObject({
      admittedSources: [
        "host-platform-api",
        "repository-owned-under-root-license",
      ],
      admittedSpdxLicenses: ["MIT"],
      distributionReviewOwner: "M011",
    });
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.resultLineage,
    ).toEqual({
      authorityCommitRequired: true,
      executionCommitMustBeStrictDescendant: true,
      resultArtifactBeforeAuthorityCommit: "prohibited",
      implementationBeforeAuthorityCommit: "prohibited",
      gateTuningAfterResults: "prohibited",
    });
  });

  it("retains source bounds, privacy, listening, and invalidation authority", () => {
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.lifecycleAndBounds,
    ).toMatchObject({
      maximumActiveTimeStretchers: 1,
      maximumActiveServiceTrees: 1,
      maximumSourceSampleFrames: 43_200_000,
      maximumLogicalPcmBytes: 172_800_000,
      maximumCompleteUnits: 256,
      maximumMetadataEntries: 256,
      maximumExternalRequests: 0,
      maximumPersistedGeneratedAudioBytes: 0,
    });
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.listeningGates,
    ).toMatchObject({
      evaluatorPolicy: "one-fluent-maintainer-per-language",
      rates: [100, 85, 75],
      minimumIntelligibilityScore: 4,
      minimumNaturalnessScore: 3,
      minimumArtifactScore: 3,
      omittedOrRepeatedWordsAllowed: 0,
    });
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.lifecycleAndBounds
        .invalidationActions,
    ).toContain("session-replacement");
  });

  it("changes no runtime and rejects post-authority mutation", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V3.currentRuntime).toEqual({
      productionPlaybackRatePercent: 100,
      speedSelectorAvailable: false,
      dependencyChange: false,
      cspChange: false,
      candidateImplementation: false,
    });
    expect(
      Object.values(READER_SETTINGS_PLAYBACK_AUTHORITY_V3.boundaries),
    ).toSatisfy((values: boolean[]) => values.every((value) => !value));

    expect(
      Reflect.set(
        READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.machineGates,
        "maximumFirstNonDefaultActivationP95Ms",
        999,
      ),
    ).toBe(false);
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.machineGates
        .maximumFirstNonDefaultActivationP95Ms,
    ).toBe(1_000);
    expect(Object.isFrozen(READER_SETTINGS_PLAYBACK_AUTHORITY_V1)).toBe(true);
    expect(Object.isFrozen(READER_SETTINGS_PLAYBACK_AUTHORITY_V2)).toBe(true);
    expect(Object.isFrozen(READER_SETTINGS_PLAYBACK_AUTHORITY_V3)).toBe(true);
    expect(Object.isFrozen(NARRATION_PLAYBACK_RATES_V3)).toBe(true);
  });
});
