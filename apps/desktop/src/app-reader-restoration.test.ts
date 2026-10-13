import type { OpenedPublication } from "@voxleaf/epub";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { describe, expect, it, vi } from "vitest";

import {
  applyInitialRestorationSettlement,
  isReaderRestorationForPublication,
  toRestorationPresentation,
  type ReaderRestoration,
} from "./app-reader-restoration";
import type { ReadyReaderOpenRestoration } from "./persistence/reader-position-restore-coordinator";
import { DEFAULT_READER_PREFERENCES } from "./reader/reader-preferences";

function createPublication(): OpenedPublication {
  return Object.freeze({
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
    documents: [],
    locators: [],
    navigation: [],
    resources: [],
    closed: false,
    readResource: vi.fn(),
    resolveLocator: vi.fn(),
    resolveTarget: vi.fn(),
    prepareNarration: vi.fn<OpenedPublication["prepareNarration"]>(),
    close: vi.fn(async () => undefined),
  });
}

const publication = createPublication();
const replacement = createPublication();
const locator =
  VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator;
const loading: ReaderRestoration = Object.freeze({
  status: "loading",
  publication,
  publicationSequence: 7,
});
const incomingStatuses = ["settled", "superseded", "unavailable"] as const;

function readyRestoration(
  position: ReadyReaderOpenRestoration["position"] = {
    mode: "exact",
    reason: "exact",
    locator,
  },
  settlement: Extract<
    ReaderRestoration,
    { status: "ready" }
  >["settlement"] = "pending",
  preferenceStatus: ReadyReaderOpenRestoration["preferenceStatus"] = "ready",
): Extract<ReaderRestoration, { status: "ready" }> {
  return Object.freeze({
    status: "ready",
    publication,
    publicationSequence: 7,
    settlement,
    result: {
      status: "ready" as const,
      preferences: DEFAULT_READER_PREFERENCES,
      preferenceStatus,
      position,
    },
  });
}

describe("restoration publication identity", () => {
  it("rejects absent restoration", () => {
    expect(isReaderRestorationForPublication(undefined, publication, 7)).toBe(
      false,
    );
    expect(
      isReaderRestorationForPublication(undefined, undefined, undefined),
    ).toBe(false);
  });

  it.each([loading, readyRestoration()])(
    "matches only the exact object and sequence for $status",
    (state) => {
      expect(replacement).not.toBe(publication);
      expect(replacement.book.identity).toEqual(publication.book.identity);
      expect(isReaderRestorationForPublication(state, publication, 7)).toBe(
        true,
      );
      expect(isReaderRestorationForPublication(state, replacement, 7)).toBe(
        false,
      );
      expect(isReaderRestorationForPublication(state, publication, 8)).toBe(
        false,
      );
      expect(isReaderRestorationForPublication(state, undefined, 7)).toBe(
        false,
      );
      expect(
        isReaderRestorationForPublication(state, publication, undefined),
      ).toBe(false);
    },
  );
});

describe("initial restoration settlement", () => {
  it.each(incomingStatuses)(
    "accepts %s once in matching pending ready state",
    (status) => {
      const current = readyRestoration();
      const next = applyInitialRestorationSettlement(
        current,
        publication,
        7,
        status,
      );
      expect(next).not.toBe(current);
      expect(next).toStrictEqual({ ...current, settlement: status });
      expect(Object.isFrozen(next)).toBe(true);
      expect(next?.status).toBe("ready");
      if (next?.status !== "ready")
        throw new Error("Expected ready restoration.");
      expect(next.result).toBe(current.result);
      expect(next.result.position).toBe(current.result.position);
      expect(next.result.preferences).toBe(current.result.preferences);
      expect(next.publication).toBe(current.publication);
      expect(current.settlement).toBe("pending");
      expect(Object.isFrozen(current)).toBe(true);
      expect(Object.isFrozen(current.result)).toBe(false);
      expect(Object.isFrozen(current.result.position)).toBe(false);
    },
  );

  it.each(incomingStatuses)(
    "preserves every rejected state reference for incoming %s",
    (status) => {
      const pending = readyRestoration();
      const cases = [
        [undefined, publication, 7],
        [loading, publication, 7],
        [pending, replacement, 7],
        [pending, publication, 8],
        [pending, undefined, 7],
        [pending, publication, undefined],
        ...incomingStatuses.map(
          (prior) =>
            [readyRestoration(undefined, prior), publication, 7] as const,
        ),
      ] as const;
      for (const [current, activePublication, sequence] of cases) {
        expect(
          applyInitialRestorationSettlement(
            current,
            activePublication,
            sequence,
            status,
          ),
        ).toBe(current);
      }
      expect(pending.settlement).toBe("pending");
    },
  );
});

describe("restoration presentation", () => {
  it("omits absent state and projects loading without identity or freezing", () => {
    expect(toRestorationPresentation(undefined)).toBeUndefined();
    const presentation = toRestorationPresentation(loading);
    expect(presentation).toStrictEqual({ status: "loading" });
    expect(Object.isFrozen(presentation)).toBe(false);
  });

  it.each([
    [{ mode: "exact", reason: "exact", locator }, { mode: "exact" }],
    [
      { mode: "recovered", reason: "nearest-offset", locator },
      { mode: "recovered" },
    ],
    [
      { mode: "book-start", reason: "missing", locator },
      { mode: "book-start", reason: "missing" },
    ],
    [
      { mode: "book-start", reason: "unavailable", locator },
      { mode: "book-start", reason: "unavailable" },
    ],
  ] as const)(
    "projects %j with all settlement and preference statuses",
    (position, expectedPosition) => {
      for (const settlement of ["pending", ...incomingStatuses] as const) {
        for (const preferenceStatus of [
          "ready",
          "missing",
          "malformed",
          "unsupported-version",
          "over-limit",
          "unavailable",
        ] as const) {
          const state = readyRestoration(
            position,
            settlement,
            preferenceStatus,
          );
          const presentation = toRestorationPresentation(state);
          expect(presentation).toStrictEqual({
            status: "ready",
            settlement,
            position: expectedPosition,
            preferenceStatus,
          });
          expect(Object.isFrozen(presentation)).toBe(false);
          if (presentation?.status !== "ready")
            throw new Error("Expected ready presentation.");
          expect(presentation.position).not.toBe(state.result.position);
          expect(Object.isFrozen(presentation.position)).toBe(false);
          expect(state.result.position).toBe(position);
          expect(state.settlement).toBe(settlement);
        }
      }
    },
  );
});
