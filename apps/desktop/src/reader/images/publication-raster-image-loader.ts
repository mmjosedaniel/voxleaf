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
  | Readonly<{ status: "cancelled" | "unavailable" }>;

export interface PublicationRasterImageLoadPort {
  load(
    resourceId: RasterImageResourceId,
    options?: PublicationRasterImageLoadOptions,
  ): Promise<PublicationRasterImageLoadResult>;
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
      return Promise.resolve(FIXED_UNAVAILABLE_RESULT);
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
          return FIXED_UNAVAILABLE_RESULT;
        case "ready":
          return readyResult(prepared.source);
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
