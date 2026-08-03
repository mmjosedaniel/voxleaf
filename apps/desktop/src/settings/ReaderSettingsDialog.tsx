import { getVersion } from "@tauri-apps/api/app";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactElement,
} from "react";

import {
  ReaderAppearanceSettingsControls,
  ReaderReadingSettingsControls,
} from "../reader/ReaderPreferences";
import type {
  ReaderPreferenceName,
  ReaderPreferencesV1,
} from "../reader/reader-preferences";
import type { AdaptiveBufferStartMode } from "../tts/adaptive-buffer-scheduler";
import { HardwareCompatibilityControls } from "../tts/HardwareCompatibilityControls";
import { OptionalChatterboxControls } from "../tts/OptionalChatterboxControls";
import type { HardwareProfileCompatibilityCoordinator } from "../tts/hardware-profile-compatibility";
import type { NarrationLanguageV1 } from "../tts/narration-language";
import { NarrationStartPreferenceControls } from "../tts/NarrationStartPreferenceControls";
import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
} from "../tts/optional-chatterbox-client";
import type { ProductNarrationCoordinator } from "../tts/product-narration-coordinator";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type PreferenceStatus =
  | "loading"
  | "malformed"
  | "missing"
  | "over-limit"
  | "ready"
  | "unavailable"
  | "unsupported-version";

interface FallbackNarrationStartState {
  readonly selection: AdaptiveBufferStartMode;
  readonly status: PreferenceStatus;
  readonly canPersist: boolean;
  readonly onSelectionChange: (selection: AdaptiveBufferStartMode) => void;
}

export interface ReaderSettingsDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly readerPreferences: ReaderPreferencesV1;
  readonly readerPreferencesStatus: PreferenceStatus;
  readonly canPersistReaderPreferences: boolean;
  readonly onReaderPreferenceChange: (
    preference: ReaderPreferenceName,
    value: string,
  ) => void;
  readonly hardwareCompatibility: HardwareProfileCompatibilityCoordinator;
  readonly narrationCoordinator?: ProductNarrationCoordinator;
  readonly fallbackNarrationStart: FallbackNarrationStartState;
  readonly onSelectProfile: (profileId: string) => Promise<boolean>;
  readonly onSelectLanguage: (
    language: NarrationLanguageV1,
  ) => Promise<boolean>;
  readonly onResetNarrationSettings: () => Promise<boolean>;
  readonly onRecoveryEpisodeReset: () => void;
  readonly optionalChatterbox: OptionalChatterboxClient;
  readonly onActivateChatterbox: () => Promise<boolean>;
  readonly onRemoveChatterbox: () => Promise<void>;
  readonly loadApplicationVersion?: () => Promise<string>;
}

function CoordinatorNarrationStartSettings({
  coordinator,
  disabled = false,
}: Readonly<{
  coordinator: ProductNarrationCoordinator;
  disabled?: boolean;
}>): ReactElement {
  const snapshot = useSyncExternalStore(
    (listener) => coordinator.subscribe(listener),
    () => coordinator.observe(),
    () => coordinator.observe(),
  );
  const active =
    snapshot.state !== undefined && snapshot.state.phase !== "stopped";
  return (
    <NarrationStartPreferenceControls
      selection={snapshot.selection}
      active={active}
      disabled={
        disabled ||
        snapshot.startPreferenceStatus === "loading" ||
        !snapshot.canPersistStartPreference
      }
      onSelectionChange={(selection) =>
        void coordinator.setSelection(selection)
      }
    />
  );
}

function NarrationStartSettings({
  coordinator,
  fallback,
  disabled = false,
}: Readonly<{
  coordinator?: ProductNarrationCoordinator;
  fallback: FallbackNarrationStartState;
  disabled?: boolean;
}>): ReactElement {
  if (coordinator !== undefined) {
    return (
      <CoordinatorNarrationStartSettings
        coordinator={coordinator}
        disabled={disabled}
      />
    );
  }
  return (
    <NarrationStartPreferenceControls
      selection={fallback.selection}
      disabled={
        disabled || fallback.status === "loading" || !fallback.canPersist
      }
      onSelectionChange={fallback.onSelectionChange}
    />
  );
}

function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hidden && element.getAttribute("aria-hidden") !== "true",
  );
}

function OptionalChatterboxSettings({
  client,
  hardwareCompatibility,
  onActivate,
  onRemove,
  disabled = false,
}: Readonly<{
  client: OptionalChatterboxClient;
  hardwareCompatibility: HardwareProfileCompatibilityCoordinator;
  onActivate: () => Promise<boolean>;
  onRemove: () => Promise<void>;
  disabled?: boolean;
}>): ReactElement {
  const compatibility = useSyncExternalStore(
    (listener) => hardwareCompatibility.subscribe(listener),
    () => hardwareCompatibility.observe(),
    () => hardwareCompatibility.observe(),
  );
  return (
    <OptionalChatterboxControls
      client={client}
      active={compatibility.activeProfileId === CHATTERBOX_OPTIONAL_PROFILE_ID}
      onActivate={onActivate}
      onRecheck={async () => {
        await hardwareCompatibility.check("explicit-recheck");
        return onActivate();
      }}
      onRemove={onRemove}
      disabled={disabled}
    />
  );
}

export function ReaderSettingsDialog({
  open,
  onClose,
  readerPreferences,
  readerPreferencesStatus,
  canPersistReaderPreferences,
  onReaderPreferenceChange,
  hardwareCompatibility,
  narrationCoordinator,
  fallbackNarrationStart,
  onSelectProfile,
  onSelectLanguage,
  onResetNarrationSettings,
  onRecoveryEpisodeReset,
  optionalChatterbox,
  onActivateChatterbox,
  onRemoveChatterbox,
  loadApplicationVersion = getVersion,
}: ReaderSettingsDialogProps): ReactElement | null {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [applicationVersion, setApplicationVersion] = useState<
    string | undefined
  >();
  const [narrationSelectionPending, setNarrationSelectionPending] =
    useState(false);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    let current = true;
    void loadApplicationVersion()
      .then((version) => {
        const normalized = version.trim();
        if (current && normalized.length > 0 && normalized.length <= 64) {
          setApplicationVersion(normalized);
        }
      })
      .catch(() => {
        if (current) {
          setApplicationVersion(undefined);
        }
      });
    return () => {
      current = false;
    };
  }, [loadApplicationVersion, open]);

  if (!open) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || dialogRef.current === null) {
      return;
    }
    const focusable = focusableElements(dialogRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.current.focus({ preventScroll: true });
      return;
    }
    const first = focusable[0]!;
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleChatterboxActivation = async (): Promise<boolean> => {
    const activated = await onActivateChatterbox();
    if (activated) {
      onRecoveryEpisodeReset();
    }
    return activated;
  };

  return (
    <div
      className="settings-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="reader-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <header className="reader-settings-header">
          <div>
            <p className="reader-settings-eyebrow">Reader preferences</p>
            <h2 id={titleId}>Settings</h2>
            <p id={descriptionId}>
              Reading and narration choices stay on this device.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="reader-settings-close"
            onClick={onClose}
          >
            Close Settings
          </button>
        </header>

        <div className="reader-settings-content">
          <section aria-labelledby={`${titleId}-reading`}>
            <h3 id={`${titleId}-reading`}>Reading</h3>
            <ReaderReadingSettingsControls
              disabled={
                readerPreferencesStatus === "loading" ||
                !canPersistReaderPreferences
              }
              preferences={readerPreferences}
              onChange={onReaderPreferenceChange}
            />
          </section>

          <section aria-labelledby={`${titleId}-appearance`}>
            <h3 id={`${titleId}-appearance`}>Appearance</h3>
            <ReaderAppearanceSettingsControls
              disabled={
                readerPreferencesStatus === "loading" ||
                !canPersistReaderPreferences
              }
              preferences={readerPreferences}
              onChange={onReaderPreferenceChange}
            />
          </section>

          <section aria-labelledby={`${titleId}-narration`}>
            <h3 id={`${titleId}-narration`}>Narration</h3>
            <HardwareCompatibilityControls
              coordinator={hardwareCompatibility}
              presentation="narration"
              onSelectProfile={onSelectProfile}
              onSelectLanguage={onSelectLanguage}
              onResetNarrationSettings={onResetNarrationSettings}
              onRecoveryEpisodeReset={onRecoveryEpisodeReset}
              onSelectionPendingChange={setNarrationSelectionPending}
            />
            <OptionalChatterboxSettings
              client={optionalChatterbox}
              hardwareCompatibility={hardwareCompatibility}
              onActivate={handleChatterboxActivation}
              onRemove={onRemoveChatterbox}
              disabled={narrationSelectionPending}
            />
            <NarrationStartSettings
              {...(narrationCoordinator === undefined
                ? {}
                : { coordinator: narrationCoordinator })}
              fallback={fallbackNarrationStart}
              disabled={narrationSelectionPending}
            />
          </section>

          <section aria-labelledby={`${titleId}-device`}>
            <h3 id={`${titleId}-device`}>Device compatibility</h3>
            <HardwareCompatibilityControls
              coordinator={hardwareCompatibility}
              presentation="device"
              onRecoveryEpisodeReset={onRecoveryEpisodeReset}
            />
          </section>

          <section
            className="reader-settings-about"
            aria-labelledby={`${titleId}-about`}
          >
            <h3 id={`${titleId}-about`}>About</h3>
            <p>
              {applicationVersion === undefined
                ? "VoxLeaf version unavailable."
                : `VoxLeaf ${applicationVersion}.`}
            </p>
            <p>
              EPUB processing and speech generation run locally. Generated
              narration is kept in bounded memory and is not saved by default.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
