import type { NarrationStartPreferenceRepository } from "../persistence/narration-start-preference";
import type { NarrationPlaybackPreferenceRepository } from "../persistence/narration-playback-preference";
import type { HardwareProfileCompatibilityCoordinator } from "../tts/hardware-profile-compatibility";
import type { NarrationLanguageV1 } from "../tts/narration-language";
import { profileSupportsNarrationLanguageV1 } from "../tts/narration-profile-language-registry";
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
  stopForConfigurationChange?(): Promise<"contained" | "failed">;
  beginConfigurationChange?(): () => void;
  isHealthyLoadedProfile?(profileId: string): boolean;
};

async function stopForConfigurationChange(
  coordinator: NarrationSettings | undefined,
) {
  if (coordinator?.stopForConfigurationChange !== undefined) {
    if ((await coordinator.stopForConfigurationChange()) !== "contained")
      throw new Error("Narration cleanup did not complete.");
  } else await coordinator?.stop();
}

export function createNarrationSettingsActions(development: boolean) {
  return {
    async selectProfile(
      profileId: string,
      hardware: Pick<HardwareSettings, "selectProfile"> &
        Partial<Pick<HardwareProfileCompatibilityCoordinator, "observe">>,
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
      const eligible = (): boolean => {
        const snapshot = hardware.observe?.();
        return (
          snapshot === undefined ||
          (snapshot.canPersistSelection &&
            snapshot.preferenceStatus !== "unavailable" &&
            profileSupportsNarrationLanguageV1(profileId, snapshot.language) &&
            snapshot.profiles.some(
              (profile) =>
                profile.profileId === profileId &&
                profile.state === "compatible" &&
                (profile.supportState === "supported" ||
                  profile.supportState === "development-only"),
            ))
        );
      };
      if (!eligible()) return false;
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
        if (isCurrent?.() === false || !eligible()) return false;
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
      hardware: Pick<
        HardwareProfileCompatibilityCoordinator,
        "selectLanguage" | "check"
      >,
      coordinator: NarrationSettings | undefined,
    ): Promise<boolean> {
      const release = coordinator?.beginConfigurationChange?.();
      try {
        await stopForConfigurationChange(coordinator);
        const selected = await hardware.selectLanguage(language);
        if (selected) {
          await hardware.check("explicit-recheck");
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
