import { decodeLocatorRangeV1 } from "@voxleaf/shared";
import type { Index, LocatorRangeV1 } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  PublicationLocatedBlock,
  SensitivePublicationText,
} from "../document/document-model.js";
import { createBlockLocatorAtOffset } from "../locator/locator-index.js";
import type {
  NarrationSourceBoundaryEvent,
  NarrationSourceEvent,
  NarrationSourceLeafEvent,
  NarrationSourceStructuralContext,
  NarrationSourceTextContext,
  NarrationSourceUnit,
} from "./narration-source-projector.js";

const LOCATOR_RANGE_SCHEMA_VERSION = 1;

export interface NarrationSourceSpan {
  readonly startOffsetCodePoints: Index;
  readonly endOffsetCodePoints: Index;
}

interface NarrationSourceTokenBase {
  readonly sourceSpan: NarrationSourceSpan;
  readonly textContext: NarrationSourceTextContext;
}

export interface NarrationSourceTextToken extends NarrationSourceTokenBase {
  readonly kind: "text";
  readonly text: SensitivePublicationText;
}

export interface NarrationSourceLineBreakToken extends NarrationSourceTokenBase {
  readonly kind: "line-break";
}

export interface NarrationSourceRasterPlaceholderToken extends NarrationSourceTokenBase {
  readonly kind: "raster-placeholder";
}

export type NarrationSourceToken =
  | NarrationSourceLineBreakToken
  | NarrationSourceRasterPlaceholderToken
  | NarrationSourceTextToken;

interface NarrationSourceTokenLeafEventBase {
  readonly kind: "leaf";
  readonly locatedBlock: PublicationLocatedBlock;
  readonly sourceCodePoints: Index;
  readonly sourceTokens: readonly NarrationSourceToken[];
  readonly structuralContext: NarrationSourceStructuralContext;
  readonly textContext: NarrationSourceTextContext;
}

export interface NarrationSourceTokenHeadingEvent extends NarrationSourceTokenLeafEventBase {
  readonly blockKind: "heading";
  readonly headingLevel: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface NarrationSourceTokenParagraphEvent extends NarrationSourceTokenLeafEventBase {
  readonly blockKind: "paragraph";
}

export type NarrationSourceTokenLeafEvent =
  NarrationSourceTokenHeadingEvent | NarrationSourceTokenParagraphEvent;

export type NarrationSourceTokenEvent =
  NarrationSourceBoundaryEvent | NarrationSourceTokenLeafEvent;

function fail(): never {
  throw new EpubArchiveError("internal-failure");
}

function unreachable(value: never): never {
  void value;
  return fail();
}

function nextOffset(value: number): number {
  const next = value + 1;
  return Number.isSafeInteger(next) ? next : fail();
}

function createSourceRange(
  locatedBlock: PublicationLocatedBlock,
  startOffsetCodePoints: number,
  endOffsetCodePoints: number,
): LocatorRangeV1 {
  if (
    !Number.isSafeInteger(startOffsetCodePoints) ||
    !Number.isSafeInteger(endOffsetCodePoints) ||
    startOffsetCodePoints < 0 ||
    endOffsetCodePoints <= startOffsetCodePoints ||
    endOffsetCodePoints > locatedBlock.textLengthCodePoints
  ) {
    return fail();
  }

  try {
    return decodeLocatorRangeV1({
      schemaVersion: LOCATOR_RANGE_SCHEMA_VERSION,
      start: createBlockLocatorAtOffset(locatedBlock, startOffsetCodePoints),
      end: createBlockLocatorAtOffset(locatedBlock, endOffsetCodePoints),
    });
  } catch {
    return fail();
  }
}

/**
 * Constructs and validates a public locator range for one internal source
 * span. Source tokens retain only compact block-local code-point offsets.
 */
export function createNarrationSourceTokenRange(
  locatedBlock: PublicationLocatedBlock,
  sourceSpan: NarrationSourceSpan,
): LocatorRangeV1 {
  return createSourceRange(
    locatedBlock,
    sourceSpan.startOffsetCodePoints,
    sourceSpan.endOffsetCodePoints,
  );
}

function sourceSpan(
  locatedBlock: PublicationLocatedBlock,
  startOffsetCodePoints: number,
  endOffsetCodePoints: number,
): NarrationSourceSpan {
  const range = createSourceRange(
    locatedBlock,
    startOffsetCodePoints,
    endOffsetCodePoints,
  );
  return Object.freeze({
    startOffsetCodePoints: range.start.textOffsetCodePoints,
    endOffsetCodePoints: range.end.textOffsetCodePoints,
  });
}

function tokenFromPosition(
  locatedBlock: PublicationLocatedBlock,
  unit: NarrationSourceUnit,
  startOffsetCodePoints: number,
  text?: SensitivePublicationText,
): NarrationSourceToken {
  const endOffsetCodePoints = nextOffset(startOffsetCodePoints);
  const common = {
    sourceSpan: sourceSpan(
      locatedBlock,
      startOffsetCodePoints,
      endOffsetCodePoints,
    ),
    textContext: unit.textContext,
  };

  switch (unit.kind) {
    case "line-break":
      return Object.freeze({ ...common, kind: "line-break" });
    case "raster-placeholder":
      return Object.freeze({ ...common, kind: "raster-placeholder" });
    case "text":
      return text === undefined
        ? fail()
        : Object.freeze({ ...common, kind: "text", text });
    default:
      return unreachable(unit);
  }
}

function tokenizeLeaf(
  event: NarrationSourceLeafEvent,
): NarrationSourceTokenLeafEvent {
  const sourceTokens: NarrationSourceToken[] = [];
  let offsetCodePoints = 0;

  for (const unit of event.sourceUnits) {
    const unitStart = offsetCodePoints;
    switch (unit.kind) {
      case "line-break":
      case "raster-placeholder":
        if (unit.sourceCodePoints !== 1) {
          return fail();
        }
        sourceTokens.push(
          tokenFromPosition(event.locatedBlock, unit, offsetCodePoints),
        );
        offsetCodePoints = nextOffset(offsetCodePoints);
        break;
      case "text":
        for (const codePoint of String(unit.text)) {
          sourceTokens.push(
            tokenFromPosition(
              event.locatedBlock,
              unit,
              offsetCodePoints,
              codePoint as SensitivePublicationText,
            ),
          );
          offsetCodePoints = nextOffset(offsetCodePoints);
        }
        if (offsetCodePoints - unitStart !== unit.sourceCodePoints) {
          return fail();
        }
        break;
      default:
        return unreachable(unit);
    }
  }

  if (
    offsetCodePoints !== event.sourceCodePoints ||
    offsetCodePoints !== event.locatedBlock.textLengthCodePoints ||
    sourceTokens.length !== offsetCodePoints
  ) {
    return fail();
  }

  const common = {
    kind: "leaf" as const,
    locatedBlock: event.locatedBlock,
    sourceCodePoints: event.sourceCodePoints,
    sourceTokens: Object.freeze(sourceTokens),
    structuralContext: event.structuralContext,
    textContext: event.textContext,
  };
  return event.blockKind === "heading"
    ? Object.freeze({
        ...common,
        blockKind: "heading",
        headingLevel: event.headingLevel,
      })
    : Object.freeze({
        ...common,
        blockKind: "paragraph",
      });
}

/**
 * Maps immutable source-projection events into code-point-addressed tokens.
 * Text remains sensitive; diagnostics and failures stay content-free.
 */
export function mapNarrationSourceTokens(
  events: readonly NarrationSourceEvent[],
): readonly NarrationSourceTokenEvent[] {
  const mapped: NarrationSourceTokenEvent[] = [];
  for (const event of events) {
    switch (event.kind) {
      case "boundary":
        mapped.push(event);
        break;
      case "leaf":
        mapped.push(tokenizeLeaf(event));
        break;
      default:
        return unreachable(event);
    }
  }
  return Object.freeze(mapped);
}
