import type { OpenedPublication, PublicationLocatedBlock } from "@voxleaf/epub";
import type { ReadingLocatorV1 } from "@voxleaf/shared";

import type { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";

export const ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX = 24;

const CARET_INLINE_INSET_PX = 1;
const NOOP = (): void => undefined;

export interface VisualLocatorRect {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface ActiveVisualLocatorEnvironment {
  viewportRect(root: HTMLElement): VisualLocatorRect | undefined;
  blockRect(element: HTMLElement): VisualLocatorRect | undefined;
  textDirection(element: HTMLElement): "ltr" | "rtl";
  rangeAtPoint(document: Document, x: number, y: number): Range | undefined;
  schedule(root: HTMLElement, callback: () => void): () => void;
  observe(root: HTMLElement, callback: () => void): () => void;
}

export interface ActiveVisualLocatorTrackerOptions {
  readonly environment?: ActiveVisualLocatorEnvironment;
  readonly initialLocator?: ReadingLocatorV1;
  readonly onLocator: (locator: ReadingLocatorV1) => void;
}

interface MeasuredVisualBlock {
  readonly element: HTMLElement;
  readonly locatedBlock: PublicationLocatedBlock;
  readonly rect: VisualLocatorRect;
}

function finiteRect(
  top: number,
  right: number,
  bottom: number,
  left: number,
): VisualLocatorRect | undefined {
  if (
    !Number.isFinite(top) ||
    !Number.isFinite(right) ||
    !Number.isFinite(bottom) ||
    !Number.isFinite(left) ||
    bottom < top ||
    right < left
  ) {
    return undefined;
  }
  return Object.freeze({ top, right, bottom, left });
}

function browserViewportRect(root: HTMLElement): VisualLocatorRect | undefined {
  const view = root.ownerDocument.defaultView;
  if (view === null) {
    return undefined;
  }
  const viewport = view.visualViewport;
  const top = viewport?.offsetTop ?? 0;
  const left = viewport?.offsetLeft ?? 0;
  const width = viewport?.width ?? view.innerWidth;
  const height = viewport?.height ?? view.innerHeight;
  return finiteRect(top, left + width, top + height, left);
}

function browserBlockRect(element: HTMLElement): VisualLocatorRect | undefined {
  const rect = element.getBoundingClientRect();
  return finiteRect(rect.top, rect.right, rect.bottom, rect.left);
}

function browserTextDirection(element: HTMLElement): "ltr" | "rtl" {
  return element.ownerDocument.defaultView?.getComputedStyle(element)
    .direction === "rtl"
    ? "rtl"
    : "ltr";
}

function browserRangeAtPoint(
  document: Document,
  x: number,
  y: number,
): Range | undefined {
  try {
    const position = document.caretPositionFromPoint?.(x, y);
    if (position !== null && position !== undefined) {
      const range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
      return range;
    }
    const range = document.caretRangeFromPoint?.(x, y);
    if (range !== null && range !== undefined) {
      range.collapse(true);
      return range;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function scheduleBrowserSample(
  root: HTMLElement,
  callback: () => void,
): () => void {
  const view = root.ownerDocument.defaultView;
  if (view === null) {
    return NOOP;
  }
  let active = true;
  if (typeof view.requestAnimationFrame === "function") {
    const frame = view.requestAnimationFrame(() => {
      if (active) {
        active = false;
        callback();
      }
    });
    return () => {
      if (!active) {
        return;
      }
      active = false;
      view.cancelAnimationFrame(frame);
    };
  }
  const timer = view.setTimeout(() => {
    if (active) {
      active = false;
      callback();
    }
  }, 0);
  return () => {
    if (!active) {
      return;
    }
    active = false;
    view.clearTimeout(timer);
  };
}

function observeBrowserChanges(
  root: HTMLElement,
  callback: () => void,
): () => void {
  const view = root.ownerDocument.defaultView;
  if (view === null) {
    return NOOP;
  }
  view.addEventListener("scroll", callback, {
    capture: true,
    passive: true,
  });
  view.addEventListener("resize", callback, { passive: true });
  view.visualViewport?.addEventListener("scroll", callback, { passive: true });
  view.visualViewport?.addEventListener("resize", callback, { passive: true });
  const resizeObserver =
    typeof view.ResizeObserver === "function"
      ? new view.ResizeObserver(callback)
      : undefined;
  resizeObserver?.observe(root);

  return () => {
    view.removeEventListener("scroll", callback, true);
    view.removeEventListener("resize", callback);
    view.visualViewport?.removeEventListener("scroll", callback);
    view.visualViewport?.removeEventListener("resize", callback);
    resizeObserver?.disconnect();
  };
}

export const BROWSER_ACTIVE_VISUAL_LOCATOR_ENVIRONMENT: ActiveVisualLocatorEnvironment =
  Object.freeze({
    viewportRect: browserViewportRect,
    blockRect: browserBlockRect,
    textDirection: browserTextDirection,
    rangeAtPoint: browserRangeAtPoint,
    schedule: scheduleBrowserSample,
    observe: observeBrowserChanges,
  });

function isLeafBlock(locatedBlock: PublicationLocatedBlock): boolean {
  return (
    locatedBlock.block.kind === "heading" ||
    locatedBlock.block.kind === "paragraph"
  );
}

function sourceOrder(
  left: PublicationLocatedBlock,
  right: PublicationLocatedBlock,
): number {
  const spineDifference =
    left.startLocator.spineItemIndex - right.startLocator.spineItemIndex;
  return spineDifference === 0
    ? left.startLocator.anchor.anchorIndex -
        right.startLocator.anchor.anchorIndex
    : spineDifference;
}

function intersectsViewport(
  rect: VisualLocatorRect,
  viewport: VisualLocatorRect,
): boolean {
  return (
    rect.bottom >= viewport.top &&
    rect.top <= viewport.bottom &&
    rect.right >= viewport.left &&
    rect.left <= viewport.right
  );
}

function crossesReadingLine(
  rect: VisualLocatorRect,
  readingLine: number,
): boolean {
  return rect.top <= readingLine && rect.bottom >= readingLine;
}

function distanceFromReadingLine(
  rect: VisualLocatorRect,
  readingLine: number,
): number {
  if (readingLine < rect.top) {
    return rect.top - readingLine;
  }
  if (readingLine > rect.bottom) {
    return readingLine - rect.bottom;
  }
  return 0;
}

function firstInSourceOrder(
  blocks: readonly MeasuredVisualBlock[],
): MeasuredVisualBlock | undefined {
  let first: MeasuredVisualBlock | undefined;
  for (const block of blocks) {
    if (
      first === undefined ||
      sourceOrder(block.locatedBlock, first.locatedBlock) < 0
    ) {
      first = block;
    }
  }
  return first;
}

function nearestInSourceOrder(
  blocks: readonly MeasuredVisualBlock[],
  readingLine: number,
): MeasuredVisualBlock | undefined {
  let nearest: MeasuredVisualBlock | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const block of blocks) {
    const distance = distanceFromReadingLine(block.rect, readingLine);
    if (
      distance < nearestDistance ||
      (distance === nearestDistance &&
        nearest !== undefined &&
        sourceOrder(block.locatedBlock, nearest.locatedBlock) < 0)
    ) {
      nearest = block;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function selectMeasuredBlock(
  blocks: readonly MeasuredVisualBlock[],
  readingLine: number,
): MeasuredVisualBlock | undefined {
  const leaves = blocks.filter(({ locatedBlock }) => isLeafBlock(locatedBlock));
  const crossingLeaf = firstInSourceOrder(
    leaves.filter(({ rect }) => crossesReadingLine(rect, readingLine)),
  );
  if (crossingLeaf !== undefined) {
    return crossingLeaf;
  }
  if (leaves.length > 0) {
    return nearestInSourceOrder(leaves, readingLine);
  }
  const crossingStructural = firstInSourceOrder(
    blocks.filter(({ rect }) => crossesReadingLine(rect, readingLine)),
  );
  return crossingStructural ?? nearestInSourceOrder(blocks, readingLine);
}

function locatorEqual(
  left: ReadingLocatorV1 | undefined,
  right: ReadingLocatorV1,
): boolean {
  return (
    left !== undefined &&
    left.schemaVersion === right.schemaVersion &&
    left.bookIdentity.scheme === right.bookIdentity.scheme &&
    left.bookIdentity.schemeVersion === right.bookIdentity.schemeVersion &&
    left.bookIdentity.value === right.bookIdentity.value &&
    left.spineItemId === right.spineItemId &&
    left.spineItemIndex === right.spineItemIndex &&
    left.anchor.kind === right.anchor.kind &&
    left.anchor.formatVersion === right.anchor.formatVersion &&
    left.anchor.value === right.anchor.value &&
    left.anchor.anchorIndex === right.anchor.anchorIndex &&
    left.textOffsetCodePoints === right.textOffsetCodePoints &&
    left.progression === right.progression
  );
}

/**
 * Owns transient viewport geometry for the active semantic document. It emits
 * only package-normalized logical locators and performs no focus or storage
 * work.
 */
export class ActiveVisualLocatorTracker {
  readonly #publication: OpenedPublication;
  readonly #mapper: SemanticDomRangeMapper;
  readonly #environment: ActiveVisualLocatorEnvironment;
  readonly #onLocator: (locator: ReadingLocatorV1) => void;
  readonly #locatedBlocksByElement = new Map<
    HTMLElement,
    PublicationLocatedBlock
  >();
  #leafElements: HTMLElement[] = [];
  #structuralElements: HTMLElement[] = [];
  #staleElementCount = 0;
  #root: HTMLElement | undefined;
  #cancelObservation: (() => void) | undefined;
  #cancelScheduledSample: (() => void) | undefined;
  #lastLocator: ReadingLocatorV1 | undefined;
  #suspensionDepth = 0;
  #dirty = false;
  #closed = false;

  public constructor(
    publication: OpenedPublication,
    mapper: SemanticDomRangeMapper,
    options: ActiveVisualLocatorTrackerOptions,
  ) {
    this.#publication = publication;
    this.#mapper = mapper;
    this.#environment =
      options.environment ?? BROWSER_ACTIVE_VISUAL_LOCATOR_ENVIRONMENT;
    this.#onLocator = options.onLocator;
    this.#lastLocator = options.initialLocator;
  }

  public get registrationCount(): number {
    return this.#locatedBlocksByElement.size;
  }

  public get suspended(): boolean {
    return this.#suspensionDepth > 0;
  }

  public setRoot(root: HTMLElement | null): void {
    if (this.#closed || this.#root === (root ?? undefined)) {
      return;
    }
    this.#teardownRoot();
    this.#root = root ?? undefined;
    if (root === null) {
      this.#dirty = true;
      return;
    }

    this.#cancelObservation = this.#environment.observe(root, () =>
      this.requestSample(),
    );
    this.requestSample();
  }

  public registerBlock(
    element: HTMLElement,
    locatedBlock: PublicationLocatedBlock,
  ): () => void {
    if (this.#closed || !element.isConnected) {
      return NOOP;
    }
    const previous = this.#locatedBlocksByElement.get(element);
    if (previous === undefined) {
      this.#insertInSourceOrder(
        isLeafBlock(locatedBlock)
          ? this.#leafElements
          : this.#structuralElements,
        element,
        locatedBlock,
      );
    } else if (isLeafBlock(previous) !== isLeafBlock(locatedBlock)) {
      this.#leafElements = this.#leafElements.filter(
        (candidate) => candidate !== element,
      );
      this.#structuralElements = this.#structuralElements.filter(
        (candidate) => candidate !== element,
      );
      this.#insertInSourceOrder(
        isLeafBlock(locatedBlock)
          ? this.#leafElements
          : this.#structuralElements,
        element,
        locatedBlock,
      );
    }
    this.#locatedBlocksByElement.set(element, locatedBlock);
    this.requestSample();
    return () => this.#remove(element, locatedBlock);
  }

  public requestSample(): void {
    if (this.#closed) {
      return;
    }
    this.#dirty = true;
    const root = this.#root;
    if (
      root === undefined ||
      this.#suspensionDepth > 0 ||
      this.#cancelScheduledSample !== undefined
    ) {
      return;
    }
    this.#cancelScheduledSample = this.#environment.schedule(root, () => {
      this.#cancelScheduledSample = undefined;
      if (
        this.#closed ||
        this.#suspensionDepth > 0 ||
        this.#root !== root ||
        !this.#dirty
      ) {
        return;
      }
      this.#dirty = false;
      this.#sample(root);
    });
  }

  public suspend(): () => void {
    if (this.#closed) {
      return NOOP;
    }
    this.#suspensionDepth += 1;
    this.#dirty = true;
    this.#cancelScheduledSample?.();
    this.#cancelScheduledSample = undefined;
    let resumed = false;
    return () => {
      if (resumed) {
        return;
      }
      resumed = true;
      if (this.#closed || this.#suspensionDepth === 0) {
        return;
      }
      this.#suspensionDepth -= 1;
      if (this.#suspensionDepth === 0) {
        this.requestSample();
      }
    };
  }

  public setCurrentLocator(locator: ReadingLocatorV1): void {
    if (!this.#closed) {
      this.#lastLocator = locator;
    }
  }

  public close(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#teardownRoot();
    this.#locatedBlocksByElement.clear();
    this.#leafElements = [];
    this.#structuralElements = [];
    this.#staleElementCount = 0;
    this.#suspensionDepth = 0;
    this.#dirty = false;
  }

  #sample(root: HTMLElement): void {
    const viewport = this.#environment.viewportRect(root);
    if (viewport === undefined) {
      return;
    }
    const readingLine = Math.min(
      viewport.bottom,
      viewport.top + ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX,
    );
    this.#compactRegisteredElements();
    const visibleLeaves = this.#measureVisibleLeaves(
      root,
      viewport,
      readingLine,
    );
    const selected =
      selectMeasuredBlock(visibleLeaves, readingLine) ??
      selectMeasuredBlock(
        this.#measureVisibleLinear(this.#structuralElements, root, viewport),
        readingLine,
      );
    if (selected === undefined) {
      return;
    }

    const { element, locatedBlock, rect } = selected;
    let candidate = locatedBlock.startLocator;
    if (isLeafBlock(locatedBlock) && crossesReadingLine(rect, readingLine)) {
      const left = Math.max(rect.left, viewport.left);
      const right = Math.min(rect.right, viewport.right);
      if (right >= left) {
        const x =
          this.#environment.textDirection(element) === "rtl"
            ? Math.max(left, right - CARET_INLINE_INSET_PX)
            : Math.min(right, left + CARET_INLINE_INSET_PX);
        const range = this.#environment.rangeAtPoint(
          root.ownerDocument,
          x,
          readingLine,
        );
        const position =
          range === undefined ? undefined : this.#mapper.positionFor(range);
        if (
          position?.locatedBlock === locatedBlock &&
          position.textOffsetCodePoints <= locatedBlock.textLengthCodePoints
        ) {
          candidate = Object.freeze({
            ...locatedBlock.startLocator,
            textOffsetCodePoints: position.textOffsetCodePoints,
          });
        }
      }
    }

    let locator: ReadingLocatorV1;
    try {
      locator = this.#publication.resolveLocator(candidate).locator;
    } catch {
      return;
    }
    if (locatorEqual(this.#lastLocator, locator)) {
      return;
    }
    this.#lastLocator = locator;
    this.#onLocator(locator);
  }

  #teardownRoot(): void {
    this.#cancelScheduledSample?.();
    this.#cancelScheduledSample = undefined;
    this.#cancelObservation?.();
    this.#cancelObservation = undefined;
    this.#root = undefined;
  }

  #remove(element: HTMLElement, locatedBlock: PublicationLocatedBlock): void {
    if (this.#locatedBlocksByElement.get(element) !== locatedBlock) {
      return;
    }
    this.#locatedBlocksByElement.delete(element);
    this.#staleElementCount += 1;
    if (this.#locatedBlocksByElement.size === 0) {
      this.#leafElements = [];
      this.#structuralElements = [];
      this.#staleElementCount = 0;
    }
    this.requestSample();
  }

  #insertInSourceOrder(
    elements: HTMLElement[],
    element: HTMLElement,
    locatedBlock: PublicationLocatedBlock,
  ): void {
    const last = elements.at(-1);
    const lastBlock =
      last === undefined ? undefined : this.#locatedBlocksByElement.get(last);
    if (lastBlock === undefined || sourceOrder(lastBlock, locatedBlock) <= 0) {
      elements.push(element);
      return;
    }

    let low = 0;
    let high = elements.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      const middleBlock = this.#locatedBlocksByElement.get(elements[middle]!);
      if (
        middleBlock === undefined ||
        sourceOrder(middleBlock, locatedBlock) <= 0
      ) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    elements.splice(low, 0, element);
  }

  #compactRegisteredElements(): void {
    if (this.#staleElementCount === 0) {
      return;
    }
    const isCurrent = (element: HTMLElement): boolean =>
      this.#locatedBlocksByElement.has(element);
    this.#leafElements = this.#leafElements.filter(isCurrent);
    this.#structuralElements = this.#structuralElements.filter(isCurrent);
    this.#staleElementCount = 0;
  }

  #measure(
    element: HTMLElement,
    root: HTMLElement,
  ): MeasuredVisualBlock | undefined {
    const locatedBlock = this.#locatedBlocksByElement.get(element);
    if (
      locatedBlock === undefined ||
      !element.isConnected ||
      !root.contains(element)
    ) {
      return undefined;
    }
    const rect = this.#environment.blockRect(element);
    return rect === undefined ? undefined : { element, locatedBlock, rect };
  }

  #measureVisibleLeaves(
    root: HTMLElement,
    viewport: VisualLocatorRect,
    readingLine: number,
  ): readonly MeasuredVisualBlock[] {
    const elements = this.#leafElements;
    let low = 0;
    let high = elements.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      const measured = this.#measure(elements[middle]!, root);
      if (measured === undefined) {
        return this.#measureVisibleLinear(elements, root, viewport);
      }
      if (measured.rect.bottom < readingLine) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }

    const visible: MeasuredVisualBlock[] = [];
    for (let index = low - 1; index >= 0; index -= 1) {
      const measured = this.#measure(elements[index]!, root);
      if (measured === undefined) {
        return this.#measureVisibleLinear(elements, root, viewport);
      }
      if (measured.rect.bottom < viewport.top) {
        break;
      }
      if (intersectsViewport(measured.rect, viewport)) {
        visible.unshift(measured);
      }
    }
    for (let index = low; index < elements.length; index += 1) {
      const measured = this.#measure(elements[index]!, root);
      if (measured === undefined) {
        return this.#measureVisibleLinear(elements, root, viewport);
      }
      if (measured.rect.top > viewport.bottom) {
        break;
      }
      if (intersectsViewport(measured.rect, viewport)) {
        visible.push(measured);
      }
    }
    return visible;
  }

  #measureVisibleLinear(
    elements: readonly HTMLElement[],
    root: HTMLElement,
    viewport: VisualLocatorRect,
  ): readonly MeasuredVisualBlock[] {
    const visible: MeasuredVisualBlock[] = [];
    for (const element of elements) {
      const measured = this.#measure(element, root);
      if (
        measured !== undefined &&
        intersectsViewport(measured.rect, viewport)
      ) {
        visible.push(measured);
      }
    }
    return visible;
  }
}
