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
    ): Promise<boolean> {
      // Packaged selection uses the native-owned optional package lifecycle;
      // the exact developer environment retains its explicit separate path.
      if (profileId === CHATTERBOX_OPTIONAL_PROFILE_ID && !development) {
        const snapshot = await optional.select();
        if (snapshot.state !== "installed") {
          return false;
        }
      }
      await stopForConfigurationChange(coordinator);
      const selected = await hardware.selectProfile(profileId);
      if (selected) {
        await coordinator?.refreshSelectedProfile();
      }
      return selected;
    },
    activateChatterbox(selectProfile: (profileId: string) => Promise<boolean>) {
      return selectProfile(CHATTERBOX_OPTIONAL_PROFILE_ID);
    },
    async removeChatterbox(
      coordinator: NarrationSettings | undefined,
      optional: Pick<OptionalChatterboxClient, "remove">,
    ): Promise<void> {
      await stopForConfigurationChange(coordinator);
      await optional.remove();
      await coordinator?.refreshSelectedProfile();
    },
    async selectLanguage(
      language: NarrationLanguageV1,
      hardware: Pick<HardwareSettings, "selectLanguage">,
      coordinator: NarrationSettings | undefined,
    ): Promise<boolean> {
      await stopForConfigurationChange(coordinator);
      const selected = await hardware.selectLanguage(language);
      if (selected) {
        await coordinator?.refreshSelectedProfile();
      }
      return selected;
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
    },
  };
}
