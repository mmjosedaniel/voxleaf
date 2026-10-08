// @vitest-environment node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CHATTERBOX_BILINGUAL_PROFILE_ID,
  EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  HARDWARE_PROFILE_REGISTRY_V1,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "./hardware-profile-registry";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../../../..");

function sha256(path: string): string {
  return createHash("sha256")
    .update(readFileSync(resolve(REPOSITORY_ROOT, path)))
    .digest("hex");
}

describe("hardware profile registry v1", () => {
  it("contains the admitted bilingual profiles and preserves rejected evidence states", () => {
    expect(HARDWARE_PROFILE_REGISTRY_V1).toHaveLength(7);
    expect(
      HARDWARE_PROFILE_REGISTRY_V1.map((entry) => [
        entry.identity.profileId,
        entry.supportState,
      ]),
    ).toEqual([
      [PIPER_CPU_FALLBACK_PROFILE_ID, "supported"],
      [EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID, "development-only"],
      [PIPER_ENGLISH_CPU_PROFILE_ID, "supported"],
      [CHATTERBOX_BILINGUAL_PROFILE_ID, "supported"],
      [EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID, "development-only"],
      ["qwen3-tts-0-6b-customvoice-cuda-bf16-v1", "unsupported"],
      ["supertonic-3-onnx-cpu-f1-es-v1", "unsupported"],
    ]);
    expect(
      HARDWARE_PROFILE_REGISTRY_V1.some(
        (entry) => entry.supportState === "supported",
      ),
    ).toBe(true);
    expect(
      HARDWARE_PROFILE_REGISTRY_V1.some(
        (entry) =>
          entry.role === "cpu-fallback" && entry.supportState === "supported",
      ),
    ).toBe(true);
    expect(Object.isFrozen(HARDWARE_PROFILE_REGISTRY_V1)).toBe(true);
    for (const entry of HARDWARE_PROFILE_REGISTRY_V1) {
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.identity)).toBe(true);
      expect(Object.isFrozen(entry.requirements)).toBe(true);
      expect(Object.isFrozen(entry.evidence)).toBe(true);
      expect(Object.isFrozen(entry.evidence.gates)).toBe(true);
    }
  });

  it("binds every entry to byte-identical authority, result, and decision evidence", () => {
    const authorityFiles = new Map([
      [
        "92384d22a7f8f93761b98448ed24ee3bf829eeb2b32e38aa0f5ac508c201e527",
        "docs/architecture/tts-feasibility-profile-v2.md",
      ],
      [
        "ec0ef6aceedfc2ed4df199cc276b5c8365f979921311a7d2cd3d813546e1bd48",
        "benchmarks/tts/profile-v6.json",
      ],
      [
        "84448e70e8b8b2782f22c0e3d874b1b30531084732e0416ab9e83e1ad1e7525a",
        "benchmarks/tts/profile-v8.json",
      ],
      [
        "b4144299538225bdac86983493b3a64b8cf2a8c291403aca21dfafe7d33cc267",
        "benchmarks/tts/profile-v12.json",
      ],
    ]);
    const resultFiles = new Map([
      [
        "517a68f83740906343b47a7df79b306d3581d64f2422c335fd70500cdb3eba1e",
        "benchmarks/tts/selection-v2.md",
      ],
      [
        "8d8005f3909517276faecacda859db48714a497ccd3a2a92797a7cedb3eb38f8",
        "benchmarks/tts/cpu-fallback-result-v6.json",
      ],
      [
        "b0144e3cacc0916c02dcb6b56c6bb6af4cfafe19b9c203da1a95ea8ba208b7aa",
        "benchmarks/tts/piper-english-result-v8.json",
      ],
      [
        "96301fa9bdd8267e6316e261a2e07756717f2b11eaf7a4771870d0b3be8c7d9e",
        "benchmarks/tts/chatterbox-bilingual-full-result-v12.json",
      ],
      [
        "d24b3d7c8f734077abbe3a5f17ea4d9d709b4b23e712bcbd341fe1ec00a6e7bb",
        "benchmarks/tts/qwen-serena-spanish-quality-result-v12.json",
      ],
      [
        "9ad66e1d3bc73678b58fde7984c49b485cd31dacc5c3d0ed5df7e54fa70b2215",
        "benchmarks/tts/qwen-aiden-english-quality-result-v12.json",
      ],
    ]);
    const decisions = new Map([
      [
        "64e4f1ba61c555d1597426d18760154b172352bd231c1a797b6cfb830a4b0eeb",
        "docs/architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md",
      ],
      [
        "0acb42dfbd7464d4b3bbb92eb5b0f092a7251cd26e75912dfe988276324e32b2",
        "docs/architecture/decisions/ADR-0014-constrained-qwen-development-demo.md",
      ],
      [
        "678104e655ca9ef1b17b7bdfc89c6bb4bf4f4a684045cc15a6d5d0a83f945d8d",
        "docs/architecture/decisions/ADR-0020-admit-piper-cpu-fallback.md",
      ],
      [
        "64f54f73868c145c09752ad19c05f5d4791cd8e51117afad82b3bf21c1e3924d",
        "benchmarks/tts/selection-v12.md",
      ],
    ]);

    for (const entry of HARDWARE_PROFILE_REGISTRY_V1) {
      const authorityPath = authorityFiles.get(entry.evidence.authoritySha256);
      const resultPath = resultFiles.get(entry.evidence.resultSha256);
      const decisionPath = decisions.get(entry.evidence.decisionSha256);
      expect(authorityPath).toBeDefined();
      expect(resultPath).toBeDefined();
      expect(decisionPath).toBeDefined();
      expect(sha256(authorityPath!)).toBe(entry.evidence.authoritySha256);
      expect(sha256(resultPath!)).toBe(entry.evidence.resultSha256);
      expect(sha256(decisionPath!)).toBe(entry.evidence.decisionSha256);
      expect(() =>
        execFileSync(
          "git",
          [
            "merge-base",
            "--is-ancestor",
            entry.evidence.authorityCommitSha,
            entry.evidence.resultCommitSha,
          ],
          { cwd: REPOSITORY_ROOT, stdio: "ignore" },
        ),
      ).not.toThrow();
    }
  });

  it("rounds measured byte resources upward into integer MiB", () => {
    const byId = new Map(
      HARDWARE_PROFILE_REGISTRY_V1.map((entry) => [
        entry.identity.profileId,
        entry,
      ]),
    );
    expect(
      byId.get(EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID)?.requirements,
    ).toMatchObject({
      measuredPeakRamMiB: 4_424,
      measuredPeakDedicatedVramMiB: 4_602,
      measuredArtifactFootprintMiB: 9_297,
    });
    expect(
      byId.get(EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID)?.requirements,
    ).toMatchObject({
      measuredPeakRamMiB: 4_433,
      measuredPeakDedicatedVramMiB: 4_570,
      measuredArtifactFootprintMiB: 9_297,
    });
    expect(byId.get(PIPER_ENGLISH_CPU_PROFILE_ID)?.requirements).toMatchObject({
      measuredPeakRamMiB: 412,
      measuredPeakDedicatedVramMiB: 0,
      measuredArtifactFootprintMiB: 167,
    });
    expect(
      byId.get(CHATTERBOX_BILINGUAL_PROFILE_ID)?.requirements,
    ).toMatchObject({
      measuredPeakRamMiB: 4_994,
      measuredPeakDedicatedVramMiB: 3_644,
      measuredArtifactFootprintMiB: 8_211,
      minimumTotalDedicatedVramMiB: 5_632,
      minimumAvailableDedicatedVramMiB: 4_668,
    });
    expect(byId.get(PIPER_CPU_FALLBACK_PROFILE_ID)?.requirements).toMatchObject(
      {
        measuredPeakRamMiB: 393,
        measuredPeakDedicatedVramMiB: 0,
        measuredArtifactFootprintMiB: 166,
      },
    );
    expect(
      byId.get("qwen3-tts-0-6b-customvoice-cuda-bf16-v1")?.requirements,
    ).toMatchObject({
      measuredPeakRamMiB: 2_538,
      measuredPeakDedicatedVramMiB: 3_972,
      measuredArtifactFootprintMiB: 7_368,
    });
    expect(
      byId.get("supertonic-3-onnx-cpu-f1-es-v1")?.requirements,
    ).toMatchObject({
      measuredPeakRamMiB: 637,
      measuredPeakDedicatedVramMiB: 0,
      measuredArtifactFootprintMiB: 503,
    });
  });
});
