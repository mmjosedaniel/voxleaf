import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  NarrationSourceSpan,
  NarrationSourceToken,
} from "./narration-source.js";
import type { NarrationSourceTextContext } from "./narration-source-projector.js";
import { NARRATION_V1_SOURCE_WINDOW_POLICY } from "./narration-policy.js";
import { isAcceptedSpanishLineEndHyphenation } from "./spanish-normalization.js";

export type NarrationNormalizationLanguage = "es" | "und";

declare const sensitiveNormalizedNarrationTextBrand: unique symbol;

export type SensitiveNormalizedNarrationText = string & {
  readonly [sensitiveNormalizedNarrationTextBrand]: "SensitiveNormalizedNarrationText";
};

export type NarrationNormalizedTextRole =
  | "code"
  | "line-end-hyphen"
  | "preserved"
  | "semantic-line-break"
  | "whitespace";

export type NarrationNormalizationOmissionReason =
  | "collapsed-whitespace"
  | "formatting-mark"
  | "line-end-hyphen"
  | "raster-placeholder"
  | "semantic-line-break"
  | "soft-hyphen";

interface NarrationNormalizedUnitBase {
  readonly sourceSpan: NarrationSourceSpan;
  readonly textContext: NarrationSourceTextContext;
  readonly effectiveLanguage: NarrationNormalizationLanguage;
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

const SOFT_HYPHEN = "\u00ad";
const ZERO_WIDTH_SPACE = "\u200b";
const WORD_JOINER = "\u2060";
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
): ProvisionalTextUnit {
  if (text.length === 0) {
    return fail();
  }
  return {
    kind: "text",
    text: text as SensitiveNormalizedNarrationText,
    role,
    sourceSpan: copySourceSpan(token.sourceSpan),
    textContext,
    effectiveLanguage: language,
    collapsible,
  };
}

function omission(
  token: NarrationSourceToken,
  textContext: NarrationSourceTextContext,
  language: NarrationNormalizationLanguage,
  reason: NarrationNormalizationOmissionReason,
): NarrationNormalizationOmission {
  return {
    kind: "omission",
    reason,
    sourceSpan: copySourceSpan(token.sourceSpan),
    textContext,
    effectiveLanguage: language,
  };
}

function provisionalUnit(
  token: NarrationSourceToken,
  index: number,
  textContext: NarrationSourceTextContext,
  language: NarrationNormalizationLanguage,
  lineEndHyphenation: ReturnType<typeof findLineEndHyphenation>,
): ProvisionalUnit {
  switch (token.kind) {
    case "line-break":
      return lineEndHyphenation.byLineBreak.has(index)
        ? omission(token, textContext, language, "semantic-line-break")
        : textUnit(
            token,
            textContext,
            language,
            " ",
            "semantic-line-break",
            true,
          );
    case "raster-placeholder":
      return omission(token, textContext, language, "raster-placeholder");
    case "text": {
      const value = String(token.text);
      if (Array.from(value).length !== 1) {
        return fail();
      }
      if (isCodeContext(token.textContext)) {
        return textUnit(token, textContext, language, value, "code");
      }
      const hyphenation = lineEndHyphenation.byHyphen.get(index);
      if (hyphenation === "joined") {
        return omission(token, textContext, language, "line-end-hyphen");
      }
      if (hyphenation === "preserved") {
        return textUnit(token, textContext, language, value, "line-end-hyphen");
      }
      if (value === SOFT_HYPHEN) {
        return omission(token, textContext, language, "soft-hyphen");
      }
      if (value === ZERO_WIDTH_SPACE || value === WORD_JOINER) {
        return omission(token, textContext, language, "formatting-mark");
      }
      return isOrdinaryWhitespace(value)
        ? textUnit(token, textContext, language, " ", "whitespace", true)
        : textUnit(token, textContext, language, value, "preserved");
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
 * Applies the Task 3.1 normalization slice to one block-local source-token
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
