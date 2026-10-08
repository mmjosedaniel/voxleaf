import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import { openEpubArchive } from "../archive/archive-inventory.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import { resolveContainerPackage } from "../container/container-resolver.js";
import type { ResolvedPackageDocument } from "../container/container-resolver.js";
import type { EpubProcessingBudgetOptions } from "../security/processing-budget.js";
import { parsePackageDocument } from "./package-document.js";

const ZIP_WRITER_OPTIONS = Object.freeze({
  dataDescriptor: false,
  extendedTimestamp: false,
  keepOrder: true,
  lastModDate: new Date("2000-01-01T00:00:00.000Z"),
  transferStreams: false,
  useCompressionStream: false,
  useWebWorkers: false,
});

const DEFAULT_METADATA = `
  <dc:identifier id="pub-id">urn:synthetic:book</dc:identifier>
  <dc:title> Synthetic   title </dc:title>
  <dc:language>en</dc:language>
  <dc:creator>First Author</dc:creator>
  <dc:creator>Second Author</dc:creator>
  <meta property="dcterms:modified">2026-07-22T12:34:56Z</meta>`;

const DEFAULT_MANIFEST = `
  <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  <item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>
  <item id="image" href="images/cover.png" media-type="image/png"/>`;

const DEFAULT_SPINE = `<itemref idref="chapter"/>`;

const EPUB2_METADATA = `
  <dc:identifier id="pub-id">urn:synthetic:book-epub2</dc:identifier>
  <dc:title> Synthetic EPUB 2 title </dc:title>
  <dc:language>en</dc:language>
  <dc:creator>Synthetic EPUB 2 Author</dc:creator>
  <dc:date>2026-07-22</dc:date>`;

const EPUB2_MANIFEST = `
  <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  <item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`;

const DEFAULT_RESOURCE_ENTRIES = [
  ["EPUB/nav.xhtml", "navigation"],
  ["EPUB/toc.ncx", "pending-ncx-parser"],
  ["EPUB/text/chapter.xhtml", "chapter"],
  ["EPUB/fallback.xhtml", "fallback"],
  ["EPUB/scripted.xhtml", "scripted"],
  ["EPUB/foreign.bin", "foreign"],
  ["EPUB/images/cover.png", "not-decoded-in-this-task"],
  ["EPUB/overlay.smil", "overlay"],
] as const;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EPUB package document parsing", () => {
  it("builds an immutable deterministic package model without network or workers", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);
    const opf = createPackageDocument({
      spine: `<itemref idref="chapter"/><itemref idref="nav" linear="no"/>`,
      spineAttributes: `page-progression-direction="rtl"`,
    });

    await withArchive(opf, {}, async (archive) => {
      const parsed = await resolveAndParse(archive);

      expect(parsed).toMatchObject({
        path: "EPUB/package.opf",
        version: "3.0",
        renditionLayout: "reflowable",
        pageProgressionDirection: "rtl",
        metadata: {
          uniqueIdentifier: "urn:synthetic:book",
          identifiers: ["urn:synthetic:book"],
          titles: ["Synthetic title"],
          languages: ["en"],
          creators: ["First Author", "Second Author"],
          modified: "2026-07-22T12:34:56Z",
        },
        navigation: {
          kind: "xhtml",
          resourceId: "nav",
          path: "EPUB/nav.xhtml",
        },
        spine: [
          {
            index: 0,
            idref: "chapter",
            contentResourceId: "chapter",
            path: "EPUB/text/chapter.xhtml",
            linear: true,
          },
          {
            index: 1,
            idref: "nav",
            contentResourceId: "nav",
            path: "EPUB/nav.xhtml",
            linear: false,
          },
        ],
      });
      expect(parsed.manifest.map((item) => item.kind)).toEqual([
        "content-document",
        "content-document",
        "raster-image",
      ]);
      expect(Object.isFrozen(parsed)).toBe(true);
      expect(Object.isFrozen(parsed.metadata)).toBe(true);
      expect(Object.isFrozen(parsed.metadata.creators)).toBe(true);
      expect(Object.isFrozen(parsed.manifest)).toBe(true);
      expect(Object.isFrozen(parsed.manifest[0])).toBe(true);
      expect(Object.isFrozen(parsed.spine)).toBe(true);
      expect(Object.isFrozen(parsed.navigation)).toBe(true);
      expect(worker).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it("ignores valid legacy metadata without changing EPUB 3 metadata", async () => {
    const opf = createPackageDocument({
      metadata: `${DEFAULT_METADATA}
        <meta name="generator" content="synthetic-tool"/>
        <meta content="synthetic-cover" name="cover"/>`,
    });

    await withArchive(opf, {}, async (archive) => {
      const parsed = await resolveAndParse(archive);

      expect(parsed.metadata).toEqual({
        uniqueIdentifier: "urn:synthetic:book",
        identifiers: ["urn:synthetic:book"],
        titles: ["Synthetic title"],
        languages: ["en"],
        creators: ["First Author", "Second Author"],
        modified: "2026-07-22T12:34:56Z",
      });
      expect(JSON.stringify(parsed)).not.toContain("synthetic-tool");
      expect(JSON.stringify(parsed)).not.toContain("synthetic-cover");
    });
  });

  it.each([
    ["direct", EPUB2_METADATA],
    [
      "deprecated wrappers",
      `<dc-metadata>${EPUB2_METADATA}</dc-metadata><x-metadata><meta name="generator" content="synthetic-tool"/><ext:private xmlns:ext="urn:synthetic:metadata" id="private-id"><ext:nested id="nested-id">ignored</ext:nested></ext:private></x-metadata>`,
    ],
  ])(
    "admits immutable EPUB 2 metadata in the %s form",
    async (_name, metadata) => {
      const opf = createEpub2PackageDocument({ metadata });

      await withArchive(opf, {}, async (archive) => {
        const parsed = await resolveAndParse(archive);

        expect(parsed).toMatchObject({
          version: "2.0",
          renditionLayout: "reflowable",
          metadata: {
            uniqueIdentifier: "urn:synthetic:book-epub2",
            identifiers: ["urn:synthetic:book-epub2"],
            titles: ["Synthetic EPUB 2 title"],
            languages: ["en"],
            creators: ["Synthetic EPUB 2 Author"],
          },
          navigation: {
            kind: "ncx",
            resourceId: "ncx",
            path: "EPUB/toc.ncx",
          },
          spine: [
            {
              index: 0,
              idref: "chapter",
              contentResourceId: "chapter",
              path: "EPUB/text/chapter.xhtml",
              linear: true,
            },
          ],
        });
        expect(parsed.metadata).not.toHaveProperty("modified");
        expect(JSON.stringify(parsed)).not.toContain("2026-07-22");
        expect(JSON.stringify(parsed)).not.toContain("synthetic-tool");
        expect(Object.isFrozen(parsed)).toBe(true);
        expect(Object.isFrozen(parsed.metadata)).toBe(true);
        expect(Object.isFrozen(parsed.navigation)).toBe(true);
      });
    },
  );

  it("validates and ignores direct EPUB 2 supplemental metadata", async () => {
    const metadata = `${EPUB2_METADATA}
      <meta name="cover" content="synthetic-cover"/>
      <ext:private xmlns:ext="urn:synthetic:metadata" id="private-id"><ext:nested id="nested-id">ignored</ext:nested></ext:private>`;

    await withArchive(
      createEpub2PackageDocument({ metadata }),
      {},
      async (archive) => {
        const parsed = await resolveAndParse(archive);
        expect(parsed.metadata.creators).toEqual(["Synthetic EPUB 2 Author"]);
        expect(JSON.stringify(parsed)).not.toContain("synthetic-cover");
        expect(JSON.stringify(parsed)).not.toContain("nested-id");
      },
    );
  });

  it.each([
    [
      "direct Dublin Core mixed with a wrapper",
      `${EPUB2_METADATA}<dc-metadata><dc:title>Other</dc:title></dc-metadata>`,
    ],
    [
      "Dublin Core outside dc-metadata",
      `<dc-metadata>${EPUB2_METADATA}</dc-metadata><dc:title>Other</dc:title>`,
    ],
    [
      "supplemental metadata outside x-metadata",
      `<dc-metadata>${EPUB2_METADATA}</dc-metadata><meta name="cover" content="synthetic-cover"/>`,
    ],
    [
      "x-metadata without dc-metadata",
      `<x-metadata><meta name="cover" content="synthetic-cover"/></x-metadata>`,
    ],
    [
      "duplicate dc-metadata",
      `<dc-metadata>${EPUB2_METADATA}</dc-metadata><dc-metadata><dc:title>Other</dc:title></dc-metadata>`,
    ],
    [
      "duplicate x-metadata",
      `<dc-metadata>${EPUB2_METADATA}</dc-metadata><x-metadata/><x-metadata/>`,
    ],
    [
      "Dublin Core inside x-metadata",
      `<dc-metadata>${EPUB2_METADATA}</dc-metadata><x-metadata><dc:title>Other</dc:title></x-metadata>`,
    ],
    [
      "nested metadata wrapper",
      `<dc-metadata><dc-metadata>${EPUB2_METADATA}</dc-metadata></dc-metadata>`,
    ],
    [
      "duplicate ID in ignored supplemental metadata",
      `${EPUB2_METADATA}<ext:private xmlns:ext="urn:synthetic:metadata" id="private-id"><ext:nested id="private-id">ignored</ext:nested></ext:private>`,
    ],
  ])("rejects malformed EPUB 2 metadata: %s", async (_name, metadata) => {
    await expectFixtureError(
      createEpub2PackageDocument({ metadata }),
      {},
      "malformed-package",
    );
  });

  it.each([
    [
      "identifier",
      `<dc:title>Title</dc:title><dc:language>en</dc:language>`,
      "malformed-package",
    ],
    [
      "title",
      `<dc:identifier id="pub-id">id</dc:identifier><dc:language>en</dc:language>`,
      "malformed-package",
    ],
    [
      "language",
      `<dc:identifier id="pub-id">id</dc:identifier><dc:title>Title</dc:title>`,
      "malformed-package",
    ],
    [
      "unique-identifier relationship",
      `<dc:identifier id="other-id">id</dc:identifier><dc:title>Title</dc:title><dc:language>en</dc:language>`,
      "broken-reference",
    ],
  ] as const)(
    "requires EPUB 2 %s without requiring modified metadata",
    async (_name, metadata, code) => {
      await expectFixtureError(
        createEpub2PackageDocument({ metadata }),
        {},
        code,
      );
    },
  );

  it("rejects an EPUB 2 guide before the required spine", async () => {
    const opf = `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0" unique-identifier="pub-id"><metadata>${EPUB2_METADATA}</metadata><manifest>${EPUB2_MANIFEST}</manifest><guide/><spine toc="ncx">${DEFAULT_SPINE}</spine></package>`;
    await expectFixtureError(opf, {}, "malformed-package");
  });

  it.each([
    '<meta name="generator"/>',
    '<meta content="synthetic-tool"/>',
    '<meta name="generator" content="synthetic-tool">text</meta>',
    '<meta name="generator" content="synthetic-tool"><private/></meta>',
    '<meta property="custom" name="generator" content="synthetic-tool">value</meta>',
  ])("rejects malformed or mixed legacy metadata: %s", async (metadata) => {
    await expectFixtureError(
      createPackageDocument({ metadata: `${DEFAULT_METADATA}${metadata}` }),
      {},
      "malformed-package",
    );
  });

  it("resolves scripted, foreign, and remote spine resources through finite local XHTML fallbacks", async () => {
    const manifest = `
      <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
      <item id="scripted" href="scripted.xhtml" media-type="application/xhtml+xml" properties="scripted" fallback="safe"/>
      <item id="foreign" href="foreign.bin" media-type="application/x-private" fallback="safe"/>
      <item id="remote" href="https://example.invalid/private-canary" media-type="application/xhtml+xml" fallback="safe"/>
      <item id="safe" href="fallback.xhtml" media-type="application/xhtml+xml"/>`;
    const spine = `
      <itemref idref="scripted"/>
      <itemref idref="foreign"/>
      <itemref idref="remote"/>`;

    await withArchive(
      createPackageDocument({ manifest, spine }),
      {},
      async (archive) => {
        const parsed = await resolveAndParse(archive);

        expect(parsed.spine.map((item) => item.contentResourceId)).toEqual([
          "safe",
          "safe",
          "safe",
        ]);
        expect(parsed.spine.map((item) => item.path)).toEqual([
          "EPUB/fallback.xhtml",
          "EPUB/fallback.xhtml",
          "EPUB/fallback.xhtml",
        ]);
        const remote = parsed.manifest.find((item) => item.id === "remote");
        expect(remote?.location).toEqual({ kind: "external" });
        expect(JSON.stringify(remote)).not.toContain("private-canary");
      },
    );
  });

  it.each([
    [
      "missing unique identifier attribute",
      createPackageDocument({ packageAttributes: "" }),
      "malformed-package",
    ],
    [
      "missing identifier",
      createPackageDocument({
        metadata: `<dc:title>Title</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>`,
      }),
      "malformed-package",
    ],
    [
      "missing title",
      createPackageDocument({
        metadata: `<dc:identifier id="pub-id">id</dc:identifier><dc:language>en</dc:language><meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>`,
      }),
      "malformed-package",
    ],
    [
      "missing language",
      createPackageDocument({
        metadata: `<dc:identifier id="pub-id">id</dc:identifier><dc:title>Title</dc:title><meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>`,
      }),
      "malformed-package",
    ],
    [
      "missing modified timestamp",
      createPackageDocument({
        metadata: `<dc:identifier id="pub-id">id</dc:identifier><dc:title>Title</dc:title><dc:language>en</dc:language>`,
      }),
      "malformed-package",
    ],
    [
      "invalid modified timestamp",
      createPackageDocument({
        metadata: `<dc:identifier id="pub-id">id</dc:identifier><dc:title>Title</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-02-30T00:00:00Z</meta>`,
      }),
      "malformed-package",
    ],
    [
      "broken unique identifier",
      createPackageDocument({
        packageAttributes: `unique-identifier="missing"`,
      }),
      "broken-reference",
    ],
  ] as const)(
    "rejects required metadata failure: %s",
    async (_name, opf, code) => {
      await expectFixtureError(opf, {}, code);
    },
  );

  it.each([
    [
      "required sections out of order",
      `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><manifest>${DEFAULT_MANIFEST}</manifest><metadata>${DEFAULT_METADATA}</metadata><spine>${DEFAULT_SPINE}</spine></package>`,
    ],
    [
      "duplicate required section",
      `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata>${DEFAULT_METADATA}</metadata><manifest>${DEFAULT_MANIFEST}</manifest><spine>${DEFAULT_SPINE}</spine><manifest><item id="later" href="fallback.xhtml" media-type="application/xhtml+xml"/></manifest></package>`,
    ],
    [
      "nested manifest item content",
      createPackageDocument({
        manifest: `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"><private/></item><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      }),
    ],
    [
      "duplicate document ID",
      createPackageDocument({
        metadata: `${DEFAULT_METADATA}<dc:title id="pub-id">Other title</dc:title>`,
      }),
    ],
    [
      "invalid page progression direction",
      createPackageDocument({
        spineAttributes: `page-progression-direction="up"`,
      }),
    ],
  ])("rejects malformed package structure: %s", async (_name, opf) => {
    await expectFixtureError(opf, {}, "malformed-package");
  });

  it.each([
    [
      "duplicate manifest ID",
      `${DEFAULT_MANIFEST}<item id="chapter" href="other.xhtml" media-type="application/xhtml+xml"/>`,
      DEFAULT_SPINE,
    ],
    [
      "duplicate resolved manifest path",
      `${DEFAULT_MANIFEST}<item id="other" href="./text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      DEFAULT_SPINE,
    ],
    [
      "duplicate navigation property",
      `${DEFAULT_MANIFEST}<item id="other-nav" href="fallback.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
      DEFAULT_SPINE,
    ],
    [
      "duplicate spine reference",
      DEFAULT_MANIFEST,
      `<itemref idref="chapter"/><itemref idref="chapter"/>`,
    ],
    [
      "duplicate property token",
      DEFAULT_MANIFEST,
      `<itemref idref="chapter" properties="page-spread-left page-spread-left"/>`,
    ],
  ])("rejects package duplicate: %s", async (_name, manifest, spine) => {
    await expectFixtureError(
      createPackageDocument({ manifest, spine }),
      {},
      "malformed-package",
    );
  });

  it.each([
    [
      "missing manifest file",
      `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="missing.xhtml" media-type="application/xhtml+xml"/>`,
      DEFAULT_SPINE,
      "broken-reference",
    ],
    [
      "missing fallback ID",
      `${DEFAULT_MANIFEST}<item id="foreign" href="foreign.bin" media-type="application/x-private" fallback="missing"/>`,
      DEFAULT_SPINE,
      "broken-reference",
    ],
    [
      "missing spine IDREF",
      DEFAULT_MANIFEST,
      `<itemref idref="missing"/>`,
      "broken-reference",
    ],
    [
      "missing media overlay IDREF",
      `${DEFAULT_MANIFEST}<item id="extra" href="fallback.xhtml" media-type="application/xhtml+xml" media-overlay="missing"/>`,
      DEFAULT_SPINE,
      "broken-reference",
    ],
    [
      "wrong media overlay type",
      `${DEFAULT_MANIFEST}<item id="extra" href="fallback.xhtml" media-type="application/xhtml+xml" media-overlay="image"/>`,
      DEFAULT_SPINE,
      "malformed-package",
    ],
    [
      "archive traversal",
      `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="../../outside.xhtml" media-type="application/xhtml+xml"/>`,
      DEFAULT_SPINE,
      "broken-reference",
    ],
    [
      "fragment-bearing manifest resource",
      `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml#private" media-type="application/xhtml+xml"/>`,
      DEFAULT_SPINE,
      "broken-reference",
    ],
    [
      "package self reference",
      `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="package.opf" media-type="application/xhtml+xml"/>`,
      DEFAULT_SPINE,
      "malformed-package",
    ],
    [
      "forbidden scheme",
      `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="file:///private/book.xhtml" media-type="application/xhtml+xml"/>`,
      DEFAULT_SPINE,
      "broken-reference",
    ],
  ] as const)(
    "rejects broken package relationship: %s",
    async (_name, manifest, spine, code) => {
      await expectFixtureError(
        createPackageDocument({ manifest, spine }),
        {},
        code,
      );
    },
  );

  it.each([
    [
      "self fallback",
      `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="foreign" href="foreign.bin" media-type="application/x-private" fallback="foreign"/>`,
      "malformed-package",
    ],
    [
      "fallback cycle",
      `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="one" href="foreign.bin" media-type="application/x-one" fallback="two"/><item id="two" href="scripted.xhtml" media-type="application/x-two" fallback="one"/>`,
      "malformed-package",
    ],
  ] as const)(
    "rejects a non-finite graph: %s",
    async (_name, manifest, code) => {
      const firstId = manifest.includes(`id="foreign"`) ? "foreign" : "one";
      await expectFixtureError(
        createPackageDocument({
          manifest,
          spine: `<itemref idref="${firstId}"/>`,
        }),
        {},
        code,
      );
    },
  );

  it("allows the exact fallback depth and rejects the next stricter limit", async () => {
    const manifest = `
      <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
      <item id="one" href="foreign.bin" media-type="application/x-one" fallback="two"/>
      <item id="two" href="scripted.xhtml" media-type="application/x-two" fallback="safe"/>
      <item id="safe" href="fallback.xhtml" media-type="application/xhtml+xml"/>`;
    const opf = createPackageDocument({
      manifest,
      spine: `<itemref idref="one"/>`,
    });

    await withArchive(
      opf,
      { policy: { maxManifestFallbackChainItems: 2 } },
      async (archive) => {
        await expect(resolveAndParse(archive)).resolves.toMatchObject({
          spine: [{ contentResourceId: "safe" }],
        });
      },
    );
    await expectFixtureError(
      opf,
      { policy: { maxManifestFallbackChainItems: 1 } },
      "resource-limit-exceeded",
    );
  });

  it("enforces exact manifest and spine item limits", async () => {
    const twoItemManifest = `
      <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
      <item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`;
    const opf = createPackageDocument({ manifest: twoItemManifest });

    await withArchive(
      opf,
      { policy: { maxManifestItems: 2, maxSpineItems: 1 } },
      async (archive) => {
        await expect(resolveAndParse(archive)).resolves.toMatchObject({
          manifest: [{ id: "nav" }, { id: "chapter" }],
          spine: [{ index: 0 }],
        });
      },
    );
    await expectFixtureError(
      opf,
      { policy: { maxManifestItems: 1 } },
      "resource-limit-exceeded",
    );
    await expectFixtureError(
      opf,
      { policy: { maxSpineItems: 0 } },
      "resource-limit-exceeded",
    );
  });

  it.each([
    [
      "unsupported spine media",
      `${DEFAULT_MANIFEST}<item id="foreign" href="foreign.bin" media-type="application/x-private"/>`,
      `<itemref idref="foreign"/>`,
      "unsupported-resource",
    ],
    [
      "remote spine resource",
      `${DEFAULT_MANIFEST}<item id="remote" href="https://example.invalid/chapter" media-type="application/xhtml+xml"/>`,
      `<itemref idref="remote"/>`,
      "unsupported-resource",
    ],
    [
      "scripted spine resource",
      `${DEFAULT_MANIFEST}<item id="active" href="scripted.xhtml" media-type="application/xhtml+xml" properties="scripted"/>`,
      `<itemref idref="active"/>`,
      "unsupported-resource",
    ],
    [
      "fixed-layout spine override",
      DEFAULT_MANIFEST,
      `<itemref idref="chapter" properties="rendition:layout-pre-paginated"/>`,
      "unsupported-layout",
    ],
    [
      "no linear spine item",
      DEFAULT_MANIFEST,
      `<itemref idref="chapter" linear="no"/>`,
      "malformed-package",
    ],
    [
      "invalid linear value",
      DEFAULT_MANIFEST,
      `<itemref idref="chapter" linear="maybe"/>`,
      "malformed-package",
    ],
  ] as const)(
    "enforces the supported spine profile: %s",
    async (_name, manifest, spine, code) => {
      await expectFixtureError(
        createPackageDocument({ manifest, spine }),
        {},
        code,
      );
    },
  );

  it.each([
    [
      "missing navigation item",
      `<item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      "malformed-package",
    ],
    [
      "navigation item with wrong media type",
      `<item id="nav" href="foreign.bin" media-type="application/x-private" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      "unsupported-resource",
    ],
    [
      "remote navigation item",
      `<item id="nav" href="https://example.invalid/nav" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      "unsupported-resource",
    ],
    [
      "scripted navigation item",
      `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav scripted"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      "unsupported-resource",
    ],
  ] as const)(
    "enforces the navigation relationship: %s",
    async (_name, manifest, code) => {
      await expectFixtureError(createPackageDocument({ manifest }), {}, code);
    },
  );

  it.each([
    ["missing spine toc", EPUB2_MANIFEST, "", "malformed-package"],
    [
      "missing toc manifest ID",
      EPUB2_MANIFEST,
      `toc="missing"`,
      "broken-reference",
    ],
    [
      "wrong NCX media type",
      `<item id="ncx" href="toc.ncx" media-type="application/xml"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      `toc="ncx"`,
      "unsupported-resource",
    ],
    [
      "parameterized NCX media type",
      `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml; charset=utf-8"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      `toc="ncx"`,
      "unsupported-resource",
    ],
    [
      "remote NCX",
      `<item id="ncx" href="https://example.invalid/private-ncx" media-type="application/x-dtbncx+xml"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      `toc="ncx"`,
      "unsupported-resource",
    ],
    [
      "NCX fallback chain",
      `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" fallback="chapter"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
      `toc="ncx"`,
      "unsupported-resource",
    ],
  ] as const)(
    "enforces the EPUB 2 spine-to-NCX relationship: %s",
    async (_name, manifest, spineAttributes, code) => {
      await expectFixtureError(
        createEpub2PackageDocument({ manifest, spineAttributes }),
        {},
        code,
      );
    },
  );

  it("validates and ignores an optional local EPUB 2 guide", async () => {
    const guide = `<guide><reference id="opening" type="text" title=" Synthetic opening " href="text/chapter.xhtml#chapter-one"/></guide>`;
    await withArchive(
      createEpub2PackageDocument({ trailingSections: guide }),
      {},
      async (archive) => {
        const parsed = await resolveAndParse(archive);
        expect(parsed.version).toBe("2.0");
        expect(JSON.stringify(parsed)).not.toContain("Synthetic opening");
        expect(JSON.stringify(parsed)).not.toContain("chapter-one");
      },
    );
  });

  it.each([
    [
      "empty guide type",
      `<guide><reference type=" " href="text/chapter.xhtml"/></guide>`,
      "malformed-package",
    ],
    [
      "empty guide title",
      `<guide><reference type="text" title=" " href="text/chapter.xhtml"/></guide>`,
      "malformed-package",
    ],
    [
      "remote guide target",
      `<guide><reference type="text" href="https://example.invalid/private-guide"/></guide>`,
      "broken-reference",
    ],
    [
      "undeclared guide target",
      `<guide><reference type="text" href="fallback.xhtml"/></guide>`,
      "broken-reference",
    ],
    [
      "non-content guide target",
      `<guide><reference type="toc" href="toc.ncx"/></guide>`,
      "unsupported-resource",
    ],
    ["duplicate guide", `<guide/><guide/>`, "malformed-package"],
    ["deprecated tours", `<tours/>`, "unsupported-resource"],
  ] as const)(
    "rejects an unsupported EPUB 2 guide structure: %s",
    async (_name, trailingSections, code) => {
      await expectFixtureError(
        createEpub2PackageDocument({ trailingSections }),
        {},
        code,
      );
    },
  );

  it("does not use the EPUB 2 guide as fallback for a missing NCX relation", async () => {
    await expectFixtureError(
      createEpub2PackageDocument({
        manifest: `<item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
        spineAttributes: "",
        trailingSections: `<guide><reference type="text" href="text/chapter.xhtml"/></guide>`,
      }),
      {},
      "malformed-package",
    );
  });

  it("enforces exact EPUB 2 manifest and spine limits", async () => {
    const opf = createEpub2PackageDocument();
    await withArchive(
      opf,
      { policy: { maxManifestItems: 2, maxSpineItems: 1 } },
      async (archive) => {
        await expect(resolveAndParse(archive)).resolves.toMatchObject({
          version: "2.0",
          manifest: [{ id: "ncx" }, { id: "chapter" }],
          spine: [{ idref: "chapter" }],
        });
      },
    );
    await expectFixtureError(
      opf,
      { policy: { maxManifestItems: 1 } },
      "resource-limit-exceeded",
    );
    await expectFixtureError(
      opf,
      { policy: { maxSpineItems: 0 } },
      "resource-limit-exceeded",
    );
  });

  it("honors cancellation after resolving an EPUB 2 package", async () => {
    const controller = new AbortController();
    await withArchive(
      createEpub2PackageDocument(),
      { signal: controller.signal },
      async (archive) => {
        const resolved = await resolveContainerPackage(archive);
        controller.abort("private-epub2-cancellation");
        await expectPackageError(
          () => parsePackageDocument(archive, resolved),
          "cancelled",
        );
      },
    );
  });

  it("rejects malformed package bytes transactionally after resolution", async () => {
    await withArchive(createPackageDocument(), {}, async (archive) => {
      const resolved = await resolveContainerPackage(archive);
      const malformed = Object.freeze({
        ...resolved,
        bytes: new TextEncoder().encode(
          `<!DOCTYPE package><package xmlns="http://www.idpf.org/2007/opf" version="3.0"/>`,
        ),
      }) satisfies ResolvedPackageDocument;

      await expectPackageError(
        () => parsePackageDocument(archive, malformed),
        "malformed-xml",
      );
    });
  });

  it("honors cancellation and the exact shared deadline", async () => {
    const opf = createPackageDocument();
    const controller = new AbortController();
    await withArchive(opf, { signal: controller.signal }, async (archive) => {
      const resolved = await resolveContainerPackage(archive);
      controller.abort("private-canary");
      await expectPackageError(
        () => parsePackageDocument(archive, resolved),
        "cancelled",
      );
    });

    let nowMs = 0;
    await withArchive(
      opf,
      {
        clock: { now: () => nowMs },
        policy: { maxProcessingTimeMs: 10 },
      },
      async (archive) => {
        const resolved = await resolveContainerPackage(archive);
        nowMs = 10;
        expect(parsePackageDocument(archive, resolved)).toMatchObject({
          spine: [{ idref: "chapter" }],
        });
      },
    );

    nowMs = 0;
    await withArchive(
      opf,
      {
        clock: { now: () => nowMs },
        policy: { maxProcessingTimeMs: 10 },
      },
      async (archive) => {
        const resolved = await resolveContainerPackage(archive);
        nowMs = 11;
        await expectPackageError(
          () => parsePackageDocument(archive, resolved),
          "cancelled",
        );
      },
    );
  });

  it("preserves the archive protection gate before package parsing", async () => {
    const bytes = await createArchive(createPackageDocument(), {
      encryptPackage: true,
    });
    await expectPackageError(
      () => openEpubArchive(bytes),
      "unsupported-protection",
    );
  });

  it("rejects EPUB resource protection without reading the encryption document", async () => {
    const bytes = await createArchive(createPackageDocument(), {
      extraEntries: [
        [
          "META-INF/encryption.xml",
          "<private-canary>This must not be parsed</private-canary>",
        ],
      ],
    });
    const archive = await openEpubArchive(bytes);
    try {
      const resolved = await resolveContainerPackage(archive);
      await expectPackageError(
        () => parsePackageDocument(archive, resolved),
        "unsupported-protection",
      );
    } finally {
      await archive.close();
    }
  });
});

interface PackageDocumentOptions {
  readonly version?: "2.0" | "3.0";
  readonly packageAttributes?: string;
  readonly metadata?: string;
  readonly manifest?: string;
  readonly spine?: string;
  readonly spineAttributes?: string;
  readonly trailingSections?: string;
}

function createPackageDocument(options: PackageDocumentOptions = {}): string {
  const version = options.version ?? "3.0";
  const packageAttributes =
    options.packageAttributes ?? `unique-identifier="pub-id"`;
  const metadata =
    options.metadata ?? (version === "2.0" ? EPUB2_METADATA : DEFAULT_METADATA);
  const manifest =
    options.manifest ?? (version === "2.0" ? EPUB2_MANIFEST : DEFAULT_MANIFEST);
  const spine = options.spine ?? DEFAULT_SPINE;
  const spineAttributes =
    options.spineAttributes ?? (version === "2.0" ? `toc="ncx"` : "");
  const trailingSections = options.trailingSections ?? "";
  return `<package xmlns="http://www.idpf.org/2007/opf"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      version="${version}" ${packageAttributes}>
    <metadata>${metadata}</metadata>
    <manifest>${manifest}</manifest>
    <spine ${spineAttributes}>${spine}</spine>
    ${trailingSections}
  </package>`;
}

function createEpub2PackageDocument(
  options: Omit<PackageDocumentOptions, "version"> = {},
): string {
  return createPackageDocument({ ...options, version: "2.0" });
}

interface ArchiveFixtureOptions {
  readonly encryptPackage?: boolean;
  readonly extraEntries?: readonly (readonly [string, string])[];
}

async function createArchive(
  packageDocument: string,
  options: ArchiveFixtureOptions = {},
): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const encoder = new TextEncoder();
  await writer.add(
    "mimetype",
    new Uint8ArrayReader(encoder.encode("application/epub+zip")),
    { ...ZIP_WRITER_OPTIONS, level: 0 },
  );
  await writer.add(
    "META-INF/container.xml",
    new Uint8ArrayReader(
      encoder.encode(
        `<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
      ),
    ),
    { ...ZIP_WRITER_OPTIONS, level: 0 },
  );
  await writer.add(
    "EPUB/package.opf",
    new Uint8ArrayReader(encoder.encode(packageDocument)),
    {
      ...ZIP_WRITER_OPTIONS,
      level: 0,
      ...(options.encryptPackage === true
        ? { password: "synthetic-test-password" }
        : {}),
    },
  );

  for (const [path, content] of DEFAULT_RESOURCE_ENTRIES) {
    await writer.add(path, new Uint8ArrayReader(encoder.encode(content)), {
      ...ZIP_WRITER_OPTIONS,
      level: 0,
    });
  }
  for (const [path, content] of options.extraEntries ?? []) {
    await writer.add(path, new Uint8ArrayReader(encoder.encode(content)), {
      ...ZIP_WRITER_OPTIONS,
      level: 0,
    });
  }
  return writer.close();
}

async function withArchive(
  packageDocument: string,
  options: EpubProcessingBudgetOptions,
  action: (archive: OpenedEpubArchive) => Promise<void>,
): Promise<void> {
  const archive = await openEpubArchive(
    await createArchive(packageDocument),
    options,
  );
  try {
    await action(archive);
  } finally {
    await archive.close();
  }
}

async function resolveAndParse(archive: OpenedEpubArchive) {
  const resolved = await resolveContainerPackage(archive);
  return parsePackageDocument(archive, resolved);
}

async function expectFixtureError(
  packageDocument: string,
  options: EpubProcessingBudgetOptions,
  code: EpubArchiveError["code"],
): Promise<void> {
  await withArchive(packageDocument, options, async (archive) => {
    await expectPackageError(() => resolveAndParse(archive), code);
  });
}

async function expectPackageError(
  action: () => unknown | Promise<unknown>,
  code: EpubArchiveError["code"],
): Promise<void> {
  const error = await capturePackageError(action);
  expect(error).toMatchObject({ code, message: code });
  expect(error.message).not.toContain("private-canary");
  expect(error.cause).toBeUndefined();
}

async function capturePackageError(
  action: () => unknown | Promise<unknown>,
): Promise<EpubArchiveError> {
  try {
    await action();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    return error as EpubArchiveError;
  }

  throw new Error("expected package parsing to fail");
}
