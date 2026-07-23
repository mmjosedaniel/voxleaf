import type {
  EpubFailure,
  OpenedPublication,
  OpenEpubPublicationResult,
} from "@voxleaf/epub";
import { createOperationalErrorV1 } from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { describe, expect, it, vi } from "vitest";

import {
  createPublicationSession,
  type PublicationOpener,
} from "./publication-session";

interface ControlledOpen {
  readonly promise: Promise<OpenEpubPublicationResult>;
  resolve(result: OpenEpubPublicationResult): void;
}

interface TestPublication extends OpenedPublication {
  readonly close: ReturnType<typeof vi.fn<() => Promise<void>>>;
}

const MALFORMED_FAILURE: EpubFailure = Object.freeze({
  ok: false,
  detail: "malformed-package",
  error: createOperationalErrorV1("invalid-input"),
});

function controlledOpen(): ControlledOpen {
  let resolvePromise: ((result: OpenEpubPublicationResult) => void) | undefined;
  const promise = new Promise<OpenEpubPublicationResult>((resolve) => {
    resolvePromise = resolve;
  });

  return Object.freeze({
    promise,
    resolve: (result: OpenEpubPublicationResult): void => {
      if (resolvePromise === undefined) {
        throw new Error("Controlled open was already resolved");
      }
      const resolve = resolvePromise;
      resolvePromise = undefined;
      resolve(result);
    },
  });
}

function createTestPublication(): TestPublication {
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

function success(publication: OpenedPublication): OpenEpubPublicationResult {
  return Object.freeze({ ok: true, publication });
}

describe("desktop publication session", () => {
  it("uses the real EPUB package boundary by default", async () => {
    const session = createPublicationSession();

    await expect(session.open(new Uint8Array())).resolves.toMatchObject({
      status: "rejected",
      failure: {
        ok: false,
        detail: "invalid-container",
        error: { code: "invalid-input" },
      },
    });
    expect(session.opening).toBe(false);
    expect(session.publication).toBeUndefined();
  });

  it("opens one publication through the package boundary", async () => {
    const publication = createTestPublication();
    const opener = vi.fn<PublicationOpener>(() =>
      Promise.resolve(success(publication)),
    );
    const session = createPublicationSession({ openPublication: opener });
    const bytes = new Uint8Array([1, 2, 3]);

    const result = await session.open(bytes);

    expect(opener).toHaveBeenCalledTimes(1);
    expect(opener.mock.calls[0]?.[0]).toBe(bytes);
    expect(opener.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
    expect(result).toEqual({ status: "ready", publication });
    expect(Object.isFrozen(result)).toBe(true);
    expect(session.opening).toBe(false);
    expect(session.publication).toBe(publication);
  });

  it("closes a ready publication before opening its replacement", async () => {
    const firstPublication = createTestPublication();
    const secondPublication = createTestPublication();
    const opener = vi
      .fn<PublicationOpener>()
      .mockResolvedValueOnce(success(firstPublication))
      .mockResolvedValueOnce(success(secondPublication));
    const session = createPublicationSession({ openPublication: opener });
    await session.open(new Uint8Array([1]));

    const replacement = session.open(new Uint8Array([2]));

    expect(session.publication).toBeUndefined();
    await expect(replacement).resolves.toEqual({
      status: "ready",
      publication: secondPublication,
    });
    expect(firstPublication.close).toHaveBeenCalledTimes(1);
    expect(firstPublication.close.mock.invocationCallOrder[0]).toBeLessThan(
      opener.mock.invocationCallOrder[1]!,
    );
    expect(session.publication).toBe(secondPublication);
  });

  it("waits for replacement cleanup before session close completes", async () => {
    let finishPublicationClose: (() => void) | undefined;
    const publication = createTestPublication();
    publication.close.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishPublicationClose = resolve;
        }),
    );
    const opener = vi
      .fn<PublicationOpener>()
      .mockResolvedValueOnce(success(publication));
    const session = createPublicationSession({ openPublication: opener });
    await session.open(new Uint8Array([1]));

    const replacement = session.open(new Uint8Array([2]));
    await vi.waitFor(() => expect(publication.close).toHaveBeenCalledTimes(1));
    const closing = session.close();
    let closeSettled = false;
    void closing.then(() => {
      closeSettled = true;
    });
    await Promise.resolve();

    expect(closeSettled).toBe(false);
    finishPublicationClose?.();
    await expect(closing).resolves.toEqual({ status: "closed" });
    await expect(replacement).resolves.toEqual({ status: "cancelled" });
    expect(opener).toHaveBeenCalledTimes(1);
  });

  it("aborts a replaced open and closes a late stale publication", async () => {
    const first = controlledOpen();
    const second = controlledOpen();
    const stalePublication = createTestPublication();
    const currentPublication = createTestPublication();
    const opener = vi
      .fn<PublicationOpener>()
      .mockImplementationOnce((_bytes, options) => {
        expect(options?.signal?.aborted).toBe(false);
        return first.promise;
      })
      .mockImplementationOnce(() => second.promise);
    const session = createPublicationSession({ openPublication: opener });
    const staleOpen = session.open(new Uint8Array([1]));
    await vi.waitFor(() => expect(opener).toHaveBeenCalledTimes(1));
    const firstSignal = opener.mock.calls[0]?.[1]?.signal;

    const currentOpen = session.open(new Uint8Array([2]));
    await vi.waitFor(() => expect(opener).toHaveBeenCalledTimes(2));

    expect(firstSignal?.aborted).toBe(true);
    first.resolve(success(stalePublication));
    await expect(staleOpen).resolves.toEqual({ status: "cancelled" });
    expect(stalePublication.close).toHaveBeenCalledTimes(1);
    expect(session.publication).toBeUndefined();

    second.resolve(success(currentPublication));
    await expect(currentOpen).resolves.toEqual({
      status: "ready",
      publication: currentPublication,
    });
    expect(session.publication).toBe(currentPublication);
  });

  it("cancels an active open on close and rejects its late completion", async () => {
    const pending = controlledOpen();
    const stalePublication = createTestPublication();
    const opener = vi.fn<PublicationOpener>(() => pending.promise);
    const session = createPublicationSession({ openPublication: opener });
    const opening = session.open(new Uint8Array([1]));
    await vi.waitFor(() => expect(opener).toHaveBeenCalledTimes(1));
    const signal = opener.mock.calls[0]?.[1]?.signal;

    await expect(session.close()).resolves.toEqual({ status: "closed" });

    expect(signal?.aborted).toBe(true);
    expect(session.opening).toBe(false);
    expect(session.publication).toBeUndefined();
    pending.resolve(success(stalePublication));
    await expect(opening).resolves.toEqual({ status: "cancelled" });
    expect(stalePublication.close).toHaveBeenCalledTimes(1);
    await expect(session.close()).resolves.toEqual({ status: "closed" });
  });

  it("lets close invalidate a reopen waiting on prior cleanup", async () => {
    const opener = vi.fn<PublicationOpener>();
    const session = createPublicationSession({ openPublication: opener });
    await session.close();

    const reopening = session.open(new Uint8Array([1]));
    const repeatedClose = session.close();

    await expect(repeatedClose).resolves.toEqual({ status: "closed" });
    await expect(reopening).resolves.toEqual({ status: "cancelled" });
    expect(opener).not.toHaveBeenCalled();
    expect(session.opening).toBe(false);
  });

  it("maps package rejection, cancellation, and thrown values to fixed results", async () => {
    const cancelledFailure: EpubFailure = Object.freeze({
      ok: false,
      detail: "cancelled",
      error: createOperationalErrorV1("operation-cancelled"),
    });
    const privateError = new Error("private path and publication prose");
    const opener = vi
      .fn<PublicationOpener>()
      .mockResolvedValueOnce(MALFORMED_FAILURE)
      .mockResolvedValueOnce(cancelledFailure)
      .mockRejectedValueOnce(privateError);
    const session = createPublicationSession({ openPublication: opener });

    await expect(session.open(new Uint8Array([1]))).resolves.toEqual({
      status: "rejected",
      failure: MALFORMED_FAILURE,
    });
    await expect(session.open(new Uint8Array([2]))).resolves.toEqual({
      status: "cancelled",
    });
    const thrownResult = await session.open(new Uint8Array([3]));

    expect(thrownResult).toMatchObject({
      status: "rejected",
      failure: {
        ok: false,
        detail: "internal-failure",
        error: { code: "internal-failure" },
      },
    });
    expect(JSON.stringify(thrownResult)).not.toContain(privateError.message);
  });

  it("detaches a ready publication and closes it idempotently", async () => {
    const publication = createTestPublication();
    const reopenedPublication = createTestPublication();
    const opener = vi
      .fn<PublicationOpener>()
      .mockResolvedValueOnce(success(publication))
      .mockResolvedValueOnce(success(reopenedPublication));
    const session = createPublicationSession({
      openPublication: opener,
    });
    await session.open(new Uint8Array([1]));

    const firstClose = session.close();
    const secondClose = session.close();

    expect(session.publication).toBeUndefined();
    expect(secondClose).toBe(firstClose);
    await expect(firstClose).resolves.toEqual({ status: "closed" });
    await expect(secondClose).resolves.toEqual({ status: "closed" });
    expect(publication.close).toHaveBeenCalledTimes(1);

    await expect(session.open(new Uint8Array([2]))).resolves.toEqual({
      status: "ready",
      publication: reopenedPublication,
    });
  });

  it("maps close failures without exposing the rejected value", async () => {
    const publication = createTestPublication();
    publication.close.mockRejectedValueOnce(
      new Error("private close failure with publication content"),
    );
    const session = createPublicationSession({
      openPublication: () => Promise.resolve(success(publication)),
    });
    await session.open(new Uint8Array([1]));

    const result = await session.close();

    expect(result).toMatchObject({
      status: "rejected",
      failure: {
        ok: false,
        detail: "internal-failure",
        error: { code: "internal-failure" },
      },
    });
    expect(JSON.stringify(result)).not.toContain("private close failure");
    expect(session.publication).toBeUndefined();
  });
});
