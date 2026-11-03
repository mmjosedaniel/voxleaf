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
} from "./local-publication-open";
import { createReaderLifecycle } from "./reader-lifecycle";
import { createLocalPublicationOpenFlow } from "./local-publication-open";
import { createPublicationSession } from "./publication-session";
import { openEpubPublication } from "@voxleaf/epub";
import {
  buildMinimalEpubFixture,
  minimalPackageDocument,
} from "../../../../packages/epub/test-support/epub-fixture";

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
    defaultStartLocator: readable ? TEST_LOCATED_BLOCK.startLocator : undefined,
    locators: readable
      ? Object.freeze([TEST_LOCATED_BLOCK])
      : Object.freeze([]),
    navigation: Object.freeze([]),
    resources: Object.freeze([]),
    closed: false,
    readResource: vi.fn(),
    resolveLocator: vi.fn(),
    resolveTarget: vi.fn(),
    prepareNarration: vi.fn<OpenedPublication["prepareNarration"]>(),
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
  it("RAF-07 releases a public auxiliary-only readable publication rejected as empty", async () => {
    const bytes = await buildMinimalEpubFixture({
      packageDocument: minimalPackageDocument()
        .replace(
          "</manifest>",
          '<item id="aux" href="text/aux.xhtml" media-type="application/xhtml+xml"/></manifest>',
        )
        .replace(
          '<itemref idref="chapter"/>',
          '<itemref idref="aux" linear="no"/><itemref idref="chapter"/>',
        ),
      chapterDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Empty</title></head><body/></html>',
      additionalEntries: [
        {
          name: "EPUB/text/aux.xhtml",
          content:
            '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Auxiliary</title></head><body><p>Auxiliary passage.</p></body></html>',
        },
      ],
    });
    const opened = await openEpubPublication(bytes);
    expect(opened.ok).toBe(true);
    if (!opened.ok) throw new Error("fixture-open-failed");
    const publication = opened.publication;
    expect(publication.defaultStartLocator).toBeUndefined();
    expect(publication.locators.length).toBeGreaterThan(0);
    const session = createPublicationSession({
      openPublication: async () => ({ ok: true, publication }),
    });
    const flow = createLocalPublicationOpenFlow({
      session,
      readFile: async () => ({ status: "ready", bytes }),
    });
    const lifecycle = createReaderLifecycle({ openFlow: flow });
    try {
      await lifecycle.open(new File([], "synthetic.epub"));
      expect(lifecycle.state).toEqual({ status: "empty" });
      expect(publication.closed).toBe(true);
      expect(session.publication).toBeUndefined();
    } finally {
      await lifecycle.cleanup();
      await opened.publication.close();
    }
  });

  it.each(["closed", "rejected"] as const)(
    "RAF-07 empty cleanup %s cannot overwrite a newer ready owner",
    async (status) => {
      const pending = controlled<LocalPublicationCloseResult>();
      const replacement = createTestPublication("Replacement");
      const flow = createTestFlow(
        vi
          .fn<LocalPublicationOpenFlow["open"]>()
          .mockResolvedValueOnce({
            status: "ready",
            publication: createTestPublication("Empty", false),
          })
          .mockResolvedValueOnce({ status: "ready", publication: replacement }),
        () => pending.promise,
      );
      const lifecycle = createReaderLifecycle({ openFlow: flow });
      const opening = lifecycle.open(new File([], "empty.epub"));
      await vi.waitFor(() => expect(flow.close).toHaveBeenCalledTimes(1));
      await lifecycle.open(new File([], "replacement.epub"));
      pending.resolve(
        status === "closed"
          ? { status }
          : { status, reason: "internal-failure" },
      );
      await opening;
      expect(lifecycle.state).toMatchObject({
        status: "ready",
        publication: replacement,
      });
    },
  );

  it("RAF-07 reports failure closing rejected empty content", async () => {
    const flow = createTestFlow(
      async () => ({
        status: "ready",
        publication: createTestPublication("Empty", false),
      }),
      async () => ({ status: "rejected", reason: "internal-failure" }),
    );
    const lifecycle = createReaderLifecycle({ openFlow: flow });
    await lifecycle.open(new File([], "empty.epub"));
    expect(lifecycle.state).toEqual({
      status: "failure",
      reason: "close-failed",
    });
  });

  it("RAF-17 reports an unexpected current cancellation through the public import path", async () => {
    const bytes = await buildMinimalEpubFixture();
    const flow = createLocalPublicationOpenFlow({
      readFile: async () => ({ status: "ready", bytes }),
    });
    const lifecycle = createReaderLifecycle({ openFlow: flow });
    let ticks = 0;
    const clock = vi
      .spyOn(performance, "now")
      .mockImplementation(() => ticks++ * 31_000);
    try {
      await lifecycle.open(new File([], "synthetic.epub"));
      expect(lifecycle.state).toEqual({
        status: "failure",
        reason: "open-interrupted",
      });
      expect(flow.publication).toBeUndefined();
    } finally {
      clock.mockRestore();
      await lifecycle.cleanup();
    }
  });

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
    expect(lifecycle.state).toEqual({
      status: "failure",
      reason: "open-interrupted",
    });

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
