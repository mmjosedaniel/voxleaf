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

export interface HardwareCompatibilityControlsProps {
  readonly coordinator: HardwareProfileCompatibilityCoordinator;
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
    "The required free dedicated graphics memory is not available.",
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
    case "qwen3-tts-1-7b-customvoice-cuda-bf16-v1":
      return "Qwen and Serena development profile";
    case "qwen3-tts-0-6b-customvoice-cuda-bf16-v1":
      return "Qwen and Aiden evaluated profile";
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
}: HardwareCompatibilityControlsProps): ReactElement {
  const [selectionPending, setSelectionPending] = useState(false);
  const snapshot = useSyncExternalStore(
    (listener) => coordinator.subscribe(listener),
    () => coordinator.observe(),
    () => coordinator.observe(),
  );

  useEffect(() => {
    void coordinator.ensureChecked();
  }, [coordinator]);

  const selectable = snapshot.profiles.filter(
    (profile) =>
      profile.state === "compatible" &&
      (profile.supportState === "supported" ||
        profile.supportState === "development-only"),
  );

  const handleSelection = async (profileId: string): Promise<void> => {
    setSelectionPending(true);
    try {
      await coordinator.selectProfile(profileId);
    } finally {
      setSelectionPending(false);
    }
  };

  return (
    <details
      className="hardware-compatibility"
      data-compatibility-status={snapshot.status}
      data-compatibility-profile={snapshot.activeProfileId ?? "none"}
    >
      <summary>
        <span>Local narration compatibility</span>
        <span aria-live="polite" aria-atomic="true">
          {statusMessage(snapshot)}
        </span>
      </summary>
      <div className="hardware-compatibility-detail">
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
        {selectable.length === 0 ? null : (
          <fieldset
            disabled={selectionPending || !snapshot.canPersistSelection}
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
            A newer saved profile preference is preserved and cannot be changed
            by this version.
          </p>
        ) : null}
        <ul aria-label="Measured narration profiles">
          {snapshot.profiles.map((profile) => (
            <li key={profile.profileId}>
              <span>{profileLabel(profile)}: </span>
              <span>{profileState(profile)}.</span>
              {profile.reason === undefined ? null : (
                <span> {REASON_MESSAGES[profile.reason]}</span>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={snapshot.status === "checking"}
          onClick={() => void coordinator.check("explicit-recheck")}
        >
          Check compatibility again
        </button>
      </div>
    </details>
  );
}
