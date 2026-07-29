import { HARDWARE_PROFILE_AUTHORITY_V1 } from "../tts/hardware-profile-authority";

export type HardwareProfilePreferenceReadResult =
  | Readonly<{ status: "ready"; profileId: string }>
  | Readonly<{
      status:
        | "malformed"
        | "missing"
        | "over-limit"
        | "unavailable"
        | "unsupported-version";
    }>;

export type HardwareProfilePreferenceWriteResult =
  | Readonly<{ status: "saved" }>
  | Readonly<{
      status:
        | "invalid-profile"
        | "over-limit"
        | "unavailable"
        | "unsupported-version";
    }>;

export interface HardwareProfilePreferenceRepository {
  read(): Promise<HardwareProfilePreferenceReadResult>;
  write(profileId: string): Promise<HardwareProfilePreferenceWriteResult>;
}

interface ProfilePreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface WebStorageHardwareProfilePreferenceRepositoryOptions {
  readonly storage?: () => ProfilePreferenceStorage;
}

const MALFORMED = Object.freeze({ status: "malformed" as const });
const MISSING = Object.freeze({ status: "missing" as const });
const OVER_LIMIT = Object.freeze({ status: "over-limit" as const });
const UNAVAILABLE = Object.freeze({ status: "unavailable" as const });
const UNSUPPORTED_VERSION = Object.freeze({
  status: "unsupported-version" as const,
});
const INVALID_PROFILE = Object.freeze({ status: "invalid-profile" as const });
const SAVED = Object.freeze({ status: "saved" as const });
const TEXT_ENCODER = new TextEncoder();

function isBoundedProfileId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    Array.from(value).length <=
      HARDWARE_PROFILE_AUTHORITY_V1.preference.maximumProfileIdCodePoints &&
    TEXT_ENCODER.encode(value).byteLength <=
      HARDWARE_PROFILE_AUTHORITY_V1.preference.maximumProfileIdUtf8Bytes
  );
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactEnvelope(
  value: Readonly<Record<string, unknown>>,
): value is Readonly<{ schemaVersion: 1; profileId: string }> {
  const keys = Object.keys(value);
  return (
    keys.length === 2 &&
    Object.hasOwn(value, "schemaVersion") &&
    Object.hasOwn(value, "profileId") &&
    value.schemaVersion ===
      HARDWARE_PROFILE_AUTHORITY_V1.preference.schemaVersion &&
    isBoundedProfileId(value.profileId)
  );
}

export function createWebStorageHardwareProfilePreferenceRepository({
  storage = () => window.localStorage,
}: WebStorageHardwareProfilePreferenceRepositoryOptions = {}): HardwareProfilePreferenceRepository {
  return Object.freeze({
    async read(): Promise<HardwareProfilePreferenceReadResult> {
      let serialized: string | null;
      try {
        serialized = storage().getItem(
          HARDWARE_PROFILE_AUTHORITY_V1.preference.storageKey,
        );
      } catch {
        return UNAVAILABLE;
      }
      if (serialized === null) {
        return MISSING;
      }
      if (
        serialized.length >
        HARDWARE_PROFILE_AUTHORITY_V1.preference.maximumEnvelopeUtf16CodeUnits
      ) {
        return OVER_LIMIT;
      }

      let decoded: unknown;
      try {
        decoded = JSON.parse(serialized);
      } catch {
        return MALFORMED;
      }
      if (!isRecord(decoded)) {
        return MALFORMED;
      }
      const version = decoded.schemaVersion;
      if (
        typeof version !== "number" ||
        !Number.isSafeInteger(version) ||
        version < 1
      ) {
        return MALFORMED;
      }
      if (version !== HARDWARE_PROFILE_AUTHORITY_V1.preference.schemaVersion) {
        return UNSUPPORTED_VERSION;
      }
      if (!exactEnvelope(decoded)) {
        return MALFORMED;
      }
      return Object.freeze({
        status: "ready",
        profileId: decoded.profileId,
      });
    },

    async write(
      profileId: string,
    ): Promise<HardwareProfilePreferenceWriteResult> {
      if (!isBoundedProfileId(profileId)) {
        return INVALID_PROFILE;
      }
      try {
        const current = storage().getItem(
          HARDWARE_PROFILE_AUTHORITY_V1.preference.storageKey,
        );
        if (current !== null) {
          if (
            current.length >
            HARDWARE_PROFILE_AUTHORITY_V1.preference
              .maximumEnvelopeUtf16CodeUnits
          ) {
            return OVER_LIMIT;
          }
          const decoded: unknown = JSON.parse(current);
          if (
            isRecord(decoded) &&
            typeof decoded.schemaVersion === "number" &&
            Number.isSafeInteger(decoded.schemaVersion) &&
            decoded.schemaVersion >
              HARDWARE_PROFILE_AUTHORITY_V1.preference.schemaVersion
          ) {
            return UNSUPPORTED_VERSION;
          }
        }
      } catch {
        return UNAVAILABLE;
      }
      const serialized = JSON.stringify({
        schemaVersion: HARDWARE_PROFILE_AUTHORITY_V1.preference.schemaVersion,
        profileId,
      });
      if (
        serialized.length >
        HARDWARE_PROFILE_AUTHORITY_V1.preference.maximumEnvelopeUtf16CodeUnits
      ) {
        return OVER_LIMIT;
      }
      try {
        storage().setItem(
          HARDWARE_PROFILE_AUTHORITY_V1.preference.storageKey,
          serialized,
        );
      } catch {
        return UNAVAILABLE;
      }
      return SAVED;
    },
  });
}
