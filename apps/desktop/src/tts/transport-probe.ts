import { invoke } from "@tauri-apps/api/core";

export const PROTOCOL_PROBE_SAMPLE_COUNT = 4_800;
export const PROTOCOL_PROBE_AUDIO_BYTES =
  PROTOCOL_PROBE_SAMPLE_COUNT * Float32Array.BYTES_PER_ELEMENT;

export type TtsProtocolProbeErrorCode =
  "tts-probe-response-invalid" | "tts-probe-unavailable";

export type TtsProtocolProbeErrorDetail =
  | "array"
  | "binary-object"
  | "byte-length"
  | "non-finite"
  | "other"
  | "other-view"
  | "prefix"
  | "sample-length";

export class TtsProtocolProbeError extends Error {
  public readonly code: TtsProtocolProbeErrorCode;
  public readonly detail: TtsProtocolProbeErrorDetail | undefined;

  public constructor(
    code: TtsProtocolProbeErrorCode,
    detail?: TtsProtocolProbeErrorDetail,
  ) {
    super(
      code === "tts-probe-response-invalid"
        ? "The native TTS protocol probe response was invalid."
        : "The native TTS protocol probe was unavailable.",
    );
    this.name = "TtsProtocolProbeError";
    this.code = code;
    this.detail = detail;
  }
}

export interface TtsProtocolProbeObservation {
  readonly byteLength: number;
  readonly sampleCount: number;
  readonly sampleFormat: "float32-le";
}

function invalidResponse(detail: TtsProtocolProbeErrorDetail): never {
  throw new TtsProtocolProbeError("tts-probe-response-invalid", detail);
}

function classifyUnexpectedResponse(
  response: unknown,
): TtsProtocolProbeErrorDetail {
  if (Array.isArray(response)) {
    return "array";
  }
  if (ArrayBuffer.isView(response)) {
    return "other-view";
  }
  if (
    typeof response === "object" &&
    response !== null &&
    "byteLength" in response
  ) {
    return "binary-object";
  }
  return "other";
}

export async function runTtsProtocolProbe(): Promise<TtsProtocolProbeObservation> {
  let response: unknown;
  try {
    response = await invoke<unknown>("run_tts_protocol_probe");
  } catch {
    throw new TtsProtocolProbeError("tts-probe-unavailable");
  }

  if (
    (!(response instanceof ArrayBuffer) && !(response instanceof Uint8Array)) ||
    response.byteLength !== PROTOCOL_PROBE_AUDIO_BYTES
  ) {
    return invalidResponse(
      response instanceof ArrayBuffer || response instanceof Uint8Array
        ? "byte-length"
        : classifyUnexpectedResponse(response),
    );
  }

  const samples =
    response instanceof ArrayBuffer
      ? new Float32Array(response)
      : new Float32Array(
          response.buffer,
          response.byteOffset,
          response.byteLength / Float32Array.BYTES_PER_ELEMENT,
        );
  if (samples.length !== PROTOCOL_PROBE_SAMPLE_COUNT) {
    return invalidResponse("sample-length");
  }
  if (samples.some((sample) => !Number.isFinite(sample))) {
    return invalidResponse("non-finite");
  }
  if (
    samples[0] !== 0 ||
    samples[1] !== 0.25 ||
    samples[2] !== -0.25 ||
    samples[3] !== 0.5
  ) {
    return invalidResponse("prefix");
  }

  return Object.freeze({
    byteLength: response.byteLength,
    sampleCount: samples.length,
    sampleFormat: "float32-le",
  });
}
