import type { PublicationLocatedBlock } from "@voxleaf/epub";
import type { LocatorRangeV1, ReadingLocatorV1 } from "@voxleaf/shared";

import type {
  ProductNarrationAudibleProgressObservation,
  ProductNarrationNavigationRequest,
  ProductNarrationSnapshot,
} from "../tts/product-narration-coordinator";
import type { ActiveVisualLocatorResumeOptions } from "./active-visual-locator";
import { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";
import { SYNCHRONIZATION_AUTHORITY_V1 } from "./synchronization-authority";

const NOOP = (): void => undefined;

export interface ReaderNarrationSource {
  subscribe(listener: () => void): () => void;
  observe(): ProductNarrationSnapshot;
  subscribeAudibleProgress(
    listener: (observation: ProductNarrationAudibleProgressObservation) => void,
  ): () => void;
  subscribeNavigationRequests?(
    listener: (request: ProductNarrationNavigationRequest) => void,
  ): () => void;
}

export interface SegmentHighlightRect {
  readonly top: number;
  readonly bottom: number;
}

export interface SegmentHighlightEnvironment {
  replaceHighlight(name: string, range: Range): boolean;
  clearHighlight(name: string): void;
  viewportRect(root: HTMLElement): SegmentHighlightRect | undefined;
  rangeRect(range: Range): SegmentHighlightRect | undefined;
  scrollBy(root: HTMLElement, top: number): void;
  schedule(root: HTMLElement, callback: () => void): () => void;
}

export interface SegmentHighlightControllerCallbacks {
  readonly currentSpineItemIndex: () => number;
  readonly navigateToLocator: (locator: ReadingLocatorV1) => void;
  readonly settleLocator: (locator: ReadingLocatorV1) => void;
  readonly suspendVisualSampling: () => (
    options?: ActiveVisualLocatorResumeOptions,
  ) => void;
}

interface ActiveSegmentProjection {
  readonly sessionId: string;
  readonly generationId: string;
  readonly segmentId: string;
  readonly sequence: number;
  readonly sourceRange: LocatorRangeV1;
  navigationRequested: boolean;
}

function finiteRect(value: {
  readonly top: number;
  readonly bottom: number;
}): SegmentHighlightRect | undefined {
  return Number.isFinite(value.top) &&
    Number.isFinite(value.bottom) &&
    value.bottom >= value.top
    ? Object.freeze({ top: value.top, bottom: value.bottom })
    : undefined;
}

function browserViewportRect(
  root: HTMLElement,
): SegmentHighlightRect | undefined {
  const view = root.ownerDocument.defaultView;
  if (view === null) {
    return undefined;
  }
  const viewport = view.visualViewport;
  const top = viewport?.offsetTop ?? 0;
  const height = viewport?.height ?? view.innerHeight;
  return finiteRect({ top, bottom: top + height });
}

function browserRangeRect(range: Range): SegmentHighlightRect | undefined {
  try {
    const rect = range.getBoundingClientRect();
    return finiteRect(rect);
  } catch {
    return undefined;
  }
}

function replaceBrowserHighlight(name: string, range: Range): boolean {
  if (typeof CSS === "undefined") {
    return false;
  }
  const registry = (
    CSS as typeof CSS & {
      highlights?: HighlightRegistry;
    }
  ).highlights;
  if (registry === undefined || typeof globalThis.Highlight !== "function") {
    return false;
  }
  try {
    registry.set(name, new Highlight(range));
    return true;
  } catch {
    return false;
  }
}

function clearBrowserHighlight(name: string): void {
  if (typeof CSS === "undefined") {
    return;
  }
  try {
    (
      CSS as typeof CSS & {
        highlights?: HighlightRegistry;
      }
    ).highlights?.delete(name);
  } catch {
    // Highlight cleanup cannot make publication rendering unavailable.
  }
}

function browserScrollBy(root: HTMLElement, top: number): void {
  const view = root.ownerDocument.defaultView;
  if (view === null || !Number.isFinite(top)) {
    return;
  }
  try {
    view.scrollBy({ top, left: 0, behavior: "auto" });
  } catch {
    // Missing geometry or scrolling support leaves highlight-only behavior.
  }
}

function scheduleBrowserFrame(
  root: HTMLElement,
  callback: () => void,
): () => void {
  const view = root.ownerDocument.defaultView;
  if (view === null) {
    return NOOP;
  }
  let active = true;
  if (typeof view.requestAnimationFrame === "function") {
    let frame = view.requestAnimationFrame(() => {
      if (!active) {
        return;
      }
      // WebView2 may deliver the scroll observation after the frame that
      // performed instant placement. Keep passive sampling suspended through
      // a second frame so that late programmatic callbacks cannot become
      // user-navigation seeks.
      frame = view.requestAnimationFrame(() => {
        if (active) {
          active = false;
          callback();
        }
      });
    });
    return () => {
      if (active) {
        active = false;
        view.cancelAnimationFrame(frame);
      }
    };
  }
  const timer = view.setTimeout(() => {
    if (active) {
      active = false;
      callback();
    }
  }, 0);
  return () => {
    if (active) {
      active = false;
      view.clearTimeout(timer);
    }
  };
}

export const BROWSER_SEGMENT_HIGHLIGHT_ENVIRONMENT: SegmentHighlightEnvironment =
  Object.freeze({
    replaceHighlight: replaceBrowserHighlight,
    clearHighlight: clearBrowserHighlight,
    viewportRect: browserViewportRect,
    rangeRect: browserRangeRect,
    scrollBy: browserScrollBy,
    schedule: scheduleBrowserFrame,
  });

function sameStructuralAnchor(
  left: ReadingLocatorV1,
  right: ReadingLocatorV1,
): boolean {
  return (
    left.bookIdentity.scheme === right.bookIdentity.scheme &&
    left.bookIdentity.schemeVersion === right.bookIdentity.schemeVersion &&
    left.bookIdentity.value === right.bookIdentity.value &&
    left.spineItemId === right.spineItemId &&
    left.spineItemIndex === right.spineItemIndex &&
    left.anchor.kind === right.anchor.kind &&
    left.anchor.formatVersion === right.anchor.formatVersion &&
    left.anchor.value === right.anchor.value &&
    left.anchor.anchorIndex === right.anchor.anchorIndex
  );
}

function segmentKey(
  value: Pick<
    ProductNarrationAudibleProgressObservation,
    "generationId" | "segmentId" | "sequence" | "sessionId"
  >,
): string {
  return `${value.sessionId}\u0000${value.generationId}\u0000${value.segmentId}\u0000${String(value.sequence)}`;
}

/**
 * Owns one content-free structural audible projection and one CSS Custom
 * Highlight entry. It never retains narration text, PCM, DOM geometry, or
 * more than one scheduled follow operation.
 */
export class SegmentHighlightController {
  readonly #mapper: SemanticDomRangeMapper;
  readonly #blocksBySpineAndAnchor = new Map<
    number,
    Map<number, PublicationLocatedBlock>
  >();
  readonly #environment: SegmentHighlightEnvironment;
  #callbacks: SegmentHighlightControllerCallbacks | undefined;
  #root: HTMLElement | undefined;
  #active: ActiveSegmentProjection | undefined;
  #activeKey: string | undefined;
  #resumeVisualSampling:
    ((options?: ActiveVisualLocatorResumeOptions) => void) | undefined;
  #cancelScheduledSettle: (() => void) | undefined;
  #closed = false;

  public constructor(
    locatedBlocks: readonly PublicationLocatedBlock[],
    mapper: SemanticDomRangeMapper,
    callbacks?: SegmentHighlightControllerCallbacks,
    environment: SegmentHighlightEnvironment = BROWSER_SEGMENT_HIGHLIGHT_ENVIRONMENT,
  ) {
    this.#mapper = mapper;
    this.#callbacks = callbacks;
    this.#environment = environment;
    for (const block of locatedBlocks) {
      let byAnchor = this.#blocksBySpineAndAnchor.get(
        block.startLocator.spineItemIndex,
      );
      if (byAnchor === undefined) {
        byAnchor = new Map();
        this.#blocksBySpineAndAnchor.set(
          block.startLocator.spineItemIndex,
          byAnchor,
        );
      }
      byAnchor.set(block.startLocator.anchor.anchorIndex, block);
    }
  }

  public setCallbacks(
    callbacks: SegmentHighlightControllerCallbacks | undefined,
  ): void {
    if (this.#closed || this.#callbacks === callbacks) {
      return;
    }
    this.#cancelPendingFollow();
    this.#callbacks = callbacks;
    this.refresh();
  }

  public setRoot(root: HTMLElement | null): void {
    if (this.#closed || this.#root === (root ?? undefined)) {
      return;
    }
    this.#root = root ?? undefined;
    this.#environment.clearHighlight(
      SYNCHRONIZATION_AUTHORITY_V1.highlighting.name,
    );
    if (root !== null) {
      this.refresh();
    }
  }

  public accept(observation: ProductNarrationAudibleProgressObservation): void {
    if (this.#closed) {
      return;
    }
    if (observation.kind === "progress") {
      return;
    }
    const key = segmentKey(observation);
    if (observation.kind === "segment-completed") {
      if (key === this.#activeKey) {
        this.#cancelScheduledSettle?.();
        this.#cancelScheduledSettle = undefined;
        this.#settleActive(observation.sourceRange.end);
      }
      return;
    }
    this.#cancelPendingFollow();
    this.#active = {
      sessionId: observation.sessionId,
      generationId: observation.generationId,
      segmentId: observation.segmentId,
      sequence: observation.sequence,
      sourceRange: observation.sourceRange,
      navigationRequested: false,
    };
    this.#activeKey = key;
    this.refresh();
  }

  public reconcile(snapshot: ProductNarrationSnapshot): void {
    const phase = snapshot.state?.phase;
    if (
      snapshot.failure !== undefined ||
      phase === "failed" ||
      phase === "stopped" ||
      (phase === undefined && this.#active !== undefined)
    ) {
      this.clear();
    }
  }

  public refresh(): void {
    const active = this.#active;
    if (this.#closed || active === undefined) {
      return;
    }
    const callbacks = this.#callbacks;
    if (callbacks === undefined) {
      return;
    }
    const { start, end } = active.sourceRange;
    const locatedBlock = this.#blocksBySpineAndAnchor
      .get(start.spineItemIndex)
      ?.get(start.anchor.anchorIndex);
    if (
      locatedBlock === undefined ||
      !sameStructuralAnchor(locatedBlock.startLocator, start) ||
      !sameStructuralAnchor(start, end) ||
      start.textOffsetCodePoints >= end.textOffsetCodePoints ||
      end.textOffsetCodePoints > locatedBlock.textLengthCodePoints
    ) {
      this.clear();
      return;
    }

    const range = this.#mapper.rangeBetween(
      locatedBlock,
      start.textOffsetCodePoints,
      end.textOffsetCodePoints,
    );
    if (range === undefined || range.collapsed) {
      this.#ensureVisualSamplingSuspended();
      if (
        callbacks.currentSpineItemIndex() !== start.spineItemIndex &&
        !active.navigationRequested
      ) {
        active.navigationRequested = true;
        callbacks.navigateToLocator(start);
      }
      return;
    }
    const root = this.#root;
    if (root === undefined) {
      return;
    }
    if (
      !this.#environment.replaceHighlight(
        SYNCHRONIZATION_AUTHORITY_V1.highlighting.name,
        range,
      )
    ) {
      this.#settleActive(start);
      return;
    }

    const viewport = this.#environment.viewportRect(root);
    const rect = this.#environment.rangeRect(range);
    if (viewport === undefined || rect === undefined) {
      this.#settleActive(start);
      return;
    }
    const comfortTop =
      viewport.top + SYNCHRONIZATION_AUTHORITY_V1.following.comfortInsetPx;
    const comfortBottom =
      viewport.bottom - SYNCHRONIZATION_AUTHORITY_V1.following.comfortInsetPx;
    const outsideComfortRegion =
      rect.bottom < comfortTop || rect.top > comfortBottom;
    if (!outsideComfortRegion) {
      this.#settleActive(start);
      return;
    }

    this.#ensureVisualSamplingSuspended();
    this.#cancelScheduledSettle?.();
    this.#environment.scrollBy(root, rect.top - comfortTop);
    const expectedKey = this.#activeKey;
    this.#cancelScheduledSettle = this.#environment.schedule(root, () => {
      this.#cancelScheduledSettle = undefined;
      if (this.#activeKey === expectedKey) {
        this.#settleActive(start);
      }
    });
  }

  public clear(): void {
    if (this.#closed && this.#active === undefined) {
      return;
    }
    this.#active = undefined;
    this.#activeKey = undefined;
    this.#environment.clearHighlight(
      SYNCHRONIZATION_AUTHORITY_V1.highlighting.name,
    );
    this.#cancelPendingFollow();
  }

  public close(): void {
    if (this.#closed) {
      return;
    }
    this.clear();
    this.#closed = true;
    this.#root = undefined;
    this.#blocksBySpineAndAnchor.clear();
  }

  #ensureVisualSamplingSuspended(): void {
    this.#resumeVisualSampling ??= this.#callbacks?.suspendVisualSampling();
  }

  #settleActive(locator: ReadingLocatorV1): void {
    this.#callbacks?.settleLocator(locator);
    const resume = this.#resumeVisualSampling;
    this.#resumeVisualSampling = undefined;
    resume?.({ requestSample: false });
  }

  #cancelPendingFollow(): void {
    this.#cancelScheduledSettle?.();
    this.#cancelScheduledSettle = undefined;
    const resume = this.#resumeVisualSampling;
    this.#resumeVisualSampling = undefined;
    resume?.({ requestSample: false });
  }
}
