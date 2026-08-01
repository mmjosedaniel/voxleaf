import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_READER_PREFERENCES } from "../reader/reader-preferences";
import { DEFAULT_NARRATION_START_PREFERENCE_V1 } from "../persistence/narration-start-preference";
import { HardwareProfileCompatibilityCoordinator } from "../tts/hardware-profile-compatibility";
import { OptionalChatterboxClient } from "../tts/optional-chatterbox-client";
import { ReaderSettingsDialog } from "./ReaderSettingsDialog";

afterEach(() => cleanup());

function renderSettings(overrides: { readonly onClose?: () => void } = {}) {
  const hardwareCompatibility = new HardwareProfileCompatibilityCoordinator();
  const ensureChecked = vi.spyOn(hardwareCompatibility, "ensureChecked");
  const onClose = overrides.onClose ?? vi.fn();
  const onReaderPreferenceChange = vi.fn();
  const onSelectProfile = vi.fn(async () => true);
  const onSelectLanguage = vi.fn(async () => true);
  const onResetNarrationSettings = vi.fn(async () => true);
  const onRecoveryEpisodeReset = vi.fn();
  const optionalChatterbox = new OptionalChatterboxClient(async () => ({
    profileId: "chatterbox-multilingual-v3-cuda-bf16-default-v4",
    state: "withheld",
    downloadBytes: null,
    downloadedBytes: 0,
    installedBytes: null,
    temporaryBytes: null,
    minimumFreeBytes: null,
    coldStartSeconds: null,
    licenseSummary:
      "Chatterbox, its reviewed model/default conditioning, and PerTh are MIT-licensed.",
    failure: null,
  }));

  const rendered = render(
    <ReaderSettingsDialog
      open
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
      onActivateChatterbox={vi.fn(async () => true)}
      onRemoveChatterbox={vi.fn(async () => undefined)}
    />,
  );

  return {
    ...rendered,
    ensureChecked,
    onClose,
    onReaderPreferenceChange,
    onSelectProfile,
    onSelectLanguage,
    onResetNarrationSettings,
    onRecoveryEpisodeReset,
  };
}

describe("reader Settings dialog", () => {
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
  });

  it("contains focus, closes with Escape, and performs no lifecycle action on open", () => {
    const subject = renderSettings();
    const dialog = screen.getByRole("dialog", { name: "Settings" });
    const close = screen.getByRole("button", { name: "Close Settings" });
    expect(close).toHaveFocus();

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const last = focusable.item(focusable.length - 1);
    last.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
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
});
