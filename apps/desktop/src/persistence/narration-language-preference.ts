import {
  DEFAULT_NARRATION_LANGUAGE_V1,
  isNarrationLanguageV1,
  type NarrationLanguageV1,
} from "../tts/narration-language";

export type NarrationLanguagePreferenceReadResult =
  | Readonly<{ status: "ready"; language: NarrationLanguageV1 }>
  | Readonly<{
      status:
        | "malformed"
        | "missing"
        | "over-limit"
        | "unavailable"
        | "unsupported-version";
      language: typeof DEFAULT_NARRATION_LANGUAGE_V1;
    }>;

export type NarrationLanguagePreferenceWriteResult =
  | Readonly<{ status: "saved" }>
  | Readonly<{
      status:
        | "invalid-language"
        | "over-limit"
        | "unavailable"
        | "unsupported-version";
    }>;

export interface NarrationLanguagePreferenceRepository {
  read(): Promise<NarrationLanguagePreferenceReadResult>;
  write(
    language: NarrationLanguageV1,
  ): Promise<NarrationLanguagePreferenceWriteResult>;
}

interface LanguagePreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const NARRATION_LANGUAGE_PREFERENCE_V1 = Object.freeze({
  storageKey: "voxleaf.narration.language-preference",
  schemaVersion: 1,
  maximumEnvelopeUtf16CodeUnits: 96,
});

const FAIL_CLOSED = Object.freeze({
  status: "malformed" as const,
  language: DEFAULT_NARRATION_LANGUAGE_V1,
});

function failed(
  status:
    | "malformed"
    | "missing"
    | "over-limit"
    | "unavailable"
    | "unsupported-version",
): NarrationLanguagePreferenceReadResult {
  return status === "malformed"
    ? FAIL_CLOSED
    : Object.freeze({
        status,
        language: DEFAULT_NARRATION_LANGUAGE_V1,
      });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createWebStorageNarrationLanguagePreferenceRepository(
  storage: () => LanguagePreferenceStorage = () => window.localStorage,
): NarrationLanguagePreferenceRepository {
  return Object.freeze({
    async read(): Promise<NarrationLanguagePreferenceReadResult> {
      let serialized: string | null;
      try {
        serialized = storage().getItem(
          NARRATION_LANGUAGE_PREFERENCE_V1.storageKey,
        );
      } catch {
        return failed("unavailable");
      }
      if (serialized === null) {
        return failed("missing");
      }
      if (
        serialized.length >
        NARRATION_LANGUAGE_PREFERENCE_V1.maximumEnvelopeUtf16CodeUnits
      ) {
        return failed("over-limit");
      }
      let decoded: unknown;
      try {
        decoded = JSON.parse(serialized);
      } catch {
        return failed("malformed");
      }
      if (!isRecord(decoded)) {
        return failed("malformed");
      }
      if (
        typeof decoded.schemaVersion !== "number" ||
        !Number.isSafeInteger(decoded.schemaVersion) ||
        decoded.schemaVersion < 1
      ) {
        return failed("malformed");
      }
      if (
        decoded.schemaVersion !== NARRATION_LANGUAGE_PREFERENCE_V1.schemaVersion
      ) {
        return failed("unsupported-version");
      }
      if (
        Object.keys(decoded).length !== 2 ||
        !Object.hasOwn(decoded, "language") ||
        !isNarrationLanguageV1(decoded.language)
      ) {
        return failed("malformed");
      }
      return Object.freeze({
        status: "ready",
        language: decoded.language,
      });
    },

    async write(
      language: NarrationLanguageV1,
    ): Promise<NarrationLanguagePreferenceWriteResult> {
      if (!isNarrationLanguageV1(language)) {
        return Object.freeze({ status: "invalid-language" });
      }
      try {
        const current = storage().getItem(
          NARRATION_LANGUAGE_PREFERENCE_V1.storageKey,
        );
        if (
          current !== null &&
          current.length >
            NARRATION_LANGUAGE_PREFERENCE_V1.maximumEnvelopeUtf16CodeUnits
        ) {
          return Object.freeze({ status: "over-limit" });
        }
        if (current !== null) {
          const decoded: unknown = JSON.parse(current);
          if (
            isRecord(decoded) &&
            typeof decoded.schemaVersion === "number" &&
            Number.isSafeInteger(decoded.schemaVersion) &&
            decoded.schemaVersion >
              NARRATION_LANGUAGE_PREFERENCE_V1.schemaVersion
          ) {
            return Object.freeze({ status: "unsupported-version" });
          }
        }
      } catch {
        return Object.freeze({ status: "unavailable" });
      }
      const serialized = JSON.stringify({
        schemaVersion: NARRATION_LANGUAGE_PREFERENCE_V1.schemaVersion,
        language,
      });
      if (
        serialized.length >
        NARRATION_LANGUAGE_PREFERENCE_V1.maximumEnvelopeUtf16CodeUnits
      ) {
        return Object.freeze({ status: "over-limit" });
      }
      try {
        storage().setItem(
          NARRATION_LANGUAGE_PREFERENCE_V1.storageKey,
          serialized,
        );
      } catch {
        return Object.freeze({ status: "unavailable" });
      }
      return Object.freeze({ status: "saved" });
    },
  });
}
