import {
  decodePersistedReadingStateV1,
  type PersistedReadingStateV1,
} from "@voxleaf/shared";
import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_READER_PREFERENCES,
  type ReaderPreferencesV1,
} from "../reader/reader-preferences";
import {
  MAX_READER_POSITION_STATES,
  MAX_READER_POSITIONS_CODE_UNITS,
  MAX_READER_PREFERENCES_CODE_UNITS,
  READER_POSITIONS_STORAGE_KEY,
  READER_PREFERENCES_STORAGE_KEY,
  createWebStorageReaderPositionRepository,
} from "./reader-position-repository";

class FakeStorage {
  public readonly values = new Map<string, string>();
  public readonly getItem = vi.fn((key: string): string | null => {
    return this.values.get(key) ?? null;
  });
  public readonly setItem = vi.fn((key: string, value: string): void => {
    this.values.set(key, value);
  });
}

function createState(
  bookNumber: number,
  textOffsetCodePoints = bookNumber,
): PersistedReadingStateV1 {
  const identity = {
    scheme: "sha256",
    schemeVersion: 1,
    value: `book-${bookNumber.toString().padStart(3, "0")}`,
  };
  return decodePersistedReadingStateV1({
    schemaVersion: 1,
    bookIdentity: identity,
    locator: {
      schemaVersion: 1,
      bookIdentity: { ...identity },
      spineItemId: `spine:${bookNumber}`,
      spineItemIndex: bookNumber,
      anchor: {
        kind: "element-id",
        formatVersion: 1,
        value: `paragraph-${bookNumber}`,
        anchorIndex: bookNumber,
      },
      textOffsetCodePoints,
      progression: Math.min(bookNumber / 1_000, 1),
    },
    preferences: {},
  });
}

function serializedPositions(states: readonly unknown[]): string {
  return JSON.stringify({ schemaVersion: 1, states });
}

function parseStoredPositions(storage: FakeStorage): {
  schemaVersion: number;
  states: PersistedReadingStateV1[];
} {
  const stored = storage.values.get(READER_POSITIONS_STORAGE_KEY);
  expect(stored).toBeDefined();
  return JSON.parse(stored ?? "") as {
    schemaVersion: number;
    states: PersistedReadingStateV1[];
  };
}

describe("Web Storage reader position repository", () => {
  it("round-trips one validated state through the fixed positions key", async () => {
    const storage = new FakeStorage();
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });
    const state = createState(1);

    await expect(repository.writePosition(state)).resolves.toEqual({
      status: "saved",
    });
    await expect(repository.readPosition(state.bookIdentity)).resolves.toEqual({
      status: "ready",
      state,
    });

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem.mock.calls[0]?.[0]).toBe(
      READER_POSITIONS_STORAGE_KEY,
    );
    expect([...storage.values.keys()]).toEqual([READER_POSITIONS_STORAGE_KEY]);
    expect(parseStoredPositions(storage)).toEqual({
      schemaVersion: 1,
      states: [state],
    });
  });

  it("uses browser localStorage through the default asynchronous adapter", async () => {
    const previous = window.localStorage.getItem(READER_POSITIONS_STORAGE_KEY);
    window.localStorage.removeItem(READER_POSITIONS_STORAGE_KEY);
    const repository = createWebStorageReaderPositionRepository();
    const state = createState(1);

    try {
      const writePromise = repository.writePosition(state);
      expect(writePromise).toBeInstanceOf(Promise);
      await expect(writePromise).resolves.toEqual({ status: "saved" });
      await expect(
        repository.readPosition(state.bookIdentity),
      ).resolves.toEqual({
        status: "ready",
        state,
      });
    } finally {
      if (previous === null) {
        window.localStorage.removeItem(READER_POSITIONS_STORAGE_KEY);
      } else {
        window.localStorage.setItem(READER_POSITIONS_STORAGE_KEY, previous);
      }
    }
  });

  it("returns missing for an absent key or a different exact identity", async () => {
    const storage = new FakeStorage();
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });
    const saved = createState(1);
    const different = createState(2);

    await expect(repository.readPosition(saved.bookIdentity)).resolves.toEqual({
      status: "missing",
    });
    await repository.writePosition(saved);
    await expect(
      repository.readPosition(different.bookIdentity),
    ).resolves.toEqual({ status: "missing" });
  });

  it("moves an updated identity to the front without retaining duplicates", async () => {
    const storage = new FakeStorage();
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });
    const first = createState(1);
    const second = createState(2);
    const updatedFirst = createState(1, 99);

    await repository.writePosition(first);
    await repository.writePosition(second);
    await repository.writePosition(updatedFirst);

    const envelope = parseStoredPositions(storage);
    expect(envelope.states).toHaveLength(2);
    expect(envelope.states.map((state) => state.bookIdentity.value)).toEqual([
      updatedFirst.bookIdentity.value,
      second.bookIdentity.value,
    ]);
    expect(envelope.states[0]?.locator.textOffsetCodePoints).toBe(99);
  });

  it("keeps at most 128 most-recently-saved exact identities", async () => {
    const storage = new FakeStorage();
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    for (
      let bookNumber = 1;
      bookNumber <= MAX_READER_POSITION_STATES + 1;
      bookNumber += 1
    ) {
      await expect(
        repository.writePosition(createState(bookNumber)),
      ).resolves.toEqual({ status: "saved" });
    }

    const envelope = parseStoredPositions(storage);
    expect(envelope.states).toHaveLength(MAX_READER_POSITION_STATES);
    expect(envelope.states[0]?.bookIdentity.value).toBe("book-129");
    expect(envelope.states.at(-1)?.bookIdentity.value).toBe("book-002");
    expect(
      envelope.states.some((state) => state.bookIdentity.value === "book-001"),
    ).toBe(false);
    expect(
      storage.values.get(READER_POSITIONS_STORAGE_KEY)?.length,
    ).toBeLessThanOrEqual(MAX_READER_POSITIONS_CODE_UNITS);
  });

  it.each([
    ["invalid JSON", "not-json"],
    ["non-object envelope", "[]"],
    [
      "coerced envelope version",
      JSON.stringify({ schemaVersion: "1", states: [] }),
    ],
    [
      "unknown envelope field",
      JSON.stringify({ schemaVersion: 1, states: [], bookTitle: "private" }),
    ],
    ["non-array states", JSON.stringify({ schemaVersion: 1, states: {} })],
    [
      "duplicate exact identities",
      serializedPositions([createState(1), createState(1, 2)]),
    ],
    [
      "forbidden nested content",
      serializedPositions([
        { ...createState(1), bookText: "private publication text" },
      ]),
    ],
  ])("rejects malformed positions data: %s", async (_name, serialized) => {
    const storage = new FakeStorage();
    storage.values.set(READER_POSITIONS_STORAGE_KEY, serialized);
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    await expect(
      repository.readPosition(createState(1).bookIdentity),
    ).resolves.toEqual({ status: "malformed" });
  });

  it("rejects an outer count above the approved maximum", async () => {
    const storage = new FakeStorage();
    const states = Array.from(
      { length: MAX_READER_POSITION_STATES + 1 },
      (_, index) => createState(index + 1),
    );
    storage.values.set(
      READER_POSITIONS_STORAGE_KEY,
      serializedPositions(states),
    );
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    await expect(
      repository.readPosition(
        states[0]?.bookIdentity ?? createState(1).bookIdentity,
      ),
    ).resolves.toEqual({ status: "over-limit" });
  });

  it("rejects an oversized positions value before parsing and preserves it", async () => {
    const storage = new FakeStorage();
    const oversized = "x".repeat(MAX_READER_POSITIONS_CODE_UNITS + 1);
    storage.values.set(READER_POSITIONS_STORAGE_KEY, oversized);
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    await expect(
      repository.readPosition(createState(1).bookIdentity),
    ).resolves.toEqual({ status: "over-limit" });
    await expect(repository.writePosition(createState(1))).resolves.toEqual({
      status: "over-limit",
    });
    expect(storage.values.get(READER_POSITIONS_STORAGE_KEY)).toBe(oversized);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it.each([
    [
      "outer envelope",
      JSON.stringify({ schemaVersion: 2, states: [], future: true }),
    ],
    [
      "nested persisted state",
      serializedPositions([{ ...createState(1), schemaVersion: 2 }]),
    ],
    [
      "nested locator",
      serializedPositions([
        {
          ...createState(1),
          locator: { ...createState(1).locator, schemaVersion: 2 },
        },
      ]),
    ],
  ])(
    "preserves an unsupported %s and disables position writes",
    async (_name, serialized) => {
      const storage = new FakeStorage();
      storage.values.set(READER_POSITIONS_STORAGE_KEY, serialized);
      const repository = createWebStorageReaderPositionRepository({
        storage: () => storage,
      });

      await expect(
        repository.readPosition(createState(1).bookIdentity),
      ).resolves.toEqual({ status: "unsupported-version" });
      await expect(repository.writePosition(createState(2))).resolves.toEqual({
        status: "unsupported-version",
      });
      expect(storage.values.get(READER_POSITIONS_STORAGE_KEY)).toBe(serialized);
      expect(storage.setItem).not.toHaveBeenCalled();
    },
  );

  it("atomically replaces malformed current-version positions on a valid save", async () => {
    const storage = new FakeStorage();
    storage.values.set(
      READER_POSITIONS_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, states: "malformed" }),
    );
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });
    const state = createState(1);

    await expect(repository.writePosition(state)).resolves.toEqual({
      status: "saved",
    });
    expect(parseStoredPositions(storage)).toEqual({
      schemaVersion: 1,
      states: [state],
    });
  });

  it("validates typed position inputs again before writing", async () => {
    const storage = new FakeStorage();
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });
    const unsafe = {
      ...createState(1),
      textQuote: "private publication text",
    } as PersistedReadingStateV1;

    await expect(repository.writePosition(unsafe)).resolves.toEqual({
      status: "malformed",
    });
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("classifies unsupported typed write inputs before accessing storage", async () => {
    const storage = new FakeStorage();
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });
    const futureState = {
      ...createState(1),
      schemaVersion: 2,
    } as unknown as PersistedReadingStateV1;
    const futurePreferences = {
      ...DEFAULT_READER_PREFERENCES,
      schemaVersion: 2,
    } as unknown as ReaderPreferencesV1;

    await expect(repository.writePosition(futureState)).resolves.toEqual({
      status: "unsupported-version",
    });
    await expect(
      repository.writePreferences(futurePreferences),
    ).resolves.toEqual({ status: "unsupported-version" });
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("returns unavailable without exposing storage read or write exceptions", async () => {
    const state = createState(1);
    const readFailure = createWebStorageReaderPositionRepository({
      storage: () => {
        throw new Error("private browser profile detail");
      },
    });
    const storage = new FakeStorage();
    storage.values.set(
      READER_POSITIONS_STORAGE_KEY,
      serializedPositions([state]),
    );
    storage.setItem.mockImplementation(() => {
      throw new Error("private quota detail");
    });
    const writeFailure = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    const readResult = await readFailure.readPosition(state.bookIdentity);
    const writeResult = await writeFailure.writePosition(createState(2));

    expect(readResult).toEqual({ status: "unavailable" });
    expect(writeResult).toEqual({ status: "unavailable" });
    expect(JSON.stringify([readResult, writeResult])).not.toContain("private");
    expect(storage.values.get(READER_POSITIONS_STORAGE_KEY)).toBe(
      serializedPositions([state]),
    );
  });

  it("round-trips strict app-global display preferences through their fixed key", async () => {
    const storage = new FakeStorage();
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    await expect(
      repository.writePreferences(DEFAULT_READER_PREFERENCES),
    ).resolves.toEqual({ status: "saved" });
    const result = await repository.readPreferences();

    expect(result).toEqual({
      status: "ready",
      preferences: DEFAULT_READER_PREFERENCES,
    });
    expect(
      result.status === "ready" && Object.isFrozen(result.preferences),
    ).toBe(true);
    expect([...storage.values.keys()]).toEqual([
      READER_PREFERENCES_STORAGE_KEY,
    ]);
    expect(
      storage.values.get(READER_PREFERENCES_STORAGE_KEY)?.length,
    ).toBeLessThanOrEqual(MAX_READER_PREFERENCES_CODE_UNITS);
  });

  it("returns missing when display preferences have not been stored", async () => {
    const repository = createWebStorageReaderPositionRepository({
      storage: () => new FakeStorage(),
    });

    await expect(repository.readPreferences()).resolves.toEqual({
      status: "missing",
    });
  });

  it.each([
    ["invalid JSON", "not-json"],
    ["non-object envelope", "null"],
    [
      "coerced version",
      JSON.stringify({ ...DEFAULT_READER_PREFERENCES, schemaVersion: "1" }),
    ],
    [
      "missing field",
      JSON.stringify({
        schemaVersion: 1,
        textScale: "standard",
        lineSpacing: "comfortable",
        contentWidth: "standard",
      }),
    ],
    [
      "unknown field",
      JSON.stringify({
        ...DEFAULT_READER_PREFERENCES,
        fontFamily: "Private Publisher Font",
      }),
    ],
    [
      "arbitrary token",
      JSON.stringify({
        ...DEFAULT_READER_PREFERENCES,
        textScale: "calc(100vw)",
      }),
    ],
  ])("rejects malformed display preferences: %s", async (_name, serialized) => {
    const storage = new FakeStorage();
    storage.values.set(READER_PREFERENCES_STORAGE_KEY, serialized);
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    await expect(repository.readPreferences()).resolves.toEqual({
      status: "malformed",
    });
  });

  it("preserves unsupported display preferences and disables older writes", async () => {
    const storage = new FakeStorage();
    const future = JSON.stringify({
      schemaVersion: 2,
      futureTheme: "private-future-token",
    });
    storage.values.set(READER_PREFERENCES_STORAGE_KEY, future);
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    await expect(repository.readPreferences()).resolves.toEqual({
      status: "unsupported-version",
    });
    await expect(
      repository.writePreferences(DEFAULT_READER_PREFERENCES),
    ).resolves.toEqual({ status: "unsupported-version" });
    expect(storage.values.get(READER_PREFERENCES_STORAGE_KEY)).toBe(future);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("rejects and preserves an oversized preferences value", async () => {
    const storage = new FakeStorage();
    const oversized = "x".repeat(MAX_READER_PREFERENCES_CODE_UNITS + 1);
    storage.values.set(READER_PREFERENCES_STORAGE_KEY, oversized);
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    await expect(repository.readPreferences()).resolves.toEqual({
      status: "over-limit",
    });
    await expect(
      repository.writePreferences(DEFAULT_READER_PREFERENCES),
    ).resolves.toEqual({ status: "over-limit" });
    expect(storage.values.get(READER_PREFERENCES_STORAGE_KEY)).toBe(oversized);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("replaces malformed current-version preferences with one canonical value", async () => {
    const storage = new FakeStorage();
    storage.values.set(
      READER_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_READER_PREFERENCES, theme: "publisher" }),
    );
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    await expect(
      repository.writePreferences(DEFAULT_READER_PREFERENCES),
    ).resolves.toEqual({ status: "saved" });
    expect(
      JSON.parse(storage.values.get(READER_PREFERENCES_STORAGE_KEY) ?? ""),
    ).toEqual(DEFAULT_READER_PREFERENCES);
  });

  it("validates typed preferences again and never persists arbitrary fields", async () => {
    const storage = new FakeStorage();
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });
    const unsafe = {
      ...DEFAULT_READER_PREFERENCES,
      customCss: "private publisher style",
    } as ReaderPreferencesV1;

    await expect(repository.writePreferences(unsafe)).resolves.toEqual({
      status: "malformed",
    });
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("keeps position and preference failures independent", async () => {
    const storage = new FakeStorage();
    storage.values.set(
      READER_POSITIONS_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 2, states: [] }),
    );
    const repository = createWebStorageReaderPositionRepository({
      storage: () => storage,
    });

    await expect(
      repository.writePreferences(DEFAULT_READER_PREFERENCES),
    ).resolves.toEqual({ status: "saved" });
    await expect(repository.writePosition(createState(1))).resolves.toEqual({
      status: "unsupported-version",
    });
    expect(storage.values.has(READER_PREFERENCES_STORAGE_KEY)).toBe(true);
  });
});
