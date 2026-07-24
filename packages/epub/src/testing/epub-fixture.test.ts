import {
  Uint8ArrayReader,
  ZipReader,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyEpubFixtureMutations,
  buildComprehensiveEpubFixture,
  buildDeterministicZipFixture,
  buildMinimalEpubFixture,
  buildReaderLongChapterEpubFixture,
  buildReaderNavigationEpubFixture,
  buildReaderRasterEpubFixture,
  buildReaderReflowEpubFixture,
  buildReaderRestorationEpubFixture,
  READER_FIXTURE_EXPECTED_LOCATORS,
  READER_SEMANTIC_BLOCK_LIMIT,
  READER_SEMANTIC_BLOCK_OVER_LIMIT,
} from "../../test-support/epub-fixture.js";
import type { RasterImageResourceId } from "../document/document-model.js";
import { openEpubPublication } from "../public/open-epub-publication.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function exactByteIdentity(bytes: Uint8Array) {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new Uint8Array(bytes),
  );
  return {
    scheme: "sha256",
    schemeVersion: 1,
    value: Array.from(new Uint8Array(digest), (value) =>
      value.toString(16).padStart(2, "0"),
    ).join(""),
  } as const;
}

describe("deterministic EPUB fixture support", () => {
  it("repeats byte-identical minimal and comprehensive EPUBs", async () => {
    const [minimalFirst, minimalSecond, richFirst, richSecond] =
      await Promise.all([
        buildMinimalEpubFixture(),
        buildMinimalEpubFixture(),
        buildComprehensiveEpubFixture(),
        buildComprehensiveEpubFixture(),
      ]);

    expect(minimalFirst).toEqual(minimalSecond);
    expect(richFirst).toEqual(richSecond);
    expect(richFirst).not.toEqual(minimalFirst);
  });

  it("fixes physical order, timestamps, attributes, and compression", async () => {
    const bytes = await buildMinimalEpubFixture();
    const reader = new ZipReader(new Uint8ArrayReader(bytes), {
      useWebWorkers: false,
    });
    try {
      const entries = await reader.getEntries();
      expect(entries.map((entry) => entry.filename)).toEqual([
        "mimetype",
        "META-INF/container.xml",
        "EPUB/package.opf",
        "EPUB/nav.xhtml",
        "EPUB/text/chapter.xhtml",
      ]);
      expect(entries.map((entry) => entry.compressionMethod)).toEqual([
        0, 8, 8, 8, 8,
      ]);
      expect(entries.map((entry) => entry.versionMadeBy)).toEqual([
        20, 20, 20, 20, 20,
      ]);
      expect(entries.map((entry) => entry.externalFileAttributes)).toEqual([
        0, 0, 0, 0, 0,
      ]);
      for (const entry of entries) {
        expect(entry.lastModDate).toBeDefined();
        expect(entry.lastModDate?.getFullYear()).toBe(2000);
        expect(entry.lastModDate?.getMonth()).toBe(0);
        expect(entry.lastModDate?.getDate()).toBe(1);
        expect(entry.lastModDate?.getHours()).toBe(0);
        expect(entry.lastModDate?.getMinutes()).toBe(0);
        expect(entry.lastModDate?.getSeconds()).toBe(0);
      }
    } finally {
      await reader.close();
    }
  });

  it("creates valid rich synthetic content without external capabilities", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    const result = await openEpubPublication(
      await buildComprehensiveEpubFixture(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`unexpected fixture failure: ${result.detail}`);
    }
    try {
      expect(result.publication.book.spine).toHaveLength(3);
      expect(result.publication.documents).toHaveLength(4);
      expect(result.publication.resources).toEqual([
        {
          id: "resource:5",
          kind: "raster-image",
          mediaType: "image/png",
        },
      ]);
      expect(result.publication.locators.length).toBeGreaterThan(8);
    } finally {
      await result.publication.close();
    }
    expect(worker).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("builds deterministic reader navigation, reflow, and restoration scenarios with independently authored locators", async () => {
    const [navigationFirst, navigationSecond, reflow, restoration] =
      await Promise.all([
        buildReaderNavigationEpubFixture(),
        buildReaderNavigationEpubFixture(),
        buildReaderReflowEpubFixture(),
        buildReaderRestorationEpubFixture(),
      ]);

    expect(navigationFirst).toEqual(navigationSecond);
    expect(restoration).toEqual(reflow);

    const [navigationResult, reflowResult] = await Promise.all([
      openEpubPublication(navigationFirst),
      openEpubPublication(reflow),
    ]);
    expect(navigationResult.ok).toBe(true);
    expect(reflowResult.ok).toBe(true);
    if (!navigationResult.ok || !reflowResult.ok) {
      throw new Error("expected reader scenario fixture to open");
    }
    try {
      expect(navigationResult.publication.book.identity).toEqual(
        await exactByteIdentity(navigationFirst),
      );
      expect(reflowResult.publication.book.identity).toEqual(
        await exactByteIdentity(reflow),
      );
      const navigationLocators = navigationResult.publication.locators.map(
        ({ startLocator }) => ({
          spineItemId: startLocator.spineItemId,
          spineItemIndex: startLocator.spineItemIndex,
          anchorIndex: startLocator.anchor.anchorIndex,
          anchorValue: startLocator.anchor.value,
          textOffsetCodePoints: startLocator.textOffsetCodePoints,
        }),
      );
      expect(navigationLocators).toEqual(
        expect.arrayContaining([
          ...READER_FIXTURE_EXPECTED_LOCATORS.navigation,
        ]),
      );

      const reflowLocator = reflowResult.publication.locators.find(
        ({ startLocator }) =>
          startLocator.anchor.value ===
          READER_FIXTURE_EXPECTED_LOCATORS.reflow.anchorValue,
      );
      expect(reflowLocator).toBeDefined();
      if (reflowLocator === undefined) {
        throw new Error("expected reflow locator");
      }
      expect({
        spineItemId: reflowLocator.startLocator.spineItemId,
        spineItemIndex: reflowLocator.startLocator.spineItemIndex,
        anchorIndex: reflowLocator.startLocator.anchor.anchorIndex,
        anchorValue: reflowLocator.startLocator.anchor.value,
        textOffsetCodePoints: reflowLocator.startLocator.textOffsetCodePoints,
      }).toEqual(READER_FIXTURE_EXPECTED_LOCATORS.reflow);
    } finally {
      await navigationResult.publication.close();
      await reflowResult.publication.close();
    }
  });

  it("builds exact and maximum-plus-one reader chapters without changing the requested count", async () => {
    const [
      exactBytes,
      repeatedExactBytes,
      oversizedBytes,
      repeatedOversizedBytes,
    ] = await Promise.all([
      buildReaderLongChapterEpubFixture({
        semanticBlockCount: READER_SEMANTIC_BLOCK_LIMIT,
        deepTargetBlockIndex: 8_999,
      }),
      buildReaderLongChapterEpubFixture({
        semanticBlockCount: READER_SEMANTIC_BLOCK_LIMIT,
        deepTargetBlockIndex: 8_999,
      }),
      buildReaderLongChapterEpubFixture({
        semanticBlockCount: READER_SEMANTIC_BLOCK_OVER_LIMIT,
      }),
      buildReaderLongChapterEpubFixture({
        semanticBlockCount: READER_SEMANTIC_BLOCK_OVER_LIMIT,
      }),
    ]);
    expect(repeatedExactBytes).toEqual(exactBytes);
    expect(repeatedOversizedBytes).toEqual(oversizedBytes);

    const [exactResult, oversizedResult] = await Promise.all([
      openEpubPublication(exactBytes),
      openEpubPublication(oversizedBytes),
    ]);
    expect(exactResult.ok).toBe(true);
    expect(oversizedResult.ok).toBe(true);
    if (!exactResult.ok || !oversizedResult.ok) {
      throw new Error("expected reader chapter fixture to open");
    }
    try {
      expect(exactResult.publication.locators).toHaveLength(
        READER_SEMANTIC_BLOCK_LIMIT,
      );
      expect(oversizedResult.publication.locators).toHaveLength(
        READER_SEMANTIC_BLOCK_OVER_LIMIT,
      );
      expect(
        exactResult.publication.resolveTarget({
          documentId: "document:1",
          fragment: "deep-target",
        }),
      ).toMatchObject({ status: "exact", reason: "fragment" });
    } finally {
      await exactResult.publication.close();
      await oversizedResult.publication.close();
    }
  });

  it("builds valid, missing-reference, and signature-mismatch local raster cases", async () => {
    const [
      validBytes,
      repeatedValidBytes,
      missingBytes,
      repeatedMissingBytes,
      mismatchBytes,
      repeatedMismatchBytes,
    ] = await Promise.all([
      buildReaderRasterEpubFixture(),
      buildReaderRasterEpubFixture(),
      buildReaderRasterEpubFixture({ imageCase: "missing-reference" }),
      buildReaderRasterEpubFixture({ imageCase: "missing-reference" }),
      buildReaderRasterEpubFixture({ imageCase: "signature-mismatch" }),
      buildReaderRasterEpubFixture({ imageCase: "signature-mismatch" }),
    ]);
    expect(repeatedValidBytes).toEqual(validBytes);
    expect(repeatedMissingBytes).toEqual(missingBytes);
    expect(repeatedMismatchBytes).toEqual(mismatchBytes);

    const [validResult, missingResult, mismatchResult] = await Promise.all([
      openEpubPublication(validBytes),
      openEpubPublication(missingBytes),
      openEpubPublication(mismatchBytes),
    ]);
    expect(validResult.ok).toBe(true);
    expect(missingResult).toMatchObject({
      ok: false,
      detail: "broken-reference",
    });
    expect(mismatchResult.ok).toBe(true);
    if (!validResult.ok || !mismatchResult.ok) {
      throw new Error("expected local raster scenario fixture to open");
    }
    try {
      await expect(
        validResult.publication.readResource(
          "resource:2" as RasterImageResourceId,
        ),
      ).resolves.toEqual(expect.any(Uint8Array));
      await expect(
        mismatchResult.publication.readResource(
          "resource:2" as RasterImageResourceId,
        ),
      ).rejects.toMatchObject({ code: "malformed-package" });
    } finally {
      await validResult.publication.close();
      await mismatchResult.publication.close();
    }
  });

  it("supports explicit omitted and malformed high-level entries", async () => {
    const missingContainer = await buildMinimalEpubFixture({
      containerDocument: null,
    });
    const malformedChapter = await buildMinimalEpubFixture({
      chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml">`,
    });

    await expect(openEpubPublication(missingContainer)).resolves.toMatchObject({
      ok: false,
      detail: "invalid-container",
    });
    await expect(openEpubPublication(malformedChapter)).resolves.toMatchObject({
      ok: false,
      detail: "malformed-xml",
    });
  });

  it("builds low-level unsafe names and fixed extra fields deterministically", async () => {
    const entries = [
      {
        name: "mimetype",
        content: "application/epub+zip",
        compression: "stored" as const,
      },
      {
        name: "synthetic-name",
        content: Uint8Array.of(1, 2, 3),
        encodedName: Uint8Array.of(0xff),
        extraFields: [{ id: 0xcafe, data: Uint8Array.of(4, 5, 6) }] as const,
        compression: "stored" as const,
      },
    ] as const;

    const first = await buildDeterministicZipFixture(entries);
    const second = await buildDeterministicZipFixture(entries);

    expect(first).toEqual(second);
    expect(entries[1].encodedName).toEqual(Uint8Array.of(0xff));
    expect(entries[1].extraFields[0].data).toEqual(Uint8Array.of(4, 5, 6));
  });

  it("applies documented byte mutations in order without changing source bytes", async () => {
    const source = await buildMinimalEpubFixture();
    const original = source.slice();
    const mutated = applyEpubFixtureMutations(source, [
      {
        kind: "replace",
        description: "Corrupt the first local-file-header signature byte.",
        offset: 0,
        expected: Uint8Array.of(0x50),
        replacement: Uint8Array.of(0x51),
      },
      {
        kind: "prepend",
        description: "Prepend one byte before the first physical ZIP entry.",
        bytes: Uint8Array.of(0xaa),
      },
      {
        kind: "append",
        description: "Append one byte after the end-of-central-directory.",
        bytes: Uint8Array.of(0xbb),
      },
      {
        kind: "truncate",
        description: "Remove the appended byte again.",
        byteLength: source.byteLength + 1,
      },
    ]);

    expect(source).toEqual(original);
    expect(mutated).toHaveLength(source.byteLength + 1);
    expect(mutated[0]).toBe(0xaa);
    expect(mutated[1]).toBe(0x51);
  });

  it("fails closed when a byte patch is stale or undocumented", async () => {
    const source = await buildMinimalEpubFixture();

    expect(() =>
      applyEpubFixtureMutations(source, [
        {
          kind: "replace",
          description: "Expected bytes intentionally do not match.",
          offset: 0,
          expected: Uint8Array.of(0x00),
          replacement: Uint8Array.of(0x01),
        },
      ]),
    ).toThrowError("fixture-mutation-invalid");
    expect(() =>
      applyEpubFixtureMutations(source, [
        {
          kind: "append",
          description: "   ",
          bytes: Uint8Array.of(1),
        },
      ]),
    ).toThrowError("fixture-mutation-invalid");
  });
});
