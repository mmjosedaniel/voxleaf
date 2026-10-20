import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  SemanticBlock,
  SemanticDocument,
  SensitivePublicationText,
} from "@voxleaf/epub";
import {
  createSchemaVersion,
  decodeLocatorRangeV1,
  decodePersistedReadingStateV1,
  decodeReadingLocatorV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { StrictMode, useEffect, useState, type ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App, type ReadyPublicationContentProps } from "./App";
import type {
  ReaderPositionRepository,
  ReaderPositionReadResult,
  ReaderPreferencesReadResult,
} from "./persistence/reader-position-repository";
import {
  DEFAULT_NARRATION_START_PREFERENCE_V1,
  type NarrationStartPreferenceRepository,
  type NarrationStartPreferenceReadResult,
} from "./persistence/narration-start-preference";
import { ReaderPositionRestoreCoordinator } from "./persistence/reader-position-restore-coordinator";
import { DEFAULT_READER_PREFERENCES } from "./reader/reader-preferences";
import * as settingsDialog from "./settings/ReaderSettingsDialog";
import type {
  LocalPublicationOpenFailureReason,
  LocalPublicationOpenFlow,
  LocalPublicationOpenResult,
} from "./publication/local-publication-open";
import type {
  ProductNarrationAudibleProgressObservation,
  ProductNarrationCoordinator,
  ProductNarrationSnapshot,
} from "./tts/product-narration-coordinator";
import { INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1 } from "./tts/operational-recovery";
import { TtsProcessClient } from "./tts/process-client";
import type {
  HardwareCompatibilitySnapshotV1,
  HardwareProfileCompatibilityCoordinator,
} from "./tts/hardware-profile-compatibility";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

const TEST_DOCUMENT_ID = "document:test" as ContentDocumentId;
const TEST_TEXT = "Visible semantic passage" as SensitivePublicationText;
const TEST_BLOCK: SemanticBlock = Object.freeze({
  kind: "paragraph",
  children: Object.freeze([
    Object.freeze({
      kind: "text",
      text: TEST_TEXT,
    }),
  ]),
});
const TEST_DOCUMENT: SemanticDocument = Object.freeze({
  id: TEST_DOCUMENT_ID,
  location: Object.freeze({
    kind: "spine",
    spineItemId: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.id,
    spineItemIndex: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.index,
  }),
  blocks: Object.freeze([TEST_BLOCK]),
});
const TEST_LOCATED_BLOCK: PublicationLocatedBlock = Object.freeze({
  documentId: TEST_DOCUMENT_ID,
  block: TEST_BLOCK,
  startLocator:
    VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator,
  textLengthCodePoints: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.index,
});

function createTestPublication(
  title = "Synthetic Reader Book",
  authors: readonly string[] = ["Test Author"],
  options: { readonly empty?: boolean } = {},
): OpenedPublication {
  const empty = options.empty ?? false;
  return {
    book: Object.freeze({
      ...VALID_SYNTHETIC_DOCUMENT_FIXTURE.book,
      metadata: Object.freeze({
        title,
        authors: Object.freeze([...authors]),
      }),
    }),
    documents: empty ? Object.freeze([]) : Object.freeze([TEST_DOCUMENT]),
    locators: empty ? Object.freeze([]) : Object.freeze([TEST_LOCATED_BLOCK]),
    navigation: Object.freeze([]),
    resources: Object.freeze([]),
    closed: false,
    readResource: vi.fn(),
    resolveLocator: vi.fn((input: unknown) =>
      Object.freeze({
        status: "exact",
        reason: "exact",
        locator: input as ReadingLocatorV1,
        locatedBlock: TEST_LOCATED_BLOCK,
      }),
    ),
    resolveTarget: vi.fn(),
    prepareNarration: vi.fn<OpenedPublication["prepareNarration"]>(),
    close: vi.fn(() => Promise.resolve()),
  };
}

function createTestFlow(
  open: LocalPublicationOpenFlow["open"],
  close: LocalPublicationOpenFlow["close"] = () =>
    Promise.resolve({ status: "closed" }),
): LocalPublicationOpenFlow {
  return {
    publication: undefined,
    open: vi.fn(open),
    close: vi.fn(close),
  };
}

function createTestReaderPositionRepository(): ReaderPositionRepository {
  return {
    readPosition: vi.fn<ReaderPositionRepository["readPosition"]>(async () => ({
      status: "missing",
    })),
    writePosition: vi.fn<ReaderPositionRepository["writePosition"]>(
      async () => ({ status: "saved" }),
    ),
    readPreferences: vi.fn<ReaderPositionRepository["readPreferences"]>(
      async () => ({ status: "missing" }),
    ),
    writePreferences: vi.fn<ReaderPositionRepository["writePreferences"]>(
      async () => ({ status: "saved" }),
    ),
  };
}

function persistedState(locator: ReadingLocatorV1) {
  return decodePersistedReadingStateV1({
    schemaVersion: createSchemaVersion(1),
    bookIdentity: locator.bookIdentity,
    locator,
    preferences: {},
  });
}

function selectEpub(name = "private.epub"): void {
  fireEvent.change(screen.getByLabelText("Open a book"), {
    target: { files: [new File(["book"], name)] },
  });
}

function openSettings(): void {
  fireEvent.click(screen.getByRole("button", { name: "Settings" }));
}

function testLocatorAt(textOffsetCodePoints: number): ReadingLocatorV1 {
  return decodeReadingLocatorV1({
    ...TEST_LOCATED_BLOCK.startLocator,
    textOffsetCodePoints,
  });
}

function narrationSnapshot(
  playIntent: ProductNarrationSnapshot["navigation"]["playIntent"],
): ProductNarrationSnapshot {
  return Object.freeze({
    availability: "available",
    profileId: "qwen3-tts-12hz-1-7b-customvoice-serena-cuda-bf16-v1",
    language: "es",
    selection: Object.freeze({ kind: "quick" }),
    startPreferenceStatus: "ready",
    canPersistStartPreference: true,
    playbackRatePercent: 100,
    playbackPreferenceStatus: "ready",
    canPersistPlaybackPreference: true,
    state: undefined,
    failure: undefined,
    preparationFailure: undefined,
    metrics: Object.freeze({
      commandToAudibleMs: undefined,
      bufferingMs: 0,
      intentionalWaitMs: 0,
      playbackMs: 0,
      underrunCount: 0,
      acceptedAudioUnitCount: 0,
      acceptedAudioSampleFrames: 0,
      retainedAudioUnitCount: 0,
      discardedAudioUnitCount: 0,
    }),
    serviceState: "ready",
    recovery: INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1,
    navigation: Object.freeze({
      playIntent,
      settling: false,
      canGoPrevious: false,
      canGoNext: false,
    }),
  });
}

class ControlledNarrationCoordinator {
  #snapshot = narrationSnapshot("inactive");
  readonly #listeners = new Set<() => void>();
  readonly #audibleListeners = new Set<
    (observation: ProductNarrationAudibleProgressObservation) => void
  >();
  public readonly configurationEvents: string[] = [];

  public subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  public observe(): ProductNarrationSnapshot {
    return this.#snapshot;
  }

  public subscribeAudibleProgress(
    listener: (observation: ProductNarrationAudibleProgressObservation) => void,
  ): () => void {
    this.#audibleListeners.add(listener);
    return () => this.#audibleListeners.delete(listener);
  }

  public subscribeNavigationRequests(): () => void {
    return () => undefined;
  }

  public checkAvailability(): Promise<void> {
    return Promise.resolve();
  }

  public setSelection(): void {}

  public start(): void {
    this.#publish(narrationSnapshot("playing"));
  }

  public pause(): void {}

  public resume(): void {}

  public stop(): Promise<void> {
    this.#publish(narrationSnapshot("inactive"));
    return Promise.resolve();
  }

  public stopForConfigurationChange(): Promise<void> {
    this.configurationEvents.push("stop");
    return this.stop();
  }

  public resetStartPreference(): Promise<boolean> {
    this.configurationEvents.push("start-reset");
    return Promise.resolve(true);
  }

  public resetPlaybackPreference(): Promise<boolean> {
    this.configurationEvents.push("playback-reset");
    return Promise.resolve(true);
  }

  public setPlaybackRatePercent(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public refreshSelectedProfile(): Promise<void> {
    this.configurationEvents.push("refresh");
    return Promise.resolve();
  }

  public resetRecoveryEpisode(): void {}

  public close(): Promise<void> {
    return this.stop();
  }

  public setVolumePercent(): void {}

  public updateVisibleLocator(): void {}

  public beginExternalNavigation(): Promise<void> {
    return Promise.resolve();
  }

  public settleExternalNavigation(): void {}

  public readonly settleReaderPlacement = vi.fn();

  public preserveActiveLocator(): void {}

  public startAtVisibleLocator(): void {}

  public goToPreviousBoundary(): void {}

  public goToNextBoundary(): void {}

  public publishAudible(
    kind: ProductNarrationAudibleProgressObservation["kind"],
  ): void {
    const sourceRange = decodeLocatorRangeV1({
      schemaVersion: 1,
      start: testLocatorAt(10),
      end: testLocatorAt(20),
    });
    const observation = Object.freeze({
      kind,
      observedAtMs: 1,
      sessionId: "session:app-test",
      generationId: "generation:app-test",
      segmentId: "segment:app-test",
      sequence: 0,
      sourceRange,
      playedSampleFrames: kind === "segment-completed" ? 24_000 : 0,
      sampleCountSamples: 24_000,
    }) satisfies ProductNarrationAudibleProgressObservation;
    for (const listener of this.#audibleListeners) {
      listener(observation);
    }
  }

  public get audibleListenerCount(): number {
    return this.#audibleListeners.size;
  }

  #publish(snapshot: ProductNarrationSnapshot): void {
    this.#snapshot = snapshot;
    for (const listener of this.#listeners) {
      listener();
    }
  }
}

describe("App preference connection characterization", () => {
  const savedReaderPreferences = Object.freeze({
    ...DEFAULT_READER_PREFERENCES,
    textScale: "large" as const,
    theme: "dark" as const,
  });
  const savedSelection = Object.freeze({
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

  function observeSettings() {
    const OriginalDialog = settingsDialog.ReaderSettingsDialog;
    const observer = vi
      .spyOn(settingsDialog, "ReaderSettingsDialog")
      .mockImplementation((props) => <OriginalDialog {...props} />);
    const current = () => observer.mock.calls.at(-1)![0];
    return { observer, current };
  }

  function pendingPreferences() {
    const readerRead = deferred<ReaderPreferencesReadResult>();
    const narrationRead = deferred<NarrationStartPreferenceReadResult>();
    const reader = createTestReaderPositionRepository();
    vi.mocked(reader.readPreferences).mockReturnValue(readerRead.promise);
    const narration: NarrationStartPreferenceRepository = {
      read: vi.fn(() => narrationRead.promise),
      write: vi.fn(async () => ({ status: "saved" as const })),
      reset: vi.fn(async () => ({ status: "saved" as const })),
    };
    return { reader, narration, readerRead, narrationRead };
  }

  function observedNarrator(initial: ProductNarrationSnapshot) {
    const narrator = new ControlledNarrationCoordinator();
    let snapshot = initial;
    const listeners = new Set<() => void>();
    const disconnects: Array<ReturnType<typeof vi.fn>> = [];
    const events: string[] = [];
    vi.spyOn(narrator, "observe").mockImplementation(() => {
      events.push("observe");
      return snapshot;
    });
    vi.spyOn(narrator, "subscribe").mockImplementation((listener) => {
      events.push("subscribe");
      listeners.add(listener);
      const disconnect = vi.fn(() => listeners.delete(listener));
      disconnects.push(disconnect);
      return disconnect;
    });
    return {
      coordinator: narrator as unknown as ProductNarrationCoordinator,
      disconnects,
      events,
      replaceSnapshot(next: ProductNarrationSnapshot) {
        snapshot = next;
      },
      publish(next: ProductNarrationSnapshot) {
        snapshot = next;
        for (const listener of listeners) {
          listener();
        }
      },
    };
  }

  it.each([
    "ready",
    "missing",
    "malformed",
    "over-limit",
    "unavailable",
    "unsupported-version",
  ] as const)("preserves resolved %s status without writes", async (status) => {
    const f = pendingPreferences();
    const settings = observeSettings();
    const sink = vi.spyOn(
      ReaderPositionRestoreCoordinator.prototype,
      "setPreferences",
    );
    render(
      <App
        readerPositionRepository={f.reader}
        narrationStartPreferenceRepository={f.narration}
      />,
    );
    expect(settings.current()).toMatchObject({
      readerPreferences: DEFAULT_READER_PREFERENCES,
      readerPreferencesStatus: "loading",
      canPersistReaderPreferences: true,
      fallbackNarrationStart: {
        selection: DEFAULT_NARRATION_START_PREFERENCE_V1,
        status: "loading",
        canPersist: true,
      },
    });
    expect(vi.mocked(f.reader.readPreferences).mock.contexts).toEqual([
      f.reader,
    ]);
    expect(vi.mocked(f.narration.read).mock.contexts).toEqual([f.narration]);
    expect(
      vi.mocked(f.reader.readPreferences).mock.invocationCallOrder[0],
    ).toBeLessThan(vi.mocked(f.narration.read).mock.invocationCallOrder[0]!);
    await act(async () => {
      f.readerRead.resolve(
        status === "ready"
          ? { status, preferences: savedReaderPreferences }
          : { status },
      );
      f.narrationRead.resolve({ status, selection: savedSelection });
    });
    const preferences =
      status === "ready" ? savedReaderPreferences : DEFAULT_READER_PREFERENCES;
    expect(settings.current()).toMatchObject({
      readerPreferences: preferences,
      readerPreferencesStatus: status,
      canPersistReaderPreferences: status !== "unsupported-version",
      fallbackNarrationStart: {
        selection: savedSelection,
        status,
        canPersist: status !== "unsupported-version",
      },
    });
    expect(sink).toHaveBeenCalledExactlyOnceWith(preferences);
    expect(sink.mock.invocationCallOrder[0]).toBeLessThan(
      settings.observer.mock.invocationCallOrder.at(-1)!,
    );
    expect(f.reader.writePreferences).not.toHaveBeenCalled();
    expect(f.reader.writePosition).not.toHaveBeenCalled();
    expect(f.narration.write).not.toHaveBeenCalled();
    expect(f.narration.reset).not.toHaveBeenCalled();
  });

  it.each([
    ["reader", "resolve"],
    ["reader", "reject"],
    ["narration", "resolve"],
    ["narration", "reject"],
  ] as const)(
    "applies %s %s while the other read stays pending",
    async (source, outcome) => {
      const f = pendingPreferences();
      const settings = observeSettings();
      render(
        <App
          readerPositionRepository={f.reader}
          narrationStartPreferenceRepository={f.narration}
        />,
      );
      await act(async () => {
        if (outcome === "reject") {
          (source === "reader" ? f.readerRead : f.narrationRead).reject(
            new Error("Synthetic read failure"),
          );
        } else if (source === "reader") {
          f.readerRead.resolve({
            status: "ready",
            preferences: savedReaderPreferences,
          });
        } else {
          f.narrationRead.resolve({
            status: "ready",
            selection: savedSelection,
          });
        }
      });
      expect(settings.current().readerPreferencesStatus).toBe(
        source === "reader"
          ? outcome === "resolve"
            ? "ready"
            : "unavailable"
          : "loading",
      );
      expect(settings.current().fallbackNarrationStart.status).toBe(
        source === "narration"
          ? outcome === "resolve"
            ? "ready"
            : "unavailable"
          : "loading",
      );
      expect(settings.current().readerPreferences).toEqual(
        source === "reader" && outcome === "resolve"
          ? savedReaderPreferences
          : DEFAULT_READER_PREFERENCES,
      );
      expect(settings.current().fallbackNarrationStart.selection).toEqual(
        source === "narration" && outcome === "resolve"
          ? savedSelection
          : DEFAULT_NARRATION_START_PREFERENCE_V1,
      );
      expect(settings.current().canPersistReaderPreferences).toBe(true);
      expect(settings.current().fallbackNarrationStart.canPersist).toBe(true);
      expect(f.reader.writePreferences).not.toHaveBeenCalled();
      expect(f.narration.write).not.toHaveBeenCalled();
    },
  );

  it.each(["resolve", "reject"] as const)(
    "%s unavailable reader hydration has its own restore-sink behavior",
    async (outcome) => {
      const f = pendingPreferences();
      const settings = observeSettings();
      const sink = vi.spyOn(
        ReaderPositionRestoreCoordinator.prototype,
        "setPreferences",
      );
      vi.mocked(f.reader.readPreferences)
        .mockReturnValueOnce(f.readerRead.promise)
        .mockResolvedValue({ status: "unavailable" });
      const reader = vi.fn((props: ReadyPublicationContentProps) => (
        <article>{props.publication.book.metadata.title}</article>
      ));
      render(
        <App
          openFlow={createTestFlow(async () => ({
            status: "ready",
            publication: createTestPublication(),
          }))}
          readerPositionRepository={f.reader}
          narrationStartPreferenceRepository={f.narration}
          ReadyPublicationContent={reader}
        />,
      );
      await act(async () => {
        if (outcome === "resolve") {
          f.readerRead.resolve({ status: "unavailable" });
        } else {
          f.readerRead.reject(new Error("Synthetic read failure"));
        }
      });
      expect(settings.current().readerPreferencesStatus).toBe("unavailable");
      expect(sink).toHaveBeenCalledTimes(outcome === "resolve" ? 1 : 0);
      selectEpub();
      await screen.findByRole("article");
      expect(f.reader.readPreferences).toHaveBeenCalledTimes(
        outcome === "resolve" ? 1 : 2,
      );
      expect(settings.current().readerPreferencesStatus).toBe(
        outcome === "resolve" ? "ready" : "unavailable",
      );
      expect(reader.mock.calls.at(-1)?.[0].initialPreferences).toEqual(
        DEFAULT_READER_PREFERENCES,
      );
      expect(f.reader.writePreferences).not.toHaveBeenCalled();
    },
  );

  it.each(["before", "during", "after"] as const)(
    "applies startup reader hydration %s restoration",
    async (order) => {
      const f = pendingPreferences();
      const restorationRead = deferred<ReaderPreferencesReadResult>();
      const settings = observeSettings();
      vi.mocked(f.reader.readPreferences)
        .mockReturnValueOnce(f.readerRead.promise)
        .mockReturnValue(restorationRead.promise);
      const restored = {
        ...DEFAULT_READER_PREFERENCES,
        textScale: "small" as const,
      };
      const reader = vi.fn<
        (props: ReadyPublicationContentProps) => ReactElement
      >(() => <article>Preference order reader</article>);
      render(
        <App
          openFlow={createTestFlow(async () => ({
            status: "ready",
            publication: createTestPublication(),
          }))}
          readerPositionRepository={f.reader}
          narrationStartPreferenceRepository={f.narration}
          ReadyPublicationContent={reader}
        />,
      );
      const hydrate = () =>
        act(async () =>
          f.readerRead.resolve({
            status: "ready",
            preferences: savedReaderPreferences,
          }),
        );
      if (order === "before") await hydrate();
      selectEpub();
      await waitFor(() => expect(f.reader.readPosition).toHaveBeenCalledOnce());
      if (order !== "before") {
        expect(f.reader.readPreferences).toHaveBeenCalledTimes(2);
        expect(screen.queryByRole("article")).toBeNull();
        if (order === "during") {
          await hydrate();
          expect(settings.current().readerPreferences).toEqual(
            savedReaderPreferences,
          );
        }
        await act(async () =>
          restorationRead.resolve({ status: "ready", preferences: restored }),
        );
      }
      await screen.findByRole("article");
      const initial = order === "after" ? restored : savedReaderPreferences;
      expect(reader.mock.calls.at(-1)?.[0].initialPreferences).toEqual(initial);
      expect(settings.current().readerPreferences).toEqual(initial);
      if (order === "after") {
        await hydrate();
        expect(settings.current().readerPreferences).toEqual(
          savedReaderPreferences,
        );
        expect(reader.mock.calls.at(-1)?.[0].preferences).toEqual(
          savedReaderPreferences,
        );
        expect(reader.mock.calls.at(-1)?.[0].initialPreferences).toEqual(
          restored,
        );
      }
      expect(f.reader.readPreferences).toHaveBeenCalledTimes(
        order === "before" ? 1 : 2,
      );
      expect(f.reader.writePreferences).not.toHaveBeenCalled();
    },
  );

  it.each(["read-first", "edit-first"] as const)(
    "preserves reader edit and late read order: %s",
    async (order) => {
      const f = pendingPreferences();
      const settings = observeSettings();
      vi.mocked(f.reader.readPreferences)
        .mockReturnValueOnce(f.readerRead.promise)
        .mockResolvedValue({ status: "missing" });
      const reader = vi.fn<
        (props: ReadyPublicationContentProps) => ReactElement
      >(() => <article>Edited preference reader</article>);
      render(
        <App
          openFlow={createTestFlow(async () => ({
            status: "ready",
            publication: createTestPublication(),
          }))}
          readerPositionRepository={f.reader}
          narrationStartPreferenceRepository={f.narration}
          ReadyPublicationContent={reader}
        />,
      );
      selectEpub();
      await screen.findByRole("article");
      const hydrate = () =>
        act(async () =>
          f.readerRead.resolve({
            status: "ready",
            preferences: savedReaderPreferences,
          }),
        );
      if (order === "read-first") await hydrate();
      const edited = {
        ...settings.current().readerPreferences,
        textScale: "extra-large" as const,
      };
      act(() =>
        settings.current().onReaderPreferenceChange("textScale", "extra-large"),
      );
      expect(settings.current().readerPreferences).toEqual(edited);
      await waitFor(() =>
        expect(f.reader.writePreferences).toHaveBeenCalledExactlyOnceWith(
          edited,
        ),
      );
      if (order === "edit-first") await hydrate();
      const final = order === "read-first" ? edited : savedReaderPreferences;
      expect(settings.current().readerPreferences).toEqual(final);
      expect(reader.mock.calls.at(-1)?.[0].preferences).toEqual(final);
      expect(reader.mock.calls.at(-1)?.[0].initialPreferences).toEqual(
        DEFAULT_READER_PREFERENCES,
      );
      expect(f.reader.writePreferences).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["read-first", "edit-first"] as const)(
    "preserves fallback narration edit and read order: %s",
    async (order) => {
      const f = pendingPreferences();
      const settings = observeSettings();
      render(
        <App
          readerPositionRepository={f.reader}
          narrationStartPreferenceRepository={f.narration}
        />,
      );
      const hydrate = () =>
        act(async () =>
          f.narrationRead.resolve({
            status: "ready",
            selection: savedSelection,
          }),
        );
      if (order === "read-first") await hydrate();
      const edited = { kind: "prepared" as const, targetMs: 300_000 as const };
      await act(async () =>
        settings.current().fallbackNarrationStart.onSelectionChange(edited),
      );
      expect(settings.current().fallbackNarrationStart).toMatchObject({
        selection: edited,
        status: "ready",
        canPersist: true,
      });
      expect(f.narration.write).toHaveBeenCalledExactlyOnceWith(edited);
      if (order === "edit-first") await hydrate();
      expect(settings.current().fallbackNarrationStart.selection).toEqual(
        order === "read-first" ? edited : savedSelection,
      );
      expect(f.narration.write).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["read-first", "reset-first"] as const)(
    "preserves reset and outstanding narration read order: %s",
    async (order) => {
      const f = pendingPreferences();
      const settings = observeSettings();
      const hardware = {
        ensureChecked: vi.fn(async () => undefined),
        close: vi.fn(),
        resetLanguage: vi.fn(async () => true),
      } as unknown as HardwareProfileCompatibilityCoordinator;
      render(
        <App
          readerPositionRepository={f.reader}
          narrationStartPreferenceRepository={f.narration}
          hardwareCompatibilityCoordinator={hardware}
        />,
      );
      const hydrate = () =>
        act(async () =>
          f.narrationRead.resolve({
            status: "ready",
            selection: savedSelection,
          }),
        );
      if (order === "read-first") await hydrate();
      await act(async () => {
        expect(await settings.current().onResetNarrationSettings()).toBe(true);
      });
      expect(settings.current().fallbackNarrationStart).toMatchObject({
        selection: DEFAULT_NARRATION_START_PREFERENCE_V1,
        status: "ready",
        canPersist: true,
      });
      expect(hardware.resetLanguage).toHaveBeenCalledOnce();
      expect(f.narration.reset).toHaveBeenCalledOnce();
      if (order === "reset-first") await hydrate();
      expect(settings.current().fallbackNarrationStart.selection).toEqual(
        order === "read-first"
          ? DEFAULT_NARRATION_START_PREFERENCE_V1
          : savedSelection,
      );
      expect(f.narration.write).not.toHaveBeenCalled();
    },
  );

  it.each(["read-first", "observation-first"] as const)(
    "preserves narrator notification and late hydration order: %s",
    async (order) => {
      const f = pendingPreferences();
      const settings = observeSettings();
      vi.mocked(f.reader.readPreferences).mockResolvedValue({
        status: "missing",
      });
      const narrator = observedNarrator(narrationSnapshot("inactive"));
      const props = {
        openFlow: createTestFlow(async () => ({
          status: "ready" as const,
          publication: createTestPublication(),
        })),
        readerPositionRepository: f.reader,
        narrationStartPreferenceRepository: f.narration,
        createNarrationCoordinator: () => narrator.coordinator,
      };
      const view = render(<App {...props} />);
      selectEpub();
      await waitFor(() =>
        expect(settings.current().narrationCoordinator).toBe(
          narrator.coordinator,
        ),
      );
      expect(settings.current().fallbackNarrationStart).toMatchObject({
        selection: { kind: "quick" },
        status: "ready",
        canPersist: true,
      });
      const later = {
        ...narrationSnapshot("inactive"),
        selection: { kind: "prepared" as const, targetMs: 600_000 as const },
        startPreferenceStatus: "unsupported-version" as const,
        canPersistStartPreference: false,
      };
      const hydrate = () =>
        act(async () =>
          f.narrationRead.resolve({
            status: "ready",
            selection: savedSelection,
          }),
        );
      if (order === "read-first") await hydrate();
      act(() => narrator.publish(later));
      expect(settings.current().fallbackNarrationStart).toMatchObject({
        selection: later.selection,
        status: "unsupported-version",
        canPersist: false,
      });
      if (order === "observation-first") await hydrate();
      expect(settings.current().fallbackNarrationStart).toMatchObject(
        order === "read-first"
          ? {
              selection: later.selection,
              status: "unsupported-version",
              canPersist: false,
            }
          : { selection: savedSelection, status: "ready", canPersist: true },
      );
      // The controls have their own store subscriptions. A silent snapshot
      // change detects a restarted App binding by its fallback publication.
      const fallbackBeforeRerender = settings.current().fallbackNarrationStart;
      narrator.replaceSnapshot(narrationSnapshot("inactive"));
      view.rerender(<App {...props} />);
      expect(settings.current().fallbackNarrationStart).toMatchObject({
        selection: fallbackBeforeRerender.selection,
        status: fallbackBeforeRerender.status,
        canPersist: fallbackBeforeRerender.canPersist,
      });
      act(() => narrator.publish(narrationSnapshot("inactive")));
      expect(settings.current().fallbackNarrationStart).toMatchObject({
        selection: { kind: "quick" },
        status: "ready",
        canPersist: true,
      });
      expect(f.reader.readPreferences).toHaveBeenCalledOnce();
      expect(f.narration.read).toHaveBeenCalledOnce();
      expect(f.narration.write).not.toHaveBeenCalled();
    },
  );

  it.each(["resolve", "reject"] as const)(
    "ignores outstanding %s handlers after unmount",
    async (outcome) => {
      const f = pendingPreferences();
      const settings = observeSettings();
      const sink = vi.spyOn(
        ReaderPositionRestoreCoordinator.prototype,
        "setPreferences",
      );
      const view = render(
        <App
          readerPositionRepository={f.reader}
          narrationStartPreferenceRepository={f.narration}
        />,
      );
      view.unmount();
      const renders = settings.observer.mock.calls.length;
      await act(async () => {
        if (outcome === "resolve") {
          f.readerRead.resolve({
            status: "ready",
            preferences: savedReaderPreferences,
          });
          f.narrationRead.resolve({
            status: "ready",
            selection: savedSelection,
          });
        } else {
          f.readerRead.reject(new Error("Synthetic obsolete reader failure"));
          f.narrationRead.reject(
            new Error("Synthetic obsolete narration failure"),
          );
        }
      });
      expect(sink).not.toHaveBeenCalled();
      expect(settings.observer).toHaveBeenCalledTimes(renders);
      expect(f.reader.writePreferences).not.toHaveBeenCalled();
      expect(f.narration.write).not.toHaveBeenCalled();
    },
  );

  it.each(["resolve", "reject"] as const)(
    "StrictMode ignores obsolete %s while current reads remain effective",
    async (outcome) => {
      const f = pendingPreferences();
      const oldReader = deferred<ReaderPreferencesReadResult>();
      const oldNarration = deferred<NarrationStartPreferenceReadResult>();
      vi.mocked(f.reader.readPreferences)
        .mockReturnValueOnce(oldReader.promise)
        .mockReturnValueOnce(f.readerRead.promise);
      vi.mocked(f.narration.read)
        .mockReturnValueOnce(oldNarration.promise)
        .mockReturnValueOnce(f.narrationRead.promise);
      const settings = observeSettings();
      const sink = vi.spyOn(
        ReaderPositionRestoreCoordinator.prototype,
        "setPreferences",
      );
      render(
        <StrictMode>
          <App
            readerPositionRepository={f.reader}
            narrationStartPreferenceRepository={f.narration}
          />
        </StrictMode>,
      );
      expect(f.reader.readPreferences).toHaveBeenCalledTimes(2);
      expect(f.narration.read).toHaveBeenCalledTimes(2);
      await act(async () => {
        if (outcome === "resolve") {
          oldReader.resolve({
            status: "ready",
            preferences: savedReaderPreferences,
          });
          oldNarration.resolve({ status: "ready", selection: savedSelection });
        } else {
          oldReader.reject(new Error("Synthetic obsolete reader failure"));
          oldNarration.reject(
            new Error("Synthetic obsolete narration failure"),
          );
        }
      });
      expect(sink).not.toHaveBeenCalled();
      expect(settings.current().readerPreferencesStatus).toBe("loading");
      expect(settings.current().fallbackNarrationStart.status).toBe("loading");
      await act(async () => {
        f.readerRead.resolve({
          status: "ready",
          preferences: savedReaderPreferences,
        });
        f.narrationRead.resolve({ status: "ready", selection: savedSelection });
      });
      expect(sink).toHaveBeenCalledExactlyOnceWith(savedReaderPreferences);
      expect(settings.current().readerPreferences).toEqual(
        savedReaderPreferences,
      );
      expect(settings.current().fallbackNarrationStart).toMatchObject({
        selection: savedSelection,
        status: "ready",
        canPersist: true,
      });
      expect(f.reader.writePreferences).not.toHaveBeenCalled();
      expect(f.narration.write).not.toHaveBeenCalled();
    },
  );

  it("disconnects replaced narrators and preserves fallback while no coordinator exists", async () => {
    const f = pendingPreferences();
    vi.mocked(f.reader.readPreferences).mockResolvedValue({
      status: "missing",
    });
    const settings = observeSettings();
    const firstSnapshot = {
      ...narrationSnapshot("inactive"),
      selection: savedSelection,
      startPreferenceStatus: "unsupported-version" as const,
      canPersistStartPreference: false,
    };
    const first = observedNarrator(firstSnapshot);
    const second = observedNarrator(narrationSnapshot("inactive"));
    const replacement = deferred<LocalPublicationOpenResult>();
    const open = vi
      .fn<LocalPublicationOpenFlow["open"]>()
      .mockResolvedValueOnce({
        status: "ready",
        publication: createTestPublication("First preference owner"),
      })
      .mockReturnValueOnce(replacement.promise);
    const createNarrationCoordinator = vi
      .fn()
      .mockReturnValueOnce(first.coordinator)
      .mockReturnValueOnce(second.coordinator);
    const view = render(
      <App
        openFlow={createTestFlow(open)}
        readerPositionRepository={f.reader}
        narrationStartPreferenceRepository={f.narration}
        createNarrationCoordinator={createNarrationCoordinator}
      />,
    );
    expect(settings.current().narrationCoordinator).toBeUndefined();
    expect(first.events).toEqual([]);
    selectEpub();
    await waitFor(() =>
      expect(settings.current().narrationCoordinator).toBe(first.coordinator),
    );
    expect(settings.current().fallbackNarrationStart).toMatchObject({
      selection: savedSelection,
      status: "unsupported-version",
      canPersist: false,
    });
    expect(
      first.events.some(
        (event, index) =>
          event === "observe" && first.events[index + 1] === "subscribe",
      ),
    ).toBe(true);
    selectEpub("replacement.epub");
    await waitFor(() => expect(open).toHaveBeenCalledTimes(2));
    expect(settings.current().narrationCoordinator).toBeUndefined();
    for (const disconnect of first.disconnects) {
      expect(disconnect).toHaveBeenCalledOnce();
    }
    act(() => first.publish(narrationSnapshot("inactive")));
    expect(settings.current().fallbackNarrationStart).toMatchObject({
      selection: savedSelection,
      status: "unsupported-version",
      canPersist: false,
    });
    await act(async () =>
      replacement.resolve({
        status: "ready",
        publication: createTestPublication("Second preference owner"),
      }),
    );
    await waitFor(() =>
      expect(settings.current().narrationCoordinator).toBe(second.coordinator),
    );
    expect(settings.current().fallbackNarrationStart).toMatchObject({
      selection: { kind: "quick" },
      status: "ready",
      canPersist: true,
    });
    view.unmount();
    for (const disconnect of second.disconnects) {
      expect(disconnect).toHaveBeenCalledOnce();
    }
    expect(f.narration.write).not.toHaveBeenCalled();
    expect(f.narration.reset).not.toHaveBeenCalled();
  });
});

describe("desktop reader lifecycle surface", () => {
  it.each([false, true])(
    "waits for late hardware before enabling Play, including unmount=%s",
    async (unmountBeforeCheck) => {
      let finish!: () => void;
      let activeProfileId: string | undefined;
      const checked = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const hardware = {
        ensureChecked: vi.fn(() => checked),
        check: vi.fn(() => checked),
        close: vi.fn(),
        activeProfileId: () => activeProfileId,
        activeLanguage: () => "en" as const,
        isProfileCurrentlyAllowed: () =>
          activeProfileId === undefined ? undefined : true,
        isProfileStartAllowed: vi.fn(async () => true),
      } as unknown as HardwareProfileCompatibilityCoordinator;
      const configuration = vi
        .spyOn(TtsProcessClient.prototype, "profileConfigurationAvailability")
        .mockResolvedValue("available");
      const view = render(
        <App
          openFlow={createTestFlow(async () => ({
            status: "ready",
            publication: createTestPublication(),
          }))}
          readerPositionRepository={createTestReaderPositionRepository()}
          hardwareCompatibilityCoordinator={hardware}
          ReadyPublicationContent={() => (
            <article>Synthetic visual reader</article>
          )}
        />,
      );
      try {
        selectEpub();
        await screen.findByRole("article");
        await act(async () => {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        });
        expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
        expect(document.querySelector(".product-narration")).toHaveAttribute(
          "data-narration-availability",
          "checking",
        );
        expect(configuration).not.toHaveBeenCalled();
        if (unmountBeforeCheck) {
          view.unmount();
          await act(async () => {
            await Promise.resolve();
          });
        }
        activeProfileId = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
        await act(async () => {
          finish();
          await checked;
        });
        if (unmountBeforeCheck) {
          expect(configuration).not.toHaveBeenCalled();
        } else {
          await waitFor(() =>
            expect(screen.getByRole("button", { name: "Play" })).toBeEnabled(),
          );
          expect(configuration).toHaveBeenCalledWith(activeProfileId);
        }
      } finally {
        finish();
        view.unmount();
      }
    },
  );

  it("keeps the heading and Settings available while restoration prepares, then mounts the reader before settlement", async () => {
    const publication = createTestPublication("Preparing reader book");
    const repository = createTestReaderPositionRepository();
    let resolvePosition:
      ((result: ReaderPositionReadResult) => void) | undefined;
    vi.mocked(repository.readPosition).mockReturnValue(
      new Promise((resolve) => {
        resolvePosition = resolve;
      }),
    );
    let readerProps: ReadyPublicationContentProps | undefined;
    function ControlledReader(props: ReadyPublicationContentProps) {
      readerProps = props;
      return <article aria-label="Preparing reader">{TEST_TEXT}</article>;
    }
    render(
      <App
        openFlow={createTestFlow(async () => ({
          status: "ready",
          publication,
        }))}
        readerPositionRepository={repository}
        ReadyPublicationContent={ControlledReader}
      />,
    );
    selectEpub();
    await screen.findByText("Preparing the saved reader state.");
    expect(
      screen.getByRole("heading", { name: "Preparing reader book" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Settings" })).toBeEnabled();
    expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(
      screen.queryByRole("article", { name: "Preparing reader" }),
    ).toBeNull();
    await act(async () =>
      resolvePosition?.({
        status: "ready",
        state: persistedState(TEST_LOCATED_BLOCK.startLocator),
      }),
    );
    await screen.findByRole("article", { name: "Preparing reader" });
    expect(screen.queryByText("Preparing the saved reader state.")).toBeNull();
    expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Restoring saved reader state.",
    );
    act(() =>
      readerProps?.onInitialRestorationSettled?.({
        status: "settled",
        locator: TEST_LOCATED_BLOCK.startLocator,
      }),
    );
    expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
      "aria-busy",
      "false",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Reading position restored.",
    );
  });

  it("ignores an old publication's settlement callback while its same-book replacement is pending", async () => {
    const first = createTestPublication("First restoration session");
    const second = createTestPublication("Replacement restoration session");
    expect(second).not.toBe(first);
    expect(second.book.identity).toEqual(first.book.identity);
    const repository = createTestReaderPositionRepository();
    vi.mocked(repository.readPosition).mockResolvedValue({
      status: "ready",
      state: persistedState(TEST_LOCATED_BLOCK.startLocator),
    });
    let readerProps: ReadyPublicationContentProps | undefined;
    function ControlledReader(props: ReadyPublicationContentProps) {
      readerProps = props;
      return (
        <article aria-label="Replacement settlement reader">Reader</article>
      );
    }
    render(
      <App
        openFlow={createTestFlow(
          vi
            .fn<LocalPublicationOpenFlow["open"]>()
            .mockResolvedValueOnce({ status: "ready", publication: first })
            .mockResolvedValueOnce({ status: "ready", publication: second }),
        )}
        readerPositionRepository={repository}
        ReadyPublicationContent={ControlledReader}
      />,
    );
    selectEpub("first.epub");
    await screen.findByRole("article", {
      name: "Replacement settlement reader",
    });
    expect(readerProps?.publication).toBe(first);
    const oldCallback = readerProps?.onInitialRestorationSettled;
    expect(oldCallback).toBeDefined();
    selectEpub("replacement.epub");
    await waitFor(() => expect(readerProps?.publication).toBe(second));
    act(() =>
      oldCallback?.({
        status: "unavailable",
        locator: TEST_LOCATED_BLOCK.startLocator,
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Restoring saved reader state.",
    );
    expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.queryByLabelText("Reading position recovery")).toBeNull();
    act(() =>
      readerProps?.onInitialRestorationSettled?.({
        status: "settled",
        locator: TEST_LOCATED_BLOCK.startLocator,
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Reading position restored.",
    );
    expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });

  it("preserves the accepted settlement message and notice after conflicting duplicate callbacks", async () => {
    const repository = createTestReaderPositionRepository();
    vi.mocked(repository.readPosition).mockResolvedValue({
      status: "ready",
      state: persistedState(TEST_LOCATED_BLOCK.startLocator),
    });
    let readerProps: ReadyPublicationContentProps | undefined;
    function ControlledReader(props: ReadyPublicationContentProps) {
      readerProps = props;
      return <article aria-label="Duplicate settlement reader">Reader</article>;
    }
    render(
      <App
        openFlow={createTestFlow(async () => ({
          status: "ready",
          publication: createTestPublication(),
        }))}
        readerPositionRepository={repository}
        ReadyPublicationContent={ControlledReader}
      />,
    );
    selectEpub();
    await screen.findByRole("article", { name: "Duplicate settlement reader" });
    const callback = readerProps?.onInitialRestorationSettled;
    expect(callback).toBeDefined();
    act(() =>
      callback?.({
        status: "unavailable",
        locator: TEST_LOCATED_BLOCK.startLocator,
      }),
    );
    for (const status of ["settled", "superseded"] as const) {
      act(() => callback?.({ status, locator: testLocatorAt(1) }));
      expect(screen.getByRole("status")).toHaveTextContent(
        "The EPUB opened, but its saved reading position could not be aligned.",
      );
      expect(
        screen.getByLabelText("Reading position recovery"),
      ).toHaveTextContent(
        "VoxLeaf could not align the saved reading position.",
      );
      expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
        "aria-busy",
        "false",
      );
    }
  });

  it("omits the initial locator when a new book starts at the beginning", async () => {
    let readerProps: ReadyPublicationContentProps | undefined;
    function BookStartReader(props: ReadyPublicationContentProps) {
      readerProps = props;
      return <article aria-label="Book start reader">{TEST_TEXT}</article>;
    }
    render(
      <App
        openFlow={createTestFlow(async () => ({
          status: "ready",
          publication: createTestPublication(),
        }))}
        readerPositionRepository={createTestReaderPositionRepository()}
        ReadyPublicationContent={BookStartReader}
      />,
    );
    selectEpub();
    await screen.findByRole("article", { name: "Book start reader" });
    expect(readerProps).toBeDefined();
    expect(Object.hasOwn(readerProps!, "initialLocator")).toBe(false);
    expect(readerProps?.restoreInitialLocator).toBe(false);
  });

  it("preserves reader DOM and local state through Settings, preferences and notice dismissal", async () => {
    const repository = createTestReaderPositionRepository();
    vi.mocked(repository.readPosition).mockResolvedValue({
      status: "unavailable",
    });
    let readerProps: ReadyPublicationContentProps | undefined;
    function StatefulReader(props: ReadyPublicationContentProps) {
      readerProps = props;
      const [count, setCount] = useState(0);
      return (
        <article aria-label="Continuous reader">
          <button type="button" onClick={() => setCount((value) => value + 1)}>
            Reader interaction {count}
          </button>
        </article>
      );
    }
    render(
      <App
        openFlow={createTestFlow(async () => ({
          status: "ready",
          publication: createTestPublication(),
        }))}
        readerPositionRepository={repository}
        ReadyPublicationContent={StatefulReader}
      />,
    );
    selectEpub();
    const reader = await screen.findByRole("article", {
      name: "Continuous reader",
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Reader interaction 0" }),
    );
    const interaction = screen.getByRole("button", {
      name: "Reader interaction 1",
    });
    const settingsButton = screen.getByRole("button", { name: "Settings" });
    const expectContinuousReader = (): void => {
      expect(screen.getByRole("article", { name: "Continuous reader" })).toBe(
        reader,
      );
      expect(screen.getByRole("button", { name: "Reader interaction 1" })).toBe(
        interaction,
      );
    };
    fireEvent.click(settingsButton);
    expect(
      screen.getByRole("button", { name: "Close Settings" }),
    ).toHaveFocus();
    expectContinuousReader();
    fireEvent.change(screen.getByLabelText("Text size"), {
      target: { value: "large" },
    });
    expect(readerProps?.preferences?.textScale).toBe("large");
    expectContinuousReader();
    fireEvent.click(screen.getByRole("button", { name: "Close Settings" }));
    expect(screen.queryByRole("dialog", { name: "Settings" })).toBeNull();
    expect(screen.getByRole("button", { name: "Settings" })).toBe(
      settingsButton,
    );
    expect(settingsButton).toHaveFocus();
    expectContinuousReader();
    fireEvent.click(settingsButton);
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Settings" }), {
      key: "Escape",
    });
    expect(screen.queryByRole("dialog", { name: "Settings" })).toBeNull();
    expect(screen.getByRole("button", { name: "Settings" })).toBe(
      settingsButton,
    );
    expect(settingsButton).toHaveFocus();
    expectContinuousReader();
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss restoration notice" }),
    );
    expect(screen.queryByLabelText("Reading position recovery")).toBeNull();
    expectContinuousReader();
    expect(repository.readPosition).toHaveBeenCalledOnce();
  });

  it("keeps one effective hardware visibility subscription in StrictMode and disconnects on unmount", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState",
    );
    let visibility: DocumentVisibilityState = "visible";
    const addListener = vi.spyOn(document, "addEventListener");
    const removeListener = vi.spyOn(document, "removeEventListener");
    const ensureChecked = vi.fn(() => new Promise<never>(() => {}));
    const check = vi.fn(() => new Promise<never>(() => {}));
    const close = vi.fn();
    const hardware = {
      ensureChecked,
      check,
      close,
    } as unknown as HardwareProfileCompatibilityCoordinator;
    const dispatchVisibility = (next: DocumentVisibilityState): void => {
      visibility = next;
      fireEvent(document, new Event("visibilitychange"));
    };
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibility,
    });
    try {
      const view = render(
        <StrictMode>
          <App hardwareCompatibilityCoordinator={hardware} />
        </StrictMode>,
      );
      const added = addListener.mock.calls.filter(
        ([type]) => type === "visibilitychange",
      );
      const removed = removeListener.mock.calls.filter(
        ([type]) => type === "visibilitychange",
      );
      expect(
        added.filter(
          ([, listener]) =>
            !removed.some(
              ([, removedListener]) => removedListener === listener,
            ),
        ),
      ).toHaveLength(1);
      dispatchVisibility("visible");
      dispatchVisibility("hidden");
      dispatchVisibility("hidden");
      expect(check).not.toHaveBeenCalled();
      dispatchVisibility("visible");
      dispatchVisibility("visible");
      expect(check).toHaveBeenCalledExactlyOnceWith("operating-system-resume");
      expect(close).not.toHaveBeenCalled();
      dispatchVisibility("hidden");
      view.unmount();
      dispatchVisibility("visible");
      expect(check).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(close).toHaveBeenCalledOnce());
    } finally {
      cleanup();
      if (descriptor === undefined) {
        Reflect.deleteProperty(document, "visibilityState");
      } else {
        Object.defineProperty(document, "visibilityState", descriptor);
      }
      addListener.mockRestore();
      removeListener.mockRestore();
    }
  });

  it("preserves the picker node and resets its value before opening or cancelling selection", async () => {
    const pending: Array<(result: LocalPublicationOpenResult) => void> = [];
    const flow = createTestFlow(() => {
      expect(input).toHaveValue("");
      return new Promise((resolve) => pending.push(resolve));
    });
    render(<App openFlow={flow} />);
    const input = screen.getByLabelText("Open a book");
    Object.defineProperty(input, "value", {
      configurable: true,
      writable: true,
      value: "C:\\fakepath\\first.epub",
    });
    selectEpub("first.epub");
    expect(input).toHaveValue("");
    expect(screen.getByLabelText("Open a book")).toBe(input);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Validating and opening the selected EPUB.",
    );
    await act(async () =>
      pending[0]?.({
        status: "ready",
        publication: createTestPublication("First book", []),
      }),
    );
    await waitFor(() =>
      expect(input).toHaveAccessibleDescription(
        "The EPUB opened successfully.",
      ),
    );
    expect(screen.getByLabelText("Open a book")).toBe(input);
    expect(screen.getByText("Author not provided")).toBeVisible();
    expect(screen.getByRole("status")).toHaveClass("visually-hidden");
    Object.defineProperty(input, "value", {
      value: "C:\\fakepath\\cancelled.epub",
    });
    fireEvent.change(input, { target: { files: [] } });
    expect(input).toHaveValue("");
    expect(
      screen.getByRole("heading", { name: "First book" }),
    ).toBeInTheDocument();
    expect(flow.open).toHaveBeenCalledTimes(1);
    expect(flow.close).not.toHaveBeenCalled();
    selectEpub("replacement.epub");
    expect(screen.getByLabelText("Open a book")).toBe(input);
    expect(screen.queryByRole("heading", { name: "First book" })).toBeNull();
    await act(async () =>
      pending[1]?.({
        status: "ready",
        publication: createTestPublication("Replacement book"),
      }),
    );
    await screen.findByRole("heading", { name: "Replacement book" });
    expect(screen.getByLabelText("Open a book")).toBe(input);
    selectEpub("invalid.epub");
    expect(screen.getByLabelText("Open a book")).toBe(input);
    await act(async () =>
      pending[2]?.({ status: "rejected", reason: "invalid-epub" }),
    );
    expect(screen.getByLabelText("Open a book")).toBe(input);
    expect(input).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "That file is not a valid supported EPUB.",
    );
    expect(screen.getByRole("status")).toHaveClass("open-status-error");
    expect(screen.getByRole("status")).not.toHaveClass("visually-hidden");
  });

  it.each([
    [
      "exact",
      "unsupported-version",
      "settled",
      "Reading position restored.",
      "Saved reader appearance settings could not be used. Default settings are active.",
    ],
    [
      "exact",
      "unavailable",
      "settled",
      "Reading position restored.",
      "Saved reader appearance settings could not be used. Default settings are active.",
    ],
    [
      "recovered",
      "unsupported-version",
      "settled",
      "Reading position restored to the nearest available passage.",
      "The saved reading position was adjusted to the nearest available passage.",
    ],
    [
      "unavailable",
      "unavailable",
      "settled",
      "The EPUB opened, but saved reader state is unavailable.",
      "Saved reader state is unavailable. Reading continues from the beginning.",
    ],
    [
      "malformed",
      "unsupported-version",
      "settled",
      "The EPUB opened at the beginning because its saved position could not be used.",
      "The saved reading position could not be used. Reading continues from the beginning.",
    ],
    [
      "recovered",
      "unavailable",
      "unavailable",
      "The EPUB opened, but its saved reading position could not be aligned.",
      "VoxLeaf could not align the saved reading position.",
    ],
    [
      "recovered",
      "unavailable",
      "superseded",
      "The EPUB opened successfully.",
      undefined,
    ],
  ] as const)(
    "preserves notice precedence for %s position, %s preferences and %s settlement",
    async (
      position,
      preference,
      settlement,
      expectedStatus,
      expectedNotice,
    ) => {
      const publication = createTestPublication();
      const repository = createTestReaderPositionRepository();
      // Keep startup hydration pending: it otherwise caches ready preferences
      // before publication restoration can read the injected failure status.
      vi.mocked(repository.readPreferences)
        .mockReturnValueOnce(new Promise(() => undefined))
        .mockResolvedValue({ status: preference });
      if (position === "exact" || position === "recovered") {
        vi.mocked(repository.readPosition).mockResolvedValue({
          status: "ready",
          state: persistedState(TEST_LOCATED_BLOCK.startLocator),
        });
        if (position === "recovered") {
          vi.mocked(publication.resolveLocator).mockReturnValue({
            status: "recovered",
            reason: "nearest-offset",
            locator: TEST_LOCATED_BLOCK.startLocator,
            locatedBlock: TEST_LOCATED_BLOCK,
          });
        }
      } else {
        vi.mocked(repository.readPosition).mockResolvedValue({
          status: position,
        });
      }
      let readerProps: ReadyPublicationContentProps | undefined;
      function ControlledReader(props: ReadyPublicationContentProps) {
        readerProps = props;
        return <article aria-label="Notice policy reader">{TEST_TEXT}</article>;
      }
      render(
        <App
          openFlow={createTestFlow(() =>
            Promise.resolve({ status: "ready", publication }),
          )}
          readerPositionRepository={repository}
          ReadyPublicationContent={ControlledReader}
        />,
      );
      selectEpub();
      await screen.findByRole("article", { name: "Notice policy reader" });
      expect(repository.readPreferences).toHaveBeenCalledTimes(2);
      if (position === "exact" || position === "recovered") {
        expect(screen.getByRole("status")).toHaveTextContent(
          "Restoring saved reader state.",
        );
        expect(screen.queryByLabelText("Reading position recovery")).toBeNull();
        act(() =>
          readerProps?.onInitialRestorationSettled?.({
            status: settlement,
            locator: TEST_LOCATED_BLOCK.startLocator,
          }),
        );
      }
      expect(screen.getByRole("status")).toHaveTextContent(expectedStatus);
      expect(screen.getByRole("status")).toHaveClass("visually-hidden");
      expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
        "aria-busy",
        "false",
      );
      if (expectedNotice === undefined) {
        expect(screen.queryByLabelText("Reading position recovery")).toBeNull();
      } else {
        expect(
          screen.getByLabelText("Reading position recovery"),
        ).toHaveTextContent(expectedNotice);
      }
    },
  );

  it("shows a later publication's notice after dismissing the previous one", async () => {
    const first = createTestPublication("First notice book");
    const second = createTestPublication("Second notice book");
    const repository = createTestReaderPositionRepository();
    vi.mocked(repository.readPosition).mockResolvedValue({
      status: "unavailable",
    });
    const flow = createTestFlow(
      vi
        .fn<LocalPublicationOpenFlow["open"]>()
        .mockResolvedValueOnce({ status: "ready", publication: first })
        .mockResolvedValueOnce({ status: "ready", publication: second }),
    );
    render(<App openFlow={flow} readerPositionRepository={repository} />);
    selectEpub("first.epub");
    await screen.findByLabelText("Reading position recovery");
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss restoration notice" }),
    );
    expect(screen.queryByLabelText("Reading position recovery")).toBeNull();
    selectEpub("second.epub");
    expect(
      await screen.findByLabelText("Reading position recovery"),
    ).toHaveTextContent(
      "Saved reader state is unavailable. Reading continues from the beginning.",
    );
    expect(
      screen.getByRole("heading", { name: "Second notice book" }),
    ).toBeInTheDocument();
  });

  it("keeps the empty shell focused on one styled book-opening action", () => {
    render(<App />);
    const input = screen.getByLabelText("Open a book");
    expect(input.closest("label")).toHaveClass("file-picker-button");
    expect(screen.getByText("Open a book")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Settings" })).toBeNull();
    expect(screen.queryByText("Local narration")).toBeNull();
    expect(screen.queryByText("Open a local EPUB")).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: "Run synthetic raster safety probe",
      }),
    ).toBeNull();
  });

  it("renders an accessible capability-free idle state", () => {
    const flow = createTestFlow(() => Promise.resolve({ status: "cancelled" }));
    render(<App openFlow={flow} />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "VoxLeaf" }),
    ).toBeInTheDocument();
    const input = screen.getByLabelText("Open a book");
    expect(input).toHaveAttribute("accept", ".epub,application/epub+zip");
    expect(input).toHaveAccessibleDescription("No local EPUB is open.");
    expect(screen.getByRole("status")).toHaveTextContent(
      "No local EPUB is open.",
    );
  });

  it("shows validated ready metadata without displaying the private filename", async () => {
    const publication = createTestPublication("Repository-authored title", [
      "First Author",
      "Second Author",
    ]);
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    render(<App openFlow={flow} />);

    selectEpub("private-title.epub");

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "The EPUB opened successfully.",
      ),
    );
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Repository-authored title",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("By First Author, Second Author"),
    ).toBeInTheDocument();
    expect(screen.getByText(TEST_TEXT)).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Current reading section" }),
    ).toBeInTheDocument();
    expect(publication.readResource).not.toHaveBeenCalled();
    expect(publication.resolveTarget).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Settings" })).toBeEnabled();
    expect(screen.getByText("Open a book")).toBeVisible();
    expect(screen.queryByText("Replace EPUB")).toBeNull();
    expect(screen.queryByRole("button", { name: "Close EPUB" })).toBeNull();
    expect(screen.queryByText("Local narration compatibility")).toBeNull();
    expect(screen.getByRole("main")).toHaveClass("app-shell-reader");
    expect(
      document.querySelectorAll('[data-reader-scroll-owner="true"]'),
    ).toHaveLength(1);
    expect(
      screen.getByRole("region", {
        name: "Publication reading viewport",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show narration details" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(document.body).not.toHaveTextContent("private-title.epub");
    expect(screen.getByLabelText("Open a book")).toHaveValue("");
  });

  it("does not cancel restoration during the React StrictMode mount probe", async () => {
    const publication = createTestPublication("Strict mode reader book");
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    const repository = createTestReaderPositionRepository();

    render(
      <StrictMode>
        <App
          openFlow={flow}
          readerPositionRepository={repository}
          ReadyPublicationContent={() => (
            <article aria-label="Strict mode reader">Reader</article>
          )}
        />
      </StrictMode>,
    );

    selectEpub("strict-mode-private.epub");

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "The EPUB opened successfully.",
      ),
    );
    expect(
      screen.getByRole("article", { name: "Strict mode reader" }),
    ).toBeInTheDocument();
  });

  it("loads exact saved position and display preferences before settling the reader", async () => {
    const publication = createTestPublication("Restored reader book");
    const repository = createTestReaderPositionRepository();
    const preferences = Object.freeze({
      schemaVersion: 1 as const,
      textScale: "large" as const,
      lineSpacing: "spacious" as const,
      contentWidth: "narrow" as const,
      theme: "dark" as const,
    });
    vi.mocked(repository.readPosition).mockResolvedValue({
      status: "ready",
      state: persistedState(TEST_LOCATED_BLOCK.startLocator),
    });
    vi.mocked(repository.readPreferences).mockResolvedValue({
      status: "ready",
      preferences,
    });
    let receivedProps: ReadyPublicationContentProps | undefined;
    function SettlingReader(props: ReadyPublicationContentProps) {
      receivedProps = props;
      const { initialLocator, onInitialRestorationSettled } = props;
      useEffect(() => {
        if (initialLocator !== undefined) {
          onInitialRestorationSettled?.({
            status: "settled",
            locator: initialLocator,
          });
        }
      }, [initialLocator, onInitialRestorationSettled]);
      return (
        <article aria-label="Restored synthetic reader">{TEST_TEXT}</article>
      );
    }
    render(
      <App
        openFlow={createTestFlow(() =>
          Promise.resolve({ status: "ready", publication }),
        )}
        readerPositionRepository={repository}
        ReadyPublicationContent={SettlingReader}
      />,
    );

    selectEpub("private-restored.epub");

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Reading position restored.",
      ),
    );
    expect(receivedProps?.initialLocator).toEqual(
      TEST_LOCATED_BLOCK.startLocator,
    );
    expect(receivedProps?.initialPreferences).toEqual(preferences);
    expect(receivedProps?.restoreInitialLocator).toBe(true);
    expect(receivedProps?.narrationSource).toBeDefined();
    expect(repository.writePosition).not.toHaveBeenCalled();
    expect(document.body).not.toHaveTextContent("private-restored.epub");
  });

  it("announces and saves a recovered canonical locator only after visual settlement", async () => {
    const publication = createTestPublication("Recovered reader book");
    const staleLocator = decodeReadingLocatorV1({
      ...TEST_LOCATED_BLOCK.startLocator,
      textOffsetCodePoints: 99,
    });
    const canonicalLocator = TEST_LOCATED_BLOCK.startLocator;
    vi.mocked(publication.resolveLocator).mockImplementation(
      (input: unknown) => {
        const locator = input as ReadingLocatorV1;
        return locator.textOffsetCodePoints > 0
          ? Object.freeze({
              status: "recovered",
              reason: "nearest-offset",
              locator: canonicalLocator,
              locatedBlock: TEST_LOCATED_BLOCK,
            })
          : Object.freeze({
              status: "exact",
              reason: "exact",
              locator: canonicalLocator,
              locatedBlock: TEST_LOCATED_BLOCK,
            });
      },
    );
    const repository = createTestReaderPositionRepository();
    vi.mocked(repository.readPosition).mockResolvedValue({
      status: "ready",
      state: persistedState(staleLocator),
    });
    let settle: (() => void) | undefined;
    function ControlledReader(props: ReadyPublicationContentProps) {
      settle = () => {
        if (props.initialLocator !== undefined) {
          props.onInitialRestorationSettled?.({
            status: "settled",
            locator: props.initialLocator,
          });
        }
      };
      return (
        <article aria-label="Recovered synthetic reader">{TEST_TEXT}</article>
      );
    }
    render(
      <App
        openFlow={createTestFlow(() =>
          Promise.resolve({ status: "ready", publication }),
        )}
        readerPositionRepository={repository}
        ReadyPublicationContent={ControlledReader}
      />,
    );

    selectEpub("private-recovered.epub");
    await screen.findByRole("article", {
      name: "Recovered synthetic reader",
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Restoring saved reader state.",
    );
    expect(repository.writePosition).not.toHaveBeenCalled();

    act(() => settle?.());

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Reading position restored to the nearest available passage.",
      ),
    );
    expect(
      screen.getByText(
        "The saved reading position was adjusted to the nearest available passage.",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(repository.writePosition).toHaveBeenCalledTimes(1),
    );
    expect(
      vi.mocked(repository.writePosition).mock.calls[0]?.[0].locator,
    ).toEqual(canonicalLocator);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Dismiss restoration notice",
      }),
    );
    expect(
      screen.queryByLabelText("Reading position recovery"),
    ).not.toBeInTheDocument();
  });

  it("shows a labelled busy state while validation is pending", async () => {
    let resolveOpen: ((result: LocalPublicationOpenResult) => void) | undefined;
    const flow = createTestFlow(
      () =>
        new Promise((resolve) => {
          resolveOpen = resolve;
        }),
    );
    render(<App openFlow={flow} />);

    selectEpub();

    expect(screen.getByRole("region", { name: "VoxLeaf" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Validating and opening the selected EPUB.",
    );
    expect(screen.getByLabelText("Open a book")).toBeEnabled();

    await act(async () => {
      resolveOpen?.({ status: "cancelled" });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "No local EPUB is open.",
    );
  });

  it.each<{
    expectedMessage: string;
    reason: LocalPublicationOpenFailureReason;
  }>([
    {
      reason: "file-too-large",
      expectedMessage: "That file is larger than the 100 MiB EPUB limit.",
    },
    {
      reason: "file-read-failed",
      expectedMessage: "VoxLeaf could not read that local file.",
    },
    {
      reason: "invalid-epub",
      expectedMessage: "That file is not a valid supported EPUB.",
    },
    {
      reason: "unsupported-epub",
      expectedMessage: "That EPUB uses features VoxLeaf does not support yet.",
    },
    {
      reason: "resource-exhausted",
      expectedMessage: "That EPUB exceeds VoxLeaf's safe processing limits.",
    },
    {
      reason: "internal-failure",
      expectedMessage:
        "VoxLeaf could not open that EPUB because of an internal failure.",
    },
  ])("renders the fixed $reason state", async ({ expectedMessage, reason }) => {
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "rejected", reason }),
    );
    render(<App openFlow={flow} />);

    selectEpub();

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(expectedMessage),
    );
    expect(document.body).not.toHaveTextContent("private.epub");
    expect(screen.getByLabelText("Open a book")).toBeEnabled();
  });

  it("provides a recoverable empty-content state", async () => {
    const publication = createTestPublication("Private empty title", [], {
      empty: true,
    });
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    render(<App openFlow={flow} />);

    selectEpub();

    expect(
      await screen.findByRole("heading", { name: "No readable content" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "This EPUB has no supported readable content.",
    );
    expect(document.body).not.toHaveTextContent("Private empty title");
    expect(screen.getByLabelText("Open a book")).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Close EPUB" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Settings" })).toBeNull();
  });

  it("flushes validated position state before replacement", async () => {
    const first = createTestPublication("First position book");
    const second = createTestPublication("Second position book");
    const open = vi
      .fn<LocalPublicationOpenFlow["open"]>()
      .mockResolvedValueOnce({ status: "ready", publication: first })
      .mockResolvedValueOnce({ status: "ready", publication: second });
    const flow = createTestFlow(open);
    const repository = createTestReaderPositionRepository();
    const writePosition = vi.mocked(repository.writePosition);
    const writePreferences = vi.mocked(repository.writePreferences);
    render(<App openFlow={flow} readerPositionRepository={repository} />);

    selectEpub("first.epub");
    await screen.findByRole("heading", { name: "First position book" });
    openSettings();
    fireEvent.change(screen.getByLabelText("Text size"), {
      target: { value: "large" },
    });
    await waitFor(() => expect(writePreferences).toHaveBeenCalledTimes(1));

    selectEpub("second.epub");
    expect(writePosition).toHaveBeenCalledTimes(1);
    expect(writePosition.mock.invocationCallOrder[0]).toBeLessThan(
      open.mock.invocationCallOrder[1]!,
    );
    expect(
      await screen.findByRole("heading", { name: "Second position book" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "The EPUB opened successfully.",
      ),
    );
  });

  it("B04 forwards unavailable placement without saving an old locator as a destination", async () => {
    const publication = createTestPublication("Unavailable chapter book");
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    const repository = createTestReaderPositionRepository();
    const narration = new ControlledNarrationCoordinator();
    let readerProps: ReadyPublicationContentProps | undefined;
    function ControlledReader(props: ReadyPublicationContentProps) {
      readerProps = props;
      useEffect(() => {
        props.onInitialRestorationSettled?.({
          status: "settled",
          locator: props.publication.locators[0]!.startLocator,
        });
      }, [props]);
      return <div>Controlled unavailable chapter</div>;
    }
    render(
      <App
        openFlow={flow}
        readerPositionRepository={repository}
        createNarrationCoordinator={() =>
          narration as unknown as ProductNarrationCoordinator
        }
        ReadyPublicationContent={ControlledReader}
      />,
    );
    selectEpub("synthetic-unavailable.epub");
    await screen.findByRole("heading", { name: "Unavailable chapter book" });
    const priorWrites = vi.mocked(repository.writePosition).mock.calls.length;
    act(() =>
      readerProps?.onNavigationSettlement?.(
        {
          status: "unavailable",
          reason: "chapter-too-large",
        },
        "chapter-navigation",
      ),
    );
    expect(narration.settleReaderPlacement).toHaveBeenLastCalledWith({
      status: "unavailable",
      reason: "chapter-too-large",
    });
    expect(repository.writePosition).toHaveBeenCalledTimes(priorWrites);
    act(() =>
      readerProps?.onNavigationSettlement?.(
        {
          status: "settled",
          locator: testLocatorAt(4),
        },
        "chapter-navigation",
      ),
    );
    expect(narration.settleReaderPlacement).toHaveBeenLastCalledWith({
      status: "settled",
      locator: testLocatorAt(4),
    });
    expect(repository.writePosition).toHaveBeenCalledTimes(priorWrites);
  });

  it("persists heard boundaries without letting active visual movement advance them", async () => {
    const publication = createTestPublication("Heard progress book");
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    const repository = createTestReaderPositionRepository();
    const writePosition = vi.mocked(repository.writePosition);
    const narration = new ControlledNarrationCoordinator();
    let readerProps: ReadyPublicationContentProps | undefined;

    function ControlledReader(props: ReadyPublicationContentProps) {
      readerProps = props;
      useEffect(() => {
        props.onInitialRestorationSettled?.({
          status: "settled",
          locator:
            props.initialLocator ?? props.publication.locators[0]!.startLocator,
        });
      }, [props]);
      return <div>Controlled heard-progress reader</div>;
    }

    render(
      <App
        openFlow={flow}
        readerPositionRepository={repository}
        createNarrationCoordinator={() =>
          narration as unknown as ProductNarrationCoordinator
        }
        ReadyPublicationContent={ControlledReader}
      />,
    );
    selectEpub("heard-progress.epub");
    await screen.findByRole("heading", { name: "Heard progress book" });
    await waitFor(() => expect(narration.audibleListenerCount).toBe(1));

    act(() => narration.start());
    act(() => narration.publishAudible("segment-started"));
    await waitFor(() => expect(writePosition).toHaveBeenCalledTimes(1));
    expect(writePosition.mock.calls[0]?.[0].locator.textOffsetCodePoints).toBe(
      10,
    );

    act(() => readerProps?.onActiveLocatorChange?.(testLocatorAt(80)));
    act(() => narration.publishAudible("progress"));
    await Promise.resolve();
    expect(writePosition).toHaveBeenCalledTimes(1);

    act(() => narration.publishAudible("segment-completed"));
    await waitFor(() => expect(writePosition).toHaveBeenCalledTimes(2));
    expect(writePosition.mock.calls[1]?.[0].locator.textOffsetCodePoints).toBe(
      20,
    );

    await act(async () => narration.stop());
    act(() =>
      readerProps?.onSettledLocatorChange?.(testLocatorAt(4), "reflow"),
    );
    expect(writePosition).toHaveBeenCalledTimes(2);
  });

  it("stops narration before resetting language and start preferences", async () => {
    const publication = createTestPublication("Reset settings book");
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    const narration = new ControlledNarrationCoordinator();
    const listeners = new Set<() => void>();
    const snapshot: HardwareCompatibilitySnapshotV1 = Object.freeze({
      status: "compatible",
      reason: undefined,
      profiles: Object.freeze([]),
      activeProfileId: undefined,
      selectionSource: undefined,
      preferenceStatus: "missing",
      fallbackAvailable: false,
      canPersistSelection: true,
      language: "es",
      languagePreferenceStatus: "ready",
      canPersistLanguage: true,
      languageReason: "no-profile-for-language",
    });
    const hardware = {
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      observe: () => snapshot,
      ensureChecked: vi.fn(async () => snapshot),
      check: vi.fn(async () => snapshot),
      resetLanguage: vi.fn(async () => {
        narration.configurationEvents.push("language-reset");
        return true;
      }),
      close: vi.fn(),
    } as unknown as HardwareProfileCompatibilityCoordinator;

    function SettledReader(props: ReadyPublicationContentProps) {
      useEffect(() => {
        props.onInitialRestorationSettled?.({
          status: "settled",
          locator: props.publication.locators[0]!.startLocator,
        });
      }, [props]);
      return <div>Settled reset reader</div>;
    }

    render(
      <App
        openFlow={flow}
        hardwareCompatibilityCoordinator={hardware}
        createNarrationCoordinator={() =>
          narration as unknown as ProductNarrationCoordinator
        }
        ReadyPublicationContent={SettledReader}
      />,
    );
    selectEpub("reset.epub");
    await screen.findByRole("heading", { name: "Reset settings book" });
    openSettings();
    fireEvent.click(
      screen.getByRole("button", { name: "Reset narration settings" }),
    );

    await waitFor(() =>
      expect(narration.configurationEvents).toEqual([
        "stop",
        "language-reset",
        "start-reset",
        "playback-reset",
        "refresh",
      ]),
    );
  });

  it("contains renderer failures, clears publication data, and starts cleanup", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const publication = createTestPublication("Private renderer title");
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    function ThrowingReader(): never {
      throw new Error("private renderer prose and path");
    }
    render(<App openFlow={flow} ReadyPublicationContent={ThrowingReader} />);

    selectEpub();

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "VoxLeaf could not display that EPUB.",
      ),
    );
    expect(flow.close).toHaveBeenCalled();
    expect(document.body).not.toHaveTextContent("Private renderer title");
    expect(document.body).not.toHaveTextContent("private renderer prose");
  });

  it("keeps the current ready state when the picker is cancelled", async () => {
    const publication = createTestPublication();
    const flow = createTestFlow(() =>
      Promise.resolve({ status: "ready", publication }),
    );
    render(<App openFlow={flow} />);
    selectEpub();
    await screen.findByRole("heading", { name: "Synthetic Reader Book" });

    fireEvent(
      screen.getByLabelText("Open a book"),
      new Event("cancel", { bubbles: true }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "The EPUB opened successfully.",
    );
    expect(flow.open).toHaveBeenCalledTimes(1);
  });

  it("drops prior metadata immediately and rejects obsolete completions", async () => {
    const pending: Array<(result: LocalPublicationOpenResult) => void> = [];
    const current = createTestPublication("Current publication");
    const flow = createTestFlow(
      vi
        .fn<LocalPublicationOpenFlow["open"]>()
        .mockResolvedValueOnce({
          status: "ready",
          publication: createTestPublication("Prior private publication"),
        })
        .mockImplementation(
          () =>
            new Promise((resolve) => {
              pending.push(resolve);
            }),
        ),
    );
    render(<App openFlow={flow} />);
    selectEpub("prior.epub");
    await screen.findByRole("heading", { name: "Prior private publication" });

    selectEpub("obsolete.epub");
    expect(
      screen.queryByText("Prior private publication"),
    ).not.toBeInTheDocument();
    selectEpub("current.epub");

    await act(async () => {
      pending[1]?.({ status: "ready", publication: current });
    });
    expect(
      screen.getByRole("heading", { name: "Current publication" }),
    ).toBeInTheDocument();

    await act(async () => {
      pending[0]?.({ status: "rejected", reason: "invalid-epub" });
    });
    expect(
      screen.getByRole("heading", { name: "Current publication" }),
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("Prior private publication");
  });

  it("cleans publication ownership when the application unmounts", async () => {
    const flow = createTestFlow(() => Promise.resolve({ status: "cancelled" }));
    const { unmount } = render(<App openFlow={flow} />);

    unmount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(flow.close).toHaveBeenCalledTimes(1);
  });
});
