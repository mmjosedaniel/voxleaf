import { describe, expect, it, vi } from "vitest";

import { HARDWARE_PROFILE_AUTHORITY_V1 } from "../tts/hardware-profile-authority";
import {
  createWebStorageHardwareProfilePreferenceRepository,
  type WebStorageHardwareProfilePreferenceRepositoryOptions,
} from "./hardware-profile-preference";

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

function repository(
  storage: ReturnType<typeof memoryStorage>,
  options: Omit<
    WebStorageHardwareProfilePreferenceRepositoryOptions,
    "storage"
  > = {},
) {
  return createWebStorageHardwareProfilePreferenceRepository({
    ...options,
    storage: () => storage,
  });
}

describe("hardware profile preference repository", () => {
  it("stores only one bounded profile ID under the fixed key", async () => {
    const storage = memoryStorage();
    const subject = repository(storage);

    await expect(subject.read()).resolves.toEqual({ status: "missing" });
    await expect(
      subject.write("qwen3-tts-1-7b-customvoice-cuda-bf16-v1"),
    ).resolves.toEqual({ status: "saved" });
    expect(storage.setItem).toHaveBeenCalledWith(
      HARDWARE_PROFILE_AUTHORITY_V1.preference.storageKey,
      JSON.stringify({
        schemaVersion: 1,
        profileId: "qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
      }),
    );
    await expect(subject.read()).resolves.toEqual({
      status: "ready",
      profileId: "qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
    });
    expect(storage.value()).not.toContain("memory");
    expect(storage.value()).not.toContain("provider");
  });

  it.each([
    ["malformed JSON", "{"],
    ["unexpected field", '{"schemaVersion":1,"profileId":"p","host":"x"}'],
    ["invalid version", '{"schemaVersion":0,"profileId":"p"}'],
    ["invalid profile", '{"schemaVersion":1,"profileId":""}'],
  ])("rejects %s without coercion", async (_name, value) => {
    await expect(repository(memoryStorage(value)).read()).resolves.toEqual({
      status: "malformed",
    });
  });

  it("preserves a future-version value without use or overwrite", async () => {
    const future = '{"schemaVersion":2,"profileId":"future-profile"}';
    const storage = memoryStorage(future);
    const subject = repository(storage);

    await expect(subject.read()).resolves.toEqual({
      status: "unsupported-version",
    });
    await expect(subject.write("current-profile")).resolves.toEqual({
      status: "unsupported-version",
    });
    expect(storage.value()).toBe(future);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("enforces profile and envelope bounds", async () => {
    const storage = memoryStorage(
      "x".repeat(
        HARDWARE_PROFILE_AUTHORITY_V1.preference.maximumEnvelopeUtf16CodeUnits +
          1,
      ),
    );
    await expect(repository(storage).read()).resolves.toEqual({
      status: "over-limit",
    });

    const oversizedProfile = "x".repeat(
      HARDWARE_PROFILE_AUTHORITY_V1.preference.maximumProfileIdCodePoints + 1,
    );
    await expect(
      repository(memoryStorage()).write(oversizedProfile),
    ).resolves.toEqual({ status: "invalid-profile" });
  });

  it("maps storage failures to one fixed unavailable state", async () => {
    const getFailure = createWebStorageHardwareProfilePreferenceRepository({
      storage: () => ({
        getItem: () => {
          throw new Error("private storage detail");
        },
        setItem: vi.fn(),
      }),
    });
    await expect(getFailure.read()).resolves.toEqual({
      status: "unavailable",
    });

    const setFailure = createWebStorageHardwareProfilePreferenceRepository({
      storage: () => ({
        getItem: () => null,
        setItem: () => {
          throw new Error("private storage detail");
        },
      }),
    });
    await expect(setFailure.write("profile")).resolves.toEqual({
      status: "unavailable",
    });
  });
});
