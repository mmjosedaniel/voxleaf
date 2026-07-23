import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  PublicationLocatedBlock,
  PublicationTargetResolution,
  PublicationTargetUnavailableReason,
} from "../document/document-model.js";
import type { XhtmlDocumentProjection } from "../document/xhtml-projector.js";
import type { EpubProcessingBudget } from "../security/processing-budget.js";
import type {
  LocatedSemanticBlock,
  LocatedSpineItem,
  PublicationLocatorIndex,
} from "./locator-index.js";

interface IndexedSpineTargetDocument {
  readonly kind: "spine";
  readonly firstBlock: LocatedSemanticBlock | undefined;
  findSourceFragment(fragment: string): LocatedSemanticBlock | undefined;
}

interface IndexedNonSpineTargetDocument {
  readonly kind: "non-spine";
}

type IndexedTargetDocument =
  IndexedNonSpineTargetDocument | IndexedSpineTargetDocument;

/** Package-private source-fragment index retained by one open publication. */
export interface PublicationTargetIndex {
  findDocument(documentId: string): IndexedTargetDocument | undefined;
}

interface DecodedTarget {
  readonly documentId: string;
  readonly fragment?: string;
}

class IndexedSpineTargetDocumentHandle implements IndexedSpineTargetDocument {
  public readonly kind = "spine";
  public readonly firstBlock: LocatedSemanticBlock | undefined;

  readonly #locatedBlocksBySourceFragment: ReadonlyMap<
    string,
    LocatedSemanticBlock
  >;

  public constructor(
    blocks: readonly LocatedSemanticBlock[],
    locatedBlocksBySourceFragment: ReadonlyMap<string, LocatedSemanticBlock>,
  ) {
    this.firstBlock = blocks[0];
    this.#locatedBlocksBySourceFragment = new Map(
      locatedBlocksBySourceFragment,
    );
    Object.freeze(this);
  }

  public findSourceFragment(
    fragment: string,
  ): LocatedSemanticBlock | undefined {
    return this.#locatedBlocksBySourceFragment.get(fragment);
  }
}

class PublicationTargetIndexHandle implements PublicationTargetIndex {
  readonly #documentsById: ReadonlyMap<string, IndexedTargetDocument>;

  public constructor(
    documentsById: ReadonlyMap<string, IndexedTargetDocument>,
  ) {
    this.#documentsById = new Map(documentsById);
    Object.freeze(this);
  }

  public findDocument(documentId: string): IndexedTargetDocument | undefined {
    return this.#documentsById.get(documentId);
  }
}

function fail(): never {
  throw new EpubArchiveError("internal-failure");
}

function unavailable(
  reason: PublicationTargetUnavailableReason,
): PublicationTargetResolution {
  return Object.freeze({ status: "unavailable", reason });
}

function exact(
  locatedBlock: PublicationLocatedBlock,
  reason: "document-start" | "fragment",
): PublicationTargetResolution {
  return Object.freeze({
    status: "exact",
    reason,
    locator: locatedBlock.startLocator,
    locatedBlock,
  });
}

function recovered(
  locatedBlock: PublicationLocatedBlock,
): PublicationTargetResolution {
  return Object.freeze({
    status: "recovered",
    reason: "fragment-unresolved",
    locator: locatedBlock.startLocator,
    locatedBlock,
  });
}

function decodeTarget(input: unknown): DecodedTarget | undefined {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return undefined;
  }

  try {
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      return undefined;
    }
    const keys = Reflect.ownKeys(input);
    if (
      keys.length < 1 ||
      keys.length > 2 ||
      keys.some((key) => key !== "documentId" && key !== "fragment")
    ) {
      return undefined;
    }

    const documentId = Object.getOwnPropertyDescriptor(input, "documentId");
    const fragment = Object.getOwnPropertyDescriptor(input, "fragment");
    if (
      documentId === undefined ||
      !("value" in documentId) ||
      !documentId.enumerable ||
      typeof documentId.value !== "string" ||
      (fragment !== undefined &&
        (!("value" in fragment) ||
          !fragment.enumerable ||
          typeof fragment.value !== "string"))
    ) {
      return undefined;
    }

    return Object.freeze({
      documentId: documentId.value,
      ...(fragment === undefined ? {} : { fragment: fragment.value }),
    });
  } catch {
    // Proxies and accessors are untrusted target shapes, not public failures.
    return undefined;
  }
}

function findLocatedSpine(
  index: PublicationLocatorIndex,
  projection: XhtmlDocumentProjection,
): LocatedSpineItem {
  const location = projection.document.location;
  if (location.kind !== "spine") {
    return fail();
  }

  const spine = index.spines[location.spineItemIndex];
  if (
    spine === undefined ||
    spine.spineItemId !== location.spineItemId ||
    spine.spineItemIndex !== location.spineItemIndex
  ) {
    return fail();
  }
  return spine;
}

function indexSpineDocument(
  projection: XhtmlDocumentProjection,
  spine: LocatedSpineItem,
  budget: EpubProcessingBudget,
): IndexedSpineTargetDocument {
  if (projection.addressableBlocks.length !== spine.blocks.length) {
    return fail();
  }

  const locatedBlocksBySourceFragment = new Map<string, LocatedSemanticBlock>();
  for (const [
    blockIndex,
    projected,
  ] of projection.addressableBlocks.entries()) {
    budget.checkpoint();
    const located = spine.blocks[blockIndex];
    if (
      located === undefined ||
      located.documentId !== projection.document.id ||
      located.block !== projected.block
    ) {
      return fail();
    }

    const sourceFragment = projected.sourceElementId;
    if (sourceFragment !== undefined) {
      if (locatedBlocksBySourceFragment.has(sourceFragment)) {
        return fail();
      }
      locatedBlocksBySourceFragment.set(sourceFragment, located);
    }
  }

  return new IndexedSpineTargetDocumentHandle(
    spine.blocks,
    locatedBlocksBySourceFragment,
  );
}

/**
 * Joins private XHTML source IDs to canonical located blocks without exposing
 * publisher fragments through the public semantic or locator models.
 */
export function createPublicationTargetIndex(
  projections: readonly XhtmlDocumentProjection[],
  locatorIndex: PublicationLocatorIndex,
  budget: EpubProcessingBudget,
): PublicationTargetIndex {
  const documentsById = new Map<string, IndexedTargetDocument>();

  for (const projection of projections) {
    budget.checkpoint();
    const documentId = String(projection.document.id);
    if (documentsById.has(documentId)) {
      return fail();
    }

    const indexed =
      projection.document.location.kind === "non-spine"
        ? Object.freeze({ kind: "non-spine" as const })
        : indexSpineDocument(
            projection,
            findLocatedSpine(locatorIndex, projection),
            budget,
          );
    documentsById.set(documentId, indexed);
  }

  return new PublicationTargetIndexHandle(documentsById);
}

/**
 * Resolves one untrusted semantic target without searching prose, paths,
 * rendered state, or another document for recovery.
 */
export function resolvePublicationTarget(
  index: PublicationTargetIndex,
  input: unknown,
  budget: EpubProcessingBudget,
): PublicationTargetResolution {
  budget.checkpoint();
  const target = decodeTarget(input);
  if (target === undefined) {
    return unavailable("invalid-target");
  }

  const document = index.findDocument(target.documentId);
  budget.checkpoint();
  if (document === undefined) {
    return unavailable("unknown-document");
  }
  if (document.kind === "non-spine") {
    return unavailable("non-spine-document");
  }

  const firstBlock = document.firstBlock;
  if (firstBlock === undefined) {
    return unavailable("empty-document");
  }
  if (target.fragment === undefined) {
    return exact(firstBlock, "document-start");
  }

  const fragmentBlock = document.findSourceFragment(target.fragment);
  budget.checkpoint();
  return fragmentBlock === undefined
    ? recovered(firstBlock)
    : exact(fragmentBlock, "fragment");
}
