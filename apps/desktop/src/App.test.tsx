import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  SemanticBlock,
  SemanticDocument,
  SensitivePublicationText,
} from "@voxleaf/epub";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import type {
  LocalPublicationCloseResult,
  LocalPublicationOpenFailureReason,
  LocalPublicationOpenFlow,
  LocalPublicationOpenResult,
} from "./publication/local-publication-open";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const TEST_DOCUMENT_ID = "document:test" as ContentDocumentId;
const TEST_TEXT = "Visible semantic passage" as SensitivePublicationText;
const TEST_BLOCK: SemanticBlock = Object.freeze({
  kind: "paragraph",
  children: Object.freeze([
    Object.freeze({
      kind: "text",
      text: TEST_TEXT,
    }),
  ]),
});
const TEST_DOCUMENT: SemanticDocument = Object.freeze({
  id: TEST_DOCUMENT_ID,
  location: Object.freeze({
    kind: "spine",
    spineItemId: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.id,
    spineItemIndex: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.index,
  }),
  blocks: Object.freeze([TEST_BLOCK]),
});
const TEST_LOCATED_BLOCK: PublicationLocatedBlock = Object.freeze({
  documentId: TEST_DOCUMENT_ID,
  block: TEST_BLOCK,
  startLocator:
    VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator,
  textLengthCodePoints: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.index,
});

function createTestPublication(
  title = "Synthetic Reader Book",
  authors: readonly string[] = ["Test Author"],
  options: { readonly empty?: boolean } = {},
): OpenedPublication {
  const empty = options.empty ?? false;
  return {
    book: Object.freeze({
      ...VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
      metadata: Object.freeze({
        title,
        authors: Object.freeze([...authors]),
      }),
    }),
    documents: empty ? Object.freeze([]) : Object.freeze([TEST_DOCUMENT]),
    locators: empty ? Object.freeze([]) : Object.freeze([TEST_LOCATED_BLOCK]),
    navigation: Object.freeze([]),
    resources: Object.freeze([]),
    closed: false,
    readResource: vi.fn(),
    resolveLocator: vi.fn(),
    resolveTarget: vi.fn(),
    close: vi.fn(() => Promise.resolve()),
  };
}

function createTestFlow(
  open: LocalPublicationOpenFlow["open"],
  close: LocalPublicationOpenFlow["close"] = () =>
    Promise.resolve({ status: "closed" }),
): LocalPublicationOpenFlow {
  return {
    publication: undefined,
    open: vi.fn(open),
    close: vi.fn(close),
  };
}

function selectEpub(name = "private.epub"): void {
  fireEvent.change(screen.getByLabelText("Open a local EPUB"), {
    target: { files: [new File(["book"], name)] },
  });
}

describe("desktop reader lifecycle surface", () => {
  it("renders an accessible capability-free idle state", () => {
    const flow = createTestFlow(() => Promise.resolve({ status: "cancelled" }));
    render(<App openFlow={flow} />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "VoxLeaf" }),
    ).toBeInTheDocument();
    const input = screen.getByLabelText("Open a local EPUB");
    expect(input).toHaveAttribute("accept", ".epub,application/epub+zip");
    expect(input).toHaveAccessibleDescription("No local EPUB is open.");
    expect(screen.getByRole("status")).toHaveTextContent(
      "No local EPUB is open.",
    );
  });

  it("shows validated ready metadata without displaying the private filename", async () => {
    const publication = createTestPublication("Repository-authored title", [
      "First Author",
      "Second Author",
    ]);
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    render(<App openFlow={flow} />);

    selectEpub("private-title.epub");

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "The EPUB opened successfully.",
      ),
    );
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Repository-authored title",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("By First Author, Second Author"),
    ).toBeInTheDocument();
    expect(screen.getByText(TEST_TEXT)).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Current reading section" }),
    ).toBeInTheDocument();
    expect(publication.readResource).not.toHaveBeenCalled();
    expect(publication.resolveTarget).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Close EPUB" })).toBeEnabled();
    expect(document.body).not.toHaveTextContent("private-title.epub");
    expect(screen.getByLabelText("Open a local EPUB")).toHaveValue("");
  });

  it("shows a labelled busy state while validation is pending", async () => {
    let resolveOpen: ((result: LocalPublicationOpenResult) => void) | undefined;
    const flow = createTestFlow(
      () =>
        new Promise((resolve) => {
          resolveOpen = resolve;
        }),
    );
    render(<App openFlow={flow} />);

    selectEpub();

    expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Validating and opening the selected EPUB.",
    );
    expect(screen.getByLabelText("Open a local EPUB")).toBeEnabled();

    await act(async () => {
      resolveOpen?.({ status: "cancelled" });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "No local EPUB is open.",
    );
  });

  it.each<{
    expectedMessage: string;
    reason: LocalPublicationOpenFailureReason;
  }>([
    {
      reason: "file-too-large",
      expectedMessage: "That file is larger than the 100 MiB EPUB limit.",
    },
    {
      reason: "file-read-failed",
      expectedMessage: "VoxLeaf could not read that local file.",
    },
    {
      reason: "invalid-epub",
      expectedMessage: "That file is not a valid supported EPUB.",
    },
    {
      reason: "unsupported-epub",
      expectedMessage: "That EPUB uses features VoxLeaf does not support yet.",
    },
    {
      reason: "resource-exhausted",
      expectedMessage: "That EPUB exceeds VoxLeaf's safe processing limits.",
    },
    {
      reason: "internal-failure",
      expectedMessage:
        "VoxLeaf could not open that EPUB because of an internal failure.",
    },
  ])("renders the fixed $reason state", async ({ expectedMessage, reason }) => {
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "rejected", reason }),
    );
    render(<App openFlow={flow} />);

    selectEpub();

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(expectedMessage),
    );
    expect(document.body).not.toHaveTextContent("private.epub");
    expect(screen.getByLabelText("Open a local EPUB")).toBeEnabled();
  });

  it("provides a recoverable empty-content state", async () => {
    const publication = createTestPublication("Private empty title", [], {
      empty: true,
    });
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    render(<App openFlow={flow} />);

    selectEpub();

    expect(
      await screen.findByRole("heading", { name: "No readable content" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "This EPUB has no supported readable content.",
    );
    expect(document.body).not.toHaveTextContent("Private empty title");
    expect(screen.getByLabelText("Open a local EPUB")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Close EPUB" })).toBeEnabled();
  });

  it("hides publication data while closing and can reopen afterward", async () => {
    let finishClose:
      ((result: LocalPublicationCloseResult) => void) | undefined;
    const first = createTestPublication("First private title");
    const second = createTestPublication("Second safe title");
    const open = vi
      .fn<LocalPublicationOpenFlow["open"]>()
      .mockResolvedValueOnce({ status: "ready", publication: first })
      .mockResolvedValueOnce({ status: "ready", publication: second });
    const close = vi
      .fn<LocalPublicationOpenFlow["close"]>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishClose = resolve;
          }),
      )
      .mockResolvedValue({ status: "closed" });
    const flow = createTestFlow(open, close);
    render(<App openFlow={flow} />);
    selectEpub("first.epub");
    await screen.findByRole("heading", { name: "First private title" });
    fireEvent.change(screen.getByLabelText("Text size"), {
      target: { value: "large" },
    });
    expect(screen.getByLabelText("Text size")).toHaveValue("large");

    fireEvent.click(screen.getByRole("button", { name: "Close EPUB" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Closing the current EPUB.",
    );
    expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.queryByText("First private title")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Open a local EPUB")).toBeDisabled();

    await act(async () => {
      finishClose?.({ status: "closed" });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "No local EPUB is open.",
    );

    selectEpub("second.epub");
    expect(
      await screen.findByRole("heading", { name: "Second safe title" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Text size")).toHaveValue("large");
  });

  it("shows a fixed terminal state when publication cleanup fails", async () => {
    const publication = createTestPublication();
    const flow = createTestFlow(
      () => Promise.resolve({ status: "ready", publication }),
      () => Promise.resolve({ status: "rejected", reason: "internal-failure" }),
    );
    render(<App openFlow={flow} />);
    selectEpub();
    await screen.findByRole("button", { name: "Close EPUB" });

    fireEvent.click(screen.getByRole("button", { name: "Close EPUB" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "VoxLeaf could not finish closing the EPUB.",
      ),
    );
    expect(screen.getByLabelText("Open a local EPUB")).toBeDisabled();
    expect(document.body).not.toHaveTextContent("Synthetic Reader Book");
  });

  it("contains renderer failures, clears publication data, and starts cleanup", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const publication = createTestPublication("Private renderer title");
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    function ThrowingReader(): never {
      throw new Error("private renderer prose and path");
    }
    render(<App openFlow={flow} ReadyPublicationContent={ThrowingReader} />);

    selectEpub();

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "VoxLeaf could not display that EPUB.",
      ),
    );
    expect(flow.close).toHaveBeenCalled();
    expect(document.body).not.toHaveTextContent("Private renderer title");
    expect(document.body).not.toHaveTextContent("private renderer prose");
  });

  it("keeps the current ready state when the picker is cancelled", async () => {
    const publication = createTestPublication();
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    render(<App openFlow={flow} />);
    selectEpub();
    await screen.findByRole("heading", { name: "Synthetic Reader Book" });

    fireEvent(
      screen.getByLabelText("Open a local EPUB"),
      new Event("cancel", { bubbles: true }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "The EPUB opened successfully.",
    );
    expect(flow.open).toHaveBeenCalledTimes(1);
  });

  it("drops prior metadata immediately and rejects obsolete completions", async () => {
    const pending: Array<(result: LocalPublicationOpenResult) => void> = [];
    const current = createTestPublication("Current publication");
    const flow = createTestFlow(
      vi
        .fn<LocalPublicationOpenFlow["open"]>()
        .mockResolvedValueOnce({
          status: "ready",
          publication: createTestPublication("Prior private publication"),
        })
        .mockImplementation(
          () =>
            new Promise((resolve) => {
              pending.push(resolve);
            }),
        ),
    );
    render(<App openFlow={flow} />);
    selectEpub("prior.epub");
    await screen.findByRole("heading", { name: "Prior private publication" });

    selectEpub("obsolete.epub");
    expect(
      screen.queryByText("Prior private publication"),
    ).not.toBeInTheDocument();
    selectEpub("current.epub");

    await act(async () => {
      pending[1]?.({ status: "ready", publication: current });
    });
    expect(
      screen.getByRole("heading", { name: "Current publication" }),
    ).toBeInTheDocument();

    await act(async () => {
      pending[0]?.({ status: "rejected", reason: "invalid-epub" });
    });
    expect(
      screen.getByRole("heading", { name: "Current publication" }),
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("Prior private publication");
  });

  it("retains the independent content-free raster safety probe", async () => {
    const flow = createTestFlow(() => Promise.resolve({ status: "cancelled" }));
    const runRasterProbe = vi.fn(async () => ({
      status: "accepted" as const,
    }));
    render(<App openFlow={flow} runRasterProbe={runRasterProbe} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Run synthetic raster safety probe",
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByText("Bounded local raster decoding is available."),
      ).toBeInTheDocument(),
    );
    expect(runRasterProbe).toHaveBeenCalledWith({
      signal: expect.any(AbortSignal),
    });
  });

  it("cleans publication ownership when the application unmounts", () => {
    const flow = createTestFlow(() => Promise.resolve({ status: "cancelled" }));
    const { unmount } = render(<App openFlow={flow} />);

    unmount();

    expect(flow.close).toHaveBeenCalledTimes(1);
  });
});
