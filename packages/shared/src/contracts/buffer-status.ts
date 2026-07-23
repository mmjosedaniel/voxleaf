import type { BufferStateV1Wire } from "../generated/contracts/buffer-status-v1.js";
import { validateBufferStatusV1Wire } from "../generated/validators/index.js";
import {
  createCount,
  createGenerationId,
  createMilliseconds,
  createSchemaVersion,
  createSessionId,
} from "../primitives/index.js";
import type {
  Count,
  GenerationId,
  Milliseconds,
  SchemaVersion,
  SessionId,
} from "../primitives/index.js";
import type { GenerationWorkIdentityV1 } from "./reading-session.js";

const BUFFER_STATUS_SCHEMA_VERSION_V1 = createSchemaVersion(1);

export type BufferStateV1 = BufferStateV1Wire;

export type BufferStatusContractErrorCode =
  | "malformed"
  | "unsupported-version"
  | "invalid-threshold-order"
  | "duration-exceeds-maximum"
  | "invalid-state-duration";

export class BufferStatusContractError extends Error {
  public readonly code: BufferStatusContractErrorCode;

  public constructor(code: BufferStatusContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Buffer status contract version is unsupported."
        : "Buffer status contract is invalid.",
    );
    this.name = "BufferStatusContractError";
    this.code = code;
  }
}

export interface BufferThresholdsV1 {
  readonly lowWaterMarkMs: Milliseconds;
  readonly targetBufferMs: Milliseconds;
  readonly maximumBufferMs: Milliseconds;
}

export interface BufferStatusV1 {
  readonly schemaVersion: SchemaVersion;
  readonly sessionId: SessionId;
  readonly generationId: GenerationId;
  readonly contiguousPlayableDurationMs: Milliseconds;
  readonly thresholds: BufferThresholdsV1;
  readonly underrunCount: Count;
  readonly state: BufferStateV1;
}

function malformedBufferStatus(): never {
  throw new BufferStatusContractError("malformed");
}

function readSupportedVersion(input: unknown): SchemaVersion {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return malformedBufferStatus();
  }

  let version: SchemaVersion;

  try {
    version = createSchemaVersion(
      (input as Record<string, unknown>).schemaVersion,
    );
  } catch {
    return malformedBufferStatus();
  }

  if (version !== BUFFER_STATUS_SCHEMA_VERSION_V1) {
    throw new BufferStatusContractError("unsupported-version");
  }

  return version;
}

function assertValidBufferStatus(status: BufferStatusV1): void {
  const { lowWaterMarkMs, targetBufferMs, maximumBufferMs } = status.thresholds;

  if (lowWaterMarkMs > targetBufferMs || targetBufferMs > maximumBufferMs) {
    throw new BufferStatusContractError("invalid-threshold-order");
  }

  if (status.contiguousPlayableDurationMs > maximumBufferMs) {
    throw new BufferStatusContractError("duration-exceeds-maximum");
  }

  if (
    (status.state === "empty" && status.contiguousPlayableDurationMs !== 0) ||
    (status.state === "buffering" &&
      status.contiguousPlayableDurationMs >= targetBufferMs) ||
    (status.state === "ready" &&
      status.contiguousPlayableDurationMs < targetBufferMs) ||
    (status.state === "playing" && status.contiguousPlayableDurationMs === 0)
  ) {
    throw new BufferStatusContractError("invalid-state-duration");
  }
}

export function getBufferStatusWorkIdentity(
  status: BufferStatusV1,
): GenerationWorkIdentityV1 {
  return Object.freeze({
    sessionId: status.sessionId,
    generationId: status.generationId,
  });
}

export function decodeBufferStatusV1(input: unknown): BufferStatusV1 {
  const schemaVersion = readSupportedVersion(input);

  if (!validateBufferStatusV1Wire(input)) {
    return malformedBufferStatus();
  }

  const status: BufferStatusV1 = Object.freeze({
    schemaVersion,
    sessionId: createSessionId(input.sessionId),
    generationId: createGenerationId(input.generationId),
    contiguousPlayableDurationMs: createMilliseconds(
      input.contiguousPlayableDurationMs,
    ),
    thresholds: Object.freeze({
      lowWaterMarkMs: createMilliseconds(input.thresholds.lowWaterMarkMs),
      targetBufferMs: createMilliseconds(input.thresholds.targetBufferMs),
      maximumBufferMs: createMilliseconds(input.thresholds.maximumBufferMs),
    }),
    underrunCount: createCount(input.underrunCount),
    state: input.state,
  });

  assertValidBufferStatus(status);
  return status;
}
