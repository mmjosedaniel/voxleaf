import type { HostProfileCompatibilityReportV1 } from "@voxleaf/shared";

import {
  createWebStorageHardwareProfilePreferenceRepository,
  type HardwareProfilePreferenceReadResult,
  type HardwareProfilePreferenceRepository,
} from "../persistence/hardware-profile-preference";
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

export interface HardwareCompatibilitySnapshotV1 {
  readonly status: HardwareCompatibilityStatusV1;
  readonly reason: HardwareProfileRejectionReasonV1 | undefined;
  readonly profiles: readonly HardwareProfileMatchV1[];
  readonly activeProfileId: string | undefined;
  readonly selectionSource: HardwareCompatibilitySelectionSourceV1 | undefined;
  readonly preferenceStatus: HardwareCompatibilityPreferenceStatusV1;
  readonly fallbackAvailable: boolean;
  readonly canPersistSelection: boolean;
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
  matches: HardwareProfileMatchResultV1,
): HardwareCompatibilityStatusV1 {
  if (active?.supportState === "development-only") {
    return "development-only";
  }
  if (active?.supportState === "supported") {
    return "compatible";
  }
  return matches.profiles.some((profile) => profile.state === "unknown")
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

function chooseActiveProfile(matches: HardwareProfileMatchResultV1): Readonly<{
  profileId: string | undefined;
  source: HardwareCompatibilitySelectionSourceV1 | undefined;
}> {
  if (matches.selectedProfileId !== undefined) {
    return Object.freeze({
      profileId: matches.selectedProfileId,
      source: "preference",
    });
  }
  if (matches.recommendedProfileId !== undefined) {
    return Object.freeze({
      profileId: matches.recommendedProfileId,
      source: "recommendation",
    });
  }
  if (
    matches.compatibleProfileIds.includes(
      EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
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
  ): Promise<boolean> {
    const snapshot =
      trigger === "application-start"
        ? await this.ensureChecked()
        : await this.check(trigger);
    return snapshot.activeProfileId === profileId;
  }

  public isProfileCurrentlyAllowed(profileId: string): boolean | undefined {
    return this.#snapshot.status === "checking"
      ? undefined
      : this.#snapshot.activeProfileId === profileId;
  }

  public async selectProfile(profileId: string): Promise<boolean> {
    if (
      this.#closed ||
      !this.#snapshot.profiles.some(
        (profile) =>
          profile.profileId === profileId &&
          profile.state === "compatible" &&
          (profile.supportState === "supported" ||
            profile.supportState === "development-only"),
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

  public close(): void {
    this.#closed = true;
    this.#sequence += 1;
    this.#listeners.clear();
  }

  async #runProbe(sequence: number): Promise<HardwareCompatibilitySnapshotV1> {
    try {
      const [report, nativeGate, preference] = await Promise.all([
        this.#detector.detect(),
        this.#developmentGate.exactDemoAvailability(),
        this.#preferenceRepository.read(),
      ]);
      const preferredProfileId = preferenceInput(preference);
      const matches = matchHardwareProfilesV1({
        report,
        registry: this.#registry,
        nativeDevelopmentGate: nativeGate === "available",
        ...(preferredProfileId === undefined ? {} : { preferredProfileId }),
      });
      const choice = chooseActiveProfile(matches);
      const active =
        choice.profileId === undefined
          ? undefined
          : matches.profiles.find(
              (profile) => profile.profileId === choice.profileId,
            );
      const status = statusFor(active, matches);
      const snapshot = Object.freeze({
        status,
        reason: reasonFor(status, matches),
        profiles: matches.profiles,
        activeProfileId: choice.profileId,
        selectionSource: choice.source,
        preferenceStatus: preferenceStatus(preference, matches),
        fallbackAvailable: matches.fallbackAvailable,
        canPersistSelection: preference.status !== "unsupported-version",
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
