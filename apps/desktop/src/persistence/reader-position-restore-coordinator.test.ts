import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  SemanticBlock,
} from "@voxleaf/epub";
import {
  createBookId,
  createIndex,
  createSchemaVersion,
  decodePersistedReadingStateV1,
  decodeReadingLocatorV1,
  type BookIdentityV1,
  type PersistedReadingStateV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_READER_PREFERENCES,
  type ReaderPreferencesV1,
} from "../reader/reader-preferences";
import type {
  ReaderPositionReadResult,
  ReaderPositionRepository,
} from "./reader-position-repository";
import { ReaderPositionRestoreCoordinator } from "./reader-position-restore-coordinator";

const TEST_BLOCK: SemanticBlock = Object.freeze({
  kind: "paragraph",
  children: Object.freeze([]),
});
const FIRST_START =
  VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator;
const SECOND_START =
  VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[1]!.blocks[0]!.locator;
const FIRST_BLOCK: PublicationLocatedBlock = Object.freeze({
  documentId: "document:first" as ContentDocumentId,
  block: TEST_BLOCK,
  startLocator: FIRST_START,
  textLengthCodePoints: createIndex(4),
});
const SECOND_BLOCK: PublicationLocatedBlock = Object.freeze({
  documentId: "document:second" as ContentDocumentId,
  block: TEST_BLOCK,
  startLocator: SECOND_START,
  textLengthCodePoints: createIndex(8),
});
const RESTORED_PREFERENCES: ReaderPreferencesV1 = Object.freeze({
  schemaVersion: 1,
  textScale: "large",
  lineSpacing: "spacious",
  contentWidth: "narrow",
  theme: "dark",
});

function locatorAt(
  start: ReadingLocatorV1,
  textOffsetCodePoints: number,
): ReadingLocatorV1 {
  return decodeReadingLocatorV1({
    ...start,
    textOffsetCodePoints,
  });
}

function persistedState(
  locator: ReadingLocatorV1,
  bookIdentity: BookIdentityV1 = locator.bookIdentity,
): PersistedReadingStateV1 {
  return decodePersistedReadingStateV1({
    schemaVersion: createSchemaVersion(1),
    bookIdentity,
    locator,
    preferences: {},
  });
}

function createPublication(): OpenedPublication {
  const locatedBlocks = Object.freeze([FIRST_BLOCK, SECOND_BLOCK]);
  return {
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
    documents: Object.freeze([]),
    locators: locatedBlocks,
    navigation: Object.freeze([]),
    resources: Object.freeze([]),
    closed: false,
    readResource: vi.fn(),
    resolveLocator: vi.fn((input: unknown) => {
      const locator = decodeReadingLocatorV1(input);
      if (
        locator.bookIdentity.value !==
        VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.identity.value
      ) {
        throw new Error("Synthetic locator is unavailable.");
      }
      const locatedBlock = locatedBlocks.find(
        (candidate) =>
          candidate.startLocator.spineItemIndex === locator.spineItemIndex,
      );
      if (locatedBlock === undefined) {
        return Object.freeze({
          status: "recovered",
          reason: "book-start",
          locator: FIRST_START,
          locatedBlock: FIRST_BLOCK,
        });
      }
      const offset = Math.min(
        locator.textOffsetCodePoints,
        locatedBlock.textLengthCodePoints,
      );
      const canonical = locatorAt(locatedBlock.startLocator, offset);
      return locator.textOffsetCodePoints === offset
        ? Object.freeze({
            status: "exact",
            reason: "exact",
            locator: canonical,
            locatedBlock,
          })
        : Object.freeze({
            status: "recovered",
            reason: "nearest-offset",
            locator: canonical,
            locatedBlock,
          });
    }),
    resolveTarget: vi.fn(),
    close: vi.fn(async () => undefined),
  };
}

function createRepository(
  position: ReaderPositionReadResult,
): ReaderPositionRepository {
  return {
    readPosition: vi.fn(async () => position),
    writePosition: vi.fn<ReaderPositionRepository["writePosition"]>(
      async () => ({ status: "saved" }),
    ),
    readPreferences: vi.fn<ReaderPositionRepository["readPreferences"]>(
      async () => ({
        status: "ready",
        preferences: RESTORED_PREFERENCES,
      }),
    ),
    writePreferences: vi.fn<ReaderPositionRepository["writePreferences"]>(
      async () => ({ status: "saved" }),
    ),
  };
}

function controlled<T>(): {
  readonly promise: Promise<T>;
  resolve(value: T): void;
} {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return {
    promise,
    resolve(value): void {
      const resolve = resolvePromise;
      if (resolve === undefined) {
        throw new Error("Controlled result is already resolved.");
      }
      resolvePromise = undefined;
      resolve(value);
    },
  };
}

describe("reader position restore coordinator", () => {
  it("restores an exact canonical locator and decoded display preferences", async () => {
    const publication = createPublication();
    const locator = locatorAt(SECOND_START, 3);
    const repository = createRepository({
      status: "ready",
      state: persistedState(locator),
    });
    const coordinator = new ReaderPositionRestoreCoordinator(repository);

    const result = await coordinator.restore(publication);

    expect(result).toEqual({
      status: "ready",
      preferences: RESTORED_PREFERENCES,
      preferenceStatus: "ready",
      position: {
        mode: "exact",
        reason: "exact",
        locator,
      },
    });
    expect(repository.readPosition).toHaveBeenCalledWith(
      publication.book.identity,
    );
  });

  it("returns the package's canonical nearest locator without searching content", async () => {
    const publication = createPublication();
    const repository = createRepository({
      status: "ready",
      state: persistedState(locatorAt(SECOND_START, 80)),
    });

    const result = await new ReaderPositionRestoreCoordinator(
      repository,
    ).restore(publication);

    expect(result).toMatchObject({
      status: "ready",
      position: {
        mode: "recovered",
        reason: "nearest-offset",
        locator: {
          spineItemIndex: SECOND_START.spineItemIndex,
          textOffsetCodePoints: 8,
        },
      },
    });
  });

  it.each([
    "missing",
    "malformed",
    "over-limit",
    "unavailable",
    "unsupported-version",
  ] as const)(
    "starts at the first locator for a %s repository result",
    async (status) => {
      const result = await new ReaderPositionRestoreCoordinator(
        createRepository({ status }),
      ).restore(createPublication());

      expect(result).toMatchObject({
        status: "ready",
        position: {
          mode: "book-start",
          reason: status,
          locator: FIRST_START,
        },
      });
    },
  );

  it("rejects a ready state for another exact-byte identity", async () => {
    const wrongIdentity = Object.freeze({
      ...FIRST_START.bookIdentity,
      value: createBookId("f".repeat(64)),
    });
    const wrongLocator = decodeReadingLocatorV1({
      ...FIRST_START,
      bookIdentity: wrongIdentity,
    });
    const result = await new ReaderPositionRestoreCoordinator(
      createRepository({
        status: "ready",
        state: persistedState(wrongLocator, wrongIdentity),
      }),
    ).restore(createPublication());

    expect(result).toMatchObject({
      status: "ready",
      position: {
        mode: "book-start",
        reason: "identity-mismatch",
        locator: FIRST_START,
      },
    });
  });

  it("contains locator-resolution and repository rejections", async () => {
    const publication = createPublication();
    vi.mocked(publication.resolveLocator).mockImplementation(() => {
      throw new Error("private publication value");
    });
    const repository = createRepository({
      status: "ready",
      state: persistedState(FIRST_START),
    });
    vi.mocked(repository.readPreferences).mockRejectedValue(
      new Error("private storage value"),
    );

    const result = await new ReaderPositionRestoreCoordinator(
      repository,
    ).restore(publication);

    expect(result).toEqual({
      status: "ready",
      preferences: DEFAULT_READER_PREFERENCES,
      preferenceStatus: "unavailable",
      position: {
        mode: "book-start",
        reason: "unresolved",
        locator: FIRST_START,
      },
    });
  });

  it("cancels late reads and never applies one book's state to a replacement", async () => {
    const firstRead = controlled<ReaderPositionReadResult>();
    const repository = createRepository({ status: "missing" });
    vi.mocked(repository.readPosition)
      .mockImplementationOnce(() => firstRead.promise)
      .mockResolvedValueOnce({ status: "missing" });
    const coordinator = new ReaderPositionRestoreCoordinator(repository);

    const stale = coordinator.restore(createPublication());
    const current = coordinator.restore(createPublication());
    firstRead.resolve({ status: "missing" });

    await expect(stale).resolves.toEqual({ status: "cancelled" });
    await expect(current).resolves.toMatchObject({
      status: "ready",
      position: { mode: "book-start", reason: "missing" },
    });
  });

  it("reads global preferences once and keeps later in-memory changes", async () => {
    const repository = createRepository({ status: "missing" });
    const coordinator = new ReaderPositionRestoreCoordinator(repository);
    await coordinator.restore(createPublication());
    coordinator.setPreferences(DEFAULT_READER_PREFERENCES);

    const result = await coordinator.restore(createPublication());

    expect(repository.readPreferences).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      status: "ready",
      preferences: DEFAULT_READER_PREFERENCES,
      preferenceStatus: "ready",
    });
  });

  it("returns cancelled after explicit cancellation or close", async () => {
    const pending = controlled<ReaderPositionReadResult>();
    const repository = createRepository({ status: "missing" });
    vi.mocked(repository.readPosition).mockImplementation(
      () => pending.promise,
    );
    const coordinator = new ReaderPositionRestoreCoordinator(repository);
    const restoration = coordinator.restore(createPublication());
    coordinator.cancel();
    pending.resolve({ status: "missing" });

    await expect(restoration).resolves.toEqual({ status: "cancelled" });
    coordinator.close();
    await expect(coordinator.restore(createPublication())).resolves.toEqual({
      status: "cancelled",
    });
  });
});
