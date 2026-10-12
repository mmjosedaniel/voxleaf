import { afterEach, describe, expect, it, vi } from "vitest";

import { createRasterImageSafetyPolicy } from "./raster-image-policy";
import {
  RasterImageSourceManager,
  type RasterImageBrowserAdapter,
  type RasterImageDecodeObservation,
} from "./raster-image-source";

function uint32BigEndian(value: number): number[] {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

function pngChunk(type: string, data: readonly number[]): number[] {
  return [
    ...uint32BigEndian(data.length),
    ...[...type].map((character) => character.charCodeAt(0)),
    ...data,
    0,
    0,
    0,
    0,
  ];
}

function createPng(
  widthPixels: number,
  heightPixels: number,
  animationFrames?: number,
): Uint8Array {
  return new Uint8Array([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
    ...pngChunk("IHDR", [
      ...uint32BigEndian(widthPixels),
      ...uint32BigEndian(heightPixels),
      8,
      6,
      0,
      0,
      0,
    ]),
    ...(animationFrames === undefined
      ? []
      : pngChunk("acTL", [...uint32BigEndian(animationFrames), 0, 0, 0, 0])),
    ...pngChunk("IEND", []),
  ]);
}

class FakeBrowserAdapter implements RasterImageBrowserAdapter {
  public readonly created: string[] = [];
  public readonly revoked: string[] = [];
  public throwOnRevoke = false;
  public decode =
    vi.fn<
      (
        objectUrl: string,
        signal: AbortSignal,
      ) => Promise<RasterImageDecodeObservation>
    >();

  public createObjectUrl(): string {
    const objectUrl = `blob:voxleaf-${String(this.created.length + 1)}`;
    this.created.push(objectUrl);
    return objectUrl;
  }

  public decodeObjectUrl(
    objectUrl: string,
    signal: AbortSignal,
  ): Promise<RasterImageDecodeObservation> {
    return this.decode(objectUrl, signal);
  }

  public revokeObjectUrl(objectUrl: string): void {
    this.revoked.push(objectUrl);
    if (this.throwOnRevoke) {
      throw new Error("private-revoke-failure");
    }
  }
}

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("bounded raster image source lifecycle", () => {
  it("creates a decoded local object URL and revokes it exactly once on release", async () => {
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("fetch", fetch);
    const adapter = new FakeBrowserAdapter();
    adapter.decode.mockResolvedValue({ widthPixels: 2, heightPixels: 2 });
    const manager = new RasterImageSourceManager(undefined, adapter);

    const result = await manager.prepare(createPng(2, 2), "image/png");

    expect(result.status).toBe("ready");
    if (result.status !== "ready") {
      throw new Error("expected a ready source");
    }
    expect(result.source).toMatchObject({
      objectUrl: "blob:voxleaf-1",
      widthPixels: 2,
      heightPixels: 2,
      decodedPixels: 4,
      released: false,
    });
    expect(manager.liveSourceCount).toBe(1);
    expect(manager.liveDecodedPixels).toBe(4);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.source)).toBe(true);
    expect(fetch).not.toHaveBeenCalled();

    result.source.release();
    result.source.release();
    expect(result.source.released).toBe(true);
    expect(adapter.revoked).toEqual(["blob:voxleaf-1"]);
    expect(manager.liveSourceCount).toBe(0);
    expect(manager.liveDecodedPixels).toBe(0);
  });

  it("removes malformed, oversized, and animated candidates before creating a URL", async () => {
    const adapter = new FakeBrowserAdapter();
    const policy = createRasterImageSafetyPolicy({
      maximumWidthPixels: 2,
      maximumHeightPixels: 2,
      maximumDecodedPixels: 4,
      maximumLiveDecodedPixels: 4,
    });
    const manager = new RasterImageSourceManager(policy, adapter);

    await expect(
      manager.prepare(new Uint8Array(), "image/png"),
    ).resolves.toEqual({ status: "rejected", reason: "invalid-image" });
    await expect(
      manager.prepare(createPng(3, 2), "image/png"),
    ).resolves.toEqual({ status: "rejected", reason: "dimensions-exceeded" });
    await expect(
      manager.prepare(createPng(2, 2, 2), "image/png"),
    ).resolves.toEqual({
      status: "rejected",
      reason: "animation-unsupported",
    });
    expect(adapter.created).toEqual([]);
    expect(adapter.decode).not.toHaveBeenCalled();
    expect(adapter.revoked).toEqual([]);
  });

  it("permits one concurrent decode and rejects the first excess operation", async () => {
    const pending = deferred<RasterImageDecodeObservation>();
    const adapter = new FakeBrowserAdapter();
    adapter.decode.mockReturnValue(pending.promise);
    const manager = new RasterImageSourceManager(undefined, adapter);

    const first = manager.prepare(createPng(2, 2), "image/png");
    await expect(
      manager.prepare(createPng(2, 2), "image/png"),
    ).resolves.toEqual({ status: "rejected", reason: "decode-busy" });
    expect(adapter.created).toEqual(["blob:voxleaf-1"]);

    pending.resolve({ widthPixels: 2, heightPixels: 2 });
    const firstResult = await first;
    expect(firstResult.status).toBe("ready");
    if (firstResult.status === "ready") {
      firstResult.source.release();
    }
  });

  it("enforces exact live-source and aggregate decoded-pixel capacity", async () => {
    const adapter = new FakeBrowserAdapter();
    adapter.decode.mockImplementation(async () => ({
      widthPixels: 2,
      heightPixels: 2,
    }));
    const policy = createRasterImageSafetyPolicy({
      maximumWidthPixels: 4,
      maximumHeightPixels: 4,
      maximumDecodedPixels: 4,
      maximumLiveSources: 1,
      maximumLiveDecodedPixels: 4,
    });
    const manager = new RasterImageSourceManager(policy, adapter);

    const exact = await manager.prepare(createPng(2, 2), "image/png");
    expect(exact.status).toBe("ready");
    await expect(
      manager.prepare(createPng(1, 1), "image/png"),
    ).resolves.toEqual({ status: "rejected", reason: "capacity-exceeded" });
    expect(adapter.created).toHaveLength(1);

    if (exact.status === "ready") {
      exact.source.release();
    }
    adapter.decode.mockResolvedValueOnce({ widthPixels: 1, heightPixels: 1 });
    const afterRelease = await manager.prepare(createPng(1, 1), "image/png");
    expect(afterRelease.status).toBe("ready");
    if (afterRelease.status === "ready") {
      afterRelease.source.release();
    }
  });

  it("revokes failed and postdecode-mismatched URLs without exposing raw errors", async () => {
    const adapter = new FakeBrowserAdapter();
    adapter.decode.mockRejectedValueOnce(
      new Error("private-path/private-title.png"),
    );
    const manager = new RasterImageSourceManager(undefined, adapter);

    const failed = await manager.prepare(createPng(2, 2), "image/png");
    expect(failed).toEqual({ status: "rejected", reason: "decode-failed" });
    expect(JSON.stringify(failed)).not.toContain("private-title");
    expect(adapter.revoked).toEqual(["blob:voxleaf-1"]);

    adapter.decode.mockResolvedValueOnce({ widthPixels: 3, heightPixels: 2 });
    await expect(
      manager.prepare(createPng(2, 2), "image/png"),
    ).resolves.toEqual({ status: "rejected", reason: "decode-mismatch" });
    expect(adapter.revoked).toEqual(["blob:voxleaf-1", "blob:voxleaf-2"]);
    expect(manager.liveSourceCount).toBe(0);
  });

  it("keeps URL revocation failures behind the fixed result boundary", async () => {
    const adapter = new FakeBrowserAdapter();
    adapter.decode.mockRejectedValue(new Error("private-decode-failure"));
    adapter.throwOnRevoke = true;
    const manager = new RasterImageSourceManager(undefined, adapter);

    await expect(
      manager.prepare(createPng(2, 2), "image/png"),
    ).resolves.toEqual({ status: "rejected", reason: "decode-failed" });
    expect(adapter.revoked).toEqual(["blob:voxleaf-1"]);
    await expect(manager.close()).resolves.toBeUndefined();
  });

  it("cancels active work, revokes temporary URLs, and closes idempotently", async () => {
    const pending = deferred<RasterImageDecodeObservation>();
    const adapter = new FakeBrowserAdapter();
    adapter.decode.mockReturnValue(pending.promise);
    const manager = new RasterImageSourceManager(undefined, adapter);
    const controller = new AbortController();

    const preparation = manager.prepare(createPng(2, 2), "image/png", {
      signal: controller.signal,
    });
    controller.abort("private-cancellation-reason");
    pending.resolve({ widthPixels: 2, heightPixels: 2 });

    await expect(preparation).resolves.toEqual({ status: "cancelled" });
    expect(adapter.revoked).toEqual(["blob:voxleaf-1"]);
    const firstClose = manager.close();
    const secondClose = manager.close();
    expect(secondClose).toBe(firstClose);
    await firstClose;
    expect(manager.closed).toBe(true);
    await expect(
      manager.prepare(createPng(2, 2), "image/png"),
    ).resolves.toEqual({ status: "rejected", reason: "closed" });
  });

  it("releases ready sources and waits for an active decode during close", async () => {
    const adapter = new FakeBrowserAdapter();
    adapter.decode.mockResolvedValueOnce({ widthPixels: 1, heightPixels: 1 });
    const manager = new RasterImageSourceManager(undefined, adapter);
    const ready = await manager.prepare(createPng(1, 1), "image/png");
    expect(ready.status).toBe("ready");

    const pending = deferred<RasterImageDecodeObservation>();
    adapter.decode.mockReturnValueOnce(pending.promise);
    const active = manager.prepare(createPng(1, 1), "image/png");
    const closing = manager.close();
    expect(manager.closed).toBe(true);
    expect(adapter.revoked).toEqual(["blob:voxleaf-1"]);

    pending.resolve({ widthPixels: 1, heightPixels: 1 });
    await expect(active).resolves.toEqual({ status: "cancelled" });
    await closing;
    expect(adapter.revoked).toEqual(["blob:voxleaf-1", "blob:voxleaf-2"]);
    expect(manager.liveSourceCount).toBe(0);
    if (ready.status === "ready") {
      expect(ready.source.released).toBe(true);
    }
  });
});
