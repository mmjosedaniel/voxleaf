import { invoke } from "@tauri-apps/api/core";

export const PROTOCOL_PROBE_SAMPLE_COUNT = 4_800;
export const PROTOCOL_PROBE_AUDIO_BYTES =
  PROTOCOL_PROBE_SAMPLE_COUNT * Float32Array.BYTES_PER_ELEMENT;

export type TtsProtocolProbeErrorCode =
  "tts-probe-response-invalid" | "tts-probe-unavailable";

export class TtsProtocolProbeError extends Error {
  public readonly code: TtsProtocolProbeErrorCode;

  public constructor(code: TtsProtocolProbeErrorCode) {
    super(
      code === "tts-probe-response-invalid"
        ? "The native TTS protocol probe response was invalid."
        : "The native TTS protocol probe was unavailable.",
    );
    this.name = "TtsProtocolProbeError";
    this.code = code;
  }
}

export interface TtsProtocolProbeObservation {
  readonly byteLength: number;
  readonly sampleCount: number;
  readonly sampleFormat: "float32-le";
}

function invalidResponse(): never {
  throw new TtsProtocolProbeError("tts-probe-response-invalid");
}

export async function runTtsProtocolProbe(): Promise<TtsProtocolProbeObservation> {
  let response: ArrayBuffer;
  try {
    response = await invoke<ArrayBuffer>("run_tts_protocol_probe");
  } catch {
    throw new TtsProtocolProbeError("tts-probe-unavailable");
  }

  if (
    !(response instanceof ArrayBuffer) ||
    response.byteLength !== PROTOCOL_PROBE_AUDIO_BYTES
  ) {
    return invalidResponse();
  }

  const samples = new Float32Array(response);
  if (
    samples.length !== PROTOCOL_PROBE_SAMPLE_COUNT ||
    samples.some((sample) => !Number.isFinite(sample)) ||
    samples[0] !== 0 ||
    samples[1] !== 0.25 ||
    samples[2] !== -0.25 ||
    samples[3] !== 0.5
  ) {
    return invalidResponse();
  }

  return Object.freeze({
    byteLength: response.byteLength,
    sampleCount: samples.length,
    sampleFormat: "float32-le",
  });
}
