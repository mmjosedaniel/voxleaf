import type { OpenedPublication } from "@voxleaf/epub";

import type { RestorationPresentation } from "./AppPresentation";
import type { ReadyReaderOpenRestoration } from "./persistence/reader-position-restore-coordinator";
import type { ReaderInitialRestorationSettlement } from "./reader/ReaderPublication";

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

export type ReaderRestoration =
  LoadingReaderRestoration | ReadyReaderRestoration;

export function isReaderRestorationForPublication(
  restoration: ReaderRestoration | undefined,
  publication: OpenedPublication | undefined,
  publicationSequence: number | undefined,
): restoration is ReaderRestoration {
  return (
    restoration !== undefined &&
    restoration.publication === publication &&
    restoration.publicationSequence === publicationSequence
  );
}

export function applyInitialRestorationSettlement(
  current: ReaderRestoration | undefined,
  publication: OpenedPublication | undefined,
  publicationSequence: number | undefined,
  settlementStatus: ReaderInitialRestorationSettlement["status"],
): ReaderRestoration | undefined {
  return isReaderRestorationForPublication(
    current,
    publication,
    publicationSequence,
  ) &&
    current.status === "ready" &&
    current.settlement === "pending"
    ? Object.freeze({ ...current, settlement: settlementStatus })
    : current;
}

export function toRestorationPresentation(
  restoration: ReaderRestoration | undefined,
): RestorationPresentation | undefined {
  if (restoration === undefined) {
    return undefined;
  }
  if (restoration.status === "loading") {
    return { status: "loading" };
  }
  return {
    status: "ready",
    settlement: restoration.settlement,
    position:
      restoration.result.position.mode === "book-start"
        ? { mode: "book-start", reason: restoration.result.position.reason }
        : { mode: restoration.result.position.mode },
    preferenceStatus: restoration.result.preferenceStatus,
  };
}
