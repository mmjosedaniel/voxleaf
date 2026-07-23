import type { EpubFailure, OpenedPublication } from "@voxleaf/epub";
import { createOperationalErrorV1 } from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { describe, expect, it, vi } from "vitest";

import type {
  LocalEpubFileReadOptions,
  LocalEpubFileReadResult,
} from "../file-ingress/local-epub-file";
import {
  createLocalPublicationOpenFlow,
  type LocalPublicationOpenFailureReason,
} from "./local-publication-open";
import type {
  PublicationSession,
  PublicationSessionOpenResult,
} from "./publication-session";

interface PendingRead {
  readonly signal: AbortSignal | undefined;
  resolve(result: LocalEpubFileReadResult): void;
}

function createTestPublication(): OpenedPublication {
  return {
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
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

function createTestSession(
  openResult: PublicationSessionOpenResult,
): PublicationSession {
  return {
    opening: false,
    publication:
      openResult.status === "ready" ? openResult.publication : undefined,
    open: vi.fn(() => Promise.resolve(openResult)),
    close: vi.fn(() => Promise.resolve({ status: "closed" as const })),
  };
}

function rejectedSessionResult(
  failure: EpubFailure,
): PublicationSessionOpenResult {
  return Object.freeze({ status: "rejected", failure });
}

function pendingRead(): {
  readonly promise: Promise<LocalEpubFileReadResult>;
  resolve(result: LocalEpubFileReadResult): void;
} {
  let resolvePromise: ((result: LocalEpubFileReadResult) => void) | undefined;
  const promise = new Promise<LocalEpubFileReadResult>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve: (result): void => {
      if (resolvePromise === undefined) {
        throw new Error("pending-read-already-resolved");
      }
      const resolve = resolvePromise;
      resolvePromise = undefined;
      resolve(result);
    },
  };
}

describe("local publication open flow", () => {
  it("connects the default browser read to the real EPUB package boundary", async () => {
    const flow = createLocalPublicationOpenFlow();

    await expect(
      flow.open(new File([new Uint8Array()], "private-invalid.epub")),
    ).resolves.toEqual({ status: "rejected", reason: "invalid-epub" });
    await expect(flow.close()).resolves.toEqual({ status: "closed" });
  });

  it("closes prior state before passing bounded bytes to the session", async () => {
    const publication = createTestPublication();
    const bytes = new Uint8Array([1, 2, 3]);
    const readFile = vi.fn(() =>
      Promise.resolve({ status: "ready" as const, bytes }),
    );
    const session = createTestSession({ status: "ready", publication });
    const file = new File([bytes], "private-book.epub", {
      type: "application/epub+zip",
    });
    const flow = createLocalPublicationOpenFlow({ readFile, session });

    const result = await flow.open(file);

    expect(session.close).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(file, {
      signal: expect.any(AbortSignal),
    });
    expect(session.open).toHaveBeenCalledWith(bytes);
    expect(vi.mocked(session.close).mock.invocationCallOrder[0]).toBeLessThan(
      readFile.mock.invocationCallOrder[0]!,
    );
    expect(result).toEqual({ status: "ready", publication });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it.each<{
    expected: LocalPublicationOpenFailureReason;
    readResult: LocalEpubFileReadResult;
  }>([
    {
      readResult: { status: "rejected", reason: "too-large" },
      expected: "file-too-large",
    },
    {
      readResult: { status: "rejected", reason: "invalid-size" },
      expected: "file-read-failed",
    },
    {
      readResult: { status: "rejected", reason: "read-failed" },
      expected: "file-read-failed",
    },
    {
      readResult: { status: "rejected", reason: "size-mismatch" },
      expected: "file-read-failed",
    },
  ])(
    "maps bounded read failures to $expected",
    async ({ expected, readResult }) => {
      const session = createTestSession({ status: "cancelled" });
      const flow = createLocalPublicationOpenFlow({
        readFile: vi.fn(() => Promise.resolve(readResult)),
        session,
      });

      await expect(flow.open(new File([], "private.epub"))).resolves.toEqual({
        status: "rejected",
        reason: expected,
      });
      expect(session.open).not.toHaveBeenCalled();
    },
  );

  it.each<{
    code:
      | "internal-failure"
      | "invalid-input"
      | "operation-cancelled"
      | "resource-exhausted"
      | "unsupported-input";
    detail: EpubFailure["detail"];
    expected: LocalPublicationOpenFailureReason | "cancelled";
  }>([
    {
      code: "invalid-input",
      detail: "malformed-package",
      expected: "invalid-epub",
    },
    {
      code: "unsupported-input",
      detail: "unsupported-version",
      expected: "unsupported-epub",
    },
    {
      code: "resource-exhausted",
      detail: "resource-limit-exceeded",
      expected: "resource-exhausted",
    },
    {
      code: "operation-cancelled",
      detail: "cancelled",
      expected: "cancelled",
    },
    {
      code: "internal-failure",
      detail: "internal-failure",
      expected: "internal-failure",
    },
  ])(
    "maps $code without exposing package details",
    async ({ code, detail, expected }) => {
      const failure: EpubFailure = Object.freeze({
        ok: false,
        detail,
        error: createOperationalErrorV1(code),
      });
      const session = createTestSession(rejectedSessionResult(failure));
      const flow = createLocalPublicationOpenFlow({
        readFile: vi.fn(() =>
          Promise.resolve({
            status: "ready" as const,
            bytes: new Uint8Array([1]),
          }),
        ),
        session,
      });

      const result = await flow.open(new File(["book"], "private.epub"));

      expect(result).toEqual(
        expected === "cancelled"
          ? { status: "cancelled" }
          : { status: "rejected", reason: expected },
      );
      expect(result).not.toHaveProperty("failure");
      expect(result).not.toHaveProperty("error");
    },
  );

  it("aborts an obsolete read and rejects its late completion", async () => {
    const reads: PendingRead[] = [];
    const readFile = vi.fn(
      (_file: File, options: LocalEpubFileReadOptions = {}) => {
        const controlled = pendingRead();
        reads.push({ signal: options.signal, resolve: controlled.resolve });
        return controlled.promise;
      },
    );
    const publication = createTestPublication();
    const session = createTestSession({ status: "ready", publication });
    const flow = createLocalPublicationOpenFlow({ readFile, session });

    const staleOpen = flow.open(new File(["first"], "private-first.epub"));
    const currentOpen = flow.open(new File(["second"], "private-second.epub"));

    expect(reads).toHaveLength(2);
    expect(reads[0]?.signal?.aborted).toBe(true);
    reads[1]?.resolve({
      status: "ready",
      bytes: new Uint8Array([2]),
    });
    await expect(currentOpen).resolves.toEqual({
      status: "ready",
      publication,
    });
    reads[0]?.resolve({
      status: "ready",
      bytes: new Uint8Array([1]),
    });
    await expect(staleOpen).resolves.toEqual({ status: "cancelled" });
    expect(session.open).toHaveBeenCalledTimes(1);
    expect(session.open).toHaveBeenCalledWith(new Uint8Array([2]));
  });

  it("aborts a pending read and closes the session on owner close", async () => {
    let signal: AbortSignal | undefined;
    const session = createTestSession({ status: "cancelled" });
    const flow = createLocalPublicationOpenFlow({
      readFile: vi.fn((_file, options = {}) => {
        signal = options.signal;
        return new Promise<LocalEpubFileReadResult>((resolve) => {
          options.signal?.addEventListener(
            "abort",
            () => resolve({ status: "cancelled" }),
            { once: true },
          );
        });
      }),
      session,
    });
    const opening = flow.open(new File(["book"], "private.epub"));

    await expect(flow.close()).resolves.toEqual({ status: "closed" });

    expect(signal?.aborted).toBe(true);
    expect(session.close).toHaveBeenCalledTimes(2);
    await expect(opening).resolves.toEqual({ status: "cancelled" });
  });

  it("contains unexpected read, session-open, and close failures", async () => {
    const readFailureSession = createTestSession({ status: "cancelled" });
    const readFailureFlow = createLocalPublicationOpenFlow({
      readFile: vi.fn(() => Promise.reject(new Error("private-read-error"))),
      session: readFailureSession,
    });
    await expect(
      readFailureFlow.open(new File(["book"], "private.epub")),
    ).resolves.toEqual({
      status: "rejected",
      reason: "file-read-failed",
    });

    const session: PublicationSession = {
      opening: false,
      publication: undefined,
      open: vi.fn(() => Promise.reject(new Error("private-open-error"))),
      close: vi
        .fn<PublicationSession["close"]>()
        .mockResolvedValueOnce({ status: "closed" })
        .mockRejectedValueOnce(new Error("private-close-error")),
    };
    const flow = createLocalPublicationOpenFlow({
      readFile: vi.fn(() =>
        Promise.resolve({
          status: "ready" as const,
          bytes: new Uint8Array([1]),
        }),
      ),
      session,
    });

    await expect(
      flow.open(new File(["book"], "private.epub")),
    ).resolves.toEqual({ status: "rejected", reason: "internal-failure" });
    await expect(flow.close()).resolves.toEqual({
      status: "rejected",
      reason: "internal-failure",
    });
  });
});
