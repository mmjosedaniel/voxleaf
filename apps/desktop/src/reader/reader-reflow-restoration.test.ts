import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  SensitivePublicationText,
  SemanticBlock,
  SemanticDocument,
} from "@voxleaf/epub";
import { type ActiveVisualLocatorResumeOptions } from "./active-visual-locator";
import {
  createIndex,
  decodeReadingLocatorV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  MAX_REFLOW_SETTLE_FRAMES,
  ReaderReflowRestorer,
  type ReaderReflowEnvironment,
  type ReaderReflowRestorationResult,
  type ReaderReflowVisualLocator,
} from "./reader-reflow-restoration";
import { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";

const DOCUMENT_ID = "document:reflow" as ContentDocumentId;

function publicationText(value: string): SensitivePublicationText {
  return value as SensitivePublicationText;
}

const HEADING = Object.freeze({
  kind: "heading",
  level: 1,
  children: Object.freeze([
    Object.freeze({ kind: "text", text: publicationText("Reflow passage") }),
  ]),
}) satisfies SemanticBlock;
const DOCUMENT = Object.freeze({
  id: DOCUMENT_ID,
  location: Object.freeze({
    kind: "spine",
    spineItemId: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.id,
    spineItemIndex: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.index,
  }),
  blocks: Object.freeze([HEADING]),
}) satisfies SemanticDocument;
const LOCATED_BLOCK = Object.freeze({
  documentId: DOCUMENT_ID,
  block: HEADING,
  startLocator:
    VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator,
  textLengthCodePoints: createIndex(14),
}) satisfies PublicationLocatedBlock;

function locatorAt(textOffsetCodePoints: number): ReadingLocatorV1 {
  return decodeReadingLocatorV1({
    ...LOCATED_BLOCK.startLocator,
    textOffsetCodePoints,
  });
}

function createPublication(
  resolveLocator: (
    input: unknown,
  ) => ReturnType<OpenedPublication["resolveLocator"]> = (input) => {
    const locator = decodeReadingLocatorV1(input);
    return Object.freeze({
      status: "exact",
      reason: "exact",
      locator,
      locatedBlock: LOCATED_BLOCK,
    });
  },
): OpenedPublication {
  return {
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
    documents: Object.freeze([DOCUMENT]),
    locators: Object.freeze([LOCATED_BLOCK]),
    navigation: Object.freeze([]),
    resources: Object.freeze([]),
    closed: false,
    readResource: vi.fn(async () => new Uint8Array()),
    resolveLocator: vi.fn(resolveLocator),
    resolveTarget: vi.fn(() =>
      Object.freeze({
        status: "unavailable",
        reason: "unknown-document",
      }),
    ),
    close: vi.fn(() => Promise.resolve()),
  };
}

class ManualReflowEnvironment implements ReaderReflowEnvironment {
  readonly scrollAdjustments: number[] = [];
  scheduledCount = 0;
  cancelledCount = 0;
  exactRangeTop = 80;
  blockStartTop = 70;
  exposeRangeGeometry = true;
  exposeElementGeometry = true;
  #scheduled: (() => void)[] = [];
  #viewportCallback: (() => void) | undefined;

  viewportRect(): {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  } {
    return { top: 0, right: 240, bottom: 120, left: 0 };
  }

  rangeRect(range: Range):
    | {
        readonly top: number;
        readonly right: number;
        readonly bottom: number;
        readonly left: number;
      }
    | undefined {
    if (!this.exposeRangeGeometry) {
      return undefined;
    }
    const top =
      range.startOffset === 0 ? this.blockStartTop : this.exactRangeTop;
    return { top, right: 100, bottom: top + 16, left: 10 };
  }

  elementRect():
    | {
        readonly top: number;
        readonly right: number;
        readonly bottom: number;
        readonly left: number;
      }
    | undefined {
    return this.exposeElementGeometry
      ? {
          top: this.blockStartTop,
          right: 100,
          bottom: this.blockStartTop + 20,
          left: 10,
        }
      : undefined;
  }

  scrollBy(_root: HTMLElement, top: number): void {
    this.scrollAdjustments.push(top);
    this.exactRangeTop -= top;
    this.blockStartTop -= top;
  }

  schedule(_root: HTMLElement, callback: () => void): () => void {
    this.scheduledCount += 1;
    this.#scheduled.push(callback);
    let active = true;
    return () => {
      if (!active) {
        return;
      }
      active = false;
      const index = this.#scheduled.indexOf(callback);
      if (index >= 0) {
        this.#scheduled.splice(index, 1);
      }
      this.cancelledCount += 1;
    };
  }

  observeViewport(_root: HTMLElement, callback: () => void): () => void {
    this.#viewportCallback = callback;
    return () => {
      if (this.#viewportCallback === callback) {
        this.#viewportCallback = undefined;
      }
    };
  }

  flushNext(): boolean {
    const callback = this.#scheduled.shift();
    callback?.();
    return callback !== undefined;
  }

  flushAll(limit = MAX_REFLOW_SETTLE_FRAMES + 2): void {
    for (let index = 0; index < limit && this.flushNext(); index += 1) {
      // Keep draining the bounded frame sequence.
    }
  }

  notifyViewport(): void {
    this.#viewportCallback?.();
  }
}

class ManualVisualLocator implements ReaderReflowVisualLocator {
  suspendCount = 0;
  resumeCount = 0;
  currentLocator: ReadingLocatorV1 | undefined;

  suspend(): (options?: ActiveVisualLocatorResumeOptions) => void {
    this.suspendCount += 1;
    let active = true;
    return () => {
      if (active) {
        active = false;
        this.resumeCount += 1;
      }
    };
  }

  setCurrentLocator(locator: ReadingLocatorV1): void {
    this.currentLocator = locator;
  }
}

interface Harness {
  readonly mapper: SemanticDomRangeMapper;
  readonly environment: ManualReflowEnvironment;
  readonly visualLocator: ManualVisualLocator;
  readonly results: ReaderReflowRestorationResult[];
  readonly restorer: ReaderReflowRestorer;
  readonly root: HTMLElement;
  readonly heading: HTMLElement;
}

function createHarness(
  options: Readonly<{
    publication?: OpenedPublication;
    currentLocator?: () => ReadingLocatorV1;
    register?: boolean;
  }> = {},
): Harness {
  const root = document.createElement("article");
  const heading = document.createElement("h1");
  heading.textContent = "Reflow passage";
  root.append(heading);
  document.body.append(root);
  const mapper = new SemanticDomRangeMapper();
  if (options.register !== false) {
    mapper.registerBlock(heading, LOCATED_BLOCK);
  }
  const environment = new ManualReflowEnvironment();
  const visualLocator = new ManualVisualLocator();
  const results: ReaderReflowRestorationResult[] = [];
  const restorer = new ReaderReflowRestorer(
    options.publication ?? createPublication(),
    mapper,
    visualLocator,
    {
      environment,
      currentLocator: options.currentLocator ?? (() => locatorAt(4)),
      onRestored: (result) => results.push(result),
    },
  );
  restorer.setRoot(root);
  return {
    mapper,
    environment,
    visualLocator,
    results,
    restorer,
    root,
    heading,
  };
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("reader reflow restoration", () => {
  it("aligns the exact canonical range after preference reflow without stealing focus", () => {
    const harness = createHarness();
    expect(harness.mapper.registrationCount).toBe(1);
    expect(harness.mapper.rangeFor(LOCATED_BLOCK, 4)).toBeDefined();
    const focusOwner = document.createElement("button");
    document.body.append(focusOwner);
    focusOwner.focus();
    const locator = locatorAt(4);

    harness.restorer.preserve(locator, "preference");
    harness.environment.flushAll();

    expect(harness.environment.scrollAdjustments).toEqual([56]);
    expect(harness.visualLocator.suspendCount).toBe(1);
    expect(harness.visualLocator.resumeCount).toBe(1);
    expect(harness.visualLocator.currentLocator).toEqual(locator);
    expect(harness.results).toEqual([
      {
        locator,
        resolution: "exact",
        placement: "exact-range",
        aligned: true,
        reason: "preference",
      },
    ]);
    expect(focusOwner).toHaveFocus();
    expect(harness.restorer.restoring).toBe(false);
  });

  it("uses a recovered block-start fallback when exact range geometry is unavailable", () => {
    const recovered = LOCATED_BLOCK.startLocator;
    const publication = createPublication(() =>
      Object.freeze({
        status: "recovered",
        reason: "nearest-offset",
        locator: recovered,
        locatedBlock: LOCATED_BLOCK,
      }),
    );
    const harness = createHarness({ publication });
    harness.environment.exposeRangeGeometry = false;

    harness.restorer.preserve(locatorAt(99), "preference");
    harness.environment.flushAll();

    expect(harness.environment.scrollAdjustments).toEqual([46]);
    expect(harness.visualLocator.currentLocator).toBe(recovered);
    expect(harness.results[0]).toEqual({
      locator: recovered,
      resolution: "recovered",
      placement: "block-start",
      aligned: true,
      reason: "preference",
    });
  });

  it("coalesces rapid changes around the latest canonical locator", () => {
    const harness = createHarness();
    const first = locatorAt(2);
    const latest = locatorAt(6);

    harness.restorer.preserve(first, "preference");
    harness.restorer.preserve(latest, "preference");
    harness.environment.flushAll();

    expect(harness.visualLocator.suspendCount).toBe(1);
    expect(harness.visualLocator.resumeCount).toBe(1);
    expect(harness.visualLocator.currentLocator).toEqual(latest);
    expect(harness.results).toHaveLength(1);
    expect(harness.results[0]?.locator).toEqual(latest);
    expect(harness.environment.cancelledCount).toBe(1);
  });

  it("captures the current locator when viewport geometry changes", () => {
    const current = locatorAt(5);
    const currentLocator = vi.fn(() => current);
    const harness = createHarness({ currentLocator });

    harness.environment.notifyViewport();
    harness.environment.flushAll();

    expect(currentLocator).toHaveBeenCalledTimes(1);
    expect(harness.visualLocator.currentLocator).toEqual(current);
    expect(harness.results[0]?.reason).toBe("viewport");
  });

  it("does not let a resize notification supersede an active restoration transaction", () => {
    const currentLocator = vi.fn(() => locatorAt(1));
    const harness = createHarness({ currentLocator });
    const restoredLocator = locatorAt(5);

    harness.restorer.preserve(restoredLocator, "restoration");
    harness.environment.notifyViewport();
    harness.environment.flushAll();

    expect(currentLocator).not.toHaveBeenCalled();
    expect(harness.visualLocator.currentLocator).toEqual(restoredLocator);
    expect(harness.results).toHaveLength(1);
    expect(harness.results[0]).toMatchObject({
      locator: restoredLocator,
      reason: "restoration",
    });
  });

  it("bounds a missing DOM target and always resumes passive tracking", () => {
    const harness = createHarness({ register: false });

    harness.restorer.preserve(locatorAt(4), "viewport");
    harness.environment.flushAll();

    expect(harness.environment.scheduledCount).toBe(MAX_REFLOW_SETTLE_FRAMES);
    expect(harness.environment.scrollAdjustments).toEqual([]);
    expect(harness.visualLocator.resumeCount).toBe(1);
    expect(harness.results[0]).toEqual({
      locator: locatorAt(4),
      resolution: "exact",
      placement: "unavailable",
      aligned: false,
      reason: "viewport",
    });
  });

  it("cancels stale work on explicit navigation, root replacement, and close", () => {
    const harness = createHarness();

    harness.restorer.preserve(locatorAt(3), "preference");
    harness.restorer.cancel();
    expect(harness.environment.flushNext()).toBe(false);
    expect(harness.visualLocator.resumeCount).toBe(1);
    expect(harness.results).toEqual([]);

    harness.restorer.preserve(locatorAt(4), "viewport");
    harness.restorer.setRoot(null);
    expect(harness.visualLocator.resumeCount).toBe(2);
    expect(harness.environment.flushNext()).toBe(false);

    harness.restorer.setRoot(harness.root);
    harness.restorer.preserve(locatorAt(5), "viewport");
    harness.restorer.close();
    harness.restorer.close();
    expect(harness.visualLocator.resumeCount).toBe(3);
    expect(harness.environment.flushNext()).toBe(false);
  });
});
