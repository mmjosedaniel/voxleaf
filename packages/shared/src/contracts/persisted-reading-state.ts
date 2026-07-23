import { validatePersistedReadingStateV1Wire } from "../generated/validators/index.js";
import { createBookId, createSchemaVersion } from "../primitives/index.js";
import type { SchemaVersion } from "../primitives/index.js";
import type { BookIdentityV1 } from "./book.js";
import { LocatorContractError, decodeReadingLocatorV1 } from "./locator.js";
import type { ReadingLocatorV1 } from "./locator.js";

const PERSISTED_READING_STATE_SCHEMA_VERSION_V1 = createSchemaVersion(1);

declare const persistedVoiceIdBrand: unique symbol;
declare const playbackRateBrand: unique symbol;

export type PersistedVoiceId = string & {
  readonly [persistedVoiceIdBrand]: "PersistedVoiceId";
};

export type PlaybackRate = number & {
  readonly [playbackRateBrand]: "PlaybackRate";
};

export type PersistedReadingStateContractErrorCode =
  "malformed" | "unsupported-version";

export class PersistedReadingStateContractError extends Error {
  public readonly code: PersistedReadingStateContractErrorCode;

  public constructor(code: PersistedReadingStateContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Persisted reading state version is unsupported."
        : "Persisted reading state is malformed.",
    );
    this.name = "PersistedReadingStateContractError";
    this.code = code;
  }
}

export interface PersistedReadingPreferencesV1 {
  readonly selectedVoiceId?: PersistedVoiceId;
  readonly playbackRate?: PlaybackRate;
}

export interface PersistedReadingStateV1 {
  readonly schemaVersion: SchemaVersion;
  readonly bookIdentity: BookIdentityV1;
  readonly locator: ReadingLocatorV1;
  readonly preferences: PersistedReadingPreferencesV1;
}

function malformedPersistedReadingState(): never {
  throw new PersistedReadingStateContractError("malformed");
}

function readRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return malformedPersistedReadingState();
  }

  return value as Record<string, unknown>;
}

function readSupportedVersion(value: unknown): SchemaVersion {
  let version: SchemaVersion;

  try {
    version = createSchemaVersion(value);
  } catch {
    return malformedPersistedReadingState();
  }

  if (version !== PERSISTED_READING_STATE_SCHEMA_VERSION_V1) {
    throw new PersistedReadingStateContractError("unsupported-version");
  }

  return version;
}

function createPersistedVoiceId(value: string): PersistedVoiceId {
  return value as PersistedVoiceId;
}

function createPlaybackRate(value: number): PlaybackRate {
  if (!Number.isFinite(value) || value <= 0 || Object.is(value, -0)) {
    return malformedPersistedReadingState();
  }

  return value as PlaybackRate;
}

function bookIdentitiesMatch(
  left: BookIdentityV1,
  right: BookIdentityV1,
): boolean {
  return (
    left.scheme === right.scheme &&
    left.schemeVersion === right.schemeVersion &&
    left.value === right.value
  );
}

function decodeNestedLocator(input: unknown): ReadingLocatorV1 {
  try {
    return decodeReadingLocatorV1(input);
  } catch (error) {
    if (error instanceof LocatorContractError) {
      throw new PersistedReadingStateContractError(error.code);
    }

    throw error;
  }
}

export function decodePersistedReadingStateV1(
  input: unknown,
): PersistedReadingStateV1 {
  const state = readRecord(input);
  const schemaVersion = readSupportedVersion(state.schemaVersion);
  const locator = decodeNestedLocator(state.locator);

  if (!validatePersistedReadingStateV1Wire(input)) {
    return malformedPersistedReadingState();
  }

  const bookIdentity = Object.freeze({
    scheme: input.bookIdentity.scheme,
    schemeVersion: createSchemaVersion(input.bookIdentity.schemeVersion),
    value: createBookId(input.bookIdentity.value),
  });

  if (!bookIdentitiesMatch(bookIdentity, locator.bookIdentity)) {
    return malformedPersistedReadingState();
  }

  const preferences = Object.freeze({
    ...(input.preferences.selectedVoiceId === undefined
      ? {}
      : {
          selectedVoiceId: createPersistedVoiceId(
            input.preferences.selectedVoiceId,
          ),
        }),
    ...(input.preferences.playbackRate === undefined
      ? {}
      : {
          playbackRate: createPlaybackRate(input.preferences.playbackRate),
        }),
  });

  return Object.freeze({
    schemaVersion,
    bookIdentity,
    locator,
    preferences,
  });
}
