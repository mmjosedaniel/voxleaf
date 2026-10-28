import { useEffect } from "react";

import type {
  NarrationStartPreferenceRepository,
  NarrationStartPreferenceReadResult,
} from "../persistence/narration-start-preference";
import type {
  ReaderPositionRepository,
  ReaderPreferencesReadResult,
} from "../persistence/reader-position-repository";
import type { ReaderPositionRestoreCoordinator } from "../persistence/reader-position-restore-coordinator";
import type { ReaderPreferencesV1 } from "../reader/reader-preferences";
import type { AdaptiveBufferStartMode } from "../tts/adaptive-buffer-scheduler";
import type { ProductNarrationSnapshot } from "../tts/product-narration-coordinator";

type ReaderPreferenceStatus = "loading" | ReaderPreferencesReadResult["status"];
type NarrationStartPreferenceStatus =
  "loading" | NarrationStartPreferenceReadResult["status"];

export interface ReaderPreferencePresentation {
  readonly preferences: ReaderPreferencesV1;
  readonly status: ReaderPreferenceStatus;
  readonly canPersist: boolean;
}

export interface NarrationStartPreferencePresentation {
  readonly selection: AdaptiveBufferStartMode;
  readonly status: NarrationStartPreferenceStatus;
  readonly canPersist: boolean;
}

interface PreferenceHydrationOptions {
  readonly readerPositionRepository: Pick<
    ReaderPositionRepository,
    "readPreferences"
  >;
  readonly narrationStartPreferenceRepository: Pick<
    NarrationStartPreferenceRepository,
    "read"
  >;
  readonly readerPositionRestoreCoordinator: Pick<
    ReaderPositionRestoreCoordinator,
    "setPreferences"
  >;
  readonly defaultReaderPreferences: ReaderPreferencesV1;
  readonly defaultNarrationStartPreference: AdaptiveBufferStartMode;
  readonly setReaderPreferencePresentation: (
    presentation: ReaderPreferencePresentation,
  ) => void;
  readonly setFallbackNarrationStart: (
    presentation: NarrationStartPreferencePresentation,
  ) => void;
}

export function usePreferenceHydration({
  readerPositionRepository,
  narrationStartPreferenceRepository,
  readerPositionRestoreCoordinator,
  defaultReaderPreferences,
  defaultNarrationStartPreference,
  setReaderPreferencePresentation,
  setFallbackNarrationStart,
}: PreferenceHydrationOptions): void {
  useEffect(() => {
    let active = true;
    void readerPositionRepository
      .readPreferences()
      .then((result) => {
        if (!active) {
          return;
        }
        const preferences =
          result.status === "ready"
            ? result.preferences
            : defaultReaderPreferences;
        readerPositionRestoreCoordinator.setPreferences(
          preferences,
          result.status,
        );
        setReaderPreferencePresentation({
          preferences,
          status: result.status,
          canPersist: result.status !== "unsupported-version",
        });
      })
      .catch(() => {
        if (active) {
          setReaderPreferencePresentation({
            preferences: defaultReaderPreferences,
            status: "unavailable",
            canPersist: true,
          });
        }
      });
    void narrationStartPreferenceRepository
      .read()
      .then((result) => {
        if (active) {
          setFallbackNarrationStart({
            selection: result.selection,
            status: result.status,
            canPersist: result.status !== "unsupported-version",
          });
        }
      })
      .catch(() => {
        if (active) {
          setFallbackNarrationStart({
            selection: defaultNarrationStartPreference,
            status: "unavailable",
            canPersist: true,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [
    defaultNarrationStartPreference,
    defaultReaderPreferences,
    narrationStartPreferenceRepository,
    readerPositionRepository,
    readerPositionRestoreCoordinator,
    setFallbackNarrationStart,
    setReaderPreferencePresentation,
  ]);
}

interface NarrationStartPreferenceSource {
  observe(): Pick<
    ProductNarrationSnapshot,
    "selection" | "startPreferenceStatus" | "canPersistStartPreference"
  >;
  subscribe(listener: () => void): () => void;
}

export function bindNarrationStartPreferencePresentation(
  source: NarrationStartPreferenceSource,
  publish: (presentation: NarrationStartPreferencePresentation) => void,
): () => void {
  const reconcile = (): void => {
    const snapshot = source.observe();
    publish({
      selection: snapshot.selection,
      status: snapshot.startPreferenceStatus,
      canPersist: snapshot.canPersistStartPreference,
    });
  };
  reconcile();
  return source.subscribe(reconcile);
}
