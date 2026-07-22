import {
  Uint8ArrayReader,
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
  ArchiveFilePath,
} from "../paths/archive-path.js";
import { EpubPathError } from "../paths/path-error.js";
import {
  createEpubProcessingBudget,
  EpubProcessingBudget,
} from "../security/processing-budget.js";
import type {
  ArchiveEntryReadBudget,
  EpubProcessingBudgetOptions,
} from "../security/processing-budget.js";
import { EpubArchiveError } from "./archive-error.js";
import type { EpubArchiveErrorCode } from "./archive-error.js";

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

export interface ArchiveEntryReadOptions {
  readonly maximumBytes?: number;
}

interface CandidateEntry {
  readonly inventoryEntry: ArchiveInventoryEntry;
  readonly source: Entry;
}

interface StructurallyCheckableEntry {
  getData(
    writer: WritableStream<Uint8Array>,
    options: ReturnType<typeof createStructureCheckOptions>,
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
  budget: EpubProcessingBudget,
): CandidateEntry {
  assertSafeNonnegativeInteger(entry.offset);
  assertSafeNonnegativeInteger(entry.compressedSize);
  assertSafeNonnegativeInteger(entry.uncompressedSize);
  assertSafeNonnegativeInteger(entry.diskNumberStart);

  if (entry.diskNumberStart !== 0 || entry.offset >= archiveByteLength) {
    return fail("invalid-container");
  }

  if (entry.encrypted) {
    return fail("unsupported-protection");
  }

  const kind = readEntryKind(entry);
  const path = decodeArchiveEntryPath(entry.rawFilename, kind, budget.policy);
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

function createRuntimeOptions(budget: EpubProcessingBudget) {
  return {
    ...ZIP_READER_OPTIONS,
    ...(budget.signal === undefined ? {} : { signal: budget.signal }),
    onstart: () => budget.checkpoint(),
    onprogress: () => budget.checkpoint(),
    onend: () => budget.checkpoint(),
  };
}

function createStructureCheckOptions(budget: EpubProcessingBudget) {
  return {
    ...createRuntimeOptions(budget),
    checkOverlappingEntryOnly: true,
    passThrough: true,
  };
}

async function validateLocalStructure(
  entries: readonly CandidateEntry[],
  budget: EpubProcessingBudget,
): Promise<void> {
  for (const { source } of entries) {
    budget.checkpoint();
    const checkableEntry = source as unknown as StructurallyCheckableEntry;

    if (typeof checkableEntry.getData !== "function") {
      return fail("invalid-container");
    }

    await checkableEntry.getData(
      new WritableStream<Uint8Array>(),
      createStructureCheckOptions(budget),
    );
    budget.checkpoint();
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

class BoundedArchiveEntryWriter {
  public readonly writable: WritableStream<Uint8Array>;

  readonly #expectedSize: number;
  readonly #budget: ArchiveEntryReadBudget;
  #data: Uint8Array | undefined;
  #offset = 0;
  #complete = false;
  #failure: EpubArchiveError | undefined;

  public constructor(expectedSize: number, budget: ArchiveEntryReadBudget) {
    this.#expectedSize = expectedSize;
    this.#budget = budget;
    this.#data = new Uint8Array(expectedSize);
    this.writable = new WritableStream<Uint8Array>({
      start: () => this.captureFailure(() => this.#budget.checkpoint()),
      write: (chunk) => this.captureFailure(() => this.write(chunk)),
      close: () => this.captureFailure(() => this.complete()),
      abort: () => this.discard(),
    });
  }

  public get failure(): EpubArchiveError | undefined {
    return this.#failure;
  }

  public takeData(): Uint8Array {
    if (!this.#complete || this.#data === undefined) {
      return fail("internal-failure");
    }

    const data = this.#data;
    this.#data = undefined;
    return data;
  }

  public discard(): void {
    this.#data = undefined;
    this.#offset = 0;
    this.#complete = false;
  }

  private write(chunk: Uint8Array): void {
    if (!(chunk instanceof Uint8Array) || this.#data === undefined) {
      return fail("invalid-container");
    }

    this.#budget.observe(chunk.byteLength);
    if (chunk.byteLength > this.#expectedSize - this.#offset) {
      this.discard();
      return fail("invalid-container");
    }

    this.#data.set(chunk, this.#offset);
    this.#offset += chunk.byteLength;
  }

  private complete(): void {
    this.#budget.checkpoint();
    if (this.#data === undefined || this.#offset !== this.#expectedSize) {
      this.discard();
      return fail("invalid-container");
    }

    this.#complete = true;
  }

  private captureFailure(action: () => void): void {
    try {
      action();
    } catch (error: unknown) {
      if (error instanceof EpubArchiveError) {
        this.#failure = error;
      }

      throw error;
    }
  }
}

async function readCandidateData(
  candidate: CandidateEntry,
  budget: EpubProcessingBudget,
  maximumBytes = budget.policy.maxEntryUncompressedBytes,
): Promise<Uint8Array> {
  const { inventoryEntry, source } = candidate;
  if (source.directory || inventoryEntry.kind !== "file") {
    return fail("invalid-container");
  }

  const readBudget = budget.beginArchiveEntryRead(
    inventoryEntry.compressedSize,
    inventoryEntry.uncompressedSize,
    maximumBytes,
  );
  const writer = new BoundedArchiveEntryWriter(
    inventoryEntry.uncompressedSize,
    readBudget,
  );

  try {
    await source.getData(writer, createRuntimeOptions(budget));
    readBudget.complete();
    return writer.takeData();
  } catch (error: unknown) {
    const writerFailure = writer.failure;
    writer.discard();
    throw writerFailure ?? error;
  }
}

async function validateMimetype(
  archiveBytes: Uint8Array,
  orderedEntries: readonly CandidateEntry[],
  budget: EpubProcessingBudget,
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
    inventoryEntry.zip64 ||
    source.directory
  ) {
    return fail("invalid-container");
  }

  assertMimetypeLocalHeader(archiveBytes, inventoryEntry);
  const data = await readCandidateData(firstEntry, budget);

  if (
    data.byteLength !== MIMETYPE_BYTES.byteLength ||
    data.some((value, index) => value !== MIMETYPE_BYTES[index])
  ) {
    return fail("invalid-container");
  }
}

function mapArchiveError(
  error: unknown,
  budget?: EpubProcessingBudget,
): EpubArchiveError {
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

  if (budget !== undefined) {
    try {
      budget.checkpoint();
    } catch (checkpointError: unknown) {
      if (checkpointError instanceof EpubArchiveError) {
        return checkpointError;
      }
    }
  }

  return new EpubArchiveError("invalid-container");
}

export interface OpenedEpubArchive {
  readonly inventory: ArchiveInventory;
  readonly budget: EpubProcessingBudget;
  readEntry(
    path: ArchiveFilePath,
    options?: ArchiveEntryReadOptions,
  ): Promise<Uint8Array>;
  close(): Promise<void>;
}

class OpenedEpubArchiveHandle implements OpenedEpubArchive {
  public readonly inventory: ArchiveInventory;
  public readonly budget: EpubProcessingBudget;

  readonly #reader: ZipReader<Uint8Array>;
  readonly #entriesByPath: ReadonlyMap<string, CandidateEntry>;
  #closed = false;
  #readInProgress = false;

  public constructor(
    reader: ZipReader<Uint8Array>,
    inventory: ArchiveInventory,
    entries: readonly CandidateEntry[],
    budget: EpubProcessingBudget,
  ) {
    this.#reader = reader;
    this.inventory = inventory;
    this.budget = budget;
    this.#entriesByPath = new Map(
      entries.map((entry) => [String(entry.inventoryEntry.path), entry]),
    );
  }

  public async readEntry(
    path: ArchiveFilePath,
    options: ArchiveEntryReadOptions = {},
  ): Promise<Uint8Array> {
    if (this.#closed || this.#readInProgress) {
      return fail("internal-failure");
    }

    this.#readInProgress = true;
    try {
      this.budget.checkpoint();
      const candidate = this.#entriesByPath.get(String(path));
      if (candidate === undefined || candidate.inventoryEntry.kind !== "file") {
        return fail("invalid-container");
      }

      return await readCandidateData(
        candidate,
        this.budget,
        options.maximumBytes,
      );
    } catch (error: unknown) {
      throw mapArchiveError(error, this.budget);
    } finally {
      this.#readInProgress = false;
    }
  }

  public async close(): Promise<void> {
    if (this.#closed) {
      return;
    }

    this.#closed = true;
    await this.#reader.close().catch(() => undefined);
  }
}

export async function openEpubArchive(
  archiveBytes: Uint8Array,
  options: EpubProcessingBudgetOptions = {},
): Promise<OpenedEpubArchive> {
  const budget = createEpubProcessingBudget(options);
  budget.registerArchiveInput(archiveBytes.byteLength);
  const reader = new ZipReader(
    new Uint8ArrayReader(archiveBytes),
    ZIP_READER_OPTIONS,
  );

  try {
    const candidates: CandidateEntry[] = [];

    for await (const entry of reader.getEntriesGenerator({
      onprogress: () => budget.checkpoint(),
    })) {
      budget.checkpoint();
      const candidate = createCandidateEntry(
        entry,
        archiveBytes.byteLength,
        budget,
      );
      budget.registerArchiveEntryDeclaration(
        candidate.inventoryEntry.compressedSize,
        candidate.inventoryEntry.uncompressedSize,
      );
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

    await validateLocalStructure(orderedCandidates, budget);
    await validateMimetype(archiveBytes, orderedCandidates, budget);
    budget.checkpoint();

    const entries = Object.freeze(
      orderedCandidates.map(({ inventoryEntry }) => inventoryEntry),
    );
    const directoryCount = entries.filter(
      ({ kind }) => kind === "directory",
    ).length;
    const inventory = Object.freeze({
      entries,
      entryCount: entries.length,
      fileCount: entries.length - directoryCount,
      directoryCount,
      totalDeclaredUncompressedBytes:
        budget.getSnapshot().declaredUncompressedBytes,
    });

    return new OpenedEpubArchiveHandle(
      reader,
      inventory,
      orderedCandidates,
      budget,
    );
  } catch (error: unknown) {
    await reader.close().catch(() => undefined);
    throw mapArchiveError(error, budget);
  }
}

export async function inventoryEpubArchive(
  archiveBytes: Uint8Array,
  options: EpubProcessingBudgetOptions = {},
): Promise<ArchiveInventory> {
  const archive = await openEpubArchive(archiveBytes, options);
  try {
    return archive.inventory;
  } finally {
    await archive.close();
  }
}
