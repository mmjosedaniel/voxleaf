import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import { decodeBookV1 } from "@voxleaf/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import {
  openEpubArchive,
  type ArchiveEntryReadOptions,
  type OpenedEpubArchive,
} from "../archive/archive-inventory.js";
import type {
  PackageManifestItem,
  ParsedPackageDocument,
} from "../package/package-document.js";
import { parseArchiveEntryPath } from "../paths/archive-path.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import type {
  OpenedPublication,
  RasterImageMediaType,
  RasterImageResourceId,
} from "../document/document-model.js";
import { createOpenedPublication } from "./opened-publication.js";

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
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const IMAGE_ENTRIES = Object.freeze({
  "EPUB/images/cover.png": PNG,
  "EPUB/images/diagram.gif": GIF,
  "EPUB/images/photo.jpg": JPEG,
  "EPUB/images/illustration.webp": WEBP,
  "EPUB/images/active.png": PNG,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("bounded local publication resources", () => {
  it("exposes only immutable opaque raster descriptors and reads supported signatures lazily", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    await withPublication(
      createPackageDocument(),
      IMAGE_ENTRIES,
      {},
      async (publication, archive) => {
        expect(publication.resources).toEqual([
          { id: "resource:2", kind: "raster-image", mediaType: "image/png" },
          { id: "resource:3", kind: "raster-image", mediaType: "image/gif" },
          { id: "resource:4", kind: "raster-image", mediaType: "image/jpeg" },
          { id: "resource:5", kind: "raster-image", mediaType: "image/webp" },
        ]);
        expect(Object.isFrozen(publication.resources)).toBe(true);
        expect(Object.isFrozen(publication.resources[0])).toBe(true);
        expect(Object.isFrozen(publication)).toBe(true);
        expect(JSON.stringify(publication.resources)).not.toContain("EPUB/");
        expect(JSON.stringify(publication.resources)).not.toContain("bytes");
        expect(archive.budget.getSnapshot().observedUncompressedBytes).toBe(20);

        const expected = [PNG, GIF, JPEG, WEBP];
        for (const [index, bytes] of expected.entries()) {
          await expect(
            publication.readResource(imageId(index + 2)),
          ).resolves.toEqual(bytes);
        }

        const first = await publication.readResource(imageId(2));
        first[0] = 0;
        const second = await publication.readResource(imageId(2));
        expect(second).not.toBe(first);
        expect(second).toEqual(PNG);
        expect(worker).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
      },
    );
  });

  it("rejects a declared media type and byte-signature mismatch without returning partial bytes", async () => {
    const privateBytes = encoder.encode("private-canary");
    await withPublication(
      createSingleImagePackage("image/png", "EPUB/images/private.png"),
      { "EPUB/images/private.png": privateBytes },
      {},
      async (publication) => {
        let returned: Uint8Array | undefined;
        const error = await captureResourceError(async () => {
          returned = await publication.readResource(imageId(2));
        });

        expect(error).toMatchObject({
          code: "malformed-package",
          message: "malformed-package",
        });
        expect(error.message).not.toContain("private-canary");
        expect(error.cause).toBeUndefined();
        expect(returned).toBeUndefined();
      },
    );
  });

  it("allows the exact raster byte maximum and rejects a declared max-plus-one resource", async () => {
    const packageDocument = createSingleImagePackage(
      "image/png",
      "EPUB/images/exact.png",
    );
    await withPublication(
      packageDocument,
      { "EPUB/images/exact.png": PNG },
      { maxRasterImageBytes: PNG.byteLength },
      async (publication) => {
        await expect(publication.readResource(imageId(2))).resolves.toEqual(
          PNG,
        );
      },
    );

    const oversized = new Uint8Array([...PNG, 0]);
    const archive = await openEpubArchive(
      await createArchive({ "EPUB/images/exact.png": oversized }),
      { policy: { maxRasterImageBytes: PNG.byteLength } },
    );
    try {
      expect(() =>
        createOpenedPublication(archive, packageDocument, publicationValues()),
      ).toThrowError(
        expect.objectContaining({ code: "resource-limit-exceeded" }),
      );
    } finally {
      await archive.close();
    }
  });

  it("rejects unknown resource identities before reading archive bytes", async () => {
    await withPublication(
      createPackageDocument(),
      IMAGE_ENTRIES,
      {},
      async (publication, archive) => {
        const before = archive.budget.getSnapshot().observedUncompressedBytes;
        await expectResourceError(
          () => publication.readResource(imageId(99)),
          "broken-reference",
        );
        expect(archive.budget.getSnapshot().observedUncompressedBytes).toBe(
          before,
        );
      },
    );
  });

  it("rejects a declared local raster resource missing from the archive", async () => {
    const archive = await openEpubArchive(await createArchive({}));
    try {
      expect(() =>
        createOpenedPublication(
          archive,
          createSingleImagePackage("image/png", "EPUB/images/missing.png"),
          publicationValues(),
        ),
      ).toThrowError(expect.objectContaining({ code: "malformed-package" }));
    } finally {
      await archive.close();
    }
  });

  it("honors a read-scoped cancellation without closing the publication", async () => {
    await withPublication(
      createPackageDocument(),
      IMAGE_ENTRIES,
      {},
      async (publication) => {
        const controller = new AbortController();
        controller.abort("private-canary");

        await expectResourceError(
          () =>
            publication.readResource(imageId(2), {
              signal: controller.signal,
            }),
          "cancelled",
        );
        expect(publication.closed).toBe(false);
        await expect(publication.readResource(imageId(2))).resolves.toEqual(
          PNG,
        );
      },
    );
  });

  it("makes close idempotent and rejects reads after releasing the archive", async () => {
    const archive = await openEpubArchive(await createArchive(IMAGE_ENTRIES));
    const publication = createOpenedPublication(
      archive,
      createPackageDocument(),
      publicationValues(),
    );

    const firstClose = publication.close();
    const secondClose = publication.close();
    expect(secondClose).toBe(firstClose);
    await firstClose;

    expect(publication.closed).toBe(true);
    await expectResourceError(
      () => publication.readResource(imageId(2)),
      "internal-failure",
    );
  });

  it("propagates caller cancellation during an active resource read", async () => {
    const archive = new DeferredArchive();
    const publication = createOpenedPublication(
      archive,
      createSingleImagePackage("image/png", "EPUB/images/deferred.png"),
      publicationValues(),
    );
    const controller = new AbortController();

    const read = publication.readResource(imageId(2), {
      signal: controller.signal,
    });
    controller.abort("private-canary");

    await expectResourcePromiseError(read, "cancelled");
    expect(publication.closed).toBe(false);
    await publication.close();
    expect(archive.closeCount).toBe(1);
  });

  it("cancels an active resource read before close releases the archive", async () => {
    const archive = new DeferredArchive();
    const publication = createOpenedPublication(
      archive,
      createSingleImagePackage("image/png", "EPUB/images/deferred.png"),
      publicationValues(),
    );

    const read = publication.readResource(imageId(2));
    await expectResourceError(
      () => publication.readResource(imageId(2)),
      "internal-failure",
    );
    const close = publication.close();

    await expectResourcePromiseError(read, "cancelled");
    await close;
    expect(publication.closed).toBe(true);
    expect(archive.closeCount).toBe(1);
  });
});

class DeferredArchive implements OpenedEpubArchive {
  public readonly budget = createEpubProcessingBudget();
  public readonly inventory = Object.freeze({
    entries: Object.freeze([
      Object.freeze({
        path: filePath("EPUB/images/deferred.png"),
        kind: "file" as const,
        compressionMethod: "stored" as const,
        compressedSize: PNG.byteLength,
        uncompressedSize: PNG.byteLength,
        crc32: 0,
        localHeaderOffset: 0,
        zip64: false,
      }),
    ]),
    entryCount: 1,
    fileCount: 1,
    directoryCount: 0,
    totalDeclaredUncompressedBytes: PNG.byteLength,
  });
  public closeCount = 0;

  public readEntry(
    _path: ArchiveFilePath,
    options: ArchiveEntryReadOptions = {},
  ): Promise<Uint8Array> {
    return new Promise((_resolve, reject) => {
      const signal = options.signal;
      if (signal?.aborted === true) {
        reject(new EpubArchiveError("cancelled"));
        return;
      }

      signal?.addEventListener(
        "abort",
        () => reject(new EpubArchiveError("cancelled")),
        { once: true },
      );
    });
  }

  public async close(): Promise<void> {
    this.closeCount += 1;
  }
}

function imageId(index: number): RasterImageResourceId {
  return `resource:${String(index)}` as RasterImageResourceId;
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

function externalRasterItem(id: string): PackageManifestItem {
  return Object.freeze({
    id,
    location: Object.freeze({ kind: "external" }),
    mediaType: "image/png",
    mediaTypeEssence: "image/png",
    kind: "raster-image",
    properties: Object.freeze([]),
  });
}

function createPackageDocument(
  imageItems: readonly PackageManifestItem[] = [
    localItem("png", "EPUB/images/cover.png", "image/png", "raster-image"),
    localItem("gif", "EPUB/images/diagram.gif", "image/gif", "raster-image"),
    localItem("jpeg", "EPUB/images/photo.jpg", "image/jpeg", "raster-image"),
    localItem(
      "webp",
      "EPUB/images/illustration.webp",
      "image/webp",
      "raster-image",
    ),
    localItem("active", "EPUB/images/active.png", "image/png", "raster-image", [
      "scripted",
    ]),
    externalRasterItem("remote"),
    localItem("svg", "EPUB/images/vector.svg", "image/svg+xml", "other"),
  ],
): ParsedPackageDocument {
  const nav = localItem(
    "nav",
    "EPUB/nav.xhtml",
    "application/xhtml+xml",
    "content-document",
    ["nav"],
  );
  const chapter = localItem(
    "chapter",
    "EPUB/chapter.xhtml",
    "application/xhtml+xml",
    "content-document",
  );
  return Object.freeze({
    path: filePath("EPUB/package.opf"),
    version: "3.0",
    renditionLayout: "reflowable",
    pageProgressionDirection: "default",
    metadata: Object.freeze({
      uniqueIdentifier: "urn:synthetic:resources",
      identifiers: Object.freeze(["urn:synthetic:resources"]),
      titles: Object.freeze(["Synthetic resources"]),
      languages: Object.freeze(["en"]),
      creators: Object.freeze([]),
      modified: "2026-07-22T00:00:00Z",
    }),
    manifest: Object.freeze([nav, chapter, ...imageItems]),
    spine: Object.freeze([
      Object.freeze({
        index: 0,
        idref: "chapter",
        contentResourceId: "chapter",
        path: filePath("EPUB/chapter.xhtml"),
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

function createSingleImagePackage(
  mediaType: RasterImageMediaType,
  path: string,
): ParsedPackageDocument {
  return createPackageDocument([
    localItem("image", path, mediaType, "raster-image"),
  ]);
}

function publicationValues() {
  return Object.freeze({
    book: decodeBookV1({
      schemaVersion: 1,
      identity: {
        scheme: "synthetic-test",
        schemeVersion: 1,
        value: "book-resource-test",
      },
      metadata: { title: "Synthetic resources", authors: [] },
      resources: [
        {
          path: "EPUB/chapter.xhtml",
          mediaType: "application/xhtml+xml",
          role: "content-document",
        },
      ],
      spine: [
        {
          id: "spine:0",
          index: 0,
          resourcePath: "EPUB/chapter.xhtml",
        },
      ],
      navigation: [],
    }),
    documents: Object.freeze([]),
    navigation: Object.freeze([]),
  });
}

async function createArchive(
  imageEntries: Readonly<Record<string, Uint8Array>>,
): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const entries: (readonly [string, Uint8Array])[] = [
    ["mimetype", encoder.encode("application/epub+zip")],
    ["EPUB/nav.xhtml", encoder.encode("<html/>")],
    ["EPUB/chapter.xhtml", encoder.encode("<html/>")],
    ["EPUB/images/vector.svg", encoder.encode("<svg/>")],
    ...Object.entries(imageEntries),
  ];

  for (const [index, [path, bytes]] of entries.entries()) {
    await writer.add(path, new Uint8ArrayReader(bytes), {
      ...ZIP_WRITER_OPTIONS,
      level: index === 0 ? 0 : 6,
    });
  }
  return writer.close();
}

async function withPublication(
  packageDocument: ParsedPackageDocument,
  imageEntries: Readonly<Record<string, Uint8Array>>,
  policy: Readonly<{ maxRasterImageBytes?: number }>,
  action: (
    publication: OpenedPublication,
    archive: OpenedEpubArchive,
  ) => Promise<void>,
): Promise<void> {
  const archive = await openEpubArchive(await createArchive(imageEntries), {
    policy,
  });
  const publication = createOpenedPublication(
    archive,
    packageDocument,
    publicationValues(),
  );
  try {
    await action(publication, archive);
  } finally {
    await publication.close();
  }
}

async function expectResourceError(
  action: () => Promise<unknown>,
  code: EpubArchiveError["code"],
): Promise<void> {
  const error = await captureResourceError(action);
  expect(error).toMatchObject({ code, message: code });
  expect(error.cause).toBeUndefined();
}

async function expectResourcePromiseError(
  promise: Promise<unknown>,
  code: EpubArchiveError["code"],
): Promise<void> {
  await expectResourceError(() => promise, code);
}

async function captureResourceError(
  action: () => Promise<unknown>,
): Promise<EpubArchiveError> {
  try {
    await action();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    return error as EpubArchiveError;
  }

  throw new Error("expected resource operation to fail");
}
