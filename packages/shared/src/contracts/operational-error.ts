import type { OperationalErrorV1Wire } from "../generated/contracts/operational-error-v1.js";
import { validateOperationalErrorV1Wire } from "../generated/validators/index.js";
import { createSchemaVersion } from "../primitives/index.js";
import type { SchemaVersion } from "../primitives/index.js";

const OPERATIONAL_ERROR_SCHEMA_VERSION_V1 = createSchemaVersion(1);

export type OperationalErrorCodeV1 = OperationalErrorV1Wire["code"];
export type OperationalErrorCategoryV1 = OperationalErrorV1Wire["category"];
export type OperationalErrorSeverityV1 = OperationalErrorV1Wire["severity"];

export type OperationalErrorContractErrorCode =
  "malformed" | "unsupported-version";

export class OperationalErrorContractError extends Error {
  public readonly code: OperationalErrorContractErrorCode;

  public constructor(code: OperationalErrorContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Operational error contract version is unsupported."
        : "Operational error contract is malformed.",
    );
    this.name = "OperationalErrorContractError";
    this.code = code;
  }
}

export interface OperationalErrorV1 {
  readonly schemaVersion: SchemaVersion;
  readonly code: OperationalErrorCodeV1;
  readonly category: OperationalErrorCategoryV1;
  readonly severity: OperationalErrorSeverityV1;
}

const ERROR_SEMANTICS = Object.freeze({
  "invalid-input": Object.freeze({
    category: "input",
    severity: "recoverable",
  }),
  "unsupported-input": Object.freeze({
    category: "input",
    severity: "recoverable",
  }),
  "capability-unavailable": Object.freeze({
    category: "availability",
    severity: "recoverable",
  }),
  "operation-cancelled": Object.freeze({
    category: "cancellation",
    severity: "recoverable",
  }),
  "resource-exhausted": Object.freeze({
    category: "resource",
    severity: "recoverable",
  }),
  "internal-failure": Object.freeze({
    category: "internal",
    severity: "fatal",
  }),
} satisfies Record<
  OperationalErrorCodeV1,
  {
    readonly category: OperationalErrorCategoryV1;
    readonly severity: OperationalErrorSeverityV1;
  }
>);

function malformedOperationalError(): never {
  throw new OperationalErrorContractError("malformed");
}

function readSupportedVersion(input: unknown): SchemaVersion {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return malformedOperationalError();
  }

  let version: SchemaVersion;

  try {
    version = createSchemaVersion(
      (input as Record<string, unknown>).schemaVersion,
    );
  } catch {
    return malformedOperationalError();
  }

  if (version !== OPERATIONAL_ERROR_SCHEMA_VERSION_V1) {
    throw new OperationalErrorContractError("unsupported-version");
  }

  return version;
}

export function decodeOperationalErrorV1(input: unknown): OperationalErrorV1 {
  readSupportedVersion(input);

  if (!validateOperationalErrorV1Wire(input)) {
    return malformedOperationalError();
  }

  const semantics = ERROR_SEMANTICS[input.code];
  if (
    input.category !== semantics.category ||
    input.severity !== semantics.severity
  ) {
    return malformedOperationalError();
  }

  return createOperationalErrorV1(input.code);
}

export function createOperationalErrorV1(
  code: OperationalErrorCodeV1,
): OperationalErrorV1 {
  const semantics = ERROR_SEMANTICS[code];

  return Object.freeze({
    schemaVersion: OPERATIONAL_ERROR_SCHEMA_VERSION_V1,
    code,
    category: semantics.category,
    severity: semantics.severity,
  });
}
