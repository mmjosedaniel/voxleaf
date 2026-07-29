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

import type { LocalPublicationOpenFlow } from "./publication/local-publication-open";
import {
  createWebStorageReaderPositionRepository,
  type ReaderPositionRepository,
} from "./persistence/reader-position-repository";
import { bindNarrationPositionPersistence } from "./persistence/narration-position-save-bridge";
import {
  ReaderPositionRestoreCoordinator,
  type ReadyReaderOpenRestoration,
} from "./persistence/reader-position-restore-coordinator";
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
import {
  createReaderLifecycle,
  type ReaderFailureReason,
  type ReaderLifecycleState,
} from "./reader/reader-lifecycle";
import { type ReaderPreferencesV1 } from "./reader/reader-preferences";
import {
  runRasterImageSafetyProbe,
  type RasterImageProbeResult,
} from "./reader/raster-image-probe";
import type { ReaderNarrationSource } from "./reader/segment-highlight-controller";
import { useStrictModeSafeResourceCleanup } from "./strict-mode-resource-cleanup";
import { HardwareCompatibilityControls } from "./tts/HardwareCompatibilityControls";
import { HardwareProfileCompatibilityCoordinator } from "./tts/hardware-profile-compatibility";
import { ProductNarrationControls } from "./tts/ProductNarrationControls";
import { ProductNarrationCoordinator } from "./tts/product-narration-coordinator";

type RasterImageProbeStatus =
  "accepted" | "cancelled" | "idle" | "rejected" | "running";

export interface ReadyPublicationContentProps {
  readonly publication: OpenedPublication;
  readonly initialPreferences?: ReaderPreferencesV1;
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
  readonly createNarrationCoordinator?: (
    publication: OpenedPublication,
    initialLocator: ReadingLocatorV1,
    hardwareCompatibility: HardwareProfileCompatibilityCoordinator,
  ) => ProductNarrationCoordinator;
  readonly ReadyPublicationContent?: ComponentType<ReadyPublicationContentProps>;
  readonly runRasterProbe?: typeof runRasterImageSafetyProbe;
}

const FAILURE_MESSAGE: Readonly<Record<ReaderFailureReason, string>> =
  Object.freeze({
    "close-failed":
      "VoxLeaf could not finish closing the EPUB. Restart VoxLeaf before opening another EPUB.",
    "file-read-failed": "VoxLeaf could not read that local file.",
    "file-too-large": "That file is larger than the 100 MiB EPUB limit.",
    "internal-failure":
      "VoxLeaf could not open that EPUB because of an internal failure.",
    "invalid-epub": "That file is not a valid supported EPUB.",
    "rendering-failed":
      "VoxLeaf could not display that EPUB. Reopen it or choose another local EPUB.",
    "resource-exhausted": "That EPUB exceeds VoxLeaf's safe processing limits.",
    "unsupported-epub": "That EPUB uses features VoxLeaf does not support yet.",
  });

const RASTER_STATUS_MESSAGE: Readonly<Record<RasterImageProbeStatus, string>> =
  Object.freeze({
    accepted: "Bounded local raster decoding is available.",
    cancelled: "Raster safety probe was cancelled.",
    idle: "Raster safety probe has not run.",
    rejected: "Bounded local raster decoding is unavailable.",
    running: "Testing bounded local raster decoding.",
  });

type ReaderRestorationSettlement =
  "pending" | ReaderInitialRestorationSettlement["status"];

interface LoadingReaderRestoration {
  readonly status: "loading";
  readonly publication: OpenedPublication;
  readonly publicationSequence: number;
}

interface ReadyReaderRestoration {
  readonly status: "ready";
  readonly publication: OpenedPublication;
  readonly publicationSequence: number;
  readonly result: ReadyReaderOpenRestoration;
  readonly settlement: ReaderRestorationSettlement;
}

type ReaderRestoration = LoadingReaderRestoration | ReadyReaderRestoration;

function statusMessage(state: ReaderLifecycleState): string {
  switch (state.status) {
    case "closing":
      return "Closing the current EPUB.";
    case "empty":
      return "This EPUB has no supported readable content.";
    case "failure":
      return FAILURE_MESSAGE[state.reason];
    case "idle":
      return "No local EPUB is open.";
    case "opening":
      return "Validating and opening the selected EPUB.";
    case "ready":
      return "The EPUB opened successfully.";
  }
}

function readyStatusMessage(
  restoration: ReaderRestoration | undefined,
): string {
  if (
    restoration === undefined ||
    restoration.status === "loading" ||
    restoration.settlement === "pending"
  ) {
    return "Restoring saved reader state.";
  }
  if (restoration.settlement === "unavailable") {
    return "The EPUB opened, but its saved reading position could not be aligned.";
  }
  if (restoration.settlement === "superseded") {
    return "The EPUB opened successfully.";
  }

  const { position } = restoration.result;
  if (position.mode === "exact") {
    return "Reading position restored.";
  }
  if (position.mode === "recovered") {
    return "Reading position restored to the nearest available passage.";
  }
  if (position.reason === "missing") {
    return "The EPUB opened successfully.";
  }
  if (position.reason === "unavailable") {
    return "The EPUB opened, but saved reader state is unavailable.";
  }
  return "The EPUB opened at the beginning because its saved position could not be used.";
}

function restorationNotice(
  restoration: ReadyReaderRestoration,
): string | undefined {
  const { position } = restoration.result;
  if (restoration.settlement === "unavailable") {
    return "VoxLeaf could not align the saved reading position.";
  }
  if (restoration.settlement !== "settled") {
    return undefined;
  }
  if (position.mode === "recovered") {
    return "The saved reading position was adjusted to the nearest available passage.";
  }
  if (position.mode === "book-start" && position.reason !== "missing") {
    return position.reason === "unavailable"
      ? "Saved reader state is unavailable. Reading continues from the beginning."
      : "The saved reading position could not be used. Reading continues from the beginning.";
  }
  if (
    restoration.result.preferenceStatus !== "ready" &&
    restoration.result.preferenceStatus !== "missing"
  ) {
    return "Saved reader appearance settings could not be used. Default settings are active.";
  }
  return undefined;
}

function rasterStatusForResult(
  result: RasterImageProbeResult,
): RasterImageProbeStatus {
  return result.status;
}

function createDefaultNarrationCoordinator(
  publication: OpenedPublication,
  initialLocator: ReadingLocatorV1,
  hardwareCompatibility: HardwareProfileCompatibilityCoordinator,
): ProductNarrationCoordinator {
  return new ProductNarrationCoordinator(publication, initialLocator, {
    profileCompatibility: hardwareCompatibility,
  });
}

export function App({
  openFlow: suppliedOpenFlow,
  readerPositionRepository: suppliedReaderPositionRepository,
  readerPositionSaveEnvironment,
  hardwareCompatibilityCoordinator: suppliedHardwareCompatibilityCoordinator,
  createNarrationCoordinator = createDefaultNarrationCoordinator,
  ReadyPublicationContent = ReaderPublicationContent,
  runRasterProbe = runRasterImageSafetyProbe,
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
  const activeRasterProbe = useRef<AbortController | undefined>(undefined);
  const [rasterStatus, setRasterStatus] =
    useState<RasterImageProbeStatus>("idle");
  const [readerPositionRestoreCoordinator] = useState(
    () => new ReaderPositionRestoreCoordinator(readerPositionRepository),
  );
  const [readerRestoration, setReaderRestoration] = useState<
    ReaderRestoration | undefined
  >(undefined);
  const [dismissedRestorationSequence, setDismissedRestorationSequence] =
    useState<number | undefined>(undefined);
  const readyPublication =
    viewState.status === "ready" ? viewState.publication : undefined;
  const readyPublicationSequence =
    viewState.status === "ready" ? viewState.publicationSequence : undefined;
  const activeRestoration =
    readerRestoration !== undefined &&
    readerRestoration.publication === readyPublication &&
    readerRestoration.publicationSequence === readyPublicationSequence
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
          ),
    [
      createNarrationCoordinator,
      hardwareCompatibilityCoordinator,
      readyPublication,
      readyRestorationResult,
    ],
  );

  useStrictModeSafeResourceCleanup(narrationCoordinator);

  useEffect(() => {
    void hardwareCompatibilityCoordinator.ensureChecked();
    let observedHidden = document.visibilityState === "hidden";
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "hidden") {
        observedHidden = true;
        return;
      }
      if (observedHidden) {
        observedHidden = false;
        void hardwareCompatibilityCoordinator.check("operating-system-resume");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hardwareCompatibilityCoordinator]);

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
          if (result.status !== "ready") {
            return;
          }
          setReaderRestoration((current) =>
            current?.status === "loading" &&
            current.publication === publication &&
            current.publicationSequence === publicationSequence
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
        activeRasterProbe.current?.abort();
        activeRasterProbe.current = undefined;
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

  const handleRasterProbe = async (): Promise<void> => {
    activeRasterProbe.current?.abort();
    const controller = new AbortController();
    activeRasterProbe.current = controller;
    setRasterStatus("running");

    let result: RasterImageProbeResult;
    try {
      result = await runRasterProbe({ signal: controller.signal });
    } catch {
      result = Object.freeze({ status: "rejected" });
    }
    if (activeRasterProbe.current !== controller) {
      return;
    }
    activeRasterProbe.current = undefined;
    setRasterStatus(rasterStatusForResult(result));
  };

  const handleSelection = (event: ChangeEvent<HTMLInputElement>): void => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    // Browser picker cancellation is not an error and does not replace the
    // current publication or its visible state.
    if (file === null || file === undefined) {
      return;
    }

    closeActivePositionSaveCoordinator();
    readerPositionRestoreCoordinator.cancel();
    void narrationCoordinator?.close();
    void readerLifecycle.open(file);
  };
  const handleReaderPreferencesChange = useCallback(
    (preferences: ReaderPreferencesV1): void => {
      readerPositionRestoreCoordinator.setPreferences(preferences);
      positionSaveCoordinator?.savePreferences(preferences);
    },
    [positionSaveCoordinator, readerPositionRestoreCoordinator],
  );
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
  const handleInitialRestorationSettled = useCallback(
    (settlement: ReaderInitialRestorationSettlement): void => {
      setReaderRestoration((current) =>
        current?.status === "ready" &&
        current.publication === readyPublication &&
        current.publicationSequence === readyPublicationSequence &&
        current.settlement === "pending"
          ? Object.freeze({
              ...current,
              settlement: settlement.status,
            })
          : current,
      );
    },
    [readyPublication, readyPublicationSequence],
  );
  const handleClosePublication = useCallback((): void => {
    readerPositionRestoreCoordinator.cancel();
    closeActivePositionSaveCoordinator();
    void narrationCoordinator?.close();
    void readerLifecycle.close();
  }, [
    closeActivePositionSaveCoordinator,
    narrationCoordinator,
    readerLifecycle,
    readerPositionRestoreCoordinator,
  ]);
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

  const isBusy =
    viewState.status === "closing" ||
    viewState.status === "opening" ||
    (viewState.status === "ready" &&
      (readyRestoration === undefined ||
        readyRestoration.settlement === "pending"));
  const openDisabled =
    viewState.status === "closing" ||
    (viewState.status === "failure" && viewState.reason === "close-failed");
  const statusClassName =
    viewState.status === "failure"
      ? "open-status open-status-error"
      : "open-status";
  const activeRestorationNotice =
    readyRestoration === undefined
      ? undefined
      : restorationNotice(readyRestoration);
  const showRestorationNotice =
    activeRestorationNotice !== undefined &&
    dismissedRestorationSequence !== readyPublicationSequence;
  const ready = viewState.status === "ready";

  return (
    <main className={ready ? "app-shell app-shell-reader" : "app-shell"}>
      <section
        className={ready ? "shell-card shell-card-reader" : "shell-card"}
        aria-labelledby="shell-title"
        aria-busy={isBusy}
      >
        <header
          className={
            ready ? "shell-header shell-header-reader" : "shell-header"
          }
        >
          <div className="shell-brand">
            <p className="shell-label">Private local EPUB reader</p>
            <h1 id="shell-title">VoxLeaf</h1>
            <p className="shell-description">
              Choose a local EPUB to validate and open it entirely on this
              device. VoxLeaf does not retain a filesystem path or upload the
              book.
            </p>
          </div>
          <div className="shell-open-controls">
            <label className="file-picker">
              <span>Open a local EPUB</span>
              <input
                type="file"
                accept=".epub,application/epub+zip"
                aria-describedby="open-status"
                disabled={openDisabled}
                onChange={handleSelection}
              />
            </label>
            <p
              id="open-status"
              className={statusClassName}
              role="status"
              aria-live="polite"
            >
              {ready
                ? readyStatusMessage(activeRestoration)
                : statusMessage(viewState)}
            </p>
          </div>
          {ready ? (
            <HardwareCompatibilityControls
              coordinator={hardwareCompatibilityCoordinator}
              onRecoveryEpisodeReset={() =>
                narrationCoordinator?.resetRecoveryEpisode()
              }
            />
          ) : null}
        </header>
        {ready ? null : (
          <HardwareCompatibilityControls
            coordinator={hardwareCompatibilityCoordinator}
          />
        )}
        {viewState.status === "ready" ? (
          <ReaderErrorBoundary
            key={viewState.publicationSequence}
            onFailure={handleRenderingFailure}
          >
            <section
              className="publication-summary"
              aria-labelledby="publication-title"
            >
              <header className="publication-header">
                <div className="publication-heading">
                  <p className="publication-summary-label">
                    Opened publication
                  </p>
                  <h2 id="publication-title">{viewState.summary.title}</h2>
                  <p className="publication-authors">
                    {viewState.summary.authors.length === 0
                      ? "Author not provided"
                      : `By ${viewState.summary.authors.join(", ")}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="close-publication"
                  onClick={handleClosePublication}
                >
                  Close EPUB
                </button>
              </header>
              {readyRestoration === undefined ? (
                <p className="reader-restoring-state">
                  Preparing the saved reader state.
                </p>
              ) : (
                <>
                  {showRestorationNotice ? (
                    <aside
                      className="reader-restoration-notice"
                      aria-label="Reading position recovery"
                    >
                      <p>{activeRestorationNotice}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setDismissedRestorationSequence(
                            viewState.publicationSequence,
                          )
                        }
                      >
                        Dismiss restoration notice
                      </button>
                    </aside>
                  ) : null}
                  {narrationCoordinator === undefined ? null : (
                    <ProductNarrationControls
                      coordinator={narrationCoordinator}
                    />
                  )}
                  <ReadyPublicationContent
                    publication={viewState.publication}
                    initialPreferences={readyRestoration.result.preferences}
                    {...(readyRestoration.result.position.mode === "book-start"
                      ? {}
                      : {
                          initialLocator:
                            readyRestoration.result.position.locator,
                        })}
                    restoreInitialLocator={
                      readyRestoration.result.position.mode !== "book-start"
                    }
                    onPreferencesChange={handleReaderPreferencesChange}
                    onActiveLocatorChange={handleActiveLocatorChange}
                    onNavigationIntent={handleNavigationIntent}
                    onSettledLocatorChange={handleSettledLocatorChange}
                    onInitialRestorationSettled={
                      handleInitialRestorationSettled
                    }
                    {...(narrationCoordinator === undefined
                      ? {}
                      : { narrationSource: narrationCoordinator })}
                  />
                </>
              )}
            </section>
          </ReaderErrorBoundary>
        ) : null}
        {viewState.status === "empty" ? (
          <section
            className="empty-publication"
            aria-labelledby="empty-publication-title"
          >
            <h2 id="empty-publication-title">No readable content</h2>
            <p>
              VoxLeaf could not find a supported readable passage. Close this
              EPUB or choose another local EPUB.
            </p>
            <button
              type="button"
              className="close-publication"
              onClick={handleClosePublication}
            >
              Close EPUB
            </button>
          </section>
        ) : null}
        {!ready ? (
          <div className="raster-probe">
            <button
              type="button"
              disabled={rasterStatus === "running"}
              onClick={() => void handleRasterProbe()}
            >
              Run synthetic raster safety probe
            </button>
            <p aria-live="polite">{RASTER_STATUS_MESSAGE[rasterStatus]}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
