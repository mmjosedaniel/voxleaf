import type { OpenedPublication } from "@voxleaf/epub";
import type { ReadingLocatorV1 } from "@voxleaf/shared";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type ComponentType,
} from "react";

import {
  ApplicationBar,
  EmptyPublicationNotice,
  ShellWelcome,
  type LifecyclePresentation,
} from "./AppPresentation";
import { ReadyPublicationSection } from "./ReadyPublicationSection";
import {
  applyInitialRestorationSettlement,
  isReaderRestorationForPublication,
  toRestorationPresentation,
  type ReaderRestoration,
} from "./app-reader-restoration";
import type { LocalPublicationOpenFlow } from "./publication/local-publication-open";
import {
  createWebStorageReaderPositionRepository,
  type ReaderPositionRepository,
} from "./persistence/reader-position-repository";
import { bindNarrationPositionPersistence } from "./persistence/narration-position-save-bridge";
import {
  createWebStorageNarrationStartPreferenceRepository,
  DEFAULT_NARRATION_START_PREFERENCE_V1,
  type NarrationStartPreferenceRepository,
} from "./persistence/narration-start-preference";
import {
  createWebStorageNarrationPlaybackPreferenceRepository,
  type NarrationPlaybackPreferenceRepository,
} from "./persistence/narration-playback-preference";
import { ReaderPositionRestoreCoordinator } from "./persistence/reader-position-restore-coordinator";
import {
  ReaderPositionSaveCoordinator,
  type ReaderPositionSaveEnvironment,
} from "./persistence/reader-position-save-coordinator";
import { ReaderErrorBoundary } from "./reader/ReaderErrorBoundary";
import {
  ReaderPublicationContent,
  type ReaderInitialRestorationSettlement,
  type ReaderLocatorSettlementReason,
  type ReaderUserNavigationEvent,
} from "./reader/ReaderPublication";
import { createReaderLifecycle } from "./publication/reader-lifecycle";
import {
  DEFAULT_READER_PREFERENCES,
  updateReaderPreference,
  type ReaderPreferenceName,
  type ReaderPreferencesV1,
} from "./reader/reader-preferences";
import type { ReaderNarrationSource } from "./reader/segment-highlight-controller";
import { useStrictModeSafeResourceCleanup } from "./strict-mode-resource-cleanup";
import { ReaderSettingsDialog } from "./settings/ReaderSettingsDialog";
import {
  bindNarrationStartPreferencePresentation,
  usePreferenceHydration,
  type NarrationStartPreferencePresentation,
  type ReaderPreferencePresentation,
} from "./settings/app-preference-effects";
import { createNarrationSettingsActions } from "./settings/narration-settings-actions";
import { HardwareProfileCompatibilityCoordinator } from "./tts/hardware-profile-compatibility";
import { bindHardwareCompatibilityChecks } from "./tts/hardware-compatibility-check-binding";
import { ProductNarrationControls } from "./tts/ProductNarrationControls";
import { ProductNarrationCoordinator } from "./tts/product-narration-coordinator";
import type { NarrationLanguageV1 } from "./tts/narration-language";
import type { AdaptiveBufferStartMode } from "./tts/adaptive-buffer-scheduler";
import { OptionalChatterboxClient } from "./tts/optional-chatterbox-client";

const narrationSettingsActions = createNarrationSettingsActions(
  import.meta.env.DEV,
);

export interface ReadyPublicationContentProps {
  readonly onNavigationSettlement?: (
    settlement: import("./reader/reader-navigation").ReaderNavigationSettlement,
    reason: ReaderLocatorSettlementReason,
  ) => void;
  readonly publication: OpenedPublication;
  readonly initialPreferences?: ReaderPreferencesV1;
  readonly preferences?: ReaderPreferencesV1;
  readonly initialLocator?: ReadingLocatorV1;
  readonly restoreInitialLocator?: boolean;
  readonly onPreferencesChange?: (preferences: ReaderPreferencesV1) => void;
  readonly onActiveLocatorChange?: (locator: ReadingLocatorV1) => void;
  readonly onNavigationIntent?: (
    event: ReaderUserNavigationEvent,
  ) => void | Promise<void>;
  readonly onSettledLocatorChange?: (
    locator: ReadingLocatorV1,
    reason: ReaderLocatorSettlementReason,
  ) => void;
  readonly onInitialRestorationSettled?: (
    settlement: ReaderInitialRestorationSettlement,
  ) => void;
  readonly narrationSource?: ReaderNarrationSource;
}

export interface AppProps {
  readonly openFlow?: LocalPublicationOpenFlow;
  readonly readerPositionRepository?: ReaderPositionRepository;
  readonly readerPositionSaveEnvironment?: ReaderPositionSaveEnvironment;
  readonly hardwareCompatibilityCoordinator?: HardwareProfileCompatibilityCoordinator;
  readonly narrationStartPreferenceRepository?: NarrationStartPreferenceRepository;
  readonly narrationPlaybackPreferenceRepository?: NarrationPlaybackPreferenceRepository;
  readonly createNarrationCoordinator?: (
    publication: OpenedPublication,
    initialLocator: ReadingLocatorV1,
    hardwareCompatibility: HardwareProfileCompatibilityCoordinator,
    narrationStartPreference: NarrationStartPreferenceRepository,
    narrationPlaybackPreference: NarrationPlaybackPreferenceRepository,
  ) => ProductNarrationCoordinator;
  readonly ReadyPublicationContent?: ComponentType<ReadyPublicationContentProps>;
}

function createDefaultNarrationCoordinator(
  publication: OpenedPublication,
  initialLocator: ReadingLocatorV1,
  hardwareCompatibility: HardwareProfileCompatibilityCoordinator,
  narrationStartPreference: NarrationStartPreferenceRepository,
  narrationPlaybackPreference: NarrationPlaybackPreferenceRepository,
): ProductNarrationCoordinator {
  return new ProductNarrationCoordinator(publication, initialLocator, {
    profileCompatibility: hardwareCompatibility,
    startPreferenceRepository: narrationStartPreference,
    playbackPreferenceRepository: narrationPlaybackPreference,
  });
}

export function App({
  openFlow: suppliedOpenFlow,
  readerPositionRepository: suppliedReaderPositionRepository,
  readerPositionSaveEnvironment,
  hardwareCompatibilityCoordinator: suppliedHardwareCompatibilityCoordinator,
  narrationStartPreferenceRepository:
    suppliedNarrationStartPreferenceRepository,
  narrationPlaybackPreferenceRepository:
    suppliedNarrationPlaybackPreferenceRepository,
  createNarrationCoordinator = createDefaultNarrationCoordinator,
  ReadyPublicationContent = ReaderPublicationContent,
}: AppProps) {
  const [readerLifecycle] = useState(() =>
    createReaderLifecycle({
      ...(suppliedOpenFlow === undefined ? {} : { openFlow: suppliedOpenFlow }),
    }),
  );
  const [readerPositionRepository] = useState(
    () =>
      suppliedReaderPositionRepository ??
      createWebStorageReaderPositionRepository(),
  );
  const [hardwareCompatibilityCoordinator] = useState(
    () =>
      suppliedHardwareCompatibilityCoordinator ??
      new HardwareProfileCompatibilityCoordinator(),
  );
  const [narrationStartPreferenceRepository] = useState(
    () =>
      suppliedNarrationStartPreferenceRepository ??
      createWebStorageNarrationStartPreferenceRepository(),
  );
  const [narrationPlaybackPreferenceRepository] = useState(
    () =>
      suppliedNarrationPlaybackPreferenceRepository ??
      createWebStorageNarrationPlaybackPreferenceRepository(),
  );
  const [optionalChatterbox] = useState(() => new OptionalChatterboxClient());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [readerPreferencePresentation, setReaderPreferencePresentation] =
    useState<ReaderPreferencePresentation>(() => ({
      preferences: DEFAULT_READER_PREFERENCES,
      status: "loading",
      canPersist: true,
    }));
  const currentReaderPreferences = useRef<ReaderPreferencesV1>(
    DEFAULT_READER_PREFERENCES,
  );
  useEffect(() => {
    currentReaderPreferences.current = readerPreferencePresentation.preferences;
  }, [readerPreferencePresentation.preferences]);
  const [fallbackNarrationStart, setFallbackNarrationStart] =
    useState<NarrationStartPreferencePresentation>(() => ({
      selection: DEFAULT_NARRATION_START_PREFERENCE_V1,
      status: "loading",
      canPersist: true,
    }));
  useStrictModeSafeResourceCleanup(hardwareCompatibilityCoordinator);
  const subscribe = useCallback(
    (listener: () => void) => readerLifecycle.subscribe(listener),
    [readerLifecycle],
  );
  const getSnapshot = useCallback(
    () => readerLifecycle.state,
    [readerLifecycle],
  );
  const viewState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [readerPositionRestoreCoordinator] = useState(
    () => new ReaderPositionRestoreCoordinator(readerPositionRepository),
  );
  const [readerRestoration, setReaderRestoration] = useState<
    ReaderRestoration | undefined
  >(undefined);
  const [dismissedRestorationSequence, setDismissedRestorationSequence] =
    useState<number | undefined>(undefined);

  usePreferenceHydration({
    narrationStartPreferenceRepository,
    readerPositionRepository,
    readerPositionRestoreCoordinator,
    defaultReaderPreferences: DEFAULT_READER_PREFERENCES,
    defaultNarrationStartPreference: DEFAULT_NARRATION_START_PREFERENCE_V1,
    setReaderPreferencePresentation,
    setFallbackNarrationStart,
  });
  const readyPublication =
    viewState.status === "ready" ? viewState.publication : undefined;
  const readyPublicationSequence =
    viewState.status === "ready" ? viewState.publicationSequence : undefined;
  const activeRestoration = isReaderRestorationForPublication(
    readerRestoration,
    readyPublication,
    readyPublicationSequence,
  )
    ? readerRestoration
    : undefined;
  const readyRestoration =
    activeRestoration?.status === "ready" ? activeRestoration : undefined;
  const readyRestorationResult = readyRestoration?.result;
  const narrationCoordinator = useMemo(
    () =>
      readyPublication === undefined || readyRestorationResult === undefined
        ? undefined
        : createNarrationCoordinator(
            readyPublication,
            readyRestorationResult.position.locator,
            hardwareCompatibilityCoordinator,
            narrationStartPreferenceRepository,
            narrationPlaybackPreferenceRepository,
          ),
    [
      createNarrationCoordinator,
      hardwareCompatibilityCoordinator,
      narrationStartPreferenceRepository,
      narrationPlaybackPreferenceRepository,
      readyPublication,
      readyRestorationResult,
    ],
  );

  useStrictModeSafeResourceCleanup(narrationCoordinator);

  useEffect(() => {
    if (narrationCoordinator === undefined) {
      return;
    }
    return bindNarrationStartPreferencePresentation(
      narrationCoordinator,
      setFallbackNarrationStart,
    );
  }, [narrationCoordinator]);

  useEffect(
    () =>
      bindHardwareCompatibilityChecks(
        hardwareCompatibilityCoordinator,
        document,
        async () => {
          await narrationCoordinator?.refreshSelectedProfile();
        },
      ),
    [hardwareCompatibilityCoordinator, narrationCoordinator],
  );

  useEffect(() => {
    if (
      readyPublication === undefined ||
      readyPublicationSequence === undefined
    ) {
      readerPositionRestoreCoordinator.cancel();
      return;
    }

    const publication = readyPublication;
    const publicationSequence = readyPublicationSequence;
    let active = true;
    queueMicrotask(() => {
      if (!active) {
        return;
      }
      setReaderRestoration(
        Object.freeze({
          status: "loading",
          publication,
          publicationSequence,
        }),
      );
      void readerPositionRestoreCoordinator
        .restore(publication)
        .then((result) => {
          if (!active || result.status !== "ready") {
            return;
          }
          currentReaderPreferences.current = result.preferences;
          setReaderPreferencePresentation({
            preferences: result.preferences,
            status: result.preferenceStatus,
            canPersist: result.preferenceStatus !== "unsupported-version",
          });
          setReaderRestoration((current) =>
            current?.status === "loading" &&
            isReaderRestorationForPublication(
              current,
              publication,
              publicationSequence,
            )
              ? Object.freeze({
                  status: "ready",
                  publication,
                  publicationSequence,
                  result,
                  settlement:
                    result.position.mode === "book-start"
                      ? "settled"
                      : "pending",
                })
              : current,
          );
        })
        .catch(() => {
          if (
            readerLifecycle.state.status === "ready" &&
            readerLifecycle.state.publication === publication
          ) {
            readerLifecycle.failRendering();
          }
        });
    });
    return () => {
      active = false;
      readerPositionRestoreCoordinator.cancel();
    };
  }, [
    readerLifecycle,
    readerPositionRestoreCoordinator,
    readyPublication,
    readyPublicationSequence,
  ]);

  const positionSaveCoordinator = useMemo(
    () =>
      readyPublication === undefined || readyRestorationResult === undefined
        ? undefined
        : new ReaderPositionSaveCoordinator(
            readyPublication,
            readerPositionRepository,
            {
              ...(readerPositionSaveEnvironment === undefined
                ? {}
                : { environment: readerPositionSaveEnvironment }),
              initialLocator: readyRestorationResult.position.locator,
              persistInitialLocatorOnFlush:
                readyRestorationResult.position.mode === "book-start",
            },
          ),
    [
      readerPositionRepository,
      readerPositionSaveEnvironment,
      readyPublication,
      readyRestorationResult,
    ],
  );
  const activePositionSaveCoordinator = useRef<
    ReaderPositionSaveCoordinator | undefined
  >(undefined);
  const positionSaveCleanupToken = useRef<{ superseded: boolean } | undefined>(
    undefined,
  );
  const closeActivePositionSaveCoordinator = useCallback((): void => {
    const coordinator = activePositionSaveCoordinator.current;
    activePositionSaveCoordinator.current = undefined;
    void coordinator?.close();
  }, []);

  useEffect(() => {
    if (positionSaveCleanupToken.current !== undefined) {
      positionSaveCleanupToken.current.superseded = true;
    }
    const currentCleanup = { superseded: false };
    positionSaveCleanupToken.current = currentCleanup;
    const previous = activePositionSaveCoordinator.current;
    if (previous !== undefined && previous !== positionSaveCoordinator) {
      activePositionSaveCoordinator.current = undefined;
      void previous.close();
    }
    activePositionSaveCoordinator.current = positionSaveCoordinator;
    positionSaveCoordinator?.start();
    return () => {
      queueMicrotask(() => {
        if (currentCleanup.superseded) {
          return;
        }
        if (activePositionSaveCoordinator.current === positionSaveCoordinator) {
          activePositionSaveCoordinator.current = undefined;
        }
        void positionSaveCoordinator?.close();
      });
    };
  }, [positionSaveCoordinator]);

  useEffect(() => {
    if (
      narrationCoordinator === undefined ||
      positionSaveCoordinator === undefined
    ) {
      return;
    }
    return bindNarrationPositionPersistence(
      narrationCoordinator,
      positionSaveCoordinator,
    );
  }, [narrationCoordinator, positionSaveCoordinator]);

  useEffect(() => {
    if (
      positionSaveCoordinator !== undefined &&
      readyRestorationResult?.position.mode === "recovered" &&
      readyRestoration?.settlement === "settled"
    ) {
      positionSaveCoordinator.scheduleImmediate(
        readyRestorationResult.position.locator,
      );
    }
  }, [
    positionSaveCoordinator,
    readyRestoration?.settlement,
    readyRestorationResult,
  ]);

  const applicationCleanupToken = useRef<{ superseded: boolean } | undefined>(
    undefined,
  );
  useEffect(() => {
    if (applicationCleanupToken.current !== undefined) {
      applicationCleanupToken.current.superseded = true;
    }
    const currentCleanup = { superseded: false };
    applicationCleanupToken.current = currentCleanup;
    return () => {
      queueMicrotask(() => {
        if (currentCleanup.superseded) {
          return;
        }
        readerPositionRestoreCoordinator.close();
        closeActivePositionSaveCoordinator();
        void readerLifecycle.cleanup();
      });
    };
  }, [
    closeActivePositionSaveCoordinator,
    readerLifecycle,
    readerPositionRestoreCoordinator,
  ]);

  const handleSelection = (event: ChangeEvent<HTMLInputElement>): void => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    // Browser picker cancellation is not an error and does not replace the
    // current publication or its visible state.
    if (file === null || file === undefined) {
      return;
    }

    setSettingsOpen(false);
    closeActivePositionSaveCoordinator();
    readerPositionRestoreCoordinator.cancel();
    void narrationCoordinator?.close();
    void readerLifecycle.open(file);
  };
  const handleReaderPreferencesChange = useCallback(
    (preferences: ReaderPreferencesV1): void => {
      currentReaderPreferences.current = preferences;
      readerPositionRestoreCoordinator.setPreferences(preferences);
      positionSaveCoordinator?.savePreferences(preferences);
      setReaderPreferencePresentation((current) => ({
        ...current,
        preferences,
        status: "ready",
      }));
    },
    [positionSaveCoordinator, readerPositionRestoreCoordinator],
  );
  const handleReaderPreferenceSettingChange = useCallback(
    (preference: ReaderPreferenceName, value: string): void => {
      const previous = currentReaderPreferences.current;
      const next = updateReaderPreference(previous, preference, value);
      if (next === undefined || next === previous) {
        return;
      }
      currentReaderPreferences.current = next;
      readerPositionRestoreCoordinator.setPreferences(next);
      if (positionSaveCoordinator === undefined) {
        void readerPositionRepository.writePreferences(next);
      } else {
        positionSaveCoordinator.savePreferences(next);
      }
      setReaderPreferencePresentation((current) => ({
        ...current,
        preferences: next,
        status: "ready",
      }));
    },
    [
      positionSaveCoordinator,
      readerPositionRepository,
      readerPositionRestoreCoordinator,
    ],
  );
  const handleFallbackNarrationStartChange = useCallback(
    (selection: AdaptiveBufferStartMode): void => {
      void narrationStartPreferenceRepository
        .write(selection)
        .then((result) => {
          if (result.status === "saved") {
            setFallbackNarrationStart({
              selection,
              status: "ready",
              canPersist: true,
            });
          }
        });
    },
    [narrationStartPreferenceRepository],
  );
  const closeSettings = useCallback((): void => {
    setSettingsOpen(false);
    settingsButtonRef.current?.focus({ preventScroll: true });
  }, []);
  const handleActiveLocatorChange = useCallback(
    (locator: ReadingLocatorV1): void => {
      narrationCoordinator?.updateVisibleLocator(locator);
      positionSaveCoordinator?.schedulePassive(locator);
    },
    [narrationCoordinator, positionSaveCoordinator],
  );
  const handleNavigationIntent = useCallback(
    (event: ReaderUserNavigationEvent): void | Promise<void> =>
      event === "chapter-navigation"
        ? narrationCoordinator?.beginExternalNavigation("chapter-navigation")
        : undefined,
    [narrationCoordinator],
  );
  const handleSettledLocatorChange = useCallback(
    (
      locator: ReadingLocatorV1,
      reason: ReaderLocatorSettlementReason,
    ): void => {
      if (reason === "reflow") {
        narrationCoordinator?.preserveActiveLocator(locator);
        positionSaveCoordinator?.scheduleReflow(locator);
      } else {
        narrationCoordinator?.settleExternalNavigation(locator);
        positionSaveCoordinator?.scheduleImmediate(locator);
      }
    },
    [narrationCoordinator, positionSaveCoordinator],
  );
  const handleNavigationSettlement = useCallback(
    (
      settlement: import("./reader/reader-navigation").ReaderNavigationSettlement,
    ): void => {
      narrationCoordinator?.settleReaderPlacement(settlement);
    },
    [narrationCoordinator],
  );
  const handleInitialRestorationSettled = useCallback(
    (settlement: ReaderInitialRestorationSettlement): void => {
      setReaderRestoration((current) =>
        applyInitialRestorationSettlement(
          current,
          readyPublication,
          readyPublicationSequence,
          settlement.status,
        ),
      );
    },
    [readyPublication, readyPublicationSequence],
  );
  const handleRenderingFailure = useCallback((): void => {
    readerPositionRestoreCoordinator.cancel();
    closeActivePositionSaveCoordinator();
    void narrationCoordinator?.close();
    readerLifecycle.failRendering();
  }, [
    closeActivePositionSaveCoordinator,
    narrationCoordinator,
    readerLifecycle,
    readerPositionRestoreCoordinator,
  ]);
  const handleHardwareProfileSelection = useCallback(
    (profileId: string): Promise<boolean> =>
      narrationSettingsActions.selectProfile(
        profileId,
        hardwareCompatibilityCoordinator,
        narrationCoordinator,
        optionalChatterbox,
      ),
    [
      hardwareCompatibilityCoordinator,
      narrationCoordinator,
      optionalChatterbox,
    ],
  );
  const handleChatterboxRemoval = useCallback(
    (): Promise<void> =>
      narrationSettingsActions.removeChatterbox(
        narrationCoordinator,
        optionalChatterbox,
      ),
    [narrationCoordinator, optionalChatterbox],
  );
  const handleChatterboxActivation = useCallback(
    () =>
      narrationSettingsActions.activateChatterbox(
        handleHardwareProfileSelection,
      ),
    [handleHardwareProfileSelection],
  );
  const handleNarrationLanguageSelection = useCallback(
    (language: NarrationLanguageV1): Promise<boolean> =>
      narrationSettingsActions.selectLanguage(
        language,
        hardwareCompatibilityCoordinator,
        narrationCoordinator,
      ),
    [hardwareCompatibilityCoordinator, narrationCoordinator],
  );
  const handleNarrationSettingsReset = useCallback(
    (): Promise<boolean> =>
      narrationSettingsActions.reset({
        hardware: hardwareCompatibilityCoordinator,
        coordinator: narrationCoordinator,
        startPreference: narrationStartPreferenceRepository,
        playbackPreference: narrationPlaybackPreferenceRepository,
        onStartPreferenceReset: () => {
          setFallbackNarrationStart({
            selection: DEFAULT_NARRATION_START_PREFERENCE_V1,
            status: "ready",
            canPersist: true,
          });
        },
      }),
    [
      hardwareCompatibilityCoordinator,
      narrationCoordinator,
      narrationStartPreferenceRepository,
      narrationPlaybackPreferenceRepository,
    ],
  );

  const isRestoringReader =
    viewState.status === "ready" &&
    (readyRestoration === undefined ||
      readyRestoration.settlement === "pending");
  const hasBlockingCloseFailure =
    viewState.status === "failure" && viewState.reason === "close-failed";
  const isBusy =
    viewState.status === "closing" ||
    viewState.status === "opening" ||
    isRestoringReader;
  const openDisabled =
    viewState.status === "closing" || hasBlockingCloseFailure;
  const lifecyclePresentation: LifecyclePresentation =
    viewState.status === "failure"
      ? { status: "failure", reason: viewState.reason }
      : { status: viewState.status };
  const restorationPresentation = toRestorationPresentation(activeRestoration);
  const ready = viewState.status === "ready";
  const readyReaderProps: ReadyPublicationContentProps | undefined =
    viewState.status === "ready" && readyRestoration !== undefined
      ? {
          publication: viewState.publication,
          initialPreferences: readyRestoration.result.preferences,
          preferences: readerPreferencePresentation.preferences,
          ...(readyRestoration.result.position.mode === "book-start"
            ? {}
            : { initialLocator: readyRestoration.result.position.locator }),
          restoreInitialLocator:
            readyRestoration.result.position.mode !== "book-start",
          onPreferencesChange: handleReaderPreferencesChange,
          onActiveLocatorChange: handleActiveLocatorChange,
          onNavigationIntent: handleNavigationIntent,
          onSettledLocatorChange: handleSettledLocatorChange,
          onNavigationSettlement: handleNavigationSettlement,
          onInitialRestorationSettled: handleInitialRestorationSettled,
          ...(narrationCoordinator === undefined
            ? {}
            : { narrationSource: narrationCoordinator }),
        }
      : undefined;
  const narrationControls =
    narrationCoordinator === undefined ? null : (
      <ProductNarrationControls coordinator={narrationCoordinator} />
    );

  return (
    <main className={ready ? "app-shell app-shell-reader" : "app-shell"}>
      <section
        className={ready ? "shell-card shell-card-reader" : "shell-card"}
        aria-labelledby="shell-title"
        aria-busy={isBusy}
      >
        <ApplicationBar
          ready={ready}
          lifecycle={lifecyclePresentation}
          restoration={restorationPresentation}
          openDisabled={openDisabled}
          onSelection={handleSelection}
          settingsOpen={settingsOpen}
          settingsButtonRef={settingsButtonRef}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        {ready ? null : <ShellWelcome />}
        {viewState.status === "ready" ? (
          <ReaderErrorBoundary
            key={viewState.publicationSequence}
            onFailure={handleRenderingFailure}
          >
            <ReadyPublicationSection
              summary={viewState.summary}
              restoration={restorationPresentation}
              dismissed={
                dismissedRestorationSequence === readyPublicationSequence
              }
              onDismiss={() =>
                setDismissedRestorationSequence(viewState.publicationSequence)
              }
              ReadyPublicationContent={ReadyPublicationContent}
              readerProps={readyReaderProps}
              narrationControls={narrationControls}
            />
          </ReaderErrorBoundary>
        ) : null}
        {viewState.status === "empty" ? <EmptyPublicationNotice /> : null}
        <ReaderSettingsDialog
          open={ready && settingsOpen}
          onClose={closeSettings}
          readerPreferences={readerPreferencePresentation.preferences}
          readerPreferencesStatus={readerPreferencePresentation.status}
          canPersistReaderPreferences={readerPreferencePresentation.canPersist}
          onReaderPreferenceChange={handleReaderPreferenceSettingChange}
          hardwareCompatibility={hardwareCompatibilityCoordinator}
          {...(narrationCoordinator === undefined
            ? {}
            : { narrationCoordinator })}
          fallbackNarrationStart={{
            ...fallbackNarrationStart,
            onSelectionChange: handleFallbackNarrationStartChange,
          }}
          onSelectProfile={handleHardwareProfileSelection}
          onSelectLanguage={handleNarrationLanguageSelection}
          onResetNarrationSettings={handleNarrationSettingsReset}
          onRecoveryEpisodeReset={() =>
            narrationCoordinator?.resetRecoveryEpisode()
          }
          optionalChatterbox={optionalChatterbox}
          onActivateChatterbox={handleChatterboxActivation}
          onRemoveChatterbox={handleChatterboxRemoval}
        />
      </section>
    </main>
  );
}
