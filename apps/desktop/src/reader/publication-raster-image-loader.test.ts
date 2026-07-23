import type {
  OpenedPublication,
  RasterImageMediaType,
  RasterImageResourceId,
} from "@voxleaf/epub";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { describe, expect, it, vi } from "vitest";

import {
  PublicationRasterImageLoader,
  type RasterImageSourcePreparer,
} from "./publication-raster-image-loader";
import type {
  RasterImageSource,
  RasterImageSourceOptions,
  RasterImageSourceResult,
} from "./raster-image-source";

const FIRST_RESOURCE_ID = "resource:first" as RasterImageResourceId;
const SECOND_RESOURCE_ID = "resource:second" as RasterImageResourceId;

function deferred<T>(): {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (reason: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createSource(index: number): RasterImageSource {
  let released = false;
  return Object.freeze({
    objectUrl: `blob:synthetic-${String(index)}`,
    widthPixels: 1,
    heightPixels: 1,
    decodedPixels: 1,
    get released() {
      return released;
    },
    release: vi.fn(() => {
      released = true;
    }),
  });
}

class FakeSourcePreparer implements RasterImageSourcePreparer {
  public readonly prepare =
    vi.fn<
      (
        bytes: Uint8Array,
        mediaType: RasterImageMediaType,
        options?: RasterImageSourceOptions,
      ) => Promise<RasterImageSourceResult>
    >();
  public readonly close = vi.fn(() => Promise.resolve());
}

function createPublication(
  readResource: OpenedPublication["readResource"],
): OpenedPublication {
  return {
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
    documents: Object.freeze([]),
    locators: Object.freeze([]),
    navigation: Object.freeze([]),
    resources: Object.freeze([
      Object.freeze({
        id: FIRST_RESOURCE_ID,
        kind: "raster-image",
        mediaType: "image/png",
      }),
      Object.freeze({
        id: SECOND_RESOURCE_ID,
        kind: "raster-image",
        mediaType: "image/webp",
      }),
    ]),
    closed: false,
    readResource,
    resolveLocator: vi.fn(() => {
      throw new Error("unused locator resolver");
    }),
    resolveTarget: vi.fn(() => {
      throw new Error("unused target resolver");
    }),
    close: vi.fn(() => Promise.resolve()),
  };
}

describe("publication raster image loader", () => {
  it("serializes bounded publication reads and clears caller-owned bytes", async () => {
    const firstRead = deferred<Uint8Array>();
    const firstBytes = Uint8Array.of(1, 2, 3);
    const secondBytes = Uint8Array.of(4, 5, 6);
    const readResource = vi
      .fn<OpenedPublication["readResource"]>()
      .mockReturnValueOnce(firstRead.promise)
      .mockResolvedValueOnce(secondBytes);
    const sourcePreparer = new FakeSourcePreparer();
    sourcePreparer.prepare
      .mockResolvedValueOnce({
        status: "ready",
        source: createSource(1),
      })
      .mockResolvedValueOnce({
        status: "ready",
        source: createSource(2),
      });
    const loader = new PublicationRasterImageLoader(
      createPublication(readResource),
      sourcePreparer,
    );

    const first = loader.load(FIRST_RESOURCE_ID);
    const second = loader.load(SECOND_RESOURCE_ID);

    expect(readResource).toHaveBeenCalledTimes(1);
    expect(loader.outstandingLoadCount).toBe(2);
    firstRead.resolve(firstBytes);

    await expect(first).resolves.toMatchObject({ status: "ready" });
    await vi.waitFor(() => expect(readResource).toHaveBeenCalledTimes(2));
    await expect(second).resolves.toMatchObject({ status: "ready" });
    expect(sourcePreparer.prepare).toHaveBeenNthCalledWith(
      1,
      firstBytes,
      "image/png",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(sourcePreparer.prepare).toHaveBeenNthCalledWith(
      2,
      secondBytes,
      "image/webp",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(firstBytes).toEqual(Uint8Array.of(0, 0, 0));
    expect(secondBytes).toEqual(Uint8Array.of(0, 0, 0));
    expect(loader.outstandingLoadCount).toBe(0);

    await loader.close();
  });

  it("caps active and queued loads at the accepted live-source limit", async () => {
    const firstRead = deferred<Uint8Array>();
    const readResource = vi
      .fn<OpenedPublication["readResource"]>()
      .mockReturnValueOnce(firstRead.promise)
      .mockImplementation(async () => Uint8Array.of(1));
    const sourcePreparer = new FakeSourcePreparer();
    sourcePreparer.prepare.mockImplementation(async () => ({
      status: "ready",
      source: createSource(sourcePreparer.prepare.mock.calls.length),
    }));
    const loader = new PublicationRasterImageLoader(
      createPublication(readResource),
      sourcePreparer,
    );

    const admitted = Array.from({ length: 8 }, () =>
      loader.load(FIRST_RESOURCE_ID),
    );
    const excess = loader.load(FIRST_RESOURCE_ID);

    expect(loader.outstandingLoadCount).toBe(8);
    await expect(excess).resolves.toEqual({ status: "unavailable" });
    firstRead.resolve(Uint8Array.of(1));
    const results = await Promise.all(admitted);
    expect(results.every((result) => result.status === "ready")).toBe(true);
    for (const result of results) {
      if (result.status === "ready") {
        result.source.release();
      }
    }

    await loader.close();
  });

  it("removes a cancelled queued request without reading its resource", async () => {
    const firstRead = deferred<Uint8Array>();
    const readResource = vi
      .fn<OpenedPublication["readResource"]>()
      .mockReturnValueOnce(firstRead.promise);
    const sourcePreparer = new FakeSourcePreparer();
    sourcePreparer.prepare.mockResolvedValue({
      status: "ready",
      source: createSource(1),
    });
    const loader = new PublicationRasterImageLoader(
      createPublication(readResource),
      sourcePreparer,
    );
    const queuedController = new AbortController();

    const first = loader.load(FIRST_RESOURCE_ID);
    const queued = loader.load(SECOND_RESOURCE_ID, {
      signal: queuedController.signal,
    });
    queuedController.abort("private cancellation reason");

    await expect(queued).resolves.toEqual({ status: "cancelled" });
    expect(loader.outstandingLoadCount).toBe(1);
    firstRead.resolve(Uint8Array.of(1));
    const firstResult = await first;
    if (firstResult.status === "ready") {
      firstResult.source.release();
    }
    expect(readResource).toHaveBeenCalledTimes(1);

    await loader.close();
  });

  it("closes active and queued work with fixed cancellation results", async () => {
    const readResource = vi.fn<OpenedPublication["readResource"]>(
      (_resourceId, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener(
            "abort",
            () => reject(new Error("private selected publication data")),
            { once: true },
          );
        }),
    );
    const sourcePreparer = new FakeSourcePreparer();
    const loader = new PublicationRasterImageLoader(
      createPublication(readResource),
      sourcePreparer,
    );

    const active = loader.load(FIRST_RESOURCE_ID);
    const queued = loader.load(SECOND_RESOURCE_ID);
    const firstClose = loader.close();
    const secondClose = loader.close();

    expect(secondClose).toBe(firstClose);
    await expect(active).resolves.toEqual({ status: "cancelled" });
    await expect(queued).resolves.toEqual({ status: "cancelled" });
    await firstClose;
    expect(loader.closed).toBe(true);
    expect(sourcePreparer.close).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(await active)).not.toContain("private");
  });

  it("rejects unknown resources and read failures without exposing identities", async () => {
    const readResource = vi.fn<OpenedPublication["readResource"]>(async () => {
      throw new Error("private/path/cover.png");
    });
    const sourcePreparer = new FakeSourcePreparer();
    const loader = new PublicationRasterImageLoader(
      createPublication(readResource),
      sourcePreparer,
    );

    const unknown = await loader.load(
      "private-unknown-resource" as RasterImageResourceId,
    );
    const failed = await loader.load(FIRST_RESOURCE_ID);

    expect(unknown).toEqual({ status: "unavailable" });
    expect(failed).toEqual({ status: "unavailable" });
    expect(JSON.stringify([unknown, failed])).not.toContain("private");
    expect(sourcePreparer.prepare).not.toHaveBeenCalled();

    await loader.close();
  });
});
