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
