import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { cloneElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_READER_PREFERENCES } from "../reader/reader-preferences";
import { DEFAULT_NARRATION_START_PREFERENCE_V1 } from "../persistence/narration-start-preference";
import { HardwareProfileCompatibilityCoordinator } from "../tts/hardware-profile-compatibility";
import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
} from "../tts/optional-chatterbox-client";
import type {
  ProductNarrationCoordinator,
  ProductNarrationSnapshot,
} from "../tts/product-narration-coordinator";
import {
  ReaderSettingsDialog,
  type ReaderSettingsDialogProps,
} from "./ReaderSettingsDialog";

afterEach(() => cleanup());

function renderSettings(
  overrides: {
    readonly onClose?: () => void;
    readonly loadApplicationVersion?: () => Promise<string>;
    readonly chatterboxState?: "absent" | "failed" | "withheld" | "installed";
    readonly chatterboxActive?: boolean;
    readonly onActivateChatterbox?: () => Promise<boolean>;
    readonly open?: boolean;
    readonly narrationCoordinator?: ProductNarrationCoordinator;
    readonly hardwareCompatibility?: HardwareProfileCompatibilityCoordinator;
  } = {},
) {
  const hardwareCompatibility =
    overrides.hardwareCompatibility ??
    new HardwareProfileCompatibilityCoordinator();
  if (overrides.chatterboxActive === true) {
    const activeSnapshot = Object.freeze({
      ...hardwareCompatibility.observe(),
      activeProfileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
    vi.spyOn(hardwareCompatibility, "observe").mockReturnValue(activeSnapshot);
  }
  const ensureChecked = vi.spyOn(hardwareCompatibility, "ensureChecked");
  const checkCompatibility = vi.spyOn(hardwareCompatibility, "check");
  const onClose = overrides.onClose ?? vi.fn();
  const onReaderPreferenceChange = vi.fn();
  const onSelectProfile = vi.fn(async () => true);
  const onSelectLanguage = vi.fn(async () => true);
  const onResetNarrationSettings = vi.fn(async () => true);
  const onRecoveryEpisodeReset = vi.fn();
  const onActivateChatterbox =
    overrides.onActivateChatterbox ?? vi.fn(async () => true);
  const optionalChatterbox = new OptionalChatterboxClient(async () => ({
    profileId: "chatterbox-multilingual-v3-cuda-bf16-default-v4",
    state: overrides.chatterboxState ?? "withheld",
    downloadBytes: null,
    downloadedBytes: 0,
    installedBytes: null,
    temporaryBytes: null,
    minimumFreeBytes: null,
    coldStartSeconds: null,
    minimumLogicalProcessors: 8,
    minimumTotalRamMiB: 24_576,
    minimumAvailableRamMiB: 4_096,
    measuredPeakDedicatedVramMiB: 3_644,
    minimumTotalDedicatedVramMiB: 5_632,
    minimumAvailableDedicatedVramMiB: 4_668,
    recommendedTotalDedicatedVramMiB: 7_680,
    licenseSummary:
      "Chatterbox, its reviewed model/default conditioning, and PerTh are MIT-licensed.",
    failure:
      overrides.chatterboxState === "failed"
        ? "tts-optional-profile-incompatible-host"
        : null,
  }));
  const refresh = vi.spyOn(optionalChatterbox, "refresh");
  const download = vi.spyOn(optionalChatterbox, "download");
  const cancel = vi.spyOn(optionalChatterbox, "cancel");

  const element = (
    <ReaderSettingsDialog
      open={overrides.open ?? true}
      {...(overrides.narrationCoordinator === undefined
        ? {}
        : { narrationCoordinator: overrides.narrationCoordinator })}
      onClose={onClose}
      readerPreferences={DEFAULT_READER_PREFERENCES}
      readerPreferencesStatus="ready"
      canPersistReaderPreferences
      onReaderPreferenceChange={onReaderPreferenceChange}
      hardwareCompatibility={hardwareCompatibility}
      fallbackNarrationStart={{
        selection: DEFAULT_NARRATION_START_PREFERENCE_V1,
        status: "ready",
        canPersist: true,
        onSelectionChange: vi.fn(),
      }}
      onSelectProfile={onSelectProfile}
      onSelectLanguage={onSelectLanguage}
      onResetNarrationSettings={onResetNarrationSettings}
      onRecoveryEpisodeReset={onRecoveryEpisodeReset}
      optionalChatterbox={optionalChatterbox}
      onActivateChatterbox={onActivateChatterbox}
      onRemoveChatterbox={vi.fn(async () => undefined)}
      loadApplicationVersion={
        overrides.loadApplicationVersion ?? (async () => "0.1.0")
      }
    />
  );
  const rendered = render(element);

  return {
    ...rendered,
    rerenderSettings: (
      props: Partial<
        Omit<ReaderSettingsDialogProps, "narrationCoordinator">
      > & {
        readonly narrationCoordinator?: ProductNarrationCoordinator | undefined;
      },
    ) => rendered.rerender(cloneElement(element, props)),
    refresh,
    download,
    cancel,
    ensureChecked,
    checkCompatibility,
    onClose,
    onReaderPreferenceChange,
    onSelectProfile,
    onSelectLanguage,
    onResetNarrationSettings,
    onRecoveryEpisodeReset,
    onActivateChatterbox,
  };
}

function observableSource<Snapshot>(initial: Snapshot) {
  let current = initial;
  const listeners = new Set<() => void>();
  return {
    listeners,
    observe: vi.fn(() => current),
    subscribe: vi.fn((listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }),
    publish: (snapshot: Snapshot, notify = true) => {
      current = snapshot;
      if (notify) {
        listeners.forEach((listener) => listener());
      }
    },
  };
}

function narrationSource() {
  return {
    ...observableSource<
      Pick<
        ProductNarrationSnapshot,
        | "selection"
        | "state"
        | "startPreferenceStatus"
        | "canPersistStartPreference"
      >
    >({
      selection: { kind: "quick" },
      state: undefined,
      startPreferenceStatus: "ready",
      canPersistStartPreference: true,
    }),
    checkAvailability: vi.fn(),
    setSelection: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    close: vi.fn(),
  };
}

function hardwareSource() {
  return {
    ...observableSource(
      new HardwareProfileCompatibilityCoordinator().observe(),
    ),
    check: vi.fn(),
    ensureChecked: vi.fn(),
    close: vi.fn(),
  };
}

describe("reader Settings dialog", () => {
  it("observes narration replacement and fallback transitions only while Settings is open", async () => {
    const first = narrationSource();
    const second = narrationSource();
    const hardware = hardwareSource();
    const firstCoordinator = first as unknown as ProductNarrationCoordinator;
    const secondCoordinator = second as unknown as ProductNarrationCoordinator;
    const loadApplicationVersion = vi.fn(async () => "0.1.0");
    const subject = renderSettings({
      open: false,
      narrationCoordinator: firstCoordinator,
      hardwareCompatibility:
        hardware as unknown as HardwareProfileCompatibilityCoordinator,
      loadApplicationVersion,
    });
    expect(first.listeners.size).toBe(0);
    expect(hardware.listeners.size).toBe(0);
    expect(subject.refresh).not.toHaveBeenCalled();
    expect(loadApplicationVersion).not.toHaveBeenCalled();
    subject.rerenderSettings({ open: true });
    await screen.findByText("VoxLeaf 0.1.0.");
    expect(first.listeners.size).toBe(1);
    expect(hardware.listeners.size).toBe(3);
    expect(subject.refresh).toHaveBeenCalledOnce();
    act(() =>
      first.publish({
        ...first.observe(),
        selection: { kind: "prepared", targetMs: 120_000 },
        canPersistStartPreference: false,
      }),
    );
    expect(screen.getByLabelText("Prepared audio target")).toHaveValue(
      "120000",
    );
    expect(screen.getByRole("radio", { name: /Quick start/ })).toBeDisabled();
    subject.rerenderSettings({
      open: true,
      narrationCoordinator: secondCoordinator,
    });
    expect(first.listeners.size).toBe(0);
    expect(second.listeners.size).toBe(1);
    act(() =>
      second.publish({
        ...second.observe(),
        selection: { kind: "prepared", targetMs: 60_000 },
      }),
    );
    expect(
      screen.getByRole("radio", { name: /Prepared playback/ }),
    ).toBeChecked();
    act(() =>
      first.publish({
        ...first.observe(),
        selection: { kind: "prepared", targetMs: 300_000 },
      }),
    );
    expect(screen.getByLabelText("Prepared audio target")).toHaveValue("60000");
    subject.rerenderSettings({ open: true, narrationCoordinator: undefined });
    expect(second.listeners.size).toBe(0);
    expect(screen.getByRole("radio", { name: /Quick start/ })).toBeEnabled();
    subject.rerenderSettings({
      open: true,
      narrationCoordinator: secondCoordinator,
    });
    expect(second.listeners.size).toBe(1);
    subject.rerenderSettings({ open: false });
    expect(
      first.listeners.size + second.listeners.size + hardware.listeners.size,
    ).toBe(0);
    subject.rerenderSettings({
      open: true,
      narrationCoordinator: secondCoordinator,
    });
    expect(second.listeners.size).toBe(1);
    expect(hardware.listeners.size).toBe(3);
    expect(loadApplicationVersion).toHaveBeenCalledTimes(2);
    expect(subject.refresh).toHaveBeenCalledTimes(2);
    subject.unmount();
    expect(second.listeners.size + hardware.listeners.size).toBe(0);
    for (const source of [first, second]) {
      for (const action of [
        source.checkAvailability,
        source.start,
        source.stop,
        source.close,
        source.setSelection,
      ]) {
        expect(action).not.toHaveBeenCalled();
      }
    }
    expect(hardware.check).not.toHaveBeenCalled();
    expect(hardware.ensureChecked).not.toHaveBeenCalled();
    expect(hardware.close).not.toHaveBeenCalled();
    expect(subject.onActivateChatterbox).not.toHaveBeenCalled();
    expect(subject.download).not.toHaveBeenCalled();
    expect(subject.cancel).not.toHaveBeenCalled();
  });

  it("updates hardware status and acquisition eligibility and isolates a replacement source", async () => {
    const first = hardwareSource();
    const second = hardwareSource();
    const subject = renderSettings({
      chatterboxState: "absent",
      hardwareCompatibility:
        first as unknown as HardwareProfileCompatibilityCoordinator,
    });
    const review = await screen.findByRole("button", {
      name: "Review Chatterbox download",
    });
    expect(review).toBeDisabled();
    const eligible = {
      ...first.observe(),
      status: "compatible" as const,
      profiles: [
        {
          profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
          role: "standard" as const,
          supportState: "supported" as const,
          state: "compatible" as const,
          reason: undefined,
        },
      ],
    };
    act(() => first.publish(eligible));
    expect(review).toBeEnabled();
    expect(
      screen.getByText("Local narration is compatible on this device."),
    ).toBeInTheDocument();
    subject.rerenderSettings({
      hardwareCompatibility:
        second as unknown as HardwareProfileCompatibilityCoordinator,
    });
    expect(first.listeners.size).toBe(0);
    expect(second.listeners.size).toBe(3);
    expect(review).toBeDisabled();
    act(() => second.publish(eligible));
    expect(review).toBeEnabled();
    act(() => first.publish({ ...eligible, status: "failed", profiles: [] }));
    expect(review).toBeEnabled();
    expect(subject.checkCompatibility).not.toHaveBeenCalled();
    expect(second.check).not.toHaveBeenCalled();
    expect(subject.onActivateChatterbox).not.toHaveBeenCalled();
    expect(subject.download).not.toHaveBeenCalled();
    subject.unmount();
    expect(second.listeners.size).toBe(0);
  });

  it("VAF H1 reconciles only after the optional explicit recheck settles", async () => {
    const hardware = hardwareSource();
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    hardware.check.mockImplementation(() => pending);
    const subject = renderSettings({
      chatterboxState: "failed",
      hardwareCompatibility:
        hardware as unknown as HardwareProfileCompatibilityCoordinator,
    });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Recheck device compatibility",
      }),
    );
    expect(hardware.check).toHaveBeenCalledWith("explicit-recheck");
    expect(subject.onRecoveryEpisodeReset).not.toHaveBeenCalled();
    const fresh = Object.freeze({
      ...hardware.observe(),
      status: "unavailable" as const,
    });
    hardware.publish(fresh, false);
    hardware.observe.mockClear();
    await act(async () => {
      finish();
      await pending;
      expect(hardware.observe).toHaveBeenCalledOnce();
      expect(hardware.observe.mock.results[0]?.value).toBe(fresh);
    });
    expect(subject.onActivateChatterbox).not.toHaveBeenCalled();
    expect(subject.download).not.toHaveBeenCalled();
    expect(subject.onRecoveryEpisodeReset).toHaveBeenCalledOnce();
  });

  it("VAF H7 traps forward and reverse Tab at the last summary while checking", async () => {
    const hardware = hardwareSource();
    hardware.publish({ ...hardware.observe(), status: "checking" });
    renderSettings({
      hardwareCompatibility:
        hardware as unknown as HardwareProfileCompatibilityCoordinator,
    });
    const dialog = screen.getByRole("dialog");
    const close = screen.getByRole("button", { name: "Close Settings" });
    const summary = within(dialog).getByText("Measured profile reasons");
    expect(
      screen.getByRole("button", { name: "Check compatibility again" }),
    ).toBeDisabled();
    summary.focus();
    fireEvent.keyDown(summary, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(summary).toHaveFocus();
  });

  it("renders the frozen section order and keeps playback speed in the compact bar", () => {
    renderSettings();
    const dialog = screen.getByRole("dialog", { name: "Settings" });
    expect(
      within(dialog)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual([
      "Reading",
      "Appearance",
      "Narration",
      "Device compatibility",
      "About",
    ]);
    expect(within(dialog).getByLabelText("Text size")).toHaveValue("standard");
    expect(within(dialog).getByLabelText("Theme")).toHaveValue("system");
    expect(
      within(dialog).queryByLabelText("Playback speed"),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByText(/open VoxLeaf in Windows Installed apps/),
    ).toBeInTheDocument();
  });

  it("shows the installed application version instead of a stale placeholder", async () => {
    renderSettings({ loadApplicationVersion: async () => "0.1.0" });
    expect(await screen.findByText("VoxLeaf 0.1.0.")).toBeInTheDocument();
    expect(screen.queryByText(/0\.0\.0/)).not.toBeInTheDocument();
  });

  it("focuses Close, closes with Escape, and performs no lifecycle action on open", () => {
    const subject = renderSettings();
    const dialog = screen.getByRole("dialog", { name: "Settings" });
    const close = screen.getByRole("button", { name: "Close Settings" });
    expect(close).toHaveFocus();

    expect(subject.ensureChecked).not.toHaveBeenCalled();
    expect(subject.onSelectProfile).not.toHaveBeenCalled();
    expect(subject.onSelectLanguage).not.toHaveBeenCalled();
    expect(subject.onResetNarrationSettings).not.toHaveBeenCalled();
    expect(subject.onRecoveryEpisodeReset).not.toHaveBeenCalled();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(subject.onClose).toHaveBeenCalledTimes(1);
  });

  it("routes a changed reading control through the existing preference boundary", () => {
    const subject = renderSettings();
    fireEvent.change(screen.getByLabelText("Content width"), {
      target: { value: "wide" },
    });
    expect(subject.onReaderPreferenceChange).toHaveBeenCalledWith(
      "contentWidth",
      "wide",
    );
  });

  it("clears an existing recovery episode after Chatterbox activates", async () => {
    const subject = renderSettings({ chatterboxState: "installed" });

    fireEvent.click(
      await screen.findByRole("button", { name: "Activate Chatterbox" }),
    );

    await waitFor(() =>
      expect(subject.onActivateChatterbox).toHaveBeenCalledTimes(1),
    );
    expect(subject.onRecoveryEpisodeReset).toHaveBeenCalledTimes(1);
  });

  it("derives the installed Chatterbox active state from compatibility selection", async () => {
    renderSettings({ chatterboxState: "installed", chatterboxActive: true });

    expect(
      await screen.findByText(
        "The verified Chatterbox package is installed and selected.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Activate Chatterbox" }),
    ).not.toBeInTheDocument();
  });

  it("preserves recovery when Chatterbox activation is rejected", async () => {
    const subject = renderSettings({
      chatterboxState: "installed",
      onActivateChatterbox: vi.fn(async () => false),
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "Activate Chatterbox" }),
    );

    await waitFor(() =>
      expect(subject.onActivateChatterbox).toHaveBeenCalledTimes(1),
    );
    expect(subject.onRecoveryEpisodeReset).not.toHaveBeenCalled();
  });

  it("rechecks fresh hardware facts without activating Chatterbox", async () => {
    const subject = renderSettings({ chatterboxState: "failed" });

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Recheck device compatibility",
      }),
    );

    await waitFor(() =>
      expect(subject.checkCompatibility).toHaveBeenCalledWith(
        "explicit-recheck",
      ),
    );
    expect(subject.onActivateChatterbox).not.toHaveBeenCalled();
  });
});
