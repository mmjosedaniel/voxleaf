import {
  createRasterImageSafetyPolicy,
  DEFAULT_RASTER_IMAGE_SAFETY_POLICY,
  inspectRasterImageMetadata,
  type RasterImageMediaType,
  type RasterImageMetadata,
  type RasterImageMetadataRejectionReason,
  type RasterImageSafetyPolicy,
} from "./raster-image-policy";

export interface RasterImageDecodeObservation {
  readonly widthPixels: number;
  readonly heightPixels: number;
}

export interface RasterImageBrowserAdapter {
  createObjectUrl(bytes: Uint8Array, mediaType: RasterImageMediaType): string;
  decodeObjectUrl(
    objectUrl: string,
    signal: AbortSignal,
  ): Promise<RasterImageDecodeObservation>;
  revokeObjectUrl(objectUrl: string): void;
}

export interface RasterImageSource {
  readonly objectUrl: string;
  readonly widthPixels: number;
  readonly heightPixels: number;
  readonly decodedPixels: number;
  readonly released: boolean;
  release(): void;
}

export type RasterImageSourceRejectionReason =
  | RasterImageMetadataRejectionReason
  | "capacity-exceeded"
  | "closed"
  | "decode-busy"
  | "decode-failed"
  | "decode-mismatch";

export type RasterImageSourceResult =
  | Readonly<{ status: "ready"; source: RasterImageSource }>
  | Readonly<{ status: "cancelled" }>
  | Readonly<{
      status: "rejected";
      reason: RasterImageSourceRejectionReason;
    }>;

export interface RasterImageSourceOptions {
  readonly signal?: AbortSignal;
}

interface OwnedSourceState {
  readonly metadata: RasterImageMetadata;
  readonly objectUrl: string;
  released: boolean;
}

function fixedRejected(
  reason: RasterImageSourceRejectionReason,
): RasterImageSourceResult {
  return Object.freeze({ status: "rejected", reason });
}

function fixedCancelled(): RasterImageSourceResult {
  return Object.freeze({ status: "cancelled" });
}

function browserDecodeObjectUrl(
  objectUrl: string,
  signal: AbortSignal,
): Promise<RasterImageDecodeObservation> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let settled = false;

    const cleanup = (): void => {
      signal.removeEventListener("abort", handleAbort);
    };
    const fail = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new Error("raster-image-decode-failed"));
    };
    const handleAbort = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      image.removeAttribute("src");
      cleanup();
      reject(new Error("raster-image-decode-cancelled"));
    };

    signal.addEventListener("abort", handleAbort, { once: true });
    if (signal.aborted) {
      handleAbort();
      return;
    }

    try {
      image.decoding = "async";
      image.src = objectUrl;
      void image.decode().then(() => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve(
          Object.freeze({
            widthPixels: image.naturalWidth,
            heightPixels: image.naturalHeight,
          }),
        );
      }, fail);
    } catch {
      fail();
    }
  });
}

export const BROWSER_RASTER_IMAGE_ADAPTER: RasterImageBrowserAdapter =
  Object.freeze({
    createObjectUrl: (
      bytes: Uint8Array,
      mediaType: RasterImageMediaType,
    ): string => {
      const ownedBytes = Uint8Array.from(bytes);
      return URL.createObjectURL(
        new Blob([ownedBytes.buffer], { type: mediaType }),
      );
    },
    decodeObjectUrl: browserDecodeObjectUrl,
    revokeObjectUrl: (objectUrl: string): void =>
      URL.revokeObjectURL(objectUrl),
  });

export class RasterImageSourceManager {
  readonly #adapter: RasterImageBrowserAdapter;
  readonly #policy: RasterImageSafetyPolicy;
  readonly #activeControllers = new Set<AbortController>();
  readonly #activeWork = new Set<Promise<void>>();
  readonly #sources = new Set<OwnedSourceState>();
  #closePromise: Promise<void> | undefined;
  #closed = false;
  #liveDecodedPixels = 0;

  public constructor(
    policy: RasterImageSafetyPolicy = DEFAULT_RASTER_IMAGE_SAFETY_POLICY,
    adapter: RasterImageBrowserAdapter = BROWSER_RASTER_IMAGE_ADAPTER,
  ) {
    this.#policy = createRasterImageSafetyPolicy(policy);
    this.#adapter = adapter;
  }

  public get closed(): boolean {
    return this.#closed;
  }

  public get liveSourceCount(): number {
    return this.#sources.size;
  }

  public get liveDecodedPixels(): number {
    return this.#liveDecodedPixels;
  }

  public prepare(
    bytes: Uint8Array,
    mediaType: RasterImageMediaType,
    options: RasterImageSourceOptions = {},
  ): Promise<RasterImageSourceResult> {
    if (this.#closed) {
      return Promise.resolve(fixedRejected("closed"));
    }
    if (this.#activeControllers.size >= this.#policy.maximumConcurrentDecodes) {
      return Promise.resolve(fixedRejected("decode-busy"));
    }

    const metadataResult = inspectRasterImageMetadata(
      bytes,
      mediaType,
      this.#policy,
    );
    if (metadataResult.status === "rejected") {
      return Promise.resolve(fixedRejected(metadataResult.reason));
    }
    if (
      this.#sources.size >= this.#policy.maximumLiveSources ||
      metadataResult.metadata.decodedPixels >
        this.#policy.maximumLiveDecodedPixels - this.#liveDecodedPixels
    ) {
      return Promise.resolve(fixedRejected("capacity-exceeded"));
    }

    const controller = new AbortController();
    const abortFromCaller = (): void => controller.abort();
    options.signal?.addEventListener("abort", abortFromCaller, { once: true });
    if (options.signal?.aborted === true) {
      controller.abort();
    }
    this.#activeControllers.add(controller);

    const operation = this.performPrepare(
      bytes,
      mediaType,
      metadataResult.metadata,
      controller.signal,
    );
    const trackedWork = operation.then(
      () => undefined,
      () => undefined,
    );
    this.#activeWork.add(trackedWork);

    return operation.finally(() => {
      options.signal?.removeEventListener("abort", abortFromCaller);
      this.#activeControllers.delete(controller);
      this.#activeWork.delete(trackedWork);
    });
  }

  public close(): Promise<void> {
    if (this.#closePromise !== undefined) {
      return this.#closePromise;
    }

    this.#closed = true;
    for (const controller of this.#activeControllers) {
      controller.abort();
    }
    for (const source of [...this.#sources]) {
      this.releaseSource(source);
    }
    this.#closePromise = Promise.all([...this.#activeWork]).then(
      () => undefined,
    );
    return this.#closePromise;
  }

  private async performPrepare(
    bytes: Uint8Array,
    mediaType: RasterImageMediaType,
    metadata: RasterImageMetadata,
    signal: AbortSignal,
  ): Promise<RasterImageSourceResult> {
    if (signal.aborted || this.#closed) {
      return fixedCancelled();
    }

    let objectUrl: string | undefined;
    let transferred = false;
    try {
      objectUrl = this.#adapter.createObjectUrl(bytes, mediaType);
      if (signal.aborted || this.#closed) {
        return fixedCancelled();
      }

      const observation = await this.#adapter.decodeObjectUrl(
        objectUrl,
        signal,
      );
      if (signal.aborted || this.#closed) {
        return fixedCancelled();
      }
      if (
        observation.widthPixels !== metadata.widthPixels ||
        observation.heightPixels !== metadata.heightPixels
      ) {
        return fixedRejected("decode-mismatch");
      }
      if (
        this.#sources.size >= this.#policy.maximumLiveSources ||
        metadata.decodedPixels >
          this.#policy.maximumLiveDecodedPixels - this.#liveDecodedPixels
      ) {
        return fixedRejected("capacity-exceeded");
      }

      const state: OwnedSourceState = {
        metadata,
        objectUrl,
        released: false,
      };
      const source = this.createSource(state);
      this.#sources.add(state);
      this.#liveDecodedPixels += metadata.decodedPixels;
      transferred = true;
      return Object.freeze({ status: "ready", source });
    } catch {
      return signal.aborted || this.#closed
        ? fixedCancelled()
        : fixedRejected("decode-failed");
    } finally {
      if (!transferred && objectUrl !== undefined) {
        this.revokeObjectUrl(objectUrl);
      }
    }
  }

  private createSource(state: OwnedSourceState): RasterImageSource {
    return Object.freeze({
      objectUrl: state.objectUrl,
      widthPixels: state.metadata.widthPixels,
      heightPixels: state.metadata.heightPixels,
      decodedPixels: state.metadata.decodedPixels,
      get released() {
        return state.released;
      },
      release: (): void => this.releaseSource(state),
    });
  }

  private releaseSource(state: OwnedSourceState): void {
    if (state.released) {
      return;
    }
    state.released = true;
    if (this.#sources.delete(state)) {
      this.#liveDecodedPixels -= state.metadata.decodedPixels;
    }
    this.revokeObjectUrl(state.objectUrl);
  }

  private revokeObjectUrl(objectUrl: string): void {
    try {
      this.#adapter.revokeObjectUrl(objectUrl);
    } catch {
      // URL release is best-effort at the fixed public error boundary. The
      // manager still removes the source so an exception cannot leak data or
      // corrupt capacity accounting.
    }
  }
}
