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

export interface OptionalChatterboxSnapshot {
  readonly profileId: typeof CHATTERBOX_OPTIONAL_PROFILE_ID;
  readonly state: OptionalChatterboxState;
  readonly downloadBytes: number | undefined;
  readonly downloadedBytes: number;
  readonly installedBytes: number | undefined;
  readonly temporaryBytes: number | undefined;
  readonly minimumFreeBytes: number | undefined;
  readonly coldStartSeconds: number | undefined;
  readonly licenseSummary: string;
  readonly failure: string | undefined;
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

const INITIAL_SNAPSHOT: OptionalChatterboxSnapshot = Object.freeze({
  profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
  state: "withheld",
  downloadBytes: undefined,
  downloadedBytes: 0,
  installedBytes: undefined,
  temporaryBytes: undefined,
  minimumFreeBytes: undefined,
  coldStartSeconds: undefined,
  licenseSummary:
    "Chatterbox, its reviewed model/default conditioning, and PerTh are MIT-licensed.",
  failure: undefined,
});

function boundedOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
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
  if (
    profileId !== CHATTERBOX_OPTIONAL_PROFILE_ID ||
    typeof state !== "string" ||
    !STATES.has(state as OptionalChatterboxState) ||
    downloadedBytes === undefined ||
    typeof object.licenseSummary !== "string" ||
    object.licenseSummary.length === 0 ||
    (object.failure !== null &&
      object.failure !== undefined &&
      typeof object.failure !== "string")
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
  return Object.freeze({
    profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    state: state as OptionalChatterboxState,
    downloadBytes: values[0],
    downloadedBytes,
    installedBytes: values[1],
    temporaryBytes: values[2],
    minimumFreeBytes: values[3],
    coldStartSeconds: values[4],
    licenseSummary: object.licenseSummary,
    failure: typeof object.failure === "string" ? object.failure : undefined,
  });
}

export class OptionalChatterboxClient {
  readonly #invoke: InvokePort;
  readonly #listeners = new Set<() => void>();
  #snapshot = INITIAL_SNAPSHOT;

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
    return this.#call("optional_chatterbox_snapshot");
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
    try {
      const snapshot = decodeSnapshot(await this.#invoke(command, args));
      this.#snapshot = snapshot;
      this.#publish();
      return snapshot;
    } catch {
      this.#snapshot = Object.freeze({
        ...this.#snapshot,
        state: "failed",
        failure: "optional-profile-operation-failed",
      });
      this.#publish();
      return this.#snapshot;
    }
  }

  #publish(): void {
    for (const listener of this.#listeners) {
      listener();
    }
  }
}
