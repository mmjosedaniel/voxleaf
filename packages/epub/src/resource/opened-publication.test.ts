import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import {
  createIndex,
  decodeBookV1,
  decodeOperationalErrorV1,
  decodeReadingLocatorV1,
} from "@voxleaf/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import {
  openEpubArchive,
  type ArchiveEntryReadOptions,
  type OpenedEpubArchive,
} from "../archive/archive-inventory.js";
import type {
  PackageManifestItem,
  ParsedPackageDocument,
} from "../package/package-document.js";
import { parseArchiveEntryPath } from "../paths/archive-path.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatedBlock,
  RasterImageMediaType,
  RasterImageResourceId,
  SensitivePublicationText,
} from "../document/document-model.js";
import { NARRATION_CHATTERBOX_V1_SEGMENT_POLICY } from "../narration/narration-chatterbox-policy.js";
import {
  NARRATION_PIPER_V1_SEGMENT_POLICY,
  NARRATION_PIPER_V2_SEGMENT_POLICY,
  piperSpeechExpansionCodePointUnits,
} from "../narration/narration-piper-policy.js";
import { NARRATION_V1_SOURCE_WINDOW_POLICY } from "../narration/narration-policy.js";
import type { NarrationYieldScheduler } from "../narration/narration-source-window.js";
import {
  createOpenedPublication,
  prepareOpenedPublicationNarrationSource,
} from "./opened-publication.js";

const encoder = new TextEncoder();
const ZIP_WRITER_OPTIONS = Object.freeze({
  dataDescriptor: false,
  extendedTimestamp: false,
  keepOrder: true,
  lastModDate: new Date("2000-01-01T00:00:00.000Z"),
  transferStreams: false,
  useCompressionStream: false,
  useWebWorkers: false,
});
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const IMAGE_ENTRIES = Object.freeze({
  "EPUB/images/cover.png": PNG,
  "EPUB/images/diagram.gif": GIF,
  "EPUB/images/photo.jpg": JPEG,
  "EPUB/images/illustration.webp": WEBP,
  "EPUB/images/active.png": PNG,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("bounded local publication resources", () => {
  it("exposes only immutable opaque raster descriptors and reads supported signatures lazily", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    await withPublication(
      createPackageDocument(),
      IMAGE_ENTRIES,
      {},
      async (publication, archive) => {
        expect(publication.resources).toEqual([
          { id: "resource:2", kind: "raster-image", mediaType: "image/png" },
          { id: "resource:3", kind: "raster-image", mediaType: "image/gif" },
          { id: "resource:4", kind: "raster-image", mediaType: "image/jpeg" },
          { id: "resource:5", kind: "raster-image", mediaType: "image/webp" },
        ]);
        expect(Object.isFrozen(publication.resources)).toBe(true);
        expect(Object.isFrozen(publication.resources[0])).toBe(true);
        expect(Object.isFrozen(publication)).toBe(true);
        expect(JSON.stringify(publication.resources)).not.toContain("EPUB/");
        expect(JSON.stringify(publication.resources)).not.toContain("bytes");
        expect(archive.budget.getSnapshot().observedUncompressedBytes).toBe(20);

        const expected = [PNG, GIF, JPEG, WEBP];
        for (const [index, bytes] of expected.entries()) {
          await expect(
            publication.readResource(imageId(index + 2)),
          ).resolves.toEqual(bytes);
        }

        const first = await publication.readResource(imageId(2));
        first[0] = 0;
        const second = await publication.readResource(imageId(2));
        expect(second).not.toBe(first);
        expect(second).toEqual(PNG);
        expect(worker).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
      },
    );
  });

  it("rejects a declared media type and byte-signature mismatch without returning partial bytes", async () => {
    const privateBytes = encoder.encode("private-canary");
    await withPublication(
      createSingleImagePackage("image/png", "EPUB/images/private.png"),
      { "EPUB/images/private.png": privateBytes },
      {},
      async (publication) => {
        let returned: Uint8Array | undefined;
        const error = await captureResourceError(async () => {
          returned = await publication.readResource(imageId(2));
        });

        expect(error).toMatchObject({
          code: "malformed-package",
          message: "malformed-package",
        });
        expect(error.message).not.toContain("private-canary");
        expect(error.cause).toBeUndefined();
        expect(returned).toBeUndefined();
      },
    );
  });

  it("allows the exact raster byte maximum and rejects a declared max-plus-one resource", async () => {
    const packageDocument = createSingleImagePackage(
      "image/png",
      "EPUB/images/exact.png",
    );
    await withPublication(
      packageDocument,
      { "EPUB/images/exact.png": PNG },
      { maxRasterImageBytes: PNG.byteLength },
      async (publication) => {
        await expect(publication.readResource(imageId(2))).resolves.toEqual(
          PNG,
        );
      },
    );

    const oversized = new Uint8Array([...PNG, 0]);
    const archive = await openEpubArchive(
      await createArchive({ "EPUB/images/exact.png": oversized }),
      { policy: { maxRasterImageBytes: PNG.byteLength } },
    );
    try {
      expect(() =>
        createOpenedPublication(archive, packageDocument, publicationValues()),
      ).toThrowError(
        expect.objectContaining({ code: "resource-limit-exceeded" }),
      );
    } finally {
      await archive.close();
    }
  });

  it("rejects unknown resource identities before reading archive bytes", async () => {
    await withPublication(
      createPackageDocument(),
      IMAGE_ENTRIES,
      {},
      async (publication, archive) => {
        const before = archive.budget.getSnapshot().observedUncompressedBytes;
        await expectResourceError(
          () => publication.readResource(imageId(99)),
          "broken-reference",
        );
        expect(archive.budget.getSnapshot().observedUncompressedBytes).toBe(
          before,
        );
      },
    );
  });

  it("rejects a declared local raster resource missing from the archive", async () => {
    const archive = await openEpubArchive(await createArchive({}));
    try {
      expect(() =>
        createOpenedPublication(
          archive,
          createSingleImagePackage("image/png", "EPUB/images/missing.png"),
          publicationValues(),
        ),
      ).toThrowError(expect.objectContaining({ code: "malformed-package" }));
    } finally {
      await archive.close();
    }
  });

  it("honors a read-scoped cancellation without closing the publication", async () => {
    await withPublication(
      createPackageDocument(),
      IMAGE_ENTRIES,
      {},
      async (publication) => {
        const controller = new AbortController();
        controller.abort("private-canary");

        await expectResourceError(
          () =>
            publication.readResource(imageId(2), {
              signal: controller.signal,
            }),
          "cancelled",
        );
        expect(publication.closed).toBe(false);
        await expect(publication.readResource(imageId(2))).resolves.toEqual(
          PNG,
        );
      },
    );
  });

  it("makes close idempotent and rejects reads after releasing the archive", async () => {
    const archive = await openEpubArchive(await createArchive(IMAGE_ENTRIES));
    const publication = createOpenedPublication(
      archive,
      createPackageDocument(),
      publicationValues(),
    );

    const firstClose = publication.close();
    const secondClose = publication.close();
    expect(secondClose).toBe(firstClose);
    await firstClose;

    expect(publication.closed).toBe(true);
    await expectResourceError(
      () => publication.readResource(imageId(2)),
      "internal-failure",
    );
  });

  it("propagates caller cancellation during an active resource read", async () => {
    const archive = new DeferredArchive();
    const publication = createOpenedPublication(
      archive,
      createSingleImagePackage("image/png", "EPUB/images/deferred.png"),
      publicationValues(),
    );
    const controller = new AbortController();

    const read = publication.readResource(imageId(2), {
      signal: controller.signal,
    });
    controller.abort("private-canary");

    await expectResourcePromiseError(read, "cancelled");
    expect(publication.closed).toBe(false);
    await publication.close();
    expect(archive.closeCount).toBe(1);
  });

  it("cancels an active resource read before close releases the archive", async () => {
    const archive = new DeferredArchive();
    const publication = createOpenedPublication(
      archive,
      createSingleImagePackage("image/png", "EPUB/images/deferred.png"),
      publicationValues(),
    );

    const read = publication.readResource(imageId(2));
    await expectResourceError(
      () => publication.readResource(imageId(2)),
      "internal-failure",
    );
    const close = publication.close();

    await expectResourcePromiseError(read, "cancelled");
    await close;
    expect(publication.closed).toBe(true);
    expect(archive.closeCount).toBe(1);
  });

  it("owns one narration operation independently of one raster read", async () => {
    const archive = await openEpubArchive(await createArchive(IMAGE_ENTRIES));
    const deferred = createDeferredYieldScheduler();
    const values = narrationPublicationValues(
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum + 1,
      deferred.scheduler,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument(),
      values,
    );
    const start = requiredLocatedBlock(
      values.locatorIndex.blocks[0],
    ).startLocator;

    try {
      const before = archive.budget.getSnapshot().observedUncompressedBytes;
      const active = prepareOpenedPublicationNarrationSource(publication, {
        startLocator: start,
      });
      await deferred.started;

      await expect(
        prepareOpenedPublicationNarrationSource(publication, {
          startLocator: start,
        }),
      ).resolves.toEqual({ status: "operation-active" });
      await expect(publication.readResource(imageId(2))).resolves.toEqual(PNG);
      expect(archive.budget.getSnapshot().observedUncompressedBytes).toBe(
        before + PNG.byteLength,
      );

      deferred.release();
      const result = await active;
      expect(result.status).toBe("window");
    } finally {
      deferred.release();
      await publication.close();
    }
  });

  it("aborts and awaits active narration before idempotent close releases the archive", async () => {
    const archive = new DeferredArchive();
    const deferred = createDeferredYieldScheduler();
    const values = narrationPublicationValues(
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum + 1,
      deferred.scheduler,
    );
    const publication = createOpenedPublication(
      archive,
      createSingleImagePackage("image/png", "EPUB/images/deferred.png"),
      values,
    );
    const start = requiredLocatedBlock(
      values.locatorIndex.blocks[0],
    ).startLocator;
    const active = prepareOpenedPublicationNarrationSource(publication, {
      startLocator: start,
    });
    await deferred.started;

    const firstClose = publication.close();
    const secondClose = publication.close();
    expect(secondClose).toBe(firstClose);
    expect(publication.closed).toBe(true);
    expect(archive.closeCount).toBe(0);

    deferred.release();
    await expect(active).resolves.toEqual({ status: "cancelled" });
    await firstClose;
    expect(archive.closeCount).toBe(1);
    await expect(
      prepareOpenedPublicationNarrationSource(publication, {
        startLocator: start,
      }),
    ).resolves.toEqual({ status: "internal-failure" });
  });

  it("allows retry after caller cancellation without publishing stale source", async () => {
    const archive = new DeferredArchive();
    const values = narrationPublicationValues(8, async () => undefined);
    const publication = createOpenedPublication(
      archive,
      createSingleImagePackage("image/png", "EPUB/images/deferred.png"),
      values,
    );
    const start = requiredLocatedBlock(
      values.locatorIndex.blocks[0],
    ).startLocator;
    const controller = new AbortController();
    controller.abort("private-canary");

    await expect(
      prepareOpenedPublicationNarrationSource(publication, {
        startLocator: start,
        signal: controller.signal,
      }),
    ).resolves.toEqual({ status: "cancelled" });

    const retry = await prepareOpenedPublicationNarrationSource(publication, {
      startLocator: start,
    });
    expect(retry.status).toBe("complete");
    expect(JSON.stringify(retry)).not.toContain("private-canary");
    await publication.close();
    expect(archive.closeCount).toBe(1);
  });

  it("publishes frozen prepared batches through the public opened handle and continues without repetition", async () => {
    const archive = await openEpubArchive(await createArchive({}));
    const values = narrationTextPublicationValues(
      ["Primera frase.", "Segunda frase.", "Tercera frase."],
      async () => undefined,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument([]),
      values,
    );
    const firstStart = requiredLocatedBlock(
      values.locatorIndex.blocks[0],
    ).startLocator;

    try {
      const first = await publication.prepareNarration({
        startLocator: firstStart,
        profile: "narration-v1",
        defaultLanguage: "es",
        maximumSegments: 1,
      });
      expect(first.status).toBe("batch");
      if (first.status !== "batch") {
        throw new Error("expected first public narration batch");
      }
      expect(first.segments).toHaveLength(1);
      expect(first.start.segmentRelation).toBe("at-segment-start");
      expect(first.continuation).toEqual(first.segments[0]?.sourceRange.end);
      expect(Object.isFrozen(first)).toBe(true);
      expect(Object.isFrozen(first.start)).toBe(true);
      expect(Object.isFrozen(first.segments)).toBe(true);
      expect(Object.isFrozen(first.measurements)).toBe(true);

      const second = await publication.prepareNarration({
        startLocator: first.continuation,
        profile: "narration-v1",
        defaultLanguage: "es",
        maximumSegments: 1,
      });
      expect(second.status).toBe("batch");
      if (second.status !== "batch") {
        throw new Error("expected second public narration batch");
      }
      expect(second.segments[0]?.sourceRange).not.toEqual(
        first.segments[0]?.sourceRange,
      );

      const final = await publication.prepareNarration({
        startLocator: second.continuation,
        profile: "narration-v1",
        defaultLanguage: "es",
        maximumSegments: 1,
      });
      expect(final.status).toBe("complete");
      if (final.status !== "complete") {
        throw new Error("expected final public narration batch");
      }
      expect(final.segments).toHaveLength(1);
      expect(final).not.toHaveProperty("continuation");
    } finally {
      await publication.close();
    }
  });

  it("publishes the versioned bilingual profile while preserving historical Spanish bytes", async () => {
    const spanishSource =
      "El informe de 2026 confirmó que el avance llegó al 25 %.";
    const archive = await openEpubArchive(await createArchive({}));
    const values = narrationTextPublicationValues(
      [spanishSource],
      async () => undefined,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument([]),
      values,
    );
    const start = requiredLocatedBlock(
      values.locatorIndex.blocks[0],
    ).startLocator;

    try {
      const historical = await publication.prepareNarration({
        startLocator: start,
        profile: "narration-v1",
        defaultLanguage: "es",
        maximumSegments: 16,
      });
      const bilingualSpanish = await publication.prepareNarration({
        startLocator: start,
        profile: "narration-bilingual-v2",
        defaultLanguage: "es",
        maximumSegments: 16,
      });
      const bilingualEnglish = await publication.prepareNarration({
        startLocator: start,
        profile: "narration-bilingual-v2",
        defaultLanguage: "en",
        maximumSegments: 16,
      });

      expect(bilingualSpanish).toEqual(historical);
      expect(bilingualEnglish.status).toBe("complete");
      if (bilingualEnglish.status !== "complete") {
        throw new Error("expected bilingual English narration");
      }
      expect(String(bilingualEnglish.segments[0]?.text)).toBe(
        "El informe de 2026 confirmó que el avance llegó al twenty-five percent.",
      );
    } finally {
      await publication.close();
    }
  });

  it("prepares locator-safe bounded Piper segments without changing their text", async () => {
    expect(NARRATION_PIPER_V1_SEGMENT_POLICY).toEqual({
      sourceCodePointsTarget: 240,
      sourceCodePointsHardMaximum: 320,
      narrationCodePointsTarget: 200,
      narrationCodePointsHardMaximum: 256,
      narrationUtf8BytesTarget: 800,
      narrationUtf8BytesHardMaximum: 1_024,
      sentencesTarget: 2,
      sentencesHardMaximum: 6,
    });
    const archive = await openEpubArchive(await createArchive({}));
    const phrase =
      "Esta es una oracion sintetica para comprobar la narracion local. ";
    const text = (phrase.repeat(8).slice(0, 400) +
      "Final seguro.") as SensitivePublicationText;
    const values = narrationTextPublicationValues(
      [text],
      async () => undefined,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument([]),
      values,
    );
    const block = requiredLocatedBlock(values.locatorIndex.blocks[0]);

    try {
      const result = await publication.prepareNarration({
        startLocator: block.startLocator,
        profile: "narration-piper-v1",
        defaultLanguage: "es",
        maximumSegments: 16,
      });
      expect(result.status).toBe("complete");
      if (result.status !== "complete") {
        throw new Error("expected complete Piper narration batch");
      }
      expect(result.segments.length).toBeGreaterThan(1);
      expect(
        result.segments.every(
          (segment) =>
            segment.measurements.narrationCodePoints <= 256 &&
            segment.measurements.narrationUtf8Bytes <= 1_024 &&
            segment.measurements.sentenceCount <= 6,
        ),
      ).toBe(true);
      expect(result.segments[0]?.sourceRange.start).toEqual(block.startLocator);
      expect(result.segments.at(-1)?.sourceRange.end.textOffsetCodePoints).toBe(
        block.textLengthCodePoints,
      );
      for (const [index, segment] of result.segments.entries()) {
        expect(segment.measurements.sourceCodePoints).toBeLessThanOrEqual(320);
        if (index > 0) {
          expect(segment.sourceRange.start).toEqual(
            result.segments[index - 1]?.sourceRange.end,
          );
        }
      }
      expect(result.segments.map((segment) => segment.text).join("")).toBe(
        text,
      );
    } finally {
      await publication.close();
    }
  });

  it("combines bilingual normalization with bounded Chatterbox waveform units", async () => {
    expect(NARRATION_CHATTERBOX_V1_SEGMENT_POLICY).toEqual({
      sourceCodePointsTarget: 240,
      sourceCodePointsHardMaximum: 320,
      narrationCodePointsTarget: 200,
      narrationCodePointsHardMaximum: 256,
      narrationUtf8BytesTarget: 800,
      narrationUtf8BytesHardMaximum: 1_024,
      sentencesTarget: 2,
      sentencesHardMaximum: 6,
    });
    const archive = await openEpubArchive(await createArchive({}));
    const phrase =
      "A complete local waveform remains bounded while preserving the sentence. ";
    const text = (phrase.repeat(8).slice(0, 480) +
      "Final safe sentence.") as SensitivePublicationText;
    const values = narrationTextPublicationValues(
      [text],
      async () => undefined,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument([]),
      values,
    );
    const block = requiredLocatedBlock(values.locatorIndex.blocks[0]);

    try {
      const result = await publication.prepareNarration({
        startLocator: block.startLocator,
        profile: "narration-chatterbox-v1",
        defaultLanguage: "en",
        maximumSegments: 16,
      });
      expect(result.status).toBe("complete");
      if (result.status !== "complete") {
        throw new Error("expected complete Chatterbox narration batch");
      }
      expect(result.segments.length).toBeGreaterThan(1);
      expect(result.segments.map((segment) => segment.text).join("")).toBe(
        text,
      );
      expect(
        result.segments.every(
          (segment) =>
            segment.measurements.sourceCodePoints <= 320 &&
            segment.measurements.narrationCodePoints <= 256 &&
            segment.measurements.narrationUtf8Bytes <= 1_024 &&
            segment.measurements.sentenceCount <= 6,
        ),
      ).toBe(true);
      expect(result.segments[0]?.sourceRange.start).toEqual(block.startLocator);
      expect(result.segments.at(-1)?.sourceRange.end.textOffsetCodePoints).toBe(
        block.textLengthCodePoints,
      );
      for (const [index, segment] of result.segments.entries()) {
        if (index > 0) {
          expect(segment.sourceRange.start).toEqual(
            result.segments[index - 1]?.sourceRange.end,
          );
        }
      }
    } finally {
      await publication.close();
    }
  });

  it("prepares expansion-aware Piper v2 segments through the public boundary", async () => {
    const archive = await openEpubArchive(await createArchive({}));
    const text = Array.from(
      { length: 20 },
      (_, index) => `${String(index + 1).padStart(4, "0")} USD`,
    ).join(" ") as SensitivePublicationText;
    const values = narrationTextPublicationValues(
      [text],
      async () => undefined,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument([]),
      values,
    );
    const block = requiredLocatedBlock(values.locatorIndex.blocks[0]);

    try {
      const result = await publication.prepareNarration({
        startLocator: block.startLocator,
        profile: "narration-piper-v2",
        defaultLanguage: "es",
        maximumSegments: 16,
      });
      expect(result.status).toBe("complete");
      if (result.status !== "complete") {
        throw new Error("expected complete Piper v2 narration batch");
      }
      expect(result.segments.length).toBeGreaterThan(1);
      expect(result.segments.map((segment) => segment.text).join("")).toBe(
        text,
      );
      expect(
        result.segments.every(
          (segment) =>
            Array.from(String(segment.text)).reduce(
              (total, codePoint) =>
                total + piperSpeechExpansionCodePointUnits(codePoint),
              0,
            ) <=
            NARRATION_PIPER_V2_SEGMENT_POLICY.piperSpeechExpansionUnitsHardMaximum,
        ),
      ).toBe(true);
      expect(result.segments[0]?.sourceRange.start).toEqual(block.startLocator);
      expect(result.segments.at(-1)?.sourceRange.end.textOffsetCodePoints).toBe(
        block.textLengthCodePoints,
      );
      for (const [index, segment] of result.segments.entries()) {
        if (index > 0) {
          expect(segment.sourceRange.start).toEqual(
            result.segments[index - 1]?.sourceRange.end,
          );
        }
      }
    } finally {
      await publication.close();
    }
  });

  it("combines bilingual English normalization with Piper v2 expansion bounds", async () => {
    const archive = await openEpubArchive(await createArchive({}));
    const text = "The notebook cost $12.50." as SensitivePublicationText;
    const values = narrationTextPublicationValues(
      [text],
      async () => undefined,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument([]),
      values,
    );
    const block = requiredLocatedBlock(values.locatorIndex.blocks[0]);

    try {
      const result = await publication.prepareNarration({
        startLocator: block.startLocator,
        profile: "narration-piper-v2",
        defaultLanguage: "en",
        maximumSegments: 16,
      });
      expect(result.status).toBe("complete");
      if (result.status !== "complete") {
        throw new Error("expected complete English Piper v2 narration batch");
      }
      expect(result.segments.map((segment) => segment.text).join("")).toBe(
        "The notebook cost twelve dollars and fifty cents.",
      );
      expect(
        result.segments.every(
          (segment) =>
            Array.from(String(segment.text)).reduce(
              (total, codePoint) =>
                total + piperSpeechExpansionCodePointUnits(codePoint),
              0,
            ) <=
            NARRATION_PIPER_V2_SEGMENT_POLICY.piperSpeechExpansionUnitsHardMaximum,
        ),
      ).toBe(true);
      expect(result.segments[0]?.sourceRange.start).toEqual(block.startLocator);
      expect(result.segments.at(-1)?.sourceRange.end.textOffsetCodePoints).toBe(
        block.textLengthCodePoints,
      );
    } finally {
      await publication.close();
    }
  });

  it("returns the complete stable containing segment for an interior start", async () => {
    const archive = await openEpubArchive(await createArchive({}));
    const values = narrationTextPublicationValues(
      ["Primera frase sintética. Segunda frase sintética."],
      async () => undefined,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument([]),
      values,
    );
    const block = requiredLocatedBlock(values.locatorIndex.blocks[0]);
    const interior = decodeReadingLocatorV1({
      ...block.startLocator,
      textOffsetCodePoints: 12,
    });

    try {
      const result = await publication.prepareNarration({
        startLocator: interior,
        profile: "narration-v1",
        defaultLanguage: "es",
        maximumSegments: 16,
      });
      expect(result.status).toBe("complete");
      if (result.status !== "complete") {
        throw new Error("expected complete containing segment");
      }
      expect(result.start).toMatchObject({
        canonicalLocator: interior,
        resolutionStatus: "exact",
        resolutionReason: "exact",
        segmentRelation: "inside-segment",
      });
      expect(result.segments[0]?.sourceRange.start).toEqual(block.startLocator);
      expect(result.segments[0]?.sourceRange.end.textOffsetCodePoints).toBe(
        block.textLengthCodePoints,
      );
    } finally {
      await publication.close();
    }
  });

  it("reconstructs a stable interior segment across bounded source windows", async () => {
    const archive = await openEpubArchive(await createArchive({}));
    const text = "a. ".repeat(2_000);
    const values = narrationTextPublicationValues(
      [text],
      async () => undefined,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument([]),
      values,
    );
    const block = requiredLocatedBlock(values.locatorIndex.blocks[0]);
    const interiorOffset = 4_501;
    const interior = decodeReadingLocatorV1({
      ...block.startLocator,
      textOffsetCodePoints: interiorOffset,
    });

    try {
      const result = await publication.prepareNarration({
        startLocator: interior,
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 1,
      });
      expect(result.status).toBe("batch");
      if (result.status !== "batch") {
        throw new Error("expected bounded interior narration batch");
      }
      const segment = result.segments[0];
      if (segment === undefined) {
        throw new Error("expected stable interior segment");
      }
      expect(
        segment.sourceRange.start.textOffsetCodePoints,
      ).toBeLessThanOrEqual(interiorOffset);
      expect(segment.sourceRange.end.textOffsetCodePoints).toBeGreaterThan(
        interiorOffset,
      );
      expect(result.start.segmentRelation).toBe("inside-segment");
      expect(result.measurements.sourceCodePointsInspected).toBeLessThanOrEqual(
        NARRATION_V1_SOURCE_WINDOW_POLICY.sourceCodePointsInspectedHardMaximum,
      );
    } finally {
      await publication.close();
    }
  });

  it("returns closed content-free failures for invalid requests, cancellation, and post-close calls", async () => {
    const archive = await openEpubArchive(await createArchive({}));
    const values = narrationTextPublicationValues(
      ["Canario sintético privado."],
      async () => undefined,
    );
    const publication = createOpenedPublication(
      archive,
      createPackageDocument([]),
      values,
    );
    const start = requiredLocatedBlock(
      values.locatorIndex.blocks[0],
    ).startLocator;

    const invalid = await publication.prepareNarration({
      startLocator: start,
      profile: "narration-v1",
      defaultLanguage: "es",
      maximumSegments: 17,
    });
    expect(invalid.status).toBe("invalid-request");
    if (invalid.status !== "invalid-request") {
      throw new Error("expected invalid narration request");
    }
    expect(decodeOperationalErrorV1(invalid.error)).toEqual(invalid.error);
    expect(invalid.error.code).toBe("invalid-input");
    expect(Object.isFrozen(invalid)).toBe(true);
    expect(JSON.stringify(invalid)).not.toContain("Canario");

    const unknownProfile = await publication.prepareNarration({
      startLocator: start,
      profile: "narration-future-v2" as "narration-v1",
      defaultLanguage: "es",
      maximumSegments: 1,
    });
    expect(unknownProfile.status).toBe("invalid-request");

    const notYetImplementedEnglish = await publication.prepareNarration({
      startLocator: start,
      profile: "narration-v1",
      defaultLanguage: "en" as "es",
      maximumSegments: 1,
    });
    expect(notYetImplementedEnglish.status).toBe("invalid-request");
    expect(JSON.stringify(notYetImplementedEnglish)).not.toContain("Canario");

    const invalidBilingualNeutral = await publication.prepareNarration({
      startLocator: start,
      profile: "narration-bilingual-v2",
      defaultLanguage: "und" as "es",
      maximumSegments: 1,
    });
    expect(invalidBilingualNeutral.status).toBe("invalid-request");

    const invalidSignal = await publication.prepareNarration({
      startLocator: start,
      profile: "narration-v1",
      defaultLanguage: "es",
      maximumSegments: 1,
      signal: {
        aborted: false,
        addEventListener: () => {
          throw new Error("private-canary");
        },
        removeEventListener: () => undefined,
      } as unknown as AbortSignal,
    });
    expect(invalidSignal.status).toBe("invalid-request");
    expect(JSON.stringify(invalidSignal)).not.toContain("private-canary");

    const invalidStart = await publication.prepareNarration({
      startLocator: { privateCanary: "Canario sintético privado." },
      profile: "narration-v1",
      defaultLanguage: "es",
      maximumSegments: 1,
    });
    expect(invalidStart.status).toBe("invalid-start");
    if (invalidStart.status !== "invalid-start") {
      throw new Error("expected invalid narration start");
    }
    expect(invalidStart.error.code).toBe("invalid-input");
    expect(JSON.stringify(invalidStart)).not.toContain("Canario");

    const controller = new AbortController();
    controller.abort("private-canary");
    const cancelled = await publication.prepareNarration({
      startLocator: start,
      profile: "narration-v1",
      defaultLanguage: "es",
      maximumSegments: 1,
      signal: controller.signal,
    });
    expect(cancelled.status).toBe("cancelled");
    if (cancelled.status !== "cancelled") {
      throw new Error("expected cancelled narration request");
    }
    expect(cancelled.error.code).toBe("operation-cancelled");
    expect(JSON.stringify(cancelled)).not.toContain("private-canary");

    const retry = await publication.prepareNarration({
      startLocator: start,
      profile: "narration-v1",
      defaultLanguage: "es",
      maximumSegments: 1,
    });
    expect(retry.status).toBe("complete");

    await publication.close();
    const closed = await publication.prepareNarration({
      startLocator: start,
      profile: "narration-v1",
      defaultLanguage: "es",
      maximumSegments: 1,
    });
    expect(closed.status).toBe("internal-failure");
    if (closed.status !== "internal-failure") {
      throw new Error("expected post-close narration failure");
    }
    expect(closed.error.code).toBe("internal-failure");
  });

  it("shares one public narration slot, overlaps raster reads, and close cancels stale preparation", async () => {
    const archive = new DeferredArchive();
    const deferred = createDeferredYieldScheduler();
    const values = narrationPublicationValues(
      NARRATION_V1_SOURCE_WINDOW_POLICY.retainedTokenEntriesHardMaximum + 1,
      deferred.scheduler,
    );
    const publication = createOpenedPublication(
      archive,
      createSingleImagePackage("image/png", "EPUB/images/deferred.png"),
      values,
    );
    const start = requiredLocatedBlock(
      values.locatorIndex.blocks[0],
    ).startLocator;
    const request = {
      startLocator: start,
      profile: "narration-v1" as const,
      defaultLanguage: "und" as const,
      maximumSegments: 1,
    };
    const active = publication.prepareNarration(request);
    await deferred.started;

    const concurrent = await publication.prepareNarration(request);
    expect(concurrent.status).toBe("operation-active");
    if (concurrent.status !== "operation-active") {
      throw new Error("expected active narration failure");
    }
    expect(concurrent.error.code).toBe("resource-exhausted");

    const read = publication.readResource(imageId(2));
    const close = publication.close();
    expect(publication.closed).toBe(true);
    expect(archive.closeCount).toBe(0);

    deferred.release();
    await expect(active).resolves.toMatchObject({ status: "cancelled" });
    await expectResourcePromiseError(read, "cancelled");
    await close;
    expect(archive.closeCount).toBe(1);
  });
});

class DeferredArchive implements OpenedEpubArchive {
  public readonly budget = createEpubProcessingBudget();
  public readonly inventory = Object.freeze({
    entries: Object.freeze([
      Object.freeze({
        path: filePath("EPUB/images/deferred.png"),
        kind: "file" as const,
        compressionMethod: "stored" as const,
        compressedSize: PNG.byteLength,
        uncompressedSize: PNG.byteLength,
        crc32: 0,
        localHeaderOffset: 0,
        zip64: false,
      }),
    ]),
    entryCount: 1,
    fileCount: 1,
    directoryCount: 0,
    totalDeclaredUncompressedBytes: PNG.byteLength,
  });
  public closeCount = 0;

  public readEntry(
    _path: ArchiveFilePath,
    options: ArchiveEntryReadOptions = {},
  ): Promise<Uint8Array> {
    return new Promise((_resolve, reject) => {
      const signal = options.signal;
      if (signal?.aborted === true) {
        reject(new EpubArchiveError("cancelled"));
        return;
      }

      signal?.addEventListener(
        "abort",
        () => reject(new EpubArchiveError("cancelled")),
        { once: true },
      );
    });
  }

  public async close(): Promise<void> {
    this.closeCount += 1;
  }
}

function imageId(index: number): RasterImageResourceId {
  return `resource:${String(index)}` as RasterImageResourceId;
}

function filePath(value: string): ArchiveFilePath {
  return parseArchiveEntryPath(value, "file");
}

function localItem(
  id: string,
  path: string,
  mediaType: string,
  kind: PackageManifestItem["kind"],
  properties: readonly string[] = [],
): PackageManifestItem {
  return Object.freeze({
    id,
    location: Object.freeze({ kind: "local", path: filePath(path) }),
    mediaType,
    mediaTypeEssence: mediaType,
    kind,
    properties: Object.freeze([...properties]),
  });
}

function externalRasterItem(id: string): PackageManifestItem {
  return Object.freeze({
    id,
    location: Object.freeze({ kind: "external" }),
    mediaType: "image/png",
    mediaTypeEssence: "image/png",
    kind: "raster-image",
    properties: Object.freeze([]),
  });
}

function createPackageDocument(
  imageItems: readonly PackageManifestItem[] = [
    localItem("png", "EPUB/images/cover.png", "image/png", "raster-image"),
    localItem("gif", "EPUB/images/diagram.gif", "image/gif", "raster-image"),
    localItem("jpeg", "EPUB/images/photo.jpg", "image/jpeg", "raster-image"),
    localItem(
      "webp",
      "EPUB/images/illustration.webp",
      "image/webp",
      "raster-image",
    ),
    localItem("active", "EPUB/images/active.png", "image/png", "raster-image", [
      "scripted",
    ]),
    externalRasterItem("remote"),
    localItem("svg", "EPUB/images/vector.svg", "image/svg+xml", "other"),
  ],
): ParsedPackageDocument {
  const nav = localItem(
    "nav",
    "EPUB/nav.xhtml",
    "application/xhtml+xml",
    "content-document",
    ["nav"],
  );
  const chapter = localItem(
    "chapter",
    "EPUB/chapter.xhtml",
    "application/xhtml+xml",
    "content-document",
  );
  return Object.freeze({
    path: filePath("EPUB/package.opf"),
    version: "3.0",
    renditionLayout: "reflowable",
    pageProgressionDirection: "default",
    metadata: Object.freeze({
      uniqueIdentifier: "urn:synthetic:resources",
      identifiers: Object.freeze(["urn:synthetic:resources"]),
      titles: Object.freeze(["Synthetic resources"]),
      languages: Object.freeze(["en"]),
      creators: Object.freeze([]),
      modified: "2026-07-22T00:00:00Z",
    }),
    manifest: Object.freeze([nav, chapter, ...imageItems]),
    spine: Object.freeze([
      Object.freeze({
        index: 0,
        idref: "chapter",
        contentResourceId: "chapter",
        path: filePath("EPUB/chapter.xhtml"),
        linear: true,
        properties: Object.freeze([]),
      }),
    ]),
    navigation: Object.freeze({
      resourceId: "nav",
      path: filePath("EPUB/nav.xhtml"),
    }),
  });
}

function createSingleImagePackage(
  mediaType: RasterImageMediaType,
  path: string,
): ParsedPackageDocument {
  return createPackageDocument([
    localItem("image", path, mediaType, "raster-image"),
  ]);
}

function publicationValues() {
  const book = decodeBookV1({
    schemaVersion: 1,
    identity: {
      scheme: "synthetic-test",
      schemeVersion: 1,
      value: "book-resource-test",
    },
    metadata: { title: "Synthetic resources", authors: [] },
    resources: [
      {
        path: "EPUB/chapter.xhtml",
        mediaType: "application/xhtml+xml",
        role: "content-document",
      },
    ],
    spine: [
      {
        id: "spine:0",
        index: 0,
        resourcePath: "EPUB/chapter.xhtml",
      },
    ],
    navigation: [],
  });
  const spine = book.spine[0];
  if (spine === undefined) {
    throw new Error("synthetic resource publication requires one spine");
  }

  return Object.freeze({
    book,
    documents: Object.freeze([]),
    navigation: Object.freeze([]),
    locatorIndex: Object.freeze({
      bookIdentity: book.identity,
      spines: Object.freeze([
        Object.freeze({
          spineItemId: spine.id,
          spineItemIndex: spine.index,
          blocks: Object.freeze([]),
        }),
      ]),
      blocks: Object.freeze([]),
    }),
    targetIndex: Object.freeze({ findDocument: () => undefined }),
  });
}

function narrationPublicationValues(
  sourceCodePoints: number,
  narrationYieldScheduler: NarrationYieldScheduler,
) {
  return narrationTextPublicationValues(
    ["n".repeat(sourceCodePoints)],
    narrationYieldScheduler,
  );
}

function narrationTextPublicationValues(
  texts: readonly string[],
  narrationYieldScheduler: NarrationYieldScheduler,
) {
  const base = publicationValues();
  const spine = base.book.spine[0];
  if (spine === undefined) {
    throw new Error("synthetic narration publication requires one spine");
  }
  const locatedBlocks = Object.freeze(
    texts.map((text, index) => {
      const block = Object.freeze({
        kind: "paragraph" as const,
        children: Object.freeze([
          Object.freeze({
            kind: "text" as const,
            text: text as SensitivePublicationText,
          }),
        ]),
      });
      return Object.freeze({
        documentId: "document:0" as ContentDocumentId,
        block,
        startLocator: decodeReadingLocatorV1({
          schemaVersion: 1,
          bookIdentity: base.book.identity,
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
        textLengthCodePoints: createIndex(Array.from(text).length),
      } satisfies PublicationLocatedBlock);
    }),
  );
  return Object.freeze({
    ...base,
    locatorIndex: Object.freeze({
      bookIdentity: base.book.identity,
      spines: Object.freeze([
        Object.freeze({
          spineItemId: spine.id,
          spineItemIndex: spine.index,
          blocks: locatedBlocks,
        }),
      ]),
      blocks: locatedBlocks,
    }),
    narrationYieldScheduler,
  });
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

function requiredLocatedBlock(
  block: PublicationLocatedBlock | undefined,
): PublicationLocatedBlock {
  if (block === undefined) {
    throw new Error("expected narration located block");
  }
  return block;
}

async function createArchive(
  imageEntries: Readonly<Record<string, Uint8Array>>,
): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const entries: (readonly [string, Uint8Array])[] = [
    ["mimetype", encoder.encode("application/epub+zip")],
    ["EPUB/nav.xhtml", encoder.encode("<html/>")],
    ["EPUB/chapter.xhtml", encoder.encode("<html/>")],
    ["EPUB/images/vector.svg", encoder.encode("<svg/>")],
    ...Object.entries(imageEntries),
  ];

  for (const [index, [path, bytes]] of entries.entries()) {
    await writer.add(path, new Uint8ArrayReader(bytes), {
      ...ZIP_WRITER_OPTIONS,
      level: index === 0 ? 0 : 6,
    });
  }
  return writer.close();
}

async function withPublication(
  packageDocument: ParsedPackageDocument,
  imageEntries: Readonly<Record<string, Uint8Array>>,
  policy: Readonly<{ maxRasterImageBytes?: number }>,
  action: (
    publication: OpenedPublication,
    archive: OpenedEpubArchive,
  ) => Promise<void>,
): Promise<void> {
  const archive = await openEpubArchive(await createArchive(imageEntries), {
    policy,
  });
  const publication = createOpenedPublication(
    archive,
    packageDocument,
    publicationValues(),
  );
  try {
    await action(publication, archive);
  } finally {
    await publication.close();
  }
}

async function expectResourceError(
  action: () => Promise<unknown>,
  code: EpubArchiveError["code"],
): Promise<void> {
  const error = await captureResourceError(action);
  expect(error).toMatchObject({ code, message: code });
  expect(error.cause).toBeUndefined();
}

async function expectResourcePromiseError(
  promise: Promise<unknown>,
  code: EpubArchiveError["code"],
): Promise<void> {
  await expectResourceError(() => promise, code);
}

async function captureResourceError(
  action: () => Promise<unknown>,
): Promise<EpubArchiveError> {
  try {
    await action();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    return error as EpubArchiveError;
  }

  throw new Error("expected resource operation to fail");
}
