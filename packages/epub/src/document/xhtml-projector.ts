import { createIndex, createSpineItemId } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import type {
  PackageManifestItem,
  ParsedPackageDocument,
} from "../package/package-document.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import {
  parseOcfReference,
  resolveOcfReference,
} from "../paths/ocf-reference.js";
import { EpubPathError } from "../paths/path-error.js";
import { rasterImageResourceIdForManifestItem } from "../resource/raster-resource-catalog.js";
import { createXmlEventReader } from "../xml/xml-event-reader.js";
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
  "figcaption",
  "figure",
  "footer",
  "header",
  "main",
  "nav",
  "pre",
  "section",
  "summary",
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
}

interface RawTextInline extends TextContext {
  readonly kind: "text";
  readonly text: string;
}

interface RawContainerInline extends TextContext {
  readonly kind: "code" | "emphasis" | "strong";
  readonly children: RawInline[];
}

interface RawLinkInline extends TextContext {
  readonly kind: "internal-link";
  readonly target: SemanticDocumentTarget;
  readonly children: RawInline[];
}

interface RawLineBreakInline {
  readonly kind: "line-break";
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
  pendingSourceElementId: string | undefined;
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
  readonly items: { readonly children: readonly SemanticBlock[] }[];
}

type SemanticDestination = BlockCollector | InlineCollector | ListCollector;

type CloseAction =
  | { readonly kind: "block-boundary" }
  | {
      readonly collector: BlockCollector;
      readonly kind: "block-quote";
      readonly sourceElementId?: string;
    }
  | { readonly collector: BlockCollector; readonly kind: "body" }
  | {
      readonly collector: InlineCollector;
      readonly kind: "heading";
      readonly level: 1 | 2 | 3 | 4 | 5 | 6;
      readonly sourceElementId?: string;
    }
  | {
      readonly collector: InlineCollector;
      readonly kind: "inline";
      readonly inlineKind:
        "code" | "emphasis" | "internal-link" | "strong" | "transparent";
      readonly target?: SemanticDocumentTarget;
    }
  | {
      readonly collector: ListCollector;
      readonly kind: "list";
      readonly sourceElementId?: string;
    }
  | { readonly collector: BlockCollector; readonly kind: "list-item" }
  | {
      readonly collector: InlineCollector;
      readonly kind: "paragraph";
      readonly sourceElementId?: string;
    };

interface ElementFrame {
  readonly name: XmlExpandedName;
  readonly context: TextContext;
  readonly omitted: boolean;
  readonly closeAction?: CloseAction;
  readonly paragraphSourceBoundary?: boolean;
  readonly paragraphSourceElementId?: string;
}

export interface ProjectedAddressableBlock {
  readonly block: SemanticBlock;
  readonly sourceElementId?: string;
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

function sourceElementIdentity(
  event: XmlStartElementEvent,
): SourceElementIdentity {
  const xhtmlId = attribute(event, "", "id");
  const xmlId = attribute(event, XML_NAMESPACE, "id");
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
): TextContext {
  const xmlLanguage = attribute(event, XML_NAMESPACE, "lang");
  const htmlLanguage = attribute(event, "", "lang");
  if (
    xmlLanguage !== undefined &&
    htmlLanguage !== undefined &&
    xmlLanguage !== htmlLanguage
  ) {
    return fail("malformed-package");
  }

  const language = xmlLanguage ?? htmlLanguage;
  if (
    language !== undefined &&
    (language.length === 0 ||
      language !== language.trim() ||
      hasControlCharacter(language))
  ) {
    return fail("malformed-package");
  }

  const directionValue = attribute(event, "", "dir");
  let direction = inherited.direction;
  if (directionValue !== undefined) {
    if (
      directionValue !== "auto" &&
      directionValue !== "ltr" &&
      directionValue !== "rtl"
    ) {
      return fail("malformed-package");
    }
    direction = directionValue;
  }

  return Object.freeze({
    ...(language === undefined
      ? inherited.language === undefined
        ? {}
        : { language: inherited.language }
      : { language }),
    ...(direction === undefined ? {} : { direction }),
  });
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

function normalizeAlternativeText(value: string): string | undefined {
  const normalized = value.replace(NORMAL_WHITESPACE, " ").trim();
  return normalized.length === 0 ? undefined : normalized;
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
  const parts = value.split(NORMAL_WHITESPACE);
  const beginsWithWhitespace = /^[\t\n\f\r ]/u.test(value);
  const endsWithWhitespace = /[\t\n\f\r ]$/u.test(value);

  if (beginsWithWhitespace && state.emittedContent) {
    state.pendingSpace = true;
  }

  for (const [index, part] of parts.entries()) {
    if (part.length > 0) {
      const prefix = state.pendingSpace && state.emittedContent ? " " : "";
      appendTextNode(output, `${prefix}${part}`, context);
      state.emittedContent = true;
      state.pendingSpace = false;
    }

    if (index < parts.length - 1 && state.emittedContent) {
      state.pendingSpace = true;
    }
  }

  if (!endsWithWhitespace && parts.at(-1)?.length !== 0) {
    state.pendingSpace = false;
  }
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
        output.push(Object.freeze({ kind: "line-break" }));
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
      output.push(Object.freeze({ kind: "line-break" }));
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

class XhtmlProjector {
  readonly #archive: OpenedEpubArchive;
  readonly #path: ArchiveFilePath;
  readonly #documentsByPath = new Map<string, ContentDocumentId>();
  readonly #resourcesByPath = new Map<string, RasterImageResourceId>();
  readonly #elements: ElementFrame[] = [];
  readonly #destinations: SemanticDestination[] = [];
  readonly #sourceElementIdCounts = new Map<string, number>();
  readonly #sourceElementIdsByBlock = new Map<SemanticBlock, string>();
  #documentId: ContentDocumentId | undefined;
  #documentContext: TextContext = Object.freeze({});
  #documentLocation: SemanticDocumentLocation | undefined;
  #blocks: readonly SemanticBlock[] | undefined;
  #sawRoot = false;
  #sawBody = false;
  #closedBody = false;

  public constructor(
    archive: OpenedEpubArchive,
    packageDocument: ParsedPackageDocument,
    path: ArchiveFilePath,
  ) {
    this.#archive = archive;
    this.#path = path;

    for (const [index, item] of packageDocument.manifest.entries()) {
      archive.budget.checkpoint();
      if (isSupportedContentDocument(item) && item.location.kind === "local") {
        const id = contentDocumentIdForManifestIndex(index);
        this.#documentsByPath.set(String(item.location.path), id);
        if (String(item.location.path) === String(path)) {
          this.#documentId = id;
        }
      } else {
        const id = rasterImageResourceIdForManifestItem(item, index);
        if (id !== undefined && item.location.kind === "local") {
          this.#resourcesByPath.set(String(item.location.path), id);
        }
      }
    }

    if (this.#documentId === undefined) {
      return fail("unsupported-resource");
    }

    const spineItem = packageDocument.spine.find(
      (item) => String(item.path) === String(path),
    );
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

    const document = Object.freeze({
      id: this.#documentId,
      location: this.#documentLocation,
      blocks: this.#blocks,
      ...contextProperties(this.#documentContext),
    });
    const blocks: SemanticBlock[] = [];
    collectAddressableBlocks(document.blocks, blocks);
    const candidateCounts = new Map<string, number>();
    for (const block of blocks) {
      const candidate = this.#sourceElementIdsByBlock.get(block);
      if (candidate !== undefined) {
        candidateCounts.set(
          candidate,
          (candidateCounts.get(candidate) ?? 0) + 1,
        );
      }
    }
    const addressableBlocks = blocks.map((block) => {
      const candidate = this.#sourceElementIdsByBlock.get(block);
      const sourceIsUnique =
        candidate !== undefined &&
        this.#sourceElementIdCounts.get(candidate) === 1 &&
        candidateCounts.get(candidate) === 1;
      return Object.freeze({
        block,
        ...(sourceIsUnique ? { sourceElementId: candidate } : {}),
      });
    });

    return Object.freeze({
      document,
      addressableBlocks: Object.freeze(addressableBlocks),
    });
  }

  private consumeStart(event: XmlStartElementEvent): void {
    const depth = this.#elements.length + 1;
    const inherited = this.#elements.at(-1)?.context ?? Object.freeze({});
    const context = deriveContext(event, inherited);
    const identity = sourceElementIdentity(event);
    for (const observedId of identity.observed) {
      this.#sourceElementIdCounts.set(
        observedId,
        (this.#sourceElementIdCounts.get(observedId) ?? 0) + 1,
      );
    }
    const elementId = identity.candidate;

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
        omitted: false,
      });
      return;
    }

    const parent = this.#elements.at(-1);
    if (parent === undefined) {
      return fail("internal-failure");
    }

    if (parent.omitted) {
      this.#elements.push({ name: event.name, context, omitted: true });
      return;
    }

    if (depth === 2) {
      this.consumeRootChild(event, context, elementId);
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

    this.consumeBodyElement(event, context, elementId);
  }

  private consumeRootChild(
    event: XmlStartElementEvent,
    context: TextContext,
    elementId: string | undefined,
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
      omitted: isExplicitlyHidden(event),
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
    elementId: string | undefined,
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
        this.beginLink(event, context);
        return;
      case "br":
        this.appendRawInline(Object.freeze({ kind: "line-break" }));
        this.#elements.push({ name: event.name, context, omitted: false });
        return;
      case "img":
        this.appendImage(event, context);
        this.#elements.push({ name: event.name, context, omitted: false });
        return;
      default:
        if (BLOCK_BOUNDARY_ELEMENTS.has(name)) {
          const destination = this.currentDestination();
          if (destination.kind !== "blocks") {
            return fail("malformed-package");
          }
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
          this.#elements.push({ name: event.name, context, omitted: false });
        }
    }
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

    const inlines =
      destination.kind === "blocks"
        ? destination.pendingInlines
        : destination.inlines;
    if (destination.kind === "blocks" && inlines.length === 0) {
      destination.pendingSourceElementId =
        this.currentParagraphSourceElementId();
    }
    inlines.push(
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
    elementId?: string,
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
    elementId: string | undefined,
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
    elementId: string | undefined,
  ): void {
    const parent = this.requireBlockDestination();
    this.flushPendingParagraph(parent);
    const collector: ListCollector = {
      kind: "list",
      context,
      ordered,
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
    elementId: string | undefined,
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
      closeAction: { kind: "list-item", collector },
      paragraphSourceBoundary: true,
      ...(elementId === undefined
        ? {}
        : { paragraphSourceElementId: elementId }),
    });
  }

  private beginInline(
    event: XmlStartElementEvent,
    context: TextContext,
    inlineKind: "code" | "emphasis" | "strong",
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

  private beginLink(event: XmlStartElementEvent, context: TextContext): void {
    this.assertInlineDestination();
    if (
      this.#elements.some(
        (frame) =>
          frame.closeAction?.kind === "inline" &&
          frame.closeAction.inlineKind === "internal-link",
      )
    ) {
      return fail("malformed-package");
    }
    const target = this.resolveLink(attribute(event, "", "href"));
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
      closeAction: {
        kind: "inline",
        collector,
        inlineKind: target === undefined ? "transparent" : "internal-link",
        ...(target === undefined ? {} : { target }),
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
        if (action.collector.blocks.length === 0) {
          return;
        }
        parent.items.push(
          Object.freeze({
            children: Object.freeze([...action.collector.blocks]),
          }),
        );
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
            items: Object.freeze([...action.collector.items]),
            ...contextProperties(context),
          }),
          action.sourceElementId,
        );
        return;
      }
      case "inline": {
        this.popDestination(action.collector);
        if (action.inlineKind === "transparent") {
          for (const child of action.collector.inlines) {
            this.appendRawInline(child);
          }
          return;
        }
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
    const children = freezeRawInlines(collector.pendingInlines);
    collector.pendingInlines.length = 0;
    collector.pendingSourceElementId = undefined;
    if (children.length === 0) {
      return;
    }
    this.observeBlock();
    this.appendBlock(
      collector,
      Object.freeze({
        kind: "paragraph",
        children,
        ...contextProperties(collector.context),
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
    const id = this.#documentsByPath.get(String(resolved.path));
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
      value.includes("?") ||
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
    if (destination.kind !== "blocks") {
      return fail("malformed-package");
    }
    return destination;
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
        destination.pendingSourceElementId =
          this.currentParagraphSourceElementId();
      }
      destination.pendingInlines.push(inline);
    } else {
      destination.inlines.push(inline);
    }
  }

  private appendBlock(
    destination: BlockCollector,
    block: SemanticBlock,
    elementId?: string,
  ): void {
    destination.blocks.push(block);
    if (elementId !== undefined) {
      this.#sourceElementIdsByBlock.set(block, elementId);
    }
  }

  private currentParagraphSourceElementId(): string | undefined {
    for (let index = this.#elements.length - 1; index >= 0; index -= 1) {
      const frame = this.#elements[index];
      if (frame?.paragraphSourceBoundary === true) {
        return frame.paragraphSourceElementId;
      }
    }
    return undefined;
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
): Promise<XhtmlDocumentProjection> {
  try {
    archive.budget.checkpoint();
    const projector = new XhtmlProjector(archive, packageDocument, path);
    const bytes = await archive.readEntry(path, {
      maximumBytes: archive.budget.policy.maxContentDocumentBytes,
    });
    const reader = createXmlEventReader(archive.budget);
    reader.read(bytes, "content", (event) => projector.consume(event));
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
