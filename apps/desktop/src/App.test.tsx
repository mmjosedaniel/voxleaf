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
  LocalEpubFileReadOptions,
  LocalEpubFileReadResult,
} from "./file-ingress/local-epub-file";

afterEach(cleanup);

describe("desktop local-file ingress probe", () => {
  it("renders an accessible file input without native capabilities", () => {
    render(<App />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "VoxLeaf development shell",
      }),
    ).toBeInTheDocument();
    const input = screen.getByLabelText("Choose a local EPUB");
    expect(input).toHaveAttribute("accept", ".epub,application/epub+zip");
    expect(screen.getByRole("status")).toHaveTextContent(
      "No local EPUB is selected.",
    );
  });

  it("reads a selected file without displaying its private name", async () => {
    render(<App />);

    const input = screen.getByLabelText("Choose a local EPUB");
    const file = new File([new Uint8Array([1, 2, 3])], "private-title.epub", {
      type: "application/epub+zip",
    });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Local EPUB bytes are ready",
      ),
    );
    expect(screen.queryByText("private-title.epub")).not.toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("treats cancelling the browser picker as a non-error", () => {
    render(<App />);

    fireEvent(
      screen.getByLabelText("Choose a local EPUB"),
      new Event("cancel", { bubbles: true }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "File selection was cancelled.",
    );
  });

  it("aborts and ignores stale reads when another file is selected", async () => {
    interface PendingRead {
      readonly signal: AbortSignal | undefined;
      readonly resolve: (result: LocalEpubFileReadResult) => void;
    }

    const pending: PendingRead[] = [];
    const readFile = vi.fn(
      (_file: File, options: LocalEpubFileReadOptions = {}) =>
        new Promise<LocalEpubFileReadResult>((resolve) => {
          pending.push({ signal: options.signal, resolve });
        }),
    );
    render(<App readFile={readFile} />);
    const input = screen.getByLabelText("Choose a local EPUB");

    fireEvent.change(input, {
      target: { files: [new File(["first"], "first.epub")] },
    });
    fireEvent.change(input, {
      target: { files: [new File(["second"], "second.epub")] },
    });

    expect(pending).toHaveLength(2);
    expect(pending[0]?.signal?.aborted).toBe(true);
    await act(async () => {
      pending[1]?.resolve({
        status: "ready",
        bytes: new Uint8Array([2]),
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Local EPUB bytes are ready",
    );

    await act(async () => {
      pending[0]?.resolve({ status: "rejected", reason: "read-failed" });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Local EPUB bytes are ready",
    );
  });

  it("aborts the active read when the probe unmounts", () => {
    let signal: AbortSignal | undefined;
    const readFile = vi.fn(
      (_file: File, options: LocalEpubFileReadOptions = {}) => {
        signal = options.signal;
        return new Promise<LocalEpubFileReadResult>(() => undefined);
      },
    );
    const { unmount } = render(<App readFile={readFile} />);

    fireEvent.change(screen.getByLabelText("Choose a local EPUB"), {
      target: { files: [new File(["book"], "book.epub")] },
    });
    unmount();

    expect(signal?.aborted).toBe(true);
  });

  it("runs the content-free synthetic raster decode probe", async () => {
    const runRasterProbe = vi.fn(async () => ({
      status: "accepted" as const,
    }));
    render(<App runRasterProbe={runRasterProbe} />);

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
});
