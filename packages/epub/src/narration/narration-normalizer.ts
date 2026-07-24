import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  NarrationSourceSpan,
  NarrationSourceToken,
} from "./narration-source.js";
import type { NarrationSourceTextContext } from "./narration-source-projector.js";
import { NARRATION_V1_SOURCE_WINDOW_POLICY } from "./narration-policy.js";
import {
  isAcceptedSpanishLineEndHyphenation,
  SPANISH_AMPERSAND_NARRATION,
  SPANISH_CELSIUS_NORMALIZATION,
  SPANISH_LEXICAL_NORMALIZATION_FORMS,
  SPANISH_LEXICAL_PRESERVATION_FORMS,
} from "./spanish-normalization.js";

export type NarrationNormalizationLanguage = "es" | "und";

declare const sensitiveNormalizedNarrationTextBrand: unique symbol;

export type SensitiveNormalizedNarrationText = string & {
  readonly [sensitiveNormalizedNarrationTextBrand]: "SensitiveNormalizedNarrationText";
};

export type NarrationNormalizedTextRole =
  | "abbreviation"
  | "code"
  | "currency"
  | "date"
  | "dialogue-dash"
  | "ellipsis"
  | "line-end-hyphen"
  | "number"
  | "preserved"
  | "percentage"
  | "punctuation"
  | "quotation"
  | "semantic-line-break"
  | "symbol"
  | "time"
  | "whitespace";

export type NarrationNormalizationBoundaryProtection =
  | "abbreviation-period"
  | "code-span"
  | "currency-token"
  | "date-token"
  | "decimal-token"
  | "dialogue-turn"
  | "ellipsis"
  | "genuine-compound"
  | "initial-period"
  | "language-span"
  | "line-end-hyphen"
  | "malformed-punctuation"
  | "percentage-token"
  | "semantic-line-break"
  | "sentence-end"
  | "symbol-token"
  | "thousands-token"
  | "time-token";

export type NarrationNormalizationOmissionReason =
  | "collapsed-whitespace"
  | "formatting-mark"
  | "line-end-hyphen"
  | "lexical-expansion"
  | "raster-placeholder"
  | "semantic-line-break"
  | "soft-hyphen"
  | "symbol-expansion";

interface NarrationNormalizedUnitBase {
  readonly sourceSpan: NarrationSourceSpan;
  readonly textContext: NarrationSourceTextContext;
  readonly effectiveLanguage: NarrationNormalizationLanguage;
  readonly boundaryProtections: readonly NarrationNormalizationBoundaryProtection[];
}

export interface NarrationNormalizedTextUnit extends NarrationNormalizedUnitBase {
  readonly kind: "text";
  readonly text: SensitiveNormalizedNarrationText;
  readonly role: NarrationNormalizedTextRole;
}

export interface NarrationNormalizationOmission extends NarrationNormalizedUnitBase {
  readonly kind: "omission";
  readonly reason: NarrationNormalizationOmissionReason;
}

export type NarrationNormalizedUnit =
  NarrationNormalizationOmission | NarrationNormalizedTextUnit;

export interface NarrationNormalizedStream {
  readonly text: SensitiveNormalizedNarrationText;
  readonly units: readonly NarrationNormalizedUnit[];
}

type LineEndHyphenation = "joined" | "preserved";

interface ProvisionalTextUnit extends NarrationNormalizedTextUnit {
  readonly collapsible: boolean;
}

type ProvisionalUnit = NarrationNormalizationOmission | ProvisionalTextUnit;

interface PlannedTextReplacement {
  readonly kind: "text";
  readonly text: string;
  readonly role: NarrationNormalizedTextRole;
  readonly collapsible: boolean;
  readonly boundaryProtections: readonly NarrationNormalizationBoundaryProtection[];
}

interface PlannedOmissionReplacement {
  readonly kind: "omission";
  readonly reason: NarrationNormalizationOmissionReason;
  readonly boundaryProtections: readonly NarrationNormalizationBoundaryProtection[];
}

type PlannedReplacement = PlannedOmissionReplacement | PlannedTextReplacement;

interface PunctuationPlanEntry {
  readonly role: NarrationNormalizedTextRole;
  readonly boundaryProtections: readonly NarrationNormalizationBoundaryProtection[];
}

const SOFT_HYPHEN = "\u00ad";
const ZERO_WIDTH_SPACE = "\u200b";
const WORD_JOINER = "\u2060";
const NO_BOUNDARY_PROTECTIONS = Object.freeze(
  [] as NarrationNormalizationBoundaryProtection[],
);
const CODE_SPAN_PROTECTION = Object.freeze([
  "code-span",
] as NarrationNormalizationBoundaryProtection[]);
const LANGUAGE_SPAN_PROTECTION = Object.freeze([
  "language-span",
] as NarrationNormalizationBoundaryProtection[]);
const DIALOGUE_TURN_PROTECTION = Object.freeze([
  "dialogue-turn",
] as NarrationNormalizationBoundaryProtection[]);
const ELLIPSIS_PROTECTION = Object.freeze([
  "ellipsis",
] as NarrationNormalizationBoundaryProtection[]);
const GENUINE_COMPOUND_PROTECTION = Object.freeze([
  "genuine-compound",
  "line-end-hyphen",
] as NarrationNormalizationBoundaryProtection[]);
const LINE_END_HYPHEN_PROTECTION = Object.freeze([
  "line-end-hyphen",
] as NarrationNormalizationBoundaryProtection[]);
const MALFORMED_PUNCTUATION_PROTECTION = Object.freeze([
  "malformed-punctuation",
] as NarrationNormalizationBoundaryProtection[]);
const SEMANTIC_LINE_BREAK_PROTECTION = Object.freeze([
  "semantic-line-break",
] as NarrationNormalizationBoundaryProtection[]);
const SENTENCE_END_PROTECTION = Object.freeze([
  "sentence-end",
] as NarrationNormalizationBoundaryProtection[]);
const SYMBOL_TOKEN_PROTECTION = Object.freeze([
  "symbol-token",
] as NarrationNormalizationBoundaryProtection[]);
const SPANISH_WORD_CODE_POINTS = new Set(
  Array.from(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÉÍÓÚÜÑáéíóúüñ",
  ),
);

function fail(): never {
  throw new EpubArchiveError("internal-failure");
}

function resourceLimitExceeded(): never {
  throw new EpubArchiveError("resource-limit-exceeded");
}

function unreachable(value: never): never {
  void value;
  return fail();
}

function isAsciiAlpha(code: number): boolean {
  return (code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
}

function isAsciiDigit(code: number): boolean {
  return code >= 0x30 && code <= 0x39;
}

function isWellFormedLanguageTag(value: string): boolean {
  let subtagLength = 0;
  let subtagIndex = 0;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code === 0x2d) {
      if (
        subtagLength === 0 ||
        subtagLength > 8 ||
        (subtagIndex === 0 && subtagLength < 2)
      ) {
        return false;
      }
      subtagIndex += 1;
      subtagLength = 0;
      continue;
    }

    if (
      !(isAsciiAlpha(code) || (subtagIndex > 0 && isAsciiDigit(code))) ||
      subtagLength >= 8
    ) {
      return false;
    }
    subtagLength += 1;
  }

  return (
    subtagLength > 0 &&
    subtagLength <= 8 &&
    (subtagIndex > 0 || subtagLength >= 2)
  );
}

function hasSpanishPrimarySubtag(value: string): boolean {
  if (!isWellFormedLanguageTag(value)) {
    return false;
  }
  const separator = value.indexOf("-");
  const primary = separator === -1 ? value : value.slice(0, separator);
  return (
    primary.length === 2 &&
    (primary.charCodeAt(0) === 0x45 || primary.charCodeAt(0) === 0x65) &&
    (primary.charCodeAt(1) === 0x53 || primary.charCodeAt(1) === 0x73)
  );
}

function effectiveLanguage(
  textContext: NarrationSourceTextContext,
  defaultLanguage: NarrationNormalizationLanguage,
): NarrationNormalizationLanguage {
  if (textContext.language === undefined) {
    return defaultLanguage;
  }
  return hasSpanishPrimarySubtag(textContext.language) ? "es" : "und";
}

function copySourceSpan(sourceSpan: NarrationSourceSpan): NarrationSourceSpan {
  const { startOffsetCodePoints, endOffsetCodePoints } = sourceSpan;
  if (
    !Number.isSafeInteger(startOffsetCodePoints) ||
    !Number.isSafeInteger(endOffsetCodePoints) ||
    startOffsetCodePoints < 0 ||
    endOffsetCodePoints !== startOffsetCodePoints + 1
  ) {
    return fail();
  }
  return Object.freeze({
    startOffsetCodePoints,
    endOffsetCodePoints,
  });
}

function copyTextContext(
  textContext: NarrationSourceTextContext,
): NarrationSourceTextContext {
  return Object.freeze({
    ...(textContext.language === undefined
      ? {}
      : { language: textContext.language }),
    ...(textContext.direction === undefined
      ? {}
      : { direction: textContext.direction }),
    inlineContainers: Object.freeze([...textContext.inlineContainers]),
  });
}

function isCodeContext(textContext: NarrationSourceTextContext): boolean {
  return textContext.inlineContainers.includes("code");
}

function isOrdinaryWhitespace(value: string): boolean {
  if (value.length === 1) {
    const code = value.charCodeAt(0);
    return (
      (code >= 0x0009 && code <= 0x000d) ||
      code === 0x0020 ||
      code === 0x0085 ||
      code === 0x00a0 ||
      code === 0x1680 ||
      (code >= 0x2000 && code <= 0x200a) ||
      code === 0x2028 ||
      code === 0x2029 ||
      code === 0x202f ||
      code === 0x205f ||
      code === 0x3000
    );
  }
  return false;
}

function isSpanishWordCodePoint(value: string): boolean {
  return SPANISH_WORD_CODE_POINTS.has(value);
}

function sourceText(
  token: NarrationSourceToken | undefined,
): string | undefined {
  return token?.kind === "text" ? String(token.text) : undefined;
}

function isProseTextToken(token: NarrationSourceToken | undefined): boolean {
  return token?.kind === "text" && !isCodeContext(token.textContext);
}

function isWordContextCodePoint(value: string | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  const code = value.charCodeAt(0);
  return isSpanishWordCodePoint(value) || isAsciiDigit(code);
}

function hasSameLanguage(
  languages: readonly NarrationNormalizationLanguage[],
  startIndex: number,
  endIndexInclusive: number,
  requiredLanguage: NarrationNormalizationLanguage,
): boolean {
  for (let index = startIndex; index <= endIndexInclusive; index += 1) {
    if (languages[index] !== requiredLanguage) {
      return false;
    }
  }
  return true;
}

function mergedBoundaryProtections(
  ...groups: readonly (readonly NarrationNormalizationBoundaryProtection[])[]
): readonly NarrationNormalizationBoundaryProtection[] {
  const merged: NarrationNormalizationBoundaryProtection[] = [];
  for (const group of groups) {
    for (const protection of group) {
      if (!merged.includes(protection)) {
        merged.push(protection);
      }
    }
  }
  return merged.length === 0 ? NO_BOUNDARY_PROTECTIONS : Object.freeze(merged);
}

function languageProtectionsForSpan(
  tokens: readonly NarrationSourceToken[],
  startIndex: number,
  endIndexExclusive: number,
): readonly NarrationNormalizationBoundaryProtection[] {
  for (let index = startIndex; index < endIndexExclusive; index += 1) {
    if (tokens[index]?.textContext.language !== undefined) {
      return LANGUAGE_SPAN_PROTECTION;
    }
  }
  return NO_BOUNDARY_PROTECTIONS;
}

function isContextSafeSpanishAmpersand(
  tokens: readonly NarrationSourceToken[],
  index: number,
  languages: readonly NarrationNormalizationLanguage[],
): boolean {
  const token = tokens[index];
  const leftSpace = tokens[index - 1];
  const rightSpace = tokens[index + 1];
  const leftWord = tokens[index - 2];
  const rightWord = tokens[index + 2];
  return (
    sourceText(token) === "&" &&
    isProseTextToken(token) &&
    isProseTextToken(leftSpace) &&
    isOrdinaryWhitespace(sourceText(leftSpace) ?? "") &&
    isProseTextToken(rightSpace) &&
    isOrdinaryWhitespace(sourceText(rightSpace) ?? "") &&
    isProseTextToken(leftWord) &&
    isWordContextCodePoint(sourceText(leftWord)) &&
    isProseTextToken(rightWord) &&
    isWordContextCodePoint(sourceText(rightWord)) &&
    hasSameLanguage(languages, index - 2, index + 2, "es")
  );
}

function isExactSpanishCelsiusForm(
  tokens: readonly NarrationSourceToken[],
  startIndex: number,
  languages: readonly NarrationNormalizationLanguage[],
): boolean {
  for (
    let offset = 0;
    offset < SPANISH_CELSIUS_NORMALIZATION.length;
    offset += 1
  ) {
    const token = tokens[startIndex + offset];
    if (
      !isProseTextToken(token) ||
      sourceText(token) !== SPANISH_CELSIUS_NORMALIZATION[offset]?.source
    ) {
      return false;
    }
  }
  const endIndex = startIndex + SPANISH_CELSIUS_NORMALIZATION.length - 1;
  if (!hasSameLanguage(languages, startIndex, endIndex, "es")) {
    return false;
  }

  const before = sourceText(tokens[startIndex - 1]);
  const after = sourceText(
    tokens[startIndex + SPANISH_CELSIUS_NORMALIZATION.length],
  );
  return !isWordContextCodePoint(before) && !isWordContextCodePoint(after);
}

function findSymbolReplacements(
  tokens: readonly NarrationSourceToken[],
  languages: readonly NarrationNormalizationLanguage[],
): readonly (PlannedReplacement | undefined)[] {
  const replacements = new Array<PlannedReplacement | undefined>(tokens.length);

  for (let index = 0; index < tokens.length; index += 1) {
    if (isExactSpanishCelsiusForm(tokens, index, languages)) {
      for (
        let offset = 0;
        offset < SPANISH_CELSIUS_NORMALIZATION.length;
        offset += 1
      ) {
        const normalization = SPANISH_CELSIUS_NORMALIZATION[offset];
        if (normalization === undefined) {
          return fail();
        }
        replacements[index + offset] =
          normalization.narration === undefined
            ? Object.freeze({
                kind: "omission",
                reason: "symbol-expansion",
                boundaryProtections: SYMBOL_TOKEN_PROTECTION,
              })
            : Object.freeze({
                kind: "text",
                text: normalization.narration,
                role: normalization.source === " " ? "whitespace" : "symbol",
                collapsible: normalization.source === " ",
                boundaryProtections: SYMBOL_TOKEN_PROTECTION,
              });
      }
      index += SPANISH_CELSIUS_NORMALIZATION.length - 1;
      continue;
    }

    if (isContextSafeSpanishAmpersand(tokens, index, languages)) {
      replacements[index] = Object.freeze({
        kind: "text",
        text: SPANISH_AMPERSAND_NARRATION,
        role: "symbol",
        collapsible: false,
        boundaryProtections: SYMBOL_TOKEN_PROTECTION,
      });
    }
  }

  return Object.freeze(replacements);
}

type LexicalRole =
  "abbreviation" | "currency" | "date" | "number" | "percentage" | "time";

interface LexicalForm {
  readonly source: string;
  readonly kind: LexicalRole;
  readonly boundaryProtections: readonly NarrationNormalizationBoundaryProtection[];
}

interface LexicalNormalizationForm extends LexicalForm {
  readonly narration: string;
}

interface LexicalPreservationForm extends LexicalForm {
  readonly language: NarrationNormalizationLanguage;
}

function isLexicalBoundary(value: string | undefined): boolean {
  return !isWordContextCodePoint(value);
}

function hasAttachedNumericSyntax(
  tokens: readonly NarrationSourceToken[],
  startIndex: number,
  endIndexExclusive: number,
): boolean {
  const before = sourceText(tokens[startIndex - 1]);
  const after = sourceText(tokens[endIndexExclusive]);
  if (
    isNumericLookaheadCodePoint(before) ||
    isNumericLookaheadCodePoint(after) ||
    before === "€" ||
    before === "°" ||
    after === "€" ||
    after === "°"
  ) {
    return true;
  }
  if (!isOrdinaryWhitespace(after ?? "")) {
    return false;
  }
  const suffix = sourceText(tokens[endIndexExclusive + 1]);
  return (
    suffix === "%" ||
    suffix === "€" ||
    suffix === "°" ||
    (suffix === "E" &&
      sourceText(tokens[endIndexExclusive + 2]) === "U" &&
      sourceText(tokens[endIndexExclusive + 3]) === "R")
  );
}

function matchesLexicalForm(
  tokens: readonly NarrationSourceToken[],
  languages: readonly NarrationNormalizationLanguage[],
  replacements: readonly (PlannedReplacement | undefined)[],
  startIndex: number,
  form: LexicalForm,
  requiredLanguage: NarrationNormalizationLanguage,
): number | undefined {
  const source = Array.from(form.source);
  if (
    source.length === 0 ||
    source.length >
      NARRATION_V1_SOURCE_WINDOW_POLICY.parserLookaheadCodePointsHardMaximum
  ) {
    return fail();
  }
  const endIndexExclusive = startIndex + source.length;
  if (
    endIndexExclusive > tokens.length ||
    !isLexicalBoundary(sourceText(tokens[startIndex - 1])) ||
    !isLexicalBoundary(sourceText(tokens[endIndexExclusive])) ||
    (form.kind === "number" &&
      hasAttachedNumericSyntax(tokens, startIndex, endIndexExclusive)) ||
    (form.kind === "abbreviation" &&
      (sourceText(tokens[startIndex - 1]) === "." ||
        sourceText(tokens[endIndexExclusive]) === "."))
  ) {
    return undefined;
  }

  for (let offset = 0; offset < source.length; offset += 1) {
    const index = startIndex + offset;
    if (
      replacements[index] !== undefined ||
      !isProseTextToken(tokens[index]) ||
      sourceText(tokens[index]) !== source[offset] ||
      languages[index] !== requiredLanguage
    ) {
      return undefined;
    }
  }
  return endIndexExclusive;
}

function planLexicalSpan(
  replacements: (PlannedReplacement | undefined)[],
  tokens: readonly NarrationSourceToken[],
  startIndex: number,
  endIndexExclusive: number,
  role: LexicalRole,
  boundaryProtections: readonly NarrationNormalizationBoundaryProtection[],
  narration?: string,
): void {
  const protections = mergedBoundaryProtections(
    boundaryProtections,
    languageProtectionsForSpan(tokens, startIndex, endIndexExclusive),
  );
  if (narration === undefined) {
    for (let index = startIndex; index < endIndexExclusive; index += 1) {
      const value = sourceText(tokens[index]);
      if (value === undefined) {
        return fail();
      }
      replacements[index] = Object.freeze({
        kind: "text",
        text: value,
        role,
        collapsible: false,
        boundaryProtections: protections,
      });
    }
    return;
  }

  const narrationCodePoints = Array.from(narration);
  const sourceLength = endIndexExclusive - startIndex;
  const hardMaximum =
    NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum;
  if (narrationCodePoints.length > sourceLength * hardMaximum) {
    return resourceLimitExceeded();
  }

  let narrationIndex = 0;
  for (let index = startIndex; index < endIndexExclusive; index += 1) {
    const remainingSourcePositions = endIndexExclusive - index;
    const remainingNarration = narrationCodePoints.length - narrationIndex;
    const chunkLength = Math.min(
      hardMaximum,
      Math.ceil(remainingNarration / remainingSourcePositions),
    );
    if (chunkLength === 0) {
      replacements[index] = Object.freeze({
        kind: "omission",
        reason: "lexical-expansion",
        boundaryProtections: protections,
      });
      continue;
    }
    const text = narrationCodePoints
      .slice(narrationIndex, narrationIndex + chunkLength)
      .join("");
    narrationIndex += chunkLength;
    replacements[index] = Object.freeze({
      kind: "text",
      text,
      role,
      collapsible: false,
      boundaryProtections: protections,
    });
  }
  if (narrationIndex !== narrationCodePoints.length) {
    return fail();
  }
}

function isNumericLookaheadCodePoint(value: string | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return (
    isAsciiDigit(value.charCodeAt(0)) ||
    value === "." ||
    value === "," ||
    value === "/" ||
    value === ":" ||
    value === "+" ||
    value === "-" ||
    value === "$" ||
    value === "%" ||
    value === "º" ||
    value === "ª"
  );
}

function enforceNumericLookahead(
  tokens: readonly NarrationSourceToken[],
): void {
  const maximum =
    NARRATION_V1_SOURCE_WINDOW_POLICY.parserLookaheadCodePointsHardMaximum;
  for (let index = 0; index < tokens.length; index += 1) {
    const value = sourceText(tokens[index]);
    if (
      !isProseTextToken(tokens[index]) ||
      !isNumericLookaheadCodePoint(value) ||
      (index > 0 && isNumericLookaheadCodePoint(sourceText(tokens[index - 1])))
    ) {
      continue;
    }

    let length = 0;
    let hasDigit = false;
    let cursor = index;
    while (
      cursor < tokens.length &&
      isProseTextToken(tokens[cursor]) &&
      isNumericLookaheadCodePoint(sourceText(tokens[cursor]))
    ) {
      const candidate = sourceText(tokens[cursor]);
      hasDigit ||=
        candidate !== undefined && isAsciiDigit(candidate.charCodeAt(0));
      length += 1;
      cursor += 1;
    }
    if (hasDigit && length > maximum) {
      return resourceLimitExceeded();
    }
    index = cursor - 1;
  }
}

function findLexicalReplacements(
  tokens: readonly NarrationSourceToken[],
  languages: readonly NarrationNormalizationLanguage[],
  existingReplacements: readonly (PlannedReplacement | undefined)[],
): readonly (PlannedReplacement | undefined)[] {
  enforceNumericLookahead(tokens);
  const replacements = [...existingReplacements];

  for (let index = 0; index < tokens.length; index += 1) {
    if (replacements[index] !== undefined) {
      continue;
    }

    let matched = false;
    for (const form of SPANISH_LEXICAL_PRESERVATION_FORMS) {
      const endIndexExclusive = matchesLexicalForm(
        tokens,
        languages,
        replacements,
        index,
        form as LexicalPreservationForm,
        form.language,
      );
      if (endIndexExclusive === undefined) {
        continue;
      }
      planLexicalSpan(
        replacements,
        tokens,
        index,
        endIndexExclusive,
        form.kind,
        form.boundaryProtections,
      );
      index = endIndexExclusive - 1;
      matched = true;
      break;
    }
    if (matched) {
      continue;
    }

    for (const form of SPANISH_LEXICAL_NORMALIZATION_FORMS) {
      const endIndexExclusive = matchesLexicalForm(
        tokens,
        languages,
        replacements,
        index,
        form as LexicalNormalizationForm,
        "es",
      );
      if (endIndexExclusive === undefined) {
        continue;
      }
      planLexicalSpan(
        replacements,
        tokens,
        index,
        endIndexExclusive,
        form.kind,
        form.boundaryProtections,
        form.narration,
      );
      index = endIndexExclusive - 1;
      break;
    }
  }

  return Object.freeze(replacements);
}

function punctuationEntry(
  role: NarrationNormalizedTextRole,
  boundaryProtections: readonly NarrationNormalizationBoundaryProtection[] = NO_BOUNDARY_PROTECTIONS,
): PunctuationPlanEntry {
  return Object.freeze({ role, boundaryProtections });
}

function isApostropheContext(
  tokens: readonly NarrationSourceToken[],
  index: number,
): boolean {
  return (
    isWordContextCodePoint(sourceText(tokens[index - 1])) &&
    isWordContextCodePoint(sourceText(tokens[index + 1]))
  );
}

function findFirstSignificantProseToken(
  tokens: readonly NarrationSourceToken[],
): number | undefined {
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const value = sourceText(token);
    if (!isProseTextToken(token) || value === undefined) {
      return index;
    }
    if (
      !isOrdinaryWhitespace(value) &&
      value !== SOFT_HYPHEN &&
      value !== ZERO_WIDTH_SPACE &&
      value !== WORD_JOINER
    ) {
      return index;
    }
  }
  return undefined;
}

function findPunctuationPlan(
  tokens: readonly NarrationSourceToken[],
): readonly (PunctuationPlanEntry | undefined)[] {
  const plan = new Array<PunctuationPlanEntry | undefined>(tokens.length);
  const unmatchedOpenings = new Map<string, number[]>();
  let straightDoubleQuoteOpening: number | undefined;
  const firstSignificant = findFirstSignificantProseToken(tokens);

  const pushOpening = (closing: string, index: number): void => {
    const openings = unmatchedOpenings.get(closing);
    if (openings === undefined) {
      unmatchedOpenings.set(closing, [index]);
      return;
    }
    openings.push(index);
  };
  const closeOpening = (closing: string): boolean => {
    const openings = unmatchedOpenings.get(closing);
    if (openings === undefined || openings.length === 0) {
      return false;
    }
    openings.pop();
    return true;
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const value = sourceText(token);
    if (!isProseTextToken(token) || value === undefined) {
      continue;
    }

    if (value === ".") {
      let end = index + 1;
      while (
        end < tokens.length &&
        isProseTextToken(tokens[end]) &&
        sourceText(tokens[end]) === "."
      ) {
        end += 1;
      }
      const entry =
        end - index >= 3
          ? punctuationEntry("ellipsis", ELLIPSIS_PROTECTION)
          : punctuationEntry("punctuation", SENTENCE_END_PROTECTION);
      for (let periodIndex = index; periodIndex < end; periodIndex += 1) {
        plan[periodIndex] = entry;
      }
      index = end - 1;
      continue;
    }

    if (value === "…") {
      plan[index] = punctuationEntry("ellipsis", ELLIPSIS_PROTECTION);
      continue;
    }
    if (value === "?" || value === "!") {
      plan[index] = punctuationEntry("punctuation", SENTENCE_END_PROTECTION);
      closeOpening(value);
      continue;
    }
    if (value === "¿" || value === "¡") {
      plan[index] = punctuationEntry("punctuation");
      pushOpening(value === "¿" ? "?" : "!", index);
      continue;
    }
    if (value === "—" || value === "–") {
      plan[index] = punctuationEntry(
        "dialogue-dash",
        value === "—" && index === firstSignificant
          ? DIALOGUE_TURN_PROTECTION
          : NO_BOUNDARY_PROTECTIONS,
      );
      continue;
    }
    if (value === '"') {
      plan[index] = punctuationEntry("quotation");
      if (straightDoubleQuoteOpening === undefined) {
        straightDoubleQuoteOpening = index;
      } else {
        straightDoubleQuoteOpening = undefined;
      }
      continue;
    }

    const closingForOpening =
      value === "“"
        ? "”"
        : value === "‘"
          ? "’"
          : value === "«"
            ? "»"
            : value === "‹"
              ? "›"
              : undefined;
    if (closingForOpening !== undefined) {
      plan[index] = punctuationEntry("quotation");
      pushOpening(closingForOpening, index);
      continue;
    }
    if (
      value === "”" ||
      value === "»" ||
      value === "›" ||
      (value === "’" && !isApostropheContext(tokens, index))
    ) {
      plan[index] = punctuationEntry(
        "quotation",
        closeOpening(value)
          ? NO_BOUNDARY_PROTECTIONS
          : MALFORMED_PUNCTUATION_PROTECTION,
      );
      continue;
    }
    if (
      value === "," ||
      value === ";" ||
      value === ":" ||
      value === "(" ||
      value === ")" ||
      value === "[" ||
      value === "]" ||
      value === "{" ||
      value === "}"
    ) {
      plan[index] = punctuationEntry("punctuation");
      continue;
    }
    if (value === "&" || value === "°" || value === "/" || value === "@") {
      plan[index] = punctuationEntry("symbol", SYMBOL_TOKEN_PROTECTION);
    }
  }

  if (straightDoubleQuoteOpening !== undefined) {
    plan[straightDoubleQuoteOpening] = punctuationEntry(
      "quotation",
      MALFORMED_PUNCTUATION_PROTECTION,
    );
  }
  for (const openings of unmatchedOpenings.values()) {
    for (const index of openings) {
      const entry = plan[index];
      plan[index] = punctuationEntry(
        entry?.role ?? "punctuation",
        MALFORMED_PUNCTUATION_PROTECTION,
      );
    }
  }

  return Object.freeze(plan);
}

function collectLeftWordFragment(
  tokens: readonly NarrationSourceToken[],
  hyphenIndex: number,
  languages: readonly NarrationNormalizationLanguage[],
): string {
  let value = "";
  const requiredLanguage = languages[hyphenIndex];
  for (let index = hyphenIndex - 1; index >= 0; index -= 1) {
    const token = tokens[index];
    const codePoint = sourceText(token);
    if (
      token === undefined ||
      codePoint === undefined ||
      !isSpanishWordCodePoint(codePoint) ||
      isCodeContext(token.textContext) ||
      languages[index] !== requiredLanguage
    ) {
      break;
    }
    value = codePoint + value;
  }
  return value;
}

function collectRightWordFragment(
  tokens: readonly NarrationSourceToken[],
  startIndex: number,
  requiredLanguage: NarrationNormalizationLanguage,
  languages: readonly NarrationNormalizationLanguage[],
): string {
  let value = "";
  for (let index = startIndex; index < tokens.length; index += 1) {
    const token = tokens[index];
    const codePoint = sourceText(token);
    if (
      token === undefined ||
      codePoint === undefined ||
      !isSpanishWordCodePoint(codePoint) ||
      isCodeContext(token.textContext) ||
      languages[index] !== requiredLanguage
    ) {
      break;
    }
    value += codePoint;
  }
  return value;
}

function findLineEndHyphenation(
  tokens: readonly NarrationSourceToken[],
  languages: readonly NarrationNormalizationLanguage[],
): Readonly<{
  byHyphen: ReadonlyMap<number, LineEndHyphenation>;
  byLineBreak: ReadonlyMap<number, LineEndHyphenation>;
}> {
  const byHyphen = new Map<number, LineEndHyphenation>();
  const byLineBreak = new Map<number, LineEndHyphenation>();

  for (let index = 1; index + 2 < tokens.length; index += 1) {
    const hyphen = tokens[index];
    const lineBreak = tokens[index + 1];
    const next = tokens[index + 2];
    if (
      hyphen?.kind !== "text" ||
      hyphen.text !== "-" ||
      isCodeContext(hyphen.textContext) ||
      lineBreak?.kind !== "line-break" ||
      next?.kind !== "text" ||
      isCodeContext(next.textContext)
    ) {
      continue;
    }

    const language = languages[index];
    if (
      language === undefined ||
      languages[index + 1] !== language ||
      languages[index + 2] !== language
    ) {
      continue;
    }

    const leftFragment = collectLeftWordFragment(tokens, index, languages);
    const rightFragment = collectRightWordFragment(
      tokens,
      index + 2,
      language,
      languages,
    );
    if (leftFragment.length === 0 || rightFragment.length === 0) {
      continue;
    }

    const decision =
      language === "es" &&
      isAcceptedSpanishLineEndHyphenation(leftFragment, rightFragment)
        ? "joined"
        : "preserved";
    byHyphen.set(index, decision);
    byLineBreak.set(index + 1, decision);
  }

  return Object.freeze({ byHyphen, byLineBreak });
}

function textUnit(
  token: NarrationSourceToken,
  textContext: NarrationSourceTextContext,
  language: NarrationNormalizationLanguage,
  text: string,
  role: NarrationNormalizedTextRole,
  collapsible = false,
  boundaryProtections: readonly NarrationNormalizationBoundaryProtection[] = NO_BOUNDARY_PROTECTIONS,
): ProvisionalTextUnit {
  if (text.length === 0) {
    return fail();
  }
  if (
    Array.from(text).length >
    NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum
  ) {
    return resourceLimitExceeded();
  }
  return {
    kind: "text",
    text: text as SensitiveNormalizedNarrationText,
    role,
    sourceSpan: copySourceSpan(token.sourceSpan),
    textContext,
    effectiveLanguage: language,
    boundaryProtections,
    collapsible,
  };
}

function omission(
  token: NarrationSourceToken,
  textContext: NarrationSourceTextContext,
  language: NarrationNormalizationLanguage,
  reason: NarrationNormalizationOmissionReason,
  boundaryProtections: readonly NarrationNormalizationBoundaryProtection[] = NO_BOUNDARY_PROTECTIONS,
): NarrationNormalizationOmission {
  return {
    kind: "omission",
    reason,
    sourceSpan: copySourceSpan(token.sourceSpan),
    textContext,
    effectiveLanguage: language,
    boundaryProtections,
  };
}

function provisionalUnit(
  token: NarrationSourceToken,
  index: number,
  textContext: NarrationSourceTextContext,
  language: NarrationNormalizationLanguage,
  lineEndHyphenation: ReturnType<typeof findLineEndHyphenation>,
  replacements: readonly (PlannedReplacement | undefined)[],
  punctuationPlan: readonly (PunctuationPlanEntry | undefined)[],
): ProvisionalUnit {
  switch (token.kind) {
    case "line-break":
      return lineEndHyphenation.byLineBreak.has(index)
        ? omission(
            token,
            textContext,
            language,
            "semantic-line-break",
            SEMANTIC_LINE_BREAK_PROTECTION,
          )
        : textUnit(
            token,
            textContext,
            language,
            " ",
            "semantic-line-break",
            true,
            SEMANTIC_LINE_BREAK_PROTECTION,
          );
    case "raster-placeholder":
      return omission(token, textContext, language, "raster-placeholder");
    case "text": {
      const value = String(token.text);
      if (Array.from(value).length !== 1) {
        return fail();
      }
      if (isCodeContext(token.textContext)) {
        return textUnit(
          token,
          textContext,
          language,
          value,
          "code",
          false,
          CODE_SPAN_PROTECTION,
        );
      }
      const hyphenation = lineEndHyphenation.byHyphen.get(index);
      if (hyphenation === "joined") {
        return omission(
          token,
          textContext,
          language,
          "line-end-hyphen",
          LINE_END_HYPHEN_PROTECTION,
        );
      }
      if (hyphenation === "preserved") {
        return textUnit(
          token,
          textContext,
          language,
          value,
          "line-end-hyphen",
          false,
          GENUINE_COMPOUND_PROTECTION,
        );
      }
      const replacement = replacements[index];
      if (replacement?.kind === "omission") {
        return omission(
          token,
          textContext,
          language,
          replacement.reason,
          replacement.boundaryProtections,
        );
      }
      if (replacement?.kind === "text") {
        return textUnit(
          token,
          textContext,
          language,
          replacement.text,
          replacement.role,
          replacement.collapsible,
          replacement.boundaryProtections,
        );
      }
      if (value === SOFT_HYPHEN) {
        return omission(token, textContext, language, "soft-hyphen");
      }
      if (value === ZERO_WIDTH_SPACE || value === WORD_JOINER) {
        return omission(token, textContext, language, "formatting-mark");
      }
      const punctuation = punctuationPlan[index];
      const languageProtections =
        token.textContext.language === undefined
          ? NO_BOUNDARY_PROTECTIONS
          : LANGUAGE_SPAN_PROTECTION;
      return isOrdinaryWhitespace(value)
        ? textUnit(
            token,
            textContext,
            language,
            " ",
            "whitespace",
            true,
            languageProtections,
          )
        : textUnit(
            token,
            textContext,
            language,
            value,
            punctuation?.role ?? "preserved",
            false,
            mergedBoundaryProtections(
              punctuation?.boundaryProtections ?? NO_BOUNDARY_PROTECTIONS,
              languageProtections,
            ),
          );
    }
    default:
      return unreachable(token);
  }
}

function omissionFromCollapsed(
  unit: ProvisionalTextUnit,
): NarrationNormalizationOmission {
  return {
    kind: "omission",
    reason:
      unit.role === "semantic-line-break"
        ? "semantic-line-break"
        : "collapsed-whitespace",
    sourceSpan: unit.sourceSpan,
    textContext: unit.textContext,
    effectiveLanguage: unit.effectiveLanguage,
    boundaryProtections: unit.boundaryProtections,
  };
}

function isOutputWhitespace(value: string): boolean {
  for (const codePoint of value) {
    if (!isOrdinaryWhitespace(codePoint)) {
      return false;
    }
  }
  return value.length > 0;
}

function collapseWhitespace(
  provisional: readonly ProvisionalUnit[],
): readonly NarrationNormalizedUnit[] {
  const significantAfter = new Array<boolean>(provisional.length);
  let hasSignificantAfter = false;
  for (let index = provisional.length - 1; index >= 0; index -= 1) {
    significantAfter[index] = hasSignificantAfter;
    const unit = provisional[index];
    if (unit?.kind === "text" && !unit.collapsible) {
      hasSignificantAfter = true;
    }
  }

  const normalized: NarrationNormalizedUnit[] = [];
  let hasOutput = false;
  let outputEndsInWhitespace = false;

  for (let index = 0; index < provisional.length; index += 1) {
    const unit = provisional[index];
    if (unit === undefined) {
      return fail();
    }
    if (unit.kind === "omission") {
      normalized.push(Object.freeze(unit));
      continue;
    }

    if (
      unit.collapsible &&
      (!hasOutput || !significantAfter[index] || outputEndsInWhitespace)
    ) {
      normalized.push(Object.freeze(omissionFromCollapsed(unit)));
      continue;
    }

    const { collapsible: _collapsible, ...text } = unit;
    void _collapsible;
    normalized.push(Object.freeze(text));
    hasOutput = true;
    outputEndsInWhitespace = isOutputWhitespace(String(text.text));
  }

  return Object.freeze(normalized);
}

function validateContiguousSource(
  tokens: readonly NarrationSourceToken[],
): void {
  let previousEnd: number | undefined;
  for (const token of tokens) {
    const { startOffsetCodePoints, endOffsetCodePoints } = token.sourceSpan;
    if (
      !Number.isSafeInteger(startOffsetCodePoints) ||
      !Number.isSafeInteger(endOffsetCodePoints) ||
      startOffsetCodePoints < 0 ||
      endOffsetCodePoints !== startOffsetCodePoints + 1 ||
      (previousEnd !== undefined && startOffsetCodePoints !== previousEnd)
    ) {
      return fail();
    }
    previousEnd = endOffsetCodePoints;
  }
}

/**
 * Applies the Task 3.1-3.3 normalization slices to one block-local source-token
 * stream. Every source position remains represented by either a nonempty text
 * unit or a content-free omission reason, so later segmentation can construct
 * legal ranges without reparsing source text.
 */
export function normalizeNarrationSourceTokens(
  tokens: readonly NarrationSourceToken[],
  defaultLanguage: NarrationNormalizationLanguage,
): NarrationNormalizedStream {
  if (defaultLanguage !== "es" && defaultLanguage !== "und") {
    return fail();
  }
  if (
    tokens.length >
    NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum
  ) {
    return resourceLimitExceeded();
  }
  validateContiguousSource(tokens);

  const contextCopies = new Map<
    NarrationSourceTextContext,
    NarrationSourceTextContext
  >();
  const languages = tokens.map((token) =>
    effectiveLanguage(token.textContext, defaultLanguage),
  );
  const lineEndHyphenation = findLineEndHyphenation(tokens, languages);
  const symbolReplacements = findSymbolReplacements(tokens, languages);
  const replacements = findLexicalReplacements(
    tokens,
    languages,
    symbolReplacements,
  );
  const punctuationPlan = findPunctuationPlan(tokens);
  const provisional = tokens.map((token, index) => {
    let textContext = contextCopies.get(token.textContext);
    if (textContext === undefined) {
      textContext = copyTextContext(token.textContext);
      contextCopies.set(token.textContext, textContext);
    }
    const language = languages[index];
    if (language === undefined) {
      return fail();
    }
    return provisionalUnit(
      token,
      index,
      textContext,
      language,
      lineEndHyphenation,
      replacements,
      punctuationPlan,
    );
  });
  const units = collapseWhitespace(provisional);
  const textParts: string[] = [];
  for (const unit of units) {
    if (unit.kind === "text") {
      textParts.push(String(unit.text));
    }
  }

  return Object.freeze({
    text: textParts.join("") as SensitiveNormalizedNarrationText,
    units,
  });
}
