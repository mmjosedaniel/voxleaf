import Ajv2020 from "ajv/dist/2020.js";

import capabilityReportV1Schema from "../../schemas/capability-report/v1.schema.json" with { type: "json" };
import primitivesV1Schema from "../../schemas/primitives/v1.schema.json" with { type: "json" };
import type {
  CapabilityReportV1Wire,
  CapabilityStatusV1Wire,
} from "../generated/contracts/capability-report-v1.js";
import { createSchemaVersion } from "../primitives/index.js";
import type { SchemaVersion } from "../primitives/index.js";

const CAPABILITY_REPORT_SCHEMA_VERSION_V1 = createSchemaVersion(1);

const validator = new Ajv2020({
  allErrors: true,
  coerceTypes: false,
  removeAdditional: false,
  strict: true,
  useDefaults: false,
});

validator.addSchema(primitivesV1Schema);

const validateCapabilityReportV1Wire =
  validator.compile<CapabilityReportV1Wire>(capabilityReportV1Schema);

export type CapabilityStatusV1 = CapabilityStatusV1Wire;

export type CapabilityReportContractErrorCode =
  "malformed" | "unsupported-version";

export class CapabilityReportContractError extends Error {
  public readonly code: CapabilityReportContractErrorCode;

  public constructor(code: CapabilityReportContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Capability report contract version is unsupported."
        : "Capability report contract is malformed.",
    );
    this.name = "CapabilityReportContractError";
    this.code = code;
  }
}

export interface CapabilitySetV1 {
  readonly localSpeechGeneration: CapabilityStatusV1;
  readonly streamingGeneration: CapabilityStatusV1;
  readonly generationCancellation: CapabilityStatusV1;
  readonly hardwareAcceleration: CapabilityStatusV1;
  readonly cpuFallback: CapabilityStatusV1;
}

export interface CapabilityReportV1 {
  readonly schemaVersion: SchemaVersion;
  readonly capabilities: CapabilitySetV1;
}

function malformedCapabilityReport(): never {
  throw new CapabilityReportContractError("malformed");
}

function readSupportedVersion(input: unknown): SchemaVersion {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return malformedCapabilityReport();
  }

  let version: SchemaVersion;

  try {
    version = createSchemaVersion(
      (input as Record<string, unknown>).schemaVersion,
    );
  } catch {
    return malformedCapabilityReport();
  }

  if (version !== CAPABILITY_REPORT_SCHEMA_VERSION_V1) {
    throw new CapabilityReportContractError("unsupported-version");
  }

  return version;
}

export function decodeCapabilityReportV1(input: unknown): CapabilityReportV1 {
  const schemaVersion = readSupportedVersion(input);

  if (!validateCapabilityReportV1Wire(input)) {
    return malformedCapabilityReport();
  }

  return Object.freeze({
    schemaVersion,
    capabilities: Object.freeze({ ...input.capabilities }),
  });
}
