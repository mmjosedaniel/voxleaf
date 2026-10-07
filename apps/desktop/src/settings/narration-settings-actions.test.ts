import { describe, expect, it, vi } from "vitest";

import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
  type OptionalChatterboxState,
} from "../tts/optional-chatterbox-client";
import { createNarrationSettingsActions } from "./narration-settings-actions";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function fixture(development = false) {
  const events: string[] = [];
  const call = <T>(name: string, value: T) =>
    vi.fn(() => {
      events.push(name);
      return Promise.resolve(value);
    });
  const snapshot = new OptionalChatterboxClient().observe();
  const steps = {
    stop: vi.fn<() => Promise<void> | void | null>(() => {
      events.push("stop");
      return Promise.resolve();
    }),
    legacyStop: call("legacy-stop", undefined),
    refresh: call("refresh", undefined),
    start: call("start", true),
    playback: call("playback", true),
    profile: call("profile", true),
    language: call("language", true),
    languageReset: call("language-reset", true),
    optional: call("optional", {
      ...snapshot,
      state: "installed" as OptionalChatterboxState,
    }),
    remove: call("remove", snapshot),
    repositoryStart: call("repository-start", { status: "saved" as const }),
    repositoryPlayback: call("repository-playback", {
      status: "saved" as const,
    }),
    notify: vi.fn(() => events.push("presentation")),
  };
  const coordinator = {
    stop: steps.legacyStop,
    stopForConfigurationChange: steps.stop,
    refreshSelectedProfile: steps.refresh,
    resetStartPreference: steps.start,
    resetPlaybackPreference: steps.playback,
  };
  const hardware = {
    selectProfile: steps.profile,
    selectLanguage: steps.language,
    resetLanguage: steps.languageReset,
  };
  const optional = { select: steps.optional, remove: steps.remove };
  const reset = {
    hardware,
    coordinator,
    startPreference: { reset: steps.repositoryStart },
    playbackPreference: { reset: steps.repositoryPlayback },
    onStartPreferenceReset: steps.notify,
  };
  const actions = createNarrationSettingsActions(development);
  const run = {
    profile: () =>
      actions.selectProfile("ordinary", hardware, coordinator, optional),
    language: () => actions.selectLanguage("es", hardware, coordinator),
    remove: () => actions.removeChatterbox(coordinator, optional),
    reset: () => actions.reset(reset),
    activation: () =>
      actions.activateChatterbox((id) =>
        actions.selectProfile(id, hardware, coordinator, optional),
      ),
  };
  return {
    actions,
    events,
    steps,
    coordinator,
    hardware,
    optional,
    reset,
    run,
  };
}

describe("narration settings actions", () => {
  it.each(["profile", "language", "remove", "reset"] as const)(
    "%s awaits stop and propagates rejection",
    async (kind) => {
      const f = fixture();
      const stop = deferred<void>();
      f.steps.stop.mockReturnValue(stop.promise);
      const pending = f.run[kind]();
      expect(f.events).toEqual([]);
      expect(f.steps.stop.mock.contexts).toEqual([f.coordinator]);
      expect(f.steps.legacyStop).not.toHaveBeenCalled();
      const error = new Error("stop rejected");
      const rejected = expect(pending).rejects.toBe(error);
      stop.reject(error);
      await rejected;
      expect(f.events).toEqual([]);
    },
  );

  it.each([undefined, null])(
    "retains nullish stop fallback %s",
    async (value) => {
      const f = fixture();
      f.steps.stop.mockReturnValue(value);
      await f.run.language();
      expect(f.events).toEqual(["legacy-stop", "language", "refresh"]);
      expect(f.steps.legacyStop.mock.contexts).toEqual([f.coordinator]);
    },
  );

  it("supports legacy and absent coordinators", async () => {
    const f = fixture();
    const legacy = {
      stop: f.steps.legacyStop,
      refreshSelectedProfile: f.steps.refresh,
      resetStartPreference: f.steps.start,
      resetPlaybackPreference: f.steps.playback,
    };
    await f.actions.selectLanguage("es", f.hardware, legacy);
    await f.actions.selectProfile(
      "ordinary",
      f.hardware,
      undefined,
      f.optional,
    );
    expect(f.events).toEqual(["legacy-stop", "language", "refresh", "profile"]);
  });

  it.each([
    "absent",
    "failed",
    "withheld",
    "confirming",
    "downloading",
    "verifying",
    "removing",
    "installed",
  ] as const)("packaged activation awaits optional state %s", async (state) => {
    const f = fixture();
    const selection = deferred<Awaited<ReturnType<typeof f.steps.optional>>>();
    f.steps.optional.mockReturnValue(selection.promise);
    const pending = f.run.activation();
    expect(f.steps.optional.mock.contexts).toEqual([f.optional]);
    expect(f.events).toEqual([]);
    selection.resolve({ ...new OptionalChatterboxClient().observe(), state });
    await expect(pending).resolves.toBe(state === "installed");
    expect(f.events).toEqual(
      state === "installed" ? ["stop", "profile", "refresh"] : [],
    );
  });

  it.each([false, true])("activation preserves DEV=%s", async (development) => {
    const f = fixture(development);
    await expect(f.run.activation()).resolves.toBe(true);
    expect(f.steps.profile).toHaveBeenCalledWith(
      CHATTERBOX_OPTIONAL_PROFILE_ID,
    );
    expect(f.events).toEqual([
      ...(development ? [] : ["optional"]),
      "stop",
      "profile",
      "refresh",
    ]);
    expect(f.steps.optional).toHaveBeenCalledTimes(development ? 0 : 1);
  });

  it.each(["profile", "language"] as const)(
    "%s awaits stop, selection and refresh; false does not refresh",
    async (kind) => {
      const f = fixture();
      const stop = deferred<void>();
      const selected = deferred<boolean>();
      const refresh = deferred<undefined>();
      f.steps.stop.mockReturnValueOnce(stop.promise);
      f.steps[kind]
        .mockReturnValueOnce(selected.promise)
        .mockResolvedValueOnce(false);
      f.steps.refresh.mockReturnValue(refresh.promise);
      const pending = f.run[kind]();
      expect(f.steps[kind]).not.toHaveBeenCalled();
      stop.resolve();
      await vi.waitFor(() => expect(f.steps[kind]).toHaveBeenCalledOnce());
      expect(f.steps[kind].mock.contexts).toEqual([f.hardware]);
      expect(f.steps[kind]).toHaveBeenCalledWith(
        kind === "profile" ? "ordinary" : "es",
      );
      let settled = false;
      void pending.then(() => {
        settled = true;
      });
      selected.resolve(true);
      await vi.waitFor(() => expect(f.steps.refresh).toHaveBeenCalledOnce());
      expect(settled).toBe(false);
      refresh.resolve(undefined);
      await expect(pending).resolves.toBe(true);
      await expect(f.run[kind]()).resolves.toBe(false);
      expect(f.steps.refresh).toHaveBeenCalledOnce();
      expect(f.steps.optional).not.toHaveBeenCalled();
    },
  );

  it.each(["optional", "profile", "language", "refresh", "remove"] as const)(
    "propagates %s rejection without subsequent work",
    async (stage) => {
      const f = fixture();
      const error = new Error(stage);
      f.steps[stage].mockRejectedValue(error);
      const kind =
        stage === "optional"
          ? "activation"
          : stage === "refresh"
            ? "profile"
            : stage;
      await expect(f.run[kind]()).rejects.toBe(error);
      expect(f.events).toEqual(
        stage === "optional"
          ? []
          : stage === "refresh"
            ? ["stop", "profile"]
            : ["stop"],
      );
    },
  );

  it.each(["absent", "failed"] as const)(
    "refreshes after any fulfilled removal (%s)",
    async (state) => {
      const f = fixture();
      const removed = deferred<Awaited<ReturnType<typeof f.steps.remove>>>();
      f.steps.remove.mockReturnValue(removed.promise);
      const pending = f.run.remove();
      await vi.waitFor(() => expect(f.steps.remove).toHaveBeenCalledOnce());
      expect(f.steps.refresh).not.toHaveBeenCalled();
      expect(f.steps.remove.mock.contexts).toEqual([f.optional]);
      removed.resolve({ ...new OptionalChatterboxClient().observe(), state });
      await expect(pending).resolves.toBeUndefined();
      expect(f.events).toEqual(["stop", "refresh"]);
      expect(f.steps.refresh.mock.contexts).toEqual([f.coordinator]);
    },
  );

  it.each([true, false])(
    "reset awaits playback before presentation, language=%s",
    async (language) => {
      const f = fixture();
      const playback = deferred<boolean>();
      f.steps.languageReset.mockResolvedValue(language);
      f.steps.playback.mockReturnValue(playback.promise);
      const pending = f.run.reset();
      await vi.waitFor(() => expect(f.steps.playback).toHaveBeenCalledOnce());
      expect(f.steps.notify).not.toHaveBeenCalled();
      playback.resolve(false);
      await expect(pending).resolves.toBe(false);
      expect(f.events).toEqual([
        "stop",
        "start",
        "presentation",
        ...(language ? ["refresh"] : []),
      ]);
      expect(f.steps.start.mock.contexts).toEqual([f.coordinator]);
      expect(f.steps.playback.mock.contexts).toEqual([f.coordinator]);
    },
  );

  it.each(["languageReset", "start", "playback", "refresh"] as const)(
    "reset propagates %s rejection at its original boundary",
    async (stage) => {
      const f = fixture();
      const error = new Error(stage);
      f.steps[stage].mockRejectedValue(error);
      await expect(f.run.reset()).rejects.toBe(error);
      const expected = ["stop"];
      if (stage !== "languageReset") expected.push("language-reset");
      if (stage === "playback" || stage === "refresh") expected.push("start");
      if (stage === "refresh") expected.push("playback", "presentation");
      expect(f.events).toEqual(expected);
    },
  );

  it.each([true, false])("reset aggregates start=%s", async (start) => {
    const f = fixture();
    f.steps.start.mockResolvedValue(start);
    await expect(f.run.reset()).resolves.toBe(start);
    expect(f.events).toEqual([
      "stop",
      "language-reset",
      "playback",
      ...(start ? ["presentation"] : []),
      "refresh",
    ]);
    expect(f.steps.repositoryStart).not.toHaveBeenCalled();
    expect(f.steps.repositoryPlayback).not.toHaveBeenCalled();
  });

  it.each([
    "saved",
    "unavailable",
    "invalid-selection",
    "over-limit",
    "unsupported-version",
  ] as const)(
    "absent coordinator accepts only repository saved (%s)",
    async (status) => {
      const f = fixture();
      const startPreference = { reset: vi.fn(async () => ({ status })) };
      const playbackPreference = { reset: vi.fn(async () => ({ status })) };
      await expect(
        f.actions.reset({
          ...f.reset,
          coordinator: undefined,
          startPreference,
          playbackPreference,
        }),
      ).resolves.toBe(status === "saved");
      expect(startPreference.reset.mock.contexts).toEqual([startPreference]);
      expect(playbackPreference.reset.mock.contexts).toEqual([
        playbackPreference,
      ]);
      expect(f.events).toEqual([
        "language-reset",
        ...(status === "saved" ? ["presentation"] : []),
      ]);
    },
  );
});
