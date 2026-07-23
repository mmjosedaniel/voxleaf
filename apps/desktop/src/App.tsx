import { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  createLocalPublicationOpenFlow,
  type LocalPublicationOpenFailureReason,
  type LocalPublicationOpenFlow,
  type LocalPublicationOpenResult,
} from "./publication/local-publication-open";
import {
  runRasterImageSafetyProbe,
  type RasterImageProbeResult,
} from "./reader/raster-image-probe";

interface PublicationSummary {
  readonly title: string;
  readonly authors: readonly string[];
}

type PublicationOpenViewState =
  | { readonly status: "idle" }
  | { readonly status: "opening" }
  | {
      readonly status: "ready";
      readonly summary: PublicationSummary;
    }
  | {
      readonly status: "rejected";
      readonly reason: LocalPublicationOpenFailureReason;
    };

type RasterImageProbeStatus =
  "accepted" | "cancelled" | "idle" | "rejected" | "running";

export interface AppProps {
  readonly openFlow?: LocalPublicationOpenFlow;
  readonly runRasterProbe?: typeof runRasterImageSafetyProbe;
}

const FAILURE_MESSAGE: Readonly<
  Record<LocalPublicationOpenFailureReason, string>
> = Object.freeze({
  "file-read-failed": "VoxLeaf could not read that local file.",
  "file-too-large": "That file is larger than the 100 MiB EPUB limit.",
  "internal-failure":
    "VoxLeaf could not open that EPUB because of an internal failure.",
  "invalid-epub": "That file is not a valid supported EPUB.",
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

function stateForResult(
  result: LocalPublicationOpenResult,
): PublicationOpenViewState {
  switch (result.status) {
    case "cancelled":
      return Object.freeze({ status: "idle" });
    case "rejected":
      return Object.freeze({ status: "rejected", reason: result.reason });
    case "ready":
      return Object.freeze({
        status: "ready",
        summary: Object.freeze({
          title: result.publication.book.metadata.title,
          authors: Object.freeze([...result.publication.book.metadata.authors]),
        }),
      });
  }
}

function statusMessage(state: PublicationOpenViewState): string {
  switch (state.status) {
    case "idle":
      return "No local EPUB is open.";
    case "opening":
      return "Validating and opening the selected EPUB.";
    case "ready":
      return "The EPUB opened successfully.";
    case "rejected":
      return FAILURE_MESSAGE[state.reason];
  }
}

function rasterStatusForResult(
  result: RasterImageProbeResult,
): RasterImageProbeStatus {
  return result.status;
}

export function App({
  openFlow: suppliedOpenFlow,
  runRasterProbe = runRasterImageSafetyProbe,
}: AppProps) {
  const [openFlow] = useState(
    () => suppliedOpenFlow ?? createLocalPublicationOpenFlow(),
  );
  const requestSequence = useRef(0);
  const activeRasterProbe = useRef<AbortController | undefined>(undefined);
  const [viewState, setViewState] = useState<PublicationOpenViewState>({
    status: "idle",
  });
  const [rasterStatus, setRasterStatus] =
    useState<RasterImageProbeStatus>("idle");

  useEffect(
    () => () => {
      requestSequence.current += 1;
      activeRasterProbe.current?.abort();
      activeRasterProbe.current = undefined;
      void openFlow.close();
    },
    [openFlow],
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

  const handleSelection = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    // Browser picker cancellation is not an error and does not replace the
    // current publication or its visible state.
    if (file === null || file === undefined) {
      return;
    }

    const requestId = ++requestSequence.current;
    setViewState({ status: "opening" });

    let result: LocalPublicationOpenResult;
    try {
      result = await openFlow.open(file);
    } catch {
      result = Object.freeze({
        status: "rejected",
        reason: "internal-failure",
      });
    }
    if (requestId !== requestSequence.current) {
      return;
    }
    setViewState(stateForResult(result));
  };

  const isOpening = viewState.status === "opening";
  const statusClassName =
    viewState.status === "rejected"
      ? "open-status open-status-error"
      : "open-status";

  return (
    <main className="app-shell">
      <section
        className="shell-card"
        aria-labelledby="shell-title"
        aria-busy={isOpening}
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
            onChange={(event) => void handleSelection(event)}
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
