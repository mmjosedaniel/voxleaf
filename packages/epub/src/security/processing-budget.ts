import { EpubArchiveError } from "../archive/archive-error.js";
import { createEpubIngestionPolicy } from "./ingestion-policy.js";
import type {
  EpubIngestionPolicy,
  EpubIngestionPolicyOverrides,
} from "./ingestion-policy.js";

export interface MonotonicClock {
  now(): number;
}

export interface EpubProcessingBudgetOptions {
  readonly policy?: EpubIngestionPolicyOverrides;
  readonly signal?: AbortSignal;
  readonly clock?: MonotonicClock;
}

export interface EpubProcessingBudgetSnapshot {
  readonly archiveEntryCount: number;
  readonly declaredCompressedBytes: number;
  readonly declaredUncompressedBytes: number;
  readonly observedUncompressedBytes: number;
  readonly compressedReadBytes: number;
  readonly decodedPublicationTextBytes: number;
  readonly semanticBlockCount: number;
}

const SYSTEM_MONOTONIC_CLOCK: MonotonicClock = Object.freeze({
  now: () => performance.now(),
});

function fail(
  code: "cancelled" | "internal-failure" | "resource-limit-exceeded",
): never {
  throw new EpubArchiveError(code);
}

function assertSafeNonnegativeInteger(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    fail("internal-failure");
  }
}

function addWithinSafeInteger(left: number, right: number): number {
  if (left > Number.MAX_SAFE_INTEGER - right) {
    return fail("resource-limit-exceeded");
  }

  return left + right;
}

export interface ArchiveEntryReadBudget {
  readonly observedBytes: number;
  checkpoint(): void;
  observe(byteLength: number): void;
  complete(): void;
}

class ScopedArchiveEntryReadBudget implements ArchiveEntryReadBudget {
  readonly #checkpoint: () => void;
  readonly #observe: (byteLength: number) => void;
  readonly #complete: () => void;
  readonly #getObservedBytes: () => number;

  public constructor(
    checkpoint: () => void,
    observe: (byteLength: number) => void,
    complete: () => void,
    getObservedBytes: () => number,
  ) {
    this.#checkpoint = checkpoint;
    this.#observe = observe;
    this.#complete = complete;
    this.#getObservedBytes = getObservedBytes;
  }

  public get observedBytes(): number {
    return this.#getObservedBytes();
  }

  public checkpoint(): void {
    this.#checkpoint();
  }

  public observe(byteLength: number): void {
    this.#observe(byteLength);
  }

  public complete(): void {
    this.#complete();
  }
}

export class EpubProcessingBudget {
  public readonly policy: EpubIngestionPolicy;
  public readonly signal: AbortSignal | undefined;

  readonly #clock: MonotonicClock;
  readonly #startedAtMs: number;
  #lastObservedAtMs: number;
  #archiveInputRegistered = false;
  #archiveEntryCount = 0;
  #declaredCompressedBytes = 0;
  #declaredUncompressedBytes = 0;
  #observedUncompressedBytes = 0;
  #compressedReadBytes = 0;
  #decodedPublicationTextBytes = 0;
  #semanticBlockCount = 0;

  public constructor(options: EpubProcessingBudgetOptions = {}) {
    this.policy = createEpubIngestionPolicy(options.policy);
    this.signal = options.signal;
    this.#clock = options.clock ?? SYSTEM_MONOTONIC_CLOCK;
    this.#startedAtMs = this.readClock();
    this.#lastObservedAtMs = this.#startedAtMs;
    this.checkpoint();
  }

  public checkpoint(): void {
    if (this.signal?.aborted === true) {
      return fail("cancelled");
    }

    const nowMs = this.readClock();
    if (nowMs < this.#lastObservedAtMs) {
      return fail("internal-failure");
    }

    this.#lastObservedAtMs = nowMs;
    if (nowMs - this.#startedAtMs > this.policy.maxProcessingTimeMs) {
      return fail("cancelled");
    }
  }

  public registerArchiveInput(byteLength: number): void {
    this.checkpoint();
    assertSafeNonnegativeInteger(byteLength);

    if (this.#archiveInputRegistered) {
      return fail("internal-failure");
    }

    if (byteLength > this.policy.maxCompressedEpubBytes) {
      return fail("resource-limit-exceeded");
    }

    this.#archiveInputRegistered = true;
  }

  public registerArchiveEntryDeclaration(
    compressedSize: number,
    uncompressedSize: number,
  ): void {
    this.checkpoint();
    assertSafeNonnegativeInteger(compressedSize);
    assertSafeNonnegativeInteger(uncompressedSize);

    const nextEntryCount = this.#archiveEntryCount + 1;
    const nextDeclaredCompressedBytes = addWithinSafeInteger(
      this.#declaredCompressedBytes,
      compressedSize,
    );
    const nextDeclaredBytes = addWithinSafeInteger(
      this.#declaredUncompressedBytes,
      uncompressedSize,
    );

    if (
      nextEntryCount > this.policy.maxArchiveEntries ||
      compressedSize > this.policy.maxCompressedEpubBytes ||
      uncompressedSize > this.policy.maxEntryUncompressedBytes ||
      nextDeclaredBytes > this.policy.maxTotalUncompressedBytes
    ) {
      return fail("resource-limit-exceeded");
    }

    this.assertCompressionRatio(uncompressedSize, compressedSize);
    this.assertCompressionRatio(nextDeclaredBytes, nextDeclaredCompressedBytes);

    this.#archiveEntryCount = nextEntryCount;
    this.#declaredCompressedBytes = nextDeclaredCompressedBytes;
    this.#declaredUncompressedBytes = nextDeclaredBytes;
  }

  public beginArchiveEntryRead(
    compressedSize: number,
    declaredUncompressedSize: number,
    maximumOutputBytes = this.policy.maxEntryUncompressedBytes,
  ): ArchiveEntryReadBudget {
    this.checkpoint();
    assertSafeNonnegativeInteger(compressedSize);
    assertSafeNonnegativeInteger(declaredUncompressedSize);
    assertSafeNonnegativeInteger(maximumOutputBytes);

    if (maximumOutputBytes > this.policy.maxEntryUncompressedBytes) {
      return fail("internal-failure");
    }

    if (
      compressedSize > this.policy.maxCompressedEpubBytes ||
      declaredUncompressedSize > maximumOutputBytes ||
      declaredUncompressedSize > this.policy.maxEntryUncompressedBytes
    ) {
      return fail("resource-limit-exceeded");
    }

    this.assertCompressionRatio(declaredUncompressedSize, compressedSize);

    let observedBytes = 0;
    let completed = false;

    return new ScopedArchiveEntryReadBudget(
      () => this.checkpoint(),
      (byteLength) => {
        this.checkpoint();
        assertSafeNonnegativeInteger(byteLength);
        if (completed) {
          return fail("internal-failure");
        }

        const nextEntryObserved = addWithinSafeInteger(
          observedBytes,
          byteLength,
        );
        const nextTotalObserved = addWithinSafeInteger(
          this.#observedUncompressedBytes,
          byteLength,
        );
        const prospectiveCompressedBytes = addWithinSafeInteger(
          this.#compressedReadBytes,
          compressedSize,
        );

        if (
          nextEntryObserved > maximumOutputBytes ||
          nextEntryObserved > this.policy.maxEntryUncompressedBytes ||
          nextTotalObserved > this.policy.maxTotalUncompressedBytes
        ) {
          return fail("resource-limit-exceeded");
        }

        this.assertCompressionRatio(nextEntryObserved, compressedSize);
        this.assertCompressionRatio(
          nextTotalObserved,
          prospectiveCompressedBytes,
        );

        observedBytes = nextEntryObserved;
        this.#observedUncompressedBytes = nextTotalObserved;
      },
      () => {
        this.checkpoint();
        if (completed || observedBytes !== declaredUncompressedSize) {
          return fail("internal-failure");
        }

        completed = true;
        this.#compressedReadBytes = addWithinSafeInteger(
          this.#compressedReadBytes,
          compressedSize,
        );
      },
      () => observedBytes,
    );
  }

  public observeDecodedPublicationText(byteLength: number): void {
    this.checkpoint();
    assertSafeNonnegativeInteger(byteLength);

    const nextDecodedBytes = addWithinSafeInteger(
      this.#decodedPublicationTextBytes,
      byteLength,
    );
    if (nextDecodedBytes > this.policy.maxDecodedPublicationTextBytes) {
      return fail("resource-limit-exceeded");
    }

    this.#decodedPublicationTextBytes = nextDecodedBytes;
  }

  public observeSemanticBlock(): void {
    this.checkpoint();

    const nextBlockCount = addWithinSafeInteger(this.#semanticBlockCount, 1);
    if (nextBlockCount > this.policy.maxSemanticBlocks) {
      return fail("resource-limit-exceeded");
    }

    this.#semanticBlockCount = nextBlockCount;
  }

  public getSnapshot(): EpubProcessingBudgetSnapshot {
    return Object.freeze({
      archiveEntryCount: this.#archiveEntryCount,
      declaredCompressedBytes: this.#declaredCompressedBytes,
      declaredUncompressedBytes: this.#declaredUncompressedBytes,
      observedUncompressedBytes: this.#observedUncompressedBytes,
      compressedReadBytes: this.#compressedReadBytes,
      decodedPublicationTextBytes: this.#decodedPublicationTextBytes,
      semanticBlockCount: this.#semanticBlockCount,
    });
  }

  private assertCompressionRatio(
    observedBytes: number,
    compressedBytes: number,
  ): void {
    if (observedBytes > 0 && compressedBytes === 0) {
      return fail("resource-limit-exceeded");
    }

    if (
      observedBytes > this.policy.compressionRatioGraceBytes &&
      observedBytes > compressedBytes * this.policy.maxCompressionRatio
    ) {
      return fail("resource-limit-exceeded");
    }
  }

  private readClock(): number {
    let value: number;
    try {
      value = this.#clock.now();
    } catch {
      return fail("internal-failure");
    }

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > Number.MAX_SAFE_INTEGER
    ) {
      return fail("internal-failure");
    }

    return value;
  }
}

export function createEpubProcessingBudget(
  options: EpubProcessingBudgetOptions = {},
): EpubProcessingBudget {
  return new EpubProcessingBudget(options);
}
