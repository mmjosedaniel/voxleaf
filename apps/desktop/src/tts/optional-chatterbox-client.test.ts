import { describe, expect, it, vi } from "vitest";

import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
} from "./optional-chatterbox-client";

function deferred() {
  let resolve!: (value: unknown) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<unknown>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
}

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
  it.each([
    ["cancel-first", "failed"],
    ["download-first", "failed"],
    ["cancel-first", "installed"],
  ] as const)(
    "five-pass ADD-01 reads fresh post-commit cleanup state (%s, %s)",
    async (order, state) => {
      const transfer = deferred();
      const cancellation = deferred();
      const oldPoll = deferred();
      const freshPoll = deferred();
      const freshEntered = deferred();
      let reads = 0;
      const invoke = vi.fn((command: string) => {
        if (command === "download_optional_chatterbox") return transfer.promise;
        if (command === "cancel_optional_chatterbox")
          return cancellation.promise;
        if (command === "optional_chatterbox_snapshot") {
          if (++reads === 1) return oldPoll.promise;
          freshEntered.resolve("fresh");
          return freshPoll.promise;
        }
        return Promise.resolve(snapshot("confirming"));
      });
      const client = new OptionalChatterboxClient(invoke);
      await client.select();
      const download = client.download();
      const stale = client.refresh();
      const cancel = client.cancel();
      expect(client.cancelPending).toBe(true);
      await client.cancel();
      expect(
        invoke.mock.calls.filter(
          ([command]) => command === "cancel_optional_chatterbox",
        ),
      ).toHaveLength(1);
      let cancelSettled = false;
      void cancel.then(() => {
        cancelSettled = true;
      });
      const finishDownload = () => {
        if (state === "failed")
          transfer.reject("tts-optional-profile-cleanup-failed");
        else transfer.resolve(snapshot("installed"));
      };
      if (order === "download-first") {
        finishDownload();
        await download;
        expect(reads).toBe(1);
        expect(cancelSettled).toBe(false);
        cancellation.resolve(snapshot("installed"));
      } else {
        cancellation.resolve(snapshot("installed"));
        await vi.waitFor(() =>
          expect(client.observe().state).toBe("installed"),
        );
        expect.soft(client.downloadPending).toBe(true);
        expect.soft(cancelSettled).toBe(false);
        expect(reads).toBe(1);
        finishDownload();
      }
      await expect(download).resolves.toMatchObject({
        failure: "tts-optional-profile-busy",
      });
      const first = await Promise.race([
        freshEntered.promise,
        cancel.then(() => "cancel-settled"),
      ]);
      expect.soft(first).toBe("fresh");
      expect.soft(client.observe().state).toBe("installed");
      const final = {
        ...snapshot(state),
        failure:
          state === "failed" ? "tts-optional-profile-cleanup-failed" : null,
      };
      freshPoll.resolve(final);
      await expect.soft(cancel).resolves.toMatchObject({
        state,
        failure: final.failure ?? undefined,
        installedBytes: final.installedBytes,
      });
      expect(client.cancelPending).toBe(false);
      oldPoll.resolve(snapshot("confirming"));
      await stale;
      expect.soft(client.observe().state).toBe(state);
      expect(
        invoke.mock.calls.filter(
          ([command]) => command === "optional_chatterbox_snapshot",
        ),
      ).toEqual([
        ["optional_chatterbox_snapshot", undefined],
        ["optional_chatterbox_snapshot", undefined],
      ]);
    },
  );

  it.each(["paired-download", "fresh-read"] as const)(
    "five-pass ADD-01 a newer removal supersedes Cancel during %s",
    async (stage) => {
      const transfer = deferred();
      const fresh = deferred();
      const reading = deferred();
      const invoke = vi.fn((command: string) => {
        if (command === "download_optional_chatterbox") return transfer.promise;
        if (command === "cancel_optional_chatterbox")
          return Promise.resolve(snapshot("installed"));
        if (command === "optional_chatterbox_snapshot") {
          reading.resolve(undefined);
          return fresh.promise;
        }
        return Promise.resolve(snapshot("absent"));
      });
      const client = new OptionalChatterboxClient(invoke);
      const download = client.download();
      const cancellation = client.cancel();
      await vi.waitFor(() => expect(client.observe().state).toBe("installed"));
      if (stage === "fresh-read") {
        transfer.reject("tts-optional-profile-cleanup-failed");
        await reading.promise;
      }
      await expect(client.remove()).resolves.toMatchObject({ state: "absent" });
      expect(client.cancelPending).toBe(false);
      transfer.reject("tts-optional-profile-cleanup-failed");
      fresh.resolve({
        ...snapshot("failed"),
        failure: "tts-optional-profile-cleanup-failed",
      });
      await Promise.all([download, cancellation]);
      expect(client.observe().state).toBe("absent");
      expect(
        invoke.mock.calls.filter(
          ([command]) => command === "optional_chatterbox_snapshot",
        ),
      ).toHaveLength(stage === "fresh-read" ? 1 : 0);
    },
  );

  it("RCF-13 explicit cleanup bypasses a coalesced poll and rejects stale retry after replacement", async () => {
    const poll = deferred();
    const retry = deferred();
    const invoke = vi.fn((command: string, args?: Record<string, unknown>) =>
      command === "optional_chatterbox_snapshot"
        ? args?.retryCleanup === true
          ? retry.promise
          : poll.promise
        : Promise.resolve(snapshot("confirming")),
    );
    const client = new OptionalChatterboxClient(invoke);
    const pendingPoll = client.refresh();
    const pendingRetry = client.retryCleanup();
    expect(invoke).toHaveBeenLastCalledWith("optional_chatterbox_snapshot", {
      retryCleanup: true,
    });
    await client.select();
    retry.resolve(snapshot("installed"));
    poll.resolve(snapshot("failed"));
    await Promise.all([pendingPoll, pendingRetry]);
    expect(client.observe().state).toBe("confirming");
  });

  it("RAF-02 stale download settlement cannot clear a replacement attempt", async () => {
    const first = deferred();
    const second = deferred();
    let attempts = 0;
    const client = new OptionalChatterboxClient((command) =>
      command === "download_optional_chatterbox"
        ? ++attempts === 1
          ? first.promise
          : second.promise
        : Promise.resolve(
            snapshot(
              command === "cancel_optional_chatterbox"
                ? "absent"
                : "confirming",
            ),
          ),
    );
    await client.select();
    const old = client.download();
    expect(client.downloadPending).toBe(true);
    await client.cancel();
    expect(client.downloadPending).toBe(false);
    await client.select();
    const current = client.download();
    first.resolve(snapshot("installed"));
    await old;
    expect(client.downloadPending).toBe(true);
    expect(client.observe().state).toBe("confirming");
    second.reject("tts-optional-profile-download-failed");
    await current;
    expect(client.downloadPending).toBe(false);
    expect(client.observe().state).toBe("failed");
  });
  it.each([false, true])(
    "EFC-07 recheck preserves superseding actions (allowed=%s)",
    async (allowed) => {
      const probe = deferred();
      const invoke = vi.fn(async (command: string) =>
        snapshot(
          command === "remove_optional_chatterbox" ? "absent" : "installed",
        ),
      );
      const client = new OptionalChatterboxClient(invoke);
      const recheck = client.recheckCompatibility(async () => {
        await probe.promise;
        return allowed;
      });
      await client.remove();
      probe.resolve(undefined);
      await recheck;
      expect(client.observe().state).toBe("absent");
      expect(invoke.mock.calls.map(([command]) => command)).toEqual([
        "remove_optional_chatterbox",
      ]);
    },
  );

  it("EFC-07 continued incompatibility retains the actionable failure", async () => {
    const invoke = vi.fn(async () => {
      throw "tts-optional-profile-incompatible-host";
    });
    const client = new OptionalChatterboxClient(invoke);
    await client.download();
    const failed = client.observe();
    await client.recheckCompatibility(async () => false);
    expect(client.observe()).toBe(failed);
    expect(invoke).toHaveBeenCalledOnce();
  });
  it.each(["success", "failure"])(
    "five-pass 2.1 / SFA-06 preserves download %s through reselection and an outstanding poll",
    async (outcome) => {
      const download = deferred();
      const poll = deferred();
      let deferPoll = false;
      const invoke = vi.fn((command: string) =>
        command === "download_optional_chatterbox"
          ? download.promise
          : deferPoll
            ? poll.promise
            : Promise.resolve(snapshot("confirming")),
      );
      const client = new OptionalChatterboxClient(invoke);
      await client.select();
      const action = client.download();
      await client.refresh();
      expect(client.observe().state).toBe("confirming");
      expect(await client.select()).toMatchObject({ state: "confirming" });
      expect.soft(client.downloadPending).toBe(true);
      expect
        .soft(
          invoke.mock.calls.filter(
            ([command]) => command === "select_optional_chatterbox",
          ),
        )
        .toHaveLength(1);
      deferPoll = true;
      const stale = client.refresh();
      if (outcome === "success") download.resolve(snapshot("installed"));
      else download.reject("tts-optional-profile-incompatible-host");
      expect.soft(await action).toMatchObject({
        state: outcome === "success" ? "installed" : "failed",
        failure:
          outcome === "success"
            ? undefined
            : "tts-optional-profile-incompatible-host",
      });
      const terminal = client.observe();
      expect(terminal.state).toBe(
        outcome === "success" ? "installed" : "failed",
      );
      if (outcome === "failure")
        expect(terminal.failure).toBe("tts-optional-profile-incompatible-host");
      poll.resolve(snapshot("confirming"));
      await stale;
      expect(client.observe()).toBe(terminal);
    },
  );

  it.each(["cancel", "remove"] as const)(
    "SFA-06 newer %s suppresses obsolete download publication",
    async (action) => {
      const download = deferred();
      const client = new OptionalChatterboxClient((command) =>
        command === "download_optional_chatterbox"
          ? download.promise
          : Promise.resolve(snapshot("absent")),
      );
      const obsolete = client.download();
      await client[action]();
      const current = client.observe();
      download.reject("tts-optional-profile-incompatible-host");
      await expect(obsolete).resolves.toMatchObject({
        failure: "tts-optional-profile-busy",
      });
      expect(client.observe()).toBe(current);
    },
  );

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
