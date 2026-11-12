import { decodeHostProfileCompatibilityReportV1 } from "@voxleaf/shared";
import { describe, expect, it, vi } from "vitest";

import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
  type OptionalChatterboxState,
} from "../tts/optional-chatterbox-client";
import { createNarrationSettingsActions } from "./narration-settings-actions";
import { HardwareProfileCompatibilityCoordinator } from "../tts/hardware-profile-compatibility";
import {
  EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "../tts/hardware-profile-registry";

function supportedDevelopmentHost() {
  const known = (value: number) => ({ status: "known", value });
  const unknown = { status: "unknown" };
  const cpu = {
    availability: "available",
    deviceClass: "cpu",
    dedicatedMemoryMiB: known(0),
    availableDedicatedMemoryMiB: known(0),
    precisions: {
      float32: "available",
      float16: "unknown",
      bfloat16: "unknown",
      int8: "unknown",
    },
  };
  const unavailable = {
    availability: "unavailable",
    deviceClass: "unknown",
    dedicatedMemoryMiB: unknown,
    availableDedicatedMemoryMiB: unknown,
    precisions: {
      float32: "unavailable",
      float16: "unavailable",
      bfloat16: "unavailable",
      int8: "unavailable",
    },
  };
  return decodeHostProfileCompatibilityReportV1({
    schemaVersion: 1,
    probeStatus: "complete",
    platform: { operatingSystem: "windows", architecture: "x86_64" },
    processor: { logicalProcessorCount: known(12) },
    memory: {
      totalPhysicalMiB: known(24_576),
      availablePhysicalMiB: known(16_384),
    },
    storage: { applicationVolumeAvailableMiB: known(40_960) },
    cudaComputeCapability: { status: "known", major: 12, minor: 0 },
    providers: {
      cpu,
      cuda: {
        availability: "available",
        deviceClass: "discrete-gpu",
        dedicatedMemoryMiB: known(12_288),
        availableDedicatedMemoryMiB: known(9_216),
        precisions: {
          float32: "available",
          float16: "available",
          bfloat16: "available",
          int8: "unknown",
        },
      },
      directml: unavailable,
      rocm: unavailable,
      metal: unavailable,
    },
  });
}

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
    stop: vi.fn<() => Promise<"contained" | "failed">>(() => {
      events.push("stop");
      return Promise.resolve("contained");
    }),
    legacyStop: call("legacy-stop", undefined),
    refresh: call("refresh", undefined),
    start: call("start", true),
    playback: call("playback", true),
    profile: call("profile", true),
    language: call("language", true),
    hardwareCheck: call(
      "hardware-check",
      new HardwareProfileCompatibilityCoordinator().observe(),
    ),
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
    check: steps.hardwareCheck,
    resetLanguage: steps.languageReset,
  };
  const optional = {
    select: steps.optional,
    remove: steps.remove,
    observe: vi.fn(() => snapshot),
    downloadPending: false,
  };
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
  it.each(["ordinary", "held", "newer-selection"] as const)(
    "five-pass 3.3 Reset settles the saved English profile (%s)",
    async (scenario) => {
      const holdProbe = scenario !== "ordinary";
      const newerSelection = scenario === "newer-selection";
      const f = fixture(true);
      const report = supportedDevelopmentHost();
      const detect = vi.fn(async () => report);
      let profileId: string = EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID;
      let language: "en" | "es" = "es";
      const writeProfile = vi.fn(async (next: string) => {
        profileId = next;
        return { status: "saved" as const };
      });
      const hardware = new HardwareProfileCompatibilityCoordinator({
        detector: { detect },
        developmentGate: { exactDemoAvailability: async () => "available" },
        preferenceRepository: {
          read: async () => ({ status: "ready", profileId }),
          write: writeProfile,
        },
        languagePreferenceRepository: {
          read: async () => ({ status: "ready", language }),
          write: async (next) => {
            language = next;
            return { status: "saved" };
          },
          reset: async () => {
            language = "en";
            return { status: "saved" };
          },
        },
      });
      const release = vi.fn();
      const refresh = vi.fn(async () => hardware.observe());
      const coordinator = {
        ...f.coordinator,
        beginConfigurationChange: () => release,
        refreshSelectedProfile: async () => {
          await refresh();
        },
      };
      const blocked = deferred<typeof report>();
      const entered = deferred<"probe">();
      try {
        await hardware.ensureChecked();
        expect(hardware.observe()).toMatchObject({
          language: "es",
          activeProfileId: PIPER_CPU_FALLBACK_PROFILE_ID,
        });
        if (holdProbe) {
          detect.mockImplementationOnce(() => {
            entered.resolve("probe");
            return blocked.promise;
          });
        }
        const reset = f.actions.reset({ ...f.reset, hardware, coordinator });
        if (holdProbe) {
          try {
            expect
              .soft(
                await Promise.race([
                  entered.promise,
                  reset.then(() => "settled"),
                ]),
              )
              .toBe("probe");
            expect.soft(refresh).not.toHaveBeenCalled();
            expect.soft(release).not.toHaveBeenCalled();
            if (newerSelection) {
              await expect(
                hardware.selectProfile(PIPER_ENGLISH_CPU_PROFILE_ID),
              ).resolves.toBe(true);
            }
          } finally {
            blocked.resolve(report);
          }
        }
        await expect(reset).resolves.toBe(true);
        const selected = newerSelection
          ? PIPER_ENGLISH_CPU_PROFILE_ID
          : EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID;
        expect.soft(await refresh.mock.results[0]?.value).toMatchObject({
          language: "en",
          activeProfileId: selected,
          selectionSource: "preference",
        });
        expect(refresh).toHaveBeenCalledOnce();
        expect(release).toHaveBeenCalledOnce();
        expect(writeProfile).toHaveBeenCalledTimes(newerSelection ? 1 : 0);
        expect(profileId).toBe(selected);
        await expect(
          hardware.isProfileStartAllowed(
            EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
            "before-profile-start",
            "en",
          ),
        ).resolves.toBe(!newerSelection);
        await expect(
          hardware.isProfileStartAllowed(
            PIPER_ENGLISH_CPU_PROFILE_ID,
            "before-profile-start",
            "en",
          ),
        ).resolves.toBe(newerSelection);
      } finally {
        hardware.close();
      }
    },
  );
  it.each(["future", "unavailable", "admission", "changed-admission"] as const)(
    "NSL-01 rejects known %s restriction before teardown",
    async (restriction) => {
      const f = fixture();
      let allowed = restriction !== "admission";
      const hardware = {
        ...f.hardware,
        observe: () => ({
          ...new HardwareProfileCompatibilityCoordinator().observe(),
          canPersistSelection: restriction !== "future",
          preferenceStatus:
            restriction === "unavailable"
              ? ("unavailable" as const)
              : ("missing" as const),
          profiles: [
            {
              profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
              state: allowed
                ? ("compatible" as const)
                : ("incompatible" as const),
              supportState: "supported" as const,
              role: "standard" as const,
              reason: undefined,
            },
          ],
        }),
      };
      if (restriction === "changed-admission")
        f.steps.optional.mockImplementation(async () => {
          allowed = false;
          return {
            ...new OptionalChatterboxClient().observe(),
            state: "installed",
          };
        });
      expect(
        await f.actions.selectProfile(
          CHATTERBOX_OPTIONAL_PROFILE_ID,
          hardware,
          f.coordinator,
          f.optional,
        ),
      ).toBe(false);
      expect(f.steps.stop).not.toHaveBeenCalled();
      expect(f.steps.profile).not.toHaveBeenCalled();
      expect(f.steps.optional).toHaveBeenCalledTimes(
        restriction === "changed-admission" ? 1 : 0,
      );
    },
  );

  it("NSL-01 allows a compatible different profile without requiring it to be active", async () => {
    const f = fixture();
    const hardware = {
      ...f.hardware,
      observe: () => ({
        ...new HardwareProfileCompatibilityCoordinator().observe(),
        activeProfileId: "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1",
        profiles: [
          {
            profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
            state: "compatible" as const,
            supportState: "supported" as const,
            role: "standard" as const,
            reason: undefined,
          },
        ],
      }),
    };
    expect(
      await f.actions.selectProfile(
        CHATTERBOX_OPTIONAL_PROFILE_ID,
        hardware,
        f.coordinator,
        f.optional,
      ),
    ).toBe(true);
    expect(f.events).toEqual(["optional", "stop", "profile", "refresh"]);
  });

  it.each(["optional", "stop", "commit", "refresh"] as const)(
    "SAF-09 ignores an invalidated selection after %s",
    async (stage) => {
      const f = fixture();
      let current = true;
      const barrier = deferred<never>();
      if (stage === "optional")
        f.steps.optional.mockReturnValue(barrier.promise);
      if (stage === "stop") f.steps.stop.mockReturnValue(barrier.promise);
      if (stage === "commit") f.steps.profile.mockReturnValue(barrier.promise);
      if (stage === "refresh") f.steps.refresh.mockReturnValue(barrier.promise);
      const pending = f.actions.selectProfile(
        CHATTERBOX_OPTIONAL_PROFILE_ID,
        f.hardware,
        f.coordinator,
        f.optional,
        () => current,
      );
      if (stage !== "optional")
        await vi.waitFor(() => expect(f.steps.stop).toHaveBeenCalledOnce());
      if (stage === "commit")
        await vi.waitFor(() => expect(f.steps.profile).toHaveBeenCalledOnce());
      if (stage === "refresh")
        await vi.waitFor(() => expect(f.steps.refresh).toHaveBeenCalledOnce());
      current = false;
      barrier.resolve(
        (stage === "optional"
          ? { ...new OptionalChatterboxClient().observe(), state: "installed" }
          : stage === "stop"
            ? "contained"
            : stage === "commit"
              ? true
              : undefined) as never,
      );
      await expect(pending).resolves.toBe(false);
      if (stage === "optional") expect(f.steps.stop).not.toHaveBeenCalled();
      if (stage === "optional" || stage === "stop")
        expect(f.steps.profile).not.toHaveBeenCalled();
      if (stage === "refresh") expect(f.steps.refresh).toHaveBeenCalledOnce();
      else expect(f.steps.refresh).not.toHaveBeenCalled();
    },
  );

  it.each(["profile", "language", "remove", "reset"] as const)(
    "%s awaits stop and propagates rejection",
    async (kind) => {
      const f = fixture();
      const stop = deferred<"contained">();
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
    "RCF-05 rejects missing containment result %s",
    async (value) => {
      const f = fixture();
      f.steps.stop.mockReturnValue(Promise.resolve(value) as never);
      await expect(f.run.language()).rejects.toThrow(
        "Narration cleanup did not complete.",
      );
      expect(f.events).toEqual([]);
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
    expect(f.events).toEqual([
      "legacy-stop",
      "language",
      "hardware-check",
      "refresh",
      "profile",
    ]);
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
      const stop = deferred<"contained">();
      const selected = deferred<boolean>();
      const refresh = deferred<undefined>();
      const snapshot = new HardwareProfileCompatibilityCoordinator().observe();
      const hardwareCheck = deferred<typeof snapshot>();
      f.steps.stop.mockReturnValueOnce(stop.promise);
      f.steps[kind]
        .mockReturnValueOnce(selected.promise)
        .mockResolvedValueOnce(false);
      f.steps.refresh.mockReturnValue(refresh.promise);
      f.steps.hardwareCheck.mockReturnValue(hardwareCheck.promise);
      const pending = f.run[kind]();
      expect(f.steps[kind]).not.toHaveBeenCalled();
      stop.resolve("contained");
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
      if (kind === "language") {
        await vi.waitFor(() =>
          expect(f.steps.hardwareCheck).toHaveBeenCalledExactlyOnceWith(
            "explicit-recheck",
          ),
        );
        expect(f.steps.refresh).not.toHaveBeenCalled();
        expect(settled).toBe(false);
        hardwareCheck.resolve(snapshot);
      }
      await vi.waitFor(() => expect(f.steps.refresh).toHaveBeenCalledOnce());
      expect(settled).toBe(false);
      refresh.resolve(undefined);
      await expect(pending).resolves.toBe(true);
      await expect(f.run[kind]()).resolves.toBe(false);
      expect(f.steps.refresh).toHaveBeenCalledOnce();
      expect(f.steps.hardwareCheck).toHaveBeenCalledTimes(
        kind === "language" ? 1 : 0,
      );
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

  it.each([
    ["installed", true],
    ["confirming", false],
    ["downloading", false],
    ["verifying", false],
    ["removing", false],
  ] as const)(
    "five-pass 2.2 rejects busy removal before configuration or Stop (%s, pending=%s)",
    async (state, downloadPending) => {
      const f = fixture();
      const beginConfigurationChange = vi.fn(() => vi.fn());
      f.optional.downloadPending = downloadPending;
      f.optional.observe.mockReturnValue({
        ...new OptionalChatterboxClient().observe(),
        state,
      });
      await expect
        .soft(
          f.actions.removeChatterbox(
            { ...f.coordinator, beginConfigurationChange },
            f.optional,
          ),
        )
        .rejects.toThrow("Chatterbox is busy.");
      expect.soft(beginConfigurationChange).not.toHaveBeenCalled();
      expect.soft(f.steps.stop).not.toHaveBeenCalled();
      expect.soft(f.steps.remove).not.toHaveBeenCalled();
      expect(f.steps.refresh).not.toHaveBeenCalled();
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
        ...(language ? ["hardware-check", "refresh"] : []),
      ]);
      expect(f.steps.hardwareCheck).toHaveBeenCalledTimes(language ? 1 : 0);
      expect(f.steps.start.mock.contexts).toEqual([f.coordinator]);
      expect(f.steps.playback.mock.contexts).toEqual([f.coordinator]);
    },
  );

  it.each([
    "languageReset",
    "start",
    "playback",
    "hardwareCheck",
    "refresh",
  ] as const)(
    "reset propagates %s rejection at its original boundary",
    async (stage) => {
      const f = fixture();
      const error = new Error(stage);
      f.steps[stage].mockRejectedValue(error);
      const release = vi.fn();
      await expect(
        f.actions.reset({
          ...f.reset,
          coordinator: {
            ...f.coordinator,
            beginConfigurationChange: () => release,
          },
        }),
      ).rejects.toBe(error);
      const expected = ["stop"];
      if (stage !== "languageReset") expected.push("language-reset");
      if (
        stage === "playback" ||
        stage === "hardwareCheck" ||
        stage === "refresh"
      )
        expected.push("start");
      if (stage === "hardwareCheck" || stage === "refresh")
        expected.push("playback", "presentation");
      if (stage === "refresh") expected.push("hardware-check");
      expect(f.events).toEqual(expected);
      expect(release).toHaveBeenCalledOnce();
      if (stage === "hardwareCheck")
        expect(f.steps.hardwareCheck).toHaveBeenCalledExactlyOnceWith(
          "explicit-recheck",
        );
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
      "hardware-check",
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
        "hardware-check",
      ]);
    },
  );
});
