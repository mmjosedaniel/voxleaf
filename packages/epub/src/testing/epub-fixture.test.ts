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
} from "../../test-support/epub-fixture.js";
import { openEpubPublication } from "../public/open-epub-publication.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

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
