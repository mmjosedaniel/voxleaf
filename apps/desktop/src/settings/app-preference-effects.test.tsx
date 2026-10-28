import { act, cleanup, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_NARRATION_START_PREFERENCE_V1,
  type NarrationStartPreferenceReadResult,
  type NarrationStartPreferenceRepository,
} from "../persistence/narration-start-preference";
import type {
  ReaderPositionRepository,
  ReaderPreferencesReadResult,
} from "../persistence/reader-position-repository";
import { DEFAULT_READER_PREFERENCES } from "../reader/reader-preferences";
import type { ProductNarrationSnapshot } from "../tts/product-narration-coordinator";
import {
  bindNarrationStartPreferencePresentation,
  usePreferenceHydration,
  type NarrationStartPreferencePresentation,
  type ReaderPreferencePresentation,
} from "./app-preference-effects";

afterEach(() => cleanup());

const savedReader = Object.freeze({
  ...DEFAULT_READER_PREFERENCES,
  theme: "dark" as const,
});
const savedNarration = Object.freeze({
  kind: "prepared" as const,
  targetMs: 120_000 as const,
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function hydrationFixture() {
  const readerRead = deferred<ReaderPreferencesReadResult>();
  const narrationRead = deferred<NarrationStartPreferenceReadResult>();
  const events: string[] = [];
  const mutation = vi.fn();
  const reader = {
    readPreferences: vi.fn<ReaderPositionRepository["readPreferences"]>(() => {
      events.push("read-reader");
      return readerRead.promise;
    }),
    writePreferences: mutation,
  };
  const narration = {
    read: vi.fn<NarrationStartPreferenceRepository["read"]>(() => {
      events.push("read-narration");
      return narrationRead.promise;
    }),
    write: mutation,
    reset: mutation,
  };
  const restore = {
    setPreferences: vi.fn<
      (preferences: typeof DEFAULT_READER_PREFERENCES) => void
    >(() => {
      events.push("restore");
    }),
    close: mutation,
    cancel: mutation,
  };
  const publishReader = vi.fn<
    (presentation: ReaderPreferencePresentation) => void
  >(() => {
    events.push("publish-reader");
  });
  const publishNarration = vi.fn<
    (presentation: NarrationStartPreferencePresentation) => void
  >(() => {
    events.push("publish-narration");
  });
  const options = {
    readerPositionRepository: reader,
    narrationStartPreferenceRepository: narration,
    readerPositionRestoreCoordinator: restore,
    defaultReaderPreferences: DEFAULT_READER_PREFERENCES,
    defaultNarrationStartPreference: DEFAULT_NARRATION_START_PREFERENCE_V1,
    setReaderPreferencePresentation: publishReader,
    setFallbackNarrationStart: publishNarration,
  };
  return {
    options,
    readerRead,
    narrationRead,
    reader,
    narration,
    restore,
    publishReader,
    publishNarration,
    mutation,
    events,
  };
}

describe("preference hydration connection", () => {
  it.each([
    "ready",
    "missing",
    "malformed",
    "over-limit",
    "unavailable",
    "unsupported-version",
  ] as const)(
    "projects %s results after restoring preferences without mutations",
    async (status) => {
      const f = hydrationFixture();
      const defaultReader = {
        ...DEFAULT_READER_PREFERENCES,
        theme: "light" as const,
      };
      renderHook(() =>
        usePreferenceHydration({
          ...f.options,
          defaultReaderPreferences: defaultReader,
        }),
      );
      expect(f.events).toEqual(["read-reader", "read-narration"]);
      expect(f.reader.readPreferences.mock.contexts).toEqual([f.reader]);
      expect(f.narration.read.mock.contexts).toEqual([f.narration]);
      expect(f.publishReader).not.toHaveBeenCalled();
      expect(f.publishNarration).not.toHaveBeenCalled();
      await act(async () => {
        f.readerRead.resolve(
          status === "ready"
            ? { status, preferences: savedReader }
            : { status },
        );
        f.narrationRead.resolve({ status, selection: savedNarration });
      });
      const preferences = status === "ready" ? savedReader : defaultReader;
      expect(f.restore.setPreferences).toHaveBeenCalledExactlyOnceWith(
        preferences,
        status,
      );
      expect(f.restore.setPreferences.mock.contexts).toEqual([f.restore]);
      expect(f.publishReader).toHaveBeenCalledExactlyOnceWith({
        preferences,
        status,
        canPersist: status !== "unsupported-version",
      });
      expect(f.publishNarration).toHaveBeenCalledExactlyOnceWith({
        selection: savedNarration,
        status,
        canPersist: status !== "unsupported-version",
      });
      expect(f.events).toEqual([
        "read-reader",
        "read-narration",
        "restore",
        "publish-reader",
        "publish-narration",
      ]);
      expect(f.mutation).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["reader", "resolve"],
    ["reader", "reject"],
    ["narration", "resolve"],
    ["narration", "reject"],
  ] as const)(
    "handles independent %s %s while the other remains pending",
    async (source, outcome) => {
      const f = hydrationFixture();
      renderHook(() => usePreferenceHydration(f.options));
      await act(async () => {
        if (outcome === "reject") {
          (source === "reader" ? f.readerRead : f.narrationRead).reject(
            new Error("Synthetic read failure"),
          );
        } else if (source === "reader") {
          f.readerRead.resolve({ status: "unavailable" });
        } else {
          f.narrationRead.resolve({
            status: "ready",
            selection: savedNarration,
          });
        }
      });
      if (source === "reader") {
        expect(f.publishReader).toHaveBeenCalledExactlyOnceWith({
          preferences: DEFAULT_READER_PREFERENCES,
          status: "unavailable",
          canPersist: true,
        });
        expect(f.restore.setPreferences).toHaveBeenCalledTimes(
          outcome === "resolve" ? 1 : 0,
        );
        expect(f.publishNarration).not.toHaveBeenCalled();
      } else {
        expect(f.publishNarration).toHaveBeenCalledExactlyOnceWith({
          selection:
            outcome === "resolve"
              ? savedNarration
              : DEFAULT_NARRATION_START_PREFERENCE_V1,
          status: outcome === "resolve" ? "ready" : "unavailable",
          canPersist: true,
        });
        expect(f.restore.setPreferences).not.toHaveBeenCalled();
        expect(f.publishReader).not.toHaveBeenCalled();
      }
      expect(f.mutation).not.toHaveBeenCalled();
    },
  );

  it.each(["resolve", "reject"] as const)(
    "suppresses exact sinks and setters after unmount before %s",
    async (outcome) => {
      const f = hydrationFixture();
      const view = renderHook(() => usePreferenceHydration(f.options));
      view.unmount();
      await act(async () => {
        if (outcome === "resolve") {
          f.readerRead.resolve({ status: "ready", preferences: savedReader });
          f.narrationRead.resolve({
            status: "ready",
            selection: savedNarration,
          });
        } else {
          f.readerRead.reject(new Error("Synthetic obsolete reader failure"));
          f.narrationRead.reject(
            new Error("Synthetic obsolete narration failure"),
          );
        }
      });
      expect(f.restore.setPreferences).not.toHaveBeenCalled();
      expect(f.publishReader).not.toHaveBeenCalled();
      expect(f.publishNarration).not.toHaveBeenCalled();
      expect(f.mutation).not.toHaveBeenCalled();
    },
  );

  it.each(["resolve", "reject"] as const)(
    "StrictMode suppresses obsolete %s and retains the current execution",
    async (outcome) => {
      const f = hydrationFixture();
      const oldReader = deferred<ReaderPreferencesReadResult>();
      const oldNarration = deferred<NarrationStartPreferenceReadResult>();
      f.reader.readPreferences.mockReturnValueOnce(oldReader.promise);
      f.narration.read.mockReturnValueOnce(oldNarration.promise);
      renderHook(() => usePreferenceHydration(f.options), {
        wrapper: StrictMode,
      });
      expect(f.reader.readPreferences).toHaveBeenCalledTimes(2);
      expect(f.narration.read).toHaveBeenCalledTimes(2);
      await act(async () => {
        if (outcome === "resolve") {
          oldReader.resolve({ status: "ready", preferences: savedReader });
          oldNarration.resolve({ status: "ready", selection: savedNarration });
        } else {
          oldReader.reject(new Error("Synthetic obsolete reader failure"));
          oldNarration.reject(
            new Error("Synthetic obsolete narration failure"),
          );
        }
      });
      expect(f.restore.setPreferences).not.toHaveBeenCalled();
      expect(f.publishReader).not.toHaveBeenCalled();
      expect(f.publishNarration).not.toHaveBeenCalled();
      await act(async () => {
        f.readerRead.resolve({ status: "ready", preferences: savedReader });
        f.narrationRead.resolve({ status: "ready", selection: savedNarration });
      });
      expect(f.restore.setPreferences).toHaveBeenCalledExactlyOnceWith(
        savedReader,
        "ready",
      );
      expect(f.publishReader).toHaveBeenCalledExactlyOnceWith({
        preferences: savedReader,
        status: "ready",
        canPersist: true,
      });
      expect(f.publishNarration).toHaveBeenCalledExactlyOnceWith({
        selection: savedNarration,
        status: "ready",
        canPersist: true,
      });
      expect(f.mutation).not.toHaveBeenCalled();
    },
  );

  it("uses supplied rejection defaults and keeps stable members across fresh options objects", async () => {
    const f = hydrationFixture();
    const defaultReader = {
      ...DEFAULT_READER_PREFERENCES,
      textScale: "small" as const,
    };
    const defaultNarration = {
      kind: "prepared" as const,
      targetMs: 60_000 as const,
    };
    const options = {
      ...f.options,
      defaultReaderPreferences: defaultReader,
      defaultNarrationStartPreference: defaultNarration,
    };
    const view = renderHook(() => usePreferenceHydration({ ...options }));
    view.rerender();
    expect(f.reader.readPreferences).toHaveBeenCalledOnce();
    expect(f.narration.read).toHaveBeenCalledOnce();
    await act(async () => {
      f.readerRead.reject(new Error("Synthetic reader failure"));
      f.narrationRead.reject(new Error("Synthetic narration failure"));
    });
    expect(f.publishReader).toHaveBeenCalledExactlyOnceWith({
      preferences: defaultReader,
      status: "unavailable",
      canPersist: true,
    });
    expect(f.publishNarration).toHaveBeenCalledExactlyOnceWith({
      selection: defaultNarration,
      status: "unavailable",
      canPersist: true,
    });
    expect(f.restore.setPreferences).not.toHaveBeenCalled();
    view.rerender();
    expect(f.reader.readPreferences).toHaveBeenCalledOnce();
    expect(f.narration.read).toHaveBeenCalledOnce();
    expect(f.publishReader).toHaveBeenCalledOnce();
    expect(f.publishNarration).toHaveBeenCalledOnce();
    expect(f.mutation).not.toHaveBeenCalled();
  });
});

describe("narration start preference binding", () => {
  it("observes and publishes before subscribing, projects notifications, and returns the original unsubscribe without mutations", () => {
    const events: string[] = [];
    const listeners = new Set<() => void>();
    const mutation = vi.fn();
    let snapshot: Pick<
      ProductNarrationSnapshot,
      "selection" | "startPreferenceStatus" | "canPersistStartPreference"
    > & { readonly unrelated: string } = {
      selection: savedNarration,
      startPreferenceStatus: "unsupported-version",
      canPersistStartPreference: false,
      unrelated: "not projected",
    };
    const unsubscribe = vi.fn(() => {
      events.push("unsubscribe");
      listeners.clear();
    });
    const source = {
      observe: vi.fn(() => {
        events.push("observe");
        return snapshot;
      }),
      subscribe: vi.fn((listener: () => void) => {
        events.push("subscribe");
        listeners.add(listener);
        return unsubscribe;
      }),
      close: mutation,
      resetStartPreference: mutation,
      setSelection: mutation,
      write: mutation,
    };
    const publish = vi.fn<
      (presentation: NarrationStartPreferencePresentation) => void
    >(() => {
      events.push("publish");
    });
    const disconnect = bindNarrationStartPreferencePresentation(
      source,
      publish,
    );
    expect(events).toEqual(["observe", "publish", "subscribe"]);
    expect(publish).toHaveBeenCalledExactlyOnceWith({
      selection: savedNarration,
      status: "unsupported-version",
      canPersist: false,
    });
    expect(source.observe.mock.contexts).toEqual([source]);
    expect(source.subscribe.mock.contexts).toEqual([source]);
    expect(disconnect).toBe(unsubscribe);
    expect(unsubscribe).not.toHaveBeenCalled();
    snapshot = {
      ...snapshot,
      selection: { kind: "quick" },
      startPreferenceStatus: "missing",
      canPersistStartPreference: true,
    };
    for (const listener of listeners) listener();
    expect(events).toEqual([
      "observe",
      "publish",
      "subscribe",
      "observe",
      "publish",
    ]);
    expect(publish).toHaveBeenLastCalledWith({
      selection: snapshot.selection,
      status: "missing",
      canPersist: true,
    });
    expect(source.observe.mock.contexts).toEqual([source, source]);
    disconnect();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(listeners.size).toBe(0);
    for (const listener of listeners) listener();
    expect(publish).toHaveBeenCalledTimes(2);
    expect(source.observe).toHaveBeenCalledTimes(2);
    expect(events.at(-1)).toBe("unsubscribe");
    expect(publish.mock.calls.at(-1)?.[0].status).toBe("missing");
    expect(mutation).not.toHaveBeenCalled();
  });
});
