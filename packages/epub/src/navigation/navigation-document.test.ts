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
import { parseNavigationDocument } from "./navigation-document.js";

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EPUB 3 navigation document parsing", () => {
  it("parses namespace-aware nested labels and fragment targets without network or workers", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    await withArchive(
      navigationDocument(`
        <h:li>
          <h:a href="text/chapter.xhtml#start"> Chapter <h:em>One</h:em> </h:a>
          <h:ol>
            <h:li><h:a href="text/chapter.xhtml#part-a">Part <h:strong>A</h:strong></h:a></h:li>
          </h:ol>
        </h:li>
        <h:li>
          <h:span> Resources </h:span>
          <h:ol>
            <h:li><h:a href="appendix.xhtml#note"><h:img alt="Appendix"/> Image</h:a></h:li>
          </h:ol>
        </h:li>`),
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
                  label: "Part A",
                  target: {
                    kind: "spine",
                    path: "EPUB/text/chapter.xhtml",
                    spineItemIndex: 0,
                    fragment: "part-a",
                  },
                  children: [],
                },
              ],
            },
            {
              label: "Resources",
              children: [
                {
                  label: "Appendix Image",
                  target: {
                    kind: "non-spine",
                    path: "EPUB/appendix.xhtml",
                    fragment: "note",
                  },
                  children: [],
                },
              ],
            },
          ],
        });
        expect(Object.isFrozen(parsed)).toBe(true);
        expect(Object.isFrozen(parsed.roots)).toBe(true);
        expect(Object.isFrozen(parsed.roots[0])).toBe(true);
        expect(Object.isFrozen(parsed.roots[0]?.children)).toBe(true);
        expect(JSON.stringify(parsed)).not.toContain("href");
        expect(worker).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
      },
    );
  });

  it("uses a title fallback when a link has no textual label", async () => {
    await withArchive(
      navigationDocument(
        `<h:li><h:a href="text/chapter.xhtml" title="Chapter One"><h:img/></h:a></h:li>`,
      ),
      {},
      async (archive) => {
        const parsed = await parseNavigationDocument(
          archive,
          createPackageDocument(),
        );

        expect(parsed.roots[0]?.label).toBe("Chapter One");
      },
    );
  });

  it.each([
    [
      "missing toc",
      `<h:html xmlns:h="http://www.w3.org/1999/xhtml"><h:body/></h:html>`,
    ],
    [
      "duplicate toc",
      `<h:html xmlns:h="http://www.w3.org/1999/xhtml" xmlns:e="http://www.idpf.org/2007/ops"><h:body>${toc(`<h:li><h:a href="text/chapter.xhtml">One</h:a></h:li>`)}${toc(`<h:li><h:a href="text/chapter.xhtml">Two</h:a></h:li>`)}</h:body></h:html>`,
    ],
    ["empty list", navigationDocument("")],
    ["span leaf", navigationDocument(`<h:li><h:span>Group</h:span></h:li>`)],
    [
      "missing label",
      navigationDocument(
        `<h:li><h:ol><h:li><h:a href="text/chapter.xhtml">Nested</h:a></h:li></h:ol></h:li>`,
      ),
    ],
    [
      "multiple labels",
      navigationDocument(
        `<h:li><h:a href="text/chapter.xhtml">One</h:a><h:a href="text/chapter.xhtml">Two</h:a></h:li>`,
      ),
    ],
    [
      "direct text",
      navigationDocument(
        `private-canary<h:li><h:a href="text/chapter.xhtml">One</h:a></h:li>`,
      ),
    ],
    [
      "non-XML whitespace between items",
      navigationDocument(
        `\u00a0<h:li><h:a href="text/chapter.xhtml">One</h:a></h:li>`,
      ),
    ],
    [
      "wrong root namespace",
      `<html xmlns="urn:private"><body><nav xmlns="http://www.w3.org/1999/xhtml" xmlns:e="http://www.idpf.org/2007/ops" e:type="toc"><ol><li><a href="text/chapter.xhtml">One</a></li></ol></nav></body></html>`,
    ],
    [
      "toc outside body",
      `<h:html xmlns:h="http://www.w3.org/1999/xhtml" xmlns:e="http://www.idpf.org/2007/ops"><h:head>${toc(`<h:li><h:a href="text/chapter.xhtml">One</h:a></h:li>`)}</h:head><h:body/></h:html>`,
    ],
  ])("rejects malformed navigation grammar: %s", async (_name, document) => {
    await expectNavigationError(document, {}, "malformed-package");
  });

  it.each([
    ["remote", "https://private.invalid/chapter.xhtml"],
    ["active scheme", "javascript:private-canary"],
    ["missing document", "missing.xhtml"],
    ["query", "text/chapter.xhtml?private=true"],
  ])("rejects a %s toc target", async (_name, href) => {
    await expectNavigationError(
      navigationDocument(`<h:li><h:a href="${href}">Chapter</h:a></h:li>`),
      {},
      "broken-reference",
    );
  });

  it("permits exact navigation depth and node limits", async () => {
    await withArchive(
      navigationDocument(
        `<h:li><h:a href="text/chapter.xhtml">One</h:a><h:ol><h:li><h:a href="text/chapter.xhtml#two">Two</h:a></h:li></h:ol></h:li>`,
      ),
      { policy: { maxNavigationDepth: 2, maxNavigationNodes: 2 } },
      async (archive) => {
        const parsed = await parseNavigationDocument(
          archive,
          createPackageDocument(),
        );
        expect(parsed.roots[0]?.children).toHaveLength(1);
      },
    );
  });

  it.each([
    [
      "depth",
      `<h:li><h:a href="text/chapter.xhtml">One</h:a><h:ol><h:li><h:a href="text/chapter.xhtml#two">Two</h:a></h:li></h:ol></h:li>`,
      { maxNavigationDepth: 1 },
    ],
    [
      "nodes",
      `<h:li><h:a href="text/chapter.xhtml">One</h:a></h:li><h:li><h:a href="text/chapter.xhtml#two">Two</h:a></h:li>`,
      { maxNavigationNodes: 1 },
    ],
  ])(
    "rejects navigation beyond the configured %s limit",
    async (_name, list, policy) => {
      await expectNavigationError(
        navigationDocument(list),
        { policy },
        "resource-limit-exceeded",
      );
    },
  );

  it("honors cancellation before reading navigation bytes", async () => {
    const controller = new AbortController();
    await withArchive(
      navigationDocument(
        `<h:li><h:a href="text/chapter.xhtml">One</h:a></h:li>`,
      ),
      { signal: controller.signal },
      async (archive) => {
        controller.abort();
        await expectNavigationActionError(
          () => parseNavigationDocument(archive, createPackageDocument()),
          "cancelled",
        );
      },
    );
  });

  it("honors the ingestion deadline", async () => {
    const clock = new MutableClock();
    await withArchive(
      navigationDocument(
        `<h:li><h:a href="text/chapter.xhtml">One</h:a></h:li>`,
      ),
      { clock },
      async (archive) => {
        clock.value = 30_001;
        await expectNavigationActionError(
          () => parseNavigationDocument(archive, createPackageDocument()),
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

function localContentItem(
  id: string,
  path: string,
  properties: readonly string[] = [],
): PackageManifestItem {
  return Object.freeze({
    id,
    location: Object.freeze({ kind: "local", path: filePath(path) }),
    mediaType: "application/xhtml+xml",
    mediaTypeEssence: "application/xhtml+xml",
    kind: "content-document",
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
      uniqueIdentifier: "urn:synthetic:navigation",
      identifiers: Object.freeze(["urn:synthetic:navigation"]),
      titles: Object.freeze(["Synthetic navigation"]),
      languages: Object.freeze(["en"]),
      creators: Object.freeze([]),
      modified: "2026-07-22T00:00:00Z",
    }),
    manifest: Object.freeze([
      localContentItem("nav", "EPUB/nav.xhtml", ["nav"]),
      localContentItem("chapter", "EPUB/text/chapter.xhtml"),
      localContentItem("appendix", "EPUB/appendix.xhtml"),
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
      resourceId: "nav",
      path: filePath("EPUB/nav.xhtml"),
    }),
  });
}

function navigationDocument(list: string): string {
  return `<h:html xmlns:h="http://www.w3.org/1999/xhtml" xmlns:e="http://www.idpf.org/2007/ops"><h:head><h:title>Ignored</h:title></h:head><h:body>${toc(list)}</h:body></h:html>`;
}

function toc(list: string): string {
  return `<h:nav e:type="toc"><h:h2>Contents</h:h2><h:ol>${list}</h:ol></h:nav>`;
}

async function createArchive(navigation: string): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const entries: readonly (readonly [string, string, number])[] = [
    ["mimetype", "application/epub+zip", 0],
    ["EPUB/nav.xhtml", navigation, 0],
    ["EPUB/text/chapter.xhtml", "<html/>", 0],
    ["EPUB/appendix.xhtml", "<html/>", 0],
  ];

  for (const [path, value, level] of entries) {
    await writer.add(path, new Uint8ArrayReader(encoder.encode(value)), {
      ...ZIP_WRITER_OPTIONS,
      level,
    });
  }
  return writer.close();
}

async function withArchive(
  navigation: string,
  options: EpubProcessingBudgetOptions,
  action: (archive: OpenedEpubArchive) => Promise<void>,
): Promise<void> {
  const archive = await openEpubArchive(
    await createArchive(navigation),
    options,
  );
  try {
    await action(archive);
  } finally {
    await archive.close();
  }
}

async function expectNavigationError(
  navigation: string,
  options: EpubProcessingBudgetOptions,
  code: EpubArchiveError["code"],
): Promise<void> {
  await withArchive(navigation, options, async (archive) => {
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
