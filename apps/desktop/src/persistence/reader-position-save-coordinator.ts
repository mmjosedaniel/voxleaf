import type {
  OpenedPublication,
  PublicationLocatorResolution,
} from "@voxleaf/epub";
import {
  createSchemaVersion,
  decodePersistedReadingStateV1,
  type PersistedReadingStateV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";

import type { ReaderPreferencesV1 } from "../reader/reader-preferences";
import type { ReaderPositionRepository } from "./reader-position-repository";

export const PASSIVE_POSITION_SAVE_DEBOUNCE_MS = 500;

type ScheduledPositionKind = "immediate" | "passive";
type LifecycleFlushReason = "hidden" | "pagehide";

export interface ReaderPositionSaveEnvironment {
  schedule(callback: () => void, delayMs: number): () => void;
  subscribeLifecycle(
    callback: (reason: LifecycleFlushReason) => void,
  ): () => void;
}

export interface ReaderPositionSaveCoordinatorOptions {
  readonly environment?: ReaderPositionSaveEnvironment;
  readonly initialLocator?: ReadingLocatorV1;
  readonly persistInitialLocatorOnFlush?: boolean;
}

const EMPTY_READING_PREFERENCES = Object.freeze({});

function scheduleBrowserTimer(
  callback: () => void,
  delayMs: number,
): () => void {
  const timer = globalThis.setTimeout(callback, delayMs);
  return () => globalThis.clearTimeout(timer);
}

function subscribeBrowserLifecycle(
  callback: (reason: LifecycleFlushReason) => void,
): () => void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return () => undefined;
  }

  const onVisibilityChange = (): void => {
    if (document.visibilityState === "hidden") {
      callback("hidden");
    }
  };
  const onPageHide = (): void => callback("pagehide");
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onPageHide);
  return () => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", onPageHide);
  };
}

export const BROWSER_READER_POSITION_SAVE_ENVIRONMENT: ReaderPositionSaveEnvironment =
  Object.freeze({
    schedule: scheduleBrowserTimer,
    subscribeLifecycle: subscribeBrowserLifecycle,
  });

function identitiesEqual(
  left: ReadingLocatorV1["bookIdentity"],
  right: ReadingLocatorV1["bookIdentity"],
): boolean {
  return (
    left.scheme === right.scheme &&
    left.schemeVersion === right.schemeVersion &&
    left.value === right.value
  );
}

function locatorsEqual(
  left: ReadingLocatorV1,
  right: ReadingLocatorV1,
): boolean {
  return (
    left.schemaVersion === right.schemaVersion &&
    identitiesEqual(left.bookIdentity, right.bookIdentity) &&
    left.spineItemId === right.spineItemId &&
    left.spineItemIndex === right.spineItemIndex &&
    left.anchor.kind === right.anchor.kind &&
    left.anchor.formatVersion === right.anchor.formatVersion &&
    left.anchor.value === right.anchor.value &&
    left.anchor.anchorIndex === right.anchor.anchorIndex &&
    left.textOffsetCodePoints === right.textOffsetCodePoints &&
    left.progression === right.progression
  );
}

function preferencesEqual(
  left: ReaderPreferencesV1,
  right: ReaderPreferencesV1,
): boolean {
  return (
    left.schemaVersion === right.schemaVersion &&
    left.textScale === right.textScale &&
    left.lineSpacing === right.lineSpacing &&
    left.contentWidth === right.contentWidth &&
    left.theme === right.theme
  );
}

function createPersistedState(
  locator: ReadingLocatorV1,
): PersistedReadingStateV1 {
  return decodePersistedReadingStateV1({
    schemaVersion: createSchemaVersion(1),
    bookIdentity: locator.bookIdentity,
    locator,
    preferences: EMPTY_READING_PREFERENCES,
  });
}

/**
 * Owns bounded save timing for one active publication.
 *
 * The coordinator accepts only locators that resolve exactly back to
 * themselves through the active publication. It retains no publication
 * content, performs no restoration, and never lets repository failures change
 * the in-memory reading position or publication lifecycle.
 */
export class ReaderPositionSaveCoordinator {
  readonly #publication: OpenedPublication;
  readonly #repository: ReaderPositionRepository;
  readonly #environment: ReaderPositionSaveEnvironment;
  #latestLocator: ReadingLocatorV1;
  #lastRequestedLocator: ReadingLocatorV1 | undefined;
  #lastSavedLocator: ReadingLocatorV1 | undefined;
  #queuedLocator: ReadingLocatorV1 | undefined;
  #writingLocator: ReadingLocatorV1 | undefined;
  #positionDrain: Promise<void> | undefined;
  #cancelPositionSchedule: (() => void) | undefined;
  #scheduledPositionKind: ScheduledPositionKind | undefined;
  #positionSaveRequested: boolean;
  #latestPreferences: ReaderPreferencesV1 | undefined;
  #lastRequestedPreferences: ReaderPreferencesV1 | undefined;
  #lastSavedPreferences: ReaderPreferencesV1 | undefined;
  #queuedPreferences: ReaderPreferencesV1 | undefined;
  #writingPreferences: ReaderPreferencesV1 | undefined;
  #preferencesDrain: Promise<void> | undefined;
  #cancelPreferencesSchedule: (() => void) | undefined;
  #unsubscribeLifecycle: (() => void) | undefined;
  #started = false;
  #closed = false;
  #closePromise: Promise<void> | undefined;

  public constructor(
    publication: OpenedPublication,
    repository: ReaderPositionRepository,
    options: ReaderPositionSaveCoordinatorOptions = {},
  ) {
    const initialLocator =
      options.initialLocator ?? publication.locators[0]?.startLocator;
    if (
      initialLocator === undefined ||
      !identitiesEqual(initialLocator.bookIdentity, publication.book.identity)
    ) {
      throw new Error("A canonical publication locator is required.");
    }

    this.#publication = publication;
    this.#repository = repository;
    this.#environment =
      options.environment ?? BROWSER_READER_POSITION_SAVE_ENVIRONMENT;
    this.#latestLocator = initialLocator;
    this.#positionSaveRequested = options.persistInitialLocatorOnFlush ?? true;
  }

  public start(): void {
    if (this.#started || this.#closed) {
      return;
    }
    this.#started = true;
    this.#unsubscribeLifecycle = this.#environment.subscribeLifecycle(() => {
      void this.flush();
    });
  }

  public schedulePassive(locator: ReadingLocatorV1): boolean {
    return this.#schedulePosition(locator, "passive");
  }

  public scheduleImmediate(locator: ReadingLocatorV1): boolean {
    return this.#schedulePosition(locator, "immediate");
  }

  public savePreferences(preferences: ReaderPreferencesV1): boolean {
    if (
      this.#closed ||
      (this.#lastRequestedPreferences !== undefined &&
        preferencesEqual(this.#lastRequestedPreferences, preferences))
    ) {
      return false;
    }

    this.#latestPreferences = preferences;
    this.#lastRequestedPreferences = preferences;
    this.#cancelPreferencesSchedule?.();
    this.#cancelPreferencesSchedule = this.#environment.schedule(() => {
      this.#cancelPreferencesSchedule = undefined;
      this.#queueLatestPreferences();
    }, 0);
    return true;
  }

  public flush(): Promise<void> {
    if (this.#closed) {
      return this.#closePromise ?? Promise.resolve();
    }
    this.#cancelPendingSchedules();
    this.#queueLatestPosition();
    this.#queueLatestPreferences();
    return this.#currentDrain();
  }

  public close(): Promise<void> {
    if (this.#closePromise !== undefined) {
      return this.#closePromise;
    }

    this.#unsubscribeLifecycle?.();
    this.#unsubscribeLifecycle = undefined;
    this.#cancelPendingSchedules();
    this.#queueLatestPosition();
    this.#queueLatestPreferences();
    this.#closed = true;
    this.#closePromise = this.#currentDrain();
    return this.#closePromise;
  }

  #schedulePosition(
    locator: ReadingLocatorV1,
    kind: ScheduledPositionKind,
  ): boolean {
    if (this.#closed) {
      return false;
    }

    const canonical = this.#validatedCanonicalLocator(locator);
    if (canonical === undefined) {
      return false;
    }

    const duplicate =
      this.#lastRequestedLocator !== undefined &&
      locatorsEqual(this.#lastRequestedLocator, canonical);
    if (
      duplicate &&
      (kind === "passive" || this.#scheduledPositionKind !== "passive")
    ) {
      return false;
    }

    this.#latestLocator = canonical;
    this.#lastRequestedLocator = canonical;
    this.#positionSaveRequested = true;
    if (
      this.#writingLocator === undefined &&
      this.#lastSavedLocator !== undefined &&
      locatorsEqual(this.#lastSavedLocator, canonical)
    ) {
      this.#cancelPositionSchedule?.();
      this.#cancelPositionSchedule = undefined;
      this.#scheduledPositionKind = undefined;
      return false;
    }
    if (kind === "passive" && this.#scheduledPositionKind === "immediate") {
      return true;
    }

    this.#cancelPositionSchedule?.();
    this.#scheduledPositionKind = kind;
    this.#cancelPositionSchedule = this.#environment.schedule(
      () => {
        this.#cancelPositionSchedule = undefined;
        this.#scheduledPositionKind = undefined;
        this.#queueLatestPosition();
      },
      kind === "passive" ? PASSIVE_POSITION_SAVE_DEBOUNCE_MS : 0,
    );
    return true;
  }

  #validatedCanonicalLocator(
    locator: ReadingLocatorV1,
  ): ReadingLocatorV1 | undefined {
    let resolution: PublicationLocatorResolution;
    try {
      resolution = this.#publication.resolveLocator(locator);
    } catch {
      return undefined;
    }
    return resolution.status === "exact" &&
      locatorsEqual(locator, resolution.locator) &&
      identitiesEqual(locator.bookIdentity, this.#publication.book.identity)
      ? resolution.locator
      : undefined;
  }

  #cancelPendingSchedules(): void {
    this.#cancelPositionSchedule?.();
    this.#cancelPositionSchedule = undefined;
    this.#scheduledPositionKind = undefined;
    this.#cancelPreferencesSchedule?.();
    this.#cancelPreferencesSchedule = undefined;
  }

  #queueLatestPosition(): void {
    if (!this.#positionSaveRequested) {
      return;
    }
    const locator = this.#latestLocator;
    if (this.#writingLocator !== undefined) {
      this.#queuedLocator = locatorsEqual(this.#writingLocator, locator)
        ? undefined
        : locator;
      return;
    }
    if (
      this.#lastSavedLocator !== undefined &&
      locatorsEqual(this.#lastSavedLocator, locator)
    ) {
      this.#queuedLocator = undefined;
      return;
    }

    this.#queuedLocator = locator;
    this.#startPositionDrain();
  }

  #startPositionDrain(): void {
    if (this.#positionDrain !== undefined) {
      return;
    }
    const drain = this.#drainPositions();
    this.#positionDrain = drain;
    void drain.finally(() => {
      if (this.#positionDrain === drain) {
        this.#positionDrain = undefined;
      }
    });
  }

  async #drainPositions(): Promise<void> {
    while (this.#queuedLocator !== undefined) {
      const locator = this.#queuedLocator;
      this.#queuedLocator = undefined;
      this.#writingLocator = locator;
      try {
        const result = await this.#repository.writePosition(
          createPersistedState(locator),
        );
        if (result.status === "saved") {
          this.#lastSavedLocator = locator;
        }
      } catch {
        // Storage cannot change or block the active in-memory reader state.
      } finally {
        this.#writingLocator = undefined;
      }
    }
  }

  #queueLatestPreferences(): void {
    const preferences = this.#latestPreferences;
    if (preferences === undefined) {
      return;
    }
    if (this.#writingPreferences !== undefined) {
      this.#queuedPreferences = preferencesEqual(
        this.#writingPreferences,
        preferences,
      )
        ? undefined
        : preferences;
      return;
    }
    if (
      this.#lastSavedPreferences !== undefined &&
      preferencesEqual(this.#lastSavedPreferences, preferences)
    ) {
      this.#queuedPreferences = undefined;
      return;
    }

    this.#queuedPreferences = preferences;
    this.#startPreferencesDrain();
  }

  #startPreferencesDrain(): void {
    if (this.#preferencesDrain !== undefined) {
      return;
    }
    const drain = this.#drainPreferences();
    this.#preferencesDrain = drain;
    void drain.finally(() => {
      if (this.#preferencesDrain === drain) {
        this.#preferencesDrain = undefined;
      }
    });
  }

  async #drainPreferences(): Promise<void> {
    while (this.#queuedPreferences !== undefined) {
      const preferences = this.#queuedPreferences;
      this.#queuedPreferences = undefined;
      this.#writingPreferences = preferences;
      try {
        const result = await this.#repository.writePreferences(preferences);
        if (result.status === "saved") {
          this.#lastSavedPreferences = preferences;
        }
      } catch {
        // Preference persistence is best effort and cannot interrupt reflow.
      } finally {
        this.#writingPreferences = undefined;
      }
    }
  }

  #currentDrain(): Promise<void> {
    const drains = [this.#positionDrain, this.#preferencesDrain].filter(
      (drain): drain is Promise<void> => drain !== undefined,
    );
    return drains.length === 0
      ? Promise.resolve()
      : Promise.all(drains).then(() => undefined);
  }
}
