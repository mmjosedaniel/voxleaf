import { RasterImageSourceManager } from "./raster-image-source";
import {
  createRasterImageSafetyPolicy,
  type RasterImageSafetyPolicyOverrides,
} from "./raster-image-policy";
import { syntheticStaticPngBytes } from "../../../../../packages/epub/test-support/epub-fixture";
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
  type PublicationRasterImagePresentation,
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
  additionalResources: readonly RasterImageResourceId[] = [],
): OpenedPublication {
  return {
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
    documents: Object.freeze([]),
    locators: Object.freeze([]),
    defaultStartLocator: undefined,
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
      ...additionalResources.map((id) =>
        Object.freeze({
          id,
          kind: "raster-image" as const,
          mediaType: "image/png" as const,
        }),
      ),
    ]),
    closed: false,
    readResource,
    resolveLocator: vi.fn(() => {
      throw new Error("unused locator resolver");
    }),
    resolveTarget: vi.fn(() => {
      throw new Error("unused target resolver");
    }),
    prepareNarration: vi.fn<OpenedPublication["prepareNarration"]>(),
    close: vi.fn(() => Promise.resolve()),
  };
}

describe("publication raster image loader", () => {
  function boundedHarness(overrides: RasterImageSafetyPolicyOverrides = {}) {
    const created: string[] = [];
    const revoked: string[] = [];
    const manager = new RasterImageSourceManager(
      createRasterImageSafetyPolicy(overrides),
      {
        createObjectUrl: () => {
          const url = `blob:rpi-${created.length}`;
          created.push(url);
          return url;
        },
        decodeObjectUrl: async () => ({ widthPixels: 1, heightPixels: 1 }),
        revokeObjectUrl: (url) => {
          revoked.push(url);
        },
      },
    );
    const read = vi.fn<OpenedPublication["readResource"]>(async () =>
      syntheticStaticPngBytes(),
    );
    const loader = new PublicationRasterImageLoader(
      createPublication(read),
      manager,
    );
    const watch = () => {
      const changed =
        vi.fn<(result: PublicationRasterImagePresentation) => void>();
      return { changed, occurrence: loader.watch(FIRST_RESOURCE_ID, changed) };
    };
    return { loader, manager, created, revoked, read, watch };
  }

  function heldDecodeHarness(nearCount: number) {
    const nearIds = Array.from(
      { length: nearCount },
      (_, index) =>
        `resource:prefetch-${String(index)}` as RasterImageResourceId,
    );
    const outstanding: number[] = [];
    const read = vi.fn<OpenedPublication["readResource"]>(async () => {
      outstanding.push(loader.outstandingLoadCount);
      return Uint8Array.of(1);
    });
    const preparer = new FakeSourcePreparer();
    const firstDecode = deferred<RasterImageSourceResult>();
    const firstSource = createSource(0);
    preparer.prepare
      .mockReturnValueOnce(firstDecode.promise)
      .mockImplementation(async () => ({
        status: "ready",
        source: createSource(preparer.prepare.mock.calls.length),
      }));
    const loader = new PublicationRasterImageLoader(
      createPublication(read, nearIds),
      preparer,
    );
    const watch = (
      id: RasterImageResourceId,
      visibility: "near" | "visible",
    ) => {
      const occurrence = loader.watch(id, vi.fn());
      occurrence.setVisibility(visibility);
      return occurrence;
    };
    const release = () =>
      firstDecode.resolve({ status: "ready", source: firstSource });
    const readOrder = () => read.mock.calls.map(([id]) => id);
    return {
      loader,
      preparer,
      read,
      watch,
      release,
      readOrder,
      outstanding,
      nearIds,
    };
  }

  it.each([1, 7])(
    "five-pass 1.3 dispatches visible demand before %i queued prefetches",
    async (nearCount) => {
      const {
        loader,
        preparer,
        read,
        watch,
        release,
        readOrder,
        outstanding,
        nearIds,
      } = heldDecodeHarness(nearCount);
      try {
        watch(FIRST_RESOURCE_ID, "near");
        await vi.waitFor(() =>
          expect(preparer.prepare).toHaveBeenCalledTimes(1),
        );
        for (const id of nearIds) watch(id, "near");
        await vi.waitFor(() =>
          expect(loader.outstandingLoadCount).toBe(nearCount + 1),
        );
        watch(SECOND_RESOURCE_ID, "visible");
        await Promise.resolve();
        expect(loader.outstandingLoadCount).toBe(Math.min(8, nearCount + 2));
        expect(readOrder()).toEqual([FIRST_RESOURCE_ID]);
        expect(read.mock.calls[0]![1]?.signal?.aborted).toBe(false);

        release();
        await vi.waitFor(() =>
          expect(read.mock.calls.length).toBeGreaterThan(1),
        );
        expect(read.mock.calls[1]![0]).toBe(SECOND_RESOURCE_ID);
        await vi.waitFor(() => expect(loader.outstandingLoadCount).toBe(0));
        expect(readOrder()).toEqual([
          FIRST_RESOURCE_ID,
          SECOND_RESOURCE_ID,
          ...nearIds,
        ]);
        expect(Math.max(...outstanding)).toBeLessThanOrEqual(8);
      } finally {
        release();
        await loader.close();
      }
    },
  );

  it("five-pass 1.3 observes current visibility and keeps FIFO within each priority", async () => {
    const { loader, preparer, watch, release, readOrder, nearIds } =
      heldDecodeHarness(4);
    try {
      watch(FIRST_RESOURCE_ID, "near");
      await vi.waitFor(() => expect(preparer.prepare).toHaveBeenCalledTimes(1));
      const near = nearIds.map((id) => watch(id, "near"));
      await vi.waitFor(() => expect(loader.outstandingLoadCount).toBe(5));
      const oldVisible = watch(SECOND_RESOURCE_ID, "visible");
      await vi.waitFor(() => expect(loader.outstandingLoadCount).toBe(6));
      oldVisible.setVisibility("near");
      near[1]!.setVisibility("visible");
      near[3]!.setVisibility("visible");
      release();
      await vi.waitFor(() => expect(loader.outstandingLoadCount).toBe(0));
      expect(readOrder()).toEqual([
        FIRST_RESOURCE_ID,
        nearIds[1],
        nearIds[3],
        nearIds[0],
        nearIds[2],
        SECOND_RESOURCE_ID,
      ]);
    } finally {
      release();
      await loader.close();
    }
  });

  it.each([
    { maximumLiveSources: 1 },
    { maximumDecodedPixels: 1, maximumLiveDecodedPixels: 1 },
  ])(
    "RPI-02 waits without spinning and retries visible demand on live release %j",
    async (policy) => {
      const { loader, manager, read, created, revoked, watch } =
        boundedHarness(policy);
      const first = watch();
      const waiting = watch();
      first.occurrence.setVisibility("visible");
      waiting.occurrence.setVisibility("visible");
      await vi.waitFor(() =>
        expect(waiting.changed).toHaveBeenLastCalledWith({
          status: "deferred",
          reason: "live",
        }),
      );
      await vi.waitFor(() => expect(loader.outstandingLoadCount).toBe(0));
      expect(read).toHaveBeenCalledTimes(2);
      expect(manager.liveSourceCount).toBe(1);
      for (let index = 0; index < 20; index += 1)
        waiting.occurrence.setVisibility("visible");
      await Promise.resolve();
      expect(read).toHaveBeenCalledTimes(2);
      first.occurrence.setVisibility("outside");
      await vi.waitFor(() =>
        expect(waiting.changed.mock.lastCall?.[0].status).toBe("ready"),
      );
      expect(read).toHaveBeenCalledTimes(3);
      expect(manager.liveDecodedPixels).toBe(1);
      await loader.close();
      expect(manager.liveSourceCount).toBe(0);
      expect(revoked).toEqual(created);
    },
  );

  it("RPI-02 evicts only prefetch for visible demand and does not oscillate", async () => {
    const { loader, watch, read, manager } = boundedHarness({
      maximumLiveSources: 1,
    });
    const near = watch();
    near.occurrence.setVisibility("near");
    await vi.waitFor(() =>
      expect(near.changed.mock.lastCall?.[0].status).toBe("ready"),
    );
    const visible = watch();
    visible.occurrence.setVisibility("visible");
    await vi.waitFor(() =>
      expect(visible.changed.mock.lastCall?.[0].status).toBe("ready"),
    );
    expect(near.changed).toHaveBeenLastCalledWith({ status: "loading" });
    const reads = read.mock.calls.length;
    await Promise.resolve();
    expect(read).toHaveBeenCalledTimes(reads);
    expect(manager.liveSourceCount).toBe(1);
    visible.occurrence.setVisibility("outside");
    near.occurrence.setVisibility("visible");
    await vi.waitFor(() =>
      expect(near.changed.mock.lastCall?.[0].status).toBe("ready"),
    );
    await loader.close();
  });

  it("RPI-02 keeps more than eight visible occurrences bounded and retries without re-entry", async () => {
    const { loader, manager, watch, read, created, revoked } = boundedHarness();
    const images = Array.from({ length: 12 }, watch);
    for (const image of images) image.occurrence.setVisibility("visible");
    await vi.waitFor(() =>
      expect(images[11]!.changed.mock.lastCall?.[0].status).toBe("deferred"),
    );
    await vi.waitFor(() => expect(loader.outstandingLoadCount).toBe(0));
    expect(manager.liveSourceCount).toBe(8);
    expect(read).toHaveBeenCalledTimes(12);
    images[0]!.occurrence.close();
    await vi.waitFor(() =>
      expect(images[8]!.changed.mock.lastCall?.[0].status).toBe("ready"),
    );
    expect(manager.liveSourceCount).toBe(8);
    for (const image of images) image.occurrence.close();
    await loader.close();
    expect(manager.liveSourceCount).toBe(0);
    expect(new Set(revoked)).toEqual(new Set(created));
    expect(revoked).toHaveLength(created.length);
  });

  it("RPI-02 resumes after queue drain without a live-source release", async () => {
    const { loader, watch, read, revoked } = boundedHarness();
    const firstRead = deferred<Uint8Array>();
    read.mockReturnValueOnce(firstRead.promise);
    read.mockImplementation(async (resourceId) =>
      resourceId === SECOND_RESOURCE_ID
        ? Uint8Array.of(0)
        : syntheticStaticPngBytes(),
    );
    const admitted = Array.from({ length: 8 }, () =>
      loader.load(SECOND_RESOURCE_ID),
    );
    const image = watch();
    image.occurrence.setVisibility("visible");
    await Promise.resolve();
    expect(loader.outstandingLoadCount).toBe(8);
    firstRead.resolve(Uint8Array.of(0));
    expect(await Promise.all(admitted)).toEqual(
      Array.from({ length: 8 }, () => ({ status: "unavailable" })),
    );
    await vi.waitFor(() =>
      expect(image.changed.mock.lastCall?.[0].status).toBe("ready"),
    );
    expect(read).toHaveBeenCalledTimes(9);
    expect(revoked).toEqual([]);
    await loader.close();
  });

  it("RPI-02 keeps permanent rejection local across visibility and capacity changes", async () => {
    const { loader, watch, read } = boundedHarness();
    read.mockResolvedValueOnce(Uint8Array.of(0));
    const invalid = watch();
    invalid.occurrence.setVisibility("visible");
    await vi.waitFor(() =>
      expect(invalid.changed.mock.lastCall?.[0].status).toBe("unavailable"),
    );
    const valid = watch();
    valid.occurrence.setVisibility("visible");
    await vi.waitFor(() =>
      expect(valid.changed.mock.lastCall?.[0].status).toBe("ready"),
    );
    valid.occurrence.close();
    invalid.occurrence.setVisibility("outside");
    invalid.occurrence.setVisibility("visible");
    await Promise.resolve();
    expect(read).toHaveBeenCalledTimes(2);
    expect(invalid.changed.mock.lastCall?.[0].status).toBe("unavailable");
    await loader.close();
  });

  it("RPI-02 drops a retired slow read and clears its bytes without decoding", async () => {
    const { loader, watch, read, created } = boundedHarness();
    const pending = deferred<Uint8Array>();
    read.mockReturnValueOnce(pending.promise);
    const image = watch();
    image.occurrence.setVisibility("visible");
    await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(1));
    image.occurrence.close();
    const bytes = syntheticStaticPngBytes();
    pending.resolve(bytes);
    await loader.close();
    expect(created).toHaveLength(0);
    expect(bytes.every((byte) => byte === 0)).toBe(true);
    expect(
      image.changed.mock.calls.every(([result]) => result.status !== "ready"),
    ).toBe(true);
  });

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
    await expect(excess).resolves.toEqual({
      status: "deferred",
      reason: "queue",
    });
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
