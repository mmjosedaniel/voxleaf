// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../../../..");
const RESULT_PATH = resolve(
  REPOSITORY_ROOT,
  "benchmarks/playback/boundary-deferred-v3-result.json",
);

interface CandidateResult {
  readonly candidateId: string;
  readonly chromium: { readonly gate: string };
  readonly packagedWebView2: { readonly gate: string };
  readonly piperContention: { readonly gate: string };
  readonly listening: {
    readonly gate: string;
    readonly omittedOrRepeatedWordCount: number;
  };
  readonly retainedCspChange: boolean;
  readonly retainedDependencyChange: boolean;
  readonly selected: boolean;
}

interface BoundaryDeferredResult {
  readonly authorityCommitSha: string;
  readonly candidates: readonly CandidateResult[];
  readonly listeningExecutionCommitSha: string;
  readonly privacy: {
    readonly externalRequestCount: number;
    readonly generatedAudioFilesAfterCleanup: number;
    readonly persistedGeneratedAudioBytes: number;
    readonly runtimeErrorCount: number;
    readonly severeBrowserLogCount: number;
  };
  readonly productionIntegrationMilestone: string;
  readonly productionPlaybackRatePercent: number;
  readonly schemaVersion: string;
  readonly selectedCandidateId: string;
}

function loadResult(): BoundaryDeferredResult {
  return JSON.parse(
    readFileSync(RESULT_PATH, "utf8"),
  ) as BoundaryDeferredResult;
}

describe("boundary-deferred playback result v3", () => {
  it("records strict post-authority execution and exactly one complete passer", () => {
    const result = loadResult();
    expect(result.schemaVersion).toBe(
      "voxleaf-boundary-deferred-playback-result-v3",
    );
    expect(result.authorityCommitSha).toBe(
      "41322294c62ff3e35aa08e9f3ead27ce38bfc84d",
    );
    expect(result.listeningExecutionCommitSha).not.toBe(
      result.authorityCommitSha,
    );
    expect(result.candidates).toHaveLength(2);
    for (const candidate of result.candidates) {
      expect(candidate.chromium.gate).toBe("pass");
      expect(candidate.packagedWebView2.gate).toBe("pass");
      expect(candidate.piperContention.gate).toBe("pass");
      expect(candidate.listening.gate).toBe("pass");
      expect(candidate.listening.omittedOrRepeatedWordCount).toBe(0);
    }
    expect(result.candidates.filter((candidate) => candidate.selected)).toEqual(
      [
        expect.objectContaining({
          candidateId: "repository-incremental-audio-worklet-wsola-boundary-v3",
        }),
      ],
    );
  });

  it("retains only the repository WSOLA implementation without CSP or dependency expansion", () => {
    const result = loadResult();
    const selected = result.candidates.find((candidate) => candidate.selected);
    expect(result.selectedCandidateId).toBe(
      "repository-incremental-audio-worklet-wsola-boundary-v3",
    );
    expect(selected).toMatchObject({
      retainedCspChange: false,
      retainedDependencyChange: false,
    });
    expect(
      existsSync(
        resolve(
          REPOSITORY_ROOT,
          "apps/desktop/src/tts/playback-backends/incremental-wsola-v3.ts",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          REPOSITORY_ROOT,
          "apps/desktop/src/tts/pitch-preserving-backend-probe-v3.ts",
        ),
      ),
    ).toBe(false);
    expect(result.productionPlaybackRatePercent).toBe(100);
    expect(result.productionIntegrationMilestone).toBe("M010-002-milestone-5");
    expect(result.privacy).toEqual({
      externalRequestCount: 0,
      persistedGeneratedAudioBytes: 0,
      generatedAudioFilesAfterCleanup: 0,
      runtimeErrorCount: 0,
      severeBrowserLogCount: 0,
    });
  });
});
