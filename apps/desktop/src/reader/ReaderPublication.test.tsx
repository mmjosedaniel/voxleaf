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
import { createIndex } from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReaderPublicationContent } from "./ReaderPublication";
import { ReaderNavigationCoordinator } from "./reader-navigation";

const OPENING_DOCUMENT_ID = "document:opening" as ContentDocumentId;
const CONTINUATION_DOCUMENT_ID = "document:continuation" as ContentDocumentId;
const SUPPLEMENT_DOCUMENT_ID = "document:supplement" as ContentDocumentId;
const CONTINUATION_FRAGMENT = "private-continuation-fragment" as SourceFragment;

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

function createPublication(): OpenedPublication {
  const locatedBlocks = Object.freeze([
    OPENING_LOCATED_BLOCK,
    CONTINUATION_LOCATED_BLOCK,
  ]);
  return {
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
    documents: Object.freeze([
      SUPPLEMENT_DOCUMENT,
      OPENING_DOCUMENT,
      CONTINUATION_DOCUMENT,
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

afterEach(cleanup);

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
});
