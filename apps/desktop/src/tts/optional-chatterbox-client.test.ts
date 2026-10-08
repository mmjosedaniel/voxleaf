import { describe, expect, it, vi } from "vitest";

import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
} from "./optional-chatterbox-client";

function snapshot(state: string) {
  return {
    profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    state,
    downloadBytes: 1_024,
    downloadedBytes: 0,
    installedBytes: 2_048,
    temporaryBytes: 3_072,
    minimumFreeBytes: 4_096,
    coldStartSeconds: 31,
    minimumLogicalProcessors: 8,
    minimumTotalRamMiB: 24_576,
    minimumAvailableRamMiB: 4_096,
    measuredPeakDedicatedVramMiB: 3_644,
    minimumTotalDedicatedVramMiB: 5_632,
    minimumAvailableDedicatedVramMiB: 4_668,
    recommendedTotalDedicatedVramMiB: 7_680,
    licenseSummary:
      "Chatterbox, its reviewed model/default conditioning, and PerTh are MIT-licensed.",
    failure: null,
  };
}

describe("optional Chatterbox native client", () => {
  it("deduplicates overlapping snapshot refreshes", async () => {
    let resolveRefresh: ((value: unknown) => void) | undefined;
    const refresh = new Promise<unknown>((resolve) => {
      resolveRefresh = resolve;
    });
    const invoke = vi.fn(() => refresh);
    const client = new OptionalChatterboxClient(invoke);

    const first = client.refresh();
    const second = client.refresh();

    expect(invoke).toHaveBeenCalledTimes(1);
    resolveRefresh?.(snapshot("installed"));
    await expect(first).resolves.toMatchObject({ state: "installed" });
    await expect(second).resolves.toMatchObject({ state: "installed" });
  });

  it("does not let an older refresh overwrite a newer operation", async () => {
    let rejectRefresh: ((reason: unknown) => void) | undefined;
    const refresh = new Promise<unknown>((_resolve, reject) => {
      rejectRefresh = reject;
    });
    const invoke = vi.fn((command: string) =>
      command === "optional_chatterbox_snapshot"
        ? refresh
        : Promise.resolve(snapshot("installed")),
    );
    const client = new OptionalChatterboxClient(invoke);

    const staleRefresh = client.refresh();
    await client.select();
    rejectRefresh?.("tts-optional-profile-cleanup-failed");
    await staleRefresh;

    expect(client.observe()).toMatchObject({ state: "installed" });
    expect(client.observe().failure).toBeUndefined();
  });

  it("returns a safe failure when an older selection finishes after removal", async () => {
    let resolveSelection: ((value: unknown) => void) | undefined;
    const selection = new Promise<unknown>((resolve) => {
      resolveSelection = resolve;
    });
    const invoke = vi.fn((command: string) =>
      command === "select_optional_chatterbox"
        ? selection
        : Promise.resolve(snapshot("absent")),
    );
    const client = new OptionalChatterboxClient(invoke);

    const staleSelection = client.select();
    await client.remove();
    resolveSelection?.(snapshot("installed"));

    await expect(staleSelection).resolves.toMatchObject({
      state: "failed",
      failure: "tts-optional-profile-busy",
    });
    expect(client.observe()).toMatchObject({ state: "absent" });
  });

  it("sends only the closed profile identifier to native acquisition commands", async () => {
    const invoke = vi.fn(async (command: string) => {
      if (command === "optional_chatterbox_snapshot") {
        return snapshot("absent");
      }
      return snapshot("confirming");
    });
    const client = new OptionalChatterboxClient(invoke);

    await client.refresh();
    await client.select();

    expect(invoke).toHaveBeenNthCalledWith(
      1,
      "optional_chatterbox_snapshot",
      undefined,
    );
    expect(invoke).toHaveBeenNthCalledWith(2, "select_optional_chatterbox", {
      profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
    expect(client.observe().state).toBe("confirming");
  });

  it("fails closed when native returns an invalid optional-profile snapshot", async () => {
    const client = new OptionalChatterboxClient(async () => ({
      ...snapshot("installed"),
      profileId: "renderer-provided-profile",
    }));

    await client.refresh();

    expect(client.observe()).toMatchObject({
      state: "failed",
      failure: "optional-profile-operation-failed",
    });
  });

  it("preserves an allowlisted content-free native failure code", async () => {
    const client = new OptionalChatterboxClient(() =>
      Promise.reject("tts-optional-profile-incompatible-host"),
    );

    await client.select();

    expect(client.observe()).toMatchObject({
      state: "failed",
      failure: "tts-optional-profile-incompatible-host",
    });
  });

  it("does not expose an unrecognized native rejection", async () => {
    const client = new OptionalChatterboxClient(() =>
      Promise.reject("private-native-detail"),
    );

    await client.refresh();

    expect(client.observe()).toMatchObject({
      state: "failed",
      failure: "optional-profile-operation-failed",
    });
  });
});
