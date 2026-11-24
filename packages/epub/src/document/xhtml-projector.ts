import { createContentReferenceResolver } from "../package/package-document.js";
import { createIndex, createSpineItemId } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import type {
  PackageManifestItem,
  PackageSpineItem,
  ParsedPackageDocument,
} from "../package/package-document.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import {
  parseOcfReference,
  resolveOcfReference,
} from "../paths/ocf-reference.js";
import { EpubPathError } from "../paths/path-error.js";
import { rasterImageResourceIdForManifestItem } from "../resource/raster-resource-catalog.js";
import {
  createXmlEventReader,
  decodedUtf8ByteLength,
} from "../xml/xml-event-reader.js";
import type {
  XmlEndElementEvent,
  XmlEvent,
  XmlExpandedName,
  XmlStartElementEvent,
} from "../xml/xml-event-reader.js";
import type {
  ContentDocumentId,
  RasterImageResourceId,
  SemanticBlock,
  SemanticDocument,
  SemanticDocumentLocation,
  SemanticDocumentTarget,
  SemanticInline,
  SemanticListItem,
  SemanticTextContext,
  SemanticTextDirection,
  SensitivePublicationText,
  SourceFragment,
} from "./document-model.js";

const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XHTML_MEDIA_TYPE = "application/xhtml+xml";
const ACTIVE_RESOURCE_PROPERTIES = new Set(["remote-resources", "scripted"]);
const NORMAL_WHITESPACE = /[\t\n\f\r ]+/gu;
const NON_WHITESPACE = /[^\t\n\f\r ]/u;
const BLOCK_BOUNDARY_ELEMENTS = new Set([
  "address",
  "article",
  "aside",
  "details",
  "dialog",
  "div",
  "dl",
  "dt",
  "dd",
  "figcaption",
  "figure",
  "footer",
  "header",
  "main",
  "nav",
  "pre",
  "section",
  "summary",
  "table",
  "tr",
  "td",
  "th",
]);
const OMITTED_XHTML_ELEMENTS = new Set([
  "audio",
  "button",
  "canvas",
  "embed",
  "form",
  "iframe",
  "input",
  "object",
  "script",
  "select",
  "source",
  "style",
  "template",
  "textarea",
  "track",
  "video",
]);

interface TextContext {
  readonly language?: string;
  readonly direction?: SemanticTextDirection;
  readonly autoDirectionScope?: number;
}

interface RawTextInline extends TextContext {
  readonly kind: "text";
  readonly text: string;
}

interface RawContainerInline extends TextContext {
  readonly kind: "code" | "direction-span" | "emphasis" | "strong";
  readonly children: RawInline[];
}

interface RawLinkInline extends TextContext {
  readonly kind: "internal-link";
  readonly target: SemanticDocumentTarget;
  readonly children: RawInline[];
}

interface RawLineBreakInline {
  readonly kind: "line-break";
  readonly language?: string;
}

interface RawImageInline extends TextContext {
  readonly kind: "raster-image";
  readonly resourceId: RasterImageResourceId;
  readonly alternativeText?: string;
}

type RawInline =
  | RawContainerInline
  | RawImageInline
  | RawLineBreakInline
  | RawLinkInline
  | RawTextInline;

interface BlockCollector {
  readonly kind: "blocks";
  readonly context: TextContext;
  readonly blocks: SemanticBlock[];
  readonly pendingInlines: RawInline[];
  pendingSourceElementId: BlockElementIds | undefined;
  pendingParagraphLanguage?: TextContext["language"];
  pendingParagraphDirection?: TextContext["direction"];
  pendingParagraphAutoDirectionScope?: number;
  activeDirectionFrames?: ElementFrame[];
  pendingDirectionRuns?: Map<ElementFrame, RawContainerInline>;
}

interface InlineCollector {
  readonly kind: "inlines";
  readonly context: TextContext;
  readonly inlines: RawInline[];
}

interface ListCollector {
  readonly kind: "list";
  readonly context: TextContext;
  readonly ordered: boolean;
  readonly start?: number;
  nextOrdinal: number;
  nextRenderedOrdinal: number;
  readonly items: SemanticListItem[];
}

type SemanticDestination = BlockCollector | InlineCollector | ListCollector;

type CloseAction =
  | { readonly kind: "block-boundary" }
  | {
      readonly collector: BlockCollector;
      readonly kind: "block-quote";
      readonly sourceElementId?: BlockElementIds;
    }
  | { readonly collector: BlockCollector; readonly kind: "body" }
  | {
      readonly collector: InlineCollector;
      readonly kind: "heading";
      readonly level: 1 | 2 | 3 | 4 | 5 | 6;
      readonly sourceElementId?: BlockElementIds;
    }
  | {
      readonly collector: InlineCollector;
      readonly kind: "inline";
      readonly inlineKind: RawContainerInline["kind"] | "internal-link";
      readonly target?: SemanticDocumentTarget;
    }
  | {
      readonly collector: ListCollector;
      readonly kind: "list";
      readonly sourceElementId?: BlockElementIds;
    }
  | {
      readonly collector: BlockCollector;
      readonly kind: "list-item";
      readonly value?: number;
    }
  | {
      readonly collector: InlineCollector;
      readonly kind: "paragraph";
      readonly sourceElementId?: BlockElementIds;
    };

interface ElementFrame {
  readonly name: XmlExpandedName;
  readonly context: TextContext;
  readonly omitted: boolean;
  closeAction?: CloseAction;
  readonly paragraphSourceBoundary?: boolean;
  readonly paragraphSourceElementId?: BlockElementIds;
  directionRunOwner?: BlockCollector;
  readonly linkOwnsDirection?: boolean;
  inertBlockLink?: true;
}

export interface ProjectedAddressableBlock {
  readonly block: SemanticBlock;
  readonly sourceElementId?: string;
  /** Override the fragment ID for durable locators. Null uses a generated ID. */
  readonly locatorElementId?: string | null;
}

export interface XhtmlDocumentProjection {
  readonly document: SemanticDocument;
  readonly addressableBlocks: readonly ProjectedAddressableBlock[];
}

interface WhitespaceState {
  emittedContent: boolean;
  pendingSpace: boolean;
}

function fail(code: EpubArchiveErrorCode): never {
  throw new EpubArchiveError(code);
}

function contextProperties(context: TextContext): SemanticTextContext {
  return {
    ...(context.language === undefined ? {} : { language: context.language }),
    ...(context.direction === undefined
      ? {}
      : { direction: context.direction }),
    ...(context.autoDirectionScope === undefined
      ? {}
      : { autoDirectionScope: context.autoDirectionScope }),
  };
}

function attribute(
  event: XmlStartElementEvent,
  namespaceUri: string,
  localName: string,
): string | undefined {
  return event.attributes.find(
    (candidate) =>
      candidate.namespaceUri === namespaceUri &&
      candidate.localName === localName,
  )?.value;
}

interface SourceElementIdentity {
  readonly candidate?: string;
  readonly observed: readonly string[];
}

interface BlockElementIds {
  readonly fragment?: string;
  readonly locator?: string;
}

function sourceElementIdentity(
  xhtmlId: string | undefined,
  xmlId: string | undefined,
): SourceElementIdentity {
  const observed = Object.freeze(
    xhtmlId === undefined
      ? xmlId === undefined
        ? []
        : [xmlId]
      : xmlId === undefined || xmlId === xhtmlId
        ? [xhtmlId]
        : [xhtmlId, xmlId],
  );
  const candidate =
    xhtmlId !== undefined && xmlId !== undefined && xhtmlId !== xmlId
      ? undefined
      : (xhtmlId ?? xmlId);
  return Object.freeze({
    observed,
    ...(candidate === undefined ? {} : { candidate }),
  });
}

function countId(counts: Map<string, number>, id: string | undefined): void {
  if (id !== undefined) counts.set(id, (counts.get(id) ?? 0) + 1);
}

function uniqueId(
  id: string | undefined,
  elementCounts: ReadonlyMap<string, number>,
  blockCounts: ReadonlyMap<string, number>,
): string | undefined {
  return id !== undefined &&
    elementCounts.get(id) === 1 &&
    blockCounts.get(id) === 1
    ? id
    : undefined;
}

function collectAddressableBlocks(
  blocks: readonly SemanticBlock[],
  output: SemanticBlock[],
): void {
  for (const block of blocks) {
    output.push(block);
    if (block.kind === "block-quote") {
      collectAddressableBlocks(block.children, output);
    } else if (block.kind === "list") {
      for (const item of block.items) {
        collectAddressableBlocks(item.children, output);
      }
    }
  }
}

function collectAutoTextScopes(
  inlines: readonly SemanticInline[],
  scopes: Set<number>,
): void {
  for (const inline of inlines) {
    if (inline.kind === "text" && inline.autoDirectionScope !== undefined) {
      scopes.add(inline.autoDirectionScope);
    } else if ("children" in inline) {
      collectAutoTextScopes(inline.children, scopes);
    }
  }
}

function hasUnqualifiedAttribute(
  event: XmlStartElementEvent,
  localName: string,
): boolean {
  return event.attributes.some(
    (candidate) =>
      candidate.namespaceUri === "" && candidate.localName === localName,
  );
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit <= 0x1f || codeUnit === 0x7f) {
      return true;
    }
  }
  return false;
}

function deriveContext(
  event: XmlStartElementEvent,
  inherited: TextContext,
  declaredDirection: SemanticTextDirection | undefined,
  autoDirectionScope: number | undefined,
): TextContext {
  const xmlLanguage = attribute(event, XML_NAMESPACE, "lang");
  const htmlLanguage = attribute(event, "", "lang");
  if (
    xmlLanguage !== undefined &&
    htmlLanguage !== undefined &&
    xmlLanguage.replace(/[A-Z]/gu, (letter) => letter.toLowerCase()) !==
      htmlLanguage.replace(/[A-Z]/gu, (letter) => letter.toLowerCase())
  ) {
    return fail("malformed-package");
  }

  const language = xmlLanguage ?? htmlLanguage;
  if (
    language !== undefined &&
    (/\s/u.test(language) || hasControlCharacter(language))
  ) {
    return fail("malformed-package");
  }

  const direction = declaredDirection ?? inherited.direction;

  return Object.freeze({
    ...(language === undefined
      ? inherited.language === undefined
        ? {}
        : { language: inherited.language }
      : { language }),
    ...(direction === undefined ? {} : { direction }),
    ...(autoDirectionScope === undefined ? {} : { autoDirectionScope }),
  });
}

function readDeclaredDirection(
  event: XmlStartElementEvent,
): SemanticTextDirection | undefined {
  const direction = attribute(event, "", "dir")?.toLowerCase();
  if (
    direction === undefined ||
    direction === "auto" ||
    direction === "ltr" ||
    direction === "rtl"
  ) {
    return direction;
  }
  return fail("malformed-package");
}

function isExplicitlyHidden(event: XmlStartElementEvent): boolean {
  return (
    hasUnqualifiedAttribute(event, "hidden") ||
    attribute(event, "", "aria-hidden")?.trim().toLowerCase() === "true"
  );
}

export function isSupportedContentDocument(item: PackageManifestItem): boolean {
  return (
    item.location.kind === "local" &&
    item.kind === "content-document" &&
    item.mediaType === XHTML_MEDIA_TYPE &&
    !item.properties.some((property) =>
      ACTIVE_RESOURCE_PROPERTIES.has(property),
    )
  );
}

export function contentDocumentIdForManifestIndex(
  index: number,
): ContentDocumentId {
  return `document:${String(index)}` as ContentDocumentId;
}

function normalizeAlternativeText(value: string): string {
  return value.replace(NORMAL_WHITESPACE, " ").trim();
}

function appendTextNode(
  output: SemanticInline[],
  text: string,
  context: TextContext,
): void {
  if (text.length === 0) {
    return;
  }

  output.push(
    Object.freeze({
      kind: "text",
      text: text as SensitivePublicationText,
      ...contextProperties(context),
    }),
  );
}

function convertNormalText(
  value: string,
  context: TextContext,
  output: SemanticInline[],
  state: WhitespaceState,
): void {
  const normalized = value
    .replace(NORMAL_WHITESPACE, " ")
    .replace(/^ | $/gu, "");
  const beginsWithWhitespace = /^[\t\n\f\r ]/u.test(value);
  const endsWithWhitespace = /[\t\n\f\r ]$/u.test(value);

  if (beginsWithWhitespace && state.emittedContent) {
    state.pendingSpace = true;
  }

  if (normalized.length > 0) {
    const prefix = state.pendingSpace && state.emittedContent ? " " : "";
    appendTextNode(output, `${prefix}${normalized}`, context);
    state.emittedContent = true;
    state.pendingSpace = endsWithWhitespace;
  }
}

function listOrdinal(value: string | undefined): number | undefined {
  if (value === undefined || !/^[+-]?\d+$/u.test(value.trim()))
    return undefined;
  const ordinal = Number(value.trim());
  return Number.isInteger(ordinal) &&
    ordinal >= -2_147_483_648 &&
    ordinal <= 2_147_483_647
    ? ordinal
    : undefined;
}

function freezeRawInlines(
  rawInlines: readonly RawInline[],
  state: WhitespaceState = { emittedContent: false, pendingSpace: false },
): readonly SemanticInline[] {
  const output: SemanticInline[] = [];

  for (const rawInline of rawInlines) {
    switch (rawInline.kind) {
      case "text":
        convertNormalText(rawInline.text, rawInline, output, state);
        break;
      case "line-break":
        state.pendingSpace = false;
        state.emittedContent = false;
        output.push(rawInline);
        break;
      case "raster-image": {
        if (state.pendingSpace && state.emittedContent) {
          appendTextNode(output, " ", rawInline);
        }
        state.pendingSpace = false;
        state.emittedContent = true;
        output.push(
          Object.freeze({
            kind: "raster-image",
            resourceId: rawInline.resourceId,
            ...(rawInline.alternativeText === undefined
              ? {}
              : {
                  alternativeText:
                    rawInline.alternativeText as SensitivePublicationText,
                }),
            ...contextProperties(rawInline),
          }),
        );
        break;
      }
      case "code": {
        const children = freezeCodeInlines(rawInline.children);
        if (children.length > 0) {
          const firstCharacter = inlineBoundaryCharacter(children, true);
          const lastCharacter = inlineBoundaryCharacter(children, false);
          if (
            state.pendingSpace &&
            state.emittedContent &&
            (firstCharacter === undefined ||
              !/[\t\n\f\r ]/u.test(firstCharacter))
          ) {
            appendTextNode(output, " ", rawInline);
          }
          output.push(
            Object.freeze({
              kind: "code",
              children,
              ...contextProperties(rawInline),
            }),
          );
          state.emittedContent =
            lastCharacter === undefined || !/[\t\n\f\r ]/u.test(lastCharacter);
          state.pendingSpace = false;
        }
        break;
      }
      case "direction-span":
      case "emphasis":
      case "strong":
      case "internal-link": {
        const children = freezeRawInlines(rawInline.children, state);
        if (children.length > 0) {
          output.push(
            rawInline.kind === "internal-link"
              ? Object.freeze({
                  kind: rawInline.kind,
                  target: rawInline.target,
                  children,
                  ...contextProperties(rawInline),
                })
              : Object.freeze({
                  kind: rawInline.kind,
                  children,
                  ...contextProperties(rawInline),
                }),
          );
        }
        break;
      }
    }
  }

  return Object.freeze(output);
}

function inlineBoundaryCharacter(
  inlines: readonly SemanticInline[],
  first: boolean,
): string | undefined {
  const ordered = first ? inlines : [...inlines].reverse();
  for (const inline of ordered) {
    switch (inline.kind) {
      case "text":
        return first ? inline.text[0] : inline.text.at(-1);
      case "line-break":
        return "\n";
      case "raster-image":
        return "\ufffc";
      case "code":
      case "direction-span":
      case "emphasis":
      case "internal-link":
      case "strong": {
        const character = inlineBoundaryCharacter(inline.children, first);
        if (character !== undefined) {
          return character;
        }
      }
    }
  }
  return undefined;
}

function freezeCodeInlines(
  rawInlines: readonly RawInline[],
): readonly SemanticInline[] {
  const output: SemanticInline[] = [];
  for (const rawInline of rawInlines) {
    if (rawInline.kind === "text") {
      appendTextNode(output, rawInline.text, rawInline);
    } else if (rawInline.kind === "line-break") {
      output.push(rawInline);
    } else if (rawInline.kind === "raster-image") {
      output.push(
        Object.freeze({
          kind: "raster-image",
          resourceId: rawInline.resourceId,
          ...(rawInline.alternativeText === undefined
            ? {}
            : {
                alternativeText:
                  rawInline.alternativeText as SensitivePublicationText,
              }),
          ...contextProperties(rawInline),
        }),
      );
    } else {
      const children = freezeCodeInlines(rawInline.children);
      if (children.length > 0) {
        output.push(
          rawInline.kind === "internal-link"
            ? Object.freeze({
                kind: rawInline.kind,
                target: rawInline.target,
                children,
                ...contextProperties(rawInline),
              })
            : Object.freeze({
                kind: rawInline.kind,
                children,
                ...contextProperties(rawInline),
              }),
        );
      }
    }
  }
  return Object.freeze(output);
}

interface XhtmlPublicationLookup {
  readonly resolveContent: ReturnType<typeof createContentReferenceResolver>;
  readonly documentsBySpineIndex: ReadonlyMap<number, ContentDocumentId>;
  readonly documentsByPath: ReadonlyMap<string, ContentDocumentId>;
  readonly resourcesByPath: ReadonlyMap<string, RasterImageResourceId>;
  readonly spineByPath: ReadonlyMap<string, readonly PackageSpineItem[]>;
}

/** Package-internal immutable lookup data shared only during one public open. */
export function createXhtmlPublicationLookup(
  archive: OpenedEpubArchive,
  packageDocument: ParsedPackageDocument,
): XhtmlPublicationLookup {
  const documentsByPath = new Map<string, ContentDocumentId>();
  const documentsBySpineIndex = new Map<number, ContentDocumentId>();
  const resourcesByPath = new Map<string, RasterImageResourceId>();
  const spineByPath = new Map<string, PackageSpineItem[]>();
  const resolveContent = createContentReferenceResolver(
    archive,
    packageDocument,
  );
  for (const [index, item] of packageDocument.manifest.entries()) {
    archive.budget.checkpoint();
    if (isSupportedContentDocument(item) && item.location.kind === "local") {
      documentsByPath.set(
        String(item.location.path),
        contentDocumentIdForManifestIndex(index),
      );
    } else {
      const id = rasterImageResourceIdForManifestItem(item, index);
      if (id !== undefined && item.location.kind === "local")
        resourcesByPath.set(String(item.location.path), id);
    }
  }
  for (const item of packageDocument.spine) {
    archive.budget.checkpoint();
    const path = String(item.path);
    const baseId = documentsByPath.get(path);
    if (baseId === undefined) return fail("internal-failure");
    const occurrences = spineByPath.get(path) ?? [];
    documentsBySpineIndex.set(
      item.index,
      occurrences.length === 0
        ? baseId
        : (`${baseId}:spine:${String(item.index)}` as ContentDocumentId),
    );
    occurrences.push(item);
    spineByPath.set(path, occurrences);
  }
  for (const occurrences of spineByPath.values()) Object.freeze(occurrences);
  return Object.freeze({
    resolveContent,
    documentsByPath,
    documentsBySpineIndex,
    resourcesByPath,
    spineByPath,
  });
}

class XhtmlProjector {
  readonly #archive: OpenedEpubArchive;
  readonly #path: ArchiveFilePath;
  readonly #resolveContent: ReturnType<typeof createContentReferenceResolver>;
  readonly #documentsBySpineIndex: ReadonlyMap<number, ContentDocumentId>;
  readonly #documentsByPath: ReadonlyMap<string, ContentDocumentId>;
  readonly #resourcesByPath: ReadonlyMap<string, RasterImageResourceId>;
  readonly #elements: ElementFrame[] = [];
  readonly #destinations: SemanticDestination[] = [];
  readonly #sourceElementIdCounts = new Map<string, number>();
  readonly #locatorElementIdCounts = new Map<string, number>();
  readonly #sourceElementIdsByBlock = new Map<SemanticBlock, BlockElementIds>();
  #documentId: ContentDocumentId | undefined;
  #documentContext: TextContext = Object.freeze({});
  #documentLocation: SemanticDocumentLocation | undefined;
  #blocks: readonly SemanticBlock[] | undefined;
  #sawRoot = false;
  #sawBody = false;
  #closedBody = false;
  #autoDirectionScopeCount = 0;

  public constructor(
    archive: OpenedEpubArchive,
    packageDocument: ParsedPackageDocument,
    path: ArchiveFilePath,
    spineItemIndex?: number,
    lookup = createXhtmlPublicationLookup(archive, packageDocument),
  ) {
    this.#archive = archive;
    this.#path = path;
    this.#resolveContent = lookup.resolveContent;
    this.#documentsByPath = lookup.documentsByPath;
    this.#documentsBySpineIndex = lookup.documentsBySpineIndex;
    this.#resourcesByPath = lookup.resourcesByPath;
    this.#documentId = lookup.documentsByPath.get(String(path));

    if (this.#documentId === undefined) {
      return fail("unsupported-resource");
    }

    const firstSpineItem = lookup.spineByPath.get(String(path))?.[0];
    const spineItem =
      spineItemIndex === undefined
        ? firstSpineItem
        : packageDocument.spine[spineItemIndex];
    if (
      spineItemIndex !== undefined &&
      (spineItem === undefined || String(spineItem.path) !== String(path))
    ) {
      return fail("internal-failure");
    }
    if (spineItem !== undefined && spineItem !== firstSpineItem) {
      this.#documentId =
        `${this.#documentId}:spine:${String(spineItem.index)}` as ContentDocumentId;
    }
    this.#documentLocation = Object.freeze(
      spineItem === undefined
        ? { kind: "non-spine" }
        : {
            kind: "spine",
            spineItemId: createSpineItemId(`spine:${String(spineItem.index)}`),
            spineItemIndex: createIndex(spineItem.index),
          },
    );
  }

  public consume(event: XmlEvent): void {
    this.#archive.budget.checkpoint();
    switch (event.type) {
      case "start-element":
        this.consumeStart(event);
        break;
      case "end-element":
        this.consumeEnd(event);
        break;
      case "text":
        this.consumeText(event.text);
        break;
    }
  }

  public complete(): XhtmlDocumentProjection {
    this.#archive.budget.checkpoint();
    if (
      !this.#sawRoot ||
      !this.#sawBody ||
      !this.#closedBody ||
      this.#elements.length !== 0 ||
      this.#destinations.length !== 0 ||
      this.#blocks === undefined ||
      this.#documentId === undefined ||
      this.#documentLocation === undefined
    ) {
      return fail("malformed-package");
    }

    const blocks: SemanticBlock[] = [];
    collectAddressableBlocks(this.#blocks, blocks);
    const autoTextScopes = new Set<number>();
    if (this.#autoDirectionScopeCount !== 0) {
      for (const block of blocks) {
        this.#archive.budget.checkpoint();
        if (block.kind === "paragraph" || block.kind === "heading") {
          collectAutoTextScopes(block.children, autoTextScopes);
        }
      }
    }
    const document = Object.freeze({
      id: this.#documentId,
      location: this.#documentLocation,
      blocks: this.#blocks,
      ...(autoTextScopes.size === 0
        ? {}
        : { autoDirectionScopeCount: autoTextScopes.size }),
      ...contextProperties(this.#documentContext),
    });
    const fragmentCounts = new Map<string, number>();
    const locatorCounts = new Map<string, number>();
    for (const block of blocks) {
      const ids = this.#sourceElementIdsByBlock.get(block);
      countId(fragmentCounts, ids?.fragment);
      countId(locatorCounts, ids?.locator);
    }
    const addressableBlocks = blocks.map((block) => {
      const ids = this.#sourceElementIdsByBlock.get(block);
      const fragment = uniqueId(
        ids?.fragment,
        this.#sourceElementIdCounts,
        fragmentCounts,
      );
      // Keep locator assignment for the same EPUB bytes independent of XML ID
      // normalization in the fragment index.
      const locator = uniqueId(
        ids?.locator,
        this.#locatorElementIdCounts,
        locatorCounts,
      );
      return Object.freeze({
        block,
        ...(fragment === undefined ? {} : { sourceElementId: fragment }),
        ...(fragment === locator ? {} : { locatorElementId: locator ?? null }),
      });
    });

    return Object.freeze({
      document,
      addressableBlocks: Object.freeze(addressableBlocks),
    });
  }

  private consumeStart(event: XmlStartElementEvent): void {
    const depth = this.#elements.length + 1;
    const inherited: TextContext =
      this.#elements.at(-1)?.context ?? Object.freeze({});
    const declaredDirection = readDeclaredDirection(event);
    const autoDirectionScope =
      declaredDirection === "auto"
        ? ++this.#autoDirectionScopeCount
        : declaredDirection === undefined
          ? inherited.autoDirectionScope
          : undefined;
    const context = deriveContext(
      event,
      inherited,
      declaredDirection,
      autoDirectionScope,
    );
    const xhtmlId = attribute(event, "", "id");
    const rawXmlId = attribute(event, XML_NAMESPACE, "id");
    // The parser handles literal whitespace. XML ID collapses U+0020 in the
    // parsed attribute, leaving referenced tab, CR and LF distinct.
    const xmlId = rawXmlId?.replace(/ +/g, " ").replace(/^ | $/g, "");
    const locator = sourceElementIdentity(xhtmlId, rawXmlId);
    const fragment =
      xmlId === rawXmlId ? locator : sourceElementIdentity(xhtmlId, xmlId);
    for (const id of locator.observed)
      countId(this.#locatorElementIdCounts, id);
    for (const id of fragment.observed)
      countId(this.#sourceElementIdCounts, id);
    const elementId =
      locator.candidate === undefined && fragment.candidate === undefined
        ? undefined
        : {
            ...(locator.candidate === undefined
              ? {}
              : { locator: locator.candidate }),
            ...(fragment.candidate === undefined
              ? {}
              : { fragment: fragment.candidate }),
          };

    if (depth === 1) {
      if (
        event.name.namespaceUri !== XHTML_NAMESPACE ||
        event.name.localName !== "html" ||
        this.#sawRoot
      ) {
        return fail("malformed-package");
      }
      this.#sawRoot = true;
      this.#documentContext = context;
      this.#elements.push({
        name: event.name,
        context,
        omitted: isExplicitlyHidden(event),
      });
      return;
    }

    const parent = this.#elements.at(-1);
    if (parent === undefined) {
      return fail("internal-failure");
    }

    if (depth === 2) {
      this.consumeRootChild(event, context, elementId);
      return;
    }

    if (parent.omitted) {
      this.#elements.push({ name: event.name, context, omitted: true });
      return;
    }

    if (!this.#sawBody || this.#closedBody) {
      return fail("malformed-package");
    }

    if (
      event.name.namespaceUri !== XHTML_NAMESPACE ||
      isExplicitlyHidden(event) ||
      OMITTED_XHTML_ELEMENTS.has(event.name.localName)
    ) {
      this.#elements.push({ name: event.name, context, omitted: true });
      return;
    }

    this.consumeBodyElement(
      event,
      context,
      elementId,
      declaredDirection !== undefined,
    );
  }

  private consumeRootChild(
    event: XmlStartElementEvent,
    context: TextContext,
    elementId: BlockElementIds | undefined,
  ): void {
    if (event.name.namespaceUri !== XHTML_NAMESPACE) {
      return fail("malformed-package");
    }

    if (event.name.localName === "head" && !this.#sawBody) {
      this.#elements.push({ name: event.name, context, omitted: true });
      return;
    }

    if (event.name.localName !== "body" || this.#sawBody) {
      return fail("malformed-package");
    }

    this.#sawBody = true;
    const collector: BlockCollector = {
      kind: "blocks",
      context,
      blocks: [],
      pendingInlines: [],
      pendingSourceElementId: undefined,
    };
    this.#destinations.push(collector);
    this.#elements.push({
      name: event.name,
      context,
      omitted:
        this.#elements.at(-1)?.omitted === true || isExplicitlyHidden(event),
      closeAction: { kind: "body", collector },
      paragraphSourceBoundary: true,
      ...(elementId === undefined
        ? {}
        : { paragraphSourceElementId: elementId }),
    });
  }

  private consumeBodyElement(
    event: XmlStartElementEvent,
    context: TextContext,
    elementId: BlockElementIds | undefined,
    ownsDirection: boolean,
  ): void {
    const name = event.name.localName;
    if (name === "body" || name === "head" || name === "html") {
      return fail("malformed-package");
    }
    if (/^h[1-6]$/u.test(name)) {
      this.beginInlineBlock(
        event,
        context,
        Number(name[1]) as 1 | 2 | 3 | 4 | 5 | 6,
        elementId,
      );
      return;
    }

    switch (name) {
      case "p":
        this.beginInlineBlock(event, context, undefined, elementId);
        return;
      case "blockquote":
        this.beginBlockQuote(event, context, elementId);
        return;
      case "ol":
      case "ul":
        this.beginList(event, context, name === "ol", elementId);
        return;
      case "li":
        this.beginListItem(event, context, elementId);
        return;
      case "em":
      case "i":
        this.beginInline(event, context, "emphasis");
        return;
      case "strong":
      case "b":
        this.beginInline(event, context, "strong");
        return;
      case "code":
        this.beginInline(event, context, "code");
        return;
      case "a":
        this.beginLink(event, context, ownsDirection);
        return;
      case "br":
        this.appendRawInline(
          Object.freeze({
            kind: "line-break",
            ...(context.language === undefined
              ? {}
              : { language: context.language }),
          }),
        );
        this.#elements.push({ name: event.name, context, omitted: false });
        return;
      case "img":
        this.appendImage(event, context);
        this.#elements.push({ name: event.name, context, omitted: false });
        return;
      default:
        if (BLOCK_BOUNDARY_ELEMENTS.has(name)) {
          const destination = this.requireBlockDestination();
          this.flushPendingParagraph(destination);
          this.#elements.push({
            name: event.name,
            context,
            omitted: false,
            closeAction: { kind: "block-boundary" },
            paragraphSourceBoundary: true,
            ...(elementId === undefined
              ? {}
              : { paragraphSourceElementId: elementId }),
          });
        } else {
          this.beginTransparentElement(event, context, ownsDirection);
        }
    }
  }

  private beginTransparentElement(
    event: XmlStartElementEvent,
    context: TextContext,
    ownsDirection: boolean,
  ): void {
    const destination = this.currentDestination();
    if (ownsDirection && destination.kind === "inlines") {
      this.beginInline(event, context, "direction-span");
      return;
    }

    const frame: ElementFrame = {
      name: event.name,
      context,
      omitted: false,
    };
    if (ownsDirection && destination.kind === "blocks") {
      this.registerDirectionRun(frame, destination);
    }
    this.#elements.push(frame);
  }

  private consumeEnd(event: XmlEndElementEvent): void {
    const frame = this.#elements.pop();
    if (
      frame === undefined ||
      frame.name.namespaceUri !== event.name.namespaceUri ||
      frame.name.localName !== event.name.localName
    ) {
      return fail("malformed-package");
    }

    if (frame.directionRunOwner !== undefined) {
      frame.directionRunOwner.activeDirectionFrames?.pop();
      frame.directionRunOwner.pendingDirectionRuns?.delete(frame);
    }
    if (frame.closeAction !== undefined) {
      this.completeAction(frame.closeAction, frame.context);
    }
  }

  private consumeText(text: string): void {
    const frame = this.#elements.at(-1);
    if (frame === undefined) {
      if (NON_WHITESPACE.test(text)) {
        return fail("malformed-package");
      }
      return;
    }

    if (frame.omitted) {
      return;
    }

    if (!this.#sawBody || this.#closedBody) {
      if (NON_WHITESPACE.test(text)) {
        return fail("malformed-package");
      }
      return;
    }

    const destination = this.currentDestination();
    if (destination.kind === "list") {
      if (NON_WHITESPACE.test(text)) {
        return fail("malformed-package");
      }
      return;
    }

    this.appendRawInline(
      Object.freeze({
        kind: "text",
        text,
        ...contextProperties(frame.context),
      }),
    );
  }

  private beginInlineBlock(
    event: XmlStartElementEvent,
    context: TextContext,
    level?: 1 | 2 | 3 | 4 | 5 | 6,
    elementId?: BlockElementIds,
  ): void {
    const parent = this.requireBlockDestination();
    this.flushPendingParagraph(parent);
    const collector: InlineCollector = {
      kind: "inlines",
      context,
      inlines: [],
    };
    this.#destinations.push(collector);
    this.#elements.push({
      name: event.name,
      context,
      omitted: false,
      closeAction:
        level === undefined
          ? {
              kind: "paragraph",
              collector,
              ...(elementId === undefined
                ? {}
                : { sourceElementId: elementId }),
            }
          : {
              kind: "heading",
              collector,
              level,
              ...(elementId === undefined
                ? {}
                : { sourceElementId: elementId }),
            },
    });
  }

  private beginBlockQuote(
    event: XmlStartElementEvent,
    context: TextContext,
    elementId: BlockElementIds | undefined,
  ): void {
    const parent = this.requireBlockDestination();
    this.flushPendingParagraph(parent);
    const collector: BlockCollector = {
      kind: "blocks",
      context,
      blocks: [],
      pendingInlines: [],
      pendingSourceElementId: undefined,
    };
    this.#destinations.push(collector);
    this.#elements.push({
      name: event.name,
      context,
      omitted: false,
      paragraphSourceBoundary: true,
      closeAction: {
        kind: "block-quote",
        collector,
        ...(elementId === undefined ? {} : { sourceElementId: elementId }),
      },
    });
  }

  private beginList(
    event: XmlStartElementEvent,
    context: TextContext,
    ordered: boolean,
    elementId: BlockElementIds | undefined,
  ): void {
    const parent = this.requireBlockDestination();
    this.flushPendingParagraph(parent);
    const start = ordered
      ? listOrdinal(attribute(event, "", "start"))
      : undefined;
    const collector: ListCollector = {
      kind: "list",
      context,
      ordered,
      ...(start === undefined ? {} : { start }),
      nextOrdinal: start ?? 1,
      nextRenderedOrdinal: start ?? 1,
      items: [],
    };
    this.#destinations.push(collector);
    this.#elements.push({
      name: event.name,
      context,
      omitted: false,
      closeAction: {
        kind: "list",
        collector,
        ...(elementId === undefined ? {} : { sourceElementId: elementId }),
      },
    });
  }

  private beginListItem(
    event: XmlStartElementEvent,
    context: TextContext,
    elementId: BlockElementIds | undefined,
  ): void {
    const parent = this.currentDestination();
    if (parent.kind !== "list") {
      return fail("malformed-package");
    }
    const collector: BlockCollector = {
      kind: "blocks",
      context,
      blocks: [],
      pendingInlines: [],
      pendingSourceElementId: undefined,
    };
    this.#destinations.push(collector);
    this.#elements.push({
      name: event.name,
      context,
      omitted: false,
      closeAction: {
        kind: "list-item",
        collector,
        ...(parent.ordered
          ? {
              value:
                listOrdinal(attribute(event, "", "value")) ??
                parent.nextOrdinal,
            }
          : {}),
      },
      paragraphSourceBoundary: true,
      ...(elementId === undefined
        ? {}
        : { paragraphSourceElementId: elementId }),
    });
  }

  private beginInline(
    event: XmlStartElementEvent,
    context: TextContext,
    inlineKind: RawContainerInline["kind"],
  ): void {
    this.assertInlineDestination();
    const collector: InlineCollector = {
      kind: "inlines",
      context,
      inlines: [],
    };
    this.#destinations.push(collector);
    this.#elements.push({
      name: event.name,
      context,
      omitted: false,
      closeAction: { kind: "inline", collector, inlineKind },
    });
  }

  private beginLink(
    event: XmlStartElementEvent,
    context: TextContext,
    ownsDirection: boolean,
  ): void {
    this.assertInlineDestination();
    if (
      this.#elements.some(
        (frame) =>
          frame.inertBlockLink === true ||
          (frame.closeAction?.kind === "inline" &&
            frame.closeAction.inlineKind === "internal-link"),
      )
    ) {
      return fail("malformed-package");
    }
    const target = this.resolveLink(attribute(event, "", "href"));
    if (target === undefined) {
      this.beginTransparentElement(event, context, ownsDirection);
      return;
    }
    const collector: InlineCollector = {
      kind: "inlines",
      context,
      inlines: [],
    };
    this.#destinations.push(collector);
    this.#elements.push({
      name: event.name,
      context,
      omitted: false,
      linkOwnsDirection: ownsDirection,
      closeAction: {
        kind: "inline",
        collector,
        inlineKind: "internal-link",
        target,
      },
    });
  }

  private appendImage(event: XmlStartElementEvent, context: TextContext): void {
    this.assertInlineDestination();
    const source = attribute(event, "", "src");
    const id = this.resolveImage(source);
    if (id === undefined) {
      return;
    }
    const alternativeTextValue = attribute(event, "", "alt");
    const alternativeText =
      alternativeTextValue === undefined
        ? undefined
        : normalizeAlternativeText(alternativeTextValue);
    if (alternativeText !== undefined) {
      this.#archive.budget.observeDecodedPublicationText(
        decodedUtf8ByteLength(alternativeText, this.#archive.budget),
      );
    }
    this.appendRawInline(
      Object.freeze({
        kind: "raster-image",
        resourceId: id,
        ...(alternativeText === undefined ? {} : { alternativeText }),
        ...contextProperties(context),
      }),
    );
  }

  private completeAction(action: CloseAction, context: TextContext): void {
    switch (action.kind) {
      case "body":
        this.popDestination(action.collector);
        this.flushPendingParagraph(action.collector);
        this.#blocks = Object.freeze([...action.collector.blocks]);
        this.#closedBody = true;
        return;
      case "block-boundary": {
        const destination = this.currentDestination();
        if (destination.kind !== "blocks") {
          return fail("malformed-package");
        }
        this.flushPendingParagraph(destination);
        return;
      }
      case "paragraph":
      case "heading": {
        this.popDestination(action.collector);
        const children = freezeRawInlines(action.collector.inlines);
        if (children.length === 0) {
          return;
        }
        const parent = this.requireBlockDestination();
        this.observeBlock();
        const block =
          action.kind === "paragraph"
            ? Object.freeze({
                kind: "paragraph",
                children,
                ...contextProperties(context),
              })
            : Object.freeze({
                kind: "heading",
                level: action.level,
                children,
                ...contextProperties(context),
              });
        this.appendBlock(parent, block, action.sourceElementId);
        return;
      }
      case "block-quote": {
        this.popDestination(action.collector);
        this.flushPendingParagraph(action.collector);
        if (action.collector.blocks.length === 0) {
          return;
        }
        const parent = this.requireBlockDestination();
        this.observeBlock();
        this.appendBlock(
          parent,
          Object.freeze({
            kind: "block-quote",
            children: Object.freeze([...action.collector.blocks]),
            ...contextProperties(context),
          }),
          action.sourceElementId,
        );
        return;
      }
      case "list-item": {
        this.popDestination(action.collector);
        this.flushPendingParagraph(action.collector);
        const parent = this.currentDestination();
        if (parent.kind !== "list") {
          return fail("internal-failure");
        }
        if (action.value !== undefined)
          parent.nextOrdinal = Math.min(2_147_483_647, action.value + 1);
        if (action.collector.blocks.length === 0) {
          return;
        }
        parent.items.push(
          Object.freeze({
            ...(action.value !== undefined &&
            action.value !== parent.nextRenderedOrdinal
              ? { value: action.value }
              : {}),
            ...(context.language !== parent.context.language &&
            context.language !== undefined
              ? { language: context.language }
              : {}),
            ...(context.direction !== undefined &&
            (context.direction !== parent.context.direction ||
              context.autoDirectionScope !== parent.context.autoDirectionScope)
              ? { direction: context.direction }
              : {}),
            ...(context.autoDirectionScope !== undefined &&
            context.autoDirectionScope !== parent.context.autoDirectionScope
              ? { autoDirectionScope: context.autoDirectionScope }
              : {}),
            children: Object.freeze([...action.collector.blocks]),
          }),
        );
        parent.nextRenderedOrdinal =
          action.value === undefined ? parent.nextOrdinal : action.value + 1;
        return;
      }
      case "list": {
        this.popDestination(action.collector);
        if (action.collector.items.length === 0) {
          return;
        }
        const parent = this.requireBlockDestination();
        this.observeBlock();
        this.appendBlock(
          parent,
          Object.freeze({
            kind: "list",
            ordered: action.collector.ordered,
            ...(action.collector.start === undefined
              ? {}
              : { start: action.collector.start }),
            items: Object.freeze([...action.collector.items]),
            ...contextProperties(context),
          }),
          action.sourceElementId,
        );
        return;
      }
      case "inline": {
        this.popDestination(action.collector);
        this.appendRawInline(
          action.inlineKind === "internal-link"
            ? Object.freeze({
                kind: "internal-link",
                target: action.target ?? fail("internal-failure"),
                children: action.collector.inlines,
                ...contextProperties(context),
              })
            : Object.freeze({
                kind: action.inlineKind,
                children: action.collector.inlines,
                ...contextProperties(context),
              }),
        );
      }
    }
  }

  private flushPendingParagraph(collector: BlockCollector): void {
    const sourceId = collector.pendingSourceElementId;
    const language = collector.pendingParagraphLanguage;
    const direction = collector.pendingParagraphDirection;
    const autoDirectionScope = collector.pendingParagraphAutoDirectionScope;
    const children = freezeRawInlines(collector.pendingInlines);
    collector.pendingInlines.length = 0;
    collector.pendingDirectionRuns?.clear();
    collector.pendingSourceElementId = undefined;
    delete collector.pendingParagraphLanguage;
    delete collector.pendingParagraphDirection;
    delete collector.pendingParagraphAutoDirectionScope;
    if (children.length === 0) {
      return;
    }
    this.observeBlock();
    this.appendBlock(
      collector,
      Object.freeze({
        kind: "paragraph",
        children,
        ...(language === undefined ? {} : { language }),
        ...(direction === undefined ? {} : { direction }),
        ...(autoDirectionScope === undefined ? {} : { autoDirectionScope }),
      }),
      sourceId,
    );
  }

  private resolveLink(
    value: string | undefined,
  ): SemanticDocumentTarget | undefined {
    if (value === undefined || this.isNonLocalReference(value)) {
      return undefined;
    }
    const resolved = this.resolveReference(value);
    if (resolved === undefined) {
      return undefined;
    }
    const target = this.#resolveContent(resolved.path);
    const id =
      String(target.path) !== String(resolved.path) &&
      target.spineItemIndex !== undefined
        ? this.#documentsBySpineIndex.get(target.spineItemIndex)
        : String(target.path) === String(this.#path)
          ? this.#documentId
          : this.#documentsByPath.get(String(target.path));
    if (id === undefined) {
      return fail("broken-reference");
    }
    return Object.freeze({
      documentId: id,
      ...(resolved.fragment === undefined
        ? {}
        : { fragment: resolved.fragment as SourceFragment }),
    });
  }

  private resolveImage(
    value: string | undefined,
  ): RasterImageResourceId | undefined {
    if (value === undefined || this.isNonLocalReference(value)) {
      return undefined;
    }
    const resolved = this.resolveReference(value);
    if (resolved === undefined || resolved.fragment !== undefined) {
      return undefined;
    }
    const id = this.#resourcesByPath.get(String(resolved.path));
    return id ?? fail("broken-reference");
  }

  private resolveReference(
    value: string,
  ):
    { readonly path: ArchiveFilePath; readonly fragment?: string } | undefined {
    try {
      const parsed = parseOcfReference(value, this.#archive.budget.policy);
      return resolveOcfReference(
        this.#path,
        parsed,
        this.#archive.budget.policy,
      );
    } catch (error: unknown) {
      if (
        error instanceof EpubPathError &&
        error.code === "resource-limit-exceeded"
      ) {
        return fail("resource-limit-exceeded");
      }
      return undefined;
    }
  }

  private isNonLocalReference(value: string): boolean {
    return (
      value.startsWith("/") ||
      value.startsWith("//") ||
      /^[a-z][a-z0-9+.-]*:/iu.test(value)
    );
  }

  private observeBlock(): void {
    this.#archive.budget.observeSemanticBlock();
  }

  private currentDestination(): SemanticDestination {
    return this.#destinations.at(-1) ?? fail("malformed-package");
  }

  private requireBlockDestination(): BlockCollector {
    const destination = this.currentDestination();
    if (destination.kind === "blocks") return destination;
    if (destination.kind === "inlines") {
      const blockParent = this.unwrapBlockLink();
      if (blockParent !== undefined) return blockParent;
    }
    return fail("malformed-package");
  }

  /** Make a flow-content link inert when its first rendered block arrives. */
  private unwrapBlockLink(): BlockCollector | undefined {
    const directionFrames: ElementFrame[] = [];
    let destinationIndex = this.#destinations.length - 1;
    for (let index = this.#elements.length - 1; index >= 0; index -= 1) {
      const frame = this.#elements[index]!;
      const action = frame.closeAction;
      if (action === undefined) continue;
      if (
        action.kind !== "inline" ||
        action.collector !== this.#destinations[destinationIndex]
      )
        return undefined;
      destinationIndex -= 1;
      if (action.inlineKind === "direction-span") {
        directionFrames.push(frame);
        continue;
      }
      const parent = this.#destinations[destinationIndex];
      if (action.inlineKind !== "internal-link" || parent?.kind !== "blocks")
        return undefined;

      for (const directionFrame of directionFrames) {
        const close = directionFrame.closeAction ?? fail("internal-failure");
        this.completeAction(close, directionFrame.context);
        delete directionFrame.closeAction;
      }
      this.popDestination(action.collector);
      delete frame.closeAction;
      frame.inertBlockLink = true;
      if (frame.linkOwnsDirection) this.registerDirectionRun(frame, parent);
      for (const inline of action.collector.inlines)
        this.appendRawInline(inline);
      for (const directionFrame of directionFrames.reverse())
        this.registerDirectionRun(directionFrame, parent);
      return parent;
    }
    return undefined;
  }

  private registerDirectionRun(
    frame: ElementFrame,
    destination: BlockCollector,
  ): void {
    frame.directionRunOwner = destination;
    (destination.activeDirectionFrames ??= []).push(frame);
  }

  private assertInlineDestination(): void {
    if (this.currentDestination().kind === "list") {
      return fail("malformed-package");
    }
  }

  private appendRawInline(inline: RawInline): void {
    const destination = this.currentDestination();
    if (destination.kind === "list") {
      return fail("malformed-package");
    }
    if (destination.kind === "blocks") {
      if (destination.pendingInlines.length === 0) {
        this.beginPendingParagraph(destination);
      }
      let inlines = destination.pendingInlines;
      for (const frame of destination.activeDirectionFrames ?? []) {
        const runs = (destination.pendingDirectionRuns ??= new Map());
        let run = runs.get(frame);
        if (run === undefined) {
          run = {
            kind: "direction-span",
            children: [],
            ...contextProperties(frame.context),
          };
          runs.set(frame, run);
          inlines.push(run);
        }
        inlines = run.children;
      }
      inlines.push(inline);
    } else {
      destination.inlines.push(inline);
    }
  }

  private appendBlock(
    destination: BlockCollector,
    block: SemanticBlock,
    elementId?: BlockElementIds,
  ): void {
    destination.blocks.push(block);
    if (elementId !== undefined) {
      this.#sourceElementIdsByBlock.set(block, elementId);
    }
  }

  private beginPendingParagraph(collector: BlockCollector): void {
    for (let index = this.#elements.length - 1; index >= 0; index -= 1) {
      const frame = this.#elements[index];
      if (frame?.paragraphSourceBoundary === true) {
        collector.pendingSourceElementId = frame.paragraphSourceElementId;
        if (frame.context.language !== undefined) {
          collector.pendingParagraphLanguage = frame.context.language;
        }
        if (frame.context.direction !== undefined) {
          collector.pendingParagraphDirection = frame.context.direction;
        }
        if (frame.context.autoDirectionScope !== undefined) {
          collector.pendingParagraphAutoDirectionScope =
            frame.context.autoDirectionScope;
        }
        return;
      }
    }
    if (collector.context.language !== undefined) {
      collector.pendingParagraphLanguage = collector.context.language;
    }
    if (collector.context.direction !== undefined) {
      collector.pendingParagraphDirection = collector.context.direction;
    }
    if (collector.context.autoDirectionScope !== undefined) {
      collector.pendingParagraphAutoDirectionScope =
        collector.context.autoDirectionScope;
    }
  }

  private popDestination(expected: SemanticDestination): void {
    if (this.#destinations.pop() !== expected) {
      return fail("internal-failure");
    }
  }
}

function mapProjectionError(error: unknown): EpubArchiveError {
  if (error instanceof EpubArchiveError) {
    return error;
  }
  if (error instanceof EpubPathError) {
    return new EpubArchiveError(
      error.code === "resource-limit-exceeded"
        ? "resource-limit-exceeded"
        : "broken-reference",
    );
  }
  return new EpubArchiveError("internal-failure");
}

export async function projectXhtmlDocumentProjection(
  archive: OpenedEpubArchive,
  packageDocument: ParsedPackageDocument,
  path: ArchiveFilePath,
  spineItemIndex?: number,
  lookup?: XhtmlPublicationLookup,
): Promise<XhtmlDocumentProjection> {
  try {
    archive.budget.checkpoint();
    const projector = new XhtmlProjector(
      archive,
      packageDocument,
      path,
      spineItemIndex,
      lookup,
    );
    const bytes = await archive.readEntry(path, {
      maximumBytes: archive.budget.policy.maxContentDocumentBytes,
    });
    const reader = createXmlEventReader(archive.budget);
    reader.read(
      bytes,
      packageDocument.version === "2.0" ? "epub2-content" : "content",
      (event) => projector.consume(event),
    );
    return projector.complete();
  } catch (error: unknown) {
    throw mapProjectionError(error);
  }
}

export async function projectXhtmlDocument(
  archive: OpenedEpubArchive,
  packageDocument: ParsedPackageDocument,
  path: ArchiveFilePath,
): Promise<SemanticDocument> {
  return (await projectXhtmlDocumentProjection(archive, packageDocument, path))
    .document;
}
