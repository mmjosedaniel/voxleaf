import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import {
  openEpubArchive,
  type OpenedEpubArchive,
} from "../archive/archive-inventory.js";
import type {
  PackageManifestItem,
  ParsedPackageDocument,
} from "../package/package-document.js";
import { parseArchiveEntryPath } from "../paths/archive-path.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import type {
  EpubProcessingBudgetOptions,
  MonotonicClock,
} from "../security/processing-budget.js";
import type { SemanticBlock, SemanticInline } from "./document-model.js";
import {
  projectXhtmlDocument,
  projectXhtmlDocumentProjection,
} from "./xhtml-projector.js";

const encoder = new TextEncoder();
const CHAPTER_PATH = filePath("EPUB/text/chapter.xhtml");
const ZIP_WRITER_OPTIONS = Object.freeze({
  dataDescriptor: false,
  extendedTimestamp: false,
  keepOrder: true,
  lastModDate: new Date("2000-01-01T00:00:00.000Z"),
  transferStreams: false,
  useCompressionStream: false,
  useWebWorkers: false,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("safe XHTML semantic projection", () => {
  it("projects supported semantics, inherited text context, and opaque local targets in source order", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    await withArchive(
      xhtml(
        `
        <h:h1> First <h:em xml:lang="fr">titre</h:em> </h:h1>
        <h:p>Alpha <h:strong>bold</h:strong><h:br/> tail <h:a href="../other.xhtml#note">Next</h:a> <h:img src="../images/cover.png" alt=" cover&#10; image "/></h:p>
        <h:blockquote><h:p>Quoted</h:p></h:blockquote>
        <h:ol><h:li>One</h:li><h:li><h:p>Two</h:p></h:li></h:ol>`,
        'xml:lang="en" dir="ltr"',
      ),
      {},
      async (archive) => {
        const document = await projectXhtmlDocument(
          archive,
          createPackageDocument(),
          CHAPTER_PATH,
        );

        expect(document).toMatchObject({
          id: "document:1",
          language: "en",
          direction: "ltr",
          location: {
            kind: "spine",
            spineItemId: "spine:0",
            spineItemIndex: 0,
          },
        });
        expect(document.blocks.map((block) => block.kind)).toEqual([
          "heading",
          "paragraph",
          "block-quote",
          "list",
        ]);
        expect(renderBlocks(document.blocks)).toBe(
          "First titre|Alpha bold\ntail Next [cover image]|Quoted|One|Two",
        );

        const paragraph = document.blocks[1];
        expect(paragraph?.kind).toBe("paragraph");
        if (paragraph?.kind !== "paragraph") {
          throw new Error("expected paragraph");
        }
        expect(paragraph.children).toContainEqual({
          kind: "internal-link",
          target: { documentId: "document:2", fragment: "note" },
          children: [
            { kind: "text", text: " Next", language: "en", direction: "ltr" },
          ],
          language: "en",
          direction: "ltr",
        });
        expect(paragraph.children).toContainEqual({
          kind: "raster-image",
          resourceId: "resource:3",
          alternativeText: "cover image",
          language: "en",
          direction: "ltr",
        });
        expect(Object.isFrozen(document)).toBe(true);
        expect(Object.isFrozen(document.blocks)).toBe(true);
        expect(Object.isFrozen(paragraph.children)).toBe(true);
        expect(JSON.stringify(document)).not.toContain("EPUB/");
        expect(JSON.stringify(document)).not.toContain("href");
        expect(worker).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
      },
    );
  });

  it("collapses normal XML whitespace while preserving text inside code", async () => {
    await withArchive(
      xhtml(`<h:p>  before   <h:code> a \n  b </h:code>   after  </h:p>`),
      {},
      async (archive) => {
        const document = await projectXhtmlDocument(
          archive,
          createPackageDocument(),
          CHAPTER_PATH,
        );
        const paragraph = document.blocks[0];
        expect(paragraph?.kind).toBe("paragraph");
        if (paragraph?.kind !== "paragraph") {
          throw new Error("expected paragraph");
        }
        expect(paragraph.children).toEqual([
          { kind: "text", text: "before", language: "en" },
          {
            kind: "code",
            children: [{ kind: "text", text: " a \n  b ", language: "en" }],
            language: "en",
          },
          { kind: "text", text: "after", language: "en" },
        ]);
      },
    );
  });

  it("retains only unique source IDs in an internal source-order block sidecar", async () => {
    await withArchive(
      xhtml(`
        <h:section id="section.anchor">Section text</h:section>
        <h:blockquote id="quote.anchor"><h:p id="nested.anchor">Nested</h:p></h:blockquote>
        <h:ul id="list.anchor"><h:li id="item.anchor">Item</h:li></h:ul>
        <h:p xml:id="xml.anchor">XML ID</h:p>
        <h:p id="public-id" xml:id="other-id">Conflicting IDs</h:p>
        <h:p id="duplicate.anchor">Visible duplicate</h:p>
        <h:span id="duplicate.anchor" hidden="hidden">Ignored duplicate</h:span>`),
      {},
      async (archive) => {
        const projection = await projectXhtmlDocumentProjection(
          archive,
          createPackageDocument(),
          CHAPTER_PATH,
        );

        expect(
          projection.addressableBlocks.map(({ block, sourceElementId }) => ({
            kind: block.kind,
            sourceElementId,
          })),
        ).toEqual([
          { kind: "paragraph", sourceElementId: "section.anchor" },
          { kind: "block-quote", sourceElementId: "quote.anchor" },
          { kind: "paragraph", sourceElementId: "nested.anchor" },
          { kind: "list", sourceElementId: "list.anchor" },
          { kind: "paragraph", sourceElementId: "item.anchor" },
          { kind: "paragraph", sourceElementId: "xml.anchor" },
          { kind: "paragraph", sourceElementId: undefined },
          { kind: "paragraph", sourceElementId: undefined },
        ]);
        expect(Object.isFrozen(projection)).toBe(true);
        expect(Object.isFrozen(projection.addressableBlocks)).toBe(true);
        expect(JSON.stringify(projection.document)).not.toContain("anchor");
      },
    );
  });

  it("traverses inert containers, flattens external links, and omits active, styled, hidden, foreign, and remote content", async () => {
    await withArchive(
      xhtml(`
        <h:div><h:p>Kept <h:mark>unknown child</h:mark> <h:a href="https://private.invalid/canary">external label</h:a></h:p></h:div>
        <h:script>script-private-canary</h:script>
        <h:style>style-private-canary</h:style>
        <h:p hidden="hidden">hidden-private-canary</h:p>
        <h:p aria-hidden="true">aria-private-canary</h:p>
        <svg xmlns="http://www.w3.org/2000/svg"><text>svg-private-canary</text></svg>
        <h:p>Visible <h:img src="https://private.invalid/image.png" alt="remote-private-canary"/></h:p>`),
      {},
      async (archive) => {
        const document = await projectXhtmlDocument(
          archive,
          createPackageDocument(),
          CHAPTER_PATH,
        );
        const serialized = JSON.stringify(document);

        expect(renderBlocks(document.blocks)).toBe(
          "Kept unknown child external label|Visible",
        );
        expect(serialized).not.toContain("private-canary");
        expect(serialized).not.toContain("https://");
        expect(serialized).not.toContain("style");
      },
    );
  });

  it.each([
    [
      "wrong root",
      `<root xmlns="urn:private"><body/></root>`,
      "malformed-package",
    ],
    [
      "missing body",
      `<h:html xmlns:h="http://www.w3.org/1999/xhtml"/>`,
      "malformed-package",
    ],
    [
      "invalid direction",
      xhtml(`<h:p dir="sideways">private-canary</h:p>`),
      "malformed-package",
    ],
    [
      "block nested in inline",
      xhtml(`<h:p><h:p>private-canary</h:p></h:p>`),
      "malformed-package",
    ],
    [
      "missing local link",
      xhtml(`<h:p><h:a href="../missing.xhtml">private-canary</h:a></h:p>`),
      "broken-reference",
    ],
    [
      "missing local image",
      xhtml(
        `<h:p><h:img src="../images/missing.png" alt="private-canary"/></h:p>`,
      ),
      "broken-reference",
    ],
    [
      "active local link",
      xhtml(`<h:p><h:a href="../active.xhtml">private-canary</h:a></h:p>`),
      "broken-reference",
    ],
    [
      "nested local links",
      xhtml(
        `<h:p><h:a href="../other.xhtml"><h:a href="#note">private-canary</h:a></h:a></h:p>`,
      ),
      "malformed-package",
    ],
  ])(
    "rejects %s transactionally with a content-free error",
    async (_name, source, code) => {
      await expectProjectionError(source, {}, code as EpubArchiveError["code"]);
    },
  );

  it("allows the exact publication semantic-block limit and rejects the next block", async () => {
    await withArchive(
      xhtml(`<h:p>One</h:p><h:p>Two</h:p>`),
      { policy: { maxSemanticBlocks: 2 } },
      async (archive) => {
        const document = await projectXhtmlDocument(
          archive,
          createPackageDocument(),
          CHAPTER_PATH,
        );
        expect(document.blocks).toHaveLength(2);
        expect(archive.budget.getSnapshot().semanticBlockCount).toBe(2);
      },
    );

    await expectProjectionError(
      xhtml(`<h:p>One</h:p><h:p>private-canary</h:p>`),
      { policy: { maxSemanticBlocks: 1 } },
      "resource-limit-exceeded",
    );
  });

  it("allows the exact content-document byte limit and rejects the next byte", async () => {
    const chapter = xhtml(`<h:p>Exact content bytes</h:p>`);
    const maximumBytes = encoder.encode(chapter).byteLength;

    await withArchive(
      chapter,
      { policy: { maxContentDocumentBytes: maximumBytes } },
      async (archive) => {
        await expect(
          projectXhtmlDocument(archive, createPackageDocument(), CHAPTER_PATH),
        ).resolves.toMatchObject({ blocks: [{ kind: "paragraph" }] });
      },
    );

    await expectProjectionError(
      chapter,
      { policy: { maxContentDocumentBytes: maximumBytes - 1 } },
      "resource-limit-exceeded",
    );
  });

  it("honors cancellation before reading content bytes", async () => {
    const controller = new AbortController();
    await withArchive(
      xhtml(`<h:p>private-canary</h:p>`),
      { signal: controller.signal },
      async (archive) => {
        controller.abort();
        await expectProjectionActionError(
          () =>
            projectXhtmlDocument(
              archive,
              createPackageDocument(),
              CHAPTER_PATH,
            ),
          "cancelled",
        );
      },
    );
  });

  it("shares the semantic-block limit across projected publication documents", async () => {
    await withArchive(
      xhtml(`<h:p>One</h:p>`),
      { policy: { maxSemanticBlocks: 1 } },
      async (archive) => {
        await projectXhtmlDocument(
          archive,
          createPackageDocument(),
          CHAPTER_PATH,
        );
        await expectProjectionActionError(
          () =>
            projectXhtmlDocument(
              archive,
              createPackageDocument(),
              filePath("EPUB/other.xhtml"),
            ),
          "resource-limit-exceeded",
        );
      },
    );
  });

  it("honors the ingestion deadline before reading content bytes", async () => {
    const clock = new MutableClock();
    await withArchive(
      xhtml(`<h:p>private-canary</h:p>`),
      { clock },
      async (archive) => {
        clock.value = 30_001;
        await expectProjectionActionError(
          () =>
            projectXhtmlDocument(
              archive,
              createPackageDocument(),
              CHAPTER_PATH,
            ),
          "cancelled",
        );
      },
    );
  });
});

class MutableClock implements MonotonicClock {
  public value = 0;

  public now(): number {
    return this.value;
  }
}

function filePath(value: string): ArchiveFilePath {
  return parseArchiveEntryPath(value, "file");
}

function localItem(
  id: string,
  path: string,
  mediaType: string,
  kind: PackageManifestItem["kind"],
  properties: readonly string[] = [],
): PackageManifestItem {
  return Object.freeze({
    id,
    location: Object.freeze({ kind: "local", path: filePath(path) }),
    mediaType,
    mediaTypeEssence: mediaType,
    kind,
    properties: Object.freeze([...properties]),
  });
}

function createPackageDocument(): ParsedPackageDocument {
  return Object.freeze({
    path: filePath("EPUB/package.opf"),
    version: "3.0",
    renditionLayout: "reflowable",
    pageProgressionDirection: "default",
    metadata: Object.freeze({
      uniqueIdentifier: "urn:synthetic:projection",
      identifiers: Object.freeze(["urn:synthetic:projection"]),
      titles: Object.freeze(["Synthetic projection"]),
      languages: Object.freeze(["en"]),
      creators: Object.freeze([]),
      modified: "2026-07-22T00:00:00Z",
    }),
    manifest: Object.freeze([
      localItem(
        "nav",
        "EPUB/nav.xhtml",
        "application/xhtml+xml",
        "content-document",
        ["nav"],
      ),
      localItem(
        "chapter",
        "EPUB/text/chapter.xhtml",
        "application/xhtml+xml",
        "content-document",
      ),
      localItem(
        "other",
        "EPUB/other.xhtml",
        "application/xhtml+xml",
        "content-document",
      ),
      localItem("cover", "EPUB/images/cover.png", "image/png", "raster-image"),
      localItem(
        "active",
        "EPUB/active.xhtml",
        "application/xhtml+xml",
        "content-document",
        ["scripted"],
      ),
    ]),
    spine: Object.freeze([
      Object.freeze({
        index: 0,
        idref: "chapter",
        contentResourceId: "chapter",
        path: CHAPTER_PATH,
        linear: true,
        properties: Object.freeze([]),
      }),
    ]),
    navigation: Object.freeze({
      resourceId: "nav",
      path: filePath("EPUB/nav.xhtml"),
    }),
  });
}

function xhtml(body: string, htmlAttributes = 'xml:lang="en"'): string {
  return `<h:html xmlns:h="http://www.w3.org/1999/xhtml" ${htmlAttributes}><h:head><h:title>Ignored private title</h:title><h:style>ignored private style</h:style></h:head><h:body>${body}</h:body></h:html>`;
}

async function createArchive(chapter: string): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const entries: readonly (readonly [string, string | Uint8Array, number])[] = [
    ["mimetype", "application/epub+zip", 0],
    ["EPUB/text/chapter.xhtml", chapter, 0],
    ["EPUB/other.xhtml", xhtml(`<h:p>Other</h:p>`), 0],
    ["EPUB/nav.xhtml", xhtml(`<h:nav/>`), 0],
    ["EPUB/images/cover.png", new Uint8Array([1, 2, 3]), 0],
    ["EPUB/active.xhtml", xhtml(`<h:script>private-canary</h:script>`), 0],
  ];

  for (const [path, value, level] of entries) {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    await writer.add(path, new Uint8ArrayReader(bytes), {
      ...ZIP_WRITER_OPTIONS,
      level,
    });
  }
  return writer.close();
}

async function withArchive(
  chapter: string,
  options: EpubProcessingBudgetOptions,
  action: (archive: OpenedEpubArchive) => Promise<void>,
): Promise<void> {
  const archive = await openEpubArchive(await createArchive(chapter), options);
  try {
    await action(archive);
  } finally {
    await archive.close();
  }
}

async function expectProjectionError(
  chapter: string,
  options: EpubProcessingBudgetOptions,
  code: EpubArchiveError["code"],
): Promise<void> {
  await withArchive(chapter, options, async (archive) => {
    await expectProjectionActionError(
      () =>
        projectXhtmlDocument(archive, createPackageDocument(), CHAPTER_PATH),
      code,
    );
  });
}

async function expectProjectionActionError(
  action: () => unknown | Promise<unknown>,
  code: EpubArchiveError["code"],
): Promise<void> {
  let captured: unknown;
  try {
    await action();
  } catch (error: unknown) {
    captured = error;
  }

  expect(captured).toBeInstanceOf(EpubArchiveError);
  expect(captured).toMatchObject({ code, message: code });
  expect(captured).not.toHaveProperty("cause");
  expect(JSON.stringify(captured)).not.toContain("private-canary");
}

function renderBlocks(blocks: readonly SemanticBlock[]): string {
  return blocks
    .flatMap((block) => {
      switch (block.kind) {
        case "heading":
        case "paragraph":
          return renderInlines(block.children);
        case "block-quote":
          return renderBlocks(block.children);
        case "list":
          return block.items.map((item) => renderBlocks(item.children));
      }
    })
    .join("|");
}

function renderInlines(inlines: readonly SemanticInline[]): string {
  return inlines
    .map((inline) => {
      switch (inline.kind) {
        case "text":
          return String(inline.text);
        case "line-break":
          return "\n";
        case "raster-image":
          return `[${String(inline.alternativeText ?? "image")}]`;
        case "code":
        case "emphasis":
        case "internal-link":
        case "strong":
          return renderInlines(inline.children);
      }
    })
    .join("");
}
