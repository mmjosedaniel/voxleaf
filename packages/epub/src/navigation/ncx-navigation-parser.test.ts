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
import type { EpubProcessingBudgetOptions } from "../security/processing-budget.js";
import { parseNavigationDocument } from "./navigation-document.js";

const encoder = new TextEncoder();
const NCX_NAMESPACE = "http://www.daisy.org/z3986/2005/ncx/";
const CANONICAL_NCX_DOCTYPE =
  '<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">';
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

describe("bounded NCX navigation parsing", () => {
  it("projects nested navMap nodes in source order and validates ignored lists without external access", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    const domParser = vi.fn(() => {
      throw new Error("DOMParser must not be constructed");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("DOMParser", domParser);

    await withNcxArchive(
      `${CANONICAL_NCX_DOCTYPE}${ncxDocument(
        `
        <navPoint id="chapter-one" class="chapter" playOrder="9">
          <navLabel><text> Chapter\nOne </text></navLabel>
          <content src="text/chapter.xhtml#start"/>
          <navPoint id="appendix" playOrder="2">
            <navLabel><text>Appendix</text></navLabel>
            <content src="appendix.xhtml#note"/>
          </navPoint>
        </navPoint>
        <navPoint id="chapter-two" playOrder="1">
          <navLabel><text>Chapter Two</text></navLabel>
          <content src="text/chapter.xhtml#two"/>
        </navPoint>`,
        {
          beforeNavMap:
            "<docAuthor><text>Private ignored author</text></docAuthor>",
          afterNavMap:
            '<pageList><navLabel><text>Private pages</text></navLabel><pageTarget id="page-one" playOrder="4" type="normal" value="1"><navLabel><text>Page One</text></navLabel><content src="text/chapter.xhtml#page-one"/></pageTarget></pageList><navList><navLabel><text>Private figures</text></navLabel><navTarget id="figure-one" playOrder="3"><navLabel><text>Figure One</text></navLabel><content src="appendix.xhtml#figure-one"/></navTarget></navList>',
        },
      )}`,
      {},
      async (archive) => {
        const parsed = await parseNavigationDocument(
          archive,
          createPackageDocument(),
        );

        expect(parsed).toEqual({
          roots: [
            {
              label: "Chapter One",
              target: {
                kind: "spine",
                path: "EPUB/text/chapter.xhtml",
                spineItemIndex: 0,
                fragment: "start",
              },
              children: [
                {
                  label: "Appendix",
                  target: {
                    kind: "non-spine",
                    path: "EPUB/appendix.xhtml",
                    fragment: "note",
                  },
                  children: [],
                },
              ],
            },
            {
              label: "Chapter Two",
              target: {
                kind: "spine",
                path: "EPUB/text/chapter.xhtml",
                spineItemIndex: 0,
                fragment: "two",
              },
              children: [],
            },
          ],
        });
        expect(Object.isFrozen(parsed)).toBe(true);
        expect(Object.isFrozen(parsed.roots)).toBe(true);
        expect(Object.isFrozen(parsed.roots[0])).toBe(true);
        expect(Object.isFrozen(parsed.roots[0]?.children)).toBe(true);
        expect(JSON.stringify(parsed)).not.toContain("Private");
        expect(JSON.stringify(parsed)).not.toContain("src");
        expect(worker).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
        expect(domParser).not.toHaveBeenCalled();
      },
    );
  });

  it("applies one aggregate node budget across navPoint, pageTarget, and navTarget", async () => {
    const ncx = ncxDocument(
      '<navPoint><navLabel><text>One</text></navLabel><content src="text/chapter.xhtml"/></navPoint>',
      {
        afterNavMap:
          '<pageList><pageTarget type="normal"><navLabel><text>Page</text></navLabel><content src="text/chapter.xhtml#page"/></pageTarget></pageList><navList><navLabel><text>Figures</text></navLabel><navTarget><navLabel><text>Figure</text></navLabel><content src="appendix.xhtml#figure"/></navTarget></navList>',
      },
    );

    await withNcxArchive(
      ncx,
      { policy: { maxNavigationNodes: 3 } },
      async (archive) => {
        await expect(
          parseNavigationDocument(archive, createPackageDocument()),
        ).resolves.toMatchObject({ roots: [{ label: "One" }] });
      },
    );
    await expectNcxError(
      ncx,
      { policy: { maxNavigationNodes: 2 } },
      "resource-limit-exceeded",
    );
  });

  it("permits the exact NCX navigation depth and rejects max plus one", async () => {
    const ncx = ncxDocument(
      '<navPoint><navLabel><text>One</text></navLabel><content src="text/chapter.xhtml"/><navPoint><navLabel><text>Two</text></navLabel><content src="text/chapter.xhtml#two"/></navPoint></navPoint>',
    );

    await withNcxArchive(
      ncx,
      { policy: { maxNavigationDepth: 2 } },
      async (archive) => {
        const parsed = await parseNavigationDocument(
          archive,
          createPackageDocument(),
        );
        expect(parsed.roots[0]?.children).toHaveLength(1);
      },
    );
    await expectNcxError(
      ncx,
      { policy: { maxNavigationDepth: 1 } },
      "resource-limit-exceeded",
    );
  });

  it("permits a 1,024-code-point label and rejects max plus one", async () => {
    const exact = "x".repeat(1_024);
    await withNcxArchive(
      ncxDocument(
        `<navPoint><navLabel><text>${exact}</text></navLabel><content src="text/chapter.xhtml"/></navPoint>`,
      ),
      {},
      async (archive) => {
        const parsed = await parseNavigationDocument(
          archive,
          createPackageDocument(),
        );
        expect(parsed.roots[0]?.label).toBe(exact);
      },
    );
    await expectNcxError(
      ncxDocument(
        `<navPoint><navLabel><text>${exact}x</text></navLabel><content src="text/chapter.xhtml"/></navPoint>`,
      ),
      {},
      "malformed-package",
    );
  });

  it.each([
    [
      "wrong namespace",
      ncxDocument(validNavPoint()).replace(NCX_NAMESPACE, "urn:private"),
    ],
    [
      "wrong version",
      ncxDocument(validNavPoint()).replace(
        'version="2005-1"',
        'version="2005-2"',
      ),
    ],
    [
      "missing head",
      ncxDocument(validNavPoint()).replace(/<head>.*<\/head>/u, ""),
    ],
    [
      "missing title",
      ncxDocument(validNavPoint()).replace(/<docTitle>.*<\/docTitle>/u, ""),
    ],
    ["empty navMap", ncxDocument("")],
    [
      "missing navLabel",
      ncxDocument('<navPoint><content src="text/chapter.xhtml"/></navPoint>'),
    ],
    [
      "missing content",
      ncxDocument("<navPoint><navLabel><text>One</text></navLabel></navPoint>"),
    ],
    [
      "content before label",
      ncxDocument(
        '<navPoint><content src="text/chapter.xhtml"/><navLabel><text>One</text></navLabel></navPoint>',
      ),
    ],
    [
      "duplicate id",
      ncxDocument(
        '<navPoint id="same"><navLabel><text>One</text></navLabel><content src="text/chapter.xhtml"/></navPoint><navPoint id="same"><navLabel><text>Two</text></navLabel><content src="text/chapter.xhtml#two"/></navPoint>',
      ),
    ],
    [
      "invalid playOrder",
      ncxDocument(
        '<navPoint playOrder="0"><navLabel><text>One</text></navLabel><content src="text/chapter.xhtml"/></navPoint>',
      ),
    ],
    [
      "empty page list",
      ncxDocument(validNavPoint(), { afterNavMap: "<pageList/>" }),
    ],
    [
      "page list label after target",
      ncxDocument(validNavPoint(), {
        afterNavMap:
          '<pageList><pageTarget type="normal"><navLabel><text>Page One</text></navLabel><content src="text/chapter.xhtml#page-one"/></pageTarget><navLabel><text>Late label</text></navLabel></pageList>',
      }),
    ],
    [
      "empty nav list",
      ncxDocument(validNavPoint(), {
        afterNavMap:
          "<navList><navLabel><text>Landmarks</text></navLabel></navList>",
      }),
    ],
    [
      "foreign child",
      ncxDocument(`${validNavPoint()}<private xmlns="urn:private"/>`),
    ],
  ])("rejects malformed NCX grammar: %s", async (_name, ncx) => {
    await expectNcxError(ncx, {}, "malformed-package");
  });

  it.each([
    ["remote", "https://private.invalid/chapter.xhtml"],
    ["active scheme", "javascript:private-canary"],
    ["query", "text/chapter.xhtml?private=true"],
    ["undeclared", "missing.xhtml"],
    ["non-content", "images/cover.png"],
  ])("rejects a %s NCX target", async (_name, source) => {
    await expectNcxError(
      ncxDocument(
        `<navPoint><navLabel><text>One</text></navLabel><content src="${source}"/></navPoint>`,
      ),
      {},
      "broken-reference",
    );
  });

  it("honors cancellation before reading NCX bytes", async () => {
    const controller = new AbortController();
    await withNcxArchive(
      ncxDocument(validNavPoint()),
      { signal: controller.signal },
      async (archive) => {
        controller.abort("private-cancellation-reason");
        await expectNavigationActionError(
          () => parseNavigationDocument(archive, createPackageDocument()),
          "cancelled",
        );
      },
    );
  });
});

function filePath(value: string): ArchiveFilePath {
  return parseArchiveEntryPath(value, "file");
}

function manifestItem(
  id: string,
  path: string,
  mediaType: string,
  kind: PackageManifestItem["kind"],
): PackageManifestItem {
  return Object.freeze({
    id,
    location: Object.freeze({ kind: "local", path: filePath(path) }),
    mediaType,
    mediaTypeEssence: mediaType,
    kind,
    properties: Object.freeze([]),
  });
}

function createPackageDocument(): ParsedPackageDocument {
  return Object.freeze({
    path: filePath("EPUB/package.opf"),
    version: "2.0",
    renditionLayout: "reflowable",
    pageProgressionDirection: "default",
    metadata: Object.freeze({
      uniqueIdentifier: "urn:synthetic:ncx",
      identifiers: Object.freeze(["urn:synthetic:ncx"]),
      titles: Object.freeze(["Synthetic NCX"]),
      languages: Object.freeze(["en"]),
      creators: Object.freeze([]),
    }),
    manifest: Object.freeze([
      manifestItem("ncx", "EPUB/toc.ncx", "application/x-dtbncx+xml", "other"),
      manifestItem(
        "chapter",
        "EPUB/text/chapter.xhtml",
        "application/xhtml+xml",
        "content-document",
      ),
      manifestItem(
        "appendix",
        "EPUB/appendix.xhtml",
        "application/xhtml+xml",
        "content-document",
      ),
      manifestItem(
        "cover",
        "EPUB/images/cover.png",
        "image/png",
        "raster-image",
      ),
    ]),
    spine: Object.freeze([
      Object.freeze({
        index: 0,
        idref: "chapter",
        contentResourceId: "chapter",
        path: filePath("EPUB/text/chapter.xhtml"),
        linear: true,
        properties: Object.freeze([]),
      }),
    ]),
    navigation: Object.freeze({
      kind: "ncx",
      resourceId: "ncx",
      path: filePath("EPUB/toc.ncx"),
    }),
  });
}

function validNavPoint(): string {
  return '<navPoint><navLabel><text>One</text></navLabel><content src="text/chapter.xhtml"/></navPoint>';
}

function ncxDocument(
  navigation: string,
  options: {
    readonly beforeNavMap?: string;
    readonly afterNavMap?: string;
  } = {},
): string {
  return `<ncx xmlns="${NCX_NAMESPACE}" version="2005-1"><head><meta name="dtb:uid" content="urn:synthetic:ncx"/></head><docTitle><text>Synthetic NCX</text></docTitle>${options.beforeNavMap ?? ""}<navMap>${navigation}</navMap>${options.afterNavMap ?? ""}</ncx>`;
}

async function createArchive(ncx: string): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const entries: readonly (readonly [string, string, number])[] = [
    ["mimetype", "application/epub+zip", 0],
    ["EPUB/toc.ncx", ncx, 0],
    ["EPUB/text/chapter.xhtml", "<html/>", 0],
    ["EPUB/appendix.xhtml", "<html/>", 0],
    ["EPUB/images/cover.png", "synthetic", 0],
  ];
  for (const [path, value, level] of entries) {
    await writer.add(path, new Uint8ArrayReader(encoder.encode(value)), {
      ...ZIP_WRITER_OPTIONS,
      level,
    });
  }
  return writer.close();
}

async function withNcxArchive(
  ncx: string,
  options: EpubProcessingBudgetOptions,
  action: (archive: OpenedEpubArchive) => Promise<void>,
): Promise<void> {
  const archive = await openEpubArchive(await createArchive(ncx), options);
  try {
    await action(archive);
  } finally {
    await archive.close();
  }
}

async function expectNcxError(
  ncx: string,
  options: EpubProcessingBudgetOptions,
  code: EpubArchiveError["code"],
): Promise<void> {
  await withNcxArchive(ncx, options, async (archive) => {
    await expectNavigationActionError(
      () => parseNavigationDocument(archive, createPackageDocument()),
      code,
    );
  });
}

async function expectNavigationActionError(
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
