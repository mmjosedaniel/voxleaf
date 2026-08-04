import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import type { ParsedPackageDocument } from "../package/package-document.js";
import type {
  XmlEvent,
  XmlExpandedName,
  XmlStartElementEvent,
} from "../xml/xml-event-reader.js";
import type {
  ParsedNavigationDocument,
  ParsedNavigationNode,
} from "./navigation-document.js";
import { NavigationTargetResolver } from "./navigation-target-resolver.js";
import type { ParsedNavigationTarget } from "./navigation-target-resolver.js";

const NCX_NAMESPACE = "http://www.daisy.org/z3986/2005/ncx/";
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const MAX_NAVIGATION_LABEL_CODE_POINTS = 1_024;
const ASCII_WHITESPACE = /^[\t\n\f\r ]$/u;
const NON_XML_WHITESPACE = /[^\t\n\r ]/u;
const POSITIVE_INTEGER = /^[1-9][0-9]*$/u;
const PAGE_TARGET_TYPES = new Set(["front", "normal", "special"]);

type NcxElementKind =
  | "content"
  | "docAuthor"
  | "docTitle"
  | "head"
  | "meta"
  | "navLabel"
  | "navList"
  | "navMap"
  | "navPoint"
  | "navTarget"
  | "ncx"
  | "pageList"
  | "pageTarget"
  | "text";

interface LabelBuilder {
  text: string;
  codePointCount: number;
  pendingWhitespace: boolean;
}

interface NcxFrame {
  readonly kind: NcxElementKind;
  stage: number;
  count: number;
  readonly navigationDepth?: number;
  readonly nodes?: ParsedNavigationNode[];
  label?: string;
  target?: ParsedNavigationTarget;
  text?: LabelBuilder;
}

function fail(code: EpubArchiveErrorCode): never {
  throw new EpubArchiveError(code);
}

function isNcxName(name: XmlExpandedName, localName: string): boolean {
  return name.namespaceUri === NCX_NAMESPACE && name.localName === localName;
}

function isNcxElementKind(value: string): value is NcxElementKind {
  switch (value) {
    case "content":
    case "docAuthor":
    case "docTitle":
    case "head":
    case "meta":
    case "navLabel":
    case "navList":
    case "navMap":
    case "navPoint":
    case "navTarget":
    case "ncx":
    case "pageList":
    case "pageTarget":
    case "text":
      return true;
    default:
      return false;
  }
}

function hasForbiddenControlCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (
      codePoint === undefined ||
      codePoint <= 0x08 ||
      codePoint === 0x0b ||
      codePoint === 0x0c ||
      (codePoint >= 0x0e && codePoint <= 0x1f) ||
      codePoint === 0x7f
    ) {
      return true;
    }
  }
  return false;
}

export class NcxNavigationParser {
  readonly #archive: OpenedEpubArchive;
  readonly #targetResolver: NavigationTargetResolver;
  readonly #frames: NcxFrame[] = [];
  readonly #ids = new Set<string>();
  #roots: readonly ParsedNavigationNode[] | undefined;
  #sawRoot = false;
  #completedRoot = false;
  #navigationNodeCount = 0;

  public constructor(
    archive: OpenedEpubArchive,
    packageDocument: ParsedPackageDocument,
  ) {
    this.#archive = archive;
    this.#targetResolver = new NavigationTargetResolver(
      archive,
      packageDocument,
    );
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
      !this.#completedRoot ||
      this.#frames.length !== 0 ||
      this.#roots === undefined
    ) {
      return fail("malformed-package");
    }

    return Object.freeze({ roots: this.#roots });
  }

  private consumeStartElement(event: XmlStartElementEvent): void {
    if (
      event.name.namespaceUri !== NCX_NAMESPACE ||
      !isNcxElementKind(event.name.localName)
    ) {
      return fail("malformed-package");
    }

    const parent = this.#frames.at(-1);
    let frame: NcxFrame;
    if (parent === undefined) {
      frame = this.beginRoot(event);
    } else {
      frame = this.beginChild(parent, event);
    }
    this.#frames.push(frame);
  }

  private consumeEndElement(name: XmlExpandedName): void {
    const frame = this.#frames.at(-1);
    if (frame === undefined || !isNcxName(name, frame.kind)) {
      return fail("internal-failure");
    }

    this.#frames.pop();
    this.finishFrame(frame, this.#frames.at(-1));
  }

  private consumeText(text: string): void {
    const frame = this.#frames.at(-1);
    if (frame?.kind === "text" && frame.text !== undefined) {
      this.appendLabelText(frame.text, text);
      return;
    }

    if (NON_XML_WHITESPACE.test(text)) {
      return fail("malformed-package");
    }
  }

  private beginRoot(event: XmlStartElementEvent): NcxFrame {
    if (
      this.#sawRoot ||
      this.#completedRoot ||
      event.name.localName !== "ncx"
    ) {
      return fail("malformed-package");
    }

    const attributes = this.readAttributes(event, ["version"], true);
    if (attributes.get("version") !== "2005-1") {
      return fail("malformed-package");
    }
    const language = attributes.get("xml:lang");
    if (language !== undefined) {
      this.validateNonemptyValue(language);
    }

    this.#sawRoot = true;
    return { kind: "ncx", stage: 0, count: 0 };
  }

  private beginChild(parent: NcxFrame, event: XmlStartElementEvent): NcxFrame {
    switch (parent.kind) {
      case "ncx":
        return this.beginRootChild(parent, event);
      case "head":
        return this.beginHeadChild(parent, event);
      case "docTitle":
      case "docAuthor":
      case "navLabel":
        return this.beginTextChild(parent, event);
      case "navMap":
      case "navPoint":
        return this.beginNavigationChild(parent, event);
      case "pageList":
        return this.beginPageListChild(parent, event);
      case "navList":
        return this.beginNavListChild(parent, event);
      case "pageTarget":
      case "navTarget":
        return this.beginTargetChild(parent, event);
      case "content":
      case "meta":
      case "text":
        return fail("malformed-package");
    }
  }

  private beginRootChild(
    parent: NcxFrame,
    event: XmlStartElementEvent,
  ): NcxFrame {
    switch (event.name.localName) {
      case "head":
        if (parent.stage !== 0) return fail("malformed-package");
        this.requireNoAttributes(event);
        parent.stage = 1;
        return { kind: "head", stage: 0, count: 0 };
      case "docTitle":
        if (parent.stage !== 1) return fail("malformed-package");
        this.readOptionalId(event, []);
        parent.stage = 2;
        return { kind: "docTitle", stage: 0, count: 0 };
      case "docAuthor":
        if (parent.stage !== 2) return fail("malformed-package");
        this.readOptionalId(event, []);
        return { kind: "docAuthor", stage: 0, count: 0 };
      case "navMap":
        if (parent.stage !== 2) return fail("malformed-package");
        this.readOptionalIdAndClass(event);
        parent.stage = 3;
        return { kind: "navMap", stage: 0, count: 0, nodes: [] };
      case "pageList":
        if (parent.stage !== 3) return fail("malformed-package");
        this.readOptionalIdAndClass(event);
        parent.stage = 4;
        return { kind: "pageList", stage: 0, count: 0 };
      case "navList":
        if (parent.stage !== 3 && parent.stage !== 4 && parent.stage !== 5) {
          return fail("malformed-package");
        }
        this.readOptionalIdAndClass(event);
        parent.stage = 5;
        return { kind: "navList", stage: 0, count: 0 };
      default:
        return fail("malformed-package");
    }
  }

  private beginHeadChild(
    parent: NcxFrame,
    event: XmlStartElementEvent,
  ): NcxFrame {
    if (event.name.localName !== "meta") {
      return fail("malformed-package");
    }
    const attributes = this.readAttributes(event, [
      "content",
      "name",
      "scheme",
    ]);
    this.validateNonemptyValue(this.requireAttribute(attributes, "name"));
    this.validateNonemptyValue(this.requireAttribute(attributes, "content"));
    const scheme = attributes.get("scheme");
    if (scheme !== undefined) this.validateNonemptyValue(scheme);
    parent.count += 1;
    return { kind: "meta", stage: 0, count: 0 };
  }

  private beginTextChild(
    parent: NcxFrame,
    event: XmlStartElementEvent,
  ): NcxFrame {
    if (event.name.localName !== "text" || parent.stage !== 0) {
      return fail("malformed-package");
    }
    this.requireNoAttributes(event);
    parent.stage = 1;
    return {
      kind: "text",
      stage: 0,
      count: 0,
      text: { text: "", codePointCount: 0, pendingWhitespace: false },
    };
  }

  private beginNavigationChild(
    parent: NcxFrame,
    event: XmlStartElementEvent,
  ): NcxFrame {
    if (parent.kind === "navMap") {
      if (event.name.localName !== "navPoint") {
        return fail("malformed-package");
      }
      return this.beginNavPoint(event, 1);
    }

    if (event.name.localName === "navLabel" && parent.stage === 0) {
      this.requireNoAttributes(event);
      parent.stage = 1;
      return { kind: "navLabel", stage: 0, count: 0 };
    }
    if (event.name.localName === "content" && parent.stage === 1) {
      parent.stage = 2;
      parent.target = this.readContentTarget(event);
      return { kind: "content", stage: 0, count: 0 };
    }
    if (event.name.localName === "navPoint" && parent.stage === 2) {
      if (parent.navigationDepth === undefined) {
        return fail("internal-failure");
      }
      return this.beginNavPoint(event, parent.navigationDepth + 1);
    }
    return fail("malformed-package");
  }

  private beginNavPoint(
    event: XmlStartElementEvent,
    navigationDepth: number,
  ): NcxFrame {
    this.observeNavigationNode();
    if (navigationDepth > this.#archive.budget.policy.maxNavigationDepth) {
      return fail("resource-limit-exceeded");
    }
    this.readNavigationNodeAttributes(event);
    return {
      kind: "navPoint",
      stage: 0,
      count: 0,
      navigationDepth,
      nodes: [],
    };
  }

  private beginPageListChild(
    parent: NcxFrame,
    event: XmlStartElementEvent,
  ): NcxFrame {
    if (event.name.localName === "navLabel" && parent.stage === 0) {
      this.requireNoAttributes(event);
      parent.stage = 1;
      return { kind: "navLabel", stage: 0, count: 0 };
    }
    if (
      event.name.localName === "pageTarget" &&
      (parent.stage === 0 || parent.stage === 1)
    ) {
      this.observeNavigationNode();
      const attributes = this.readNavigationNodeAttributes(event, [
        "type",
        "value",
      ]);
      const type = this.requireAttribute(attributes, "type");
      if (!PAGE_TARGET_TYPES.has(type)) return fail("malformed-package");
      const value = attributes.get("value");
      if (value !== undefined) this.validateNonemptyValue(value);
      parent.count += 1;
      return { kind: "pageTarget", stage: 0, count: 0 };
    }
    return fail("malformed-package");
  }

  private beginNavListChild(
    parent: NcxFrame,
    event: XmlStartElementEvent,
  ): NcxFrame {
    if (event.name.localName === "navLabel" && parent.stage === 0) {
      this.requireNoAttributes(event);
      parent.stage = 1;
      return { kind: "navLabel", stage: 0, count: 0 };
    }
    if (event.name.localName === "navTarget" && parent.stage === 1) {
      this.observeNavigationNode();
      this.readNavigationNodeAttributes(event);
      parent.count += 1;
      return { kind: "navTarget", stage: 0, count: 0 };
    }
    return fail("malformed-package");
  }

  private beginTargetChild(
    parent: NcxFrame,
    event: XmlStartElementEvent,
  ): NcxFrame {
    if (event.name.localName === "navLabel" && parent.stage === 0) {
      this.requireNoAttributes(event);
      parent.stage = 1;
      return { kind: "navLabel", stage: 0, count: 0 };
    }
    if (event.name.localName === "content" && parent.stage === 1) {
      parent.stage = 2;
      parent.target = this.readContentTarget(event);
      return { kind: "content", stage: 0, count: 0 };
    }
    return fail("malformed-package");
  }

  private finishFrame(frame: NcxFrame, parent: NcxFrame | undefined): void {
    switch (frame.kind) {
      case "ncx":
        if (parent !== undefined || frame.stage < 3) {
          return fail("malformed-package");
        }
        this.#completedRoot = true;
        return;
      case "head":
        if (frame.count === 0) return fail("malformed-package");
        return;
      case "docTitle":
      case "docAuthor":
        if (frame.stage !== 1 || frame.label === undefined) {
          return fail("malformed-package");
        }
        return;
      case "navMap":
        if (frame.nodes === undefined || frame.nodes.length === 0) {
          return fail("malformed-package");
        }
        this.#roots = Object.freeze([...frame.nodes]);
        return;
      case "navPoint":
        this.finishNavPoint(frame, parent);
        return;
      case "pageList":
        if (frame.count === 0) return fail("malformed-package");
        return;
      case "navList":
        if (
          frame.stage !== 1 ||
          frame.label === undefined ||
          frame.count === 0
        ) {
          return fail("malformed-package");
        }
        return;
      case "pageTarget":
      case "navTarget":
        if (
          frame.stage !== 2 ||
          frame.label === undefined ||
          frame.target === undefined
        ) {
          return fail("malformed-package");
        }
        return;
      case "navLabel":
        if (
          frame.stage !== 1 ||
          frame.label === undefined ||
          parent === undefined
        ) {
          return fail("malformed-package");
        }
        parent.label = frame.label;
        return;
      case "text":
        if (
          frame.text === undefined ||
          frame.text.text.length === 0 ||
          parent === undefined
        ) {
          return fail("malformed-package");
        }
        parent.label = frame.text.text;
        return;
      case "content":
      case "meta":
        return;
    }
  }

  private finishNavPoint(frame: NcxFrame, parent: NcxFrame | undefined): void {
    if (
      frame.stage !== 2 ||
      frame.label === undefined ||
      frame.target === undefined ||
      frame.nodes === undefined ||
      parent?.nodes === undefined
    ) {
      return fail("malformed-package");
    }
    parent.nodes.push(
      Object.freeze({
        label: frame.label,
        target: frame.target,
        children: Object.freeze([...frame.nodes]),
      }),
    );
  }

  private readContentTarget(
    event: XmlStartElementEvent,
  ): ParsedNavigationTarget {
    const attributes = this.readAttributes(event, ["src"]);
    const source = this.requireAttribute(attributes, "src");
    if (source.length === 0) return fail("broken-reference");
    return this.#targetResolver.resolve(source);
  }

  private readNavigationNodeAttributes(
    event: XmlStartElementEvent,
    additional: readonly string[] = [],
  ): Map<string, string> {
    const attributes = this.readAttributes(event, [
      "class",
      "id",
      "playOrder",
      ...additional,
    ]);
    const id = attributes.get("id");
    if (id !== undefined) this.registerId(id);
    const className = attributes.get("class");
    if (className !== undefined) this.validateNonemptyValue(className);
    const playOrder = attributes.get("playOrder");
    if (playOrder !== undefined && !POSITIVE_INTEGER.test(playOrder)) {
      return fail("malformed-package");
    }
    return attributes;
  }

  private readOptionalIdAndClass(event: XmlStartElementEvent): void {
    const attributes = this.readAttributes(event, ["class", "id"]);
    const id = attributes.get("id");
    if (id !== undefined) this.registerId(id);
    const className = attributes.get("class");
    if (className !== undefined) this.validateNonemptyValue(className);
  }

  private readOptionalId(
    event: XmlStartElementEvent,
    additional: readonly string[],
  ): void {
    const attributes = this.readAttributes(event, ["id", ...additional]);
    const id = attributes.get("id");
    if (id !== undefined) this.registerId(id);
  }

  private readAttributes(
    event: XmlStartElementEvent,
    allowed: readonly string[],
    allowXmlLang = false,
  ): Map<string, string> {
    const allowedNames = new Set(allowed);
    const values = new Map<string, string>();
    for (const candidate of event.attributes) {
      this.#archive.budget.checkpoint();
      const isXmlLang =
        allowXmlLang &&
        candidate.namespaceUri === XML_NAMESPACE &&
        candidate.localName === "lang";
      if (
        !isXmlLang &&
        (candidate.namespaceUri !== "" ||
          !allowedNames.has(candidate.localName))
      ) {
        return fail("malformed-package");
      }
      const key = isXmlLang ? "xml:lang" : candidate.localName;
      if (values.has(key)) return fail("malformed-package");
      values.set(key, candidate.value);
    }
    return values;
  }

  private requireNoAttributes(event: XmlStartElementEvent): void {
    if (event.attributes.length !== 0) return fail("malformed-package");
  }

  private requireAttribute(
    attributes: ReadonlyMap<string, string>,
    name: string,
  ): string {
    const value = attributes.get(name);
    if (value === undefined) return fail("malformed-package");
    return value;
  }

  private registerId(value: string): void {
    if (
      value.length === 0 ||
      value !== value.trim() ||
      /[\t\n\r ]/u.test(value) ||
      hasForbiddenControlCharacter(value) ||
      this.#ids.has(value)
    ) {
      return fail("malformed-package");
    }
    this.#ids.add(value);
  }

  private validateNonemptyValue(value: string): void {
    if (
      value.trim().length === 0 ||
      value !== value.trim() ||
      hasForbiddenControlCharacter(value)
    ) {
      return fail("malformed-package");
    }
  }

  private observeNavigationNode(): void {
    this.#navigationNodeCount += 1;
    if (
      this.#navigationNodeCount > this.#archive.budget.policy.maxNavigationNodes
    ) {
      return fail("resource-limit-exceeded");
    }
  }

  private appendLabelText(label: LabelBuilder, value: string): void {
    let iteration = 0;
    for (const character of value) {
      if (iteration % 4_096 === 0) this.#archive.budget.checkpoint();
      iteration += 1;

      if (ASCII_WHITESPACE.test(character)) {
        if (label.text.length > 0) label.pendingWhitespace = true;
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
      if (label.codePointCount > MAX_NAVIGATION_LABEL_CODE_POINTS) {
        return fail("malformed-package");
      }
    }
  }
}
