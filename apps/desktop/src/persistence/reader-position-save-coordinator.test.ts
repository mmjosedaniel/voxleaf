import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  SemanticBlock,
  SensitivePublicationText,
} from "@voxleaf/epub";
import {
  createIndex,
  decodeReadingLocatorV1,
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
  ReaderPositionRepository,
  ReaderRepositoryWriteResult,
} from "./reader-position-repository";
import {
  PASSIVE_POSITION_SAVE_DEBOUNCE_MS,
  ReaderPositionSaveCoordinator,
  type ReaderPositionSaveEnvironment,
} from "./reader-position-save-coordinator";

interface ScheduledWork {
  readonly id: number;
  readonly dueAt: number;
  readonly callback: () => void;
}

class ManualSaveEnvironment implements ReaderPositionSaveEnvironment {
  #now = 0;
  #nextId = 1;
  #scheduled = new Map<number, ScheduledWork>();
  #lifecycleCallback: ((reason: "hidden" | "pagehide") => void) | undefined;

  public schedule(callback: () => void, delayMs: number): () => void {
    const work = {
      id: this.#nextId,
      dueAt: this.#now + delayMs,
      callback,
    };
    this.#nextId += 1;
    this.#scheduled.set(work.id, work);
    return () => this.#scheduled.delete(work.id);
  }

  public subscribeLifecycle(
    callback: (reason: "hidden" | "pagehide") => void,
  ): () => void {
    this.#lifecycleCallback = callback;
    return () => {
      if (this.#lifecycleCallback === callback) {
        this.#lifecycleCallback = undefined;
      }
    };
  }

  public advance(milliseconds: number): void {
    const target = this.#now + milliseconds;
    while (true) {
      const next = [...this.#scheduled.values()]
        .filter((work) => work.dueAt <= target)
        .sort((left, right) =>
          left.dueAt === right.dueAt
            ? left.id - right.id
            : left.dueAt - right.dueAt,
        )[0];
      if (next === undefined) {
        break;
      }
      this.#now = next.dueAt;
      this.#scheduled.delete(next.id);
      next.callback();
    }
    this.#now = target;
  }

  public emit(reason: "hidden" | "pagehide"): void {
    this.#lifecycleCallback?.(reason);
  }

  public get scheduledCount(): number {
    return this.#scheduled.size;
  }
}

const DOCUMENT_ID = "document:position-save" as ContentDocumentId;
const BLOCK = Object.freeze({
  kind: "paragraph",
  children: Object.freeze([
    Object.freeze({
      kind: "text",
      text: "Synthetic persistence passage" as SensitivePublicationText,
    }),
  ]),
}) satisfies SemanticBlock;
const BASE_LOCATOR =
  VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator;
const LOCATED_BLOCK = Object.freeze({
  documentId: DOCUMENT_ID,
  block: BLOCK,
  startLocator: BASE_LOCATOR,
  textLengthCodePoints: createIndex(100),
}) satisfies PublicationLocatedBlock;

function locatorAt(textOffsetCodePoints: number): ReadingLocatorV1 {
  return decodeReadingLocatorV1({
    ...BASE_LOCATOR,
    textOffsetCodePoints,
  });
}

function createPublication(): OpenedPublication {
  return {
    book: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
    documents: Object.freeze([]),
    locators: Object.freeze([LOCATED_BLOCK]),
    navigation: Object.freeze([]),
    resources: Object.freeze([]),
    closed: false,
    readResource: vi.fn(async () => new Uint8Array()),
    resolveLocator: vi.fn((input: unknown) => {
      const locator = decodeReadingLocatorV1(input);
      if (
        locator.bookIdentity.value !==
          VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.identity.value ||
        locator.spineItemId !== BASE_LOCATOR.spineItemId ||
        locator.spineItemIndex !== BASE_LOCATOR.spineItemIndex ||
        locator.anchor.value !== BASE_LOCATOR.anchor.value ||
        locator.textOffsetCodePoints > LOCATED_BLOCK.textLengthCodePoints
      ) {
        throw new Error("Synthetic locator is unavailable.");
      }
      return Object.freeze({
        status: "exact",
        reason: "exact",
        locator,
        locatedBlock: LOCATED_BLOCK,
      });
    }),
    resolveTarget: vi.fn(() => {
      throw new Error("Synthetic target resolution is unavailable.");
    }),
    close: vi.fn(() => Promise.resolve()),
  };
}

interface TestRepository extends ReaderPositionRepository {
  readonly writePosition: ReturnType<
    typeof vi.fn<ReaderPositionRepository["writePosition"]>
  >;
  readonly writePreferences: ReturnType<
    typeof vi.fn<ReaderPositionRepository["writePreferences"]>
  >;
}

function createRepository(
  writePosition: ReaderPositionRepository["writePosition"] = async () => ({
    status: "saved",
  }),
  writePreferences: ReaderPositionRepository["writePreferences"] = async () => ({
    status: "saved",
  }),
): TestRepository {
  return {
    readPosition: vi.fn<ReaderPositionRepository["readPosition"]>(async () => ({
      status: "missing",
    })),
    writePosition: vi.fn(writePosition),
    readPreferences: vi.fn<ReaderPositionRepository["readPreferences"]>(
      async () => ({ status: "missing" }),
    ),
    writePreferences: vi.fn(writePreferences),
  };
}

function createHarness(repository = createRepository()) {
  const environment = new ManualSaveEnvironment();
  const publication = createPublication();
  const coordinator = new ReaderPositionSaveCoordinator(
    publication,
    repository,
    { environment },
  );
  coordinator.start();
  return { coordinator, environment, publication, repository };
}

function deferredWrite() {
  let resolve: ((result: ReaderRepositoryWriteResult) => void) | undefined;
  const promise = new Promise<ReaderRepositoryWriteResult>((resolver) => {
    resolve = resolver;
  });
  return {
    promise,
    resolve(result: ReaderRepositoryWriteResult): void {
      resolve?.(result);
    },
  };
}

describe("reader position save coordinator", () => {
  it("writes once at the exact trailing 500 ms passive boundary", async () => {
    const { coordinator, environment, repository } = createHarness();
    const locator = locatorAt(4);

    expect(coordinator.schedulePassive(locator)).toBe(true);
    environment.advance(PASSIVE_POSITION_SAVE_DEBOUNCE_MS - 1);
    expect(repository.writePosition).not.toHaveBeenCalled();

    environment.advance(1);
    expect(repository.writePosition).toHaveBeenCalledTimes(1);
    await coordinator.flush();
    expect(repository.writePosition.mock.calls[0]?.[0].locator).toEqual(
      locator,
    );

    expect(coordinator.schedulePassive(locator)).toBe(false);
    environment.advance(PASSIVE_POSITION_SAVE_DEBOUNCE_MS);
    expect(repository.writePosition).toHaveBeenCalledTimes(1);
  });

  it("supersedes pending passive positions without writing per scroll update", async () => {
    const { coordinator, environment, repository } = createHarness();

    coordinator.schedulePassive(locatorAt(1));
    environment.advance(250);
    coordinator.schedulePassive(locatorAt(7));
    environment.advance(PASSIVE_POSITION_SAVE_DEBOUNCE_MS - 1);
    expect(repository.writePosition).not.toHaveBeenCalled();

    environment.advance(1);
    await coordinator.flush();
    expect(repository.writePosition).toHaveBeenCalledTimes(1);
    expect(
      repository.writePosition.mock.calls[0]?.[0].locator.textOffsetCodePoints,
    ).toBe(7);
  });

  it("coalesces immediate locator and validated preference saves", async () => {
    const { coordinator, environment, repository } = createHarness();
    const firstPreferences = Object.freeze({
      ...DEFAULT_READER_PREFERENCES,
      textScale: "large",
    }) satisfies ReaderPreferencesV1;
    const latestPreferences = Object.freeze({
      ...firstPreferences,
      theme: "dark",
    }) satisfies ReaderPreferencesV1;

    coordinator.scheduleImmediate(locatorAt(2));
    coordinator.scheduleImmediate(locatorAt(8));
    coordinator.savePreferences(firstPreferences);
    coordinator.savePreferences(latestPreferences);
    expect(repository.writePosition).not.toHaveBeenCalled();
    expect(repository.writePreferences).not.toHaveBeenCalled();

    environment.advance(0);
    await coordinator.flush();
    expect(repository.writePosition).toHaveBeenCalledTimes(1);
    expect(
      repository.writePosition.mock.calls[0]?.[0].locator.textOffsetCodePoints,
    ).toBe(8);
    expect(repository.writePreferences).toHaveBeenCalledTimes(1);
    expect(repository.writePreferences).toHaveBeenCalledWith(latestPreferences);
  });

  it("promotes a pending passive locator when reflow settles", async () => {
    const { coordinator, environment, repository } = createHarness();
    const locator = locatorAt(5);

    coordinator.schedulePassive(locator);
    environment.advance(499);
    expect(coordinator.scheduleImmediate(locator)).toBe(true);
    environment.advance(0);
    await coordinator.flush();

    expect(repository.writePosition).toHaveBeenCalledTimes(1);
    expect(environment.scheduledCount).toBe(0);
  });

  it("flushes the latest validated state when hidden and on pagehide", async () => {
    const { coordinator, environment, repository } = createHarness();

    coordinator.schedulePassive(locatorAt(3));
    environment.emit("hidden");
    await coordinator.flush();
    expect(repository.writePosition).toHaveBeenCalledTimes(1);
    expect(
      repository.writePosition.mock.calls[0]?.[0].locator.textOffsetCodePoints,
    ).toBe(3);

    coordinator.schedulePassive(locatorAt(9));
    environment.emit("pagehide");
    await coordinator.flush();
    expect(repository.writePosition).toHaveBeenCalledTimes(2);
    expect(
      repository.writePosition.mock.calls[1]?.[0].locator.textOffsetCodePoints,
    ).toBe(9);
  });

  it("serializes writes and retains only the latest superseding locator", async () => {
    const first = deferredWrite();
    const second = deferredWrite();
    const repository = createRepository(
      vi
        .fn<ReaderPositionRepository["writePosition"]>()
        .mockImplementationOnce(() => first.promise)
        .mockImplementationOnce(() => second.promise),
    );
    const { coordinator, environment } = createHarness(repository);

    coordinator.scheduleImmediate(locatorAt(1));
    environment.advance(0);
    expect(repository.writePosition).toHaveBeenCalledTimes(1);

    coordinator.scheduleImmediate(locatorAt(4));
    coordinator.scheduleImmediate(locatorAt(10));
    environment.advance(0);
    expect(repository.writePosition).toHaveBeenCalledTimes(1);

    first.resolve({ status: "unavailable" });
    await vi.waitFor(() =>
      expect(repository.writePosition).toHaveBeenCalledTimes(2),
    );
    expect(
      repository.writePosition.mock.calls[1]?.[0].locator.textOffsetCodePoints,
    ).toBe(10);
    second.resolve({ status: "saved" });
    await coordinator.flush();
  });

  it("flushes on close and rejects stale or noncanonical book updates", async () => {
    const { coordinator, environment, repository } = createHarness();
    const wrongBook = decodeReadingLocatorV1({
      ...BASE_LOCATOR,
      bookIdentity: {
        ...BASE_LOCATOR.bookIdentity,
        value: "0".repeat(64),
      },
    });

    expect(coordinator.schedulePassive(wrongBook)).toBe(false);
    expect(coordinator.schedulePassive(locatorAt(6))).toBe(true);
    await coordinator.close();
    expect(repository.writePosition).toHaveBeenCalledTimes(1);
    expect(
      repository.writePosition.mock.calls[0]?.[0].locator.textOffsetCodePoints,
    ).toBe(6);
    expect(environment.scheduledCount).toBe(0);

    expect(coordinator.scheduleImmediate(locatorAt(7))).toBe(false);
    expect(coordinator.savePreferences(DEFAULT_READER_PREFERENCES)).toBe(false);
    environment.advance(1_000);
    expect(repository.writePosition).toHaveBeenCalledTimes(1);
  });

  it("contains repository failures and emits content-free records only", async () => {
    const privateCanary = "private prose C:\\Users\\reader\\secret.epub";
    const repository = createRepository(
      async () => {
        throw new Error(privateCanary);
      },
      async () => ({ status: "unavailable" }),
    );
    const { coordinator, environment } = createHarness(repository);
    const preferences = Object.freeze({
      ...DEFAULT_READER_PREFERENCES,
      contentWidth: "wide",
    }) satisfies ReaderPreferencesV1;

    coordinator.scheduleImmediate(locatorAt(11));
    coordinator.savePreferences(preferences);
    environment.advance(0);
    await expect(coordinator.close()).resolves.toBeUndefined();

    const state = repository.writePosition.mock
      .calls[0]?.[0] as PersistedReadingStateV1;
    expect(Object.keys(state).sort()).toEqual([
      "bookIdentity",
      "locator",
      "preferences",
      "schemaVersion",
    ]);
    expect(state.preferences).toEqual({});
    expect(JSON.stringify(state)).not.toContain(privateCanary);
    expect(state).not.toHaveProperty("title");
    expect(state).not.toHaveProperty("path");
    expect(repository.writePreferences).toHaveBeenCalledWith(preferences);
  });
});
