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
import { createXmlEventReader } from "../xml/xml-event-reader.js";
import type {
  XmlEvent,
  XmlExpandedName,
  XmlStartElementEvent,
} from "../xml/xml-event-reader.js";

const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const EPUB_NAMESPACE = "http://www.idpf.org/2007/ops";
const XHTML_MEDIA_TYPE = "application/xhtml+xml";
const MAX_BOOK_NAVIGATION_LABEL_CODE_POINTS = 1_024;
const ACTIVE_RESOURCE_PROPERTIES = new Set(["remote-resources", "scripted"]);
const ASCII_WHITESPACE = /^[\t\n\f\r ]$/u;
const NON_XML_WHITESPACE = /[^\t\n\r ]/u;
const FORBIDDEN_LABEL_ELEMENTS = new Set([
  "body",
  "head",
  "html",
  "li",
  "nav",
  "ol",
  "script",
  "style",
  "template",
]);

export interface SpineNavigationTarget {
  readonly kind: "spine";
  readonly path: ArchiveFilePath;
  readonly spineItemIndex: number;
  readonly fragment?: string;
}

export interface NonSpineNavigationTarget {
  readonly kind: "non-spine";
  readonly path: ArchiveFilePath;
  readonly fragment?: string;
}

export type ParsedNavigationTarget =
  NonSpineNavigationTarget | SpineNavigationTarget;

export interface ParsedNavigationNode {
  readonly label: string;
  readonly target?: ParsedNavigationTarget;
  readonly children: readonly ParsedNavigationNode[];
}

export interface ParsedNavigationDocument {
  readonly roots: readonly ParsedNavigationNode[];
}

interface NavigationBuilder {
  stage: "start" | "after-heading" | "in-list" | "done";
}

interface LabelBuilder {
  readonly depth: number;
  readonly kind: "a" | "span";
  readonly href?: string;
  readonly fallbackTitle?: string;
  text: string;
  codePointCount: number;
  pendingWhitespace: boolean;
}

interface ListItemBuilder {
  readonly depth: number;
  stage: "expect-label" | "in-label" | "after-label" | "in-list" | "after-list";
  labelKind?: "a" | "span";
  label?: string;
  target?: ParsedNavigationTarget;
  children?: readonly ParsedNavigationNode[];
}

interface ListBuilder {
  readonly depth: number;
  readonly navigationDepth: number;
  readonly parentItem?: ListItemBuilder;
  readonly nodes: ParsedNavigationNode[];
  currentItem?: ListItemBuilder;
}

function fail(code: EpubArchiveErrorCode): never {
  throw new EpubArchiveError(code);
}

function namesEqual(
  name: XmlExpandedName | undefined,
  namespaceUri: string,
  localName: string,
): boolean {
  return name?.namespaceUri === namespaceUri && name.localName === localName;
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

function isHeading(name: XmlExpandedName): boolean {
  return (
    name.namespaceUri === XHTML_NAMESPACE && /^h[1-6]$/u.test(name.localName)
  );
}

function hasTocType(event: XmlStartElementEvent): boolean {
  if (!namesEqual(event.name, XHTML_NAMESPACE, "nav")) {
    return false;
  }

  const value = attribute(event, EPUB_NAMESPACE, "type");
  return value?.split(/[\t\n\f\r ]+/u).includes("toc") === true;
}

function isSupportedContentDocument(item: PackageManifestItem): boolean {
  return (
    item.location.kind === "local" &&
    item.kind === "content-document" &&
    item.mediaType === XHTML_MEDIA_TYPE &&
    !item.properties.some((property) =>
      ACTIVE_RESOURCE_PROPERTIES.has(property),
    )
  );
}

function mapReferenceError(error: unknown): never {
  if (error instanceof EpubArchiveError) {
    throw error;
  }

  if (
    error instanceof EpubPathError &&
    error.code === "resource-limit-exceeded"
  ) {
    return fail("resource-limit-exceeded");
  }

  return fail("broken-reference");
}

class NavigationDocumentParser {
  readonly #archive: OpenedEpubArchive;
  readonly #packageDocument: ParsedPackageDocument;
  readonly #supportedDocumentPaths = new Set<string>();
  readonly #firstSpineIndexByPath = new Map<string, number>();
  readonly #elementStack: XmlExpandedName[] = [];
  readonly #lists: ListBuilder[] = [];
  #navigation: NavigationBuilder | undefined;
  #tocDepth: number | undefined;
  #headingDepth: number | undefined;
  #label: LabelBuilder | undefined;
  #roots: readonly ParsedNavigationNode[] | undefined;
  #tocCount = 0;
  #navigationNodeCount = 0;
  #sawRoot = false;

  public constructor(
    archive: OpenedEpubArchive,
    packageDocument: ParsedPackageDocument,
  ) {
    this.#archive = archive;
    this.#packageDocument = packageDocument;

    for (const item of packageDocument.manifest) {
      archive.budget.checkpoint();
      if (isSupportedContentDocument(item) && item.location.kind === "local") {
        this.#supportedDocumentPaths.add(String(item.location.path));
      }
    }

    for (const item of packageDocument.spine) {
      archive.budget.checkpoint();
      const path = String(item.path);
      if (!this.#firstSpineIndexByPath.has(path)) {
        this.#firstSpineIndexByPath.set(path, item.index);
      }
    }
  }

  public consume(event: XmlEvent): void {
    this.#archive.budget.checkpoint();

    switch (event.type) {
      case "start-element":
        this.consumeStartElement(event);
        return;
      case "end-element":
        this.consumeEndElement(event.name);
        return;
      case "text":
        this.consumeText(event.text);
        return;
    }
  }

  public complete(): ParsedNavigationDocument {
    this.#archive.budget.checkpoint();
    if (
      !this.#sawRoot ||
      this.#elementStack.length !== 0 ||
      this.#tocCount !== 1 ||
      this.#tocDepth !== undefined ||
      this.#navigation !== undefined ||
      this.#roots === undefined
    ) {
      return fail("malformed-package");
    }

    return Object.freeze({ roots: this.#roots });
  }

  private consumeStartElement(event: XmlStartElementEvent): void {
    const depth = this.#elementStack.length + 1;
    this.#elementStack.push(event.name);

    if (depth === 1) {
      if (!namesEqual(event.name, XHTML_NAMESPACE, "html")) {
        return fail("malformed-package");
      }
      this.#sawRoot = true;
    }

    if (hasTocType(event)) {
      const hasBodyAncestor = this.#elementStack
        .slice(0, -1)
        .some((name) => namesEqual(name, XHTML_NAMESPACE, "body"));
      if (
        !hasBodyAncestor ||
        this.#tocCount !== 0 ||
        this.#tocDepth !== undefined
      ) {
        return fail("malformed-package");
      }

      this.#tocCount = 1;
      this.#tocDepth = depth;
      this.#navigation = { stage: "start" };
      return;
    }

    if (this.#tocDepth === undefined) {
      return;
    }

    if (this.#label !== undefined) {
      if (
        event.name.namespaceUri === XHTML_NAMESPACE &&
        FORBIDDEN_LABEL_ELEMENTS.has(event.name.localName)
      ) {
        return fail("malformed-package");
      }

      const alt = attribute(event, "", "alt");
      if (alt !== undefined) {
        this.appendLabelText(this.#label, alt);
      }
      return;
    }

    if (this.#headingDepth !== undefined) {
      return;
    }

    const navigation = this.#navigation;
    if (navigation === undefined) {
      return fail("internal-failure");
    }

    if (depth === this.#tocDepth + 1) {
      if (isHeading(event.name) && navigation.stage === "start") {
        navigation.stage = "after-heading";
        this.#headingDepth = depth;
        return;
      }

      if (
        namesEqual(event.name, XHTML_NAMESPACE, "ol") &&
        (navigation.stage === "start" || navigation.stage === "after-heading")
      ) {
        navigation.stage = "in-list";
        this.beginList(depth, 1, undefined);
        return;
      }

      return fail("malformed-package");
    }

    const list = this.#lists.at(-1);
    if (list === undefined) {
      return fail("malformed-package");
    }

    if (depth === list.depth + 1) {
      if (
        !namesEqual(event.name, XHTML_NAMESPACE, "li") ||
        list.currentItem !== undefined
      ) {
        return fail("malformed-package");
      }

      this.#navigationNodeCount += 1;
      if (
        this.#navigationNodeCount >
        this.#archive.budget.policy.maxNavigationNodes
      ) {
        return fail("resource-limit-exceeded");
      }

      list.currentItem = {
        depth,
        stage: "expect-label",
      };
      return;
    }

    const item = list.currentItem;
    if (item === undefined || depth !== item.depth + 1) {
      return fail("malformed-package");
    }

    if (
      item.stage === "expect-label" &&
      (namesEqual(event.name, XHTML_NAMESPACE, "a") ||
        namesEqual(event.name, XHTML_NAMESPACE, "span"))
    ) {
      const kind = event.name.localName as "a" | "span";
      const href = kind === "a" ? attribute(event, "", "href") : undefined;
      const fallbackTitle = attribute(event, "", "title");
      if (kind === "a" && (href === undefined || href.length === 0)) {
        return fail("broken-reference");
      }

      item.stage = "in-label";
      this.#label = {
        depth,
        kind,
        ...(href === undefined ? {} : { href }),
        ...(fallbackTitle === undefined ? {} : { fallbackTitle }),
        text: "",
        codePointCount: 0,
        pendingWhitespace: false,
      };
      return;
    }

    if (
      item.stage === "after-label" &&
      namesEqual(event.name, XHTML_NAMESPACE, "ol")
    ) {
      item.stage = "in-list";
      this.beginList(depth, list.navigationDepth + 1, item);
      return;
    }

    return fail("malformed-package");
  }

  private consumeEndElement(name: XmlExpandedName): void {
    const depth = this.#elementStack.length;
    const currentName = this.#elementStack.at(-1);
    if (
      currentName === undefined ||
      currentName.namespaceUri !== name.namespaceUri ||
      currentName.localName !== name.localName
    ) {
      return fail("internal-failure");
    }

    if (this.#tocDepth !== undefined) {
      if (this.#label !== undefined) {
        if (depth === this.#label.depth) {
          this.finishLabel();
        }
      } else if (this.#headingDepth !== undefined) {
        if (depth === this.#headingDepth) {
          this.#headingDepth = undefined;
        }
      } else {
        const list = this.#lists.at(-1);
        if (
          list !== undefined &&
          depth === list.depth + 1 &&
          namesEqual(name, XHTML_NAMESPACE, "li")
        ) {
          this.finishListItem(list);
        } else if (
          list !== undefined &&
          depth === list.depth &&
          namesEqual(name, XHTML_NAMESPACE, "ol")
        ) {
          this.finishList(list);
        } else if (
          depth === this.#tocDepth &&
          namesEqual(name, XHTML_NAMESPACE, "nav")
        ) {
          if (this.#navigation?.stage !== "done") {
            return fail("malformed-package");
          }
          this.#navigation = undefined;
          this.#tocDepth = undefined;
        }
      }
    }

    this.#elementStack.pop();
  }

  private consumeText(text: string): void {
    if (this.#tocDepth === undefined) {
      return;
    }

    if (this.#label !== undefined) {
      this.appendLabelText(this.#label, text);
      return;
    }

    if (this.#headingDepth === undefined && NON_XML_WHITESPACE.test(text)) {
      return fail("malformed-package");
    }
  }

  private beginList(
    depth: number,
    navigationDepth: number,
    parentItem: ListItemBuilder | undefined,
  ): void {
    if (navigationDepth > this.#archive.budget.policy.maxNavigationDepth) {
      return fail("resource-limit-exceeded");
    }

    this.#lists.push({
      depth,
      navigationDepth,
      ...(parentItem === undefined ? {} : { parentItem }),
      nodes: [],
    });
  }

  private finishLabel(): void {
    const label = this.#label;
    const list = this.#lists.at(-1);
    const item = list?.currentItem;
    if (
      label === undefined ||
      item === undefined ||
      item.stage !== "in-label"
    ) {
      return fail("internal-failure");
    }

    if (label.text.length === 0 && label.fallbackTitle !== undefined) {
      this.appendLabelText(label, label.fallbackTitle);
    }
    if (label.text.length === 0) {
      return fail("malformed-package");
    }

    item.labelKind = label.kind;
    item.label = label.text;
    if (label.kind === "a") {
      if (label.href === undefined) {
        return fail("internal-failure");
      }
      item.target = this.resolveTarget(label.href);
    }
    item.stage = "after-label";
    this.#label = undefined;
  }

  private finishListItem(list: ListBuilder): void {
    const item = list.currentItem;
    if (
      item === undefined ||
      item.label === undefined ||
      item.labelKind === undefined ||
      (item.stage !== "after-label" && item.stage !== "after-list") ||
      (item.labelKind === "span" && item.stage !== "after-list")
    ) {
      return fail("malformed-package");
    }

    const children = item.children ?? Object.freeze([]);
    list.nodes.push(
      Object.freeze({
        label: item.label,
        ...(item.target === undefined ? {} : { target: item.target }),
        children,
      }),
    );
    delete list.currentItem;
  }

  private finishList(list: ListBuilder): void {
    if (
      this.#lists.at(-1) !== list ||
      list.currentItem !== undefined ||
      list.nodes.length === 0
    ) {
      return fail("malformed-package");
    }

    this.#lists.pop();
    const nodes = Object.freeze([...list.nodes]);
    if (list.parentItem === undefined) {
      if (this.#lists.length !== 0 || this.#roots !== undefined) {
        return fail("internal-failure");
      }
      this.#roots = nodes;
      if (this.#navigation?.stage !== "in-list") {
        return fail("internal-failure");
      }
      this.#navigation.stage = "done";
      return;
    }

    const parentList = this.#lists.at(-1);
    if (
      parentList?.currentItem !== list.parentItem ||
      list.parentItem.stage !== "in-list"
    ) {
      return fail("internal-failure");
    }
    list.parentItem.children = nodes;
    list.parentItem.stage = "after-list";
  }

  private appendLabelText(label: LabelBuilder, value: string): void {
    let iteration = 0;
    for (const character of value) {
      if (iteration % 4_096 === 0) {
        this.#archive.budget.checkpoint();
      }
      iteration += 1;

      if (ASCII_WHITESPACE.test(character)) {
        if (label.text.length > 0) {
          label.pendingWhitespace = true;
        }
        continue;
      }

      const codePoint = character.codePointAt(0);
      if (codePoint === undefined || codePoint <= 0x1f || codePoint === 0x7f) {
        return fail("malformed-package");
      }

      if (label.pendingWhitespace) {
        label.text += " ";
        label.codePointCount += 1;
        label.pendingWhitespace = false;
      }
      label.text += character;
      label.codePointCount += 1;
      if (label.codePointCount > MAX_BOOK_NAVIGATION_LABEL_CODE_POINTS) {
        return fail("malformed-package");
      }
    }
  }

  private resolveTarget(href: string): ParsedNavigationTarget {
    if (href !== href.trim() || /^[a-z][a-z0-9+.-]*:/iu.test(href)) {
      return fail("broken-reference");
    }

    try {
      const resolved = resolveOcfReference(
        this.#packageDocument.navigation.path,
        parseOcfReference(href, this.#archive.budget.policy),
        this.#archive.budget.policy,
      );
      const pathText = String(resolved.path);
      if (!this.#supportedDocumentPaths.has(pathText)) {
        return fail("broken-reference");
      }

      const spineItemIndex = this.#firstSpineIndexByPath.get(pathText);
      if (spineItemIndex === undefined) {
        return Object.freeze({
          kind: "non-spine",
          path: resolved.path,
          ...(resolved.fragment === undefined
            ? {}
            : { fragment: resolved.fragment }),
        });
      }

      return Object.freeze({
        kind: "spine",
        path: resolved.path,
        spineItemIndex,
        ...(resolved.fragment === undefined
          ? {}
          : { fragment: resolved.fragment }),
      });
    } catch (error: unknown) {
      return mapReferenceError(error);
    }
  }
}

export async function parseNavigationDocument(
  archive: OpenedEpubArchive,
  packageDocument: ParsedPackageDocument,
): Promise<ParsedNavigationDocument> {
  archive.budget.checkpoint();
  const bytes = await archive.readEntry(packageDocument.navigation.path, {
    maximumBytes: archive.budget.policy.maxContentDocumentBytes,
  });
  const parser = new NavigationDocumentParser(archive, packageDocument);
  createXmlEventReader(archive.budget).read(bytes, "content", (event) =>
    parser.consume(event),
  );
  return parser.complete();
}
