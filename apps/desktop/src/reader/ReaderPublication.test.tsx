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
  decodeReadingLocatorV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
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
import { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";

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
  }> = {},
): OpenedPublication {
  const locatedBlocks = Object.freeze([
    OPENING_LOCATED_BLOCK,
    CONTINUATION_LOCATED_BLOCK,
  ]);
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
        readonly spineItemIndex?: number;
      };
      const locatedBlock = locatedBlocks.find(
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
    close: vi.fn(() => Promise.resolve()),
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("reader navigation coordinator", () => {
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

    expect(
      screen.getByRole("button", { name: "Previous chapter" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next chapter" })).toBeEnabled();

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
    );
    expect(storageWrite).not.toHaveBeenCalled();
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
    );
  });

  it("keeps package targets out of DOM identifiers, links, and browser history", () => {
    const initialUrl = window.location.href;
    const { container } = render(
      <ReaderPublicationContent publication={createPublication()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continuation" }));

    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("[href]")).toBeNull();
    expect(container.querySelector("[id]")).toBeNull();
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
