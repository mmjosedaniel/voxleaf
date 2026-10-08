import path from "node:path";
import process from "node:process";

const FIXED_INVARIANT_CODES = new Set([
  "action-contract",
  "cleanup-compact-visible",
  "cleanup-detail-collapsed",
  "cleanup-gpu-released",
  "cleanup-highlight-cleared",
  "cleanup-leaf-bounded",
  "cleanup-leaf-inactive",
  "cleanup-no-stale-playback",
  "cleanup-progressbar-absent",
  "cleanup-reader-scroll-owner",
  "cleanup-working-set-released",
  "highlight-animation-frames",
  "highlight-available",
  "highlight-dom-preserved",
  "highlight-focus-preserved",
  "highlight-in-reader-viewport",
  "highlight-nonzero-geometry",
  "highlight-present",
  "highlight-range-connected",
  "highlight-range-valid",
  "highlight-readable",
  "highlight-registered",
  "highlight-selection-preserved",
  "highlight-url-preserved",
]);

const EXECUTABLE_ARGUMENT = "--executable=";

export function resolveNativeSmokeExecutable(
  arguments_,
  fallback,
  platform = process.platform,
) {
  const values = arguments_.filter((argument) =>
    argument.startsWith(EXECUTABLE_ARGUMENT),
  );
  if (values.length > 1) {
    throw new TypeError("Native smoke executable was provided more than once.");
  }
  const selected = values[0]?.slice(EXECUTABLE_ARGUMENT.length) ?? fallback;
  const pathImplementation = platform === "win32" ? path.win32 : path.posix;
  if (!selected || !pathImplementation.isAbsolute(selected)) {
    throw new TypeError("Native smoke executable must be an absolute path.");
  }
  return pathImplementation.normalize(selected);
}

export class NativeSmokeInvariantError extends Error {
  constructor(invariantCode) {
    super("Native smoke invariant failed.");
    this.name = "NativeSmokeInvariantError";
    this.code = `native-invariant-${invariantCode}`;
  }
}

export function assertNativeSmokeInvariant(condition, invariantCode) {
  if (!FIXED_INVARIANT_CODES.has(invariantCode)) {
    throw new TypeError("Unknown native smoke invariant.");
  }
  if (!condition) {
    throw new NativeSmokeInvariantError(invariantCode);
  }
}

export function assertNativeSmokeInvariants(invariants) {
  for (const [invariantCode, condition] of invariants) {
    assertNativeSmokeInvariant(condition, invariantCode);
  }
}

export function nativeSmokeInvariantFailureCode(error) {
  return error instanceof NativeSmokeInvariantError ? error.code : undefined;
}
