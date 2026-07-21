import Ajv2020 from "ajv/dist/2020.js";

import bookV1Schema from "../../schemas/book/v1.schema.json" with { type: "json" };
import locatorRangeV1Schema from "../../schemas/locator-range/v1.schema.json" with { type: "json" };
import locatorV1Schema from "../../schemas/locator/v1.schema.json" with { type: "json" };
import narrationSegmentV1Schema from "../../schemas/narration-segment/v1.schema.json" with { type: "json" };
import primitivesV1Schema from "../../schemas/primitives/v1.schema.json" with { type: "json" };
import type { NarrationSegmentV1Wire } from "../generated/contracts/narration-segment-v1.js";
import {
  createBookId,
  createGenerationId,
  createIndex,
  createSchemaVersion,
  createSegmentId,
  createSessionId,
} from "../primitives/index.js";
import type {
  GenerationId,
  Index,
  SchemaVersion,
  SegmentId,
  SessionId,
} from "../primitives/index.js";
import type { BookIdentityV1 } from "./book.js";
import { LocatorContractError, decodeLocatorRangeV1 } from "./locator.js";
import type { LocatorRangeV1 } from "./locator.js";
import type { GenerationWorkIdentityV1 } from "./reading-session.js";

const NARRATION_SEGMENT_SCHEMA_VERSION_V1 = createSchemaVersion(1);

const validator = new Ajv2020({
  allErrors: true,
  coerceTypes: false,
  removeAdditional: false,
  strict: true,
  useDefaults: false,
});

validator.addSchema(primitivesV1Schema);
validator.addSchema(bookV1Schema);
validator.addSchema(locatorV1Schema);
validator.addSchema(locatorRangeV1Schema);

const validateNarrationSegmentV1Wire =
  validator.compile<NarrationSegmentV1Wire>(narrationSegmentV1Schema);

declare const sensitiveNarrationTextBrand: unique symbol;

export type SensitiveNarrationTextV1 = string & {
  readonly [sensitiveNarrationTextBrand]: "SensitiveNarrationTextV1";
};

export type NarrationSegmentContractErrorCode =
  "malformed" | "unsupported-version";

export class NarrationSegmentContractError extends Error {
  public readonly code: NarrationSegmentContractErrorCode;

  public constructor(code: NarrationSegmentContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Narration segment contract version is unsupported."
        : "Narration segment contract is malformed.",
    );
    this.name = "NarrationSegmentContractError";
    this.code = code;
  }
}

export interface NarrationSegmentV1 {
  readonly schemaVersion: SchemaVersion;
  readonly segmentId: SegmentId;
  readonly bookIdentity: BookIdentityV1;
  readonly sessionId: SessionId;
  readonly generationId: GenerationId;
  readonly sequence: Index;
  readonly sourceRange: LocatorRangeV1;
  /** Sensitive narration text. Do not place it in errors, metrics, persistence, or debug snapshots. */
  readonly text: SensitiveNarrationTextV1;
}

function malformedNarrationSegment(): never {
  throw new NarrationSegmentContractError("malformed");
}

function readRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return malformedNarrationSegment();
  }

  return value as Record<string, unknown>;
}

function readSupportedVersion(value: unknown): SchemaVersion {
  let version: SchemaVersion;

  try {
    version = createSchemaVersion(value);
  } catch {
    return malformedNarrationSegment();
  }

  if (version !== NARRATION_SEGMENT_SCHEMA_VERSION_V1) {
    throw new NarrationSegmentContractError("unsupported-version");
  }

  return version;
}

function bookIdentitiesMatch(
  left: BookIdentityV1,
  right: BookIdentityV1,
): boolean {
  return (
    left.scheme === right.scheme &&
    left.schemeVersion === right.schemeVersion &&
    left.value === right.value
  );
}

function decodeSourceRange(input: unknown): LocatorRangeV1 {
  try {
    return decodeLocatorRangeV1(input);
  } catch (error) {
    if (error instanceof LocatorContractError) {
      throw new NarrationSegmentContractError(error.code);
    }

    throw error;
  }
}

export function getNarrationSegmentWorkIdentity(
  segment: NarrationSegmentV1,
): GenerationWorkIdentityV1 {
  return Object.freeze({
    sessionId: segment.sessionId,
    generationId: segment.generationId,
  });
}

export function decodeNarrationSegmentV1(input: unknown): NarrationSegmentV1 {
  const segment = readRecord(input);
  const schemaVersion = readSupportedVersion(segment.schemaVersion);
  const sourceRange = decodeSourceRange(segment.sourceRange);

  if (!validateNarrationSegmentV1Wire(input)) {
    return malformedNarrationSegment();
  }

  const bookIdentity = Object.freeze({
    scheme: input.bookIdentity.scheme,
    schemeVersion: createSchemaVersion(input.bookIdentity.schemeVersion),
    value: createBookId(input.bookIdentity.value),
  });

  if (!bookIdentitiesMatch(bookIdentity, sourceRange.start.bookIdentity)) {
    return malformedNarrationSegment();
  }

  return Object.freeze({
    schemaVersion,
    segmentId: createSegmentId(input.segmentId),
    bookIdentity,
    sessionId: createSessionId(input.sessionId),
    generationId: createGenerationId(input.generationId),
    sequence: createIndex(input.sequence),
    sourceRange,
    text: input.text as SensitiveNarrationTextV1,
  });
}
