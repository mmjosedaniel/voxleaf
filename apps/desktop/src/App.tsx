import type { OpenedPublication } from "@voxleaf/epub";
import type { ReadingLocatorV1 } from "@voxleaf/shared";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  type ReaderRepositoryWriteResult,
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
import {
  OptionalChatterboxClient,
  CHATTERBOX_OPTIONAL_PROFILE_ID,
} from "./tts/optional-chatterbox-client";

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
  const preferenceWriteEpoch = useRef(0);
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
  const narrationCloseBarrier = useRef(Promise.resolve(true));
  const pendingChatterboxRemoval = useRef<Promise<void> | undefined>(undefined);
  const profileSelectionOperation = useRef(0);
  const pendingNarrationReset = useRef<Promise<boolean> | undefined>(undefined);
  const [narrationResetPending, setNarrationResetPending] = useState(false);
  const [narrationHandoff, setNarrationHandoff] = useState<
    "ready" | "pending" | "failed"
  >("ready");
  const narrationCoordinator = useMemo(
    () =>
      readyPublication === undefined ||
      readyRestorationResult === undefined ||
      narrationHandoff !== "ready"
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
      narrationHandoff,
    ],
  );

  useStrictModeSafeResourceCleanup(narrationCoordinator);
  useLayoutEffect(() => {
    // Even absent-to-created ownership invalidates selection for the same book.
    profileSelectionOperation.current += 1;
  }, [narrationCoordinator]);

  const containNarrationForReplacement = useCallback((): void => {
    if (
      narrationCoordinator === undefined &&
      pendingChatterboxRemoval.current === undefined
    )
      return;
    setNarrationHandoff("pending");
    const close = narrationCoordinator?.close() ?? Promise.resolve("contained");
    const barrier = Promise.all([
      narrationCloseBarrier.current,
      close,
      pendingChatterboxRemoval.current?.catch(() => undefined),
    ]).then(
      ([previousContained, currentContained]) =>
        previousContained && currentContained === "contained",
      () => false,
    );
    narrationCloseBarrier.current = barrier;
    void barrier.then((contained) => {
      if (narrationCloseBarrier.current === barrier) {
        setNarrationHandoff(contained ? "ready" : "failed");
      }
    });
  }, [narrationCoordinator]);

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
      let active = true;
      queueMicrotask(() => {
        if (!active) return;
        setReaderRestoration((current) => {
          const state = readerLifecycle.state;
          return state.status === "ready" &&
            current !== undefined &&
            isReaderRestorationForPublication(
              current,
              state.publication,
              state.publicationSequence,
            )
            ? current
            : undefined;
        });
      });
      return () => {
        active = false;
      };
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

  const reportPreferenceWrite = useCallback(
    (
      preferences: ReaderPreferencesV1,
      result: ReaderRepositoryWriteResult,
    ): void => {
      const current = currentReaderPreferences.current;
      if (
        current.textScale !== preferences.textScale ||
        current.lineSpacing !== preferences.lineSpacing ||
        current.contentWidth !== preferences.contentWidth ||
        current.theme !== preferences.theme
      )
        return;
      const status = result.status === "saved" ? "ready" : result.status;
      readerPositionRestoreCoordinator.setPreferences(preferences, status);
      setReaderPreferencePresentation({
        preferences,
        status,
        canPersist: status !== "unsupported-version",
      });
    },
    [readerPositionRestoreCoordinator],
  );
  useEffect(() => {
    if (narrationCoordinator === undefined) return;
    let previous = optionalChatterbox.observe().state;
    let acquisitionObserved = false;
    return optionalChatterbox.subscribe(() => {
      const next = optionalChatterbox.observe().state;
      if (
        next !== previous &&
        (next === "confirming" ||
          next === "downloading" ||
          next === "verifying")
      )
        acquisitionObserved = true;
      const completed =
        acquisitionObserved &&
        next === "installed" &&
        (previous === "confirming" ||
          previous === "downloading" ||
          previous === "verifying");
      previous = next;
      if (next === "installed" || next === "absent" || next === "failed")
        acquisitionObserved = false;
      if (
        completed &&
        readerLifecycle.state.status === "ready" &&
        readerLifecycle.state.publication === readyPublication &&
        narrationCoordinator.observe().profileId ===
          CHATTERBOX_OPTIONAL_PROFILE_ID
      ) {
        void narrationCoordinator
          .refreshSelectedProfile()
          .catch(() => undefined);
      }
    });
  }, [
    narrationCoordinator,
    optionalChatterbox,
    readerLifecycle,
    readyPublication,
  ]);

  const positionSaveCoordinator = useMemo(() => {
    if (readyPublication === undefined || readyRestorationResult === undefined)
      return undefined;
    const coordinator = new ReaderPositionSaveCoordinator(
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
    );
    return coordinator;
  }, [
    readerPositionRepository,
    readerPositionSaveEnvironment,
    readyPublication,
    readyRestorationResult,
  ]);
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
    positionSaveCoordinator?.setOnPreferencesWritten((preferences, result) => {
      if (activePositionSaveCoordinator.current === positionSaveCoordinator)
        reportPreferenceWrite(preferences, result);
    });
    positionSaveCoordinator?.start();
    return () => {
      positionSaveCoordinator?.setOnPreferencesWritten(undefined);
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
  }, [positionSaveCoordinator, reportPreferenceWrite]);

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
      preferenceWriteEpoch.current += 1;
      profileSelectionOperation.current += 1;
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
    if (
      file === null ||
      file === undefined ||
      pendingNarrationReset.current !== undefined
    ) {
      return;
    }

    setSettingsOpen(false);
    preferenceWriteEpoch.current += 1;
    profileSelectionOperation.current += 1;
    closeActivePositionSaveCoordinator();
    readerPositionRestoreCoordinator.cancel();
    containNarrationForReplacement();
    void readerLifecycle.open(file);
  };
  const handleReaderPreferencesChange = useCallback(
    (preferences: ReaderPreferencesV1): void => {
      currentReaderPreferences.current = preferences;
      readerPositionRestoreCoordinator.setPreferences(
        preferences,
        readerPreferencePresentation.status === "loading"
          ? "unavailable"
          : readerPreferencePresentation.status,
      );
      positionSaveCoordinator?.savePreferences(preferences);
      setReaderPreferencePresentation((current) => ({
        ...current,
        preferences,
      }));
    },
    [
      positionSaveCoordinator,
      readerPositionRestoreCoordinator,
      readerPreferencePresentation.status,
    ],
  );
  const handleReaderPreferenceSettingChange = useCallback(
    (preference: ReaderPreferenceName, value: string): void => {
      const previous = currentReaderPreferences.current;
      const next = updateReaderPreference(previous, preference, value);
      if (next === undefined || next === previous) {
        return;
      }
      currentReaderPreferences.current = next;
      readerPositionRestoreCoordinator.setPreferences(
        next,
        readerPreferencePresentation.status === "loading"
          ? "unavailable"
          : readerPreferencePresentation.status,
      );
      if (positionSaveCoordinator === undefined) {
        const epoch = ++preferenceWriteEpoch.current;
        void Promise.resolve()
          .then(() => readerPositionRepository.writePreferences(next))
          .catch((): ReaderRepositoryWriteResult => ({ status: "unavailable" }))
          .then((result) => {
            if (epoch === preferenceWriteEpoch.current)
              reportPreferenceWrite(next, result);
          });
      } else {
        positionSaveCoordinator.savePreferences(next);
      }
      setReaderPreferencePresentation((current) => ({
        ...current,
        preferences: next,
      }));
    },
    [
      positionSaveCoordinator,
      readerPositionRepository,
      readerPositionRestoreCoordinator,
      readerPreferencePresentation.status,
      reportPreferenceWrite,
    ],
  );
  const handleFallbackNarrationStartChange = useCallback(
    async (selection: AdaptiveBufferStartMode): Promise<boolean> => {
      const result = await narrationStartPreferenceRepository.write(selection);
      if (result.status !== "saved") return false;
      setFallbackNarrationStart({
        selection,
        status: "ready",
        canPersist: true,
      });
      return true;
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
        positionSaveCoordinator?.scheduleReflow();
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
    profileSelectionOperation.current += 1;
    readerPositionRestoreCoordinator.cancel();
    closeActivePositionSaveCoordinator();
    containNarrationForReplacement();
    readerLifecycle.failRendering();
  }, [
    closeActivePositionSaveCoordinator,
    containNarrationForReplacement,
    readerLifecycle,
    readerPositionRestoreCoordinator,
  ]);
  const handleHardwareProfileSelection = useCallback(
    (profileId: string): Promise<boolean> => {
      const operation = ++profileSelectionOperation.current;
      const publication = readyPublication;
      return narrationSettingsActions.selectProfile(
        profileId,
        hardwareCompatibilityCoordinator,
        narrationCoordinator,
        optionalChatterbox,
        () =>
          profileSelectionOperation.current === operation &&
          readerLifecycle.state.status === "ready" &&
          readerLifecycle.state.publication === publication,
      );
    },
    [
      hardwareCompatibilityCoordinator,
      narrationCoordinator,
      optionalChatterbox,
      readyPublication,
      readerLifecycle,
    ],
  );
  const handleChatterboxRemoval = useCallback((): Promise<void> => {
    if (pendingChatterboxRemoval.current !== undefined)
      return pendingChatterboxRemoval.current;
    // Own removal before its first asynchronous step, across publication lifetimes.
    const removal = Promise.resolve()
      .then(() =>
        narrationSettingsActions.removeChatterbox(
          narrationCoordinator,
          optionalChatterbox,
          narrationCoordinator === undefined
            ? containNarrationForReplacement
            : undefined,
        ),
      )
      .finally(() => {
        if (pendingChatterboxRemoval.current === removal)
          pendingChatterboxRemoval.current = undefined;
      });
    pendingChatterboxRemoval.current = removal;
    return removal;
  }, [
    containNarrationForReplacement,
    narrationCoordinator,
    optionalChatterbox,
  ]);
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
  const handleNarrationSettingsReset = useCallback((): Promise<boolean> => {
    if (pendingNarrationReset.current !== undefined)
      return pendingNarrationReset.current;
    setNarrationResetPending(true);
    const reset = Promise.resolve()
      .then(() =>
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
      )
      .finally(() => {
        if (pendingNarrationReset.current === reset) {
          pendingNarrationReset.current = undefined;
          setNarrationResetPending(false);
        }
      });
    pendingNarrationReset.current = reset;
    return reset;
  }, [
    hardwareCompatibilityCoordinator,
    narrationCoordinator,
    narrationStartPreferenceRepository,
    narrationPlaybackPreferenceRepository,
  ]);

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
    viewState.status === "closing" ||
    hasBlockingCloseFailure ||
    narrationResetPending;
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
      <ProductNarrationControls
        coordinator={narrationCoordinator}
        settingsPending={narrationResetPending}
      />
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
        {narrationHandoff === "pending" ? (
          <p role="status">Stopping previous narration.</p>
        ) : narrationHandoff === "failed" ? (
          <p role="alert">
            Narration could not be stopped. Restart VoxLeaf before playing
            another book.
          </p>
        ) : null}
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
          narrationSettingsPending={narrationResetPending}
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
