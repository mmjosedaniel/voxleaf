import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  SemanticBlock,
} from "@voxleaf/epub";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { describe, expect, it, vi } from "vitest";

import type {
  LocalPublicationCloseResult,
  LocalPublicationOpenFlow,
  LocalPublicationOpenResult,
} from "../publication/local-publication-open";
import { createReaderLifecycle } from "./reader-lifecycle";

const TEST_BLOCK: SemanticBlock = Object.freeze({
  kind: "paragraph",
  children: Object.freeze([]),
});
const TEST_LOCATED_BLOCK: PublicationLocatedBlock = Object.freeze({
  documentId: "document:test" as ContentDocumentId,
  block: TEST_BLOCK,
  startLocator:
    VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator,
  textLengthCodePoints: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.index,
});

function createTestPublication(
  title: string,
  readable = true,
): OpenedPublication {
  return {
    book: Object.freeze({
      ...VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
      metadata: Object.freeze({
        title,
        authors: Object.freeze(["Synthetic Author"]),
      }),
    }),
    documents: Object.freeze([]),
    locators: readable
      ? Object.freeze([TEST_LOCATED_BLOCK])
      : Object.freeze([]),
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

function controlled<T>(): {
  readonly promise: Promise<T>;
  resolve(value: T): void;
} {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return {
    promise,
    resolve: (value): void => {
      if (resolvePromise === undefined) {
        throw new Error("controlled-result-already-resolved");
      }
      const resolve = resolvePromise;
      resolvePromise = undefined;
      resolve(value);
    },
  };
}

describe("reader lifecycle", () => {
  it("publishes immutable opening and ready states", async () => {
    const pending = controlled<LocalPublicationOpenResult>();
    const publication = createTestPublication("Safe synthetic title");
    const lifecycle = createReaderLifecycle({
      openFlow: createTestFlow(() => pending.promise),
    });
    const listener = vi.fn();
    lifecycle.subscribe(listener);

    const opening = lifecycle.open(new File(["book"], "private.epub"));

    expect(lifecycle.state).toEqual({ status: "opening" });
    expect(Object.isFrozen(lifecycle.state)).toBe(true);
    pending.resolve({ status: "ready", publication });
    await opening;

    expect(lifecycle.state).toMatchObject({
      status: "ready",
      publication,
      publicationSequence: 1,
      summary: {
        title: "Safe synthetic title",
        authors: ["Synthetic Author"],
      },
    });
    expect(Object.isFrozen(lifecycle.state)).toBe(true);
    if (lifecycle.state.status === "ready") {
      expect(Object.isFrozen(lifecycle.state.summary)).toBe(true);
      expect(Object.isFrozen(lifecycle.state.summary.authors)).toBe(true);
    }
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("maps empty, rejected, cancelled, and thrown opens to closed states", async () => {
    const privateError = new Error("private path and publication prose");
    const flow = createTestFlow(
      vi
        .fn<LocalPublicationOpenFlow["open"]>()
        .mockResolvedValueOnce({
          status: "ready",
          publication: createTestPublication("Private empty title", false),
        })
        .mockResolvedValueOnce({
          status: "rejected",
          reason: "invalid-epub",
        })
        .mockResolvedValueOnce({ status: "cancelled" })
        .mockRejectedValueOnce(privateError),
    );
    const lifecycle = createReaderLifecycle({ openFlow: flow });

    await lifecycle.open(new File([], "empty.epub"));
    expect(lifecycle.state).toEqual({ status: "empty" });
    expect(JSON.stringify(lifecycle.state)).not.toContain(
      "Private empty title",
    );

    await lifecycle.open(new File([], "invalid.epub"));
    expect(lifecycle.state).toEqual({
      status: "failure",
      reason: "invalid-epub",
    });

    await lifecycle.open(new File([], "cancelled.epub"));
    expect(lifecycle.state).toEqual({ status: "idle" });

    await lifecycle.open(new File([], "thrown.epub"));
    expect(lifecycle.state).toEqual({
      status: "failure",
      reason: "internal-failure",
    });
    expect(JSON.stringify(lifecycle.state)).not.toContain(privateError.message);
  });

  it("drops prior publication data and ignores stale completion", async () => {
    const stale = controlled<LocalPublicationOpenResult>();
    const current = controlled<LocalPublicationOpenResult>();
    const flow = createTestFlow(
      vi
        .fn<LocalPublicationOpenFlow["open"]>()
        .mockResolvedValueOnce({
          status: "ready",
          publication: createTestPublication("Prior private title"),
        })
        .mockImplementationOnce(() => stale.promise)
        .mockImplementationOnce(() => current.promise),
    );
    const lifecycle = createReaderLifecycle({ openFlow: flow });
    await lifecycle.open(new File([], "prior.epub"));

    const staleOpen = lifecycle.open(new File([], "stale.epub"));
    expect(lifecycle.state).toEqual({ status: "opening" });
    const currentOpen = lifecycle.open(new File([], "current.epub"));
    const currentPublication = createTestPublication("Current safe title");
    current.resolve({ status: "ready", publication: currentPublication });
    await currentOpen;

    stale.resolve({ status: "rejected", reason: "invalid-epub" });
    await staleOpen;

    expect(lifecycle.state).toMatchObject({
      status: "ready",
      publication: currentPublication,
      summary: { title: "Current safe title" },
    });
    expect(JSON.stringify(lifecycle.state)).not.toContain(
      "Prior private title",
    );
  });

  it("coalesces close, clears data immediately, and supports reopen", async () => {
    const pendingClose = controlled<LocalPublicationCloseResult>();
    const first = createTestPublication("First title");
    const second = createTestPublication("Second title");
    const flow = createTestFlow(
      vi
        .fn<LocalPublicationOpenFlow["open"]>()
        .mockResolvedValueOnce({ status: "ready", publication: first })
        .mockResolvedValueOnce({ status: "ready", publication: second }),
      vi
        .fn<LocalPublicationOpenFlow["close"]>()
        .mockImplementationOnce(() => pendingClose.promise)
        .mockResolvedValue({ status: "closed" }),
    );
    const lifecycle = createReaderLifecycle({ openFlow: flow });
    await lifecycle.open(new File([], "first.epub"));

    const firstClose = lifecycle.close();
    const secondClose = lifecycle.close();

    expect(secondClose).toBe(firstClose);
    expect(lifecycle.state).toEqual({ status: "closing" });
    expect(JSON.stringify(lifecycle.state)).not.toContain("First title");
    pendingClose.resolve({ status: "closed" });
    await firstClose;
    expect(lifecycle.state).toEqual({ status: "idle" });

    await lifecycle.open(new File([], "second.epub"));
    expect(lifecycle.state).toMatchObject({
      status: "ready",
      summary: { title: "Second title" },
    });
  });

  it("surfaces close failure without retaining publication data", async () => {
    const publication = createTestPublication("Private close title");
    const flow = createTestFlow(
      () => Promise.resolve({ status: "ready", publication }),
      () => Promise.resolve({ status: "rejected", reason: "internal-failure" }),
    );
    const lifecycle = createReaderLifecycle({ openFlow: flow });
    await lifecycle.open(new File([], "private.epub"));

    await lifecycle.close();

    expect(lifecycle.state).toEqual({
      status: "failure",
      reason: "close-failed",
    });
    expect(JSON.stringify(lifecycle.state)).not.toContain(
      "Private close title",
    );
  });

  it("contains rendering failure and closes the active publication", async () => {
    const publication = createTestPublication("Private renderer title");
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    const lifecycle = createReaderLifecycle({ openFlow: flow });
    await lifecycle.open(new File([], "private.epub"));

    lifecycle.failRendering();

    expect(lifecycle.state).toEqual({
      status: "failure",
      reason: "rendering-failed",
    });
    expect(JSON.stringify(lifecycle.state)).not.toContain(
      "Private renderer title",
    );
    await vi.waitFor(() => expect(flow.close).toHaveBeenCalledTimes(1));
  });

  it("invalidates pending work and releases ownership during cleanup", async () => {
    const pending = controlled<LocalPublicationOpenResult>();
    const flow = createTestFlow(() => pending.promise);
    const lifecycle = createReaderLifecycle({ openFlow: flow });
    const opening = lifecycle.open(new File([], "private.epub"));

    await lifecycle.cleanup();
    pending.resolve({
      status: "ready",
      publication: createTestPublication("Late private title"),
    });
    await opening;

    expect(flow.close).toHaveBeenCalledTimes(1);
    expect(lifecycle.state).toEqual({ status: "idle" });
  });
});
