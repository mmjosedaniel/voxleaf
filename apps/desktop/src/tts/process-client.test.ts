import { invoke } from "@tauri-apps/api/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  TtsProcessClient,
  TtsProcessClientError,
  type TtsGenerationScope,
} from "./process-client";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const mockedInvoke = vi.mocked(invoke);
const SERVICE_INSTANCE_ID = "service:synthetic-client-1";

function state(value: string) {
  return {
    schemaVersion: 1,
    protocolVersion: 1,
    kind: "state",
    serviceInstanceId: SERVICE_INSTANCE_ID,
    state: value,
  };
}

function capabilities() {
  return {
    schemaVersion: 1,
    protocolVersion: 1,
    kind: "capabilities",
    serviceInstanceId: SERVICE_INSTANCE_ID,
    report: {
      schemaVersion: 1,
      capabilities: {
        localSpeechGeneration: "unknown",
        streamingGeneration: "unsupported",
        generationCancellation: "unsupported",
        hardwareAcceleration: "unknown",
        cpuFallback: "unsupported",
      },
    },
    cancellationContainment:
      "identity-invalidation-then-worker-termination",
  };
}

function startControls() {
  return [
    state("handshaking"),
    {
      schemaVersion: 1,
      protocolVersion: 1,
      kind: "handshakeAccepted",
      serviceInstanceId: SERVICE_INSTANCE_ID,
    },
    state("unloaded"),
    capabilities(),
  ];
}

function prepareControls() {
  return [
    state("loading"),
    state("warming"),
    state("ready"),
    capabilities(),
  ];
}

function healthControls() {
  return [state("ready"), capabilities()];
}

function shutdownControls() {
  return [state("stopping"), state("stopped")];
}

function scope(): TtsGenerationScope {
  return {
    sessionId: "session:synthetic-client-1",
    generationId: "generation:synthetic-client-1",
    segmentId: "segment:synthetic-client-1",
  };
}

function cancelControls() {
  return [
    state("cancelling"),
    {
      schemaVersion: 1,
      protocolVersion: 1,
      kind: "cancelled",
      serviceInstanceId: SERVICE_INSTANCE_ID,
      workIdentity: {
        requestId: "request:native-1",
        ...scope(),
      },
    },
    state("stopped"),
  ];
}

function segment() {
  const bookIdentity = {
    scheme: "synthetic-test",
    schemeVersion: 1,
    value: "book-test-001",
  };
  const start = {
    schemaVersion: 1,
    bookIdentity: { ...bookIdentity },
    spineItemId: "spine:chapter-1",
    spineItemIndex: 0,
    anchor: {
      kind: "element-id",
      formatVersion: 1,
      value: "paragraph-1",
      anchorIndex: 0,
    },
    textOffsetCodePoints: 0,
  };
  return {
    schemaVersion: 1,
    segmentId: scope().segmentId,
    bookIdentity,
    sessionId: scope().sessionId,
    generationId: scope().generationId,
    sequence: 0,
    sourceRange: {
      schemaVersion: 1,
      start,
      end: {
        ...start,
        bookIdentity: { ...bookIdentity },
        anchor: { ...start.anchor },
        textOffsetCodePoints: 24,
      },
    },
    text: "Synthetic sensitive narration.",
  };
}

function audioBuffer(sampleCount = 4_800): ArrayBuffer {
  const samples = new Float32Array(sampleCount);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = index % 2 === 0 ? 0.25 : -0.25;
  }
  return samples.buffer;
}

async function readyClient(): Promise<TtsProcessClient> {
  mockedInvoke
    .mockResolvedValueOnce(startControls())
    .mockResolvedValueOnce(prepareControls());
  const client = new TtsProcessClient();
  await client.start();
  await client.prepare();
  return client;
}

describe("typed native TTS process client", () => {
  beforeEach(() => {
    mockedInvoke.mockReset();
  });

  it("accepts the exact lifecycle, owns one binary unit, and zeroes it on release", async () => {
    const buffer = audioBuffer();
    mockedInvoke
      .mockResolvedValueOnce(startControls())
      .mockResolvedValueOnce(prepareControls())
      .mockResolvedValueOnce(buffer)
      .mockResolvedValueOnce(healthControls())
      .mockResolvedValueOnce(shutdownControls());
    const client = new TtsProcessClient();

    await expect(client.start()).resolves.toEqual({
      serviceInstanceId: SERVICE_INSTANCE_ID,
      state: "unloaded",
      hasActiveGeneration: false,
      retainedAudioUnits: 0,
    });
    await expect(client.prepare()).resolves.toEqual({
      serviceInstanceId: SERVICE_INSTANCE_ID,
      state: "ready",
      hasActiveGeneration: false,
      retainedAudioUnits: 0,
    });
    await expect(client.synthesize(segment())).resolves.toEqual({
      ...scope(),
      sampleRateHz: 24_000,
      channelCount: 1,
      sampleFormat: "float32-le",
      sampleCountSamples: 4_800,
      payloadBytes: 19_200,
      endOfSegment: true,
    });
    expect(client.observe().retainedAudioUnits).toBe(1);

    const unit = client.takeAudioUnit();
    expect(unit?.payload.byteLength).toBe(19_200);
    expect(client.observe().retainedAudioUnits).toBe(0);
    unit?.release();
    expect(new Uint8Array(buffer).every((value) => value === 0)).toBe(true);
    expect(unit?.payload.byteLength).toBe(0);

    await expect(client.health()).resolves.toEqual({
      serviceInstanceId: SERVICE_INSTANCE_ID,
      state: "ready",
      hasActiveGeneration: false,
      retainedAudioUnits: 0,
    });
    await client.shutdown();
    expect(client.observe()).toEqual({
      serviceInstanceId: undefined,
      state: "stopped",
      hasActiveGeneration: false,
      retainedAudioUnits: 0,
    });
    expect(mockedInvoke.mock.calls.map(([command]) => command)).toEqual([
      "start_tts_service",
      "prepare_tts_service",
      "synthesize_tts_segment",
      "health_tts_service",
      "shutdown_tts_service",
    ]);
  });

  it("rejects reordered or identity-mismatched control responses", async () => {
    mockedInvoke.mockResolvedValueOnce([
      state("unloaded"),
      startControls()[1],
      state("handshaking"),
      capabilities(),
    ]);
    await expect(new TtsProcessClient().start()).rejects.toEqual(
      expect.objectContaining({ code: "tts-service-invalid-response" }),
    );

    mockedInvoke.mockReset();
    const wrongCapability = {
      ...capabilities(),
      serviceInstanceId: "service:stale",
    };
    mockedInvoke.mockResolvedValueOnce([
      ...startControls().slice(0, 3),
      wrongCapability,
    ]);
    await expect(new TtsProcessClient().start()).rejects.toEqual(
      expect.objectContaining({ code: "tts-service-invalid-response" }),
    );
  });

  it.each([
    ["serialized byte array", () => Array.from(new Uint8Array(16))],
    ["oversized payload", () => new ArrayBuffer(1_920_004)],
    [
      "non-finite PCM",
      () => {
        const buffer = audioBuffer();
        new Float32Array(buffer)[3] = Number.NaN;
        return buffer;
      },
    ],
  ])("rejects a %s without retaining it", async (_label, createResponse) => {
    const client = await readyClient();
    const response = createResponse();
    mockedInvoke.mockResolvedValueOnce(response);

    await expect(client.synthesize(segment())).rejects.toEqual(
      expect.objectContaining({ code: "tts-service-invalid-response" }),
    );
    expect(client.observe().retainedAudioUnits).toBe(0);
    if (response instanceof ArrayBuffer) {
      expect(new Uint8Array(response).every((value) => value === 0)).toBe(true);
    }
  });

  it("permits one active request and rejects concurrent or buffered work", async () => {
    const client = await readyClient();
    let settle: ((value: ArrayBuffer) => void) | undefined;
    mockedInvoke.mockImplementationOnce(
      () =>
        new Promise<ArrayBuffer>((resolve) => {
          settle = resolve;
        }),
    );

    const first = client.synthesize(segment());
    await expect(client.synthesize(segment())).rejects.toEqual(
      expect.objectContaining({ code: "tts-service-busy" }),
    );
    settle?.(audioBuffer());
    await first;
    await expect(client.synthesize(segment())).rejects.toEqual(
      expect.objectContaining({ code: "tts-service-busy" }),
    );
    client.takeAudioUnit()?.release();
  });

  it("invalidates active identity before cancellation and suppresses late bytes", async () => {
    const client = await readyClient();
    const lateBuffer = audioBuffer();
    let settle: ((value: ArrayBuffer) => void) | undefined;
    mockedInvoke.mockImplementation((command) => {
      if (command === "synthesize_tts_segment") {
        return new Promise<ArrayBuffer>((resolve) => {
          settle = resolve;
        });
      }
      if (command === "cancel_tts_generation") {
        return Promise.resolve(cancelControls());
      }
      return Promise.reject("unexpected-command");
    });

    const pending = client.synthesize(segment());
    await client.cancel(scope());
    settle?.(lateBuffer);

    await expect(pending).rejects.toEqual(
      expect.objectContaining({ code: "tts-service-cancelled" }),
    );
    expect(new Uint8Array(lateBuffer).every((value) => value === 0)).toBe(true);
    expect(client.observe()).toEqual({
      serviceInstanceId: undefined,
      state: "stopped",
      hasActiveGeneration: false,
      retainedAudioUnits: 0,
    });
    expect(mockedInvoke).toHaveBeenCalledWith("cancel_tts_generation", {
      scope: scope(),
    });
  });

  it("releases retained bytes on shutdown and maps dynamic native failures safely", async () => {
    const client = await readyClient();
    const buffer = audioBuffer();
    mockedInvoke.mockResolvedValueOnce(buffer);
    await client.synthesize(segment());
    mockedInvoke.mockResolvedValueOnce(shutdownControls());

    await client.shutdown();
    expect(new Uint8Array(buffer).every((value) => value === 0)).toBe(true);

    mockedInvoke.mockRejectedValueOnce(
      "C:\\private\\runtime\\book-title\\failure",
    );
    await expect(client.start()).rejects.toEqual(
      expect.objectContaining({
        code: "tts-service-unavailable",
        message: "The local speech service operation failed.",
      }),
    );
  });

  it("rejects malformed narration before invoking native synthesis", async () => {
    const client = await readyClient();
    const callsBefore = mockedInvoke.mock.calls.length;

    await expect(
      client.synthesize({ ...segment(), text: "", privatePath: "secret" }),
    ).rejects.toBeInstanceOf(TtsProcessClientError);
    expect(mockedInvoke).toHaveBeenCalledTimes(callsBefore);
  });
});
