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

type RasterImageProbeStatus =
  "accepted" | "cancelled" | "idle" | "rejected" | "running";

export interface ReadyPublicationContentProps {
  readonly publication: OpenedPublication;
  readonly initialPreferences?: ReaderPreferencesV1;
  readonly initialLocator?: ReadingLocatorV1;
  readonly restoreInitialLocator?: boolean;
  readonly onPreferencesChange?: (preferences: ReaderPreferencesV1) => void;
  readonly onActiveLocatorChange?: (locator: ReadingLocatorV1) => void;
  readonly onSettledLocatorChange?: (locator: ReadingLocatorV1) => void;
  readonly onInitialRestorationSettled?: (
    settlement: ReaderInitialRestorationSettlement,
  ) => void;
}

export interface AppProps {
  readonly openFlow?: LocalPublicationOpenFlow;
  readonly readerPositionRepository?: ReaderPositionRepository;
  readonly readerPositionSaveEnvironment?: ReaderPositionSaveEnvironment;
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

export function App({
  openFlow: suppliedOpenFlow,
  readerPositionRepository: suppliedReaderPositionRepository,
  readerPositionSaveEnvironment,
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
  const closeActivePositionSaveCoordinator = useCallback((): void => {
    const coordinator = activePositionSaveCoordinator.current;
    activePositionSaveCoordinator.current = undefined;
    void coordinator?.close();
  }, []);

  useEffect(() => {
    if (positionSaveCoordinator === undefined) {
      return;
    }
    activePositionSaveCoordinator.current = positionSaveCoordinator;
    positionSaveCoordinator.start();
    return () => {
      if (activePositionSaveCoordinator.current === positionSaveCoordinator) {
        activePositionSaveCoordinator.current = undefined;
      }
      void positionSaveCoordinator.close();
    };
  }, [positionSaveCoordinator]);

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

  useEffect(
    () => () => {
      activeRasterProbe.current?.abort();
      activeRasterProbe.current = undefined;
      readerPositionRestoreCoordinator.close();
      closeActivePositionSaveCoordinator();
      void readerLifecycle.cleanup();
    },
    [
      closeActivePositionSaveCoordinator,
      readerLifecycle,
      readerPositionRestoreCoordinator,
    ],
  );

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
      positionSaveCoordinator?.schedulePassive(locator);
    },
    [positionSaveCoordinator],
  );
  const handleSettledLocatorChange = useCallback(
    (locator: ReadingLocatorV1): void => {
      positionSaveCoordinator?.scheduleImmediate(locator);
    },
    [positionSaveCoordinator],
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
    void readerLifecycle.close();
  }, [
    closeActivePositionSaveCoordinator,
    readerLifecycle,
    readerPositionRestoreCoordinator,
  ]);
  const handleRenderingFailure = useCallback((): void => {
    readerPositionRestoreCoordinator.cancel();
    closeActivePositionSaveCoordinator();
    readerLifecycle.failRendering();
  }, [
    closeActivePositionSaveCoordinator,
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

  return (
    <main className="app-shell">
      <section
        className={
          viewState.status === "ready"
            ? "shell-card shell-card-reader"
            : "shell-card"
        }
        aria-labelledby="shell-title"
        aria-busy={isBusy}
      >
        <p className="shell-label">Private local EPUB reader</p>
        <h1 id="shell-title">VoxLeaf</h1>
        <p className="shell-description">
          Choose a local EPUB to validate and open it entirely on this device.
          VoxLeaf does not retain a filesystem path or upload the book.
        </p>
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
          {viewState.status === "ready"
            ? readyStatusMessage(activeRestoration)
            : statusMessage(viewState)}
        </p>
        {viewState.status === "ready" ? (
          <ReaderErrorBoundary
            key={viewState.publicationSequence}
            onFailure={handleRenderingFailure}
          >
            <section
              className="publication-summary"
              aria-labelledby="publication-title"
            >
              <p className="publication-summary-label">Opened publication</p>
              <h2 id="publication-title">{viewState.summary.title}</h2>
              <p className="publication-authors">
                {viewState.summary.authors.length === 0
                  ? "Author not provided"
                  : `By ${viewState.summary.authors.join(", ")}`}
              </p>
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
                    onSettledLocatorChange={handleSettledLocatorChange}
                    onInitialRestorationSettled={
                      handleInitialRestorationSettled
                    }
                  />
                </>
              )}
              <button
                type="button"
                className="close-publication"
                onClick={handleClosePublication}
              >
                Close EPUB
              </button>
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
      </section>
    </main>
  );
}
