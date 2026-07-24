import { createIndex } from "@voxleaf/shared";
import type { Index, ReadingLocatorV1 } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  PublicationLocatedBlock,
  SemanticBlock,
  SemanticInline,
  SemanticTextContext,
  SensitivePublicationText,
} from "../document/document-model.js";
import {
  createBlockLocatorAtOffset,
  type PublicationLocatorIndex,
} from "../locator/locator-index.js";
import { resolvePublicationLocator } from "../locator/locator-resolver.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import { NARRATION_V1_SOURCE_WINDOW_POLICY } from "./narration-policy.js";
import type {
  NarrationSourceBoundaryEvent,
  NarrationSourceBoundaryKind,
  NarrationSourceInlineContainerKind,
  NarrationSourceListContext,
  NarrationSourceStructuralContext,
  NarrationSourceTextContext,
} from "./narration-source-projector.js";
import {
  createNarrationSourceTokenAtOffset,
  type NarrationSourceToken,
} from "./narration-source.js";

export type NarrationYieldScheduler = () => Promise<void>;

export interface NarrationSourceWindowRequest {
  readonly startLocator: unknown;
  readonly signal?: AbortSignal;
}

export type NarrationSourceStartRelation =
  | "at-source-start"
  | "before-next-source"
  | "inside-source"
  | "publication-end";

export interface NarrationSourceWindowStart {
  readonly canonicalLocator: ReadingLocatorV1;
  readonly resolutionStatus: "exact" | "recovered";
  readonly resolutionReason:
    | "book-start"
    | "exact"
    | "nearest-anchor"
    | "nearest-offset"
    | "nearest-spine";
  readonly sourceRelation: NarrationSourceStartRelation;
}

interface NarrationSourceWindowLeafEventBase {
  readonly kind: "leaf";
  readonly locatedBlock: PublicationLocatedBlock;
  readonly sourceStartOffsetCodePoints: Index;
  readonly sourceEndOffsetCodePoints: Index;
  readonly sourceTokens: readonly NarrationSourceToken[];
  readonly structuralContext: NarrationSourceStructuralContext;
  readonly textContext: NarrationSourceTextContext;
}

export interface NarrationSourceWindowHeadingEvent extends NarrationSourceWindowLeafEventBase {
  readonly blockKind: "heading";
  readonly headingLevel: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface NarrationSourceWindowParagraphEvent extends NarrationSourceWindowLeafEventBase {
  readonly blockKind: "paragraph";
}

export type NarrationSourceWindowLeafEvent =
  NarrationSourceWindowHeadingEvent | NarrationSourceWindowParagraphEvent;

export type NarrationSourceWindowEvent =
  NarrationSourceBoundaryEvent | NarrationSourceWindowLeafEvent;

export interface NarrationSourceWindowMeasurements {
  readonly sourceCodePointsInspected: Index;
  readonly retainedTokenCount: Index;
  readonly retainedEventCount: Index;
  readonly workUnitCount: Index;
  readonly checkpointCount: Index;
  readonly yieldCount: Index;
}

export interface NarrationSourceWindowBatch {
  readonly status: "window";
  readonly start: NarrationSourceWindowStart;
  readonly events: readonly NarrationSourceWindowEvent[];
  readonly continuation: ReadingLocatorV1;
  readonly measurements: NarrationSourceWindowMeasurements;
}

export interface NarrationSourceWindowComplete {
  readonly status: "complete";
  readonly start: NarrationSourceWindowStart;
  readonly events: readonly NarrationSourceWindowEvent[];
  readonly measurements: NarrationSourceWindowMeasurements;
}

export type NarrationSourceWindowFailureDetail =
  | "cancelled"
  | "internal-failure"
  | "invalid-start"
  | "operation-active"
  | "resource-limit-exceeded";

export interface NarrationSourceWindowFailure {
  readonly status: NarrationSourceWindowFailureDetail;
}

export type NarrationSourceWindowResult =
  | NarrationSourceWindowBatch
  | NarrationSourceWindowComplete
  | NarrationSourceWindowFailure;

interface VisitBlockTask {
  readonly kind: "visit-block";
  readonly block: SemanticBlock;
  readonly depth: number;
  readonly structuralContext: NarrationSourceStructuralContext;
  readonly textContext: NarrationSourceTextContext;
}

interface EmitBoundaryTask {
  readonly kind: "emit-boundary";
  readonly event: NarrationSourceBoundaryEvent;
}

type TraversalTask = EmitBoundaryTask | VisitBlockTask;

interface VisitInlineTask {
  readonly kind: "visit-inline";
  readonly inline: SemanticInline;
  readonly depth: number;
  readonly textContext: NarrationSourceTextContext;
}

interface VisitTextTask {
  readonly kind: "visit-text";
  readonly iterator: Iterator<string>;
  readonly textContext: NarrationSourceTextContext;
}

type InlineTask = VisitInlineTask | VisitTextTask;

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

const CANCELLED: NarrationSourceWindowFailure = Object.freeze({
  status: "cancelled",
});
const INTERNAL_FAILURE: NarrationSourceWindowFailure = Object.freeze({
  status: "internal-failure",
});
const INVALID_START: NarrationSourceWindowFailure = Object.freeze({
  status: "invalid-start",
});
const RESOURCE_LIMIT_EXCEEDED: NarrationSourceWindowFailure = Object.freeze({
  status: "resource-limit-exceeded",
});

export const DEFAULT_NARRATION_YIELD_SCHEDULER: NarrationYieldScheduler = () =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, 0);
  });

function fail(code: "internal-failure" | "resource-limit-exceeded"): never {
  throw new EpubArchiveError(code);
}

function unreachable(value: never): never {
  void value;
  return fail("internal-failure");
}

function addSafe(left: number, right: number): number {
  const value = left + right;
  return Number.isSafeInteger(value) ? value : fail("internal-failure");
}

function indexFrom(value: number): Index {
  try {
    return createIndex(value);
  } catch {
    return fail("internal-failure");
  }
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
    quoteDepth: addSafe(context.quoteDepth, 1),
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

function assertDepth(depth: number): void {
  if (
    !Number.isSafeInteger(depth) ||
    depth < 0 ||
    depth > NARRATION_V1_SOURCE_WINDOW_POLICY.traversalDepthHardMaximum
  ) {
    return fail("resource-limit-exceeded");
  }
}

class NarrationWorkController {
  readonly #scheduler: NarrationYieldScheduler;
  readonly #signal: AbortSignal;
  #checkpointCount = 0;
  #sinceCheckpoint = 0;
  #sinceYield = 0;
  #workUnitCount = 0;
  #yieldCount = 0;

  public constructor(signal: AbortSignal, scheduler: NarrationYieldScheduler) {
    this.#signal = signal;
    this.#scheduler = scheduler;
    this.assertActive();
  }

  public get checkpointCount(): number {
    return this.#checkpointCount;
  }

  public get workUnitCount(): number {
    return this.#workUnitCount;
  }

  public get yieldCount(): number {
    return this.#yieldCount;
  }

  public async observe(): Promise<void> {
    this.#workUnitCount = addSafe(this.#workUnitCount, 1);
    this.#sinceCheckpoint = addSafe(this.#sinceCheckpoint, 1);
    this.#sinceYield = addSafe(this.#sinceYield, 1);

    if (
      this.#sinceCheckpoint >=
      NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenCheckpointsTarget
    ) {
      this.assertActive();
      this.#checkpointCount = addSafe(this.#checkpointCount, 1);
      this.#sinceCheckpoint = 0;
    }

    if (
      this.#sinceYield >=
      NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenYieldsTarget
    ) {
      this.assertActive();
      await this.#scheduler();
      this.#yieldCount = addSafe(this.#yieldCount, 1);
      this.#sinceYield = 0;
      this.assertActive();
    }

    if (
      this.#sinceCheckpoint >
        NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenCheckpointsHardMaximum ||
      this.#sinceYield >
        NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenYieldsHardMaximum
    ) {
      return fail("internal-failure");
    }
  }

  public beforePublication(): void {
    this.assertActive();
    this.#checkpointCount = addSafe(this.#checkpointCount, 1);
    this.#sinceCheckpoint = 0;
  }

  private assertActive(): void {
    if (this.#signal.aborted) {
      throw new EpubArchiveError("cancelled");
    }
  }
}

interface MutableWindowState {
  readonly events: NarrationSourceWindowEvent[];
  readonly targetBlock: PublicationLocatedBlock;
  readonly targetOffset: number;
  continuation?: ReadingLocatorV1;
  encounteredSource: boolean;
  locatedIndex: number;
  retainedTokenCount: number;
  sourceCodePointsInspected: number;
  started: boolean;
  stopped: boolean;
}

function pushBlockChildren(
  tasks: TraversalTask[],
  children: readonly SemanticBlock[],
  depth: number,
  structuralContext: NarrationSourceStructuralContext,
  textContext: NarrationSourceTextContext,
): void {
  const childDepth = addSafe(depth, 1);
  assertDepth(childDepth);
  for (let index = children.length - 1; index >= 0; index -= 1) {
    const block = children[index];
    if (block === undefined) {
      return fail("internal-failure");
    }
    tasks.push({
      kind: "visit-block",
      block,
      depth: childDepth,
      structuralContext,
      textContext,
    });
  }
}

function pushInlineChildren(
  tasks: InlineTask[],
  children: readonly SemanticInline[],
  depth: number,
  textContext: NarrationSourceTextContext,
): void {
  const childDepth = addSafe(depth, 1);
  assertDepth(childDepth);
  for (let index = children.length - 1; index >= 0; index -= 1) {
    const inline = children[index];
    if (inline === undefined) {
      return fail("internal-failure");
    }
    tasks.push({
      kind: "visit-inline",
      inline,
      depth: childDepth,
      textContext,
    });
  }
}

async function retainEvent(
  state: MutableWindowState,
  event: NarrationSourceWindowEvent,
  work: NarrationWorkController,
): Promise<void> {
  await work.observe();
  if (
    state.events.length >=
    NARRATION_V1_SOURCE_WINDOW_POLICY.retainedEventEntriesHardMaximum
  ) {
    return fail("resource-limit-exceeded");
  }
  state.events.push(event);
}

function retainToken(
  state: MutableWindowState,
  locatedBlock: PublicationLocatedBlock,
  position: Parameters<typeof createNarrationSourceTokenAtOffset>[1],
  offset: number,
): NarrationSourceToken {
  if (
    state.retainedTokenCount >=
    NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum
  ) {
    return fail("internal-failure");
  }

  const token = createNarrationSourceTokenAtOffset(
    locatedBlock,
    position,
    offset,
  );
  state.retainedTokenCount = addSafe(state.retainedTokenCount, 1);
  state.encounteredSource = true;
  state.continuation = createBlockLocatorAtOffset(
    locatedBlock,
    addSafe(offset, 1),
  );
  if (
    state.retainedTokenCount ===
    NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum
  ) {
    state.stopped = true;
  }
  return token;
}

function observeSourcePosition(state: MutableWindowState): void {
  if (
    state.sourceCodePointsInspected >=
    NARRATION_V1_SOURCE_WINDOW_POLICY.sourceCodePointsInspectedHardMaximum
  ) {
    return fail("resource-limit-exceeded");
  }
  state.sourceCodePointsInspected = addSafe(state.sourceCodePointsInspected, 1);
}

async function projectLeafWindow(
  locatedBlock: PublicationLocatedBlock,
  inheritedTextContext: NarrationSourceTextContext,
  structuralContext: NarrationSourceStructuralContext,
  startOffset: number,
  state: MutableWindowState,
  work: NarrationWorkController,
): Promise<void> {
  const block = locatedBlock.block;
  if (block.kind !== "heading" && block.kind !== "paragraph") {
    return fail("internal-failure");
  }
  if (
    !Number.isSafeInteger(startOffset) ||
    startOffset < 0 ||
    startOffset > locatedBlock.textLengthCodePoints
  ) {
    return fail("internal-failure");
  }
  if (startOffset === locatedBlock.textLengthCodePoints) {
    return;
  }

  const leafTextContext = effectiveTextContext(block, inheritedTextContext);
  const tasks: InlineTask[] = [];
  const tokens: NarrationSourceToken[] = [];
  let offset = 0;
  pushInlineChildren(tasks, block.children, 0, leafTextContext);

  while (tasks.length > 0 && !state.stopped) {
    const task = tasks.pop();
    if (task === undefined) {
      return fail("internal-failure");
    }
    await work.observe();

    if (task.kind === "visit-text") {
      const next = task.iterator.next();
      if (next.done === true) {
        continue;
      }
      tasks.push(task);
      observeSourcePosition(state);
      if (offset >= startOffset) {
        await work.observe();
        tokens.push(
          retainToken(
            state,
            locatedBlock,
            Object.freeze({
              kind: "text",
              text: next.value as SensitivePublicationText,
              textContext: task.textContext,
            }),
            offset,
          ),
        );
      }
      offset = addSafe(offset, 1);
      continue;
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
          task.depth,
          withInlineContainer(current, inline.kind),
        );
        break;
      }
      case "line-break":
        observeSourcePosition(state);
        if (offset >= startOffset) {
          await work.observe();
          tokens.push(
            retainToken(
              state,
              locatedBlock,
              Object.freeze({
                kind: "line-break",
                textContext: task.textContext,
              }),
              offset,
            ),
          );
        }
        offset = addSafe(offset, 1);
        break;
      case "raster-image": {
        const current = effectiveTextContext(inline, task.textContext);
        observeSourcePosition(state);
        if (offset >= startOffset) {
          await work.observe();
          tokens.push(
            retainToken(
              state,
              locatedBlock,
              Object.freeze({
                kind: "raster-placeholder",
                textContext: current,
              }),
              offset,
            ),
          );
        }
        offset = addSafe(offset, 1);
        break;
      }
      case "text": {
        const current = effectiveTextContext(inline, task.textContext);
        tasks.push({
          kind: "visit-text",
          iterator: String(inline.text)[Symbol.iterator](),
          textContext: current,
        });
        break;
      }
      default:
        return unreachable(inline);
    }
  }

  if (!state.stopped && offset !== locatedBlock.textLengthCodePoints) {
    return fail("internal-failure");
  }
  if (tokens.length === 0) {
    return;
  }

  const first = tokens[0];
  const last = tokens[tokens.length - 1];
  if (first === undefined || last === undefined) {
    return fail("internal-failure");
  }
  const common = {
    kind: "leaf" as const,
    locatedBlock,
    sourceStartOffsetCodePoints: first.sourceSpan.startOffsetCodePoints,
    sourceEndOffsetCodePoints: last.sourceSpan.endOffsetCodePoints,
    sourceTokens: Object.freeze(tokens),
    structuralContext,
    textContext: leafTextContext,
  };
  await retainEvent(
    state,
    block.kind === "heading"
      ? Object.freeze({
          ...common,
          blockKind: "heading",
          headingLevel: block.level,
        })
      : Object.freeze({
          ...common,
          blockKind: "paragraph",
        }),
    work,
  );
}

function sourceStartRelation(
  targetBlock: PublicationLocatedBlock,
  targetOffset: number,
  encounteredSource: boolean,
): NarrationSourceStartRelation {
  if (!encounteredSource) {
    return "publication-end";
  }
  if (
    (targetBlock.block.kind === "heading" ||
      targetBlock.block.kind === "paragraph") &&
    targetOffset === 0 &&
    targetBlock.textLengthCodePoints > 0
  ) {
    return "at-source-start";
  }
  if (
    (targetBlock.block.kind === "heading" ||
      targetBlock.block.kind === "paragraph") &&
    targetOffset > 0 &&
    targetOffset < targetBlock.textLengthCodePoints
  ) {
    return "inside-source";
  }
  return "before-next-source";
}

function createStart(
  resolution: ReturnType<typeof resolvePublicationLocator>,
  relation: NarrationSourceStartRelation,
): NarrationSourceWindowStart {
  return Object.freeze({
    canonicalLocator: resolution.locator,
    resolutionStatus: resolution.status,
    resolutionReason: resolution.reason,
    sourceRelation: relation,
  });
}

function createMeasurements(
  state: MutableWindowState,
  work: NarrationWorkController,
): NarrationSourceWindowMeasurements {
  return Object.freeze({
    sourceCodePointsInspected: indexFrom(state.sourceCodePointsInspected),
    retainedTokenCount: indexFrom(state.retainedTokenCount),
    retainedEventCount: indexFrom(state.events.length),
    workUnitCount: indexFrom(work.workUnitCount),
    checkpointCount: indexFrom(work.checkpointCount),
    yieldCount: indexFrom(work.yieldCount),
  });
}

function mapFailure(error: unknown): NarrationSourceWindowFailure {
  if (error instanceof EpubArchiveError) {
    switch (error.code) {
      case "cancelled":
        return CANCELLED;
      case "locator-unresolved":
        return INVALID_START;
      case "resource-limit-exceeded":
        return RESOURCE_LIMIT_EXCEEDED;
      default:
        return INTERNAL_FAILURE;
    }
  }
  return INTERNAL_FAILURE;
}

async function runSourceWindow(
  locatorIndex: PublicationLocatorIndex,
  request: NarrationSourceWindowRequest,
  scheduler: NarrationYieldScheduler,
): Promise<NarrationSourceWindowBatch | NarrationSourceWindowComplete> {
  const signal = request.signal ?? new AbortController().signal;
  const work = new NarrationWorkController(signal, scheduler);
  const resolution = resolvePublicationLocator(
    locatorIndex,
    request.startLocator,
    createEpubProcessingBudget({ signal }),
  );
  const state: MutableWindowState = {
    events: [],
    targetBlock: resolution.locatedBlock,
    targetOffset: resolution.locator.textOffsetCodePoints,
    encounteredSource: false,
    locatedIndex: 0,
    retainedTokenCount: 0,
    sourceCodePointsInspected: 0,
    started: false,
    stopped: false,
  };
  const tasks: TraversalTask[] = [];

  while (
    !state.stopped &&
    (state.locatedIndex < locatorIndex.blocks.length || tasks.length > 0)
  ) {
    if (tasks.length === 0) {
      const root = locatorIndex.blocks[state.locatedIndex];
      if (root === undefined) {
        return fail("internal-failure");
      }
      tasks.push({
        kind: "visit-block",
        block: root.block,
        depth: 0,
        structuralContext: EMPTY_STRUCTURAL_CONTEXT,
        textContext: EMPTY_TEXT_CONTEXT,
      });
    }

    const task = tasks.pop();
    if (task === undefined) {
      return fail("internal-failure");
    }
    await work.observe();

    if (task.kind === "emit-boundary") {
      if (state.started) {
        await retainEvent(state, task.event, work);
      }
      continue;
    }

    assertDepth(task.depth);
    const locatedBlock = locatorIndex.blocks[state.locatedIndex];
    if (locatedBlock === undefined || locatedBlock.block !== task.block) {
      return fail("internal-failure");
    }
    state.locatedIndex = addSafe(state.locatedIndex, 1);
    if (locatedBlock === state.targetBlock) {
      state.started = true;
    }
    const { block } = locatedBlock;

    switch (block.kind) {
      case "block-quote": {
        if (locatedBlock.textLengthCodePoints !== 0) {
          return fail("internal-failure");
        }
        const textContext = effectiveTextContext(block, task.textContext);
        const structuralContext = withQuote(task.structuralContext);
        const start = boundaryEvent(
          "block-quote-start",
          locatedBlock,
          structuralContext,
        );
        if (state.started) {
          await retainEvent(state, start, work);
        }
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
          task.depth,
          structuralContext,
          textContext,
        );
        break;
      }
      case "heading":
      case "paragraph":
        if (state.started) {
          await projectLeafWindow(
            locatedBlock,
            task.textContext,
            task.structuralContext,
            locatedBlock === state.targetBlock ? state.targetOffset : 0,
            state,
            work,
          );
        }
        break;
      case "list": {
        if (locatedBlock.textLengthCodePoints !== 0) {
          return fail("internal-failure");
        }
        const textContext = effectiveTextContext(block, task.textContext);
        const start = boundaryEvent(
          "list-start",
          locatedBlock,
          task.structuralContext,
          { ordered: block.ordered },
        );
        if (state.started) {
          await retainEvent(state, start, work);
        }
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
            return fail("internal-failure");
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
            task.depth,
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

  if (!state.started) {
    return fail("internal-failure");
  }
  work.beforePublication();
  const events = Object.freeze(state.events);
  const start = createStart(
    resolution,
    sourceStartRelation(
      state.targetBlock,
      state.targetOffset,
      state.encounteredSource,
    ),
  );
  const measurements = createMeasurements(state, work);

  if (state.stopped) {
    const continuation = state.continuation;
    if (continuation === undefined) {
      return fail("internal-failure");
    }
    return Object.freeze({
      status: "window",
      start,
      events,
      continuation,
      measurements,
    });
  }
  if (state.locatedIndex !== locatorIndex.blocks.length || tasks.length !== 0) {
    return fail("internal-failure");
  }
  return Object.freeze({
    status: "complete",
    start,
    events,
    measurements,
  });
}

/**
 * Resolves and projects one finite locator-aware narration source window.
 *
 * Expected failures are closed, frozen, and content-free. Sensitive partial
 * events are discarded on cancellation, limit failure, or invariant failure.
 */
export async function prepareNarrationSourceWindow(
  locatorIndex: PublicationLocatorIndex,
  request: NarrationSourceWindowRequest,
  scheduler: NarrationYieldScheduler = DEFAULT_NARRATION_YIELD_SCHEDULER,
): Promise<NarrationSourceWindowResult> {
  try {
    return await runSourceWindow(locatorIndex, request, scheduler);
  } catch (error: unknown) {
    return mapFailure(error);
  }
}
