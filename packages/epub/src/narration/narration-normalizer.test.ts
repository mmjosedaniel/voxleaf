import { createIndex, createSpineItemId, decodeBookV1 } from "@voxleaf/shared";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  NARRATION_NORMALIZATION_CORPUS,
  type NarrationNormalizationCorpusCase,
  type NarrationCorpusSourceUnit,
} from "../../test-support/narration-normalization-corpus.js";
import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  ContentDocumentId,
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
  SensitivePublicationText,
} from "../document/document-model.js";
import type { XhtmlDocumentProjection } from "../document/xhtml-projector.js";
import { createPublicationLocatorIndex } from "../locator/locator-index.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import {
  normalizeNarrationSourceTokens,
  type NarrationNormalizedStream,
  type NarrationNormalizedUnit,
  type NarrationNormalizationBoundaryProtection,
  type NarrationNormalizationLanguage,
} from "./narration-normalizer.js";
import { projectNarrationSource } from "./narration-source-projector.js";
import {
  createNarrationSourceTokenRange,
  mapNarrationSourceTokens,
  type NarrationSourceToken,
  type NarrationSourceTokenLeafEvent,
} from "./narration-source.js";
import { NARRATION_V1_SOURCE_WINDOW_POLICY } from "./narration-policy.js";

const DOCUMENT_ID = "document:normalization" as ContentDocumentId;
const TASK_3_1_CORPUS = NARRATION_NORMALIZATION_CORPUS.filter(
  ({ category, id }) =>
    category === "whitespace" ||
    category === "line-break" ||
    category === "hyphenation" ||
    id === "code-whitespace-preserved",
);
const TASK_3_2_CORPUS = NARRATION_NORMALIZATION_CORPUS.filter(
  ({ category, id }) =>
    category === "punctuation" ||
    category === "symbol" ||
    id === "code-punctuation-preserved" ||
    id === "malformed-unbalanced-quote" ||
    id === "malformed-unbalanced-opening-question",
);
const TASK_3_3_CORPUS = NARRATION_NORMALIZATION_CORPUS.filter(
  ({ category }) =>
    category === "abbreviation" ||
    category === "number" ||
    category === "date" ||
    category === "time" ||
    category === "currency" ||
    category === "percentage" ||
    category === "language",
);
const BILINGUAL_V2_CORPUS = Object.freeze([
  Object.freeze({
    language: "es" as const,
    source:
      "El informe de 2026 confirmó que el avance llegó al 25 % y que quedaban 12,50 €.",
    expected:
      "El informe de dos mil veintiséis confirmó que el avance llegó al veinticinco por ciento y que quedaban doce euros con cincuenta céntimos.",
  }),
  Object.freeze({
    language: "es" as const,
    source: "La revisión será el 24/07/2026 a las 14:30.",
    expected:
      "La revisión será el veinticuatro de julio de dos mil veintiséis a las catorce treinta.",
  }),
  Object.freeze({
    language: "es" as const,
    source: "Sol & Mar marcó 20 °C.",
    expected: "Sol y Mar marcó veinte grados Celsius.",
  }),
  Object.freeze({
    language: "es" as const,
    source: "Siobhán O'Connor habló con calma.",
    expected: "Siobhán O'Connor habló con calma.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "Dr. Morgan met Mr. Reed at St. James Station.",
    expected: "Doctor Morgan met Mister Reed at Saint James Station.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "The team completed 25 % of 120 pages.",
    expected:
      "The team completed twenty-five percent of one hundred twenty pages.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "The notebook cost $12.50.",
    expected: "The notebook cost twelve dollars and fifty cents.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "The review is scheduled for 2026-07-24.",
    expected:
      "The review is scheduled for July twenty-fourth, two thousand twenty-six.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "The doors open at 14:30.",
    expected: "The doors open at fourteen thirty.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "Salt & Stone reported 20 °C.",
    expected: "Salt and Stone reported twenty degrees Celsius.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "She finished 3rd and returned to the 21st row.",
    expected: "She finished third and returned to the twenty-first row.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "The U.S. team met at 8 a.m.",
    expected: "The U S team met at eight a m.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "The note says 03/04/05.",
    expected: "The note says 03/04/05.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "The archive contains 12345678901234567890 records.",
    expected: "The archive contains 12345678901234567890 records.",
  }),
  Object.freeze({
    language: "en" as const,
    source: "“Wait…” Elena whispered. “Did you hear that?”",
    expected: "“Wait…” Elena whispered. “Did you hear that?”",
  }),
  Object.freeze({
    language: "en" as const,
    source: "Use total += 1 and keep v2.0 unchanged.",
    expected: "Use total += 1 and keep v2.0 unchanged.",
  }),
]);

describe("narration normalization", () => {
  describe("frozen bilingual v2 corpus", () => {
    for (const [index, corpusCase] of BILINGUAL_V2_CORPUS.entries()) {
      it(`normalizes frozen case ${index + 1}`, () => {
        const leaf = singleTextFixture(corpusCase.source, false);
        const before = JSON.stringify(leaf.sourceTokens);

        const first = normalizeNarrationSourceTokens(
          leaf.sourceTokens,
          corpusCase.language,
        );
        const repeated = normalizeNarrationSourceTokens(
          leaf.sourceTokens,
          corpusCase.language,
        );

        expect(first.text).toBe(corpusCase.expected);
        expect(repeated).toEqual(first);
        expect(JSON.stringify(leaf.sourceTokens)).toBe(before);
        assertSourceMapping(leaf, first);
        assertDeepFrozen(first);
      });
    }

    it("preserves conflicting and unsupported semantic language spans", () => {
      const englishSelected = leafFor(
        paragraph([text("Dr. Morgan", "es")], "en"),
      );
      const spanishSelected = leafFor(
        paragraph([text("Dr. Morgan", "en")], "es"),
      );
      const unsupported = leafFor(paragraph([text("Dr. Morgan", "fr")], "en"));

      expect(
        normalizeNarrationSourceTokens(englishSelected.sourceTokens, "en").text,
      ).toBe("Dr. Morgan");
      expect(
        normalizeNarrationSourceTokens(spanishSelected.sourceTokens, "es").text,
      ).toBe("Dr. Morgan");
      expect(
        normalizeNarrationSourceTokens(unsupported.sourceTokens, "en").text,
      ).toBe("Dr. Morgan");
    });
  });
  describe("accepted Task 3.1 corpus", () => {
    for (const corpusCase of TASK_3_1_CORPUS) {
      it(corpusCase.id, () => {
        const fixture = corpusFixture(corpusCase);
        const before = JSON.stringify(fixture.block);

        const normalized = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );

        expect(normalized.text).toBe(corpusCase.expected.narrationText);
        expect(normalized.units).toHaveLength(fixture.leaf.sourceTokens.length);
        expect(JSON.stringify(fixture.block)).toBe(before);
        assertSourceMapping(fixture.leaf, normalized);
        assertDeepFrozen(normalized);
      });
    }
  });

  it("is deterministic and idempotent for accepted narration text", () => {
    for (const corpusCase of TASK_3_1_CORPUS) {
      const fixture = corpusFixture(corpusCase);
      const first = normalizeNarrationSourceTokens(
        fixture.leaf.sourceTokens,
        corpusCase.defaultLanguage,
      );
      const repeated = normalizeNarrationSourceTokens(
        fixture.leaf.sourceTokens,
        corpusCase.defaultLanguage,
      );
      const secondFixture = singleTextFixture(
        String(first.text),
        corpusCase.source.every(({ kind }) => kind === "code"),
      );
      const second = normalizeNarrationSourceTokens(
        secondFixture.sourceTokens,
        corpusCase.defaultLanguage,
      );

      expect(repeated).toEqual(first);
      expect(second.text).toBe(first.text);
    }
  });

  it("retains every origin span through collapse, deletion, and joining", () => {
    const ordinary = resultForCase("whitespace-ordinary-neutral");
    const softHyphen = resultForCase("hyphenation-soft-hyphen");
    const joined = resultForCase("hyphenation-spanish-line-end-join");
    const compound = resultForCase("hyphenation-genuine-compound");
    const neutral = resultForCase("hyphenation-neutral-ambiguous");

    expect(
      ordinary.normalized.units.some(
        (unit) =>
          unit.kind === "omission" && unit.reason === "collapsed-whitespace",
      ),
    ).toBe(true);
    expect(
      softHyphen.normalized.units.some(
        (unit) => unit.kind === "omission" && unit.reason === "soft-hyphen",
      ),
    ).toBe(true);
    expect(
      joined.normalized.units.some(
        (unit) => unit.kind === "omission" && unit.reason === "line-end-hyphen",
      ),
    ).toBe(true);
    expect(lineEndHyphenRoles(compound.normalized.units)).toEqual([
      "line-end-hyphen",
    ]);
    expect(lineEndHyphenRoles(neutral.normalized.units)).toEqual([
      "line-end-hyphen",
    ]);

    for (const result of [ordinary, softHyphen, joined, compound, neutral]) {
      assertSourceMapping(result.leaf, result.normalized);
    }
  });

  it("keeps semantic line breaks distinct from block boundaries", () => {
    const withLineBreak = resultForCase("line-break-between-words");
    expect(
      withLineBreak.normalized.units.some(
        (unit) =>
          (unit.kind === "text" && unit.role === "semantic-line-break") ||
          (unit.kind === "omission" && unit.reason === "semantic-line-break"),
      ),
    ).toBe(true);

    const leaves = tokenLeavesFor([
      paragraph([text(" Alpha ")]),
      paragraph([text(" Beta ")]),
    ]);
    const normalized = leaves.map((leaf) =>
      normalizeNarrationSourceTokens(leaf.sourceTokens, "und"),
    );

    expect(normalized.map(({ text: value }) => value)).toEqual([
      "Alpha",
      "Beta",
    ]);
    expect(
      normalized.every(({ units }) =>
        units.every(
          (unit) => unit.kind !== "text" || unit.role !== "semantic-line-break",
        ),
      ),
    ).toBe(true);
  });

  it("represents an entirely unspoken block without empty text units", () => {
    const leaf = leafFor(paragraph([text(" \u00ad\u200b ")]));
    const normalized = normalizeNarrationSourceTokens(leaf.sourceTokens, "und");

    expect(normalized.text).toBe("");
    expect(normalized.units).toHaveLength(4);
    expect(normalized.units.every((unit) => unit.kind === "omission")).toBe(
      true,
    );
    assertSourceMapping(leaf, normalized);
  });

  it("applies the closed Spanish join only under effective Spanish", () => {
    const spanish = leafFor(
      paragraph(
        [text("narra-"), Object.freeze({ kind: "line-break" }), text("ción")],
        "ES-MX",
      ),
    );
    const malformed = leafFor(
      paragraph(
        [text("narra-"), Object.freeze({ kind: "line-break" }), text("ción")],
        "es--MX",
      ),
    );

    expect(
      normalizeNarrationSourceTokens(spanish.sourceTokens, "und").text,
    ).toBe("narración");
    expect(
      normalizeNarrationSourceTokens(malformed.sourceTokens, "es").text,
    ).toBe("narra-ción");
  });

  it("preserves code spacing and all non-Task-3.1 Unicode code points", () => {
    const fixture = leafFor(
      paragraph([code(" value  ===  3.05 "), text(" 🌞 cafe\u0301 ")]),
    );

    const normalized = normalizeNarrationSourceTokens(
      fixture.sourceTokens,
      "es",
    );

    expect(normalized.text).toBe(" value  ===  3.05 🌞 cafe\u0301");
    expect(
      normalized.units
        .filter((unit) => unit.kind === "text")
        .slice(0, Array.from(" value  ===  3.05 ").length)
        .every(({ role }) => role === "code"),
    ).toBe(true);
  });

  it("returns only fixed content-free failures for invalid internal input", () => {
    const leaf = leafFor([paragraph([text("private-canary-normalization")])]);
    const first = leaf.sourceTokens[0];
    if (first === undefined) {
      throw new Error("expected source token");
    }
    const invalid = Object.freeze({
      ...first,
      sourceSpan: Object.freeze({
        startOffsetCodePoints: createIndex(2),
        endOffsetCodePoints: createIndex(3),
      }),
    });

    expectInternalFailure(() =>
      normalizeNarrationSourceTokens([first, invalid], "und"),
    );
    expectInternalFailure(() =>
      normalizeNarrationSourceTokens(
        leaf.sourceTokens,
        "fr" as NarrationNormalizationLanguage,
      ),
    );
  });

  it("accepts the retained-token maximum and rejects max-plus-one", () => {
    const maximum =
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum;
    const exact = boundedSourceTokens(maximum);
    const normalized = normalizeNarrationSourceTokens(exact, "und");

    expect(normalized.units).toHaveLength(maximum);
    expect(Array.from(String(normalized.text))).toHaveLength(maximum);
    expectArchiveFailure(
      () =>
        normalizeNarrationSourceTokens(boundedSourceTokens(maximum + 1), "und"),
      "resource-limit-exceeded",
    );
  });

  describe("accepted Task 3.2 punctuation and symbol policy", () => {
    for (const corpusCase of TASK_3_2_CORPUS) {
      it(corpusCase.id, () => {
        const fixture = corpusFixture(corpusCase);
        const before = JSON.stringify(fixture.block);

        const normalized = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );

        expect(normalized.text).toBe(corpusCase.expected.narrationText);
        expect(normalizedBoundaryProtections(normalized)).toEqual(
          [...corpusCase.expected.boundaryProtections].sort(),
        );
        expect(JSON.stringify(fixture.block)).toBe(before);
        assertSourceMapping(fixture.leaf, normalized);
        assertDeepFrozen(normalized);
      });
    }

    it("is deterministic and idempotent for accepted punctuation and symbols", () => {
      for (const corpusCase of TASK_3_2_CORPUS) {
        const fixture = corpusFixture(corpusCase);
        const first = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );
        const repeated = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );
        const secondFixture = singleTextFixture(
          String(first.text),
          corpusCase.source.every(({ kind }) => kind === "code"),
        );
        const second = normalizeNarrationSourceTokens(
          secondFixture.sourceTokens,
          corpusCase.defaultLanguage,
        );

        expect(repeated).toEqual(first);
        expect(second.text).toBe(first.text);
      }
    });

    it("retains quotation, ellipsis, repeated-mark, and dialogue roles", () => {
      const quotation = resultForTask3_2Case(
        "punctuation-typographic-quotes",
      ).normalized;
      const ellipsis = resultForTask3_2Case(
        "punctuation-ellipsis-character",
      ).normalized;
      const repeated = resultForTask3_2Case(
        "punctuation-repeated-marks",
      ).normalized;
      const dialogue = resultForTask3_2Case(
        "punctuation-dialogue-dash",
      ).normalized;

      expect(textRoles(quotation)).toContain("quotation");
      expect(textRoles(ellipsis)).toContain("ellipsis");
      expect(textRoles(repeated)).toContain("punctuation");
      expect(textRoles(dialogue)).toContain("dialogue-dash");
      expect(normalizedBoundaryProtections(ellipsis)).toContain("ellipsis");
      expect(normalizedBoundaryProtections(repeated)).toContain("sentence-end");
      expect(normalizedBoundaryProtections(dialogue)).toContain(
        "dialogue-turn",
      );
    });

    it("preserves paired straight quotes, en dashes, and three-period ellipses", () => {
      const leaf = leafFor(paragraph([text('"Texto" – pausa... después.')]));
      const normalized = normalizeNarrationSourceTokens(
        leaf.sourceTokens,
        "und",
      );

      expect(normalized.text).toBe('"Texto" – pausa... después.');
      expect(
        textRoles(normalized).filter((role) => role === "quotation"),
      ).toHaveLength(2);
      expect(textRoles(normalized)).toContain("dialogue-dash");
      expect(
        normalized.units.filter(
          (unit) => unit.kind === "text" && unit.role === "ellipsis",
        ),
      ).toHaveLength(3);
      assertSourceMapping(leaf, normalized);
    });

    it("marks unbalanced opening punctuation without changing its text", () => {
      for (const id of [
        "malformed-unbalanced-quote",
        "malformed-unbalanced-opening-question",
      ]) {
        const { leaf, normalized } = resultForTask3_2Case(id);
        expect(normalizedBoundaryProtections(normalized)).toContain(
          "malformed-punctuation",
        );
        expect(normalized.text).toBe(
          TASK_3_2_CORPUS.find((entry) => entry.id === id)?.expected
            .narrationText,
        );
        assertSourceMapping(leaf, normalized);
      }
    });

    it("expands only context-safe Spanish symbol forms", () => {
      const acceptedAmpersand = resultForTask3_2Case(
        "symbol-spanish-ampersand",
      ).normalized;
      const acceptedCelsius = resultForTask3_2Case(
        "symbol-spanish-temperature",
      ).normalized;
      const neutralAmpersand = normalizeNarrationSourceTokens(
        leafFor(paragraph([text("Sol & Mar")])).sourceTokens,
        "und",
      );
      const compactAmpersand = normalizeNarrationSourceTokens(
        leafFor(paragraph([text("R&D", "es")])).sourceTokens,
        "es",
      );
      const neutralOverride = normalizeNarrationSourceTokens(
        leafFor(paragraph([text("Sol & Mar", "en")])).sourceTokens,
        "es",
      );
      const unsupportedTemperature = normalizeNarrationSourceTokens(
        leafFor(paragraph([text("21 °C", "es")])).sourceTokens,
        "es",
      );
      const codeSymbols = normalizeNarrationSourceTokens(
        leafFor(paragraph([code("20 °C &", "es")])).sourceTokens,
        "es",
      );

      expect(acceptedAmpersand.text).toBe("Sol y Mar");
      expect(acceptedCelsius.text).toBe("veinte grados Celsius");
      expect(
        acceptedCelsius.units.some(
          (unit) =>
            unit.kind === "omission" && unit.reason === "symbol-expansion",
        ),
      ).toBe(true);
      expect(neutralAmpersand.text).toBe("Sol & Mar");
      expect(compactAmpersand.text).toBe("R&D");
      expect(neutralOverride.text).toBe("Sol & Mar");
      expect(unsupportedTemperature.text).toBe("21 °C");
      expect(codeSymbols.text).toBe("20 °C &");
    });

    it("handles maximum repeated punctuation and unbalanced quotes", () => {
      const maximum =
        NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum;
      const sourceTokens = boundedSourceTokens(maximum, "?");
      const normalized = normalizeNarrationSourceTokens(sourceTokens, "es");
      const unbalancedQuotes = normalizeNarrationSourceTokens(
        boundedSourceTokens(maximum, "“"),
        "es",
      );

      expect(normalized.units).toHaveLength(maximum);
      expect(Array.from(String(normalized.text))).toHaveLength(maximum);
      expect(
        normalized.units.every(
          (unit) =>
            unit.kind === "text" &&
            unit.role === "punctuation" &&
            unit.boundaryProtections.includes("sentence-end"),
        ),
      ).toBe(true);
      expect(unbalancedQuotes.units).toHaveLength(maximum);
      expect(
        unbalancedQuotes.units.every(
          (unit) =>
            unit.kind === "text" &&
            unit.role === "quotation" &&
            unit.boundaryProtections.includes("malformed-punctuation"),
        ),
      ).toBe(true);
    });

    it("keeps every expansion within the accepted per-source ceiling", () => {
      for (const corpusCase of TASK_3_2_CORPUS) {
        const normalized = normalizeNarrationSourceTokens(
          corpusFixture(corpusCase).leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );
        for (const unit of normalized.units) {
          if (unit.kind === "text") {
            expect(Array.from(String(unit.text)).length).toBeLessThanOrEqual(
              NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum,
            );
          }
        }
      }
    });
  });

  describe("accepted Task 3.3 Spanish lexical and numeric policy", () => {
    for (const corpusCase of TASK_3_3_CORPUS) {
      it(corpusCase.id, () => {
        const fixture = corpusFixture(corpusCase);
        const before = JSON.stringify(fixture.block);

        const normalized = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );

        expect(normalized.text).toBe(corpusCase.expected.narrationText);
        expect(normalizedBoundaryProtections(normalized)).toEqual(
          [...corpusCase.expected.boundaryProtections].sort(),
        );
        expect(JSON.stringify(fixture.block)).toBe(before);
        assertSourceMapping(fixture.leaf, normalized);
        assertDeepFrozen(normalized);
      });
    }

    it("is deterministic and text-idempotent for every accepted form", () => {
      for (const corpusCase of TASK_3_3_CORPUS) {
        const fixture = corpusFixture(corpusCase);
        const first = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );
        const repeated = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );
        const semanticLanguages = [
          ...new Set(
            corpusCase.source.map(({ semanticLanguage }) => semanticLanguage),
          ),
        ];
        const secondLanguage =
          semanticLanguages.length === 1 ? semanticLanguages[0] : undefined;
        const second = normalizeNarrationSourceTokens(
          leafFor(paragraph([text(String(first.text), secondLanguage)]))
            .sourceTokens,
          corpusCase.defaultLanguage,
        );

        expect(repeated).toEqual(first);
        expect(second.text).toBe(first.text);
      }
    });

    it("keeps accepted lexical classes protected for later segmentation", () => {
      const abbreviation = resultForTask3_3Case(
        "abbreviation-spanish-honorific",
      ).normalized;
      const initials = resultForTask3_3Case("abbreviation-initials").normalized;
      const decimal = resultForTask3_3Case(
        "number-spanish-decimal-leading-zero",
      ).normalized;
      const date = resultForTask3_3Case("date-spanish-slash").normalized;
      const time = resultForTask3_3Case(
        "time-spanish-twenty-four-hour",
      ).normalized;
      const currency = resultForTask3_3Case(
        "currency-spanish-euro-symbol",
      ).normalized;
      const percentage = resultForTask3_3Case(
        "percentage-spanish-decimal",
      ).normalized;

      expect(textRoles(abbreviation)).toContain("abbreviation");
      expect(textRoles(decimal)).toContain("number");
      expect(textRoles(date)).toContain("date");
      expect(textRoles(time)).toContain("time");
      expect(textRoles(currency)).toContain("currency");
      expect(textRoles(percentage)).toContain("percentage");
      expect(normalizedBoundaryProtections(initials)).toContain(
        "initial-period",
      );
      expect(normalizedBoundaryProtections(decimal)).toContain("decimal-token");
      expect(normalizedBoundaryProtections(date)).toContain("date-token");
      expect(normalizedBoundaryProtections(time)).toContain("time-token");
      expect(normalizedBoundaryProtections(currency)).toContain(
        "currency-token",
      );
      expect(normalizedBoundaryProtections(percentage)).toContain(
        "percentage-token",
      );
    });

    it("preserves neutral, malformed, ambiguous, unsupported, and code forms", () => {
      for (const id of [
        "number-neutral-separator-ambiguous",
        "number-spanish-mixed-separators-unsupported",
        "date-spanish-invalid",
        "date-neutral-ambiguous",
        "time-spanish-invalid",
        "time-neutral-preserved",
        "currency-dollar-ambiguous",
        "language-explicit-unsupported-neutral",
        "language-malformed-tag-neutral",
      ]) {
        const corpusCase = TASK_3_3_CORPUS.find((entry) => entry.id === id);
        if (corpusCase === undefined) {
          throw new Error("expected preservation corpus case");
        }
        expect(resultForTask3_3Case(id).normalized.text).toBe(
          corpusCase.expected.narrationText,
        );
      }

      const unsupportedMagnitude = normalizeNarrationSourceTokens(
        leafFor(paragraph([text("999999", "es")])).sourceTokens,
        "es",
      );
      const codeNumeric = normalizeNarrationSourceTokens(
        leafFor(paragraph([code("24/07/2026 12,50 €", "es")])).sourceTokens,
        "es",
      );
      const attachedUnsupported = [
        "21 °F",
        "21°C",
        "1.234.56",
        "21 %",
        "21 EUR",
        "etc..",
      ];
      expect(unsupportedMagnitude.text).toBe("999999");
      expect(codeNumeric.text).toBe("24/07/2026 12,50 €");
      for (const source of attachedUnsupported) {
        expect(
          normalizeNarrationSourceTokens(
            leafFor(paragraph([text(source, "es")])).sourceTokens,
            "es",
          ).text,
        ).toBe(source);
      }
      expect(
        codeNumeric.units.every(
          (unit) => unit.kind !== "text" || unit.role === "code",
        ),
      ).toBe(true);
    });

    it("preserves decimal spelling and leading zeros without numeric conversion", () => {
      const leadingZero = resultForTask3_3Case(
        "number-spanish-decimal-leading-zero",
      );
      const euro = resultForTask3_3Case("currency-spanish-euro-symbol");

      expect(leadingZero.normalized.text).toBe("tres coma cero cinco");
      expect(euro.normalized.text).toBe("doce euros con cincuenta céntimos");
      assertSourceMapping(leadingZero.leaf, leadingZero.normalized);
      assertSourceMapping(euro.leaf, euro.normalized);
    });

    it("accepts exact numeric lookahead and rejects max-plus-one", () => {
      const maximum =
        NARRATION_V1_SOURCE_WINDOW_POLICY.parserLookaheadCodePointsHardMaximum;
      const exact = boundedSourceTokens(maximum, "9");
      const normalized = normalizeNarrationSourceTokens(exact, "es");

      expect(normalized.text).toBe("9".repeat(maximum));
      expect(normalized.units).toHaveLength(maximum);
      expectArchiveFailure(
        () =>
          normalizeNarrationSourceTokens(
            boundedSourceTokens(maximum + 1, "9"),
            "es",
          ),
        "resource-limit-exceeded",
      );
    });

    it("keeps every lexical expansion within the per-source ceiling", () => {
      for (const corpusCase of TASK_3_3_CORPUS) {
        const normalized = normalizeNarrationSourceTokens(
          corpusFixture(corpusCase).leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );
        for (const unit of normalized.units) {
          if (unit.kind === "text") {
            expect(Array.from(String(unit.text)).length).toBeLessThanOrEqual(
              NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum,
            );
          }
        }
      }
    });
  });

  describe("Task 3.4 composed invariants and privacy", () => {
    const composedCases = [
      {
        id: "mixed-spanish-lexical-symbol",
        block: paragraph([text("Dr. 21 & Mar.", "es")]),
        defaultLanguage: "es" as const,
        expected: "doctor veintiuno y Mar.",
        reparseAsCode: false,
      },
      {
        id: "mixed-language-code-boundary",
        block: paragraph([
          text("Dr. 21", "es"),
          text(" meets ", "en"),
          text("14:30.", "es"),
          code(" 1.20", "es"),
        ]),
        defaultLanguage: "und" as const,
        expected: "doctor veintiuno meets las catorce treinta. 1.20",
        reparseAsCode: false,
      },
      {
        id: "mixed-line-break-punctuation-number",
        block: paragraph(
          [
            text("narra-", "es"),
            Object.freeze({ kind: "line-break" as const }),
            text("ción. 12,5 %", "es"),
          ],
          "es",
        ),
        defaultLanguage: "und" as const,
        expected: "narración. doce coma cinco por ciento",
        reparseAsCode: false,
      },
    ] as const;

    for (const composedCase of composedCases) {
      it(composedCase.id, () => {
        const fixture = Object.freeze({
          block: composedCase.block,
          leaf: leafFor(composedCase.block),
        });
        const before = JSON.stringify(fixture.block);
        const first = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          composedCase.defaultLanguage,
        );
        const repeated = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          composedCase.defaultLanguage,
        );
        const reparsed = normalizeNarrationSourceTokens(
          singleTextFixture(String(first.text), composedCase.reparseAsCode)
            .sourceTokens,
          composedCase.defaultLanguage,
        );

        expect(first.text).toBe(composedCase.expected);
        expect(repeated).toEqual(first);
        expect(reparsed.text).toBe(first.text);
        expect(JSON.stringify(fixture.block)).toBe(before);
        assertSourceMapping(fixture.leaf, first);
        assertDeepFrozen(first);
        assertNormalizedTextMatchesUnits(first);
        assertNormalizedExpansionBound(first);
      });
    }

    it("covers every corpus category with one deterministic invariant gate", () => {
      for (const corpusCase of NARRATION_NORMALIZATION_CORPUS) {
        const fixture = corpusFixture(corpusCase);
        const before = JSON.stringify(fixture.block);
        const first = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );
        const repeated = normalizeNarrationSourceTokens(
          fixture.leaf.sourceTokens,
          corpusCase.defaultLanguage,
        );

        expect(repeated).toEqual(first);
        expect(first.text).toBe(corpusCase.expected.narrationText);
        expect(JSON.stringify(fixture.block)).toBe(before);
        assertSourceMapping(fixture.leaf, first);
        assertDeepFrozen(first);
        assertNormalizedTextMatchesUnits(first);
        assertNormalizedExpansionBound(first);
      }
    });

    it("keeps invalid and over-limit failures content-free", () => {
      const canary = "private-canary-task-3-4";
      const leaf = leafFor(paragraph([text(canary)]));
      const first = leaf.sourceTokens[0];
      if (first === undefined) {
        throw new Error("expected source token");
      }
      const malformed = Object.freeze({
        ...first,
        text: sensitive(canary),
      });
      const malformedContext = Object.freeze({
        ...first,
        textContext: undefined,
      }) as unknown as NarrationSourceToken;

      expectContentFreeFailure(
        () => normalizeNarrationSourceTokens([malformed], "und"),
        "internal-failure",
        canary,
      );
      expectContentFreeFailure(
        () => normalizeNarrationSourceTokens([malformedContext], "und"),
        "internal-failure",
        canary,
      );
      expectContentFreeFailure(
        () =>
          normalizeNarrationSourceTokens(
            boundedSourceTokens(
              NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum +
                1,
              "9",
            ),
            "es",
          ),
        "resource-limit-exceeded",
        canary,
      );
    });
  });

  it("keeps normalized unit unions closed", () => {
    expectTypeOf<NarrationNormalizedUnit["kind"]>().toEqualTypeOf<
      "omission" | "text"
    >();
  });
});

function sensitive(value: string): SensitivePublicationText {
  return value as SensitivePublicationText;
}

function text(value: string, language?: string) {
  return Object.freeze({
    kind: "text" as const,
    text: sensitive(value),
    ...(language === undefined ? {} : { language }),
  });
}

function code(value: string, language?: string) {
  return Object.freeze({
    kind: "code" as const,
    children: Object.freeze([text(value)]),
    ...(language === undefined ? {} : { language }),
  });
}

function paragraph(
  children: readonly SemanticInline[],
  language?: string,
): SemanticBlock {
  return Object.freeze({
    kind: "paragraph" as const,
    children: Object.freeze([...children]),
    ...(language === undefined ? {} : { language }),
  });
}

function semanticInline(unit: NarrationCorpusSourceUnit): SemanticInline {
  switch (unit.kind) {
    case "code":
      return code(String(unit.text), unit.semanticLanguage);
    case "line-break":
      return unit.semanticLanguage === undefined
        ? Object.freeze({ kind: "line-break" as const })
        : Object.freeze({
            kind: "emphasis" as const,
            language: unit.semanticLanguage,
            children: Object.freeze([
              Object.freeze({ kind: "line-break" as const }),
            ]),
          });
    case "text":
      return text(String(unit.text), unit.semanticLanguage);
  }
}

function corpusFixture(corpusCase: NarrationNormalizationCorpusCase) {
  const children = corpusCase.source.map(semanticInline);
  const block: SemanticBlock =
    corpusCase.blockKind === "heading"
      ? Object.freeze({
          kind: "heading",
          level: 2,
          children: Object.freeze(children),
        })
      : paragraph(children);
  return Object.freeze({ block, leaf: leafFor(block) });
}

function singleTextFixture(
  value: string,
  preserveAsCode: boolean,
): NarrationSourceTokenLeafEvent {
  return leafFor(paragraph([preserveAsCode ? code(value) : text(value)]));
}

function projection(blocks: readonly SemanticBlock[]): XhtmlDocumentProjection {
  const document = Object.freeze({
    id: DOCUMENT_ID,
    location: Object.freeze({
      kind: "spine",
      spineItemId: createSpineItemId("spine:0"),
      spineItemIndex: createIndex(0),
    }),
    blocks: Object.freeze([...blocks]),
  } as const satisfies SemanticDocument);
  return Object.freeze({
    document,
    addressableBlocks: Object.freeze(
      blocks.map((block) => Object.freeze({ block })),
    ),
  });
}

function tokenLeavesFor(
  blocks: readonly SemanticBlock[],
): readonly NarrationSourceTokenLeafEvent[] {
  const index = createPublicationLocatorIndex(
    decodeBookV1({
      schemaVersion: 1,
      identity: {
        scheme: "sha256",
        schemeVersion: 1,
        value: "0".repeat(64),
      },
      metadata: { title: "Synthetic normalization", authors: [] },
      resources: [
        {
          path: "chapter.xhtml",
          mediaType: "application/xhtml+xml",
          role: "content-document",
        },
      ],
      spine: [
        {
          id: "spine:0",
          index: 0,
          resourcePath: "chapter.xhtml",
        },
      ],
      navigation: [],
    }),
    [projection(blocks)],
    createEpubProcessingBudget(),
  );
  return mapNarrationSourceTokens(projectNarrationSource(index.blocks)).filter(
    (event): event is NarrationSourceTokenLeafEvent => event.kind === "leaf",
  );
}

function leafFor(
  blockOrBlocks: SemanticBlock | readonly SemanticBlock[],
): NarrationSourceTokenLeafEvent {
  const leaves = tokenLeavesFor(
    Array.isArray(blockOrBlocks) ? blockOrBlocks : [blockOrBlocks],
  );
  const leaf = leaves[0];
  if (leaf === undefined) {
    throw new Error("expected normalized source leaf");
  }
  return leaf;
}

function resultForCase(id: string): Readonly<{
  leaf: NarrationSourceTokenLeafEvent;
  normalized: NarrationNormalizedStream;
}> {
  const corpusCase = TASK_3_1_CORPUS.find((entry) => entry.id === id);
  if (corpusCase === undefined) {
    throw new Error("expected normalization corpus case");
  }
  const fixture = corpusFixture(corpusCase);
  return Object.freeze({
    leaf: fixture.leaf,
    normalized: normalizeNarrationSourceTokens(
      fixture.leaf.sourceTokens,
      corpusCase.defaultLanguage,
    ),
  });
}

function resultForTask3_2Case(id: string): Readonly<{
  leaf: NarrationSourceTokenLeafEvent;
  normalized: NarrationNormalizedStream;
}> {
  const corpusCase = TASK_3_2_CORPUS.find((entry) => entry.id === id);
  if (corpusCase === undefined) {
    throw new Error("expected punctuation normalization corpus case");
  }
  const fixture = corpusFixture(corpusCase);
  return Object.freeze({
    leaf: fixture.leaf,
    normalized: normalizeNarrationSourceTokens(
      fixture.leaf.sourceTokens,
      corpusCase.defaultLanguage,
    ),
  });
}

function resultForTask3_3Case(id: string): Readonly<{
  leaf: NarrationSourceTokenLeafEvent;
  normalized: NarrationNormalizedStream;
}> {
  const corpusCase = TASK_3_3_CORPUS.find((entry) => entry.id === id);
  if (corpusCase === undefined) {
    throw new Error("expected lexical normalization corpus case");
  }
  const fixture = corpusFixture(corpusCase);
  return Object.freeze({
    leaf: fixture.leaf,
    normalized: normalizeNarrationSourceTokens(
      fixture.leaf.sourceTokens,
      corpusCase.defaultLanguage,
    ),
  });
}

function textRoles(normalized: NarrationNormalizedStream): readonly string[] {
  return normalized.units.flatMap((unit) =>
    unit.kind === "text" ? [unit.role] : [],
  );
}

function normalizedBoundaryProtections(
  normalized: NarrationNormalizedStream,
): readonly NarrationNormalizationBoundaryProtection[] {
  return [
    ...new Set(
      normalized.units.flatMap(({ boundaryProtections }) =>
        Array.from(boundaryProtections),
      ),
    ),
  ].sort();
}

function assertSourceMapping(
  leaf: NarrationSourceTokenLeafEvent,
  normalized: NarrationNormalizedStream,
): void {
  expect(normalized.units).toHaveLength(leaf.sourceTokens.length);
  for (let index = 0; index < normalized.units.length; index += 1) {
    const unit = normalized.units[index];
    const token = leaf.sourceTokens[index];
    if (unit === undefined || token === undefined) {
      throw new Error("expected mapped normalization unit");
    }
    expect(unit.sourceSpan).toEqual(token.sourceSpan);
    const range = createNarrationSourceTokenRange(
      leaf.locatedBlock,
      unit.sourceSpan,
    );
    expect(range.start.textOffsetCodePoints).toBe(
      unit.sourceSpan.startOffsetCodePoints,
    );
    expect(range.end.textOffsetCodePoints).toBe(
      unit.sourceSpan.endOffsetCodePoints,
    );
    if (unit.kind === "text") {
      expect(Array.from(String(unit.text)).length).toBeGreaterThan(0);
    }
  }
}

function assertDeepFrozen(normalized: NarrationNormalizedStream): void {
  expect(Object.isFrozen(normalized)).toBe(true);
  expect(Object.isFrozen(normalized.units)).toBe(true);
  for (const unit of normalized.units) {
    expect(Object.isFrozen(unit)).toBe(true);
    expect(Object.isFrozen(unit.sourceSpan)).toBe(true);
    expect(Object.isFrozen(unit.textContext)).toBe(true);
    expect(Object.isFrozen(unit.textContext.inlineContainers)).toBe(true);
    expect(Object.isFrozen(unit.boundaryProtections)).toBe(true);
  }
}

function assertNormalizedTextMatchesUnits(
  normalized: NarrationNormalizedStream,
): void {
  const textParts: string[] = [];
  for (const unit of normalized.units) {
    if (unit.kind === "text") {
      expect(Array.from(String(unit.text)).length).toBeGreaterThan(0);
      textParts.push(String(unit.text));
    }
  }
  expect(textParts.join("")).toBe(normalized.text);
}

function assertNormalizedExpansionBound(
  normalized: NarrationNormalizedStream,
): void {
  const maximum =
    NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum;
  for (const unit of normalized.units) {
    if (unit.kind === "text") {
      expect(Array.from(String(unit.text)).length).toBeLessThanOrEqual(maximum);
    }
  }
}

function lineEndHyphenRoles(
  units: readonly NarrationNormalizedUnit[],
): readonly string[] {
  return units.flatMap((unit) =>
    unit.kind === "text" && unit.role === "line-end-hyphen" ? [unit.role] : [],
  );
}

function expectInternalFailure(action: () => unknown): void {
  expectArchiveFailure(action, "internal-failure");
}

function boundedSourceTokens(
  count: number,
  value = "a",
): readonly NarrationSourceToken[] {
  const textContext = Object.freeze({
    inlineContainers: Object.freeze([]),
  });
  return Object.freeze(
    Array.from({ length: count }, (_, index) =>
      Object.freeze({
        kind: "text" as const,
        text: sensitive(value),
        sourceSpan: Object.freeze({
          startOffsetCodePoints: createIndex(index),
          endOffsetCodePoints: createIndex(index + 1),
        }),
        textContext,
      }),
    ),
  );
}

function expectArchiveFailure(
  action: () => unknown,
  code: "internal-failure" | "resource-limit-exceeded",
): void {
  let captured: unknown;
  try {
    action();
  } catch (error: unknown) {
    captured = error;
  }
  expect(captured).toBeInstanceOf(EpubArchiveError);
  expect(captured).toMatchObject({
    code,
    message: code,
  });
  expect(captured).not.toHaveProperty("cause");
  expect(JSON.stringify(captured).includes("private-canary")).toBe(false);
}

function expectContentFreeFailure(
  action: () => unknown,
  code: "internal-failure" | "resource-limit-exceeded",
  canary: string,
): void {
  let captured: unknown;
  try {
    action();
  } catch (error: unknown) {
    captured = error;
  }

  expect(captured).toBeInstanceOf(EpubArchiveError);
  expect(captured).toMatchObject({
    code,
    message: code,
    name: "EpubArchiveError",
  });
  expect(captured).not.toHaveProperty("cause");
  expect(Object.keys(captured as object)).toHaveLength(2);
  expect(Object.keys(captured as object)).toEqual(
    expect.arrayContaining(["code", "name"]),
  );
  expect(String(captured)).not.toContain(canary);
  expect(JSON.stringify(captured)).not.toContain(canary);
  expect(String((captured as Error).stack)).not.toContain(canary);
}
