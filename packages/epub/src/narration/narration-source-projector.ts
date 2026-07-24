import { createIndex } from "@voxleaf/shared";
import type { Index } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  PublicationLocatedBlock,
  SemanticBlock,
  SemanticInline,
  SemanticTextContext,
  SemanticTextDirection,
  SensitivePublicationText,
} from "../document/document-model.js";

export type NarrationSourceInlineContainerKind =
  "code" | "emphasis" | "internal-link" | "strong";

export interface NarrationSourceTextContext {
  readonly language?: string;
  readonly direction?: SemanticTextDirection;
  readonly inlineContainers: readonly NarrationSourceInlineContainerKind[];
}

export interface NarrationSourceListContext {
  readonly ordered: boolean;
  readonly itemIndex: number;
}

export interface NarrationSourceStructuralContext {
  readonly quoteDepth: number;
  readonly listPath: readonly NarrationSourceListContext[];
}

interface NarrationSourceUnitBase {
  readonly sourceCodePoints: Index;
  readonly textContext: NarrationSourceTextContext;
}

export interface NarrationSourceTextUnit extends NarrationSourceUnitBase {
  readonly kind: "text";
  readonly text: SensitivePublicationText;
}

export interface NarrationSourceLineBreakUnit extends NarrationSourceUnitBase {
  readonly kind: "line-break";
}

export interface NarrationSourceRasterPlaceholderUnit extends NarrationSourceUnitBase {
  readonly kind: "raster-placeholder";
}

export type NarrationSourceUnit =
  | NarrationSourceLineBreakUnit
  | NarrationSourceRasterPlaceholderUnit
  | NarrationSourceTextUnit;

interface NarrationSourceLeafEventBase {
  readonly kind: "leaf";
  readonly locatedBlock: PublicationLocatedBlock;
  readonly sourceCodePoints: Index;
  readonly sourceUnits: readonly NarrationSourceUnit[];
  readonly structuralContext: NarrationSourceStructuralContext;
  readonly textContext: NarrationSourceTextContext;
}

export interface NarrationSourceHeadingEvent extends NarrationSourceLeafEventBase {
  readonly blockKind: "heading";
  readonly headingLevel: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface NarrationSourceParagraphEvent extends NarrationSourceLeafEventBase {
  readonly blockKind: "paragraph";
}

export type NarrationSourceLeafEvent =
  NarrationSourceHeadingEvent | NarrationSourceParagraphEvent;

export type NarrationSourceBoundaryKind =
  | "block-quote-end"
  | "block-quote-start"
  | "list-end"
  | "list-item-end"
  | "list-item-start"
  | "list-start";

export interface NarrationSourceBoundaryEvent {
  readonly kind: "boundary";
  readonly boundary: NarrationSourceBoundaryKind;
  readonly locatedBlock: PublicationLocatedBlock;
  readonly structuralContext: NarrationSourceStructuralContext;
  readonly ordered?: boolean;
  readonly itemIndex?: number;
}

export type NarrationSourceEvent =
  NarrationSourceBoundaryEvent | NarrationSourceLeafEvent;

interface VisitBlockTask {
  readonly kind: "visit-block";
  readonly block: SemanticBlock;
  readonly structuralContext: NarrationSourceStructuralContext;
  readonly textContext: NarrationSourceTextContext;
}

interface EmitBoundaryTask {
  readonly kind: "emit-boundary";
  readonly event: NarrationSourceBoundaryEvent;
}

type TraversalTask = EmitBoundaryTask | VisitBlockTask;

interface VisitInlineTask {
  readonly inline: SemanticInline;
  readonly textContext: NarrationSourceTextContext;
}

const EMPTY_INLINE_CONTAINERS = Object.freeze(
  [] as NarrationSourceInlineContainerKind[],
);
const EMPTY_LIST_PATH = Object.freeze([] as NarrationSourceListContext[]);
const EMPTY_TEXT_CONTEXT: NarrationSourceTextContext = Object.freeze({
  inlineContainers: EMPTY_INLINE_CONTAINERS,
});
const EMPTY_STRUCTURAL_CONTEXT: NarrationSourceStructuralContext =
  Object.freeze({
    quoteDepth: 0,
    listPath: EMPTY_LIST_PATH,
  });

function fail(): never {
  throw new EpubArchiveError("internal-failure");
}

function unreachable(value: never): never {
  void value;
  return fail();
}

function indexFrom(value: number): Index {
  try {
    return createIndex(value);
  } catch {
    return fail();
  }
}

function addCodePoints(left: number, right: number): number {
  const result = left + right;
  return Number.isSafeInteger(result) ? result : fail();
}

function codePointLength(value: string): number {
  let count = 0;
  for (const codePoint of value) {
    void codePoint;
    count = addCodePoints(count, 1);
  }
  return count;
}

function effectiveTextContext(
  value: SemanticTextContext,
  inherited: NarrationSourceTextContext,
): NarrationSourceTextContext {
  return Object.freeze({
    ...(value.language === undefined
      ? inherited.language === undefined
        ? {}
        : { language: inherited.language }
      : { language: value.language }),
    ...(value.direction === undefined
      ? inherited.direction === undefined
        ? {}
        : { direction: inherited.direction }
      : { direction: value.direction }),
    inlineContainers: inherited.inlineContainers,
  });
}

function withInlineContainer(
  context: NarrationSourceTextContext,
  container: NarrationSourceInlineContainerKind,
): NarrationSourceTextContext {
  return Object.freeze({
    ...(context.language === undefined ? {} : { language: context.language }),
    ...(context.direction === undefined
      ? {}
      : { direction: context.direction }),
    inlineContainers: Object.freeze([...context.inlineContainers, container]),
  });
}

function withQuote(
  context: NarrationSourceStructuralContext,
): NarrationSourceStructuralContext {
  return Object.freeze({
    quoteDepth: addCodePoints(context.quoteDepth, 1),
    listPath: context.listPath,
  });
}

function withListItem(
  context: NarrationSourceStructuralContext,
  ordered: boolean,
  itemIndex: number,
): NarrationSourceStructuralContext {
  return Object.freeze({
    quoteDepth: context.quoteDepth,
    listPath: Object.freeze([
      ...context.listPath,
      Object.freeze({ ordered, itemIndex }),
    ]),
  });
}

function boundaryEvent(
  boundary: NarrationSourceBoundaryKind,
  locatedBlock: PublicationLocatedBlock,
  structuralContext: NarrationSourceStructuralContext,
  list?: Readonly<{ ordered: boolean; itemIndex?: number }>,
): NarrationSourceBoundaryEvent {
  return Object.freeze({
    kind: "boundary",
    boundary,
    locatedBlock,
    structuralContext,
    ...(list === undefined ? {} : { ordered: list.ordered }),
    ...(list?.itemIndex === undefined ? {} : { itemIndex: list.itemIndex }),
  });
}

function pushInlineChildren(
  tasks: VisitInlineTask[],
  children: readonly SemanticInline[],
  textContext: NarrationSourceTextContext,
): void {
  for (let index = children.length - 1; index >= 0; index -= 1) {
    const inline = children[index];
    if (inline === undefined) {
      return fail();
    }
    tasks.push({ inline, textContext });
  }
}

function projectSourceUnits(
  children: readonly SemanticInline[],
  inherited: NarrationSourceTextContext,
): Readonly<{
  sourceCodePoints: number;
  units: readonly NarrationSourceUnit[];
}> {
  const tasks: VisitInlineTask[] = [];
  const units: NarrationSourceUnit[] = [];
  let sourceCodePoints = 0;
  pushInlineChildren(tasks, children, inherited);

  while (tasks.length > 0) {
    const task = tasks.pop();
    if (task === undefined) {
      return fail();
    }
    const { inline } = task;

    switch (inline.kind) {
      case "code":
      case "emphasis":
      case "internal-link":
      case "strong": {
        const current = effectiveTextContext(inline, task.textContext);
        pushInlineChildren(
          tasks,
          inline.children,
          withInlineContainer(current, inline.kind),
        );
        break;
      }
      case "line-break": {
        sourceCodePoints = addCodePoints(sourceCodePoints, 1);
        units.push(
          Object.freeze({
            kind: "line-break",
            sourceCodePoints: indexFrom(1),
            textContext: task.textContext,
          }),
        );
        break;
      }
      case "raster-image": {
        const current = effectiveTextContext(inline, task.textContext);
        sourceCodePoints = addCodePoints(sourceCodePoints, 1);
        units.push(
          Object.freeze({
            kind: "raster-placeholder",
            sourceCodePoints: indexFrom(1),
            textContext: current,
          }),
        );
        break;
      }
      case "text": {
        const current = effectiveTextContext(inline, task.textContext);
        const length = codePointLength(String(inline.text));
        sourceCodePoints = addCodePoints(sourceCodePoints, length);
        if (length > 0) {
          units.push(
            Object.freeze({
              kind: "text",
              text: inline.text,
              sourceCodePoints: indexFrom(length),
              textContext: current,
            }),
          );
        }
        break;
      }
      default:
        return unreachable(inline);
    }
  }

  return Object.freeze({
    sourceCodePoints,
    units: Object.freeze(units),
  });
}

function assertStructuralLength(locatedBlock: PublicationLocatedBlock): void {
  if (locatedBlock.textLengthCodePoints !== 0) {
    return fail();
  }
}

function projectLeaf(
  locatedBlock: PublicationLocatedBlock,
  structuralContext: NarrationSourceStructuralContext,
  inheritedTextContext: NarrationSourceTextContext,
): NarrationSourceLeafEvent {
  const { block } = locatedBlock;
  if (block.kind !== "heading" && block.kind !== "paragraph") {
    return fail();
  }
  const textContext = effectiveTextContext(block, inheritedTextContext);
  const projected = projectSourceUnits(block.children, textContext);
  if (projected.sourceCodePoints !== locatedBlock.textLengthCodePoints) {
    return fail();
  }
  const common = {
    kind: "leaf" as const,
    locatedBlock,
    sourceCodePoints: locatedBlock.textLengthCodePoints,
    sourceUnits: projected.units,
    structuralContext,
    textContext,
  };
  return block.kind === "heading"
    ? Object.freeze({
        ...common,
        blockKind: "heading",
        headingLevel: block.level,
      })
    : Object.freeze({
        ...common,
        blockKind: "paragraph",
      });
}

function pushBlockChildren(
  tasks: TraversalTask[],
  children: readonly SemanticBlock[],
  structuralContext: NarrationSourceStructuralContext,
  textContext: NarrationSourceTextContext,
): void {
  for (let index = children.length - 1; index >= 0; index -= 1) {
    const block = children[index];
    if (block === undefined) {
      return fail();
    }
    tasks.push({
      kind: "visit-block",
      block,
      structuralContext,
      textContext,
    });
  }
}

/**
 * Projects already-located safe semantic values into source-order narration
 * events. The returned values are sensitive, package-internal, immutable, and
 * deliberately carry no raster identity or alternative text.
 */
export function projectNarrationSource(
  locatedBlocks: readonly PublicationLocatedBlock[],
): readonly NarrationSourceEvent[] {
  const events: NarrationSourceEvent[] = [];
  const tasks: TraversalTask[] = [];
  let locatedIndex = 0;

  while (locatedIndex < locatedBlocks.length || tasks.length > 0) {
    if (tasks.length === 0) {
      const root = locatedBlocks[locatedIndex];
      if (root === undefined) {
        return fail();
      }
      tasks.push({
        kind: "visit-block",
        block: root.block,
        structuralContext: EMPTY_STRUCTURAL_CONTEXT,
        textContext: EMPTY_TEXT_CONTEXT,
      });
    }

    const task = tasks.pop();
    if (task === undefined) {
      return fail();
    }
    if (task.kind === "emit-boundary") {
      events.push(task.event);
      continue;
    }

    const locatedBlock = locatedBlocks[locatedIndex];
    if (locatedBlock === undefined || locatedBlock.block !== task.block) {
      return fail();
    }
    locatedIndex += 1;
    const { block } = locatedBlock;

    switch (block.kind) {
      case "block-quote": {
        assertStructuralLength(locatedBlock);
        const textContext = effectiveTextContext(block, task.textContext);
        const structuralContext = withQuote(task.structuralContext);
        events.push(
          boundaryEvent("block-quote-start", locatedBlock, structuralContext),
        );
        tasks.push({
          kind: "emit-boundary",
          event: boundaryEvent(
            "block-quote-end",
            locatedBlock,
            structuralContext,
          ),
        });
        pushBlockChildren(
          tasks,
          block.children,
          structuralContext,
          textContext,
        );
        break;
      }
      case "heading":
      case "paragraph":
        events.push(
          projectLeaf(locatedBlock, task.structuralContext, task.textContext),
        );
        break;
      case "list": {
        assertStructuralLength(locatedBlock);
        const textContext = effectiveTextContext(block, task.textContext);
        events.push(
          boundaryEvent("list-start", locatedBlock, task.structuralContext, {
            ordered: block.ordered,
          }),
        );
        tasks.push({
          kind: "emit-boundary",
          event: boundaryEvent(
            "list-end",
            locatedBlock,
            task.structuralContext,
            { ordered: block.ordered },
          ),
        });
        for (
          let itemIndex = block.items.length - 1;
          itemIndex >= 0;
          itemIndex -= 1
        ) {
          const item = block.items[itemIndex];
          if (item === undefined) {
            return fail();
          }
          const structuralContext = withListItem(
            task.structuralContext,
            block.ordered,
            itemIndex,
          );
          tasks.push({
            kind: "emit-boundary",
            event: boundaryEvent(
              "list-item-end",
              locatedBlock,
              structuralContext,
              { ordered: block.ordered, itemIndex },
            ),
          });
          pushBlockChildren(
            tasks,
            item.children,
            structuralContext,
            textContext,
          );
          tasks.push({
            kind: "emit-boundary",
            event: boundaryEvent(
              "list-item-start",
              locatedBlock,
              structuralContext,
              { ordered: block.ordered, itemIndex },
            ),
          });
        }
        break;
      }
      default:
        return unreachable(block);
    }
  }

  if (locatedIndex !== locatedBlocks.length) {
    return fail();
  }
  return Object.freeze(events);
}
