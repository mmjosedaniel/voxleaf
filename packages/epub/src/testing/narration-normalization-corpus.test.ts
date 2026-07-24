import { describe, expect, it } from "vitest";

import {
  NARRATION_NORMALIZATION_CATEGORIES,
  NARRATION_NORMALIZATION_CORPUS,
  validateNarrationNormalizationCorpus,
} from "../../test-support/narration-normalization-corpus.js";

async function contentFreeFingerprint(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (item) =>
    item.toString(16).padStart(2, "0"),
  ).join("");
}

describe("deterministic narration normalization corpus", () => {
  it("accepts the frozen authoritative table with unique cases", () => {
    const result = validateNarrationNormalizationCorpus(
      NARRATION_NORMALIZATION_CORPUS,
    );
    const identifiers = NARRATION_NORMALIZATION_CORPUS.map(({ id }) => id);

    expect(result).toEqual({ ok: true });
    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("covers every accepted normalization category", () => {
    const observed = new Set(
      NARRATION_NORMALIZATION_CORPUS.map(({ category }) => category),
    );

    expect(observed.size).toBe(NARRATION_NORMALIZATION_CATEGORIES.length);
    for (const category of NARRATION_NORMALIZATION_CATEGORIES) {
      expect(observed.has(category)).toBe(true);
    }
  });

  it("covers neutral, Spanish, overrides, mixed spans, and preservation", () => {
    const cases = NARRATION_NORMALIZATION_CORPUS;

    expect(cases.some(({ defaultLanguage }) => defaultLanguage === "und")).toBe(
      true,
    );
    expect(cases.some(({ defaultLanguage }) => defaultLanguage === "es")).toBe(
      true,
    );
    expect(
      cases.some(({ source }) =>
        source.some(
          ({ effectiveLanguage, semanticLanguage }) =>
            effectiveLanguage === "es" && semanticLanguage === "ES-MX",
        ),
      ),
    ).toBe(true);
    expect(
      cases.some(
        ({ source }) =>
          new Set(source.map(({ effectiveLanguage }) => effectiveLanguage))
            .size > 1,
      ),
    ).toBe(true);
    expect(
      cases.some(({ expected }) => expected.ambiguity === "preserve-ambiguous"),
    ).toBe(true);
    expect(
      cases.some(
        ({ expected }) => expected.ambiguity === "preserve-unsupported",
      ),
    ).toBe(true);
  });

  it("covers required Unicode, code, punctuation, and hyphenation edges", () => {
    const identifiers = new Set(
      NARRATION_NORMALIZATION_CORPUS.map(({ id }) => id),
    );
    const required = [
      "unicode-astral-preserved",
      "unicode-combining-sequence-preserved",
      "code-punctuation-preserved",
      "code-whitespace-preserved",
      "malformed-unbalanced-quote",
      "punctuation-dialogue-dash",
      "hyphenation-spanish-line-end-join",
      "hyphenation-genuine-compound",
      "hyphenation-neutral-ambiguous",
      "language-mixed-spans",
    ] as const;

    for (const identifier of required) {
      expect(identifiers.has(identifier)).toBe(true);
    }
  });

  it("keeps source and expectation values deeply frozen and unchanged", async () => {
    const before = await contentFreeFingerprint(NARRATION_NORMALIZATION_CORPUS);

    expect(Object.isFrozen(NARRATION_NORMALIZATION_CORPUS)).toBe(true);
    for (const entry of NARRATION_NORMALIZATION_CORPUS) {
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.source)).toBe(true);
      expect(entry.source.every(Object.isFrozen)).toBe(true);
      expect(Object.isFrozen(entry.expected)).toBe(true);
      expect(Object.isFrozen(entry.expected.boundaryProtections)).toBe(true);
    }

    const firstSource = NARRATION_NORMALIZATION_CORPUS[0]?.source[0];
    expect(firstSource).toBeDefined();
    if (firstSource === undefined) {
      throw new Error("narration-corpus-invariant");
    }
    expect(Reflect.set(firstSource, "effectiveLanguage", "es")).toBe(false);
    expect(
      validateNarrationNormalizationCorpus(NARRATION_NORMALIZATION_CORPUS),
    ).toEqual({ ok: true });

    const after = await contentFreeFingerprint(NARRATION_NORMALIZATION_CORPUS);
    expect(after).toBe(before);
  });

  it("rejects duplicate identity and duplicate source with closed codes", () => {
    const first = NARRATION_NORMALIZATION_CORPUS[0];
    expect(first).toBeDefined();
    if (first === undefined) {
      throw new Error("narration-corpus-invariant");
    }

    const duplicateIdentity = Object.freeze([first, first]);
    const duplicateSource = Object.freeze([
      first,
      Object.freeze({ ...first, id: "different-case-identity" }),
    ]);

    expect(validateNarrationNormalizationCorpus(duplicateIdentity)).toEqual({
      ok: false,
      code: "case-duplicate-id",
    });
    expect(validateNarrationNormalizationCorpus(duplicateSource)).toEqual({
      ok: false,
      code: "case-duplicate-source",
    });
  });

  it("never includes sensitive fixture values in validation failures", () => {
    const sensitiveCanary = "synthetic-sensitive-validation-canary";
    const invalidCase = Object.freeze({
      id: "privacy-validation-case",
      category: "whitespace",
      sensitivity: "synthetic-sensitive",
      blockKind: "paragraph",
      defaultLanguage: "und",
      source: Object.freeze([
        Object.freeze({
          kind: "text",
          text: sensitiveCanary,
          effectiveLanguage: "und",
        }),
      ]),
      expected: Object.freeze({
        narrationText: sensitiveCanary,
        action: "invalid-action",
        ambiguity: "none",
        boundaryProtections: Object.freeze([]),
      }),
    });

    const result = validateNarrationNormalizationCorpus(
      Object.freeze([invalidCase]),
    );

    expect(result).toEqual({
      ok: false,
      code: "case-expectation-invalid",
    });
    expect(JSON.stringify(result).includes(sensitiveCanary)).toBe(false);
    expect(Object.isFrozen(result)).toBe(true);
  });
});
