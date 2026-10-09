import {
  createIndex,
  decodeBookV1,
  decodeReadingLocatorV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import { describe, expect, it } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  ArchiveInventory,
  OpenedEpubArchive,
} from "../archive/archive-inventory.js";
import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  SensitivePublicationText,
} from "../document/document-model.js";
import type { ParsedPackageDocument } from "../package/package-document.js";
import { parseArchiveEntryPath } from "../paths/archive-path.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import { createOpenedPublication } from "../resource/opened-publication.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import {
  NARRATION_PREPARATION_LIMIT_NAMES,
  NARRATION_PREPARATION_PROFILE_V1,
  type NarrationPreparationLimitName,
} from "../../test-support/narration-preparation-limits.js";
import type {
  NarrationPreparationResourceObserver,
  NarrationPreparationResourceSnapshot,
} from "./narration-preparation.js";
import {
  NARRATION_V1_BATCH_POLICY,
  NARRATION_V1_SEGMENT_POLICY,
  NARRATION_V1_SOURCE_WINDOW_POLICY,
} from "./narration-policy.js";
import {
  NarrationWorkController,
  type NarrationYieldScheduler,
} from "./narration-work-controller.js";

const DOCUMENT_ID = "document:narration-resource-bounds" as ContentDocumentId;
const RESOURCE_SNAPSHOT_KEYS = Object.freeze([
  "activeRequestCount",
  "retainedNarrationCodePoints",
  "retainedNarrationUtf8Bytes",
  "retainedPreparedSegmentCount",
  "retainedResultCount",
  "retainedSourceEventCount",
  "retainedSourceTokenCount",
] satisfies readonly (keyof NarrationPreparationResourceSnapshot)[]);

const PRODUCTION_HARD_LIMITS = Object.freeze({
  sourceCodePointsInspectedPerRequest:
    NARRATION_V1_SOURCE_WINDOW_POLICY.sourceCodePointsInspectedHardMaximum,
  segmentsPerBatch: NARRATION_V1_BATCH_POLICY.segmentsHardMaximum,
  sourceCodePointsPerSegment:
    NARRATION_V1_SEGMENT_POLICY.sourceCodePointsHardMaximum,
  narrationCodePointsPerSegment:
    NARRATION_V1_SEGMENT_POLICY.narrationCodePointsHardMaximum,
  narrationUtf8BytesPerSegment:
    NARRATION_V1_SEGMENT_POLICY.narrationUtf8BytesHardMaximum,
  sentencesPerSegment: NARRATION_V1_SEGMENT_POLICY.sentencesHardMaximum,
  narrationCodePointsPerBatch:
    NARRATION_V1_BATCH_POLICY.narrationCodePointsHardMaximum,
  narrationUtf8BytesPerBatch:
    NARRATION_V1_BATCH_POLICY.narrationUtf8BytesHardMaximum,
  sentencesPerBatch: NARRATION_V1_BATCH_POLICY.sentencesHardMaximum,
  protectedTokenCodePoints:
    NARRATION_V1_SOURCE_WINDOW_POLICY.protectedTokenCodePointsHardMaximum,
  parserLookaheadCodePoints:
    NARRATION_V1_SOURCE_WINDOW_POLICY.parserLookaheadCodePointsHardMaximum,
  traversalDepth: NARRATION_V1_SOURCE_WINDOW_POLICY.traversalDepthHardMaximum,
  normalizationExpansionCodePointsPerSourceCodePoint:
    NARRATION_V1_SOURCE_WINDOW_POLICY.normalizationExpansionCodePointsHardMaximum,
  workUnitsBetweenCheckpoints:
    NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenCheckpointsHardMaximum,
  workUnitsBetweenYields:
    NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenYieldsHardMaximum,
  retainedSegments:
    NARRATION_V1_SEGMENT_POLICY.retainedSegmentEntriesHardMaximum,
  retainedSourceCodePoints:
    NARRATION_V1_SOURCE_WINDOW_POLICY.sourceCodePointsInspectedHardMaximum,
  retainedNarrationCodePoints:
    NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum,
  retainedNarrationUtf8Bytes:
    NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum,
  retainedTokens:
    NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum,
} satisfies Readonly<Record<NarrationPreparationLimitName, number>>);

describe("deterministic narration performance and resource bounds", () => {
  it("keeps every production hard ceiling aligned with the accepted profile", () => {
    expect(Object.keys(PRODUCTION_HARD_LIMITS).sort()).toEqual(
      [...NARRATION_PREPARATION_LIMIT_NAMES].sort(),
    );
    for (const name of NARRATION_PREPARATION_LIMIT_NAMES) {
      expect(PRODUCTION_HARD_LIMITS[name]).toBe(
        NARRATION_PREPARATION_PROFILE_V1.limits[name].hardMaximum,
      );
    }
  });

  it("records exact deterministic checkpoint and yield cadence without reading time", async () => {
    const signal = new AbortController().signal;
    const yieldedAt: number[] = [];
    const scheduler: NarrationYieldScheduler = () => {
      yieldedAt.push(work.workUnitCount);
      return Promise.resolve();
    };
    const work = new NarrationWorkController(signal, scheduler);
    const observations =
      NARRATION_PREPARATION_PROFILE_V1.limits.workUnitsBetweenYields
        .hardMaximum;

    for (let index = 0; index < observations; index += 1) {
      await work.observe();
    }

    expect(work.workUnitCount).toBe(observations);
    expect(work.checkpointCount).toBe(
      observations /
        NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenCheckpointsTarget,
    );
    expect(work.yieldCount).toBe(
      observations /
        NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenYieldsTarget,
    );
    expect(yieldedAt).toEqual([
      NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenYieldsTarget,
      observations,
    ]);

    work.beforePublication();
    expect(work.checkpointCount).toBe(
      observations /
        NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenCheckpointsTarget +
        1,
    );
  });

  it("admits exact batch and one-lookahead code-point and UTF-8-byte maxima", async () => {
    const codePointHighWater = createResourceHighWater();
    const codePointFixture = createNarrationPublication(
      [...Array.from({ length: 16 }, () => "x".repeat(512)), "x".repeat(640)],
      {
        resourceObserver: codePointHighWater.observer,
      },
    );
    const byteHighWater = createResourceHighWater();
    const multibyteUnit = "\u{1f642}";
    const byteFixture = createNarrationPublication(
      Array.from({ length: 13 }, () => multibyteUnit.repeat(512)),
      {
        resourceObserver: byteHighWater.observer,
      },
    );

    try {
      const exactCodePoints =
        await codePointFixture.publication.prepareNarration(
          request(codePointFixture.start, 16),
        );
      expect(exactCodePoints.status).toBe("batch");
      if (exactCodePoints.status !== "batch") {
        throw new Error("expected exact code-point batch");
      }
      expect(exactCodePoints.measurements).toMatchObject({
        segmentCount: 16,
        narrationCodePoints:
          NARRATION_V1_BATCH_POLICY.narrationCodePointsHardMaximum,
      });
      expect(codePointHighWater.values()).toMatchObject({
        activeRequestCount: 1,
        retainedResultCount: 1,
        retainedPreparedSegmentCount:
          NARRATION_V1_SEGMENT_POLICY.retainedSegmentEntriesHardMaximum,
        retainedNarrationCodePoints:
          NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum,
      });

      const exactBytes = await byteFixture.publication.prepareNarration(
        request(byteFixture.start, 16),
      );
      expect(exactBytes.status).toBe("batch");
      if (exactBytes.status !== "batch") {
        throw new Error("expected exact UTF-8-byte batch");
      }
      expect(exactBytes.segments).toHaveLength(12);
      expect(exactBytes.measurements.narrationUtf8Bytes).toBe(
        NARRATION_V1_BATCH_POLICY.narrationUtf8BytesHardMaximum,
      );
      expect(byteHighWater.values()).toMatchObject({
        activeRequestCount: 1,
        retainedResultCount: 1,
        retainedNarrationUtf8Bytes:
          NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum,
      });

      assertContentFreeMeasurements(exactCodePoints.measurements);
      assertContentFreeMeasurements(exactBytes.measurements);
    } finally {
      await Promise.all([
        codePointFixture.publication.close(),
        byteFixture.publication.close(),
      ]);
    }
  });

  it("streams a large admitted semantic document through repeated bounded batches", async () => {
    const highWater = createResourceHighWater();
    const paragraphCount = 96;
    const codePointsPerParagraph = 400;
    const fixture = createNarrationPublication(
      Array.from({ length: paragraphCount }, () =>
        "z".repeat(codePointsPerParagraph),
      ),
      {
        resourceObserver: highWater.observer,
      },
    );
    let continuation = fixture.start;
    let requestCount = 0;
    let observedSegments = 0;
    let observedNarrationCodePoints = 0;

    try {
      while (true) {
        requestCount += 1;
        if (requestCount > paragraphCount) {
          throw new Error("bounded narration did not reach completion");
        }
        const result = await fixture.publication.prepareNarration(
          request(continuation, 8),
        );
        if (result.status !== "batch" && result.status !== "complete") {
          throw new Error("expected successful bounded narration result");
        }
        expect(result.segments.length).toBeLessThanOrEqual(8);
        expect(
          result.measurements.sourceCodePointsInspected,
        ).toBeLessThanOrEqual(
          NARRATION_V1_SOURCE_WINDOW_POLICY.sourceCodePointsInspectedHardMaximum,
        );
        assertContentFreeMeasurements(result.measurements);
        observedSegments += result.segments.length;
        observedNarrationCodePoints += result.measurements.narrationCodePoints;
        if (result.status === "complete") {
          break;
        }
        continuation = result.continuation;
      }

      expect(requestCount).toBe(12);
      expect(observedSegments).toBe(paragraphCount);
      expect(observedNarrationCodePoints).toBe(
        paragraphCount * codePointsPerParagraph,
      );
      expect(highWater.values()).toMatchObject({
        activeRequestCount: 1,
        retainedResultCount: 1,
      });
      expect(
        highWater.values().retainedPreparedSegmentCount,
      ).toBeLessThanOrEqual(
        NARRATION_V1_SEGMENT_POLICY.retainedSegmentEntriesHardMaximum,
      );
      expect(highWater.values().retainedSourceTokenCount).toBeLessThanOrEqual(
        NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum,
      );
      expect(
        highWater.values().retainedNarrationCodePoints,
      ).toBeLessThanOrEqual(
        NARRATION_V1_SEGMENT_POLICY.retainedNarrationCodePointsHardMaximum,
      );
      expect(highWater.values().retainedNarrationUtf8Bytes).toBeLessThanOrEqual(
        NARRATION_V1_SEGMENT_POLICY.retainedNarrationUtf8BytesHardMaximum,
      );
    } finally {
      await fixture.publication.close();
    }
  });

  it("cancels caller and close work before any stale result is retained", async () => {
    const callerDeferred = createDeferredYieldScheduler();
    const callerHighWater = createResourceHighWater();
    const callerFixture = createNarrationPublication(["q".repeat(5_000)], {
      resourceObserver: callerHighWater.observer,
      scheduler: callerDeferred.scheduler,
    });
    const callerController = new AbortController();
    const callerActive = callerFixture.publication.prepareNarration({
      ...request(callerFixture.start, 1),
      signal: callerController.signal,
    });
    await callerDeferred.started;
    callerController.abort("synthetic-sensitive-cancellation-canary");
    callerDeferred.release();
    const callerResult = await callerActive;
    expect(callerResult.status).toBe("cancelled");
    expect(callerHighWater.values().retainedResultCount).toBe(0);

    const retry = await callerFixture.publication.prepareNarration(
      request(callerFixture.start, 1),
    );
    expect(retry.status).toBe("batch");
    await callerFixture.publication.close();

    const closeDeferred = createDeferredYieldScheduler();
    const closeHighWater = createResourceHighWater();
    const closeFixture = createNarrationPublication(["w".repeat(5_000)], {
      resourceObserver: closeHighWater.observer,
      scheduler: closeDeferred.scheduler,
    });
    const closeActive = closeFixture.publication.prepareNarration(
      request(closeFixture.start, 1),
    );
    await closeDeferred.started;
    const close = closeFixture.publication.close();
    expect(closeFixture.publication.closed).toBe(true);
    closeDeferred.release();
    await expect(closeActive).resolves.toMatchObject({ status: "cancelled" });
    await close;
    expect(closeHighWater.values().retainedResultCount).toBe(0);
    expect(closeFixture.archive.closeCount).toBe(1);
  });
});

interface NarrationPublicationOptions {
  readonly resourceObserver?: NarrationPreparationResourceObserver;
  readonly scheduler?: NarrationYieldScheduler;
}

function createNarrationPublication(
  texts: readonly string[],
  options: NarrationPublicationOptions = {},
): Readonly<{
  archive: SyntheticArchive;
  publication: OpenedPublication;
  start: ReadingLocatorV1;
}> {
  const book = decodeBookV1({
    schemaVersion: 1,
    identity: {
      scheme: "synthetic-test",
      schemeVersion: 1,
      value: "narration-resource-bounds",
    },
    metadata: { title: "Synthetic resource bounds", authors: [] },
    resources: [
      {
        path: "EPUB/chapter.xhtml",
        mediaType: "application/xhtml+xml",
        role: "content-document",
      },
    ],
    spine: [
      {
        id: "spine:resource-bounds",
        index: 0,
        resourcePath: "EPUB/chapter.xhtml",
      },
    ],
    navigation: [],
  });
  const spine = book.spine[0];
  if (spine === undefined || texts.length === 0) {
    throw new Error("synthetic narration resource fixture requires content");
  }
  const blocks = Object.freeze(
    texts.map((value, index) => {
      const block = Object.freeze({
        kind: "paragraph" as const,
        children: Object.freeze([
          Object.freeze({
            kind: "text" as const,
            text: value as SensitivePublicationText,
          }),
        ]),
      });
      return Object.freeze({
        documentId: DOCUMENT_ID,
        block,
        startLocator: decodeReadingLocatorV1({
          schemaVersion: 1,
          bookIdentity: book.identity,
          spineItemId: spine.id,
          spineItemIndex: spine.index,
          anchor: {
            kind: "element-id",
            formatVersion: 1,
            value: `voxleaf-s0-a${String(index)}`,
            anchorIndex: index,
          },
          textOffsetCodePoints: 0,
        }),
        textLengthCodePoints: createIndex(Array.from(value).length),
      } satisfies PublicationLocatedBlock);
    }),
  );
  const locatorIndex = Object.freeze({
    bookIdentity: book.identity,
    spines: Object.freeze([
      Object.freeze({
        spineItemId: spine.id,
        spineItemIndex: spine.index,
        blocks,
      }),
    ]),
    blocks,
  });
  const archive = new SyntheticArchive();
  const publication = createOpenedPublication(
    archive,
    syntheticPackageDocument(),
    Object.freeze({
      book,
      documents: Object.freeze([]),
      navigation: Object.freeze([]),
      locatorIndex,
      targetIndex: Object.freeze({ findDocument: () => undefined }),
      ...(options.resourceObserver === undefined
        ? {}
        : { narrationResourceObserver: options.resourceObserver }),
      narrationYieldScheduler: options.scheduler ?? (async () => undefined),
    }),
  );
  const start = blocks[0]?.startLocator;
  if (start === undefined) {
    throw new Error("synthetic narration resource fixture requires a start");
  }
  return Object.freeze({ archive, publication, start });
}

function request(
  startLocator: ReadingLocatorV1,
  maximumSegments: number,
): Readonly<{
  startLocator: ReadingLocatorV1;
  profile: "narration-v1";
  defaultLanguage: "und";
  maximumSegments: number;
}> {
  return Object.freeze({
    startLocator,
    profile: "narration-v1",
    defaultLanguage: "und",
    maximumSegments,
  });
}

function createResourceHighWater(): Readonly<{
  observer: NarrationPreparationResourceObserver;
  values(): NarrationPreparationResourceSnapshot;
}> {
  const highWater: Record<keyof NarrationPreparationResourceSnapshot, number> =
    {
      activeRequestCount: 0,
      retainedResultCount: 0,
      retainedSourceEventCount: 0,
      retainedSourceTokenCount: 0,
      retainedPreparedSegmentCount: 0,
      retainedNarrationCodePoints: 0,
      retainedNarrationUtf8Bytes: 0,
    };
  const observer: NarrationPreparationResourceObserver = (snapshot) => {
    expect(Object.keys(snapshot).sort()).toEqual(
      [...RESOURCE_SNAPSHOT_KEYS].sort(),
    );
    expect(Object.isFrozen(snapshot)).toBe(true);
    for (const key of RESOURCE_SNAPSHOT_KEYS) {
      expect(typeof snapshot[key]).toBe("number");
      highWater[key] = Math.max(highWater[key], snapshot[key]);
    }
  };
  return Object.freeze({
    observer,
    values: () =>
      Object.freeze({
        activeRequestCount: createIndex(highWater.activeRequestCount),
        retainedResultCount: createIndex(highWater.retainedResultCount),
        retainedSourceEventCount: createIndex(
          highWater.retainedSourceEventCount,
        ),
        retainedSourceTokenCount: createIndex(
          highWater.retainedSourceTokenCount,
        ),
        retainedPreparedSegmentCount: createIndex(
          highWater.retainedPreparedSegmentCount,
        ),
        retainedNarrationCodePoints: createIndex(
          highWater.retainedNarrationCodePoints,
        ),
        retainedNarrationUtf8Bytes: createIndex(
          highWater.retainedNarrationUtf8Bytes,
        ),
      }),
  });
}

function assertContentFreeMeasurements(measurements: object): void {
  const serialized = JSON.stringify(measurements);
  expect(serialized).not.toContain("text");
  expect(serialized).not.toContain("sourceRange");
  expect(serialized).not.toContain("synthetic-sensitive");
  for (const value of Object.values(
    measurements as Readonly<Record<string, unknown>>,
  )) {
    expect(typeof value).toBe("number");
    expect(Number.isSafeInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
  }
}

function createDeferredYieldScheduler(): Readonly<{
  scheduler: NarrationYieldScheduler;
  started: Promise<void>;
  release(): void;
}> {
  let markStarted: (() => void) | undefined;
  let releaseYield: (() => void) | undefined;
  let released = false;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const scheduler: NarrationYieldScheduler = () => {
    if (released) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      releaseYield = resolve;
      markStarted?.();
    });
  };
  return Object.freeze({
    scheduler,
    started,
    release: () => {
      released = true;
      releaseYield?.();
    },
  });
}

class SyntheticArchive implements OpenedEpubArchive {
  public readonly budget = createEpubProcessingBudget();
  public readonly inventory: ArchiveInventory = Object.freeze({
    entries: Object.freeze([]),
    entryCount: 0,
    fileCount: 0,
    directoryCount: 0,
    totalDeclaredUncompressedBytes: 0,
  });
  public closeCount = 0;

  public readEntry(): Promise<Uint8Array> {
    return Promise.reject(new EpubArchiveError("internal-failure"));
  }

  public async close(): Promise<void> {
    this.closeCount += 1;
  }
}

function syntheticPackageDocument(): ParsedPackageDocument {
  return Object.freeze({
    path: filePath("EPUB/package.opf"),
    version: "3.0",
    renditionLayout: "reflowable",
    pageProgressionDirection: "default",
    metadata: Object.freeze({
      uniqueIdentifier: "urn:synthetic:narration-resource-bounds",
      identifiers: Object.freeze(["urn:synthetic:narration-resource-bounds"]),
      titles: Object.freeze(["Synthetic narration resource bounds"]),
      languages: Object.freeze(["und"]),
      creators: Object.freeze([]),
      modified: "2026-07-25T00:00:00Z",
    }),
    manifest: Object.freeze([]),
    spine: Object.freeze([]),
    navigation: Object.freeze({
      kind: "xhtml",
      resourceId: "nav",
      path: filePath("EPUB/nav.xhtml"),
    }),
  });
}

function filePath(value: string): ArchiveFilePath {
  return parseArchiveEntryPath(value, "file");
}
