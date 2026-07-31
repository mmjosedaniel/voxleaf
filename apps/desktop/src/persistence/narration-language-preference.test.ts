import { describe, expect, it, vi } from "vitest";

import {
  createWebStorageNarrationLanguagePreferenceRepository,
  NARRATION_LANGUAGE_PREFERENCE_V2,
} from "./narration-language-preference";

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

describe("narration language preference repository", () => {
  it("defaults missing state to English and stores one closed V2 value", async () => {
    const storage = memoryStorage();
    const subject = createWebStorageNarrationLanguagePreferenceRepository(
      () => storage,
    );

    await expect(subject.read()).resolves.toEqual({
      status: "missing",
      language: "en",
    });
    await expect(subject.write("en")).resolves.toEqual({ status: "saved" });
    expect(storage.setItem).toHaveBeenCalledWith(
      NARRATION_LANGUAGE_PREFERENCE_V2.storageKey,
      JSON.stringify({ schemaVersion: 2, language: "en" }),
    );
    await expect(subject.read()).resolves.toEqual({
      status: "ready",
      language: "en",
    });
    expect(storage.value()).not.toContain("book");
    expect(storage.value()).not.toContain("profile");
  });

  it.each([
    "{",
    "[]",
    '{"schemaVersion":0,"language":"en"}',
    '{"schemaVersion":1,"language":"fr"}',
    '{"schemaVersion":1,"language":"en","book":"private"}',
  ])("fails malformed state closed to English", async (value) => {
    const subject = createWebStorageNarrationLanguagePreferenceRepository(() =>
      memoryStorage(value),
    );
    await expect(subject.read()).resolves.toEqual({
      status: "malformed",
      language: "en",
    });
  });

  it.each(["es", "en"] as const)(
    "preserves a valid V1 %s selection during migration",
    async (language) => {
      const subject = createWebStorageNarrationLanguagePreferenceRepository(
        () => memoryStorage(JSON.stringify({ schemaVersion: 1, language })),
      );
      await expect(subject.read()).resolves.toEqual({
        status: "ready",
        language,
      });
    },
  );

  it("preserves a future version without overwriting it", async () => {
    const future = '{"schemaVersion":3,"language":"es"}';
    const storage = memoryStorage(future);
    const subject = createWebStorageNarrationLanguagePreferenceRepository(
      () => storage,
    );
    await expect(subject.read()).resolves.toEqual({
      status: "unsupported-version",
      language: "en",
    });
    await expect(subject.write("es")).resolves.toEqual({
      status: "unsupported-version",
    });
    expect(storage.value()).toBe(future);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("bounds retained state and maps storage failures without details", async () => {
    const oversized = "x".repeat(
      NARRATION_LANGUAGE_PREFERENCE_V2.maximumEnvelopeUtf8Bytes + 1,
    );
    await expect(
      createWebStorageNarrationLanguagePreferenceRepository(() =>
        memoryStorage(oversized),
      ).read(),
    ).resolves.toEqual({ status: "over-limit", language: "en" });

    const failed = createWebStorageNarrationLanguagePreferenceRepository(
      () => ({
        getItem: () => {
          throw new Error("private storage detail");
        },
        setItem: vi.fn(),
      }),
    );
    await expect(failed.read()).resolves.toEqual({
      status: "unavailable",
      language: "en",
    });
  });

  it("explicitly resets recoverable state to English", async () => {
    const storage = memoryStorage("{");
    const subject = createWebStorageNarrationLanguagePreferenceRepository(
      () => storage,
    );

    await expect(subject.reset()).resolves.toEqual({ status: "saved" });
    expect(storage.value()).toBe(
      JSON.stringify({ schemaVersion: 2, language: "en" }),
    );
  });
});
