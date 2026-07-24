import type {
  OpenedPublication,
  PublicationLocatorRecoveryReason,
  PublicationLocatorResolution,
} from "@voxleaf/epub";
import type {
  BookIdentityV1,
  PersistedReadingStateV1,
  ReadingLocatorV1,
} from "@voxleaf/shared";

import {
  DEFAULT_READER_PREFERENCES,
  type ReaderPreferencesV1,
} from "../reader/reader-preferences";
import type {
  ReaderPositionReadResult,
  ReaderPositionRepository,
  ReaderPreferencesReadResult,
} from "./reader-position-repository";

type ReaderPositionReadFailure = Exclude<
  ReaderPositionReadResult,
  Readonly<{ status: "ready"; state: PersistedReadingStateV1 }>
>;

export type ReaderBookStartReason =
  ReaderPositionReadFailure["status"] | "identity-mismatch" | "unresolved";

export type RestoredReaderPosition =
  | Readonly<{
      mode: "book-start";
      reason: ReaderBookStartReason;
      locator: ReadingLocatorV1;
    }>
  | Readonly<{
      mode: "exact";
      reason: "exact";
      locator: ReadingLocatorV1;
    }>
  | Readonly<{
      mode: "recovered";
      reason: PublicationLocatorRecoveryReason;
      locator: ReadingLocatorV1;
    }>;

export interface ReadyReaderOpenRestoration {
  readonly status: "ready";
  readonly preferences: ReaderPreferencesV1;
  readonly preferenceStatus: ReaderPreferencesReadResult["status"];
  readonly position: RestoredReaderPosition;
}

export interface CancelledReaderOpenRestoration {
  readonly status: "cancelled";
}

export type ReaderOpenRestorationResult =
  CancelledReaderOpenRestoration | ReadyReaderOpenRestoration;

interface RestoredPreferences {
  readonly preferences: ReaderPreferencesV1;
  readonly status: ReaderPreferencesReadResult["status"];
}

const CANCELLED_RESULT: CancelledReaderOpenRestoration = Object.freeze({
  status: "cancelled",
});
const UNAVAILABLE_POSITION_RESULT: ReaderPositionReadResult = Object.freeze({
  status: "unavailable",
});
const UNAVAILABLE_PREFERENCES_RESULT: ReaderPreferencesReadResult =
  Object.freeze({
    status: "unavailable",
  });

function identitiesMatch(left: BookIdentityV1, right: BookIdentityV1): boolean {
  return (
    left.scheme === right.scheme &&
    left.schemeVersion === right.schemeVersion &&
    left.value === right.value
  );
}

async function readPositionSafely(
  repository: ReaderPositionRepository,
  bookIdentity: BookIdentityV1,
): Promise<ReaderPositionReadResult> {
  try {
    return await repository.readPosition(bookIdentity);
  } catch {
    return UNAVAILABLE_POSITION_RESULT;
  }
}

async function readPreferencesSafely(
  repository: ReaderPositionRepository,
): Promise<ReaderPreferencesReadResult> {
  try {
    return await repository.readPreferences();
  } catch {
    return UNAVAILABLE_PREFERENCES_RESULT;
  }
}

function restoredPreferences(
  result: ReaderPreferencesReadResult,
): RestoredPreferences {
  return Object.freeze({
    preferences:
      result.status === "ready"
        ? result.preferences
        : DEFAULT_READER_PREFERENCES,
    status: result.status,
  });
}

function bookStart(
  locator: ReadingLocatorV1,
  reason: ReaderBookStartReason,
): RestoredReaderPosition {
  return Object.freeze({ mode: "book-start", reason, locator });
}

function restoredResolution(
  publication: OpenedPublication,
  state: PersistedReadingStateV1,
  firstLocator: ReadingLocatorV1,
): RestoredReaderPosition {
  if (
    !identitiesMatch(state.bookIdentity, publication.book.identity) ||
    !identitiesMatch(state.locator.bookIdentity, publication.book.identity)
  ) {
    return bookStart(firstLocator, "identity-mismatch");
  }

  let resolution: PublicationLocatorResolution;
  try {
    resolution = publication.resolveLocator(state.locator);
  } catch {
    return bookStart(firstLocator, "unresolved");
  }
  if (
    resolution === undefined ||
    !identitiesMatch(resolution.locator.bookIdentity, publication.book.identity)
  ) {
    return bookStart(firstLocator, "identity-mismatch");
  }

  return resolution.status === "exact"
    ? Object.freeze({
        mode: "exact",
        reason: "exact",
        locator: resolution.locator,
      })
    : Object.freeze({
        mode: "recovered",
        reason: resolution.reason,
        locator: resolution.locator,
      });
}

function restoredPosition(
  publication: OpenedPublication,
  result: ReaderPositionReadResult,
): RestoredReaderPosition {
  const firstLocator = publication.locators[0]?.startLocator;
  if (firstLocator === undefined) {
    throw new Error("A readable publication locator is required.");
  }
  if (result.status !== "ready") {
    return bookStart(firstLocator, result.status);
  }
  return restoredResolution(publication, result.state, firstLocator);
}

/**
 * Reads bounded app-local reader state before one ready publication is
 * presented. Position requests are revisioned so a late storage result can
 * never initialize a replacement publication. Global display preferences are
 * read once per application owner and then kept current in memory.
 */
export class ReaderPositionRestoreCoordinator {
  readonly #repository: ReaderPositionRepository;
  #requestRevision = 0;
  #closed = false;
  #preferences: RestoredPreferences | undefined;
  #preferencesRead: Promise<RestoredPreferences> | undefined;

  public constructor(repository: ReaderPositionRepository) {
    this.#repository = repository;
  }

  public async restore(
    publication: OpenedPublication,
  ): Promise<ReaderOpenRestorationResult> {
    if (this.#closed) {
      return CANCELLED_RESULT;
    }

    const revision = ++this.#requestRevision;
    const [preferences, position] = await Promise.all([
      this.#readPreferences(),
      readPositionSafely(this.#repository, publication.book.identity),
    ]);
    if (this.#closed || revision !== this.#requestRevision) {
      return CANCELLED_RESULT;
    }

    return Object.freeze({
      status: "ready",
      preferences: preferences.preferences,
      preferenceStatus: preferences.status,
      position: restoredPosition(publication, position),
    });
  }

  public setPreferences(preferences: ReaderPreferencesV1): void {
    if (!this.#closed) {
      this.#preferences = Object.freeze({
        preferences,
        status: "ready",
      });
    }
  }

  public cancel(): void {
    if (!this.#closed) {
      this.#requestRevision += 1;
    }
  }

  public close(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#requestRevision += 1;
  }

  async #readPreferences(): Promise<RestoredPreferences> {
    if (this.#preferences !== undefined) {
      return this.#preferences;
    }
    this.#preferencesRead ??= readPreferencesSafely(this.#repository).then(
      (result) => {
        const restored = restoredPreferences(result);
        this.#preferences ??= restored;
        return this.#preferences;
      },
    );
    return this.#preferencesRead;
  }
}
