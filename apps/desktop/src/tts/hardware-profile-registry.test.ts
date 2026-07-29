// @vitest-environment node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  HARDWARE_PROFILE_REGISTRY_V1,
} from "./hardware-profile-registry";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../../../..");

function sha256(path: string): string {
  return createHash("sha256")
    .update(readFileSync(resolve(REPOSITORY_ROOT, path)))
    .digest("hex");
}

describe("hardware profile registry v1", () => {
  it("contains only the frozen development profile and rejected evidence states", () => {
    expect(HARDWARE_PROFILE_REGISTRY_V1).toHaveLength(3);
    expect(
      HARDWARE_PROFILE_REGISTRY_V1.map((entry) => [
        entry.identity.profileId,
        entry.supportState,
      ]),
    ).toEqual([
      [EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID, "development-only"],
      ["qwen3-tts-0-6b-customvoice-cuda-bf16-v1", "unsupported"],
      ["supertonic-3-onnx-cpu-f1-es-v1", "unsupported"],
    ]);
    expect(
      HARDWARE_PROFILE_REGISTRY_V1.some(
        (entry) => entry.supportState === "supported",
      ),
    ).toBe(false);
    expect(
      HARDWARE_PROFILE_REGISTRY_V1.some(
        (entry) =>
          entry.role === "cpu-fallback" && entry.supportState === "supported",
      ),
    ).toBe(false);
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
    const evidenceFiles = new Map([
      [
        "9d35899ed7909085757efb798de591887f3e7d3d",
        "docs/architecture/tts-feasibility-profile-v2.md",
      ],
      [
        "de2c2dcf856e4eb44de5cf249a4a7d8c256b19b6",
        "benchmarks/tts/profile-v3.json",
      ],
      [
        "8253ff4434d761731d278e57a21c58abd9474a1f",
        "benchmarks/tts/selection-v2.md",
      ],
      [
        "3ba3ada4c2b7dd8295805391974e14f43fae1b64",
        "benchmarks/tts/selection-v3.md",
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
    ]);

    for (const entry of HARDWARE_PROFILE_REGISTRY_V1) {
      const authorityPath = evidenceFiles.get(
        entry.evidence.authorityCommitSha,
      );
      const resultPath = evidenceFiles.get(entry.evidence.resultCommitSha);
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
      measuredPeakRamMiB: 4_426,
      measuredPeakDedicatedVramMiB: 5_996,
      measuredArtifactFootprintMiB: 9_297,
    });
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
