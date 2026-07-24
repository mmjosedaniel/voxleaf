import { describe, expect, it } from "vitest";

import {
  collectNarrationPreparationEvidence,
  evaluateNarrationPreparationLimit,
  NARRATION_PREPARATION_EVIDENCE_SHAPES,
  NARRATION_PREPARATION_LIMIT_NAMES,
  NARRATION_PREPARATION_PROFILE_V1,
  NARRATION_PREPARATION_SYNTHETIC_EVIDENCE,
  validateNarrationPreparationProfile,
  verifyNarrationPreparationEvidenceDeterminism,
} from "../../test-support/narration-preparation-limits.js";

describe("narration-v1 preparation limits", () => {
  it("accepts one deeply frozen and internally consistent profile", () => {
    expect(
      validateNarrationPreparationProfile(NARRATION_PREPARATION_PROFILE_V1),
    ).toEqual({ ok: true });
    expect(Object.isFrozen(NARRATION_PREPARATION_PROFILE_V1)).toBe(true);
    expect(Object.isFrozen(NARRATION_PREPARATION_PROFILE_V1.limits)).toBe(true);

    for (const name of NARRATION_PREPARATION_LIMIT_NAMES) {
      expect(
        Object.isFrozen(NARRATION_PREPARATION_PROFILE_V1.limits[name]),
      ).toBe(true);
    }
  });

  it("accepts every exact target and exact hard maximum", () => {
    for (const name of NARRATION_PREPARATION_LIMIT_NAMES) {
      const selected = NARRATION_PREPARATION_PROFILE_V1.limits[name];

      expect(evaluateNarrationPreparationLimit(name, selected.target)).toEqual({
        ok: true,
        status: "within-target",
      });
      expect(
        evaluateNarrationPreparationLimit(name, selected.target + 1),
      ).toEqual({
        ok: true,
        status: "within-hard-limits",
      });
      expect(
        evaluateNarrationPreparationLimit(name, selected.hardMaximum),
      ).toEqual({
        ok: true,
        status: "within-hard-limits",
      });
    }
  });

  it("returns one fixed content-free result for every max-plus-one value", () => {
    for (const name of NARRATION_PREPARATION_LIMIT_NAMES) {
      const result = evaluateNarrationPreparationLimit(
        name,
        NARRATION_PREPARATION_PROFILE_V1.limits[name].hardMaximum + 1,
      );

      expect(result).toEqual({
        ok: false,
        code: "resource-limit-exceeded",
      });
      expect(Object.isFrozen(result)).toBe(true);
    }
  });

  it("rejects malformed measurements without coercion or sensitive details", () => {
    const sensitiveCanary = "synthetic-sensitive-limit-canary";
    const invalidValues: readonly unknown[] = [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
      sensitiveCanary,
      { value: sensitiveCanary },
    ];

    for (const value of invalidValues) {
      const result = evaluateNarrationPreparationLimit(
        "segmentsPerBatch",
        value,
      );
      expect(result).toEqual({
        ok: false,
        code: "invalid-measurement",
      });
      expect(JSON.stringify(result).includes(sensitiveCanary)).toBe(false);
      expect(Object.isFrozen(result)).toBe(true);
    }

    expect(
      evaluateNarrationPreparationLimit(sensitiveCanary, sensitiveCanary),
    ).toEqual({
      ok: false,
      code: "invalid-measurement",
    });
  });

  it("covers every required representative and boundary evidence shape", () => {
    const observed = new Set(
      NARRATION_PREPARATION_SYNTHETIC_EVIDENCE.map(({ shape }) => shape),
    );

    expect(observed.size).toBe(NARRATION_PREPARATION_EVIDENCE_SHAPES.length);
    for (const shape of NARRATION_PREPARATION_EVIDENCE_SHAPES) {
      expect(observed.has(shape)).toBe(true);
    }
  });

  it("classifies representative, hard-pressure, and rejection evidence", () => {
    const expectedByShape = new Map([
      ["representative-heading", "within-target"],
      ["short-paragraph", "within-target"],
      ["long-paragraph", "within-hard-limits"],
      ["dialogue", "within-target"],
      ["punctuation-heavy-spanish", "within-hard-limits"],
      ["unusually-long-sentence", "within-hard-limits"],
      ["oversized-token", "resource-limit-exceeded"],
      ["exact-batch", "within-hard-limits"],
      ["max-plus-one-batch", "resource-limit-exceeded"],
      ["unicode-byte-pressure", "within-hard-limits"],
    ] as const);

    for (const entry of NARRATION_PREPARATION_SYNTHETIC_EVIDENCE) {
      expect(entry.expected).toBe(expectedByShape.get(entry.shape));
    }
  });

  it("rebuilds byte-identical narration and source ranges", () => {
    const first = collectNarrationPreparationEvidence();
    const second = collectNarrationPreparationEvidence();

    expect(second).toEqual(first);
    expect(verifyNarrationPreparationEvidenceDeterminism()).toBe(true);
    expect(Object.isFrozen(first)).toBe(true);
    for (const entry of first) {
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.measurements)).toBe(true);
    }
  });

  it("keeps UTF-16 length outside the admission authority", () => {
    const evidence = NARRATION_PREPARATION_SYNTHETIC_EVIDENCE.find(
      ({ shape }) => shape === "unicode-byte-pressure",
    );
    expect(evidence).toBeDefined();
    if (evidence === undefined) {
      throw new Error("narration-limit-evidence-invariant");
    }

    const syntheticAstralInput = "😀".repeat(300);
    expect(syntheticAstralInput.length).toBe(600);
    expect(evidence.measurements.sourceCodePointsInspectedPerRequest).toBe(300);
    expect(evidence.measurements.narrationCodePointsPerSegment).toBe(300);
    expect(evidence.measurements.narrationUtf8BytesPerSegment).toBe(1_200);
    expect(
      evaluateNarrationPreparationLimit(
        "narrationCodePointsPerSegment",
        evidence.measurements.narrationCodePointsPerSegment,
      ),
    ).toEqual({ ok: true, status: "within-target" });
    expect(
      evaluateNarrationPreparationLimit(
        "narrationUtf8BytesPerSegment",
        evidence.measurements.narrationUtf8BytesPerSegment,
      ),
    ).toEqual({ ok: true, status: "within-hard-limits" });
  });

  it("keeps the evidence report content-free", () => {
    const serialized = JSON.stringify(NARRATION_PREPARATION_SYNTHETIC_EVIDENCE);

    expect(serialized.includes('"source"')).toBe(false);
    expect(serialized.includes('"narration"')).toBe(false);
    expect(serialized.includes("Capítulo")).toBe(false);
    expect(serialized.includes("¿Lista?")).toBe(false);
    expect(serialized.includes("😀")).toBe(false);
  });

  it("rejects inconsistent or mutable profile copies with closed codes", () => {
    const mutableProfile = {
      ...NARRATION_PREPARATION_PROFILE_V1,
      limits: { ...NARRATION_PREPARATION_PROFILE_V1.limits },
    };
    expect(validateNarrationPreparationProfile(mutableProfile)).toEqual({
      ok: false,
      code: "profile-not-frozen",
    });

    const inconsistentProfile = Object.freeze({
      ...NARRATION_PREPARATION_PROFILE_V1,
      limits: Object.freeze({
        ...NARRATION_PREPARATION_PROFILE_V1.limits,
        retainedSegments: Object.freeze({
          ...NARRATION_PREPARATION_PROFILE_V1.limits.retainedSegments,
          hardMaximum:
            NARRATION_PREPARATION_PROFILE_V1.limits.segmentsPerBatch
              .hardMaximum,
        }),
      }),
    });
    expect(validateNarrationPreparationProfile(inconsistentProfile)).toEqual({
      ok: false,
      code: "profile-inconsistent",
    });
  });
});
