import type { NarrationStartPreferenceRepository } from "../persistence/narration-start-preference";
import type { NarrationPlaybackPreferenceRepository } from "../persistence/narration-playback-preference";
import type { HardwareProfileCompatibilityCoordinator } from "../tts/hardware-profile-compatibility";
import type { NarrationLanguageV1 } from "../tts/narration-language";
import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  type OptionalChatterboxClient,
} from "../tts/optional-chatterbox-client";
import type { ProductNarrationCoordinator } from "../tts/product-narration-coordinator";

type HardwareSettings = Pick<
  HardwareProfileCompatibilityCoordinator,
  "selectProfile" | "selectLanguage" | "resetLanguage"
>;
type NarrationSettings = Pick<
  ProductNarrationCoordinator,
  | "stop"
  | "refreshSelectedProfile"
  | "resetStartPreference"
  | "resetPlaybackPreference"
> & {
  stopForConfigurationChange?(): Promise<void> | void | null;
  beginConfigurationChange?(): () => void;
  isHealthyLoadedProfile?(profileId: string): boolean;
};

function stopForConfigurationChange(
  coordinator: NarrationSettings | undefined,
) {
  return coordinator?.stopForConfigurationChange?.() ?? coordinator?.stop();
}

export function createNarrationSettingsActions(development: boolean) {
  return {
    async selectProfile(
      profileId: string,
      hardware: Pick<HardwareSettings, "selectProfile">,
      coordinator: NarrationSettings | undefined,
      optional: Pick<OptionalChatterboxClient, "select">,
      isCurrent?: () => boolean,
    ): Promise<boolean> {
      if (isCurrent?.() === false) return false;
      if (
        profileId === CHATTERBOX_OPTIONAL_PROFILE_ID &&
        coordinator?.isHealthyLoadedProfile?.(profileId)
      )
        return true;
      const release = coordinator?.beginConfigurationChange?.();
      try {
        // Packaged selection uses the native-owned optional package lifecycle;
        // the exact developer environment retains its explicit separate path.
        if (profileId === CHATTERBOX_OPTIONAL_PROFILE_ID && !development) {
          const snapshot = await optional.select();
          if (isCurrent?.() === false || snapshot.state !== "installed") {
            return false;
          }
        }
        await stopForConfigurationChange(coordinator);
        if (isCurrent?.() === false) return false;
        const selected = await (isCurrent === undefined
          ? hardware.selectProfile(profileId)
          : hardware.selectProfile(profileId, isCurrent));
        if (isCurrent?.() === false) return false;
        if (selected) {
          await coordinator?.refreshSelectedProfile();
        }
        return selected && isCurrent?.() !== false;
      } finally {
        release?.();
      }
    },
    activateChatterbox(selectProfile: (profileId: string) => Promise<boolean>) {
      return selectProfile(CHATTERBOX_OPTIONAL_PROFILE_ID);
    },
    async removeChatterbox(
      coordinator: NarrationSettings | undefined,
      optional: Pick<OptionalChatterboxClient, "remove">,
    ): Promise<void> {
      const release = coordinator?.beginConfigurationChange?.();
      try {
        await stopForConfigurationChange(coordinator);
        await optional.remove();
        await coordinator?.refreshSelectedProfile();
      } finally {
        release?.();
      }
    },
    async selectLanguage(
      language: NarrationLanguageV1,
      hardware: Pick<HardwareSettings, "selectLanguage">,
      coordinator: NarrationSettings | undefined,
    ): Promise<boolean> {
      const release = coordinator?.beginConfigurationChange?.();
      try {
        await stopForConfigurationChange(coordinator);
        const selected = await hardware.selectLanguage(language);
        if (selected) {
          await coordinator?.refreshSelectedProfile();
        }
        return selected;
      } finally {
        release?.();
      }
    },
    async reset({
      hardware,
      coordinator,
      startPreference,
      playbackPreference,
      onStartPreferenceReset,
    }: {
      hardware: Pick<HardwareSettings, "resetLanguage">;
      coordinator: NarrationSettings | undefined;
      startPreference: Pick<NarrationStartPreferenceRepository, "reset">;
      playbackPreference: Pick<NarrationPlaybackPreferenceRepository, "reset">;
      onStartPreferenceReset: () => void;
    }): Promise<boolean> {
      const release = coordinator?.beginConfigurationChange?.();
      try {
        await stopForConfigurationChange(coordinator);
        const languageReset = await hardware.resetLanguage();
        const startReset =
          coordinator === undefined
            ? (await startPreference.reset()).status === "saved"
            : await coordinator.resetStartPreference();
        const playbackReset =
          coordinator === undefined
            ? (await playbackPreference.reset()).status === "saved"
            : await coordinator.resetPlaybackPreference();
        if (startReset) {
          onStartPreferenceReset();
        }
        if (languageReset) {
          await coordinator?.refreshSelectedProfile();
        }
        return languageReset && startReset && playbackReset;
      } finally {
        release?.();
      }
    },
  };
}
