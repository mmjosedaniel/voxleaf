import type { AdaptiveBufferStartMode } from "../tts/adaptive-buffer-scheduler";

export const NARRATION_START_PREFERENCE_V1 = Object.freeze({
  storageKey: "voxleaf.narration.start-preference",
  schemaVersion: 1,
  maximumEnvelopeUtf8Bytes: 256,
  preparedTargetMs: Object.freeze([60_000, 120_000, 300_000, 600_000]),
});

export const DEFAULT_NARRATION_START_PREFERENCE_V1: AdaptiveBufferStartMode =
  Object.freeze({ kind: "quick" });

export type NarrationStartPreferenceReadResult =
  | Readonly<{ status: "ready"; selection: AdaptiveBufferStartMode }>
  | Readonly<{
      status:
        | "malformed"
        | "missing"
        | "over-limit"
        | "unavailable"
        | "unsupported-version";
      selection: AdaptiveBufferStartMode;
    }>;

export type NarrationStartPreferenceWriteResult =
  | Readonly<{ status: "saved" }>
  | Readonly<{
      status:
        | "invalid-selection"
        | "over-limit"
        | "unavailable"
        | "unsupported-version";
    }>;

export interface NarrationStartPreferenceRepository {
  read(): Promise<NarrationStartPreferenceReadResult>;
  write(
    selection: AdaptiveBufferStartMode,
  ): Promise<NarrationStartPreferenceWriteResult>;
  reset(): Promise<NarrationStartPreferenceWriteResult>;
}

interface StartPreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function isPreparedTarget(
  value: unknown,
): value is 60_000 | 120_000 | 300_000 | 600_000 {
  return (
    typeof value === "number" &&
    NARRATION_START_PREFERENCE_V1.preparedTargetMs.includes(value)
  );
}

function decodeSelection(value: unknown): AdaptiveBufferStartMode | undefined {
  if (!isRecord(value) || Object.keys(value).length !== 3) {
    return undefined;
  }
  if (
    value.schemaVersion !== NARRATION_START_PREFERENCE_V1.schemaVersion ||
    (value.mode !== "quick" && value.mode !== "prepared") ||
    !isPreparedTarget(value.preparedTargetMs)
  ) {
    return undefined;
  }
  if (value.mode === "quick") {
    return value.preparedTargetMs === 60_000
      ? DEFAULT_NARRATION_START_PREFERENCE_V1
      : undefined;
  }
  return Object.freeze({ kind: "prepared", targetMs: value.preparedTargetMs });
}

function failed(
  status: Exclude<NarrationStartPreferenceReadResult["status"], "ready">,
): NarrationStartPreferenceReadResult {
  return Object.freeze({
    status,
    selection: DEFAULT_NARRATION_START_PREFERENCE_V1,
  });
}

function serializeSelection(
  selection: AdaptiveBufferStartMode,
): string | undefined {
  if (selection.kind === "quick") {
    return JSON.stringify({
      schemaVersion: NARRATION_START_PREFERENCE_V1.schemaVersion,
      mode: "quick",
      preparedTargetMs: 60_000,
    });
  }
  if (!isPreparedTarget(selection.targetMs)) {
    return undefined;
  }
  return JSON.stringify({
    schemaVersion: NARRATION_START_PREFERENCE_V1.schemaVersion,
    mode: "prepared",
    preparedTargetMs: selection.targetMs,
  });
}

export function createWebStorageNarrationStartPreferenceRepository(
  storage: () => StartPreferenceStorage = () => window.localStorage,
): NarrationStartPreferenceRepository {
  const write = async (
    selection: AdaptiveBufferStartMode,
  ): Promise<NarrationStartPreferenceWriteResult> => {
    const serialized = serializeSelection(selection);
    if (serialized === undefined) {
      return Object.freeze({ status: "invalid-selection" });
    }
    if (
      utf8Bytes(serialized) >
      NARRATION_START_PREFERENCE_V1.maximumEnvelopeUtf8Bytes
    ) {
      return Object.freeze({ status: "over-limit" });
    }
    try {
      const current = storage().getItem(
        NARRATION_START_PREFERENCE_V1.storageKey,
      );
      if (current !== null) {
        try {
          const decoded: unknown = JSON.parse(current);
          if (
            isRecord(decoded) &&
            typeof decoded.schemaVersion === "number" &&
            Number.isSafeInteger(decoded.schemaVersion) &&
            decoded.schemaVersion > NARRATION_START_PREFERENCE_V1.schemaVersion
          ) {
            return Object.freeze({ status: "unsupported-version" });
          }
        } catch {
          // Explicit writes replace malformed prior state.
        }
      }
      storage().setItem(NARRATION_START_PREFERENCE_V1.storageKey, serialized);
    } catch {
      return Object.freeze({ status: "unavailable" });
    }
    return Object.freeze({ status: "saved" });
  };

  return Object.freeze({
    async read(): Promise<NarrationStartPreferenceReadResult> {
      let serialized: string | null;
      try {
        serialized = storage().getItem(
          NARRATION_START_PREFERENCE_V1.storageKey,
        );
      } catch {
        return failed("unavailable");
      }
      if (serialized === null) {
        return failed("missing");
      }
      if (
        utf8Bytes(serialized) >
        NARRATION_START_PREFERENCE_V1.maximumEnvelopeUtf8Bytes
      ) {
        return failed("over-limit");
      }
      let decoded: unknown;
      try {
        decoded = JSON.parse(serialized);
      } catch {
        return failed("malformed");
      }
      if (
        isRecord(decoded) &&
        typeof decoded.schemaVersion === "number" &&
        Number.isSafeInteger(decoded.schemaVersion) &&
        decoded.schemaVersion > NARRATION_START_PREFERENCE_V1.schemaVersion
      ) {
        return failed("unsupported-version");
      }
      const selection = decodeSelection(decoded);
      return selection === undefined
        ? failed("malformed")
        : Object.freeze({ status: "ready", selection });
    },
    write,
    async reset(): Promise<NarrationStartPreferenceWriteResult> {
      return write(DEFAULT_NARRATION_START_PREFERENCE_V1);
    },
  });
}
