import { afterEach, describe, expect, it, vi } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import { createXmlEventReader } from "./xml-event-reader.js";
import type {
  XmlDocumentKind,
  XmlDocumentSummary,
  XmlEvent,
} from "./xml-event-reader.js";

const UTF8_BOM = Uint8Array.of(0xef, 0xbb, 0xbf);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("bounded namespace-aware XML events", () => {
  it("emits immutable expanded names and semantic attributes in source order", () => {
    const { events, summary } = readXml(
      '<package xmlns="urn:package" xmlns:dc="urn:dc" xml:lang="en" id="p"><dc:title>Safe</dc:title></package>',
    );

    expect(events).toEqual([
      {
        type: "start-element",
        name: { namespaceUri: "urn:package", localName: "package" },
        attributes: [
          {
            namespaceUri: "http://www.w3.org/XML/1998/namespace",
            localName: "lang",
            value: "en",
          },
          { namespaceUri: "", localName: "id", value: "p" },
        ],
      },
      {
        type: "start-element",
        name: { namespaceUri: "urn:dc", localName: "title" },
        attributes: [],
      },
      { type: "text", text: "Safe" },
      {
        type: "end-element",
        name: { namespaceUri: "urn:dc", localName: "title" },
      },
      {
        type: "end-element",
        name: { namespaceUri: "urn:package", localName: "package" },
      },
    ]);
    expect(summary).toEqual({
      elementCount: 2,
      nodeCount: 3,
      decodedTextBytes: 4,
    });
    expect(Object.isFrozen(summary)).toBe(true);
    for (const event of events) {
      expect(Object.isFrozen(event)).toBe(true);
      if (event.type !== "text") {
        expect(Object.isFrozen(event.name)).toBe(true);
      }
      if (event.type === "start-element") {
        expect(Object.isFrozen(event.attributes)).toBe(true);
        expect(event.attributes.every(Object.isFrozen)).toBe(true);
      }
    }
  });

  it("uses namespace URIs rather than caller-selected prefixes", () => {
    const first = readXml('<a:item xmlns:a="urn:item"/>').events;
    const second = readXml('<b:item xmlns:b="urn:item"/>').events;

    expect(first).toEqual(second);
  });

  it("emits built-in entity and CDATA content as text without a DOM", () => {
    const domParser = vi.fn(() => {
      throw new Error("DOMParser must not be constructed");
    });
    vi.stubGlobal("DOMParser", domParser);

    const { events, summary } = readXml(
      "<root>A&amp;B<![CDATA[<safe>]]></root>",
    );

    expect(events.filter(({ type }) => type === "text")).toEqual([
      { type: "text", text: "A&B" },
      { type: "text", text: "<safe>" },
    ]);
    expect(summary.decodedTextBytes).toBe(9);
    expect(domParser).not.toHaveBeenCalled();
  });

  it.each([
    [
      "UTF-8 with BOM",
      concatBytes(
        UTF8_BOM,
        encodeUtf8('<?xml version="1.0" encoding="UTF-8"?><root>safe</root>'),
      ),
    ],
    [
      "UTF-16LE with BOM",
      encodeUtf16(
        '<?xml version="1.0" encoding="UTF-16"?><root>safe</root>',
        "little",
        true,
      ),
    ],
    [
      "UTF-16BE with BOM",
      encodeUtf16(
        '<?xml version="1.0" encoding="UTF-16BE"?><root>safe</root>',
        "big",
        true,
      ),
    ],
    [
      "UTF-16LE declaration signature",
      encodeUtf16(
        '<?xml version="1.0" encoding="UTF-16LE"?><root>safe</root>',
        "little",
        false,
      ),
    ],
    [
      "UTF-16BE declaration signature",
      encodeUtf16(
        '<?xml version="1.0" encoding="UTF-16"?><root>safe</root>',
        "big",
        false,
      ),
    ],
  ])("strictly decodes %s", (_name, bytes) => {
    expect(readXmlBytes(bytes).events).toContainEqual({
      type: "text",
      text: "safe",
    });
  });

  it.each([
    ['<?xml version="1.1"?><root/>', "XML 1.1"],
    [
      '<?xml version="1.0" encoding="ISO-8859-1"?><root/>',
      "unsupported encoding",
    ],
    ['<?xml version="1.0" encoding="UTF-16"?><root/>', "mismatched encoding"],
  ])("rejects %s declarations without exposing details", (xml) => {
    expectXmlError(() => readXml(xml), "malformed-xml");
  });

  it("rejects malformed UTF-8 and unsupported UTF-32 byte signatures", () => {
    expectXmlError(
      () =>
        readXmlBytes(
          concatBytes(encodeUtf8("<root>"), Uint8Array.of(0xc3, 0x28)),
        ),
      "malformed-xml",
    );
    expectXmlError(
      () => readXmlBytes(Uint8Array.of(0x00, 0x00, 0xfe, 0xff)),
      "malformed-xml",
    );
  });

  it.each([
    '<!DOCTYPE root [<!ENTITY private-canary "secret">]><root/>',
    '<!DOCTYPE root SYSTEM "https://private-canary.invalid/root.dtd"><root/>',
    "<root>&private-canary;</root>",
    '<xi:include xmlns:xi="http://www.w3.org/2001/XInclude" href="https://private-canary.invalid/chapter.xml"/>',
    '<?xml-stylesheet href="https://private-canary.invalid/style.css"?><root/>',
    '<?xml-model href="https://private-canary.invalid/model.rng"?><root/>',
  ])("rejects active or external XML constructs without resolution", (xml) => {
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("Worker", worker);

    const error = expectXmlError(() => readXml(xml), "malformed-xml");

    expect(error.message).not.toContain("private-canary");
    expect(fetch).not.toHaveBeenCalled();
    expect(worker).not.toHaveBeenCalled();
  });

  it("enforces exact and maximum-plus-one document byte limits", () => {
    const xml = "<root/>";
    const bytes = encodeUtf8(xml);
    const exactBudget = createEpubProcessingBudget({
      policy: { maxContainerOrPackageDocumentBytes: bytes.byteLength },
    });

    expect(() =>
      createXmlEventReader(exactBudget).read(
        bytes,
        "container-or-package",
        () => undefined,
      ),
    ).not.toThrow();

    const aboveBudget = createEpubProcessingBudget({
      policy: { maxContainerOrPackageDocumentBytes: bytes.byteLength - 1 },
    });
    expectXmlError(
      () =>
        createXmlEventReader(aboveBudget).read(
          bytes,
          "container-or-package",
          () => undefined,
        ),
      "resource-limit-exceeded",
    );
  });

  it("enforces exact and maximum-plus-one element depth", () => {
    const exactBudget = createEpubProcessingBudget({
      policy: { maxXmlElementDepth: 2 },
    });
    expect(() =>
      createXmlEventReader(exactBudget).read(
        encodeUtf8("<root><child/></root>"),
        "content",
        () => undefined,
      ),
    ).not.toThrow();

    const aboveBudget = createEpubProcessingBudget({
      policy: { maxXmlElementDepth: 2 },
    });
    expectXmlError(
      () =>
        createXmlEventReader(aboveBudget).read(
          encodeUtf8("<root><child><leaf/></child></root>"),
          "content",
          () => undefined,
        ),
      "resource-limit-exceeded",
    );
  });

  it("counts namespace declarations in the per-element attribute limit", () => {
    const xml = '<root xmlns="urn:root" a="" b=""/>';
    const exactBudget = createEpubProcessingBudget({
      policy: { maxXmlAttributesPerElement: 3 },
    });
    expect(() =>
      createXmlEventReader(exactBudget).read(
        encodeUtf8(xml),
        "content",
        () => undefined,
      ),
    ).not.toThrow();

    const aboveBudget = createEpubProcessingBudget({
      policy: { maxXmlAttributesPerElement: 2 },
    });
    expectXmlError(
      () =>
        createXmlEventReader(aboveBudget).read(
          encodeUtf8(xml),
          "content",
          () => undefined,
        ),
      "resource-limit-exceeded",
    );
  });

  it("enforces element, text, comment, and processing-instruction node counts", () => {
    const xml = "<root>text<!--comment--><?safe local?></root>";
    const exactBudget = createEpubProcessingBudget({
      policy: { maxXmlNodesPerDocument: 4 },
    });
    const summary = createXmlEventReader(exactBudget).read(
      encodeUtf8(xml),
      "content",
      () => undefined,
    );
    expect(summary.nodeCount).toBe(4);

    const aboveBudget = createEpubProcessingBudget({
      policy: { maxXmlNodesPerDocument: 3 },
    });
    expectXmlError(
      () =>
        createXmlEventReader(aboveBudget).read(
          encodeUtf8(xml),
          "content",
          () => undefined,
        ),
      "resource-limit-exceeded",
    );
  });

  it("counts decoded text as UTF-8 bytes across documents", () => {
    const budget = createEpubProcessingBudget({
      policy: { maxDecodedPublicationTextBytes: 4 },
    });
    const reader = createXmlEventReader(budget);

    const summary = reader.read(
      encodeUtf8("<root>éab</root>"),
      "content",
      () => undefined,
    );

    expect(summary.decodedTextBytes).toBe(4);
    expect(budget.getSnapshot().decodedPublicationTextBytes).toBe(4);
    expectXmlError(
      () =>
        reader.read(encodeUtf8("<root>x</root>"), "content", () => undefined),
      "resource-limit-exceeded",
    );
    expect(budget.getSnapshot().decodedPublicationTextBytes).toBe(4);
  });

  it("stops at an AbortSignal checkpoint between events", () => {
    const controller = new AbortController();
    const budget = createEpubProcessingBudget({ signal: controller.signal });
    const events: XmlEvent[] = [];

    const error = expectXmlError(
      () =>
        createXmlEventReader(budget).read(
          encodeUtf8("<root><child/></root>"),
          "content",
          (event) => {
            events.push(event);
            controller.abort("private-canary");
          },
        ),
      "cancelled",
    );

    expect(events).toHaveLength(1);
    expect(error.message).not.toContain("private-canary");
  });

  it("allows the exact deadline and cancels at deadline plus one", () => {
    let exactNowMs = 0;
    const exactBudget = createEpubProcessingBudget({
      policy: { maxProcessingTimeMs: 1 },
      clock: { now: () => exactNowMs },
    });
    expect(() =>
      createXmlEventReader(exactBudget).read(
        encodeUtf8("<root/>"),
        "content",
        (event) => {
          if (event.type === "start-element") {
            exactNowMs = 1;
          }
        },
      ),
    ).not.toThrow();

    let aboveNowMs = 0;
    const aboveBudget = createEpubProcessingBudget({
      policy: { maxProcessingTimeMs: 1 },
      clock: { now: () => aboveNowMs },
    });
    expectXmlError(
      () =>
        createXmlEventReader(aboveBudget).read(
          encodeUtf8("<root/>"),
          "content",
          (event) => {
            if (event.type === "start-element") {
              aboveNowMs = 2;
            }
          },
        ),
      "cancelled",
    );
  });

  it("maps consumer and parser failures to fixed content-free errors", () => {
    const consumerError = expectXmlError(
      () =>
        createXmlEventReader(createEpubProcessingBudget()).read(
          encodeUtf8("<root/>"),
          "content",
          () => {
            throw new Error("private-consumer-canary");
          },
        ),
      "internal-failure",
    );
    expect(consumerError.message).not.toContain("private-consumer-canary");

    const parserError = expectXmlError(
      () => readXml("<root>private-parser-canary</broken>"),
      "malformed-xml",
    );
    expect(parserError.message).not.toContain("private-parser-canary");
  });
});

function readXml(
  xml: string,
  kind: XmlDocumentKind = "content",
): {
  readonly events: readonly XmlEvent[];
  readonly summary: XmlDocumentSummary;
} {
  return readXmlBytes(encodeUtf8(xml), kind);
}

function readXmlBytes(
  bytes: Uint8Array,
  kind: XmlDocumentKind = "content",
): {
  readonly events: readonly XmlEvent[];
  readonly summary: XmlDocumentSummary;
} {
  const events: XmlEvent[] = [];
  const summary = createXmlEventReader(createEpubProcessingBudget()).read(
    bytes,
    kind,
    (event) => events.push(event),
  );

  return { events, summary };
}

function expectXmlError(
  action: () => unknown,
  code: EpubArchiveError["code"],
): EpubArchiveError {
  try {
    action();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    expect(error).toMatchObject({ code, message: code });
    expect((error as Error).cause).toBeUndefined();
    return error as EpubArchiveError;
  }

  throw new Error("expected XML read to fail");
}

function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function encodeUtf16(
  value: string,
  endian: "big" | "little",
  withBom: boolean,
): Uint8Array {
  const bomLength = withBom ? 2 : 0;
  const bytes = new Uint8Array(bomLength + value.length * 2);
  let offset = 0;

  if (withBom) {
    bytes[0] = endian === "little" ? 0xff : 0xfe;
    bytes[1] = endian === "little" ? 0xfe : 0xff;
    offset = 2;
  }

  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (endian === "little") {
      bytes[offset] = codeUnit & 0xff;
      bytes[offset + 1] = codeUnit >>> 8;
    } else {
      bytes[offset] = codeUnit >>> 8;
      bytes[offset + 1] = codeUnit & 0xff;
    }
    offset += 2;
  }

  return bytes;
}

function concatBytes(...chunks: readonly Uint8Array[]): Uint8Array {
  const output = new Uint8Array(
    chunks.reduce((length, chunk) => length + chunk.byteLength, 0),
  );
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}
