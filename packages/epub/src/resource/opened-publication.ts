import type { BookV1 } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import type { ParsedPackageDocument } from "../package/package-document.js";
import type {
  OpenedPublication,
  PublicationLocatedBlock,
  PublicationLocatorResolution,
  PublicationLocatorResolveOptions,
  PublicationNavigationNode,
  PublicationResourceReadOptions,
  PublicationTargetResolution,
  PublicationTargetResolveOptions,
  RasterImageResource,
  RasterImageResourceId,
  SemanticDocument,
} from "../document/document-model.js";
import type { PublicationLocatorIndex } from "../locator/locator-index.js";
import { resolvePublicationLocator } from "../locator/locator-resolver.js";
import {
  DEFAULT_NARRATION_YIELD_SCHEDULER,
  prepareNarrationSourceWindow,
  type NarrationSourceWindowFailure,
  type NarrationSourceWindowRequest,
  type NarrationSourceWindowResult,
  type NarrationYieldScheduler,
} from "../narration/narration-source-window.js";
import {
  resolvePublicationTarget,
  type PublicationTargetIndex,
} from "../locator/target-resolver.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import { assertRasterImageSignature } from "./raster-image-signature.js";
import {
  createRasterImageResourceCatalog,
  type RasterImageResourceBinding,
} from "./raster-resource-catalog.js";

export interface OpenedPublicationValues {
  readonly book: BookV1;
  readonly documents: readonly SemanticDocument[];
  readonly navigation: readonly PublicationNavigationNode[];
  readonly locatorIndex: PublicationLocatorIndex;
  readonly targetIndex: PublicationTargetIndex;
  readonly narrationYieldScheduler?: NarrationYieldScheduler;
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
  public readonly locators: readonly PublicationLocatedBlock[];
  public readonly navigation: readonly PublicationNavigationNode[];
  public readonly resources: readonly RasterImageResource[];

  readonly #archive: OpenedEpubArchive;
  readonly #bindingsById: ReadonlyMap<string, RasterImageResourceBinding>;
  readonly #locatorIndex: PublicationLocatorIndex;
  readonly #narrationYieldScheduler: NarrationYieldScheduler;
  readonly #targetIndex: PublicationTargetIndex;
  readonly #closeController = new AbortController();
  #activeNarrationPreparation: Promise<void> | undefined;
  #activeRead: Promise<void> | undefined;
  #closePromise: Promise<void> | undefined;
  #closed = false;

  public static prepareNarrationSource(
    publication: OpenedPublicationHandle,
    request: NarrationSourceWindowRequest,
  ): Promise<NarrationSourceWindowResult> {
    return publication.#prepareNarrationSource(request);
  }

  public constructor(
    archive: OpenedEpubArchive,
    values: OpenedPublicationValues,
    bindings: readonly RasterImageResourceBinding[],
  ) {
    this.#archive = archive;
    this.book = values.book;
    this.documents = Object.freeze([...values.documents]);
    this.#locatorIndex = values.locatorIndex;
    this.#narrationYieldScheduler =
      values.narrationYieldScheduler ?? DEFAULT_NARRATION_YIELD_SCHEDULER;
    this.#targetIndex = values.targetIndex;
    this.locators = Object.freeze([...values.locatorIndex.blocks]);
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

  public resolveLocator(
    input: unknown,
    options: PublicationLocatorResolveOptions = {},
  ): PublicationLocatorResolution {
    if (this.#closed) {
      return fail("internal-failure");
    }

    return resolvePublicationLocator(
      this.#locatorIndex,
      input,
      createEpubProcessingBudget({
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      }),
    );
  }

  public resolveTarget(
    input: unknown,
    options: PublicationTargetResolveOptions = {},
  ): PublicationTargetResolution {
    if (this.#closed) {
      return fail("internal-failure");
    }

    return resolvePublicationTarget(
      this.#targetIndex,
      input,
      createEpubProcessingBudget({
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      }),
    );
  }

  async #prepareNarrationSource(
    request: NarrationSourceWindowRequest,
  ): Promise<NarrationSourceWindowResult> {
    if (this.#closed) {
      return narrationFailure("internal-failure");
    }
    if (this.#activeNarrationPreparation !== undefined) {
      return narrationFailure("operation-active");
    }

    const linkedSignal = linkAbortSignals(
      this.#closeController.signal,
      request.signal,
    );
    if (linkedSignal.signal.aborted) {
      linkedSignal.dispose();
      return narrationFailure("cancelled");
    }

    let settleActive: (() => void) | undefined;
    const active = new Promise<void>((resolve) => {
      settleActive = resolve;
    });
    this.#activeNarrationPreparation = active;

    try {
      const result = await prepareNarrationSourceWindow(
        this.#locatorIndex,
        Object.freeze({
          startLocator: request.startLocator,
          signal: linkedSignal.signal,
        }),
        this.#narrationYieldScheduler,
      );
      if (
        (this.#closed || linkedSignal.signal.aborted) &&
        result.status !== "cancelled"
      ) {
        return narrationFailure("cancelled");
      }
      return result;
    } finally {
      linkedSignal.dispose();
      if (this.#activeNarrationPreparation === active) {
        this.#activeNarrationPreparation = undefined;
      }
      settleActive?.();
    }
  }

  public close(): Promise<void> {
    if (this.#closePromise !== undefined) {
      return this.#closePromise;
    }

    this.#closed = true;
    this.#closeController.abort();
    const activeNarrationPreparation = this.#activeNarrationPreparation;
    const activeRead = this.#activeRead;
    this.#closePromise = (async () => {
      await Promise.all([activeNarrationPreparation, activeRead]);
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

function narrationFailure(
  status: NarrationSourceWindowFailure["status"],
): NarrationSourceWindowFailure {
  return Object.freeze({ status });
}

export function createOpenedPublication(
  archive: OpenedEpubArchive,
  packageDocument: ParsedPackageDocument,
  values: OpenedPublicationValues,
): OpenedPublication {
  const bindings = createRasterImageResourceCatalog(archive, packageDocument);
  return new OpenedPublicationHandle(archive, values, bindings);
}

/**
 * Package-internal bridge used until Task 5.1 exposes the closed public
 * narration-preparation contract on `OpenedPublication`.
 */
export function prepareOpenedPublicationNarrationSource(
  publication: OpenedPublication,
  request: NarrationSourceWindowRequest,
): Promise<NarrationSourceWindowResult> {
  if (!(publication instanceof OpenedPublicationHandle)) {
    return Promise.resolve(narrationFailure("internal-failure"));
  }
  return OpenedPublicationHandle.prepareNarrationSource(publication, request);
}
