import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from "react";

import type {
  HardwareCompatibilitySnapshotV1,
  HardwareProfileCompatibilityCoordinator,
} from "./hardware-profile-compatibility";
import type {
  HardwareProfileMatchV1,
  HardwareProfileRejectionReasonV1,
} from "./hardware-profile-matcher";
import {
  NARRATION_LANGUAGES_V2,
  type NarrationLanguageV1,
} from "./narration-language";
import { profileSupportsNarrationLanguageV1 } from "./narration-profile-language-registry";

export interface HardwareCompatibilityControlsProps {
  readonly coordinator: HardwareProfileCompatibilityCoordinator;
  readonly presentation: "device" | "narration";
  readonly onRecoveryEpisodeReset?: () => void;
  readonly onSelectProfile?: (profileId: string) => Promise<boolean>;
  readonly onSelectLanguage?: (
    language: NarrationLanguageV1,
  ) => Promise<boolean>;
  readonly onResetNarrationSettings?: () => Promise<boolean>;
  readonly onSelectionPendingChange?: (pending: boolean) => void;
}

const REASON_MESSAGES: Readonly<
  Record<HardwareProfileRejectionReasonV1, string>
> = Object.freeze({
  "contract-version": "The compatibility report version is not supported.",
  "probe-incomplete": "The compatibility check did not return complete facts.",
  "registry-entry-invalid": "The measured profile record is not valid.",
  "support-state-not-admitted":
    "This profile did not pass the required product evaluation.",
  "evidence-invalid": "The measured profile evidence is not valid.",
  "operating-system": "The operating system is not compatible.",
  architecture: "The processor architecture is not compatible.",
  "logical-processors": "The required processor capacity is not available.",
  "total-ram": "The required total memory is not available.",
  "available-ram": "The required free memory is not available.",
  "application-volume-storage":
    "The required free application storage is not available.",
  provider: "The required local acceleration provider is not available.",
  precision: "The required local numeric precision is not available.",
  "device-class": "The available device class is not compatible.",
  "dedicated-vram": "The required dedicated graphics memory is not available.",
  "available-dedicated-vram":
    "The current free dedicated graphics-memory budget is below this profile's safety reserve.",
});

function statusMessage(snapshot: HardwareCompatibilitySnapshotV1): string {
  switch (snapshot.status) {
    case "checking":
      return "Checking local narration compatibility.";
    case "compatible":
      return "Local narration is compatible on this device.";
    case "development-only":
      return "A development-only local narration profile is available.";
    case "unavailable":
      return "Local narration is unavailable on this device.";
    case "unknown":
      return "Local narration compatibility could not be established.";
    case "failed":
      return "The local narration compatibility check failed.";
  }
}

function profileLabel(profile: HardwareProfileMatchV1): string {
  switch (profile.profileId) {
    case "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8":
      return "Qwen and Serena Spanish quality profile (Development)";
    case "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8":
      return "Qwen and Aiden English quality profile (Development)";
    case "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1":
      return "Piper and davefx Spanish fast CPU profile";
    case "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1":
      return "Piper and joe English fast CPU profile";
    case "chatterbox-multilingual-v3-cuda-bf16-default-v4":
      return "Chatterbox bilingual natural voice profile";
    case "qwen3-tts-0-6b-customvoice-cuda-bf16-v1":
      return "Historical Qwen 0.6B evaluated profile";
    case "supertonic-3-onnx-cpu-f1-es-v1":
      return "Supertonic and F1 evaluated profile";
    default:
      return "Measured local narration profile";
  }
}

function profileState(profile: HardwareProfileMatchV1): string {
  if (profile.state === "compatible") {
    return profile.supportState === "development-only"
      ? "Development-only and compatible"
      : "Compatible";
  }
  if (profile.state === "unknown") {
    return "Compatibility not established";
  }
  return "Unavailable";
}

export function HardwareCompatibilityControls({
  coordinator,
  presentation,
  onRecoveryEpisodeReset,
  onSelectProfile,
  onSelectLanguage,
  onResetNarrationSettings,
  onSelectionPendingChange,
}: HardwareCompatibilityControlsProps): ReactElement {
  const [selectionPending, setSelectionPending] = useState(false);
  const snapshot = useSyncExternalStore(
    (listener) => coordinator.subscribe(listener),
    () => coordinator.observe(),
    () => coordinator.observe(),
  );

  useEffect(
    () => () => onSelectionPendingChange?.(false),
    [onSelectionPendingChange],
  );

  const setNarrationSelectionPending = (pending: boolean): void => {
    setSelectionPending(pending);
    onSelectionPendingChange?.(pending);
  };

  const selectable = snapshot.profiles.filter(
    (profile) =>
      profile.state === "compatible" &&
      (profile.supportState === "supported" ||
        profile.supportState === "development-only") &&
      profileSupportsNarrationLanguageV1(profile.profileId, snapshot.language),
  );

  const handleSelection = async (profileId: string): Promise<void> => {
    setNarrationSelectionPending(true);
    try {
      const selected =
        onSelectProfile === undefined
          ? await coordinator.selectProfile(profileId)
          : await onSelectProfile(profileId);
      if (selected) {
        onRecoveryEpisodeReset?.();
      }
    } finally {
      setNarrationSelectionPending(false);
    }
  };

  const handleLanguageSelection = async (
    language: NarrationLanguageV1,
  ): Promise<void> => {
    setNarrationSelectionPending(true);
    try {
      const selected =
        onSelectLanguage === undefined
          ? await coordinator.selectLanguage(language)
          : await onSelectLanguage(language);
      if (selected) {
        onRecoveryEpisodeReset?.();
      }
    } finally {
      setNarrationSelectionPending(false);
    }
  };

  const handleRecheck = async (): Promise<void> => {
    await coordinator.check("explicit-recheck");
    onRecoveryEpisodeReset?.();
  };

  const handleReset = async (): Promise<void> => {
    setNarrationSelectionPending(true);
    try {
      const reset =
        onResetNarrationSettings === undefined
          ? await coordinator.resetLanguage()
          : await onResetNarrationSettings();
      if (reset) {
        onRecoveryEpisodeReset?.();
      }
    } finally {
      setNarrationSelectionPending(false);
    }
  };

  const dataAttributes = {
    "data-compatibility-status": snapshot.status,
    "data-compatibility-profile": snapshot.activeProfileId ?? "none",
    "data-narration-language": snapshot.language,
  } as const;

  const narrationSettings = (
    <div className="hardware-compatibility-narration">
      {selectionPending ? (
        <p role="status" aria-live="polite" aria-atomic="true">
          Applying narration settings. Existing settings remain available.
        </p>
      ) : null}
      <fieldset
        disabled={
          selectionPending ||
          snapshot.status === "checking" ||
          !snapshot.canPersistLanguage
        }
      >
        <legend>Narration language</legend>
        {NARRATION_LANGUAGES_V2.map(({ value, label }) => (
          <label key={value}>
            <input
              type="radio"
              name="narration-language"
              value={value}
              checked={snapshot.language === value}
              onChange={() => void handleLanguageSelection(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <p aria-live="polite" aria-atomic="true">
        {snapshot.languageReason === "no-profile-for-language"
          ? `No evaluated local narration profile is available for ${
              snapshot.language === "en" ? "English" : "Spanish"
            }.`
          : `The selected narration language is ${
              snapshot.language === "en" ? "English" : "Spanish"
            }.`}
      </p>
      {!snapshot.canPersistLanguage ? (
        <p>
          A newer saved language preference is preserved and cannot be changed
          by this version.
        </p>
      ) : null}
      {selectable.length === 0 ? null : (
        <fieldset
          disabled={
            selectionPending ||
            snapshot.status === "checking" ||
            !snapshot.canPersistSelection
          }
        >
          <legend>Local narration profile</legend>
          {selectable.map((profile) => (
            <label key={profile.profileId}>
              <input
                type="radio"
                name="hardware-profile"
                value={profile.profileId}
                checked={snapshot.activeProfileId === profile.profileId}
                readOnly
                onClick={() => void handleSelection(profile.profileId)}
              />
              <span>{profileLabel(profile)}</span>
            </label>
          ))}
        </fieldset>
      )}
      {!snapshot.canPersistSelection ? (
        <p>
          A newer saved profile preference is preserved and cannot be changed by
          this version.
        </p>
      ) : null}
      <button
        type="button"
        disabled={
          selectionPending ||
          snapshot.status === "checking" ||
          !snapshot.canPersistLanguage
        }
        onClick={() => void handleReset()}
      >
        Reset narration settings
      </button>
    </div>
  );

  const deviceSettings = (
    <div className="hardware-compatibility-device">
      <p className="hardware-compatibility-selected" aria-live="polite">
        {statusMessage(snapshot)}
      </p>
      {snapshot.reason === undefined ? null : (
        <p className="hardware-compatibility-reason">
          {REASON_MESSAGES[snapshot.reason]}
        </p>
      )}
      <p>
        {snapshot.fallbackAvailable
          ? "A measured CPU fallback is available."
          : "No measured CPU fallback is available."}
      </p>
      <details className="hardware-compatibility-reasons">
        <summary>Measured profile reasons</summary>
        <ul aria-label="Measured narration profiles">
          {snapshot.profiles.map((profile) => (
            <li
              key={profile.profileId}
              data-profile-id={profile.profileId}
              data-profile-state={profile.state}
              data-profile-reason={profile.reason ?? "none"}
            >
              <span>{profileLabel(profile)}: </span>
              <span>{profileState(profile)}.</span>
              {profile.reason === undefined ? null : (
                <span> {REASON_MESSAGES[profile.reason]}</span>
              )}
            </li>
          ))}
        </ul>
      </details>
      <button
        type="button"
        disabled={snapshot.status === "checking"}
        onClick={() => void handleRecheck()}
      >
        Check compatibility again
      </button>
    </div>
  );

  if (presentation === "narration") {
    return (
      <div className="hardware-compatibility" {...dataAttributes}>
        {narrationSettings}
      </div>
    );
  }
  return (
    <div className="hardware-compatibility" {...dataAttributes}>
      {deviceSettings}
    </div>
  );
}
