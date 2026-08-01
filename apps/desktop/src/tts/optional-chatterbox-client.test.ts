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
    licenseSummary:
      "Chatterbox, its reviewed model/default conditioning, and PerTh are MIT-licensed.",
    failure: null,
  };
}

describe("optional Chatterbox native client", () => {
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
});
