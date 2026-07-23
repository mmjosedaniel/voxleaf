import type { OpenedPublication } from "@voxleaf/epub";
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
  LocalPublicationOpenFailureReason,
  LocalPublicationOpenFlow,
  LocalPublicationOpenResult,
} from "./publication/local-publication-open";

afterEach(cleanup);

function createTestPublication(
  title = "Synthetic Reader Book",
  authors: readonly string[] = ["Test Author"],
): OpenedPublication {
  return {
    book: Object.freeze({
      ...VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
      metadata: Object.freeze({
        title,
        authors: Object.freeze([...authors]),
      }),
    }),
    documents: Object.freeze([]),
    locators: Object.freeze([]),
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
): LocalPublicationOpenFlow {
  return {
    publication: undefined,
    open: vi.fn(open),
    close: vi.fn(() => Promise.resolve()),
  };
}

describe("desktop local EPUB open flow", () => {
  it("renders an accessible capability-free file input", () => {
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

  it("shows validated metadata without displaying the private filename", async () => {
    const publication = createTestPublication("Repository-authored title", [
      "First Author",
      "Second Author",
    ]);
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    render(<App openFlow={flow} />);
    const input = screen.getByLabelText("Open a local EPUB");
    const file = new File([new Uint8Array([1, 2, 3])], "private-title.epub", {
      type: "application/epub+zip",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "The EPUB opened successfully.",
      ),
    );
    expect(flow.open).toHaveBeenCalledWith(file);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Repository-authored title",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("By First Author, Second Author"),
    ).toBeInTheDocument();
    expect(screen.queryByText("private-title.epub")).not.toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("exposes a labelled busy state while validation is pending", async () => {
    let resolveOpen: ((result: LocalPublicationOpenResult) => void) | undefined;
    const flow = createTestFlow(
      () =>
        new Promise((resolve) => {
          resolveOpen = resolve;
        }),
    );
    render(<App openFlow={flow} />);

    fireEvent.change(screen.getByLabelText("Open a local EPUB"), {
      target: { files: [new File(["book"], "private.epub")] },
    });

    expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Validating and opening the selected EPUB.",
    );

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

    fireEvent.change(screen.getByLabelText("Open a local EPUB"), {
      target: { files: [new File(["book"], "private.epub")] },
    });

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(expectedMessage),
    );
    expect(document.body).not.toHaveTextContent("private.epub");
  });

  it("keeps the current ready state when the picker is cancelled", async () => {
    const publication = createTestPublication();
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    render(<App openFlow={flow} />);
    const input = screen.getByLabelText("Open a local EPUB");
    fireEvent.change(input, {
      target: { files: [new File(["book"], "private.epub")] },
    });
    await screen.findByRole("heading", {
      level: 2,
      name: "Synthetic Reader Book",
    });

    fireEvent(input, new Event("cancel", { bubbles: true }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "The EPUB opened successfully.",
    );
    expect(flow.open).toHaveBeenCalledTimes(1);
  });

  it("does not let an obsolete completion replace newer metadata", async () => {
    const pending: Array<(result: LocalPublicationOpenResult) => void> = [];
    const flow = createTestFlow(
      () =>
        new Promise((resolve) => {
          pending.push(resolve);
        }),
    );
    render(<App openFlow={flow} />);
    const input = screen.getByLabelText("Open a local EPUB");
    fireEvent.change(input, {
      target: { files: [new File(["first"], "private-first.epub")] },
    });
    fireEvent.change(input, {
      target: { files: [new File(["second"], "private-second.epub")] },
    });

    await act(async () => {
      pending[1]?.({
        status: "ready",
        publication: createTestPublication("Current publication"),
      });
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "Current publication" }),
    ).toBeInTheDocument();

    await act(async () => {
      pending[0]?.({ status: "rejected", reason: "invalid-epub" });
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "Current publication" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "The EPUB opened successfully.",
    );
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

  it("closes publication ownership when the application unmounts", () => {
    const flow = createTestFlow(() => Promise.resolve({ status: "cancelled" }));
    const { unmount } = render(<App openFlow={flow} />);

    unmount();

    expect(flow.close).toHaveBeenCalledTimes(1);
  });
});
