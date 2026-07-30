// @vitest-environment node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "./adaptive-buffer-authority";
import {
  NARRATION_PLAYBACK_RATES_V1,
  READER_SETTINGS_PLAYBACK_AUTHORITY_V1,
} from "./reader-settings-playback-authority";
import {
  effectiveListeningMillisecondsFromSampleFramesV2,
  isNarrationPlaybackRatePercentV2,
  minimumSourceSampleFramesForEffectiveListeningMillisecondsV2,
  narrationPlaybackRateForPercentV2,
  NARRATION_PLAYBACK_RATES_V2,
  READER_SETTINGS_PLAYBACK_AUTHORITY_V2,
  SIGNALSMITH_STRETCH_PACKAGE_V2,
  sourceMediaMillisecondsFromSampleFramesV2,
  type NarrationPlaybackRatePercentV2,
} from "./reader-settings-playback-authority-v2";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../../../..");

const RATE_EXPECTATIONS: ReadonlyArray<
  readonly [
    percent: NarrationPlaybackRatePercentV2,
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

describe("reader settings and playback authority v2", () => {
  it("freezes exactly the reduced six-rate set and rejects every other value", () => {
    expect(NARRATION_PLAYBACK_RATES_V2).toHaveLength(6);
    expect(NARRATION_PLAYBACK_RATES_V2.map((rate) => rate.percent)).toEqual([
      100, 95, 90, 85, 80, 75,
    ]);
    expect(NARRATION_PLAYBACK_RATES_V1).toHaveLength(11);

    for (const [percent, label] of RATE_EXPECTATIONS) {
      expect(isNarrationPlaybackRatePercentV2(percent)).toBe(true);
      expect(narrationPlaybackRateForPercentV2(percent)).toEqual({
        percent,
        label,
        numerator: percent,
        denominator: 100,
      });
      expect(Object.isFrozen(narrationPlaybackRateForPercentV2(percent))).toBe(
        true,
      );
    }

    for (const invalid of [
      undefined,
      null,
      "95",
      0,
      50,
      70,
      74,
      75.5,
      105,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      expect(isNarrationPlaybackRatePercentV2(invalid)).toBe(false);
      expect(() => narrationPlaybackRateForPercentV2(invalid)).toThrow(
        RangeError,
      );
    }
  });

  it.each(RATE_EXPECTATIONS)(
    "retains exact source/effective arithmetic at %s percent",
    (percent, _label, quickStartSourceFrames, maximumEffectiveListeningMs) => {
      expect(
        minimumSourceSampleFramesForEffectiveListeningMillisecondsV2(
          15_000,
          percent,
        ),
      ).toBe(quickStartSourceFrames);
      expect(
        effectiveListeningMillisecondsFromSampleFramesV2(
          quickStartSourceFrames - 1,
          percent,
        ),
      ).toBe(14_999);
      expect(
        effectiveListeningMillisecondsFromSampleFramesV2(
          quickStartSourceFrames,
          percent,
        ),
      ).toBe(15_000);
      expect(
        effectiveListeningMillisecondsFromSampleFramesV2(
          ADAPTIVE_BUFFER_AUTHORITY_V1.audioLimits.maximumSampleFrames,
          percent,
        ),
      ).toBe(maximumEffectiveListeningMs);
    },
  );

  it("freezes only the three exact fee-free v2 candidates", () => {
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V2.candidates.map(
        (candidate) => candidate.id,
      ),
    ).toEqual([
      "html-media-element-preserves-pitch-wav-v2",
      "signalsmith-stretch-web-audio-wasm-worklet-1-3-2",
      "repository-incremental-audio-worklet-wsola-v2",
    ]);
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V2.candidates[0]).toMatchObject({
      sourceIdentity: {
        kind: "host-platform-api",
        APIs: [
          "HTMLMediaElement.playbackRate",
          "HTMLMediaElement.preservesPitch",
          "URL.createObjectURL",
          "URL.revokeObjectURL",
        ],
      },
      runtimeDependency: "none",
      activeAudioCopyLimit: "one-service-unit-plus-one-wav-copy",
      candidateSpecificCspDirective: "media-src 'self' blob:",
      eligible: true,
    });
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V2.candidates[2]).toMatchObject({
      sourceIdentity: {
        kind: "repository-owned-new-source",
        version: 2,
        implementationCommit:
          "must-be-a-strict-descendant-of-the-v2-authority-commit",
        prohibitedReuseOrRelabel: "repository-audio-worklet-wsola-v1",
      },
      runtimeDependency: "none",
      activeAudioCopyLimit: "one-service-unit",
      eligible: true,
    });
  });

  it("pins Signalsmith metadata while requiring the full pre-install audit", () => {
    expect(SIGNALSMITH_STRETCH_PACKAGE_V2).toEqual({
      name: "signalsmith-stretch",
      version: "1.3.2",
      license: "MIT",
      integrity:
        "sha512-tJqRbwPCoWLSHXwO29UQ75u72IwPsHns3RG+TKzuOAp7OduJiJMzEtz32JEFbPFQcTR7aiKCIVc+/Kzw8bMZUw==",
      tarball:
        "https://registry.npmjs.org/signalsmith-stretch/-/signalsmith-stretch-1.3.2.tgz",
      repository: "https://signalsmith-audio.co.uk/code/stretch.git",
      gitHead: "222093b4cc13ddb4d07c826bc3c1559326091731",
      importEntry: "./SignalsmithStretch.mjs",
      requireEntry: "./SignalsmithStretch.js",
      declaredDependencies: [],
      declaredOptionalDependencies: [],
      declaredPeerDependencies: [],
      unpackedSizeBytes: 232_286,
      fileCount: 4,
      auditState:
        "metadata-frozen-package-source-transitive-and-shipped-artifact-audit-required-before-installation",
    });
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V2.candidates[1]).toMatchObject({
      id: "signalsmith-stretch-web-audio-wasm-worklet-1-3-2",
      eligible:
        "pending-milestone-2b-package-source-transitive-and-shipped-artifact-audit",
    });
  });

  it("admits only fee-free platform, repository, or permissive sources", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V2.licensePolicy).toEqual({
      admittedSources: [
        "host-platform-api",
        "repository-owned-under-root-license",
        "exact-reviewed-fee-free-permissive-package",
      ],
      admittedSpdxLicenses: [
        "0BSD",
        "Apache-2.0",
        "BSD-2-Clause",
        "BSD-3-Clause",
        "ISC",
        "MIT",
      ],
      prohibitedTerms: [
        "purchase",
        "subscription",
        "royalty",
        "paid-seat",
        "commercial-exception",
        "copyleft",
        "source-availability",
        "unknown-or-ambiguous-license",
      ],
      ambiguityOutcome: "stop-before-installation-or-evaluation",
      distributionReviewOwner: "M011",
      manifest: [
        {
          candidateId: "html-media-element-preserves-pitch-wav-v2",
          licenseBasis: "host-platform-api",
          feeRequired: false,
        },
        {
          candidateId: "signalsmith-stretch-web-audio-wasm-worklet-1-3-2",
          licenseBasis: "MIT-published-package-metadata",
          feeRequired: false,
          fullAuditRequiredBeforeInstallation: true,
        },
        {
          candidateId: "repository-incremental-audio-worklet-wsola-v2",
          licenseBasis: "repository-root-MIT-license",
          feeRequired: false,
        },
      ],
    });
  });

  it("freezes the media-only CSP delta and proves no runtime CSP changed", () => {
    const config = JSON.parse(
      readFileSync(
        resolve(REPOSITORY_ROOT, "apps/desktop/src-tauri/tauri.conf.json"),
        "utf8",
      ),
    ) as { app: { security: { csp: string } } };
    const authority =
      READER_SETTINGS_PLAYBACK_AUTHORITY_V2.contentSecurityPolicy;

    expect(config.app.security.csp).toBe(authority.current);
    expect(config.app.security.csp).not.toContain("media-src");
    expect(authority.mediaCandidateDelta).toBe("media-src 'self' blob:");
    expect(authority.mediaCandidateProspective).toBe(
      `${authority.current}; media-src 'self' blob:`,
    );
    expect(authority.unchangedConnectSrc).toBe(
      "connect-src ipc: http://ipc.localhost",
    );
    expect(authority.prohibitedMediaSources).toEqual([
      "data:",
      "http:",
      "https:",
      "*",
    ]);
    expect(authority.nativeCapabilityDelta).toBe("none");
  });

  it("retains all v1 resource and machine limits with prompt cleanup", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.machineGates).toBe(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.machineGates,
    );
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V2.lifecycleAndBounds).toEqual({
      maximumActiveObjectUrls: 1,
      maximumActiveTimeStretchers: 1,
      maximumConcurrentCandidateComparisons: 1,
      maximumActiveServiceTrees: 1,
      maximumSourceSampleFrames: 43_200_000,
      maximumLogicalPcmBytes: 172_800_000,
      maximumCompleteUnits: 256,
      maximumMetadataEntries: 256,
      sourceAccountingUnit: "sample-frames",
      objectUrlRevocation: "deterministic-before-replacement-or-exit",
      promptLifecycleActions: [
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
      ],
      maximumExternalRequests: 0,
      maximumPersistedGeneratedAudioBytes: 0,
    });
    expect(sourceMediaMillisecondsFromSampleFramesV2(43_200_000)).toBe(
      1_800_000,
    );
  });

  it("freezes result-blind deterministic and bilingual listening matrices", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation).toMatchObject({
      deterministicRatePercent: [95, 90, 85, 80, 75],
      listeningRatePercent: [100, 85, 75],
      requiredHosts: ["production-chromium", "packaged-windows-webview2"],
      resultLineage: {
        authorityCommitRequired: true,
        executionCommitMustBeStrictDescendant: true,
        resultArtifactBeforeAuthorityCommit: "prohibited",
        gateTuningAfterResults: "prohibited",
      },
      noPassingCandidate: "retain-1.00x-only-without-speed-selector",
    });
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.speechInput,
    ).toEqual({
      corpusPath: "benchmarks/tts/corpus-v7.json",
      caseIds: [
        "es-v7-arrival",
        "es-v7-dialogue",
        "en-v7-arrival",
        "en-v7-dialogue",
      ],
      generatedAudioPersistence: "prohibited",
    });
    expect(
      READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.listeningGates.rates,
    ).toEqual([100, 85, 75]);
  });

  it("changes no runtime, dependency, capability, or narration boundary", () => {
    expect(READER_SETTINGS_PLAYBACK_AUTHORITY_V2.currentRuntime).toEqual({
      productionPlaybackRatePercent: 100,
      speedSelectorAvailable: false,
      dependencyChange: false,
      cspChange: false,
      candidateImplementation: false,
    });
    expect(
      Object.values(READER_SETTINGS_PLAYBACK_AUTHORITY_V2.boundaries),
    ).toSatisfy((values: boolean[]) => values.every((value) => !value));
    expect(Object.isFrozen(READER_SETTINGS_PLAYBACK_AUTHORITY_V2)).toBe(true);
    expect(Object.isFrozen(NARRATION_PLAYBACK_RATES_V2)).toBe(true);
  });
});
