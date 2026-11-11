import type { ReadingLocatorV1 } from "@voxleaf/shared";
export function buildReaderImageLifecycleFixture(
  imageBytes?: Uint8Array,
): Promise<Uint8Array>;
export function readerImageLifecycleCheckpoint(
  bytes: Uint8Array,
): Promise<ReadingLocatorV1>;
