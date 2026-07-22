import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { parseArchiveEntryPath } from "../paths/archive-path.js";
import { EpubArchiveError } from "./archive-error.js";
import { openEpubArchive } from "./archive-inventory.js";

const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;

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

describe("bounded EPUB archive reads", () => {
  it("reads one entry in memory with exact aggregate accounting", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);
    const archiveBytes = await createArchive("synthetic");
    const archive = await openEpubArchive(archiveBytes);

    try {
      const contentEntry = archive.inventory.entries[1]!;
      const data = await archive.readEntry(
        parseArchiveEntryPath("EPUB/chapter.xhtml", "file"),
      );

      expect(new TextDecoder().decode(data)).toBe("synthetic");
      expect(archive.budget.getSnapshot()).toEqual({
        archiveEntryCount: 2,
        declaredCompressedBytes: 20 + contentEntry.compressedSize,
        declaredUncompressedBytes: 29,
        observedUncompressedBytes: 29,
        compressedReadBytes: 20 + contentEntry.compressedSize,
      });
      expect(worker).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await archive.close();
    }
  });

  it("allows an exact aggregate observed maximum and rejects the next read", async () => {
    const archiveBytes = await createArchive("123456", 0);
    const archive = await openEpubArchive(archiveBytes, {
      policy: { maxTotalUncompressedBytes: 32 },
    });
    const path = parseArchiveEntryPath("EPUB/chapter.xhtml", "file");

    try {
      await expect(archive.readEntry(path)).resolves.toHaveLength(6);
      await expect(archive.readEntry(path)).resolves.toHaveLength(6);
      expect(archive.budget.getSnapshot().observedUncompressedBytes).toBe(32);

      await expectArchiveReadError(
        () => archive.readEntry(path),
        "resource-limit-exceeded",
      );
    } finally {
      await archive.close();
    }
  });

  it("rejects overlapping reads to keep entry output memory bounded", async () => {
    const archiveBytes = await createArchive("chapter");
    const archive = await openEpubArchive(archiveBytes);
    const path = parseArchiveEntryPath("EPUB/chapter.xhtml", "file");

    try {
      const firstRead = archive.readEntry(path);
      await expectArchiveReadError(
        () => archive.readEntry(path),
        "internal-failure",
      );
      await expect(firstRead).resolves.toHaveLength(7);
    } finally {
      await archive.close();
    }
  });

  it("rejects observed bytes above a falsified declaration and returns no partial data", async () => {
    const archiveBytes = await createArchive("x".repeat(21), 0);
    const falsified = setEntryUncompressedSize(
      archiveBytes,
      "EPUB/chapter.xhtml",
      20,
    );
    const archive = await openEpubArchive(falsified, {
      policy: { maxEntryUncompressedBytes: 20 },
    });
    let returnedData: Uint8Array | undefined;

    try {
      const error = await captureArchiveReadError(async () => {
        returnedData = await archive.readEntry(
          parseArchiveEntryPath("EPUB/chapter.xhtml", "file"),
        );
      });

      expect(error).toMatchObject({ code: "resource-limit-exceeded" });
      expect(returnedData).toBeUndefined();
      expect(archive.budget.getSnapshot().observedUncompressedBytes).toBe(20);
    } finally {
      await archive.close();
    }
  });

  it("enforces the compression ratio during real decompression", async () => {
    const archiveBytes = await createArchive("a".repeat(1_024));
    const declaredSize = getEntryCompressedSize(
      archiveBytes,
      "EPUB/chapter.xhtml",
    );
    const falsified = setEntryUncompressedSize(
      archiveBytes,
      "EPUB/chapter.xhtml",
      declaredSize,
    );
    const archive = await openEpubArchive(falsified, {
      policy: {
        compressionRatioGraceBytes: 20,
        maxCompressionRatio: 1,
      },
    });

    try {
      await expectArchiveReadError(
        () =>
          archive.readEntry(
            parseArchiveEntryPath("EPUB/chapter.xhtml", "file"),
          ),
        "resource-limit-exceeded",
      );
    } finally {
      await archive.close();
    }
  });

  it("checks CRC during the bounded content read and hides dependency details", async () => {
    const archiveBytes = await createArchive("private-canary", 0);
    const corrupted = corruptEntryData(archiveBytes, "EPUB/chapter.xhtml");
    const archive = await openEpubArchive(corrupted);

    try {
      const error = await captureArchiveReadError(() =>
        archive.readEntry(parseArchiveEntryPath("EPUB/chapter.xhtml", "file")),
      );

      expect(error).toMatchObject({
        code: "invalid-container",
        message: "invalid-container",
      });
      expect(error.message).not.toContain("private-canary");
      expect(error.cause).toBeUndefined();
    } finally {
      await archive.close();
    }
  });

  it("cancels deterministically after a caller abort without returning bytes", async () => {
    const controller = new AbortController();
    const archiveBytes = await createArchive("private-canary");
    const archive = await openEpubArchive(archiveBytes, {
      signal: controller.signal,
    });
    controller.abort("private-canary");

    try {
      const error = await captureArchiveReadError(() =>
        archive.readEntry(parseArchiveEntryPath("EPUB/chapter.xhtml", "file")),
      );

      expect(error).toMatchObject({ code: "cancelled", message: "cancelled" });
      expect(error.message).not.toContain("private-canary");
      expect(archive.budget.getSnapshot().observedUncompressedBytes).toBe(20);
    } finally {
      await archive.close();
    }
  });

  it("allows work at the exact deadline and cancels at deadline plus one", async () => {
    let nowMs = 100;
    const archiveBytes = await createArchive("chapter", 0);
    const archive = await openEpubArchive(archiveBytes, {
      policy: { maxProcessingTimeMs: 10 },
      clock: { now: () => nowMs },
    });
    const path = parseArchiveEntryPath("EPUB/chapter.xhtml", "file");

    try {
      nowMs = 110;
      await expect(archive.readEntry(path)).resolves.toHaveLength(7);

      nowMs = 111;
      await expectArchiveReadError(() => archive.readEntry(path), "cancelled");
    } finally {
      await archive.close();
    }
  });

  it("applies stricter path limits during inventory", async () => {
    const archiveBytes = await createArchive("chapter");

    await expectArchiveReadError(
      () =>
        openEpubArchive(archiveBytes, {
          policy: { maxArchivePathBytes: 10 },
        }),
      "resource-limit-exceeded",
    );
  });
});

async function createArchive(text: string, level = 6): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const encoder = new TextEncoder();
  await writer.add(
    "mimetype",
    new Uint8ArrayReader(encoder.encode("application/epub+zip")),
    { ...ZIP_WRITER_OPTIONS, level: 0 },
  );
  await writer.add(
    "EPUB/chapter.xhtml",
    new Uint8ArrayReader(encoder.encode(text)),
    { ...ZIP_WRITER_OPTIONS, level },
  );
  return writer.close();
}

function setEntryUncompressedSize(
  archive: Uint8Array,
  filename: string,
  size: number,
): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const centralOffset = findCentralDirectory(view, filename);
  const localOffset = view.getUint32(centralOffset + 42, true);
  view.setUint32(centralOffset + 24, size, true);
  view.setUint32(localOffset + 22, size, true);
  return result;
}

function getEntryCompressedSize(archive: Uint8Array, filename: string): number {
  const view = dataView(archive);
  return view.getUint32(findCentralDirectory(view, filename) + 20, true);
}

function corruptEntryData(archive: Uint8Array, filename: string): Uint8Array {
  const result = archive.slice();
  const view = dataView(result);
  const centralOffset = findCentralDirectory(view, filename);
  const localOffset = view.getUint32(centralOffset + 42, true);
  const filenameLength = view.getUint16(localOffset + 26, true);
  const extraFieldLength = view.getUint16(localOffset + 28, true);
  const dataOffset = localOffset + 30 + filenameLength + extraFieldLength;
  result[dataOffset] = (result[dataOffset] ?? 0) ^ 0xff;
  return result;
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
    if (readAscii(view, offset + 46, filenameLength) === filename) {
      return offset;
    }

    offset +=
      46 +
      filenameLength +
      view.getUint16(offset + 30, true) +
      view.getUint16(offset + 32, true);
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

function dataView(value: Uint8Array): DataView {
  return new DataView(value.buffer, value.byteOffset, value.byteLength);
}

async function expectArchiveReadError(
  action: () => Promise<unknown>,
  code: EpubArchiveError["code"],
): Promise<void> {
  const error = await captureArchiveReadError(action);
  expect(error).toMatchObject({ code, message: code });
  expect(error.cause).toBeUndefined();
}

async function captureArchiveReadError(
  action: () => Promise<unknown>,
): Promise<EpubArchiveError> {
  try {
    await action();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    return error as EpubArchiveError;
  }

  throw new Error("expected archive read to fail");
}
