import type {
  OpenedPublication,
  PublicationLocatedBlock,
  PublicationLocatorResolution,
} from "@voxleaf/epub";
import type { ReadingLocatorV1 } from "@voxleaf/shared";

import {
  ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX,
  type ActiveVisualLocatorResumeOptions,
  type VisualLocatorRect,
} from "./active-visual-locator";
import type { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";

const NOOP = (): void => undefined;
const ALIGNMENT_TOLERANCE_PX = 0.75;
const REQUIRED_STABLE_FRAMES = 2;
export const MAX_REFLOW_SETTLE_FRAMES = 12;

export type ReaderReflowReason = "preference" | "restoration" | "viewport";
export type ReaderReflowPlacement =
  "block-start" | "exact-range" | "unavailable";

export interface ReaderReflowRestorationResult {
  readonly locator: ReadingLocatorV1;
  readonly resolution: PublicationLocatorResolution["status"];
  readonly placement: ReaderReflowPlacement;
  readonly aligned: boolean;
  readonly reason: ReaderReflowReason;
}

export interface ReaderReflowEnvironment {
  viewportRect(root: HTMLElement): VisualLocatorRect | undefined;
  rangeRect(range: Range): VisualLocatorRect | undefined;
  elementRect(element: HTMLElement): VisualLocatorRect | undefined;
  scrollBy(root: HTMLElement, top: number): void;
  schedule(root: HTMLElement, callback: () => void): () => void;
  observeViewport(root: HTMLElement, callback: () => void): () => void;
}

export interface ReaderReflowVisualLocator {
  suspend(): (options?: ActiveVisualLocatorResumeOptions) => void;
  setCurrentLocator(locator: ReadingLocatorV1): void;
}

export interface ReaderReflowRestorerOptions {
  readonly environment?: ReaderReflowEnvironment;
  readonly currentLocator: () => ReadingLocatorV1;
  readonly onRestored?: (result: ReaderReflowRestorationResult) => void;
}

interface PendingRestoration {
  readonly revision: number;
  readonly locator: ReadingLocatorV1;
  readonly locatedBlock: PublicationLocatedBlock;
  readonly resolution: PublicationLocatorResolution["status"];
  readonly reason: ReaderReflowReason;
  attempts: number;
  stableFrames: number;
  lastPlacement: Exclude<ReaderReflowPlacement, "unavailable"> | undefined;
}

function finiteRect(rect: {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}): VisualLocatorRect | undefined {
  return Number.isFinite(rect.top) &&
    Number.isFinite(rect.right) &&
    Number.isFinite(rect.bottom) &&
    Number.isFinite(rect.left) &&
    rect.bottom >= rect.top &&
    rect.right >= rect.left
    ? Object.freeze({
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
      })
    : undefined;
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
  return finiteRect({
    top,
    right: left + width,
    bottom: top + height,
    left,
  });
}

function browserRangeRect(range: Range): VisualLocatorRect | undefined {
  try {
    const clientRect =
      typeof range.getClientRects === "function"
        ? range.getClientRects().item(0)
        : null;
    const rect =
      clientRect ??
      (typeof range.getBoundingClientRect === "function"
        ? range.getBoundingClientRect()
        : undefined);
    return rect === undefined || rect === null ? undefined : finiteRect(rect);
  } catch {
    return undefined;
  }
}

function browserElementRect(
  element: HTMLElement,
): VisualLocatorRect | undefined {
  try {
    return finiteRect(element.getBoundingClientRect());
  } catch {
    return undefined;
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
    // A failed visual adjustment must not make reading unavailable.
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

function observeBrowserViewport(
  root: HTMLElement,
  callback: () => void,
): () => void {
  const view = root.ownerDocument.defaultView;
  if (view === null) {
    return NOOP;
  }
  view.addEventListener("resize", callback, { passive: true });
  view.visualViewport?.addEventListener("resize", callback, { passive: true });
  return () => {
    view.removeEventListener("resize", callback);
    view.visualViewport?.removeEventListener("resize", callback);
  };
}

export const BROWSER_READER_REFLOW_ENVIRONMENT: ReaderReflowEnvironment =
  Object.freeze({
    viewportRect: browserViewportRect,
    rangeRect: browserRangeRect,
    elementRect: browserElementRect,
    scrollBy: browserScrollBy,
    schedule: scheduleBrowserFrame,
    observeViewport: observeBrowserViewport,
  });

function targetGeometry(
  mapper: SemanticDomRangeMapper,
  environment: ReaderReflowEnvironment,
  pending: PendingRestoration,
):
  | {
      readonly rect: VisualLocatorRect;
      readonly placement: Exclude<ReaderReflowPlacement, "unavailable">;
    }
  | undefined {
  const exactRange = mapper.rangeFor(
    pending.locatedBlock,
    pending.locator.textOffsetCodePoints,
  );
  const exactRect =
    exactRange === undefined ? undefined : environment.rangeRect(exactRange);
  if (exactRect !== undefined) {
    return { rect: exactRect, placement: "exact-range" };
  }

  const blockStartRange = mapper.rangeFor(pending.locatedBlock, 0);
  const blockStartRect =
    blockStartRange === undefined
      ? undefined
      : environment.rangeRect(blockStartRange);
  if (blockStartRect !== undefined) {
    return { rect: blockStartRect, placement: "block-start" };
  }

  const element = mapper.elementFor(pending.locatedBlock);
  const elementRect =
    element === undefined ? undefined : environment.elementRect(element);
  return elementRect === undefined
    ? undefined
    : { rect: elementRect, placement: "block-start" };
}

/**
 * Preserves one package-normalized logical passage while application-owned
 * layout changes. It owns only bounded transient geometry and never changes
 * focus, browser history, storage, or publication content.
 */
export class ReaderReflowRestorer {
  readonly #publication: OpenedPublication;
  readonly #mapper: SemanticDomRangeMapper;
  readonly #visualLocator: ReaderReflowVisualLocator;
  readonly #environment: ReaderReflowEnvironment;
  readonly #currentLocator: () => ReadingLocatorV1;
  readonly #onRestored: (result: ReaderReflowRestorationResult) => void;
  #root: HTMLElement | undefined;
  #cancelViewportObservation: (() => void) | undefined;
  #cancelScheduledFrame: (() => void) | undefined;
  #resumeVisualLocator:
    ((options?: ActiveVisualLocatorResumeOptions) => void) | undefined;
  #pending: PendingRestoration | undefined;
  #revision = 0;
  #closed = false;

  public constructor(
    publication: OpenedPublication,
    mapper: SemanticDomRangeMapper,
    visualLocator: ReaderReflowVisualLocator,
    options: ReaderReflowRestorerOptions,
  ) {
    this.#publication = publication;
    this.#mapper = mapper;
    this.#visualLocator = visualLocator;
    this.#environment =
      options.environment ?? BROWSER_READER_REFLOW_ENVIRONMENT;
    this.#currentLocator = options.currentLocator;
    this.#onRestored = options.onRestored ?? NOOP;
  }

  public get restoring(): boolean {
    return this.#pending !== undefined;
  }

  public setRoot(root: HTMLElement | null): void {
    if (this.#closed || this.#root === (root ?? undefined)) {
      return;
    }
    this.cancel();
    this.#cancelViewportObservation?.();
    this.#cancelViewportObservation = undefined;
    this.#root = root ?? undefined;
    if (root !== null) {
      this.#cancelViewportObservation = this.#environment.observeViewport(
        root,
        () => {
          if (this.#pending === undefined) {
            this.preserve(this.#currentLocator(), "viewport");
          }
        },
      );
    }
  }

  public preserve(
    locator: ReadingLocatorV1,
    reason: ReaderReflowReason,
  ): boolean {
    if (this.#closed || this.#root === undefined) {
      return false;
    }

    let resolution: PublicationLocatorResolution | undefined;
    try {
      resolution = this.#publication.resolveLocator(locator);
    } catch {
      this.cancel();
      return false;
    }
    if (resolution === undefined) {
      this.cancel();
      return false;
    }

    this.#revision += 1;
    this.#pending = {
      revision: this.#revision,
      locator: resolution.locator,
      locatedBlock: resolution.locatedBlock,
      resolution: resolution.status,
      reason,
      attempts: 0,
      stableFrames: 0,
      lastPlacement: undefined,
    };
    this.#cancelScheduledFrame?.();
    this.#cancelScheduledFrame = undefined;
    this.#resumeVisualLocator ??= this.#visualLocator.suspend();
    this.#schedule();
    return true;
  }

  public cancel(): void {
    this.#cancelScheduledFrame?.();
    this.#cancelScheduledFrame = undefined;
    this.#pending = undefined;
    const resume = this.#resumeVisualLocator;
    this.#resumeVisualLocator = undefined;
    resume?.();
  }

  public close(): void {
    if (this.#closed) {
      return;
    }
    this.cancel();
    this.#closed = true;
    this.#cancelViewportObservation?.();
    this.#cancelViewportObservation = undefined;
    this.#root = undefined;
  }

  #schedule(): void {
    const root = this.#root;
    const pending = this.#pending;
    if (
      root === undefined ||
      pending === undefined ||
      this.#cancelScheduledFrame !== undefined
    ) {
      return;
    }
    this.#cancelScheduledFrame = this.#environment.schedule(root, () => {
      this.#cancelScheduledFrame = undefined;
      if (
        this.#closed ||
        this.#root !== root ||
        this.#pending?.revision !== pending.revision
      ) {
        return;
      }
      this.#settle(root, pending);
    });
  }

  #settle(root: HTMLElement, pending: PendingRestoration): void {
    pending.attempts += 1;
    const viewport = this.#environment.viewportRect(root);
    const target =
      viewport === undefined
        ? undefined
        : targetGeometry(this.#mapper, this.#environment, pending);
    if (viewport === undefined || target === undefined) {
      if (pending.attempts >= MAX_REFLOW_SETTLE_FRAMES) {
        this.#complete(pending, "unavailable", false);
      } else {
        this.#schedule();
      }
      return;
    }

    pending.lastPlacement = target.placement;
    const readingLine = Math.min(
      viewport.bottom,
      viewport.top + ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX,
    );
    const adjustment = target.rect.top - readingLine;
    if (Math.abs(adjustment) > ALIGNMENT_TOLERANCE_PX) {
      pending.stableFrames = 0;
      this.#environment.scrollBy(root, adjustment);
    } else {
      pending.stableFrames += 1;
      if (pending.stableFrames >= REQUIRED_STABLE_FRAMES) {
        this.#complete(pending, target.placement, true);
        return;
      }
    }

    if (pending.attempts >= MAX_REFLOW_SETTLE_FRAMES) {
      this.#complete(pending, pending.lastPlacement, false);
    } else {
      this.#schedule();
    }
  }

  #complete(
    pending: PendingRestoration,
    placement: ReaderReflowPlacement | undefined,
    aligned: boolean,
  ): void {
    if (this.#pending?.revision !== pending.revision) {
      return;
    }
    this.#cancelScheduledFrame?.();
    this.#cancelScheduledFrame = undefined;
    this.#pending = undefined;
    this.#visualLocator.setCurrentLocator(pending.locator);
    const resume = this.#resumeVisualLocator;
    this.#resumeVisualLocator = undefined;
    resume?.({ requestSample: false });
    this.#onRestored(
      Object.freeze({
        locator: pending.locator,
        resolution: pending.resolution,
        placement: placement ?? "unavailable",
        aligned,
        reason: pending.reason,
      }),
    );
  }
}
