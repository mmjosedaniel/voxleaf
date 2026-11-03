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
  minimalNcxDocument,
  minimalPackageDocument,
} from "../../test-support/epub-fixture.js";
import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import { mapEpubFailure } from "./epub-result.js";
import { openEpubPublication } from "./open-epub-publication.js";
import * as locatorIndex from "../locator/locator-index.js";

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
  it("RCF-03 global layout fallback cannot hide unsafe candidate content", async () => {
    const fixed = minimalPackageDocument()
      .replace(
        "</metadata>",
        '<meta property="rendition:layout">pre-paginated</meta></metadata>',
      )
      .replace("text/chapter.xhtml", "text/unsafe.xhtml");
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        containerDocument:
          '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/fixed.opf" media-type="application/oebps-package+xml"/><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
        additionalEntries: [
          { name: "EPUB/fixed.opf", content: fixed },
          {
            name: "EPUB/text/unsafe.xhtml",
            content:
              '<!DOCTYPE html [<!ENTITY external SYSTEM "file:///private">]><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Unsafe</title></head><body><p>&external;</p></body></html>',
          },
        ],
      }),
    );
    expect(opened).toMatchObject({ ok: false });
    if (!opened.ok) expect(opened.detail).not.toBe("unsupported-layout");
  });

  it.each([
    "narration-v1",
    "narration-bilingual-v2",
    "narration-piper-v2",
    "narration-chatterbox-v1",
  ] as const)(
    "RCF-08 rejects the code-to-prose bypass through public profile %s",
    async (profile) => {
      const bytes = await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Numeric boundary</title></head><body><p><code>+</code>${"1".repeat(129)}</p></body></html>`,
      });
      const opened = await openEpubPublication(bytes);
      if (!opened.ok) throw new Error(opened.detail);
      try {
        expect(
          await opened.publication.prepareNarration({
            profile,
            defaultLanguage: "es",
            maximumSegments: 1,
            startLocator: opened.publication.defaultStartLocator!,
          }),
        ).toMatchObject({ status: "resource-limit-exceeded" });
      } finally {
        await opened.publication.close();
      }
    },
  );

  it.each([false, true])(
    "RCF-03 examines multiple layout-incompatible candidates (exhausted %s)",
    async (exhausted) => {
      const fixed = minimalPackageDocument().replace(
        '<itemref idref="chapter"',
        '<itemref properties="rendition:layout-pre-paginated" idref="chapter"',
      );
      const bytes = await buildMinimalEpubFixture({
        packageDocument: exhausted ? fixed : minimalPackageDocument(),
        containerDocument:
          '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/fixed.opf" media-type="application/oebps-package+xml"/><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
        additionalEntries: [{ name: "EPUB/fixed.opf", content: fixed }],
      });
      const opened = await openEpubPublication(bytes);
      if (exhausted)
        expect(opened).toMatchObject({
          ok: false,
          detail: "unsupported-layout",
        });
      else {
        expect(opened.ok).toBe(true);
        if (opened.ok) await opened.publication.close();
      }
    },
  );
  it.each([false, true])(
    "RCF-03 validates later spine items before layout-only fallback (malformed %s)",
    async (malformed) => {
      const fixed = minimalPackageDocument()
        .replace(
          '<itemref idref="chapter"',
          '<itemref properties="rendition:layout-pre-paginated" idref="chapter"',
        )
        .replace(
          "</spine>",
          malformed ? '<itemref idref="missing"/></spine>' : "</spine>",
        );
      const bytes = await buildMinimalEpubFixture({
        containerDocument:
          '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/fixed.opf" media-type="application/oebps-package+xml"/><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
        additionalEntries: [{ name: "EPUB/fixed.opf", content: fixed }],
      });
      const opened = await openEpubPublication(bytes);
      if (malformed)
        expect(opened).toMatchObject({ ok: false, detail: "broken-reference" });
      else {
        expect(opened.ok).toBe(true);
        if (opened.ok) await opened.publication.close();
      }
    },
  );

  it("RAF-10 warm public preparation does not rescan every source-length metadata value", async () => {
    const count = 1_000;
    const bytes = await buildMinimalEpubFixture({
      chapterDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Preparation</title></head><body>' +
        "<p>A bounded synthetic sentence for narration.</p>".repeat(count) +
        "</body></html>",
    });
    let visits = 0;
    const original = locatorIndex.createPublicationLocatorIndex;
    vi.spyOn(locatorIndex, "createPublicationLocatorIndex").mockImplementation(
      (...args) => {
        const index = original(...args);
        const blocks = new Proxy(index.blocks, {
          get(target, key, receiver) {
            if (key === Symbol.iterator)
              return function* () {
                for (const block of target) {
                  visits++;
                  yield block;
                }
              };
            return Reflect.get(target, key, receiver);
          },
        });
        return Object.freeze({ ...index, blocks });
      },
    );
    const opened = await openEpubPublication(bytes);
    if (!opened.ok) throw new Error(opened.detail);
    const publication = opened.publication;
    try {
      const first = await publication.prepareNarration({
        maximumSegments: 16,
        profile: "narration-piper-v2",
        defaultLanguage: "en",
        startLocator: publication.defaultStartLocator!,
      });
      expect(first.status).toBe("batch");
      if (first.status !== "batch") throw new Error("expected-batch");
      visits = 0;
      const warm = await publication.prepareNarration({
        maximumSegments: 16,
        profile: "narration-piper-v2",
        defaultLanguage: "en",
        startLocator: first.continuation,
      });
      expect(warm.status).toBe("batch");
      expect(visits).toBeLessThan(64);
      if (warm.status !== "batch") throw new Error("expected-warm-batch");
      expect(warm.segments[0]!.sourceRange.start).toEqual(
        publication.locators[16]!.startLocator,
      );
    } finally {
      await publication.close();
    }
  });
  it("RAF-01 opens an admitted chapter beyond the host argument expansion capacity", async () => {
    const count = 140_000;
    const chapter =
      '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Scale</title></head><body>' +
      Array.from(
        { length: count / 2 },
        (_, index) => `<blockquote><p>${index}</p></blockquote>`,
      ).join("") +
      "</body></html>";
    const bytes = await buildMinimalEpubFixture({
      chapterDocument: null,
      additionalEntries: [
        {
          name: "EPUB/text/chapter.xhtml",
          content: chapter,
          compression: "stored",
        },
      ],
    });
    const original = locatorIndex.createPublicationLocatorIndex;
    let failureName: string | undefined;
    const observeIndex = vi
      .spyOn(locatorIndex, "createPublicationLocatorIndex")
      .mockImplementation((...args) => {
        try {
          return original(...args);
        } catch (error) {
          failureName = error instanceof Error ? error.name : "unknown";
          throw error;
        }
      });
    const result = await openEpubPublication(bytes);
    expect(observeIndex).toHaveBeenCalledOnce();
    expect(failureName).toBeUndefined();
    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      try {
        expect(result.publication.locators).toHaveLength(count);
      } finally {
        await result.publication.close();
      }
    }
  });

  it.each([16, 64])(
    "RAF-18 bounds repeated package index construction for %i admitted documents",
    async (count) => {
      const indices = Array.from({ length: count }, (_, index) => index);
      const bytes = await buildMinimalEpubFixture({
        packageDocument: minimalPackageDocument()
          .replace(
            "</manifest>",
            indices
              .map(
                (index) =>
                  `<item id="raf-${index}" href="text/raf-${index}.xhtml" media-type="application/xhtml+xml"/>`,
              )
              .join("") + "</manifest>",
          )
          .replace(
            "</spine>",
            indices.map((index) => `<itemref idref="raf-${index}"/>`).join("") +
              "</spine>",
          ),
        additionalEntries: indices.map((index) => ({
          name: `EPUB/text/raf-${index}.xhtml`,
          content:
            '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Scale</title></head><body><p>Bounded synthetic passage.</p></body></html>',
        })),
      });
      let visits = 0;
      const original = Map.prototype.set;
      const observer = vi
        .spyOn(Map.prototype, "set")
        .mockImplementation(function (
          this: Map<unknown, unknown>,
          key: unknown,
          value: unknown,
        ) {
          if (typeof key === "string" && /^raf-\d+$/.test(key)) visits++;
          return original.call(this, key, value);
        });
      const result = await openEpubPublication(bytes);
      observer.mockRestore();
      expect(result.ok).toBe(true);
      if (result.ok) {
        try {
          expect(visits).toBeLessThanOrEqual(count * 12);
        } finally {
          await result.publication.close();
        }
      }
    },
  );
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

  it.each(["epub3", "epub2"] as const)(
    "R8-07 resolves original fallback references and their spine occurrences in %s",
    async (format) => {
      const packageXml = (
        format === "epub3"
          ? minimalPackageDocument()
          : minimalEpub2PackageDocument()
      )
        .replace(
          "</manifest>",
          '<item id="one" href="text/one.xhtml" media-type="application/xhtml+xml" properties="scripted" fallback="middle"/><item id="middle" href="middle.bin" media-type="application/x-synthetic" fallback="chapter"/><item id="two" href="text/two.xhtml" media-type="application/xhtml+xml" properties="scripted" fallback="chapter"/></manifest>',
        )
        .replace(
          '<itemref idref="chapter"/>',
          '<itemref idref="one"/><itemref idref="two"/><itemref idref="chapter"/>',
        );
      const chapterDocument =
        '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Safe</title></head><body><p id="chapter-one">Safe passage.</p><p><a href="one.xhtml">First</a><a href="two.xhtml#chapter-one">Second</a><a href="two.xhtml#absent">Missing</a><a href="chapter.xhtml#chapter-one">Direct</a><a href="https://example.invalid/one.xhtml">External</a></p></body></html>';
      const options = {
        packageDocument: packageXml,
        chapterDocument,
        additionalEntries: [
          { name: "EPUB/text/one.xhtml", content: "unused" },
          { name: "EPUB/text/two.xhtml", content: "unused" },
          { name: "EPUB/middle.bin", content: "unused" },
        ],
      };
      const result = await openEpubPublication(
        await (format === "epub3"
          ? buildMinimalEpubFixture({
              ...options,
              navigationDocument: minimalNavigationDocument()
                .replace("chapter.xhtml#chapter-one", "two.xhtml")
                .replace(
                  "</ol>",
                  '<li><a href="text/chapter.xhtml#chapter-one">Direct</a></li></ol>',
                ),
            })
          : buildMinimalEpub2Fixture({
              ...options,
              ncxDocument: minimalNcxDocument()
                .replace("chapter.xhtml#chapter-one", "two.xhtml")
                .replace(
                  "</navMap>",
                  '<navPoint id="direct" playOrder="2"><navLabel><text>Direct</text></navLabel><content src="text/chapter.xhtml#chapter-one"/></navPoint></navMap>',
                ),
            })),
      );
      expect(result).toMatchObject({ ok: true });
      if (!result.ok) return;
      const publication = result.publication;
      try {
        const navigation = publication.navigation[0]!;
        expect(navigation.kind).toBe("link");
        if (navigation.kind !== "link") return;
        expect(publication.resolveTarget(navigation.target)).toMatchObject({
          status: "exact",
          locator: { spineItemIndex: 1 },
        });
        const direct = publication.navigation[1]!;
        expect(direct.kind).toBe("link");
        if (direct.kind === "link")
          expect(publication.resolveTarget(direct.target)).toMatchObject({
            status: "exact",
            locator: { spineItemIndex: 0 },
          });
        for (const document of publication.documents.filter(
          (document) => document.location.kind === "spine",
        )) {
          const paragraph = document.blocks[1];
          if (paragraph?.kind !== "paragraph")
            throw new Error("missing synthetic links");
          const links = paragraph.children.filter(
            (inline) => inline.kind === "internal-link",
          );
          expect(links).toHaveLength(4);
          expect(publication.resolveTarget(links[0]!.target)).toMatchObject({
            status: "exact",
            locator: { spineItemIndex: 0 },
          });
          expect(publication.resolveTarget(links[1]!.target)).toMatchObject({
            status: "exact",
            locator: { spineItemIndex: 1 },
          });
          expect(publication.resolveTarget(links[2]!.target)).toMatchObject({
            status: "recovered",
            reason: "fragment-unresolved",
            locator: { spineItemIndex: 1 },
          });
          expect(publication.resolveTarget(links[3]!.target)).toMatchObject({
            status: "exact",
            locator: {
              spineItemIndex:
                document.location.kind === "spine"
                  ? document.location.spineItemIndex
                  : -1,
            },
          });
          expect(JSON.stringify(links)).not.toContain("xhtml");
        }
      } finally {
        await publication.close();
      }
    },
  );

  it("RAC-06 / CLB-04 exposes no primary start when only auxiliary content is addressable", async () => {
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
      expect(
        await result.publication.prepareNarration({
          startLocator: {
            ...auxiliary,
            spineItemId: "spine:missing",
            spineItemIndex: 99,
          },
          profile: "narration-v1",
          defaultLanguage: "und",
          maximumSegments: 1,
        }),
      ).toMatchObject({ status: "invalid-start" });
    } finally {
      await result.publication.close();
    }
  });
  it.each(["2.0", "3.0"] as const)(
    "RAC-06 / CLB-04 selects primary start without reindexing auxiliary content in EPUB %s",
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
          const prepared = await publication.prepareNarration({
            startLocator: {
              ...auxiliary.startLocator,
              spineItemId: "spine:missing",
              spineItemIndex: 99,
            },
            profile: "narration-v1",
            defaultLanguage: "und",
            maximumSegments: 1,
          });
          expect(prepared.status).toBe("batch");
          if (prepared.status !== "batch")
            throw new Error("synthetic-preparation-failed");
          expect(prepared.start.resolutionReason).toBe("book-start");
          expect(prepared.segments[0]!.sourceRange.start).toEqual(
            primary.startLocator,
          );
          const exactAuxiliary = await publication.prepareNarration({
            startLocator: auxiliary.startLocator,
            profile: "narration-v1",
            defaultLanguage: "und",
            maximumSegments: 1,
          });
          expect(exactAuxiliary.status).toBe("batch");
          if (exactAuxiliary.status !== "batch")
            throw new Error("synthetic-preparation-failed");
          expect(exactAuxiliary.segments[0]!.sourceRange.start).toEqual(
            auxiliary.startLocator,
          );
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
