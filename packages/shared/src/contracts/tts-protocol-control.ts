import type {
  ProtocolReason,
  ServiceState,
  TtsProtocolControlV1Wire,
} from "../generated/contracts/tts-protocol-control-v1.js";
import { validateTtsProtocolControlV1Wire } from "../generated/validators/index.js";
import { AudioFrameContractError, decodeAudioFrameV1 } from "./audio-frame.js";
import {
  NarrationSegmentContractError,
  decodeNarrationSegmentV1,
} from "./narration-segment.js";
import {
  OperationalErrorContractError,
  decodeOperationalErrorV1,
} from "./operational-error.js";

const SCHEMA_VERSION = 1;
const PROTOCOL_VERSION = 1;
const MAX_NARRATION_UTF8_BYTES = 2_048;
const BYTES_PER_FLOAT32_SAMPLE = 4;

export type TtsProtocolControlContractErrorCode =
  "malformed" | "unsupported-version";

export class TtsProtocolControlContractError extends Error {
  public readonly code: TtsProtocolControlContractErrorCode;

  public constructor(code: TtsProtocolControlContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "TTS protocol control version is unsupported."
        : "TTS protocol control message is malformed.",
    );
    this.name = "TtsProtocolControlContractError";
    this.code = code;
  }
}

export type TtsProtocolControlV1 = Readonly<TtsProtocolControlV1Wire>;
export type TtsProtocolReasonV1 = ProtocolReason;
export type TtsServiceStateV1 = ServiceState;

function malformed(): never {
  throw new TtsProtocolControlContractError("malformed");
}

function readRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return malformed();
  }

  return input as Record<string, unknown>;
}

function assertSupportedVersions(input: unknown): void {
  const record = readRecord(input);
  if (
    typeof record.schemaVersion !== "number" ||
    !Number.isSafeInteger(record.schemaVersion) ||
    typeof record.protocolVersion !== "number" ||
    !Number.isSafeInteger(record.protocolVersion)
  ) {
    return malformed();
  }

  if (
    record.schemaVersion !== SCHEMA_VERSION ||
    record.protocolVersion !== PROTOCOL_VERSION
  ) {
    throw new TtsProtocolControlContractError("unsupported-version");
  }
}

function expectedOperationalErrorCode(
  reason: ProtocolReason,
):
  | "invalid-input"
  | "unsupported-input"
  | "capability-unavailable"
  | "operation-cancelled"
  | "resource-exhausted"
  | "internal-failure" {
  switch (reason) {
    case "unsupported-protocol-version":
    case "unsupported-schema-version":
      return "unsupported-input";
    case "operation-cancelled":
      return "operation-cancelled";
    case "busy":
    case "resource-exhausted":
      return "resource-exhausted";
    case "engine-failure":
    case "engine-timeout":
    case "format-mismatch":
    case "sequence-gap":
      return "internal-failure";
    case "malformed-frame":
    case "unknown-record-kind":
    case "invalid-flags":
    case "empty-payload":
    case "over-limit":
    case "invalid-utf8":
    case "malformed-json":
    case "unknown-message-kind":
    case "invalid-message":
    case "invalid-state":
    case "identity-mismatch":
    case "duplicate-identity":
      return "invalid-input";
  }
}

function validateSemanticRelationships(input: TtsProtocolControlV1Wire): void {
  switch (input.kind) {
    case "synthesize": {
      try {
        decodeNarrationSegmentV1(input.segment);
      } catch (error) {
        if (error instanceof NarrationSegmentContractError) {
          return malformed();
        }
        throw error;
      }

      if (
        new TextEncoder().encode(input.segment.text).byteLength >
        MAX_NARRATION_UTF8_BYTES
      ) {
        return malformed();
      }
      return;
    }
    case "audioMetadata": {
      try {
        const frame = decodeAudioFrameV1(input.frame);
        if (
          frame.sequence !== 0 ||
          frame.sampleRateHz !== 24_000 ||
          frame.channelCount !== 1 ||
          !frame.endOfSegment ||
          input.payloadBytes !==
            frame.sampleCountSamples * BYTES_PER_FLOAT32_SAMPLE
        ) {
          return malformed();
        }
      } catch (error) {
        if (error instanceof AudioFrameContractError) {
          return malformed();
        }
        throw error;
      }
      return;
    }
    case "error": {
      try {
        const error = decodeOperationalErrorV1(input.error);
        if (error.code !== expectedOperationalErrorCode(input.reason)) {
          return malformed();
        }
      } catch (error) {
        if (error instanceof OperationalErrorContractError) {
          return malformed();
        }
        throw error;
      }
      return;
    }
    default:
      return;
  }
}

function freezeJsonValue<T>(input: T): T {
  if (Array.isArray(input)) {
    return Object.freeze(input.map((value) => freezeJsonValue(value))) as T;
  }
  if (typeof input === "object" && input !== null) {
    const frozen = Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        freezeJsonValue(value),
      ]),
    );
    return Object.freeze(frozen) as T;
  }
  return input;
}

export function decodeTtsProtocolControlV1(
  input: unknown,
): TtsProtocolControlV1 {
  assertSupportedVersions(input);
  if (!validateTtsProtocolControlV1Wire(input)) {
    return malformed();
  }

  validateSemanticRelationships(input);
  return freezeJsonValue(input);
}
