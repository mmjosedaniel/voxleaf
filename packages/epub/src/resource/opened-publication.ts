import type { BookV1 } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import type { ParsedPackageDocument } from "../package/package-document.js";
import type {
  OpenedPublication,
  PublicationNavigationNode,
  PublicationResourceReadOptions,
  RasterImageResource,
  RasterImageResourceId,
  SemanticDocument,
} from "../document/document-model.js";
import { assertRasterImageSignature } from "./raster-image-signature.js";
import {
  createRasterImageResourceCatalog,
  type RasterImageResourceBinding,
} from "./raster-resource-catalog.js";

export interface OpenedPublicationValues {
  readonly book: BookV1;
  readonly documents: readonly SemanticDocument[];
  readonly navigation: readonly PublicationNavigationNode[];
}

interface LinkedAbortSignal {
  readonly signal: AbortSignal;
  dispose(): void;
}

function fail(
  code: "broken-reference" | "cancelled" | "internal-failure",
): never {
  throw new EpubArchiveError(code);
}

function linkAbortSignals(
  publicationSignal: AbortSignal,
  callerSignal?: AbortSignal,
): LinkedAbortSignal {
  if (callerSignal === undefined) {
    return Object.freeze({
      signal: publicationSignal,
      dispose: () => undefined,
    });
  }

  const controller = new AbortController();
  const abort = () => controller.abort();
  publicationSignal.addEventListener("abort", abort, { once: true });
  callerSignal.addEventListener("abort", abort, { once: true });
  if (publicationSignal.aborted || callerSignal.aborted) {
    controller.abort();
  }

  return Object.freeze({
    signal: controller.signal,
    dispose: () => {
      publicationSignal.removeEventListener("abort", abort);
      callerSignal.removeEventListener("abort", abort);
    },
  });
}

function mapUnexpectedCloseError(error: unknown): never {
  if (error instanceof EpubArchiveError) {
    throw error;
  }

  return fail("internal-failure");
}

class OpenedPublicationHandle implements OpenedPublication {
  public readonly book: BookV1;
  public readonly documents: readonly SemanticDocument[];
  public readonly navigation: readonly PublicationNavigationNode[];
  public readonly resources: readonly RasterImageResource[];

  readonly #archive: OpenedEpubArchive;
  readonly #bindingsById: ReadonlyMap<string, RasterImageResourceBinding>;
  readonly #closeController = new AbortController();
  #activeRead: Promise<void> | undefined;
  #closePromise: Promise<void> | undefined;
  #closed = false;

  public constructor(
    archive: OpenedEpubArchive,
    values: OpenedPublicationValues,
    bindings: readonly RasterImageResourceBinding[],
  ) {
    this.#archive = archive;
    this.book = values.book;
    this.documents = Object.freeze([...values.documents]);
    this.navigation = Object.freeze([...values.navigation]);
    this.resources = Object.freeze(
      bindings.map(({ descriptor }) => descriptor),
    );
    this.#bindingsById = new Map(
      bindings.map((binding) => [String(binding.descriptor.id), binding]),
    );
    Object.freeze(this);
  }

  public get closed(): boolean {
    return this.#closed;
  }

  public async readResource(
    resourceId: RasterImageResourceId,
    options: PublicationResourceReadOptions = {},
  ): Promise<Uint8Array> {
    if (this.#closed || this.#activeRead !== undefined) {
      return fail("internal-failure");
    }

    const binding = this.#bindingsById.get(String(resourceId));
    if (binding === undefined) {
      return fail("broken-reference");
    }

    const linkedSignal = linkAbortSignals(
      this.#closeController.signal,
      options.signal,
    );
    if (linkedSignal.signal.aborted) {
      linkedSignal.dispose();
      return fail("cancelled");
    }

    const read = this.readBoundResource(binding, linkedSignal.signal);
    this.#activeRead = read.then(
      () => undefined,
      () => undefined,
    );

    try {
      return await read;
    } finally {
      linkedSignal.dispose();
      this.#activeRead = undefined;
    }
  }

  public close(): Promise<void> {
    if (this.#closePromise !== undefined) {
      return this.#closePromise;
    }

    this.#closed = true;
    this.#closeController.abort();
    const activeRead = this.#activeRead;
    this.#closePromise = (async () => {
      await activeRead;
      try {
        await this.#archive.close();
      } catch (error: unknown) {
        return mapUnexpectedCloseError(error);
      }
    })();
    return this.#closePromise;
  }

  private async readBoundResource(
    binding: RasterImageResourceBinding,
    signal: AbortSignal,
  ): Promise<Uint8Array> {
    const bytes = await this.#archive.readEntry(binding.path, {
      maximumBytes: this.#archive.budget.policy.maxRasterImageBytes,
      signal,
    });
    if (signal.aborted) {
      return fail("cancelled");
    }

    assertRasterImageSignature(bytes, binding.descriptor.mediaType);
    return bytes;
  }
}

export function createOpenedPublication(
  archive: OpenedEpubArchive,
  packageDocument: ParsedPackageDocument,
  values: OpenedPublicationValues,
): OpenedPublication {
  const bindings = createRasterImageResourceCatalog(archive, packageDocument);
  return new OpenedPublicationHandle(archive, values, bindings);
}
