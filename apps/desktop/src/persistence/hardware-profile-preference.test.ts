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
    removeItem: vi.fn(() => {
      value = null;
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
  it.each([undefined, "{", '{"schemaVersion":1,"profileId":"prior"}'])(
    "SAF-09 reversible writes restore exact prior state %s",
    async (initial) => {
      const storage = memoryStorage(initial);
      const subject = repository(storage);
      const saved = await subject.writeReversible!("new-profile");
      expect(saved.status).toBe("saved");
      expect(storage.value()).toContain("new-profile");
      if (saved.status !== "saved") throw new Error("expected-saved");
      expect(saved.restore!()).toEqual({ status: "saved" });
      expect(storage.value()).toBe(initial ?? null);
    },
  );

  it("SAF-09 rollback preserves a newer external preference", async () => {
    const storage = memoryStorage();
    const subject = repository(storage);
    const saved = await subject.writeReversible!("obsolete-profile");
    await subject.write("newer-profile");
    if (saved.status !== "saved") throw new Error("expected-saved");
    expect(saved.restore!()).toEqual({ status: "unavailable" });
    expect(storage.value()).toContain("newer-profile");
  });

  it("SAF-09 rollback reports storage failure without discarding its current bytes", async () => {
    const storage = memoryStorage();
    const saved = await repository(storage).writeReversible!("new-profile");
    storage.removeItem.mockImplementation(() => {
      throw new Error("synthetic-storage-failure");
    });
    if (saved.status !== "saved") throw new Error("expected-saved");
    expect(saved.restore!()).toEqual({ status: "unavailable" });
    expect(storage.value()).toContain("new-profile");
  });

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

  it("SAC-03 replaces malformed JSON on an explicit validated save", async () => {
    const storage = memoryStorage("{");
    const subject = repository(storage);
    await expect(subject.read()).resolves.toEqual({ status: "malformed" });
    await expect(subject.write("current-profile")).resolves.toEqual({
      status: "saved",
    });
    await expect(subject.read()).resolves.toEqual({
      status: "ready",
      profileId: "current-profile",
    });
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(
      HARDWARE_PROFILE_AUTHORITY_V1.preference.storageKey,
      JSON.stringify({ schemaVersion: 1, profileId: "current-profile" }),
    );
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
    await expect(getFailure.write("profile")).resolves.toEqual({
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
