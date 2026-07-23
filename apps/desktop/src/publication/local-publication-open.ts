import type { OpenedPublication } from "@voxleaf/epub";
import type { OperationalErrorCodeV1 } from "@voxleaf/shared";

import {
  readLocalEpubFile,
  type LocalEpubFileReadFailureReason,
  type LocalEpubFileReadResult,
} from "../file-ingress/local-epub-file";
import {
  createPublicationSession,
  type PublicationSession,
  type PublicationSessionCloseResult,
  type PublicationSessionOpenResult,
} from "./publication-session";

export type LocalPublicationOpenFailureReason =
  | "file-read-failed"
  | "file-too-large"
  | "internal-failure"
  | "invalid-epub"
  | "resource-exhausted"
  | "unsupported-epub";

export interface ReadyLocalPublicationOpenResult {
  readonly status: "ready";
  readonly publication: OpenedPublication;
}

export interface CancelledLocalPublicationOpenResult {
  readonly status: "cancelled";
}

export interface RejectedLocalPublicationOpenResult {
  readonly status: "rejected";
  readonly reason: LocalPublicationOpenFailureReason;
}

export type LocalPublicationOpenResult =
  | CancelledLocalPublicationOpenResult
  | ReadyLocalPublicationOpenResult
  | RejectedLocalPublicationOpenResult;

export interface LocalPublicationOpenFlowOptions {
  readonly readFile?: typeof readLocalEpubFile;
  readonly session?: PublicationSession;
}

/**
 * Connects the capability-free browser file boundary to one publication
 * session without retaining a File, filename, source bytes, or raw failure.
 */
export interface LocalPublicationOpenFlow {
  readonly publication: OpenedPublication | undefined;
  open(file: File): Promise<LocalPublicationOpenResult>;
  close(): Promise<void>;
}

const CANCELLED_RESULT: CancelledLocalPublicationOpenResult = Object.freeze({
  status: "cancelled",
});

function rejected(
  reason: LocalPublicationOpenFailureReason,
): RejectedLocalPublicationOpenResult {
  return Object.freeze({ status: "rejected", reason });
}

function mapReadFailure(
  reason: LocalEpubFileReadFailureReason,
): RejectedLocalPublicationOpenResult {
  switch (reason) {
    case "too-large":
      return rejected("file-too-large");
    case "invalid-size":
    case "read-failed":
    case "size-mismatch":
      return rejected("file-read-failed");
  }
}

function mapOperationalFailure(
  code: OperationalErrorCodeV1,
): LocalPublicationOpenResult {
  switch (code) {
    case "invalid-input":
      return rejected("invalid-epub");
    case "unsupported-input":
      return rejected("unsupported-epub");
    case "resource-exhausted":
      return rejected("resource-exhausted");
    case "operation-cancelled":
      return CANCELLED_RESULT;
    case "internal-failure":
      return rejected("internal-failure");
    case "capability-unavailable":
      return rejected("internal-failure");
  }
}

function mapSessionOpen(
  result: PublicationSessionOpenResult,
): LocalPublicationOpenResult {
  switch (result.status) {
    case "cancelled":
      return CANCELLED_RESULT;
    case "ready":
      return Object.freeze({
        status: "ready",
        publication: result.publication,
      });
    case "rejected":
      return mapOperationalFailure(result.failure.error.code);
  }
}

async function readFileSafely(
  readFile: typeof readLocalEpubFile,
  file: File,
  signal: AbortSignal,
): Promise<LocalEpubFileReadResult | undefined> {
  try {
    return await readFile(file, { signal });
  } catch {
    return undefined;
  }
}

async function closeSessionSafely(
  session: PublicationSession,
): Promise<PublicationSessionCloseResult | undefined> {
  try {
    return await session.close();
  } catch {
    return undefined;
  }
}

class DesktopLocalPublicationOpenFlow implements LocalPublicationOpenFlow {
  readonly #readFile: typeof readLocalEpubFile;
  readonly #session: PublicationSession;
  #activeRead: AbortController | undefined;
  #intentVersion = 0;

  public constructor(
    readFile: typeof readLocalEpubFile,
    session: PublicationSession,
  ) {
    this.#readFile = readFile;
    this.#session = session;
    Object.freeze(this);
  }

  public get publication(): OpenedPublication | undefined {
    return this.#session.publication;
  }

  public async open(file: File): Promise<LocalPublicationOpenResult> {
    const intentVersion = ++this.#intentVersion;
    this.cancelActiveRead();

    // Selecting a replacement is the point at which prior publication work
    // becomes stale. Cleanup and the bounded browser read can proceed together;
    // PublicationSession.open still waits for cleanup before opening new bytes.
    const replacementClose = closeSessionSafely(this.#session);
    const controller = new AbortController();
    this.#activeRead = controller;
    const readResult = await readFileSafely(
      this.#readFile,
      file,
      controller.signal,
    );

    if (this.#activeRead === controller) {
      this.#activeRead = undefined;
    }
    if (intentVersion !== this.#intentVersion) {
      return CANCELLED_RESULT;
    }

    const closeResult = await replacementClose;
    if (intentVersion !== this.#intentVersion) {
      return CANCELLED_RESULT;
    }
    if (closeResult === undefined || closeResult.status === "rejected") {
      return rejected("internal-failure");
    }
    if (readResult === undefined) {
      return rejected("file-read-failed");
    }
    if (readResult.status === "cancelled") {
      return CANCELLED_RESULT;
    }
    if (readResult.status === "rejected") {
      return mapReadFailure(readResult.reason);
    }

    let openResult: PublicationSessionOpenResult;
    try {
      openResult = await this.#session.open(readResult.bytes);
    } catch {
      return rejected("internal-failure");
    }
    if (intentVersion !== this.#intentVersion) {
      return CANCELLED_RESULT;
    }
    return mapSessionOpen(openResult);
  }

  public async close(): Promise<void> {
    this.#intentVersion += 1;
    this.cancelActiveRead();
    await closeSessionSafely(this.#session);
  }

  private cancelActiveRead(): void {
    const controller = this.#activeRead;
    this.#activeRead = undefined;
    controller?.abort();
  }
}

export function createLocalPublicationOpenFlow(
  options: LocalPublicationOpenFlowOptions = {},
): LocalPublicationOpenFlow {
  return new DesktopLocalPublicationOpenFlow(
    options.readFile ?? readLocalEpubFile,
    options.session ?? createPublicationSession(),
  );
}
