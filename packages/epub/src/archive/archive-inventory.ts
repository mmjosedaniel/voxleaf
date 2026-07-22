import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import type { Entry } from "@zip.js/zip.js/lib/zip-core-native.js";

import {
  assertNoArchivePathCollisions,
  decodeArchiveEntryPath,
} from "../paths/archive-path.js";
import type {
  ArchiveEntryKind,
  ArchiveEntryPath,
} from "../paths/archive-path.js";
import { EpubPathError } from "../paths/path-error.js";
import { EpubArchiveError } from "./archive-error.js";
import type { EpubArchiveErrorCode } from "./archive-error.js";

const MAX_COMPRESSED_EPUB_BYTES = 100 * 1_048_576;
const MAX_ARCHIVE_ENTRIES = 4_096;
const MAX_ENTRY_UNCOMPRESSED_BYTES = 64 * 1_048_576;
const MAX_TOTAL_UNCOMPRESSED_BYTES = 512 * 1_048_576;

const COMPRESSION_METHOD_STORE = 0;
const COMPRESSION_METHOD_DEFLATE = 8;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const LOCAL_FILE_HEADER_LENGTH = 30;
const LOCAL_FILE_HEADER_FILENAME_LENGTH_OFFSET = 26;
const LOCAL_FILE_HEADER_EXTRA_FIELD_LENGTH_OFFSET = 28;

const UNIX_FILE_TYPE_MASK = 0xf000;
const UNIX_FILE_TYPE_DIRECTORY = 0x4000;
const UNIX_FILE_TYPE_REGULAR = 0x8000;

const MIMETYPE_PATH = "mimetype";
const MIMETYPE_BYTES = new TextEncoder().encode("application/epub+zip");

const ZIP_READER_OPTIONS = Object.freeze({
  checkOverlappingEntry: true,
  checkSignature: true,
  maxAppendedDataSize: 0,
  strictness: "strict" as const,
  transferStreams: false,
  useCompressionStream: false,
  useWebWorkers: false,
});

const ZIP_STRUCTURE_CHECK_OPTIONS = Object.freeze({
  ...ZIP_READER_OPTIONS,
  checkOverlappingEntryOnly: true,
  passThrough: true,
});

export type ArchiveCompressionMethod = "deflate" | "stored";

export interface ArchiveInventoryEntry {
  readonly path: ArchiveEntryPath;
  readonly kind: ArchiveEntryKind;
  readonly compressionMethod: ArchiveCompressionMethod;
  readonly compressedSize: number;
  readonly uncompressedSize: number;
  readonly crc32: number;
  readonly localHeaderOffset: number;
  readonly zip64: boolean;
}

export interface ArchiveInventory {
  readonly entries: readonly ArchiveInventoryEntry[];
  readonly entryCount: number;
  readonly fileCount: number;
  readonly directoryCount: number;
  readonly totalDeclaredUncompressedBytes: number;
}

interface CandidateEntry {
  readonly inventoryEntry: ArchiveInventoryEntry;
  readonly source: Entry;
}

interface StructurallyCheckableEntry {
  getData(
    writer: Uint8ArrayWriter,
    options: typeof ZIP_STRUCTURE_CHECK_OPTIONS,
  ): Promise<unknown>;
}

function fail(code: EpubArchiveErrorCode): never {
  throw new EpubArchiveError(code);
}

function assertSafeNonnegativeInteger(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    fail("resource-limit-exceeded");
  }
}

function readEntryKind(entry: Entry): ArchiveEntryKind {
  const unixFileType =
    (entry.externalFileAttributes >>> 16) & UNIX_FILE_TYPE_MASK;

  if (
    unixFileType !== 0 &&
    unixFileType !== UNIX_FILE_TYPE_DIRECTORY &&
    unixFileType !== UNIX_FILE_TYPE_REGULAR
  ) {
    return fail("unsafe-entry");
  }

  if (entry.directory) {
    if (unixFileType === UNIX_FILE_TYPE_REGULAR) {
      return fail("unsafe-entry");
    }

    return "directory";
  }

  if (unixFileType === UNIX_FILE_TYPE_DIRECTORY) {
    return fail("unsafe-entry");
  }

  return "file";
}

function readCompressionMethod(method: number): ArchiveCompressionMethod {
  if (method === COMPRESSION_METHOD_STORE) {
    return "stored";
  }

  if (method === COMPRESSION_METHOD_DEFLATE) {
    return "deflate";
  }

  return fail("invalid-container");
}

function createCandidateEntry(
  entry: Entry,
  archiveByteLength: number,
): CandidateEntry {
  assertSafeNonnegativeInteger(entry.offset);
  assertSafeNonnegativeInteger(entry.compressedSize);
  assertSafeNonnegativeInteger(entry.uncompressedSize);
  assertSafeNonnegativeInteger(entry.diskNumberStart);

  if (entry.diskNumberStart !== 0 || entry.offset >= archiveByteLength) {
    return fail("invalid-container");
  }

  if (entry.uncompressedSize > MAX_ENTRY_UNCOMPRESSED_BYTES) {
    return fail("resource-limit-exceeded");
  }

  if (entry.encrypted) {
    return fail("unsupported-protection");
  }

  const kind = readEntryKind(entry);
  const path = decodeArchiveEntryPath(entry.rawFilename, kind);
  const expectedDecodedFilename =
    kind === "directory" ? `${String(path)}/` : String(path);

  if (entry.filename !== expectedDecodedFilename) {
    return fail("unsafe-entry");
  }

  const compressionMethod = readCompressionMethod(entry.compressionMethod);

  if (
    kind === "directory" &&
    (compressionMethod !== "stored" ||
      entry.compressedSize !== 0 ||
      entry.uncompressedSize !== 0)
  ) {
    return fail("unsafe-entry");
  }

  return Object.freeze({
    inventoryEntry: Object.freeze({
      path,
      kind,
      compressionMethod,
      compressedSize: entry.compressedSize,
      uncompressedSize: entry.uncompressedSize,
      crc32: entry.signature,
      localHeaderOffset: entry.offset,
      zip64: entry.zip64 === true,
    }),
    source: entry,
  });
}

async function validateLocalStructure(entries: readonly CandidateEntry[]) {
  for (const { source } of entries) {
    const checkableEntry = source as unknown as StructurallyCheckableEntry;

    if (typeof checkableEntry.getData !== "function") {
      return fail("invalid-container");
    }

    await checkableEntry.getData(
      new Uint8ArrayWriter(),
      ZIP_STRUCTURE_CHECK_OPTIONS,
    );
  }
}

function assertMimetypeLocalHeader(
  archiveBytes: Uint8Array,
  entry: ArchiveInventoryEntry,
): void {
  if (
    entry.localHeaderOffset !== 0 ||
    archiveBytes.byteLength < LOCAL_FILE_HEADER_LENGTH
  ) {
    return fail("invalid-container");
  }

  const view = new DataView(
    archiveBytes.buffer,
    archiveBytes.byteOffset,
    archiveBytes.byteLength,
  );

  if (view.getUint32(0, true) !== LOCAL_FILE_HEADER_SIGNATURE) {
    return fail("invalid-container");
  }

  const filenameLength = view.getUint16(
    LOCAL_FILE_HEADER_FILENAME_LENGTH_OFFSET,
    true,
  );
  const extraFieldLength = view.getUint16(
    LOCAL_FILE_HEADER_EXTRA_FIELD_LENGTH_OFFSET,
    true,
  );

  if (
    filenameLength !== MIMETYPE_PATH.length ||
    extraFieldLength !== 0 ||
    LOCAL_FILE_HEADER_LENGTH + filenameLength > archiveBytes.byteLength
  ) {
    return fail("invalid-container");
  }

  for (let index = 0; index < filenameLength; index += 1) {
    if (
      archiveBytes[LOCAL_FILE_HEADER_LENGTH + index] !==
      MIMETYPE_PATH.charCodeAt(index)
    ) {
      return fail("invalid-container");
    }
  }
}

async function validateMimetype(
  archiveBytes: Uint8Array,
  orderedEntries: readonly CandidateEntry[],
): Promise<void> {
  const firstEntry = orderedEntries[0];
  if (firstEntry === undefined) {
    return fail("invalid-container");
  }

  const { inventoryEntry, source } = firstEntry;
  if (
    inventoryEntry.kind !== "file" ||
    String(inventoryEntry.path) !== MIMETYPE_PATH ||
    inventoryEntry.compressionMethod !== "stored" ||
    inventoryEntry.compressedSize !== MIMETYPE_BYTES.byteLength ||
    inventoryEntry.uncompressedSize !== MIMETYPE_BYTES.byteLength ||
    inventoryEntry.zip64
  ) {
    return fail("invalid-container");
  }

  assertMimetypeLocalHeader(archiveBytes, inventoryEntry);

  if (source.directory) {
    return fail("invalid-container");
  }

  const data = await source.getData(new Uint8ArrayWriter(), ZIP_READER_OPTIONS);

  if (
    data.byteLength !== MIMETYPE_BYTES.byteLength ||
    data.some((value, index) => value !== MIMETYPE_BYTES[index])
  ) {
    return fail("invalid-container");
  }
}

function mapArchiveError(error: unknown): EpubArchiveError {
  if (error instanceof EpubArchiveError) {
    return error;
  }

  if (error instanceof EpubPathError) {
    return new EpubArchiveError(
      error.code === "resource-limit-exceeded"
        ? "resource-limit-exceeded"
        : "unsafe-entry",
    );
  }

  return new EpubArchiveError("invalid-container");
}

export async function inventoryEpubArchive(
  archiveBytes: Uint8Array,
): Promise<ArchiveInventory> {
  if (archiveBytes.byteLength > MAX_COMPRESSED_EPUB_BYTES) {
    return fail("resource-limit-exceeded");
  }

  const reader = new ZipReader(
    new Uint8ArrayReader(archiveBytes),
    ZIP_READER_OPTIONS,
  );

  try {
    const candidates: CandidateEntry[] = [];
    let totalDeclaredUncompressedBytes = 0;

    for await (const entry of reader.getEntriesGenerator()) {
      if (candidates.length >= MAX_ARCHIVE_ENTRIES) {
        return fail("resource-limit-exceeded");
      }

      const candidate = createCandidateEntry(entry, archiveBytes.byteLength);
      const { uncompressedSize } = candidate.inventoryEntry;

      if (
        totalDeclaredUncompressedBytes >
        MAX_TOTAL_UNCOMPRESSED_BYTES - uncompressedSize
      ) {
        return fail("resource-limit-exceeded");
      }

      totalDeclaredUncompressedBytes += uncompressedSize;
      candidates.push(candidate);
    }

    assertNoArchivePathCollisions(
      candidates.map(({ inventoryEntry }) => inventoryEntry.path),
    );

    const orderedCandidates = [...candidates].sort(
      (left, right) =>
        left.inventoryEntry.localHeaderOffset -
        right.inventoryEntry.localHeaderOffset,
    );

    await validateLocalStructure(orderedCandidates);

    await validateMimetype(archiveBytes, orderedCandidates);

    const entries = Object.freeze(
      orderedCandidates.map(({ inventoryEntry }) => inventoryEntry),
    );
    const directoryCount = entries.filter(
      ({ kind }) => kind === "directory",
    ).length;

    return Object.freeze({
      entries,
      entryCount: entries.length,
      fileCount: entries.length - directoryCount,
      directoryCount,
      totalDeclaredUncompressedBytes,
    });
  } catch (error: unknown) {
    throw mapArchiveError(error);
  } finally {
    await reader.close().catch(() => undefined);
  }
}
