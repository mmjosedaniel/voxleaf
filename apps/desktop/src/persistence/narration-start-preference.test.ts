import { describe, expect, it, vi } from "vitest";

import {
  createWebStorageNarrationStartPreferenceRepository,
  NARRATION_START_PREFERENCE_V1,
} from "./narration-start-preference";

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

describe("narration start preference repository", () => {
  it.each(["read", "write", "reset"] as const)(
    "CAF-R4.4 bounds existing input before %s parsing or encoding",
    async (operation) => {
      const value = "x".repeat(257);
      const storage = memoryStorage(value);
      const subject = createWebStorageNarrationStartPreferenceRepository(
        () => storage,
      );
      const parse = vi.spyOn(JSON, "parse");
      const encode = vi.spyOn(TextEncoder.prototype, "encode");
      try {
        const result =
          operation === "write"
            ? await subject.write({ kind: "quick" })
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
  it("defaults missing state without writing and persists each closed mode", async () => {
    const storage = memoryStorage();
    const subject = createWebStorageNarrationStartPreferenceRepository(
      () => storage,
    );

    await expect(subject.read()).resolves.toEqual({
      status: "missing",
      selection: { kind: "quick" },
    });
    expect(storage.setItem).not.toHaveBeenCalled();

    await expect(
      subject.write({ kind: "prepared", targetMs: 300_000 }),
    ).resolves.toEqual({ status: "saved" });
    expect(storage.value()).toBe(
      JSON.stringify({
        schemaVersion: 1,
        mode: "prepared",
        preparedTargetMs: 300_000,
      }),
    );
    await expect(subject.read()).resolves.toEqual({
      status: "ready",
      selection: { kind: "prepared", targetMs: 300_000 },
    });
  });

  it.each([
    "{",
    "[]",
    '{"schemaVersion":0,"mode":"quick","preparedTargetMs":60000}',
    '{"schemaVersion":1,"mode":"quick","preparedTargetMs":120000}',
    '{"schemaVersion":1,"mode":"prepared","preparedTargetMs":30000}',
    '{"schemaVersion":1,"mode":"prepared","preparedTargetMs":60000,"book":"private"}',
  ])("fails malformed state closed to quick start", async (value) => {
    await expect(
      createWebStorageNarrationStartPreferenceRepository(() =>
        memoryStorage(value),
      ).read(),
    ).resolves.toEqual({ status: "malformed", selection: { kind: "quick" } });
  });

  it("preserves future state and rejects invalid runtime values", async () => {
    const future = JSON.stringify({
      schemaVersion: 2,
      mode: "prepared",
      preparedTargetMs: 60_000,
    });
    const storage = memoryStorage(future);
    const subject = createWebStorageNarrationStartPreferenceRepository(
      () => storage,
    );
    await expect(subject.read()).resolves.toEqual({
      status: "unsupported-version",
      selection: { kind: "quick" },
    });
    await expect(subject.reset()).resolves.toEqual({
      status: "unsupported-version",
    });
    await expect(
      subject.write({ kind: "prepared", targetMs: 1 } as never),
    ).resolves.toEqual({ status: "invalid-selection" });
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("bounds UTF-8 state, maps unavailable storage, and resets explicitly", async () => {
    const oversized = "x".repeat(
      NARRATION_START_PREFERENCE_V1.maximumEnvelopeUtf8Bytes + 1,
    );
    await expect(
      createWebStorageNarrationStartPreferenceRepository(() =>
        memoryStorage(oversized),
      ).read(),
    ).resolves.toEqual({ status: "over-limit", selection: { kind: "quick" } });

    const unavailable = createWebStorageNarrationStartPreferenceRepository(
      () => ({
        getItem: () => {
          throw new Error("private detail");
        },
        setItem: vi.fn(),
      }),
    );
    await expect(unavailable.read()).resolves.toEqual({
      status: "unavailable",
      selection: { kind: "quick" },
    });
    await expect(unavailable.reset()).resolves.toEqual({
      status: "unavailable",
    });

    const storage = memoryStorage("{");
    const subject = createWebStorageNarrationStartPreferenceRepository(
      () => storage,
    );
    await expect(subject.reset()).resolves.toEqual({ status: "saved" });
    expect(storage.value()).toBe(
      JSON.stringify({
        schemaVersion: 1,
        mode: "quick",
        preparedTargetMs: 60_000,
      }),
    );
  });
});
