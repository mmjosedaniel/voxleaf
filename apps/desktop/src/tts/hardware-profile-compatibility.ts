import type { HostProfileCompatibilityReportV1 } from "@voxleaf/shared";

import {
  createWebStorageHardwareProfilePreferenceRepository,
  type HardwareProfilePreferenceReadResult,
  type HardwareProfilePreferenceRepository,
} from "../persistence/hardware-profile-preference";
import {
  createWebStorageNarrationLanguagePreferenceRepository,
  type NarrationLanguagePreferenceReadResult,
  type NarrationLanguagePreferenceRepository,
} from "../persistence/narration-language-preference";
import { HostProfileDetectionClient } from "./host-profile-client";
import {
  matchHardwareProfilesV1,
  type HardwareProfileMatchResultV1,
  type HardwareProfileMatchV1,
  type HardwareProfileRejectionReasonV1,
} from "./hardware-profile-matcher";
import {
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  HARDWARE_PROFILE_REGISTRY_V1,
} from "./hardware-profile-registry";
import type { HardwareProfileRegistryEntryV1 } from "./hardware-profile-authority";
import {
  DEFAULT_NARRATION_LANGUAGE_V1,
  type NarrationLanguageV1,
} from "./narration-language";
import { profileSupportsNarrationLanguageV1 } from "./narration-profile-language-registry";
import {
  TtsProcessClient,
  type TtsExactDemoAvailability,
} from "./process-client";

export type HardwareCompatibilityCheckTriggerV1 =
  | "application-start"
  | "before-profile-start"
  | "explicit-recheck"
  | "operating-system-resume";

export type HardwareCompatibilityStatusV1 =
  | "checking"
  | "compatible"
  | "development-only"
  | "unavailable"
  | "unknown"
  | "failed";

export type HardwareCompatibilityPreferenceStatusV1 =
  HardwareProfilePreferenceReadResult["status"] | "stale" | "used";

export type HardwareCompatibilitySelectionSourceV1 =
  "native-development-gate" | "preference" | "recommendation";

export type NarrationLanguageCompatibilityReasonV1 =
  "no-profile-for-language" | undefined;

export interface HardwareCompatibilitySnapshotV1 {
  readonly status: HardwareCompatibilityStatusV1;
  readonly reason: HardwareProfileRejectionReasonV1 | undefined;
  readonly profiles: readonly HardwareProfileMatchV1[];
  readonly activeProfileId: string | undefined;
  readonly selectionSource: HardwareCompatibilitySelectionSourceV1 | undefined;
  readonly preferenceStatus: HardwareCompatibilityPreferenceStatusV1;
  readonly fallbackAvailable: boolean;
  readonly canPersistSelection: boolean;
  readonly language: NarrationLanguageV1;
  readonly languagePreferenceStatus: NarrationLanguagePreferenceReadResult["status"];
  readonly canPersistLanguage: boolean;
  readonly languageReason: NarrationLanguageCompatibilityReasonV1;
}

export interface HardwareProfileDetectionPort {
  detect(): Promise<HostProfileCompatibilityReportV1>;
}

export interface HardwareDevelopmentGatePort {
  exactDemoAvailability(): Promise<TtsExactDemoAvailability>;
}

export interface HardwareProfileCompatibilityDependencies {
  readonly detector?: HardwareProfileDetectionPort;
  readonly developmentGate?: HardwareDevelopmentGatePort;
  readonly preferenceRepository?: HardwareProfilePreferenceRepository;
  readonly languagePreferenceRepository?: NarrationLanguagePreferenceRepository;
  readonly registry?: readonly HardwareProfileRegistryEntryV1[];
}

const INITIAL_SNAPSHOT: HardwareCompatibilitySnapshotV1 = Object.freeze({
  status: "checking",
  reason: undefined,
  profiles: Object.freeze([]),
  activeProfileId: undefined,
  selectionSource: undefined,
  preferenceStatus: "missing",
  fallbackAvailable: false,
  canPersistSelection: true,
  language: DEFAULT_NARRATION_LANGUAGE_V1,
  languagePreferenceStatus: "missing",
  canPersistLanguage: true,
  languageReason: undefined,
});

function preferenceInput(
  result: HardwareProfilePreferenceReadResult,
): string | undefined {
  return result.status === "ready" ? result.profileId : undefined;
}

function preferenceStatus(
  result: HardwareProfilePreferenceReadResult,
  matches: HardwareProfileMatchResultV1,
): HardwareCompatibilityPreferenceStatusV1 {
  if (result.status !== "ready") {
    return result.status;
  }
  return matches.preferenceState;
}

function statusFor(
  active: HardwareProfileMatchV1 | undefined,
  profiles: readonly HardwareProfileMatchV1[],
): HardwareCompatibilityStatusV1 {
  if (active?.supportState === "development-only") {
    return "development-only";
  }
  if (active?.supportState === "supported") {
    return "compatible";
  }
  return profiles.some((profile) => profile.state === "unknown")
    ? "unknown"
    : "unavailable";
}

function reasonFor(
  status: HardwareCompatibilityStatusV1,
  matches: HardwareProfileMatchResultV1,
): HardwareProfileRejectionReasonV1 | undefined {
  if (status === "compatible" || status === "development-only") {
    return undefined;
  }
  const relevant =
    matches.profiles.find(
      (profile) =>
        profile.supportState === "supported" && profile.state !== "compatible",
    ) ??
    matches.profiles.find(
      (profile) =>
        profile.supportState === "development-only" &&
        profile.state !== "compatible",
    ) ??
    matches.profiles.find((profile) => profile.state !== "compatible");
  return relevant?.reason;
}

function admittedForLanguage(
  profile: HardwareProfileMatchV1,
  language: NarrationLanguageV1,
): boolean {
  return (
    profileSupportsNarrationLanguageV1(profile.profileId, language) &&
    profile.state === "compatible" &&
    (profile.supportState === "supported" ||
      profile.supportState === "development-only")
  );
}

function chooseActiveProfile(
  matches: HardwareProfileMatchResultV1,
  language: NarrationLanguageV1,
): Readonly<{
  profileId: string | undefined;
  source: HardwareCompatibilitySelectionSourceV1 | undefined;
}> {
  if (
    matches.selectedProfileId !== undefined &&
    matches.profiles.some(
      (profile) =>
        profile.profileId === matches.selectedProfileId &&
        admittedForLanguage(profile, language),
    )
  ) {
    return Object.freeze({
      profileId: matches.selectedProfileId,
      source: "preference",
    });
  }
  if (
    matches.recommendedProfileId !== undefined &&
    matches.profiles.some(
      (profile) =>
        profile.profileId === matches.recommendedProfileId &&
        admittedForLanguage(profile, language),
    )
  ) {
    return Object.freeze({
      profileId: matches.recommendedProfileId,
      source: "recommendation",
    });
  }
  if (
    matches.compatibleProfileIds.includes(
      EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
    ) &&
    profileSupportsNarrationLanguageV1(
      EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
      language,
    )
  ) {
    return Object.freeze({
      profileId: EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
      source: "native-development-gate",
    });
  }
  return Object.freeze({ profileId: undefined, source: undefined });
}

export class HardwareProfileCompatibilityCoordinator {
  readonly #detector: HardwareProfileDetectionPort;
  readonly #developmentGate: HardwareDevelopmentGatePort;
  readonly #preferenceRepository: HardwareProfilePreferenceRepository;
  readonly #languagePreferenceRepository: NarrationLanguagePreferenceRepository;
  readonly #registry: readonly HardwareProfileRegistryEntryV1[];
  readonly #listeners = new Set<() => void>();
  #snapshot = INITIAL_SNAPSHOT;
  #probe: Promise<HardwareCompatibilitySnapshotV1> | undefined;
  #closed = false;
  #sequence = 0;

  public constructor(
    dependencies: HardwareProfileCompatibilityDependencies = {},
  ) {
    this.#detector = dependencies.detector ?? new HostProfileDetectionClient();
    this.#developmentGate =
      dependencies.developmentGate ?? new TtsProcessClient();
    this.#preferenceRepository =
      dependencies.preferenceRepository ??
      createWebStorageHardwareProfilePreferenceRepository();
    this.#languagePreferenceRepository =
      dependencies.languagePreferenceRepository ??
      createWebStorageNarrationLanguagePreferenceRepository();
    this.#registry = dependencies.registry ?? HARDWARE_PROFILE_REGISTRY_V1;
  }

  public subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  public observe(): HardwareCompatibilitySnapshotV1 {
    return this.#snapshot;
  }

  public activeProfileId(): string | undefined {
    return this.#snapshot.activeProfileId;
  }

  public activeLanguage(): NarrationLanguageV1 {
    return this.#snapshot.language;
  }

  public ensureChecked(): Promise<HardwareCompatibilitySnapshotV1> {
    if (this.#snapshot.status !== "checking") {
      return Promise.resolve(this.#snapshot);
    }
    return this.check("application-start");
  }

  public check(
    trigger: HardwareCompatibilityCheckTriggerV1,
  ): Promise<HardwareCompatibilitySnapshotV1> {
    void trigger;
    if (this.#closed) {
      return Promise.resolve(this.#snapshot);
    }
    if (this.#probe !== undefined) {
      return this.#probe;
    }

    const sequence = ++this.#sequence;
    this.#snapshot = Object.freeze({
      ...this.#snapshot,
      status: "checking",
      reason: undefined,
    });
    this.#publish();
    const probe = this.#runProbe(sequence);
    this.#probe = probe;
    void probe.finally(() => {
      if (this.#probe === probe) {
        this.#probe = undefined;
      }
    });
    return probe;
  }

  public async isProfileStartAllowed(
    profileId: string,
    trigger: "application-start" | "before-profile-start",
    language: NarrationLanguageV1 = this.#snapshot.language,
  ): Promise<boolean> {
    const snapshot =
      trigger === "application-start"
        ? await this.ensureChecked()
        : await this.check(trigger);
    return (
      snapshot.activeProfileId === profileId &&
      snapshot.language === language &&
      profileSupportsNarrationLanguageV1(profileId, language)
    );
  }

  public isProfileCurrentlyAllowed(profileId: string): boolean | undefined {
    return this.#snapshot.status === "checking"
      ? undefined
      : this.#snapshot.activeProfileId === profileId &&
          profileSupportsNarrationLanguageV1(
            profileId,
            this.#snapshot.language,
          );
  }

  public async selectProfile(profileId: string): Promise<boolean> {
    if (
      this.#closed ||
      !this.#snapshot.profiles.some(
        (profile) =>
          profile.profileId === profileId &&
          profile.state === "compatible" &&
          (profile.supportState === "supported" ||
            profile.supportState === "development-only") &&
          profileSupportsNarrationLanguageV1(
            profileId,
            this.#snapshot.language,
          ),
      ) ||
      !this.#snapshot.canPersistSelection
    ) {
      return false;
    }

    const result = await this.#preferenceRepository.write(profileId);
    if (this.#closed || result.status !== "saved") {
      return false;
    }
    this.#snapshot = Object.freeze({
      ...this.#snapshot,
      activeProfileId: profileId,
      selectionSource: "preference",
      preferenceStatus: "used",
    });
    this.#publish();
    return true;
  }

  public async selectLanguage(language: NarrationLanguageV1): Promise<boolean> {
    if (this.#closed || !this.#snapshot.canPersistLanguage) {
      return false;
    }
    const result = await this.#languagePreferenceRepository.write(language);
    if (this.#closed || result.status !== "saved") {
      return false;
    }
    const active = this.#snapshot.profiles.find(
      (profile) =>
        profile.profileId === this.#snapshot.activeProfileId &&
        admittedForLanguage(profile, language),
    );
    const replacement =
      active ??
      this.#snapshot.profiles.find((profile) =>
        admittedForLanguage(profile, language),
      );
    const status = statusFor(replacement, this.#snapshot.profiles);
    this.#snapshot = Object.freeze({
      ...this.#snapshot,
      status,
      reason:
        status === "compatible" || status === "development-only"
          ? undefined
          : this.#snapshot.reason,
      activeProfileId: replacement?.profileId,
      selectionSource:
        replacement === undefined
          ? undefined
          : active === undefined
            ? "recommendation"
            : this.#snapshot.selectionSource,
      fallbackAvailable:
        replacement?.supportState === "supported" &&
        replacement.profileId === "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1",
      language,
      languagePreferenceStatus: "ready",
      languageReason:
        replacement === undefined ? "no-profile-for-language" : undefined,
    });
    this.#publish();
    return true;
  }

  public close(): void {
    this.#closed = true;
    this.#sequence += 1;
    this.#listeners.clear();
  }

  async #runProbe(sequence: number): Promise<HardwareCompatibilitySnapshotV1> {
    try {
      const [report, nativeGate, preference, languagePreference] =
        await Promise.all([
          this.#detector.detect(),
          this.#developmentGate.exactDemoAvailability(),
          this.#preferenceRepository.read(),
          this.#languagePreferenceRepository.read(),
        ]);
      const language = languagePreference.language;
      const preferredProfileId = preferenceInput(preference);
      const matches = matchHardwareProfilesV1({
        report,
        registry: this.#registry,
        nativeDevelopmentGate: nativeGate === "available",
        ...(preferredProfileId === undefined ? {} : { preferredProfileId }),
      });
      const choice = chooseActiveProfile(matches, language);
      const active =
        choice.profileId === undefined
          ? undefined
          : matches.profiles.find(
              (profile) => profile.profileId === choice.profileId,
            );
      const status = statusFor(active, matches.profiles);
      const snapshot = Object.freeze({
        status,
        reason: reasonFor(status, matches),
        profiles: matches.profiles,
        activeProfileId: choice.profileId,
        selectionSource: choice.source,
        preferenceStatus: preferenceStatus(preference, matches),
        fallbackAvailable:
          matches.fallbackAvailable &&
          matches.profiles.some(
            (profile) =>
              profile.role === "cpu-fallback" &&
              admittedForLanguage(profile, language),
          ),
        canPersistSelection: preference.status !== "unsupported-version",
        language,
        languagePreferenceStatus: languagePreference.status,
        canPersistLanguage: languagePreference.status !== "unsupported-version",
        languageReason:
          choice.profileId === undefined
            ? "no-profile-for-language"
            : undefined,
      }) satisfies HardwareCompatibilitySnapshotV1;
      if (!this.#closed && sequence === this.#sequence) {
        this.#snapshot = snapshot;
        this.#publish();
      }
      return this.#closed || sequence !== this.#sequence
        ? this.#snapshot
        : snapshot;
    } catch {
      const snapshot = Object.freeze({
        status: "failed",
        reason: undefined,
        profiles: Object.freeze([]),
        activeProfileId: undefined,
        selectionSource: undefined,
        preferenceStatus: "unavailable",
        fallbackAvailable: false,
        canPersistSelection: true,
        language: DEFAULT_NARRATION_LANGUAGE_V1,
        languagePreferenceStatus: "unavailable",
        canPersistLanguage: true,
        languageReason: "no-profile-for-language",
      }) satisfies HardwareCompatibilitySnapshotV1;
      if (!this.#closed && sequence === this.#sequence) {
        this.#snapshot = snapshot;
        this.#publish();
      }
      return this.#closed || sequence !== this.#sequence
        ? this.#snapshot
        : snapshot;
    }
  }

  #publish(): void {
    for (const listener of this.#listeners) {
      try {
        listener();
      } catch {
        // Compatibility observers cannot alter the probe or selection.
      }
    }
  }
}
