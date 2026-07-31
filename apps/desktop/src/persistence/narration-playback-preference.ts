import {
  isNarrationPlaybackRatePercentV3,
  type NarrationPlaybackRatePercentV3,
} from "../tts/reader-settings-playback-authority-v3";

export const NARRATION_PLAYBACK_PREFERENCE_V1 = Object.freeze({
  storageKey: "voxleaf.narration.playback-preference",
  schemaVersion: 1,
  maximumEnvelopeUtf8Bytes: 256,
});

export const DEFAULT_NARRATION_PLAYBACK_RATE_PERCENT_V1: NarrationPlaybackRatePercentV3 = 100;

export type NarrationPlaybackPreferenceReadResult =
  | Readonly<{
      status: "ready";
      playbackRatePercent: NarrationPlaybackRatePercentV3;
    }>
  | Readonly<{
      status:
        | "malformed"
        | "missing"
        | "over-limit"
        | "unavailable"
        | "unsupported-version";
      playbackRatePercent: NarrationPlaybackRatePercentV3;
    }>;

export type NarrationPlaybackPreferenceWriteResult =
  | Readonly<{ status: "saved" }>
  | Readonly<{
      status:
        | "invalid-selection"
        | "over-limit"
        | "unavailable"
        | "unsupported-version";
    }>;

export interface NarrationPlaybackPreferenceRepository {
  read(): Promise<NarrationPlaybackPreferenceReadResult>;
  write(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): Promise<NarrationPlaybackPreferenceWriteResult>;
  reset(): Promise<NarrationPlaybackPreferenceWriteResult>;
}

interface PlaybackPreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function failed(
  status: Exclude<NarrationPlaybackPreferenceReadResult["status"], "ready">,
): NarrationPlaybackPreferenceReadResult {
  return Object.freeze({
    status,
    playbackRatePercent: DEFAULT_NARRATION_PLAYBACK_RATE_PERCENT_V1,
  });
}

function decodePlaybackRate(
  value: unknown,
): NarrationPlaybackRatePercentV3 | undefined {
  if (
    !isRecord(value) ||
    Object.keys(value).length !== 2 ||
    value.schemaVersion !== NARRATION_PLAYBACK_PREFERENCE_V1.schemaVersion ||
    !isNarrationPlaybackRatePercentV3(value.playbackRatePercent)
  ) {
    return undefined;
  }
  return value.playbackRatePercent;
}

export function createWebStorageNarrationPlaybackPreferenceRepository(
  storage: () => PlaybackPreferenceStorage = () => window.localStorage,
): NarrationPlaybackPreferenceRepository {
  const write = async (
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): Promise<NarrationPlaybackPreferenceWriteResult> => {
    if (!isNarrationPlaybackRatePercentV3(playbackRatePercent)) {
      return Object.freeze({ status: "invalid-selection" });
    }
    const serialized = JSON.stringify({
      schemaVersion: NARRATION_PLAYBACK_PREFERENCE_V1.schemaVersion,
      playbackRatePercent,
    });
    if (
      utf8Bytes(serialized) >
      NARRATION_PLAYBACK_PREFERENCE_V1.maximumEnvelopeUtf8Bytes
    ) {
      return Object.freeze({ status: "over-limit" });
    }
    try {
      const current = storage().getItem(
        NARRATION_PLAYBACK_PREFERENCE_V1.storageKey,
      );
      if (current !== null) {
        try {
          const decoded: unknown = JSON.parse(current);
          if (
            isRecord(decoded) &&
            typeof decoded.schemaVersion === "number" &&
            Number.isSafeInteger(decoded.schemaVersion) &&
            decoded.schemaVersion >
              NARRATION_PLAYBACK_PREFERENCE_V1.schemaVersion
          ) {
            return Object.freeze({ status: "unsupported-version" });
          }
        } catch {
          // Explicit writes replace malformed prior state.
        }
      }
      storage().setItem(
        NARRATION_PLAYBACK_PREFERENCE_V1.storageKey,
        serialized,
      );
    } catch {
      return Object.freeze({ status: "unavailable" });
    }
    return Object.freeze({ status: "saved" });
  };

  return Object.freeze({
    async read(): Promise<NarrationPlaybackPreferenceReadResult> {
      let serialized: string | null;
      try {
        serialized = storage().getItem(
          NARRATION_PLAYBACK_PREFERENCE_V1.storageKey,
        );
      } catch {
        return failed("unavailable");
      }
      if (serialized === null) {
        return failed("missing");
      }
      if (
        utf8Bytes(serialized) >
        NARRATION_PLAYBACK_PREFERENCE_V1.maximumEnvelopeUtf8Bytes
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
        decoded.schemaVersion > NARRATION_PLAYBACK_PREFERENCE_V1.schemaVersion
      ) {
        return failed("unsupported-version");
      }
      const playbackRatePercent = decodePlaybackRate(decoded);
      return playbackRatePercent === undefined
        ? failed("malformed")
        : Object.freeze({ status: "ready", playbackRatePercent });
    },
    write,
    async reset(): Promise<NarrationPlaybackPreferenceWriteResult> {
      return write(DEFAULT_NARRATION_PLAYBACK_RATE_PERCENT_V1);
    },
  });
}
