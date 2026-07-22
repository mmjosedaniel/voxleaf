import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
} from "@zip.js/zip.js/lib/zip-core-native.js";

import {
  DependencyProbeError,
  mapDependencyProbeError,
} from "./probe-error.js";

const MAX_PROBE_ENTRY_COUNT = 8;
const MAX_PROBE_ENTRY_BYTES = 1024 * 1024;
const MAX_PROBE_TOTAL_BYTES = 2 * 1024 * 1024;

const ZIP_RUNTIME_OPTIONS = Object.freeze({
  checkOverlappingEntry: true,
  checkSignature: true,
  strictness: "strict" as const,
  transferStreams: false,
  useCompressionStream: false,
  useWebWorkers: false,
});

export interface ZipDependencyProbeSummary {
  readonly entryCount: number;
  readonly extractedByteCount: number;
  readonly fileCount: number;
}

/**
 * Exercises the selected ZIP dependency through its bytes-only API.
 *
 * The intentionally small limits make this executable dependency probe safe;
 * ADR-0007's production limits and complete ZIP policy belong to Tasks 2.2-2.3.
 */
export async function probeZipDependency(
  archiveBytes: Uint8Array,
  signal?: AbortSignal,
): Promise<ZipDependencyProbeSummary> {
  if (signal?.aborted) {
    throw new DependencyProbeError("cancelled");
  }

  const reader = new ZipReader(
    new Uint8ArrayReader(archiveBytes),
    ZIP_RUNTIME_OPTIONS,
  );
  let entryCount = 0;
  let extractedByteCount = 0;
  let fileCount = 0;

  try {
    for await (const entry of reader.getEntriesGenerator()) {
      if (signal?.aborted) {
        throw new DependencyProbeError("cancelled");
      }

      entryCount += 1;
      if (entryCount > MAX_PROBE_ENTRY_COUNT) {
        throw new DependencyProbeError("resource-limit-exceeded");
      }

      if (entry.directory) {
        continue;
      }

      if (entry.encrypted) {
        throw new DependencyProbeError("unsafe-entry");
      }

      if (
        !Number.isSafeInteger(entry.uncompressedSize) ||
        entry.uncompressedSize < 0 ||
        entry.uncompressedSize > MAX_PROBE_ENTRY_BYTES ||
        extractedByteCount > MAX_PROBE_TOTAL_BYTES - entry.uncompressedSize
      ) {
        throw new DependencyProbeError("resource-limit-exceeded");
      }

      const extracted = await entry.getData(
        new Uint8ArrayWriter(),
        ZIP_RUNTIME_OPTIONS,
      );
      extractedByteCount += extracted.byteLength;
      fileCount += 1;
    }

    return Object.freeze({ entryCount, extractedByteCount, fileCount });
  } catch (error: unknown) {
    throw mapDependencyProbeError(error, "unsafe-entry", signal);
  } finally {
    await reader.close().catch(() => undefined);
  }
}
