import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import { decodeOperationalErrorV1 } from "@voxleaf/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import { mapEpubFailure } from "./epub-result.js";
import { openEpubPublication } from "./open-epub-publication.js";

const encoder = new TextEncoder();
const ZIP_WRITER_OPTIONS = Object.freeze({
  dataDescriptor: false,
  extendedTimestamp: false,
  keepOrder: true,
  lastModDate: new Date("2000-01-01T00:00:00.000Z"),
  transferStreams: false,
  useCompressionStream: false,
  useWebWorkers: false,
});

const EXPECTED_OPERATIONAL_CODE = Object.freeze({
  "broken-reference": "invalid-input",
  cancelled: "operation-cancelled",
  "invalid-container": "invalid-input",
  "internal-failure": "internal-failure",
  "locator-unresolved": "invalid-input",
  "malformed-package": "invalid-input",
  "malformed-xml": "invalid-input",
  "resource-limit-exceeded": "resource-exhausted",
  "unsafe-entry": "invalid-input",
  "unsupported-layout": "unsupported-input",
  "unsupported-protection": "unsupported-input",
  "unsupported-resource": "unsupported-input",
  "unsupported-version": "unsupported-input",
} as const satisfies Readonly<Record<EpubArchiveErrorCode, string>>);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("public privacy-safe EPUB opening", () => {
  it("maps every fixed EPUB detail to the shared operational contract", () => {
    for (const [detail, operationalCode] of Object.entries(
      EXPECTED_OPERATIONAL_CODE,
    )) {
      const result = mapEpubFailure(
        new EpubArchiveError(detail as EpubArchiveErrorCode),
      );

      expect(result).toEqual({
        ok: false,
        detail,
        error: expect.objectContaining({ code: operationalCode }),
      });
      expect(decodeOperationalErrorV1(result.error)).toEqual(result.error);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.error)).toBe(true);
    }
  });

  it("maps unknown exceptions to a content-free internal failure", () => {
    const canary = "private-title/private/path.xhtml?secret=book-prose";
    const source = new Error(canary, { cause: { canary } });
    const result = mapEpubFailure(source);
    const serialized = JSON.stringify(result);

    expect(result).toEqual({
      ok: false,
      detail: "internal-failure",
      error: {
        schemaVersion: 1,
        code: "internal-failure",
        category: "internal",
        severity: "fatal",
      },
    });
    expect(Object.keys(result)).toEqual(["ok", "detail", "error"]);
    expect(serialized).not.toContain(canary);
    expect(serialized).not.toContain("message");
    expect(serialized).not.toContain("stack");
    expect(serialized).not.toContain("cause");
  });

  it("returns invalid and cancelled input as values instead of throwing", async () => {
    await expect(openEpubPublication(new Uint8Array())).resolves.toEqual({
      ok: false,
      detail: "invalid-container",
      error: {
        schemaVersion: 1,
        code: "invalid-input",
        category: "input",
        severity: "recoverable",
      },
    });

    const controller = new AbortController();
    controller.abort("private-cancellation-reason");
    await expect(
      openEpubPublication(new Uint8Array([1]), {
        signal: controller.signal,
      }),
    ).resolves.toEqual({
      ok: false,
      detail: "cancelled",
      error: {
        schemaVersion: 1,
        code: "operation-cancelled",
        category: "cancellation",
        severity: "recoverable",
      },
    });
  });

  it("releases archive state and returns no publication after a later-stage failure", async () => {
    const close = vi.spyOn(ZipReader.prototype, "close");
    const result = await openEpubPublication(
      await createMinimalEpub(`<html xmlns="http://www.w3.org/1999/xhtml">`),
    );

    expect(result).toEqual({
      ok: false,
      detail: "malformed-xml",
      error: {
        schemaVersion: 1,
        code: "invalid-input",
        category: "input",
        severity: "recoverable",
      },
    });
    expect(result).not.toHaveProperty("publication");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("assembles immutable semantic, navigation, resource, and locator output", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    const result = await openEpubPublication(await createMinimalEpub());
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`unexpected fixed failure: ${result.detail}`);
    }

    const { publication } = result;
    try {
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(publication)).toBe(true);
      expect(publication.documents.map((document) => document.id)).toEqual([
        "document:0",
        "document:1",
      ]);
      expect(publication.navigation).toEqual([
        {
          kind: "link",
          label: "Chapter One",
          target: { documentId: "document:1", fragment: "chapter-one" },
          children: [],
        },
      ]);
      expect(publication.resources).toEqual([]);
      expect(publication.locators).toHaveLength(2);
      const first = publication.locators[0];
      expect(first).toBeDefined();
      if (first === undefined) {
        throw new Error("expected a first locator");
      }
      expect(publication.resolveLocator(first.startLocator)).toEqual({
        status: "exact",
        reason: "exact",
        locator: first.startLocator,
        locatedBlock: first,
      });
      expect(worker).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await publication.close();
    }
    expect(publication.closed).toBe(true);
  });
});

async function createMinimalEpub(
  chapter = chapterDocument(),
): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const entries = [
    ["mimetype", "application/epub+zip", 0],
    [
      "META-INF/container.xml",
      `<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
      0,
    ],
    ["EPUB/package.opf", packageDocument(), 0],
    ["EPUB/nav.xhtml", navigationDocument(), 0],
    ["EPUB/text/chapter.xhtml", chapter, 0],
  ] as const;

  for (const [path, content, level] of entries) {
    await writer.add(path, new Uint8ArrayReader(encoder.encode(content)), {
      ...ZIP_WRITER_OPTIONS,
      level,
    });
  }
  return writer.close();
}

function packageDocument(): string {
  return `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:public-boundary</dc:identifier><dc:title>Synthetic public boundary</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine></package>`;
}

function navigationDocument(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><h2>Contents</h2><ol><li><a href="text/chapter.xhtml#chapter-one">Chapter One</a></li></ol></nav></body></html>`;
}

function chapterDocument(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Chapter One</title></head><body><h1 id="chapter-one">Chapter One</h1><p>Repository-authored synthetic prose.</p></body></html>`;
}
