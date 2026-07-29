/**
 * Closed `narration-v1` allowlist for line-end Spanish hyphenation.
 *
 * A source line break does not prove that an adjacent hyphen is discretionary:
 * it may be a genuine compound. Task 3.1 therefore joins only the exact split
 * accepted by the Task 1.2 corpus. Extending this policy requires adding
 * positive and negative corpus evidence first.
 */
export function isAcceptedSpanishLineEndHyphenation(
  leftFragment: string,
  rightFragment: string,
): boolean {
  return leftFragment === "narra" && rightFragment === "ción";
}

/**
 * Closed `narration-v1` Spanish symbol expansions accepted by the Task 1.2
 * corpus. The normalizer still owns source context, language, and span checks;
 * this module owns only the exact source/output table.
 */
export const SPANISH_AMPERSAND_NARRATION = "y";

export const SPANISH_CELSIUS_NORMALIZATION = Object.freeze([
  Object.freeze({ source: "2", narration: "veinte" }),
  Object.freeze({ source: "0", narration: undefined }),
  Object.freeze({ source: " ", narration: " " }),
  Object.freeze({ source: "°", narration: "grados " }),
  Object.freeze({ source: "C", narration: "Celsius" }),
] as const);

/**
 * Closed Task 3.3 Spanish lexical and numeric forms.
 *
 * These entries intentionally mirror only the forms accepted by the Task 1.2
 * corpus. They are ordered from the most specific form to the shortest so a
 * currency, percentage, date, or time is claimed before one of its component
 * numbers. The normalizer owns language, source-boundary, lookahead, and
 * source-span enforcement.
 */
export const SPANISH_LEXICAL_NORMALIZATION_FORMS = Object.freeze([
  Object.freeze({
    source: "las 14:30",
    narration: "las catorce treinta",
    kind: "time",
    boundaryProtections: Object.freeze(["time-token"] as const),
  }),
  Object.freeze({
    source: "24/07/2026",
    narration: "veinticuatro de julio de dos mil veintiséis",
    kind: "date",
    boundaryProtections: Object.freeze(["date-token"] as const),
  }),
  Object.freeze({
    source: "2026-07-24",
    narration: "veinticuatro de julio de dos mil veintiséis",
    kind: "date",
    boundaryProtections: Object.freeze(["date-token"] as const),
  }),
  Object.freeze({
    source: "12,50 €",
    narration: "doce euros con cincuenta céntimos",
    kind: "currency",
    boundaryProtections: Object.freeze([
      "currency-token",
      "decimal-token",
    ] as const),
  }),
  Object.freeze({
    source: "US$20",
    narration: "veinte dólares estadounidenses",
    kind: "currency",
    boundaryProtections: Object.freeze(["currency-token"] as const),
  }),
  Object.freeze({
    source: "20 EUR",
    narration: "veinte euros",
    kind: "currency",
    boundaryProtections: Object.freeze(["currency-token"] as const),
  }),
  Object.freeze({
    source: "12,5 %",
    narration: "doce coma cinco por ciento",
    kind: "percentage",
    boundaryProtections: Object.freeze([
      "decimal-token",
      "percentage-token",
    ] as const),
  }),
  Object.freeze({
    source: "25 %",
    narration: "veinticinco por ciento",
    kind: "percentage",
    boundaryProtections: Object.freeze(["percentage-token"] as const),
  }),
  Object.freeze({
    source: "p. ej.",
    narration: "por ejemplo",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["abbreviation-period"] as const),
  }),
  Object.freeze({
    source: "1.234",
    narration: "mil doscientos treinta y cuatro",
    kind: "number",
    boundaryProtections: Object.freeze(["thousands-token"] as const),
  }),
  Object.freeze({
    source: "3,14",
    narration: "tres coma catorce",
    kind: "number",
    boundaryProtections: Object.freeze(["decimal-token"] as const),
  }),
  Object.freeze({
    source: "3,05",
    narration: "tres coma cero cinco",
    kind: "number",
    boundaryProtections: Object.freeze(["decimal-token"] as const),
  }),
  Object.freeze({
    source: "14:30",
    narration: "las catorce treinta",
    kind: "time",
    boundaryProtections: Object.freeze(["time-token"] as const),
  }),
  Object.freeze({
    source: "1.º",
    narration: "primer",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "1.ª",
    narration: "primera",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "Dra.",
    narration: "doctora",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["abbreviation-period"] as const),
  }),
  Object.freeze({
    source: "Dr.",
    narration: "doctor",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["abbreviation-period"] as const),
  }),
  Object.freeze({
    source: "etc.",
    narration: "etcétera.",
    kind: "abbreviation",
    boundaryProtections: Object.freeze([
      "abbreviation-period",
      "sentence-end",
    ] as const),
  }),
  Object.freeze({
    source: "2026",
    narration: "dos mil veintiséis",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "42",
    narration: "cuarenta y dos",
    kind: "number",
    boundaryProtections: Object.freeze(["language-span"] as const),
  }),
  Object.freeze({
    source: "21",
    narration: "veintiuno",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "-5",
    narration: "menos cinco",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "+3",
    narration: "más tres",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
  Object.freeze({
    source: "0",
    narration: "cero",
    kind: "number",
    boundaryProtections: Object.freeze([] as const),
  }),
] as const);

/**
 * Closed forms whose punctuation must be protected while their source text is
 * preserved. Specific unsupported forms also block an accepted component
 * number from being rewritten out of context.
 */
export const SPANISH_LEXICAL_PRESERVATION_FORMS = Object.freeze([
  Object.freeze({
    source: "1,234.56",
    language: "es",
    kind: "number",
    boundaryProtections: Object.freeze([
      "decimal-token",
      "thousands-token",
    ] as const),
  }),
  Object.freeze({
    source: "31/02/2026",
    language: "es",
    kind: "date",
    boundaryProtections: Object.freeze(["date-token"] as const),
  }),
  Object.freeze({
    source: "07/08/2026",
    language: "und",
    kind: "date",
    boundaryProtections: Object.freeze(["date-token"] as const),
  }),
  Object.freeze({
    source: "21 °C",
    language: "es",
    kind: "number",
    boundaryProtections: Object.freeze(["symbol-token"] as const),
  }),
  Object.freeze({
    source: "A. B.",
    language: "es",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["initial-period"] as const),
  }),
  Object.freeze({
    source: "1,234",
    language: "und",
    kind: "number",
    boundaryProtections: Object.freeze([
      "decimal-token",
      "thousands-token",
    ] as const),
  }),
  Object.freeze({
    source: "25:90",
    language: "es",
    kind: "time",
    boundaryProtections: Object.freeze(["time-token"] as const),
  }),
  Object.freeze({
    source: "08:05",
    language: "und",
    kind: "time",
    boundaryProtections: Object.freeze(["time-token"] as const),
  }),
  Object.freeze({
    source: "$20",
    language: "es",
    kind: "currency",
    boundaryProtections: Object.freeze(["currency-token"] as const),
  }),
  Object.freeze({
    source: "Av.",
    language: "es",
    kind: "abbreviation",
    boundaryProtections: Object.freeze(["abbreviation-period"] as const),
  }),
] as const);
