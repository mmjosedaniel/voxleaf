import type { OpenedPublication } from "@voxleaf/epub";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type ComponentType,
} from "react";

import type { LocalPublicationOpenFlow } from "./publication/local-publication-open";
import { ReaderErrorBoundary } from "./reader/ReaderErrorBoundary";
import { SemanticPublicationContent } from "./reader/SemanticDocument";
import {
  createReaderLifecycle,
  type ReaderFailureReason,
  type ReaderLifecycleState,
} from "./reader/reader-lifecycle";
import {
  runRasterImageSafetyProbe,
  type RasterImageProbeResult,
} from "./reader/raster-image-probe";

type RasterImageProbeStatus =
  "accepted" | "cancelled" | "idle" | "rejected" | "running";

export interface ReadyPublicationContentProps {
  readonly publication: OpenedPublication;
}

export interface AppProps {
  readonly openFlow?: LocalPublicationOpenFlow;
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

function rasterStatusForResult(
  result: RasterImageProbeResult,
): RasterImageProbeStatus {
  return result.status;
}

export function App({
  openFlow: suppliedOpenFlow,
  ReadyPublicationContent = SemanticPublicationContent,
  runRasterProbe = runRasterImageSafetyProbe,
}: AppProps) {
  const [readerLifecycle] = useState(() =>
    createReaderLifecycle({
      ...(suppliedOpenFlow === undefined ? {} : { openFlow: suppliedOpenFlow }),
    }),
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

  useEffect(
    () => () => {
      activeRasterProbe.current?.abort();
      activeRasterProbe.current = undefined;
      void readerLifecycle.cleanup();
    },
    [readerLifecycle],
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

    void readerLifecycle.open(file);
  };

  const isBusy =
    viewState.status === "closing" || viewState.status === "opening";
  const openDisabled =
    viewState.status === "closing" ||
    (viewState.status === "failure" && viewState.reason === "close-failed");
  const statusClassName =
    viewState.status === "failure"
      ? "open-status open-status-error"
      : "open-status";

  return (
    <main className="app-shell">
      <section
        className="shell-card"
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
          {statusMessage(viewState)}
        </p>
        {viewState.status === "ready" ? (
          <ReaderErrorBoundary
            key={viewState.publicationSequence}
            onFailure={() => readerLifecycle.failRendering()}
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
              <ReadyPublicationContent publication={viewState.publication} />
              <button
                type="button"
                className="close-publication"
                onClick={() => void readerLifecycle.close()}
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
              onClick={() => void readerLifecycle.close()}
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
