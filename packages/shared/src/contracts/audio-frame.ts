import Ajv2020 from "ajv/dist/2020.js";

import audioFrameV1Schema from "../../schemas/audio-frame/v1.schema.json" with { type: "json" };
import primitivesV1Schema from "../../schemas/primitives/v1.schema.json" with { type: "json" };
import type { AudioFrameV1Wire } from "../generated/contracts/audio-frame-v1.js";
import {
  createCount,
  createFrameId,
  createGenerationId,
  createHertz,
  createIndex,
  createMilliseconds,
  createSampleCount,
  createSchemaVersion,
  createSegmentId,
  createSessionId,
} from "../primitives/index.js";
import type {
  Count,
  FrameId,
  GenerationId,
  Hertz,
  Index,
  Milliseconds,
  SampleCount,
  SchemaVersion,
  SegmentId,
  SessionId,
} from "../primitives/index.js";
import type { GenerationWorkIdentityV1 } from "./reading-session.js";

const AUDIO_FRAME_SCHEMA_VERSION_V1 = createSchemaVersion(1);
const MILLISECONDS_PER_SECOND = 1_000n;
const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

const validator = new Ajv2020({
  allErrors: true,
  coerceTypes: false,
  removeAdditional: false,
  strict: true,
  useDefaults: false,
});

validator.addSchema(primitivesV1Schema);

const validateAudioFrameV1Wire =
  validator.compile<AudioFrameV1Wire>(audioFrameV1Schema);

export type AudioFrameContractErrorCode = "malformed" | "unsupported-version";

export class AudioFrameContractError extends Error {
  public readonly code: AudioFrameContractErrorCode;

  public constructor(code: AudioFrameContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Audio frame contract version is unsupported."
        : "Audio frame contract is malformed.",
    );
    this.name = "AudioFrameContractError";
    this.code = code;
  }
}

export type AudioFrameContinuityErrorCode =
  | "identity-mismatch"
  | "format-mismatch"
  | "duplicate-frame-id"
  | "sequence-gap"
  | "frame-after-segment-end"
  | "duration-overflow";

export class AudioFrameContinuityError extends Error {
  public readonly code: AudioFrameContinuityErrorCode;

  public constructor(code: AudioFrameContinuityErrorCode) {
    const messages: Record<AudioFrameContinuityErrorCode, string> = {
      "identity-mismatch": "Audio frame sequence identity does not match.",
      "format-mismatch": "Audio frame sequence format does not match.",
      "duplicate-frame-id": "Audio frame sequence contains a duplicate ID.",
      "sequence-gap": "Audio frame sequence is not contiguous.",
      "frame-after-segment-end":
        "Audio frame sequence continues after the segment end.",
      "duration-overflow": "Audio frame duration exceeds the supported range.",
    };

    super(messages[code]);
    this.name = "AudioFrameContinuityError";
    this.code = code;
  }
}

export interface AudioFrameV1 {
  readonly schemaVersion: SchemaVersion;
  readonly frameId: FrameId;
  readonly sessionId: SessionId;
  readonly generationId: GenerationId;
  readonly segmentId: SegmentId;
  readonly sequence: Index;
  readonly sampleRateHz: Hertz;
  /** Positive count of sample frames per channel. */
  readonly sampleCountSamples: SampleCount;
  readonly channelCount: Count;
  readonly endOfSegment: boolean;
}

function malformedAudioFrame(): never {
  throw new AudioFrameContractError("malformed");
}

function readSupportedVersion(input: unknown): SchemaVersion {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return malformedAudioFrame();
  }

  let version: SchemaVersion;

  try {
    version = createSchemaVersion(
      (input as Record<string, unknown>).schemaVersion,
    );
  } catch {
    return malformedAudioFrame();
  }

  if (version !== AUDIO_FRAME_SCHEMA_VERSION_V1) {
    throw new AudioFrameContractError("unsupported-version");
  }

  return version;
}

function durationMsFromSampleCount(
  sampleCountSamples: bigint,
  sampleRateHz: Hertz,
): Milliseconds {
  const durationMs =
    (sampleCountSamples * MILLISECONDS_PER_SECOND) / BigInt(sampleRateHz);

  if (durationMs > MAX_SAFE_INTEGER_BIGINT) {
    throw new AudioFrameContinuityError("duration-overflow");
  }

  return createMilliseconds(Number(durationMs));
}

export function getAudioFrameWorkIdentity(
  frame: AudioFrameV1,
): GenerationWorkIdentityV1 {
  return Object.freeze({
    sessionId: frame.sessionId,
    generationId: frame.generationId,
  });
}

/** Returns conservative whole milliseconds, truncating any sub-millisecond remainder. */
export function calculateAudioFrameDurationMs(
  frame: AudioFrameV1,
): Milliseconds {
  return durationMsFromSampleCount(
    BigInt(frame.sampleCountSamples),
    frame.sampleRateHz,
  );
}

/**
 * Validates one contiguous run for a single narration segment and returns its
 * conservative whole-millisecond duration. Samples are summed before the one
 * truncation step so per-frame rounding error does not accumulate.
 */
export function calculateContiguousAudioDurationMs(
  frames: readonly AudioFrameV1[],
): Milliseconds {
  if (frames.length === 0) {
    return createMilliseconds(0);
  }

  const first = frames[0]!;
  const frameIds = new Set<FrameId>();
  let sampleCountSamples = 0n;
  let previous: AudioFrameV1 | undefined;

  for (const frame of frames) {
    if (frameIds.has(frame.frameId)) {
      throw new AudioFrameContinuityError("duplicate-frame-id");
    }
    frameIds.add(frame.frameId);

    if (
      frame.sessionId !== first.sessionId ||
      frame.generationId !== first.generationId ||
      frame.segmentId !== first.segmentId
    ) {
      throw new AudioFrameContinuityError("identity-mismatch");
    }

    if (
      frame.sampleRateHz !== first.sampleRateHz ||
      frame.channelCount !== first.channelCount
    ) {
      throw new AudioFrameContinuityError("format-mismatch");
    }

    if (previous !== undefined) {
      if (previous.endOfSegment) {
        throw new AudioFrameContinuityError("frame-after-segment-end");
      }

      if (
        previous.sequence === Number.MAX_SAFE_INTEGER ||
        frame.sequence !== previous.sequence + 1
      ) {
        throw new AudioFrameContinuityError("sequence-gap");
      }
    }

    sampleCountSamples += BigInt(frame.sampleCountSamples);
    previous = frame;
  }

  return durationMsFromSampleCount(sampleCountSamples, first.sampleRateHz);
}

export function decodeAudioFrameV1(input: unknown): AudioFrameV1 {
  const schemaVersion = readSupportedVersion(input);

  if (!validateAudioFrameV1Wire(input)) {
    return malformedAudioFrame();
  }

  return Object.freeze({
    schemaVersion,
    frameId: createFrameId(input.frameId),
    sessionId: createSessionId(input.sessionId),
    generationId: createGenerationId(input.generationId),
    segmentId: createSegmentId(input.segmentId),
    sequence: createIndex(input.sequence),
    sampleRateHz: createHertz(input.sampleRateHz),
    sampleCountSamples: createSampleCount(input.sampleCountSamples),
    channelCount: createCount(input.channelCount),
    endOfSegment: input.endOfSegment,
  });
}
