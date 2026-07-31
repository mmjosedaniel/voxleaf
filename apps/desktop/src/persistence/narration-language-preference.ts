import {
  DEFAULT_NARRATION_LANGUAGE_V2,
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
      language: typeof DEFAULT_NARRATION_LANGUAGE_V2;
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
  reset(): Promise<NarrationLanguagePreferenceWriteResult>;
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

export const NARRATION_LANGUAGE_PREFERENCE_V2 = Object.freeze({
  storageKey: NARRATION_LANGUAGE_PREFERENCE_V1.storageKey,
  schemaVersion: 2,
  maximumEnvelopeUtf8Bytes: 256,
});

const FAIL_CLOSED = Object.freeze({
  status: "malformed" as const,
  language: DEFAULT_NARRATION_LANGUAGE_V2,
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
        language: DEFAULT_NARRATION_LANGUAGE_V2,
      });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function createWebStorageNarrationLanguagePreferenceRepository(
  storage: () => LanguagePreferenceStorage = () => window.localStorage,
): NarrationLanguagePreferenceRepository {
  return Object.freeze({
    async read(): Promise<NarrationLanguagePreferenceReadResult> {
      let serialized: string | null;
      try {
        serialized = storage().getItem(
          NARRATION_LANGUAGE_PREFERENCE_V2.storageKey,
        );
      } catch {
        return failed("unavailable");
      }
      if (serialized === null) {
        return failed("missing");
      }
      if (
        utf8Bytes(serialized) >
        NARRATION_LANGUAGE_PREFERENCE_V2.maximumEnvelopeUtf8Bytes
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
        decoded.schemaVersion > NARRATION_LANGUAGE_PREFERENCE_V2.schemaVersion
      ) {
        return failed("unsupported-version");
      }
      if (
        decoded.schemaVersion !==
          NARRATION_LANGUAGE_PREFERENCE_V1.schemaVersion &&
        decoded.schemaVersion !== NARRATION_LANGUAGE_PREFERENCE_V2.schemaVersion
      ) {
        return failed("malformed");
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
          NARRATION_LANGUAGE_PREFERENCE_V2.storageKey,
        );
        if (current !== null) {
          try {
            const decoded: unknown = JSON.parse(current);
            if (
              isRecord(decoded) &&
              typeof decoded.schemaVersion === "number" &&
              Number.isSafeInteger(decoded.schemaVersion) &&
              decoded.schemaVersion >
                NARRATION_LANGUAGE_PREFERENCE_V2.schemaVersion
            ) {
              return Object.freeze({ status: "unsupported-version" });
            }
          } catch {
            // A malformed prior value is recoverable through an explicit write.
          }
        }
      } catch {
        return Object.freeze({ status: "unavailable" });
      }
      const serialized = JSON.stringify({
        schemaVersion: NARRATION_LANGUAGE_PREFERENCE_V2.schemaVersion,
        language,
      });
      if (
        utf8Bytes(serialized) >
        NARRATION_LANGUAGE_PREFERENCE_V2.maximumEnvelopeUtf8Bytes
      ) {
        return Object.freeze({ status: "over-limit" });
      }
      try {
        storage().setItem(
          NARRATION_LANGUAGE_PREFERENCE_V2.storageKey,
          serialized,
        );
      } catch {
        return Object.freeze({ status: "unavailable" });
      }
      return Object.freeze({ status: "saved" });
    },

    async reset(): Promise<NarrationLanguagePreferenceWriteResult> {
      return this.write(DEFAULT_NARRATION_LANGUAGE_V2);
    },
  });
}
