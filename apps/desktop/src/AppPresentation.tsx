import type { ChangeEvent, RefObject } from "react";

import type { ReaderPreferencesReadResult } from "./persistence/reader-position-repository";
import type { ReaderBookStartReason } from "./persistence/reader-position-restore-coordinator";
import type { ReaderInitialRestorationSettlement } from "./reader/ReaderPublication";
import type {
  ReaderFailureReason,
  ReaderLifecycleState,
  ReaderPublicationSummary,
} from "./publication/reader-lifecycle";

export type LifecyclePresentation =
  | Readonly<{ status: Exclude<ReaderLifecycleState["status"], "failure"> }>
  | Readonly<{ status: "failure"; reason: ReaderFailureReason }>;

export type RestorationPresentation =
  | Readonly<{ status: "loading" }>
  | Readonly<{
      status: "ready";
      settlement: "pending" | ReaderInitialRestorationSettlement["status"];
      position:
        | Readonly<{ mode: "exact" }>
        | Readonly<{ mode: "recovered" }>
        | Readonly<{ mode: "book-start"; reason: ReaderBookStartReason }>;
      preferenceStatus: ReaderPreferencesReadResult["status"];
    }>;

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

function statusMessage(state: LifecyclePresentation): string {
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
  restoration: RestorationPresentation | undefined,
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

  const { position } = restoration;
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
  restoration: Extract<RestorationPresentation, { status: "ready" }>,
): string | undefined {
  const { position } = restoration;
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
    restoration.preferenceStatus !== "ready" &&
    restoration.preferenceStatus !== "missing"
  ) {
    return "Saved reader appearance settings could not be used. Default settings are active.";
  }
  return undefined;
}

interface ApplicationBarProps {
  readonly ready: boolean;
  readonly lifecycle: LifecyclePresentation;
  readonly restoration: RestorationPresentation | undefined;
  readonly openDisabled: boolean;
  readonly onSelection: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly settingsOpen: boolean;
  readonly settingsButtonRef: RefObject<HTMLButtonElement | null>;
  readonly onOpenSettings: () => void;
}

export function ApplicationBar({
  ready,
  lifecycle,
  restoration,
  openDisabled,
  onSelection,
  settingsOpen,
  settingsButtonRef,
  onOpenSettings,
}: ApplicationBarProps) {
  return (
    <header
      className={`shell-header application-bar ${
        ready ? "application-bar-reader" : "application-bar-empty"
      }`}
    >
      <div className="shell-brand">
        <h1 id="shell-title">VoxLeaf</h1>
      </div>
      <OpenBookControl
        lifecycle={lifecycle}
        restoration={restoration}
        disabled={openDisabled}
        onSelection={onSelection}
      />
      {ready ? (
        <div className="application-bar-actions">
          <button
            ref={settingsButtonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            onClick={onOpenSettings}
          >
            Settings
          </button>
        </div>
      ) : null}
    </header>
  );
}

export function ShellWelcome() {
  return (
    <div className="shell-welcome">
      <p className="shell-label">Private local EPUB reader</p>
      <p className="shell-description">
        Choose a local EPUB to validate and open it entirely on this device.
        VoxLeaf does not retain a filesystem path or upload the book.
      </p>
    </div>
  );
}

export function EmptyPublicationNotice() {
  return (
    <section
      className="empty-publication"
      aria-labelledby="empty-publication-title"
    >
      <h2 id="empty-publication-title">No readable content</h2>
      <p>
        VoxLeaf could not find a supported readable passage. Choose another book
        to continue.
      </p>
    </section>
  );
}

export function OpenBookControl({
  lifecycle,
  restoration,
  disabled,
  onSelection,
}: {
  readonly lifecycle: LifecyclePresentation;
  readonly restoration: RestorationPresentation | undefined;
  readonly disabled: boolean;
  readonly onSelection: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const statusClassName =
    lifecycle.status === "failure"
      ? "open-status open-status-error"
      : "open-status";
  const showOpenStatus =
    lifecycle.status !== "idle" && lifecycle.status !== "ready";
  return (
    <div className="shell-open-controls">
      <label className="file-picker file-picker-button">
        <span>Open a book</span>
        <input
          type="file"
          accept=".epub,application/epub+zip"
          aria-label="Open a book"
          aria-describedby="open-status"
          disabled={disabled}
          onChange={onSelection}
        />
      </label>
      <p
        id="open-status"
        className={`${statusClassName}${showOpenStatus ? "" : " visually-hidden"}`}
        role="status"
        aria-live="polite"
      >
        {lifecycle.status === "ready"
          ? readyStatusMessage(restoration)
          : statusMessage(lifecycle)}
      </p>
    </div>
  );
}

export function PublicationHeading({
  summary,
}: {
  readonly summary: ReaderPublicationSummary;
}) {
  return (
    <header className="publication-header">
      <div className="publication-heading">
        <p className="publication-summary-label">Opened publication</p>
        <h2 id="publication-title">{summary.title}</h2>
        <p className="publication-authors">
          {summary.authors.length === 0
            ? "Author not provided"
            : `By ${summary.authors.join(", ")}`}
        </p>
      </div>
    </header>
  );
}

export function RestorationNotice({
  restoration,
  dismissed,
  onDismiss,
}: {
  readonly restoration: RestorationPresentation | undefined;
  readonly dismissed: boolean;
  readonly onDismiss: () => void;
}) {
  const message =
    restoration?.status === "ready"
      ? restorationNotice(restoration)
      : undefined;
  return dismissed || message === undefined ? null : (
    <aside
      className="reader-restoration-notice"
      aria-label="Reading position recovery"
    >
      <p>{message}</p>
      <button type="button" onClick={onDismiss}>
        Dismiss restoration notice
      </button>
    </aside>
  );
}
