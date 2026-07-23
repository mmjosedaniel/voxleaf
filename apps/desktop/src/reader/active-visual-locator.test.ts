import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  PublicationLocatorResolution,
  SemanticBlock,
  SemanticInline,
  SensitivePublicationText,
} from "@voxleaf/epub";
import {
  createIndex,
  decodeReadingLocatorV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX,
  ActiveVisualLocatorTracker,
  type ActiveVisualLocatorEnvironment,
  type VisualLocatorRect,
} from "./active-visual-locator";
import { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";

const DOCUMENT_ID = "document:active-visual-locator" as ContentDocumentId;

afterEach(() => {
  document.body.replaceChildren();
});

function publicationText(value: string): SensitivePublicationText {
  return value as SensitivePublicationText;
}

function text(value: string): SemanticInline {
  return Object.freeze({
    kind: "text",
    text: publicationText(value),
  });
}

function paragraph(value: string): SemanticBlock {
  return Object.freeze({
    kind: "paragraph",
    children: Object.freeze([text(value)]),
  });
}

function locatedBlock(
  block: SemanticBlock,
  anchorIndex: number,
  textLengthCodePoints: number,
): PublicationLocatedBlock {
  const base =
    VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator;
  return Object.freeze({
    documentId: DOCUMENT_ID,
    block,
    startLocator: decodeReadingLocatorV1({
      ...base,
      anchor: {
        ...base.anchor,
        value: `visual-s0-a${String(anchorIndex)}`,
        anchorIndex,
      },
      textOffsetCodePoints: 0,
    }),
    textLengthCodePoints: createIndex(textLengthCodePoints),
  });
}

function rect(
  top: number,
  bottom: number,
  left = 10,
  right = 210,
): VisualLocatorRect {
  return Object.freeze({ top, right, bottom, left });
}

class TestVisualLocatorEnvironment implements ActiveVisualLocatorEnvironment {
  readonly rects = new Map<HTMLElement, VisualLocatorRect>();
  readonly measuredElements: HTMLElement[] = [];
  readonly sampledPoints: Array<Readonly<{ x: number; y: number }>> = [];
  viewport = rect(0, 100, 0, 240);
  range: Range | undefined;
  scheduleCount = 0;
  cancellationCount = 0;
  observationCleanupCount = 0;
  #pending:
    | {
        active: boolean;
        readonly callback: () => void;
      }
    | undefined;
  #changeCallback: (() => void) | undefined;

  viewportRect(): VisualLocatorRect {
    return this.viewport;
  }

  blockRect(element: HTMLElement): VisualLocatorRect | undefined {
    this.measuredElements.push(element);
    return this.rects.get(element);
  }

  textDirection(): "ltr" {
    return "ltr";
  }

  rangeAtPoint(_document: Document, x: number, y: number): Range | undefined {
    this.sampledPoints.push(Object.freeze({ x, y }));
    return this.range;
  }

  schedule(_root: HTMLElement, callback: () => void): () => void {
    this.scheduleCount += 1;
    const pending = { active: true, callback };
    this.#pending = pending;
    return () => {
      if (!pending.active) {
        return;
      }
      pending.active = false;
      this.cancellationCount += 1;
      if (this.#pending === pending) {
        this.#pending = undefined;
      }
    };
  }

  observe(_root: HTMLElement, callback: () => void): () => void {
    this.#changeCallback = callback;
    return () => {
      this.observationCleanupCount += 1;
      if (this.#changeCallback === callback) {
        this.#changeCallback = undefined;
      }
    };
  }

  notify(): void {
    this.#changeCallback?.();
  }

  flush(): void {
    const pending = this.#pending;
    if (pending === undefined || !pending.active) {
      return;
    }
    pending.active = false;
    this.#pending = undefined;
    pending.callback();
  }

  get hasPendingSample(): boolean {
    return this.#pending?.active === true;
  }
}

interface TrackerHarness {
  readonly root: HTMLElement;
  readonly elements: readonly HTMLElement[];
  readonly mapper: SemanticDomRangeMapper;
  readonly environment: TestVisualLocatorEnvironment;
  readonly publication: OpenedPublication;
  readonly resolveLocator: ReturnType<typeof vi.fn>;
  readonly emitted: ReadingLocatorV1[];
  readonly tracker: ActiveVisualLocatorTracker;
  close(): void;
}

function createPublication(
  locatedBlocks: readonly PublicationLocatedBlock[],
  resolve?: (
    candidate: ReadingLocatorV1,
    locatedBlock: PublicationLocatedBlock,
  ) => PublicationLocatorResolution,
): {
  readonly publication: OpenedPublication;
  readonly resolveLocator: ReturnType<typeof vi.fn>;
} {
  const resolveLocator = vi.fn(
    (input: unknown): PublicationLocatorResolution => {
      const candidate = decodeReadingLocatorV1(input);
      const matching =
        locatedBlocks.find(
          (located) =>
            located.startLocator.anchor.value === candidate.anchor.value,
        ) ?? locatedBlocks[0];
      if (matching === undefined) {
        throw new Error("Synthetic publication has no locator.");
      }
      return (
        resolve?.(candidate, matching) ??
        Object.freeze({
          status: "exact",
          reason: "exact",
          locator: candidate,
          locatedBlock: matching,
        })
      );
    },
  );
  return {
    resolveLocator,
    publication: {
      book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
      documents: Object.freeze([]),
      locators: locatedBlocks,
      navigation: Object.freeze([]),
      resources: Object.freeze([]),
      closed: false,
      readResource: vi.fn(async () => new Uint8Array()),
      resolveLocator,
      resolveTarget: vi.fn(() =>
        Object.freeze({
          status: "unavailable",
          reason: "invalid-target",
        }),
      ),
      close: vi.fn(async () => undefined),
    },
  };
}

function createHarness(
  locatedBlocks: readonly PublicationLocatedBlock[],
  options: {
    readonly initialLocator?: ReadingLocatorV1;
    readonly resolve?: (
      candidate: ReadingLocatorV1,
      locatedBlock: PublicationLocatedBlock,
    ) => PublicationLocatorResolution;
  } = {},
): TrackerHarness {
  const root = document.createElement("article");
  const elements = locatedBlocks.map((located) => {
    const element =
      located.block.kind === "heading"
        ? document.createElement(`h${String(located.block.level)}`)
        : located.block.kind === "block-quote"
          ? document.createElement("blockquote")
          : located.block.kind === "list"
            ? document.createElement(located.block.ordered ? "ol" : "ul")
            : document.createElement("p");
    if (
      located.block.kind === "heading" ||
      located.block.kind === "paragraph"
    ) {
      element.textContent = located.block.children
        .flatMap((inline) =>
          inline.kind === "text" ? [String(inline.text)] : [],
        )
        .join("");
    }
    root.append(element);
    return element;
  });
  document.body.append(root);

  const mapper = new SemanticDomRangeMapper();
  const environment = new TestVisualLocatorEnvironment();
  const emitted: ReadingLocatorV1[] = [];
  const { publication, resolveLocator } = createPublication(
    locatedBlocks,
    options.resolve,
  );
  const tracker = new ActiveVisualLocatorTracker(publication, mapper, {
    environment,
    ...(options.initialLocator === undefined
      ? {}
      : { initialLocator: options.initialLocator }),
    onLocator: (locator) => emitted.push(locator),
  });
  const unregister = locatedBlocks.map((located, index) => {
    const element = elements[index]!;
    const unregisterMapper = mapper.registerBlock(element, located);
    const unregisterTracker = tracker.registerBlock(element, located);
    return () => {
      unregisterTracker();
      unregisterMapper();
    };
  });
  tracker.setRoot(root);

  return {
    root,
    elements,
    mapper,
    environment,
    publication,
    resolveLocator,
    emitted,
    tracker,
    close: () => {
      tracker.close();
      for (const cleanup of unregister) {
        cleanup();
      }
      mapper.close();
      root.remove();
    },
  };
}

describe("active visual locator tracking", () => {
  it("selects deterministic top, partial, between-block, and document-end positions", () => {
    const first = locatedBlock(paragraph("Alpha"), 0, 5);
    const second = locatedBlock(paragraph("Bravo"), 1, 5);

    const top = createHarness([first, second]);
    top.environment.rects.set(top.elements[0]!, rect(35, 55));
    top.environment.rects.set(top.elements[1]!, rect(65, 85));
    top.environment.flush();
    expect(top.emitted).toEqual([first.startLocator]);
    expect(top.environment.sampledPoints).toHaveLength(0);
    top.close();

    const partial = createHarness([first, second]);
    partial.environment.rects.set(partial.elements[0]!, rect(10, 50));
    partial.environment.rects.set(partial.elements[1]!, rect(60, 90));
    partial.environment.range = partial.mapper.rangeFor(first, 3);
    partial.environment.flush();
    expect(partial.emitted[0]?.anchor.value).toBe(
      first.startLocator.anchor.value,
    );
    expect(partial.emitted[0]?.textOffsetCodePoints).toBe(3);
    expect(partial.environment.sampledPoints).toEqual([
      {
        x: 11,
        y: ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX,
      },
    ]);
    partial.close();

    const between = createHarness([first, second]);
    between.environment.rects.set(between.elements[0]!, rect(5, 20));
    between.environment.rects.set(between.elements[1]!, rect(28, 60));
    between.environment.flush();
    expect(between.emitted).toEqual([first.startLocator]);
    expect(between.environment.sampledPoints).toHaveLength(0);
    between.close();

    const end = createHarness([first, second]);
    end.environment.rects.set(end.elements[0]!, rect(-80, -60));
    end.environment.rects.set(end.elements[1]!, rect(5, 20));
    end.environment.flush();
    expect(end.emitted).toEqual([second.startLocator]);
    expect(end.environment.sampledPoints).toHaveLength(0);
    end.close();
  });

  it("uses block-start fallback for ambiguous caret and structural blocks", () => {
    const first = locatedBlock(paragraph("Alpha"), 0, 5);
    const second = locatedBlock(paragraph("Bravo"), 1, 5);
    const wrongBlock = createHarness([first, second]);
    wrongBlock.environment.rects.set(wrongBlock.elements[0]!, rect(10, 50));
    wrongBlock.environment.rects.set(wrongBlock.elements[1]!, rect(60, 90));
    wrongBlock.environment.range = wrongBlock.mapper.rangeFor(second, 2);
    wrongBlock.environment.flush();
    expect(wrongBlock.emitted).toEqual([first.startLocator]);
    wrongBlock.close();

    const quoteBlock = Object.freeze({
      kind: "block-quote",
      children: Object.freeze([]),
    }) satisfies SemanticBlock;
    const quote = locatedBlock(quoteBlock, 0, 0);
    const structural = createHarness([quote]);
    structural.environment.rects.set(structural.elements[0]!, rect(10, 50));
    structural.environment.flush();
    expect(structural.emitted).toEqual([quote.startLocator]);
    expect(structural.environment.sampledPoints).toHaveLength(0);
    structural.close();
  });

  it("publishes only the package-normalized locator without geometry fields", () => {
    const first = locatedBlock(paragraph("Alpha"), 0, 5);
    const harness = createHarness([first], {
      resolve: (candidate, matching) => {
        const locator = decodeReadingLocatorV1({
          ...candidate,
          textOffsetCodePoints: 2,
        });
        return Object.freeze({
          status: "recovered",
          reason: "nearest-offset",
          locator,
          locatedBlock: matching,
        });
      },
    });
    harness.environment.rects.set(harness.elements[0]!, rect(10, 50));
    harness.environment.range = harness.mapper.rangeFor(first, 4);
    harness.environment.flush();

    expect(harness.resolveLocator).toHaveBeenCalledTimes(1);
    const candidate = harness.resolveLocator.mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    expect(candidate.textOffsetCodePoints).toBe(4);
    expect(Object.keys(candidate).sort()).toEqual([
      "anchor",
      "bookIdentity",
      "progression",
      "schemaVersion",
      "spineItemId",
      "spineItemIndex",
      "textOffsetCodePoints",
    ]);
    expect(JSON.stringify(candidate)).not.toMatch(
      /bottom|coordinate|left|page|pixel|right|scroll|top|viewport/iu,
    );
    expect(harness.emitted).toHaveLength(1);
    expect(harness.emitted[0]?.textOffsetCodePoints).toBe(2);
    expect(Object.isFrozen(harness.emitted[0])).toBe(true);
    harness.close();
  });

  it("coalesces observer bursts and bounds geometry probing around the viewport", () => {
    const blocks = Array.from({ length: 64 }, (_, index) =>
      locatedBlock(paragraph(`Block ${String(index)}`), index, 8),
    );
    const harness = createHarness(blocks);
    for (const [index, element] of harness.elements.entries()) {
      const top = (index - 31) * 20;
      harness.environment.rects.set(element, rect(top, top + 18));
    }

    for (let index = 0; index < 10; index += 1) {
      harness.environment.notify();
      harness.tracker.requestSample();
    }
    expect(harness.environment.scheduleCount).toBe(1);
    harness.environment.flush();
    expect(harness.resolveLocator).toHaveBeenCalledTimes(1);
    expect(harness.emitted.at(-1)?.anchor.value).toBe(
      blocks[32]!.startLocator.anchor.value,
    );
    expect(harness.environment.measuredElements.length).toBeLessThan(20);

    harness.environment.measuredElements.length = 0;
    for (const [index, element] of harness.elements.entries()) {
      const top = (index - 40) * 20;
      harness.environment.rects.set(element, rect(top, top + 18));
    }
    harness.environment.notify();
    harness.environment.notify();
    expect(harness.environment.scheduleCount).toBe(2);
    harness.environment.flush();
    expect(harness.emitted.at(-1)?.anchor.value).toBe(
      blocks[41]!.startLocator.anchor.value,
    );
    expect(harness.environment.measuredElements.length).toBeLessThan(20);
    harness.close();
  });

  it("suspends programmatic updates, resumes once, and cleans up exhaustively", () => {
    const first = locatedBlock(paragraph("Alpha"), 0, 5);
    const harness = createHarness([first]);
    harness.environment.rects.set(harness.elements[0]!, rect(10, 50));

    const resumeOuter = harness.tracker.suspend();
    const resumeInner = harness.tracker.suspend();
    expect(harness.tracker.suspended).toBe(true);
    expect(harness.environment.cancellationCount).toBe(1);
    for (let index = 0; index < 5; index += 1) {
      harness.environment.notify();
      harness.tracker.requestSample();
    }
    expect(harness.environment.hasPendingSample).toBe(false);
    resumeInner();
    expect(harness.tracker.suspended).toBe(true);
    expect(harness.environment.hasPendingSample).toBe(false);
    resumeOuter();
    resumeOuter();
    expect(harness.tracker.suspended).toBe(false);
    expect(harness.environment.hasPendingSample).toBe(true);
    expect(harness.environment.scheduleCount).toBe(2);
    harness.environment.flush();
    expect(harness.resolveLocator).toHaveBeenCalledTimes(1);

    harness.tracker.requestSample();
    expect(harness.environment.hasPendingSample).toBe(true);
    harness.tracker.close();
    expect(harness.tracker.registrationCount).toBe(0);
    expect(harness.environment.hasPendingSample).toBe(false);
    expect(harness.environment.observationCleanupCount).toBe(1);
    expect(harness.environment.cancellationCount).toBe(2);
    harness.environment.notify();
    harness.environment.flush();
    expect(harness.resolveLocator).toHaveBeenCalledTimes(1);
    harness.close();
  });
});
