import type {
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
  SemanticTextContext,
  SemanticTextDirection,
} from "@voxleaf/epub";

export const LARGE_CHAPTER_BATCH_SIZE_BLOCKS = 250;
export const LARGE_CHAPTER_BLOCK_LIMIT = 10_000;
export const LARGE_CHAPTER_DOM_NODE_LIMIT = 80_000;

export type LargeChapterRejectionReason =
  "semantic-block-limit" | "projected-dom-node-limit";

export type SemanticDocumentRenderCapacity =
  | Readonly<{
      status: "accepted";
      semanticBlockCount: number;
      projectedDomNodeCount: number;
    }>
  | Readonly<{
      status: "chapter-too-large";
      reason: LargeChapterRejectionReason;
      semanticBlockCount: number;
      projectedDomNodeCount: number;
    }>;

interface EffectiveTextContext {
  readonly language?: string;
  readonly direction?: SemanticTextDirection;
}

const EMPTY_TEXT_CONTEXT: EffectiveTextContext = Object.freeze({});

class CapacityExceeded {
  public constructor(public readonly reason: LargeChapterRejectionReason) {}
}

class SemanticDocumentCapacityCounter {
  public semanticBlockCount = 0;
  // The application-owned article is part of the projected chapter DOM.
  public projectedDomNodeCount = 1;

  public addSemanticBlock(): void {
    this.semanticBlockCount += 1;
    if (this.semanticBlockCount > LARGE_CHAPTER_BLOCK_LIMIT) {
      throw new CapacityExceeded("semantic-block-limit");
    }
  }

  public addDomNodes(count: number): void {
    this.projectedDomNodeCount += count;
    if (this.projectedDomNodeCount > LARGE_CHAPTER_DOM_NODE_LIMIT) {
      throw new CapacityExceeded("projected-dom-node-limit");
    }
  }
}

function effectiveTextContext(
  value: SemanticTextContext,
  inherited: EffectiveTextContext,
): EffectiveTextContext {
  return {
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
  };
}

function changesTextContext(
  current: EffectiveTextContext,
  inherited: EffectiveTextContext,
): boolean {
  return (
    (current.language !== undefined &&
      current.language !== inherited.language) ||
    (current.direction !== undefined &&
      current.direction !== inherited.direction)
  );
}

function unreachable(value: never): never {
  void value;
  throw new Error("Unsupported semantic reader capacity value.");
}

function countInline(
  inline: SemanticInline,
  inherited: EffectiveTextContext,
  counter: SemanticDocumentCapacityCounter,
): void {
  switch (inline.kind) {
    case "code":
    case "emphasis":
    case "strong": {
      const current = effectiveTextContext(inline, inherited);
      counter.addDomNodes(1);
      for (const child of inline.children) {
        countInline(child, current, counter);
      }
      return;
    }
    case "internal-link": {
      const current = effectiveTextContext(inline, inherited);
      // Count the larger inert presentation: outer/label/status spans plus
      // two fixed status text nodes. An available button is smaller.
      counter.addDomNodes(5);
      for (const child of inline.children) {
        countInline(child, current, counter);
      }
      return;
    }
    case "line-break":
      counter.addDomNodes(1);
      return;
    case "raster-image":
      // Count the loading/fallback presentation: host, placeholder, visible
      // label span, and its text node. A decoded image is smaller.
      counter.addDomNodes(4);
      return;
    case "text": {
      const current = effectiveTextContext(inline, inherited);
      counter.addDomNodes(changesTextContext(current, inherited) ? 2 : 1);
      return;
    }
    default:
      return unreachable(inline);
  }
}

function countBlock(
  block: SemanticBlock,
  inherited: EffectiveTextContext,
  counter: SemanticDocumentCapacityCounter,
): void {
  counter.addSemanticBlock();
  counter.addDomNodes(1);

  switch (block.kind) {
    case "block-quote": {
      const current = effectiveTextContext(block, inherited);
      for (const child of block.children) {
        countBlock(child, current, counter);
      }
      return;
    }
    case "heading":
    case "paragraph": {
      const current = effectiveTextContext(block, inherited);
      for (const child of block.children) {
        countInline(child, current, counter);
      }
      return;
    }
    case "list": {
      const current = effectiveTextContext(block, inherited);
      for (const item of block.items) {
        counter.addDomNodes(1);
        for (const child of item.children) {
          countBlock(child, current, counter);
        }
      }
      return;
    }
    default:
      return unreachable(block);
  }
}

export function assessSemanticDocumentRendering(
  document: SemanticDocument,
): SemanticDocumentRenderCapacity {
  const counter = new SemanticDocumentCapacityCounter();
  const context = effectiveTextContext(document, EMPTY_TEXT_CONTEXT);

  try {
    for (const block of document.blocks) {
      countBlock(block, context, counter);
    }
    return Object.freeze({
      status: "accepted",
      semanticBlockCount: counter.semanticBlockCount,
      projectedDomNodeCount: counter.projectedDomNodeCount,
    });
  } catch (error) {
    if (!(error instanceof CapacityExceeded)) {
      throw error;
    }
    return Object.freeze({
      status: "chapter-too-large",
      reason: error.reason,
      semanticBlockCount: counter.semanticBlockCount,
      projectedDomNodeCount: counter.projectedDomNodeCount,
    });
  }
}

export type ScheduleLargeChapterYield = (resume: () => void) => () => void;

export const scheduleLargeChapterBrowserYield: ScheduleLargeChapterYield = (
  resume,
) => {
  if (
    typeof requestAnimationFrame === "function" &&
    typeof cancelAnimationFrame === "function"
  ) {
    const frame = requestAnimationFrame(() => resume());
    return () => cancelAnimationFrame(frame);
  }

  const timer = setTimeout(resume, 0);
  return () => clearTimeout(timer);
};

export class LargeChapterRenderScheduler {
  readonly #totalBlockCount: number;
  readonly #scheduleYield: ScheduleLargeChapterYield;
  readonly #listeners = new Set<() => void>();
  #renderedBlockCount: number;
  #cancelScheduledYield: (() => void) | undefined;
  #scheduleRevision = 0;

  public constructor(
    totalBlockCount: number,
    scheduleYield: ScheduleLargeChapterYield = scheduleLargeChapterBrowserYield,
  ) {
    if (
      !Number.isSafeInteger(totalBlockCount) ||
      totalBlockCount < 0 ||
      totalBlockCount > LARGE_CHAPTER_BLOCK_LIMIT
    ) {
      throw new Error("Invalid large-chapter scheduler size.");
    }
    this.#totalBlockCount = totalBlockCount;
    this.#scheduleYield = scheduleYield;
    this.#renderedBlockCount = Math.min(
      LARGE_CHAPTER_BATCH_SIZE_BLOCKS,
      totalBlockCount,
    );
  }

  public readonly getSnapshot = (): number => this.#renderedBlockCount;

  public readonly subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    this.scheduleNextBatch();
    return () => {
      this.#listeners.delete(listener);
      if (this.#listeners.size === 0) {
        this.cancelPendingBatch();
      }
    };
  };

  private scheduleNextBatch(): void {
    if (
      this.#listeners.size === 0 ||
      this.#cancelScheduledYield !== undefined ||
      this.#renderedBlockCount >= this.#totalBlockCount
    ) {
      return;
    }

    this.#scheduleRevision += 1;
    const revision = this.#scheduleRevision;
    this.#cancelScheduledYield = this.#scheduleYield(() => {
      if (revision !== this.#scheduleRevision) {
        return;
      }
      this.#cancelScheduledYield = undefined;
      this.#renderedBlockCount = Math.min(
        this.#totalBlockCount,
        this.#renderedBlockCount + LARGE_CHAPTER_BATCH_SIZE_BLOCKS,
      );
      for (const listener of this.#listeners) {
        listener();
      }
      this.scheduleNextBatch();
    });
  }

  private cancelPendingBatch(): void {
    this.#scheduleRevision += 1;
    this.#cancelScheduledYield?.();
    this.#cancelScheduledYield = undefined;
  }
}
