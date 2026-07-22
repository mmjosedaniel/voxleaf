import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DependencyProbeError } from "./probe-error.js";
import { probeZipDependency } from "./zip-js-probe.js";

const ZIP_WRITER_OPTIONS = Object.freeze({
  transferStreams: false,
  useCompressionStream: false,
  useWebWorkers: false,
});

const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("@zip.js/zip.js dependency probe", () => {
  it("reads compressed in-memory bytes without workers or network access", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    const archive = await createArchive([
      ["mimetype", "application/epub+zip"],
      ["EPUB/chapter.xhtml", "<p>synthetic probe</p>"],
    ]);

    await expect(probeZipDependency(archive)).resolves.toEqual({
      entryCount: 2,
      extractedByteCount: 42,
      fileCount: 2,
    });
    expect(worker).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("enables signature checking and hides dependency errors", async () => {
    const archive = await createArchive([["private-canary.txt", "secret"]], 0);
    const corrupted = corruptFirstEntryData(archive);

    const error = await captureProbeError(corrupted);

    expect(error).toMatchObject({ code: "unsafe-entry" });
    expect(error.message).toBe("unsafe-entry");
    expect(error.message).not.toContain("private-canary");
    expect(error.cause).toBeUndefined();
  });

  it("enables overlapping-entry detection", async () => {
    const archive = await createArchive([
      ["first.txt", "first"],
      ["second.txt", "second"],
    ]);
    const overlapping = overlapSecondEntryWithFirst(archive);

    await expect(captureProbeError(overlapping)).resolves.toMatchObject({
      code: "unsafe-entry",
    });
  });

  it("enables strict archive ambiguity and appended-data checks", async () => {
    const archive = await createArchive([["entry.txt", "content"]]);
    const archiveWithAppendedData = new Uint8Array(archive.byteLength + 1);
    archiveWithAppendedData.set(archive);

    await expect(
      captureProbeError(archiveWithAppendedData),
    ).resolves.toMatchObject({
      code: "unsafe-entry",
    });
  });

  it("maps a caller abort to the fixed cancellation code", async () => {
    const controller = new AbortController();
    controller.abort();

    const error = await captureProbeError(new Uint8Array(), controller.signal);

    expect(error).toMatchObject({ code: "cancelled" });
  });
});

async function createArchive(
  entries: ReadonlyArray<readonly [name: string, text: string]>,
  level = 6,
): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const encoder = new TextEncoder();

  for (const [name, text] of entries) {
    await writer.add(name, new Uint8ArrayReader(encoder.encode(text)), {
      ...ZIP_WRITER_OPTIONS,
      level,
    });
  }

  return writer.close();
}

function corruptFirstEntryData(archive: Uint8Array): Uint8Array {
  const corrupted = archive.slice();
  const view = new DataView(
    corrupted.buffer,
    corrupted.byteOffset,
    corrupted.byteLength,
  );
  const headerOffset = findSignature(view, LOCAL_FILE_HEADER_SIGNATURE, 0);
  const filenameLength = view.getUint16(headerOffset + 26, true);
  const extraFieldLength = view.getUint16(headerOffset + 28, true);
  const dataOffset = headerOffset + 30 + filenameLength + extraFieldLength;
  corrupted[dataOffset] = (corrupted[dataOffset] ?? 0) ^ 0xff;
  return corrupted;
}

function overlapSecondEntryWithFirst(archive: Uint8Array): Uint8Array {
  const overlapping = archive.slice();
  const view = new DataView(
    overlapping.buffer,
    overlapping.byteOffset,
    overlapping.byteLength,
  );
  const firstDirectory = findSignature(view, CENTRAL_DIRECTORY_SIGNATURE, 0);
  const secondDirectory = findSignature(
    view,
    CENTRAL_DIRECTORY_SIGNATURE,
    firstDirectory + 4,
  );
  const firstLocalHeaderOffset = view.getUint32(firstDirectory + 42, true);
  view.setUint32(secondDirectory + 42, firstLocalHeaderOffset, true);
  return overlapping;
}

function findSignature(
  view: DataView,
  signature: number,
  startOffset: number,
): number {
  for (let offset = startOffset; offset <= view.byteLength - 4; offset += 1) {
    if (view.getUint32(offset, true) === signature) {
      return offset;
    }
  }

  throw new Error("synthetic ZIP signature not found");
}

async function captureProbeError(
  archive: Uint8Array,
  signal?: AbortSignal,
): Promise<DependencyProbeError> {
  try {
    await probeZipDependency(archive, signal);
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(DependencyProbeError);
    return error as DependencyProbeError;
  }

  throw new Error("expected dependency probe to fail");
}
