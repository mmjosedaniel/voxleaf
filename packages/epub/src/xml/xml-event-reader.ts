import { SaxesParser } from "saxes";
import type { SaxesAttributeNS, SaxesTagNS, XMLDecl } from "saxes";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import type { EpubProcessingBudget } from "../security/processing-budget.js";

const XML_INPUT_CHUNK_BYTES = 64 * 1024;
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
const XINCLUDE_NAMESPACE = "http://www.w3.org/2001/XInclude";
const EXTERNAL_RESOURCE_PROCESSING_INSTRUCTIONS = new Set([
  "xml-model",
  "xml-stylesheet",
]);

const SAXES_OPTIONS = Object.freeze({
  defaultXMLVersion: "1.0" as const,
  forceXMLVersion: true as const,
  position: false,
  xmlns: true as const,
});

type XmlByteEncoding = "utf-16be" | "utf-16le" | "utf-8";

export type XmlDocumentKind = "container-or-package" | "content";

export interface XmlExpandedName {
  readonly namespaceUri: string;
  readonly localName: string;
}

export interface XmlEventAttribute extends XmlExpandedName {
  readonly value: string;
}

export interface XmlStartElementEvent {
  readonly type: "start-element";
  readonly name: XmlExpandedName;
  readonly attributes: readonly XmlEventAttribute[];
}

export interface XmlEndElementEvent {
  readonly type: "end-element";
  readonly name: XmlExpandedName;
}

export interface XmlTextEvent {
  readonly type: "text";
  readonly text: string;
}

export type XmlEvent = XmlStartElementEvent | XmlEndElementEvent | XmlTextEvent;

export type XmlEventConsumer = (event: XmlEvent) => void;

export interface XmlDocumentSummary {
  readonly elementCount: number;
  readonly nodeCount: number;
  readonly decodedTextBytes: number;
}

export interface XmlEventReader {
  /**
   * Streams bounded events synchronously. The consumer must keep any derived
   * state private and discard it unless this method returns successfully.
   */
  read(
    xmlBytes: Uint8Array,
    kind: XmlDocumentKind,
    consume: XmlEventConsumer,
  ): XmlDocumentSummary;
}

class XmlConsumerFailure {}

function fail(code: EpubArchiveErrorCode): never {
  throw new EpubArchiveError(code);
}

function addSafe(left: number, right: number): number {
  if (
    !Number.isSafeInteger(right) ||
    right < 0 ||
    left > Number.MAX_SAFE_INTEGER - right
  ) {
    return fail("internal-failure");
  }

  return left + right;
}

function maximumDocumentBytes(
  kind: XmlDocumentKind,
  budget: EpubProcessingBudget,
): number {
  switch (kind) {
    case "container-or-package":
      return budget.policy.maxContainerOrPackageDocumentBytes;
    case "content":
      return budget.policy.maxContentDocumentBytes;
    default:
      return fail("internal-failure");
  }
}

function detectEncoding(bytes: Uint8Array): XmlByteEncoding {
  if (
    bytes.byteLength >= 4 &&
    ((bytes[0] === 0x00 &&
      bytes[1] === 0x00 &&
      bytes[2] === 0xfe &&
      bytes[3] === 0xff) ||
      (bytes[0] === 0xff &&
        bytes[1] === 0xfe &&
        bytes[2] === 0x00 &&
        bytes[3] === 0x00))
  ) {
    return fail("malformed-xml");
  }

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return "utf-16be";
  }

  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return "utf-16le";
  }

  if (
    bytes.byteLength >= 4 &&
    bytes[0] === 0x00 &&
    bytes[1] === 0x3c &&
    bytes[2] === 0x00 &&
    bytes[3] === 0x3f
  ) {
    return "utf-16be";
  }

  if (
    bytes.byteLength >= 4 &&
    bytes[0] === 0x3c &&
    bytes[1] === 0x00 &&
    bytes[2] === 0x3f &&
    bytes[3] === 0x00
  ) {
    return "utf-16le";
  }

  return "utf-8";
}

function declarationMatchesEncoding(
  declaredEncoding: string,
  actualEncoding: XmlByteEncoding,
): boolean {
  const normalized = declaredEncoding.toLowerCase();

  switch (actualEncoding) {
    case "utf-8":
      return normalized === "utf-8";
    case "utf-16be":
      return normalized === "utf-16" || normalized === "utf-16be";
    case "utf-16le":
      return normalized === "utf-16" || normalized === "utf-16le";
  }
}

function validateXmlDeclaration(
  declaration: XMLDecl,
  encoding: XmlByteEncoding,
): void {
  if (
    declaration.version !== "1.0" ||
    (declaration.encoding !== undefined &&
      !declarationMatchesEncoding(declaration.encoding, encoding))
  ) {
    return fail("malformed-xml");
  }
}

function expandedName(tag: SaxesTagNS): XmlExpandedName {
  return Object.freeze({
    namespaceUri: tag.uri,
    localName: tag.local,
  });
}

function eventAttribute(attribute: SaxesAttributeNS): XmlEventAttribute {
  return Object.freeze({
    namespaceUri: attribute.uri,
    localName: attribute.local,
    value: attribute.value,
  });
}

function emitSafely(consume: XmlEventConsumer, event: XmlEvent): void {
  try {
    consume(event);
  } catch (error: unknown) {
    if (error instanceof EpubArchiveError) {
      throw error;
    }

    throw new XmlConsumerFailure();
  }
}

function decodedUtf8ByteLength(
  text: string,
  budget: EpubProcessingBudget,
): number {
  let byteLength = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (index % 4_096 === 0) {
      budget.checkpoint();
    }

    const codeUnit = text.charCodeAt(index);
    if (codeUnit <= 0x7f) {
      byteLength += 1;
    } else if (codeUnit <= 0x7ff) {
      byteLength += 2;
    } else if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const trailingCodeUnit = text.charCodeAt(index + 1);
      if (trailingCodeUnit < 0xdc00 || trailingCodeUnit > 0xdfff) {
        return fail("malformed-xml");
      }

      byteLength += 4;
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return fail("malformed-xml");
    } else {
      byteLength += 3;
    }
  }

  return byteLength;
}

class XmlDocumentBudget {
  readonly #budget: EpubProcessingBudget;
  #depth = 0;
  #elementCount = 0;
  #nodeCount = 0;
  #decodedTextBytes = 0;

  public constructor(budget: EpubProcessingBudget) {
    this.#budget = budget;
  }

  public beginElement(attributeCount: number): void {
    this.#budget.checkpoint();
    if (!Number.isSafeInteger(attributeCount) || attributeCount < 0) {
      return fail("internal-failure");
    }

    const nextDepth = this.#depth + 1;
    if (
      nextDepth > this.#budget.policy.maxXmlElementDepth ||
      attributeCount > this.#budget.policy.maxXmlAttributesPerElement
    ) {
      return fail("resource-limit-exceeded");
    }

    this.#depth = nextDepth;
    this.#elementCount = addSafe(this.#elementCount, 1);
    this.observeNode();
  }

  public endElement(): void {
    this.#budget.checkpoint();
    if (this.#depth <= 0) {
      return fail("internal-failure");
    }

    this.#depth -= 1;
  }

  public observeIgnoredNode(): void {
    this.#budget.checkpoint();
    this.observeNode();
  }

  public observeText(text: string): void {
    this.#budget.checkpoint();
    this.observeNode();
    const byteLength = decodedUtf8ByteLength(text, this.#budget);
    this.#budget.observeDecodedPublicationText(byteLength);
    this.#decodedTextBytes = addSafe(this.#decodedTextBytes, byteLength);
  }

  public complete(): XmlDocumentSummary {
    this.#budget.checkpoint();
    if (this.#depth !== 0) {
      return fail("internal-failure");
    }

    return Object.freeze({
      elementCount: this.#elementCount,
      nodeCount: this.#nodeCount,
      decodedTextBytes: this.#decodedTextBytes,
    });
  }

  private observeNode(): void {
    const nextNodeCount = addSafe(this.#nodeCount, 1);
    if (nextNodeCount > this.#budget.policy.maxXmlNodesPerDocument) {
      return fail("resource-limit-exceeded");
    }

    this.#nodeCount = nextNodeCount;
  }
}

function decodeChunk(
  decoder: TextDecoder,
  bytes: Uint8Array | undefined,
): string {
  try {
    return bytes === undefined
      ? decoder.decode()
      : decoder.decode(bytes, { stream: true });
  } catch {
    return fail("malformed-xml");
  }
}

function mapXmlError(
  error: unknown,
  budget: EpubProcessingBudget,
): EpubArchiveError {
  if (error instanceof EpubArchiveError) {
    return error;
  }

  if (error instanceof XmlConsumerFailure) {
    return new EpubArchiveError("internal-failure");
  }

  try {
    budget.checkpoint();
  } catch (checkpointError: unknown) {
    if (checkpointError instanceof EpubArchiveError) {
      return checkpointError;
    }
  }

  return new EpubArchiveError("malformed-xml");
}

function readXmlDocument(
  xmlBytes: Uint8Array,
  kind: XmlDocumentKind,
  consume: XmlEventConsumer,
  budget: EpubProcessingBudget,
): XmlDocumentSummary {
  try {
    budget.checkpoint();
    if (!(xmlBytes instanceof Uint8Array) || typeof consume !== "function") {
      return fail("internal-failure");
    }

    if (xmlBytes.byteLength > maximumDocumentBytes(kind, budget)) {
      return fail("resource-limit-exceeded");
    }

    const encoding = detectEncoding(xmlBytes);
    const decoder = new TextDecoder(encoding, {
      fatal: true,
      ignoreBOM: false,
    });
    const documentBudget = new XmlDocumentBudget(budget);
    const parser = new SaxesParser(SAXES_OPTIONS);

    parser.on("xmldecl", (declaration) => {
      budget.checkpoint();
      validateXmlDeclaration(declaration, encoding);
    });
    parser.on("doctype", () => fail("malformed-xml"));
    parser.on("error", () => fail("malformed-xml"));
    parser.on("opentag", (tag) => {
      const attributes = Object.values(tag.attributes);
      documentBudget.beginElement(attributes.length);
      if (tag.uri === XINCLUDE_NAMESPACE) {
        return fail("malformed-xml");
      }

      const semanticAttributes = Object.freeze(
        attributes
          .filter((attribute) => attribute.uri !== XMLNS_NAMESPACE)
          .map(eventAttribute),
      );
      emitSafely(
        consume,
        Object.freeze({
          type: "start-element",
          name: expandedName(tag),
          attributes: semanticAttributes,
        }),
      );
    });
    parser.on("closetag", (tag) => {
      documentBudget.endElement();
      emitSafely(
        consume,
        Object.freeze({
          type: "end-element",
          name: expandedName(tag),
        }),
      );
    });
    parser.on("text", (text) => {
      if (text.length === 0) {
        return;
      }

      documentBudget.observeText(text);
      emitSafely(consume, Object.freeze({ type: "text", text }));
    });
    parser.on("cdata", (text) => {
      documentBudget.observeText(text);
      emitSafely(consume, Object.freeze({ type: "text", text }));
    });
    parser.on("comment", () => documentBudget.observeIgnoredNode());
    parser.on("processinginstruction", (instruction) => {
      documentBudget.observeIgnoredNode();
      if (
        EXTERNAL_RESOURCE_PROCESSING_INSTRUCTIONS.has(
          instruction.target.toLowerCase(),
        )
      ) {
        return fail("malformed-xml");
      }
    });

    for (
      let offset = 0;
      offset < xmlBytes.byteLength;
      offset += XML_INPUT_CHUNK_BYTES
    ) {
      budget.checkpoint();
      const decoded = decodeChunk(
        decoder,
        xmlBytes.subarray(
          offset,
          Math.min(offset + XML_INPUT_CHUNK_BYTES, xmlBytes.byteLength),
        ),
      );
      if (decoded.length > 0) {
        parser.write(decoded);
      }
      budget.checkpoint();
    }

    const finalDecoded = decodeChunk(decoder, undefined);
    if (finalDecoded.length > 0) {
      parser.write(finalDecoded);
    }
    parser.close();
    return documentBudget.complete();
  } catch (error: unknown) {
    throw mapXmlError(error, budget);
  }
}

export function createXmlEventReader(
  budget: EpubProcessingBudget,
): XmlEventReader {
  return Object.freeze({
    read: (
      xmlBytes: Uint8Array,
      kind: XmlDocumentKind,
      consume: XmlEventConsumer,
    ) => readXmlDocument(xmlBytes, kind, consume, budget),
  });
}
