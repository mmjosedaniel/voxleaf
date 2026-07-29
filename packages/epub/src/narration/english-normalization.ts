/**
 * Closed `narration-bilingual-v2` English symbol expansions. The normalizer
 * owns source context, language, boundary, and source-span enforcement.
 */
export const ENGLISH_AMPERSAND_NARRATION = "and";

export const ENGLISH_CELSIUS_NORMALIZATION = Object.freeze([
  Object.freeze({ source: "2", narration: "twenty" }),
  Object.freeze({ source: "0", narration: undefined }),
  Object.freeze({ source: " ", narration: " " }),
  Object.freeze({ source: "°", narration: "degrees " }),
  Object.freeze({ source: "C", narration: "Celsius" }),
] as const);

/**
 * Frozen v2 English forms. This is intentionally an exact allowlist rather
 * than a general number parser: unsupported or ambiguous input remains
 * unchanged under the selected language.
 */
export const ENGLISH_LEXICAL_NORMALIZATION_FORMS = Object.freeze([
  Object.freeze({
    source: "2026-07-24",
    narration: "July twenty-fourth, two thousand twenty-six",
    kind: "date",
    boundaryProtections: Object.freeze(["date-token"] as const),
  }),
  Object.freeze({
    source: "$12.50",
    narration: "twelve dollars and fifty cents",
    kind: "currency",
    boundaryProtections: Object.freeze([
      "currency-token",
      "decimal-token",
    ] as const),
  }),
  Object.freeze({
    source: "25 %",
    narration: "twenty-five percent",
    kind: "percentage",
    boundaryProtections: Object.freeze(["percentage-token"] as const),
  }),
  Object.freeze({
    source: "14:30",
    narration: "fourteen thirty",
    kind: "time",
    boundaryProtections: Object.freeze(["time-token"] as const),
  }),
  Object.freeze({
    source: "120",
    narration: "one hundred twenty",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "21st",
    narration: "twenty-first",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "3rd",
    narration: "third",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "U.S.",
    narration: "U S",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["initial-period"] as const),
  }),
  Object.freeze({
    source: "a.m.",
    narration: "a m.",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["abbreviation-period"] as const),
  }),
  Object.freeze({
    source: "Dr.",
    narration: "Doctor",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["abbreviation-period"] as const),
  }),
  Object.freeze({
    source: "Mr.",
    narration: "Mister",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["abbreviation-period"] as const),
  }),
  Object.freeze({
    source: "St.",
    narration: "Saint",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["abbreviation-period"] as const),
  }),
  Object.freeze({
    source: "8",
    narration: "eight",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
] as const);

export const ENGLISH_LEXICAL_PRESERVATION_FORMS = Object.freeze([
  Object.freeze({
    source: "12345678901234567890",
    language: "en",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "03/04/05",
    language: "en",
    kind: "date",
    boundaryProtections: Object.freeze(["date-token"] as const),
  }),
  Object.freeze({
    source: "v2.0",
    language: "en",
    kind: "number",
    boundaryProtections: Object.freeze(["decimal-token"] as const),
  }),
] as const);
