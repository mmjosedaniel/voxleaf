import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import type { ZipWriterAddDataOptions } from "@zip.js/zip.js/lib/zip-core-native.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EpubArchiveError } from "./archive-error.js";
import { inventoryEpubArchive } from "./archive-inventory.js";

const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;

const MAX_ARCHIVE_ENTRIES = 4_096;
const MAX_ENTRY_UNCOMPRESSED_BYTES = 64 * 1_048_576;
const MAX_TOTAL_UNCOMPRESSED_BYTES = 512 * 1_048_576;

const ZIP_WRITER_OPTIONS = Object.freeze({
  dataDescriptor: false,
  extendedTimestamp: false,
  keepOrder: true,
  lastModDate: new Date("2000-01-01T00:00:00.000Z"),
  transferStreams: false,
  useCompressionStream: false,
  useWebWorkers: false,
});

interface TestEntry {
  readonly name: string;
  readonly data?: string | Uint8Array;
  readonly options?: ZipWriterAddDataOptions;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EPUB ZIP inventory", () => {
  it("returns an immutable physical-order inventory without workers or network", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    const archive = await createArchive([
      mimetypeEntry(),
      { name: "EPUB/", options: { directory: true } },
      { name: "EPUB/chapter.xhtml", data: "<p>synthetic</p>" },
    ]);

    const inventory = await inventoryEpubArchive(archive);

    expect(inventory).toMatchObject({
      entryCount: 3,
      fileCount: 2,
      directoryCount: 1,
      totalDeclaredUncompressedBytes: 36,
    });
    expect(inventory.entries).toEqual([
      {
        path: "mimetype",
        kind: "file",
        compressionMethod: "stored",
        compressedSize: 20,
        uncompressedSize: 20,
        crc32: expect.any(Number),
        localHeaderOffset: 0,
        zip64: false,
      },
      {
        path: "EPUB",
        kind: "directory",
        compressionMethod: "stored",
        compressedSize: 0,
        uncompressedSize: 0,
        crc32: 0,
        localHeaderOffset: expect.any(Number),
        zip64: false,
      },
      {
        path: "EPUB/chapter.xhtml",
        kind: "file",
        compressionMethod: "deflate",
        compressedSize: expect.any(Number),
        uncompressedSize: 16,
        crc32: expect.any(Number),
        localHeaderOffset: expect.any(Number),
        zip64: false,
      },
    ]);
    expect(Object.isFrozen(inventory)).toBe(true);
    expect(Object.isFrozen(inventory.entries)).toBe(true);
    expect(inventory.entries.every(Object.isFrozen)).toBe(true);
    expect(worker).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses physical local-header order even when central records are reordered", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      { name: "book.opf", data: "package" },
    ]);
    const reordered = swapFirstTwoCentralDirectoryRecords(archive);

    const inventory = await inventoryEpubArchive(reordered);

    expect(inventory.entries.map(({ path }) => path)).toEqual([
      "mimetype",
      "book.opf",
    ]);
  });

  it("allows safe, in-budget ZIP64 metadata", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      {
        name: "EPUB/chapter.xhtml",
        data: "chapter",
        options: { zip64: true },
      },
    ]);

    const inventory = await inventoryEpubArchive(archive);

    expect(inventory.entries[1]).toMatchObject({
      path: "EPUB/chapter.xhtml",
      zip64: true,
    });
  });

  it("does not decompress non-mimetype content during inventory", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      { name: "EPUB/private-canary.xhtml", data: "private-canary" },
    ]);
    const corrupted = corruptEntryData(archive, "EPUB/private-canary.xhtml");

    await expect(inventoryEpubArchive(corrupted)).resolves.toMatchObject({
      entryCount: 2,
      fileCount: 2,
    });
  });
});

describe("OCF mimetype validation", () => {
  it.each([
    {
      name: "missing",
      build: () => createArchive([{ name: "book.opf", data: "package" }]),
    },
    {
      name: "not physically first",
      build: () =>
        createArchive([{ name: "book.opf", data: "package" }, mimetypeEntry()]),
    },
    {
      name: "compressed",
      build: () =>
        createArchive([
          {
            name: "mimetype",
            data: "application/epub+zip",
            options: { level: 6 },
          },
        ]),
    },
    {
      name: "wrong bytes",
      build: () =>
        createArchive([
          {
            name: "mimetype",
            data: "application/epub+ziq",
            options: { level: 0 },
          },
        ]),
    },
    {
      name: "trailing newline",
      build: () =>
        createArchive([
          {
            name: "mimetype",
            data: "application/epub+zip\n",
            options: { level: 0 },
          },
        ]),
    },
    {
      name: "local extra field",
      build: () =>
        createArchive([
          {
            name: "mimetype",
            data: "application/epub+zip",
            options: {
              extraField: new Map([[0xcafe, Uint8Array.of(1)]]),
              level: 0,
            },
          },
        ]),
    },
  ])("rejects a $name mimetype", async ({ build }) => {
    const archive = await build();

    await expectArchiveError(archive, "invalid-container");
  });

  it("rejects an encrypted mimetype without attempting decryption", async () => {
    const archive = await createArchive([
      {
        name: "mimetype",
        data: "application/epub+zip",
        options: { level: 0, password: "synthetic-test-password" },
      },
    ]);

    await expectArchiveError(archive, "unsupported-protection");
  });

  it("checks the mimetype CRC while keeping dependency details private", async () => {
    const archive = await createArchive([mimetypeEntry()]);
    const corrupted = corruptEntryData(archive, "mimetype");

    const error = await captureArchiveError(corrupted);

    expect(error).toMatchObject({
      code: "invalid-container",
      message: "invalid-container",
    });
    expect(error.cause).toBeUndefined();
  });
});

describe("ZIP structure and entry policy", () => {
  it.each([
    {
      name: "appended data",
      mutate: (archive: Uint8Array) => appendByte(archive),
      code: "invalid-container" as const,
    },
    {
      name: "prepended data",
      mutate: (archive: Uint8Array) => prependByte(archive),
      code: "invalid-container" as const,
    },
    {
      name: "split archive metadata",
      mutate: (archive: Uint8Array) => markArchiveAsSplit(archive),
      code: "invalid-container" as const,
    },
    {
      name: "overlapping entries",
      mutate: (archive: Uint8Array) => overlapSecondEntryWithFirst(archive),
      code: "invalid-container" as const,
    },
    {
      name: "invalid local signature",
      mutate: (archive: Uint8Array) =>
        corruptLocalSignature(archive, "EPUB/chapter.xhtml"),
      code: "invalid-container" as const,
    },
    {
      name: "local and central method mismatch",
      mutate: (archive: Uint8Array) =>
        setLocalCompressionMethod(archive, "EPUB/chapter.xhtml", 0),
      code: "invalid-container" as const,
    },
    {
      name: "unsupported compression",
      mutate: (archive: Uint8Array) =>
        setCompressionMethod(archive, "EPUB/chapter.xhtml", 99),
      code: "invalid-container" as const,
    },
  ])("rejects $name", async ({ mutate, code }) => {
    const archive = await createArchive([
      mimetypeEntry(),
      { name: "EPUB/chapter.xhtml", data: "chapter" },
    ]);

    await expectArchiveError(mutate(archive), code);
  });

  it.each([0xa000, 0x1000, 0x2000, 0x6000, 0xc000])(
    "rejects Unix special file type %#x",
    async (unixFileType) => {
      const archive = await createArchive([
        mimetypeEntry(),
        {
          name: "EPUB/special",
          data: "target",
          options: {
            externalFileAttributes: unixFileType * 0x1_0000,
            versionMadeBy: 0x0314,
          },
        },
      ]);

      await expectArchiveError(archive, "unsafe-entry");
    },
  );

  it("rejects a file/directory metadata disagreement", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      {
        name: "EPUB/",
        options: {
          directory: true,
          externalFileAttributes: 0x8000 * 0x1_0000,
          versionMadeBy: 0x0314,
        },
      },
    ]);

    await expectArchiveError(archive, "unsafe-entry");
  });

  it("rejects Unicode-normalized and case-folded collisions", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      { name: "EPUB/Text/Chapter.xhtml", data: "first" },
      { name: "epub/text/chapter.xhtml", data: "second" },
    ]);

    await expectArchiveError(archive, "unsafe-entry");
  });

  it("rejects exact duplicate entry paths", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      { name: "EPUB/a.xhtml", data: "first" },
      { name: "EPUB/b.xhtml", data: "second" },
    ]);
    const duplicate = renameEntry(archive, "EPUB/b.xhtml", "EPUB/a.xhtml");

    await expectArchiveError(duplicate, "invalid-container");
  });

  it("rejects unsafe virtual paths with content-free errors", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      { name: "../private-canary.xhtml", data: "private-canary" },
    ]);

    const error = await captureArchiveError(archive);

    expect(error).toMatchObject({ code: "unsafe-entry" });
    expect(error.message).not.toContain("private-canary");
    expect(error.cause).toBeUndefined();
  });

  it("rejects a declared entry size above the per-entry maximum", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      { name: "EPUB/chapter.xhtml", data: "chapter" },
    ]);
    const oversized = setCentralUncompressedSize(
      archive,
      "EPUB/chapter.xhtml",
      MAX_ENTRY_UNCOMPRESSED_BYTES + 1,
    );

    await expectArchiveError(oversized, "resource-limit-exceeded");
  });

  it("allows the aggregate declared-size maximum and rejects the next byte", async () => {
    const entryNames = Array.from(
      { length: 8 },
      (_, index) => `EPUB/chapter-${index}.xhtml`,
    );
    const archive = await createArchive([
      mimetypeEntry(),
      ...entryNames.map((name) => ({ name, data: "chapter" })),
    ]);
    let atLimit = archive;

    for (const [index, name] of entryNames.entries()) {
      atLimit = setEntryUncompressedSize(
        atLimit,
        name,
        index === 0
          ? MAX_ENTRY_UNCOMPRESSED_BYTES - 20
          : MAX_ENTRY_UNCOMPRESSED_BYTES,
      );
    }

    await expect(inventoryEpubArchive(atLimit)).resolves.toMatchObject({
      totalDeclaredUncompressedBytes: MAX_TOTAL_UNCOMPRESSED_BYTES,
    });

    const aboveLimit = setEntryUncompressedSize(
      atLimit,
      entryNames[0]!,
      MAX_ENTRY_UNCOMPRESSED_BYTES - 19,
    );
    await expectArchiveError(aboveLimit, "resource-limit-exceeded");
  });

  it("rejects the first entry above the archive entry-count maximum", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      ...Array.from({ length: MAX_ARCHIVE_ENTRIES }, (_, index) => ({
        name: `EPUB/entry-${index.toString().padStart(4, "0")}/`,
        options: { directory: true } as const,
      })),
    ]);

    await expectArchiveError(archive, "resource-limit-exceeded");
  });

  it("rejects an unsafe ZIP64 integer", async () => {
    const archive = await createArchive([
      mimetypeEntry(),
      {
        name: "EPUB/chapter.xhtml",
        data: "chapter",
        options: { zip64: true },
      },
    ]);
    const unsafe = setZip64UncompressedSize(
      archive,
      "EPUB/chapter.xhtml",
      0x20_0000_0000_0000n,
    );

    await expectArchiveError(unsafe, "resource-limit-exceeded");
  });
});

function mimetypeEntry(): TestEntry {
  return {
    name: "mimetype",
    data: "application/epub+zip",
    options: { level: 0 },
  };
}

async function createArchive(
  entries: readonly TestEntry[],
): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const encoder = new TextEncoder();

  for (const entry of entries) {
    const data =
      typeof entry.data === "string"
        ? encoder.encode(entry.data)
        : (entry.data ?? new Uint8Array());
    await writer.add(entry.name, new Uint8ArrayReader(data), {
      ...ZIP_WRITER_OPTIONS,
      ...entry.options,
    });
  }

  return writer.close();
}

function appendByte(archive: Uint8Array): Uint8Array {
  const result = new Uint8Array(archive.byteLength + 1);
  result.set(archive);
  return result;
}

function prependByte(archive: Uint8Array): Uint8Array {
  const result = new Uint8Array(archive.byteLength + 1);
  result.set(archive, 1);
  return result;
}

function markArchiveAsSplit(archive: Uint8Array): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const endOffset = findEndOfCentralDirectory(view);
  view.setUint16(endOffset + 4, 1, true);
  view.setUint16(endOffset + 6, 1, true);
  return result;
}

function overlapSecondEntryWithFirst(archive: Uint8Array): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const firstDirectory = findCentralDirectory(view, "mimetype");
  const secondDirectory = findCentralDirectory(view, "EPUB/chapter.xhtml");
  const firstLocalHeaderOffset = view.getUint32(firstDirectory + 42, true);
  view.setUint32(secondDirectory + 42, firstLocalHeaderOffset, true);
  return result;
}

function corruptLocalSignature(
  archive: Uint8Array,
  filename: string,
): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const localOffset = findLocalHeader(view, filename);
  view.setUint32(localOffset, 0, true);
  return result;
}

function setLocalCompressionMethod(
  archive: Uint8Array,
  filename: string,
  method: number,
): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const localOffset = findLocalHeader(view, filename);
  view.setUint16(localOffset + 8, method, true);
  return result;
}

function setCompressionMethod(
  archive: Uint8Array,
  filename: string,
  method: number,
): Uint8Array {
  const result = setLocalCompressionMethod(archive, filename, method);
  const view = dataView(result);
  const centralOffset = findCentralDirectory(view, filename);
  view.setUint16(centralOffset + 10, method, true);
  return result;
}

function corruptEntryData(archive: Uint8Array, filename: string): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const localOffset = findLocalHeader(view, filename);
  const filenameLength = view.getUint16(localOffset + 26, true);
  const extraFieldLength = view.getUint16(localOffset + 28, true);
  const dataOffset = localOffset + 30 + filenameLength + extraFieldLength;
  result[dataOffset] = (result[dataOffset] ?? 0) ^ 0xff;
  return result;
}

function renameEntry(
  archive: Uint8Array,
  oldFilename: string,
  newFilename: string,
): Uint8Array {
  if (oldFilename.length !== newFilename.length) {
    throw new Error("synthetic replacement filenames must have equal length");
  }

  const result = archive.slice();
  const view = dataView(result);
  const centralOffset = findCentralDirectory(view, oldFilename);
  const localOffset = view.getUint32(centralOffset + 42, true);
  writeAscii(result, centralOffset + 46, newFilename);
  writeAscii(result, localOffset + 30, newFilename);
  return result;
}

function setCentralUncompressedSize(
  archive: Uint8Array,
  filename: string,
  size: number,
): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const centralOffset = findCentralDirectory(view, filename);
  view.setUint32(centralOffset + 24, size, true);
  return result;
}

function setEntryUncompressedSize(
  archive: Uint8Array,
  filename: string,
  size: number,
): Uint8Array {
  const result = setCentralUncompressedSize(archive, filename, size);
  const view = dataView(result);
  const localOffset = findLocalHeader(view, filename);
  view.setUint32(localOffset + 22, size, true);
  return result;
}

function setZip64UncompressedSize(
  archive: Uint8Array,
  filename: string,
  size: bigint,
): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const centralOffset = findCentralDirectory(view, filename);
  const filenameLength = view.getUint16(centralOffset + 28, true);
  const extraFieldLength = view.getUint16(centralOffset + 30, true);
  let extraOffset = centralOffset + 46 + filenameLength;
  const extraEnd = extraOffset + extraFieldLength;

  while (extraOffset + 4 <= extraEnd) {
    const type = view.getUint16(extraOffset, true);
    const fieldLength = view.getUint16(extraOffset + 2, true);
    if (type === 1 && fieldLength >= 8) {
      view.setBigUint64(extraOffset + 4, size, true);
      return result;
    }

    extraOffset += 4 + fieldLength;
  }

  throw new Error("synthetic ZIP64 extra field not found");
}

function swapFirstTwoCentralDirectoryRecords(archive: Uint8Array): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const firstOffset = findCentralDirectory(view, "mimetype");
  const secondOffset = findCentralDirectory(view, "book.opf");
  const firstLength = centralDirectoryRecordLength(view, firstOffset);
  const secondLength = centralDirectoryRecordLength(view, secondOffset);

  if (
    firstLength !== secondLength ||
    firstOffset + firstLength !== secondOffset
  ) {
    throw new Error(
      "synthetic central records must be adjacent and equal-sized",
    );
  }

  const first = result.slice(firstOffset, firstOffset + firstLength);
  const second = result.slice(secondOffset, secondOffset + secondLength);
  result.set(second, firstOffset);
  result.set(first, secondOffset);
  return result;
}

function centralDirectoryRecordLength(view: DataView, offset: number): number {
  return (
    46 +
    view.getUint16(offset + 28, true) +
    view.getUint16(offset + 30, true) +
    view.getUint16(offset + 32, true)
  );
}

function findLocalHeader(view: DataView, filename: string): number {
  const centralOffset = findCentralDirectory(view, filename);
  return view.getUint32(centralOffset + 42, true);
}

function findCentralDirectory(view: DataView, filename: string): number {
  const endOffset = findEndOfCentralDirectory(view);
  const directoryOffset = view.getUint32(endOffset + 16, true);
  const entryCount = view.getUint16(endOffset + 10, true);
  let offset = directoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== CENTRAL_DIRECTORY_SIGNATURE) {
      throw new Error("synthetic central directory signature not found");
    }

    const filenameLength = view.getUint16(offset + 28, true);
    const decodedFilename = readAscii(view, offset + 46, filenameLength);
    if (decodedFilename === filename) {
      return offset;
    }

    offset += centralDirectoryRecordLength(view, offset);
  }

  throw new Error("synthetic central directory entry not found");
}

function findEndOfCentralDirectory(view: DataView): number {
  for (let offset = view.byteLength - 22; offset >= 0; offset -= 1) {
    if (view.getUint32(offset, true) === END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      return offset;
    }
  }

  throw new Error("synthetic end of central directory not found");
}

function readAscii(view: DataView, offset: number, length: number): string {
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += String.fromCharCode(view.getUint8(offset + index));
  }
  return result;
}

function writeAscii(target: Uint8Array, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    target[offset + index] = value.charCodeAt(index);
  }
}

function dataView(value: Uint8Array): DataView {
  return new DataView(value.buffer, value.byteOffset, value.byteLength);
}

async function expectArchiveError(
  archive: Uint8Array,
  code: EpubArchiveError["code"],
): Promise<void> {
  const error = await captureArchiveError(archive);
  expect(error).toMatchObject({ code, message: code });
  expect(error.cause).toBeUndefined();
}

async function captureArchiveError(
  archive: Uint8Array,
): Promise<EpubArchiveError> {
  try {
    await inventoryEpubArchive(archive);
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    return error as EpubArchiveError;
  }

  throw new Error("expected archive inventory to fail");
}
