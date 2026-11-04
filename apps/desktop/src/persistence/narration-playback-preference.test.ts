import { describe, expect, it, vi } from "vitest";

import {
  createWebStorageNarrationPlaybackPreferenceRepository,
  NARRATION_PLAYBACK_PREFERENCE_V1,
} from "./narration-playback-preference";

function memoryStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => {
      value = next;
    }),
    value: () => value,
  };
}

describe("narration playback preference repository", () => {
  it.each(["read", "write", "reset"] as const)(
    "CAF-R4.4 bounds existing input before %s parsing or encoding",
    async (operation) => {
      const value = "x".repeat(257);
      const storage = memoryStorage(value);
      const subject = createWebStorageNarrationPlaybackPreferenceRepository(
        () => storage,
      );
      const parse = vi.spyOn(JSON, "parse");
      const encode = vi.spyOn(TextEncoder.prototype, "encode");
      try {
        const result =
          operation === "write"
            ? await subject.write(100)
            : await subject[operation]();
        expect(result.status).toBe("over-limit");
        expect(parse).not.toHaveBeenCalled();
        expect(
          encode.mock.calls.every(([text]) => (text?.length ?? 0) <= 256),
        ).toBe(true);
        expect(storage.value()).toBe(value);
        expect(storage.setItem).not.toHaveBeenCalled();
      } finally {
        parse.mockRestore();
        encode.mockRestore();
      }
    },
  );
  it("defaults without writing and persists every exact admitted rate", async () => {
    const storage = memoryStorage();
    const subject = createWebStorageNarrationPlaybackPreferenceRepository(
      () => storage,
    );

    await expect(subject.read()).resolves.toEqual({
      status: "missing",
      playbackRatePercent: 100,
    });
    expect(storage.setItem).not.toHaveBeenCalled();

    for (const playbackRatePercent of [100, 95, 90, 85, 80, 75] as const) {
      await expect(subject.write(playbackRatePercent)).resolves.toEqual({
        status: "saved",
      });
      await expect(subject.read()).resolves.toEqual({
        status: "ready",
        playbackRatePercent,
      });
    }
  });

  it.each([
    "{",
    "[]",
    '{"schemaVersion":0,"playbackRatePercent":100}',
    '{"schemaVersion":1,"playbackRatePercent":70}',
    '{"schemaVersion":1,"playbackRatePercent":0.9}',
    '{"schemaVersion":1,"playbackRatePercent":90,"book":"private"}',
  ])("fails malformed state closed to 1.00x", async (value) => {
    await expect(
      createWebStorageNarrationPlaybackPreferenceRepository(() =>
        memoryStorage(value),
      ).read(),
    ).resolves.toEqual({ status: "malformed", playbackRatePercent: 100 });
  });

  it("preserves future state and rejects invalid runtime values", async () => {
    const storage = memoryStorage(
      JSON.stringify({ schemaVersion: 2, playbackRatePercent: 85 }),
    );
    const subject = createWebStorageNarrationPlaybackPreferenceRepository(
      () => storage,
    );
    await expect(subject.read()).resolves.toEqual({
      status: "unsupported-version",
      playbackRatePercent: 100,
    });
    await expect(subject.reset()).resolves.toEqual({
      status: "unsupported-version",
    });
    await expect(subject.write(70 as never)).resolves.toEqual({
      status: "invalid-selection",
    });
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("bounds state, maps unavailable storage, and resets explicitly", async () => {
    const oversized = "x".repeat(
      NARRATION_PLAYBACK_PREFERENCE_V1.maximumEnvelopeUtf8Bytes + 1,
    );
    await expect(
      createWebStorageNarrationPlaybackPreferenceRepository(() =>
        memoryStorage(oversized),
      ).read(),
    ).resolves.toEqual({ status: "over-limit", playbackRatePercent: 100 });

    const unavailable = createWebStorageNarrationPlaybackPreferenceRepository(
      () => ({
        getItem: () => {
          throw new Error("private detail");
        },
        setItem: vi.fn(),
      }),
    );
    await expect(unavailable.read()).resolves.toEqual({
      status: "unavailable",
      playbackRatePercent: 100,
    });

    const storage = memoryStorage("{");
    const subject = createWebStorageNarrationPlaybackPreferenceRepository(
      () => storage,
    );
    await expect(subject.reset()).resolves.toEqual({ status: "saved" });
    expect(storage.value()).toBe(
      JSON.stringify({ schemaVersion: 1, playbackRatePercent: 100 }),
    );
  });
});
