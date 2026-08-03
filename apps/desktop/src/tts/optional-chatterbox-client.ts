import { invoke } from "@tauri-apps/api/core";

export const CHATTERBOX_OPTIONAL_PROFILE_ID =
  "chatterbox-multilingual-v3-cuda-bf16-default-v4" as const;

export type OptionalChatterboxState =
  | "absent"
  | "confirming"
  | "downloading"
  | "verifying"
  | "installed"
  | "failed"
  | "removing"
  | "withheld";

export type OptionalChatterboxFailure =
  | "installed-package-invalid"
  | "optional-profile-operation-failed"
  | "tts-optional-profile-busy"
  | "tts-optional-profile-cancelled"
  | "tts-optional-profile-cleanup-failed"
  | "tts-optional-profile-download-failed"
  | "tts-optional-profile-incompatible-host"
  | "tts-optional-profile-insufficient-space"
  | "tts-optional-profile-invalid"
  | "tts-optional-profile-unavailable";

export interface OptionalChatterboxSnapshot {
  readonly profileId: typeof CHATTERBOX_OPTIONAL_PROFILE_ID;
  readonly state: OptionalChatterboxState;
  readonly downloadBytes: number | undefined;
  readonly downloadedBytes: number;
  readonly installedBytes: number | undefined;
  readonly temporaryBytes: number | undefined;
  readonly minimumFreeBytes: number | undefined;
  readonly coldStartSeconds: number | undefined;
  readonly minimumLogicalProcessors: number;
  readonly minimumTotalRamMiB: number;
  readonly minimumAvailableRamMiB: number;
  readonly measuredPeakDedicatedVramMiB: number;
  readonly minimumTotalDedicatedVramMiB: number;
  readonly minimumAvailableDedicatedVramMiB: number;
  readonly recommendedTotalDedicatedVramMiB: number;
  readonly licenseSummary: string;
  readonly failure: OptionalChatterboxFailure | undefined;
}

type InvokePort = (
  command: string,
  args?: Record<string, unknown>,
) => Promise<unknown>;

const STATES = new Set<OptionalChatterboxState>([
  "absent",
  "confirming",
  "downloading",
  "verifying",
  "installed",
  "failed",
  "removing",
  "withheld",
]);

const FAILURES = new Set<OptionalChatterboxFailure>([
  "installed-package-invalid",
  "optional-profile-operation-failed",
  "tts-optional-profile-busy",
  "tts-optional-profile-cancelled",
  "tts-optional-profile-cleanup-failed",
  "tts-optional-profile-download-failed",
  "tts-optional-profile-incompatible-host",
  "tts-optional-profile-insufficient-space",
  "tts-optional-profile-invalid",
  "tts-optional-profile-unavailable",
]);

const INITIAL_SNAPSHOT: OptionalChatterboxSnapshot = Object.freeze({
  profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
  state: "withheld",
  downloadBytes: undefined,
  downloadedBytes: 0,
  installedBytes: undefined,
  temporaryBytes: undefined,
  minimumFreeBytes: undefined,
  coldStartSeconds: undefined,
  minimumLogicalProcessors: 8,
  minimumTotalRamMiB: 24_576,
  minimumAvailableRamMiB: 4_096,
  measuredPeakDedicatedVramMiB: 3_644,
  minimumTotalDedicatedVramMiB: 5_632,
  minimumAvailableDedicatedVramMiB: 4_668,
  recommendedTotalDedicatedVramMiB: 7_680,
  licenseSummary:
    "Chatterbox, its reviewed model/default conditioning, and PerTh are MIT-licensed.",
  failure: undefined,
});

function boundedOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
}

function decodeFailure(value: unknown): OptionalChatterboxFailure | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  return typeof value === "string" &&
    FAILURES.has(value as OptionalChatterboxFailure)
    ? (value as OptionalChatterboxFailure)
    : undefined;
}

function decodeSnapshot(value: unknown): OptionalChatterboxSnapshot {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("optional-chatterbox-invalid-response");
  }
  const object = value as Record<string, unknown>;
  const state = object.state;
  const profileId = object.profileId;
  const downloadedBytes = boundedOptionalNumber(object.downloadedBytes);
  const failure = decodeFailure(object.failure);
  if (
    profileId !== CHATTERBOX_OPTIONAL_PROFILE_ID ||
    typeof state !== "string" ||
    !STATES.has(state as OptionalChatterboxState) ||
    downloadedBytes === undefined ||
    typeof object.licenseSummary !== "string" ||
    object.licenseSummary.length === 0 ||
    (object.failure !== null &&
      object.failure !== undefined &&
      failure === undefined)
  ) {
    throw new Error("optional-chatterbox-invalid-response");
  }
  const optionalNumbers = [
    "downloadBytes",
    "installedBytes",
    "temporaryBytes",
    "minimumFreeBytes",
    "coldStartSeconds",
  ] as const;
  const values = optionalNumbers.map((key) => {
    const candidate = object[key];
    if (candidate === null || candidate === undefined) {
      return undefined;
    }
    const number = boundedOptionalNumber(candidate);
    if (number === undefined) {
      throw new Error("optional-chatterbox-invalid-response");
    }
    return number;
  });
  const requiredNumbers = [
    "minimumLogicalProcessors",
    "minimumTotalRamMiB",
    "minimumAvailableRamMiB",
    "measuredPeakDedicatedVramMiB",
    "minimumTotalDedicatedVramMiB",
    "minimumAvailableDedicatedVramMiB",
    "recommendedTotalDedicatedVramMiB",
  ] as const;
  const requiredValues = requiredNumbers.map((key) => {
    const number = boundedOptionalNumber(object[key]);
    if (number === undefined || number === 0) {
      throw new Error("optional-chatterbox-invalid-response");
    }
    return number;
  });
  return Object.freeze({
    profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    state: state as OptionalChatterboxState,
    downloadBytes: values[0],
    downloadedBytes,
    installedBytes: values[1],
    temporaryBytes: values[2],
    minimumFreeBytes: values[3],
    coldStartSeconds: values[4],
    minimumLogicalProcessors: requiredValues[0]!,
    minimumTotalRamMiB: requiredValues[1]!,
    minimumAvailableRamMiB: requiredValues[2]!,
    measuredPeakDedicatedVramMiB: requiredValues[3]!,
    minimumTotalDedicatedVramMiB: requiredValues[4]!,
    minimumAvailableDedicatedVramMiB: requiredValues[5]!,
    recommendedTotalDedicatedVramMiB: requiredValues[6]!,
    licenseSummary: object.licenseSummary,
    failure,
  });
}

export class OptionalChatterboxClient {
  readonly #invoke: InvokePort;
  readonly #listeners = new Set<() => void>();
  #snapshot = INITIAL_SNAPSHOT;
  #nextRequestId = 0;
  #lastAppliedRequestId = 0;
  #refreshInFlight: Promise<OptionalChatterboxSnapshot> | undefined;

  public constructor(invokePort: InvokePort = invoke) {
    this.#invoke = invokePort;
  }

  public observe(): OptionalChatterboxSnapshot {
    return this.#snapshot;
  }

  public subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  public async refresh(): Promise<OptionalChatterboxSnapshot> {
    if (this.#refreshInFlight !== undefined) {
      return this.#refreshInFlight;
    }
    const request = this.#call("optional_chatterbox_snapshot");
    this.#refreshInFlight = request;
    void request.finally(() => {
      if (this.#refreshInFlight === request) {
        this.#refreshInFlight = undefined;
      }
    });
    return request;
  }

  public async select(): Promise<OptionalChatterboxSnapshot> {
    return this.#call("select_optional_chatterbox", {
      profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
  }

  public async download(): Promise<OptionalChatterboxSnapshot> {
    return this.#call("download_optional_chatterbox", {
      profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
  }

  public async cancel(): Promise<OptionalChatterboxSnapshot> {
    return this.#call("cancel_optional_chatterbox", {
      profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
  }

  public async remove(): Promise<OptionalChatterboxSnapshot> {
    return this.#call("remove_optional_chatterbox", {
      profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
  }

  async #call(
    command: string,
    args?: Record<string, unknown>,
  ): Promise<OptionalChatterboxSnapshot> {
    const requestId = ++this.#nextRequestId;
    let result: OptionalChatterboxSnapshot;
    try {
      result = decodeSnapshot(await this.#invoke(command, args));
    } catch (error) {
      result = Object.freeze({
        ...this.#snapshot,
        state: "failed",
        failure: decodeFailure(error) ?? "optional-profile-operation-failed",
      });
    }
    if (requestId !== this.#nextRequestId) {
      return Object.freeze({
        ...this.#snapshot,
        state: "failed",
        failure: "tts-optional-profile-busy",
      });
    }
    if (requestId >= this.#lastAppliedRequestId) {
      this.#lastAppliedRequestId = requestId;
      this.#snapshot = result;
      this.#publish();
    }
    return result;
  }

  #publish(): void {
    for (const listener of this.#listeners) {
      listener();
    }
  }
}
