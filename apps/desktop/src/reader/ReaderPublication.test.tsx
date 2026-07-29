import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  PublicationNavigationNode,
  SemanticBlock,
  SemanticDocument,
  SemanticDocumentTarget,
  SensitivePublicationText,
  SourceFragment,
} from "@voxleaf/epub";
import {
  createIndex,
  decodeLocatorRangeV1,
  decodeReadingLocatorV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { StrictMode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ActiveVisualLocatorEnvironment,
  VisualLocatorRect,
} from "./active-visual-locator";
import type { ReaderReflowEnvironment } from "./reader-reflow-restoration";
import { ReaderPublicationContent } from "./ReaderPublication";
import { ReaderNavigationCoordinator } from "./reader-navigation";
import type {
  ReaderNarrationSource,
  SegmentHighlightEnvironment,
  SegmentHighlightRect,
} from "./segment-highlight-controller";
import { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";
import type {
  ProductNarrationAudibleProgressObservation,
  ProductNarrationNavigationRequest,
  ProductNarrationSnapshot,
} from "../tts/product-narration-coordinator";
import { INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1 } from "../tts/operational-recovery";

const OPENING_DOCUMENT_ID = "document:opening" as ContentDocumentId;
const CONTINUATION_DOCUMENT_ID = "document:continuation" as ContentDocumentId;
const SUPPLEMENT_DOCUMENT_ID = "document:supplement" as ContentDocumentId;
const CONTINUATION_FRAGMENT = "private-continuation-fragment" as SourceFragment;

class ManualVisualLocatorEnvironment implements ActiveVisualLocatorEnvironment {
  readonly rects = new Map<string, VisualLocatorRect>();
  range: Range | undefined;
  scheduleCount = 0;
  #pending: (() => void) | undefined;
  #changeCallback: (() => void) | undefined;

  viewportRect(): VisualLocatorRect {
    return { top: 0, right: 240, bottom: 100, left: 0 };
  }

  blockRect(element: HTMLElement): VisualLocatorRect | undefined {
    return this.rects.get(element.textContent ?? "");
  }

  textDirection(): "ltr" {
    return "ltr";
  }

  rangeAtPoint(): Range | undefined {
    return this.range;
  }

  schedule(_root: HTMLElement, callback: () => void): () => void {
    this.scheduleCount += 1;
    this.#pending = callback;
    return () => {
      if (this.#pending === callback) {
        this.#pending = undefined;
      }
    };
  }

  observe(_root: HTMLElement, callback: () => void): () => void {
    this.#changeCallback = callback;
    return () => {
      if (this.#changeCallback === callback) {
        this.#changeCallback = undefined;
      }
    };
  }

  notify(): void {
    this.#changeCallback?.();
  }

  flush(): void {
    const callback = this.#pending;
    this.#pending = undefined;
    callback?.();
  }
}

class ManualReaderReflowEnvironment implements ReaderReflowEnvironment {
  #scheduled: Array<() => void> = [];

  viewportRect(): VisualLocatorRect {
    return { top: 0, right: 240, bottom: 100, left: 0 };
  }

  rangeRect(): VisualLocatorRect {
    return { top: 24, right: 120, bottom: 40, left: 10 };
  }

  elementRect(): VisualLocatorRect {
    return { top: 24, right: 120, bottom: 40, left: 10 };
  }

  scrollBy(): void {}

  schedule(_root: HTMLElement, callback: () => void): () => void {
    this.#scheduled.push(callback);
    return () => {
      const index = this.#scheduled.indexOf(callback);
      if (index >= 0) {
        this.#scheduled.splice(index, 1);
      }
    };
  }

  observeViewport(): () => void {
    return () => undefined;
  }

  flushAll(): void {
    while (this.#scheduled.length > 0) {
      this.#scheduled.shift()?.();
    }
  }
}

class ManualSegmentHighlightEnvironment implements SegmentHighlightEnvironment {
  highlighted: Range | undefined;
  range: SegmentHighlightRect | undefined = { top: 24, bottom: 40 };
  readonly scrolls: number[] = [];
  readonly scheduled: Array<() => void> = [];

  replaceHighlight(_name: string, range: Range): boolean {
    this.highlighted = range;
    return true;
  }

  clearHighlight(): void {
    this.highlighted = undefined;
  }

  viewportRect(): SegmentHighlightRect {
    return { top: 0, bottom: 100 };
  }

  rangeRect(): SegmentHighlightRect | undefined {
    return this.range;
  }

  scrollBy(_root: HTMLElement, top: number): void {
    this.scrolls.push(top);
  }

  schedule(_root: HTMLElement, callback: () => void): () => void {
    this.scheduled.push(callback);
    return () => {
      const index = this.scheduled.indexOf(callback);
      if (index >= 0) {
        this.scheduled.splice(index, 1);
      }
    };
  }

  flushAll(): void {
    while (this.scheduled.length > 0) {
      this.scheduled.shift()?.();
    }
  }
}

function narrationSnapshot(
  phase: "playing" | "preparing" | "stopped" | undefined,
): ProductNarrationSnapshot {
  return Object.freeze({
    availability: "available",
    profileId: "qwen3-tts-12hz-1-7b-customvoice-serena-cuda-bf16-v1",
    selection: Object.freeze({ kind: "quick" }),
    state:
      phase === undefined
        ? undefined
        : Object.freeze({
            mode: Object.freeze({ kind: "quick" }),
            phase,
            readyMs: phase === "playing" ? 15_000 : 0,
            targetMs: 15_000,
            progressValueMs: phase === "playing" ? 15_000 : 0,
            estimatedWaitMs: undefined,
            lowBuffer: false,
            allRemainingAudioReady: false,
            resourceCeilingReached: false,
            pauseContinuesPreparation: false,
            canPause: phase === "playing",
            canResume: false,
            canStop: phase === "playing" || phase === "preparing",
            volumePercent: 100,
            playbackRate: 1,
          }),
    failure: undefined,
    metrics: Object.freeze({
      commandToAudibleMs: undefined,
      bufferingMs: 0,
      intentionalWaitMs: 0,
      playbackMs: 0,
      underrunCount: 0,
      acceptedAudioUnitCount: 0,
      acceptedAudioSampleFrames: 0,
      retainedAudioUnitCount: 0,
      discardedAudioUnitCount: 0,
    }),
    serviceState:
      phase === "playing"
        ? "ready"
        : phase === "preparing"
          ? "loading"
          : "stopped",
    recovery: INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1,
    navigation: Object.freeze({
      playIntent:
        phase === "playing" || phase === "preparing" ? "playing" : "inactive",
      settling: phase === "preparing",
      canGoPrevious: false,
      canGoNext: false,
    }),
  });
}

class ManualReaderNarrationSource implements ReaderNarrationSource {
  readonly #listeners = new Set<() => void>();
  readonly #progressListeners = new Set<
    (observation: ProductNarrationAudibleProgressObservation) => void
  >();
  readonly #navigationListeners = new Set<
    (request: ProductNarrationNavigationRequest) => void
  >();
  #snapshot = narrationSnapshot(undefined);
  readonly startLocators: ReadingLocatorV1[] = [];

  get stateListenerCount(): number {
    return this.#listeners.size;
  }

  get progressListenerCount(): number {
    return this.#progressListeners.size;
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  observe(): ProductNarrationSnapshot {
    return this.#snapshot;
  }

  subscribeAudibleProgress(
    listener: (observation: ProductNarrationAudibleProgressObservation) => void,
  ): () => void {
    this.#progressListeners.add(listener);
    return () => this.#progressListeners.delete(listener);
  }

  subscribeNavigationRequests(
    listener: (request: ProductNarrationNavigationRequest) => void,
  ): () => void {
    this.#navigationListeners.add(listener);
    return () => this.#navigationListeners.delete(listener);
  }

  requestNavigation(request: ProductNarrationNavigationRequest): void {
    for (const listener of this.#navigationListeners) {
      listener(request);
    }
  }

  startAtLocator(locator: ReadingLocatorV1): boolean {
    this.startLocators.push(locator);
    this.#snapshot = narrationSnapshot("preparing");
    for (const listener of this.#listeners) {
      listener();
    }
    this.requestNavigation(Object.freeze({ event: "paragraph-leaf", locator }));
    return true;
  }

  start(
    sourceRange: ProductNarrationAudibleProgressObservation["sourceRange"],
    sequence: number,
  ): void {
    this.#snapshot = narrationSnapshot("playing");
    for (const listener of this.#listeners) {
      listener();
    }
    const observation = Object.freeze({
      kind: "segment-started" as const,
      observedAtMs: sequence * 250,
      sessionId: "session:reader-highlight",
      generationId: "generation:reader-highlight",
      segmentId: `segment:reader-highlight-${String(sequence)}`,
      sequence,
      sourceRange,
      playedSampleFrames: 0,
      sampleCountSamples: 24_000,
    });
    this.emit(observation);
  }

  emit(observation: ProductNarrationAudibleProgressObservation): void {
    for (const listener of this.#progressListeners) {
      listener(observation);
    }
  }

  stop(): void {
    this.#snapshot = narrationSnapshot("stopped");
    for (const listener of this.#listeners) {
      listener();
    }
  }
}

const OPENING_TARGET = Object.freeze({
  documentId: OPENING_DOCUMENT_ID,
});
const CONTINUATION_TARGET = Object.freeze({
  documentId: CONTINUATION_DOCUMENT_ID,
  fragment: CONTINUATION_FRAGMENT,
});
const SUPPLEMENT_TARGET = Object.freeze({
  documentId: SUPPLEMENT_DOCUMENT_ID,
});

function publicationText(value: string): SensitivePublicationText {
  return value as SensitivePublicationText;
}

function text(value: string) {
  return Object.freeze({
    kind: "text" as const,
    text: publicationText(value),
  });
}

const OPENING_HEADING = Object.freeze({
  kind: "heading",
  level: 1,
  children: Object.freeze([text("Opening")]),
}) satisfies SemanticBlock;
const OPENING_LINK_PARAGRAPH = Object.freeze({
  kind: "paragraph",
  children: Object.freeze([
    text("Move to "),
    Object.freeze({
      kind: "internal-link",
      target: CONTINUATION_TARGET,
      children: Object.freeze([text("Continue")]),
    }),
  ]),
}) satisfies SemanticBlock;
const CONTINUATION_HEADING = Object.freeze({
  kind: "heading",
  level: 1,
  children: Object.freeze([text("Continuation")]),
}) satisfies SemanticBlock;
const CONTINUATION_PARAGRAPH = Object.freeze({
  kind: "paragraph",
  children: Object.freeze([text("A synthetic quotation.")]),
}) satisfies SemanticBlock;

const OPENING_DOCUMENT = Object.freeze({
  id: OPENING_DOCUMENT_ID,
  location: Object.freeze({
    kind: "spine",
    spineItemId: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.id,
    spineItemIndex: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.index,
  }),
  blocks: Object.freeze([OPENING_HEADING, OPENING_LINK_PARAGRAPH]),
}) satisfies SemanticDocument;
const CONTINUATION_DOCUMENT = Object.freeze({
  id: CONTINUATION_DOCUMENT_ID,
  location: Object.freeze({
    kind: "spine",
    spineItemId: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[1]!.id,
    spineItemIndex: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[1]!.index,
  }),
  blocks: Object.freeze([CONTINUATION_HEADING, CONTINUATION_PARAGRAPH]),
}) satisfies SemanticDocument;
const SUPPLEMENT_DOCUMENT = Object.freeze({
  id: SUPPLEMENT_DOCUMENT_ID,
  location: Object.freeze({ kind: "non-spine" }),
  blocks: Object.freeze([]),
}) satisfies SemanticDocument;

const OPENING_LOCATED_BLOCK = Object.freeze({
  documentId: OPENING_DOCUMENT_ID,
  block: OPENING_HEADING,
  startLocator:
    VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator,
  textLengthCodePoints: createIndex(7),
}) satisfies PublicationLocatedBlock;
const OPENING_LINK_LOCATED_BLOCK = Object.freeze({
  documentId: OPENING_DOCUMENT_ID,
  block: OPENING_LINK_PARAGRAPH,
  startLocator:
    VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[1]!.locator,
  textLengthCodePoints: createIndex(16),
}) satisfies PublicationLocatedBlock;
const CONTINUATION_LOCATED_BLOCK = Object.freeze({
  documentId: CONTINUATION_DOCUMENT_ID,
  block: CONTINUATION_HEADING,
  startLocator:
    VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[1]!.blocks[0]!.locator,
  textLengthCodePoints: createIndex(12),
}) satisfies PublicationLocatedBlock;

const OPENING_NAVIGATION = Object.freeze({
  kind: "link",
  label: publicationText("Opening"),
  target: OPENING_TARGET,
  children: Object.freeze([]),
}) satisfies PublicationNavigationNode;
const CONTINUATION_NAVIGATION = Object.freeze({
  kind: "link",
  label: publicationText("Continuation"),
  target: CONTINUATION_TARGET,
  children: Object.freeze([]),
}) satisfies PublicationNavigationNode;
const SUPPLEMENT_NAVIGATION = Object.freeze({
  kind: "link",
  label: publicationText("Supplement"),
  target: SUPPLEMENT_TARGET,
  children: Object.freeze([]),
}) satisfies PublicationNavigationNode;
const NAVIGATION_CHILDREN: readonly [
  PublicationNavigationNode,
  ...PublicationNavigationNode[],
] = Object.freeze([
  OPENING_NAVIGATION,
  CONTINUATION_NAVIGATION,
  SUPPLEMENT_NAVIGATION,
]);
const NAVIGATION = Object.freeze([
  Object.freeze({
    kind: "group",
    label: publicationText("Part One"),
    children: NAVIGATION_CHILDREN,
  }),
]) satisfies readonly PublicationNavigationNode[];

function createPublication(
  options: Readonly<{
    continuationDocument?: SemanticDocument;
    includeOpeningLinkLocator?: boolean;
  }> = {},
): OpenedPublication {
  const locatedBlocks = Object.freeze(
    options.includeOpeningLinkLocator === true
      ? [
          OPENING_LOCATED_BLOCK,
          OPENING_LINK_LOCATED_BLOCK,
          CONTINUATION_LOCATED_BLOCK,
        ]
      : [OPENING_LOCATED_BLOCK, CONTINUATION_LOCATED_BLOCK],
  );
  return {
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
    documents: Object.freeze([
      SUPPLEMENT_DOCUMENT,
      OPENING_DOCUMENT,
      options.continuationDocument ?? CONTINUATION_DOCUMENT,
    ]),
    locators: locatedBlocks,
    navigation: NAVIGATION,
    resources: Object.freeze([]),
    closed: false,
    readResource: vi.fn(async () => new Uint8Array()),
    resolveLocator: vi.fn((input: unknown) => {
      const candidate = input as {
        readonly anchor?: { readonly anchorIndex?: number };
        readonly spineItemIndex?: number;
      };
      const locatedBlock =
        locatedBlocks.find(
          (block) =>
            block.startLocator.spineItemIndex === candidate.spineItemIndex &&
            block.startLocator.anchor.anchorIndex ===
              candidate.anchor?.anchorIndex,
        ) ??
        locatedBlocks.find(
          (block) =>
            block.startLocator.spineItemIndex === candidate.spineItemIndex,
        );
      if (locatedBlock === undefined) {
        throw new Error("Synthetic locator is unavailable.");
      }
      return Object.freeze({
        status: "exact",
        reason: "exact",
        locator: locatedBlock.startLocator,
        locatedBlock,
      });
    }),
    resolveTarget: vi.fn((input: unknown) => {
      if (input === OPENING_TARGET) {
        return Object.freeze({
          status: "exact",
          reason: "document-start",
          locator: OPENING_LOCATED_BLOCK.startLocator,
          locatedBlock: OPENING_LOCATED_BLOCK,
        });
      }
      if (input === CONTINUATION_TARGET) {
        return Object.freeze({
          status: "exact",
          reason: "fragment",
          locator: CONTINUATION_LOCATED_BLOCK.startLocator,
          locatedBlock: CONTINUATION_LOCATED_BLOCK,
        });
      }
      if (input === SUPPLEMENT_TARGET) {
        return Object.freeze({
          status: "unavailable",
          reason: "non-spine-document",
        });
      }
      const candidate = input as Partial<SemanticDocumentTarget>;
      if (candidate.documentId === CONTINUATION_DOCUMENT_ID) {
        return Object.freeze({
          status: "recovered",
          reason: "fragment-unresolved",
          locator: CONTINUATION_LOCATED_BLOCK.startLocator,
          locatedBlock: CONTINUATION_LOCATED_BLOCK,
        });
      }
      return Object.freeze({
        status: "unavailable",
        reason: "unknown-document",
      });
    }),
    prepareNarration: vi.fn<OpenedPublication["prepareNarration"]>(),
    close: vi.fn(() => Promise.resolve()),
  };
}

function entireLocatedBlockRange(
  locatedBlock: PublicationLocatedBlock,
): ProductNarrationAudibleProgressObservation["sourceRange"] {
  return decodeLocatorRangeV1({
    schemaVersion: 1,
    start: locatedBlock.startLocator,
    end: {
      ...locatedBlock.startLocator,
      textOffsetCodePoints: locatedBlock.textLengthCodePoints,
    },
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("reader navigation coordinator", () => {
  it("initializes directly from a package-resolved saved locator", () => {
    const publication = createPublication();
    const coordinator = new ReaderNavigationCoordinator(publication, {
      initialLocator: CONTINUATION_LOCATED_BLOCK.startLocator,
    });

    expect(coordinator.state.activeDocument).toBe(CONTINUATION_DOCUMENT);
    expect(coordinator.state.activeLocator).toEqual(
      CONTINUATION_LOCATED_BLOCK.startLocator,
    );
    expect(coordinator.state.destinationBlock).toBe(CONTINUATION_HEADING);
    expect(coordinator.state.navigationRevision).toBe(0);
    expect(coordinator.state.message).toBe("");
    expect(publication.resolveLocator).toHaveBeenCalledWith(
      CONTINUATION_LOCATED_BLOCK.startLocator,
    );
  });

  it("routes targets and chapter steps through canonical package locators", () => {
    const coordinator = new ReaderNavigationCoordinator(createPublication());

    expect(coordinator.state.activeLocator.spineItemIndex).toBe(0);
    expect(coordinator.state.canGoPrevious).toBe(false);
    expect(coordinator.state.canGoNext).toBe(true);
    expect(coordinator.targetAvailability(CONTINUATION_TARGET)).toEqual({
      status: "available",
    });

    coordinator.navigateToTarget(CONTINUATION_TARGET);
    expect(coordinator.state.activeLocator.spineItemIndex).toBe(1);
    expect(coordinator.state.destinationBlock).toBe(CONTINUATION_HEADING);
    expect(coordinator.state.canGoPrevious).toBe(true);
    expect(coordinator.state.canGoNext).toBe(false);
    expect(coordinator.state.message).toBe(
      "Moved to the requested reading location.",
    );

    coordinator.goPrevious();
    expect(coordinator.state.activeLocator.spineItemIndex).toBe(0);
  });

  it("keeps unavailable targets inert and recovers only within their document", () => {
    const coordinator = new ReaderNavigationCoordinator(createPublication());
    const missingFragmentTarget = Object.freeze({
      documentId: CONTINUATION_DOCUMENT_ID,
      fragment: "missing-synthetic-fragment" as SourceFragment,
    });

    coordinator.navigateToTarget(missingFragmentTarget);
    expect(coordinator.state.activeLocator.spineItemIndex).toBe(1);
    expect(coordinator.state.message).toBe(
      "The requested location was unavailable. Moved to the start of its reading section.",
    );

    const revision = coordinator.state.navigationRevision;
    expect(coordinator.targetAvailability(SUPPLEMENT_TARGET)).toEqual({
      status: "unavailable",
      explanation: "This destination is outside the readable spine.",
    });
    coordinator.navigateToTarget(SUPPLEMENT_TARGET);
    expect(coordinator.state.navigationRevision).toBe(revision);
    expect(coordinator.state.activeLocator.spineItemIndex).toBe(1);
  });

  it("emits one content-free reflow intent for each validated preference change", () => {
    const coordinator = new ReaderNavigationCoordinator(createPublication());
    const listener = vi.fn();
    coordinator.subscribe(listener);

    coordinator.setPreference("textScale", "large");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(coordinator.state.preferences).toEqual({
      schemaVersion: 1,
      textScale: "large",
      lineSpacing: "comfortable",
      contentWidth: "standard",
      theme: "system",
    });
    expect(coordinator.state.preferenceReflow).toEqual({
      kind: "reader-preference-reflow",
      revision: 1,
      preference: "textScale",
      locator: OPENING_LOCATED_BLOCK.startLocator,
      previous: {
        schemaVersion: 1,
        textScale: "standard",
        lineSpacing: "comfortable",
        contentWidth: "standard",
        theme: "system",
      },
      next: {
        schemaVersion: 1,
        textScale: "large",
        lineSpacing: "comfortable",
        contentWidth: "standard",
        theme: "system",
      },
    });
    expect(Object.isFrozen(coordinator.state.preferenceReflow)).toBe(true);

    coordinator.setPreference("textScale", "large");
    coordinator.setPreference("textScale", "calc(100vw)");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("updates only canonical visual locators within the active spine", () => {
    const coordinator = new ReaderNavigationCoordinator(createPublication());
    const listener = vi.fn();
    coordinator.subscribe(listener);
    const activeVisualLocator = decodeReadingLocatorV1({
      ...OPENING_LOCATED_BLOCK.startLocator,
      textOffsetCodePoints: 4,
    });

    expect(coordinator.updateActiveVisualLocator(activeVisualLocator)).toBe(
      true,
    );
    expect(coordinator.state.activeLocator).toBe(activeVisualLocator);
    expect(coordinator.state.destinationBlock).toBe(OPENING_HEADING);
    expect(coordinator.state.navigationRevision).toBe(0);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(coordinator.updateActiveVisualLocator(activeVisualLocator)).toBe(
      false,
    );
    expect(
      coordinator.updateActiveVisualLocator(
        CONTINUATION_LOCATED_BLOCK.startLocator,
      ),
    ).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("presents an oversized destination without replacing the last valid locator", () => {
    const oversizedParagraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([text("Synthetic oversized content")]),
    }) satisfies SemanticBlock;
    const oversizedContinuation = Object.freeze({
      ...CONTINUATION_DOCUMENT,
      blocks: Object.freeze([
        CONTINUATION_HEADING,
        ...Array.from({ length: 10_000 }, () => oversizedParagraph),
      ]),
    }) satisfies SemanticDocument;
    const coordinator = new ReaderNavigationCoordinator(
      createPublication({ continuationDocument: oversizedContinuation }),
    );
    const openingLocator = coordinator.state.activeLocator;

    coordinator.navigateToTarget(CONTINUATION_TARGET);

    expect(coordinator.state.contentStatus).toBe("chapter-too-large");
    expect(coordinator.state.presentedChapterIndex).toBe(1);
    expect(coordinator.state.activeLocator).toBe(openingLocator);
    expect(coordinator.state.activeDocument).toBe(OPENING_DOCUMENT);
    expect(coordinator.state.message).toBe(
      "This reading section is too large to display safely. Choose another section.",
    );
    expect(coordinator.state.canGoPrevious).toBe(true);
    expect(coordinator.state.canGoNext).toBe(false);

    coordinator.goPrevious();
    expect(coordinator.state.contentStatus).toBe("render");
    expect(coordinator.state.activeLocator).toBe(openingLocator);
  });
});

describe("navigable publication reader", () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;
  let originalScrollIntoView: typeof HTMLElement.prototype.scrollIntoView;

  beforeEach(() => {
    originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
  });

  afterEach(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: originalScrollIntoView,
    });
  });

  it("materializes and aligns an initial saved locator without moving focus", () => {
    const reflowEnvironment = new ManualReaderReflowEnvironment();
    const onInitialRestorationSettled = vi.fn();
    const onSettledLocatorChange = vi.fn();
    render(
      <>
        <button type="button">Focus owner</button>
        <ReaderPublicationContent
          publication={createPublication()}
          initialLocator={CONTINUATION_LOCATED_BLOCK.startLocator}
          restoreInitialLocator
          reflowEnvironment={reflowEnvironment}
          onInitialRestorationSettled={onInitialRestorationSettled}
          onSettledLocatorChange={onSettledLocatorChange}
        />
      </>,
    );
    const focusOwner = screen.getByRole("button", { name: "Focus owner" });
    focusOwner.focus();

    expect(
      screen.getByRole("heading", { name: "Continuation" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Text size")).toBeDisabled();

    act(() => reflowEnvironment.flushAll());

    expect(onInitialRestorationSettled).toHaveBeenCalledWith({
      status: "settled",
      locator: CONTINUATION_LOCATED_BLOCK.startLocator,
    });
    expect(onSettledLocatorChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Text size")).toBeEnabled();
    expect(focusOwner).toHaveFocus();
  });

  it("assigns continuous publication scrolling to exactly one focusable viewport", () => {
    const { container } = render(
      <ReaderPublicationContent publication={createPublication()} />,
    );

    const scrollOwners = container.querySelectorAll(
      '[data-reader-scroll-owner="true"]',
    );
    expect(scrollOwners).toHaveLength(1);
    const viewport = screen.getByRole("region", {
      name: "Publication reading viewport",
    });
    expect(viewport).toBe(scrollOwners[0]);
    expect(viewport).toHaveAttribute("tabindex", "-1");
    expect(viewport).toContainElement(
      screen.getByRole("article", { name: "Current reading section" }),
    );
    expect(container.querySelector(".reader-content")).not.toHaveAttribute(
      "data-reader-scroll-owner",
    );
  });

  it("preserves TOC order, explains unavailable entries, and navigates with one set of controls", () => {
    render(<ReaderPublicationContent publication={createPublication()} />);

    const toc = screen.getByRole("navigation", {
      name: "Table of contents",
    });
    expect(within(toc).getByText("Part One").tagName).toBe("SPAN");
    expect(
      within(toc).queryByRole("button", { name: "Part One" }),
    ).not.toBeInTheDocument();
    const tocText = toc.textContent ?? "";
    expect(tocText.indexOf("Opening")).toBeLessThan(
      tocText.indexOf("Continuation"),
    );
    expect(tocText.indexOf("Continuation")).toBeLessThan(
      tocText.indexOf("Supplement"),
    );
    expect(within(toc).getByText("Supplement").parentElement).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(toc).toHaveTextContent(
      "Supplement — This destination is outside the readable spine.",
    );

    const previousChapter = screen.getByRole("button", {
      name: "Previous chapter",
    });
    const nextChapter = screen.getByRole("button", {
      name: "Next chapter",
    });
    expect(previousChapter).toBeDisabled();
    expect(nextChapter).toBeEnabled();
    expect(previousChapter).toHaveAttribute(
      "data-reader-action",
      "previous-chapter",
    );
    expect(nextChapter).toHaveAttribute("data-reader-action", "next-chapter");

    fireEvent.click(within(toc).getByRole("button", { name: "Continuation" }));

    const continuationHeading = screen.getByRole("heading", {
      level: 1,
      name: "Continuation",
    });
    expect(continuationHeading).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(screen.getByText("A synthetic quotation.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous chapter" }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next chapter" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Previous chapter" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Opening" }),
    ).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Continuation" }),
    ).toHaveFocus();
  });

  it("waits for narration invalidation before chapter placement and reports the settled reason", async () => {
    let releaseInvalidation: (() => void) | undefined;
    const onNavigationIntent = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          releaseInvalidation = resolve;
        }),
    );
    const onSettledLocatorChange = vi.fn();
    render(
      <ReaderPublicationContent
        publication={createPublication()}
        onNavigationIntent={onNavigationIntent}
        onSettledLocatorChange={onSettledLocatorChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next chapter" }));

    expect(onNavigationIntent).toHaveBeenCalledWith("chapter-navigation");
    expect(
      screen.getByRole("heading", { level: 1, name: "Opening" }),
    ).toBeInTheDocument();
    expect(onSettledLocatorChange).not.toHaveBeenCalled();

    await act(async () => {
      releaseInvalidation?.();
      await Promise.resolve();
    });

    expect(
      screen.getByRole("heading", { level: 1, name: "Continuation" }),
    ).toHaveFocus();
    expect(onSettledLocatorChange).toHaveBeenCalledWith(
      CONTINUATION_LOCATED_BLOCK.startLocator,
      "chapter-navigation",
    );
  });

  it("routes narration-boundary requests through the same focus-safe reader placement", () => {
    const narrationSource = new ManualReaderNarrationSource();
    const onNavigationIntent = vi.fn();
    const onSettledLocatorChange = vi.fn();
    render(
      <ReaderPublicationContent
        publication={createPublication()}
        narrationSource={narrationSource}
        onNavigationIntent={onNavigationIntent}
        onSettledLocatorChange={onSettledLocatorChange}
      />,
    );

    act(() => {
      narrationSource.requestNavigation(
        Object.freeze({
          event: "next-segment",
          locator: CONTINUATION_LOCATED_BLOCK.startLocator,
        }),
      );
    });

    expect(onNavigationIntent).toHaveBeenCalledWith("narration-boundary");
    expect(
      screen.getByRole("heading", { level: 1, name: "Continuation" }),
    ).toHaveFocus();
    expect(onSettledLocatorChange).toHaveBeenCalledWith(
      CONTINUATION_LOCATED_BLOCK.startLocator,
      "narration-boundary",
    );
  });

  it("settles an invalidated narration request even when its target is unavailable", () => {
    const narrationSource = new ManualReaderNarrationSource();
    const onNavigationIntent = vi.fn();
    const onSettledLocatorChange = vi.fn();
    const unavailableLocator = decodeReadingLocatorV1({
      ...OPENING_LOCATED_BLOCK.startLocator,
      spineItemId: "spine:missing",
      spineItemIndex: 99,
    });
    render(
      <ReaderPublicationContent
        publication={createPublication()}
        narrationSource={narrationSource}
        onNavigationIntent={onNavigationIntent}
        onSettledLocatorChange={onSettledLocatorChange}
      />,
    );

    act(() => {
      narrationSource.requestNavigation(
        Object.freeze({
          event: "next-segment",
          locator: unavailableLocator,
        }),
      );
    });

    expect(onNavigationIntent).toHaveBeenCalledWith("narration-boundary");
    expect(onSettledLocatorChange).toHaveBeenCalledWith(
      OPENING_LOCATED_BLOCK.startLocator,
      "narration-boundary",
    );
    expect(
      screen.getByText("Navigation could not be completed."),
    ).toBeVisible();
  });

  it("provides content-free keyboard skip and return links without changing browser history", () => {
    const initialUrl = window.location.href;
    render(<ReaderPublicationContent publication={createPublication()} />);

    fireEvent.click(
      screen.getByRole("link", { name: "Skip to reader content" }),
    );
    expect(
      screen.getByRole("article", { name: "Current reading section" }),
    ).toHaveFocus();
    expect(window.location.href).toBe(initialUrl);

    fireEvent.click(
      screen.getByRole("link", { name: "Back to table of contents" }),
    );
    expect(
      screen.getByRole("navigation", { name: "Table of contents" }),
    ).toHaveFocus();
    expect(window.location.href).toBe(initialUrl);
  });

  it("replaces and cleans active-document DOM locator registrations", () => {
    const mapper = new SemanticDomRangeMapper();
    const rendered = render(
      <ReaderPublicationContent
        publication={createPublication()}
        domRangeMapper={mapper}
      />,
    );

    expect(mapper.registrationCount).toBe(1);
    expect(mapper.rangeFor(OPENING_LOCATED_BLOCK, 7)).toBeDefined();
    expect(mapper.rangeFor(CONTINUATION_LOCATED_BLOCK, 0)).toBeUndefined();

    fireEvent.click(screen.getByRole("button", { name: "Continuation" }));

    expect(mapper.registrationCount).toBe(1);
    expect(mapper.rangeFor(OPENING_LOCATED_BLOCK, 0)).toBeUndefined();
    expect(mapper.rangeFor(CONTINUATION_LOCATED_BLOCK, 12)).toBeDefined();

    rendered.unmount();
    expect(mapper.registrationCount).toBe(0);
  });

  it("projects audible segments across chapters without stealing focus or invoking user navigation", () => {
    const initialUrl = window.location.href;
    const narrationSource = new ManualReaderNarrationSource();
    const highlightEnvironment = new ManualSegmentHighlightEnvironment();
    render(
      <ReaderPublicationContent
        publication={createPublication()}
        narrationSource={narrationSource}
        segmentHighlightEnvironment={highlightEnvironment}
      />,
    );
    const focusOwner = screen.getByLabelText("Theme");
    focusOwner.focus();

    act(() => {
      narrationSource.start(entireLocatedBlockRange(OPENING_LOCATED_BLOCK), 0);
    });

    expect(highlightEnvironment.highlighted?.toString()).toBe("Opening");
    expect(focusOwner).toHaveFocus();
    expect(scrollIntoView).not.toHaveBeenCalled();

    act(() => {
      narrationSource.start(
        entireLocatedBlockRange(CONTINUATION_LOCATED_BLOCK),
        1,
      );
    });

    expect(
      screen.getByRole("heading", { level: 1, name: "Continuation" }),
    ).toBeInTheDocument();
    expect(highlightEnvironment.highlighted?.toString()).toBe("Continuation");
    expect(focusOwner).toHaveFocus();
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(window.location.href).toBe(initialUrl);

    act(() => narrationSource.stop());
    expect(highlightEnvironment.highlighted).toBeUndefined();
  });

  it("publishes passive canonical positions without focus or storage side effects", () => {
    const mapper = new SemanticDomRangeMapper();
    const environment = new ManualVisualLocatorEnvironment();
    const activeLocators: ReadingLocatorV1[] = [];
    const onActiveLocatorChange = vi.fn((locator: ReadingLocatorV1): void => {
      activeLocators.push(locator);
    });
    const onSettledLocatorChange = vi.fn();
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    const publication = createPublication();
    publication.resolveLocator = vi.fn((input: unknown) => {
      const locator = decodeReadingLocatorV1(input);
      const locatedBlock =
        locator.spineItemIndex ===
        CONTINUATION_LOCATED_BLOCK.startLocator.spineItemIndex
          ? CONTINUATION_LOCATED_BLOCK
          : OPENING_LOCATED_BLOCK;
      return Object.freeze({
        status: "exact",
        reason: "exact",
        locator,
        locatedBlock,
      });
    });
    environment.rects.set("Opening", {
      top: 10,
      right: 210,
      bottom: 50,
      left: 10,
    });
    environment.rects.set("Move to Continue", {
      top: 60,
      right: 210,
      bottom: 90,
      left: 10,
    });

    render(
      <ReaderPublicationContent
        publication={publication}
        domRangeMapper={mapper}
        visualLocatorEnvironment={environment}
        onActiveLocatorChange={onActiveLocatorChange}
        onSettledLocatorChange={onSettledLocatorChange}
      />,
    );
    const continuationControl = screen.getByRole("button", {
      name: "Continuation",
    });
    continuationControl.focus();
    environment.range = mapper.rangeFor(OPENING_LOCATED_BLOCK, 4);
    act(() => environment.flush());

    expect(onActiveLocatorChange).toHaveBeenCalledTimes(1);
    expect(activeLocators[0]?.textOffsetCodePoints).toBe(4);
    expect(continuationControl).toHaveFocus();
    expect(storageWrite).not.toHaveBeenCalled();

    act(() => {
      environment.notify();
      environment.notify();
      environment.notify();
    });
    expect(environment.scheduleCount).toBe(2);
    act(() => environment.flush());
    expect(onActiveLocatorChange).toHaveBeenCalledTimes(1);

    scrollIntoView.mockImplementation(() => environment.notify());
    fireEvent.click(continuationControl);
    expect(
      screen.getByRole("heading", { level: 1, name: "Continuation" }),
    ).toHaveFocus();
    expect(environment.scheduleCount).toBe(3);
    expect(onSettledLocatorChange).toHaveBeenCalledTimes(1);
    expect(onSettledLocatorChange).toHaveBeenCalledWith(
      CONTINUATION_LOCATED_BLOCK.startLocator,
      "chapter-navigation",
    );
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("reports the actual viewport during narration without input classification", () => {
    const mapper = new SemanticDomRangeMapper();
    const environment = new ManualVisualLocatorEnvironment();
    const narrationSource = new ManualReaderNarrationSource();
    const onActiveLocatorChange = vi.fn();
    const publication = createPublication();
    publication.resolveLocator = vi.fn((input: unknown) => {
      const locator = decodeReadingLocatorV1(input);
      return Object.freeze({
        status: "exact",
        reason: "exact",
        locator,
        locatedBlock: OPENING_LOCATED_BLOCK,
      });
    });
    const { container } = render(
      <ReaderPublicationContent
        publication={publication}
        domRangeMapper={mapper}
        visualLocatorEnvironment={environment}
        narrationSource={narrationSource}
        segmentHighlightEnvironment={new ManualSegmentHighlightEnvironment()}
        onActiveLocatorChange={onActiveLocatorChange}
      />,
    );
    environment.rects.set("Opening", {
      top: 10,
      right: 210,
      bottom: 50,
      left: 10,
    });
    act(() => {
      environment.flush();
      narrationSource.start(entireLocatedBlockRange(OPENING_LOCATED_BLOCK), 0);
    });
    environment.range = mapper.rangeFor(OPENING_LOCATED_BLOCK, 4);

    act(() => {
      environment.notify();
      environment.flush();
    });
    expect(onActiveLocatorChange).toHaveBeenCalledOnce();
    expect(onActiveLocatorChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ textOffsetCodePoints: 4 }),
    );

    fireEvent.keyDown(container.querySelector(".reader-content")!, {
      key: "PageDown",
    });
    environment.range = mapper.rangeFor(OPENING_LOCATED_BLOCK, 6);
    act(() => {
      environment.notify();
      environment.flush();
    });
    expect(onActiveLocatorChange).toHaveBeenCalledTimes(2);
    expect(onActiveLocatorChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ textOffsetCodePoints: 6 }),
    );
  });

  it("publishes the canonical locator only after preference reflow settles", () => {
    const reflowEnvironment = new ManualReaderReflowEnvironment();
    const onSettledLocatorChange = vi.fn();

    render(
      <ReaderPublicationContent
        publication={createPublication()}
        reflowEnvironment={reflowEnvironment}
        onSettledLocatorChange={onSettledLocatorChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Text size"), {
      target: { value: "large" },
    });
    expect(onSettledLocatorChange).not.toHaveBeenCalled();

    act(() => reflowEnvironment.flushAll());

    expect(onSettledLocatorChange).toHaveBeenCalledTimes(1);
    expect(onSettledLocatorChange).toHaveBeenCalledWith(
      OPENING_LOCATED_BLOCK.startLocator,
      "reflow",
    );
  });

  it("keeps package targets out of application-owned skip identifiers and browser history", () => {
    const initialUrl = window.location.href;
    const { container } = render(
      <ReaderPublicationContent publication={createPublication()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continuation" }));

    expect(
      Array.from(container.querySelectorAll("a")).map((link) =>
        link.textContent?.trim(),
      ),
    ).toEqual(["Skip to reader content", "Back to table of contents"]);
    expect(
      Array.from(container.querySelectorAll("a")).every((link) =>
        link.getAttribute("href")?.startsWith("#"),
      ),
    ).toBe(true);
    expect(
      Array.from(container.querySelectorAll("[id]")).every(
        (element) => element.id !== CONTINUATION_FRAGMENT,
      ),
    ).toBe(true);
    expect(container.innerHTML).not.toContain(CONTINUATION_FRAGMENT);
    expect(window.location.href).toBe(initialUrl);
  });

  it("exposes only approved appearance controls and applies closed layout tokens without persistence", () => {
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    const { container } = render(
      <ReaderPublicationContent publication={createPublication()} />,
    );
    const reader = container.querySelector(".semantic-reader");

    expect(
      screen.getByRole("group", { name: "Reader appearance" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Text size")).toHaveValue("standard");
    expect(screen.getByLabelText("Line spacing")).toHaveValue("comfortable");
    expect(screen.getByLabelText("Content width")).toHaveValue("standard");
    expect(screen.getByLabelText("Theme")).toHaveValue("system");
    expect(reader).toHaveAttribute("data-reader-mode", "continuous");
    expect(reader).toHaveAttribute("data-reader-text-scale", "standard");
    expect(reader).toHaveAttribute("data-reader-line-spacing", "comfortable");
    expect(reader).toHaveAttribute("data-reader-content-width", "standard");
    expect(reader).toHaveAttribute("data-reader-theme", "system");

    fireEvent.change(screen.getByLabelText("Text size"), {
      target: { value: "extra-large" },
    });
    fireEvent.change(screen.getByLabelText("Line spacing"), {
      target: { value: "spacious" },
    });
    fireEvent.change(screen.getByLabelText("Content width"), {
      target: { value: "wide" },
    });
    fireEvent.change(screen.getByLabelText("Theme"), {
      target: { value: "dark" },
    });

    expect(reader).toHaveAttribute("data-reader-text-scale", "extra-large");
    expect(reader).toHaveAttribute("data-reader-line-spacing", "spacious");
    expect(reader).toHaveAttribute("data-reader-content-width", "wide");
    expect(reader).toHaveAttribute("data-reader-theme", "dark");
    expect(reader).not.toHaveAttribute("style");
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("uses one explicit canonical leaf action while ordinary publication clicks remain inert", () => {
    const narrationSource = new ManualReaderNarrationSource();
    const { container, unmount } = render(
      <ReaderPublicationContent
        publication={createPublication()}
        narrationSource={narrationSource}
      />,
    );

    const preview = screen.getByRole("button", {
      name: "Start narration at this paragraph",
    });
    expect(container.querySelectorAll(".paragraph-leaf")).toHaveLength(1);
    fireEvent.click(screen.getByRole("heading", { name: "Opening" }));
    expect(narrationSource.startLocators).toEqual([]);

    preview.focus();
    fireEvent.click(preview);

    expect(narrationSource.startLocators).toEqual([
      OPENING_LOCATED_BLOCK.startLocator,
    ]);
    expect(
      screen.getByRole("button", {
        name: "Preparing narration at this paragraph",
      }),
    ).toHaveTextContent("Preparing");
    expect(container.querySelectorAll(".paragraph-leaf")).toHaveLength(1);

    act(() => {
      narrationSource.start(entireLocatedBlockRange(OPENING_LOCATED_BLOCK), 0);
    });
    const audible = screen.getByRole("button", {
      name: "Narrating this paragraph",
    });
    expect(audible).toHaveAttribute("aria-current", "true");
    expect(audible).toHaveTextContent("Current");

    act(() => {
      narrationSource.emit(
        Object.freeze({
          kind: "segment-completed",
          observedAtMs: 500,
          sessionId: "session:reader-highlight",
          generationId: "generation:reader-highlight",
          segmentId: "segment:stale",
          sequence: 1,
          sourceRange: entireLocatedBlockRange(CONTINUATION_LOCATED_BLOCK),
          playedSampleFrames: 24_000,
          sampleCountSamples: 24_000,
        }),
      );
    });
    expect(
      screen.getByRole("button", { name: "Narrating this paragraph" }),
    ).toHaveAttribute("aria-current", "true");

    act(() => narrationSource.stop());
    const checkpoint = screen.getByRole("button", {
      name: "Resume narration at saved checkpoint",
    });
    expect(checkpoint).not.toHaveAttribute("aria-current");
    expect(checkpoint).toHaveTextContent("Saved");
    expect(container.querySelectorAll(".paragraph-leaf")).toHaveLength(1);

    expect(narrationSource.stateListenerCount).toBe(2);
    expect(narrationSource.progressListenerCount).toBe(2);
    unmount();
    expect(narrationSource.stateListenerCount).toBe(0);
    expect(narrationSource.progressListenerCount).toBe(0);
  });

  it("retargets the selectable leaf to the visible paragraph without restarting active narration", () => {
    const mapper = new SemanticDomRangeMapper();
    const environment = new ManualVisualLocatorEnvironment();
    const narrationSource = new ManualReaderNarrationSource();
    render(
      <ReaderPublicationContent
        publication={createPublication({ includeOpeningLinkLocator: true })}
        domRangeMapper={mapper}
        visualLocatorEnvironment={environment}
        narrationSource={narrationSource}
        segmentHighlightEnvironment={new ManualSegmentHighlightEnvironment()}
      />,
    );
    environment.rects.set("Opening", {
      top: 10,
      right: 210,
      bottom: 40,
      left: 10,
    });
    environment.rects.set("Move to Continue", {
      top: 60,
      right: 210,
      bottom: 90,
      left: 10,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Start narration at this paragraph",
      }),
    );
    act(() => {
      narrationSource.start(entireLocatedBlockRange(OPENING_LOCATED_BLOCK), 0);
    });
    expect(narrationSource.startLocators).toEqual([
      OPENING_LOCATED_BLOCK.startLocator,
    ]);

    environment.rects.set("Opening", {
      top: -60,
      right: 210,
      bottom: -30,
      left: 10,
    });
    environment.rects.set("Move to Continue", {
      top: 10,
      right: 210,
      bottom: 50,
      left: 10,
    });
    environment.range = mapper.rangeFor(OPENING_LINK_LOCATED_BLOCK, 4);
    act(() => {
      environment.notify();
      environment.flush();
    });

    expect(narrationSource.startLocators).toHaveLength(1);
    const retargetedLeaf = screen.getByRole("button", {
      name: "Start narration at this paragraph",
    });
    fireEvent.click(retargetedLeaf);

    expect(narrationSource.startLocators).toEqual([
      OPENING_LOCATED_BLOCK.startLocator,
      OPENING_LINK_LOCATED_BLOCK.startLocator,
    ]);
  });

  it("previews a hovered paragraph leaf without treating pointer movement as narration", () => {
    const narrationSource = new ManualReaderNarrationSource();
    const { container } = render(
      <ReaderPublicationContent
        publication={createPublication({ includeOpeningLinkLocator: true })}
        narrationSource={narrationSource}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Start narration at this paragraph",
      }),
    );
    act(() => {
      narrationSource.start(entireLocatedBlockRange(OPENING_LOCATED_BLOCK), 0);
    });
    const paragraph = container.querySelector(".semantic-document p");
    const readerContent = container.querySelector(".reader-content");
    if (paragraph === null || readerContent === null) {
      throw new Error("expected the synthetic reader paragraph");
    }

    fireEvent.pointerOver(paragraph);

    expect(narrationSource.startLocators).toEqual([
      OPENING_LOCATED_BLOCK.startLocator,
    ]);
    expect(
      screen.getByRole("button", {
        name: "Start narration at this paragraph",
      }),
    ).toHaveAttribute("data-leaf-state", "preview");

    fireEvent.pointerLeave(readerContent);
    expect(
      screen.getByRole("button", {
        name: "Narrating this paragraph",
      }),
    ).toHaveAttribute("aria-current", "true");

    fireEvent.pointerOver(paragraph);
    const previewLeaf = screen.getByRole("button", {
      name: "Start narration at this paragraph",
    });
    fireEvent.pointerOver(readerContent);
    expect(previewLeaf).toHaveAttribute("data-leaf-state", "preview");
    fireEvent.pointerOver(previewLeaf);
    expect(previewLeaf).toHaveAttribute("data-leaf-state", "preview");
    fireEvent.click(previewLeaf);
    expect(narrationSource.startLocators).toEqual([
      OPENING_LOCATED_BLOCK.startLocator,
      OPENING_LINK_LOCATED_BLOCK.startLocator,
    ]);
  });

  it("projects a restored stable locator as the bounded stopped checkpoint", () => {
    render(
      <ReaderPublicationContent
        publication={createPublication()}
        initialLocator={CONTINUATION_LOCATED_BLOCK.startLocator}
        narrationSource={new ManualReaderNarrationSource()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Resume narration at saved checkpoint",
      }),
    ).toHaveAttribute("data-leaf-state", "checkpoint");
  });

  it.each(["keyboard", "pointer", "touch"] as const)(
    "offers the same canonical leaf action to %s input",
    (input) => {
      const narrationSource = new ManualReaderNarrationSource();
      render(
        <ReaderPublicationContent
          publication={createPublication()}
          narrationSource={narrationSource}
        />,
      );
      const leaf = screen.getByRole("button", {
        name: "Start narration at this paragraph",
      });

      if (input === "keyboard") {
        leaf.focus();
        fireEvent.keyDown(leaf, { key: "Enter" });
      } else if (input === "pointer") {
        fireEvent.pointerDown(leaf);
      } else {
        fireEvent.touchStart(leaf);
      }
      fireEvent.click(leaf);

      expect(narrationSource.startLocators).toEqual([
        OPENING_LOCATED_BLOCK.startLocator,
      ]);
    },
  );

  it("keeps the bounded leaf available through the StrictMode mount probe", () => {
    render(
      <StrictMode>
        <ReaderPublicationContent
          publication={createPublication()}
          narrationSource={new ManualReaderNarrationSource()}
        />
      </StrictMode>,
    );

    expect(
      screen.getByRole("button", {
        name: "Start narration at this paragraph",
      }),
    ).toBeInTheDocument();
  });

  it("shows a focusable fixed fallback for an oversized chapter and keeps recovery navigation available", () => {
    const oversizedParagraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([text("Synthetic oversized content")]),
    }) satisfies SemanticBlock;
    const oversizedContinuation = Object.freeze({
      ...CONTINUATION_DOCUMENT,
      blocks: Object.freeze([
        CONTINUATION_HEADING,
        ...Array.from({ length: 10_000 }, () => oversizedParagraph),
      ]),
    }) satisfies SemanticDocument;
    render(
      <ReaderPublicationContent
        publication={createPublication({
          continuationDocument: oversizedContinuation,
        })}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Continuation",
      }),
    );

    const fallback = screen.getByRole("article", {
      name: "Current reading section",
    });
    expect(fallback).toHaveFocus();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Reading section unavailable",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Synthetic oversized content"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous chapter" }),
    ).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Previous chapter" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Opening" }),
    ).toHaveFocus();
  });
});
