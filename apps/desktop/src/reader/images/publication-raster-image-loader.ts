import type {
  OpenedPublication,
  RasterImageMediaType,
  RasterImageResource,
  RasterImageResourceId,
} from "@voxleaf/epub";

import { DEFAULT_RASTER_IMAGE_SAFETY_POLICY } from "./raster-image-policy";
import {
  RasterImageSourceManager,
  type RasterImageSource,
  type RasterImageSourceOptions,
  type RasterImageSourceResult,
} from "./raster-image-source";

export interface PublicationRasterImageLoadOptions {
  readonly signal?: AbortSignal;
}

export type PublicationRasterImageLoadResult =
  | Readonly<{ status: "ready"; source: RasterImageSource }>
  | Readonly<{ status: "deferred"; reason: "queue" | "live" }>
  | Readonly<{ status: "cancelled" | "unavailable" }>;

export type RasterImageVisibility = "outside" | "near" | "visible";
export type PublicationRasterImagePresentation =
  PublicationRasterImageLoadResult | Readonly<{ status: "loading" }>;
export interface PublicationRasterImageOccurrence {
  setVisibility(visibility: RasterImageVisibility): void;
  fail(source: RasterImageSource): void;
  close(): void;
}

export interface PublicationRasterImageLoadPort {
  load(
    resourceId: RasterImageResourceId,
    options?: PublicationRasterImageLoadOptions,
  ): Promise<PublicationRasterImageLoadResult>;
  watch(
    resourceId: RasterImageResourceId,
    onChange: (result: PublicationRasterImagePresentation) => void,
  ): PublicationRasterImageOccurrence;
}

interface WatchedImage {
  readonly resourceId: RasterImageResourceId;
  readonly onChange: (result: PublicationRasterImagePresentation) => void;
  visibility: RasterImageVisibility;
  controller: AbortController | undefined;
  source: RasterImageSource | undefined;
  blockedRevision: number | undefined;
  preempted: boolean;
  failed: boolean;
}

export interface RasterImageSourcePreparer {
  prepare(
    bytes: Uint8Array,
    mediaType: RasterImageMediaType,
    options?: RasterImageSourceOptions,
  ): Promise<RasterImageSourceResult>;
  close(): Promise<void>;
}

interface PendingLoad {
  readonly resource: RasterImageResource;
  readonly controller: AbortController;
  readonly callerSignal: AbortSignal | undefined;
  readonly abortFromCaller: () => void;
  readonly resolve: (result: PublicationRasterImageLoadResult) => void;
  settled: boolean;
}

const FIXED_CANCELLED_RESULT: PublicationRasterImageLoadResult = Object.freeze({
  status: "cancelled",
});
const FIXED_UNAVAILABLE_RESULT: PublicationRasterImageLoadResult =
  Object.freeze({
    status: "unavailable",
  });
const MAXIMUM_OUTSTANDING_LOADS =
  DEFAULT_RASTER_IMAGE_SAFETY_POLICY.maximumLiveSources;

function readyResult(
  source: RasterImageSource,
): PublicationRasterImageLoadResult {
  return Object.freeze({ status: "ready", source });
}

export class PublicationRasterImageLoader implements PublicationRasterImageLoadPort {
  readonly #publication: OpenedPublication;
  readonly #sourceManager: RasterImageSourcePreparer;
  readonly #resourcesById: ReadonlyMap<string, RasterImageResource>;
  readonly #queue: PendingLoad[] = [];
  #active: PendingLoad | undefined;
  #activeWork: Promise<void> | undefined;
  #closePromise: Promise<void> | undefined;
  #closed = false;
  // Metadata only, bounded by the mounted chapter's admitted DOM nodes. No
  // resource bytes or promises are retained for waiting occurrences.
  readonly #watched = new Set<WatchedImage>();
  #liveRevision = 0;
  #pumpScheduled = false;

  public constructor(
    publication: OpenedPublication,
    sourceManager: RasterImageSourcePreparer = new RasterImageSourceManager(),
  ) {
    this.#publication = publication;
    this.#sourceManager = sourceManager;
    this.#resourcesById = new Map(
      publication.resources.map((resource) => [String(resource.id), resource]),
    );
  }

  public get closed(): boolean {
    return this.#closed;
  }

  public get outstandingLoadCount(): number {
    return (this.#active === undefined ? 0 : 1) + this.#queue.length;
  }

  public watch(
    resourceId: RasterImageResourceId,
    onChange: (result: PublicationRasterImagePresentation) => void,
  ): PublicationRasterImageOccurrence {
    if (this.#closed) {
      let active = true;
      queueMicrotask(() => {
        if (active) onChange(FIXED_UNAVAILABLE_RESULT);
      });
      return {
        setVisibility: () => undefined,
        fail: () => undefined,
        close: () => {
          active = false;
        },
      };
    }
    const image: WatchedImage = {
      resourceId,
      onChange,
      visibility: "outside",
      controller: undefined,
      source: undefined,
      blockedRevision: undefined,
      preempted: false,
      failed: false,
    };
    this.#watched.add(image);
    return {
      setVisibility: (visibility) => {
        if (!this.#watched.has(image) || image.visibility === visibility)
          return;
        image.visibility = visibility;
        image.preempted = false;
        image.blockedRevision = undefined;
        if (visibility === "outside") this.retireImage(image);
        else if (
          !image.failed &&
          image.source === undefined &&
          image.controller === undefined
        )
          image.onChange({ status: "loading" });
        this.schedulePump();
      },
      fail: (source) => {
        if (!this.#watched.has(image) || image.source !== source) return;
        image.failed = true;
        this.retireImage(image);
        image.onChange(FIXED_UNAVAILABLE_RESULT);
      },
      close: () => {
        if (this.#watched.delete(image)) this.retireImage(image, false);
      },
    };
  }

  private retireImage(image: WatchedImage, notify = true): void {
    const controller = image.controller;
    image.controller = undefined;
    controller?.abort();
    const source = image.source;
    image.source = undefined;
    // Remove the presentation before releasing its URL. A retired occurrence
    // cannot own a completion that arrives after this point.
    if (notify && !image.failed) image.onChange({ status: "loading" });
    source?.release();
  }

  private schedulePump(): void {
    if (this.#closed || this.#pumpScheduled) return;
    this.#pumpScheduled = true;
    queueMicrotask(() => {
      this.#pumpScheduled = false;
      if (!this.#closed) this.pumpImages();
    });
  }

  private pumpImages(): void {
    // Visible demand precedes prefetch; insertion order breaks ties. A rejected
    // live-budget attempt waits for RELEASE, not merely for its own queue slot.
    for (const visibility of ["visible", "near"] as const) {
      for (const image of this.#watched) {
        if (
          image.visibility !== visibility ||
          image.failed ||
          image.preempted ||
          image.controller ||
          image.source
        )
          continue;
        if (this.outstandingLoadCount >= MAXIMUM_OUTSTANDING_LOADS) return;
        if (image.blockedRevision === this.#liveRevision) {
          if (visibility !== "visible") continue;
          const victim = [...this.#watched].find(
            (candidate) =>
              candidate.visibility === "near" && candidate.source !== undefined,
          );
          if (victim === undefined) continue;
          victim.preempted = true;
          this.retireImage(victim);
        }
        const controller = new AbortController();
        const revision = this.#liveRevision;
        image.controller = controller;
        void this.load(image.resourceId, { signal: controller.signal }).then(
          (result) => {
            if (
              image.controller !== controller ||
              !this.#watched.has(image) ||
              this.#closed
            ) {
              if (result.status === "ready") result.source.release();
              return;
            }
            if (result.status !== "ready") image.controller = undefined;
            if (result.status === "ready") image.source = result.source;
            else if (result.status === "deferred") {
              if (result.reason === "live") image.blockedRevision = revision;
            } else image.failed = true;
            image.onChange(result);
            this.schedulePump();
          },
          () => {
            if (
              image.controller !== controller ||
              !this.#watched.has(image) ||
              this.#closed
            )
              return;
            image.controller = undefined;
            image.failed = true;
            image.onChange(FIXED_UNAVAILABLE_RESULT);
            this.schedulePump();
          },
        );
      }
    }
  }

  private trackSource(source: RasterImageSource): RasterImageSource {
    return Object.freeze({
      objectUrl: source.objectUrl,
      widthPixels: source.widthPixels,
      heightPixels: source.heightPixels,
      decodedPixels: source.decodedPixels,
      get released() {
        return source.released;
      },
      release: () => {
        if (source.released) return;
        source.release();
        this.#liveRevision += 1;
        this.schedulePump();
      },
    });
  }

  public load(
    resourceId: RasterImageResourceId,
    options: PublicationRasterImageLoadOptions = {},
  ): Promise<PublicationRasterImageLoadResult> {
    if (this.#closed || this.#publication.closed) {
      return Promise.resolve(FIXED_UNAVAILABLE_RESULT);
    }

    const resource = this.#resourcesById.get(String(resourceId));
    if (resource === undefined) {
      return Promise.resolve(FIXED_UNAVAILABLE_RESULT);
    }
    if (options.signal?.aborted === true) {
      return Promise.resolve(FIXED_CANCELLED_RESULT);
    }
    if (this.outstandingLoadCount >= MAXIMUM_OUTSTANDING_LOADS) {
      return Promise.resolve({ status: "deferred", reason: "queue" });
    }

    return new Promise((resolve) => {
      const controller = new AbortController();
      const abortFromCaller = (): void => {
        controller.abort();
        if (this.#active !== request) {
          const queueIndex = this.#queue.indexOf(request);
          if (queueIndex >= 0) {
            this.#queue.splice(queueIndex, 1);
          }
          this.settle(request, FIXED_CANCELLED_RESULT);
          this.schedulePump();
        }
      };
      const request: PendingLoad = {
        resource,
        controller,
        callerSignal: options.signal,
        abortFromCaller,
        resolve,
        settled: false,
      };
      options.signal?.addEventListener("abort", abortFromCaller, {
        once: true,
      });

      if (this.#active === undefined) {
        this.start(request);
      } else {
        this.#queue.push(request);
      }
    });
  }

  public close(): Promise<void> {
    if (this.#closePromise !== undefined) {
      return this.#closePromise;
    }

    this.#closed = true;
    for (const image of this.#watched) this.retireImage(image, false);
    this.#watched.clear();
    this.#active?.controller.abort();
    for (const request of this.#queue.splice(0)) {
      request.controller.abort();
      this.settle(request, FIXED_CANCELLED_RESULT);
    }

    const activeWork = this.#activeWork ?? Promise.resolve();
    this.#closePromise = Promise.all([
      activeWork,
      this.#sourceManager.close(),
    ]).then(() => undefined);
    return this.#closePromise;
  }

  private start(request: PendingLoad): void {
    if (this.#closed || request.controller.signal.aborted) {
      this.settle(request, FIXED_CANCELLED_RESULT);
      this.startNext();
      this.schedulePump();
      return;
    }

    this.#active = request;
    const operation = this.performLoad(request);
    this.#activeWork = operation.then(
      (result) => {
        if (
          result.status === "ready" &&
          (this.#closed || request.controller.signal.aborted)
        ) {
          result.source.release();
          this.settle(request, FIXED_CANCELLED_RESULT);
          return;
        }
        this.settle(request, result);
      },
      () => this.settle(request, FIXED_UNAVAILABLE_RESULT),
    );
    void this.#activeWork.finally(() => {
      if (this.#active === request) {
        this.#active = undefined;
      }
      this.#activeWork = undefined;
      this.startNext();
      this.schedulePump();
    });
  }

  private startNext(): void {
    if (this.#closed || this.#active !== undefined) {
      return;
    }

    const next = this.#queue.shift();
    if (next !== undefined) {
      this.start(next);
    }
  }

  private settle(
    request: PendingLoad,
    result: PublicationRasterImageLoadResult,
  ): void {
    if (request.settled) {
      return;
    }
    request.settled = true;
    request.callerSignal?.removeEventListener("abort", request.abortFromCaller);
    request.resolve(result);
  }

  private async performLoad(
    request: PendingLoad,
  ): Promise<PublicationRasterImageLoadResult> {
    let bytes: Uint8Array | undefined;
    try {
      bytes = await this.#publication.readResource(request.resource.id, {
        signal: request.controller.signal,
      });
      if (this.#closed || request.controller.signal.aborted) {
        return FIXED_CANCELLED_RESULT;
      }

      const prepared = await this.#sourceManager.prepare(
        bytes,
        request.resource.mediaType,
        { signal: request.controller.signal },
      );
      switch (prepared.status) {
        case "cancelled":
          return FIXED_CANCELLED_RESULT;
        case "rejected":
          if (
            prepared.reason === "capacity-exceeded" ||
            prepared.reason === "decode-busy"
          ) {
            return { status: "deferred", reason: "live" };
          }
          return FIXED_UNAVAILABLE_RESULT;
        case "ready":
          return readyResult(this.trackSource(prepared.source));
      }
      return FIXED_UNAVAILABLE_RESULT;
    } catch {
      return this.#closed || request.controller.signal.aborted
        ? FIXED_CANCELLED_RESULT
        : FIXED_UNAVAILABLE_RESULT;
    } finally {
      bytes?.fill(0);
    }
  }
}
