import { ZipReader } from "@zip.js/zip.js/lib/zip-core-native.js";
import { decodeOperationalErrorV1 } from "@voxleaf/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildMinimalEpub2Fixture,
  buildMinimalEpubFixture,
  EPUB2_CANONICAL_NCX_DOCTYPE,
  EPUB2_CANONICAL_XHTML11_DOCTYPE,
  minimalEpub2Guide,
  minimalEpub2PackageDocument,
  minimalChapterDocument,
  minimalNavigationDocument,
  minimalPackageDocument,
} from "../../test-support/epub-fixture.js";
import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import { mapEpubFailure } from "./epub-result.js";
import { openEpubPublication } from "./open-epub-publication.js";

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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("public privacy-safe EPUB opening", () => {
  it("SAC-13 resolves equivalent opaque fragments to the exact public target", async () => {
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p><a href="#note?1">Literal</a><a href="#note%3F1">Encoded</a><a href="chapter.xhtml?mode=reader#note?1">Query</a><a href="https://example.invalid/#note?1">External</a></p><p id="note?1">Destination</p></body></html>',
      }),
    );
    if (!opened.ok) throw new Error("synthetic-publication-open-failed");
    const publication = opened.publication;
    try {
      const block = publication.documents.find(
        (document) => document.location.kind === "spine",
      )?.blocks[0];
      if (block?.kind !== "paragraph")
        throw new Error("expected synthetic links");
      const links = block.children.filter(
        (inline) => inline.kind === "internal-link",
      );
      expect(links).toHaveLength(2);
      const destination = publication.locators[1];
      expect(destination).toBeDefined();
      for (const link of links)
        expect(publication.resolveTarget(link.target)).toMatchObject({
          status: "exact",
          reason: "fragment",
          locator: destination!.startLocator,
        });
    } finally {
      await publication.close();
    }
  });

  it("CHAT-AUDIT F03 opens each spine occurrence of a shared XHTML fallback with its own locator", async () => {
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        packageDocument: minimalPackageDocument()
          .replace(
            "</manifest>",
            '<item id="one" href="one.bin" media-type="application/x-synthetic" fallback="chapter"/><item id="two" href="two.bin" media-type="application/x-synthetic" fallback="chapter"/></manifest>',
          )
          .replace(
            '<itemref idref="chapter"/>',
            '<itemref idref="one"/><itemref idref="two"/>',
          ),
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Shared</title></head><body><p id="shared">Shared passage.</p></body></html>',
        navigationDocument: minimalNavigationDocument().replace(
          "#chapter-one",
          "#shared",
        ),
        additionalEntries: [
          { name: "EPUB/one.bin", content: "one" },
          { name: "EPUB/two.bin", content: "two" },
        ],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const publication = result.publication;
    try {
      expect(publication.book.spine).toHaveLength(2);
      const blocks = publication.locators;
      expect(blocks).toHaveLength(2);
      expect(new Set(blocks.map((block) => block.documentId)).size).toBe(2);
      for (const [index, block] of blocks.entries()) {
        expect(block.startLocator.spineItemIndex).toBe(index);
        expect(publication.resolveLocator(block.startLocator).status).toBe(
          "exact",
        );
        expect(
          publication.resolveTarget({
            documentId: block.documentId,
            fragment: "shared",
          }),
        ).toMatchObject({ locator: block.startLocator });
        const prepared = await publication.prepareNarration({
          startLocator: block.startLocator,
          profile: "narration-bilingual-v2",
          defaultLanguage: "en",
          maximumSegments: 1,
        });
        expect(["complete", "batch"]).toContain(prepared.status);
        if (prepared.status === "complete" || prepared.status === "batch")
          expect(prepared.segments[0]?.sourceRange.start.spineItemIndex).toBe(
            index,
          );
      }
      expect(
        publication.resolveTarget(
          publication.navigation[0]!.kind === "link"
            ? publication.navigation[0]!.target
            : {},
        ),
      ).toMatchObject({ locator: blocks[0]!.startLocator });
    } finally {
      await publication.close();
    }
  });

  it("CLB-04 exposes no primary start when only auxiliary content is addressable", async () => {
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        packageDocument: minimalPackageDocument()
          .replace(
            "</manifest>",
            '<item id="aux" href="text/aux.xhtml" media-type="application/xhtml+xml"/></manifest>',
          )
          .replace(
            '<itemref idref="chapter"/>',
            '<itemref idref="aux" linear="no"/><itemref idref="chapter"/>',
          ),
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Empty</title></head><body/></html>',
        additionalEntries: [
          { name: "EPUB/text/aux.xhtml", content: minimalChapterDocument() },
        ],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    try {
      expect(result.publication.defaultStartLocator).toBeUndefined();
      const auxiliary = result.publication.locators[0]!.startLocator;
      expect(result.publication.resolveLocator(auxiliary).status).toBe("exact");
      expect(() =>
        result.publication.resolveLocator({
          ...auxiliary,
          spineItemId: "spine:missing",
          spineItemIndex: 99,
        }),
      ).toThrow(EpubArchiveError);
    } finally {
      await result.publication.close();
    }
  });
  it.each(["2.0", "3.0"] as const)(
    "CLB-04 selects primary start without reindexing auxiliary content in EPUB %s",
    async (version) => {
      for (const emptyPrimary of [false, true]) {
        const packageDocument = (
          version === "2.0"
            ? minimalEpub2PackageDocument()
            : minimalPackageDocument()
        )
          .replace(
            "</manifest>",
            '<item id="aux" href="text/aux.xhtml" media-type="application/xhtml+xml"/><item id="last" href="text/last.xhtml" media-type="application/xhtml+xml"/></manifest>',
          )
          .replace(
            '<itemref idref="chapter"/>',
            '<itemref idref="aux" linear="no"/><itemref idref="chapter"/><itemref idref="last" linear="yes"/>',
          );
        const build =
          version === "2.0"
            ? buildMinimalEpub2Fixture
            : buildMinimalEpubFixture;
        const result = await openEpubPublication(
          await build({
            packageDocument,
            ...(emptyPrimary
              ? {
                  chapterDocument:
                    '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Empty</title></head><body/></html>',
                }
              : {}),
            additionalEntries: [
              {
                name: "EPUB/text/aux.xhtml",
                content: minimalChapterDocument(),
              },
              {
                name: "EPUB/text/last.xhtml",
                content: minimalChapterDocument(),
              },
            ],
          }),
        );
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const publication = result.publication;
        try {
          const auxiliary = publication.locators[0]!;
          const primary = publication.locators.find(
            (block) =>
              block.startLocator.spineItemIndex === (emptyPrimary ? 2 : 1),
          )!;
          expect(auxiliary.startLocator.spineItemIndex).toBe(0);
          expect(
            publication.resolveLocator(auxiliary.startLocator).status,
          ).toBe("exact");
          expect(
            publication.resolveTarget({ documentId: auxiliary.documentId }),
          ).toMatchObject({ locator: auxiliary.startLocator });
          const recovered = publication.resolveLocator({
            ...auxiliary.startLocator,
            spineItemId: "spine:missing",
            spineItemIndex: 99,
          });
          expect(recovered.reason).toBe("book-start");
          expect(recovered.locator).toEqual(primary.startLocator);
          expect(publication.defaultStartLocator).toEqual(primary.startLocator);
        } finally {
          await publication.close();
        }
      }
    },
  );
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

  it("opens deterministic OPF 2 through NCX and XHTML 1.1 without exposing ignored data", async () => {
    const privacyCanary = "SYNTHETIC_EPUB2_PRIVATE_METADATA_CANARY";
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    const options = {
      metadataForm: "deprecated-wrappers" as const,
      guide: minimalEpub2Guide().replace("Synthetic opening", privacyCanary),
      ncxDoctype: EPUB2_CANONICAL_NCX_DOCTYPE,
      chapterDoctype: EPUB2_CANONICAL_XHTML11_DOCTYPE,
    };
    const [bytes, repeatedBytes] = await Promise.all([
      buildMinimalEpub2Fixture(options),
      buildMinimalEpub2Fixture(options),
    ]);
    const originalBytes = bytes.slice();
    const result = await openEpubPublication(bytes);

    expect(repeatedBytes).toEqual(bytes);
    expect(bytes).toEqual(originalBytes);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`unexpected fixed failure: ${result.detail}`);
    }
    try {
      expect(result.publication.book.metadata).toEqual({
        title: "Synthetic minimal EPUB 2 publication",
        authors: ["Synthetic EPUB 2 Author"],
      });
      expect(result.publication.book.navigation).toEqual([
        { label: "Chapter One", targetSpineItemId: "spine:0" },
      ]);
      expect(result.publication.navigation).toEqual([
        {
          kind: "link",
          label: "Chapter One",
          target: { documentId: "document:1", fragment: "chapter-one" },
          children: [],
        },
      ]);
      expect(result.publication.documents).toHaveLength(1);
      expect(JSON.stringify(result)).not.toContain(privacyCanary);
      expect(JSON.stringify(result)).not.toContain("toc.ncx");
      expect(worker).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await result.publication.close();
    }
  });

  it("releases archive state and returns no publication after malformed NCX", async () => {
    const close = vi.spyOn(ZipReader.prototype, "close");
    const privacyCanary = "SYNTHETIC_PRIVATE_NCX_CANARY";
    const result = await openEpubPublication(
      await buildMinimalEpub2Fixture({
        ncxDocument: `<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:synthetic"/></head><docTitle><text>Title</text></docTitle><navMap>${privacyCanary}</navMap></ncx>`,
      }),
    );

    expect(result).toEqual({
      ok: false,
      detail: "malformed-package",
      error: {
        schemaVersion: 1,
        code: "invalid-input",
        category: "input",
        severity: "recoverable",
      },
    });
    expect(result).not.toHaveProperty("publication");
    expect(JSON.stringify(result)).not.toContain(privacyCanary);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("releases archive state and returns no publication after a later-stage failure", async () => {
    const close = vi.spyOn(ZipReader.prototype, "close");
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml">`,
      }),
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

  it("opens EPUB 3 with legacy metadata and inert HTML doctypes", async () => {
    const packageDocument = minimalPackageDocument().replace(
      "</metadata>",
      '<meta name="generator" content="synthetic-tool"/><meta name="cover" content="synthetic-cover"/></metadata>',
    );
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        packageDocument,
        navigationDocument: `<!DOCTYPE html>${minimalNavigationDocument()}`,
        chapterDocument: `<!DOCTYPE html>${minimalChapterDocument()}`,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`unexpected fixed failure: ${result.detail}`);
    }
    try {
      expect(result.publication.book.metadata.title).toBe(
        "Synthetic minimal publication",
      );
      expect(JSON.stringify(result.publication)).not.toContain(
        "synthetic-tool",
      );
      expect(JSON.stringify(result.publication)).not.toContain(
        "synthetic-cover",
      );
    } finally {
      await result.publication.close();
    }
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

    const result = await openEpubPublication(await buildMinimalEpubFixture());
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
      const narration = await publication.prepareNarration({
        startLocator: first.startLocator,
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 16,
      });
      expect(narration.status).toBe("complete");
      if (narration.status !== "complete") {
        throw new Error("expected public narration preparation to complete");
      }
      expect(narration.segments.length).toBeGreaterThan(0);
      expect(narration.segments[0]?.sourceRange.start).toEqual(
        first.startLocator,
      );
      const navigationLink = publication.navigation[0];
      if (navigationLink?.kind !== "link") {
        throw new Error("expected one navigation link");
      }
      expect(publication.resolveTarget(navigationLink.target)).toEqual({
        status: "exact",
        reason: "fragment",
        locator: first.startLocator,
        locatedBlock: first,
      });
      expect(publication.resolveTarget({ documentId: "document:1" })).toEqual({
        status: "exact",
        reason: "document-start",
        locator: first.startLocator,
        locatedBlock: first,
      });
      expect(
        publication.resolveTarget({
          documentId: "document:1",
          fragment: "missing-private-fragment",
        }),
      ).toEqual({
        status: "recovered",
        reason: "fragment-unresolved",
        locator: first.startLocator,
        locatedBlock: first,
      });
      expect(publication.resolveTarget({ documentId: "document:0" })).toEqual({
        status: "unavailable",
        reason: "non-spine-document",
      });
      expect(
        publication.resolveTarget({ documentId: "document:unknown" }),
      ).toEqual({
        status: "unavailable",
        reason: "unknown-document",
      });
      const controller = new AbortController();
      controller.abort("private-cancellation-reason");
      expect(() =>
        publication.resolveTarget(
          { documentId: "document:1" },
          { signal: controller.signal },
        ),
      ).toThrowError(expect.objectContaining({ code: "cancelled" }));
      expect(worker).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await publication.close();
    }
    expect(publication.closed).toBe(true);
    expect(() =>
      publication.resolveTarget({ documentId: "document:1" }),
    ).toThrowError(expect.objectContaining({ code: "internal-failure" }));
  });

  it("recovers duplicate and non-addressable fragments to the same document start", async () => {
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        navigationDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="text/chapter.xhtml#duplicate">Duplicate</a></li><li><a href="text/chapter.xhtml#inline-target">Inline</a></li></ol></nav></body></html>',
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><body><h1 id="start">Start</h1><p id="duplicate">First duplicate</p><p id="duplicate">Second duplicate</p><p>Before <span id="inline-target">inside</span></p></body></html>',
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`unexpected fixed failure: ${result.detail}`);
    }

    const { publication } = result;
    try {
      const first = publication.locators[0];
      if (first === undefined) {
        throw new Error("expected a document-start locator");
      }
      expect(publication.navigation).toHaveLength(2);
      for (const node of publication.navigation) {
        if (node.kind !== "link") {
          throw new Error("expected navigation links");
        }
        expect(publication.resolveTarget(node.target)).toEqual({
          status: "recovered",
          reason: "fragment-unresolved",
          locator: first.startLocator,
          locatedBlock: first,
        });
      }
    } finally {
      await publication.close();
    }
  });
});
