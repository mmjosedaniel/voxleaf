import type { OpenedPublication } from "@voxleaf/epub";

import {
  createLocalPublicationOpenFlow,
  type LocalPublicationCloseResult,
  type LocalPublicationOpenFailureReason,
  type LocalPublicationOpenFlow,
  type LocalPublicationOpenResult,
} from "../publication/local-publication-open";

export interface ReaderPublicationSummary {
  readonly title: string;
  readonly authors: readonly string[];
}

export type ReaderFailureReason =
  LocalPublicationOpenFailureReason | "close-failed" | "rendering-failed";

export interface IdleReaderState {
  readonly status: "idle";
}

export interface OpeningReaderState {
  readonly status: "opening";
}

export interface ReadyReaderState {
  readonly status: "ready";
  readonly publication: OpenedPublication;
  readonly publicationSequence: number;
  readonly summary: ReaderPublicationSummary;
}

export interface EmptyReaderState {
  readonly status: "empty";
}

export interface FailedReaderState {
  readonly status: "failure";
  readonly reason: ReaderFailureReason;
}

export interface ClosingReaderState {
  readonly status: "closing";
}

export type ReaderLifecycleState =
  | ClosingReaderState
  | EmptyReaderState
  | FailedReaderState
  | IdleReaderState
  | OpeningReaderState
  | ReadyReaderState;

export interface ReaderLifecycleOptions {
  readonly openFlow?: LocalPublicationOpenFlow;
}

export interface ReaderLifecycle {
  readonly state: ReaderLifecycleState;
  subscribe(listener: () => void): () => void;
  open(file: File): Promise<void>;
  close(): Promise<void>;
  failRendering(): void;
  cleanup(): Promise<void>;
}

const IDLE_STATE: IdleReaderState = Object.freeze({ status: "idle" });
const OPENING_STATE: OpeningReaderState = Object.freeze({ status: "opening" });
const EMPTY_STATE: EmptyReaderState = Object.freeze({ status: "empty" });
const CLOSING_STATE: ClosingReaderState = Object.freeze({ status: "closing" });
const CLOSE_FAILURE_RESULT: LocalPublicationCloseResult = Object.freeze({
  status: "rejected",
  reason: "internal-failure",
});

function failed(reason: ReaderFailureReason): FailedReaderState {
  return Object.freeze({ status: "failure", reason });
}

function ready(
  publication: OpenedPublication,
  publicationSequence: number,
): ReadyReaderState {
  return Object.freeze({
    status: "ready",
    publication,
    publicationSequence,
    summary: Object.freeze({
      title: publication.book.metadata.title,
      authors: Object.freeze([...publication.book.metadata.authors]),
    }),
  });
}

function stateForOpenResult(
  result: LocalPublicationOpenResult,
  publicationSequence: number,
): ReaderLifecycleState {
  switch (result.status) {
    case "cancelled":
      return IDLE_STATE;
    case "rejected":
      return failed(result.reason);
    case "ready":
      return result.publication.locators.length === 0
        ? EMPTY_STATE
        : ready(result.publication, publicationSequence);
  }
}

async function closeSafely(
  openFlow: LocalPublicationOpenFlow,
): Promise<LocalPublicationCloseResult> {
  try {
    return await openFlow.close();
  } catch {
    return CLOSE_FAILURE_RESULT;
  }
}

/**
 * Owns the presentation-independent publication lifecycle visible to the
 * reader shell. State values expose publication data only while fully ready;
 * every opening, empty, failure, and closing transition drops that reference.
 */
class DesktopReaderLifecycle implements ReaderLifecycle {
  readonly #openFlow: LocalPublicationOpenFlow;
  readonly #listeners = new Set<() => void>();
  #state: ReaderLifecycleState = IDLE_STATE;
  #intentVersion = 0;
  #publicationSequence = 0;
  #closePromise: Promise<void> | undefined;

  public constructor(openFlow: LocalPublicationOpenFlow) {
    this.#openFlow = openFlow;
    Object.freeze(this);
  }

  public get state(): ReaderLifecycleState {
    return this.#state;
  }

  public subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  public async open(file: File): Promise<void> {
    const intentVersion = ++this.#intentVersion;
    this.setState(OPENING_STATE);

    let result: LocalPublicationOpenResult;
    try {
      result = await this.#openFlow.open(file);
    } catch {
      result = Object.freeze({
        status: "rejected",
        reason: "internal-failure",
      });
    }

    if (intentVersion !== this.#intentVersion) {
      return;
    }

    if (result.status === "ready") {
      this.#publicationSequence += 1;
    }
    this.setState(stateForOpenResult(result, this.#publicationSequence));
  }

  public close(): Promise<void> {
    if (this.#closePromise !== undefined) {
      return this.#closePromise;
    }

    const intentVersion = ++this.#intentVersion;
    this.setState(CLOSING_STATE);
    const closePromise = (async () => {
      const result = await closeSafely(this.#openFlow);
      if (intentVersion !== this.#intentVersion) {
        return;
      }

      this.setState(
        result.status === "closed" ? IDLE_STATE : failed("close-failed"),
      );
    })();
    return this.trackClose(closePromise);
  }

  public failRendering(): void {
    if (this.#state.status !== "ready") {
      return;
    }

    const intentVersion = ++this.#intentVersion;
    this.setState(failed("rendering-failed"));
    const closePromise = (async () => {
      const result = await closeSafely(this.#openFlow);
      if (
        result.status === "rejected" &&
        intentVersion === this.#intentVersion
      ) {
        this.setState(failed("close-failed"));
      }
    })();
    void this.trackClose(closePromise);
  }

  public async cleanup(): Promise<void> {
    this.#intentVersion += 1;
    this.#state = IDLE_STATE;
    await closeSafely(this.#openFlow);
  }

  private setState(state: ReaderLifecycleState): void {
    this.#state = state;
    for (const listener of [...this.#listeners]) {
      try {
        listener();
      } catch {
        // A presentation subscriber cannot interrupt lifecycle cleanup.
      }
    }
  }

  private trackClose(closePromise: Promise<void>): Promise<void> {
    this.#closePromise = closePromise;
    void closePromise.then(() => {
      if (this.#closePromise === closePromise) {
        this.#closePromise = undefined;
      }
    });
    return closePromise;
  }
}

export function createReaderLifecycle(
  options: ReaderLifecycleOptions = {},
): ReaderLifecycle {
  return new DesktopReaderLifecycle(
    options.openFlow ?? createLocalPublicationOpenFlow(),
  );
}
