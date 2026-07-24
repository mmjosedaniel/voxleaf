import {
  openEpubPublication,
  type ContentDocumentId,
  type OpenedPublication,
  type PublicationNavigationNode,
  type RasterImageMediaType,
  type SemanticDocumentTarget,
  type SensitivePublicationText,
  type SourceFragment,
} from "@voxleaf/epub";
import {
  createSchemaVersion,
  decodePersistedReadingStateV1,
  decodeReadingLocatorV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";

import {
  READER_POSITIONS_STORAGE_KEY,
  createWebStorageReaderPositionRepository,
} from "../persistence/reader-position-repository";
import { ReaderPositionRestoreCoordinator } from "../persistence/reader-position-restore-coordinator";
import { ReaderPositionSaveCoordinator } from "../persistence/reader-position-save-coordinator";
import {
  createLocalPublicationOpenFlow,
  type LocalPublicationOpenFlow,
} from "../publication/local-publication-open";
import { createPublicationSession } from "../publication/publication-session";
import {
  PublicationRasterImageLoader,
  type RasterImageSourcePreparer,
} from "../reader/publication-raster-image-loader";
import {
  CHAPTER_TOO_LARGE_MESSAGE,
  ReaderNavigationCoordinator,
} from "../reader/reader-navigation";
import { ReaderPublicationContent } from "../reader/ReaderPublication";
import { SemanticRasterImageElement } from "../reader/SemanticRasterImage";
import type {
  RasterImageSource,
  RasterImageSourceResult,
} from "../reader/raster-image-source";

interface ReaderFixtureModule {
  readonly READER_SEMANTIC_BLOCK_OVER_LIMIT: number;
  buildReaderLongChapterEpubFixture(options: {
    readonly semanticBlockCount: number;
  }): Promise<Uint8Array>;
  buildReaderNavigationEpubFixture(): Promise<Uint8Array>;
  buildReaderRasterEpubFixture(options?: {
    readonly imageCase?:
      "missing-reference" | "signature-mismatch" | "valid-png";
  }): Promise<Uint8Array>;
  buildReaderReflowEpubFixture(options?: {
    readonly paragraphCount?: number;
    readonly preservedPassageIndex?: number;
  }): Promise<Uint8Array>;
  buildReaderRestorationEpubFixture(): Promise<Uint8Array>;
}

interface ReadyDesktopPublication {
  readonly flow: LocalPublicationOpenFlow;
  readonly publication: OpenedPublication;
}

interface Deferred<Value> {
  readonly promise: Promise<Value>;
  resolve(value: Value): void;
}

let readerFixtureModule: Promise<ReaderFixtureModule> | undefined;
let consoleSpies: MockInstance[] = [];

beforeEach(() => {
  consoleSpies = [
    vi.spyOn(console, "error").mockImplementation(() => undefined),
    vi.spyOn(console, "info").mockImplementation(() => undefined),
    vi.spyOn(console, "log").mockImplementation(() => undefined),
    vi.spyOn(console, "warn").mockImplementation(() => undefined),
  ];
});

afterEach(() => {
  for (const consoleSpy of consoleSpies) {
    expect(consoleSpy).not.toHaveBeenCalled();
  }
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

async function readerFixtures(): Promise<ReaderFixtureModule> {
  readerFixtureModule ??= vi.importActual<ReaderFixtureModule>(
    "../../../../packages/epub/test-support/epub-fixture.ts",
  );
  return readerFixtureModule;
}

function epubFile(bytes: Uint8Array, name = "synthetic-reader.epub"): File {
  return new File([Uint8Array.from(bytes).buffer], name, {
    type: "application/epub+zip",
  });
}

async function openThroughDesktop(
  bytes: Uint8Array,
  name?: string,
): Promise<ReadyDesktopPublication> {
  const flow = createLocalPublicationOpenFlow();
  const result = await flow.open(epubFile(bytes, name));
  if (result.status !== "ready") {
    throw new Error(`reader-matrix-open-${result.status}`);
  }
  return Object.freeze({ flow, publication: result.publication });
}

function deferred<Value>(): Deferred<Value> {
  let settle: ((value: Value) => void) | undefined;
  const promise = new Promise<Value>((resolve) => {
    settle = resolve;
  });
  return {
    promise,
    resolve: (value) => {
      if (settle === undefined) {
        throw new Error("reader-matrix-deferred-settled");
      }
      const resolve = settle;
      settle = undefined;
      resolve(value);
    },
  };
}

function navigationTarget(
  nodes: readonly PublicationNavigationNode[],
  label: string,
): SemanticDocumentTarget {
  for (const node of nodes) {
    if (node.kind === "link" && String(node.label) === label) {
      return node.target;
    }
    const nested = navigationTargetOrUndefined(node.children, label);
    if (nested !== undefined) {
      return nested;
    }
  }
  throw new Error("reader-matrix-navigation-target-missing");
}

function navigationTargetOrUndefined(
  nodes: readonly PublicationNavigationNode[],
  label: string,
): SemanticDocumentTarget | undefined {
  for (const node of nodes) {
    if (node.kind === "link" && String(node.label) === label) {
      return node.target;
    }
    const nested = navigationTargetOrUndefined(node.children, label);
    if (nested !== undefined) {
      return nested;
    }
  }
  return undefined;
}

function persistedState(locator: ReadingLocatorV1) {
  return decodePersistedReadingStateV1({
    schemaVersion: createSchemaVersion(1),
    bookIdentity: locator.bookIdentity,
    locator,
    preferences: {},
  });
}

function expectContentFreeReaderState(serialized: string): void {
  for (const forbidden of [
    "Synthetic comprehensive publication",
    "First Synthetic Author",
    "Synthetic dialogue",
    "private-reader.epub",
    ".xhtml",
    "http:",
    "https:",
    "blob:",
    "filename",
    "path",
    "prose",
    "title",
    "url",
  ]) {
    expect(serialized).not.toContain(forbidden);
  }
}

function immediateVisibility(
  _element: HTMLElement,
  onVisible: () => void,
): () => void {
  queueMicrotask(onVisible);
  return () => undefined;
}

describe("package-to-reader integration matrix", () => {
  it("opens, renders, navigates, saves, closes, reopens, and restores exact same-byte state", async () => {
    const fixtures = await readerFixtures();
    const bytes = await fixtures.buildReaderNavigationEpubFixture();
    const repository = createWebStorageReaderPositionRepository();
    const first = await openThroughDesktop(bytes, "private-reader.epub");
    const settledLocators: ReadingLocatorV1[] = [];
    const firstView = render(
      <ReaderPublicationContent
        publication={first.publication}
        onSettledLocatorChange={(locator) => settledLocators.push(locator)}
      />,
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Opening" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Current reading section" }),
    ).toHaveAttribute("lang", "en");
    expect(screen.getByRole("button", { name: "Continuation" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Continuation" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Continuation",
      }),
    ).toBeInTheDocument();
    expect(document.querySelector("blockquote")).not.toBeNull();
    expect(document.querySelector("ol")).not.toBeNull();
    expect(document.querySelector("code")).not.toBeNull();
    await waitFor(() => expect(settledLocators).toHaveLength(1));

    const continuation = settledLocators[0]!;
    expect(continuation.spineItemId).toBe("spine:1");
    expect(continuation.spineItemIndex).toBe(1);
    expect(continuation.anchor.value).toBe("continuation");

    const saveCoordinator = new ReaderPositionSaveCoordinator(
      first.publication,
      repository,
    );
    saveCoordinator.start();
    expect(saveCoordinator.scheduleImmediate(continuation)).toBe(true);
    await saveCoordinator.flush();

    const serialized = window.localStorage.getItem(
      READER_POSITIONS_STORAGE_KEY,
    );
    expect(serialized).not.toBeNull();
    expectContentFreeReaderState(serialized!);

    firstView.unmount();
    await saveCoordinator.close();
    await expect(first.flow.close()).resolves.toEqual({ status: "closed" });
    expect(first.publication.closed).toBe(true);

    const second = await openThroughDesktop(bytes);
    const restoreCoordinator = new ReaderPositionRestoreCoordinator(repository);
    const restored = await restoreCoordinator.restore(second.publication);
    expect(restored).toEqual({
      status: "ready",
      preferences: expect.any(Object),
      preferenceStatus: "missing",
      position: {
        mode: "exact",
        reason: "exact",
        locator: continuation,
      },
    });
    if (restored.status !== "ready") {
      throw new Error("reader-matrix-exact-restore-cancelled");
    }

    const restoredView = render(
      <ReaderPublicationContent
        publication={second.publication}
        initialLocator={restored.position.locator}
      />,
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Continuation",
      }),
    ).toBeInTheDocument();

    restoredView.unmount();
    restoreCoordinator.close();
    await expect(second.flow.close()).resolves.toEqual({ status: "closed" });
  });

  it("recovers a nearest valid locator and isolates malformed, future, and different-byte state", async () => {
    const fixtures = await readerFixtures();
    const bytes = await fixtures.buildReaderRestorationEpubFixture();
    const opened = await openThroughDesktop(bytes);
    const repository = createWebStorageReaderPositionRepository();
    const passage = opened.publication.locators.find(
      (locatedBlock) =>
        locatedBlock.startLocator.anchor.value === "reader-reflow-passage",
    );
    expect(passage).toBeDefined();

    const beyondEnd = decodeReadingLocatorV1({
      ...passage!.startLocator,
      textOffsetCodePoints: passage!.textLengthCodePoints + 17,
    });
    await expect(
      repository.writePosition(persistedState(beyondEnd)),
    ).resolves.toEqual({ status: "saved" });

    const recoveryCoordinator = new ReaderPositionRestoreCoordinator(
      repository,
    );
    const recovered = await recoveryCoordinator.restore(opened.publication);
    expect(recovered).toEqual({
      status: "ready",
      preferences: expect.any(Object),
      preferenceStatus: "missing",
      position: {
        mode: "recovered",
        reason: "nearest-offset",
        locator: {
          ...passage!.startLocator,
          textOffsetCodePoints: passage!.textLengthCodePoints,
        },
      },
    });
    recoveryCoordinator.close();

    const differentBytes = await fixtures.buildReaderReflowEpubFixture({
      paragraphCount: 35,
    });
    const different = await openThroughDesktop(differentBytes);
    expect(different.publication.book.identity).not.toEqual(
      opened.publication.book.identity,
    );
    const differentCoordinator = new ReaderPositionRestoreCoordinator(
      repository,
    );
    const differentResult = await differentCoordinator.restore(
      different.publication,
    );
    expect(differentResult).toMatchObject({
      status: "ready",
      position: { mode: "book-start", reason: "missing" },
    });
    differentCoordinator.close();

    window.localStorage.setItem(READER_POSITIONS_STORAGE_KEY, "{");
    const malformedCoordinator = new ReaderPositionRestoreCoordinator(
      createWebStorageReaderPositionRepository(),
    );
    const malformed = await malformedCoordinator.restore(opened.publication);
    expect(malformed).toMatchObject({
      status: "ready",
      position: { mode: "book-start", reason: "malformed" },
    });
    expect(JSON.stringify(malformed)).not.toContain(
      "Preserved synthetic passage",
    );
    malformedCoordinator.close();

    const futureEnvelope = JSON.stringify({
      schemaVersion: 2,
      states: [],
    });
    window.localStorage.setItem(READER_POSITIONS_STORAGE_KEY, futureEnvelope);
    const futureCoordinator = new ReaderPositionRestoreCoordinator(
      createWebStorageReaderPositionRepository(),
    );
    const future = await futureCoordinator.restore(opened.publication);
    expect(future).toMatchObject({
      status: "ready",
      position: { mode: "book-start", reason: "unsupported-version" },
    });
    expect(window.localStorage.getItem(READER_POSITIONS_STORAGE_KEY)).toBe(
      futureEnvelope,
    );
    futureCoordinator.close();

    await expect(different.flow.close()).resolves.toEqual({
      status: "closed",
    });
    await expect(opened.flow.close()).resolves.toEqual({ status: "closed" });
  });

  it("routes recovered and unavailable targets and rejects an over-limit chapter before rendering", async () => {
    const fixtures = await readerFixtures();
    const navigationBytes = await fixtures.buildReaderNavigationEpubFixture();
    const navigation = await openThroughDesktop(navigationBytes);
    const coordinator = new ReaderNavigationCoordinator(navigation.publication);
    const continuation = navigationTarget(
      navigation.publication.navigation,
      "Continuation",
    );
    const recoveredTarget = Object.freeze({
      documentId: continuation.documentId,
      fragment: "missing-reader-target" as SourceFragment,
    });

    coordinator.navigateToTarget(recoveredTarget);
    expect(coordinator.state.activeLocator.spineItemId).toBe("spine:1");
    expect(coordinator.state.activeLocator.anchor.value).toBe("continuation");
    expect(coordinator.state.message).toBe(
      "The requested location was unavailable. Moved to the start of its reading section.",
    );

    const priorLocator = coordinator.state.activeLocator;
    const unavailableTarget = Object.freeze({
      documentId: "document:missing" as ContentDocumentId,
    });
    expect(coordinator.targetAvailability(unavailableTarget)).toEqual({
      status: "unavailable",
      explanation: "This destination is unavailable.",
    });
    coordinator.navigateToTarget(unavailableTarget);
    expect(coordinator.state.activeLocator).toBe(priorLocator);
    expect(coordinator.state.message).toBe("This destination is unavailable.");
    await expect(navigation.flow.close()).resolves.toEqual({
      status: "closed",
    });

    const overLimitBytes = await fixtures.buildReaderLongChapterEpubFixture({
      semanticBlockCount: fixtures.READER_SEMANTIC_BLOCK_OVER_LIMIT,
    });
    const overLimit = await openThroughDesktop(overLimitBytes);
    const overLimitCoordinator = new ReaderNavigationCoordinator(
      overLimit.publication,
    );
    expect(overLimitCoordinator.state).toMatchObject({
      contentStatus: "chapter-too-large",
      message: CHAPTER_TOO_LARGE_MESSAGE,
    });
    await expect(overLimit.flow.close()).resolves.toEqual({
      status: "closed",
    });
  });

  it("loads a valid package raster and contains signature and reference failures", async () => {
    const fixtures = await readerFixtures();
    const validBytes = await fixtures.buildReaderRasterEpubFixture({
      imageCase: "valid-png",
    });
    const valid = await openThroughDesktop(validBytes);
    const resource = valid.publication.resources[0];
    expect(resource).toBeDefined();

    let released = false;
    const source: RasterImageSource = Object.freeze({
      objectUrl: "blob:reader-matrix",
      widthPixels: 1,
      heightPixels: 1,
      decodedPixels: 1,
      get released() {
        return released;
      },
      release: vi.fn(() => {
        released = true;
      }),
    });
    let preparedBytes: Uint8Array | undefined;
    let preparedMediaType: RasterImageMediaType | undefined;
    const preparer: RasterImageSourcePreparer = {
      prepare: vi.fn(
        async (
          bytes: Uint8Array,
          mediaType: RasterImageMediaType,
        ): Promise<RasterImageSourceResult> => {
          preparedBytes = bytes.slice();
          preparedMediaType = mediaType;
          return Object.freeze({ status: "ready", source });
        },
      ),
      close: vi.fn(() => Promise.resolve()),
    };
    const loader = new PublicationRasterImageLoader(
      valid.publication,
      preparer,
    );
    const validImage = render(
      <SemanticRasterImageElement
        resourceId={resource!.id}
        alternativeText={"Synthetic reader image" as SensitivePublicationText}
        loader={loader}
        observeVisibility={immediateVisibility}
      />,
    );

    expect(
      await screen.findByRole("img", { name: "Synthetic reader image" }),
    ).toHaveAttribute("src", "blob:reader-matrix");
    expect(preparedBytes?.slice(0, 8)).toEqual(
      Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10),
    );
    expect(preparedMediaType).toBe("image/png");
    validImage.unmount();
    expect(source.release).toHaveBeenCalledTimes(1);
    await loader.close();
    await expect(valid.flow.close()).resolves.toEqual({ status: "closed" });

    const mismatchBytes = await fixtures.buildReaderRasterEpubFixture({
      imageCase: "signature-mismatch",
    });
    const mismatch = await openThroughDesktop(mismatchBytes);
    const mismatchResource = mismatch.publication.resources[0];
    expect(mismatchResource).toBeDefined();
    const mismatchPreparer: RasterImageSourcePreparer = {
      prepare: vi.fn(),
      close: vi.fn(() => Promise.resolve()),
    };
    const mismatchLoader = new PublicationRasterImageLoader(
      mismatch.publication,
      mismatchPreparer,
    );
    const mismatchImage = render(
      <SemanticRasterImageElement
        resourceId={mismatchResource!.id}
        alternativeText={"Synthetic reader image" as SensitivePublicationText}
        loader={mismatchLoader}
        observeVisibility={immediateVisibility}
      />,
    );
    expect(
      await screen.findByRole("img", {
        name: "Synthetic reader image. Image unavailable.",
      }),
    ).toBeInTheDocument();
    expect(mismatchPreparer.prepare).not.toHaveBeenCalled();
    mismatchImage.unmount();
    await mismatchLoader.close();
    await expect(mismatch.flow.close()).resolves.toEqual({
      status: "closed",
    });

    const missingBytes = await fixtures.buildReaderRasterEpubFixture({
      imageCase: "missing-reference",
    });
    const missingFlow = createLocalPublicationOpenFlow();
    const missingResult = await missingFlow.open(epubFile(missingBytes));
    expect(missingResult).toEqual({
      status: "rejected",
      reason: "invalid-epub",
    });
    expect(missingFlow.publication).toBeUndefined();
    expect(JSON.stringify(missingResult)).not.toContain(
      "Synthetic reader image",
    );
    await expect(missingFlow.close()).resolves.toEqual({ status: "closed" });
  });

  it("closes a real stale package success without replacing the current publication", async () => {
    const fixtures = await readerFixtures();
    const firstBytes = await fixtures.buildReaderNavigationEpubFixture();
    const secondBytes = await fixtures.buildReaderRasterEpubFixture();
    const firstOpened = deferred<void>();
    const releaseFirst = deferred<void>();
    let invocation = 0;
    let stalePublication: OpenedPublication | undefined;

    const session = createPublicationSession({
      openPublication: async (bytes) => {
        invocation += 1;
        const result = await openEpubPublication(bytes);
        if (invocation === 1 && result.ok) {
          stalePublication = result.publication;
          firstOpened.resolve();
          await releaseFirst.promise;
        }
        return result;
      },
    });

    const staleOpen = session.open(firstBytes);
    await firstOpened.promise;
    const currentOpen = session.open(secondBytes);
    const current = await currentOpen;
    expect(current.status).toBe("ready");
    expect(session.publication?.book.metadata.title).toBe(
      "Synthetic reader raster",
    );

    releaseFirst.resolve();
    await expect(staleOpen).resolves.toEqual({ status: "cancelled" });
    expect(stalePublication?.closed).toBe(true);
    expect(session.publication).toBe(
      current.status === "ready" ? current.publication : undefined,
    );
    expect(session.publication?.closed).toBe(false);

    await expect(session.close()).resolves.toEqual({ status: "closed" });
    expect(current.status === "ready" && current.publication.closed).toBe(true);
  });
});
