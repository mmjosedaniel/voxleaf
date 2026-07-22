import type {
  BookV1,
  Index,
  ReadingLocatorV1,
  SpineItemId,
} from "@voxleaf/shared";

declare const contentDocumentIdBrand: unique symbol;
declare const rasterImageResourceIdBrand: unique symbol;
declare const sensitivePublicationTextBrand: unique symbol;
declare const sourceFragmentBrand: unique symbol;

/** Opaque identity for one supported XHTML content document. */
export type ContentDocumentId = string & {
  readonly [contentDocumentIdBrand]: "ContentDocumentId";
};

/** Opaque identity for one validated local raster image. */
export type RasterImageResourceId = string & {
  readonly [rasterImageResourceIdBrand]: "RasterImageResourceId";
};

/**
 * Sensitive in-memory publication text. Never place this value in logs,
 * metrics, errors, persistence, or debug snapshots.
 */
export type SensitivePublicationText = string & {
  readonly [sensitivePublicationTextBrand]: "SensitivePublicationText";
};

/**
 * Publisher-controlled fragment retained only for later structural matching.
 * It is not trusted markup or a renderer DOM identifier.
 */
export type SourceFragment = string & {
  readonly [sourceFragmentBrand]: "SourceFragment";
};

export type SemanticTextDirection = "auto" | "ltr" | "rtl";

export interface SemanticTextContext {
  readonly language?: string;
  readonly direction?: SemanticTextDirection;
}

export interface SemanticTextInline extends SemanticTextContext {
  readonly kind: "text";
  readonly text: SensitivePublicationText;
}

export interface SemanticEmphasisInline extends SemanticTextContext {
  readonly kind: "emphasis";
  readonly children: readonly SemanticInline[];
}

export interface SemanticStrongInline extends SemanticTextContext {
  readonly kind: "strong";
  readonly children: readonly SemanticInline[];
}

export interface SemanticCodeInline extends SemanticTextContext {
  readonly kind: "code";
  readonly children: readonly SemanticInline[];
}

export interface SemanticLineBreakInline {
  readonly kind: "line-break";
}

export interface SemanticInternalLinkInline extends SemanticTextContext {
  readonly kind: "internal-link";
  readonly target: SemanticDocumentTarget;
  readonly children: readonly SemanticInline[];
}

export interface SemanticRasterImageInline extends SemanticTextContext {
  readonly kind: "raster-image";
  readonly resourceId: RasterImageResourceId;
  readonly alternativeText?: SensitivePublicationText;
}

/** Closed allowlist of inert inline values. */
export type SemanticInline =
  | SemanticCodeInline
  | SemanticEmphasisInline
  | SemanticInternalLinkInline
  | SemanticLineBreakInline
  | SemanticRasterImageInline
  | SemanticStrongInline
  | SemanticTextInline;

export interface SemanticHeadingBlock extends SemanticTextContext {
  readonly kind: "heading";
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
  readonly children: readonly SemanticInline[];
}

export interface SemanticParagraphBlock extends SemanticTextContext {
  readonly kind: "paragraph";
  readonly children: readonly SemanticInline[];
}

export interface SemanticBlockQuoteBlock extends SemanticTextContext {
  readonly kind: "block-quote";
  readonly children: readonly SemanticBlock[];
}

export interface SemanticListItem {
  readonly children: readonly SemanticBlock[];
}

export interface SemanticListBlock extends SemanticTextContext {
  readonly kind: "list";
  readonly ordered: boolean;
  readonly items: readonly SemanticListItem[];
}

/** Closed allowlist of semantic block values. */
export type SemanticBlock =
  | SemanticBlockQuoteBlock
  | SemanticHeadingBlock
  | SemanticListBlock
  | SemanticParagraphBlock;

export interface SpineDocumentLocation {
  readonly kind: "spine";
  readonly spineItemId: SpineItemId;
  readonly spineItemIndex: Index;
}

export interface NonSpineDocumentLocation {
  readonly kind: "non-spine";
}

export type SemanticDocumentLocation =
  NonSpineDocumentLocation | SpineDocumentLocation;

/** Immutable semantic projection of one supported XHTML document. */
export interface SemanticDocument extends SemanticTextContext {
  readonly id: ContentDocumentId;
  readonly location: SemanticDocumentLocation;
  readonly blocks: readonly SemanticBlock[];
}

export interface SemanticDocumentTarget {
  readonly documentId: ContentDocumentId;
  readonly fragment?: SourceFragment;
}

export interface PublicationNavigationLink {
  readonly kind: "link";
  readonly label: SensitivePublicationText;
  readonly target: SemanticDocumentTarget;
  readonly children: readonly PublicationNavigationNode[];
}

export interface PublicationNavigationGroup {
  readonly kind: "group";
  readonly label: SensitivePublicationText;
  readonly children: readonly [
    PublicationNavigationNode,
    ...PublicationNavigationNode[],
  ];
}

/** Ordered detailed navigation. Group nodes always contain at least one child. */
export type PublicationNavigationNode =
  PublicationNavigationGroup | PublicationNavigationLink;

export type RasterImageMediaType =
  "image/gif" | "image/jpeg" | "image/png" | "image/webp";

/** Descriptor for bytes that may be read only through an open publication. */
export interface RasterImageResource {
  readonly id: RasterImageResourceId;
  readonly kind: "raster-image";
  readonly mediaType: RasterImageMediaType;
}

export interface PublicationResourceReadOptions {
  readonly signal?: AbortSignal;
}

export interface PublicationLocatorResolveOptions {
  readonly signal?: AbortSignal;
}

/** One semantic block and its deterministic structural start locator. */
export interface PublicationLocatedBlock {
  readonly documentId: ContentDocumentId;
  readonly block: SemanticBlock;
  readonly startLocator: ReadingLocatorV1;
  readonly textLengthCodePoints: Index;
}

export type PublicationLocatorRecoveryReason =
  "book-start" | "nearest-anchor" | "nearest-offset" | "nearest-spine";

export interface ExactPublicationLocatorResolution {
  readonly status: "exact";
  readonly reason: "exact";
  readonly locator: ReadingLocatorV1;
  readonly locatedBlock: PublicationLocatedBlock;
}

export interface RecoveredPublicationLocatorResolution {
  readonly status: "recovered";
  readonly reason: PublicationLocatorRecoveryReason;
  readonly locator: ReadingLocatorV1;
  readonly locatedBlock: PublicationLocatedBlock;
}

export type PublicationLocatorResolution =
  ExactPublicationLocatorResolution | RecoveredPublicationLocatorResolution;

/**
 * Framework-independent handle for one opened publication.
 *
 * All value properties and nested collections are immutable. The handle owns
 * the only mutable lifecycle state. `close` is idempotent; after it resolves,
 * `closed` is true and resource reads must fail with the package's fixed safe
 * error boundary. Returned bytes are caller-owned copies and remain sensitive.
 */
export interface OpenedPublication {
  readonly book: BookV1;
  readonly documents: readonly SemanticDocument[];
  readonly locators: readonly PublicationLocatedBlock[];
  readonly navigation: readonly PublicationNavigationNode[];
  readonly resources: readonly RasterImageResource[];
  readonly closed: boolean;
  readResource(
    resourceId: RasterImageResourceId,
    options?: PublicationResourceReadOptions,
  ): Promise<Uint8Array>;
  resolveLocator(
    input: unknown,
    options?: PublicationLocatorResolveOptions,
  ): PublicationLocatorResolution;
  close(): Promise<void>;
}
