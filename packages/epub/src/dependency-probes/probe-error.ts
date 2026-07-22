export type DependencyProbeErrorCode =
  "cancelled" | "malformed-xml" | "resource-limit-exceeded" | "unsafe-entry";

export class DependencyProbeError extends Error {
  readonly code: DependencyProbeErrorCode;

  constructor(code: DependencyProbeErrorCode) {
    super(code);
    this.name = "DependencyProbeError";
    this.code = code;
  }
}

export function mapDependencyProbeError(
  error: unknown,
  fallbackCode: DependencyProbeErrorCode,
  signal?: AbortSignal,
): DependencyProbeError {
  if (error instanceof DependencyProbeError) {
    return error;
  }

  return new DependencyProbeError(signal?.aborted ? "cancelled" : fallbackCode);
}
