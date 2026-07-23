import {
  openEpubPublication,
  type EpubFailure,
  type OpenedPublication,
  type OpenEpubPublicationOptions,
  type OpenEpubPublicationResult,
} from "@voxleaf/epub";
import { createOperationalErrorV1 } from "@voxleaf/shared";

export type PublicationOpener = (
  bytes: Uint8Array,
  options?: OpenEpubPublicationOptions,
) => Promise<OpenEpubPublicationResult>;

export interface PublicationSessionOptions {
  readonly openPublication?: PublicationOpener;
}

export interface ReadyPublicationSessionOpenResult {
  readonly status: "ready";
  readonly publication: OpenedPublication;
}

export interface CancelledPublicationSessionOpenResult {
  readonly status: "cancelled";
}

export interface RejectedPublicationSessionResult {
  readonly status: "rejected";
  readonly failure: EpubFailure;
}

export type PublicationSessionOpenResult =
  | CancelledPublicationSessionOpenResult
  | ReadyPublicationSessionOpenResult
  | RejectedPublicationSessionResult;

export interface ClosedPublicationSessionResult {
  readonly status: "closed";
}

export type PublicationSessionCloseResult =
  ClosedPublicationSessionResult | RejectedPublicationSessionResult;

/**
 * Application-owned lifecycle boundary for one logical publication session.
 *
 * The owner retains neither source bytes nor raw exceptions. Replacing or
 * closing the session aborts the current open attempt and detaches the active
 * publication before asynchronous cleanup begins. Late successful opens are
 * closed and can never become the visible publication.
 */
export interface PublicationSession {
  readonly opening: boolean;
  readonly publication: OpenedPublication | undefined;
  open(bytes: Uint8Array): Promise<PublicationSessionOpenResult>;
  close(): Promise<PublicationSessionCloseResult>;
}

interface OpenAttempt {
  readonly controller: AbortController;
}

const CANCELLED_RESULT: CancelledPublicationSessionOpenResult = Object.freeze({
  status: "cancelled",
});

const CLOSED_RESULT: ClosedPublicationSessionResult = Object.freeze({
  status: "closed",
});

const INTERNAL_FAILURE: EpubFailure = Object.freeze({
  ok: false,
  detail: "internal-failure",
  error: createOperationalErrorV1("internal-failure"),
});

function rejected(failure: EpubFailure): RejectedPublicationSessionResult {
  return Object.freeze({ status: "rejected", failure });
}

class DesktopPublicationSession implements PublicationSession {
  readonly #openPublication: PublicationOpener;
  #activeAttempt: OpenAttempt | undefined;
  #activePublication: OpenedPublication | undefined;
  #closePromise: Promise<PublicationSessionCloseResult> | undefined;
  #cleanupPromise: Promise<boolean> = Promise.resolve(true);
  #intentVersion = 0;

  public constructor(openPublication: PublicationOpener) {
    this.#openPublication = openPublication;
    Object.freeze(this);
  }

  public get opening(): boolean {
    return this.#activeAttempt !== undefined;
  }

  public get publication(): OpenedPublication | undefined {
    return this.#activePublication;
  }

  public async open(bytes: Uint8Array): Promise<PublicationSessionOpenResult> {
    const intentVersion = ++this.#intentVersion;
    this.cancelOpenAttempt();
    if (this.#closePromise !== undefined) {
      const closeFailure = await this.finishPreviousClose();
      if (intentVersion !== this.#intentVersion) {
        return CANCELLED_RESULT;
      }
      if (closeFailure !== undefined) {
        return closeFailure;
      }
    }

    const attempt = this.replaceOpenAttempt();
    const previousPublication = this.detachPublication();
    if (!(await this.queuePublicationClose(previousPublication))) {
      return this.finishRejectedAttempt(attempt);
    }

    if (!this.isActiveAttempt(attempt)) {
      return CANCELLED_RESULT;
    }

    let result: OpenEpubPublicationResult;
    try {
      result = await this.#openPublication(bytes, {
        signal: attempt.controller.signal,
      });
    } catch {
      result = INTERNAL_FAILURE;
    }

    if (!this.isActiveAttempt(attempt)) {
      if (result.ok) {
        await this.queuePublicationClose(result.publication);
      }
      return CANCELLED_RESULT;
    }

    this.#activeAttempt = undefined;
    if (!result.ok) {
      return result.detail === "cancelled"
        ? CANCELLED_RESULT
        : rejected(result);
    }

    this.#activePublication = result.publication;
    return Object.freeze({
      status: "ready",
      publication: result.publication,
    });
  }

  public close(): Promise<PublicationSessionCloseResult> {
    this.#intentVersion += 1;
    if (this.#closePromise !== undefined) {
      return this.#closePromise;
    }

    this.cancelOpenAttempt();
    const publication = this.detachPublication();
    this.#closePromise = this.queuePublicationClose(publication).then(
      (closed) => (closed ? CLOSED_RESULT : rejected(INTERNAL_FAILURE)),
    );
    return this.#closePromise;
  }

  private replaceOpenAttempt(): OpenAttempt {
    const attempt = Object.freeze({ controller: new AbortController() });
    this.#activeAttempt = attempt;
    return attempt;
  }

  private cancelOpenAttempt(): void {
    const attempt = this.#activeAttempt;
    this.#activeAttempt = undefined;
    attempt?.controller.abort();
  }

  private detachPublication(): OpenedPublication | undefined {
    const publication = this.#activePublication;
    this.#activePublication = undefined;
    return publication;
  }

  private queuePublicationClose(
    publication: OpenedPublication | undefined,
  ): Promise<boolean> {
    if (publication === undefined) {
      return this.#cleanupPromise;
    }

    const previousCleanup = this.#cleanupPromise;
    this.#cleanupPromise = (async () => {
      const previousClosed = await previousCleanup;
      const publicationClosed = await closePublication(publication);
      return previousClosed && publicationClosed;
    })();
    return this.#cleanupPromise;
  }

  private isActiveAttempt(attempt: OpenAttempt): boolean {
    return (
      this.#activeAttempt === attempt && !attempt.controller.signal.aborted
    );
  }

  private async finishPreviousClose(): Promise<
    RejectedPublicationSessionResult | undefined
  > {
    const closePromise = this.#closePromise;
    if (closePromise === undefined) {
      return undefined;
    }

    const result = await closePromise;
    if (result.status === "rejected") {
      return result;
    }

    if (this.#closePromise === closePromise) {
      this.#closePromise = undefined;
    }
    return undefined;
  }

  private finishRejectedAttempt(
    attempt: OpenAttempt,
  ): PublicationSessionOpenResult {
    if (!this.isActiveAttempt(attempt)) {
      return CANCELLED_RESULT;
    }

    this.#activeAttempt = undefined;
    return rejected(INTERNAL_FAILURE);
  }
}

async function closePublication(
  publication: OpenedPublication | undefined,
): Promise<boolean> {
  if (publication === undefined) {
    return true;
  }

  try {
    await publication.close();
    return true;
  } catch {
    return false;
  }
}

export function createPublicationSession(
  options: PublicationSessionOptions = {},
): PublicationSession {
  return new DesktopPublicationSession(
    options.openPublication ?? openEpubPublication,
  );
}
