/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

export type SchemaVersionWire = number;

/**
 * A privacy-safe machine-readable failure without content, paths, stack traces, or implementation details.
 */
export interface OperationalErrorV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  /**
   * Stable machine-readable error code. Presentation layers map it to safe localized text.
   */
  code:
    | "invalid-input"
    | "unsupported-input"
    | "capability-unavailable"
    | "operation-cancelled"
    | "resource-exhausted"
    | "internal-failure";
  category: "input" | "availability" | "cancellation" | "resource" | "internal";
  /**
   * Whether the owning workflow can offer a safe recovery path or must stop.
   */
  severity: "recoverable" | "fatal";
}
