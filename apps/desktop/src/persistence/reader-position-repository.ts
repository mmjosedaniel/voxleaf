import {
  PersistedReadingStateContractError,
  decodePersistedReadingStateV1,
  type BookIdentityV1,
  type PersistedReadingStateV1,
} from "@voxleaf/shared";

import {
  READER_CONTENT_WIDTHS,
  READER_LINE_SPACINGS,
  READER_TEXT_SCALES,
  READER_THEMES,
  type ReaderPreferencesV1,
} from "../reader/reader-preferences";

export const READER_POSITIONS_STORAGE_KEY = "voxleaf.reader.positions";
export const READER_PREFERENCES_STORAGE_KEY = "voxleaf.reader.preferences";
export const MAX_READER_POSITION_STATES = 128;
export const MAX_READER_POSITIONS_CODE_UNITS = 262_144;
export const MAX_READER_PREFERENCES_CODE_UNITS = 1_024;

type RepositoryFailureStatus =
  "malformed" | "over-limit" | "unavailable" | "unsupported-version";

type RepositoryFailure = Readonly<{
  status: RepositoryFailureStatus;
}>;

type RepositoryReadFailure =
  RepositoryFailure | Readonly<{ status: "missing" }>;

export type ReaderPositionReadResult =
  | Readonly<{
      status: "ready";
      state: PersistedReadingStateV1;
    }>
  | RepositoryReadFailure;

export type ReaderPreferencesReadResult =
  | Readonly<{
      status: "ready";
      preferences: ReaderPreferencesV1;
    }>
  | RepositoryReadFailure;

export type ReaderRepositoryWriteResult =
  Readonly<{ status: "saved" }> | RepositoryFailure;

/**
 * Replaceable asynchronous boundary for content-free reader state.
 *
 * Implementations must validate every durable value. Reader components and
 * coordinators depend on this interface rather than a particular storage API.
 */
export interface ReaderPositionRepository {
  readPosition(bookIdentity: BookIdentityV1): Promise<ReaderPositionReadResult>;
  writePosition(
    state: PersistedReadingStateV1,
  ): Promise<ReaderRepositoryWriteResult>;
  readPreferences(): Promise<ReaderPreferencesReadResult>;
  writePreferences(
    preferences: ReaderPreferencesV1,
  ): Promise<ReaderRepositoryWriteResult>;
}

interface ReaderStateStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface WebStorageReaderPositionRepositoryOptions {
  readonly storage?: () => ReaderStateStorage;
}

interface ReadingPositionsEnvelopeV1 {
  readonly schemaVersion: 1;
  readonly states: readonly PersistedReadingStateV1[];
}

type DecodeResult<Value> =
  | Readonly<{
      status: "ready";
      value: Value;
    }>
  | RepositoryFailure;

type EnvelopeVersionResult =
  | Readonly<{
      status: "ready";
      version: number;
    }>
  | Readonly<{ status: "malformed" }>;

const MALFORMED_RESULT = Object.freeze({ status: "malformed" as const });
const MISSING_RESULT = Object.freeze({ status: "missing" as const });
const OVER_LIMIT_RESULT = Object.freeze({ status: "over-limit" as const });
const SAVED_RESULT = Object.freeze({ status: "saved" as const });
const UNAVAILABLE_RESULT = Object.freeze({ status: "unavailable" as const });
const UNSUPPORTED_VERSION_RESULT = Object.freeze({
  status: "unsupported-version" as const,
});

const READER_PREFERENCE_KEYS = Object.freeze([
  "schemaVersion",
  "textScale",
  "lineSpacing",
  "contentWidth",
  "theme",
] as const);

function ready<Value>(value: Value): DecodeResult<Value> {
  return Object.freeze({ status: "ready", value });
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function hasExactKeys(
  record: Readonly<Record<string, unknown>>,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(record);
  return (
    keys.length === expected.length &&
    expected.every((key) => Object.hasOwn(record, key))
  );
}

function inspectEnvelopeVersion(input: unknown): EnvelopeVersionResult {
  const record = readRecord(input);
  if (record === undefined) {
    return MALFORMED_RESULT;
  }

  const version = record.schemaVersion;
  if (
    typeof version !== "number" ||
    !Number.isSafeInteger(version) ||
    version < 1
  ) {
    return MALFORMED_RESULT;
  }

  return Object.freeze({ status: "ready", version });
}

function decodePersistedState(
  input: unknown,
): DecodeResult<PersistedReadingStateV1> {
  try {
    return ready(decodePersistedReadingStateV1(input));
  } catch (error) {
    return error instanceof PersistedReadingStateContractError &&
      error.code === "unsupported-version"
      ? UNSUPPORTED_VERSION_RESULT
      : MALFORMED_RESULT;
  }
}

function identitiesMatch(left: BookIdentityV1, right: BookIdentityV1): boolean {
  return (
    left.scheme === right.scheme &&
    left.schemeVersion === right.schemeVersion &&
    left.value === right.value
  );
}

function decodePositionsEnvelopeV1(
  input: unknown,
): DecodeResult<ReadingPositionsEnvelopeV1> {
  const record = readRecord(input);
  if (
    record === undefined ||
    !hasExactKeys(record, ["schemaVersion", "states"]) ||
    record.schemaVersion !== 1 ||
    !Array.isArray(record.states)
  ) {
    return MALFORMED_RESULT;
  }
  if (record.states.length > MAX_READER_POSITION_STATES) {
    return OVER_LIMIT_RESULT;
  }

  const states: PersistedReadingStateV1[] = [];
  for (const inputState of record.states) {
    const decoded = decodePersistedState(inputState);
    if (decoded.status !== "ready") {
      return decoded;
    }
    if (
      states.some((state) =>
        identitiesMatch(state.bookIdentity, decoded.value.bookIdentity),
      )
    ) {
      return MALFORMED_RESULT;
    }
    states.push(decoded.value);
  }

  return ready(
    Object.freeze({
      schemaVersion: 1,
      states: Object.freeze(states),
    }),
  );
}

function decodeAndMigratePositionsEnvelope(
  input: unknown,
): DecodeResult<ReadingPositionsEnvelopeV1> {
  const version = inspectEnvelopeVersion(input);
  if (version.status !== "ready") {
    return version;
  }

  // Future supported versions dispatch to a complete decoder and pure
  // migration here before the resulting v1/current envelope is admitted.
  switch (version.version) {
    case 1:
      return decodePositionsEnvelopeV1(input);
    default:
      return UNSUPPORTED_VERSION_RESULT;
  }
}

function includes<const Values extends readonly string[]>(
  values: Values,
  candidate: unknown,
): candidate is Values[number] {
  return typeof candidate === "string" && values.includes(candidate);
}

function decodeReaderPreferencesV1(
  input: unknown,
): DecodeResult<ReaderPreferencesV1> {
  const record = readRecord(input);
  if (
    record === undefined ||
    !hasExactKeys(record, READER_PREFERENCE_KEYS) ||
    record.schemaVersion !== 1 ||
    !includes(READER_TEXT_SCALES, record.textScale) ||
    !includes(READER_LINE_SPACINGS, record.lineSpacing) ||
    !includes(READER_CONTENT_WIDTHS, record.contentWidth) ||
    !includes(READER_THEMES, record.theme)
  ) {
    return MALFORMED_RESULT;
  }

  return ready(
    Object.freeze({
      schemaVersion: 1,
      textScale: record.textScale,
      lineSpacing: record.lineSpacing,
      contentWidth: record.contentWidth,
      theme: record.theme,
    }),
  );
}

function decodeAndMigrateReaderPreferences(
  input: unknown,
): DecodeResult<ReaderPreferencesV1> {
  const version = inspectEnvelopeVersion(input);
  if (version.status !== "ready") {
    return version;
  }

  // Preference-envelope migration is intentionally independent from position
  // migration and receives its own explicit version dispatch.
  switch (version.version) {
    case 1:
      return decodeReaderPreferencesV1(input);
    default:
      return UNSUPPORTED_VERSION_RESULT;
  }
}

function decodeSerialized<Value>(
  serialized: string,
  maxCodeUnits: number,
  decode: (input: unknown) => DecodeResult<Value>,
): DecodeResult<Value> {
  if (serialized.length > maxCodeUnits) {
    return OVER_LIMIT_RESULT;
  }

  let input: unknown;
  try {
    input = JSON.parse(serialized) as unknown;
  } catch {
    return MALFORMED_RESULT;
  }
  return decode(input);
}

function decodeSerializedPositions(
  serialized: string,
): DecodeResult<ReadingPositionsEnvelopeV1> {
  return decodeSerialized(
    serialized,
    MAX_READER_POSITIONS_CODE_UNITS,
    decodeAndMigratePositionsEnvelope,
  );
}

function decodeSerializedPreferences(
  serialized: string,
): DecodeResult<ReaderPreferencesV1> {
  return decodeSerialized(
    serialized,
    MAX_READER_PREFERENCES_CODE_UNITS,
    decodeAndMigrateReaderPreferences,
  );
}

function buildPositionsValue(
  newest: PersistedReadingStateV1,
  existing: readonly PersistedReadingStateV1[],
): string | undefined {
  const states = [
    newest,
    ...existing.filter(
      (state) => !identitiesMatch(state.bookIdentity, newest.bookIdentity),
    ),
  ];
  if (states.length > MAX_READER_POSITION_STATES) {
    states.length = MAX_READER_POSITION_STATES;
  }

  while (states.length > 0) {
    const serialized = JSON.stringify({
      schemaVersion: 1,
      states,
    } satisfies ReadingPositionsEnvelopeV1);
    if (serialized.length <= MAX_READER_POSITIONS_CODE_UNITS) {
      return serialized;
    }
    if (states.length === 1) {
      return undefined;
    }
    states.pop();
  }

  return undefined;
}

function storageForBrowser(): ReaderStateStorage {
  return window.localStorage;
}

class WebStorageReaderPositionRepository implements ReaderPositionRepository {
  readonly #storage: () => ReaderStateStorage;

  public constructor(storage: () => ReaderStateStorage) {
    this.#storage = storage;
  }

  public async readPosition(
    bookIdentity: BookIdentityV1,
  ): Promise<ReaderPositionReadResult> {
    let serialized: string | null;
    try {
      serialized = this.#storage().getItem(READER_POSITIONS_STORAGE_KEY);
    } catch {
      return UNAVAILABLE_RESULT;
    }
    if (serialized === null) {
      return MISSING_RESULT;
    }

    const envelope = decodeSerializedPositions(serialized);
    if (envelope.status !== "ready") {
      return envelope;
    }

    const state = envelope.value.states.find((candidate) =>
      identitiesMatch(candidate.bookIdentity, bookIdentity),
    );
    return state === undefined
      ? MISSING_RESULT
      : Object.freeze({ status: "ready", state });
  }

  public async writePosition(
    inputState: PersistedReadingStateV1,
  ): Promise<ReaderRepositoryWriteResult> {
    const state = decodePersistedState(inputState);
    if (state.status !== "ready") {
      return state;
    }

    try {
      const storage = this.#storage();
      const currentValue = storage.getItem(READER_POSITIONS_STORAGE_KEY);
      let existingStates: readonly PersistedReadingStateV1[] = [];

      if (currentValue !== null) {
        const current = decodeSerializedPositions(currentValue);
        switch (current.status) {
          case "ready":
            existingStates = current.value.states;
            break;
          case "malformed":
            break;
          case "over-limit":
          case "unavailable":
          case "unsupported-version":
            return current;
        }
      }

      const serialized = buildPositionsValue(state.value, existingStates);
      if (serialized === undefined) {
        return OVER_LIMIT_RESULT;
      }

      storage.setItem(READER_POSITIONS_STORAGE_KEY, serialized);
      return SAVED_RESULT;
    } catch {
      return UNAVAILABLE_RESULT;
    }
  }

  public async readPreferences(): Promise<ReaderPreferencesReadResult> {
    let serialized: string | null;
    try {
      serialized = this.#storage().getItem(READER_PREFERENCES_STORAGE_KEY);
    } catch {
      return UNAVAILABLE_RESULT;
    }
    if (serialized === null) {
      return MISSING_RESULT;
    }

    const preferences = decodeSerializedPreferences(serialized);
    return preferences.status === "ready"
      ? Object.freeze({
          status: "ready",
          preferences: preferences.value,
        })
      : preferences;
  }

  public async writePreferences(
    inputPreferences: ReaderPreferencesV1,
  ): Promise<ReaderRepositoryWriteResult> {
    const preferences = decodeAndMigrateReaderPreferences(inputPreferences);
    if (preferences.status !== "ready") {
      return preferences;
    }

    const serialized = JSON.stringify(preferences.value);
    if (serialized.length > MAX_READER_PREFERENCES_CODE_UNITS) {
      return OVER_LIMIT_RESULT;
    }

    try {
      const storage = this.#storage();
      const currentValue = storage.getItem(READER_PREFERENCES_STORAGE_KEY);
      if (currentValue !== null) {
        const current = decodeSerializedPreferences(currentValue);
        switch (current.status) {
          case "ready":
          case "malformed":
            break;
          case "over-limit":
          case "unavailable":
          case "unsupported-version":
            return current;
        }
      }

      storage.setItem(READER_PREFERENCES_STORAGE_KEY, serialized);
      return SAVED_RESULT;
    } catch {
      return UNAVAILABLE_RESULT;
    }
  }
}

export function createWebStorageReaderPositionRepository(
  options: WebStorageReaderPositionRepositoryOptions = {},
): ReaderPositionRepository {
  return new WebStorageReaderPositionRepository(
    options.storage ?? storageForBrowser,
  );
}
