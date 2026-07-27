import { invoke } from "@tauri-apps/api/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  PROTOCOL_PROBE_AUDIO_BYTES,
  PROTOCOL_PROBE_SAMPLE_COUNT,
  runTtsProtocolProbe,
  TtsProtocolProbeError,
} from "./transport-probe";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const mockedInvoke = vi.mocked(invoke);

function createProbeBuffer(): ArrayBuffer {
  const values = [0, 0.25, -0.25, 0.5];
  const samples = new Float32Array(PROTOCOL_PROBE_SAMPLE_COUNT);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = values[index % values.length]!;
  }
  return samples.buffer;
}

describe("native TTS protocol transport probe", () => {
  beforeEach(() => {
    mockedInvoke.mockReset();
  });

  it("accepts the bounded binary response and releases it after observation", async () => {
    mockedInvoke.mockResolvedValue(createProbeBuffer());

    await expect(runTtsProtocolProbe()).resolves.toEqual({
      byteLength: PROTOCOL_PROBE_AUDIO_BYTES,
      sampleCount: PROTOCOL_PROBE_SAMPLE_COUNT,
      sampleFormat: "float32-le",
    });
    expect(mockedInvoke).toHaveBeenCalledOnce();
    expect(mockedInvoke).toHaveBeenCalledWith("run_tts_protocol_probe");
  });

  it.each([
    ["serialized array", Array.from(new Uint8Array(16))],
    ["truncated response", new ArrayBuffer(PROTOCOL_PROBE_AUDIO_BYTES - 1)],
    ["oversized response", new ArrayBuffer(PROTOCOL_PROBE_AUDIO_BYTES + 1)],
  ])("rejects a %s with a fixed content-free error", async (_label, value) => {
    mockedInvoke.mockResolvedValue(value);

    await expect(runTtsProtocolProbe()).rejects.toEqual(
      expect.objectContaining({
        code: "tts-probe-response-invalid",
        message: "The native TTS protocol probe response was invalid.",
      }),
    );
  });

  it("rejects non-finite PCM without copying it into the error", async () => {
    const buffer = createProbeBuffer();
    new Float32Array(buffer)[7] = Number.NaN;
    mockedInvoke.mockResolvedValue(buffer);

    await expect(runTtsProtocolProbe()).rejects.toBeInstanceOf(
      TtsProtocolProbeError,
    );
  });

  it("maps native failures to one fixed frontend code", async () => {
    mockedInvoke.mockRejectedValue("C:\\private\\runtime\\failure");

    await expect(runTtsProtocolProbe()).rejects.toEqual(
      expect.objectContaining({
        code: "tts-probe-unavailable",
        message: "The native TTS protocol probe was unavailable.",
      }),
    );
  });
});
