/**
 * Repository-authored synthetic narration policy fixtures.
 *
 * Every string in this file is synthetic and sensitive. Consumers must not
 * place source or expected narration text in snapshots, test names, errors,
 * metrics, or diagnostics. This module is test-only and is not a production
 * normalization implementation.
 */

declare const syntheticSensitiveTextBrand: unique symbol;

export type SyntheticSensitiveNarrationText = string & {
  readonly [syntheticSensitiveTextBrand]: "SyntheticSensitiveNarrationText";
};

export type NarrationCorpusLanguage = "es" | "und";
export type NarrationCorpusBlockKind = "heading" | "paragraph";

export const NARRATION_NORMALIZATION_CATEGORIES = Object.freeze([
  "whitespace",
  "line-break",
  "hyphenation",
  "punctuation",
  "abbreviation",
  "number",
  "date",
  "time",
  "currency",
  "percentage",
  "symbol",
  "code",
  "unicode",
  "language",
  "malformed",
  "foreign-name",
] as const);

export type NarrationNormalizationCategory =
  (typeof NARRATION_NORMALIZATION_CATEGORIES)[number];

export const NARRATION_BOUNDARY_PROTECTIONS = Object.freeze([
  "abbreviation-period",
  "astral-code-point",
  "code-span",
  "combining-sequence",
  "currency-token",
  "date-token",
  "decimal-token",
  "dialogue-turn",
  "ellipsis",
  "foreign-name",
  "genuine-compound",
  "initial-period",
  "language-span",
  "line-end-hyphen",
  "malformed-punctuation",
  "percentage-token",
  "semantic-line-break",
  "sentence-end",
  "symbol-token",
  "thousands-token",
  "time-token",
] as const);

export type NarrationBoundaryProtection =
  (typeof NARRATION_BOUNDARY_PROTECTIONS)[number];

export type NarrationAmbiguityPolicy =
  "none" | "preserve-ambiguous" | "preserve-unsupported";

export type NarrationNormalizationAction = "preserve" | "remove" | "transform";

interface NarrationCorpusUnitBase {
  readonly effectiveLanguage: NarrationCorpusLanguage;
  readonly semanticLanguage?: string;
}

export interface NarrationCorpusTextUnit extends NarrationCorpusUnitBase {
  readonly kind: "text";
  readonly text: SyntheticSensitiveNarrationText;
}

export interface NarrationCorpusCodeUnit extends NarrationCorpusUnitBase {
  readonly kind: "code";
  readonly text: SyntheticSensitiveNarrationText;
}

export interface NarrationCorpusLineBreakUnit extends NarrationCorpusUnitBase {
  readonly kind: "line-break";
}

export type NarrationCorpusSourceUnit =
  | NarrationCorpusCodeUnit
  | NarrationCorpusLineBreakUnit
  | NarrationCorpusTextUnit;

export interface NarrationNormalizationExpectation {
  readonly narrationText: SyntheticSensitiveNarrationText;
  readonly action: NarrationNormalizationAction;
  readonly ambiguity: NarrationAmbiguityPolicy;
  readonly boundaryProtections: readonly NarrationBoundaryProtection[];
}

export interface NarrationNormalizationCorpusCase {
  readonly id: string;
  readonly category: NarrationNormalizationCategory;
  readonly sensitivity: "synthetic-sensitive";
  readonly blockKind: NarrationCorpusBlockKind;
  readonly defaultLanguage: NarrationCorpusLanguage;
  readonly source: readonly NarrationCorpusSourceUnit[];
  readonly expected: NarrationNormalizationExpectation;
}

export type NarrationCorpusValidationCode =
  | "case-duplicate-id"
  | "case-duplicate-source"
  | "case-expectation-invalid"
  | "case-invalid"
  | "case-not-frozen"
  | "case-source-invalid"
  | "corpus-invalid";

export type NarrationCorpusValidationResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; code: NarrationCorpusValidationCode }>;

const VALID_RESULT: NarrationCorpusValidationResult = Object.freeze({
  ok: true,
});
const CATEGORY_SET = new Set<string>(NARRATION_NORMALIZATION_CATEGORIES);
const PROTECTION_SET = new Set<string>(NARRATION_BOUNDARY_PROTECTIONS);
const LANGUAGE_SET = new Set<string>(["es", "und"]);
const ACTION_SET = new Set<string>(["preserve", "remove", "transform"]);
const AMBIGUITY_SET = new Set<string>([
  "none",
  "preserve-ambiguous",
  "preserve-unsupported",
]);

function sensitive(value: string): SyntheticSensitiveNarrationText {
  return value as SyntheticSensitiveNarrationText;
}

function text(
  value: string,
  effectiveLanguage: NarrationCorpusLanguage,
  semanticLanguage?: string,
): NarrationCorpusTextUnit {
  return Object.freeze({
    kind: "text",
    text: sensitive(value),
    effectiveLanguage,
    ...(semanticLanguage === undefined ? {} : { semanticLanguage }),
  });
}

function code(
  value: string,
  effectiveLanguage: NarrationCorpusLanguage,
  semanticLanguage?: string,
): NarrationCorpusCodeUnit {
  return Object.freeze({
    kind: "code",
    text: sensitive(value),
    effectiveLanguage,
    ...(semanticLanguage === undefined ? {} : { semanticLanguage }),
  });
}

function lineBreak(
  effectiveLanguage: NarrationCorpusLanguage,
  semanticLanguage?: string,
): NarrationCorpusLineBreakUnit {
  return Object.freeze({
    kind: "line-break",
    effectiveLanguage,
    ...(semanticLanguage === undefined ? {} : { semanticLanguage }),
  });
}

interface CorpusCaseInput {
  readonly id: string;
  readonly category: NarrationNormalizationCategory;
  readonly blockKind?: NarrationCorpusBlockKind;
  readonly defaultLanguage: NarrationCorpusLanguage;
  readonly source: readonly NarrationCorpusSourceUnit[];
  readonly narrationText: string;
  readonly action: NarrationNormalizationAction;
  readonly ambiguity?: NarrationAmbiguityPolicy;
  readonly boundaryProtections?: readonly NarrationBoundaryProtection[];
}

function corpusCase(input: CorpusCaseInput): NarrationNormalizationCorpusCase {
  return Object.freeze({
    id: input.id,
    category: input.category,
    sensitivity: "synthetic-sensitive",
    blockKind: input.blockKind ?? "paragraph",
    defaultLanguage: input.defaultLanguage,
    source: Object.freeze([...input.source]),
    expected: Object.freeze({
      narrationText: sensitive(input.narrationText),
      action: input.action,
      ambiguity: input.ambiguity ?? "none",
      boundaryProtections: Object.freeze([
        ...(input.boundaryProtections ?? []),
      ]),
    }),
  });
}

/**
 * The authoritative Task 1.2 policy table. Production rules added by later
 * Milestone 5 tasks must satisfy these exact test-only expectations.
 */
export const NARRATION_NORMALIZATION_CORPUS: readonly NarrationNormalizationCorpusCase[] =
  Object.freeze([
    corpusCase({
      id: "whitespace-ordinary-neutral",
      category: "whitespace",
      defaultLanguage: "und",
      source: [text("  Alpha\t beta  gamma  ", "und")],
      narrationText: "Alpha beta gamma",
      action: "transform",
    }),
    corpusCase({
      id: "whitespace-nonbreaking-spanish",
      category: "whitespace",
      defaultLanguage: "es",
      source: [text("Uno\u00a0dos\u202ftres", "es")],
      narrationText: "Uno dos tres",
      action: "transform",
    }),
    corpusCase({
      id: "whitespace-zero-width-formatting",
      category: "whitespace",
      defaultLanguage: "es",
      source: [text("ca\u200bsa", "es")],
      narrationText: "casa",
      action: "remove",
    }),
    corpusCase({
      id: "whitespace-word-joiner-formatting",
      category: "whitespace",
      defaultLanguage: "und",
      source: [text("syn\u2060thetic", "und")],
      narrationText: "synthetic",
      action: "remove",
    }),
    corpusCase({
      id: "line-break-between-words",
      category: "line-break",
      defaultLanguage: "es",
      source: [text("Primera", "es"), lineBreak("es"), text("línea", "es")],
      narrationText: "Primera línea",
      action: "transform",
      boundaryProtections: ["semantic-line-break"],
    }),
    corpusCase({
      id: "line-break-after-sentence",
      category: "line-break",
      defaultLanguage: "es",
      source: [
        text("Termina.", "es"),
        lineBreak("es"),
        text("Continúa.", "es"),
      ],
      narrationText: "Termina. Continúa.",
      action: "transform",
      boundaryProtections: ["sentence-end", "semantic-line-break"],
    }),
    corpusCase({
      id: "hyphenation-soft-hyphen",
      category: "hyphenation",
      defaultLanguage: "es",
      source: [text("ex\u00adamen", "es")],
      narrationText: "examen",
      action: "remove",
    }),
    corpusCase({
      id: "hyphenation-spanish-line-end-join",
      category: "hyphenation",
      defaultLanguage: "es",
      source: [text("narra-", "es"), lineBreak("es"), text("ción", "es")],
      narrationText: "narración",
      action: "transform",
      boundaryProtections: ["line-end-hyphen", "semantic-line-break"],
    }),
    corpusCase({
      id: "hyphenation-genuine-compound",
      category: "hyphenation",
      defaultLanguage: "es",
      source: [text("teórico-", "es"), lineBreak("es"), text("práctico", "es")],
      narrationText: "teórico-práctico",
      action: "transform",
      boundaryProtections: [
        "genuine-compound",
        "line-end-hyphen",
        "semantic-line-break",
      ],
    }),
    corpusCase({
      id: "hyphenation-neutral-ambiguous",
      category: "hyphenation",
      defaultLanguage: "und",
      source: [text("re-", "und"), lineBreak("und"), text("form", "und")],
      narrationText: "re-form",
      action: "transform",
      ambiguity: "preserve-ambiguous",
      boundaryProtections: [
        "genuine-compound",
        "line-end-hyphen",
        "semantic-line-break",
      ],
    }),
    corpusCase({
      id: "punctuation-typographic-quotes",
      category: "punctuation",
      defaultLanguage: "es",
      source: [text("“Texto sintético”", "es")],
      narrationText: "“Texto sintético”",
      action: "preserve",
    }),
    corpusCase({
      id: "punctuation-spanish-opening-marks",
      category: "punctuation",
      defaultLanguage: "es",
      source: [text("¿Listo? ¡Sí!", "es")],
      narrationText: "¿Listo? ¡Sí!",
      action: "preserve",
      boundaryProtections: ["sentence-end"],
    }),
    corpusCase({
      id: "punctuation-ellipsis-character",
      category: "punctuation",
      defaultLanguage: "es",
      source: [text("Quizá… después.", "es")],
      narrationText: "Quizá… después.",
      action: "preserve",
      boundaryProtections: ["ellipsis", "sentence-end"],
    }),
    corpusCase({
      id: "punctuation-repeated-marks",
      category: "punctuation",
      defaultLanguage: "es",
      source: [text("¿Qué?!", "es")],
      narrationText: "¿Qué?!",
      action: "preserve",
      boundaryProtections: ["sentence-end"],
    }),
    corpusCase({
      id: "punctuation-dialogue-dash",
      category: "punctuation",
      defaultLanguage: "es",
      source: [text("—Habla la primera voz.", "es")],
      narrationText: "—Habla la primera voz.",
      action: "preserve",
      boundaryProtections: ["dialogue-turn", "sentence-end"],
    }),
    corpusCase({
      id: "abbreviation-spanish-honorific",
      category: "abbreviation",
      defaultLanguage: "es",
      source: [text("El Dr. Sol llegó.", "es")],
      narrationText: "El doctor Sol llegó.",
      action: "transform",
      boundaryProtections: ["abbreviation-period", "sentence-end"],
    }),
    corpusCase({
      id: "abbreviation-spanish-feminine-honorific",
      category: "abbreviation",
      defaultLanguage: "es",
      source: [text("La Dra. Mar habló.", "es")],
      narrationText: "La doctora Mar habló.",
      action: "transform",
      boundaryProtections: ["abbreviation-period", "sentence-end"],
    }),
    corpusCase({
      id: "abbreviation-spanish-common",
      category: "abbreviation",
      defaultLanguage: "es",
      source: [text("Lápiz, papel, etc.", "es")],
      narrationText: "Lápiz, papel, etcétera.",
      action: "transform",
      boundaryProtections: ["abbreviation-period", "sentence-end"],
    }),
    corpusCase({
      id: "abbreviation-spanish-multi-period",
      category: "abbreviation",
      defaultLanguage: "es",
      source: [text("Use color, p. ej., azul.", "es")],
      narrationText: "Use color, por ejemplo, azul.",
      action: "transform",
      boundaryProtections: ["abbreviation-period", "sentence-end"],
    }),
    corpusCase({
      id: "abbreviation-initials",
      category: "abbreviation",
      defaultLanguage: "es",
      source: [text("A. B. Vega llegó.", "es")],
      narrationText: "A. B. Vega llegó.",
      action: "preserve",
      boundaryProtections: ["initial-period", "sentence-end"],
    }),
    corpusCase({
      id: "abbreviation-ambiguous-avenue",
      category: "abbreviation",
      defaultLanguage: "es",
      source: [text("Av. Central", "es")],
      narrationText: "Av. Central",
      action: "preserve",
      ambiguity: "preserve-ambiguous",
      boundaryProtections: ["abbreviation-period"],
    }),
    corpusCase({
      id: "number-spanish-zero",
      category: "number",
      defaultLanguage: "es",
      source: [text("0", "es")],
      narrationText: "cero",
      action: "transform",
    }),
    corpusCase({
      id: "number-spanish-cardinal",
      category: "number",
      defaultLanguage: "es",
      source: [text("21", "es")],
      narrationText: "veintiuno",
      action: "transform",
    }),
    corpusCase({
      id: "number-spanish-negative",
      category: "number",
      defaultLanguage: "es",
      source: [text("-5", "es")],
      narrationText: "menos cinco",
      action: "transform",
    }),
    corpusCase({
      id: "number-spanish-positive",
      category: "number",
      defaultLanguage: "es",
      source: [text("+3", "es")],
      narrationText: "más tres",
      action: "transform",
    }),
    corpusCase({
      id: "number-spanish-ordinal-masculine",
      category: "number",
      defaultLanguage: "es",
      source: [text("1.º puesto", "es")],
      narrationText: "primer puesto",
      action: "transform",
    }),
    corpusCase({
      id: "number-spanish-ordinal-feminine",
      category: "number",
      defaultLanguage: "es",
      source: [text("1.ª prueba", "es")],
      narrationText: "primera prueba",
      action: "transform",
    }),
    corpusCase({
      id: "number-spanish-decimal",
      category: "number",
      defaultLanguage: "es",
      source: [text("3,14", "es")],
      narrationText: "tres coma catorce",
      action: "transform",
      boundaryProtections: ["decimal-token"],
    }),
    corpusCase({
      id: "number-spanish-decimal-leading-zero",
      category: "number",
      defaultLanguage: "es",
      source: [text("3,05", "es")],
      narrationText: "tres coma cero cinco",
      action: "transform",
      boundaryProtections: ["decimal-token"],
    }),
    corpusCase({
      id: "number-spanish-thousands",
      category: "number",
      defaultLanguage: "es",
      source: [text("1.234", "es")],
      narrationText: "mil doscientos treinta y cuatro",
      action: "transform",
      boundaryProtections: ["thousands-token"],
    }),
    corpusCase({
      id: "number-neutral-separator-ambiguous",
      category: "number",
      defaultLanguage: "und",
      source: [text("1,234", "und")],
      narrationText: "1,234",
      action: "preserve",
      ambiguity: "preserve-ambiguous",
      boundaryProtections: ["decimal-token", "thousands-token"],
    }),
    corpusCase({
      id: "number-spanish-mixed-separators-unsupported",
      category: "number",
      defaultLanguage: "es",
      source: [text("1,234.56", "es")],
      narrationText: "1,234.56",
      action: "preserve",
      ambiguity: "preserve-unsupported",
      boundaryProtections: ["decimal-token", "thousands-token"],
    }),
    corpusCase({
      id: "number-spanish-year-context",
      category: "number",
      defaultLanguage: "es",
      source: [text("año 2026", "es")],
      narrationText: "año dos mil veintiséis",
      action: "transform",
    }),
    corpusCase({
      id: "date-spanish-slash",
      category: "date",
      defaultLanguage: "es",
      source: [text("24/07/2026", "es")],
      narrationText: "veinticuatro de julio de dos mil veintiséis",
      action: "transform",
      boundaryProtections: ["date-token"],
    }),
    corpusCase({
      id: "date-spanish-iso",
      category: "date",
      defaultLanguage: "es",
      source: [text("2026-07-24", "es")],
      narrationText: "veinticuatro de julio de dos mil veintiséis",
      action: "transform",
      boundaryProtections: ["date-token"],
    }),
    corpusCase({
      id: "date-spanish-invalid",
      category: "date",
      defaultLanguage: "es",
      source: [text("31/02/2026", "es")],
      narrationText: "31/02/2026",
      action: "preserve",
      ambiguity: "preserve-unsupported",
      boundaryProtections: ["date-token"],
    }),
    corpusCase({
      id: "date-neutral-ambiguous",
      category: "date",
      defaultLanguage: "und",
      source: [text("07/08/2026", "und")],
      narrationText: "07/08/2026",
      action: "preserve",
      ambiguity: "preserve-ambiguous",
      boundaryProtections: ["date-token"],
    }),
    corpusCase({
      id: "time-spanish-twenty-four-hour",
      category: "time",
      defaultLanguage: "es",
      source: [text("14:30", "es")],
      narrationText: "las catorce treinta",
      action: "transform",
      boundaryProtections: ["time-token"],
    }),
    corpusCase({
      id: "time-spanish-invalid",
      category: "time",
      defaultLanguage: "es",
      source: [text("25:90", "es")],
      narrationText: "25:90",
      action: "preserve",
      ambiguity: "preserve-unsupported",
      boundaryProtections: ["time-token"],
    }),
    corpusCase({
      id: "time-neutral-preserved",
      category: "time",
      defaultLanguage: "und",
      source: [text("08:05", "und")],
      narrationText: "08:05",
      action: "preserve",
      ambiguity: "preserve-ambiguous",
      boundaryProtections: ["time-token"],
    }),
    corpusCase({
      id: "currency-spanish-euro-symbol",
      category: "currency",
      defaultLanguage: "es",
      source: [text("12,50 €", "es")],
      narrationText: "doce euros con cincuenta céntimos",
      action: "transform",
      boundaryProtections: ["currency-token", "decimal-token"],
    }),
    corpusCase({
      id: "currency-spanish-euro-code",
      category: "currency",
      defaultLanguage: "es",
      source: [text("20 EUR", "es")],
      narrationText: "veinte euros",
      action: "transform",
      boundaryProtections: ["currency-token"],
    }),
    corpusCase({
      id: "currency-spanish-us-dollar",
      category: "currency",
      defaultLanguage: "es",
      source: [text("US$20", "es")],
      narrationText: "veinte dólares estadounidenses",
      action: "transform",
      boundaryProtections: ["currency-token"],
    }),
    corpusCase({
      id: "currency-dollar-ambiguous",
      category: "currency",
      defaultLanguage: "es",
      source: [text("$20", "es")],
      narrationText: "$20",
      action: "preserve",
      ambiguity: "preserve-ambiguous",
      boundaryProtections: ["currency-token"],
    }),
    corpusCase({
      id: "percentage-spanish-integer",
      category: "percentage",
      defaultLanguage: "es",
      source: [text("25 %", "es")],
      narrationText: "veinticinco por ciento",
      action: "transform",
      boundaryProtections: ["percentage-token"],
    }),
    corpusCase({
      id: "percentage-spanish-decimal",
      category: "percentage",
      defaultLanguage: "es",
      source: [text("12,5 %", "es")],
      narrationText: "doce coma cinco por ciento",
      action: "transform",
      boundaryProtections: ["decimal-token", "percentage-token"],
    }),
    corpusCase({
      id: "symbol-spanish-ampersand",
      category: "symbol",
      defaultLanguage: "es",
      source: [text("Sol & Mar", "es")],
      narrationText: "Sol y Mar",
      action: "transform",
      boundaryProtections: ["symbol-token"],
    }),
    corpusCase({
      id: "symbol-spanish-temperature",
      category: "symbol",
      defaultLanguage: "es",
      source: [text("20 °C", "es")],
      narrationText: "veinte grados Celsius",
      action: "transform",
      boundaryProtections: ["symbol-token"],
    }),
    corpusCase({
      id: "symbol-slash-ambiguous",
      category: "symbol",
      defaultLanguage: "es",
      source: [text("entrada/salida", "es")],
      narrationText: "entrada/salida",
      action: "preserve",
      ambiguity: "preserve-ambiguous",
      boundaryProtections: ["symbol-token"],
    }),
    corpusCase({
      id: "symbol-at-unsupported",
      category: "symbol",
      defaultLanguage: "es",
      source: [text("nombre@ejemplo", "es")],
      narrationText: "nombre@ejemplo",
      action: "preserve",
      ambiguity: "preserve-unsupported",
      boundaryProtections: ["symbol-token"],
    }),
    corpusCase({
      id: "code-punctuation-preserved",
      category: "code",
      defaultLanguage: "es",
      source: [code("total += 1;", "es")],
      narrationText: "total += 1;",
      action: "preserve",
      boundaryProtections: ["code-span"],
    }),
    corpusCase({
      id: "code-whitespace-preserved",
      category: "code",
      defaultLanguage: "und",
      source: [code("value  ===  3.05", "und")],
      narrationText: "value  ===  3.05",
      action: "preserve",
      boundaryProtections: ["code-span", "decimal-token"],
    }),
    corpusCase({
      id: "unicode-astral-preserved",
      category: "unicode",
      defaultLanguage: "es",
      source: [text("Sol 🌞", "es")],
      narrationText: "Sol 🌞",
      action: "preserve",
      ambiguity: "preserve-unsupported",
      boundaryProtections: ["astral-code-point"],
    }),
    corpusCase({
      id: "unicode-combining-sequence-preserved",
      category: "unicode",
      defaultLanguage: "es",
      source: [text("cafe\u0301", "es")],
      narrationText: "cafe\u0301",
      action: "preserve",
      boundaryProtections: ["combining-sequence"],
    }),
    corpusCase({
      id: "language-default-spanish",
      category: "language",
      defaultLanguage: "es",
      source: [text("42", "es")],
      narrationText: "cuarenta y dos",
      action: "transform",
      boundaryProtections: ["language-span"],
    }),
    corpusCase({
      id: "language-semantic-spanish-override",
      category: "language",
      defaultLanguage: "und",
      source: [text("21", "es", "ES-MX")],
      narrationText: "veintiuno",
      action: "transform",
      boundaryProtections: ["language-span"],
    }),
    corpusCase({
      id: "language-explicit-unsupported-neutral",
      category: "language",
      defaultLanguage: "es",
      source: [text("21", "und", "en")],
      narrationText: "21",
      action: "preserve",
      ambiguity: "preserve-unsupported",
      boundaryProtections: ["language-span"],
    }),
    corpusCase({
      id: "language-malformed-tag-neutral",
      category: "language",
      defaultLanguage: "es",
      source: [text("21", "und", "es--MX")],
      narrationText: "21",
      action: "preserve",
      ambiguity: "preserve-unsupported",
      boundaryProtections: ["language-span"],
    }),
    corpusCase({
      id: "language-mixed-spans",
      category: "language",
      defaultLanguage: "und",
      source: [text("Dr. Sol", "es", "es"), text(" meets Smith", "und", "en")],
      narrationText: "doctor Sol meets Smith",
      action: "transform",
      boundaryProtections: ["abbreviation-period", "language-span"],
    }),
    corpusCase({
      id: "malformed-unbalanced-quote",
      category: "malformed",
      defaultLanguage: "es",
      source: [text("“Texto sin cierre.", "es")],
      narrationText: "“Texto sin cierre.",
      action: "preserve",
      ambiguity: "preserve-unsupported",
      boundaryProtections: ["malformed-punctuation", "sentence-end"],
    }),
    corpusCase({
      id: "malformed-unbalanced-opening-question",
      category: "malformed",
      defaultLanguage: "es",
      source: [text("¿Pregunta sin cierre.", "es")],
      narrationText: "¿Pregunta sin cierre.",
      action: "preserve",
      ambiguity: "preserve-unsupported",
      boundaryProtections: ["malformed-punctuation", "sentence-end"],
    }),
    corpusCase({
      id: "foreign-name-preserved",
      category: "foreign-name",
      defaultLanguage: "es",
      source: [text("Shakespeare visitó Bogotá.", "es")],
      narrationText: "Shakespeare visitó Bogotá.",
      action: "preserve",
      boundaryProtections: ["foreign-name", "sentence-end"],
    }),
  ]);

function invalid(
  codeValue: NarrationCorpusValidationCode,
): NarrationCorpusValidationResult {
  return Object.freeze({ ok: false, code: codeValue });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFrozenStringArray(
  value: unknown,
  allowed: ReadonlySet<string>,
): value is readonly string[] {
  return (
    Array.isArray(value) &&
    Object.isFrozen(value) &&
    value.every((item) => typeof item === "string" && allowed.has(item)) &&
    new Set(value).size === value.length
  );
}

function validSourceUnit(value: unknown): boolean {
  if (!isRecord(value) || !Object.isFrozen(value)) {
    return false;
  }
  if (
    typeof value.kind !== "string" ||
    !LANGUAGE_SET.has(String(value.effectiveLanguage))
  ) {
    return false;
  }
  if (
    value.semanticLanguage !== undefined &&
    typeof value.semanticLanguage !== "string"
  ) {
    return false;
  }
  if (value.kind === "line-break") {
    return value.text === undefined;
  }
  return (
    (value.kind === "text" || value.kind === "code") &&
    typeof value.text === "string" &&
    value.text.length > 0
  );
}

function sourceSignature(entry: Readonly<Record<string, unknown>>): string {
  return JSON.stringify([entry.blockKind, entry.defaultLanguage, entry.source]);
}

/**
 * Performs content-free fixture integrity validation. Failure results contain
 * only a closed code and never include case identifiers or sensitive text.
 */
export function validateNarrationNormalizationCorpus(
  value: unknown,
): NarrationCorpusValidationResult {
  if (!Array.isArray(value) || !Object.isFrozen(value) || value.length === 0) {
    return invalid("corpus-invalid");
  }

  const identifiers = new Set<string>();
  const sourceSignatures = new Set<string>();

  for (const entry of value) {
    if (!isRecord(entry)) {
      return invalid("case-invalid");
    }
    if (
      !Object.isFrozen(entry) ||
      !Object.isFrozen(entry.source) ||
      !Object.isFrozen(entry.expected)
    ) {
      return invalid("case-not-frozen");
    }
    if (
      typeof entry.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) ||
      !CATEGORY_SET.has(String(entry.category)) ||
      entry.sensitivity !== "synthetic-sensitive" ||
      (entry.blockKind !== "heading" && entry.blockKind !== "paragraph") ||
      !LANGUAGE_SET.has(String(entry.defaultLanguage))
    ) {
      return invalid("case-invalid");
    }
    if (identifiers.has(entry.id)) {
      return invalid("case-duplicate-id");
    }
    identifiers.add(entry.id);

    if (
      !Array.isArray(entry.source) ||
      entry.source.length === 0 ||
      !entry.source.every(validSourceUnit)
    ) {
      return invalid("case-source-invalid");
    }
    const signature = sourceSignature(entry);
    if (sourceSignatures.has(signature)) {
      return invalid("case-duplicate-source");
    }
    sourceSignatures.add(signature);

    if (
      !isRecord(entry.expected) ||
      typeof entry.expected.narrationText !== "string" ||
      !ACTION_SET.has(String(entry.expected.action)) ||
      !AMBIGUITY_SET.has(String(entry.expected.ambiguity)) ||
      !isFrozenStringArray(entry.expected.boundaryProtections, PROTECTION_SET)
    ) {
      return invalid("case-expectation-invalid");
    }
  }

  return VALID_RESULT;
}
